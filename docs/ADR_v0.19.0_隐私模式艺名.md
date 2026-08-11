# ADR v0.19.0 — 隐私模式（艺名）

> **版本**：v1.0
> **日期**：2026-08-09
> **作者**：架构师（worker_92152c48）
> **状态**：待评审
> **关联文档**：PRD_v0.19.0_隐私模式艺名.md（产品经理 worker_b58a1691）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

> 本功能为多文件改动，目标文件表按「6 模块 + 2 个 HTML」逐一列出。
> 版本号均以 `grep` 实际读取源码确认（2026-08-09 实测）。

| 字段 | 值 |
|------|-----|
| 目标文件 1 | `/Users/feng/.clacky/ext/local/bazi-paipan/standalone-split.html` |
| 当前版本号 | `v0.18.0` |
| 当前行数 | 782 行（`wc -l` 实测） |
| 版本注释位置 | 文件头部 `<!-- 八字排盘 · 从真版 v0.18.0 | 2026-08-08 -->` |
| 目标文件 2 | `/Users/feng/.clacky/ext/local/bazi-paipan/standalone.html`（内联发布版，== index.html） |
| 当前版本号 | `v0.18.0` |
| 当前行数 | 6474 行（`wc -l` 实测） |
| 版本注释位置 | 文件头部 `<!-- 八字排盘 · 从真版 v0.18.0 | 2026-08-08 -->` |
| 目标文件 3 | `/Users/feng/.clacky/ext/local/bazi-paipan/archive.js`（档案模块） |
| 当前行数 | 866 行（`wc -l` 实测） |
| 目标文件 4 | `/Users/feng/.clacky/ext/local/bazi-paipan/render.js`（渲染模块） |
| 当前行数 | 1558 行（`wc -l` 实测） |
| 目标文件 5 | `/Users/feng/.clacky/ext/local/bazi-paipan/main.js`（入口/事件模块） |
| 当前行数 | 872 行（`wc -l` 实测） |
| 目标文件 6 | `/Users/feng/.clacky/ext/local/bazi-paipan/constants.js`（常量模块） |
| 当前行数 | 857 行（`wc -l` 实测） |
| 不改动 | `algorithm.js`（672 行）、`gongwei.js`（861 行）——数据/算法层，本次零改动 |

> **构建同步机制（已核实）**：`standalone.html` 与 `index.html` 字节级相同（`diff -q` 通过），
> 其 6 个内联 `<script>` 块与 6 个 JS 模块文件内容逐字节一致（实测仅差末尾 1 字节换行符）。
> `build_modules.py` 为 v0.16.0 拆分时的**单向迁移脚本**（从 `standalone_v0.15.0_backup.html` 提取模块），
> 并非「模块 → 内联」的常规构建器。实际发布流程（git log 970fd67「index.html 同步 standalone.html」）为：
> **改 6 模块 → 将 6 个 `<script>` 块整体替换为模块内容 → standalone.html 与 index.html 保持一致**。
> 实现阶段须同时更新 `standalone-split.html`（开发引用版）与 `standalone.html`/`index.html`（内联发布版）。

---

## 一、决策摘要

| # | 决策项 | 选择 | 备选方案 |
|---|--------|------|----------|
| AD-01 | 显示名统一入口 | 新增 `ARCHIVE.getDisplayName(a)`，挂在 archive.js，经命名空间导出供 render/main 调用 | 放 constants.js 全局工具；放 render.js |
| AD-02 | 隐私开关存储 | `localStorage['bz_privacy_mode']`，`'1'`/`'0'`，默认开启（无键视为 '1'） | 默认关闭；会话级开关不持久化 |
| AD-03 | 档案字段扩展 | `archive` 对象新增可选 `yiming`，零迁移（读取 `a.yiming \|\| ''`） | 新增独立存储键；必填字段 |
| AD-04 | 排盘标题脱敏实现 | `doPaipan` 中构造 `data.displayName` 附加字段，渲染标题用 `data.displayName \|\| data.name`；`data.name` 保持真名不动 | 渲染函数内直接读表单；直接改写 data.name |
| AD-05 | 龙凤胎标题 | **纳入脱敏（修正 PRD）**：`renderLongFengCardsHtml` L1219 实际渲染 `<b>'+d1.name+'</b>`，PRD「无需改动」判断与代码不符 | 按 PRD 原文不处理（❌ 会泄露真名） |
| AD-06 | 开关 UI 挂载 | 主输入区工具行（📋档案/♻️ 旁）+ 档案面板头部（标题行），两处同步同状态 | 仅一处；设置页 |
| AD-07 | AI 录入预览 | `doAiParse` 中隐私开启时 `姓名：已隐藏` | 显示解析出的真名（❌ 泄露） |

