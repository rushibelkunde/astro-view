import { motion, AnimatePresence } from 'framer-motion'
import { Info, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSubscriptions, type Topic } from '../../lib/subscriptions'

interface AlertToastProps {
    message?: { type?: string, message?: string, severity?: 'info' | 'warning' | 'critical' } | null
}

export function AlertToast({ message }: AlertToastProps) {
    const [visible, setVisible] = useState(false)
    const [currentMsg, setCurrentMsg] = useState<any>(null)

    const isSubscribed = useSubscriptions((state) => state.isSubscribed)

    // Determine topic based on message content (heuristic)
    let topic: Topic = 'general'

    // Safety check: message might be null or string or object
    const text = message && typeof message === 'object' && 'message' in message
        ? (message.message as string)
        : (typeof message === 'string' ? message : '')

    if (text) {
        if (text.toLowerCase().includes('solar') || text.toLowerCase().includes('geomagnetic')) topic = 'weather'
        if (text.toLowerCase().includes('debris') || text.toLowerCase().includes('collision')) topic = 'debris'
        if (text.toLowerCase().includes('launch')) topic = 'launches'
    }

    // Badge unlocks always show
    if (message && typeof message === 'object' && 'type' in message && message.type === 'BADGE UNLOCKED') topic = 'general'

    // Check subscription
    const shouldShow = topic === 'general' || isSubscribed(topic)

    useEffect(() => {
        if (message && shouldShow) {
            setCurrentMsg(message)
            setVisible(true)
            const timer = setTimeout(() => setVisible(false), 5000) // Auto hide
            return () => clearTimeout(timer)
        }
    }, [message, shouldShow])

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {visible && currentMsg && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-lg bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl text-white min-w-[300px]"
                    >
                        <div className={`p-2 rounded-full ${currentMsg.type === 'WELCOME' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {currentMsg.type === 'WELCOME' ? <Info size={20} /> : <Bell size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm tracking-wide uppercase opacity-70">
                                {currentMsg.type || 'System Alert'}
                            </h4>
                            <p className="text-sm font-medium">{currentMsg.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
