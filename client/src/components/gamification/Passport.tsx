import { motion, AnimatePresence } from 'framer-motion'
import { X, Award } from 'lucide-react'
import { Badge } from './Badge'
import type { BadgeData } from './Badge'
import { useState, useEffect } from 'react'



// Hotfix for missing icon in Badge.tsx map
// simplified for speed: mapping 'brain' to 'star' visually if needed, or updating Badge.tsx
// Let's stick to valid icons for now
const SAFE_BADGES: BadgeData[] = [
    { id: 'first_view', name: 'First Contact', icon: 'telescope', description: 'Visited AstroView for the first time' },
    { id: 'sonifier', name: 'Cosmic DJ', icon: 'moon', description: 'Enabled space sonification' },
    { id: 'eli5_master', name: 'Curious Mind', icon: 'star', description: 'Toggled ELI5 mode' },
    { id: 'explorer', name: 'Deep Diver', icon: 'rocket', description: 'Spent 5 minutes exploring' },
]

export function Passport() {
    const [isOpen, setIsOpen] = useState(false)
    const [unlocked, setUnlocked] = useState<Record<string, string>>({})

    useEffect(() => {
        // Load from local storage
        const stored = localStorage.getItem('astroview_badges')
        if (stored) {
            setUnlocked(JSON.parse(stored))
        }
    }, [isOpen])

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 left-8 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white pointer-events-auto"
            >
                <Award size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-2xl p-6 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Award className="text-yellow-400" /> Space Passport
                            </h2>
                            <p className="text-white/60 mb-6">Collect badges by exploring the universe.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {SAFE_BADGES.map(badge => (
                                    <Badge
                                        key={badge.id}
                                        badge={{ ...badge, unlockedAt: unlocked[badge.id] }}
                                        locked={!unlocked[badge.id]}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
