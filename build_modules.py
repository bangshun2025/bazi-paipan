#!/usr/bin/env python3
"""P2 架构拆分：最终生成脚本"""
import re, os

with open('standalone_v0.15.0_backup.html', 'r') as f:
    lines = f.readlines()

def extract(ranges):
    code = []
    for start, end in ranges:
        for i in range(start - 1, end):
            code.append(lines[i])
    return ''.join(code)

# ============================================================
# 模块提取范围
# ============================================================
const_ranges = [
    (751, 1132),   # LOC_DATA
    (1367, 1410),  # TG, DZ, WU_XING, WX_CSS, GONGWEI_MAP, GW_INDEX, GONGWEI_COLORS
    (1588, 1680),  # LUNAR_INFO, LUNAR_NEW_YEAR (before calendarType)
    (1682, 1709),  # NAYIN, CANG_GAN, ZHI_TWIN_MAIN, ZHI_TWIN_CANG (before twinPillars)
    (1710, 1710),  # twinPillars (constant, moved from render)
    (1711, 1954),  # CS12_MAP, CS12_N, NAYIN_WX_YANG, KONG_WANG, SOLAR_TERMS (before getSolarTerm)
    (1968, 1974),  # S_TERM_NAME, MONTH_TERM
    (1983, 1983),  # WU_HU_DUN
    (2025, 2025),  # WU_SHU_DUN
    (2036, 2042),  # SHI_SHEN_SHORT
    (2067, 2068),  # ZHI_WX, ZHI_MAIN
    (4099, 4103),  # ARCH_KEY, TRASH_KEY, ARCH_KEY_OLD, TRASH_KEY_OLD, ARCH_BACKUP_KEY (needed by archive before render loads)
]

algo_ranges = [
    (1226, 1365),  # 农历辅助 + 真太阳时
    (1955, 1966),  # getSolarTerm
    (1975, 1982),  # yearPillar
    (1985, 2024),  # monthPillar, dayPillar (before WU_SHU_DUN)
    (2027, 2033),  # hourPillar
    (2043, 2065),  # shiShen
    (2070, 2427),  # zhiShiShen through buildShunLabel (before gongwei section)
]

# For gongwei, we need everything from 1410 to 1587 (CRUD) plus 2428 to 2945 (UI)
# But careful: 2428-2561 is between paipan end and renderGongWeiPanel
gw_ranges = [
    (1410, 1587),  # 宫位CRUD
    (2428, 2945),  # 宫位标签行 + 宫位面板
    (4105, 4119),  # 宫位数据初始化
]

render_ranges = [
    (2947, 4098),  # 主渲染 (toggleSimple through before storage keys)
    (4104, 4104),  # renderChartToHtml (after storage keys)
    (4738, 4883),  # 档案渲染辅助 (extractBaziFromPaipan through renderChartToHtml)
]

archive_ranges = [
    (4120, 4736),  # 预置数据 + CRUD + 编辑弹窗 + 回收站
    (4887, 5007),  # 档案面板UI
]

main_ranges = [
    (1133, 1222),  # 地点/日历初始化
    (1268, 1313),  # 日历切换 + 真太阳时预览
    (1681, 1681),  # calendarType
    (4717, 4737),  # 当前排盘结果缓存
    (5010, 5179),  # AI录入
    (5180, 5493),  # 回归测试（排除最后的 </script>）
]

# 保存原始提取（供参考）
os.makedirs('_extracted', exist_ok=True)
modules = {
    'constants': (const_ranges, 'CONST'),
    'algorithm': (algo_ranges, 'ALGO'),
    'gongwei': (gw_ranges, 'GONGWEI'),
    'render': (render_ranges, 'RENDER'),
    'archive': (archive_ranges, 'ARCHIVE'),
    'main': (main_ranges, 'APP'),
}

for name, (ranges, ns) in modules.items():
    code = extract(ranges)
    with open(f'_extracted/{name}_raw.js', 'w') as f:
        f.write(code)
    print(f"{name}_raw.js: {len(code.split(chr(10)))} lines")

