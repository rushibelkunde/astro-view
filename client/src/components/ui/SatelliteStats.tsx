import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'

interface SatelliteStatsProps {
    dataRef: React.MutableRefObject<Float32Array | null> | undefined
}

export function SatelliteStats({ dataRef }: SatelliteStatsProps) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            if (dataRef && dataRef.current) {
                // Each sat has 4 floats: [id, x, y, z]
                const satCount = Math.floor(dataRef.current.length / 4)
                if (satCount !== count) {
                    setCount(satCount)
                }
            }
        }, 500) // Update every 500ms is enough for a counter

        return () => clearInterval(interval)
    }, [dataRef, count])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-4 left-4 z-40 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 text-white shadow-xl pointer-events-auto"
        >
            <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400 animate-pulse">
                <Globe size={16} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider">Active Satellites</span>
                <span className="text-lg font-bold font-mono tracking-tight">{count.toLocaleString()}</span>
            </div>
        </motion.div>
    )
}
