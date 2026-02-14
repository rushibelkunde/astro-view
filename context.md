# AstroView — Understanding Space Through Actionable Data

## Project Overview
AstroView is an interactive platform designed to centralize space-related information, making it accessible and actionable for students, educators, and the general public. It transforms complex satellite data into visual insights, provides real-time alerts for celestial events, and connects space technology to daily life applications like climate monitoring and agriculture.

## Core Features (Hackathon Winning Scope)
1.  **The "Overview Effect" Dashboard**: A cinematic, interactive 3D Earth (React Three Fiber) showing real-time satellite positions and debris clouds.
2.  **Cosmic Sonification**: "Listen to the Universe" - Converting data streams (solar wind, magnetic fields) into ambient soundscapes for accessibility and immersion.
3.  **"Space Stamps" Gamification**: Users collect digital mission patches for "witnessing" events (e.g., catching an ISS pass or a meteor shower).
4.  **AI Data Translator**: "Explain Like I'm 5" button for every complex metric, stripping away jargon.
5.  **Time-Travel Mode**: Scroll backward/forward in time to see past or future orbital alignments.

## Technology Stack

### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **3D Engine**: **React Three Fiber (R3F)** + **Drei** (Critical for the "Wow" factor)
-   **Styling**: Tailwind CSS + **Framer Motion** (for premium animations)
-   **UI Library**: shadcn/ui (Glassmorphism theme)
-   **State Management**: Zustand (better performance for 3D state than Context)
-   **Audio**: Tone.js (for sonification)

### Backend
-   **Runtime**: Node.js
-   **API Framework**: Fastify
-   **WebSocket Server**: `uWebSockets.js` (High-performance real-time alerts)
-   **Database**: MongoDB (Native Driver)
-   **ORM**: None (Direct MongoDB access for speed)
-   **Caching**: Redis
-   **Validation**: Zod

### Architecture Patterns & Standards
-   **Monorepo Structure**: `client/` and `server/` directories.
-   **Design Patterns**: DRY (Don't Repeat Yourself), Service-Repository pattern for backend logic.
-   **File Naming**: All files must use **lowercase-hyphenated** format (e.g., `user-controller.ts`, `alert-component.tsx`).
-   **Code Quality**: TypeScript for type safety, ESLint + Prettier.

## Data Models (Preliminary)
-   **User**: `id`, `email`, `preferences` (location, notification settings).
-   **Event**: `id`, `type`, `dateTime`, `locationVisibility`, `description`, `severity`.
-   **Mission**: `id`, `name`, `agency`, `launchDate`, `status`, `goals`.

## External Integrations (Simulated or Real)
-   NASA Open APIs (APOD, NEO, EONET)
-   SpaceX API (launches)
-   ESA Data

## Deployment Strategy
-   Docker/Containerization (implied for modern stacks).
-   Environment variables for configuration.
