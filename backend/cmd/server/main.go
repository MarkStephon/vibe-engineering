package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"vibe-backend/internal/cache"
	"vibe-backend/internal/config"
	"vibe-backend/internal/database"
	"vibe-backend/internal/models"
	"vibe-backend/internal/router"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// #region agent log
func debugLog(location, message string, data map[string]interface{}) {
	logEntry := map[string]interface{}{
		"sessionId":    "debug-session",
		"runId":        "startup-debug",
		"hypothesisId": "A,B,C,D,E",
		"location":     location,
		"message":      message,
		"data":         data,
		"timestamp":    time.Now().UnixMilli(),
	}
	if f, err := os.OpenFile("/Users/xiaozihao/Documents/01_Projects/Work_Code/work/Team_AI/vibe-engineering-playbook/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
		json.NewEncoder(f).Encode(logEntry)
		f.Close()
	}
}

// #endregion

func main() {
	// #region agent log
	debugLog("main.go:22", "main() entry", map[string]interface{}{})
	// #endregion

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		// #region agent log
		debugLog("main.go:27", "config.Load() failed", map[string]interface{}{"error": err.Error()})
		// #endregion
		panic("Failed to load config: " + err.Error())
	}

	// #region agent log
	debugLog("main.go:33", "config loaded", map[string]interface{}{"port": cfg.Port, "env": cfg.Env})
	// #endregion

	// Initialize logger
	log := initLogger(cfg)
	defer log.Sync()

	log.Info("Starting server",
		zap.String("env", cfg.Env),
		zap.String("port", cfg.Port),
	)

	// #region agent log
	debugLog("main.go:42", "logger initialized, starting database connection", map[string]interface{}{"port": cfg.Port})
	// #endregion

	// Initialize database with retry logic
	var db *database.PostgresDB
	var redisCache *cache.RedisCache
	
	// #region agent log
	startTime := time.Now()
	debugLog("main.go:45", "database connection attempt start", map[string]interface{}{"maxRetries": 5, "retryDelay": "2s"})
	// #endregion

	// Try to connect to database with retries
	maxRetries := 5
	retryDelay := 2 * time.Second
	for i := 0; i < maxRetries; i++ {
		// #region agent log
		debugLog("main.go:52", "database connection attempt", map[string]interface{}{"attempt": i + 1, "maxRetries": maxRetries})
		// #endregion
		var err error
		db, err = database.NewPostgres(cfg.DatabaseURL, log)
		if err == nil {
			// #region agent log
			debugLog("main.go:56", "database connected, starting migration", map[string]interface{}{"attempt": i + 1})
			// #endregion
			// Auto-migrate models
			if err := db.DB.AutoMigrate(
				&models.Pomodoro{},
				&models.VideoAnalysis{},
				&models.Chapter{},
				&models.Transcription{},
				&models.KeyPoint{},
			); err != nil {
				// #region agent log
				debugLog("main.go:66", "database migration failed", map[string]interface{}{"error": err.Error()})
				// #endregion
				log.Error("Failed to auto-migrate database", zap.Error(err))
				db.Close()
				db = nil
			} else {
				// #region agent log
				debugLog("main.go:71", "database migration completed", map[string]interface{}{"elapsedMs": time.Since(startTime).Milliseconds()})
				// #endregion
				log.Info("Database migration completed")
				break
			}
		}
		if i < maxRetries-1 {
			// #region agent log
			debugLog("main.go:78", "database connection failed, retrying", map[string]interface{}{"attempt": i + 1, "error": err.Error()})
			// #endregion
			log.Warn("Failed to connect to database, retrying...",
				zap.Error(err),
				zap.Int("attempt", i+1),
				zap.Int("max_retries", maxRetries),
			)
			time.Sleep(retryDelay)
		} else {
			// #region agent log
			debugLog("main.go:87", "database connection failed after all retries", map[string]interface{}{"error": err.Error(), "elapsedMs": time.Since(startTime).Milliseconds()})
			// #endregion
			log.Error("Failed to connect to database after retries, continuing without database",
				zap.Error(err),
			)
		}
	}
	// #region agent log
	redisStartTime := time.Now()
	debugLog("main.go:95", "redis connection attempt start", map[string]interface{}{"maxRetries": 5})
	// #endregion

	// Try to connect to Redis with retries
	for i := 0; i < maxRetries; i++ {
		// #region agent log
		debugLog("main.go:100", "redis connection attempt", map[string]interface{}{"attempt": i + 1})
		// #endregion
		var err error
		redisCache, err = cache.NewRedis(cfg.RedisURL, log)
		if err == nil {
			// #region agent log
			debugLog("main.go:105", "redis connected", map[string]interface{}{"attempt": i + 1, "elapsedMs": time.Since(redisStartTime).Milliseconds()})
			// #endregion
			break
		}
		if i < maxRetries-1 {
			// #region agent log
			debugLog("main.go:110", "redis connection failed, retrying", map[string]interface{}{"attempt": i + 1, "error": err.Error()})
			// #endregion
			log.Warn("Failed to connect to Redis, retrying...",
				zap.Error(err),
				zap.Int("attempt", i+1),
				zap.Int("max_retries", maxRetries),
			)
			time.Sleep(retryDelay)
		} else {
			// #region agent log
			debugLog("main.go:120", "redis connection failed after all retries", map[string]interface{}{"error": err.Error(), "elapsedMs": time.Since(redisStartTime).Milliseconds()})
			// #endregion
			log.Error("Failed to connect to Redis after retries, continuing without Redis",
				zap.Error(err),
			)
		}
	}

	// Setup cleanup
	if db != nil {
		defer func() {
			if err := db.Close(); err != nil {
				log.Error("Error closing database", zap.Error(err))
			}
		}()
	}
	if redisCache != nil {
		defer func() {
			if err := redisCache.Close(); err != nil {
				log.Error("Error closing Redis", zap.Error(err))
			}
		}()
	}

	// #region agent log
	totalStartupTime := time.Since(startTime)
	debugLog("main.go:130", "initializing router", map[string]interface{}{"dbIsNil": db == nil, "cacheIsNil": redisCache == nil, "elapsedMs": totalStartupTime.Milliseconds()})
	// #endregion

	// Initialize router
	r := router.New(cfg, db, redisCache, log)

	// #region agent log
	debugLog("main.go:135", "router initialized", map[string]interface{}{})
	// #endregion

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// #region agent log
	debugLog("main.go:147", "HTTP server created, starting listener", map[string]interface{}{"addr": srv.Addr, "totalStartupMs": time.Since(startTime).Milliseconds()})
	// #endregion

	// Start server in goroutine
	go func() {
		// #region agent log
		debugLog("main.go:152", "HTTP server ListenAndServe() called", map[string]interface{}{"addr": srv.Addr})
		// #endregion
		log.Info("HTTP server listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			// #region agent log
			debugLog("main.go:156", "HTTP server error", map[string]interface{}{"error": err.Error()})
			// #endregion
			log.Fatal("HTTP server error", zap.Error(err))
		}
		// #region agent log
		debugLog("main.go:160", "HTTP server ListenAndServe() exited", map[string]interface{}{})
		// #endregion
	}()

	// #region agent log
	debugLog("main.go:163", "main goroutine waiting for shutdown signal", map[string]interface{}{"totalStartupMs": time.Since(startTime).Milliseconds()})
	// #endregion

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("Server forced to shutdown", zap.Error(err))
	}

	log.Info("Server stopped")
}

// initLogger initializes the Zap logger based on environment.
func initLogger(cfg *config.Config) *zap.Logger {
	var logConfig zap.Config

	if cfg.IsProduction() {
		logConfig = zap.NewProductionConfig()
	} else {
		logConfig = zap.NewDevelopmentConfig()
		logConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	// Set log level
	switch cfg.LogLevel {
	case "debug":
		logConfig.Level.SetLevel(zap.DebugLevel)
	case "info":
		logConfig.Level.SetLevel(zap.InfoLevel)
	case "warn":
		logConfig.Level.SetLevel(zap.WarnLevel)
	case "error":
		logConfig.Level.SetLevel(zap.ErrorLevel)
	}

	log, err := logConfig.Build()
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}

	return log
}
