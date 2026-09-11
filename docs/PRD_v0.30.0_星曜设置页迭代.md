# PRD v0.30.0 — 星曜设置页迭代（搜索 / 分组 / 纳音列）

- 版本：v0.30.0（MINOR，新增搜索能力；Leader 裁定）
- 类型：增量 PRD（基于已交付 v0.29.0 星曜功能）
- 真相源仓库：`/Users/feng/.clacky/ext/local/bazi-paipan`
- 前置文档：`docs/PRD_v0.29.0_星曜功能.md`
- 撰写：产品经理（worker_cd305ff0）｜编排 orch_111162f7d306
- 日期：2026-09-11
- 修订：**r2（2026-09-11）** —— 与 ADR v0.30.0 对齐，3 处更正/增补：
  1. §2.7 / §8.1：`check-release.sh` 门禁归类的**错误建议已更正**（`xy-group-row` 是运行时生成，不可进 `KEYS`；须走 `RUNTIME_KEYS` 且兜底扫描需含 `xingyao.js`）。
  2. 新增 **FR1.3.1 输入法组成态闸门** + AC18 + E17/E18/E19（对齐 ADR §5）。
  3. 显隐机制明确为 **`hidden` 属性**（+ 兜底 CSS），新增 AC19；FR1.2 搜索栏补 `id="xySearchBar"`。
  - P1 决议：搜索**只匹配干支**（维持 FR2.1/O2，见 D13）。
- 修订：**r3（2026-09-11）** —— 与 ADR v1.1 对齐（append-only，正文 FR/AC 语义未变）：
  1. AC19 强化为**双断**：`hidden` 属性 **且** `getComputedStyle(tr).display==='none'`（守兜底 CSS / E18）。
  2. §7.1 建议断言 T01–T09 → **T01–T11**：新增 T10（`collectDraft()` 采集隐藏行哨兵，AC11 守护者）、T11（搜索态不落盘）。
  3. 编号体系以本 PRD 为准：`T08 = ADR 的 T-IME`（同一断言，改名）；ADR 的 `T-SENTINEL-1`→T10、`T-PERSIST`→T11。
- 修订：**r4（2026-09-11）勘误 — 仅测试执行前提，需求语义零变更**：
  1. AC19 核验方式补**测量前提**：② 的 `getComputedStyle(tr).display` 必须在**弹层可见态**（`#xySettingsOverlay` 含 `.show`）下取样；祖先 `display:none` 时该值失真，会假红/假绿。
  2. T09 同步补「断言前置 `openSettings()`」。
  3. 其余 FR / AC / 编号（T01–T11）一字未改。
- 修订：**r5（2026-09-11）⚠️ 需求口径变更 — 「三组」= 三栏同屏并排，非纵向堆叠**
  - **变更缘起**：用户直接纠正原话「你搞错了，我说的分三组是在一个页面，我想 60 甲子在一个页面上看得完，操作得完。」r1–r4 把「三组」理解为**纵向堆叠三段**（3 个分组标题行 + 60 行单列 + 需滚动）→ **理解错误**。
  - **正确口径（Leader 钉死，全员唯一基线）**：三栏**横向并排**、每栏一组 20 行，**打开即免滚动看全 60 行**；验收视口主基线 **1440×900**，另抽 1280×800 / 1600×1000。
  - **硬约束（测试师可测性约束，Leader 采纳）**：`#xySettingsList` **保持单一 `<tbody>`**、60 行全为其后代，**三栏只由 CSS 实现**（禁止 3 张表 / 3 个 tbody）；表头**三栏共享一行**（`thead th` 恒 4）；空栏**保留占位、不隐藏栏头**（避免横向跳动）。
  - **测量红线（防假绿）**：免滚动断言**必须先 `openSettings()`**（弹层未开时 `scrollHeight/clientHeight` 同为 0，`0≤0` 恒真 ⇒ 必然假绿），绑定量为 `.xy-settings-body`，取样在 `document.fonts.ready` / rAF 后，且只在 **≥1280px** 断言。
  - **变更范围**：FR1.1（位置）、**FR3 全部重写**、AC03/AC04/AC05/AC19 修订、**新增 AC20–AC24**、T02/T03 重写 + **新增 T12–T14**、E15 重写 + **新增 E20–E22**、§8.1 影响面、D9 更新。
  - **不受影响（原文照旧）**：FR2 搜索匹配规则与命中条数（AC01/AC02）、FR4 纳音全名（AC06/AC07）、FR5 主盘一致性、FR6 状态机语义、FR2.5 显隐铁律（T10）、localStorage 禁迁移（§5）、IME 组合态闸门（FR1.3.1）。
  - **作废项**：r5 初稿的「整栏隐藏 `section.xy-group[hidden]`」已废弃（会横向跳动），改由 FR3.8「空栏保留占位」取代。
  - r5 之后 PRD 再次冻结（r4 的 md5 `395f0c8d78fa59dc7a20224cc7db941b` 作废）。
- 修订：**r6（2026-09-11）纯勘误 —— 需求语义与 FR/AC 判定零变更**（测试师验收 r5 时逐条核出 7 处引用文本残留旧口径，会让编程师/ADR 建错结构，故先勘误再进 ADR v1.4）
  1. §7.1 **T02**：`栏 .xy-group` → `栏头 .xy-group-title`；「每栏 4 列表头」→「**共享表头** `thead th`=4」（原表述与 FR3.4.1 / AC03 冲突）。
  2. §7.1 **T03**：「3 张表各自表头」→「**共享表头** `thead th`=4 且 `th[1]`=纳音」（与 AC03「单一表」冲突）。
  3. §8.1 `renderSettings()`：「按组插入分组标题行」→「**不再插入组标题行**，tbody 仅 60 行」（栏头为表外静态）。
  4. §8.1 `filterRows()`：「分组标题联动」→「**栏头无联动**」（与 FR3.8 空栏保留占位冲突）。
  5. FR2.6：「分组标题同步」→「**栏头不参与联动**」。
  6. §8.1 `main.js`：「新增 T01–T07」→「**T01–T14**」（r5 已追加 T12–T14）。
  7. §四 交互流：「只剩 6 行（含 2 个组标题）」→「可见**数据行 6**，**栏头恒 3、空栏保留占位**」。
  - 附带（文字级一致性）：§2.6「分组标题行无 data-gz」、风险 R3/R6、决策 D1/D2 的「分组标题」统一改称**栏头**。
  - 附带（AC15 测试态注）：AC15 预置键须用**测试键** `bz_xingyao_map__test`（HP5），补注于 AC15 核验列，判定不变。
  - **r5 的 FR / AC 判定与编号（AC01–AC24、T01–T14）一字未动**；r6 生效后取代 r5 文本。
  - r6 之后 PRD 再次冻结（r5 的 md5 `72b29e7e8c6ea0ca0cf0314f1fd76dd3` 作废）。
- 修订：**r7（2026-09-11）最小修订 —— FR3.4 推荐 CSS 在筛选态有真实缺陷，改「按组钉列」+ 补 AC25/T15/D19–D20**
  - **缺陷（纯 CSS 事实）**：`display:none` 的行**不是 grid item**，会被 auto-placement 跳过 ⇒ r6 推荐的 `grid-auto-flow:column` + `grid-template-rows:repeat(20,auto)` **只在 60 行全显时**切栏正确；**筛选后**可见行会从栏 1 顶部依次重排（搜「己」6 命中 → 全部落到栏 1），与 FR3.8「空栏保留占位」冲突。
  - **实测定证**（真实浏览器隔离样本）：全显态两种写法逐像素等价（三栏 `left` = 18 / 423 / 829）；筛选态下 `auto-flow:column` 版 6 行 `left` **全为 18**，**按组钉列**版为 **18 / 423 / 829**（正确）。
  - **替代方案（终版）**：`grid-auto-flow:row dense` + `grid-template-columns:repeat(3,minmax(0,1fr))` + `tr[data-xy-group="N"]{grid-column:N}`（见 FR3.4 更新后的片段）。
  - **新增 AC25【筛选态栏位正确性】**：命中行必须渲染在**其所属组栏位**内（几何判定，落位区间）；**严禁仅凭 `[data-xy-group]` 计数判定**（缺陷实现下计数仍 2/2/2，属**假绿**）。**新增 T15**（追加，不重排）。**新增 FR3.4.3**：断言只锁钩子/行为/几何，**禁止锁 computed `grid-auto-flow` 字面值**。**新增 D19/D20**。
  - **落盘前全文一致性审计（Leader 要求）又抓到 2 处同类残留并已清**：§8.1 影响面行（写作「三栏 Grid 规则」时仍抄 r6 旧 CSS 字面值）→ 改为 r7 终版写法并标注「勿用 `auto-flow:column`」；决策 **D14**（仍写 `grid-auto-flow:column`）→ 改为「CSS 写法以 D19 为准，r5/r6 写法已废止」。
  - **其余 FR/AC 语义零变更**；AC01–AC24、T01–T14 编号未动（仅追加 AC25/T15）。
  - r7 之后 PRD **终冻**（r6 的 md5 `027a8f05f20ff7299318beed1140b818` 作废）。

