package domain

import (
	"time"
)

type Employee struct {
	ID           string                 `json:"id"`
	TenantID     string                 `json:"tenant_id"`
	UserID       string                 `json:"user_id"` // Link to global Auth user
	DepartmentID string                 `json:"department_id"`
	Designation  string                 `json:"designation"`
	ManagerID    string                 `json:"manager_id"`
	DynamicData  map[string]interface{} `json:"dynamic_data"` // Loaded from FormDefinition JSONB
	Status       string                 `json:"status"`       // active, on_leave, terminated
	JoiningDate  time.Time              `json:"joining_date"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
}
