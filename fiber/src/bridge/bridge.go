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

func init() {
	rand.Seed(time.Now().UnixNano())
}

var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_=+-")

type ArcMap struct {
	mutex *sync.RWMutex
	value map[string]chan string
}

func uid(n int) string {
	b := make([]rune, n)

	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}

	return string(b)
}

func send(socket *zmq.Socket, message Message, arcMap ArcMap) {
	content, _ := json.Marshal(message.Request)
	id := uid(16)

	arcMap.mutex.Lock()
	arcMap.value[id] = message.Response
	arcMap.mutex.Unlock()

	socket.SendMessage([][]byte{[]byte(id), content})
}

func receiver(arcMap ArcMap) {
	socket, err := zmq.NewSocket(zmq.PULL)

	if err != nil {
		log.Fatal(err)
		return
	}

	socket.Bind("tcp://0.0.0.0:5557")

	for {
		receive, _ := socket.RecvMessage(0)

		// Ignore empty frame
		if len(receive) < 2 {
			return
		}

		id := string(receive[0])
		message := string(receive[1])

		go func() {
			arcMap.mutex.Lock()

			response, ok := arcMap.value[id]
			delete(arcMap.value, id)

			arcMap.mutex.Unlock()

			if ok {
				response <- message
			}
		}()
	}
}

func bridge(messages chan Message) {
	socket, err := zmq.NewSocket(zmq.PUSH)

	if err != nil {
		log.Fatal(err)
		return
	}

	socket.Connect("tcp://0.0.0.0:5556")

	arcMap := ArcMap{
		mutex: &sync.RWMutex{},
		value: make(map[string]chan string),
	}

	go receiver(arcMap)

	for message := range messages {
		send(socket, message, arcMap)
	}
}

func CreateBridge() chan Message {
	bridgeQueue := make(chan Message)

	go bridge(bridgeQueue)

	return bridgeQueue
}