---

## 一、需求来源与目标

### 1.1 用户需求原文（三条，逐字）

> 1. 星曜页面，加上搜索功能，比如，搜索己，就将所有含己的干支搜索出来，然后我直接填上内容即可，这样就不需要用眼睛来找目标干支。
> 2. 星曜页现做成三组，每组 20 个干支，共 60 个干支。
> 3. 纳音五行改为纳音比如，甲戌，就是山头火，而不是火。

### 1.2 目标

| 目标 | 用户价值 | 对应需求 |
|---|---|---|
| 定位成本从「用眼睛扫 60 行」降到「输入 1~2 字」 | 填 60 行星曜不再是体力活 | 搜索 |
| 60 行有结构、可分段阅读 | 长列表可断点、可建立位置感 | 分组 |
| 「纳音」列显示完整纳音名，与主盘同口径 | 设置页与盘面信息不打架 | 纳音列 |

### 1.3 范围（本版做）

1. **搜索**：设置页新增搜索框，按「包含」关系实时筛选六十甲子行。
2. **分组**：60 个干支拆为三组、每组 20 个，按六十甲子顺序切分。
3. **纳音列**：列名「纳音五行」→「纳音」，值由末字五行（如「火」）改为完整纳音名（如「山头火」）。

### 1.4 明确不在范围（Out of Scope）

| 编号 | 不在范围 | 说明 |
|---|---|---|
| O1 | **排盘结果主盘的纳音行口径** | 维持现状 **不动**（见 §2.3，现状已是完整纳音名）。是否统一由 ADR + Leader 裁决 |
| O2 | 搜索名称 / 来源体系内容 | 本版仅搜「干支」二字；搜「星曜名称」列为可选后续 |
| O3 | 键盘高亮跳转 / 模糊拼音搜索 | 超出本次诉求，不做 |
| O4 | localStorage 结构变更 / 数据迁移 | 键 `bz_xingyao_map` 结构不变（见 §6） |
| O5 | 主盘行序、简分级别、星曜行显示逻辑 | v0.29 已交付，本版不动 |
| O6 | 分组的新增/删除/自定义 | 分组为固定三段，不可配置 |

---

## 二、现状勘察（写前实测，非猜测）

### 2.1 设置页结构

| 项 | 现状 | 位置 |
|---|---|---|
| 弹层容器 | `.xy-settings-overlay#xySettingsOverlay`（`onclick` 关闭） | index.html:917 |
| 弹窗 | `.xy-settings-modal`（`event.stopPropagation()`） | index.html:918 |
| 标题 | `✦ 星曜设置` | index.html:920 |
| 表体 | `<table class="xy-table">`，`<tbody id="xySettingsList">` 由 `XINGYAO.renderSettings()` 生成 | index.html:924–929 |
| 表头 | `<th>六十甲子</th><th>纳音五行</th><th>星曜名称</th><th>来源体系</th>` | index.html:926 |
| 页脚 | 清空 / 还原 / 📤导出JSON / 📥导入JSON / 保存并关闭 | index.html:931–936 |
| 说明 | `.xy-note`「星曜数据仅保存在本机浏览器…未填显示「—」。」 | index.html:938 |
| 渲染函数 | `renderSettings()` 生成 60 个 `<tr data-gz="…">`，四列：`.xy-gz` / `.xy-nayin` / `input.xy-name` / `input.xy-system` | xingyao.js:150–167 |
| 模块文件 | 根目录 `xingyao.js`（355 行），三端加载：index.html 内联、standalone.html 内联、standalone-split.html 外链 | — |

### 2.2 纳音列现状（需改）

```js
// xingyao.js:156（renderSettings 内）
var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz].slice(-1) : '';
//                                   ^^^^^^^^^^ 只取末字 = 五行（金/木/水/火/土）
```

- 列名：`纳音五行`；值：**末字五行**（甲戌 → 「火」）。
- **这是全项目唯一一处「纳音取末字」**（实测 `grep -rn "slice(-1)" *.js` 仅此一处命中）。

### 2.3 主盘纳音行现状（不改，仅记录口径）

```js
// render.js:493 / 916 / 1083 / 1271 / 1354 / 1713
ny: NAYIN[gan + zhi] || ''
```

- 主盘「纳音」行取值 = `NAYIN[gan+zhi]` = **完整纳音名**（甲戌 → 「山头火」）。
- `constants.js:885–892` 的 `NAYIN` 表：60 键全名，`NAYIN['甲子']==='海中金'`（main.js:810 既有断言可证）。
- **结论：主盘现状口径 = 完整纳音名，与本次设置页改造目标一致。**
  → **两者改造后自然统一，无需改主盘**（主盘维持现状本就是对的）。
  → 用户感知的「不一致」实为设置页单方面显示末字造成；本版通过改设置页消除。

### 2.4 分组切分点实测（六十甲子 0-based 序号 → 干支）

| 组 | 序号区间（1-based） | 首干支 | 末干支 | 校验 |
|---|---|---|---|---|
| 第 1 组 | 1–20 | 甲子 | 癸未 | i=0 甲子；i=19 TG[9]=癸,DZ[7]=未 → 癸未 ✓ |
| 第 2 组 | 21–40 | 甲申 | 癸卯 | i=20 TG[0]=甲,DZ[8]=申 → 甲申；i=39 TG[9]=癸,DZ[3]=卯 → 癸卯 ✓ |
| 第 3 组 | 41–60 | 甲辰 | 癸亥 | i=40 TG[0]=甲,DZ[4]=辰 → 甲辰；i=59 TG[9]=癸,DZ[11]=亥 → 癸亥 ✓ |

（`XY_GZ60 = generate60()` = `TG[i%10]+DZ[i%12]`，xingyao.js:28–31，与 NAYIN 键序一致。）

### 2.5 搜索命中集合实测（用于定 AC 条数）

| 查询 | 命中数 | 命中干支（按六十甲子顺序） |
|---|---|---|
| 「己」 | **6** | 己巳(6) / 己卯(16) / 己丑(26) / 己亥(36) / 己酉(46) / 己未(56) |
| 「戌」 | **5** | 甲戌(10) / 丙戌(22) / 戊戌(34) / 庚戌(46) / 壬戌(58) |
| 「甲戌」 | **1** | 甲戌 |
| 「子」 | **5** | 甲子(1) / 丙子(13) / 戊子(25) / 庚子(37) / 壬子(49) |
| 「壬」 | **6** | 壬申(9) / 壬午(19) / 壬辰(29) / 壬寅(39) / 壬子(49) / 壬戌(58) |

> 说明：地支「子」只与阳干（甲丙戊庚壬）相配，故为 5 行；天干「壬」与 6 个地支各配一次，故 6 行。
> PRD 以「己(6)」「戌(5)」「甲戌(1)」「壬(6)」「子(5)」为断言样本（见 AC01/AC02）。

### 2.6 与 v0.29 断言冲突点（必须同步修改，否则回归必红）

| 现有断言 | 位置 | 本版处理后 |
|---|---|---|
| `v0.29 T05:表头[1]=纳音五行` | main.js:1787 | 期望值改为 **`纳音`** |
| `v0.29 T06: {12 项} 纳音五行={单字}` | main.js:1796–1803 | 改为完整名（见 §5.4 全名对照表） |
| `v0.29 T05:数据行=60` | main.js:1792 | **保持 60**（栏头在 `<tbody>` 外且无 `data-gz`，不计入）✓ |
| `v0.29 T05:首行=甲子 / 末行=癸亥` | main.js:1793–1794 | **不变** ✓ |

