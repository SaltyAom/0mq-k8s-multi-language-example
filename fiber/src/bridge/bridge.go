package bridge

import (
	"encoding/json"
	"log"
	"math/rand"
	"sync"
	"time"

	zmq "github.com/pebbe/zmq4"
)

type Message struct {
	Request  interface{}
	Response chan string
}

type ArcDealer struct {
	mutex sync.RWMutex
	value *zmq.Socket
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")

func uid(n int) string {
	b := make([]rune, n)

	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}

	return string(b)
}

func send(arcSocket *ArcDealer, message Message, socketMap map[string]chan string) {
	content, _ := json.Marshal(message.Request)
	id := uid(16)

	arcSocket.mutex.Lock()

	socketMap[id] = message.Response
	arcSocket.value.SendMessage([][]byte{[]byte(id), content})

	arcSocket.mutex.Unlock()
}

func receiver(arcSocket *ArcDealer, socketMap map[string]chan string) {
	arcSocket.mutex.Lock()

	receive, _ := arcSocket.value.RecvMessage(0)

	if len(receive) < 2 {
		println("R")
		arcSocket.mutex.RUnlock()
		return
	}

	id := string(receive[0])
	message := string(receive[1])

	println(id, message)

	if channel, ok := socketMap[id]; ok {
		select {
		case channel <- message:
			println("Friend", id, message, socketMap[id])
		default:
			println("Abort")
		}
	}

	delete(socketMap, id)
	arcSocket.mutex.Unlock()
}

func bridge(messages chan Message) {
	socket, err := zmq.NewSocket(zmq.DEALER)

	if err != nil {
		log.Fatal(err)
		return
	}

	socket.Connect("tcp://0.0.0.0:5556")

	socketMap := make(map[string]chan string)

	arcSocket := ArcDealer{
		mutex: sync.RWMutex{},
		value: socket,
	}

	for message := range messages {
		send(&arcSocket, message, socketMap)
		go receiver(&arcSocket, socketMap)
	}
}

func CreateBridge() chan Message {
	concurrent := int(1)
	bridgeQueue := make(chan Message, concurrent)

	go bridge(bridgeQueue)

	return bridgeQueue
}
