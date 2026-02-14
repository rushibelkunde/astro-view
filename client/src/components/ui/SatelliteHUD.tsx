import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Gauge, Activity } from 'lucide-react'

interface SatelliteHUDProps {
    satelliteId: number | null
    dataRef: React.MutableRefObject<Float32Array | null> | undefined
    onClose: () => void
}

export function SatelliteHUD({ satelliteId, dataRef, onClose }: SatelliteHUDProps) {
    const [stats, setStats] = useState({ x: 0, y: 0, z: 0, alt: 0, speed: 0 })
    const requestRef = useRef<number>()

    useEffect(() => {
        if (satelliteId === null || !dataRef) return

        const update = () => {
            if (dataRef.current) {
                const data = dataRef.current
                const idx = satelliteId * 4

                if (idx + 3 < data.length) {
                    const lat = data[idx + 1]
                    const lon = data[idx + 2]
                    const alt = data[idx + 3]

                    // Convert Radians to Degrees for display
                    const latDeg = (lat * 180 / Math.PI).toFixed(2)
                    const lonDeg = (lon * 180 / Math.PI).toFixed(2)

                    // Speed computation is tricky without velocity vector in data. 
                    // We can estimate based on altitude (circular orbit approximation)
                    // v = sqrt(GM / r)
                    // GM Earth = 398600 km^3/s^2
                    // r = 6371 + alt
                    const r = 6371 + alt
                    const v = Math.sqrt(398600 / r)

                    setStats({
                        x: latDeg + '°' as any,
                        y: lonDeg + '°' as any,
                        z: '---',
                        alt: alt.toFixed(1) as any,
                        speed: v.toFixed(2) as any
                    })
                }
            }
            requestRef.current = requestAnimationFrame(update)
        }

        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current!)
    }, [satelliteId, dataRef])

    if (satelliteId === null) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed top-20 right-4 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-white shadow-2xl z-40 pointer-events-auto"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold font-mono text-blue-400">SAT-{satelliteId}</h3>
                        <p className="text-xs text-white/50 uppercase tracking-widest">Low Earth Orbit</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                            <Gauge size={14} />
                            <span className="text-xs font-mono">SPEED</span>
                        </div>
                        <div className="text-xl font-bold font-mono">{stats.speed} <span className="text-xs text-white/40">km/s</span></div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                            <Activity size={14} />
                            <span className="text-xs font-mono">ALTITUDE</span>
                        </div>
                        <div className="text-xl font-bold font-mono">{stats.alt} <span className="text-xs text-white/40">km</span></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono border-b border-white/10 pb-1">
                        <span className="text-white/40">LATITUDE</span>
                        <span className="text-blue-200">{stats.x}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono border-b border-white/10 pb-1">
                        <span className="text-white/40">LONGITUDE</span>
                        <span className="text-blue-200">{stats.y}</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
