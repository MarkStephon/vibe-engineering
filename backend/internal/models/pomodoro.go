package models

import (
	"time"

	"gorm.io/gorm"
)

// Pomodoro represents a pomodoro session.
type Pomodoro struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"index;not null"`
	Title       string         `json:"title" gorm:"type:varchar(255)"`
	StartTime   time.Time      `json:"start_time"`
	EndTime     *time.Time     `json:"end_time"`
	Duration    int            `json:"duration" gorm:"default:25"` // in minutes
	IsCompleted bool           `json:"is_completed" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for Pomodoro model.
func (Pomodoro) TableName() string {
	return "pomodoros"
}

// CreatePomodoroRequest represents the request body for creating a pomodoro.
type CreatePomodoroRequest struct {
	Title    string `json:"title" binding:"required,max=255"`
	Duration int    `json:"duration" binding:"required,min=1,max=120"`
}

// UpdatePomodoroRequest represents the request body for updating a pomodoro.
type UpdatePomodoroRequest struct {
	Title       *string `json:"title" binding:"omitempty,max=255"`
	IsCompleted *bool   `json:"is_completed"`
}

// PomodoroResponse represents the response for a pomodoro.
type PomodoroResponse struct {
	ID          uint       `json:"id"`
	UserID      uint       `json:"user_id"`
	Title       string     `json:"title"`
	StartTime   time.Time  `json:"start_time"`
	EndTime     *time.Time `json:"end_time,omitempty"`
	Duration    int        `json:"duration"`
	IsCompleted bool       `json:"is_completed"`
	CreatedAt   time.Time  `json:"created_at"`
}

// ToResponse converts a Pomodoro to PomodoroResponse.
func (p *Pomodoro) ToResponse() *PomodoroResponse {
	return &PomodoroResponse{
		ID:          p.ID,
		UserID:      p.UserID,
		Title:       p.Title,
		StartTime:   p.StartTime,
		EndTime:     p.EndTime,
		Duration:    p.Duration,
		IsCompleted: p.IsCompleted,
		CreatedAt:   p.CreatedAt,
	}
}
