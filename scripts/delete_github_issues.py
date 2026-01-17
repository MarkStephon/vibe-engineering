#!/usr/bin/env python3
"""
批量删除 GitHub Issues 脚本

使用方法:
1. 设置环境变量 GITHUB_TOKEN 或通过命令行参数提供
2. 运行脚本: python scripts/delete_github_issues.py

需要 GitHub Personal Access Token，权限包括: repo, delete_repo (用于删除 issue)
"""

import os
import sys
import requests
import time
from typing import List, Optional

# 要删除的 issue 编号列表
ISSUES_TO_DELETE = [231, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 208]

# GitHub 仓库信息
REPO_OWNER = "lessthanno"
REPO_NAME = "vibe-engineering-playbook"

def get_github_token() -> Optional[str]:
    """获取 GitHub token"""
    # 优先从环境变量获取
    token = os.getenv("GITHUB_TOKEN")
    if token:
        return token
    
    # 从命令行参数获取
    if len(sys.argv) > 1:
        return sys.argv[1]
    
    return None

def delete_issue(issue_number: int, token: str) -> bool:
    """删除指定的 issue"""
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues/{issue_number}"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    # 注意：GitHub API 不支持直接删除 issue，只能关闭它
    # 如果要真正删除，需要使用 GitHub CLI 或网页界面
    # 这里我们先尝试关闭 issue
    data = {
        "state": "closed"
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        if response.status_code == 200:
            print(f"✅ Issue #{issue_number} 已关闭")
            return True
        else:
            print(f"❌ Issue #{issue_number} 关闭失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Issue #{issue_number} 操作失败: {str(e)}")
        return False

def main():
    token = get_github_token()
    
    if not token:
        print("错误: 需要 GitHub Personal Access Token")
        print("\n使用方法:")
        print("  1. 设置环境变量: export GITHUB_TOKEN=your_token")
        print("  2. 或通过命令行参数: python scripts/delete_github_issues.py your_token")
        print("\n注意: GitHub API 不支持直接删除 issue，只能关闭。")
        print("要真正删除 issue，需要使用 GitHub CLI (gh) 或网页界面。")
        sys.exit(1)
    
    print(f"准备处理 {len(ISSUES_TO_DELETE)} 个 issues...")
    print(f"仓库: {REPO_OWNER}/{REPO_NAME}")
    print(f"Issues: {', '.join(f'#{i}' for i in ISSUES_TO_DELETE)}")
    print("\n注意: GitHub API 只能关闭 issue，无法直接删除。")
    print("要真正删除 issue，请使用 GitHub CLI 命令:")
    print("  gh issue delete <issue_number> --repo lessthanno/vibe-engineering-playbook")
    print()
    
    confirm = input("确认要继续关闭这些 issues 吗? (yes/no): ")
    if confirm.lower() != "yes":
        print("已取消")
        sys.exit(0)
    
    success_count = 0
    fail_count = 0
    
    for issue_num in ISSUES_TO_DELETE:
        if delete_issue(issue_num, token):
            success_count += 1
        else:
            fail_count += 1
        
        # 避免触发 rate limit
        time.sleep(0.5)
    
    print(f"\n完成!")
    print(f"成功: {success_count}")
    print(f"失败: {fail_count}")
    
    if fail_count == 0:
        print("\n所有 issues 已关闭。")
        print("要真正删除这些 issues，请使用 GitHub CLI:")
        print("  gh issue delete <issue_number> --repo lessthanno/vibe-engineering-playbook")

if __name__ == "__main__":
    main()
