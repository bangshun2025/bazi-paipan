# 八字排盘 · 编程师手册

> 最后更新：2026-08-13 | 对应版本：v0.22.0
> 编程师接到任务后的第一份必读材料。配合 ARCHITECTURE.md（架构决策）和 ALGORITHM.md（算法宪法）使用。

## 速览

- **技术栈**：原生 JS + CSS（零构建步骤），IIFE + `window.*` 命名空间
- **入口文件**：`standalone-split.html`（当前主产物）；`standalone.html`（回退版，手动同步 JS 改动）
- **启动方式**：浏览器直接打开 `standalone-split.html`；或启动 Clacky server 通过面板 iframe 访问
- **测试方式**：`standalone-split.html?test=1` → 211 条自动断言（http:// 拆分版）；index.html/standalone.html?test=1 → 212 条（file:// 内联版含素素用例，**双环境都必须跑**）；`debug_all.html` → 多组合验证
- **部署**：GitHub Pages（`bangshun2025.github.io/bazi-paipan/`），Git tag push 自动生效

## 文件地图

| 文件 | 行数 | 职责 | 修改时注意 |
|------|:--:|------|-----------|
| `standalone-split.html` | 838 | HTML/CSS 骨架 + 6 模块 `<script>` 标签加载 | 改 CSS 看这里。CSS ≈534 行（与 standalone.html 完全相同，双端同步）。v0.20.0 新增 gz-tabs/gz-tab/gz-star 样式 + 设置页双 tab 按钮（gzTabAll/gzTabFav） |
| `standalone.html` | 7673 | 回退版单体文件（含全量数据 735KB） | **不要直接改**。由 `build_modules.py` 内联合成。只在紧急热修时临时改。**内联测试断言段必须与 main.js 同步**（v0.22.0 教训） |
| `constants.js` | 1585 | 常量/数据表（天干地支、纳音、节气、农历数据、人元司令等所有静态数据；v0.22.0 起 1000-2100 全量 sxtwl 数据） | 改算法数据（如新增纳音规则）改这里。**这是 pillar() 等共用函数应该放的地方**。**数据表重生后必须做常规年份行为对比验证** |
| `algorithm.js` | 672 | 排盘核心（年月日时四柱、大运、流年、神煞、人元司令） | 改排盘逻辑改这里。依赖 constants.js。**改了算法必须跑全量回归 + 同步 ALGORITHM.md** |
| `archive.js` | 916 | 档案管理（存取删搜索、弹窗 UI、数据持久化）+ **隐私模式**（getPrivacyMode/setPrivacyMode/getDisplayName/togglePrivacy + yiming 字段读写） | 改档案功能改这里。操作 `Archives.json`（GitHub Pages 静态文件）。**getDisplayName(a) 是显示名唯一出口：隐私开→降级链(艺名→小名→匿名)，关→「小名 / 正名」。任何显示姓名的位置必须走它** |
| `gongwei.js` | 1139 | 宫位自定义（14 宫 checkbox 面板、标签行渲染）+ **常用宫位分级**（bz_gongwei_fav localStorage、getFavGroups、☆切换/排序/移除/默认排序、三态视图 gzSettingsView） | 改宫位功能改这里。渲染模式分单人/同性双胞/龙凤胎三种。**数据一致性铁律：updateGroup/deleteGroup/resetToDefaults/restoreFromTrash 都要同步清理 fav 和 selected；下拉面板/标签行遍历源用 getFavGroups() 而非 gongWeiGroups** |
| `render.js` | 1568 | UI 渲染（表格生成、大运流年表、双胞胎对比、事件绑定、DOM 更新、toggleLevel 五层级切换、sanyuan-sep 分隔行、data.displayName 脱敏标题） | **最复杂的模块**。包含 pillar() 重复 5 次的已知问题。注意五层级 toggleLevel 和三处渲染路径同步。**排盘标题必须用 doPaipan 构造的 data.displayName，禁止直接拼 a.name** |
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
| `getFavGroups()` | gongwei.js | 返回常用宫位组列表（按 bz_gongwei_fav 顺序）——下拉面板/标签行的遍历源 |
| `toggleFav(name)` | gongwei.js | ☆ 切换常用标记（入/出 fav） |
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

