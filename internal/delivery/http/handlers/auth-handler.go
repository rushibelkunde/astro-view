package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"corpo/internal/usecase/auth"
)

type AuthHandler struct {
	AuthService *auth.Service
}

func NewAuthHandler(authService *auth.Service) *AuthHandler {
	return &AuthHandler{AuthService: authService}
}

// Register handles POST /api/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input auth.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if input.TenantName == "" || input.Email == "" || input.Password == "" || input.TenantDomain == "" {
		http.Error(w, `{"error":"tenant_name, tenant_domain, email, and password are required"}`, http.StatusBadRequest)
		return
	}

	resp, err := h.AuthService.RegisterTenant(r.Context(), input)
	if err != nil {
		msg := "Registration failed"
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505") {
			msg = "A workspace with this domain already exists. Please try logging in instead."
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": msg})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// Login handles POST /api/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input auth.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if input.TenantDomain == "" || input.Email == "" || input.Password == "" {
		http.Error(w, `{"error":"tenant_domain, email, and password are required"}`, http.StatusBadRequest)
		return
	}

	resp, err := h.AuthService.Login(r.Context(), input)
	if err != nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
