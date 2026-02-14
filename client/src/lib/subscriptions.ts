import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Topic = 'weather' | 'debris' | 'launches' | 'general'

interface SubscriptionState {
    topics: Topic[]
    toggleTopic: (topic: Topic) => void
    isSubscribed: (topic: Topic) => boolean
}

export const useSubscriptions = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            topics: ['weather', 'debris', 'launches', 'general'], // Default all on
            toggleTopic: (topic) => set((state) => {
                const exists = state.topics.includes(topic)
                return {
                    topics: exists
                        ? state.topics.filter(t => t !== topic)
                        : [...state.topics, topic]
                }
            }),
            isSubscribed: (topic) => get().topics.includes(topic)
        }),
        {
            name: 'astroview-subscriptions',
        }
    )
)