# ============================================================
# HTML 修改：替换 script 块 + 更新 onclick
# ============================================================
html_lines = []
for i, line in enumerate(lines, 1):
    if i == 745:  # <script> 开始
        html_lines.append('<!-- 八字排盘 v0.16.0 — 模块加载 -->\n')
        html_lines.append('<script src="constants.js"></script>\n')
        html_lines.append('<script src="algorithm.js"></script>\n')
        html_lines.append('<script src="archive.js"></script>\n')
        html_lines.append('<script src="gongwei.js"></script>\n')
        html_lines.append('<script src="render.js"></script>\n')
        html_lines.append('<script src="main.js"></script>\n')
        continue  # Skip until </script>
    elif i <= 744:
        # HTML/CSS section — update onclick/onchange
        line_updated = line
        
        # Static HTML onclick/onchange replacements
        replacements = [
            ("onchange=\"toggleCalendar('solar')\"", "onchange=\"APP.toggleCalendar('solar')\""),
            ("onchange=\"toggleCalendar('lunar')\"", "onchange=\"APP.toggleCalendar('lunar')\""),
            ('onchange="toggleSolar()"', 'onchange="APP.toggleSolar()"'),
            ('onchange="onProvChange()"', 'onchange="APP.onProvChange()"'),
            ('onchange="onCityChange()"', 'onchange="APP.onCityChange()"'),
            ('onclick="doPaipan()"', 'onclick="APP.doPaipan()"'),
            ('onclick="openArchivePanel()"', 'onclick="ARCHIVE.openArchivePanel()"'),
            ('onclick="showTrash()"', 'onclick="ARCHIVE.showTrash()"'),
            ('onclick="showAiInput()"', 'onclick="APP.showAiInput()"'),
            ('onclick="hideAiInput()"', 'onclick="APP.hideAiInput()"'),
            ('onclick="doAiParse()"', 'onclick="APP.doAiParse()"'),
            ('onclick="hideTrash()"', 'onclick="ARCHIVE.hideTrash()"'),
            ('onclick="emptyTrash()"', 'onclick="ARCHIVE.emptyTrash()"'),
            ('onclick="closeArchivePanel()"', 'onclick="ARCHIVE.closeArchivePanel()"'),
            ('onclick="filterArchives(', 'onclick="ARCHIVE.filterArchives('),
            ('onclick="closeEditPanel()"', 'onclick="ARCHIVE.closeEditPanel()"'),
            ('onchange="editCalChange()"', 'onchange="ARCHIVE.editCalChange()"'),
            ('onchange="editSolarToggle()"', 'onchange="ARCHIVE.editSolarToggle()"'),
            ('onchange="editProvChange()"', 'onchange="ARCHIVE.editProvChange()"'),
            ('onchange="editCityChange()"', 'onchange="ARCHIVE.editCityChange()"'),
            ('onclick="saveEdit()"', 'onclick="ARCHIVE.saveEdit()"'),
            ('onclick="closeGzSettings()"', 'onclick="GONGWEI.closeGzSettings()"'),
            ('onclick="openGzEdit()"', 'onclick="GONGWEI.openGzEdit()"'),
        ]
        for old, new in replacements:
            line_updated = line_updated.replace(old, new)
        
        html_lines.append(line_updated)
    elif i > 5494:
        html_lines.append(line)
    # Lines 745-5494: skipped (replaced by script refs)

# 更新版本注释
html_str = ''.join(html_lines)
html_str = html_str.replace('v0.13.4', 'v0.16.0')
# 修正日期
html_str = html_str.replace('| 2026-08-06 -->', '| 2026-08-06 -->')

with open('standalone.html', 'w') as f:
    f.write(html_str)
print(f"\nstandalone.html: {len(html_str.split(chr(10)))} lines")

print("\n=== 原始提取文件已保存到 _extracted/ ===")
print("下一步：手动包装每个模块的 IIFE + 别名 + 导出")
