#!/bin/bash
# 批量打开需要删除的 GitHub issues 页面

REPO="lessthanno/vibe-engineering-playbook"
ISSUES=(231 228 227 226 225 224 223 222 221 220 219 218 217 216 215 214 213 212 211 210 208)

echo "正在打开 ${#ISSUES[@]} 个 issue 页面..."
echo "请在每个页面中点击右侧边栏的 'Delete issue' 按钮来删除"

for issue in "${ISSUES[@]}"; do
    echo "打开 Issue #$issue..."
    open "https://github.com/$REPO/issues/$issue"
    sleep 1  # 避免打开太快
done

echo ""
echo "所有 issue 页面已打开！"
echo "请在每个页面中："
echo "1. 找到右侧边栏"
echo "2. 点击 'Delete issue' 按钮"
echo "3. 确认删除"
