package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// RedisCache wraps the Redis client.
type RedisCache struct {
	client *redis.Client
	log    *zap.Logger
}

// NewRedis creates a new Redis client from the given URL.
func NewRedis(redisURL string, log *zap.Logger) (*RedisCache, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}

	// Set timeouts - fail fast to avoid blocking deployment
	opts.DialTimeout = 5 * time.Second   // Connection timeout
	opts.ReadTimeout = 5 * time.Second   // Read timeout
	opts.WriteTimeout = 5 * time.Second  // Write timeout
	opts.PoolTimeout = 10 * time.Second  // Pool timeout

	client := redis.NewClient(opts)

	// Verify connection with short timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		return nil, err
	}

	log.Info("Redis connection established")

	return &RedisCache{
		client: client,
		log:    log,
	}, nil
}

// Client returns the underlying Redis client.
func (r *RedisCache) Client() *redis.Client {
	return r.client
}

// Ping verifies the Redis connection is alive.
func (r *RedisCache) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// Close closes the Redis connection.
func (r *RedisCache) Close() error {
	return r.client.Close()
}

// Set stores a key-value pair with expiration.
func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value by key.
func (r *RedisCache) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

// Delete removes a key.
func (r *RedisCache) Delete(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists checks if a key exists.
func (r *RedisCache) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.client.Exists(ctx, keys...).Result()
}