---

## 二、上下文与约束

### 2.1 现状
- 八字排盘 v0.18.0，`standalone-split.html` 为开发主产物（782 行 HTML/CSS + 引用 6 模块），
  `standalone.html`/`index.html` 为内联发布版（6474 行，6 个 `<script>` 块 == 6 模块）。
- 档案数据存 `localStorage['bz_archives_v2']`（`ARCH_KEY`，constants.js L814），结构含
  `nickname`/`name`/`gender`/`year`/`month`/`day`/`hour`/`min`/`prov`/`city`/`dist`/`calendarType`/`isLeap`/`lunarMonth`/`useSolar`/`bazi`/`sanyuan`/`extras`/`gongWeiType`。
- 显示名散落拼装：`archive.js` L738/L793 两处 `(a.nickname ? a.nickname + ' / ' + a.name : a.name)`；
  `render.js` L549/L1110/L1219 三处排盘标题 `person-info <b>name</b>`；
  `main.js` L490 AI 预览 `姓名：r.name`；`archive.js` L331/L299 两处确认弹窗直接拼 `a.name`/`d.name`。
- 模块依赖拓扑：constants → algorithm → archive → gongwei → render → main；render/main 均已有 `ARCHIVE` 命名空间别名。

### 2.2 约束
1. 单文件零构建（原生 JS + IIFE + `window.*` 命名空间），不使用 ES module。
2. localStorage 键 `bz_archives_v2` 不变，新增可选字段 `yiming`，零迁移、旧数据 `undefined` 兼容。
3. 数据层不动：`doPaipan` 内 `paipan()` 返回的 `data.name` 保持真名，仅渲染前替换显示层。
4. 隐私模式铁律：任何显示点不得出现 `a.name`（含姓氏），降级链 `yiming → nickname → '匿名'`。
5. 输入框 `inName`/`editName` 不脱敏（老师维护数据视角）。
6. 内联发布版与开发版必须同步（standalone.html == index.html，含 6 内联块）。

### 2.3 关键观察
- **PRD 决策 4 第 5 行「龙凤胎无需改动（该视图不显示姓名）」与代码不符**：render.js L1219
  `renderLongFengCardsHtml` 的 `top-bar person-info` 实际渲染 `<b>'+name+'</b>`，`name = d1.name`（L1129）。
  若按 PRD 不处理，龙凤胎排盘标题会泄露老大真名。**ADR 修正：龙凤胎纳入脱敏。**
- `getDisplayName` 需被 archive（列表/搜索/确认弹窗）、render（排盘标题）、main（AI 预览）三方共用，
  放 archive.js（依赖 `CONST.ARCH_KEY`/`CONST.PRIVACY_KEY`）并经 `ARCHIVE` 命名空间导出最顺；render/main 已声明 `ARCHIVE` 别名。
- 排盘标题脱敏的数据源问题：`data` 仅含 `name`（来自表单 `inName`），不含 nickname/yiming。
  因此需在 `doPaipan` 中额外读取 `inNickname`/`inYiming` 构造显示名并附加到 `data.displayName`，
  渲染函数标题处改用 `data.displayName || data.name`。这是对 PRD「渲染前替换显示层」的落地实现。
- `closeEditPanel` 的 `changed` 检测含 `edited.nickname` 等字段，`yiming` 建议一并加入，避免改了艺名关闭时不提示。

---

## 三、架构决策记录

### ADR-001：`getDisplayName(a)` 统一显示函数（挂在 archive.js）

**决策**：在 archive.js 新增统一显示函数，并导出到 `window.ARCHIVE`：

