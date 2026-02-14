import { ImmersiveLayout } from './components/layout/ImmersiveLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import { AlertToast } from './components/ui/AlertToast'
import { SpaceAudio } from './components/audio/SpaceAudio'
import { ELIToggle } from './components/ui/ELIToggle'
import { Passport } from './components/gamification/Passport'
import { TimeTravel } from './components/ui/TimeTravel'
import { unlockBadge } from './lib/gamification'
import { useState, useEffect } from 'react'

import { SatelliteHUD } from './components/ui/SatelliteHUD'
import { SatelliteStats } from './components/ui/SatelliteStats'
import { SatelliteMap } from './components/ui/SatelliteMap'

import { MissionControl } from './components/ui/MissionControl'
import { TutorialOverlay } from './components/ui/TutorialOverlay'

import { LayerControl, type LayerMode } from './components/ui/LayerControl'
import { AnalyticsPanel } from './components/ui/AnalyticsPanel'

function App() {
  const { lastMessage, status, latestBinaryData } = useWebSocket('ws://localhost:3002')
  const [eli5, setEli5] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedSatId, setSelectedSatId] = useState<number | null>(null)
  const [layerMode, setLayerMode] = useState<LayerMode>('satellites')
  // const [mapVisible, setMapVisible] = useState(false)

  const [newBadge, setNewBadge] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  // Auto-start tutorial on first launch
  useEffect(() => {
    if (hasStarted) {
      // Simple check if user has seen it (can use localStorage later)
      if (!localStorage.getItem('hasSeenTour')) {
        setShowTutorial(true)
      }
    }
  }, [hasStarted])

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTour', 'true')
  }

  const handleEli5Toggle = () => {
    setEli5(!eli5)
  }

  // ... (existing state)

  // ... (existing effects)

  return (
    <ImmersiveLayout
      satelliteData={latestBinaryData}
      onSatelliteSelect={setSelectedSatId}
      layerMode={layerMode}
    >
      <AlertToast message={lastMessage || (newBadge ? { type: 'BADGE UNLOCKED', message: newBadge } : null)} />

      <TutorialOverlay isActive={showTutorial} onComplete={handleTutorialComplete} />

      {/* Layer Controls & Analytics */}
      <LayerControl currentMode={layerMode} onChange={setLayerMode} />
      <AnalyticsPanel mode={layerMode} />

      {/* Persistent UI Elements */}
      <MissionControl
        dataRef={latestBinaryData}
        onSelect={setSelectedSatId}
        onStartTour={() => setShowTutorial(true)}
      />

      <SatelliteHUD
        satelliteId={selectedSatId}
        dataRef={latestBinaryData}
        onClose={() => setSelectedSatId(null)}
      />

      <SatelliteStats dataRef={latestBinaryData} />



      {/* 2D Map Removed per user request */}
      {/* <SatelliteMap
        dataRef={latestBinaryData}
        visible={mapVisible}
        onToggle={() => setMapVisible(!mapVisible)}
      /> */}

      {/* Dashboard UI - Only visible after starting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: hasStarted ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="pointer-events-none"
      >
        <div className="pointer-events-auto">
          <SpaceAudio />
          <ELIToggle enabled={eli5} onToggle={handleEli5Toggle} />
          <Passport />
          <TimeTravel />
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/20 font-mono">
          SYSTEM_STATUS: {status.toUpperCase()}
        </div>
      </motion.div>

      {/* Landing Page UI */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center h-full text-center text-white pointer-events-none absolute inset-0 z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-400 drop-shadow-lg"
            >
              {eli5 ? "Space is Awesome!" : "ASTROVIEW"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-4 text-xl text-blue-200/80 max-w-md"
            >
              {eli5
                ? "Look at all the spinning things! We turn big space numbers into fun pictures."
                : "Understanding Space Through Actionable Data"
              }
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
              className="mt-8 pointer-events-auto"
            >
              <button
                onClick={() => setHasStarted(true)}
                className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all font-medium glow-effect"
              >
                {eli5 ? "Let's Go!" : "Explore the Cosmos"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ImmersiveLayout>
  )
}

export default App
