package postgres

import (
	"context"
	"fmt"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	Pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{Pool: pool}
}

func (r *UserRepo) Create(ctx context.Context, user *domain.User) error {
	query := `INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.Pool.Exec(ctx, query, user.ID, user.TenantID, user.Email, user.PasswordHash, user.FirstName, user.LastName)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (r *UserRepo) GetByEmail(ctx context.Context, tenantID, email string) (*domain.User, error) {
	query := `SELECT id, tenant_id, email, password_hash, first_name, last_name, created_at FROM users WHERE tenant_id = $1 AND email = $2`
	row := r.Pool.QueryRow(ctx, query, tenantID, email)

	var u domain.User
	if err := row.Scan(&u.ID, &u.TenantID, &u.Email, &u.PasswordHash, &u.FirstName, &u.LastName, &u.CreatedAt); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &u, nil
}

func (r *UserRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `SELECT id, tenant_id, email, password_hash, first_name, last_name, created_at FROM users WHERE id = $1`
	row := r.Pool.QueryRow(ctx, query, id)

	var u domain.User
	if err := row.Scan(&u.ID, &u.TenantID, &u.Email, &u.PasswordHash, &u.FirstName, &u.LastName, &u.CreatedAt); err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &u, nil
}
