package postgres

import (
	"context"
	"fmt"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRoleRepo struct {
	Pool *pgxpool.Pool
}

func NewUserRoleRepo(pool *pgxpool.Pool) *UserRoleRepo {
	return &UserRoleRepo{Pool: pool}
}

func (r *UserRoleRepo) Assign(ctx context.Context, userRole *domain.UserRole) error {
	query := `INSERT INTO user_roles (user_id, role_id, tenant_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`
	_, err := r.Pool.Exec(ctx, query, userRole.UserID, userRole.RoleID, userRole.TenantID)
	if err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}
	return nil
}

func (r *UserRoleRepo) Revoke(ctx context.Context, userID, roleID string) error {
	query := `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`
	_, err := r.Pool.Exec(ctx, query, userID, roleID)
	if err != nil {
		return fmt.Errorf("failed to revoke role: %w", err)
	}
	return nil
}

func (r *UserRoleRepo) GetRolesForUser(ctx context.Context, userID string) ([]domain.Role, error) {
	query := `
		SELECT r.id, r.tenant_id, r.name, r.description, r.created_at, r.updated_at
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1
		ORDER BY r.name
	`
	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles for user: %w", err)
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

func (r *UserRoleRepo) GetUsersForRole(ctx context.Context, roleID string) ([]domain.User, error) {
	query := `
		SELECT u.id, u.tenant_id, u.email, u.password_hash, u.first_name, u.last_name, u.created_at
		FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		WHERE ur.role_id = $1
		ORDER BY u.email
	`
	rows, err := r.Pool.Query(ctx, query, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get users for role: %w", err)
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.TenantID, &u.Email, &u.PasswordHash, &u.FirstName, &u.LastName, &u.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}
	return users, nil
}