→ 本版**必须**同步更新 v0.29 的 T05 表头断言与 T06 抽样断言；其余 v0.29 断言（T01–T04、T07–T10）应保持全绿。

### 2.7 check-release 门禁

`scripts/check-release.sh`：

- `:17 KEYS="… xySettingsOverlay xySettingsList xy-trigger xy-note"`
  - ⚠️ **注意**：门禁【3/4】对 `KEYS` 项在**三端静态 HTML**中查找（`id="…"` 或 `class="…"`），仅在 `RUNTIME_KEYS` 白名单内才允许回退到 JS 源码 grep 兜底。
- `:81 RUNTIME_KEYS="jieqi-section jq-gz jq-tsmd jq-tstm xy-trigger"`
  - ⚠️ **注意**：兜底扫描文件为 **`render.js` / `main.js`**，**不包含 `xingyao.js`**。

→ 本版新增元素的归类（**修正版，以 ADR §10.4 方案 A 为准**）：

| 元素 | 性质 | 归属 |
|---|---|---|
| `xySearchBar`（搜索栏容器 id） | **静态**（index.html 硬编码） | → 追加进 `KEYS` |
| `xySearchInput` / `xySearchClear` / `xySearchCount` / `xySearchEmpty` | **静态** | → 追加进 `KEYS` |
| `xy-group-title`（栏头）【r5 更名】 | **静态标记**（三端 HTML，表格上方 `.xy-groups-heads` 内） | → **可进 `KEYS`**（静态可查，与 `xySearchBar` 等同列）；**`xy-group-row` 已废弃**：r5 不再生成该元素 ⇒ 从 `RUNTIME_KEYS` **删除**，不留幽灵白名单（§8.1 同步） |

> 本条为 v0.30.0 PRD 修订 r2 的更正：初版曾建议把 `xy-group-row` 直接追加进 `KEYS`，按现门禁实现会导致三端全部 ❌。感谢架构师实测指出。
> **r5 追加**：栏头由运行时生成的 `tr.xy-group-row` 改为**静态** `div.xy-group-title` ⇒ 归类**再次变更**（RUNTIME_KEYS → **KEYS**），且必须从 `RUNTIME_KEYS` 移除旧条目。三栏布局为**纯 CSS**（`.xy-table tbody` 的 Grid 规则），**不新增任何运行时 DOM 类**。

---

## 三、功能需求

### FR1 搜索框（位置与外观）

- **FR1.1 位置**：置于 `.xy-settings-body` **顶部、三栏容器之上**，与三栏同宽、同一水平内边距（8px 18px）。
- **FR1.2 结构（定稿）**：

```html
<div class="xy-search-bar" id="xySearchBar">
  <input type="text" id="xySearchInput" class="xy-search"
         placeholder="搜索干支（如 己 / 戌）" autocomplete="off"
         oninput="XINGYAO.filterRows(this.value)">
  <button type="button" class="xy-search-clear" id="xySearchClear"
          title="清空搜索" onclick="XINGYAO.clearSearch()">✕</button>
  <span class="xy-search-count" id="xySearchCount" role="status"></span>
</div>
<div class="xy-search-empty" id="xySearchEmpty" hidden>没有匹配的干支</div>
```

- **FR1.3 行为**：`input` 事件实时筛选（无防抖；60 行 DOM 显隐开销可忽略，且无防抖保证断言确定性）。
- **FR1.3.1 输入法组成态闸门（v0.30.0 修订 r2 增补，对齐 ADR §5）**：中文拼音输入在**组合期**（如 `j` → `ji` → `己`）也会触发 `input`；此期间**不得**执行筛选，否则列表会在 60/1/0 行之间抖动。要求：`filterRows()` 入口检查组合态标记（`compositionstart` 置位、`compositionend` 清位并立即执行一次真筛）；DOM 契约 `oninput="XINGYAO.filterRows(this.value)"` 保持不变，仅额外挂 `compositionstart` / `compositionend`。
  - 用户可见效果：拼音未上屏前列表不动，上屏瞬间一次性筛选到位。
- **FR1.4 清空按钮 `✕`**：仅当输入非空时可见；点击后清空输入并恢复全显、焦点回到输入框。
- **FR1.5 命中数**：`.xy-search-count` 显示「命中 N 项」；输入为空时**隐藏**（不显示「命中 60 项」）。
- **FR1.6 无结果**：命中 0 时显示 `#xySearchEmpty`（「没有匹配的干支」）+ 命中数显示「命中 0 项」，表格体无可见数据行。

### FR2 搜索匹配规则

- **FR2.1 匹配对象**：仅六十甲子字符串 `tr[data-gz]` 的 `data-gz` 值。**不**搜名称、**不**搜来源体系（O2）。
- **FR2.2 匹配方式**：**子串包含**，即 `gz.indexOf(q) !== -1`。
- **FR2.3 归一化**：`q = value.trim()`；空串（含纯空白）→ **全部 60 行可见**；不做大小写转换（中文干支无大小写语义）。
- **FR2.4 覆盖性**（由 FR2.2 自然得出，无需特判）：
  - 单天干（「己」）→ 6 行；单地支（「戌」）→ 5 行；整柱（「甲戌」）→ 1 行。
- **FR2.5 筛选实现铁律（本版最关键约束）**：
  > **筛选用「显隐」实现（`row.hidden = true` 或 class），绝不从 DOM 中移除/重渲染行。**
  理由：`collectDraft()` 依赖 `#xySettingsList tr[data-gz]` 全量遍历（xingyao.js:255–267）。若筛选靠删除 DOM 行，保存时将**丢失所有被隐藏行的草稿**。此题必须由编程师按此铁律实施，并在 AC04 断言。
- **FR2.6 筛选不触发重渲染**：`filterRows()` 只做行显隐 + 计数 + 空提示（**栏头不参与联动**，FR3.8），不调用 `renderSettings()`，不读写 localStorage。

### FR3 分组（v0.30.0 r5 重写：**三栏同屏并排**，三栏仅由 CSS 实现）

- **FR3.0 分组的目的（这是验收的核心，不是形式）**：三组**不是**「分段堆叠好读」，而是让 **60 个干支在同一屏内看得完、操作得完（打开即免纵向滚动）**，与「搜索直达」是同一诉求。任何仍需纵向滚动才能看全 60 行的实现，**即未达成需求**，无论栏头是否存在。
- **FR3.1 分组数**：3 组，每组 20 个，合计 60 个（`60 = 3 × 20`）。
- **FR3.2 切分规则**：按 `XY_GZ60` 正序，`[0,20) / [20,40) / [40,60)` 三等分（1-based 即 1–20 / 21–40 / 41–60）。
- **FR3.3 栏头文案（定稿）**：

| 栏 | 栏头文案 | 涵盖干支 |
|---|---|---|
| 第 1 组 | `第 1 组 · 甲子 – 癸未` | 甲子 … 癸未（20） |
| 第 2 组 | `第 2 组 · 甲申 – 癸卯` | 甲申 … 癸卯（20） |
| 第 3 组 | `第 3 组 · 甲辰 – 癸亥` | 甲辰 … 癸亥（20） |

- **FR3.4 布局实现（r5 定稿，Leader 钉死 + 测试师可测性约束）——「单一容器 + 纯 CSS 三栏」**

  **硬约束**：`#xySettingsList` **保持为 `<tbody>`**，60 个 `tr[data-gz][data-xy-group]` 全为其后代；三栏**只由 CSS 实现**。
  **禁止**拆成 3 张 `<table>` 或 3 个 `<tbody>` —— 理由：T05 / T10（`collectDraft()` 全量红线）/ T11 与 v0.29 以来的选择器体系，全部建立在「单一容器后代含 60 行」之上，拆容器会把 P0 红线与大批判据一起推翻。

```html
<div class="xy-groups-heads">
  <!-- 栏头 ×3：静态标记（三端 HTML 各一份），与下方三栏列宽对齐 -->
  <div class="xy-group-title" data-xy-group="1">第 1 组 · 甲子 – 癸未</div>
  <div class="xy-group-title" data-xy-group="2">第 2 组 · 甲申 – 癸卯</div>
  <div class="xy-group-title" data-xy-group="3">第 3 组 · 甲辰 – 癸亥</div>
</div>
<table class="xy-table">
  <thead><tr><th>六十甲子</th><th>纳音</th><th>星曜名称</th><th>来源体系</th></tr></thead>
  <tbody id="xySettingsList"><!-- renderSettings() 生成 60 行；行内不改结构 --></tbody>
</table>
```

