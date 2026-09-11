# ADR v0.30.0 — 星曜设置页迭代（搜索 / 三分组 / 纳音列）

| 项 | 值 |
|---|---|
| 文档版本 | **v1.6**（初版 v1.0；完整修订链见 §13；现行需求输入 = PRD r7） |
| 日期 | 2026-09-11 |
| 作者 | 架构师（worker_3526ba52） |
| 状态 | 待编程师实施（仅文档，本 ADR 不含任何代码改动） |
| 需求输入 | 用户原话三点（§1.1）+ PRD v0.30.0 **r7**（`docs/PRD_v0.30.0_星曜设置页迭代.md`，md5 `2c82f007f4983ce031c8447b8b433d7a`，**566 行**，AC01–AC25 / T01–T15；r1 `882537b2…` – r6 `027a8f05…` 均已作废，变更链见 §14.1、§15.1） |
| 前序基线 | v0.29.0 星曜功能（ADR v1.1，md5 `905da43b1061330100a4c9d0c593a48e`，757 行） |
| 真相源仓库 | `/Users/feng/.clacky/ext/local/bazi-paipan`（同步副本 `~/.clacky/ext/local/bazi-paipan-test`） |
| 本版性质 | MINOR（新增搜索能力 + 展示口径调整，无破坏性数据变更） |

---

## 0. 裁决速览

| 编号 | 议题 | 裁决 | 风险 |
|---|---|---|---|
| **D1** | 搜索实现 | **显隐（`hidden` 属性）**，绝不删/重建 DOM；行引用一次性缓存；`input` 直连过滤，**不防抖**；**新增输入法组合态闸门**（PRD 未覆盖，本 ADR 补充） | 低 |
| **D2** | 搜索 × 分组 | 组内筛选；组内可见 0 行时**组标题一并隐藏**；组标题文案严格按 PRD（**不加组内计数**）；命中总数由 `#xySearchCount` 单点提供 | 低 |
| **D3** | 筛选态 × 状态机/存储 | `collectDraft()` 全量遍历**不得改**；筛选是纯视图态**不落盘**；`openSettings` 重置、`restore` 保留、`clear` 全量不动筛选；存储键/schemaVersion **零变更零迁移** | 中（有一条 P0 铁律） |
| **D4** | 分组 DOM | **组标题行 `<tr class="xy-group-row" data-xy-group="N">`（同 tbody 内）**；不加包裹层、不改 `#xySettingsList` 归属；既有 8 类选择器**全部不变** | 低 |
| **D5** | 纳音列 | 列名 `纳音五行`→`纳音`；值 `NAYIN[gz].slice(-1)`→`NAYIN[gz]`（全名）；**主盘不动**（实测主盘已是全名，本改动是「设置页对齐主盘」）；**ALGORITHM.md §21.1/§21.2 与 sync 脚本同步改** | 低 |
| **D6** | 测试影响面 | v0.29 星曜段 88 条中 **13 条改口径（改严不放松）**，其余 75 条不变；新增 `v0.30 T01–T07` + 架构补充哨兵 4 条 | 中 |
| **D7** | 版本与回滚 | v0.30.0（MINOR）；回滚基线 `.bak_v0.30.pre/`；数据结构未变 ⇒ **回滚无需清 localStorage**，新旧版本**双向可读** | 低 |
| **D8** | 改动定位 | 7 个文件（1 JS + 3 HTML + main.js 断言 + ALGORITHM.md + sync 脚本）+ `check-release.sh` KEYS（**含一处必须的修正**，见 §11.4） | 中 |

**本 ADR 对 PRD 的补充/修正**（PRD 已定稿，以下为 ADR 层新增，不要求 PM 改 PRD）：
1. **§4.4 输入法组合态闸门**（PRD FR1.2/FR1.3 未覆盖；若不补，中文输入「己」的过程中列表会随拼音中间态抖动）。
2. **§11.4 `check-release.sh` 的 KEYS 修正**：PRD §8.1 建议把 `xy-group-row` 放进 KEYS，**按现门禁实现会导致三端全红**（该 class 由 JS 生成、静态 HTML 中不存在，而 RUNTIME_KEYS 兜底只扫 `render.js/main.js`，不扫 `xingyao.js`）。修正方案见 §11.4。
3. **§11.2 `filterRows()` 必须由 `window.XINGYAO` 导出**（PRD AC01 的核验方式直接调用 `filterRows(q)`）。
4. **（v1.4 追加）§15.2 的 D4′ 取代 §6.1 的 D4**（组标题行 → 表外静态栏头 + 纯 CSS 三栏）；**§15.3 C1–C3** = 三条实测定案的实现修正（显式 `grid-column` / `[hidden]` 兜底升为必需 / 共享表头几何契约）；**§15.4** = 行高预算与免滚动断言的前提。

---

## 1. 背景与目标

### 1.1 需求原文（用户逐字）

> 星曜页面，加上搜索功能，比如，搜索己，就将所有含己的干支搜索出来，然后我直接填上内容即可，这样就不需要用眼睛来找目标干支。星曜页现做成三组，每组20 个干支，共 60 个干支，纳音五行改为纳音比如，甲戌，就是山头火，而不是火。

### 1.2 拆解为三点

| # | 需求 | 技术含义 |
|---|---|---|
| ① | 搜索筛干支 | 设置页新增搜索框，按**干支字符串包含**实时筛选列表行 |
| ② | 60 拆三组各 20 | 列表可视化分组（1–20 / 21–40 / 41–60），各组带标题行 |
| ③ | 纳音五行 → 纳音全名 | 设置页第 2 列由「末字五行」改为「完整纳音名」（甲戌 → 山头火） |

### 1.3 目标

让用户在 60 行中「**不再用眼睛找**」：输入 1–2 个字符即可把候选行压到 1–6 行，直接填值保存；且分组让用户对「60 甲子」有结构感。

### 1.4 本版明确不做（边界）

| 不做项 | 理由 |
|---|---|
| 改主盘纳音行 | 实测主盘**本来就是全名**（§2.3），改它反而制造不一致 |
| 改 localStorage 结构 / schemaVersion / 加迁移 | 本版是纯视图 + 派生展示改动，数据层零需求（§6.4） |
| 新增 JS 模块 | 搜索/分组逻辑归属既有 `xingyao.js`，不新增模块 ⇒ `api/handler.rb` 路由白名单**不动** |
| 命中片段高亮（`<mark>`） | 任何 `innerHTML` 改写都会与输入法组合态/文本选区交互；且筛选后候选 ≤6 行，定位成本已足够低（P2，§13.2） |
| 多关键字 AND / 搜索名称与体系 | 对齐 PRD O2/O3（本版只搜干支）；实现只需 1 行即可扩展（P2，§13.2） |
| 搜索防抖 / 节流 / rAF 合并 | 60 行纯显隐，无 IO、无重排瀑布；防抖反而损害断言确定性（PRD D12 同判） |

---

## 2. 现状勘察（写前实测，全部为磁盘现状）

### 2.1 设置页结构

- `xingyao.js`（355 行，`window.XINGYAO`）：
  - `renderSettings()` **:150–166** —— `tbody#xySettingsList.innerHTML = html`，循环 60 次生成 `<tr data-gz="甲子">` 四列
  - 纳音截断就在 **:156**：`var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz].slice(-1) : '';`（**全项目唯一一处末字截断**）
  - `openSettings()` **:168**、`closeSettings()` **:181**、`clear()` **:186**、`restore()` **:192**、`collectDraft()` **:196**、`save()` **:208**
  - 导出面 `window.XINGYAO`（:329–353）：`init/nameOf/systemOf/getAll/gz60/openSettings/closeSettings/renderSettings/collectDraft/clear/restore/save/refresh/buildExportPayload/exportJson/validateImportPayload/applyImportPayload/importJsonPrompt/handleImportFile/resetTestStore` + 常量 `XY_SCHEMA_VERSION/XY_STORE_KEY/XY_TEST_KEY`
- 三端 HTML 静态弹层（**逐字一致**）：

| 文件 | `.xy-settings-body` | `<thead>` | `<tbody id="xySettingsList">` |
|---|---|---|---|
| `index.html` | :923 | :926（`三十甲子…` 四列，第 2 列 `纳音五行`） | :928 |
| `standalone.html` | :923 | :926 | :928 |
| `standalone-split.html` | :912 | :915 | :917 |

### 2.2 需改的纳音列（设置页）

`xingyao.js:156` 把 `NAYIN[gz]` 截成末字 ⇒ 设置页第 2 列显示 `金/火/木/水/土`。**这是全项目唯一一处末字截断**（已全仓 grep 确认；其余「纳音五行」字样均为「纳音五行→阳干映射」的注释/常量名，与展示无关）。

### 2.3 主盘纳音行现状（**不改，且证据充分**）

- 数据源 `constants.js:885–892`：`NAYIN['甲子'] = '海中金'` —— **全名**。
- 主盘行渲染取 `NAYIN[gan+zhi]`：`render.js` 数据装配 **:493 / :916 / :1083 / :1271 / :1354 / :1713**，行模板 **:314 / :347 / :605 / :638 / :1132**。
- 结论：**主盘现状即全名口径**（甲戌 → 山头火）；本版改动是**把设置页对齐主盘**，不是制造新口径。⇒ **主盘零改动**，Leader 的「默认不动主盘」边界成立，且**无需列为待裁决项**。

### 2.4 60 行分组切分点（实测）

`XY_GZ60[i] = TG[i%10]+DZ[i%12]`：

| 组 | 下标 | 1-based | 首 | 末 |
|---|---|---|---|---|
| 第 1 组 | [0,20) | 1–20 | 甲子 | 癸未 |
| 第 2 组 | [20,40) | 21–40 | 甲申 | 癸卯 |
| 第 3 组 | [40,60) | 41–60 | 甲辰 | 癸亥 |

### 2.5 搜索命中集合（实测，用于定 AC）

| 查询 | 命中数 | 集合 |
|---|---|---|
| `己` | 6 | 己巳、己卯、己丑、己亥、己酉、己未 |
| `戌` | 5 | 甲戌、丙戌、戊戌、庚戌、壬戌 |
| `甲戌` | 1 | 甲戌 |
| 空串/纯空白 | 60 | 全部 |

（与 PRD §2.5 一致；因「只搜干支」，命中数与用户是否已填名称/体系无关。）

### 2.6 与 v0.29 断言的冲突点（**必须同步改，否则回归必红**）

