package models

import (
	"time"

	"gorm.io/gorm"
)

// ErrorCode represents API error codes.
type ErrorCode string

// Common error codes
const (
	ErrRateLimitExceeded ErrorCode = "RATE_LIMIT_EXCEEDED"
	ErrNotFound          ErrorCode = "NOT_FOUND"
	ErrBadRequest        ErrorCode = "BAD_REQUEST"
	ErrUnauthorized      ErrorCode = "UNAUTHORIZED"
	ErrForbidden         ErrorCode = "FORBIDDEN"
	ErrInternalServer    ErrorCode = "INTERNAL_SERVER_ERROR"
)

// Analysis represents a generic analysis record.
// This model is used for demonstrating proper error handling patterns.
type Analysis struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Data      string         `json:"data" gorm:"type:jsonb"` // Generic data field stored as JSONB
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for Analysis model.
func (Analysis) TableName() string {
	return "analyses"
}

// AnalysisResponse represents the API response for a single analysis.
type AnalysisResponse struct {
	ID   string      `json:"id"`
	Data interface{} `json:"data"`
}

// ErrorResponse represents a standard error response.
type ErrorResponse struct {
	Code      ErrorCode `json:"code"`
	Message   string    `json:"message"`
	RequestID string    `json:"request_id,omitempty"`
}
