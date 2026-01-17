#!/usr/bin/env python3
"""
清除 GitHub Issue 的所有评论

使用方法:
1. 设置环境变量 GITHUB_TOKEN 或通过命令行参数提供
2. 运行脚本: python scripts/clear_issue_comments.py <issue_number>

需要 GitHub Personal Access Token，权限包括: repo
"""

import os
import sys
import requests
import time
from typing import List, Optional

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
    if len(sys.argv) > 2:
        return sys.argv[2]
    
    return None

def get_issue_comments(issue_number: int, token: str) -> List[dict]:
    """获取指定 issue 的所有评论"""
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues/{issue_number}/comments"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    all_comments = []
    page = 1
    per_page = 100
    
    while True:
        params = {
            "page": page,
            "per_page": per_page
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code != 200:
                print(f"❌ 获取评论失败: {response.status_code} - {response.text}")
                break
            
            comments = response.json()
            if not comments:
                break
            
            all_comments.extend(comments)
            
            # 如果返回的评论数少于每页数量，说明已经是最后一页
            if len(comments) < per_page:
                break
            
            page += 1
            time.sleep(0.5)  # 避免触发 rate limit
            
        except Exception as e:
            print(f"❌ 获取评论时出错: {str(e)}")
            break
    
    return all_comments

def delete_comment(comment_id: int, token: str) -> bool:
    """删除指定的评论"""
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues/comments/{comment_id}"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    try:
        response = requests.delete(url, headers=headers)
        if response.status_code == 204:
            return True
        else:
            print(f"❌ 删除评论 {comment_id} 失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 删除评论 {comment_id} 时出错: {str(e)}")
        return False

def main():
    # 获取 issue 编号
    if len(sys.argv) < 2:
        print("错误: 需要提供 issue 编号")
        print("\n使用方法:")
        print("  python scripts/clear_issue_comments.py <issue_number> [token]")
        print("\n或者设置环境变量:")
        print("  export GITHUB_TOKEN=your_token")
        print("  python scripts/clear_issue_comments.py <issue_number>")
        sys.exit(1)
    
    try:
        issue_number = int(sys.argv[1])
    except ValueError:
        print(f"错误: '{sys.argv[1]}' 不是有效的 issue 编号")
        sys.exit(1)
    
    token = get_github_token()
    
    if not token:
        print("错误: 需要 GitHub Personal Access Token")
        print("\n使用方法:")
        print("  1. 设置环境变量: export GITHUB_TOKEN=your_token")
        print("  2. 或通过命令行参数: python scripts/clear_issue_comments.py <issue_number> your_token")
        sys.exit(1)
    
    print(f"准备清除 Issue #{issue_number} 的所有评论...")
    print(f"仓库: {REPO_OWNER}/{REPO_NAME}")
    print("\n注意: GitHub API 无法删除 issue 的动态（如标签变更、状态变更等），只能删除评论。")
    print()
    
    # 获取所有评论
    print("正在获取评论列表...")
    comments = get_issue_comments(issue_number, token)
    
    if not comments:
        print("✅ Issue #{issue_number} 没有任何评论")
        sys.exit(0)
    
    print(f"找到 {len(comments)} 条评论")
    print("\n评论列表:")
    for i, comment in enumerate(comments, 1):
        author = comment.get("user", {}).get("login", "Unknown")
        created_at = comment.get("created_at", "Unknown")
        body_preview = comment.get("body", "")[:50].replace("\n", " ")
        print(f"  {i}. [{author}] {created_at}: {body_preview}...")
    
    print()
    confirm = input(f"确认要删除这 {len(comments)} 条评论吗? (yes/no): ")
    if confirm.lower() != "yes":
        print("已取消")
        sys.exit(0)
    
    # 删除所有评论
    print("\n开始删除评论...")
    success_count = 0
    fail_count = 0
    
    for comment in comments:
        comment_id = comment.get("id")
        author = comment.get("user", {}).get("login", "Unknown")
        
        print(f"正在删除评论 #{comment_id} (作者: {author})... ", end="")
        if delete_comment(comment_id, token):
            print("✅")
            success_count += 1
        else:
            print("❌")
            fail_count += 1
        
        # 避免触发 rate limit
        time.sleep(0.5)
    
    print(f"\n完成!")
    print(f"成功删除: {success_count}")
    print(f"失败: {fail_count}")
    
    if success_count == len(comments):
        print(f"\n✅ Issue #{issue_number} 的所有评论已清除")
        print("\n注意: Issue 的动态（如标签变更、状态变更等）无法通过 API 删除。")
        print("如果需要清除动态，请手动在 GitHub 网页上操作。")

if __name__ == "__main__":
    main()
