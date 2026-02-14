import { useEffect, useRef, useState } from 'react'

export function useWebSocket(url: string) {
    const [lastMessage, setLastMessage] = useState<any>(null)
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
    const ws = useRef<WebSocket | null>(null)
    const latestBinaryData = useRef<Float32Array | null>(null)

    useEffect(() => {
        setStatus('connecting')
        ws.current = new WebSocket(url)
        ws.current.binaryType = 'arraybuffer' // Important for receiving binary

        ws.current.onopen = () => {
            console.log('Connected to uWS')
            setStatus('connected')
        }

        ws.current.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                // High-frequency binary data (Satellites)
                latestBinaryData.current = new Float32Array(event.data)
            } else {
                // Low-frequency text messages (Alerts)
                try {
                    const data = JSON.parse(event.data)
                    setLastMessage(data)
                } catch (e) {
                    console.warn('Received non-JSON message:', event.data)
                    setLastMessage({ raw: event.data })
                }
            }
        }

        ws.current.onclose = () => {
            console.log('Disconnected from uWS')
            setStatus('disconnected')
            // Simple reconnect logic could go here
        }

        return () => {
            ws.current?.close()
        }
    }, [url])

    const sendMessage = (msg: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(msg))
        }
    }

    return { status, lastMessage, sendMessage, latestBinaryData }
}