| 位置 | 现状 | 处置 |
|---|---|---|
| `main.js:1787` | `v0.29 T05:表头[1]=纳音五行` 期望 `'纳音五行'` | **改期望为 `'纳音'`** |
| `main.js:1796–1803` | T06 抽样 12 项，期望单字五行 `金/火/木/土` | **改期望为全名**（§8.3 对照表），并**追加**「全名末字 = 原五行」12 条 |
| `main.js` T05 `数据行=60`、首行甲子、末行癸亥 | —— | **不变**（组标题行不带 `data-gz` ⇒ 不进入 `tr[data-gz]` 统计） |

### 2.7 门禁现状（`scripts/check-release.sh`）

| 步骤 | 内容 | 与本版关系 |
|---|---|---|
| 【1/4】 | 三端内联 JS `node --check` | 改 `xingyao.js` + 内联同步后需重跑 |
| 【2/4】 | `index.html` vs `standalone.html` 模块段逐段比对（`MODULES` :18 含 `xingyao`） | **三端 `xingyao` 段必须逐字一致（含头部版本注释）** |
| 【3/4】 | 三端 HTML 关键 id/class 存在性（`KEYS` :17、`RUNTIME_KEYS` :81） | 新增搜索 DOM ⇒ 建议补 KEYS（修正方案见 §11.4） |
| 【4/4】 | 外部 JS vs 单体版内联段一致（清单 :99 含 `xingyao`） | 改 `xingyao.js` 必须同步内联进 `index/standalone` |

（`FILES` :16 = `index.html standalone.html standalone-split.html`；`MODULES` :18 = `constants algorithm archive gongwei xingyao render main config auth records gongwei-cloud supabase.min`。）

### 2.8 版本与仓库现状

- `ext.yml:4`：`version: "0.29.0"`（本版需 → `0.30.0`）
- `CHANGELOG.md` 首段已是 v0.29.0
- git：`HEAD = 28940ad`（tag `v0.26.0` 之后工作区未提交，已有大量 v0.27–v0.29 改动）
- 既有快照目录：`.bak_v0.29.pre/`（v0.29 交付基线）等

---

## 3. D1 搜索实现

### 3.1 方案比选

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| **A. 显隐（`row.hidden = true`）** | 不销毁 DOM ⇒ 输入框值/光标/草稿**天然保留**；直接满足 §6.2 的 P0 铁律；实现面最小；断言可读（`tr[data-gz]:not([hidden])`） | 需维护行引用缓存 | ✅ **采纳** |
| B. 每次输入 `innerHTML` 重建命中行 | 代码直白 | ①销毁 DOM ⇒ 需「先 collectDraft 再回填」，回填会**覆盖用户正在输入的字符**；②焦点/光标丢失；③输入法组合态下重建 ⇒ 候选窗抖动甚至丢字；④重建必然触碰 `innerHTML`，重新引入转义/XSS 面 | ❌ 否决 |
| C. 只改 `style.display` | 无 | 内联样式难断言、易与既有 CSS 优先级纠缠；且逐元素写 `style` 更易触发样式重算 | ❌ 否决（改用属性 `hidden`，见 §3.3） |

### 3.2 性能取舍（输出规模 ≤60 行）

- 单次过滤 = 一次数组遍历（≤60 项） × 逐行 `String.indexOf`（≤2 字符键）+ 属性写 ⇒ **实测量级 < 1 ms**，无网络、无存储 IO。
- 为避免「强制同步布局（forced reflow）」：**只写不读** —— 过滤体内不读取任何几何属性（不查 `offsetHeight/getBoundingClientRect`），所有判断基于内存缓存与字符串，因此不会触发布局瀑布。
- 组计数与可见性在同一次遍历内聚合完成，**不再做第二次 `querySelectorAll`**。
- ⇒ **不引入 debounce / throttle / rAF 合并**（PRD D12 同判）。若未来行数增至数百，可在过滤入口加 rAF 合并（P2，§13.2）。

### 3.3 匹配规则（唯一口径）

```js
// q 归一化：仅 trim；空串（含纯空白，含全角空格 U+3000）→ 全显
var q = (value == null ? '' : String(value)).trim();
// 命中判定：字面子串包含（严禁 new RegExp）
function hit(gz) { return q === '' || gz.indexOf(q) !== -1; }
```

| 输入 | 行为 | 依据 |
|---|---|---|
| 空 / 纯空白（`"   "` / `"　"`） | 全 60 行显示；`#xySearchCount` 隐藏；`#xySearchEmpty` 隐藏 | PRD FR2.3 / E01 |
| 单字（`己` / `戌`） | 子串包含 ⇒ 6 / 5 行 | PRD FR2.4 |
| 多字（`甲戌`） | 子串包含 ⇒ 1 行 | PRD FR2.4 |
| **多 token（含内部空格 `甲 子`）** | **整串子串匹配 ⇒ 0 命中**（本版不支持 AND 切分） | 对齐 PRD D7 / O3；不用 `split`，减少一条分支 |
| 正则元字符（`. * [ \ ( )`） | 一律字面匹配（`indexOf` 天然安全，无 ReDoS、不抛异常） | PRD E03 |
| 大小写 | **不做大小写归一**（干支无大小写语义） | PRD FR2.3 |
| 匹配对象 | **仅 `tr[data-gz]` 的干支字符串** | PRD FR2.1 / O2 |

### 3.4 输入法组合态闸门（**本 ADR 新增，PRD 未覆盖**）

问题：`oninput` 在中文/日文输入法**组合期间**也会触发（例如拼音输入 `ji` 的过程中会连续收到 `j` → `ji` → `己`），若每步都过滤，列表会在 60 行 / 1 行 / 0 行之间**抖动**，视觉刺眼且可能打断用户。

裁决：在 `filtlyRows` 入口加**组合态闸门**：

```js
var _xyComposing = false;                       // 模块内状态
// filterRows(v):  if (_xyComposing) return;  …（组合期间只记不筛）
// 输入框：compositionstart → _xyComposing = true
//         compositionend   → _xyComposing = false; filterRows(input.value)
```

- 事件绑定方式：保留 PRD FR1.2 的 `oninput="XINGYAO.filterRows(this.value)"`（不动 PRD 的 DOM 契约），另加 `oncompositionstart` / `oncompositionend`（或等价的 `addEventListener`）。
- 兼容性：Chrome/Safari 在 `compositionend` 后还会再派发一次 `input` ⇒ 重复过滤，**幂等**（同一 q 再算一次结果一致），无副作用；Firefox 仅派发 `compositionend` ⇒ 已覆盖。不支持 `CompositionEvent` 的老环境退化为「纯 input 实时过滤」（可接受，且中文输入的抖动只影响观感，不影响数据）。
- **断言契约**：测试可直接 `dispatchEvent(new CompositionEvent('compositionstart'))` → `input(value='ji')` → 断言行数不变；再 `compositionend`（value='己'）→ 断言行数 6（§9.3 T-IME）。

### 3.5 DOM 契约（与 PRD FR1.2 一致）

```html
<div class="xy-search-bar">
  <input type="text" id="xySearchInput" class="xy-search"
         placeholder="搜索干支（如 己 / 戌）" autocomplete="off"
         oninput="XINGYAO.filterRows(this.value)"
         oncompositionstart="XINGYAO.onCompositionStart()"
         oncompositionend="XINGYAO.onCompositionEnd(this.value)">
  <button type="button" class="xy-search-clear" id="xySearchClear"
          title="清空搜索" onclick="XINGYAO.clearSearch()">✕</button>
  <span class="xy-search-count" id="xySearchCount" role="status"></span>
</div>
<div class="xy-search-empty" id="xySearchEmpty" hidden>没有匹配的干支</div>
```

- 位置：`.xy-settings-body` 顶部、`<table class="xy-table">` 之前（PRD FR1.1）。
- 文案：严格按 PRD §四（placeholder / title / 「命中 N 项」/ 「没有匹配的干支」）。
- `#xySearchClear` 仅输入非空时可见（PRD FR1.4）⇒ 用 `hidden` 属性切换（与过滤同一机制）。
- 「命中 N 项」在空输入时**隐藏**（不是显示 60）（PRD FR1.5）。

### 3.6 显隐机制定稿：`hidden` 属性

- **统一用元素属性 `hidden`**（`row.hidden = true/false`），不用 class、不写内联 `style`。
  - 与 PRD AC01/AC10 的核验选择器 `tr[data-gz]:not([hidden])` **逐字吻合**（PM 的 AC 已按此写）。
  - `#xySearchEmpty` / `#xySearchCount` / `#xySearchClear` 同用 `hidden`，机制**唯一**。
- **必须补一条兜底 CSS**（关键，否则作者样式可能压过 UA 的 `[hidden]{display:none}`，行会「隐藏失败」）：

```css
.xy-settings-modal [hidden] { display: none !important; }
```

  - 作用域限定在弹层内，避免影响页面其它组件（例如 `#xyFileImport` 用的是 `style="display:none"`，不受影响）。

### 3.7 焦点与交互细节

| 场景 | 行为 |
|---|---|
| 点 `✕` 清除 | 清空输入 → 全显 → 计数/空提示隐藏 → `focus()` 回输入框（PRD FR1.4） |
| 打开设置页 | 复位搜索（§5.3），焦点仍落首个 `.xy-name`（沿用 v0.29 的 `openSettings` 聚焦行为，**不被搜索框抢焦点**） |
| 键盘 | 本版不额外绑定 Esc/方向键（避免与既有 Tab 序冲突；P2 可加「Esc 清空」） |

---

## 4. D2 搜索 × 分组交互

1. **筛选在组内进行**：过滤遍历全部 60 行，按 `data-xy-group` 归组统计「可见数」。
2. **空组隐藏组标题**（PRD FR3.7）：组内可见数 = 0 ⇒ 该组标题行同样 `hidden = true`。与行同机制（不移除 DOM）。
3. **组标题文案严格按 PRD FR3.3，不加组内计数**：
   - `第 1 组 · 甲子 – 癸未`
   - `第 2 组 · 甲申 – 癸卯`
   - `第 3 组 · 甲辰 – 癸亥`
   - **否决「3/20」式计数进标题**：会破坏 PRD AC04/AC13 对标题文本的精确断言，且「还要看数字」与用户「不要用眼睛找」的诉求无关。命中总量已由 `#xySearchCount`（「命中 N 项」）单点提供，信息不丢。
