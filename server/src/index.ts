import Fastify from 'fastify'
import { connectDB } from './db'
import { setupuWebSocket } from './ws'

const server = Fastify({
    logger: true
})

server.get('/', async (request, reply) => {
    return { status: 'online', message: 'AstroView API Ready' }
})


const start = async () => {
    try {
        await connectDB()
        await server.listen({ port: 3001 })

        // Start uWebSockets.js on a separate port for max performance
        setupuWebSocket(3002)

        console.log('Fastify (REST) running on http://localhost:3001')
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start()
