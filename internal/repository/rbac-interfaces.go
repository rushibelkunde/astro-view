package repository

import (
	"context"
	"corpo/internal/domain"
)

// RoleRepository defines the interface for role persistence.
type RoleRepository interface {
	Create(ctx context.Context, role *domain.Role) error
	GetByID(ctx context.Context, id string) (*domain.Role, error)
	ListByTenant(ctx context.Context, tenantID string) ([]domain.Role, error)
	Update(ctx context.Context, role *domain.Role) error
	Delete(ctx context.Context, id string) error
}

// FeatureRepository defines the interface for feature persistence.
type FeatureRepository interface {
	GetByCode(ctx context.Context, code string) (*domain.Feature, error)
	Create(ctx context.Context, feature *domain.Feature) error
	ListAll(ctx context.Context) ([]domain.Feature, error)
}

// PermissionRepository defines the interface for permission persistence.
type PermissionRepository interface {
	SetForRole(ctx context.Context, roleID, tenantID string, permissionIDs []string) error
	GetByRoleID(ctx context.Context, roleID string) ([]domain.Permission, error)
	GetByUserID(ctx context.Context, userID string) ([]domain.Permission, error)
	FindOrCreate(ctx context.Context, featureID, action string) (*domain.Permission, error)
}

// UserRoleRepository defines the interface for user-role assignments.
type UserRoleRepository interface {
	Assign(ctx context.Context, userRole *domain.UserRole) error
	Revoke(ctx context.Context, userID, roleID string) error
	GetRolesForUser(ctx context.Context, userID string) ([]domain.Role, error)
	GetUsersForRole(ctx context.Context, roleID string) ([]domain.User, error)
}