4. **组号与范围静态、不随筛选重编号**：筛选后仍显示「第 2 组 · 甲申 – 癸卯」，避免「第 2 组」语义随筛选漂移。
5. 组标题行**不参与命中统计**、**不带 `data-gz`**（PRD FR3.5）⇒ `tr[data-gz]` 恒为 60，v0.29 断言 `数据行=60`、首行甲子、末行癸亥**全部保持**。

---

## 5. D3 筛选态下的编辑与状态机兼容

### 5.1 状态分层（沿用 v0.29 §9 三态模型，新增一维「视图态」）

| 层 | 载体 | 是否持久化 | 受筛选影响 |
|---|---|---|---|
| 草稿（draft） | 设置页 `<input>` 的 `.value`（含被隐藏行） | 否 | **否** |
| 已保存（saved） | `localStorage['bz_xingyao_map']` → `RUNTIME_MAP` | 是 | 否 |
| 视图态（view） | `#xySearchInput.value` + 各行 `hidden` | **否（严禁落盘）** | —— |

### 5.2 P0 铁律：`collectDraft()` 不得改为「只采可见行」

- `collectDraft()`（:196–207）遍历 `#xySettingsList tr[data-gz]`（**全量 60**）。隐藏行的 `<input>` 仍在 DOM 中、`.value` 从未被清 ⇒ **天然不漏采**，保存时不丢草稿。
- 因此本版对 `collectDraft()` **零改动**，并立一条红线：**不得**改成 `tr[data-gz]:not([hidden])` 或 `.xy-name:visible` 等可见性过滤 —— 那会静默丢失被隐藏行的草稿（正是 PRD FR2.5 / AC11 要防的事故）。
- §9.3 的 **T-SENTINEL 断言**专为守这条红线而设。

### 5.3 各入口的筛选态处置（唯一确定）

| 入口 | 行为（定稿） | 实现要点 |
|---|---|---|
| `openSettings()` | **重置**：清空搜索框 + 60 行全显 + 计数/空提示隐藏；焦点落首个 `.xy-name` | `renderSettings()` 后调内部 `resetSearchUI()`（**不带焦点副作用**，勿直接调 `clearSearch()`） |
| `clearSearch()`（`✕`） | 清输入 + 全显 + 提示复位 + **焦点回输入框** | `resetSearchUI()` + `focus()` |
| `save()`（保存并关闭） | 流程不变（`collectDraft → persistSavedMap → refresh → hideOverlay`）；**不重置**搜索态（关闭后 DOM 无所谓，下次 `openSettings` 自会重置） | 零改动 |
| `closeSettings()`（等同丢弃草稿） | 仅隐藏弹层；**不动**搜索态 | 零改动 |
| `restore()`（还原） | `renderSettings()` 重填已保存值后，**保留当前搜索词并重新筛选** | `renderSettings(); filterRows(input.value);` |
| `clear()`（清草稿） | **全量 60 行置空**（含被隐藏行），**搜索词与筛选态不变** | 现实现即全量，零改动（PRD D5/FR6.2） |
| 导入 JSON | **不改**（见 §5.5） | 零改动 |
| 导出 JSON | 与搜索态无关，payload 结构/键序不变 | 零改动 |

> 「清空搜索」与「清空草稿」是**两个不同按钮**，不得混淆（PRD FR6.4）：`✕` 只清搜索；页脚「清空」只清草稿。

### 5.4 `renderSettings()` 的复位责任（澄清一处易混点）

- `renderSettings()` **只负责「重建 60 行 + 3 个组标题行 + 刷新行引用缓存」**，**不**自动清空搜索框（搜索框在 `tbody` 之外，重建不影响其 `value`）。
- 复位责任**显式化**：只有 `openSettings()`（打开时）与 `clearSearch()`（用户点 ✕）会清空搜索框。这样 `restore()` 才能「保留搜索词」而不需要额外打补丁。

### 5.5 已知遗留（P2，本版不改）：导入后设置页列表不即时重绘

- 现状：`applyImportPayload()`（:271–280）只更新 `RUNTIME_MAP` + 落盘 + `refresh()`（刷盘面），**不重绘设置页列表**；导入按钮就在设置页页脚 ⇒ 导入后列表里的 `<input>` 仍显示导入前的旧值，直到下次打开弹层。
- 这是 **v0.29 既有行为**，PRD 未要求改，且改它会引入「重绘 vs 草稿」的新状态问题（导入算不算丢弃草稿？）⇒ **本版维持现状**，列为已知遗留，交由 Leader/PM 决定是否在 v0.30.x 立项（若要改，方案是 `applyImportPayload` 末尾 `renderSettings(); filterRows(q);`，2 行）。

### 5.6 存储兼容（硬约束）

- 键名不变：`bz_xingyao_map`（真实）/ `bz_xingyao_map__test`（`?test=1` 隔离）；损坏备份键 `bz_xingyao_map_corrupt_<ts>` / `bz_xingyao_map__test_corrupt_<ts>` 不变。
- `XY_SCHEMA_VERSION` **保持 1**，`persistSavedMap()` 载荷结构（`{schemaVersion, app, config, map:{gz:{name,system}}}`）**逐字段不变**。
- **禁迁移、禁加新键**：搜索词/筛选态**不入 localStorage**（打开即重置，无持久化需求）。
- ⇒ 旧数据（v0.29 写入）新版本直读；新版本写入的数据 v0.29 也能读（无新增字段）⇒ **双向兼容**，回滚零数据风险。

---

## 6. D4 分组 DOM 结构与选择器影响矩阵

### 6.1 定稿结构

组标题行由 `renderSettings()` 生成，**与数据行同处 `tbody#xySettingsList`**，插在每组 20 行之前：

```html
<tr class="xy-group-row" data-xy-group="1"><td colspan="4">第 1 组 · 甲子 – 癸未</td></tr>
<!-- 20 行 data-gz -->
<tr class="xy-group-row" data-xy-group="2"><td colspan="4">第 2 组 · 甲申 – 癸卯</td></tr>
<!-- 20 行 data-gz -->
<tr class="xy-group-row" data-xy-group="3"><td colspan="4">第 3 组 · 甲辰 – 癸亥</td></tr>
<!-- 20 行 data-gz -->
```

- 属性名用 **`data-xy-group`**（与 PRD FR3.4 一致，不另起 `data-group`）。
- 组标题行**无 `data-gz`**（隔离于草稿采集与既有断言）。

### 6.2 被否决的替代方案

| 方案 | 否决理由 |
|---|---|
| 三个独立 `<tbody>` | 需把 `id="xySettingsList"` 从 `tbody` 移到 `table` 或新增包裹层 ⇒ 触碰 `document.getElementById('xySettingsList')` 的全部调用点（`xingyao.js` 多处 + `main.js` 断言）与 `.xy-table thead th` 语义，扩散面大、收益仅「语义更正统」 |
| `<div>` 包裹分组 | 表格内放 `div` 属非法内容模型，浏览器会重排 DOM，破坏「四列 × 60 行」契约 |
| 三张独立表格 | 需重复 `thead`、列宽对齐/样式成本上升，且把「四列 60 行」单一契约拆成三份，断言与样式都要重写 |
| 组标题放 `<caption>`/`<colgroup>` | 无法表达「三处、且随筛选隐藏」的位置语义 |

### 6.3 既有选择器影响矩阵（逐条核，**全部不变**）

| 既有选择器 / 断言 | 用途 | 分组后结果 |
|---|---|---|
| `#xySettingsList tr[data-gz]` | `collectDraft()`、T05 数据行计数 | **60**（组标题行无 `data-gz`） |
| `tr[data-gz="甲子"]` / 首行 / 末行 | T05、T07/T09 定向操作 | 不变 |
| `.xy-table thead th` | T05 表头四列 | **4**（`thead` 未动） |
| `.xy-name` / `.xy-system` / `.xy-nayin` / `.xy-gz` | 草稿采集、T06 | 不变 |
| `#xySettingsList .xy-name`（`openSettings` 聚焦首个） | 首个输入框 | 不变（首个仍是第 1 组首行） |
| `#xySettingsOverlay` / `xy-trigger` / `xy-note` | 门禁 KEYS、T04 | 不变 |

### 6.4 新增 CSS（三端各一份，与既有变量保持同风格）

```css
.xy-search-bar { display:flex; align-items:center; gap:8px; padding:8px 18px; border-bottom:1px solid var(--c-line); }
.xy-search { flex:1; box-sizing:border-box; padding:6px 8px; font-size:13px;
             border:1px solid var(--c-line); border-radius:4px; background:var(--c-paper); color:var(--c-ink); }
.xy-search-clear { border:none; background:transparent; cursor:pointer; font-size:14px; color:var(--c-gray); padding:0 4px; }
.xy-search-count { font-size:12px; color:var(--c-gray); white-space:nowrap; }
.xy-search-empty { padding:10px 18px; font-size:13px; color:var(--c-gray); }
.xy-table tr.xy-group-row td { font-family:var(--font-display); font-size:13px; letter-spacing:.05em;
                               padding:6px; background:var(--c-line); color:var(--c-ink); }
.xy-settings-modal [hidden] { display:none !important; }   /* §3.6 兜底 */
```

（不引入新色板；移动端窄屏下 `.xy-search-bar` 天然换行不溢出 — 满足 PRD E15。）

### 6.5 对导出/导入与门禁的影响

- 导出/导入：数据层零改动（组标题是纯 DOM，不进 payload）。
- 门禁：见 §11.4（KEYS 需补静态 id；`xy-group-row` 走 `RUNTIME_KEYS` 兜底并扩扫描文件）。

---

## 7. D5 纳音列

### 7.1 列名

三端 HTML 各改一处：`<th>纳音五行</th>` → `<th>纳音</th>`
- `index.html:926`、`standalone.html:926`、`standalone-split.html:915`
- 其余三列文案不变（`六十甲子` / `星曜名称` / `来源体系`）。

### 7.2 取值

`xingyao.js:156`：

```js
// before（末字五行）：
var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz].slice(-1) : '';
// after（完整纳音名）：
var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz] : '';
```

- 缺失兜底仍为 `—`（PRD FR4.3；60 键理论全覆盖，不触发）。
- 单元格 class `xy-nayin` 不变、`escText()` 仍照原样调用。

### 7.3 主盘是否统一 —— **不动**（结论 + 证据）

