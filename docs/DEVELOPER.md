# 八字排盘 · 编程师手册

> 最后更新：2026-08-08 | 对应版本：v0.18.0
> 编程师接到任务后的第一份必读材料。配合 ARCHITECTURE.md（架构决策）和 ALGORITHM.md（算法宪法）使用。

## 速览

- **技术栈**：原生 JS + CSS（零构建步骤），IIFE + `window.*` 命名空间
- **入口文件**：`standalone-split.html`（当前主产物）；`standalone.html`（回退版，通过 build_modules.py 内联合成）
- **启动方式**：浏览器直接打开 `standalone-split.html`；或启动 Clacky server 通过面板 iframe 访问
- **测试方式**：`standalone-split.html?test=1` → 199 条自动断言；`debug_all.html` → 多组合验证
- **部署**：GitHub Pages（`bangshun2025.github.io/bazi-paipan/`），Git tag push 自动生效

## 文件地图

| 文件 | 行数 | 职责 | 修改时注意 |
|------|:--:|------|-----------|
| `standalone-split.html` | 754 | HTML/CSS 骨架 + 6 模块 `<script>` 标签加载 | 改 CSS 看这里。CSS ≈534 行（与 standalone.html 完全相同，双端同步） |
| `standalone.html` | ~5400 | 回退版单体文件 | **不要直接改**。由 `build_modules.py` 内联合成。只在紧急热修时临时改 |
| `constants.js` | 857 | 常量/数据表（天干地支、纳音、节气、农历数据、人元司令等所有静态数据） | 改算法数据（如新增纳音规则）改这里。**这是 pillar() 等共用函数应该放的地方** |
| `algorithm.js` | 672 | 排盘核心（年月日时四柱、大运、流年、神煞、人元司令） | 改排盘逻辑改这里。依赖 constants.js。**改了算法必须跑全量回归 + 同步 ALGORITHM.md** |
| `archive.js` | 866 | 档案管理（存取删搜索、弹窗 UI、数据持久化） | 改档案功能改这里。操作 `Archives.json`（GitHub Pages 静态文件） |
| `gongwei.js` | 860 | 宫位自定义（14 宫 checkbox 面板、标签行渲染） | 改宫位功能改这里。渲染模式分单人/同性双胞/龙凤胎三种 |
| `render.js` | 1558 | UI 渲染（表格生成、大运流年表、双胞胎对比、事件绑定、DOM 更新、toggleLevel 五层级切换、sanyuan-sep 分隔行） | **最复杂的模块**。包含 pillar() 重复 5 次的已知问题。注意五层级 toggleLevel 和三处渲染路径同步 |
| `main.js` | 872 | 入口/表单事件/测试入口（`paipan()` 主函数、表单校验、真太阳时、自动排盘） | 改表单交互、入口流程改这里。`?test=1` 自动测试入口也在这里 |
| `build_modules.py` | — | 构建脚本：JS 模块 → 内联回 standalone.html | 每次发布正式版前跑一次。不改业务逻辑 |
| `debug_all.html` | — | 8 个 iframe 加载不同案例组合 | 调试多案例并行验证用 |

### 加载顺序（严格依赖）

```
constants.js → algorithm.js → archive.js → gongwei.js → render.js → main.js
```

每个模块是一个 IIFE，挂载到 window 命名空间：
```
window.CONST / window.ALGO / window.ARCHIVE / window.GONGWEI / window.RENDER / window.APP
```

### 关键函数速查

| 函数 | 所在文件 | 作用 |
|------|---------|------|
| `paipan(birth)` | main.js | 主入口：接收出生信息对象，返回完整排盘数据 |
| `renderChart(data, targetId)` | render.js | 渲染单人排盘表 |
| `renderTwinChart(data, targetId)` | render.js | 渲染双胞胎对比表（12 列） |
| `hiDy(i)` / `hiLn(di, li)` | render.js | 高亮大运行/流年行 |
| `updTopCols(data, dyIdx, lnIdx, container)` | render.js | 更新顶部四柱表的流年/大运列 |
| `_applyDLUpdates(data, card)` | render.js | 应用大运流年更新到卡片 |
| `shenSha(data)` | algorithm.js | 神煞计算（⚠️ 桃花有 Bug） |
| `renYuanSiLing(y, m, d)` | algorithm.js | 人元司令（⚠️ 1970年1月边界 Bug） |
| `renderGongWeiPanel()` | gongwei.js | 渲染宫位 checkbox 面板 |
| `saveArchive()` / `loadArchive()` | archive.js | 档案存取 |

## 代码约定

- **版本注释**：`<!-- vX.Y.Z -->` 写在 `standalone-split.html` 和 `standalone.html` 文件头部
- **Commit 格式**：`feat: / fix: / docs: / refactor: / test: / chore:`（Conventional Commits）
- **禁止**：`console.log` / `debugger` 不得提交到 Git
- **onclick 格式**：所有内联事件使用命名空间前缀，如 `onclick="APP.xxx()"`、`onclick="ALGO.xxx()"`
- **表格行索引铁律**：
  - `tr[0]` = `gzTagsMain`（隐藏行，用于标签）
  - `tr[1]` = `hdr`（表头行）
  - `tr[2]` = 第一行数据
  - **所有涉及行索引的遍历循环从 tr[2] 开始！**

