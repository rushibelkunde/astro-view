package notification

import (
	"context"
	"fmt"
	"time"
)

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"` // "email" | "in_app" | "both"
	CreatedAt time.Time `json:"created_at"`
}

type Service interface {
	SendInApp(ctx context.Context, notif Notification) error
	SendEmail(ctx context.Context, notif Notification) error
}

type notificationService struct {
	// dependencies like WS Hub, Mailer configuration
}

func NewNotificationService() Service {
	return &notificationService{}
}

func (s *notificationService) SendInApp(ctx context.Context, notif Notification) error {
	// Logic to store the notification in DB and push via WebSockets
	fmt.Printf("[In-App Notification to User %s]: %s\n", notif.UserID, notif.Title)
	// Example: websockets.GlobalHub.SendToUser(notif.UserID, []byte(notif.Message))
	return nil
}

func (s *notificationService) SendEmail(ctx context.Context, notif Notification) error {
	// Logic to format an email and send via SES/SMTP
	fmt.Printf("[Email Sent to User %s]: %v\n", notif.UserID, notif.Title)
	return nil
}