- 实测主盘纳音行取 `NAYIN[gan+zhi]` **全名**（§2.3 行号清单），数据源 `constants.js:885–892` 亦为全名。
- ⇒ 本改动后**设置页与主盘天然一致**（PRD AC07 可断）；主盘**零改动、零可见行为变化**。
- ⇒ 不构成「待 Leader 裁决项」：既无必要性（已一致），也无「必须动主盘」的判断。
- 若未来要求主盘显示「五行末字」——那是**反向**需求，与本 ADR 无关，需另立 ADR。

### 7.4 连带必改（否则文档/脚本与 UI 三处不一致）

| 文件 | 位置 | 改动 |
|---|---|---|
| `docs/ALGORITHM.md` | §21.1（:695 附近）描述句 | 「纳音五行列为只读派生列（引用 §15.1）」→「**纳音列**为只读派生列（取 §15.1 **完整纳音名**）」 |
| `docs/ALGORITHM.md` | §21.2 表（锚点 :700 / :763 之间） | 表头 `纳音五行` → `纳音`；60 行第 2 列由末字 → **全名**（**建议由 §11.3 的脚本 `--apply` 生成，保证与 UI 同源**） |
| `scripts/sync-xingyao-algorithm.py` | `HEADER` 常量；`build_block()` | `HEADER = '| 六十甲子 | 纳音 | 星曜名称 | 来源体系 |'`；`NAYIN[gz][-1]` → `NAYIN[gz]` |
| `CHANGELOG.md` | 新增 v0.30.0 段 | `Changed`：设置页纳音列改为完整纳音名、列名改「纳音」 |

> 注意：`docs/ALGORITHM.md` 的 md5 会变（§21.2 表格内容变更）⇒ 若有报告引用其 md5，需同步更新（同 v0.29 的 §15 勘误处理方式）。

---

## 8. D6 测试影响面

### 8.1 v0.29 星曜段（88 条，`main.js:1671–1855`）受影响清单

| 断言 | 现状期望 | 处置 | 净变化 |
|---|---|---|---|
| `v0.29 T05:表头[1]=纳音五行`（1 条） | `'纳音五行'` | **改期望为 `'纳音'`**，且断言名改为 `v0.30 T03:表头[1]=纳音` | 0（改口径） |
| `v0.29 T06:xxx 纳音五行=Y`（12 条） | `金/火/木/水/土` | **改期望为全名**（§8.3），断言名改 `v0.30 T03:纳音全名` | 0（改口径，**改严**） |
| **追加**「全名末字 = 原五行」（12 条） | —— | 新增：`NAYIN[gz]` 末字 ∈ {金,木,水,火,土} 且等于原单字期望 | **+12** |
| **追加**「60 行纳音列均非空且 ∈ NAYIN 值域」（1–2 条） | —— | 逐行 `.xy-nayin` 文本 vs `NAYIN[gz]`（PRD AC06 后半句） | **+1~2** |
| 其余 75 条（T01–T04、T05 其余、T07–T10） | —— | **不变** | 0 |

**原则遵守说明**：被改的 13 条不是「弱化」而是**换到更严的期望**（全名 ⊃ 末字信息），并另加 12+2 条末字/值域断言 ⇒ 星曜段覆盖**只增不减**。

### 8.2 新增断言段（`v0.30 T0x`，建议独立 section `星曜(v0.30)`）

按 PRD §7.1 的 T01–T07，逐条落成**可执行**断言（精确期望值）：

| 断言 | 内容（含精确期望） |
|---|---|
| **v0.30 T01** | `X.filterRows('己')` → `tr[data-gz]:not([hidden])` 数 = **6**；集合 = {己巳,己卯,己丑,己亥,己酉,己未}；`filterRows('戌')`=**5**；`filterRows('甲戌')`=**1**；`filterRows('壬')`=**6**；`filterRows('')`=**60**；`filterRows('   ')`=**60**（E01） |
| **v0.30 T02** | `#xySettingsList .xy-group-row` 数 = **3**；`data-xy-group` = `1,2,3`；按组计 `tr[data-gz]` = **20/20/20**；边界：组1 首=甲子/末=癸未、组2 首=甲申/末=癸卯、组3 首=甲辰/末=癸亥；组标题行 `hasAttribute('data-gz') === false` |
| **v0.30 T03** | `thead th[1].textContent.trim() === '纳音'`；抽样 12 项 `.xy-nayin` = 全名（§8.3）；全 60 行 `.xy-nayin` 非空且 === `NAYIN[gz]` |
| **v0.30 T04** | **筛选态保存不丢草稿（P0）**：`filterRows('甲戌')` 后给**隐藏行**（如甲子）直接设 `.xy-name.value='隐藏值'`、给可见行设 `'可见值'` → `save()` → `getAll()` 共 **60** 键；`getAll()['甲子'].name === '隐藏值'` 且盘面对应柱已刷新 |
| **v0.30 T05** | 空结果：`filterRows('XYZ')` → `#xySearchEmpty.hidden === false`、可见数据行 = **0**、`#xySearchCount.textContent` 含 `0`；清空 `✕`：`X.clearSearch()` → 输入为空、可见 = **60**、`#xySearchEmpty.hidden === true`；命中数：`filterRows('己')` → `#xySearchCount` 文本 = `命中 6 项`，`filterRows('')` → `#xySearchCount.hidden === true` |
| **v0.30 T06** | 打开重置：`openSettings()` → 输入 `''`、可见 = 60、计数隐藏；还原保留：`filterRows('己')` → `restore()` → 仍可见 **6** 行且值=已保存值；清空全量：`filterRows('己')` → `clear()` → 输入词不变、可见仍 6、被隐藏行（如甲子）`.xy-name.value === ''`；另：**筛选态点清空后 `filterRows('')` → 60 行全空** |
| **v0.30 T07** | 设置页 vs 主盘一致性：取主盘纳音行（`tr[data-row-type~="nayin"]`）该柱文本 vs 设置页同干支行 `.xy-nayin` 文本 —— 两处相等（AC07） |

### 8.3 架构补充哨兵断言（PRD §7.1 之外，**建议一并加**）

| 断言 | 守什么 |
|---|---|
| **T-SENTINEL-1**（并入 T04） | **隐藏行仍被 `collectDraft()` 采集**：`filterRows('甲戌')` → 设隐藏行 `甲子` 的 `.xy-name.value='X'` → `X.collectDraft()['甲子'].name === 'X'`（守住 §5.2 红线，防将来有人把 `collectDraft` 改成可见性过滤） |
| **T-IME** | 组合态闸门：`dispatch compositionstart` → `input.value='ji'` 且派发 `input` → 行数**不变**（=60）；`dispatch compositionend`（value='己'）→ 行数 = **6** |
| **T-PERSIST** | 搜索不落盘：`filterRows('己')` 前后读 `localStorage.getItem(XY_TEST_KEY)` **字节一致**；且 localStorage 键集合无新增（无 `xySearch*` 之类新键） |
| **T-DOM-ORDER** | 分组行与数据行序：`#xySettingsList` 的子 `tr` 序列满足 `[group1, 20×data, group2, 20×data, group3, 20×data]`（防「组标题插错位置」） |

### 8.4 断言数量预估

- v0.29 星曜段：**88** 条
- 本版：−0（改口径 13 条不删） +12（末字一致性）+2（值域） + v0.30 T01–T07（约 **22–28** 条）+ 哨兵 3 条 ≈ **新增 39–45 条**
- ⇒ 星曜段预计 **127–133 条**；全仓总断言数相应上升（**最终条数以测试工程师出 `TEST_v0.30.0` 时的实测为准**，本 ADR 只承诺口径与覆盖点）。

---

## 9. D7 版本与兼容

### 9.1 版本号

- **v0.30.0（MINOR）**：新增能力（搜索）+ 展示口径调整（分组、纳音全名），无破坏性数据变更、无 API 变更。
- 同步更新点：`ext.yml:4 version` → `0.30.0`；`CHANGELOG.md` 新增 v0.30.0 段（Added：搜索/分组；Changed：纳音列名与取值）；**三端 HTML 与外部 JS 的头部版本注释块统一写 v0.30.0**（`/* 八字排盘 v0.30.0 — xingyao.js */`）——因为门禁【2/4】比对**包含**头部注释的整段，三端不一致会直接红。

### 9.2 兼容性

| 维度 | 结论 |
|---|---|
| localStorage 数据 | **双向可读**（结构未变、schemaVersion 仍为 1、无新增字段）⇒ 升级不需迁移，降级不丢数据 |
| 导出 JSON | 结构与键序不变 ⇒ v0.29 导出的文件 v0.30 直接导入，反之亦然 |
| ALGORITHM.md | §21.2 表格内容/表头变 ⇒ **文档 md5 变**（需在交付报告同步） |
| 门禁 | 四步在正确同步三端后应全绿；**任何一处漏同步三端 ⇒【2/4】或【4/4】必红**（这正是防线） |
| 内测容器 | `bazi-paipan-test` 同步同批文件；`api/handler.rb` **无改动**（无新增 JS 模块）⇒ 不触碰 v0.29 §15.2 E2 的跨层引用 |

### 9.3 回滚基线（`.bak` 策略）

- 发布前打快照目录 **`.bak_v0.30.pre/`**，收录：`index.html`、`standalone.html`、`standalone-split.html`、`xingyao.js`、`render.js`、`main.js`、`constants.js`、`scripts/check-release.sh`、`scripts/sync-xingyao-algorithm.py`、`docs/ALGORITHM.md`、`CHANGELOG.md`、`ext.yml`。
  - 注：`render.js` / `constants.js` 本版**不改**，一并快照仅为「一键回滚到发布前状态」的完整性。
- 可选：`git tag v0.30.0-pre`（当前 git 落后于工作区，打 tag 仅为语义锚点，不作为回滚主手段）。
- **回滚动作**：`cp -R .bak_v0.30.pre/* .` → `bash scripts/check-release.sh`（期望 exit 0）→ 两套 `?test=1` 全绿。**无需清 localStorage**（§9.2）。
- 保留 v0.29 基线：`.bak_v0.29.pre/` 已在库，作为「退回上一正式交付」的锚点。

---

## 10. D8 改动定位清单

### 10.1 文件级（真相源 `bazi-paipan/`，完成后同步 `bazi-paipan-test/`）

