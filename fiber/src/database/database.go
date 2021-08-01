package database

type Request struct {
	Method string      `json:"method"`
	Data   interface{} `json:"data"`
}

type CreateRequest struct {
	Title  *string `json:"title,omitempty"`
	Detail *string `json:"detail,omitempty"`
}

type ReadRequest struct {
	Id int `json:"id"`
}

type UpdateRequest struct {
	Id     int     `json:"id"`
	Title  *string `json:"title,omitempty"`
	Detail *string `json:"detail,omitempty"`
}

type DeleteRequest struct {
	Id int `json:"id"`
}

type ListRequest struct {
	Batch int `json:"batch"`
}

type Post struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Detail    string `json:"detail,omitempty"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type Response struct {
	Success bool        `json:"success"`
	Info    string      `json:"info"`
	Data    interface{} `json:"data"`
}

type CreateResponse = Post
type ReadResponse = *Post
type UpdateResponse = Post
type DeleteResponse = Post
type ListResponse = []Post

type UpdateBodyHandler struct {
	Title  *string `json:"title,omitempty"`
	Detail *string `json:"detail,omitempty"`
}
