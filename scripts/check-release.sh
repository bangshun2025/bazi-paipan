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
KEYS="gzTabAll gzTabFav gzFooterFav gzSettingsActionsAll gzFooterAll btnScreenshot authOverlay recordsOverlay recordDetailOverlay btnSaveCloud btnMyRecords btnLogout authEmail regEmail btnAuthLogin btnAuthRegister btnAuthRegister2 authLinkLogin authLinkRegister recordsList recordDetail"
MODULES="constants algorithm archive gongwei render main config auth records supabase.min"
FAIL=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; FAIL=1; }

echo "【1/4】三文件内联 JS 语法检查（node --check）"
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

echo "【2/4】index.html vs standalone.html 模块段一致性"
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

echo "【3/4】三文件 HTML 关键 id 存在性"
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

echo "【4/4】外部 JS vs 单体版内联段一致性（防模块版改/内联版没改漂移）"
for m in config auth records supabase.min; do
  ext="$m.js"
  [ -f "$ext" ] || { fail "缺少外部文件: $ext"; continue; }
  [ -f standalone.html ] || { fail "缺少 standalone.html，跳过内联比对"; continue; }
  python3 - "$m" "$ext" "$TMP/inline_$m.js" <<'PYEOF'
import sys
m = sys.argv[1]
src = open('standalone.html', encoding='utf-8').read()
idx = src.find(f'— {m}.js */')
if idx == -1:
    open(sys.argv[3], 'w', encoding='utf-8').write('')
    raise SystemExit(0)
start = src.rfind('<script>', 0, idx)
end = src.find('</script>', idx)
block = src[start:end]
# 去掉 <script> 标签与插入的定位注释行（/* 八字排盘 v0.24.0 — xxx.js */）
body = block[len('<script>'):].lstrip('\n')
lines = body.split('\n')
if lines and lines[0].startswith('/* 八字排盘 v0.24.0 —'):
    body = '\n'.join(lines[1:]).lstrip('\n')
body = body.rstrip('\n')
open(sys.argv[3], 'w', encoding='utf-8').write(body)
PYEOF
  if [ ! -s "$TMP/inline_$m.js" ]; then
    fail "内联段未找到: $m.js"
  elif cmp -s <(python3 -c "import sys; sys.stdout.write(open('$ext',encoding='utf-8').read().rstrip('\n'))") <(python3 -c "import sys; sys.stdout.write(open('$TMP/inline_$m.js',encoding='utf-8').read().rstrip('\n'))"); then
    pass "$m.js 外部 vs 内联一致"
  else
    fail "$m.js 外部 vs 内联不一致（漂移！）"
  fi
done

echo "----------------------------------------"
if [ $FAIL -eq 0 ]; then
  echo "🎉 全部校验通过，可以发布。"
  exit 0
else
  echo "⚠️  存在失败项，禁止发布。"
  exit 1
fi
