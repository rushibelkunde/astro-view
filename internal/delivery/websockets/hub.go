package websockets

import (
	"context"
	"fmt"
	"net/http"
	"sync"

	"github.com/lesismal/nbio/nbhttp"
	"github.com/lesismal/nbio/nbhttp/websocket"
)

type Hub struct {
	connections map[string]*websocket.Conn // userID -> connection
	mu          sync.RWMutex
}

var GlobalHub = &Hub{
	connections: make(map[string]*websocket.Conn),
}

// SetupWebSockets initializes the nbio uWebSockets server instance.
// In a real scenario, you'd extract 'userID' from JWT context or URL query.
func SetupWebSockets(mux *http.ServeMux) {
	upgrader := websocket.NewUpgrader()
	upgrader.OnMessage(func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
		fmt.Printf("Received WS Message: %s\n", string(data))
	})

	upgrader.OnClose(func(c *websocket.Conn, err error) {
		// Remove connection from Hub
		GlobalHub.mu.Lock()
		defer GlobalHub.mu.Unlock()
		for k, v := range GlobalHub.connections {
			if v == c {
				delete(GlobalHub.connections, k)
				break
			}
		}
	})

	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		// Mock authentication: pass ?user_id=123
		userID := r.URL.Query().Get("user_id")
		if userID == "" {
			http.Error(w, "user_id required", http.StatusUnauthorized)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("WS Upgrade Error: %v\n", err)
			return
		}

		// Store the connection
		GlobalHub.mu.Lock()
		GlobalHub.connections[userID] = conn
		GlobalHub.mu.Unlock()
	})
}

// Broadcast sends a message to a specific user.
func (h *Hub) SendToUser(userID string, message []byte) error {
	h.mu.RLock()
	defer h.mu.RUnlock()

	conn, exists := h.connections[userID]
	if !exists {
		return fmt.Errorf("user %s not connected", userID)
	}

	return conn.WriteMessage(websocket.TextMessage, message)
}

// RunServer is a helper to run the non-blocking engine.
func RunServer(ctx context.Context, port string, mux *http.ServeMux) error {
	engine := nbhttp.NewEngine(nbhttp.Config{
		Network: "tcp",
		Addrs:   []string{":" + port},
		Handler: mux,
	})

	err := engine.Start()
	if err != nil {
		return err
	}

	<-ctx.Done()
	engine.Stop()
	return nil
}