| # | 文件 | 改动 | 门禁关联 |
|---|---|---|---|
| 1 | **`xingyao.js`** | ①`:156` 纳音取全名；②`renderSettings()` 生成 3 个组标题行 + 建立行引用缓存（`_rows` / `_groups`）+ 复位搜索 UI；③新增 `filterRows(q)` / `clearSearch()` / `resetSearchUI()` / `onCompositionStart()` / `onCompositionEnd(v)`；④`openSettings()` 末尾复位搜索；⑤`restore()` 末尾重放筛选；⑥`window.XINGYAO` 导出新增函数；⑦头部版本注释 → v0.30.0 | 【2/4】【4/4】强制内联同步 |
| 2 | **`index.html`** | ①`:926` 列名 → `纳音`；②`:923` `.xy-settings-body` 顶部插入搜索栏 + 空结果提示 DOM；③CSS 块新增 §6.4 规则；④内联 `xingyao` 模块段整块同步；⑤头部注释 v0.30.0 | 【1/4】【2/4】【3/4】 |
| 3 | **`standalone.html`** | 同 index（`:923/:926` 位置相同） | 【1/4】【2/4】【3/4】 |
| 4 | **`standalone-split.html`** | ①`:915` 列名 → `纳音`；②`:912` 顶部插入搜索栏 DOM；③CSS 同；④**无内联 xingyao 段**（走外链）⇒ 无需同步 JS，但**静态 DOM/CSS 必须与另两端一致** | 【1/4】【3/4】 |
| 5 | **`main.js`** | ①`:1787` 期望改 `纳音`；②`:1796–1803` T06 改全名 + 追加末字/值域断言；③新增 `v0.30` 断言段（T01–T07 + 哨兵 3 条） | 【2/4】【4/4】 |
| 6 | **`docs/ALGORITHM.md`** | §21.1 描述句；§21.2 表头 + 60 行（建议脚本 `--apply` 生成） | 文档 md5 变 |
| 7 | **`scripts/sync-xingyao-algorithm.py`** | `HEADER`；`build_block()` 纳音取值 | —— |
| 8 | **`scripts/check-release.sh`** | `KEYS` 追加 5 个静态 id/class；`RUNTIME_KEYS` 追加 `xy-group-row` + 兜底扫描文件加 `xingyao.js`（**见 §11.4**） | 门禁本体 |
| 9 | **`CHANGELOG.md`** | 新增 v0.30.0 段 | —— |
| 10 | **`ext.yml`** | `version: "0.30.0"` | —— |
| 11 | **`api/handler.rb`** | **不改**（无新增 JS 模块） | —— |

### 10.2 函数级（`xingyao.js`）

| 函数 | 现状 | 改造 |
|---|---|---|
| `renderSettings()` :150 | 生成 60 行 | 生成 60 行 + 3 组标题行；建缓存 `_rows[{gz,tr,gInput,sInput,group}]`、`_groups[{n,tr,visible}]`；调 `resetSearchUI()` |
| `filterRows(q)` | 不存在 | **新增**（导出）：`if (_xyComposing) return;` → 归一化 `q` → 单次遍历缓存：写 `tr.hidden`、累加组可见数（**只写不读**）→ 写组标题 `hidden`、组计数 → 写 `#xySearchCount`（`命中 N 项` / 空则隐藏）、`#xySearchEmpty.hidden`、`#xySearchClear.hidden` → 返回 `{hit, total}`（便于断言） |
| `clearSearch()` | 不存在 | **新增**（导出）：`resetSearchUI()` + `focus()` 输入框 |
| `resetSearchUI()` | 不存在 | **新增**（内部）：输入框 `value=''`、60 行 `hidden=false`、3 组标题 `hidden=false`、计数/空提示/✕ 复位 |
| `onCompositionStart()` / `onCompositionEnd(v)` | 不存在 | **新增**（导出）：组合态闸门（§3.4） |
| `openSettings()` :168 | `renderSettings()` + 显示 + 聚焦首输入框 | 追加 `resetSearchUI()`（**勿**用 `clearSearch()`，避免抢焦点） |
| `restore()` :192 | `renderSettings()` | 追加 `filterRows(document.getElementById('xySearchInput').value)` |
| `clear()` :186 | 全量置空 | **零改动** |
| `collectDraft()` :196 | 全量遍历 | **零改动（红线）** |
| `save()` :208 / `closeSettings()` :181 / 导出导入族 | —— | **零改动** |
| `window.XINGYAO` 导出面 | 22 项 | 追加 `filterRows` / `clearSearch` / `onCompositionStart` / `onCompositionEnd`（+ 可选 `resetSearchUI`、`_isComposing()` 供断言） |

### 10.3 三端同步注意（最易出错处）

- `index.html` / `standalone.html`：**内联 `xingyao` 段必须与外部 `xingyao.js` 正文逐字一致**（去掉头部版本注释块后，门禁【4/4】比对），且 index 与 standalone 的模块段逐字一致（【2/4】）。
- `standalone-split.html`：不含内联 JS，但**搜索栏 DOM 与 CSS 必须手抄一致**（门禁【3/4】只查 id/class 存在性，不比对文本 ⇒ 文本漂移需靠自查/测试覆盖）。
- 建议实现顺序：先改 `xingyao.js` → 用一次性脚本把该段替换进 index/standalone（避免手抄）→ 再改三端静态 DOM/CSS → 最后改 `main.js` 断言。

### 10.4 `check-release.sh` 的 KEYS 修正（**必须按此实施，否则三端全红**）

PRD §8.1 建议 `KEYS += xySearchInput / xy-search-bar / xy-group-row`，但门禁【3/4】的判定是：

```bash
if grep -q "id=\"$k\"" "$f"; then pass            # 静态 id
elif grep -qE "class=\"[^\"]*${k}([ \"]|$)" "$f"; then pass   # 静态 class
elif [ "$k" ∈ RUNTIME_KEYS ] && grep -q "$k" render.js|main.js; then pass   # 运行时兜底
```

- `xySearchInput`（静态 id）✅ 可直接进 KEYS
- `xy-search-bar`（静态 class）✅ 可直接进 KEYS
- **`xy-group-row` ⚠️ 只由 `xingyao.js` 运行时生成，三端静态 HTML 里查不到；而 `RUNTIME_KEYS` 的兜底只 grep `render.js` / `main.js`，不含 `xingyao.js`** ⇒ 直接进 KEYS 会让【3/4】在三端**全部 ❌**。

**修正方案（二选一，ADR 指定方案 A）**：

- **方案 A（采纳）**：
  1. `KEYS` 追加**静态**元素：`xySearchBar xySearchInput xySearchClear xySearchCount xySearchEmpty`
     （给搜索栏容器同时挂 `id="xySearchBar"` 与 `class="xy-search-bar"`，保证 id 判定命中）
  2. `RUNTIME_KEYS` 追加 `xy-group-row`
  3. 【3/4】兜底扫描文件由 `render.js` / `main.js` **扩为** `render.js` / `main.js` / `xingyao.js`
  - 兜底只证明「外部 JS 里存在该 class」；三端内联副本的一致性由【2/4】【4/4】保证，故不削弱门禁。
- 方案 B（备选，更小改动）：**不**把 `xy-group-row` 放进 KEYS（它由 `xingyao.js` 生成，而 `xingyao.js` 的三端同步已被【2/4】【4/4】覆盖），KEYS 只补 5 个静态项。
  - 若 Leader 倾向「脚本改动最小」，可采 B；但 A 对「将来 xingyao 生成物漏进某端」更敏感。

### 10.5 `ALGORITHM.md` / `api/handler.rb` 判定

- `docs/ALGORITHM.md`：**受影响**（§21.1 描述、§21.2 表头与 60 行取值）——见 §7.4。
- `api/handler.rb`：**不受影响**（无新增/删除 JS 模块 ⇒ 路由白名单无需动；v0.29 §15.2 的 E2 跨层断言不受影响）。

---

## 11. 验收基线（AC ↔ 断言映射）

| PRD AC | 断言 | 本 ADR 章节 |
|---|---|---|
| AC01 命中条数 | v0.30 T01 | §3.3 |
| AC02 命中集合 | v0.30 T01 | §2.5 |
| AC03 分组 3/60/20-20-20 | v0.30 T02 | §4/§6.1 |
| AC04 分组边界 | v0.30 T02 | §2.4 |
| AC05 列名 = 纳音 | v0.30 T03 | §7.1 |
| AC06 纳音全名（抽样 + 全量值域） | v0.30 T03（+末字 12 条） | §7.2 / §8.3 |
| AC07 设置页 vs 主盘一致 | v0.30 T07 | §7.3 |
| AC08 无结果提示 | v0.30 T05 | §3.5 |
| AC09 命中数文案 | v0.30 T05 | §3.5 |
| AC10 清空搜索 | v0.30 T05 | §3.7 |
| AC11 筛选不丢草稿（P0） | v0.30 T04 + T-SENTINEL-1 | §5.2 |
| AC12 打开重置筛选 | v0.30 T06 | §5.3 |
| AC13 还原保留筛选 | v0.30 T06 | §5.3 |
| AC14 清空作用全量 | v0.30 T06 | §5.3 |
| AC15（E 系列边界） | E01/E02/E03 并入 T01；IME 由 T-IME 覆盖 | §3.3/§3.4 |
| AC16 三端一致 | 【1/4】【2/4】【3/4】【4/4】四步门禁 + 三端各跑 `?test=1` | §10.3/§11.4 |
| AC17 无回归 | v0.29 星曜段 88 条（改口径后）全绿 + 全量 `?test=1` | §8.1 |

**验收门禁清单（编程师/测试工程师照此执行）**

1. `bash scripts/check-release.sh` → exit **0**（四步全绿）
2. `index.html?test=1`、`standalone.html?test=1`、`standalone-split.html?test=1` 三端各跑 → 全绿，且条数一致
3. `file://` 与 `python3 -m http.server` 两种承载各跑一遍（v0.29 的既有做法）
4. `XINGYAO.filterRows('己')` 手测可见 6 行、组标题 2 个、计数「命中 6 项」
5. 筛选态保存 → `getAll()` 60 键完整、隐藏行值未变（P0）
6. `python3 scripts/sync-xingyao-algorithm.py --source <导出> `（dry-run）→ 输出区块与 `docs/ALGORITHM.md` 现有区块**字节一致**（证明文档与 UI 同源）

---

## 12. 待裁决 / 待确认 / 已知限制

### 12.1 需 Leader 拍板的 2 项