```css
@media (min-width: 1280px) {                     /* 窄屏 <1280px 走 FR3.7 单栏降级 */
  .xy-table tbody { display: grid; grid-auto-flow: row dense;
    grid-template-columns: repeat(3, minmax(0,1fr));
    grid-template-rows: repeat(20, auto); column-gap: 16px; }
  .xy-table tbody > tr { display: grid; align-items: center; gap: 4px;
    grid-template-columns: 56px 76px minmax(0,1fr) minmax(0,1fr); }
  .xy-table tbody > tr[data-xy-group="1"] { grid-column: 1; }
  .xy-table tbody > tr[data-xy-group="2"] { grid-column: 2; }
  .xy-table tbody > tr[data-xy-group="3"] { grid-column: 3; }
  .xy-groups-heads { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); column-gap: 16px; }
}
```

> ⚠️ **r7 修正（必须用「按组钉列」写法，勿用 `grid-auto-flow:column`）**：`display:none` 的行**不是 grid item**，会被 auto-placement 跳过。因此 `grid-auto-flow:column` + `grid-template-rows:repeat(20,auto)` 只在 **60 行全显时**切栏正确；**一旦筛选**，可见行会从栏 1 顶部依次重排 —— 例：搜「己」6 命中（组1 己巳/己卯、组2 己丑/己亥、组3 己酉/己未）会**全部落到栏 1**，栏 2/3 空，与 FR3.8「空栏保留占位」直接冲突。
> **r7 实测定证**（真实浏览器，隔离样本）：全显态两种写法逐像素等价（三栏 left = 18 / 423 / 829，各 20 行）；筛选态下 `grid-auto-flow:column` 版 6 行 left **全为 18**，按组钉列版为 **18 / 423 / 829**（正确）。
> `row dense` 不改变文档顺序 ⇒ `collectDraft()` 仍按 `#xySettingsList tr[data-gz]` 全量遍历、零改动；三栏列轨道由 `grid-template-columns` **显式声明**，不因某栏无可见行而塌陷 ⇒ 栏头（独立 `.xy-groups-heads`）始终占位。
> 备选（体积大，非必要不用）：60 条 `tr[data-xy-group="N"]:nth-child(k){grid-row:k}` 显式定位。

- **FR3.4.3 断言边界（r7 新增，测试与实现解耦）**：断言只锁定**钩子 / 行为 / 几何**（`.xy-groups-heads`、`.xy-group-title[data-xy-group]`、`tbody#xySettingsList`、`thead th`=4、`.xy-settings-body` 免滚动、栏头 `top` 同带/`left` 递增/栏宽 >0）；**严禁断言 computed `grid-auto-flow` / `grid-template-*` 的字面值**（会锁死实现，且字面写法本身不满足 FR3.8）。

- **FR3.4.1 表头（Leader 裁定，r5）**：**三栏共享一行表头** —— `thead th` 恒为 **4**（`六十甲子 / 纳音 / 星曜名称 / 来源体系`），且**只出现一次**；分栏标识由栏头承担，**不在每栏重复列名**（避免 th 膨胀为 12）。
  - 已知取舍（记录待观察，不阻断本版验收）：4 列名作为**通栏图例**呈现，与各栏内字段不做逐列像素对齐。若实测出现「分不清哪列是名称/体系」，记为 R 项供后续版本优化。
  - **thead 不加 sticky**：免滚动前提下 sticky 无意义（且会与栏头叠层）。
- **FR3.4.2 兼容契约（减少测试与门禁改动面）**：
  - `#xySettingsList` **仍是 `<tbody>`**（**不再**改为容器 `div`）⇒ `#xySettingsList tr[data-gz]` 与 v0.29 全部选择器**零改动**，恒为 60 行。
  - 每行**仍带** `data-xy-group="1|2|3"` ⇒ 按组计数判据零改动。
  - 栏头由 `<tr class="xy-group-row">`（表内行）**改为** `<div class="xy-group-title">`（表外、表格上方，与三栏列宽对齐）—— **语义与选择器均更名**，测试侧需同步。
  - 栏头为**静态**标记 ⇒ 门禁 `KEYS` 可静态校验 `xy-group-title`；`RUNTIME_KEYS` 中的 `xy-group-row` **必须删除**（不再生成就删，不留幽灵白名单）。
- **FR3.5 与既有逻辑的隔离**：栏头 `.xy-group-title` 不带 `data-gz`、且**不在 tbody 内** ⇒ 既不被 `collectDraft()` 收集，也不计入「数据行 = 60」。
- **FR3.6 尺寸、断点与预算（Leader 钉死的唯一基线）**
  - **视口基线**：主基线 **1440×900**；另抽查 **1280×800** 与 **1600×1000** 均须成立。
  - **断点**：**≥1280px 必须三栏并排**；**<1280px 允许退化为单列纵向滚动**，记为已知行为 **L**（不阻断验收）。
  - **弹层尺寸**：`.xy-settings-modal` 由 `max-width:720px; max-height:85vh` 改为 **`width:90vw; max-width:1200px; max-height:92vh;`**。
  - **宽度预算**：1440 屏 → `90vw = 1296px` → 受 1200px 上限 ⇒ 弹层 1200px；减内边距 18×2 = 36 ⇒ 内容 ~1164px；减 2×16px 栏间距 ⇒ **每栏 ~377px**（干支 ~52 + 纳音 3 字 ~64 + 名称输入 ~110 + 体系输入 ~110 ≈ 336px，余量 ~40px）。1280 屏 → `90vw = 1152px` ⇒ 每栏 ~361px，**仍成立**。
  - **高度预算（`92vh` 是必要条件，只加宽不加高仍做不到「一屏看完」）**：900px 高视口 → `92vh = 828px`；扣标题栏 + 搜索栏 + 页脚 + 内边距 ≈ 180px ⇒ **表区 ~648px**；每栏 = 表头 ~30px（共享一次）+ 20 行 × 26–27px ≈ 520–540px ⇒ 合计 **~570px**，余量 ~78px。
    ⚠️ 若沿用 `85vh`（~765px → 表区 ~585px），余量仅 ~15px，行高稍增即溢出 —— 故 **宽度与高度是一套，必须同时改**。
  - 视觉：栏间距 16px；栏头 `font-family: var(--font-display); font-size:13px; letter-spacing:.05em; color: var(--c-ink); padding:6px 4px;`（浅底取现有变量，不引入新色板）；数据行高 ≈26px，`td` 内边距沿用现行 `4px 6px`。
  - **不得用 sticky 表头或滚动容器「假装一屏」**：验收看的是无纵向溢出（AC20），不是「能滚到」。
- **FR3.7 窄屏降级（<1280px，Leader 裁定记 L）**：三栏退化为**单列纵向**（媒体查询覆写为 `grid-auto-flow: row; grid-template-rows: none; grid-auto-columns: auto`），页面**不横向溢出**，允许纵向滚动；此场景 **AC20 不适用**（AC23 判定）。
- **FR3.8 空栏与整体无结果（Leader 裁定，r5）**：
  - **空栏保留占位、栏头不隐藏**（避免布局横向跳动）—— 命中落在哪栏就哪栏有行，其余栏显示栏头 + 空白。
  - 整体命中 0 时，**只在列表区显示一次** `#xySearchEmpty`「没有匹配的干支」，**不在三栏内重复**。
  - **免滚动断言只在「空查询（60 行全显）」状态断**：筛选后命中 ≤6 行时天然免滚动，测不出布局问题。
  - ⚠️ 本条**取代** r5 初稿的「整栏隐藏」（`section.xy-group[hidden]`）写法 —— 那会造成横向跳动，已废弃。

### FR4 纳音列

- **FR4.1 列名（定稿）**：`纳音五行` → **`纳音`**（index.html:926 改；三端各一处）。
- **FR4.2 取值（定稿）**：`NAYIN[gz]` —— **完整纳音名**。

```js
// 改造后（xingyao.js renderSettings 内）
var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz] : '';
```

