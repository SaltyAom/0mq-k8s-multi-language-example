import { PrismaClient } from '@prisma/client'

import { Router } from 'zeromq'
import PQueue from 'p-queue'

import type {
    BatchRequest,
    CRUDRequest,
    DatabaseRequest,
    DatabaseResponse
} from './types'

const prisma = new PrismaClient()
const router = new Router()
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
        router.bind('tcp://*:5556'),
        prisma.$connect()
    ])

    console.log('Junbi Ok!')

    while (true) handle(await router.receive())
}

const handle = async (buffer: Buffer[]) => {
    let [id, message] = splitOnce(buffer.toString(), ',')

    try {
        let request: DatabaseRequest = JSON.parse(message)

        let result = await reducers(request)

        responseQueue.add(async () => {
            await router.send([
                id,
                JSON.stringify({
                    success: true,
                    info: '',
                    data: result
                } as DatabaseResponse)
            ])
        })
    } catch (error) {
        router.send([
            id,
            JSON.stringify({
                success: false,
                info: 'Something went wrong',
                data: null
            } as DatabaseResponse)
        ])

        console.log(error)
    }
}

const splitOnce = (message: string, splitter: string) => {
    let index = message.indexOf(splitter)

    return [message.slice(0, index), message.slice(index + 1)]
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
        default:
            return null
    }
}

main()
