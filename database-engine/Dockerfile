FROM node:14-alpine as builder

WORKDIR /usr/app

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfile

COPY prisma prisma
COPY .env .env
RUN npx prisma generate
RUN npx prisma migrate dev

COPY . .

RUN yarn build

# * ====================
FROM node:16-alpine as modules

WORKDIR /usr/app

RUN apk update
RUN apk --no-cache add curl bash
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfile --production
RUN npm prune --production
RUN /usr/local/bin/node-prune

# * ====================
FROM alpine:latest as main

RUN apk --no-cache add nodejs

WORKDIR /usr/app/

COPY --from=modules /usr/app/node_modules node_modules
COPY --from=builder /usr/app/node_modules/.prisma node_modules/.prisma
COPY --from=builder /usr/app/build build
COPY package.json .

ENV NODE_ENV production

CMD ["node", "./build/index.js"]