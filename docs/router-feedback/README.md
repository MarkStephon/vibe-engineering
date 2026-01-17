# Router 反馈数据存储

本目录用于存储 Vibe Router 的复杂度评估反馈数据，帮助持续优化 Router 的判断准确性。

## 📋 用途

当 Agent（Simple/Medium）执行失败时，系统会自动收集以下数据：
- Router 的原始评估结果
- 实际执行指标（轮次、时长、成本）
- 失败原因分析
- 建议的正确复杂度等级

这些数据将用于：
1. **分析误判模式** - 识别 Router 容易误判的任务类型
2. **优化判断规则** - 更新 `complexity-analyzer.md` 的判断标准
3. **模型学习** - 将历史案例注入 Router prompt，提高准确性

## 📊 数据格式

每个反馈文件为 `issue-{number}.json`，格式如下：

```json
{
  "issue_number": 265,
  "issue_title": "[BE+FE] 支持内容翻译",
  "issue_body_preview": "问题：\n1.目前youtube 链接如果是英文，返回了英文文字...",
  "router_prediction": {
    "complexity": "M",
    "labels": ["complexity:medium"]
  },
  "actual_execution": {
    "agent_used": "medium",
    "total_turns": 51,
    "max_turns_limit": 50,
    "duration_ms": 422405,
    "duration_seconds": 422,
    "cost_usd": 19.75,
    "status": "failed_max_turns",
    "failure_reason": "error_max_turns"
  },
  "suggested_complexity": "L",
  "feedback_timestamp": "2026-01-17T05:32:39Z",
  "actions_run": "https://github.com/.../actions/runs/21089157988"
}
```

## 🔍 触发条件

反馈数据在以下情况下自动收集：

1. **Medium Agent 失败** 且满足以下任一条件：
   - 执行轮次 >= 45（接近上限）
   - 失败原因为 `error_max_turns`

2. **Simple Agent 失败** 且满足以下任一条件：
   - 执行轮次 >= 25（接近上限）
   - 失败原因为 `error_max_turns`

## 📈 使用反馈数据

### 1. 手动分析

定期查看反馈数据，识别常见误判模式：

```bash
# 查看所有误判案例
ls docs/router-feedback/

# 分析单个案例
cat docs/router-feedback/issue-265.json | jq
```

### 2. 自动学习（规划中）

Router 将自动读取反馈数据并注入到判断 prompt 中：

```javascript
// vibe-router.js 中的使用示例
const feedbackFiles = fs.readdirSync('docs/router-feedback');
const mispredictions = feedbackFiles
  .map(f => JSON.parse(fs.readFileSync(`docs/router-feedback/${f}`)))
  .filter(f => f.suggested_complexity === 'L' && f.router_prediction.complexity === 'M');

// 构建学习案例
const learningCases = mispredictions.map(f => 
  `Issue #${f.issue_number}: ${f.issue_title}
   预测: ${f.router_prediction.complexity} → 实际: ${f.suggested_complexity}
   成本: ${f.actual_execution.turns}轮, $${f.actual_execution.cost_usd}`
);
```

## 🏷️ 关联标签

误判的 Issue 会自动添加 `router-misprediction` 标签，便于跟踪和分析。

## 📝 定期维护

建议每周/每月：
1. 分析新增的反馈数据
2. 识别常见误判模式
3. 更新 `complexity-analyzer.md` 的判断规则
4. 清理过时的反馈数据（可选）

## 🔗 相关文件

- **Router Prompt**: `.github/prompts/router/complexity-analyzer.md`
- **Router 脚本**: `.github/scripts/vibe-router.js`
- **Medium Agent**: `.github/workflows/agent-medium.yml`
- **改进 Issue**: #267

---

**最后更新**: 2026-01-17
**维护者**: Vibe Engineering Team