| # | 事项 | 我的建议 | 若不采纳的影响 |
|---|---|---|---|
| L1 | `check-release.sh` 采用方案 A（KEYS 补 5 静态项 + RUNTIME_KEYS 加 `xy-group-row` + 兜底扩扫 `xingyao.js`）还是方案 B（只补 5 静态项）？ | **A**（对未来生成物漏同步更敏感） | B 亦可交付，仅门禁敏感度略低 |
| L2 | §5.5「导入后设置页列表不即时重绘」（v0.29 既有遗留）本轮是否一并修？ | **不修**（保持本版边界干净，列 v0.30.x） | 若修，需追加「导入算不算丢弃草稿」的语义裁决与 1–2 条断言 |

### 12.2 需 PM 确认的 1 项（非阻塞）

| # | 事项 | 说明 |
|---|---|---|
| P1 | 搜索**只匹配干支**（对齐 PRD FR2.1 / D8 / O2）；本 ADR 同判。若 PM 后续想把「星曜名称 / 来源体系」也纳入命中（如搜「斗数」列出所有 system=斗数 的行），实现只需在 `hit()` 里加两路 `indexOf` —— 但**命中条数 AC01/AC02 的期望值不受影响**（出厂 60 行全空），故不阻塞本版。 | 已在 §13.3 记为 P2 |

> D11（主盘是否同步调整）**不再列为待裁决项**：实测主盘已是全名（§2.3），本版**不动主盘**，Leader 边界自动成立。

### 12.3 已知限制（P2 候选，留 v0.30.x）

1. 命中片段**高亮**（`<mark>`）不做（§1.4 理由）。
2. **多关键字 AND / 匹配名称与体系** 不做（1 行可扩展）。
3. 组标题 **sticky** 不做（与表头 sticky 叠加；PRD D9 同判）。
4. `filterRows` 的 **rAF 合并/节流** 不做（60 行无必要；>数百行时再评估）。
5. 搜索框 **Esc 清空** 不做。
6. **导入后列表不即时重绘**（§5.5，待 L2 裁决）。

---

## 13. 变更记录

| 版本 | 日期 | 内容 | 作者 |
|---|---|---|---|
| v1.0 | 2026-09-11 | 初版定稿：D1–D8 全裁决（搜索显隐 + IME 闸门 / 组内筛选与空组隐藏 / 状态机兼容与 P0 铁律 / 组标题行结构与选择器矩阵 / 纳音列与主盘不动裁定 / 断言影响面与新增哨兵 / 版本回滚 / 逐文件逐函数改动清单）；对 PRD 的 3 处补充（IME 闸门、KEYS 修正、`filterRows` 导出） | 架构师（worker_3526ba52） |
| v1.1 | 2026-09-11 | 追加 §14 与 PRD r2 对齐记录（append-only，正文 D1–D8 未改）：PRD 引用 md5 r1→r2、P1 决议（只搜干支，与原判一致）、断言编号对齐（PRD T01–T09 ↔ 本文 §8；T08=IME、T09=hidden 锁定） | 架构师（worker_3526ba52） |
| v1.2 | 2026-09-11 | 引用更新至 PRD r3（`4adae9a0…`，458 行）+ 追加 §14.5：AC19 升双断、T10/T11 收编（T-SENTINEL-1 / T-PERSIST）；正文 D1–D8 与红线仍零变更 | 架构师（worker_3526ba52） |
| v1.3 | 2026-09-11 | 引用更新至 PRD r4（`395f0c8d…`，462 行，纯勘误）+ §14.5 第 5 条：AC19/T09 补 `getComputedStyle` 测量前提（须弹层可见态）；需求与编号仍零变更 | 架构师（worker_3526ba52） |
| v1.4 | 2026-09-11 | 引用更新至 PRD **r7**（`2c82f007…`，566 行，AC01–AC25 / T01–T15）+ 追加 §15：① **D4′ 布局终裁**（取代 §6.1：单一 tbody + 纯 CSS 按组钉列 + 表外静态栏头 + 共享表头 `thead th`=4；栏边界勘误 = 甲子–癸未 / 甲申–癸卯 / 甲辰–癸亥）；② 三条实测修正 **C1** 每行显式 `grid-column`（`auto-flow:column` 列入被否决）/ **C2** `[hidden]` 兜底由保险升为必需 / **C3** 共享表头几何契约（ADR 层补充，r7 未覆盖）；③ 行高预算 ≤26px（实测 24.5px、溢出 0）与**免滚动断言必须条件化**；④ 断言基线补 **T12/T13/T14**、**AC25↔T15** 归位；门禁 `xy-group-title` 进 `KEYS`、从 `RUNTIME_KEYS` **删除** `xy-group-row`；⑤ 与 r7 **无冲突**（含 1 项补充 + 1 项 R 项候选 + 1 项勘误） | 架构师（worker_3526ba52） |
| v1.5 | 2026-09-11 | **最小勘误（§15.3 C3 ×2 + §15.7 ⑤）**：冻结正文里的窄屏表头写法（`gap:0`、`<1280px 补 thead{width:100%}`）已被实测推翻——照做会致窄屏表头塌缩（thead 230/272、th 64/38/64/64、delta [0,4,-38,-347.8]）。改为 `gap:4px`；并明示作用域：`thead{display:block}` + 与数据行同列模板留在 base（全宽度生效），仅 `width:calc((100% - 32px)/3)` 进 `@media(min-width:1280px)`。权威口径见《_RECORD_ADRv1.4冻结期_C3最终recipe与留痕_20260911.md》§3/§7。**除上述 2 处 + §15.7 ⑤ 外无其它字节变化。** |
| v1.6 | 2026-09-11 | **编号勘误（R7 → R8）**：PRD r7 §8.2 R 表已占用 **R1–R7**（`R7` = 搜索框在窄屏被压缩，PRD 第 512 行），故本文两处「R7」会把人指向**另一条风险项**：§15.3 归属条 → **R8（原称 R7）**；§15.8 第 2 点「R 项候选」→ **R8（原称 R7）**。权威口径与编号映射见《_RECORD_ADRv1.4冻结期_C3最终recipe与留痕_20260911.md》§8.5。**除上述 2 处 + 本行 + 版本行外无其它字节变化。** |

---

## 14. 与 PRD r2 的对齐记录（append-only，正文 D1–D8 未改）

> 本节为**追加**内容：§3–§11 的裁决、红线、改动清单、断言口径**逐条不变**；仅补记录 PRD 从 r1 → r2 的引用变更与编号对齐。

### 14.1 PRD 引用变更

> **⚠️ 现行引用：PRD r7** —— md5 `2c82f007f4983ce031c8447b8b433d7a`（**566 行**，AC01–AC25 / T01–T15）；现行链接与 r5–r7 变更链见 **§15.1**。
> 下表为历史修订链，**r1–r6 均已作废**（r4 → r7 的差异见 §15.1；r4 相对 r3 的差异见 §14.5 第 5 条）。

| 项 | r1（初版，已作废） | r2（过渡，已作废） | r3（勘误前，已作废） |
|---|---|---|---|
| 文件 | `docs/PRD_v0.30.0_星曜设置页迭代.md` | 同名 | 同名 |
| md5 | `882537b2e2ff6fba2cb50a9295c371a7` | `c771dea4bb9d1b50c208c07ac11556d8` | `4adae9a0d92145d048bbd081c2dad85d` |
| 行数 | 427 | 452 | 458 |
| AC 数 | 17（AC01–AC17） | 19（AC01–AC19） | 19（AC01–AC19，AC19 升双断） |
| 建议断言 | T01–T07 | T01–T09 | T01–T11 |

修订链（均为本 ADR 提出的补充/修正被 PM 采纳，**正文 FR/AC 语义零变更**）：
- **r1 → r2**：IME 组合态闸门、`check-release` KEYS 修正、显隐机制定稿 `hidden` + 兜底 CSS。
- **r2 → r3**：① AC19 由单断升**双断**（`hasAttribute('hidden')` **且** `getComputedStyle(tr).display === 'none'`）；② §7.1 收编 `T10`（= 本 ADR 的 T-SENTINEL-1）、`T11`（= 本 ADR 的 T-PERSIST）。
- **PRD FR2.5 显隐铁律与 §2.6 断言冲突清单自 r1 起从未改动** ⇒ 本 ADR 的两条红线（显隐不重渲染 / `collectDraft()` 零改动）与断言守护**全程不受影响**。

### 14.2 P1 决议：搜索只匹配干支（与 ADR 原判一致，无口径变更）

- PM 答复：**只搜干支**（维持 FR2.1 / O2），已在 PRD 记为 D13。
- 本 ADR §3.3 的 `hit()` 原本即为**仅 `data-gz` 字面 `indexOf`**，**无改动**；implementer 无需增加名称/体系两路匹配。
- 「搜星曜名称/来源体系」仍留在 §12.3 的 P2 清单（另立用例、另配 placeholder 与命中量口径，不并入 v0.30）。

### 14.3 断言编号对齐（PRD r4 的 T01–T11 ↔ 本 ADR §8）

| PRD r2 | 内容 | 本 ADR 对应 |
|---|---|---|
| T01 | 搜索命中条数（己=6/戌=5/甲戌=1/空=60） | §8.2 **v0.30 T01** |
| T02 | 分组结构 + 边界（AC03/AC04） | §8.2 **T02** |
| T03 | 列名 + 纳音全名抽样（AC05/AC06） | §8.2 **T03**（+ §8.1 的末字一致性 12 条） |
| T04 | 筛选态保存不丢隐藏行草稿（AC11） | §8.2 **T04**（含 §8.3 T-SENTINEL-1） |
| T05 | 空结果 + 命中数文案 + 清空搜索 | §8.2 **T05** |
| T06 | 打开重置 / 还原保留 / 清空全量 | §8.2 **T06** |
| T07 | 设置页 vs 主盘纳音一致（AC07） | §8.2 **T07** |
| **T08** | 输入法组合态（AC18 / FR1.3.1 / E17–E19） | §8.3 **T-IME**（同一断言，改名即可） |
| **T09** | `hidden` 锁定（AC19） | §3.6 机制要求 + 本表补充断言（见下） |

**T09 断言内容（已被 PRD r3 的 AC19 采纳为双断）**：对任一被筛掉的行断言 `tr[data-gz].hasAttribute('hidden') === true` **且** `getComputedStyle(tr).display === 'none'`。后半句专锁 §3.6 的兜底 CSS `.xy-settings-modal [hidden]{display:none!important}` 未被作者样式压过（= PRD E18）；只断前半句时，样式被压过也照样绿 ⇒ **必须双断**。

