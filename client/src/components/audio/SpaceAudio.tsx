import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { Volume2, VolumeX } from 'lucide-react'

export function SpaceAudio() {
    const [isPlaying, setIsPlaying] = useState(false)
    const synthRef = useRef<Tone.PolySynth | null>(null)

    useEffect(() => {
        // Setup Synth
        const reverb = new Tone.Reverb({ decay: 10, wet: 0.5 }).toDestination()
        const delay = new Tone.FeedbackDelay("8n", 0.5).connect(reverb)
        const filter = new Tone.Filter(200, "lowpass").connect(delay)

        synthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 2, decay: 1, sustain: 0.5, release: 2 }
        }).connect(filter)

        return () => {
            synthRef.current?.dispose()
            reverb.dispose()
            delay.dispose()
            filter.dispose()
        }
    }, [])

    const toggleAudio = async () => {
        await Tone.start()

        if (isPlaying) {
            synthRef.current?.releaseAll()
            setIsPlaying(false)
        } else {
            setIsPlaying(true)
            // Play an ambient chord
            synthRef.current?.triggerAttack(["C2", "G2", "E3", "B3"])
        }
    }

    return (
        <button
            onClick={toggleAudio}
            className="absolute bottom-24 right-8 z-50 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-white"
        >
            {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
    )
}
