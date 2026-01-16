package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"vibe-backend/internal/models"
)

// RateLimitConfig holds the configuration for rate limiting.
type RateLimitConfig struct {
	// MaxRequests is the maximum number of requests allowed per window.
	MaxRequests int
	// Window is the time window for rate limiting.
	Window time.Duration
	// CleanupInterval is how often to clean up old entries.
	CleanupInterval time.Duration
}

// DefaultRateLimitConfig returns the default rate limit configuration.
func DefaultRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		MaxRequests:     10,
		Window:          time.Minute,
		CleanupInterval: 5 * time.Minute,
	}
}

// rateLimitEntry tracks request count for a client.
type rateLimitEntry struct {
	count     int
	resetTime time.Time
}

// rateLimiter implements an in-memory rate limiter.
type rateLimiter struct {
	config  RateLimitConfig
	entries map[string]*rateLimitEntry
	mu      sync.RWMutex
}

// newRateLimiter creates a new rate limiter with the given configuration.
func newRateLimiter(config RateLimitConfig) *rateLimiter {
	rl := &rateLimiter{
		config:  config,
		entries: make(map[string]*rateLimitEntry),
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

// cleanup removes expired entries periodically.
func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(rl.config.CleanupInterval)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, entry := range rl.entries {
			if now.After(entry.resetTime) {
				delete(rl.entries, key)
			}
		}
		rl.mu.Unlock()
	}
}

// allow checks if a request from the given key should be allowed.
func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	entry, exists := rl.entries[key]

	if !exists || now.After(entry.resetTime) {
		// Create new entry or reset expired entry
		rl.entries[key] = &rateLimitEntry{
			count:     1,
			resetTime: now.Add(rl.config.Window),
		}
		return true
	}

	if entry.count >= rl.config.MaxRequests {
		return false
	}

	entry.count++
	return true
}

// RateLimit returns a Gin middleware that limits requests per IP.
func RateLimit(config RateLimitConfig) gin.HandlerFunc {
	limiter := newRateLimiter(config)

	return func(c *gin.Context) {
		key := c.ClientIP()

		if !limiter.allow(key) {
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Code:      models.ErrRateLimitExceeded,
				Message:   "请求过于频繁，请稍后再试",
				RequestID: c.GetString("request_id"),
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ShareAccessRateLimit returns a rate limiter specifically for share access.
// More strict to prevent brute-force attacks on password-protected shares.
func ShareAccessRateLimit() gin.HandlerFunc {
	config := RateLimitConfig{
		MaxRequests:     5,               // 5 requests per minute per IP
		Window:          time.Minute,
		CleanupInterval: 5 * time.Minute,
	}
	return RateLimit(config)
}