**本 ADR 的两条额外哨兵已被 PRD r3 正式收编**（ADR §8.3 ↔ PRD §7.1）：
- `T-SENTINEL-1` → **PRD T10**：`hidden` 行仍带 `tr[data-gz]` 且其值进入 `collectDraft()`（守 §5.2 红线，是 AC11 的机制侧守护者；AC11 仍保留为结果侧端到端比对，两者互补）。
- `T-PERSIST` → **PRD T11**：`filterRows(q)` 前后 `localStorage[storeKey()]` 字节不变（守 §5.6）。

### 14.4 编号预估更新

§8.4 的 88 → 127–133 条预估**不变**（r2 只是把 ADR 已列的 IME / hidden 两类断言给了 PM 侧编号，未新增覆盖点）。

### 14.5 r3 / r4 增量摘要（append-only）

1. **AC19 双断**（PM 采纳本 ADR §14.3 的强化建议）：不可见行须同时满足 `hasAttribute('hidden') === true` 与 `getComputedStyle(tr).display === 'none'`。ADR §3.6 的兜底 CSS 因此成为**被断言覆盖的契约项**，不再是「建议实现」。
2. **T10 / T11 收编**：ADR §8.3 的 `T-SENTINEL-1` / `T-PERSIST` 成为 PRD 正式编号 T10 / T11；编号规则以 **PRD 为唯一源**（T01–T11 连续无缺口：T01–T07 ↔ ADR §8.2；T08 = T-IME；T09 = hidden 锁定；T10 = T-SENTINEL-1；T11 = T-PERSIST）。
3. **裁决零变更**：D1–D8、两条红线、改动定位清单（§10）、回滚基线（§9.3）与断言口径（§8.1 的 13 条改口径 + 新增条数预估 88 → 127–133）**均不改**。
4. 引用更新：本 ADR 表头与 §14.1 已指向 **PRD r4 `395f0c8d78fa59dc7a20224cc7db941b`（462 行）**。

**第 5 条（本次新增，PRD r4 = 纯勘误，需求语义零变更）**：
- AC19 的**核验方式**补「测量前提」：② 的 `getComputedStyle(tr).display` 必须在**弹层可见态**（`#xySettingsOverlay` 含 `.show`）下取样 —— 祖先 `display:none` 时该值失真，会造成假红/假绿。
- T09 同步补「断言前置 `openSettings()`」。
- 该条属**核验方式/执行前提**，不改任何 FR/AC 判定条件；**T01–T11 编号与全部裁决零变更**。
- PM 承诺：r4 后 PRD 冻结；后续同类「测试执行前提」问题改为产出独立的《测试执行说明》，不再爬升 PRD 版本。
---

## 15. 与 PRD r7 的对齐记录（append-only；ADR v1.4）

> **阅读指引**：本节是**最新裁决**。§1–§12 的 D1–D8、两条红线（显隐不重渲染 / `collectDraft()` 零改动）、存储兼容、IME 闸门、纳音列口径**逐条不变**；**唯一被取代的是 §6.1 的 D4（组标题行结构）→ 见 §15.2 的 D4′**，§4 D2 的「空组隐藏组标题」相应收窄（栏头不再隐藏）。§6.1/§4 原文保留为历史留痕，遇矛盾**以 §15 为准**。

### 15.1 PRD 引用变更（r4 → r7）

> **⚠️ 现行引用：PRD r7** —— `docs/PRD_v0.30.0_星曜设置页迭代.md`，md5 `2c82f007f4983ce031c8447b8b433d7a`，**566 行**，**AC01–AC25 / T01–T15 / D01–D20**（真相源与工作目录双副本一致，测试师只读复核通过）。
> r6、r5、r4 及 r1–r3 **全部作废**（§14.1 的历史表仅作留痕）。

| 版本 | md5 | 行数 | AC / 建议断言 | 状态 |
|---|---|---|---|---|
| r4 | `395f0c8d…` | 462 | AC01–AC19 / T01–T11 | 作废 |
| r5 | `72b29e7e…` | 533 | AC01–AC24 / T01–T14 | 作废 |
| r6 | `027a8f05…` | 545 | 同上（纯勘误 7+5 处） | 作废 |
| **r7** | **`2c82f007…`** | **566** | **AC01–AC25 / T01–T15** | **现行** |

r5–r7 变更链（ADR/PM 的修正被逐条采纳；FR 语义仅「三栏同屏」一处**口径纠正**）：

- **r4 → r5**：用户纠正口径 —— 「分三组」= **三栏同屏并排、免滚动**（原「纵向堆叠三段」为误读，作废）；新增布局章 + AC20–AC24 + T12–T14 + E20–E23。
- **r5 → r6**：纯勘误 12 处（T02/T03 统一为「共享表头 `thead th`=4」；`renderSettings()` 不再插组标题行；`filterRows()` 与栏头无联动；门禁项）。
- **r6 → r7**：FR3.4 推荐 CSS 由 `grid-auto-flow:column` 改为**按组钉列**（决策 D19）；新增 **AC25【筛选态栏位正确性】/ T15**、**FR3.4.3 断言边界**、**D20（禁锁 CSS 字面值）**。

### 15.2 D4′ 布局终裁（**取代** §6.1 的 D4）

| 项 | D4（v1.0 原裁决） | **D4′（现行，v1.4）** |
|---|---|---|
| 容器 | 单一 `<tbody id="xySettingsList">` | **不变**（`table.xy-table` = 1，60 行全为其后代） |
| 三栏实现 | 组标题行 `<tr class="xy-group-row" data-xy-group="N">` 插在 tbody 内 | **纯 CSS**（tbody grid + 每行显式 `grid-column`）；tbody 内**只有** 60 个 `tr[data-gz]` |
| 栏头 | 行式组标题，随筛选隐藏 | **表外静态** `div.xy-group-title[data-xy-group="N"]`（容器 `.xy-groups-heads`，位于表格上方）；三栏**共享一行表头** `thead th` = 4；栏头**不随筛选隐藏** |
| 空栏 | 组内 0 命中 → 组标题一并隐藏 | **保留占位、栏头不隐藏**（FR3.8） |
| 组边界 | `XY_GZ60[(n-1)*20]` | 不变：组1 **甲子–癸未** / 组2 **甲申–癸卯** / 组3 **甲辰–癸亥**（各 20 行） |
| 断点 | — | 包在 `@media (min-width:1280px)`；<1280 单栏纵向（FR3.7/E15）；≥1280 必须三栏 |
| 实现契约 | — | **禁止 3 张 `<table>` / 3 个 `<tbody>`**；**不新增运行时类**；60 行文档顺序仍为 甲子→癸亥 |

**勘误（重要）**：我在第 23–24 轮的 `_WIP_布局口径变更影响评估_v0.30.0.md` 与首轮消息中把栏边界写成「栏1 甲子–癸巳 / 栏2 甲午–癸丑 / 栏3 甲寅–癸亥」，**该值作废**；正确值以上表为准（PM 的 r5/r6/r7 始终正确）。

**D2 相应收窄**：空组**不再隐藏栏头**，仅隐藏行（`hidden` 属性）；命中 0 时由 `#xySearchEmpty` 提示，「栏头 3 个恒在」。实测（真实应用）：全显态三栏 20/20/20（组1 甲子–癸未、组2 甲申–癸卯、组3 甲辰–癸亥 逐行落在各自栏内）；搜「甲子」→ 组1 1 行、组2/3 各 0 行，但**栏头 3 个仍 `display:block`**；搜「斗数」→ 可见 0 行、`#xySearchCount`=「命中 0 项」、栏头 3 个仍在、溢出 0。

### 15.3 三条由实测得到的实现修正（C1–C3）

> 实测环境：真实 `index.html`（Chrome，窗口 1512×827，弹层 1200×742，`.xy-settings-body` client 604px）+ 隔离探针 `probe/layout-probe*.html`（真实 Chrome 渲染，非推理）。PM 亦在隔离样本上独立复现了下述 C1。

**C1（必需）每行显式 `grid-column`；`auto-flow:column` 列入被否决方案**

- 机理：`display:none` 的行**不是 grid item**，会被 auto-placement 跳过 ⇒ 纯自动流在筛选态重排。
- 实测：搜「己」6 行 —— 旧写法（`grid-auto-flow:column`）**全部塌进栏 1**（PM 隔离对照：6 行 `left` 全 = 18；我的探针：6 行被拉伸为整栏宽）；r7 终版 `left` = 18 / 423 / 829（PM 隔离样本）、**175 / 567.7 / 960.3**（真实应用，栏宽 376.7）。
- 结论：`grid-auto-flow:column` **列入 §6.2 被否决方案**（理由：与 FR3.8 空栏占位冲突）；`tr[data-xy-group="N"]{grid-column:N}` 为唯一确定解。
- 断言含义：**AC25/T15 必须用几何**（可见行 `left` ∈ 其所属栏头水平区间，容差 ≤8px），**严禁**以 `[data-xy-group]` 计数替代 —— 缺陷实现下计数仍 2/2/2（假绿）。

**C2（必须，由「保险」升为「必需」）`hidden` 兜底 CSS**

- 机理：作者 `display:grid`（`tbody > tr` 规则）会压过 UA 的 `[hidden]{display:none}`。
- 实测：探针隐藏 3 行后，`visible` 仍为 **60**、computed display 仍为 `grid` ⇒ 必须有 `.xy-settings-modal [hidden]{display:none !important}`（已落地 `index.html:308`，三端同）。
- 真实应用复核：被筛掉行的 computed display = `none` ✅。
- 结论：**AC19 的双断**（`hasAttribute('hidden')` **且** computed `display === 'none'`）是唯一能抓住此缺陷的断言；取样**必须在弹层可见态**（`.show`），前置条件同 §14.5 第 5 条。

**C3（ADR 层补充；r7 未覆盖）共享表头的几何归属**

