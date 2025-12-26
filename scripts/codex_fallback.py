#!/usr/bin/env python3
"""
Fallback script when Codex fails.
Directly calls OpenAI API to implement the issue requirements.
"""
import os
import json
import subprocess
from pathlib import Path
from openai import OpenAI

def read_file(path):
    """Read a file and return its content."""
    try:
        return Path(path).read_text(encoding='utf-8')
    except FileNotFoundError:
        return None

def write_file(path, content):
    """Write content to a file."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(content, encoding='utf-8')

def run_command(cmd, check=False):
    """Run a shell command."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        return "", str(e), 1

def main():
    # Read issue and protocol
    issue_content = read_file("ISSUE.md")
    protocol_content = read_file("AGENT_PROTOCOL.md")
    
    if not issue_content:
        print("ERROR: ISSUE.md not found")
        return 1
    
    # Get API key
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("ERROR: No API key found (need OPENAI_API_KEY or OPENROUTER_API_KEY)")
        return 1
    
    # Initialize client
    base_url = "https://api.openai.com/v1"
    if os.getenv("OPENROUTER_API_KEY"):
        base_url = "https://openrouter.ai/api/v1"
        model = os.getenv("CODEX_MODEL", "openai/gpt-4o")
    else:
        model = os.getenv("CODEX_MODEL", "gpt-4o")
    
    client = OpenAI(api_key=api_key, base_url=base_url)
    
    # Create prompt
    prompt = f"""You are a coding assistant. Implement the requirements in ISSUE.md following AGENT_PROTOCOL.md.

ISSUE.md content:
{issue_content}

AGENT_PROTOCOL.md content:
{protocol_content if protocol_content else "Not found"}

Your task:
1. Create or update EXEC_PLAN.md with a concrete plan
2. Implement the code changes (create/modify at least one source file)
3. Make minimal, focused changes that directly address ISSUE.md

Start by reading the files, then create EXEC_PLAN.md, then implement the code.

IMPORTANT: You must create or modify at least one source file. Use shell commands to read/write files.
"""
    
    print("=== Calling OpenAI API ===")
    print(f"Model: {model}")
    print(f"Base URL: {base_url}")
    
    # Call API
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a coding assistant. Execute commands and write files to implement requirements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        result = response.choices[0].message.content
        print("=== API Response ===")
        print(result[:500])  # Print first 500 chars
        
        # Try to extract and execute commands from response
        # This is a simple approach - in practice you might want more sophisticated parsing
        lines = result.split('\n')
        for line in lines:
            if line.strip().startswith('cat ') or line.strip().startswith('echo '):
                stdout, stderr, code = run_command(line.strip())
                if stdout:
                    print(f"Command output: {stdout[:200]}")
        
        return 0
        
    except Exception as e:
        print(f"ERROR: API call failed: {e}")
        return 1

if __name__ == "__main__":
    exit(main())

