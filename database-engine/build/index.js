"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const zeromq_1 = require("zeromq");
const p_queue_1 = __importDefault(require("p-queue"));
const prisma = new client_1.PrismaClient();
const router = new zeromq_1.Router({
    linger: 0,
    receiveTimeout: 0,
    backlog: 0,
    context: new zeromq_1.Context({
        blocky: false
    })
});
const responseQueue = new p_queue_1.default({
    concurrency: 1
});
const batchSize = 25;
const batch = (index) => [
    batchSize * index,
    batchSize * (index + 1) - 1
];
const main = async () => {
    await Promise.all([router.bind('tcp://0.0.0.0:5556'), prisma.$connect()]);
    console.log('Junbi Ok!');
    while (true)
        handle(await router.receive());
};
const handle = async (buffer) => {
    let [id, message] = splitOnce(buffer.toString(), ',');
    try {
        let request = JSON.parse(message);
        let result = await reducers(request);
        responseQueue.add(async () => {
            await router.send([
                id,
                JSON.stringify({
                    success: true,
                    info: '',
                    data: result
                })
            ]);
        });
    }
    catch (error) {
        router.send([
            id,
            JSON.stringify({
                success: false,
                info: 'Something went wrong',
                data: null
            })
        ]);
        console.log(error);
    }
};
const splitOnce = (message, splitter) => {
    let index = message.indexOf(splitter);
    return [message.slice(0, index), message.slice(index + 1)];
};
const reducers = async ({ method, data: request }) => {
    switch (method) {
        case 'CREATE':
            var data = request;
            return await prisma.post.create({
                data
            });
        case 'READ':
            var data = request;
            return await prisma.post.findUnique({
                where: {
                    id: data.id
                }
            });
        case 'UPDATE':
            let { id, ...rest } = request;
            return await prisma.post.update({
                where: {
                    id
                },
                data: rest
            });
        case 'DELETE':
            var data = request;
            return await prisma.post.delete({
                where: {
                    id: data.id
                }
            });
        case 'LIST':
            let { batch: batchIndex } = request;
            const [skip, take] = batch(batchIndex);
            return await prisma.post.findMany({
                skip,
                take
            });
        case 'PING':
            return Date.now();
        default:
            return null;
    }
};
main();
//# sourceMappingURL=index.js.map