package bridge

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
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

func send(socket *zmq.Socket, message Message) {
	content, _ := json.Marshal(message.Request)
	socket.SendMessage(content)
	receive, _ := socket.Recv(0)

	message.Response <- receive
}

func bridge(messages chan Message) {
	socket, err := zmq.NewSocket(zmq.DEALER)

	if err != nil {
		log.Fatal(err)
		return
	}

	identity := fmt.Sprintf("%08X", rand.Intn(0x10000))
	socket.SetIdentity(identity)

	socket.Connect("tcp://0.0.0.0:5556")
	defer socket.Close()

	for message := range messages {
		go send(socket, message)
	}
}

func CreateBridge() chan Message {
	concurrent := int(math.Pow(2, 16))
	bridgeQueue := make(chan Message, concurrent)

	go bridge(bridgeQueue)

	return bridgeQueue
}
