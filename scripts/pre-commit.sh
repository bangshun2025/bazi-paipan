#!/bin/bash
# 八字排盘 · Pre-commit Hook
# 安装: ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
# 或者: git config core.hooksPath .githooks && cp scripts/pre-commit.sh .githooks/pre-commit

set -e

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")"
cd "$ROOT"

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

echo "🔍 pre-commit: 三文件一致性校验（v0.20.2/v0.20.3 事故防线）..."

if [ -f scripts/check-release.sh ] && command -v node &>/dev/null; then
  if bash scripts/check-release.sh . >/dev/null 2>&1; then
    echo "✅ 三文件一致性校验通过"
  else
    echo "❌ 三文件一致性校验失败（语法/六模块/关键id），提交已阻断。"
    echo "   运行 bash scripts/check-release.sh . 查看详情"
    exit 1
  fi
else
  echo "⚠️  check-release.sh 或 node 不可用，跳过三文件校验"
fi

echo "✅ pre-commit 检查完成"
