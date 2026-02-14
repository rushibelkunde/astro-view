import { Canvas } from '@react-three/fiber'
import { Earth } from '../3d/Earth'
import type { ReactNode } from 'react'
import type { LayerMode } from '../ui/LayerControl'

interface ImmersiveLayoutProps {
    children?: ReactNode
    satelliteData?: React.MutableRefObject<Float32Array | null>
    onSatelliteSelect?: (id: number | null) => void
    layerMode: LayerMode
}

export function ImmersiveLayout({ children, satelliteData, onSatelliteSelect, layerMode }: ImmersiveLayoutProps) {
    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                    <Earth layerMode={layerMode} satelliteData={satelliteData} onSelect={onSatelliteSelect} />
                </Canvas>
            </div>

            {/* Glassmorphic Overlay / HUD */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                <div className="w-full h-full p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
