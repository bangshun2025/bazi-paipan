#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v0.30.0 星曜 — ALGORITHM.md §21.2 表格幂等重写脚本。

（v0.30.0 起列名「纳音五行」→「纳音」、取值末字五行 → 完整纳音名）

把「星曜设置页 → 导出 JSON」的配置，幂等重写进 docs/ALGORITHM.md 的
`<!-- XINGYAO_TABLE_START -->` … `<!-- XINGYAO_TABLE_END -->` 区块。

用法：
  python3 scripts/sync-xingyao-algorithm.py --source <导出JSON> [--target docs/ALGORITHM.md] [--apply]

  --source  必填；星曜导出 JSON（{"map":{...}} 或直接 {"甲子":{"name","system"}}）
  --target  默认 docs/ALGORITHM.md
  --apply   缺省 dry-run（只打印将写入区块，不落盘）

安全（ADR §4.4）：锚点缺失 / 重复、source 非法 → 打印错误，退出码 ≠0，绝不写文件；
表外内容一字不改；同一 source 重复执行结果字节一致（幂等，无时间戳、无随机数）。
"""
from __future__ import print_function
import argparse, io, json, os, sys

# ===== 与 constants.js 同源（NAYIN 30 组，键序甲子→癸亥） =====
TG = '甲乙丙丁戊己庚辛壬癸'
DZ = '子丑寅卯辰巳午未申酉戌亥'
NAYIN_SRC = [
    '甲子乙丑海中金', '丙寅丁卯炉中火', '戊辰己巳大林木', '庚午辛未路旁土', '壬申癸酉剑锋金',
    '甲戌乙亥山头火', '丙子丁丑涧下水', '戊寅己卯城头土', '庚辰辛巳白蜡金', '壬午癸未杨柳木',
    '甲申乙酉泉中水', '丙戌丁亥屋上土', '戊子己丑霹雳火', '庚寅辛卯松柏木', '壬辰癸巳长流水',
    '甲午乙未沙中金', '丙申丁酉山下火', '戊戌己亥平地木', '庚子辛丑壁上土', '壬寅癸卯金箔金',
    '甲辰乙巳覆灯火', '丙午丁未天河水', '戊申己酉大驿土', '庚戌辛亥钗钏金', '壬子癸丑桑柘木',
    '甲寅乙卯大溪水', '丙辰丁巳沙中土', '戊午己未天上火', '庚申辛酉石榴木', '壬戌癸亥大海水',
]
NAYIN = {}
for _s in NAYIN_SRC:
    for _i in (0, 2):
        NAYIN[_s[_i:_i + 2]] = _s[4:]
GZ60 = [TG[i % 10] + DZ[i % 12] for i in range(60)]

START = '<!-- XINGYAO_TABLE_START -->'
END = '<!-- XINGYAO_TABLE_END -->'
HEADER = '| 六十甲子 | 纳音 | 星曜名称 | 来源体系 |'
SEP = '|---------|---------|---------|---------|'


def cell(v):
    """规整单元格：空 → —；转义竖线；去换行。"""
    if v is None:
        return '—'
    s = str(v).replace('\r', ' ').replace('\n', ' ').replace('|', '\\|').strip()
    return s if s else '—'


def load_source(path):
    try:
        with io.open(path, encoding='utf-8') as f:
            obj = json.load(f)
    except Exception as e:
        raise SystemExit('❌ --source 解析失败: %s (%s)' % (path, e))
    if isinstance(obj, dict) and isinstance(obj.get('map'), dict):
        m = obj['map']
    elif isinstance(obj, dict) and set(obj.keys()) & set(GZ60):
        m = obj
    else:
        raise SystemExit('❌ --source 结构非法：需 {"map":{...}} 或 {"干支":{...}}')
    out = {}
    for gz in GZ60:
        v = m.get(gz)
        if isinstance(v, dict):
            out[gz] = (cell(v.get('name')), cell(v.get('system')))
        elif v is None:
            out[gz] = ('—', '—')
        elif isinstance(v, str):
            out[gz] = (cell(v), '—')
        else:
            raise SystemExit('❌ --source 非法条目: %s = %r' % (gz, v))
    return out


def build_block(rows):
    lines = [START, HEADER, SEP]
    for gz in GZ60:
        name, system = rows[gz]
        lines.append('| %s | %s | %s | %s |' % (gz, NAYIN[gz], name, system))
    lines.append(END)
    return '\n'.join(lines)


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument('--source', required=True)
    ap.add_argument('--target', default='docs/ALGORITHM.md')
    ap.add_argument('--apply', action='store_true')
    args = ap.parse_args()

    rows = load_source(args.source)
    block = build_block(rows)

    if not os.path.isfile(args.target):
        raise SystemExit('❌ --target 不存在: %s' % args.target)
    with io.open(args.target, encoding='utf-8') as f:
        text = f.read()

    ns, ne = text.count(START), text.count(END)
    if ns != 1 or ne != 1:
        raise SystemExit('❌ 锚点必须各出现一次（START=%d, END=%d），不写文件' % (ns, ne))

    i = text.index(START)
    j = text.index(END) + len(END)
    new_text = text[:i] + block + text[j:]

    if not args.apply:
        print('— dry-run（未写文件），将写入区块如下 —')
        print(block)
        return 0

    if new_text == text:
        print('✅ 区块已是最新，无需变更（幂等）')
        return 0
    with io.open(args.target, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('✅ 已重写 §21.2 区块: %s' % args.target)
    return 0


if __name__ == '__main__':
    sys.exit(main())
