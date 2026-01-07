package repository

import (
	"context"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// PomodoroRepository handles database operations for pomodoros.
type PomodoroRepository struct {
	db *gorm.DB
}

// NewPomodoroRepository creates a new PomodoroRepository.
func NewPomodoroRepository(db *gorm.DB) *PomodoroRepository {
	return &PomodoroRepository{db: db}
}

// Create creates a new pomodoro.
func (r *PomodoroRepository) Create(ctx context.Context, pomodoro *models.Pomodoro) error {
	return r.db.WithContext(ctx).Create(pomodoro).Error
}

// GetByID returns a pomodoro by ID.
func (r *PomodoroRepository) GetByID(ctx context.Context, id uint) (*models.Pomodoro, error) {
	var pomodoro models.Pomodoro
	err := r.db.WithContext(ctx).First(&pomodoro, id).Error
	if err != nil {
		return nil, err
	}
	return &pomodoro, nil
}

// GetByUserID returns all pomodoros for a user.
func (r *PomodoroRepository) GetByUserID(ctx context.Context, userID uint, limit, offset int) ([]models.Pomodoro, error) {
	var pomodoros []models.Pomodoro
	query := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&pomodoros).Error
	return pomodoros, err
}

// Update updates a pomodoro.
func (r *PomodoroRepository) Update(ctx context.Context, pomodoro *models.Pomodoro) error {
	return r.db.WithContext(ctx).Save(pomodoro).Error
}

// Delete soft deletes a pomodoro.
func (r *PomodoroRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Pomodoro{}, id).Error
}

// CountByUserID returns the count of pomodoros for a user.
func (r *PomodoroRepository) CountByUserID(ctx context.Context, userID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Pomodoro{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// GetCompletedByUserID returns completed pomodoros for a user.
func (r *PomodoroRepository) GetCompletedByUserID(ctx context.Context, userID uint) ([]models.Pomodoro, error) {
	var pomodoros []models.Pomodoro
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND is_completed = ?", userID, true).
		Order("created_at DESC").
		Find(&pomodoros).Error
	return pomodoros, err
}
