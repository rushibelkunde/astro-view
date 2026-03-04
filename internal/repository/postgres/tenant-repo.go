package postgres

import (
	"context"
	"fmt"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TenantRepo struct {
	Pool *pgxpool.Pool
}

func NewTenantRepo(pool *pgxpool.Pool) *TenantRepo {
	return &TenantRepo{Pool: pool}
}

func (r *TenantRepo) Create(ctx context.Context, tenant *domain.Tenant) error {
	query := `INSERT INTO tenants (id, name, domain) VALUES ($1, $2, $3)`
	_, err := r.Pool.Exec(ctx, query, tenant.ID, tenant.Name, tenant.Domain)
	if err != nil {
		return fmt.Errorf("failed to create tenant: %w", err)
	}
	return nil
}

func (r *TenantRepo) GetByDomain(ctx context.Context, domainName string) (*domain.Tenant, error) {
	query := `SELECT id, name, domain, status, created_at FROM tenants WHERE domain = $1`
	row := r.Pool.QueryRow(ctx, query, domainName)

	var t domain.Tenant
	if err := row.Scan(&t.ID, &t.Name, &t.Domain, &t.Status, &t.CreatedAt); err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}
	return &t, nil
}

func (r *TenantRepo) GetByID(ctx context.Context, id string) (*domain.Tenant, error) {
	query := `SELECT id, name, domain, status, created_at FROM tenants WHERE id = $1`
	row := r.Pool.QueryRow(ctx, query, id)

	var t domain.Tenant
	if err := row.Scan(&t.ID, &t.Name, &t.Domain, &t.Status, &t.CreatedAt); err != nil {
		return nil, fmt.Errorf("tenant not found: %w", err)
	}
	return &t, nil
}
