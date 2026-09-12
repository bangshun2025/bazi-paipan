#!/bin/bash
# ============================================================
# 三文件发布一致性校验（v0.20.2 / v0.20.3 事故防线）
# 用法: bash scripts/check-release.sh [目录]   （默认当前目录）
# 校验项：
#   1. 三文件内联 JS 逐个 node --check（防 \n 转义符→字面换行）
#   2. index.html vs standalone.html 六模块段（constants/algorithm/
#      archive/gongwei/render/main）逐段一致
#   3. 三文件 HTML 关键结构 id 全部存在（防 tab 等结构漏同步）
#   4. 外部 JS vs 单体版内联段（7 个小模块）
#   5. 外部 JS vs 单体版内联段（5 个核心模块，v0.31.0 新增；v0.23.1/P0-01
#      修复曾只落内联、外部落后 → 由本步兜底）
#   6. 节气边界真值门禁（v0.31.0 新增；独立真值源 HKO / JPL DE421，
#      防「显示层对、比较基准错」的 8 小时错位回归）
# 全部通过退出码 0，任一失败退出码 1。
# ============================================================
set -u
DIR="${1:-$(pwd)}"
cd "$DIR" || { echo "❌ 目录不存在: $DIR"; exit 1; }

FILES="index.html standalone.html standalone-split.html"
KEYS="gzTabAll gzTabFav gzFooterFav gzSettingsActionsAll gzFooterAll btnScreenshot authOverlay recordsOverlay recordDetailOverlay btnSaveCloud btnMyRecords btnLogout authEmail regEmail btnAuthLogin btnAuthRegister btnAuthRegister2 authLinkLogin authLinkRegister recordsList recordDetail btnExportConfig btnImportConfig gzFileImport gzCloudSyncNote jieqi-section jq-gz jq-tsmd jq-tstm xySettingsOverlay xySettingsList xy-trigger xy-note xySearchBar xySearchInput xySearchClear xySearchCount xySearchEmpty xy-group-title archive-tag-bar archive-tag-default-panel btnDefaultTag"
MODULES="constants algorithm archive gongwei xingyao render main config auth records gongwei-cloud supabase.min"
FAIL=0
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; FAIL=1; }

echo "【1/6】三文件内联 JS 语法检查（node --check）"
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

echo "【2/6】index.html vs standalone.html 模块段一致性"
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

echo "【3/6】三文件 HTML 关键 id 存在性"
# 运行时生成的 DOM key（在 render.js/main.js 代码里而非静态 HTML），
# standalone-split.html 用外部 render.js，故允许在 JS 源码中兜底命中。
RUNTIME_KEYS="jieqi-section jq-gz jq-tsmd jq-tstm xy-trigger"
for f in $FILES; do
  [ -f "$f" ] || { fail "缺少文件: $f"; continue; }
  for k in $KEYS; do
    if grep -q "id=\"$k\"" "$f"; then
      pass "$f 含 $k"
    elif grep -qE "class=\"[^\"]*${k}([ \"]|$)" "$f"; then
      pass "$f 含 class=$k"
    elif case " $RUNTIME_KEYS " in *" $k "*) true;; *) false;; esac && \
         { { [ -f render.js ] && grep -q "$k" render.js; } || { [ -f main.js ] && grep -q "$k" main.js; } || { [ -f xingyao.js ] && grep -q "$k" xingyao.js; }; }; then
      pass "$f 运行时生成 $k (render/main/xingyao.js)"
    else
      fail "$f 缺 id/class=$k"
    fi
  done
done

echo "【4/6】外部 JS vs 单体版内联段一致性（防模块版改/内联版没改漂移）"
for m in gongwei xingyao gongwei-cloud config auth records supabase.min; do
  ext="$m.js"
  [ -f "$ext" ] || { fail "缺少外部文件: $ext"; continue; }
  [ -f standalone.html ] || { fail "缺少 standalone.html，跳过内联比对"; continue; }
  python3 - "$m" "$ext" "$TMP/inline_$m.js" "$TMP/ext_$m.js" <<'PYEOF'
import sys, re
m, ext, out_inline, out_ext = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
def strip_header(s):
    # 去掉文件头连续的 /* 八字排盘 vX — xxx.js */ 版本注释块（1 行或多行块）
    lines = s.split('\n')
    i = 0
    while i < len(lines):
        t = lines[i].lstrip()
        if t.startswith('/* 八字排盘 v'):
            if '*/' in lines[i]:
                i += 1
            else:
                i += 1
                while i < len(lines) and '*/' not in lines[i]:
                    i += 1
                i += 1
        else:
            break
    return '\n'.join(lines[i:]).lstrip('\n')
src = open('standalone.html', encoding='utf-8').read()
idx = src.find(f'— {m}.js */')
if idx == -1:
    open(out_inline, 'w', encoding='utf-8').write('')
else:
    start = src.rfind('<script>', 0, idx)
    end = src.find('</script>', idx)
    block = src[start:end]
    body = block[len('<script>'):].lstrip('\n')
    body = strip_header(body).rstrip('\n')
    open(out_inline, 'w', encoding='utf-8').write(body)
open(out_ext, 'w', encoding='utf-8').write(strip_header(open(ext, encoding='utf-8').read()).rstrip('\n'))
PYEOF
  if [ ! -s "$TMP/inline_$m.js" ]; then
    fail "内联段未找到: $m.js"
  elif cmp -s "$TMP/ext_$m.js" "$TMP/inline_$m.js"; then
    pass "$m.js 外部 vs 内联一致"
  else
    fail "$m.js 外部 vs 内联不一致（漂移！）"
  fi
done

echo "【5/6】外部 JS vs 内联段一致性（5 个核心模块）"
if [ ! -f scripts/sync-module-inline.py ]; then
  fail "缺少 scripts/sync-module-inline.py"
else
  python3 scripts/sync-module-inline.py . > "$TMP/module_sync.log" 2>&1 && rc=0 || rc=$?
  if [ "${rc:-0}" -eq 0 ]; then
    pass "constants/algorithm/archive/render/main 外部与内联一致"
  else
    fail "核心模块漂移：$(grep -m3 '❌' "$TMP/module_sync.log" | tr '\n' ' ')（用 python3 scripts/sync-module-inline.py --apply 同步）"
  fi
fi

echo "【6/6】节气边界真值门禁（独立真值源：香港天文台 / JPL DE421）"
if [ ! -f scripts/check-term-truth.js ]; then
  fail "缺少 scripts/check-term-truth.js"
else
  node scripts/check-term-truth.js . > "$TMP/term_truth.log" 2>&1 && rc=0 || rc=$?
  if [ "${rc:-0}" -eq 0 ]; then
    pass "节气显示层与 24 个换月边界点全部符合真值"
  else
    fail "节气真值门禁失败：$(grep -m3 '❌' "$TMP/term_truth.log" | tr '\n' ' ')"
  fi
fi

echo "----------------------------------------"
if [ $FAIL -eq 0 ]; then
  echo "🎉 全部校验通过，可以发布。"
  exit 0
else
  echo "⚠️  存在失败项，禁止发布。"
  exit 1
fi
