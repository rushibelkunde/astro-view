import { App, TemplatedApp, WebSocket } from 'uWebSockets.js'
import { SatelliteService } from './services/satelliteService'

// Interface for typed WebSocket data
interface UserData {
    id: string
}

let app: TemplatedApp
const satelliteService = new SatelliteService()

export function setupuWebSocket(port: number) {
    app = App()
        .ws('/*', {
            compression: 0,
            maxPayloadLength: 16 * 1024 * 1024,
            idleTimeout: 60,
            open: (ws) => {
                console.log('A WebSocket connected!')
                ws.subscribe('satellites')
                ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to AstroView uWS Realtime' }))
            },
            message: (ws, message, isBinary) => {
                const msg = Buffer.from(message).toString()
                console.log('Received:', msg)
            },
            drain: (ws) => {
                console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
            },
            close: (ws, code, message) => {
                console.log('WebSocket closed')
            }
        })
        .listen(port, (token) => {
            if (token) {
                console.log('uWebSockets.js listening on port ' + port)
                startBroadcasting()
            } else {
                console.log('Failed to listen to port ' + port)
            }
        })

    return app
}

function startBroadcasting() {
    console.log('Starting Satellite Broadcast Loop (20Hz)')
    setInterval(() => {
        // Update physics (50ms delta)
        const data = satelliteService.update(0.05)

        // Broadcast binary data to 'satellites' topic
        // uWebSockets.js publish expects ArrayBuffer or string
        app.publish('satellites', data.buffer as any, true)
    }, 50)
}

export function broadcast(message: string) {
    if (app) {
        app.publish('alerts', message)
    }
}
