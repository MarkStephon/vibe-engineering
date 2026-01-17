# Tech Spec for Issue #268

> 原始需求: [#268](https://github.com/lessthanno/vibe-engineering-playbook/issues/268)
> 生成时间: 2026-01-17T12:03:58.781Z

---

# YouTube视频中英对照翻译功能

**父 Issue**: 无
**优先级**: P1
**类型**: 全栈（后端 + 前端）

---

## 📋 需求描述

实现YouTube链接的中英对照翻译功能，用户输入YouTube链接并选择目标语言（中文或英文），系统自动提取视频字幕并翻译为目标语言，提供准确流畅的翻译结果。

---

## 🎨 用户体验

### 主流程

```
1. 用户访问翻译页面
   ┌─────────────────────────────────────────────────────────┐
   │  YouTube视频翻译                                        │
   │  ─────────────────────────────────────────────────────  │
   │  YouTube链接: [https://youtube.com/watch?v=...    ]    │
   │  目标语言:    [中文 ▼]                                  │
   │                                        [开始翻译]       │
   └─────────────────────────────────────────────────────────┘
                              ↓
2. 用户输入链接并选择目标语言，点击翻译
                              ↓
3. 系统处理中状态
   ┌─────────────────────────────────────────────────────────┐
   │  正在处理...                                            │
   │  ─────────────────────────────────────────────────────  │
   │  ⏳ 正在获取视频信息...                                 │
   │  ⏳ 正在提取字幕...                                     │
   │  ⏳ 正在翻译内容...                                     │
   │  ████████████████████░░░░ 80%                          │
   └─────────────────────────────────────────────────────────┘
                              ↓
4. 显示翻译结果
   ┌─────────────────────────────────────────────────────────┐
   │  翻译结果                                    [下载] [分享]│
   │  ─────────────────────────────────────────────────────  │
   │  视频标题: How to Learn Programming                     │
   │  翻译标题: 如何学习编程                                 │
   │  ─────────────────────────────────────────────────────  │
   │  │ 时间轴 │     原文      │       译文        │        │
   │  │ 00:00  │ Hello everyone│ 大家好            │        │
   │  │ 00:05  │ Today we will │ 今天我们将学习    │        │
   │  │        │ learn coding  │ 编程              │        │
   │  │ 00:10  │ First, let's  │ 首先，让我们      │        │
   │  │        │ start with... │ 从...开始         │        │
   └─────────────────────────────────────────────────────────┘
```

### 界面视角

用户看到一个简洁的翻译界面，包含输入区域、处理状态显示和结果展示区域，支持对照查看原文和译文。

---

## 🔌 后端 API

### POST /api/v1/translations
创建翻译任务

**Request**
```json
{
  "youtube_url": "https://youtube.com/watch?v=xxxxx",
  "target_language": "zh-CN",
  "user_id": "optional_user_id"
}
```

**Response**
```json
{
  "task_id": "uuid",
  "status": "processing",
  "message": "翻译任务已创建"
}
```

### GET /api/v1/translations/{task_id}
获取翻译任务状态和结果

**Request**
```
GET /api/v1/translations/uuid
```

**Response**
```json
{
  "task_id": "uuid",
  "status": "completed",
  "progress": 100,
  "video_info": {
    "title": "How to Learn Programming",
    "translated_title": "如何学习编程",
    "duration": "10:30",
    "thumbnail": "https://img.youtube.com/vi/xxxxx/maxresdefault.jpg"
  },
  "subtitles": [
    {
      "start_time": "00:00:00",
      "end_time": "00:00:05",
      "original_text": "Hello everyone",
      "translated_text": "大家好"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:02:00Z"
}
```

### GET /api/v1/translations/{task_id}/download
下载翻译结果文件

**Response**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="translation.srt"
```

---

## 📁 后端实现

### 数据模型

```go
type TranslationTask struct {
    ID               uint      `json:"id" gorm:"primaryKey"`
    TaskID           string    `json:"task_id" gorm:"uniqueIndex;type:varchar(36)"`
    YoutubeURL       string    `json:"youtube_url" gorm:"type:text;not null"`
    TargetLanguage   string    `json:"target_language" gorm:"type:varchar(10);not null"`
    Status           string    `json:"status" gorm:"type:varchar(20);default:'pending'"` // pending, processing, completed, failed
    Progress         int       `json:"progress" gorm:"default:0"`
    ErrorMessage     string    `json:"error_message" gorm:"type:text"`
    UserID           string    `json:"user_id" gorm:"type:varchar(36)"`
    CreatedAt        time.Time `json:"created_at"`
    UpdatedAt        time.Time `json:"updated_at"`
    CompletedAt      *time.Time `json:"completed_at"`
}

type VideoInfo struct {
    ID               uint   `json:"id" gorm:"primaryKey"`
    TaskID           string `json:"task_id" gorm:"type:varchar(36);index"`
    Title            string `json:"title" gorm:"type:text"`
    TranslatedTitle  string `json:"translated_title" gorm:"type:text"`
    Duration         string `json:"duration" gorm:"type:varchar(20)"`
    Thumbnail        string `json:"thumbnail" gorm:"type:text"`
    YoutubeID        string `json:"youtube_id" gorm:"type:varchar(20)"`
}

type Subtitle struct {
    ID              uint   `json:"id" gorm:"primaryKey"`
    TaskID          string `json:"task_id" gorm:"type:varchar(36);index"`
    StartTime       string `json:"start_time" gorm:"type:varchar(20)"`
    EndTime         string `json:"end_time" gorm:"type:varchar(20)"`
    OriginalText    string `json:"original_text" gorm:"type:text"`
    TranslatedText  string `json:"translated_text" gorm:"type:text"`
    SequenceNumber  int    `json:"sequence_number" gorm:"index"`
}
```

### 关键逻辑

```go
// 翻译服务接口
type TranslationService interface {
    CreateTranslationTask(url, targetLang, userID string) (*TranslationTask, error)
    GetTaskStatus(taskID string) (*TranslationTask, error)
    ProcessTranslation(taskID string) error
}

// YouTube服务接口  
type YouTubeService interface {
    ExtractVideoInfo(url string) (*VideoInfo, error)
    ExtractSubtitles(url string) ([]Subtitle, error)
    ValidateURL(url string) error
}

// 翻译引擎接口
type TranslationEngine interface {
    Translate(text, targetLang string) (string, error)
    DetectLanguage(text string) (string, error)
}
```

---

## 🖥 前端实现

### 文件结构

```
frontend/
├── app/
│   └── translation/
│       └── page.tsx
├── components/translation/
│   ├── TranslationForm.tsx
│   ├── TranslationProgress.tsx
│   ├── TranslationResult.tsx
│   └── SubtitleTable.tsx
└── lib/api/
    └── translation.ts
```

### 组件接口

```tsx
interface TranslationFormProps {
  onSubmit: (url: string, targetLanguage: string) => void;
  isLoading: boolean;
}

interface TranslationProgressProps {
  taskId: string;
  onComplete: (result: TranslationResult) => void;
}

interface TranslationResultProps {
  result: TranslationResult;
  onDownload: () => void;
  onShare: () => void;
}

interface SubtitleTableProps {
  subtitles: Subtitle[];
  videoInfo: VideoInfo;
}

// 功能描述：
// 1. TranslationForm: 处理用户输入YouTube链接和目标语言选择
// 2. TranslationProgress: 实时显示翻译进度和状态
// 3. TranslationResult: 展示翻译结果，支持下载和分享
// 4. SubtitleTable: 以表格形式展示原文和译文对照
```

---

## 🔄 交互流程

```
[用户] 输入YouTube链接并选择目标语言，点击翻译
        ↓
[前端] 验证输入格式，发送POST请求到/api/v1/translations
        ↓
[后端] 创建翻译任务，返回task_id，启动异步翻译处理
        ↓
[前端] 开始轮询GET /api/v1/translations/{task_id}获取进度
        ↓
[后端] 处理YouTube链接提取、字幕获取、翻译等步骤，更新进度
        ↓
[前端] 实时更新进度条和状态信息
        ↓
[后端] 翻译完成，状态更新为completed
        ↓
[前端] 获取完整结果并展示翻译对照表格
```

---

## ✅ 验收标准

### 后端
1. [ ] 支持有效YouTube链接的验证和解析
2. [ ] 能够提取YouTube视频的字幕信息
3. [ ] 实现中英文双向翻译功能
4. [ ] 翻译任务状态正确管理（pending/processing/completed/failed）
5. [ ] 提供实时进度更新API
6. [ ] 支持翻译结果的下载功能
7. [ ] 实现适当的错误处理和异常提示
8. [ ] 添加请求频率限制防止滥用

### 前端
1. [ ] 提供清晰的YouTube链接输入界面
2. [ ] 支持目标语言选择（中文/英文）
3. [ ] 实时显示翻译进度和状态
4. [ ] 以对照表格形式展示原文和译文
5. [ ] 支持翻译结果的下载功能
6. [ ] 提供友好的错误提示信息
7. [ ] 响应式设计适配移动端
8. [ ] 加载状态和骨架屏优化用户体验

---

## 💡 技术提示

### 安全考虑
- 对YouTube链接进行严格验证，防止恶意链接
- 实现API请求频率限制，防止服务滥用
- 对用户输入进行XSS防护
- 翻译任务添加超时机制，避免资源占用

### 性能优化
- 使用Redis缓存翻译结果，避免重复处理相同链接
- 实现异步任务队列处理翻译请求
- 前端使用虚拟滚动优化大量字幕数据展示
- 添加CDN缓存静态资源

### 代码示例（关键片段）
```tsx
// 轮询获取翻译进度
const useTranslationProgress = (taskId: string) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await getTranslationStatus(taskId);
      setProgress(result.progress);
      setStatus(result.status);
      
      if (result.status === 'completed' || result.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [taskId]);
  
  return { progress, status };
};
```

---

## 注意事项

1. 需要集成YouTube Data API或第三方字幕提取服务
2. 翻译服务可考虑使用Google Translate API或其他翻译引擎
3. 大文件翻译需要考虑分片处理和断点续传
4. 添加翻译质量评估和用户反馈机制
5. 考虑多语言支持的扩展性设计

---

## 下一步

使用以下命令生成代码：
```
/agent be --spec #268  # 生成后端代码
/agent fe --spec #268  # 生成前端代码
```

<!-- vibe-tech-spec -->