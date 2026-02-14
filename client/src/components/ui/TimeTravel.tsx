import { Clock } from 'lucide-react'

export function TimeTravel() {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-30 pointer-events-auto">
            <Clock size={16} className="text-blue-400" />
            <span className="text-xs font-mono text-white/50">1980</span>
            <input
                type="range"
                min="1980"
                max="2050"
                defaultValue="2024"
                className="w-48 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-thumb"
                onChange={() => {
                    // Placeholder for future implementation
                    // For now, we are locked to Real-Time
                }}
                title="Time Travel disabled in Live Mode"
            />
            <span className="text-xs font-mono text-white/50">2050</span>
        </div>
    )
}
