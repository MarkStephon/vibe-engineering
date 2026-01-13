package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strings"

	"go.uber.org/zap"
)

// TranscriptService handles YouTube transcript extraction.
type TranscriptService struct {
	log *zap.Logger
}

// NewTranscriptService creates a new TranscriptService.
func NewTranscriptService(log *zap.Logger) *TranscriptService {
	return &TranscriptService{
		log: log,
	}
}

// TranscriptSegment represents a single transcript segment.
type TranscriptSegment struct {
	Start string `json:"start"`
	End   string `json:"end"`
	Text  string `json:"text"`
}

// TranscriptResponse represents the transcript API response.
type TranscriptResponse struct {
	VideoID     string              `json:"videoId"`
	Title       string              `json:"title"`
	Author      string              `json:"author"`
	Duration    string              `json:"duration"`
	Transcripts []TranscriptSegment `json:"transcripts"`
}

// ExtractVideoID extracts YouTube video ID from URL or returns the ID if already provided.
func ExtractVideoID(input string) (string, error) {
	// If input is already a video ID (11 characters, alphanumeric)
	if matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]{11}$`, input); matched {
		return input, nil
	}

	// Extract from various YouTube URL formats
	patterns := []string{
		`(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})`,
		`youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(input)
		if len(matches) > 1 {
			return matches[1], nil
		}
	}

	return "", fmt.Errorf("invalid YouTube URL or video ID: %s", input)
}

// GetTranscript fetches transcript using yt-dlp with multiple fallback methods.
func (s *TranscriptService) GetTranscript(ctx context.Context, input string) (*TranscriptResponse, error) {
	// Extract video ID
	videoID, err := ExtractVideoID(input)
	if err != nil {
		return nil, err
	}

	s.log.Info("Fetching transcript",
		zap.String("video_id", videoID),
	)

	// Step 1: Get video metadata
	metadata, err := s.getVideoMetadata(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video metadata: %w", err)
	}

	// Step 2: Try multiple methods to get subtitles
	// Method 1: Try to get subtitles using yt-dlp --write-auto-sub with json3 format
	segments, err := s.getSubtitlesMethod1(ctx, videoID)
	if err == nil && len(segments) > 0 {
		s.log.Info("Successfully fetched subtitles using method 1 (json3)",
			zap.String("video_id", videoID),
			zap.Int("segments", len(segments)),
		)
		return &TranscriptResponse{
			VideoID:     videoID,
			Title:       metadata.Title,
			Author:      metadata.Uploader,
			Duration:    formatDuration(metadata.Duration),
			Transcripts: segments,
		}, nil
	}
	s.log.Warn("Method 1 failed, trying method 2",
		zap.String("video_id", videoID),
		zap.Error(err),
	)

	// Method 2: Download subtitle file directly (VTT format)
	segments, err = s.getSubtitlesMethod2(ctx, videoID)
	if err == nil && len(segments) > 0 {
		s.log.Info("Successfully fetched subtitles using method 2 (VTT download)",
			zap.String("video_id", videoID),
			zap.Int("segments", len(segments)),
		)
		return &TranscriptResponse{
			VideoID:     videoID,
			Title:       metadata.Title,
			Author:      metadata.Uploader,
			Duration:    formatDuration(metadata.Duration),
			Transcripts: segments,
		}, nil
	}
	s.log.Warn("Method 2 failed, trying method 3",
		zap.String("video_id", videoID),
		zap.Error(err),
	)

	// Method 3: Use yt-dlp to list available subtitles and download the best one
	segments, err = s.getSubtitlesMethod3(ctx, videoID)
	if err == nil && len(segments) > 0 {
		s.log.Info("Successfully fetched subtitles using method 3 (list and download)",
			zap.String("video_id", videoID),
			zap.Int("segments", len(segments)),
		)
		return &TranscriptResponse{
			VideoID:     videoID,
			Title:       metadata.Title,
			Author:      metadata.Uploader,
			Duration:    formatDuration(metadata.Duration),
			Transcripts: segments,
		}, nil
	}
	s.log.Warn("Method 3 failed, trying method 4",
		zap.String("video_id", videoID),
		zap.Error(err),
	)

	// Method 4: Try to get subtitles using --write-subs (manual subtitles) instead of --write-auto-sub
	segments, err = s.getSubtitlesMethod4(ctx, videoID)
	if err == nil && len(segments) > 0 {
		s.log.Info("Successfully fetched subtitles using method 4 (manual subs)",
			zap.String("video_id", videoID),
			zap.Int("segments", len(segments)),
		)
		return &TranscriptResponse{
			VideoID:     videoID,
			Title:       metadata.Title,
			Author:      metadata.Uploader,
			Duration:    formatDuration(metadata.Duration),
			Transcripts: segments,
		}, nil
	}

	// All methods failed
	s.log.Error("All subtitle extraction methods failed",
		zap.String("video_id", videoID),
	)
	return nil, fmt.Errorf("无法获取该视频的字幕。可能原因：1) 视频没有字幕 2) 字幕功能被禁用 3) 视频不可访问")
}

