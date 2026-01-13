package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"vibe-backend/internal/cache"
	"vibe-backend/internal/database"
)

// HealthHandler handles health check endpoints.
type HealthHandler struct {
	db    *database.PostgresDB
	cache *cache.RedisCache
}

// NewHealthHandler creates a new HealthHandler.
func NewHealthHandler(db *database.PostgresDB, cache *cache.RedisCache) *HealthHandler {
	return &HealthHandler{
		db:    db,
		cache: cache,
	}
}

// HealthResponse represents the health check response.
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Version   string            `json:"version,omitempty"`
	Services  map[string]string `json:"services,omitempty"`
}

// Health returns basic health status (for load balancer).
func (h *HealthHandler) Health(c *gin.Context) {
	// #region agent log
	if f, err := os.OpenFile("/Users/xiaozihao/Documents/01_Projects/Work_Code/work/Team_AI/vibe-engineering-playbook/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
		json.NewEncoder(f).Encode(map[string]interface{}{
			"sessionId":    "debug-session",
			"runId":        "startup-debug",
			"hypothesisId": "A,B,C,D,E",
			"location":     "health.go:36",
			"message":      "Health endpoint called",
			"data":         map[string]interface{}{"method": c.Request.Method, "path": c.Request.URL.Path},
			"timestamp":    time.Now().UnixMilli(),
		})
		f.Close()
	}
	// #endregion
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC(),
		Version:   "2026-01-13-v11-root-dockerfile",
	})
}

// Ready returns detailed readiness status (checks dependencies).
func (h *HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	services := make(map[string]string)
	allHealthy := true

	// Check database
	if h.db == nil {
		services["database"] = "unavailable: not connected"
		allHealthy = false
	} else if err := h.db.Ping(ctx); err != nil {
		services["database"] = "unhealthy: " + err.Error()
		allHealthy = false
	} else {
		services["database"] = "healthy"
	}

	// Check Redis
	if h.cache == nil {
		services["cache"] = "unavailable: not connected"
		allHealthy = false
	} else if err := h.cache.Ping(ctx); err != nil {
		services["cache"] = "unhealthy: " + err.Error()
		allHealthy = false
	} else {
		services["cache"] = "healthy"
	}

	status := "ok"
	statusCode := http.StatusOK
	if !allHealthy {
		status = "degraded"
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, HealthResponse{
		Status:    status,
		Timestamp: time.Now().UTC(),
		Services:  services,
	})
}
