package auth

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"corpo/internal/domain"
	"corpo/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	UserRepo   repository.UserRepository
	TenantRepo repository.TenantRepository
	JWTSecret  []byte
}

func NewService(userRepo repository.UserRepository, tenantRepo repository.TenantRepository) *Service {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "corpo-dev-secret-change-me"
	}
	return &Service{
		UserRepo:   userRepo,
		TenantRepo: tenantRepo,
		JWTSecret:  []byte(secret),
	}
}

type RegisterInput struct {
	TenantName   string `json:"tenant_name"`
	TenantDomain string `json:"tenant_domain"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	FullName     string `json:"full_name"`
}

type LoginInput struct {
	TenantDomain string `json:"tenant_domain"`
	Email        string `json:"email"`
	Password     string `json:"password"`
}

type AuthResponse struct {
	Token  string        `json:"token"`
	Tenant domain.Tenant `json:"tenant"`
	User   domain.User   `json:"user"`
}

// RegisterTenant creates a new tenant + admin user in a single flow.
func (s *Service) RegisterTenant(ctx context.Context, input RegisterInput) (*AuthResponse, error) {
	tenantID := uuid.New().String()
	tenant := &domain.Tenant{
		ID:     tenantID,
		Name:   input.TenantName,
		Domain: input.TenantDomain,
	}

	if err := s.TenantRepo.Create(ctx, tenant); err != nil {
		return nil, fmt.Errorf("failed to register tenant: %w", err)
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Split full_name into first/last
	firstName, lastName := splitName(input.FullName)

	userID := uuid.New().String()
	user := &domain.User{
		ID:           userID,
		TenantID:     tenantID,
		Email:        input.Email,
		PasswordHash: string(hashed),
		FirstName:    firstName,
		LastName:     lastName,
	}

	if err := s.UserRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}

	token, err := s.generateToken(userID, tenantID)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, Tenant: *tenant, User: *user}, nil
}

// Login authenticates a user and returns a JWT token.
func (s *Service) Login(ctx context.Context, input LoginInput) (*AuthResponse, error) {
	tenant, err := s.TenantRepo.GetByDomain(ctx, input.TenantDomain)
	if err != nil {
		return nil, fmt.Errorf("invalid tenant: %w", err)
	}

	user, err := s.UserRepo.GetByEmail(ctx, tenant.ID, input.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	token, err := s.generateToken(user.ID, tenant.ID)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, Tenant: *tenant, User: *user}, nil
}

func (s *Service) generateToken(userID, tenantID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":   userID,
		"tenant_id": tenantID,
		"exp":       time.Now().Add(24 * time.Hour).Unix(),
		"iat":       time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.JWTSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}
	return signed, nil
}

func splitName(fullName string) (string, string) {
	parts := strings.SplitN(strings.TrimSpace(fullName), " ", 2)
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return parts[0], ""
}
