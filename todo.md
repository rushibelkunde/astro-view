# Comprehensive System Implementation Plan (Low Level)

*This document outlines the detailed granular steps required to connect the structural domains into a fully functional product.*

## Stage 1: Core Integration & Server Wiring
- [x] **Database Connection:** Implement `pgxpool` logic to connect Go to PostgreSQL.
- [x] **Redis Connection:** Implement `go-redis` client connection.
- [x] **HTTP Server:** Create `cmd/api/main.go` spinning up `net/http` server with CORS, Logger, and Telemetry middlewares.
- [x] **Frontend Proxy:** Add `/api` proxy map to `vite.config.ts` targeting the Go backend port (8080).
- [x] **API Client (Frontend):** Setup TanStack Query `QueryClient` and an Axios/Fetch wrapper pointing to `/api`.
- [x] **Health Check Checkpoint:** Verify complete End-to-End communication from SolidJS -> Go -> Postgres.

## Stage 2: Authentication & Multi-Tenancy Implementation
- [x] **Repository (Go):** Create `UserRepository` and `TenantRepository` interfaces and Postgres implementations.
- [x] **Usecase (Go):** Build `RegisterTenant`, `LoginUser` workflows with bcrypt password hashing.
- [x] **Delivery (Go):** Implement `/api/auth/register` and `/api/auth/login` HTTP Handlers.
- [x] **Frontend Pages:** Create `Login.tsx` and `Register.tsx` pages using Shadcn components.
- [x] **Frontend State:** Set up SolidJS Context or Store for `Session` and `TenantID` JWT storage.

## Stage 3: RBAC & Dynamic Forms Implementation
### RBAC
- [x] **Global Schema Refactor:** Migrated to global `features` and `permissions` tables (no `tenant_id`).
- [x] **Join Table:** Implemented `role_permissions` join table to link tenant roles to global permissions.
- [x] **Repository & Usecase:** Refactored Postgres implementation and RBAC service for many-to-many logic.
- [x] **Frontend:** Updated `rbac-service.ts` and `RolesPage.tsx` to handle new `feature_code` structure.
- [ ] **Middleware (Go):** Extend `AuthMiddleware` to accept a required `Permission` and reject 403.
- [x] **Frontend Views:** `Settings -> Roles` pane to assign Features visually.

### Dynamic Forms
- [ ] **Repository:** Generic `FormRepository` taking EntityType and saving JSONB schemas.
- [ ] **API Route:** `GET /api/forms/:entity` & `POST /api/forms`
- [ ] **Frontend Builder:** Create a Form Builder UI (drag-and-drop or select) building JSONSchema under the hood.
- [ ] **Dynamic Renderer:** Create a `<DynamicForm schema={...} />` component that recursively renders Shadcn Inputs based on JSON structure.

## Stage 4: HRMS End-to-End
- [ ] **Employee API:** Endpoints to add employees, mapping dynamic data against the Employee forms.
- [ ] **Attendance Logic:** Implement `POST /api/attendance/punch`. Store coords, calc distance from HQ.
- [ ] **Leave Policies:** API to define rules, link to Rule Evaluator string mappings.
- [ ] **UI:** HR Dashboard. Tanstack Table for Employee list. Punch In widget.

## Stage 5: Project Management & real-time Sync
- [ ] **Kanban API:** `GET /api/projects/:id/tasks` using Adjacency list recursive queries or simple arrays.
- [ ] **Kanban WebSocket Bridge:** Tie POST route for `MoveTask()` to trigger `tasks_sync.go` Hub.
- [ ] **UI:** Build the actual `KanbanVirtualList` Drag and Drop interactions (using `@thisbeyond/solid-dnd` or custom).
- [ ] **Integration:** Hook Tanstack Query into the `useTaskSync` socket invalidation.

## Stage 6: Skill Assessment & Background Workers
- [ ] **Piston API Logic:** Extend Sandbox struct to run safely.
- [ ] **Asynq Server Run:** Spin up the Asynq worker daemon in `cmd/worker/main.go`.
- [ ] **Assessment Handlers:** `POST /api/assessment/:id/submit` (queues grading / sends to Piston).
- [ ] **UI:** Split-pane editor for Code Assessment (using Monaco Editor / CodeMirror).