// getVideoMetadata fetches video metadata using yt-dlp.
func (s *TranscriptService) getVideoMetadata(ctx context.Context, videoID string) (struct {
	Title    string `json:"title"`
	Uploader string `json:"uploader"`
	Duration int    `json:"duration"`
}, error) {
	var metadata struct {
		Title    string `json:"title"`
		Uploader string `json:"uploader"`
		Duration int    `json:"duration"`
	}

	cmd := exec.CommandContext(ctx,
		"yt-dlp",
		"--dump-json",
		"--no-warnings",
		"--skip-download",
		"--no-playlist",
		fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
	)

	output, err := cmd.Output()
	if err != nil {
		return metadata, fmt.Errorf("yt-dlp metadata extraction failed: %w", err)
	}

	if err := json.Unmarshal(output, &metadata); err != nil {
		return metadata, fmt.Errorf("failed to parse metadata: %w", err)
	}

	return metadata, nil
}

// getSubtitlesMethod1: Try json3 format with --write-auto-sub
func (s *TranscriptService) getSubtitlesMethod1(ctx context.Context, videoID string) ([]TranscriptSegment, error) {
	// Try json3 format first
	cmd := exec.CommandContext(ctx,
		"yt-dlp",
		"--write-auto-sub",
		"--sub-lang", "en,zh-Hans,zh-Hant,zh,en-US,en-GB",
		"--sub-format", "json3",
		"--skip-download",
		"--no-warnings",
		"--no-playlist",
		"--output", fmt.Sprintf("/tmp/%%(id)s.%%(lang)s.%%(ext)s"),
		fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
	)

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("failed to download json3 subtitle: %w", err)
	}

	// Try to find and read json3 files
	languages := []string{"en", "zh-Hans", "zh-Hant", "zh", "en-US", "en-GB"}
	for _, lang := range languages {
		json3Path := fmt.Sprintf("/tmp/%s.%s.json3", videoID, lang)
		content, err := os.ReadFile(json3Path)
		if err == nil {
			// Parse JSON3 format
			segments := s.parseSubtitleOutput(string(content))
			if len(segments) > 0 {
				return segments, nil
			}
		}
	}

	// If json3 not found, yt-dlp might have downloaded VTT instead
	// Try to parse VTT files as fallback within method1
	// yt-dlp may save files as: videoID.NA.lang.vtt or videoID.lang.vtt
	var lastErr error
	for _, lang := range languages {
		// Try different filename patterns that yt-dlp might use
		patterns := []string{
			fmt.Sprintf("/tmp/%s.NA.%s.vtt", videoID, lang), // Most common: videoID.NA.lang.vtt
			fmt.Sprintf("/tmp/%s.%s.vtt", videoID, lang),
			fmt.Sprintf("/tmp/%s.vtt", videoID),
		}
		
		for _, vttPath := range patterns {
			segments, err := s.parseVTTFile(vttPath)
			if err == nil && len(segments) > 0 {
				s.log.Info("Found VTT subtitle in method1 fallback",
					zap.String("video_id", videoID),
					zap.String("lang", lang),
					zap.String("path", vttPath),
					zap.Int("segments", len(segments)),
				)
				return segments, nil
			}
			if err != nil {
				lastErr = err
				s.log.Debug("Failed to parse VTT file",
					zap.String("path", vttPath),
					zap.Error(err),
				)
			}
		}
	}

	// If we got here, no valid subtitle files were found
	s.log.Warn("Method1: No json3 or vtt subtitle files found",
		zap.String("video_id", videoID),
		zap.Error(lastErr),
	)
	return nil, fmt.Errorf("no json3 or vtt subtitle files found: %v", lastErr)
}

