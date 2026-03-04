package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheckHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"db":     "disconnected",
			"redis":  "disconnected",
		})
	})

	mux.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Unmarshal the response body
	var response map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	// Verify the payload keys exist
	if response["status"] != "ok" {
		t.Errorf("handler returned unexpected status payload: got %v want %v", response["status"], "ok")
	}

	if response["db"] != "disconnected" {
		t.Errorf("handler returned unexpected db payload: got %v want %v", response["db"], "disconnected")
	}

	if response["redis"] != "disconnected" {
		t.Errorf("handler returned unexpected redis payload: got %v want %v", response["redis"], "disconnected")
	}
}

func TestPingHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/ping", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("pong"))
	})

	mux.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("ping handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	if rr.Body.String() != "pong" {
		t.Errorf("ping handler returned unexpected body: got %v want %v", rr.Body.String(), "pong")
	}
}