#### Bug: 素素断言月柱错位（内联版测试假绿）
- **根因**：sxtwl 数据重生修复了旧版小寒节气系统性偏早约 5 天的数据 bug，素素测试用例月柱从「丙戌/甲申/庚辰」变为「丁亥/癸未/己卯」，但 index.html/standalone.html 内联测试断言未同步——main.js 已改、内联版没改，导致内联版测试通过的是旧断言（假绿）
- **代码位置**：main.js + index.html/standalone.html 内联测试段
- **避免方法**：改断言必须同步三文件（main.js + index.html + standalone.html）；回归必须跑双环境（http:// 拆分版 + file:// 内联版）
- **发现/修复版本**：v0.22.0 / v0.22.0

#### Bug: qiYun 空指针崩溃（渲染层）
- **根因**：某些年份（如 1400 前简化排盘）大运数据为空时渲染层直接访问 qiYun 属性崩溃
- **代码位置**：render.js 大运渲染（4 处守卫）
- **避免方法**：渲染层访问数据属性前必须判空；数据分级（完整/简化）变化时审查所有消费方
- **发现/修复版本**：v0.22.0 / v0.22.0

#### Bug: 小寒节气系统性偏移约 5 天（数据层）
- **根因**：旧版节气数据表小寒节气偏早约 5 天，导致每年 1/1-1/5 出生者月柱误算为丑月（应为子月）；2100 年边缘另有 56 天旧表数据不全
- **代码位置**：constants.js 数据表（v0.22.0 全量重生修复）
- **避免方法**：数据表重生必须做常规年份行为对比验证（抽样 + 逐日细化量化偏移）；影响面用 Node 沙箱量化（1900-2100 每月 1 日抽样 2412 天中 201 天差异，全部为每年 1/1）
- **发现/修复版本**：v0.22.0 / v0.22.0

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

### build_modules.py 是拆分工具，不是内联工具（v0.20.1 澄清）

- **场景**：只改了 JS 模块文件（如 `algorithm.js`），以为跑 `python3 build_modules.py` 就能把改动回写进 `standalone.html`
- **后果**：`build_modules.py` 实际方向是「standalone → 6 模块」的**拆分**工具，不是内联工具；standalone.html 需**手动同步**改动。且工具内联过程存在 `\n` 转义符→字面换行的缺陷（v0.20.1 已修复 2 处 confirm 处字面 `\n`，破坏内联段语法导致 GONGWEI 加载失败误判）
- **正确做法**：发布前手动将 JS 模块改动同步到 `standalone.html`（保持与 standalone-split 一致），并验证 `?test=1` 通过
- **来源**：RETRO v0.20.1 建议2 / ADR v0.16.0（工具定位修正）

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

### 宫位数据一致性级联（v0.20.0）

- **场景**：`updateGroup()`（改名）、`deleteGroup()`（删除）、`resetToDefaults()`（恢复默认）等修改宫位组数据的函数
- **后果**：只改了 groups 忘了同步 `bz_gongwei_fav` / `bz_gongwei_selected`，会出现「常用 tab 里的幽灵组名」或「选中了不存在的组」
- **正确做法**：v0.20.0 起，所有修改宫位组数据的函数必须同步清理 fav（`findGroupByName !== null` 过滤）和 selected。ADR 数据一致性约束表是唯一真相源
- **来源**：ADR v0.20.0 数据一致性约束表

### 隐私判断「某处是否显示姓名」必须 grep 源码确认（v0.19.0）

- **场景**：PRD 决策 4 凭印象判断「龙凤胎视图不显示姓名、无需改动」，架构师对照源码发现 render.js L1219 实际渲染 `<b>d1.name</b>`——老大真名会直接上屏，隐私目标整体落空（ADR-005 修正）
- **后果**：若未被拦截，上课投影时龙凤胎学员真名泄露
- **正确做法**：涉及「某处是否显示姓名/显示什么名字」的判断，PRD 阶段就 grep `\.name\b`/`displayName` 确认每处渲染点；所有显示姓名位置统一走 `ARCHIVE.getDisplayName(a)`，禁止直接拼 `a.name`（`data.name` 始终保留真名，仅显示层替换）
- **来源**：ADR v0.19.0 ADR-005

