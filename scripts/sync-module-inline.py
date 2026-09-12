#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""三端模块一致性：外部 *.js 与 index.html / standalone.html 内联副本对齐。

为什么需要它：check-release.sh 第【2/4】步只比 index vs standalone，
第【4/4】步只覆盖 7 个小模块 —— constants/algorithm/archive/render/main
五个大模块的外部文件从未被比对，曾因此漂移（v0.23.1 农历取值修复、
P0-01 守卫修复只落在内联，外部文件落后）。

切段规则：constants/algorithm/archive 共用同一 <script> 块、render/main 亦同块，
故必须以「下一个模块标记」为边界，不能按 <script> 边界切。

用法：
  python3 scripts/sync-module-inline.py            # 只检查（退出码 1 = 有漂移）
  python3 scripts/sync-module-inline.py --apply    # 用内联内容重写漂移的外部文件
  python3 scripts/sync-module-inline.py --apply --set-version 0.31.0
                                                  # 同时把重写文件头部版本改为 0.31.0

方向说明：以 index.html 内联副本为真相源（它才是线上生效的代码）；
写回时保留外部文件原有的头部注释块。
"""
import sys, os, hashlib

MODULES = ['constants', 'algorithm', 'archive', 'render', 'main']
MARKER = '/* 八字排盘 v'


def strip_header(s):
    lines = s.split('\n')
    i = 0
    while i < len(lines):
        t = lines[i].lstrip()
        if t.startswith(MARKER):
            if '*/' in lines[i]:
                i += 1
            else:
                i += 1
                while i < len(lines) and '*/' not in lines[i]:
                    i += 1
                i += 1
        else:
            break
    return '\n'.join(lines[i:])


def segment(src, m):
    idx = src.find(f'— {m}.js */')
    if idx == -1:
        return None
    seg_start = src.rfind(MARKER, 0, idx)
    if seg_start == -1:
        seg_start = idx
    end = len(src)
    for other in MODULES:
        if other != m:
            j = src.find(f'— {other}.js */', idx + 1)
            if j != -1 and j < end:
                end = j
    e = src.find('</script>', idx)
    if e != -1 and e < end:
        end = e
    if end != len(src):
        back = src.rfind(MARKER, 0, end)
        if back != -1 and back > seg_start:
            end = back
    return strip_header(src[seg_start:end]).strip('\n')


def md5(s):
    return hashlib.md5(s.encode()).hexdigest()[:8] if s is not None else 'NONE'


def main():
    args = sys.argv[1:]
    apply = '--apply' in args
    set_version = None
    if '--set-version' in args:
        set_version = args[args.index('--set-version') + 1]
    repo = [a for a in args if not a.startswith('--') and a != set_version]
    repo = repo[0] if repo else '.'
    i_path, s_path = os.path.join(repo, 'index.html'), os.path.join(repo, 'standalone.html')
    index_src = open(i_path, encoding='utf-8').read()
    standalone_src = open(s_path, encoding='utf-8').read()

    print(f'仓库: {os.path.abspath(repo)}   模式: {"执行" if apply else "检查"}')
    drifted = []
    for m in MODULES:
        ext_path = os.path.join(repo, m + '.js')
        raw = open(ext_path, encoding='utf-8').read()
        body = strip_header(raw).strip('\n')
        i_body = segment(index_src, m)
        s_body = segment(standalone_src, m)
        if i_body is None or s_body is None:
            print(f'  ❌ {m:<10} 内联段未找到')
            drifted.append(m)
            continue
        if i_body != s_body:
            print(f'  ❌ {m:<10} index 与 standalone 内联不一致（先修它们）')
            drifted.append(m)
            continue
        if body == i_body:
            print(f'  ✅ {m:<10} 外部 ≡ 内联  ({md5(body)}, {len(body.encode())} B)')
            continue
        drifted.append(m)
        print(f'  ❌ {m:<10} 外部 {md5(body)} {len(body.encode())} B  ≠  内联 {md5(i_body)} {len(i_body.encode())} B')
        if not apply:
            continue
        header = raw[:len(raw) - len(strip_header(raw))]
        if set_version:
            lines = header.split('\n')
            for i, ln in enumerate(lines):
                if ln.lstrip().startswith(MARKER):
                    lines[i] = f'/* 八字排盘 v{set_version} — {m}.js */'
                    break
            header = '\n'.join(lines)
        new = header + i_body + '\n'
        open(ext_path, 'w', encoding='utf-8').write(new)
        check = strip_header(open(ext_path, encoding='utf-8').read()).strip('\n')
        assert check == i_body, f'{m}: 写回校验失败'
        print(f'     ↳ 已按内联重写 {m}.js（{len(new.encode())} B / {new.count(chr(10))} 行），头部版本 {set_version or "保留"}')

    print('-' * 72)
    if not drifted:
        print('✅ 五个核心模块三端一致')
        return 0
    print(('❌ 漂移: ' + ', '.join(drifted)) if not apply else f'✅ 已重写: {", ".join(drifted)}')
    return 0 if apply else 1


if __name__ == '__main__':
    sys.exit(main())
