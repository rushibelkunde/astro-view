package domain

import "time"

type LeavePolicy struct {
	ID             string    `json:"id"`
	TenantID       string    `json:"tenant_id"`
	Name           string    `json:"name"`
	AllowedDays    int       `json:"allowed_days"`
	DynamicRulesID string    `json:"dynamic_rules_id"` // Links to RuleEngine JSON blob for calculation
	CreatedAt      time.Time `json:"created_at"`
}

type LeaveRequest struct {
	ID           string    `json:"id"`
	TenantID     string    `json:"tenant_id"`
	EmployeeID   string    `json:"employee_id"`
	LeaveTypeID  string    `json:"leave_type_id"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	Status       string    `json:"status"` // pending, approved, rejected
	ApprovedByID *string   `json:"approved_by_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
