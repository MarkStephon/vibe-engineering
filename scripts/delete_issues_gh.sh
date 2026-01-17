#!/bin/bash
# 使用 GitHub CLI 批量删除 issues

REPO="lessthanno/vibe-engineering-playbook"
ISSUES=(231 228 227 226 225 224 223 222 221 220 219 218 217 216 215 214 213 212 211 210 208)

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

echo "准备删除 ${#ISSUES[@]} 个 issues..."
echo "仓库: $REPO"
echo "Issues: ${ISSUES[*]}"
echo ""
read -p "确认要删除这些 issues 吗? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

success_count=0
fail_count=0

for issue in "${ISSUES[@]}"; do
    echo -n "正在删除 Issue #$issue... "
    if gh issue delete "$issue" --repo "$REPO" --yes 2>/dev/null; then
        echo "✅ 成功"
        success_count=$((success_count + 1))
    else
        echo "❌ 失败"
        fail_count=$((fail_count + 1))
    fi
    
    # 避免请求过快
    sleep 0.5
done

echo ""
echo "完成!"
echo "成功: $success_count"
echo "失败: $fail_count"
