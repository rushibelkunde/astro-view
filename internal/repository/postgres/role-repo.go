package postgres

import (
	"context"
	"fmt"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleRepo struct {
	Pool *pgxpool.Pool
}

func NewRoleRepo(pool *pgxpool.Pool) *RoleRepo {
	return &RoleRepo{Pool: pool}
}

func (r *RoleRepo) Create(ctx context.Context, role *domain.Role) error {
	query := `INSERT INTO roles (id, tenant_id, name, description) VALUES ($1, $2, $3, $4)`
	_, err := r.Pool.Exec(ctx, query, role.ID, role.TenantID, role.Name, role.Description)
	if err != nil {
		return fmt.Errorf("failed to create role: %w", err)
	}
	return nil
}

func (r *RoleRepo) GetByID(ctx context.Context, id string) (*domain.Role, error) {
	query := `SELECT id, tenant_id, name, description, created_at, updated_at FROM roles WHERE id = $1`
	row := r.Pool.QueryRow(ctx, query, id)

	var role domain.Role
	if err := row.Scan(&role.ID, &role.TenantID, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt); err != nil {
		return nil, fmt.Errorf("role not found: %w", err)
	}
	return &role, nil
}

func (r *RoleRepo) ListByTenant(ctx context.Context, tenantID string) ([]domain.Role, error) {
	query := `SELECT id, tenant_id, name, description, created_at, updated_at FROM roles WHERE tenant_id = $1 ORDER BY name`
	rows, err := r.Pool.Query(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}
	defer rows.Close()

	var roles []domain.Role
	for rows.Next() {
		var role domain.Role
		if err := rows.Scan(&role.ID, &role.TenantID, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (r *RoleRepo) Update(ctx context.Context, role *domain.Role) error {
	query := `UPDATE roles SET name = $1, description = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.Pool.Exec(ctx, query, role.Name, role.Description, role.ID)
	if err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}
	return nil
}

func (r *RoleRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM roles WHERE id = $1`
	_, err := r.Pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}
	return nil
}
