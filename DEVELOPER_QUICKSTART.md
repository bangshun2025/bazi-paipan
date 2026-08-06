# 开发者速查 · 八字排盘 · 从真版

> **给 AI 的第一眼**：新 session 读完本文即可了解项目全貌、快速定位代码、避开已知坑。
> 最后更新：2026-08-06（v0.16.0）

---

## 一、项目概览

模块化 HTML 八字排盘应用，零构建步骤，`<script>` 标签直接加载，GitHub Pages 原生兼容。Clacky 面板通过 iframe 嵌入。

- **主文件**：`standalone.html`（754 行 HTML/CSS 骨架）+ 6 个 JS 模块（共 5641 行，v0.16.0）
- **仓库**：[bangshun2025/bazi-paipan](https://github.com/bangshun2025/bazi-paipan)
- **部署**：`/Users/feng/.clacky/ext/local/bazi-paipan/`（与 `运行/` 通过硬链接共享同一份物理文件）

---

## 二、文件地图

### 运行/ 根目录

| 文件 | 用途 | 操作 |
|------|------|------|
| `standalone.html` | **HTML/CSS 骨架**（754行），含输入表单、弹窗、样式 | 改 UI 结构/样式改这个 |
| `constants.js` | 常量/数据表（857行）：天干地支、五行、宫位映射、农历数据、节气表 | 加常量改这个 |
| `algorithm.js` | 排盘核心（672行）：四柱/十神/长生/纳音/纳运/神煞/三垣/真太阳时 | ⭐ 改算法必改 |
| `archive.js` | 档案管理（866行）：卡片列表/搜索/展开/回收站/预置数据 | 改档案改这个 |
| `gongwei.js` | 宫位自定义（860行）：数据层 CRUD/回收站/排序/导入导出 | 改宫位改这个 |
| `render.js` | UI 渲染（1513行）：表格/标签行/Popover/大运流年/双胞胎卡片 | 改渲染改这个 |
| `main.js` | 入口/事件（873行）：初始化/事件绑定/回归测试(?test=1) | 改入口逻辑改这个 |
| `build_modules.py` | 构建脚本：将 JS 模块内联回 standalone.html | 单文件部署用 |
| `debug_all.html` | 调试页面：8 iframe 同时加载所有组合验证 | 调试用 |
| `index.html` | 独立页面入口（iframe standalone） | 一般不改 |
| `ability-chart.html` | 能力排盘独立模块 | 改能力图改这个 |
| `CHANGELOG.md` | 版本历史，每个版本的功能/技术/测试摘要 | 查历史第一站 |
| `RELEASE_CHECKLIST.md` | 发布前检查清单（代码/回归/UI/文档/发布） | 每次发布必查 |
| `UPGRADE_PLAN.md` | 开发体系升级三阶段规划 | 了解长期演进方向 |
| `README.md` | 项目介绍 | 理解背景 |
| `ext.yml` | Clacky 扩展配置（面板注册、API路由） | 改面板配置 |
| `archives.json` | 预置档案数据（自在班16孩） | 改预置数据 |
| `api/` | Ruby API handler（藏干替换等） | 后端逻辑 |
| `scripts/` | 运维脚本 | 一般不碰 |
| `tests/` | 测试文件 | 查测试 |
| `panels/` | Clacky 面板定义（launcher + paipan） | 改面板UI |
| `.github/` | GitHub Actions 配置 | CI/CD |

### docs/ 历史文档

| 文档 | 说明 |
|------|------|
| `ALGORITHM.md` | **算法真相源**，所有排盘规则权威定义，代码实现必须以此为准 |
| `ARCHITECTURE.md` | 架构决策记录（ADR），单文件策略/双胞布局/面板设计 |
| `PRD_vX.Y.Z_*.md` | 产品需求文档（按版本+功能命名） |
| `ADR_vX.Y.Z_*.md` | 架构决策记录（按版本+功能命名） |
| `TEST_vX.Y.Z_*.md` | 测试报告（按版本+功能命名） |
| `RETRO_vX.Y.Z_*.md` | 复盘报告，含根因分析 |
| `BUG_v*.md` | Bug 根因分析 |
| `_TEMPLATE/` | **新功能开发模板**（PRD/ADR/变更记录/QA/流程/发布），复制即用 |
| `PIPELINE_*.md` / `GIT_*.md` | 流水线与 Git 操作记录 |
| `*_v0.9.*` | 档案管理系统（卡片列表/搜索/展开/预置数据） |
| `*_v0.7.0_宫位*` | 宫位标签基础功能 |
| `*_v0.12.0_纳运*` | 纳音五行十二长生（纳运） |
| `*_v0.2.0_双胞胎*` | 双胞胎对比排盘 |

---

## 三、模块代码段索引（v0.16.0 拆分后）

### standalone.html（754 行）— HTML/CSS

| 行号 | 内容 |
|------|------|
| 1-754 | 完整 HTML 骨架：输入表单、排盘区、宫位弹窗、档案模态框、所有 CSS 样式 |
| 741-751 | 模块加载（`<script src="constants.js">` 等 6 行，按加载顺序） |

### constants.js（857 行）— 常量与数据表

| 行号 | 内容 |
|------|------|
| 1-385 | 中国省市县经度数据（`LOC_DATA`） |
| 386-420 | 天干地支常量（`TG`、`DZ`）、五行映射（`WU_XING`、`WX_CSS`）、宫位映射（`GONGWEI_MAP`、`GW_INDEX`） |
| 421-440 | 宫位多选颜色映射（`GONGWEI_COLORS`、`GONGWEI_COLOR_KEYS`） |
| 441-480 | 纳音（`NAYIN`）、藏干（`CANG_GAN`）、双胞胎藏干替换表 |
| 481-510 | 十二长生映射（`CS12_MAP`、`CS12_N`）、空亡（`KONG_WANG`） |
| 511-540 | 节气数据表（`SOLAR_TERMS`、`S_TERM_NAME`、`MONTH_TERM`） |
| 541-580 | 五虎遁（`WU_HU_DUN`）、五鼠遁（`WU_SHU_DUN`）、纳运五行阳干（`NAYIN_WX_YANG`） |
| 581-820 | 农历数据表（1900-2100，寿星万年历）、`LUNAR_NEW_YEAR`、`LUNAR_MONTH_OPTIONS` |
| 821-857 | `window.CONST` 命名空间导出 |

### algorithm.js（672 行）— ⭐ 排盘核心算法

| 行号 | 内容 |
|------|------|
| 1-30 | 别名声明（从 CONST 引用的常量） |
| 31-105 | 农历转换：`lunarToSolar()`、`toggleCalendar()`、`updateSolarPreview()` |
| 106-160 | 真太阳时：`getLng()`、`dayOfYear()`、`equationOfTime()`、`trueSolarTime()` |
| 161-195 | 节气查询：`getSolarTerm()` |
| 196-235 | **四柱计算**：`yearPillar()`、`monthPillar()`（五虎遁）、`dayPillar()`、`hourPillar()`（五鼠遁） |
| 236-280 | **十神**：`shiShen()`、`zhiShiShen()` |
| 281-320 | **十二长生**：长生位计算 |
| 321-365 | **藏干**：`ZHI_CANG` 查表、双胞胎藏干替换 |
| 366-395 | 空亡、神煞 |
| 396-430 | **三垣**：`taiYuan()`、`mingGong()`、`shenGong()` |
| 431-490 | **大运 & 起运**：顺逆排、起运年龄、大运干支 |
| 491-520 | 流年干支 |
| 521-565 | **人元司令**：`renYuanSiLing()` |
| 566-600 | **纳运**：`nayunChangSheng()` |
| 601-629 | **主计算**：`calc()`（排盘主入口） |
| 630-672 | `window.ALGO` 命名空间导出（20 个函数） |

### archive.js（866 行）— 档案管理

| 行号 | 内容 |
|------|------|
| 1-84 | 别名声明（从 CONST 引用的常量） |
| 85-104 | **预置档案数据**（`PRESET_ARCHIVES`：自在班 16 孩） |
| 105-174 | 数据迁移：`migrateFromV1()` |
| 175-270 | 档案 CRUD：`getArchives()`、`saveArchives()`、`deleteArchive()`、`restoreArchive()` |
| 271-400 | 档案搜索/过滤/排序 |
| 401-500 | 档案卡片渲染：卡片列表 |
| 501-612 | 档案展开排盘（手风琴模式）、加载到表单 |
| 613-700 | 回收站：`renderTrash()` |
| 701-750 | 档案面板：`openArchivePanel()`、`closeArchivePanel()` |
| 751-823 | 归档模态框：`renderArchiveModal()` |
| 824-866 | `window.ARCHIVE` 命名空间导出（20 个函数） |

### gongwei.js（860 行）— 宫位自定义数据层

| 行号 | 内容 |
|------|------|
| 1-87 | 别名声明（从 CONST 引用的常量） |
| 88-129 | `loadGroups()`：从 localStorage 加载宫位组 |
| 130-250 | CRUD：`addGroup()`、`updateGroup()`、`deleteGroup()`、`resetDefault()` |
| 251-400 | 回收站管理 |
| 401-550 | 选中状态管理、排序、导入导出 |
| 551-700 | 宫位设置面板渲染、Popover 勾选 |
| 701-820 | 宫位编辑弹窗：`checkCloseGzEdit()`、`saveGzEdit()` |
| 821-860 | `window.GONGWEI` 命名空间导出（30+ 函数） |

### render.js（1513 行）— UI 渲染

| 行号 | 内容 |
|------|------|
| 1-100 | 别名声明（从 CONST/ALGO/ARCHIVE/GONGWEI 引用） |
| 101-250 | 排盘表格渲染：`renderChart()`、`renderChartToHtml()` |
| 251-400 | 精简模式：`toggleSimple()` |
| 401-650 | 宫位标签行注入、Popover 渲染 |
| 651-900 | 大运流年渲染与交互：`hiDy()`、`hiLn()`、`_applyDLUpdates()` |
| 901-1100 | 双胞胎卡片：`renderTwinCardsHtml()`、差异高亮 |
| 1101-1300 | 龙凤胎独立双卡、三模式切换、三垣折叠 |
| 1301-1450 | 能力排盘按钮：`openAbilityChart()`、`scrollToNow()` |
| 1451-1513 | `window.RENDER` 命名空间导出（30+ 函数） |

### main.js（873 行）— 入口/事件/测试

| 行号 | 内容 |
|------|------|
| 1-100 | 别名声明（从 CONST/ALGO/ARCHIVE/GONGWEI/RENDER 引用） |
| 101-226 | 地理位置初始化：`initLoc()`、`toggleSolar()`、`setupTwinTypeChange()` |
| 227-300 | 省市选择：`onProvChange()`、`onCityChange()` |
| 301-450 | 排盘入口：`doPaipan()`、事件绑定 |
| 451-600 | 全局事件监听、键盘快捷键 |
| 601-750 | 初始化脚本：DOM Ready 后依次初始化 |
| 751-873 | **回归测试**（`?test=1`）：199 条自动断言，含全量快照/十神/纳音/长生/边界幂等 |

---

## 四、功能→版本→文档 索引

| 功能 | 版本 | PRD | ADR | TEST | RETRO |
|------|------|-----|-----|------|-------|
| 基础排盘 | v0.1.0 | — | — | — | — |
| 双胞胎对比 | v0.3.0 | PRD_v0.2.0_双胞胎 | — | — | — |
| 宫位标签 | v0.7.0 | PRD_v0.7.0_宫位 | ADR_v0.7.0_宫位 | TEST_v0.7.0_宫位 | — |
| 档案管理 | v0.9.0 | PRD_v0.9.0_档案 | ADR_v0.9.0_档案 | TEST_v0.9.0_档案 | — |
| 搜索稳定性 | v0.9.1 | PRD_v0.9.1_搜索 | ADR_v0.9.1_搜索 | TEST_v0.9.1_搜索 | RETRO_v0.9.1_搜索 |
| 排盘修复 | v0.9.3 | PRD_v0.9.3_排盘校验 | ADR_v0.9.3_排盘修复 | — | — |
| 身宫Bug | v0.9.4 | — | — | — | BUG_v0.9.4_身宫根因分析 |
| Git基线 | v0.10.0 | — | — | — | GIT_v0.10.0_baseline |
| 宫位多选 | v0.10.4 | — | — | — | RETRO_v0.10.4_宫位多选 |
| 能力按钮 | v0.11.0 | — | — | — | — |
| 能力排盘架构重构 | v0.11.1 | — | — | — | — |
| 纳运功能 | v0.12.0 | PRD_v0.12.0_纳运 | ADR_v0.12.0_纳运 | TEST_v0.12.0_纳运 | — |
| 宫位自定义 | v0.13.1-v0.13.5 | 见档案/自定义宫位/产品经理/ | — | — | — |

> **档案/** 目录下还有更详细的按功能+角色组织的完整开发产出（PRD/ADR/QA/前端代码等）。功能和版本对应不上时去那里找。

---

## 五、踩坑录 🔴

### P0 级（导致计算错误的根因）

| # | 坑 | 根因 | 修复版本 | 教训 |
|---|-----|------|----------|------|
| 1 | 大运流年高亮漂移 | `_applyDLUpdates()` 用硬编码 `rowIndex = 9 + tagRowCount`，宫位标签行插入后偏移 | v0.10.4 | **禁止硬编码行索引**，用 `data-row-type` 语义选择器 |
| 2 | 纳运土五行错误 | 土五行长生映射用「戊」而非「壬」，水土不同源 | v0.12.0 | 水土同源（戊→壬），验证时五行全覆盖 |
| 3 | 丑月人元司令Bug | 小寒后前9天司令应为癸而非己 | v0.9.3 | 人元司令按节气分段，每段天数需逐一核对 |
| 4 | 身宫计算 `hi` 未定义 | 时支 `hi` 变量未定义，导致 `shenGong()` 取 undefined | v0.9.4 | 变量初始化检查，加防御代码 |

### P1 级（影响体验但不影响计算）

| # | 坑 | 修复版本 |
|---|-----|----------|
| 5 | Popover 排序后勾选状态不同步 | v0.13.2 |
| 6 | 双胞胎流年行高亮边界条件（hiDy/hiLn 边界修复） | v0.9.2 |

### 开发原则

1. **改算法先读 ALGORITHM.md**，那是权威定义
2. **不要硬编码索引**，用语义属性（`data-row-type` 模式）
3. **改渲染要验证双胞胎模式**（单表 vs 双胞布局不同）
4. **CSS 精简模式**（`简`按钮）记得同步隐藏新行（`[data-row-type~="xxx"]`）
5. **GitHub 推送前确认 worktree 干净**（`git status`）

---

## 六、版本回滚速查

```sh
git checkout v0.16.0   # 当前最新（P2架构升级）
git checkout v0.15.0   # P1效率基建
git checkout v0.14.0   # P0安全加固
git checkout v0.11.1   # 能力排盘架构重构
git checkout v0.11.0   # 能力按钮
git checkout v0.10.4   # 宫位多选
git checkout v0.1.0    # 最初版本
```

所有标签：`v0.1.0` `v0.3.0` `v0.6.7` `v0.10.3-merge` `v0.10.4` `v0.11.0` `v0.13.5` `v0.14.0` `v0.15.0` `v0.16.0`

---

## 七、开发流程

1. **看需求** → 查功能索引（第四章），找到最近的相关版本
2. **读历史** → CHANGELOG 看那版本的变更摘要 → docs/ 读对应 PRD/ADR
3. **定位代码** → 用代码段索引（第三章）找到要改的函数
4. **查算法** → 涉及排盘规则时，以 ALGORITHM.md 为准
5. **避坑** → 读踩坑录（第五章），确认不重蹈覆辙
6. **测试** → 回归测试模式：URL 加 `?test=1`
7. **提交** → `git add` → `git commit` → `git push`
