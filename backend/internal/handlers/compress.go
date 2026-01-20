package handlers

import (
	"net/http"

	"vibe-backend/internal/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// CompressHandler handles image compression requests.
type CompressHandler struct {
	imageService *services.ImageService
	log          *zap.Logger
}

// NewCompressHandler creates a new CompressHandler.
func NewCompressHandler(imageService *services.ImageService, log *zap.Logger) *CompressHandler {
	return &CompressHandler{
		imageService: imageService,
		log:          log,
	}
}

// CompressRequest represents the request for image compression.
type CompressRequest struct {
	MaxWidth  *int     `form:"maxWidth"`
	MaxHeight *int     `form:"maxHeight"`
	Quality   *float64 `form:"quality"`
}

// CompressResponse represents the response for image compression.
type CompressResponse struct {
	Success         bool   `json:"success"`
	Message         string `json:"message"`
	CompressedImage string `json:"compressedImage,omitempty"`
	OriginalSize    int64  `json:"originalSize,omitempty"`
	CompressedSize  int64  `json:"compressedSize,omitempty"`
}

// ErrorResponse represents an error response.
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// Compress handles POST /api/compress requests.
func (h *CompressHandler) Compress(c *gin.Context) {
	requestID := c.GetString("request_id")

	// Parse form data
	var req CompressRequest
	if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request",
			zap.Error(err),
			zap.String("request_id", requestID),
		)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request parameters: " + err.Error(),
		})
		return
	}

	// Get uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		h.log.Error("Failed to get uploaded file",
			zap.Error(err),
			zap.String("request_id", requestID),
		)
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "No image file provided or invalid file upload",
		})
		return
	}

	h.log.Info("Compress request received",
		zap.String("filename", file.Filename),
		zap.Int64("size", file.Size),
		zap.String("request_id", requestID),
	)

	// Set default quality if not provided
	quality := 0.8
	if req.Quality != nil {
		quality = *req.Quality
	}

	// Process the image
	options := services.ProcessOptions{
		MaxWidth:  req.MaxWidth,
		MaxHeight: req.MaxHeight,
		Quality:   quality,
	}

	result, err := h.imageService.ProcessImage(file, options)
	if err != nil {
		h.handleCompressError(c, err, requestID)
		return
	}

	// Return success response
	c.JSON(http.StatusOK, CompressResponse{
		Success:         true,
		Message:         "图片压缩成功",
		CompressedImage: result.CompressedImage,
		OriginalSize:    result.OriginalSize,
		CompressedSize:  result.CompressedSize,
	})
}

// handleCompressError handles compression errors and returns appropriate HTTP responses.
func (h *CompressHandler) handleCompressError(c *gin.Context, err error, requestID string) {
	h.log.Error("Compress error",
		zap.Error(err),
		zap.String("request_id", requestID),
	)

	switch err {
	case services.ErrInvalidImageFormat:
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "不支持的图片格式，仅支持 JPEG、PNG 和 GIF 格式",
		})
	case services.ErrFileTooLarge:
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "文件过大，最大支持 10MB",
		})
	default:
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "图片处理失败，请稍后重试",
		})
	}
}
