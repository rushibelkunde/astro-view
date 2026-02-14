import { motion } from 'framer-motion'
import { Rocket, Star, Moon, Sun, Telescope } from 'lucide-react'

export interface BadgeData {
    id: string
    name: string
    icon: 'rocket' | 'star' | 'moon' | 'sun' | 'telescope'
    description: string
    unlockedAt?: string
}

const icons = {
    rocket: Rocket,
    star: Star,
    moon: Moon,
    sun: Sun,
    telescope: Telescope
}

interface BadgeProps {
    badge: BadgeData
    locked?: boolean
}

export function Badge({ badge, locked = false }: BadgeProps) {
    const Icon = icons[badge.icon]

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative flex flex-col items-center p-4 rounded-xl border ${locked
                    ? 'bg-white/5 border-white/10 opacity-50 grayscale'
                    : 'bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                }`}
        >
            <div className={`p-3 rounded-full mb-2 ${locked ? 'bg-white/10' : 'bg-blue-400 text-black'}`}>
                <Icon size={24} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-center">{badge.name}</h3>
            {!locked && <span className="text-[10px] text-white/50 mt-1">{new Date(badge.unlockedAt!).toLocaleDateString()}</span>}
        </motion.div>
    )
}
