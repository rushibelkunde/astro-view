package payroll

import (
	"context"
	"encoding/json"
	"fmt"

	"corpo/internal/ruleengine"
)

type PayslipService struct {
	RuleEngine *ruleengine.RuleEngine
}

func NewPayslipService(engine *ruleengine.RuleEngine) *PayslipService {
	return &PayslipService{RuleEngine: engine}
}

// GeneratePayslip dynamically calculates salary based on Attendance and Leave policies via Rule Engine.
func (s *PayslipService) GeneratePayslip(ctx context.Context, employeeID string, ruleJSON []byte, attendanceData map[string]interface{}) (map[string]interface{}, error) {
	// 1. Fetch Employee base salary structure (from HRMS/Dynamic Forms DB)
	// 2. Fetch Attendance logs for the month
	// 3. Fetch Approved Unpaid Leaves

	// Mocking payload to pass to Rule Engine
	payload := map[string]interface{}{
		"employee_id":      employeeID,
		"base_salary":      50000,
		"days_present":     attendanceData["days_present"],
		"unpaid_leaves":    attendanceData["unpaid_leaves"],
		"overtime_hours":   attendanceData["overtime_hours"],
		"assessment_bonus": attendanceData["assessment_score"], // Tied to Phase 6
	}

	result, err := s.RuleEngine.Evaluate(ruleJSON, payload)
	if err != nil {
		return nil, fmt.Errorf("payroll calculation failed: %w", err)
	}

	// In reality result might be a complex struct defining deductions and additions
	payloadBytes, _ := json.Marshal(result)
	var finalPayslip map[string]interface{}
	json.Unmarshal(payloadBytes, &finalPayslip)

	return finalPayslip, nil
}