// getSubtitlesMethod2: Download VTT file directly (most reliable method)
func (s *TranscriptService) getSubtitlesMethod2(ctx context.Context, videoID string) ([]TranscriptSegment, error) {
	// Languages to try in order
	languages := []string{"en", "zh-Hans", "zh-Hant", "zh", "en-US", "en-GB", "auto"}
	
	for _, lang := range languages {
		cmd := exec.CommandContext(ctx,
			"yt-dlp",
			"--write-auto-sub",
			"--sub-lang", lang,
			"--sub-format", "vtt",
			"--skip-download",
			"--no-warnings",
			"--no-playlist",
			"--output", fmt.Sprintf("/tmp/%%(id)s.%%(lang)s.%%(ext)s"),
			fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
		)

		// Capture stderr to check for errors
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			s.log.Debug("Failed to download subtitle for language",
				zap.String("lang", lang),
				zap.Error(err),
			)
			continue
		}

		// Try different filename patterns that yt-dlp might use
		patterns := []string{
			fmt.Sprintf("/tmp/%s.%s.vtt", videoID, lang),
			fmt.Sprintf("/tmp/%s.NA.%s.vtt", videoID, lang), // yt-dlp sometimes adds .NA.
			fmt.Sprintf("/tmp/%s.vtt", videoID),
			fmt.Sprintf("/tmp/%s.en.vtt", videoID),
		}

		for _, vttPath := range patterns {
			segments, err := s.parseVTTFile(vttPath)
			if err == nil && len(segments) > 0 {
				s.log.Info("Successfully parsed VTT subtitle",
					zap.String("video_id", videoID),
					zap.String("lang", lang),
					zap.String("path", vttPath),
					zap.Int("segments", len(segments)),
				)
				return segments, nil
			}
		}
	}

	return nil, fmt.Errorf("failed to download and parse VTT subtitles")
}

// getSubtitlesMethod3: List available subtitles and download the best one
func (s *TranscriptService) getSubtitlesMethod3(ctx context.Context, videoID string) ([]TranscriptSegment, error) {
	// First, list available subtitles
	listCmd := exec.CommandContext(ctx,
		"yt-dlp",
		"--list-subs",
		"--skip-download",
		"--no-warnings",
		"--no-playlist",
		fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
	)

	listOutput, err := listCmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to list subtitles: %w", err)
	}

	// Parse available languages from output
	availableLangs := s.parseAvailableLanguages(string(listOutput))
	if len(availableLangs) == 0 {
		return nil, fmt.Errorf("no subtitles available")
	}

	// Try each available language
	for _, lang := range availableLangs {
		outputPath := fmt.Sprintf("/tmp/%s.%s.vtt", videoID, lang)
		cmd := exec.CommandContext(ctx,
			"yt-dlp",
			"--write-auto-sub",
			"--sub-lang", lang,
			"--sub-format", "vtt",
			"--skip-download",
			"--no-warnings",
			"--no-playlist",
			"--output", fmt.Sprintf("/tmp/%%(id)s.%%(lang)s.%%(ext)s"),
			fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
		)

		if err := cmd.Run(); err != nil {
			continue
		}

		segments, err := s.parseVTTFile(outputPath)
		if err == nil && len(segments) > 0 {
			return segments, nil
		}
	}

	return nil, fmt.Errorf("failed to download subtitles from available languages")
}

// getSubtitlesMethod4: Try manual subtitles (--write-subs instead of --write-auto-sub)
func (s *TranscriptService) getSubtitlesMethod4(ctx context.Context, videoID string) ([]TranscriptSegment, error) {
	languages := []string{"en", "zh-Hans", "zh-Hant", "zh", "en-US", "en-GB"}
	
	for _, lang := range languages {
		outputPath := fmt.Sprintf("/tmp/%s.%s.vtt", videoID, lang)
		cmd := exec.CommandContext(ctx,
			"yt-dlp",
			"--write-subs", // Manual subtitles instead of auto-generated
			"--sub-lang", lang,
			"--sub-format", "vtt",
			"--skip-download",
			"--no-warnings",
			"--no-playlist",
			"--output", fmt.Sprintf("/tmp/%%(id)s.%%(lang)s.%%(ext)s"),
			fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID),
		)

		if err := cmd.Run(); err != nil {
			continue
		}

		segments, err := s.parseVTTFile(outputPath)
		if err == nil && len(segments) > 0 {
			return segments, nil
		}
	}

	return nil, fmt.Errorf("failed to download manual subtitles")
}

// parseAvailableLanguages extracts available language codes from yt-dlp --list-subs output
func (s *TranscriptService) parseAvailableLanguages(output string) []string {
	var langs []string
	lines := strings.Split(output, "\n")
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		// Look for lines like "Language Name (lang_code)"
		re := regexp.MustCompile(`\(([a-z-]+)\)`)
		matches := re.FindStringSubmatch(line)
		if len(matches) >= 2 {
			lang := matches[1]
			// Avoid duplicates
			found := false
			for _, existing := range langs {
				if existing == lang {
					found = true
					break
				}
			}
			if !found {
				langs = append(langs, lang)
			}
		}
	}
	
	return langs
}

