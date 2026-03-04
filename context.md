## Project Structure
```text
.
├── cmd/
│   └── api/                # Application entry points (main.go)
├── internal/
│   ├── domain/             # Core business entities & constants (Role, Permission, User)
│   ├── usecase/            # Business logic services (RBAC, Auth, Assessment)
│   ├── repository/         # Data access layer
│   │   ├── postgres/       # PostgreSQL implementations (Repo structs)
│   │   ├── redisclient/    # Redis caching & connections
│   │   └── rbac-interfaces.go
│   └── delivery/           # Interface layer (HTTP, WebSocket)
│       └── http/           # Handlers, Middleware, Routes
├── web/                    # Frontend (SolidJS + Vite)
│   ├── src/
│   │   ├── components/     # UI components (app-layout, protected-route)
│   │   ├── pages/          # Page components (roles-page, dashboard-page)
│   │   ├── services/       # API clients (rbac-service)
│   │   └── lib/            # State management (app-store), validators, utils
├── db/                     # SQL migrations and initialization scripts
├── docker-compose.yml      # Infrastructure (Postgres, Redis, RabbitMQ)
└── context.md              # Living documentation of project state
```

## Conventions
- **Naming:** Filenames MUST be `smallcase-hyphenated.go` or `.tsx`.
- **Architecture:** Strict Clean Architecture. Domain should NOT depend on anything. Usecases depend on Domain and Repos interfaces.
- **Multitenancy:** Current tenant ID is passed via `X-Tenant-ID` header and set in Postgres session using `app.current_tenant`. RLS policies automatically filter data.
- **RBAC:** 
    - `features`: Global system modules (dashboard, employees, etc.)
    - `permissions`: Global feature+action pairs (dashboard:read)
    - `role_permissions`: Join table linking tenant roles to global permissions.
- **Frontend State:** Standardizes on `solid-js/store` for global state and `@tanstack/solid-query` for server state.

