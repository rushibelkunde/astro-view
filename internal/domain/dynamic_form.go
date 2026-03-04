package domain

import (
	"time"
)

type FormDefinition struct {
	ID         string                 `json:"id"`
	TenantID   string                 `json:"tenant_id"`
	EntityType string                 `json:"entity_type"`
	Schema     map[string]interface{} `json:"schema"`    // JSON Schema
	UISchema   map[string]interface{} `json:"ui_schema"` // UI Rendering config
	IsActive   bool                   `json:"is_active"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}