```js
function getPrivacyMode() {
  return localStorage.getItem(PRIVACY_KEY) !== '0'; // 默认开启：无键/'1' → true
}
function setPrivacyMode(on) {
  localStorage.setItem(PRIVACY_KEY, on ? '1' : '0');
}
function getDisplayName(a) {
  if (!a) return '';
  if (!getPrivacyMode()) {
    return (a.nickname || '') ? (a.nickname + ' / ' + a.name) : a.name; // 维持现状
  }
  return (a.yiming && a.yiming.trim()) ? a.yiming
    : (a.nickname && a.nickname.trim()) ? a.nickname
    : '匿名';
}
```

**理由**：隐私逻辑收敛单点，杜绝散落拼装遗漏；隐私关闭时输出与 v0.18.0 逐字一致（AC4）；
隐私开启时降级链确定（AC3/AC13）。

**备选方案及否决原因**：
- 方案A：放 constants.js 全局工具 — 否决：constants.js 定位为纯数据表（857 行），引入 DOM/localStorage 逻辑破坏职责。
- 方案B：放 render.js — 否决：archive.js 的列表/确认弹窗先于 render 执行，依赖方向反了。

**影响范围**：archive.js（新增 3 函数）、render.js（引用 `ARCHIVE.getDisplayName`）、main.js（引用 `ARCHIVE.getDisplayName`）。

### ADR-002：隐私开关 localStorage 持久化 + 默认开启

**决策**：`constants.js` 新增 `const PRIVACY_KEY = 'bz_privacy_mode';` 并加入 `window.CONST` 导出；
`getPrivacyMode()` 无键视为开启（`!== '0'`），保证 AC1（全新打开默认开启）；切换写 `'1'/'0'`，AC2 持久化。

**理由**：默认开启 + 持久化双保险，防「忘开即泄露」；键风格与 `bz_archives_v2` 一致。

**备选方案及否决原因**：
- 默认关闭 — 否决：上课前忘开即真名暴露，违背需求根因。
- 只存内存不持久化 — 否决：刷新即回默认，仍需手动开，防不住。

### ADR-003：`yiming` 可选字段零迁移

**决策**：`archive` 对象新增可选 `yiming`，写入走 `getFormData()`/`getEditFormData()`，
读取走 `a.yiming || ''`；`bz_archives_v2` 键不变、无迁移脚本。旧档案（无 yiming）隐私模式下走降级链（AC11）。

**理由**：PRD 决策 5，字段可选向后兼容；16 孩预置档案不强制补艺名，降级链兜底（AC13）。

**影响范围**：archive.js `getFormData`/`setFormData`/`getEditFormData`/`openEditPanel`/`saveEdit`/`closeEditPanel(changed 检测)`；
standalone-split.html 主表单加 `inYiming`、编辑弹窗加 `editYiming`。

### ADR-004：排盘标题脱敏 — `data.displayName` 附加字段

**决策**：render.js `doPaipan()` 中，构造 `data` 后附加：
```js
data.displayName = ARCHIVE.getDisplayName({
  name: name,
  nickname: document.getElementById('inNickname').value,
  yiming: document.getElementById('inYiming').value
});
```
三处渲染标题（L549 renderChart / L1110 renderTwinCardsHtml / L1219 renderLongFengCardsHtml）
将 `<b>${name}</b>` 改为 `<b>${data.displayName || data.name}</b>`（字符串拼接版同理）。
**`data.name` 保持真名不动**（`paipan(name, ...)` 不变，存档/搜索/数据层零影响）。

**理由**：PRD「数据层不动、渲染前替换显示层」的落地；`data.displayName` 是渲染专属附加字段，
不污染排盘计算；隐私关闭时 `getDisplayName` 输出「小名 / 正名」，与现状一致（AC6）。

**备选方案及否决原因**：
- 渲染函数内直接读 `inNickname`/`inYiming` DOM — 否决：渲染函数不应依赖表单 DOM，且 archive 展开排盘（loadFromArchive）路径无表单值。
- 直接改写 `data.name` — 否决：破坏数据层不可变原则，影响后续存档/复用。

**影响范围**：render.js L1264 附近（doPaipan 构造）、L549/L1110/L1219（标题）。

