package postgres

import (
	"context"
	"fmt"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PermissionRepo struct {
	Pool *pgxpool.Pool
}

func NewPermissionRepo(pool *pgxpool.Pool) *PermissionRepo {
	return &PermissionRepo{Pool: pool}
}

// SetForRole replaces all permissions for a role using the role_permissions join table.
func (r *PermissionRepo) SetForRole(ctx context.Context, roleID, tenantID string, permissionIDs []string) error {
	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Delete existing join entries for this role
	_, err = tx.Exec(ctx, `DELETE FROM role_permissions WHERE role_id = $1`, roleID)
	if err != nil {
		return fmt.Errorf("failed to clear role permissions: %w", err)
	}

	// Insert new join entries
	for _, pID := range permissionIDs {
		_, err = tx.Exec(ctx,
			`INSERT INTO role_permissions (role_id, permission_id, tenant_id) VALUES ($1, $2, $3)`,
			roleID, pID, tenantID,
		)
		if err != nil {
			return fmt.Errorf("failed to link permission %s to role %s: %w", pID, roleID, err)
		}
	}

	return tx.Commit(ctx)
}

func (r *PermissionRepo) GetByRoleID(ctx context.Context, roleID string) ([]domain.Permission, error) {
	query := `
		SELECT p.id, p.feature_id, f.code, p.action, p.conditions, p.created_at 
		FROM permissions p
		JOIN features f ON f.id = p.feature_id
		JOIN role_permissions rp ON rp.permission_id = p.id
		WHERE rp.role_id = $1
	`
	rows, err := r.Pool.Query(ctx, query, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get permissions: %w", err)
	}
	defer rows.Close()

	var permissions []domain.Permission
	for rows.Next() {
		var p domain.Permission
		if err := rows.Scan(&p.ID, &p.FeatureID, &p.FeatureCode, &p.Action, &p.Conditions, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan permission: %w", err)
		}
		permissions = append(permissions, p)
	}
	return permissions, nil
}

// GetByUserID returns all permissions across all roles assigned to a user.
func (r *PermissionRepo) GetByUserID(ctx context.Context, userID string) ([]domain.Permission, error) {
	query := `
		SELECT DISTINCT p.id, p.feature_id, f.code, p.action, p.conditions, p.created_at
		FROM permissions p
		JOIN features f ON f.id = p.feature_id
		JOIN role_permissions rp ON rp.permission_id = p.id
		JOIN user_roles ur ON ur.role_id = rp.role_id
		WHERE ur.user_id = $1
	`
	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user permissions: %w", err)
	}
	defer rows.Close()

	var permissions []domain.Permission
	for rows.Next() {
		var p domain.Permission
		if err := rows.Scan(&p.ID, &p.FeatureID, &p.FeatureCode, &p.Action, &p.Conditions, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan permission: %w", err)
		}
		permissions = append(permissions, p)
	}
	return permissions, nil
}

func (r *PermissionRepo) FindOrCreate(ctx context.Context, featureID, action string) (*domain.Permission, error) {
	query := `
		INSERT INTO permissions (feature_id, action)
		VALUES ($1, $2)
		ON CONFLICT (feature_id, action) DO UPDATE SET feature_id = EXCLUDED.feature_id
		RETURNING id, feature_id, action, conditions, created_at
	`
	var p domain.Permission
	err := r.Pool.QueryRow(ctx, query, featureID, action).Scan(
		&p.ID, &p.FeatureID, &p.Action, &p.Conditions, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
