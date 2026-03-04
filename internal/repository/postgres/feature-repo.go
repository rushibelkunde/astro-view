package postgres

import (
	"context"

	"corpo/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type FeatureRepo struct {
	Pool *pgxpool.Pool
}

func NewFeatureRepo(pool *pgxpool.Pool) *FeatureRepo {
	return &FeatureRepo{Pool: pool}
}

func (r *FeatureRepo) GetByCode(ctx context.Context, code string) (*domain.Feature, error) {
	query := `SELECT id, code, name, created_at FROM features WHERE code = $1`
	var f domain.Feature
	err := r.Pool.QueryRow(ctx, query, code).Scan(&f.ID, &f.Code, &f.Name, &f.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *FeatureRepo) Create(ctx context.Context, f *domain.Feature) error {
	query := `INSERT INTO features (id, code, name) VALUES ($1, $2, $3)`
	_, err := r.Pool.Exec(ctx, query, f.ID, f.Code, f.Name)
	return err
}

func (r *FeatureRepo) ListAll(ctx context.Context) ([]domain.Feature, error) {
	query := `SELECT id, code, name, created_at FROM features`
	rows, err := r.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var features []domain.Feature
	for rows.Next() {
		var f domain.Feature
		if err := rows.Scan(&f.ID, &f.Code, &f.Name, &f.CreatedAt); err != nil {
			return nil, err
		}
		features = append(features, f)
	}
	return features, nil
}