## Bug 墓地

以下是从项目历史中聚合的所有已知 Bug，按状态排列。每次开发前必须过一遍，确保不改出新 Bug。

### ⚠️ 仍存在

#### Bug: 桃花神煞永不触发
- **根因**：`shenSha()` 中桃花判断条件 `k.includes(riZhi) && v === riZhi` 数学上不可能同时满足
- **代码位置**：`algorithm.js` shenSha() 函数
- **避免方法**：桃花应基于日支查三合局 → 遍历四柱匹配。参考标准神煞算法重写该段逻辑
- **发现版本**：v0.14.0 全量回归

#### Bug: 卫保任人元司令返回空
- **根因**：`renYuanSiLing(1970, 1, 15)` 返回空，节气月份遍历对 1970 年 1 月存在边界问题
- **代码位置**：`algorithm.js` renYuanSiLing() 函数
- **避免方法**：检查跨年/跨月的节气边界逻辑，特别注意 1 月份可能跨越两个节气月
- **发现版本**：v0.14.0 全量回归

### ✅ 已修复（重犯防护）

#### Bug: 流年「始于」「止于」色块不跟随高亮
- **根因**：`hiDy()` 只更新了大运/流年卡片列的 cc 类，遗漏了 `start-row` 和 `end-row` 的更新
- **代码位置**：`render.js` hiDy() 函数
- **避免方法**：任何高亮/视觉联动，检查所有关联元素是否都被更新（卡片列 + 色块行 + 标签行）
- **发现/修复版本**：v0.9.2 / v0.9.2

#### Bug: 流年点击后大运/流年列数据错乱
- **根因**：`_applyDLUpdates()` 中硬编码行索引从 `tr[1]` 开始遍历——而数据行实际从 `tr[2]` 开始
- **代码位置**：`render.js` _applyDLUpdates()
- **避免方法**：**永远记住表格行索引铁律**（tr[0]=隐藏, tr[1]=表头, tr[2]=数据首行）。改 DOM 结构后必须审查所有下游的硬编码行索引
- **发现/修复版本**：v0.10.2 / v0.10.2

#### Bug: 遮罩层无法关闭弹窗
- **根因**：档案弹窗遮罩层未绑定 `onclick` 关闭事件
- **代码位置**：`archive.js`
- **避免方法**：所有弹窗组件必须支持三种关闭方式（遮罩点击、关闭按钮、ESC 键）
- **发现/修复版本**：v0.9.0 / v0.9.0

#### Bug: 搜索弹窗抖动
- **根因**：搜索结果过滤导致弹窗高度动态变化，未设置固定高度
- **代码位置**：`archive.js` 搜索弹窗
- **避免方法**：弹窗设置 `height:480px; min-height:360px` 固定尺寸，避免内容变化导致布局跳动
- **发现/修复版本**：v0.9.1 / v0.9.1

## 踩坑记录

以下不是 Bug，但很容易犯错的陷阱——每项都来自真实 RETRO。

### DOM 解析陷阱：`<tr>` 不允许在 `<div>` 中

- **场景**：用 `innerHTML` 或 `DocumentFragment` 在 `<div>` 中构建含 `<tr>` 的 HTML 字符串
- **后果**：浏览器自动剥离 `<tr>`/`<td>` 标签，表格渲染为空
- **正确做法**：用 `<table>` 容器包裹，或直接操作 `<tbody>`
- **来源**：RETRO v0.10.4 Bug #1

### 模板字符串误用