### ADR-005：龙凤胎标题纳入脱敏（修正 PRD）

**决策**：`renderLongFengCardsHtml`（render.js L1219）的 `person-info <b>'+name+'</b>` 一并替换为
`data.displayName || data.name`（双胞胎分支已在 doPaipan 为 d1/d2 各自构造 displayName，此处用 d1.displayName）。

**理由**：代码实测该视图 top-bar 渲染 `<b>'+name+'</b>`（name = d1.name），PRD「不显示姓名」判断有误；
不处理则龙凤胎排盘时老大真名上屏，隐私目标落空。

**备选方案及否决原因**：
- 按 PRD 原文不处理 — 否决：直接泄露真名，违反隐私铁律。

**影响范围**：render.js L1219。

### ADR-006：开关 UI 两处挂载（主输入工具行 + 档案面板头部）

**决策**：standalone-split.html：
1. 主输入区工具行（L606 `📋 档案` 按钮旁）新增 `<button id="btnPrivacy" onclick="ARCHIVE.togglePrivacy()">🔒 隐私</button>`；
2. 档案面板头部（L644 `.archive-modal-header` 标题行）新增同步开关 `<button id="btnPrivacy2" onclick="ARCHIVE.togglePrivacy()">🔒 隐私</button>`。

两处同一状态、同一 handler；`togglePrivacy()` 切换 `bz_privacy_mode` → 更新两按钮文案/高亮 →
重渲染档案面板（若开）+ 重排当前标题（若 output 有数据）。开启态高亮（如 `🔒 隐私` + active 样式）。

**理由**：PRD 决策 3：主入口（排盘是主界面、上课前一眼可见）+ 档案面板同步开关（贴合「看别人信息」场景）；
全局生效（AC12）。

**备选方案及否决原因**：
- 仅一处开关 — 否决：档案面板开着时无法确认状态，体验割裂。
- 设置页开关 — 否决：入口深，上课前来不及点。

### ADR-007：AI 录入预览脱敏

**决策**：main.js `doAiParse()` L490：隐私开启时预览不显示真名：
```js
if (r.name) preview += '姓名：' + (ARCHIVE.getPrivacyMode() ? '已隐藏' : r.name) + '  ';
```
（解析出的 `r.name` 仍会填入 `inName` 输入框，输入框不脱敏，符合非目标。）

**理由**：预览是展示面，上课共享屏幕时 AI 录入解析结果不暴露真名（AC9）。

**影响范围**：main.js L490。

---

## 四、实施计划

| Phase | 内容 | 预估改动 | 依赖 |
|-------|------|----------|------|
| Phase 1 | constants.js：新增 `PRIVACY_KEY` 常量 + 导出 | ~2 行 | 无 |
| Phase 2 | archive.js：新增 `getPrivacyMode/setPrivacyMode/getDisplayName/togglePrivacy` + 命名空间导出；`getFormData/setFormData/getEditFormData/openEditPanel/saveEdit` 加 yiming；`closeEditPanel` changed 加 yiming；`renderArchiveModal`/`filterArchives` 用 getDisplayName + 搜索加 yiming；`moveToTrash`/`saveArchive` 确认弹窗脱敏 | ~40 行 | Phase 1 |
| Phase 3 | render.js：`doPaipan` 构造 `data.displayName`；L549/L1110/L1219 标题替换 | ~15 行 | Phase 2 |
| Phase 4 | main.js：`doAiParse` L490 脱敏 | ~3 行 | Phase 2 |
| Phase 5 | standalone-split.html：主表单 `inYiming`、编辑弹窗 `editYiming`、两处隐私开关按钮 | ~12 行 | Phase 2/3 |
| Phase 6 | 同步内联发布版：standalone.html + index.html 的 6 个 `<script>` 块替换为最新模块内容（含 HTML 新增开关/inYiming 输入框） | 同步 | Phase 1-5 |
| Phase 7 | 回归：`?test=1` 199 条断言 + 新增隐私断言（AC1-AC13 对应）；双胞胎/龙凤胎/精简模式/16孩预置 | 验证 | Phase 6 |

---

## 五、风险与对策

