package models

import "time"

// YouTubeVideoRequest represents the request for video metadata.
type YouTubeVideoRequest struct {
	Input string `json:"input" binding:"required"` // Can be URL or video ID
}

// YouTubeVideoResponse represents the video metadata response.
type YouTubeVideoResponse struct {
	ID          string             `json:"id"`
	Title       string             `json:"title"`
	Description string             `json:"description"`
	Duration    string             `json:"duration"` // ISO 8601 format
	Thumbnails  YouTubeThumbnails  `json:"thumbnails"`
	HasCaptions bool               `json:"hasCaptions"`
	CacheHit    bool               `json:"cacheHit"`
}

// YouTubeThumbnails represents video thumbnail URLs.
type YouTubeThumbnails struct {
	Default string `json:"default"`
	High    string `json:"high"`
}

// YouTubePlaylistRequest represents the request for playlist data.
type YouTubePlaylistRequest struct {
	PlaylistID string `json:"playlistId" binding:"required"`
}

// YouTubePlaylistResponse represents the playlist response.
type YouTubePlaylistResponse struct {
	Items    []YouTubePlaylistItem `json:"items"`
	CacheHit bool                  `json:"cacheHit"`
}

// YouTubePlaylistItem represents a single video in a playlist.
type YouTubePlaylistItem struct {
	VideoID   string `json:"videoId"`
	Title     string `json:"title"`
	Thumbnail string `json:"thumbnail"`
}

// YouTubeCaptionsRequest represents the request for video captions.
type YouTubeCaptionsRequest struct {
	VideoID string `json:"videoId" binding:"required"`
}

// YouTubeCaptionsResponse represents the captions response.
type YouTubeCaptionsResponse struct {
	Captions []YouTubeCaption `json:"captions"`
}

// YouTubeCaption represents a single caption track.
type YouTubeCaption struct {
	ID       string `json:"id"`
	Language string `json:"language"`
	Name     string `json:"name"`
}

// QuotaResponse represents the API quota status.
type QuotaResponse struct {
	Total     int64   `json:"total"`
	Used      int64   `json:"used"`
	Remaining int64   `json:"remaining"`
	Percent   float64 `json:"percent"`
}

// AuthURLResponse represents the OAuth authorization URL response.
type AuthURLResponse struct {
	URL string `json:"url"`
}

// OAuthCallbackRequest represents the OAuth callback request.
type OAuthCallbackRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state"`
}

// OAuthCallbackResponse represents the OAuth callback response.
type OAuthCallbackResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	TokenType    string    `json:"tokenType"`
	Expiry       time.Time `json:"expiry"`
	TokenJSON    string    `json:"tokenJSON"`
}

// ErrorCode represents API error codes.
type ErrorCode string

const (
	ErrorInvalidInput     ErrorCode = "INVALID_INPUT"
	ErrorVideoNotFound    ErrorCode = "VIDEO_NOT_FOUND"
	ErrorQuotaExceeded    ErrorCode = "QUOTA_EXCEEDED"
	ErrorUnauthorized     ErrorCode = "UNAUTHORIZED"
	ErrorPlaylistNotFound ErrorCode = "PLAYLIST_NOT_FOUND"
	ErrorNoCaptions       ErrorCode = "NO_CAPTIONS"
	ErrorAuthConfig       ErrorCode = "AUTH_CONFIG_ERROR"
)

// ErrorResponse represents an API error response.
type ErrorResponse struct {
	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
}
