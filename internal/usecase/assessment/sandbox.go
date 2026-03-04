package sandbox

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ExecutionResult struct {
	Language string     `json:"language"`
	Version  string     `json:"version"`
	Run      RunResult  `json:"run"`
	Compile  *RunResult `json:"compile,omitempty"`
}

type RunResult struct {
	Stdout string `json:"stdout"`
	Stderr string `json:"stderr"`
	Output string `json:"output"`
	Code   int    `json:"code"`
	Signal string `json:"signal"`
}

type PistonRequest struct {
	Language string `json:"language"`
	Version  string `json:"version"`
	Files    []File `json:"files"`
}

type File struct {
	Content string `json:"content"`
}

// ExecuteCode runs a snippet against the Piston API Container.
// In dev the URL defaults to http://localhost:2000 or the local network docker dns http://piston:2000
func ExecuteCode(ctx context.Context, apiURL, language, version, code string) (*ExecutionResult, error) {
	reqBody := PistonRequest{
		Language: language,
		Version:  version, // e.g., "*" for latest or "3.10.0" for python
		Files: []File{
			{Content: code},
		},
	}

	payloadBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal piston request: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	// API endpoint documented by Piston is /api/v2/execute
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("%s/api/v2/execute", apiURL), bytes.NewReader(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("piston request failed: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read piston response body: %w", err)
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("piston API error (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	var result ExecutionResult
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal piston response: %w", err)
	}

	return &result, nil
}
