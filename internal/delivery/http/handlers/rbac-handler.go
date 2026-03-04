package handlers

import (
	"encoding/json"
	"net/http"

	"corpo/internal/domain"
	rbacUsecase "corpo/internal/usecase/rbac"
)

type RBACHandler struct {
	Service *rbacUsecase.Service
}

func NewRBACHandler(svc *rbacUsecase.Service) *RBACHandler {
	return &RBACHandler{Service: svc}
}

// GetPermissionMatrix returns the system's feature-action map (constants).
// GET /api/rbac/matrix
func (h *RBACHandler) GetPermissionMatrix(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"features":           domain.AllFeatures,
		"actions":            domain.AllActions,
		"feature_action_map": domain.FeatureActionMap,
	})
}

// ListRoles lists all roles for the tenant.
// GET /api/rbac/roles
func (h *RBACHandler) ListRoles(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	if tenantID == "" {
		http.Error(w, `{"error":"tenant_id required"}`, http.StatusBadRequest)
		return
	}

	roles, err := h.Service.ListRoles(r.Context(), tenantID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if roles == nil {
		roles = []domain.Role{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roles)
}

// CreateRole creates a new role.
// POST /api/rbac/roles
func (h *RBACHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	if tenantID == "" {
		http.Error(w, `{"error":"tenant_id required"}`, http.StatusBadRequest)
		return
	}

	var input rbacUsecase.CreateRoleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	input.TenantID = tenantID

	role, err := h.Service.CreateRole(r.Context(), input)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusConflict)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(role)
}

// DeleteRole deletes a role.
// DELETE /api/rbac/roles/{id}
func (h *RBACHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	roleID := r.PathValue("id")
	if roleID == "" {
		http.Error(w, `{"error":"role id required"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.DeleteRole(r.Context(), roleID); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetRolePermissions returns permissions for a role.
// GET /api/rbac/roles/{id}/permissions
func (h *RBACHandler) GetRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := r.PathValue("id")
	permissions, err := h.Service.GetRolePermissions(r.Context(), roleID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if permissions == nil {
		permissions = []domain.Permission{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(permissions)
}

// SetRolePermissions replaces all permissions for a role.
// PUT /api/rbac/roles/{id}/permissions
func (h *RBACHandler) SetRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := r.PathValue("id")
	tenantID := r.Header.Get("X-Tenant-ID")
	if tenantID == "" {
		http.Error(w, `{"error":"tenant_id required"}`, http.StatusBadRequest)
		return
	}

	var inputs []rbacUsecase.PermissionInput
	if err := json.NewDecoder(r.Body).Decode(&inputs); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.SetRolePermissions(r.Context(), roleID, tenantID, inputs); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "permissions updated"})
}

// AssignUserRole assigns a role to a user.
// POST /api/rbac/user-roles
func (h *RBACHandler) AssignUserRole(w http.ResponseWriter, r *http.Request) {
	tenantID := r.Header.Get("X-Tenant-ID")
	var input struct {
		UserID string `json:"user_id"`
		RoleID string `json:"role_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.AssignRole(r.Context(), input.UserID, input.RoleID, tenantID); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "role assigned"})
}

// RevokeUserRole removes a role from a user.
// DELETE /api/rbac/user-roles
func (h *RBACHandler) RevokeUserRole(w http.ResponseWriter, r *http.Request) {
	var input struct {
		UserID string `json:"user_id"`
		RoleID string `json:"role_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.Service.RevokeRole(r.Context(), input.UserID, input.RoleID); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "role revoked"})
}

// GetUserRoles returns all roles for a user.
// GET /api/rbac/users/{id}/roles
func (h *RBACHandler) GetUserRoles(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	roles, err := h.Service.GetUserRoles(r.Context(), userID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if roles == nil {
		roles = []domain.Role{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roles)
}
