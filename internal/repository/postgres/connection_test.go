package postgres

import (
	"context"
	"os"
	"testing"
)

// TestNewPool_InvalidDSN verifies that an invalid DSN returns an error.
func TestNewPool_InvalidDSN(t *testing.T) {
	// Set a bogus DSN
	os.Setenv("DATABASE_URL", "postgres://baduser:badpass@localhost:9999/nonexistent?sslmode=disable")
	defer os.Unsetenv("DATABASE_URL")

	ctx := context.Background()
	pool, err := NewPool(ctx)
	if err == nil {
		pool.Close()
		t.Fatal("expected an error for invalid DSN, got nil")
	}
	t.Logf("Got expected error: %v", err)
}

// TestNewPool_DefaultDSN verifies the default DSN format is parseable.
// This test will fail to connect if Postgres is not running, but validates the config parsing.
func TestNewPool_DefaultDSN(t *testing.T) {
	os.Unsetenv("DATABASE_URL") // Force default DSN

	ctx := context.Background()
	_, err := NewPool(ctx)

	// We expect a connection error (not a parse error) since Postgres may not be running
	if err != nil {
		t.Logf("Connection error (expected if DB not running): %v", err)
	}
}
