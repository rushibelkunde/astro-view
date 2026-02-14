export function unlockBadge(id: string) {
    const stored = localStorage.getItem('astroview_badges')
    const badges = stored ? JSON.parse(stored) : {}

    if (!badges[id]) {
        badges[id] = new Date().toISOString()
        localStorage.setItem('astroview_badges', JSON.stringify(badges))

        // Dispatch event for UI updates if needed, or rely on polling/state
        // Simple alert for hackathon
        // console.log('Badge Unlocked:', id)
        return true // indicates new unlock
    }
    return false
}
