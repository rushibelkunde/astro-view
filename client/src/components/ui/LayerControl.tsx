import { Layers, ThermometerSun, Trash2, Satellite } from 'lucide-react'

export type LayerMode = 'satellites' | 'debris' | 'climate'

interface LayerControlProps {
    currentMode: LayerMode
    onChange: (mode: LayerMode) => void
}

export function LayerControl({ currentMode, onChange }: LayerControlProps) {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-xl p-1.5 rounded-full border border-white/20 z-40 pointer-events-auto">
            <button
                onClick={() => onChange('satellites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentMode === 'satellites' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
            >
                <Satellite size={16} />
                <span className="text-xs font-bold">SATELLITES</span>
            </button>

            <button
                onClick={() => onChange('debris')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentMode === 'debris' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
            >
                <Trash2 size={16} />
                <span className="text-xs font-bold">DEBRIS</span>
            </button>

            <button
                onClick={() => onChange('climate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentMode === 'climate' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
            >
                <ThermometerSun size={16} />
                <span className="text-xs font-bold">CLIMATE</span>
            </button>
        </div>
    )
}
