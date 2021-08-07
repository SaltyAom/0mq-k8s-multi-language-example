FROM golang:alpine AS builder

# * Setup ZMQ
ARG ZMQ=4.3.4

RUN apk update
RUN apk add --no-cache musl-dev pkgconfig libsodium-dev libzmq autoconf automake g++ make libc6-compat

ENV GOPATH /usr/app

RUN wget https://github.com/zeromq/libzmq/releases/download/v${ZMQ}/zeromq-${ZMQ}.tar.gz \
 && tar -xzf zeromq-${ZMQ}.tar.gz

RUN cd zeromq-${ZMQ} \
 && ./configure \
 && make \
 && make install

# * Setup builder
WORKDIR /usr/app/src/app

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .

RUN go get github.com/pebbe/zmq4

# ? https://github.com/pebbe/zmq4/issues/83
# RUN CGO_LDFLAGS="$CGO_LDFLAGS -lstdc++ -lm -lsodium" \
#   CGO_ENABLED=1 \
#   GOOS=linux \
#   GOARCH=amd64 \
#   go build -ldflags '-extldflags "-static" -v' -o ./main ./src

RUN CGO_ENABLED=1 \
  GOOS=linux \
  GOARCH=amd64 \
  go build -tags netgo -a -v ./src/main.go

# * ---------- * ---------- * ---------- * ---------- * #

FROM alpine

WORKDIR /usr/app
COPY --from=builder /usr/app/src/app/main main

RUN apk add --no-cache libzmq

EXPOSE 3000
CMD ["sh", "-c", "./main"]