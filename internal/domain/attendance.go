package domain

import (
	"time"
)

type AttendanceLog struct {
	ID         string    `json:"id"`
	TenantID   string    `json:"tenant_id"`
	EmployeeID string    `json:"employee_id"`
	Type       string    `json:"type"` // "punch_in" or "punch_out"
	Timestamp  time.Time `json:"timestamp"`
	// PostGIS Coordinate representation
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	PhotoURL  string  `json:"photo_url"` // S3 Key created via S3Repo
}
