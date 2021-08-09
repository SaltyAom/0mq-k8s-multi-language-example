import { PrismaClient } from '@prisma/client'

import { Context, Pull, Push, Router } from 'zeromq'
import PQueue from 'p-queue'

import type {
    BatchRequest,
    CRUDRequest,
    DatabaseRequest,
    DatabaseResponse
} from './types'

const prisma = new PrismaClient()
const pull = new Pull({
    linger: 0,
    backlog: 0,
    tcpKeepalive: 0,
    context: new Context({
        blocky: false
    })
})
const push = new Push({
    linger: 0,
    backlog: 0
})
const responseQueue = new PQueue({
    concurrency: 1
})

const batchSize = 25

const batch = (index: number) => [
    batchSize * index,
    batchSize * (index + 1) - 1
]

const main = async () => {
    await Promise.all([
        pull.bind('tcp://0.0.0.0:5556'),
        push.connect('tcp://0.0.0.0:5557'),
        prisma.$connect()
    ])

    // "Ping" the database to remove cloud start on GKE Autopilot + Testing the connection
    await Promise.all([prisma.$queryRaw`SELECT 1 AS is_alive`])

    console.log('Junbi Ok!')

    while (true) handle(await pull.receive())
}

const handle = async ([readableId, buffer]: Buffer[]) => {
    let message = buffer.toString()

    try {
        let request: DatabaseRequest = JSON.parse(message)
        let result = await reducers(request)

        responseQueue.add(async () => {
            await push.send([
                readableId.toString(),
                JSON.stringify({
                    success: true,
                    info: '',
                    data: result
                } as DatabaseResponse)
            ])
        })
    } catch (error) {
        responseQueue.add(async () => {
            await push.send([
                readableId,
                JSON.stringify({
                    success: false,
                    info: 'Something went wrong',
                    data: null
                } as DatabaseResponse)
            ])
        })

        console.log(error)
    }
}

const reducers = async ({ method, data: request }: DatabaseRequest) => {
    switch (method) {
        case 'CREATE':
            var data = request as CRUDRequest
            return await prisma.post.create({
                data
            })

        case 'READ':
            var data = request as CRUDRequest
            return await prisma.post.findUnique({
                where: {
                    id: data.id
                }
            })

        case 'UPDATE':
            let { id, ...rest } = request as CRUDRequest
            return await prisma.post.update({
                where: {
                    id
                },
                data: rest
            })

        case 'DELETE':
            var data = request as CRUDRequest
            return await prisma.post.delete({
                where: {
                    id: data.id
                }
            })

        case 'LIST':
            let { batch: batchIndex } = request as BatchRequest

            const [skip, take] = batch(batchIndex)

            return await prisma.post.findMany({
                skip,
                take
            })

        case 'PING':
            return Date.now()

        default:
            return null
    }
}

main()
