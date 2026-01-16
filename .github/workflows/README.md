# GitHub Actions 工作流文档

本文档详细说明了项目中所有 GitHub Actions 工作流的功能、触发条件和使用方法。

## 📋 目录

- [核心 Agent 工作流](#核心-agent-工作流)
- [任务复杂度路由](#任务复杂度路由)
- [自动化工作流](#自动化工作流)
- [监控工作流](#监控工作流)
- [其他工作流](#其他工作流)
- [使用指南](#使用指南)

---

## 核心 Agent 工作流

### 1. Vibe Agent (`vibe-agent.yml`) ⭐ 主入口

**功能**: 统一的 Agent 入口，处理 UI 设计、后端代码、前端代码生成。

**命令格式**:

```bash
/agent ui              # 生成 UI 设计规格
/agent be              # 生成后端代码
/agent fe              # 生成前端代码
/agent be --spec #123  # 指定 UI Spec 来源
/agent fe --spec #123  # 指定 UI Spec 来源
```

**兼容旧命令**: `/agent-ui`, `/agent-be`, `/agent-fe`

**输出策略**:

| 类型 | 输出位置 | 说明 |
|------|----------|------|
| UI Spec | `docs/specs/issue-{number}-ui.md` + PR | 避免评论折叠 |
| 后端代码 | PR | 直接生成代码 |
| 前端代码 | PR | 直接生成代码 |

**工作流程**:

```
1. Issue 描述需求
        ↓
2. /agent ui → 生成 UI Spec → PR
        ↓
3. Review & Merge PR
        ↓
4. /agent be --spec #123 → 生成后端代码 → PR
        ↓
5. /agent fe --spec #123 → 生成前端代码 → PR
```

**特点**:

- UI Spec 输出到文件，不再在评论中放长内容
- 支持 `--spec` 参数指定 UI Spec 来源
- Issue 评论只放简短状态，详细内容在 PR 中

---

### 2. Simple Task Agent (`agent-simple.yml`)

**功能**: 处理简单任务，直接实现代码，无需复杂分析。

**触发方式**:

- Issue 评论中包含 `/agent-simple`
- 被 `vibe-router.yml` 自动触发（复杂度为 S）

**特点**:

- 直接开始编码，不进行需求分析
- 适合单文件修改、bug 修复、样式调整
- 最大 30 轮对话

**使用场景**:

- 修复简单的 bug
- 调整 UI 样式
- 修改文案
- 添加单个 UI 元素

---

### 3. Medium Task Agent (`agent-medium.yml`)

**功能**: 处理中等复杂度任务，先分析再实现。

**触发方式**:

- Issue 评论中包含 `/agent-medium`
- 被 `vibe-router.yml` 自动触发（复杂度为 M）

**特点**:

- 两阶段处理：先分析需求，再开发实现
- 适合涉及 2-5 个文件的新功能
- 最大 50 轮对话

**使用场景**:

- 新增独立功能模块
- 需要前后端都改但逻辑简单
- 新增 API endpoint + 简单 UI

---

### 4. Complex Task Agent (`agent-complex.yml`)

**功能**: 处理复杂任务，自动拆分为多个子 Issue。

**触发方式**:

- Issue 评论中包含 `/agent-complex`
- 被 `vibe-router.yml` 自动触发（复杂度为 L）

**特点**:

- 使用 AI 分析需求并拆分子任务
- 自动创建子 Issue 并设置依赖关系
- 自动触发第一个无依赖的子任务

**使用场景**:

- 涉及多个模块的大型功能
- 需要数据库 schema 变更
- 需要架构设计或重构
- 涉及第三方服务集成

**输出**:

- 创建 3-8 个子 Issue
- 每个子 Issue 包含任务描述、验收标准、预估工时
- 自动设置依赖关系和优先级

---

## 任务复杂度路由

### 5. Vibe Router (`vibe-router.yml`)

**功能**: 自动分析 Issue 复杂度并路由到对应的 Agent。

**触发方式**: Issue 创建时自动触发

**复杂度判断标准**:

| 等级 | 说明 | 路由目标 |
|------|------|----------|
| S (简单) | 单文件修改，< 2 小时 | agent-simple |
| M (中等) | 2-5 个文件，2-8 小时 | agent-medium |
| L (复杂) | > 5 个文件，> 1 天 | agent-complex |
| skip | 非开发任务 | 不处理 |

**输出**:

- 添加复杂度标签：`complexity:simple` / `complexity:medium` / `complexity:complex`
- 添加影响范围标签：`frontend` / `backend` / `database`
- 自动触发对应的 Agent

---

## 自动化工作流

### 6. Auto Trigger Frontend (`auto-trigger-frontend.yml`)

**功能**: 后端 PR 合并后自动触发前端开发。

**触发方式**: PR 合并时自动触发（仅限后端 Agent 创建的 PR）

**使用场景**:

- 前后端分离开发
- 后端完成后自动开始前端开发

---

### 7. Feature Branch Manager (`feature-branch-manager.yml`)

**功能**: 管理功能分支，支持自动创建、同步和合并。

**命令**:

| 命令 | 说明 |
|------|------|
| `feature:xxx` 标签 | 自动创建 `feature/xxx` 分支 |
| `/sync` | 同步 main 到功能分支 |
| `/merge-to-main` | 创建合并到 main 的 PR |

---

## 监控工作流

### 8. Fix PR Build Errors (`fix-pr.yml`)

**功能**: 修复 PR 中的构建错误。

**命令**: 在 PR 评论中使用 `/fix`

---

### 9. Vercel Status Monitor (`vercel-status-monitor.yml`)

**功能**: 监控 Vercel 部署状态并更新 Issue/PR。

---

### 10. Vibe Monitor (`vibe-monitor.yml`)

**功能**: 监控任务状态，自动检测超时和失败任务。

**触发方式**: 每小时自动运行

---

## 其他工作流

### 11. Issue Manager (`issue-manager.yml`)

**功能**: 自动管理 Issue，包括标签和欢迎消息。

---

### 12. Parent-Child Issue Guard (`parent-child-issue-guard.yml`)

**功能**: 管理父子 Issue 关系，防止父 Issue 在子 Issue 未完成时被关闭。

---

### 13. Weekly Maintenance (`weekly-maintenance.yml`)

**功能**: 每周仓库维护，检查依赖、安全漏洞等。

---

## 使用指南

### 快速开始

1. **创建 Issue 描述需求**
   - Vibe Router 会自动分析复杂度并触发对应的 Agent

2. **手动触发 Agent**（可选）

   ```bash
   # 推荐：统一命令格式
   /agent ui              # 生成 UI 设计规格
   /agent be              # 生成后端代码
   /agent fe              # 生成前端代码
   /agent be --spec #123  # 指定 UI Spec 来源

   # 任务复杂度命令
   /agent-simple          # 简单任务
   /agent-medium          # 中等任务
   /agent-complex         # 复杂任务
   ```

3. **查看进度**
   - 在 PR 中查看生成的代码和 UI Spec
   - 在 Actions 标签页查看 workflow 执行日志

### 常用命令速查

| 命令 | 说明 |
|------|------|
| `/agent ui` | 生成 UI 设计规格 → `docs/specs/` + PR |
| `/agent be` | 生成后端代码 → PR |
| `/agent fe` | 生成前端代码 → PR |
| `/agent be --spec #123` | 基于指定 Issue 的 UI Spec 生成后端 |
| `/agent-simple` | 简单任务 Agent |
| `/agent-medium` | 中等任务 Agent |
| `/agent-complex` | 复杂任务拆分 |
| `/fix` | 修复 PR 构建错误 |
| `/sync` | 同步 main 到功能分支 |
| `/merge-to-main` | 创建合并 PR |
| `/clean-stale` | 清理超时任务 |

### 标签说明

**复杂度标签**:

- `complexity:simple` - 简单任务
- `complexity:medium` - 中等任务
- `complexity:complex` - 复杂任务

**状态标签**:

- `🤖 ai-processing` - AI 处理中
- `✅ ai-completed` - AI 已完成
- `❌ ai-failed` - AI 处理失败
- `ui-spec-ready` - UI Spec 已生成

**类型标签**:

- `frontend` - 涉及前端
- `backend` - 涉及后端
- `feature:xxx` - 功能分支

### 最佳实践

1. **使用统一的 /agent 命令**
   - 推荐使用 `/agent ui|be|fe` 格式
   - 旧命令仍然兼容

2. **UI Spec 输出到文件**
   - UI Spec 保存在 `docs/specs/` 目录
   - 通过 PR 进行 Review
   - 避免 Issue 评论折叠问题

3. **使用 --spec 参数**
   - 生成代码时指定 UI Spec 来源
   - 例如: `/agent be --spec #123`

4. **功能分支开发**
   - 大型功能使用 `feature:xxx` 标签
   - 子任务 PR 自动合并到功能分支

---

## 配置说明

### 必需的 Secrets

- `OPENROUTER_API_KEY`: OpenRouter API Key

### 可复用 Actions

项目提供了两个可复用的 Composite Actions，用于减少工作流代码重复：

#### 1. GitHub Utils (`/.github/actions/github-utils/action.yml`)

通用 GitHub API 操作，支持标签管理、评论、状态更新：

```yaml
- uses: ./.github/actions/github-utils
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    operation: update-status  # update-labels | add-comment | update-status
    issue_number: ${{ github.event.issue.number }}
    status: processing  # processing | completed | failed
    agent_name: 'My Agent'
```

#### 2. OpenRouter API (`/.github/actions/openrouter-api/action.yml`)

带重试机制的 OpenRouter API 客户端：

```yaml
- uses: ./.github/actions/openrouter-api
  with:
    api_key: ${{ secrets.OPENROUTER_API_KEY }}
    model: google/gemini-2.0-flash-001
    prompt: '你的 prompt 内容'
    json_mode: 'true'
    max_retries: '3'
```

特点：
- 指数退避重试（支持 429 Rate Limit 和 5xx 错误）
- 自动处理 Retry-After 头
- JSON 模式支持

### 配置文件

项目使用中央配置文件管理工作流配置：

**`.github/config/workflow-config.json`**

```json
{
  "prd": {
    "issue_number": 176,
    "sub_issues": [...]
  },
  "monitor": {
    "stale_threshold_hours": 4,
    "retry_limit": 3
  },
  "agents": {
    "default_model": "anthropic/claude-sonnet-4",
    "router_model": "google/gemini-2.0-flash-001"
  },
  "labels": {
    "status": {...},
    "complexity": {...},
    "scope": {...}
  },
  "skip_patterns": {
    "title_patterns": [...],
    "skip_labels": [...]
  }
}
```

优点：
- 集中管理配置，避免硬编码
- 支持配置 Schema 验证
- 方便修改阈值和标签名

### 文件结构

```
.github/
├── actions/
│   ├── github-utils/          # GitHub API 工具
│   │   └── action.yml
│   └── openrouter-api/        # OpenRouter API 客户端
│       └── action.yml
├── config/
│   └── workflow-config.json   # 中央配置文件
├── workflows/
│   ├── vibe-agent.yml         # 主 Agent 入口
│   ├── vibe-router.yml        # 复杂度路由
│   ├── vibe-monitor.yml       # 任务监控
│   └── ...
└── README.md

docs/
└── specs/
    └── issue-{number}-ui.md    # 自动生成的 UI Spec
```

---

## 更新日志

- **2026-01-16** (工作流优化):
  - 新增可复用 Composite Actions：
    - `github-utils`: 通用 GitHub API 操作（标签、评论、状态）
    - `openrouter-api`: 带重试机制的 OpenRouter API 客户端
  - 新增中央配置文件 `.github/config/workflow-config.json`
  - 重构 `vibe-router.yml`：
    - 升级模型到 `google/gemini-2.0-flash-001`
    - 添加 API 调用重试机制（指数退避）
    - 从配置文件读取跳过规则和标签
  - 重构 `update-prd-status.yml`：从配置文件读取 PRD 配置
  - 重构 `vibe-monitor.yml`：从配置文件读取阈值配置
  - 清理无效 workflow 文件：
    - 删除 `vibe-smoke-test.yml`（依赖不存在的脚本）
    - 删除 `vibe-auto-vision.yml`（YAML 语法错误）
    - 删除 `auto-fix-CI-failures.yml`（监听不存在的 CI workflow）
    - 删除 `sync-issue-status.yml`（硬编码 issue 号，功能过时）
    - 删除 `error-handler.yml`（监听不存在的 workflows）
  - 当前保留 14 个有效 workflow
- **2026-01**:
  - 统一 Agent 入口 (`vibe-agent.yml`)
  - 合并 issue-router/agent-ui/backend-agent/frontend-agent
  - 新增 `/agent ui|be|fe` 命令格式
  - UI Spec 输出到文件，避免评论折叠
  - 支持 `--spec` 参数指定 UI Spec 来源
- **2024-2025**:
  - 初始版本，包含所有核心工作流
  - 支持 OpenRouter 集成
  - 支持功能分支管理

---

## 相关文档

- [Backend 开发规范](../../backend/CLAUDE.md)
- [Frontend 开发规范](../../frontend/STYLE_GUIDE.md)
- [UI Specs 目录](../../docs/specs/)
