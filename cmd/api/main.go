package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"corpo/internal/delivery/http/handlers"
	"corpo/internal/delivery/http/middleware"
	pgRepo "corpo/internal/repository/postgres"
	redisRepo "corpo/internal/repository/redisclient"
	authUsecase "corpo/internal/usecase/auth"
	rbacUsecase "corpo/internal/usecase/rbac"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	ctx := context.Background()

	// 1. Initialize Database Connections (graceful — server starts even if DB/Redis is down)
	var dbPool *pgxpool.Pool
	var redisClient *redis.Client

	pool, err := pgRepo.NewPool(ctx)
	if err != nil {
		log.Printf("⚠️  PostgreSQL connection failed: %v (server will start without DB)", err)
	} else {
		dbPool = pool
		defer dbPool.Close()
		log.Println("✅ PostgreSQL connected")
	}

	rClient, err := redisRepo.NewClient(ctx)
	if err != nil {
		log.Printf("⚠️  Redis connection failed: %v (server will start without Redis)", err)
	} else {
		redisClient = rClient
		defer redisClient.Close()
		log.Println("✅ Redis connected")
	}

	mux := http.NewServeMux()

	// 2. HealthCheck Endpoints (dynamic status from real connections)
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		dbStatus := "disconnected"
		if dbPool != nil {
			if err := dbPool.Ping(r.Context()); err == nil {
				dbStatus = "connected"
			}
		}

		redisStatus := "disconnected"
		if redisClient != nil {
			if err := redisClient.Ping(r.Context()).Err(); err == nil {
				redisStatus = "connected"
			}
		}

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"db":     dbStatus,
			"redis":  redisStatus,
		})
	})

	mux.HandleFunc("GET /api/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	// 3. Auth Routes (only if DB is available)
	if dbPool != nil {
		tenantRepo := pgRepo.NewTenantRepo(dbPool)
		userRepo := pgRepo.NewUserRepo(dbPool)
		authService := authUsecase.NewService(userRepo, tenantRepo)
		authHandler := handlers.NewAuthHandler(authService)

		mux.HandleFunc("POST /api/auth/register", authHandler.Register)
		mux.HandleFunc("POST /api/auth/login", authHandler.Login)
		log.Println("✅ Auth routes registered")

		// 4. RBAC Routes
		roleRepo := pgRepo.NewRoleRepo(dbPool)
		permRepo := pgRepo.NewPermissionRepo(dbPool)
		featureRepo := pgRepo.NewFeatureRepo(dbPool)
		userRoleRepo := pgRepo.NewUserRoleRepo(dbPool)
		rbacService := rbacUsecase.NewService(roleRepo, permRepo, featureRepo, userRoleRepo)
		rbacHandler := handlers.NewRBACHandler(rbacService)

		mux.HandleFunc("GET /api/rbac/matrix", rbacHandler.GetPermissionMatrix)
		mux.HandleFunc("GET /api/rbac/roles", rbacHandler.ListRoles)
		mux.HandleFunc("POST /api/rbac/roles", rbacHandler.CreateRole)
		mux.HandleFunc("DELETE /api/rbac/roles/{id}", rbacHandler.DeleteRole)
		mux.HandleFunc("GET /api/rbac/roles/{id}/permissions", rbacHandler.GetRolePermissions)
		mux.HandleFunc("PUT /api/rbac/roles/{id}/permissions", rbacHandler.SetRolePermissions)
		mux.HandleFunc("POST /api/rbac/user-roles", rbacHandler.AssignUserRole)
		mux.HandleFunc("DELETE /api/rbac/user-roles", rbacHandler.RevokeUserRole)
		mux.HandleFunc("GET /api/rbac/users/{id}/roles", rbacHandler.GetUserRoles)
		log.Println("✅ RBAC routes registered")
	}

	// 4. Setup Middlewares
	handler := corsMiddleware(middleware.TelemetryMiddleware(mux))

	// 4. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	fmt.Printf("Starting Corpo API Service on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// corsMiddleware is a simple proxy wrapper allowing the Vite dev server to communicate
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173") // Vite UI
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
