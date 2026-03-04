package domain

import "time"

type Assessment struct {
	ID          string                 `json:"id"`
	TenantID    string                 `json:"tenant_id"`
	Type        string                 `json:"type"` // quiz, coding, 360_feedback, survey
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Config      map[string]interface{} `json:"config"` // e.g. time_limit, languages_allowed, passing_score
	Questions   []Question             `json:"questions"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

type Question struct {
	ID           string                 `json:"id"`
	AssessmentID string                 `json:"assessment_id"` // FK to Assessment
	Type         string                 `json:"type"`          // mcq, programming, text, video
	Content      string                 `json:"content"`       // Markdown or text representation
	Options      map[string]interface{} `json:"options"`       // For MCQ: A, B, C; For Code: expected_outputs
	Answer       string                 `json:"answer"`        // Used by Rule Engine to auto-grade
	AIParams     map[string]interface{} `json:"ai_params"`     // Config for AI generation if not manually set
}
