## 2026-01-13 - Debug: YouTube Captions API 401 Unauthorized

**问题描述:** 用户访问 `/api/v1/youtube/captions?videoId=xxx` 时返回 401 Unauthorized，错误消息为 "需要 OAuth 授权才能访问字幕"

**调试结论:** 系统行为正确，非代码 Bug

### 📝 分析

YouTube Captions API（字幕 API）是 Google 限制较严格的 API，**必须使用 OAuth 2.0 授权**才能访问，无法仅通过 API Key 调用。

**代码流程确认:**
1. `handlers/youtube_api.go:GetCaptions` 从 `Authorization` header 提取 Bearer token
2. `services/youtube_api.go:GetCaptions` 检查 token 是否为 nil，若为 nil 则返回 UNAUTHORIZED
3. 若 token 存在，使用 OAuth client 调用 YouTube Data API v3

**关键代码逻辑 (已确认正常):**

```go
// handlers/youtube_api.go - 从 header 提取 token
authHeader := c.GetHeader("Authorization")
if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
    accessToken := authHeader[7:]
    token = &oauth2.Token{AccessToken: accessToken}
}

// services/youtube_api.go - 校验 token
if token == nil {
    return nil, fmt.Errorf("UNAUTHORIZED: OAuth authorization required to access captions")
}
```

### ✅ 确认事项

- YouTube Captions API 要求 OAuth 授权是 Google 的政策，非系统限制
- 前端 `buildHeaders` 会自动从 localStorage 读取 `google_access_token` 并添加到请求头
- 用户需要先完成 Google OAuth 授权流程（访问 `/auth` 页面）才能使用字幕功能

### 📁 文件涉及

- `internal/handlers/youtube_api.go` - GetCaptions handler
- `internal/services/youtube_api.go` - GetCaptions service
- `internal/services/oauth.go` - OAuth 配置（包含 `youtube.YoutubeForceSslScope` 权限）

---
# Backend Agent 变更日志

此文件由 Backend Agent 自动生成和维护，记录所有代码变更历史。

---
