#!/bin/bash
# ============================================================
# 三文件发布一致性校验（v0.20.2 / v0.20.3 事故防线）
# 用法: bash scripts/check-release.sh [目录]   （默认当前目录）
# 校验项：
#   1. 三文件内联 JS 逐个 node --check（防 \n 转义符→字面换行）
#   2. index.html vs standalone.html 六模块段（constants/algorithm/
#      archive/gongwei/render/main）逐段一致
#   3. 三文件 HTML 关键结构 id 全部存在（防 tab 等结构漏同步）
# 全部通过退出码 0，任一失败退出码 1。
# ============================================================
set -u
DIR="${1:-$(pwd)}"
cd "$DIR" || { echo "❌ 目录不存在: $DIR"; exit 1; }

FILES="index.html standalone.html standalone-split.html"
KEYS="gzTabAll gzTabFav gzFooterFav gzSettingsActionsAll gzFooterAll btnScreenshot"
MODULES="constants algorithm archive gongwei render main"
FAIL=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; FAIL=1; }

echo "【1/3】三文件内联 JS 语法检查（node --check）"
for f in $FILES; do
  [ -f "$f" ] || { fail "缺少文件: $f"; continue; }
  # 提取无 src 的内联 <script> 内容
  python3 - "$f" "$TMP/$(basename "$f").js" <<'PYEOF'
import re, sys
src = open(sys.argv[1], encoding='utf-8').read()
scripts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', src, re.S)
out = '\n;\n'.join(scripts)
open(sys.argv[2], 'w', encoding='utf-8').write(out)
PYEOF
  if node --check "$TMP/$(basename "$f").js" 2>"$TMP/err.txt"; then
    pass "$f 语法 OK"
  else
    fail "$f 语法错误: $(head -3 "$TMP/err.txt" | tr '\n' ' ')"
  fi
done

echo "【2/3】index.html vs standalone.html 六模块段一致性"
if [ -f index.html ] && [ -f standalone.html ]; then
  for m in $MODULES; do
    python3 - "$m" "index.html" "standalone.html" "$TMP/i_$m.js" "$TMP/s_$m.js" <<'PYEOF'
import sys
m = sys.argv[1]
def extract(fn):
    src = open(fn, encoding='utf-8').read()
    # 定位 /* 八字排盘 vX — <m>.js */ 起始，到下一个 </script> 结束
    idx = src.find(f'— {m}.js */')
    if idx == -1: return None
    start = src.rfind('<script>', 0, idx)
    end = src.find('</script>', idx)
    return src[start:end]
a, b = extract(sys.argv[2]), extract(sys.argv[3])
if a is None or b is None:
    print(f'NONE {m}')
else:
    open(sys.argv[4], 'w', encoding='utf-8').write(a)
    open(sys.argv[5], 'w', encoding='utf-8').write(b)
    print('OK')
PYEOF
    if [ ! -f "$TMP/i_$m.js" ] || [ ! -f "$TMP/s_$m.js" ]; then
      fail "模块段未找到: $m.js"
    elif cmp -s "$TMP/i_$m.js" "$TMP/s_$m.js"; then
      pass "$m.js 一致"
    else
      fail "$m.js 不一致（index.html vs standalone.html）"
    fi
  done
else
  fail "缺少 index.html 或 standalone.html，跳过六模块对比"
fi

echo "【3/3】三文件 HTML 关键 id 存在性"
for f in $FILES; do
  [ -f "$f" ] || { fail "缺少文件: $f"; continue; }
  for k in $KEYS; do
    if grep -q "id=\"$k\"" "$f"; then
      pass "$f 含 $k"
    else
      fail "$f 缺 id=$k"
    fi
  done
done

echo "----------------------------------------"
if [ $FAIL -eq 0 ]; then
  echo "🎉 全部校验通过，可以发布。"
  exit 0
else
  echo "⚠️  存在失败项，禁止发布。"
  exit 1
fi
