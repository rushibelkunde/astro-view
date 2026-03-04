package repository

import (
	"context"
	"corpo/internal/domain"
)

// UserRepository defines the interface for user persistence operations.
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, tenantID, email string) (*domain.User, error)
	GetByID(ctx context.Context, id string) (*domain.User, error)
}

// TenantRepository defines the interface for tenant persistence operations.
type TenantRepository interface {
	Create(ctx context.Context, tenant *domain.Tenant) error
	GetByDomain(ctx context.Context, domain string) (*domain.Tenant, error)
	GetByID(ctx context.Context, id string) (*domain.Tenant, error)
}
