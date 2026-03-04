package aiworker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/hibiken/asynq"
)

const (
	TypeGenerateQuestions = "ai:generate_questions"
	TypeAnalyzeVideo      = "ai:analyze_video"
)

// TaskPayloads
type GenerateQuestionsPayload struct {
	AssessmentID string `json:"assessment_id"`
	Topic        string `json:"topic"`
	Difficulty   string `json:"difficulty"`
	Count        int    `json:"count"`
}

// Enqueue Task
func EnqueueGenerateQuestions(client *asynq.Client, payload GenerateQuestionsPayload) error {
	p, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	task := asynq.NewTask(TypeGenerateQuestions, p)
	info, err := client.Enqueue(task)
	if err != nil {
		return err
	}
	log.Printf("Enqueued task: id=%s queue=%s", info.ID, info.Queue)
	return nil
}

// Handle Task
func HandleGenerateQuestionsTask(ctx context.Context, t *asynq.Task) error {
	var p GenerateQuestionsPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v: %w", err, asynq.SkipRetry)
	}

	log.Printf("Processing AI Question Generation for Assessment: %s, Topic: %s", p.AssessmentID, p.Topic)
	// TODO: Call OpenAI/Claude API here, parse response, and insert into the generic `questions` table
	return nil
}

func RegisterWorkers(mux *asynq.ServeMux) {
	mux.HandleFunc(TypeGenerateQuestions, HandleGenerateQuestionsTask)
	// mux.HandleFunc(TypeAnalyzeVideo, HandleAnalyzeVideoTask)
}
