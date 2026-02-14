import { useState, useEffect } from 'react'

interface GeolocationState {
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, loading: false, error: "Geolocation not supported" }))
            return
        }

        const success = (position: GeolocationPosition) => {
            setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                error: null,
                loading: false
            })
        }

        const error = (err: GeolocationPositionError) => {
            setState(s => ({ ...s, loading: false, error: err.message }))
        }

        navigator.geolocation.getCurrentPosition(success, error)

        // Optional: Watch position if moving?
        // const id = navigator.geolocation.watchPosition(success, error)
        // return () => navigator.geolocation.clearWatch(id)
    }, [])

    return state
}
