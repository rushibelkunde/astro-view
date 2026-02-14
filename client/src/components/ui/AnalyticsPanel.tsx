import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp, Thermometer } from 'lucide-react'
import type { LayerMode } from './LayerControl'

interface AnalyticsPanelProps {
    mode: LayerMode
}

export function AnalyticsPanel({ mode }: AnalyticsPanelProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 left-8 w-64 pointer-events-none"
            >
                {mode === 'satellites' && (
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-blue-400 mb-2">ORBITAL DENSITY</h4>
                        <div className="h-16 flex items-end gap-1">
                            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-500/50 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-white/40 font-mono">
                            <span>LEO</span>
                            <span>MEO</span>
                            <span>HEO</span>
                        </div>
                    </div>
                )}

                {mode === 'debris' && (
                    <div className="bg-red-900/20 backdrop-blur-md border border-red-500/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle size={16} />
                            <h4 className="text-xs font-bold">COLLISION RISK</h4>
                        </div>
                        <div className="text-2xl font-mono font-bold text-white mb-1">CRITICAL</div>
                        <p className="text-xs text-red-200/60 leading-tight">
                            &gt; 34,000 objects &gt;10cm tracked.
                            Kessler Syndrome probability increasing in LEO sectors.
                        </p>
                    </div>
                )}

                {mode === 'climate' && (
                    <div className="bg-orange-900/20 backdrop-blur-md border border-orange-500/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Thermometer size={16} />
                            <h4 className="text-xs font-bold">GLOBAL ANOMALY</h4>
                        </div>
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-3xl font-mono font-bold text-white">+1.45°C</span>
                            <span className="text-xs text-orange-300 mb-1 flex items-center gap-1">
                                <TrendingUp size={10} /> Rising
                            </span>
                        </div>
                        <p className="text-xs text-orange-200/60">
                            Surface temperature deviation from 20th-century average.
                        </p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