- **FR4.3 异常兜底**：`NAYIN[gz]` 缺失（理论上 60 键全覆盖）→ 显示 `—`（沿用 v0.29 空值风格）。
- **FR4.4 列宽**：完整名 3 字，`.xy-nayin { white-space: nowrap; }`（防换行撑高行高）。
- **FR4.5 全名对照（抽样 12 项，与 §5.4 一致）**：甲子→海中金、乙丑→海中金、丙寅→炉中火、丁卯→炉中火、戊辰→大林木、己巳→大林木、庚午→路旁土、辛未→路旁土、壬申→剑锋金、癸酉→剑锋金、甲戌→山头火、乙亥→山头火。

### FR5 与主盘的一致性

- **FR5.1 一致性原则（定稿）**：「同一干支的纳音，在设置页与主盘必须显示同一个字符串」。
- **FR5.2 两处数据源同源**：均取 `constants.js` 的 `NAYIN` 表；设置页改造后与主盘（`NAYIN[gan+zhi]`）**天然同源同值**。
- **FR5.3 不改主盘**：主盘纳音行维持现状（本就是完整名），本版不触碰（O1）。
- **FR5.4 与「纳运」的区别（防混淆，写进 ADR/测试注释）**：主盘另有「纳运」行 = 由纳音**五行**推十二长生（`NAYIN_WX_YANG`，constants.js:929）；「纳运」继续用五行，**不因本轮改动而变**。即：纳音=完整名，纳运=由五行推得，两者并存不冲突。

### FR6 设置页状态机（沿用 v0.29，本版不改变语义）

- **FR6.1 语义保持不变**（v0.29 §7 唯一确定）：修改=编辑+「保存并关闭」；清空=清空全部草稿（不落盘）；还原=丢弃草稿、以「已保存值」重填；未保存关闭=等同还原。
- **FR6.2 「清空」的作用域（本版需明确，唯一确定）**：**清空全部 60 行草稿，与当前筛选状态无关**。即筛选状态下点「清空」，被隐藏行的草稿同样被清空。
  - 理由：与「清空=清空草稿」语义一致，避免出现两套清空语义（清可见 vs 清全部）带来的不可预期。
  - 实现：`clear()` 现有实现即 `querySelectorAll('#xySettingsList .xy-name, .xy-system')` 全量，**无需改动**。
- **FR6.3 「还原」后筛选词的处理（本版需明确，唯一确定）**：`restore()` 调 `renderSettings()` 重填数据后，**保留当前搜索词并重新应用筛选**（用户正在找同一批干支，不应因还原而丢失筛选上下文）。
  - 实现：`restore()` = `renderSettings()` → `filterRows(currentQuery)`；其中 `currentQuery` 取 `#xySearchInput.value`。
- **FR6.4 「清空搜索」与「清空草稿」是两个不同按钮，不得混淆**：
  - `✕`（`xy-search-clear`）→ 只清搜索框（FR1.4）；
  - 页脚「清空」→ 只清草稿（FR6.2）。

### FR7 打开/关闭时的筛选重置

- **FR7.1 `openSettings()`**：重置搜索框为空、恢复 60 行全显、隐藏空结果提示与命中数提示（每次打开都是「全量」视图）。
- **FR7.2 `closeSettings()` / 保存并关闭**：搜索状态不落盘（纯 UI 态，不入 localStorage）。

---

## 四、UI 文案与交互（定稿）

| 位置 | 元素 | 文案（定稿） |
|---|---|---|
| 搜索框 placeholder | `#xySearchInput` | `搜索干支（如 己 / 戌）` |
| 搜索清空按钮 | `#xySearchClear` | 图标 `✕`，`title="清空搜索"` |
| 命中数提示 | `#xySearchCount` | `命中 N 项`（空输入时隐藏） |
| 无结果提示 | `#xySearchEmpty` | `没有匹配的干支` |
| 分组栏头 | `.xy-group-title` | `第 1 组 · 甲子 – 癸未` / `第 2 组 · 甲申 – 癸卯` / `第 3 组 · 甲辰 – 癸亥` |
| 列名 | `.xy-table thead th[1]` | `纳音`（原「纳音五行」） |
| 列名 2/3/4 | 不变 | `六十甲子` / `星曜名称` / `来源体系` |
| 页脚说明 | `.xy-note` | 保持现文案（可追加一句「可按干支搜索」——**可选**，建议不加，避免文案冗余） |

**交互流（关键路径）**：
1. 工具栏「星曜」→ `openSettings()` → 60 行全显、搜索框空。
2. 输入「己」→ 实时可见**数据行 6**（**栏头恒 3、空栏保留占位**，无横向跳动）；输入「戌」→ 5 行。
3. 直接在可见行填名称/体系 → 「保存并关闭」→ 落盘（含被隐藏行原值，见 FR2.5）。
4. 输入「甲戌」→ 1 行 → 只填这一行 → 保存 → 只改这一行，其余 59 行不受影响。
5. 搜索无匹配（如「XYZ」）→ 「没有匹配的干支」。

---

## 五、数据与兼容性

### 5.1 localStorage（不变）

- 键：`bz_xingyao_map`（真实）/ `bz_xingyao_map__test`（`?test=1`）。
- 结构：`{ schemaVersion: 1, updatedAt: ISO, map: { 甲子: {name, system}, … 60 } }`。
- **本版不新增键、不改结构、不迁移**（O4）。搜索/分组/纳音列均为**纯 UI/派生**，不落盘。

### 5.2 导出 / 导入 JSON（不变）

- `buildExportPayload()` / `validateImportPayload()` / `applyImportPayload()` 逻辑与结构均**不改动**。
- 说明：导入的 payload 不含纳音（派生），故本版对导出/导入零影响。

### 5.3 派生数据（不入库）

| 数据 | 来源 | 是否入库 |
|---|---|---|
| 纳音全名 | `NAYIN[gz]`（constants.js） | ❌ 派生，每次渲染取 |
| 分组归属 | `XY_GZ60` 下标 `floor(i/20)` | ❌ 派生 |
| 搜索命中 | 运行时 `indexOf` | ❌ 不入库 |

### 5.4 抽样全名对照表（用于 T06 断言改写）

| 干支 | 完整纳音 | 干支 | 完整纳音 |
|---|---|---|---|
| 甲子 | 海中金 | 庚午 | 路旁土 |
| 乙丑 | 海中金 | 辛未 | 路旁土 |
| 丙寅 | 炉中火 | 壬申 | 剑锋金 |
| 丁卯 | 炉中火 | 癸酉 | 剑锋金 |
| 戊辰 | 大林木 | 甲戌 | 山头火 |
| 己巳 | 大林木 | 乙亥 | 山头火 |

---

## 六、边界与异常

