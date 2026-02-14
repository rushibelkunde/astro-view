import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, X } from 'lucide-react'

interface TutorialOverlayProps {
    isActive: boolean
    onComplete: () => void
}

const STEPS = [
    {
        title: "Welcome to AstroView",
        content: "This is a real-time digital twin of our orbital environment. Every dot you see is a real satellite tracked by USSTRATCOM.",
        target: "center"
    },
    {
        title: "The Earth",
        content: "You can drag to rotate the globe and scroll to zoom in/out. The day/night cycle matches the real world.",
        target: "center"
    },
    {
        title: "The Swarm",
        content: "Hover over any satellite to see its ID. Click on it to open the Telemetry HUD for live speed and altitude data.",
        target: "center"
    },
    {
        title: "Mission Control",
        content: "Check the top-right panel for 'Space Weather' and look for satellites passing directly overhead.",
        target: "top-right"
    },
    {
        title: "Time Travel",
        content: "Use the slider at the bottom to jump between historical debris data and future predictions. (Currently in Live Mode)",
        target: "bottom"
    }
]

export function TutorialOverlay({ isActive, onComplete }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        if (isActive) setCurrentStep(0)
    }, [isActive])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1)
        } else {
            onComplete()
        }
    }

    if (!isActive) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            >
                {/* Dark Overlay with spot-light effect could be complex, keeping it simple glassmorphism for now */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl pointer-events-auto"
                >
                    <div className="absolute top-4 right-4">
                        <button onClick={onComplete} className="text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full mb-3 border border-blue-500/30">
                            STEP {currentStep + 1} / {STEPS.length}
                        </span>
                        <h2 className="text-3xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
                        <p className="text-blue-100/80 leading-relaxed text-lg">
                            {STEPS[currentStep].content}
                        </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <div className="flex gap-1">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-blue-400" : "w-2 bg-white/20"}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-blue-50 transition-colors"
                        >
                            {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                            {currentStep === STEPS.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
