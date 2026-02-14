import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, Disc, AlertTriangle, ShieldCheck, Crosshair, HelpCircle } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useSubscriptions } from '../../lib/subscriptions'

interface MissionControlProps {
    dataRef: React.MutableRefObject<Float32Array | null> | undefined
    onSelect: (id: number) => void
    onStartTour: () => void
}

export function MissionControl({ dataRef, onSelect, onStartTour }: MissionControlProps) {
    const { latitude: userLat, longitude: userLon, error: geoError } = useGeolocation()
    const [isOpen, setIsOpen] = useState(true)
    const [overheadCount, setOverheadCount] = useState(0)

    const subscribedTopics = useSubscriptions((state) => state.topics)
    const toggleTopic = useSubscriptions((state) => state.toggleTopic)

    // Poll for overhead satellites
    useEffect(() => {
        if (!userLat || !userLon || !dataRef) return

        const interval = setInterval(() => {
            if (!dataRef.current) return
            const data = dataRef.current
            let count = 0

            // Simple distance check (Euclidean on Lat/Lon for speed approx)
            // Real implementation would be Great Circle Distance
            // 1 deg lat approx 111km. 500km radius approx 5 deg.
            const threshold = 5.0 * (Math.PI / 180) // 5 degrees in radians

            const uLatRad = userLat * (Math.PI / 180)
            const uLonRad = userLon * (Math.PI / 180)

            for (let i = 0; i < data.length; i += 4) {
                const sLat = data[i + 1]
                const sLon = data[i + 2]

                // Fast distance approximation
                const dLat = sLat - uLatRad
                const dLon = sLon - uLonRad
                const distSq = dLat * dLat + dLon * dLon

                if (distSq < threshold * threshold) {
                    count++
                }
            }
            setOverheadCount(count)
        }, 1000)

        return () => clearInterval(interval)
    }, [userLat, userLon, dataRef])

    return (
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end pointer-events-auto">
            {/* Toggle Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/10 transition-colors"
            >
                <Radar size={18} className={overheadCount > 0 ? "text-green-400 animate-pulse" : "text-blue-400"} />
                <span className="font-mono text-sm tracking-wider text-blue-100">MISSION CONTROL</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="mt-2 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Status Section */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs uppercase text-white/40 font-bold tracking-widest">Space Weather</span>
                                <span className="flex items-center gap-1.5 text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                    <ShieldCheck size={12} /> NORMAL
                                </span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/3 animate-pulse" />
                            </div>
                        </div>

                        {/* Overhead Section */}
                        <div className="p-4 bg-white/5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">Overhead Now</h3>
                                    {geoError ? (
                                        <p className="text-xs text-red-300">Location Denied</p>
                                    ) : (
                                        <p className="text-xs text-blue-200/70">
                                            {userLat ? `${userLat.toFixed(2)}°, ${userLon?.toFixed(2)}°` : "Locating..."}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-mono text-white font-bold block leading-none">{overheadCount}</span>
                                    <span className="text-[10px] uppercase text-white/30">Satellites</span>
                                </div>
                            </div>
                        </div>

                        {/* Mission of the Day */}
                        <div className="p-4 border-t border-white/10">
                            <h3 className="text-xs uppercase text-white/40 font-bold tracking-widest mb-3">Mission of the Day</h3>

                            <div className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-3 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                                onClick={() => {
                                    // Hardcoded ID for ISS (25544) usually, but we need to find it in our swarm
                                    // For now, let's just trigger a toast or log
                                    alert("Tracking ISS: ZARYA (ID 25544)")
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                                        <Disc size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">ISS (ZARYA)</div>
                                        <div className="text-xs text-white/50">Human Outpost</div>
                                    </div>
                                    <Crosshair size={16} className="ml-auto text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Subscription Manager */}
                        <div className="p-4 border-t border-white/10">
                            <h4 className="text-xs font-bold text-blue-400 mb-2">ALERT SUBSCRIPTIONS</h4>
                            <div className="space-y-2">
                                {(['weather', 'debris', 'launches'] as const).map(topic => (
                                    <label key={topic} className="flex items-center gap-2 text-xs text-white/70 cursor-pointer hover:text-white">
                                        <input
                                            type="checkbox"
                                            checked={subscribedTopics.includes(topic)}
                                            onChange={() => toggleTopic(topic)}
                                            className="rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500/50"
                                        />
                                        <span className="capitalize">{topic} Updates</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tutorial Trigger */}
                        <div className="p-2 bg-white/5 border-t border-white/10">
                            <button
                                onClick={onStartTour}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <HelpCircle size={14} />
                                REPLAY TUTORIAL
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