- 现状（编程师实现，三端 `index.html:286–288`）：`.xy-table{display:block}` + `thead{display:block}` + `thead tr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}` ⇒ 4 个 `th` **等分铺满全宽**。
- 实测（真实应用）：th 各 **286px**，`x` = 175 / 467 / 759 / 1051；而每栏内部 4 列模板 `56px 76px minmax(0,1fr) minmax(0,1fr)` 实测 `x` = 175 / 235 / 315 / 435.3 ⇒ 偏差 **[0, 232, 444, 615.7]px** ⇒「纳音」标签悬在第 2 栏**干支列**上方，用户会读错列；而 `thead th`=4 的断言**仍然全绿** ⇒ 典型「断言绿、界面错」的假绿。
- 否决「恢复表格布局」：共享 4 列表头 + 三栏 grid 的 tbody 会被表格布局算法**压坏**（实测 th 宽 **1027.8 / 33.2 / 51.5 / 51.5**，不是错位，是坏掉）。
- **架构级 CSS 契约（补充）**：表头列名须与**第 1 栏的列模板**对齐 ——

```css
.xy-table thead { display:block; width:calc((100% - 32px)/3); }   /* = 一栏宽；column-gap:16px ×2 */
.xy-table thead tr { display:grid; grid-template-columns:56px 76px minmax(0,1fr) minmax(0,1fr); gap:4px; }
/* 作用域（v1.5 勘误）：`.xy-table{display:block}` 与上一行（含 `gap:4px`）留在 base、**全宽度生效**；
   仅「`width:calc((100% - 32px)/3)`」进 `@media(min-width:1280px)`（1/3 栏宽只在三栏态成立）。 */
/* 注（失效机理）：窄屏若把 thead 回退默认 `table-header-group`、或加 `thead{width:100%}`、或不加任何覆盖，
   tbody 已 blockify 成 grid、表内仅剩 thead 单行组 ⇒ 表头按内容收缩（实测 thead 230/272、
   th 64/38/64/64、delta [0,4,-38,-347.8]）⇒ 窄屏**不得**为表头加任何覆盖。 */
```

- 探针实测：4 个 th 与第 1 栏 4 列 `x` 偏差 **4–8px** ✅、`thead th` 仍 **= 4** ✅，三栏 / 免滚动 / 筛选栏位全部不受影响。
- **依据**：3 栏 × 4 列 = 12 个列位，**一行 4 个标签在几何上无法同时标注三栏**；锚定第 1 栏模板是唯一自洽解（语意 = 4 列名样板指向第 1 栏，三栏内部模板一致；等价于「共享表头」）。
- **归属**：r7 的 FR3.4.1 只要求「共享一行表头 `thead th` = 4」，**未规定几何** ⇒ 本条属 **ADR 层新增契约**，**不要求 PM 改 PRD**。若测试师认可，建议在 T02/T03 之外补一条几何断言（`th`=4 且 `th[i].left` 与第 1 栏第 i 列 `left` 偏差 ≤12px）；若不采纳，则记 **R8（原称 R7；编号更正见 §13）**（已知取舍），但本契约仍作为实现要求保留。

### 15.4 行高预算与免滚动断言的前提（T12）

- 免滚动是**硬约束**（FR3.6）：`@media(min-width:1280px)` 下 60 行 → 三栏各 20 行须在 `.xy-settings-body` 内**无纵向溢出**。
- 1280×800 档（弹层 `max-height:92vh` ⇒ 表区 client ≈ **603–604px**）：20 行须装下 ⇒ 行高预算 **≤26px**。实测现状 **24.5px**（`scrollHeight 604 = clientHeight 604`，溢出 **0**）；探针把行高收紧到 23px 仍溢出 0（尚有余量）。
- **断言前提（必须条件化）**：弹层未打开时 `scrollHeight == clientHeight == 0`，`0 ≤ 0` **恒真** ⇒ 免滚动断言**必然假绿**。T12 前置：`XINGYAO.openSettings()` → 断言 `#xySettingsOverlay` 含 `.show` → `document.fonts.ready` / `requestAnimationFrame` 后取样；取样对象 `.xy-settings-body`，判据 `scrollHeight - clientHeight ≤ 2`，**且必须在全显态（60 行）取样**。
- **附带观察（非缺陷，供测试师避坑）**：`.xy-settings-modal` 高度自适应内容、弹层垂直居中 ⇒ 内容收缩时**弹层的绝对 y 会变**（实测栏头 y：全显 144 → 搜「甲子」376.8 → 搜「斗数」408.3）。因此几何断言**只能用水平量**（`left` / 栏位归属 / 栏宽），**不得使用绝对 y** —— 这与 AC25 的水平判据天然一致。

### 15.5 断言基线（T01–T15 ↔ AC01–AC25）

| PRD AC / T | 本 ADR 章节 | v1.4 处置 |
|---|---|---|
| AC01/AC02 ↔ T01 | §3.3 / §2.5 | **不重排、不改** |
| AC03/AC04 ↔ T02 | §15.2 | 按 r7：`#xySettingsList` 仍为 `<tbody>`、`table.xy-table`=1、数据行 60、按 `data-xy-group` 20/20/20、栏头 `.xy-group-title`=3、**共享表头 `thead th`=4** |
| AC05/AC06 ↔ T03 | §7.1 / §7.2 | 按 r6/r7：`thead th`=4 且 `th[1]`=「纳音」；抽样 12 项全名 |
| AC11 ↔ T04（+ T-SENTINEL-1 = T10） | §5.2 | 判据不变 |
| AC08–AC10 ↔ T05 | §3.5/§3.7 | **无需改动**（r7 只改 CSS 写法与新增项，未触及文案与显隐机制） |
| AC12–AC14 ↔ T06｜AC07 ↔ T07 | §5.3 / §7.3 | 判据不变 |
| **AC25 ↔ T15（新）** | §15.3 C1 | 搜「己」→ 组 1/2/3 可见行 rendered `left` 落在各自栏头水平区间内（容差 ≤8px）；**禁止**以 `[data-xy-group]` 计数替代 |
| **T12（新，架构补充）** | §15.4 | 免滚动：条件化取样 + 全显态 `overflow ≤ 2` |
| **T13（新，架构补充）** | §15.2 | 三栏几何：可见行 `left` 呈 3 个不同值、各 20 行；栏头 3 个 top 同带、宽度 > 0 |
| **T14（新，架构补充）** | §15.2 | 空栏占位：单组命中（「甲子」）时另两栏 0 行但栏头仍在；命中 0（「斗数」）时栏头 3 个仍在 + `#xySearchEmpty` 可见 |
| E20–E23（r5 新增边界） | §15.3 | 归入 T15 / T12 / T14 的边界用例 |

**断言边界（r7 FR3.4.3 / D20，硬约束）**：断言只锁**钩子 / 行为 / 几何**；**禁止**锁 computed `grid-auto-flow` / `grid-template-*` 的**字面值**（锁死实现，且 r6 的字面写法本身不满足 FR3.8）；也**不需要**退化为 60 条 `nth-child(k){grid-row:k}` 显式定位。

### 15.6 门禁（§10.4 / §11.4 更新）

| 项 | 处置 |
|---|---|
| `KEYS`（静态 `id=`/`class=`） | **新增** `xy-group-title`（三端 HTML 硬编码） |
| `RUNTIME_KEYS` | **删除** `xy-group-row`（该行已无生成物，留则成幽灵白名单） |
| 纯 CSS 三栏 | **不新增**任何运行时类 |
| §10.4「方案 A」中「RUNTIME_KEYS 加 `xy-group-row`」 | **作废**（改为删除）；同一方案中的「兜底扩扫 `xingyao.js`」**保留**（对 `data-xy-group` 等生成属性仍需要） |

### 15.7 改动清单更新（覆盖 §10 对应行）

| 层 | 终版要求 |
|---|---|
| 三端 HTML（×3） | ① 新增 `.xy-groups-heads` + 3 个静态 `div.xy-group-title[data-xy-group="N"]`（表格**上方**，与三栏列宽对齐）；② `.xy-table{display:block}` + 表头契约（§15.3 C3）；③ `@media(min-width:1280px)` 采纳 r7 FR3.4 终版（`grid-auto-flow:row dense` + `repeat(3,minmax(0,1fr))` + `repeat(20,auto)` + 按组 `grid-column`）；④ `.xy-settings-modal [hidden]{display:none !important}`（必需）；⑤ <1280px 单栏纵向；**不得**为表头加任何窄屏覆盖（base 的 `display:block` + 同列模板已覆盖窄屏，仅 `width:calc((100% - 32px)/3)` 属 ≥1280px 专属） |
| `xingyao.js` | `renderSettings()` **不再插入任何组标题行**（现行 `index.html:7381` 注释即此约定），只生成 60 个 `tr[data-gz][data-xy-group]`；`filterRows()` 只切换行 `hidden`，**不触碰**栏头与列名 |
| `main.js` | T05/T06 断言按 §2.6 更新；**新增 T12–T15** |
| `scripts/check-release.sh` | 按 §15.6 |
| `docs/ALGORITHM.md` + `scripts/sync-xingyao-algorithm.py` | **本次不涉及**（r5–r7 只改布局/CSS，无算法语义变更）；仍按 §10.5 原判：仅 §21.1 / §21.2（纳音全名） |

### 15.8 与 r7 的冲突项

**无冲突。** r7 的 FR1.x / FR2.x / FR3.x、AC01–AC25、D01–D20 与本 ADR §3–§11 的全部红线（显隐不重渲染、`collectDraft()` 零改动）、状态机语义、存储兼容（键与 schemaVersion 零变更）、IME 闸门、纳音列口径、回滚基线**逐条一致**。

需明示的三点（**均非冲突**）：

1. **补充项 C3**（§15.3）：共享表头与栏列的几何对齐 —— r7 只要求 `thead th`=4，未规定几何；本 ADR 提升为**架构级 CSS 契约**，并建议测试师补一条几何断言。属 ADR 层新增，**不要求 PM 改 PRD**。
2. **R 项候选**：若测试师不采纳 C3 的几何断言，则「表头等分铺满、与栏列不对齐」记入 §12.3 同类 R 项（**R8**，原称 R7；编号更正见 §13），本契约仍保留为实现要求。
3. **勘误项**：我在第 23–24 轮 memo / 消息中的栏边界错值（甲子–癸巳 / 甲午–癸丑 / 甲寅–癸亥）**作废**，以 §15.2 的 甲子–癸未 / 甲申–癸卯 / 甲辰–癸亥 为准。

### 15.9 版本与回滚

D7（§9）**不变**：版本 v0.30.0（MINOR）、回滚基线 `.bak_v0.30.pre/`、数据结构未变 ⇒ 回滚**无需**清 localStorage，新旧版本双向可读。
