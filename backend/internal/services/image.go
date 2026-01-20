package services

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"strings"

	"go.uber.org/zap"
	"golang.org/x/image/draw"
)

var (
	// ErrInvalidImageFormat is returned when the image format is not supported.
	ErrInvalidImageFormat = errors.New("invalid image format: only JPEG, PNG, and GIF are supported")
	// ErrFileTooLarge is returned when the file size exceeds the limit.
	ErrFileTooLarge = errors.New("file too large: maximum size is 10MB")
	// ErrProcessingFailed is returned when image processing fails.
	ErrProcessingFailed = errors.New("image processing failed")
)

const (
	// MaxFileSize is the maximum allowed file size (10MB)
	MaxFileSize = 10 * 1024 * 1024
)

// ImageService handles image compression and resizing operations.
type ImageService struct {
	log *zap.Logger
}

// NewImageService creates a new ImageService.
func NewImageService(log *zap.Logger) *ImageService {
	return &ImageService{log: log}
}

// ProcessOptions contains options for image processing.
type ProcessOptions struct {
	MaxWidth  *int
	MaxHeight *int
	Quality   float64
}

// ProcessResult contains the result of image processing.
type ProcessResult struct {
	CompressedImage string
	OriginalSize    int64
	CompressedSize  int64
	Format          string
}

// ProcessImage processes an uploaded image with compression and/or resizing.
func (s *ImageService) ProcessImage(file *multipart.FileHeader, options ProcessOptions) (*ProcessResult, error) {
	// Validate file size
	if file.Size > MaxFileSize {
		return nil, ErrFileTooLarge
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		s.log.Error("Failed to open uploaded file", zap.Error(err))
		return nil, ErrProcessingFailed
	}
	defer src.Close()

	// Read the file content
	fileData, err := io.ReadAll(src)
	if err != nil {
		s.log.Error("Failed to read file data", zap.Error(err))
		return nil, ErrProcessingFailed
	}

	// Detect image format and decode
	img, format, err := image.Decode(bytes.NewReader(fileData))
	if err != nil {
		s.log.Error("Failed to decode image", zap.Error(err))
		return nil, ErrInvalidImageFormat
	}

	// Validate format
	format = strings.ToLower(format)
	if format != "jpeg" && format != "png" && format != "gif" {
		return nil, ErrInvalidImageFormat
	}

	s.log.Info("Processing image",
		zap.String("format", format),
		zap.Int64("original_size", file.Size),
		zap.Int("width", img.Bounds().Dx()),
		zap.Int("height", img.Bounds().Dy()),
	)

	// Resize if needed
	processedImg := img
	if options.MaxWidth != nil || options.MaxHeight != nil {
		processedImg = s.resizeImage(img, options.MaxWidth, options.MaxHeight)
	}

	// Compress and encode
	var buf bytes.Buffer
	if err := s.encodeImage(&buf, processedImg, format, options.Quality); err != nil {
		s.log.Error("Failed to encode image", zap.Error(err))
		return nil, ErrProcessingFailed
	}

	// Convert to base64
	compressedData := buf.Bytes()
	base64Data := base64.StdEncoding.EncodeToString(compressedData)
	dataURL := fmt.Sprintf("data:image/%s;base64,%s", format, base64Data)

	result := &ProcessResult{
		CompressedImage: dataURL,
		OriginalSize:    file.Size,
		CompressedSize:  int64(len(compressedData)),
		Format:          format,
	}

	s.log.Info("Image processed successfully",
		zap.Int64("original_size", result.OriginalSize),
		zap.Int64("compressed_size", result.CompressedSize),
		zap.Float64("compression_ratio", float64(result.OriginalSize-result.CompressedSize)/float64(result.OriginalSize)*100),
	)

	return result, nil
}

// resizeImage resizes an image while maintaining aspect ratio.
func (s *ImageService) resizeImage(img image.Image, maxWidth, maxHeight *int) image.Image {
	bounds := img.Bounds()
	currentWidth := bounds.Dx()
	currentHeight := bounds.Dy()

	// If no constraints, return original
	if maxWidth == nil && maxHeight == nil {
		return img
	}

	// Calculate new dimensions
	newWidth := currentWidth
	newHeight := currentHeight

	if maxWidth != nil && currentWidth > *maxWidth {
		ratio := float64(*maxWidth) / float64(currentWidth)
		newWidth = *maxWidth
		newHeight = int(float64(currentHeight) * ratio)
	}

	if maxHeight != nil && newHeight > *maxHeight {
		ratio := float64(*maxHeight) / float64(newHeight)
		newHeight = *maxHeight
		newWidth = int(float64(newWidth) * ratio)
	}

	// If no resize needed, return original
	if newWidth == currentWidth && newHeight == currentHeight {
		return img
	}

	s.log.Info("Resizing image",
		zap.Int("from_width", currentWidth),
		zap.Int("from_height", currentHeight),
		zap.Int("to_width", newWidth),
		zap.Int("to_height", newHeight),
	)

	// Create new image
	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

	// Resize using Catmull-Rom interpolation for high quality
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, img.Bounds(), draw.Over, nil)

	return dst
}

// encodeImage encodes an image to the specified format with quality settings.
func (s *ImageService) encodeImage(w io.Writer, img image.Image, format string, quality float64) error {
	// Ensure quality is in valid range
	if quality < 0 {
		quality = 0
	}
	if quality > 1 {
		quality = 1
	}

	switch format {
	case "jpeg":
		// JPEG quality: 1-100
		jpegQuality := int(quality * 100)
		if jpegQuality < 1 {
			jpegQuality = 1
		}
		if jpegQuality > 100 {
			jpegQuality = 100
		}
		return jpeg.Encode(w, img, &jpeg.Options{Quality: jpegQuality})

	case "png":
		// PNG compression (quality doesn't directly apply, but we use default encoder)
		encoder := png.Encoder{CompressionLevel: png.DefaultCompression}
		return encoder.Encode(w, img)

	case "gif":
		// GIF encoding (quality doesn't apply)
		return gif.Encode(w, img, nil)

	default:
		return ErrInvalidImageFormat
	}
}
