package domain

import "time"

type Project struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // active, completed, archived
	CreatedByID string    `json:"created_by_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Task struct {
	ID          string                 `json:"id"`
	TenantID    string                 `json:"tenant_id"`
	ProjectID   string                 `json:"project_id"`
	ParentID    *string                `json:"parent_id"` // Support infinite sub-tasking (Adjacency List)
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	DynamicData map[string]interface{} `json:"dynamic_data"` // Bound to JSONB Forms
	Stage       string                 `json:"stage"`        // todo, in_progress, review, done
	AssigneeID  *string                `json:"assignee_id"`
	Priority    int                    `json:"priority"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}
