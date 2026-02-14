import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D, Color } from 'three'

interface SatelliteSwarmProps {
    count?: number
    dataRef?: React.MutableRefObject<Float32Array | null>
    onSelect?: (id: number | null) => void
}

export function SatelliteSwarm({ count = 2000, dataRef, onSelect }: SatelliteSwarmProps) {
    const meshRef = useRef<InstancedMesh>(null)
    const dummy = useMemo(() => new Object3D(), [])
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    // Generate random initial positions and orbits (Fallback)
    const particles = useMemo(() => {
        const data = []
        for (let i = 0; i < count; i++) {
            const radius = 1.2 + Math.random() * 0.5
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)
            const speed = 0.05 + Math.random() * 0.1
            data.push({ radius, theta, phi, speed, axis: Math.random() > 0.5 ? 1 : -1 })
        }
        return data
    }, [count])

    useEffect(() => {
        if (meshRef.current) {
            // Reset all colors
            const color = new Color()
            for (let i = 0; i < count; i++) {
                // Default: Blue-ish white
                color.setHSL(0.6, 0.5, 0.9)
                meshRef.current.setColorAt(i, color)
            }
            meshRef.current.instanceColor!.needsUpdate = true
        }
    }, [count])

    // Update colors when hover/select changes
    useEffect(() => {
        if (!meshRef.current) return

        const color = new Color()
        // Reset specific instances if needed, or just re-paint all if fast enough?
        // For 5000, repainting all might be okay but wasteful.
        // Let's rely on the loop below to "clean up" if we track state, but simple re-init is safer for now.

        // Actually, let's just color the special ones on top of base.
        // We need to know previous hover to clear it. 
        // For simplicity: Reset all, then color active.

        // Optimization: user 'instanceColor' attribute directly?
        // Let's do a full reset for correctness for now.
        for (let i = 0; i < count; i++) {
            let h = 0.6, s = 0.5, l = 0.9

            if (i === selectedId) {
                h = 0.1; s = 1.0; l = 0.6; // Gold
            } else if (i === hoveredId) {
                h = 0.5; s = 0.8; l = 0.8; // Cyan highlight
            }

            color.setHSL(h, s, l)
            meshRef.current.setColorAt(i, color)
        }
        meshRef.current.instanceColor!.needsUpdate = true

    }, [hoveredId, selectedId, count])

    const handleClick = (e: any) => {
        e.stopPropagation()
        const id = e.instanceId
        setSelectedId(id)
        if (onSelect) onSelect(id)
    }

    useFrame((_, delta) => {
        if (!meshRef.current) return

        // 1. Check for Real Binary Data
        if (dataRef && dataRef.current) {
            const data = dataRef.current
            for (let i = 0; i < count; i++) {
                const idx = i * 4
                if (idx + 3 >= data.length) break

                // Data format: [id, lat, lon, alt]
                // Lat/Lon are in Radians
                const lat = data[idx + 1]
                const lon = data[idx + 2]
                const alt = data[idx + 3]

                // Convert to Cartesian (Earth Radius = 1)
                // We normalize altitude: 1.0 = 6371km
                const r = 1 + (alt / 6371)

                // Three.js Coordinate System (Y is Up)
                // Texture alignment: usually -Z is Prime Meridian or similar. 
                // Let's assume standard mapping:
                // x = r * cos(lat) * sin(lon)
                // z = r * cos(lat) * cos(lon)
                // y = r * sin(lat)

                // Adjusting for Three.js Sphere UV mapping where Z is forward
                // We might need to tweak longitude offset by PI or PI/2

                const phi = lat
                const theta = lon - Math.PI / 2 // Offset to align with texture

                const x = r * Math.cos(phi) * Math.sin(theta)
                const y = r * Math.sin(phi)
                const z = r * Math.cos(phi) * Math.cos(theta)

                dummy.position.set(x, y, z)
                dummy.lookAt(0, 0, 0)
                dummy.scale.setScalar(0.005)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            }
        }
        // 2. Fallback to Local Simulation
        else {
            particles.forEach((particle, i) => {
                particle.theta += particle.speed * delta * 0.5 * particle.axis
                const x = particle.radius * Math.sin(particle.phi) * Math.cos(particle.theta)
                const y = particle.radius * Math.sin(particle.phi) * Math.sin(particle.theta)
                const z = particle.radius * Math.cos(particle.phi)

                dummy.position.set(x, y, z)
                dummy.lookAt(0, 0, 0)
                dummy.scale.setScalar(0.005)
                dummy.updateMatrix()
                meshRef.current!.setMatrixAt(i, dummy.matrix)
            })
        }

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, count]}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredId(e.instanceId!) }}
            onPointerOut={(e) => setHoveredId(null)}
            onClick={handleClick}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="white" toneMapped={false} />
        </instancedMesh>
    )
}
