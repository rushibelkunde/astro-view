package auth

import (
	"context"
	"testing"

	"corpo/internal/domain"
	"corpo/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

// ---- In-memory mock repositories ----

type mockUserRepo struct {
	users map[string]*domain.User
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]*domain.User)}
}

func (m *mockUserRepo) Create(ctx context.Context, user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, tenantID, email string) (*domain.User, error) {
	u, ok := m.users[email]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return u, nil
}

func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, repository.ErrNotFound
}

type mockTenantRepo struct {
	tenants map[string]*domain.Tenant
}

func newMockTenantRepo() *mockTenantRepo {
	return &mockTenantRepo{tenants: make(map[string]*domain.Tenant)}
}

func (m *mockTenantRepo) Create(ctx context.Context, tenant *domain.Tenant) error {
	m.tenants[tenant.Domain] = tenant
	return nil
}

func (m *mockTenantRepo) GetByDomain(ctx context.Context, domainName string) (*domain.Tenant, error) {
	t, ok := m.tenants[domainName]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return t, nil
}

func (m *mockTenantRepo) GetByID(ctx context.Context, id string) (*domain.Tenant, error) {
	for _, t := range m.tenants {
		if t.ID == id {
			return t, nil
		}
	}
	return nil, repository.ErrNotFound
}

// ---- Tests ----

func TestRegisterTenant(t *testing.T) {
	userRepo := newMockUserRepo()
	tenantRepo := newMockTenantRepo()
	svc := NewService(userRepo, tenantRepo)

	ctx := context.Background()
	resp, err := svc.RegisterTenant(ctx, RegisterInput{
		TenantName:   "Test Corp",
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "password123",
		FullName:     "Admin User",
	})

	if err != nil {
		t.Fatalf("RegisterTenant failed: %v", err)
	}

	if resp.Token == "" {
		t.Error("expected a non-empty JWT token")
	}

	if resp.Tenant.Domain != "test.com" {
		t.Errorf("expected tenant domain 'test.com', got '%s'", resp.Tenant.Domain)
	}

	if resp.User.Email != "admin@test.com" {
		t.Errorf("expected user email 'admin@test.com', got '%s'", resp.User.Email)
	}

	if resp.User.FirstName != "Admin" || resp.User.LastName != "User" {
		t.Errorf("expected name split to 'Admin'/'User', got '%s'/'%s'", resp.User.FirstName, resp.User.LastName)
	}
}

func TestLogin(t *testing.T) {
	userRepo := newMockUserRepo()
	tenantRepo := newMockTenantRepo()
	svc := NewService(userRepo, tenantRepo)

	ctx := context.Background()

	_, err := svc.RegisterTenant(ctx, RegisterInput{
		TenantName:   "Test Corp",
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "password123",
		FullName:     "Admin User",
	})
	if err != nil {
		t.Fatalf("RegisterTenant failed: %v", err)
	}

	resp, err := svc.Login(ctx, LoginInput{
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "password123",
	})
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}

	if resp.Token == "" {
		t.Error("expected a non-empty JWT token")
	}
}

func TestLoginWrongPassword(t *testing.T) {
	userRepo := newMockUserRepo()
	tenantRepo := newMockTenantRepo()
	svc := NewService(userRepo, tenantRepo)

	ctx := context.Background()

	_, _ = svc.RegisterTenant(ctx, RegisterInput{
		TenantName:   "Test Corp",
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "password123",
		FullName:     "Admin User",
	})

	_, err := svc.Login(ctx, LoginInput{
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "wrongpassword",
	})
	if err == nil {
		t.Error("expected login to fail with wrong password")
	}
}

func TestPasswordIsHashed(t *testing.T) {
	userRepo := newMockUserRepo()
	tenantRepo := newMockTenantRepo()
	svc := NewService(userRepo, tenantRepo)

	ctx := context.Background()

	_, err := svc.RegisterTenant(ctx, RegisterInput{
		TenantName:   "Test Corp",
		TenantDomain: "test.com",
		Email:        "admin@test.com",
		Password:     "password123",
		FullName:     "Admin User",
	})
	if err != nil {
		t.Fatalf("RegisterTenant failed: %v", err)
	}

	storedUser := userRepo.users["admin@test.com"]
	if storedUser.PasswordHash == "password123" {
		t.Error("password is stored in plaintext, expected bcrypt hash")
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.PasswordHash), []byte("password123"))
	if err != nil {
		t.Errorf("bcrypt comparison failed: %v", err)
	}
}