| 编号 | 场景 | 期望行为 |
|---|---|---|
| E01 | 搜索纯空白 `"   "` | 等同空串 → 全显 60 |
| E02 | 搜索不存在的字（「XYZ」「氵」） | 0 命中 + 无结果提示 + 命中数「命中 0 项」 |
| E03 | 搜索含正则元字符（「.」「*」「[」） | 按**字面**子串匹配，不得当正则（`indexOf` 天然安全） |
| E04 | 搜索「甲戌」整柱 | 1 命中；编辑该行后保存 → 只有该行变化 |
| E05 | 筛选态保存 | 被隐藏行的草稿**不丢**（FR2.5 铁律，AC04） |
| E06 | 筛选态点「清空」 | 全部 60 行草稿清空（隐藏行亦然），搜索词不变、筛选态不变 |
| E07 | 筛选态点「还原」 | 重填已保存值 + **保留搜索词并重新筛选**（FR6.3） |
| E08 | 反复切换筛选词 | 行显隐正确、草稿不丢、无累积错乱 |
| E09 | 保存后重开设置页 | 搜索框为空、60 行全显、值=已保存值 |
| E10 | 未保存直接关闭再打开 | 等同还原（草稿丢弃），搜索框为空 |
| E11 | 旧版 `bz_xingyao_map` 数据（v0.29 写的） | 正常读取、不报错、不迁移，值正确回填 |
| E12 | localStorage 损坏 | 沿用 v0.29：备份 `bz_xingyao_map_corrupt_<ts>` + 提示 + 全空 |
| E13 | `NAYIN[gz]` 缺失 | 显示 `—`（正常 60 键全覆盖，不触发） |
| E14 | `?test=1` 测试态 | 静默（不 alert、不弹窗），键隔离到 `__test` |
| E15 | 窄屏（<1280px，r5 重写） | 三栏降级为**单栏纵向**（行序仍 甲子→癸亥），输入框可操作、页面不横向溢出；**允许纵向滚动**（记已知行为 L，见 FR3.7） |
| E16 | 主盘无星曜行时打开设置页 | 不存在关联（设置页独立），仍可正常保存 |
| E17 | 拼音组合期（输入「j」未上屏） | 列表**不抖动**，上屏后一次性筛选（AC18） |
| E18 | 作者样式压过 `hidden` | 补兜底 CSS `.xy-settings-modal [hidden]{display:none !important;}`（ADR §5 定稿） |
| E19 | 浏览器不支持 composition 事件 | 退化行为 = 与无闸门一致（按 `input` 直接筛），不报错 |
| E20 | 宽屏三基线（1440×900 / 1280×800 / 1600×1000） | 三栏并排、60 行同屏、`.xy-settings-body` 无纵向滚动（AC20/AC21），**三基线均须成立** |
| E21 | 视口较矮但仍 ≥1280px 宽（如 1280×800） | 优先保住「无纵向溢出」：允许压缩行高/字号（92vh 预算见 FR3.6）；若仍溢出，**须**记为未达成 AC20 的存疑项，**不得用滚动假装通过** |
| E22 | 视口宽 < 1280px | 走 FR3.7 降级为单栏纵向、允许纵向滚动 ⇒ 记 L，AC23 判定；**AC20 在此场景不适用** |
| E23 | **弹层未打开（`display:none`）时测量免滚动** | ⚠️ `scrollHeight` 与 `clientHeight` **同为 0**，`0 ≤ 0` **恒真** ⇒ 不开弹层就断**必然假绿**。AC20/T12 **前置 `openSettings()` 且 `#xySettingsOverlay.show`**，严禁在此状态取样 |

---

## 七、验收标准（AC）

> 所有 AC 均可代码级/浏览器级核验；带 **【条数】** 的为硬数字断言。

| 编号 | 验收标准 | 核验方式 |
|---|---|---|
| **v0.30-AC01** 【条数】 | 搜索「己」→ 可见数据行 **6**；「戌」→ **5**；「甲戌」→ **1**；「壬」→ **6**；空串 → **60** | `filterRows(q)` 后 `querySelectorAll('tr[data-gz]:not([hidden])').length` |
| **v0.30-AC02** | 命中集合精确：己 → 己巳/己卯/己丑/己亥/己酉/己未；戌 → 甲戌/丙戌/戊戌/庚戌/壬戌 | 逐一比对 `data-gz` 集合 |
| **v0.30-AC03** 【条数】 | 分组结构（r5）：**单一容器**（`#xySettingsList.tagName === 'TBODY'`、`table.xy-table` 计数 = **1**、`tbody` 计数 = 1）；数据行 **60**；按 `data-xy-group` 切栏 **20/20/20**；栏头 `.xy-group-title` **3** 个 | `#xySettingsList.tr[data-gz]`=60；分组计数 = 20/20/20；`.xy-group-title`=3；**禁止**出现第 2 张 `table.xy-table` / 第 2 个 `tbody` |
| **v0.30-AC04** | 分组边界与顺序：第1栏首=甲子、末=癸未；第2栏首=甲申、末=癸卯；第3栏首=甲辰、末=癸亥；`#xySettingsList` 内 `tr[data-gz]` 的**文档顺序**仍是 甲子→癸亥（1–20 / 21–40 / 41–60）；栏头 `data-xy-group` 1/2/3 的 `left` 依次递增（标称，见 AC21） | 取各栏 first/last `data-gz`；比对栏头几何 |
| **v0.30-AC05** | 列名 = 「纳音」（原「纳音五行」）；**r5**：三栏**共享一行表头** ⇒ `thead th` 恒 **4**、只出现一次，第 2 列为「纳音」 | `document.querySelectorAll('.xy-table thead th').length === 4` 且 `th[1].textContent.trim() === '纳音'`（**不因分栏膨胀为 12**） |
| **v0.30-AC06** 【条数】 | 纳音值 = 完整名，抽样 12 项全等（§5.4）；60 行纳音列均非空且 ∈ NAYIN 值域 | 逐行 `.xy-nayin` 文本 vs `NAYIN[gz]` |
| **v0.30-AC07** | 设置页与主盘一致性：同柱干支的纳音字符串两处相同 | 取主盘纳音行该柱文本 vs 设置页该行 `.xy-nayin` 文本 |
| **v0.30-AC08** | 无结果提示：搜「XYZ」→ `#xySearchEmpty` 可见 + 可见数据行 **0** + 命中数文案含「0」 | DOM 断言 |
| **v0.30-AC09** | 命中数提示：搜「己」→ 文案 `命中 6 项`；空输入 → `#xySearchCount` 隐藏 | DOM 断言 |
| **v0.30-AC10** | 清空搜索 `✕`：点击后输入为空、可见数据行 **60**、`#xySearchEmpty` 隐藏 | DOM 断言 |
| **v0.30-AC11** | **筛选不丢草稿（P0）**：填可见行若干 + 隐藏行原有值 → 筛选态保存 → `getAll()` 60 键完整、被隐藏行值不变 | `X.getAll()` 深度比对 |
| **v0.30-AC12** | 打开设置页筛选重置：保存并关闭 → 再打开 → 搜索框空、60 行全显 | DOM 断言 |
| **v0.30-AC13** | 还原保留筛选：输入「己」→ 点「还原」→ 仍只显 6 行，且值 = 已保存值 | DOM 断言 |
| **v0.30-AC14** | 清空作用全量：筛选「己」态点「清空」→ 恢复全显后 60 行草稿皆空 | DOM 断言 |
| **v0.30-AC15** | 持久化兼容：预置 v0.29 结构（`schemaVersion:1` + `map{gz:{name,system}}`）→ 读取不报错、值正确回填、键结构不变 | 预置 + 读取比对。⚠️ **测试态注**：`?test=1` 下 `storeKey()` 实返 `bz_xingyao_map__test`（`XY_TEST_KEY`），**预置须写测试键**并 `resetTestStore()` 收尾 —— 写真实键在测试态**读不到**（白写）且污染用户数据；正式口径见《测试执行说明》HP5 |
| **v0.30-AC16** | 三端一致：index.html / standalone.html / standalone-split.html 三端搜索/分组/纳音列行为一致 | 三端各跑断言 |
| **v0.30-AC17** | 无回归：v0.29 既有断言（T01–T04、T07–T10 等）全绿；**T05 表头[1] 与 T06 抽样按 §2.6 更新后**全绿 | `?test=1` 全量 |
| **v0.30-AC18** | **输入法组成态不筛选（r2 增补）**：`compositionstart` 后、`compositionend` 前调用 `filterRows('己')` → **行显隐不变**（仍 60 可见）；`compositionend` 后 → 命中 6 行 | 直调 `filterRows` + composition 事件断言 |
| **v0.30-AC19** | **显隐机制 = `hidden` 属性 且兜底 CSS 生效（r3 强化）**：筛选后不可见行满足 ① `tr[data-gz].hasAttribute('hidden') === true`，**且** ② `getComputedStyle(tr).display === 'none'`（证明兜底 CSS `.xy-settings-modal [hidden]{display:none!important}` 真的压得住作者样式，亦即 E18 场景被守住）；可见行满足 `tr[data-gz]:not([hidden])`。**空栏（r5）**：某栏无可见行时**栏头不隐藏、位置不变**（仅该栏为空），不得出现 `hidden` 栏头或横向跳动 | 属性断言 + `getComputedStyle` 双断。⚠️ **测量前提（r4 勘误）**：② 必须在**弹层可见态**（`#xySettingsOverlay` 含 `.show`）下取样 —— 祖先 `display:none` 时子元素 `getComputedStyle` 的 `display` 会失真，会造成假红/假绿 |
| **v0.30-AC20** 【r5 核心】 | **同屏免纵向滚动**：**空查询（60 行全显）**状态下，三栏与全部填写列在同一屏内可见可操作、**实际滚动容器无需纵向滚动** —— `.xy-settings-body`（`overflow-y:auto`）满足 `scrollHeight - clientHeight ≤ 2px`（亚像素容差）。**视口基线：1440×900 为主，另须在 1280×800 与 1600×1000 成立**；<1280px 不适用（走 AC23）。**这是本版第一验收项** | 取样骨架：① 视口 ≥1280px；② **先 `openSettings()` 且 `#xySettingsOverlay` 含 `.show`**；③ 等 `document.fonts.ready`（或 rAF 一帧）后再量；④ 断言绑 `.xy-settings-body`，**禁用** `getBoundingClientRect` 判「是否在视口内」 |
| **v0.30-AC21** | **三栏并排（几何，标称不 pixel-perfect）**：三栏容器 `display !== 'none'`；三栏栏头 `top` 近似同排（`max-min ≤ 8px` 容差，标称）；栏头 `left` 依次递增；各栏宽度 **> 0** | `getBoundingClientRect()` 逐栏比对（**不写死像素宽度**，见 FR3.6 预算） |
| **v0.30-AC22** | **弹层尺寸生效**：`.xy-settings-modal` 实际宽度 ≈ `min(90vw, 1200px)`（±8px）；高度仍 ≥ 20 行所需（由 AC20 兜住） | `Math.abs(w - Math.min(0.9*innerWidth, 1200)) <= 8`。⚠️ 不可断「≥85% 视口」：1440 屏下 `min(90vw,1200)=1200` 只占 83.3%，该写法**必然假红** |
| **v0.30-AC23** | **窄屏降级（记已知行为 L）**：视口 **< 1280px** 时三栏退化为**单栏纵向**（栏数 1、行序仍 甲子→癸亥），可操作且**不横向溢出**（`document.documentElement.scrollWidth <= innerWidth + 1`）；**允许纵向滚动**，AC20 在此场景不适用 | 缩窄视口（如 1024×768、375×667）后取溢出量与几何；L 项不阻断验收 |
| **v0.30-AC24** | **空栏占位 + 无结果唯一提示**：搜「癸亥」（命中仅在第 3 栏）→ **栏头仍为 3 个、三栏 `display !== 'none'`、位置不变**（空栏保留占位、无横向跳动），可见数据行 = 1；搜「己」→ 可见行 = 6（三栏各 2 行，按切栏）；搜「XYZ」→ `#xySearchEmpty` 在列表中**只出现 1 次**且可见，可见数据行 = 0 | `.xy-group-title` 计数恒 3；`getComputedStyle(栏头).display !== 'none'`；`document.querySelectorAll('#xySearchEmpty').length === 1` |
| **v0.30-AC25** 【r7 新增·筛选态栏位】 | **筛选后命中行必须渲染在其所属组的栏位内**（渲染栏位正确性）：每一可见行 `tr[data-gz]` 的 rendered `left` 落在其 `data-xy-group` 对应栏头 `.xy-group-title[data-xy-group=N]` 的水平区间内（`[head.left - 容差, head.right + 容差]`，容差 ≤8px）；搜「己」→ 组1/2/3 各行分别落在栏 1/2/3 带内（**不是** 6 行全挤栏 1）。**严禁仅凭 `[data-xy-group]` 计数判定**（缺陷实现下计数仍 2/2/2，是**假绿**） | `getBoundingClientRect()`：逐可见行比对其栏头的水平区间；须先 `openSettings()` |

### 7.1 建议新增断言（编程师补入 `?test=1`，命名 `v0.30 T0x`）

| 编号 | 断言内容 |
|---|---|
| T01 | 搜索命中条数：己=6 / 戌=5 / 甲戌=1 / 空=60（AC01） |
| T02 | 分组结构（r5）：**单一容器** `#xySettingsList` 仍为 `<tbody>`、`table.xy-table` = 1；数据行 60；按 `data-xy-group` 切栏 20/20/20；栏头 `.xy-group-title` = 3；**共享表头** `thead th` = 4；边界 4 项（AC03/AC04） |
| T03 | 列名与纳音值（r5）：**共享表头** `thead th` = 4 且 `th[1]` = 「纳音」；抽样 12 项全名（AC05/AC06） |
| T04 | 筛选态保存不丢隐藏行草稿（AC11） |
| T05 | 空结果 + 命中数文案 + 清空搜索（AC08/09/10） |
| T06 | 打开重置筛选 + 还原保留筛选 + 清空作用全量（AC12/13/14） |
| T07 | 设置页 vs 主盘纳音一致性（AC07） |
| T08 | 输入法组成态不筛选：compositionstart → filterRows 不生效；compositionend → 生效（AC18） |
| T09 | 显隐机制 = `hidden` 属性 **且** `getComputedStyle(tr).display==='none'`（双断，守兜底 CSS / E18），AC01/AC10 选择器成立（AC19）。**取样式须在弹层可见态**（`#xySettingsOverlay.show`），断言前置 `openSettings()`（r4） |
| T10 | **哨兵断言**：`collectDraft()` 采集到被隐藏行（`hidden` 行仍有 `tr[data-gz]` 且其值进入草稿），即 AC11 的直接守护者 |
| T11 | **搜索态不落盘**：`filterRows(q)` 前后 `localStorage[storeKey()]` 字节不变；搜索词变更不产生任何写入 |
| T12 | **同屏免滚动（r5 第一验收项）**：**先 `openSettings()`**（未开时 `0≤0` 假绿，见 E23）→ `.xy-settings-body`（实际滚动容器）`scrollHeight - clientHeight ≤ 2px`；视口 1440×900 / 1280×800 / 1600×1000 **均成立**（AC20）；取样在 `document.fonts.ready` / rAF 之后 |
| T13 | **三栏并排几何（标称，不 pixel-perfect）**：三栏容器 `display !== 'none'`、栏头 `top` 同带（容差 ≤8px）、栏头 `left` 递增、各栏宽 > 0；弹层宽 ≈ `min(90vw, 1200px)`（AC21/AC22） |
| T14 | **空栏占位 + 无结果唯一提示**：搜「癸亥」→ 栏头仍 3 个、三栏 `display!=='none'`、位置不变（空栏保留占位、无横向跳动），可见行 = 1；搜「XYZ」→ `#xySearchEmpty` **全局只 1 个**且可见、可见行 = 0（AC24） |
| T15 | **筛选态栏位正确性（r7 新增）**：搜「己」→ 组1/2/3 的可见行 rendered `left` 分别落在栏 1/2/3 的栏头水平带内（容差 ≤8px）；**不得**用 `[data-xy-group]` 计数代替几何判定（AC25） |

---

## 八、影响范围与风险

### 8.1 改动面（供 ADR 定位）

| 文件 | 位置 | 改动 |
|---|---|---|
| `xingyao.js` | `renderSettings()`（:150–167） | 列名不在此；纳音取全名；**r5：不再插入任何组标题行**（栏头为表外**静态** `.xy-groups-heads`，FR3.4），`<tbody>` 仅 60 行 + `data-xy-group` |
| `xingyao.js` | 新增 `filterRows(q)` / `clearSearch()` | 行显隐 + 计数 + 空提示（**栏头无联动**：空栏保留占位、栏头不隐藏，FR3.8） |
| `xingyao.js` | `restore()`（:246） | 重填后重新应用当前筛选 |
| `xingyao.js` | `openSettings()`（:168） | 重置搜索框与筛选 |
| `xingyao.js` | `window.XINGYAO` 导出（:330+） | 追加 `filterRows` / `clearSearch`（测试与 onclick 调用） |
| `index.html` | :926 | `<th>纳音五行</th>` → `<th>纳音</th>` |
| `index.html` | :923–925 | `.xy-settings-body` 内新增搜索栏 + 空结果提示 |
| 三端 HTML | `.xy-settings-body` 内（表格上方） | **r5 新增静态骨架**：`.xy-groups-heads` + 3 个 `.xy-group-title` 栏头；`#xySettingsList` **仍是 `<tbody>`**（不拆表、不拆 tbody） |
| `index.html` | :236–270 附近 | 新增 `.xy-search*` 样式；**r5 新增** `.xy-groups-heads` / `.xy-group-title` 样式 + **三栏 Grid 规则**（**r7 终版**：`grid-auto-flow:row dense` + `grid-template-columns:repeat(3,minmax(0,1fr))` + `tr[data-xy-group="N"]{grid-column:N}`，整体包在 `@media (min-width:1280px)` 内 —— 详见 FR3.4，**勿用 `grid-auto-flow:column`**）；`.xy-settings-modal` 尺寸覆写为 `width:90vw;max-width:1200px;max-height:92vh`；<1280px 媒体查询降级单列 |
| `index.html` / `standalone.html` | 内联 xingyao 段 | 与 `xingyao.js` 同步（防漂移，check-release 第 4 步会核） |
| `standalone-split.html` | — | 外链 `xingyao.js`，自动同步 |
| `main.js` | :1787 / :1796–1803 | 更新 T05 表头断言与 T06 抽样断言（§2.6） |
| `main.js` | 新增 v0.30 T01–T14（含 r5 追加的 T12–T14） | 见 §7.1 |
| `scripts/check-release.sh` | :17 `KEYS` | 追加**静态**项 `xySearchBar xySearchInput xySearchClear xySearchCount xySearchEmpty` + **r5** `xy-group-title`（栏头已改为静态）|
| `scripts/check-release.sh` | `RUNTIME_KEYS` | **r5 删除** `xy-group-row`（不再生成）；本版三栏为纯 CSS ⇒ **不新增**运行时类 |

### 8.2 风险

| 编号 | 风险 | 等级 | 缓解 |
|---|---|---|---|
| R1 | 筛选若用「删 DOM」实现 → 保存丢隐藏行数据 | **高** | FR2.5 铁律 + AC11 断言（P0） |
| R2 | `renderSettings()` 重生成 tbody 会丢草稿 | 中 | 还原/搜索均不重渲染；仅 restore 重渲染（语义就是丢弃草稿） |
| R3 | 栏头被 `collectDraft` 误收集 | 低 | 栏头在 `<tbody>` 外、不带 `data-gz`（FR3.5）+ AC03 断言数据行=60 |
| R4 | 列名/抽样断言未同步 → 回归误红 | 中 | §2.6 明确列出待改断言 + AC17 |
| R5 | 三端漂移（内联段改了、单体版没改） | 中 | check-release 第 4 步一致性核 + AC16 |
| R6 | 栏头 / 表头 sticky 相互遮挡 | 低 | FR3.4.1 与 FR3.6 明确**均不 sticky** |
| R7 | 搜索框在窄屏被压缩 | 低 | FR1.1/E15 宽度 100% |

### 8.3 回滚预案

- 本版为纯增量（搜索/分组/纳音列均为设置页内 UI），**不涉数据格式**。
- 回滚 = 还原本版改动的文件（`xingyao.js` / 三端 HTML / `main.js` 断言 / `check-release.sh`）；localStorage 数据无需回滚（结构未变，可被 v0.29 直接读取）。

---

## 九、待确认项（D 清单，均给建议、不阻塞编程）

| 编号 | 待确认 | 建议 | 影响 |
|---|---|---|---|
| D1 | 栏头是否带「第 N 组」序号 | **带**（FR3.3 定稿） | 文案 |
| D2 | 栏头分隔符：`–` vs `~` vs `至` | `–`（半角短横）| 文案 |
| D3 | 是否显示命中数提示 | **显示**（FR1.5） | 若否，AC09 删除 |
| D4 | 是否加「清空搜索」✕ 按钮 | **加**（FR1.4） | 便利性 |
| D5 | 清空作用域：全量 vs 仅可见 | **全量**（FR6.2） | 语义唯一性；选「仅可见」需额外 AC |
| D6 | 还原是否保留筛选词 | **保留**（FR6.3） | 用户上下文 |
| D7 | 搜索是否支持多关键字（空格分隔 AND） | **不支持**（本版 O3） | 可作后续 |
| D8 | 搜索是否也匹配「星曜名称/来源体系」 | **不匹配**（O2） | 可作后续 |
| D9 | 栏头 / 表头是否需要 sticky | **均不 sticky**（FR3.6/FR3.4.1：免滚动前提下无意义，且会与栏头叠层） | 视觉 |
| D10 | 是否补 `check-release.sh` 门禁 | **补**：静态项进 `KEYS`；**r5** 追加 `xy-group-title` 进 `KEYS` 并**删除** `RUNTIME_KEYS` 的 `xy-group-row`（§2.7/§8.1 修正版） | 门禁覆盖 |
| D14 | 三栏如何实现（r5；CSS 写法见 r7 的 D19） | **单一容器 + 纯 CSS**：`#xySettingsList` 保持 `<tbody>`、60 行全为后代（**禁止** 3 表/3 tbody，理由见 FR3.4）；**具体 CSS 写法以 D19「按组钉列」为准**（r5/r6 的 `grid-auto-flow:column` 已废止） | Leader 钉死 + 测试师可测性约束 |
| D15 | 空栏如何处理（r5） | **保留占位、栏头不隐藏**（避免横向跳动）；整体命中 0 时 `#xySearchEmpty` **全局只显示 1 次**。⚠️ 取代 r5 初稿的「整栏隐藏」 | Leader 裁定 |
| D16 | 表头是否随分栏重复（r5） | **不重复**：三栏共享一行表头（`thead th` 恒 4），栏头承担分栏标识；已知取舍：4 列名为通栏图例、不做逐栏像素对齐（实测困惑则记 R 项） | Leader 裁定；保 AC05/T04 不膨胀 |
| D17 | 栏容器/栏头的选择器钩子（测试师 Q1） | **不引入** `[data-xy-col="N"]` **容器钩子**——它与「单一容器」硬约束（D14）冲突（三栏无独立 DOM 容器）。**定稿钩子**：栏头 `.xy-group-title[data-xy-group="N"]`（`N`=1/2/3，非 `<th>`）、数据行 `tr[data-gz][data-xy-group="N"]`；栏头父容器 `.xy-groups-heads` | 已答复测试师；与 D14 自洽 |
| D18 | 断点值（测试师 Q2） | **1280px**（`≥1280px` 三栏并排；`<1280px` 降级单栏纵向、允许滚动、记 L） | Leader 钉死，与 AC23/E15/E22 一致 |
| D19 | 三栏 CSS 写法（r7 修正） | **必须「按组钉列」**：`grid-auto-flow:row dense` + `grid-template-columns:repeat(3,…)` + `tr[data-xy-group=N]{grid-column:N}`。**禁用** `grid-auto-flow:column`（筛选态下 `display:none` 行不是 grid item，可见行会全挤栏 1，与 FR3.8 冲突） | 编程师实测 + 产品经理真实浏览器复验（全显等价、筛选态 18/423/829 vs 全 18） |
| D20 | 断言可否锁 CSS 字面值（r7） | **禁止**锁 computed `grid-auto-flow` / `grid-template-*`（锁死实现）；断言锁钩子/行为/几何（FR3.4.3） | Leader 裁定 |
| D11 | 主盘纳音行是否同步调整 | **不调整**（现状已一致，O1） | 由 ADR/Leader 终裁 |
| D12 | `filterRows` 是否做防抖 | **不做**（确定性优先） | 性能无虞 |
| D13 | 搜索是否也匹配名称/体系（架构师 P1） | **只搜干支**（维持 FR2.1/O2）；「搜名称/体系」留作后续版本 | 已答复架构师 |

---

## 十、术语速查

| 术语 | 含义 |
|---|---|
| 六十甲子 / 干支 | 10 天干 × 12 地支组合出的 60 柱，正序 甲子→癸亥 |
| 纳音 | 每两个干支共用一个纳音名（如 甲戌/乙亥 → 山头火），共 30 名 |
| 纳音五行 | 纳音的五行属性（金/木/水/火/土）= 纳音名末字 |
| 纳运 | 由纳音**五行**推十二长生，与「纳音」列不同（FR5.4） |
| 分组 | 六十甲子按顺序三等分，每组 20 个 |
| 草稿 | 设置页输入框中尚未保存的值（内存态） |
| 已保存值 | localStorage `bz_xingyao_map` 中的值 |
| 还原 | 丢弃草稿，回填已保存值（≠ 恢复出厂默认） |
| 筛选 | 按干支包含关系显隐行（不移除 DOM） |

---

## 附：本版与 v0.29 的关系（一句话）

v0.29 = 星曜「有位置、能填、能存」；v0.30 = 星曜设置页「好找、好读、口径对」。
