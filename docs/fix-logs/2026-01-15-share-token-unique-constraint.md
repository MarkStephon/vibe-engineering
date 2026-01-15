# Bug Fix Log: share_token 唯一约束导致 Insight 创建失败

**日期**: 2026-01-15
**关联 Issue**: #197
**提交**: `15e2ac6c`

## 问题描述

在前端创建 Insight 时，后端返回 500 错误，前端控制台显示 `ApiError: 创建 Insight 失败`。

## 错误现象

```
Console ApiError 创建 Insight 失败
lib/api/client.ts (132:11) @ handleResponse
```

后端日志错误：
```
duplicate key value violates unique constraint "idx_insights_share_token" (SQLSTATE 23505)
```

## 根因分析

1. **数据库层面**: `insights` 表的 `share_token` 字段定义了唯一索引约束
2. **GORM 行为**: Go 的 `string` 类型零值是空字符串 `""`，GORM 会将其插入数据库
3. **冲突产生**: 多条 Insight 记录的 `share_token` 都是空字符串，违反唯一约束

### 问题代码

```go
// backend/internal/models/insight.go:63
ShareToken    string     `json:"share_token,omitempty" gorm:"type:varchar(64);uniqueIndex"`
```

当创建 Insight 时不设置 ShareToken，GORM 插入空字符串 `''`，第二次创建时就会冲突。

## 解决方案

将 `ShareToken` 从 `string` 改为 `*string`（指针类型）：

```go
ShareToken    *string    `json:"share_token,omitempty" gorm:"type:varchar(64);uniqueIndex"`
```

**原理**: 指针类型的零值是 `nil`，GORM 会将其作为 `NULL` 插入数据库。PostgreSQL 的唯一约束不会对 `NULL` 值生效（多个 NULL 不冲突）。

## 修改文件

| 文件 | 修改内容 |
|------|----------|
| `backend/internal/models/insight.go` | `ShareToken` 类型从 `string` 改为 `*string` |
| `backend/go.mod` | `gorm.io/datatypes` 从 indirect 移至 direct 依赖 |

## 验证步骤

1. 重建后端容器: `docker-compose -f docker-compose.dev.yml up backend -d --build`
2. 检查后端日志确认启动成功
3. 在前端创建新的 Insight，确认不再报错

## 经验总结

### GORM 中可空唯一字段的最佳实践

| 场景 | 推荐类型 | 说明 |
|------|----------|------|
| 必填唯一字段 | `string` | 业务逻辑保证非空 |
| 可空唯一字段 | `*string` | 允许 NULL，避免空字符串冲突 |
| 可空非唯一字段 | `string` 或 `*string` | 根据业务需求选择 |

### 相关代码审查建议

检查其他可能有类似问题的字段：
- 任何带 `uniqueIndex` 且可能为空的字段
- 考虑在 Model 定义时就使用指针类型

---

## 工作流优化建议

### 1. 代码审查清单 (Code Review Checklist)

建议在 PR 模板中添加以下检查项：

```markdown
### 数据库相关
- [ ] 唯一索引字段是否处理了空值情况
- [ ] 新增字段是否需要数据库迁移
- [ ] 外键约束是否正确设置
```

### 2. 本地开发环境改进

当前问题：
- Go 版本要求 1.24+，本地可能版本不匹配
- 依赖 Docker 运行后端

建议：
- 在项目根目录添加 `.tool-versions` (asdf) 或 `.go-version` 明确版本
- 考虑添加 `make dev` 命令统一开发环境启动

### 3. 错误处理增强

当前前端只显示通用错误信息，建议：
- 后端返回更具体的错误码
- 前端根据错误码显示针对性提示

### 4. 集成测试

建议添加创建 Insight 的集成测试，覆盖：
- 首次创建成功
- 多次创建成功（验证唯一约束问题）
- 错误 URL 处理
