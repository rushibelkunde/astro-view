# AstroView Todo List

## Phase 1: Foundations (Completed)
- [x] Define Project Scope (Hackathon Winner Edition)
- [x] Create Monorepo Structure (`client` + `server`)
- [x] Define Technical Architecture (Fastify + React + R3F)
- [x] Install Server Dependencies (Fastify, Prisma, uWebSockets.js, Redis)
- [x] Install Client Dependencies (Vite, Tailwind, Shadcn, R3F, Tone.js)
- [x] Configure TypeScript & ESLint

## Phase 2: Core "Wow" Features (Completed)
- [x] **3D Earth Dashboard**
    - [x] Setup React Three Fiber Canvas
    - [x] Render Interactive Earth Model
    - [x] Add Satellite Orbit Lines (Swarm)
- [x] **Space Sonification**
    - [x] Setup Tone.js Synth
    - [x] Map Solar Wind data to Audio Params (Basic Chord Trigger)
- [x] **Real-time Alerts**
    - [x] Setup uWebSockets.js Server
    - [x] Create WebSocket Hook in Client
    - [x] Design Glassmorphic Alert Toasts

## Phase 3: Gamification & Polish (Completed)
- [x] Implement "Space Stamps" (Passport System)
- [x] Add "Explain Like I'm 5" AI Toggles
- [x] Verify 60FPS Performance
- [x] Final UI Polish (Framer Motion Animations)

## Phase 4: Real Data & Interaction (Completed)
- [x] **Real-Time Data Engine**: TLE Propagation via CelesTrak + Satellite.js
- [x] **Interactive Swarm**: Hover/Click selection with Geodetic coordinate stream
- [x] **Satellite HUD**: Live telemetry (Speed, Altitude, Lat/Lon)
- [x] **Global Stats**: Live satellite counter
- [x] **2D Map View**: Removed per user request.

## Phase 5: Onboarding & Mission Control (Completed)
- [x] **Interactive Tutorial**: Onboarding tour for new users.
- [x] **Mission Control**: Dashboard with Space Weather & Overhead Satellites.
- [x] **Geolocation**: Localized satellite tracking.

## Phase 6: Impact & Real-World Applications (Completed)
- [x] **Data Layers System**:
    - [x] **Debris Mode**: Visualization of space junk density.
    - [x] **Climate Mode**: Heatmap overlay for global temperature anomalies.
    - [x] **Satellite Mode**: Standard tracking.
- [x] **Analytics Panel**: Context-aware stats for each layer (Collision Risk, Temp Anomaly).

## Missing Requirements / Next Steps
- [ ] **Event Notifications**: Expand WebSocket triggers for specific celestial events (e.g. Solar Flares).
- [ ] **Mobile Optimization**: improved touch controls for the 3D view.
