package main

import (
	"encoding/json"
	bridge "fiber-prisma/src/bridge"
	Database "fiber-prisma/src/database"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func main() {
	bridgeQueue := bridge.CreateBridge()

	app := fiber.New(fiber.Config{
		// Prefork: true,
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Running")
	})

	app.Put("/post", func(c *fiber.Ctx) error {
		var body Database.CreateRequest
		err := json.Unmarshal(c.Body(), &body)

		if err != nil || body.Title == nil || body.Detail == nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    "Invalid body",
				Data:    nil,
			})
		}

		response := make(chan string)

		bridgeQueue <- bridge.Message{
			Request: Database.Request{
				Method: "CREATE",
				Data:   body,
			},
			Response: response,
		}

		message := <-response

		var data Database.Response
		json.Unmarshal([]byte(message), &data)

		return c.JSON(data)
	})

	app.Get("/post/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))

		if err != nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    ":id must be number",
				Data:    nil,
			})
		}

		response := make(chan string)

		bridgeQueue <- bridge.Message{
			Request: Database.Request{
				Method: "READ",
				Data: Database.ReadRequest{
					Id: id,
				},
			},
			Response: response,
		}

		message := <-response

		var data Database.Response
		json.Unmarshal([]byte(message), &data)

		return c.JSON(data)
	})

	app.Patch("/post/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))

		if err != nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    ":id must be number",
				Data:    nil,
			})
		}

		var body Database.UpdateBodyHandler
		err = json.Unmarshal(c.Body(), &body)

		if err != nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    "Invalid body",
				Data:    nil,
			})
		}

		response := make(chan string)

		bridgeQueue <- bridge.Message{
			Request: Database.Request{
				Method: "UPDATE",
				Data: Database.UpdateRequest{
					Id:     id,
					Title:  body.Title,
					Detail: body.Detail,
				},
			},
			Response: response,
		}

		message := <-response

		var data Database.Response
		json.Unmarshal([]byte(message), &data)

		return c.JSON(data)
	})

	app.Delete("/post/:id", func(c *fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))

		if err != nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    ":id must be number",
				Data:    nil,
			})
		}

		response := make(chan string)

		bridgeQueue <- bridge.Message{
			Request: Database.Request{
				Method: "DELETE",
				Data: Database.DeleteRequest{
					Id: id,
				},
			},
			Response: response,
		}

		message := <-response

		var data Database.Response
		json.Unmarshal([]byte(message), &data)

		return c.JSON(data)
	})

	app.Get("/post/list/:batch", func(c *fiber.Ctx) error {
		batch, err := strconv.Atoi(c.Params("batch"))

		if err != nil {
			return c.JSON(Database.Response{
				Success: false,
				Info:    ":batch must be number",
				Data:    nil,
			})
		}

		response := make(chan string)

		bridgeQueue <- bridge.Message{
			Request: Database.Request{
				Method: "LIST",
				Data: Database.ListRequest{
					Batch: batch - 1,
				},
			},
			Response: response,
		}

		message := <-response

		var data Database.Response
		json.Unmarshal([]byte(message), &data)

		return c.JSON(data)
	})

	log.Fatal(app.Listen(":3000"))
}