| 风险 | 等级 | 对策 |
|------|------|------|
| 显示点遗漏（真名残留某处） | 高 | 实现后 grep 全库 `a.name`/`d.name`/`data.name` 渲染处逐点核对；用 AC3/AC13 断言覆盖 |
| PRD 龙凤胎「无需改动」误导实现 | 中 | 本 ADR 已明确纳入脱敏（ADR-005），实现清单含 L1219 |
| 隐私关闭时显示格式与 v0.18.0 逐字不一致 | 中 | `getDisplayName` 隐私关闭分支保持原拼装字符串；`?test=1` + 快照回归 |
| standalone.html/index.html 内联版漏同步 | 中 | Phase 6 用脚本替换 6 个 `<script>` 块；`diff standalone.html index.html` 校验 |
| 排盘标题 data.displayName 未随档案展开路径生效 | 中 | `loadFromArchive` → `doPaipan` 统一走同一构造点；确认 archive 展开排盘也进 doPaipan |
| 旧档案 yiming 为 undefined 导致 `a.yiming.trim()` 报错 | 中 | `getDisplayName` 内先判空再 trim（`(a.yiming && a.yiming.trim())`） |
| 搜索按艺名匹配遗漏 | 中 | `filterArchives` 匹配条件加 `(a.yiming || '').toLowerCase().indexOf(k)` |
| togglePrivacy 后当前排盘标题不刷新 | 低 | handler 中检测 output 有 `_paipanData` 则调用 `RENDER.doPaipan()` 重排（或轻量重渲染标题） |

---

## 附录：改动点逐文件清单（实现核对用）

| 文件 | 位置 | 改动 |
|------|------|------|
| constants.js | L814 附近 | 新增 `const PRIVACY_KEY = 'bz_privacy_mode';` + 导出（L851-857 导出对象） |
| archive.js | 新增 | `getPrivacyMode()` / `setPrivacyMode(on)` / `getDisplayName(a)` / `togglePrivacy()` |
| archive.js | L208 getFormData | 返回对象加 `yiming: document.getElementById('inYiming').value || ''` |
| archive.js | L232 setFormData | 回填 `inYiming.value = d.yiming || ''` |
| archive.js | L420 getEditFormData | 加 `yiming: document.getElementById('editYiming').value || ''` |
| archive.js | L346 openEditPanel | 回填 `editYiming.value = a.yiming || ''` |
| archive.js | L368 closeEditPanel | changed 检测加 `edited.yiming !== _editOriginal.yiming` |
| archive.js | L738 renderArchiveModal | `var displayName = ...` → `var displayName = getDisplayName(a)` |
| archive.js | L793 filterArchives | `displayName` 同上；L780 匹配加 yiming |
| archive.js | L331 moveToTrash | `确定删除「' + getDisplayName(a) + '」` |
| archive.js | L299 saveArchive | `「' + getDisplayName(d) + '」已存在` |
| archive.js | L829-866 导出 | 追加 getPrivacyMode/setPrivacyMode/getDisplayName/togglePrivacy |
| render.js | L1264 doPaipan | 构造 `data.displayName`（读 inNickname/inYiming/inName） |
| render.js | L549 renderChart | `${name}` → `${data.displayName || data.name}` |
| render.js | L1110 renderTwinCardsHtml | `'+name+'` → `'+(data.displayName || data.name)+'` |
| render.js | L1219 renderLongFengCardsHtml | `'+name+'` → `'+(d1.displayName || d1.name)+'` |
| main.js | L490 doAiParse | `姓名：r.name` → 隐私开启 `姓名：已隐藏` |
| standalone-split.html | L584-585 后 | 新增 `<label>艺名</label><input type="text" id="inYiming" placeholder="艺名（选填）">` |
| standalone-split.html | L665-669 间 | 新增 `<div class="edit-row"><label>艺名（选填）</label><input type="text" id="editYiming" style="width:100%;"></div>` |
| standalone-split.html | L606 旁 | 新增隐私开关按钮（主输入工具行） |
| standalone-split.html | L644 头部 | 新增隐私开关按钮（档案面板标题行） |
| standalone.html / index.html | 全部 | 6 个 `<script>` 块替换 + HTML 新增段同步（Phase 6） |
