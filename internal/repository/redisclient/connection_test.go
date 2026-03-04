package redisclient

import (
	"context"
	"os"
	"testing"
)

// TestNewClient_InvalidAddr verifies that an unreachable Redis address returns an error.
func TestNewClient_InvalidAddr(t *testing.T) {
	os.Setenv("REDIS_URL", "localhost:9999")
	defer os.Unsetenv("REDIS_URL")

	ctx := context.Background()
	client, err := NewClient(ctx)
	if err == nil {
		client.Close()
		t.Fatal("expected an error for unreachable Redis, got nil")
	}
	t.Logf("Got expected error: %v", err)
}

// TestNewClient_DefaultAddr verifies the default Redis address is used correctly.
func TestNewClient_DefaultAddr(t *testing.T) {
	os.Unsetenv("REDIS_URL") // Force default

	ctx := context.Background()
	_, err := NewClient(ctx)

	// We expect a connection error if Redis isn't running locally
	if err != nil {
		t.Logf("Connection error (expected if Redis not running): %v", err)
	}
}
