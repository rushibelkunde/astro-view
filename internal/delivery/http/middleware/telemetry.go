package middleware

import (
	"fmt"
	"net/http"
	"time"
)

// TelemetryMiddleware captures API usage, execution time, and writes to Redis asynchronously.
func TelemetryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a custom response writer to capture the status code
		rw := &responseWriter{w, http.StatusOK}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)
		tenantID := r.Context().Value(TenantIDKey)
		if tenantID == nil {
			tenantID = "unknown"
		}

		// Asynchronously log to Redis (mocked here, should batch flush to PG later)
		go func(tID interface{}, method, path string, status int, d time.Duration) {
			// TODO: Use Redis client to LPush telemetry records for batch persistence
			fmt.Printf("[TELEMETRY] Tenant: %v | %s %s | Status: %d | Duration: %v\n", tID, method, path, status, d)
		}(tenantID, r.Method, r.URL.Path, rw.statusCode, duration)
	})
}

// responseWriter is a custom wrapper to capture the HTTP status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}