### 值导出 vs 闭包变量：测试代码必须走公开 API（v0.20.1）

- **场景**：测试/外部代码直接赋值导出对象属性 `GONGWEI.selectedGongWei = ["信息","做功"]`，然后调用 `persistSelected()` 期望生效
- **后果**：`initGongWeiData()` 内部对 `selectedGongWei` 重新赋值，切断了 `window.GONGWEI` 的导出引用——外部引用指向旧值（赋值对象），内部闭包变量指向新值。`persistSelected()` 操作的是内部闭包变量，外部赋值完全无效（v0.20.1 A2 断言首次验证失败即此因）
- **正确做法**：gongwei.js 内部状态一律通过公开函数操作：`clearSelection()` + `toggleSelect()` 组合、`selectAll()`、`loadSelected()`、`loadFav()`、`persistFav()`、`resetFavOrder()`、`isSelected()`。测试代码不得直接写导出属性，只能读+走公开 API
- **代码位置**：gongwei.js L1054-1138（window.GONGWEI 值导出）
- **来源**：RETRO v0.20.1 问题1

### 测试代码段三文件同步（v0.22.0）

- **场景**：编程师只改了 main.js 的素素断言（三柱月柱），index.html/standalone.html 内联测试段没同步——内联版回归跑的是旧断言，测试「通过」其实是假绿
- **后果**：若未抓出，线上内联版携带过期断言，后续任何版本回归都会被假绿掩盖真实回归
- **正确做法**：凡改 main.js 测试代码，必须同步 index.html + standalone.html 内联测试段；回归固定跑双环境（http:// 拆分版 ?test=1 + file:// 内联版 ?test=1），两环境断言数可能不同（211 vs 212），各自必须全绿
- **来源**：RETRO v0.22.0

### rebase 后 annotated tag 指向废弃 commit（v0.22.0）

- **场景**：本地已打 tag v0.22.0 后 pull --rebase，历史重写导致旧 tag 指向废弃 commit d2327e3
- **后果**：线上部署/回滚引用错误版本
- **正确做法**：rebase 后必须检查 tag 指向（`git rev-parse vX.Y.Z`），若指向废弃 commit 则删除重建 tag 并 force push（`git push origin vX.Y.Z --force`）
- **来源**：RETRO v0.22.0

## 重构记录

| 版本 | 变更 | 影响范围 | 注意事项 |
|------|------|---------|---------|
| v0.20.0 | 常用宫位分级：bz_gongwei_fav localStorage + 设置页双 tab（全部/常用）+ ☆标记/排序/移除/默认排序 + 旧用户自动迁移（无 key=全部默认常用） | gongwei.js（+278行）、standalone-split.html（+37行）、standalone.html/index.html（内联同步） | 三态视图 gzSettingsView(all/fav/trash)；下拉面板/标签行遍历源改 getFavGroups()；级联清理 4 函数（updateGroup/deleteGroup/resetToDefaults/restoreFromTrash）；新增组默认不入常用；「全部宫位 tab 打勾」语义=加入常用（不再是排盘显示） |
| v0.19.0 | 隐私模式：yiming 艺名字段 + 全局开关（默认开启）+ getDisplayName 统一显示函数脱敏 | archive.js（+50行）、render.js（+10行）、constants.js（+2行）、standalone-split.html（+47行） | 显示名单点收敛：隐私开→降级链（艺名→小名→匿名），关→v0.18.0 逐字一致。`data.name` 保留真名不动。开关 localStorage `bz_privacy_mode`（'1'/'0'，无键默认开）。AI 预览「姓名：已隐藏」 |
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
- [ ] 改了宫位组数据函数（updateGroup/deleteGroup/resetToDefaults/restoreFromTrash）？→ 检查 `bz_gongwei_fav` / `bz_gongwei_selected` 级联同步
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
