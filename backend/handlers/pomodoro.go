package handlers

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"your-project/models"
)

type PomodoroHandler struct {
	DB *gorm.DB
}

func (h *PomodoroHandler) CreatePomodoro(c *gin.Context) {
	var pomodoro models.Pomodoro
	if err := c.ShouldBindJSON(&pomodoro); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := h.DB.Create(&pomodoro)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, pomodoro)
}

func (h *PomodoroHandler) GetPomodoros(c *gin.Context) {
	var pomodoros []models.Pomodoro
	result := h.DB.Find(&pomodoros)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, pomodoros)
}