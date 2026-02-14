import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, Map as MapIcon, Globe } from 'lucide-react'

interface SatelliteMapProps {
    dataRef: React.MutableRefObject<Float32Array | null> | undefined
    visible: boolean
    onToggle: () => void
}

export function SatelliteMap({ dataRef, visible, onToggle }: SatelliteMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)


    useEffect(() => {
        if (!visible || !canvasRef.current || !dataRef) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number

        const render = () => {
            // Resize logic
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth
                canvas.height = canvas.clientHeight
            }

            const w = canvas.width
            const h = canvas.height

            // Clear
            ctx.fillStyle = '#051020'
            ctx.fillRect(0, 0, w, h)

            // Draw Grid (Equirectangular)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.lineWidth = 1

            // Longitude lines
            for (let i = 0; i <= 360; i += 30) {
                const x = (i / 360) * w
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
            }
            // Latitude lines
            for (let i = -90; i <= 90; i += 30) {
                const y = ((90 - i) / 180) * h
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
            }

            // Draw Satellites
            if (dataRef.current) {
                const data = dataRef.current

                // [id, lat, lon, alt]
                // Lat: -PI/2..PI/2
                // Lon: -PI..PI

                ctx.fillStyle = '#4cc9f0'

                for (let i = 0; i < data.length; i += 4) {
                    const lat = data[i + 1]
                    const lon = data[i + 2]

                    // Convert to Screen Coords
                    // x = (lon + PI) / (2PI) * w
                    // y = (PI/2 - lat) / PI * h

                    const x = ((lon + Math.PI) / (2 * Math.PI)) * w
                    const y = ((Math.PI / 2 - lat) / Math.PI) * h

                    ctx.fillRect(x, y, 2, 2)
                }
            }

            animationFrameId = requestAnimationFrame(render)
        }

        render()
        return () => cancelAnimationFrame(animationFrameId)
    }, [visible, dataRef])

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all font-medium glow-effect pointer-events-auto"
            >
                {visible ? <Globe size={18} /> : <MapIcon size={18} />}
                <span>{visible ? "Show Globe" : "2D Map View"}</span>
            </button>

            {/* Map Overlay */}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-40 bg-black/90 p-8 pt-20 flex items-center justify-center pointer-events-auto"
                    >
                        <div className="relative w-full max-w-6xl aspect-[2/1] border border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-[#020408]">
                            {/* Placeholder for Earth Map Image/Texture if we had one */}
                            <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg')] bg-cover bg-center mix-blend-screen" />

                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-plus-lighter" />

                            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/40">
                                PROJECTION: EQUIRECTANGULAR
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
