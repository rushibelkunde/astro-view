package rbac

import (
	"context"
	"fmt"

	"corpo/internal/domain"
	"corpo/internal/repository"

	"github.com/google/uuid"
)

type Service struct {
	RoleRepo       repository.RoleRepository
	PermissionRepo repository.PermissionRepository
	FeatureRepo    repository.FeatureRepository
	UserRoleRepo   repository.UserRoleRepository
}

func NewService(
	roleRepo repository.RoleRepository,
	permRepo repository.PermissionRepository,
	featureRepo repository.FeatureRepository,
	userRoleRepo repository.UserRoleRepository,
) *Service {
	return &Service{
		RoleRepo:       roleRepo,
		PermissionRepo: permRepo,
		FeatureRepo:    featureRepo,
		UserRoleRepo:   userRoleRepo,
	}
}

// ---------- Role CRUD ----------

type CreateRoleInput struct {
	TenantID    string `json:"tenant_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (s *Service) CreateRole(ctx context.Context, input CreateRoleInput) (*domain.Role, error) {
	role := &domain.Role{
		ID:          uuid.New().String(),
		TenantID:    input.TenantID,
		Name:        input.Name,
		Description: input.Description,
	}
	if err := s.RoleRepo.Create(ctx, role); err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}
	return role, nil
}

func (s *Service) GetRole(ctx context.Context, id string) (*domain.Role, error) {
	return s.RoleRepo.GetByID(ctx, id)
}

func (s *Service) ListRoles(ctx context.Context, tenantID string) ([]domain.Role, error) {
	return s.RoleRepo.ListByTenant(ctx, tenantID)
}

func (s *Service) UpdateRole(ctx context.Context, role *domain.Role) error {
	return s.RoleRepo.Update(ctx, role)
}

func (s *Service) DeleteRole(ctx context.Context, id string) error {
	return s.RoleRepo.Delete(ctx, id)
}

// ---------- Permissions ----------

type PermissionInput struct {
	Feature string `json:"feature"`
	Action  string `json:"action"`
}

// SetRolePermissions validates and replaces all permissions for a role using the new join table structure.
func (s *Service) SetRolePermissions(ctx context.Context, roleID, tenantID string, inputs []PermissionInput) error {
	var permissionIDs []string

	for _, input := range inputs {
		if !domain.IsValidPermission(input.Feature, input.Action) {
			return fmt.Errorf("invalid permission: %s:%s", input.Feature, input.Action)
		}

		// 1. Find or create the feature (Global)
		feature, err := s.FeatureRepo.GetByCode(ctx, input.Feature)
		if err != nil {
			// If not found, create it (seeding on the fly)
			feature = &domain.Feature{
				ID:   uuid.New().String(),
				Code: input.Feature,
				Name: input.Feature, // Default name to code
			}
			if err := s.FeatureRepo.Create(ctx, feature); err != nil {
				return fmt.Errorf("failed to ensure feature %s: %w", input.Feature, err)
			}
		}

		// 2. Find or create the specific Permission (feature+action) (Global)
		perm, err := s.PermissionRepo.FindOrCreate(ctx, feature.ID, input.Action)
		if err != nil {
			return fmt.Errorf("failed to ensure permission for %s:%s: %w", input.Feature, input.Action, err)
		}

		permissionIDs = append(permissionIDs, perm.ID)
	}

	// 3. Update the join table
	return s.PermissionRepo.SetForRole(ctx, roleID, tenantID, permissionIDs)
}

func (s *Service) GetRolePermissions(ctx context.Context, roleID string) ([]domain.Permission, error) {
	return s.PermissionRepo.GetByRoleID(ctx, roleID)
}

// GetFeatureActionMap returns the system's canonical permission matrix.
func (s *Service) GetFeatureActionMap() map[string][]string {
	return domain.FeatureActionMap
}

// ---------- User-Role Assignments ----------

func (s *Service) AssignRole(ctx context.Context, userID, roleID, tenantID string) error {
	return s.UserRoleRepo.Assign(ctx, &domain.UserRole{
		UserID:   userID,
		RoleID:   roleID,
		TenantID: tenantID,
	})
}

func (s *Service) RevokeRole(ctx context.Context, userID, roleID string) error {
	return s.UserRoleRepo.Revoke(ctx, userID, roleID)
}

func (s *Service) GetUserRoles(ctx context.Context, userID string) ([]domain.Role, error) {
	return s.UserRoleRepo.GetRolesForUser(ctx, userID)
}

// HasPermission checks if a user has a specific feature+action permission.
func (s *Service) HasPermission(ctx context.Context, userID, feature, action string) (bool, error) {
	permissions, err := s.PermissionRepo.GetByUserID(ctx, userID)
	if err != nil {
		return false, err
	}
	for _, p := range permissions {
		if p.FeatureCode == feature && p.Action == action {
			return true, nil
		}
	}
	return false, nil
}
