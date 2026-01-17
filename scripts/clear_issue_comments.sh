#!/bin/bash
# 使用 GitHub CLI 清除 Issue 的所有评论

REPO="lessthanno/vibe-engineering-playbook"
ISSUE_NUMBER="${1:-182}"
AUTO_YES="${2:-}"

# 如果第二个参数是 --yes 或 -y，则自动确认
if [ "$ISSUE_NUMBER" = "--yes" ] || [ "$ISSUE_NUMBER" = "-y" ]; then
    AUTO_YES="yes"
    ISSUE_NUMBER="${2:-182}"
fi
if [ "$AUTO_YES" = "--yes" ] || [ "$AUTO_YES" = "-y" ]; then
    AUTO_YES="yes"
fi

# 检查是否安装了 gh CLI
if ! command -v gh &> /dev/null; then
    echo "错误: 未安装 GitHub CLI (gh)"
    echo "请先安装: brew install gh"
    echo "然后登录: gh auth login"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "错误: 未登录 GitHub CLI"
    echo "请先登录: gh auth login"
    exit 1
fi

echo "准备清除 Issue #${ISSUE_NUMBER} 的所有评论..."
echo "仓库: $REPO"
echo ""

# 获取所有评论 ID
echo "正在获取评论列表..."
COMMENT_IDS=$(gh api repos/${REPO}/issues/${ISSUE_NUMBER}/comments --jq '.[].id')

if [ -z "$COMMENT_IDS" ]; then
    echo "✅ Issue #${ISSUE_NUMBER} 没有任何评论"
    exit 0
fi

# 统计评论数量
COMMENT_COUNT=$(echo "$COMMENT_IDS" | wc -l | tr -d ' ')
echo "找到 ${COMMENT_COUNT} 条评论"

# 显示评论预览（前5条）
echo ""
echo "评论预览（前5条）:"
gh api repos/${REPO}/issues/${ISSUE_NUMBER}/comments --jq '.[0:5][] | "  - [\(.user.login)] \(.created_at): \(.body[0:60] | gsub("\n"; " "))..."'
if [ "$COMMENT_COUNT" -gt 5 ]; then
    echo "  ... 还有 $((COMMENT_COUNT - 5)) 条评论"
fi

if [ "$AUTO_YES" != "yes" ]; then
    echo ""
    read -p "确认要删除这 ${COMMENT_COUNT} 条评论吗? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "已取消"
        exit 0
    fi
else
    echo ""
    echo "自动确认: 将删除这 ${COMMENT_COUNT} 条评论..."
fi

# 删除所有评论
echo ""
echo "开始删除评论..."
success_count=0
fail_count=0

while IFS= read -r comment_id; do
    if [ -z "$comment_id" ]; then
        continue
    fi
    echo -n "正在删除评论 #${comment_id}... "
    if gh api -X DELETE repos/${REPO}/issues/comments/${comment_id} &>/dev/null; then
        echo "✅"
        success_count=$((success_count + 1))
    else
        echo "❌"
        fail_count=$((fail_count + 1))
    fi
    
    # 避免请求过快
    sleep 0.5
done <<< "$COMMENT_IDS"

echo ""
echo "完成!"
echo "成功删除: ${success_count}"
echo "失败: ${fail_count}"

if [ "$success_count" -eq "$COMMENT_COUNT" ]; then
    echo ""
    echo "✅ Issue #${ISSUE_NUMBER} 的所有评论已清除"
    echo ""
    echo "注意: Issue 的动态（如标签变更、状态变更等）无法通过 API 删除。"
    echo "如果需要清除动态，请手动在 GitHub 网页上操作。"
fi
