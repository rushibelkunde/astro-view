package s3repo

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3DocumentRepository struct {
	client *s3.Client
	bucket string
}

func NewS3DocumentRepository(ctx context.Context, bucketName string) (*S3DocumentRepository, error) {
	// The config will inherently read from AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY env vars
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	return &S3DocumentRepository{
		client: client,
		bucket: bucketName,
	}, nil
}

// UploadFile streams a multipart file directly to S3.
func (r *S3DocumentRepository) UploadFile(ctx context.Context, key string, file multipart.File) error {
	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return fmt.Errorf("failed to upload file: %w", err)
	}
	return nil
}

// GetDownloadURL generates a pre-signed URL (pseudo implementation).
func (r *S3DocumentRepository) GetDownloadURL(ctx context.Context, key string) string {
	// For full implementation, configure an S3 PresignClient here.
	return fmt.Sprintf("https://%s.s3.amazonaws.com/%s", r.bucket, key)
}