- **场景**：单引号字符串内含 `${functionCall()}`，期望它被执行
- **后果**：`${}` 被当作字面量输出到页面
- **正确做法**：用反引号「\`」模板字符串；或在单引号内用 `+` 拼接
- **来源**：RETRO v0.10.4 Bug #2

### 龙凤胎 scope 隔离

- **场景**：龙凤胎有两张大运流年表，给其中一张绑定点击事件
- **后果**：点击老大的流年可能触发老二的联动，或反之
- **正确做法**：事件绑定用 `.closest('.bz-card-luck')` 限定卡片作用域
- **来源**：TEST_全量测评手册 8.3

### pillar() 重复定义

- **场景**：`render.js` 中 `pillar()` 函数被定义了 5 次
- **后果**：改柱子逻辑需要改 5 个地方，容易遗漏
- **正确做法**：`pillar()` 应统一到 `constants.js` 中（已知技术债，P0）
- **来源**：P2 复盘

### 改完代码要跑 build_modules.py

- **场景**：只改了 JS 模块文件（如 `algorithm.js`），忘了更新 `standalone.html`
- **后果**：本地调试正常，但线上版本（standalone.html）没有同步——用户看到的是旧版
- **正确做法**：发布前跑 `python3 build_modules.py`，内联回 standalone.html，并验证 `?test=1` 通过
- **来源**：CONTRIBUTING.md / 发布流程

### 跨文档不一致

- **场景**：UPGRADE_PLAN.md 的加载顺序与 ADR 不同（gongwei→render→archive vs archive→gongwei→render）
- **后果**：编程师按错误文档开发，测试师发现问题
- **正确做法**：以 ADR 为准，其他文档同步。发布 checklist 增加「文档一致性检查」
- **来源**：RETRO v0.16.0 问题3

### JS 模块放在根目录（不是 js/ 子目录）

- **场景**：UPGRADE_PLAN.md 规划了 `js/` 子目录，但 ADR 的 `<script src="constants.js">` 无路径前缀——实际模块在根目录
- **后果**：无实质影响，但新编程师可能困惑
- **正确做法**：模块在根目录是设计如此，不要移动。以实际代码为准
- **来源**：RETRO v0.16.0 问题4

### 多渲染路径遗漏——TC-10 龙凤胎初始 L0 状态 Bug（v0.17.0）

- **场景**：简分级别功能要求三处渲染路径（单人/双胞胎/龙凤胎）的 `<table>` 初始 class 都改为 `level-0`，但编程师只改了 `renderChart()` 单人模式，遗漏了 `renderTwinCardsHtml()` 和 `renderLongFengCardsHtml()` 两处
- **后果**：龙凤胎/双胞胎模式下首次排盘，L0 默认状态所有扩展行均可见（应为隐藏）。点击一次按钮后恢复正常——因为 `toggleLevel()` 会重新设置 class
- **正确做法**：ADR 明确列出三处修改点时，应逐条对照。未来引入「实现自查清单」机制——编程师完成后逐条对照 ADR 自检
- **来源**：RETRO v0.17.0

## 重构记录

| 版本 | 变更 | 影响范围 | 注意事项 |
|------|------|---------|---------|
| v0.18.0 | 简0级别：五层级循环切换 + 四柱三垣间隔 + 三垣冗余纳运修复 | render.js（~15行）、standalone-split.html（CSS ~25行） | CSS 层级规则扩展为 5 组 level-0~4；toggleLevel %5；三处渲染路径按钮「简→极简」；buildPillarRows 三垣区纳运删冗余；sanyuan-sep 独立 tr 分隔行 |
| v0.17.0 | 简分级别：四层级循环切换 + 纳运行位置调整 | render.js（+43行）、main.js（-1行）、standalone-split.html（+CSS） | 三处渲染路径 `<table>` 需同步加 `level-0` class。_applyDLUpdates 需重映射 dy/ln |
| v0.16.1 | 档案弹窗 dateStr 精简为仅年份 | archive.js（L739/L794）、standalone.html（L4942/L4997） | 仅改4行。不改 CSS/弹窗宽度/数据结构/排盘逻辑。最小改动原则 |
| v0.16.0 | 5384 行单体 → 6 模块拆分 | 全部文件 | onclick 全部改为命名空间前缀（`APP.xxx`）。仍有少量 `onchange` 遗留 |
| v0.16.0 | build_modules.py 构建脚本 | standalone.html | `standalone.html` 由脚本合成，不再手动维护。紧急修 hotfix 可临时改 |
| v0.10.3 | 宫位多选 → 合入生产文件 | render.js, gongwei.js | 合并时注意三个渲染模式（单人/同性双胞/龙凤胎）都要接入 |

## 开发检查清单

每次提交前确认：

- [ ] 改了 `algorithm.js`？→ 跑了全量回归（`?test=1` 199 条全部通过）
- [ ] 改了 DOM 结构？→ 审查了所有硬编码行索引（tr[2] 铁律）
- [ ] 新增/修改了算法？→ 同步更新了 `ALGORITHM.md`
- [ ] 新增了功能？→ 同步更新了 `TEST_全量测评手册.md` 对应子章节
- [ ] 准备发布？→ 跑了 `build_modules.py` + 验证 `standalone.html` 内的版本注释
- [ ] ADR 列出多处于修改点时，逐条对照自检（不遗漏任何渲染路径）
- [ ] 没留 console.log / debugger
- [ ] onclick 使用命名空间前缀

## 相关文档

| 文档 | 用途 |
|------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架构决策记录（为什么这样设计） |
| [ALGORITHM.md](docs/ALGORITHM.md) | 算法宪法（所有排盘规则唯一真相源） |
| [TEST_全量测评手册.md](docs/TEST_全量测评手册.md) | 全量回归测试（L1 算法 + L2 渲染 + L3 交互） |
| [SYSTEM.md](SYSTEM.md) | 项目总览（版本历史、技术债、如何继续开发） |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | 发布检查清单 |
| [DEVELOPER_QUICKSTART.md](DEVELOPER_QUICKSTART.md) | （参考，以本文为准） |
