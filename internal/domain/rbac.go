package domain

import (
	"time"
)

type Role struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Feature struct {
	ID        string    `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Permission struct {
	ID          string                 `json:"id"`
	FeatureID   string                 `json:"feature_id"`
	FeatureCode string                 `json:"feature_code"` // Joined from Features table
	Action      string                 `json:"action"`       // create, read, update, delete, execute
	Conditions  map[string]interface{} `json:"conditions"`   // For ABAC
	CreatedAt   time.Time              `json:"created_at"`
}

type UserRole struct {
	UserID   string `json:"user_id"`
	RoleID   string `json:"role_id"`
	TenantID string `json:"tenant_id"`
}

type RolePermission struct {
	RoleID       string `json:"role_id"`
	PermissionID string `json:"permission_id"`
	TenantID     string `json:"tenant_id"`
}
