package domain

// ============================================================
// Feature Constants — every module in the system is a Feature
// ============================================================

const (
	FeatureDashboard   = "dashboard"
	FeatureEmployees   = "employees"
	FeatureAttendance  = "attendance"
	FeatureLeaves      = "leaves"
	FeatureProjects    = "projects"
	FeatureTasks       = "tasks"
	FeatureAssessments = "assessments"
	FeatureRoles       = "roles"
	FeatureUsers       = "users"
	FeatureForms       = "forms"
	FeatureReports     = "reports"
	FeatureSettings    = "settings"
)

// AllFeatures is the canonical list of features in the system.
var AllFeatures = []string{
	FeatureDashboard,
	FeatureEmployees,
	FeatureAttendance,
	FeatureLeaves,
	FeatureProjects,
	FeatureTasks,
	FeatureAssessments,
	FeatureRoles,
	FeatureUsers,
	FeatureForms,
	FeatureReports,
	FeatureSettings,
}

// ============================================================
// Action Constants — every action a user can perform
// ============================================================

const (
	ActionCreate  = "create"
	ActionRead    = "read"
	ActionUpdate  = "update"
	ActionDelete  = "delete"
	ActionExecute = "execute" // For running assessments, reports, etc.
)

// AllActions is the canonical list of possible actions.
var AllActions = []string{
	ActionCreate,
	ActionRead,
	ActionUpdate,
	ActionDelete,
	ActionExecute,
}

// ============================================================
// FeatureActionMap defines which actions are valid per feature.
// This controls the permission matrix available in the UI.
// ============================================================

var FeatureActionMap = map[string][]string{
	FeatureDashboard:   {ActionRead},
	FeatureEmployees:   {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureAttendance:  {ActionCreate, ActionRead, ActionUpdate},
	FeatureLeaves:      {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureProjects:    {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureTasks:       {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureAssessments: {ActionCreate, ActionRead, ActionUpdate, ActionDelete, ActionExecute},
	FeatureRoles:       {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureUsers:       {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureForms:       {ActionCreate, ActionRead, ActionUpdate, ActionDelete},
	FeatureReports:     {ActionRead, ActionExecute},
	FeatureSettings:    {ActionRead, ActionUpdate},
}

// IsValidPermission checks if a feature+action combo is valid.
func IsValidPermission(feature, action string) bool {
	actions, ok := FeatureActionMap[feature]
	if !ok {
		return false
	}
	for _, a := range actions {
		if a == action {
			return true
		}
	}
	return false
}