// parseSubtitleOutput parses yt-dlp subtitle output (JSON3 format).
func (s *TranscriptService) parseSubtitleOutput(output string) []TranscriptSegment {
	// Clean the output - remove any non-JSON content
	output = strings.TrimSpace(output)
	
	// Try to find JSON content in the output
	jsonStart := strings.Index(output, "{")
	if jsonStart > 0 {
		output = output[jsonStart:]
	}
	
	// Try to find the last valid JSON object
	jsonEnd := strings.LastIndex(output, "}")
	if jsonEnd > 0 && jsonEnd < len(output)-1 {
		output = output[:jsonEnd+1]
	}

	// Parse JSON3 format from yt-dlp
	var data struct {
		Events []struct {
			TStartMs    int `json:"tStartMs"`
			DDurationMs int `json:"dDurationMs"`
			Segs        []struct {
				Utf8 string `json:"utf8"`
			} `json:"segs"`
		} `json:"events"`
	}

	if err := json.Unmarshal([]byte(output), &data); err != nil {
		s.log.Warn("Failed to parse JSON3 subtitle format",
			zap.Error(err),
			zap.String("output_preview", func() string {
				if len(output) > 200 {
					return output[:200]
				}
				return output
			}()),
		)
		return []TranscriptSegment{}
	}

	if len(data.Events) == 0 {
		s.log.Warn("No events found in subtitle JSON")
		return []TranscriptSegment{}
	}

	segments := make([]TranscriptSegment, 0, len(data.Events))
	for _, event := range data.Events {
		if len(event.Segs) == 0 {
			continue
		}

		// Combine all text segments
		var text strings.Builder
		for _, seg := range event.Segs {
			if seg.Utf8 != "" {
				text.WriteString(seg.Utf8)
			}
		}

		textStr := strings.TrimSpace(text.String())
		if textStr == "" {
			continue
		}

		// Convert milliseconds to HH:MM:SS format
		startMs := event.TStartMs
		endMs := startMs + event.DDurationMs

		segments = append(segments, TranscriptSegment{
			Start: formatTimestamp(startMs),
			End:   formatTimestamp(endMs),
			Text:  textStr,
		})
	}

	return segments
}

// parseVTTFile parses WebVTT subtitle file.
func (s *TranscriptService) parseVTTFile(filePath string) ([]TranscriptSegment, error) {
	// Use os.ReadFile instead of cat command for better cross-platform support
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read VTT file: %w", err)
	}

	contentStr := string(content)
	lines := strings.Split(contentStr, "\n")

	var segments []TranscriptSegment
	var currentText strings.Builder
	var start, end string

	// VTT format:
	// WEBVTT
	//
	// 00:00:00.000 --> 00:00:09.000
	// Text here
	//
	// 00:00:09.000 --> 00:00:15.000
	// More text

	timestampRegex := regexp.MustCompile(`(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})`)

	for i := 0; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])

		// Skip empty lines and WEBVTT header
		if line == "" || strings.HasPrefix(line, "WEBVTT") || strings.HasPrefix(line, "Kind:") || strings.HasPrefix(line, "Language:") {
			continue
		}

		// Check if this line contains timestamp
		matches := timestampRegex.FindStringSubmatch(line)
		if len(matches) == 3 {
			// Save previous segment if exists
			if start != "" && currentText.Len() > 0 {
				segments = append(segments, TranscriptSegment{
					Start: start,
					End:   end,
					Text:  strings.TrimSpace(currentText.String()),
				})
				currentText.Reset()
			}

			// Parse new timestamp
			start = matches[1]
			end = matches[2]
		} else if start != "" && !regexp.MustCompile(`^\d+$`).MatchString(line) {
			// This is text content (not a sequence number)
			// Remove HTML tags and formatting
			text := removeVTTFormatting(line)
			if text != "" {
				if currentText.Len() > 0 {
					currentText.WriteString(" ")
				}
				currentText.WriteString(text)
			}
		}
	}

	// Add last segment
	if start != "" && currentText.Len() > 0 {
		segments = append(segments, TranscriptSegment{
			Start: start,
			End:   end,
			Text:  strings.TrimSpace(currentText.String()),
		})
	}

	return segments, nil
}

// removeVTTFormatting removes VTT formatting tags from text.
func removeVTTFormatting(text string) string {
	// Remove <c> tags, <i> tags, etc.
	re := regexp.MustCompile(`<[^>]+>`)
	text = re.ReplaceAllString(text, "")
	return strings.TrimSpace(text)
}

// formatDuration converts seconds to HH:MM:SS format.
func formatDuration(seconds int) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	secs := seconds % 60

	if hours > 0 {
		return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, secs)
	}
	return fmt.Sprintf("%02d:%02d", minutes, secs)
}

// formatTimestamp converts milliseconds to HH:MM:SS format.
func formatTimestamp(ms int) string {
	seconds := ms / 1000
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	secs := seconds % 60

	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, secs)
}
