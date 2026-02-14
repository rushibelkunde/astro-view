import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, InstancedMesh, Object3D, Color, AdditiveBlending } from 'three'
import { Stars, Cloud, useTexture, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'


import type { LayerMode } from '../ui/LayerControl'
import { SatelliteSwarm } from './SatelliteSwarm'

interface EarthProps {
    layerMode: LayerMode
    satelliteData?: React.MutableRefObject<Float32Array | null>
    onSelect?: (id: number | null) => void
}

export function Earth({ layerMode, satelliteData, onSelect }: EarthProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const cloudsRef = useRef<THREE.Mesh>(null)
    const debrisRef = useRef<InstancedMesh>(null)

    // Standard Textures
    // Standard Textures
    const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    ])

    // Climate Heatmap Texture (Simulated with a different color map if available, or we use color prop)
    // For this hackathon, we'll use a strong emissive override for climate mode

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime()

        // Rotate Earth
        if (meshRef.current) {
            meshRef.current.rotation.y = elapsedTime / 60
        }

        // Rotate Clouds
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = elapsedTime / 55
        }

        // Animate Debris
        if (debrisRef.current && layerMode === 'debris') {
            debrisRef.current.rotation.y = elapsedTime / 40
        }
    })

    // Generate Debris Particles
    const debrisCount = 3000
    const dummy = useMemo(() => new Object3D(), [])

    useEffect(() => {
        if (!debrisRef.current) return

        for (let i = 0; i < debrisCount; i++) {
            // Random distribution between 1.1 and 1.3 Earth radii (LEO-ish)
            const r = 1.1 + Math.random() * 0.2
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            dummy.position.set(x, y, z)
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
            const scale = 0.01 + Math.random() * 0.015 // Significantly larger for visibility
            dummy.scale.setScalar(scale)
            dummy.updateMatrix()
            debrisRef.current.setMatrixAt(i, dummy.matrix)
        }
        debrisRef.current.instanceMatrix.needsUpdate = true
    }, [dummy])

    return (
        <>
            <ambientLight intensity={layerMode === 'climate' ? 0.2 : 1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />

            {/* Standard Orbit Controls */}
            <OrbitControls
                enableZoom={true}
                minDistance={1.5}
                maxDistance={10}
                autoRotate={false}
                enablePan={false}
            />

            {/* Satellite Swarm - Only show in 'satellites' mode */}
            {layerMode === 'satellites' && (
                <SatelliteSwarm count={5000} dataRef={satelliteData} onSelect={onSelect} />
            )}

            {/* Main Earth Sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    roughnessMap={specularMap}
                    emissiveMap={colorMap}
                    transparent={false}
                    emissive={layerMode === 'climate' ? "#ff4400" : "#ffffff"}
                    emissiveIntensity={layerMode === 'climate' ? 0.8 : 0.1}
                    color={layerMode === 'climate' ? "#ffaa00" : "#ffffff"}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Clouds Layer - Hide in Climate Mode to show heat clearly */}
            {layerMode !== 'climate' && (
                <mesh ref={cloudsRef}>
                    <sphereGeometry args={[1.005, 64, 64]} />
                    <meshPhongMaterial
                        map={cloudsMap}
                        opacity={0.4}
                        depthWrite={true}
                        transparent={true}
                        side={THREE.DoubleSide}
                        blending={AdditiveBlending}
                    />
                </mesh>
            )}

            {/* Atmosphere Glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color={layerMode === 'climate' ? "#ffaa00" : "#4b96ff"}
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                    blending={AdditiveBlending}
                />
            </mesh>

            {/* Space Debris Layer */}
            {layerMode === 'debris' && (
                <instancedMesh ref={debrisRef} args={[undefined, undefined, debrisCount]}>
                    <dodecahedronGeometry args={[0.02, 0]} />
                    <meshBasicMaterial color="#ff0000" toneMapped={false} />
                </instancedMesh>
            )}
        </>
    )
}
