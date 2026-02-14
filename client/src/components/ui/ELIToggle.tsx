import { Brain, Baby } from 'lucide-react'

interface ELI5Props {
    enabled: boolean
    onToggle: () => void
}

export function ELIToggle({ enabled, onToggle }: ELI5Props) {
    return (
        <button
            onClick={onToggle}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full border transition-all pointer-events-auto ${enabled
                ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
        >
            {enabled ? <Baby size={20} /> : <Brain size={20} />}
            <span className="font-bold text-sm">{enabled ? 'ELI5 Mode: ON' : 'Expert Mode'}</span>
        </button>
    )
}
