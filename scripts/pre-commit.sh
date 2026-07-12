#!/bin/bash
# 八字排盘 · Pre-commit Hook
# 安装: ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
# 或者: git config core.hooksPath .githooks && cp scripts/pre-commit.sh .githooks/pre-commit

set -e

echo "🔍 pre-commit: clacky ext verify..."

if command -v clacky &>/dev/null; then
  clacky ext verify 2>&1 | grep -E '\[ERR\]' && {
    echo "❌ ext verify 发现错误，提交已阻断。请修复后重试。"
    exit 1
  } || true
  echo "✅ ext verify 通过"
else
  echo "⚠️  clacky 命令不可用，跳过 ext verify"
fi

echo "✅ pre-commit 检查完成"
