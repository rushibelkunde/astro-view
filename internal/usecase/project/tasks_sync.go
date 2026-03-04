package tasksync

import (
	"context"
	"encoding/json"
	"fmt"

	"corpo/internal/delivery/websockets"
	"corpo/internal/domain"
)

type KanbanSyncService struct {
	Hub *websockets.Hub
}

func NewKanbanSyncService(hub *websockets.Hub) *KanbanSyncService {
	return &KanbanSyncService{Hub: hub}
}

// BroadcastStageChange sends real-time updates of Kanban movement to ALL connected
// users in the tenant. In a real system you'd look up connected users by tenant_id.
// For now, we mock sending to essentially all active connections for demonstration.
func (s *KanbanSyncService) BroadcastStageChange(ctx context.Context, task domain.Task, newStage string) error {
	task.Stage = newStage

	payload, err := json.Marshal(map[string]interface{}{
		"event": "TASK_MOVED",
		"data":  task,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal task sync event: %w", err)
	}

	// This assumes the Hub holds references to userIDs.
	// You'd typically range over connected users filtered by tenant_id.
	s.Hub.mu.RLock()
	defer s.Hub.mu.RUnlock()

	for userID, conn := range s.Hub.connections { // Ignoring tenant separation for pure sync mock
		conn.WriteMessage(1, payload) // 1 = TextMessage
		fmt.Printf("Pushed task sync to user: %s\n", userID)
	}

	return nil
}
