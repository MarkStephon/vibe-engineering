package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PomodoroHandler handles pomodoro-related HTTP requests.
type PomodoroHandler struct {
	repo *repository.PomodoroRepository
}

// NewPomodoroHandler creates a new PomodoroHandler.
func NewPomodoroHandler(repo *repository.PomodoroRepository) *PomodoroHandler {
	return &PomodoroHandler{repo: repo}
}

// ErrorResponse represents an error response.
type ErrorResponse struct {
	Error     string `json:"error"`
	RequestID string `json:"request_id,omitempty"`
}

// Create creates a new pomodoro.
// POST /api/pomodoros
func (h *PomodoroHandler) Create(c *gin.Context) {
	var req models.CreatePomodoroRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     err.Error(),
			RequestID: c.GetString("request_id"),
		})
		return
	}

	// TODO: Get user ID from JWT token (for now, use a placeholder)
	//
	userID := uint(1)

	pomodoro := &models.Pomodoro{
		UserID:    userID,
		Title:     req.Title,
		Duration:  req.Duration,
		StartTime: time.Now().UTC(),
	}

	if err := h.repo.Create(c.Request.Context(), pomodoro); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to create pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusCreated, pomodoro.ToResponse())
}

// List returns all pomodoros for the current user.
// GET /api/pomodoros
func (h *PomodoroHandler) List(c *gin.Context) {
	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Parse pagination params
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	if limit > 100 {
		limit = 100
	}

	pomodoros, err := h.repo.GetByUserID(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to fetch pomodoros",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	// Convert to response
	response := make([]*models.PomodoroResponse, len(pomodoros))
	for i, p := range pomodoros {
		response[i] = p.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   response,
		"limit":  limit,
		"offset": offset,
	})
}

// Get returns a single pomodoro by ID.
// GET /api/pomodoros/:id
func (h *PomodoroHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     "Invalid pomodoro ID",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	pomodoro, err := h.repo.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Error:     "Pomodoro not found",
				RequestID: c.GetString("request_id"),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to fetch pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, pomodoro.ToResponse())
}

// Update updates a pomodoro.
// PATCH /api/pomodoros/:id
func (h *PomodoroHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     "Invalid pomodoro ID",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	var req models.UpdatePomodoroRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     err.Error(),
			RequestID: c.GetString("request_id"),
		})
		return
	}

	pomodoro, err := h.repo.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Error:     "Pomodoro not found",
				RequestID: c.GetString("request_id"),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to fetch pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	// Apply updates
	if req.Title != nil {
		pomodoro.Title = *req.Title
	}
	if req.IsCompleted != nil {
		pomodoro.IsCompleted = *req.IsCompleted
		if *req.IsCompleted {
			now := time.Now().UTC()
			pomodoro.EndTime = &now
		}
	}

	if err := h.repo.Update(c.Request.Context(), pomodoro); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to update pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, pomodoro.ToResponse())
}

// Delete deletes a pomodoro.
// DELETE /api/pomodoros/:id
func (h *PomodoroHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     "Invalid pomodoro ID",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to delete pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

// Complete marks a pomodoro as completed.
// POST /api/pomodoros/:id/complete
func (h *PomodoroHandler) Complete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:     "Invalid pomodoro ID",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	pomodoro, err := h.repo.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, ErrorResponse{
				Error:     "Pomodoro not found",
				RequestID: c.GetString("request_id"),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to fetch pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	now := time.Now().UTC()
	pomodoro.IsCompleted = true
	pomodoro.EndTime = &now

	if err := h.repo.Update(c.Request.Context(), pomodoro); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error:     "Failed to complete pomodoro",
			RequestID: c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, pomodoro.ToResponse())
}
