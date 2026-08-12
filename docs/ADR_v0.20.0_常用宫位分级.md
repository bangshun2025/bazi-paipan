# ADR v0.20.0 — 常用宫位分级

> **版本**：v1.0
> **日期**：2026-08-11
> **作者**：架构师（worker_36df7c90）
> **状态**：待评审
> **关联文档**：PRD_v0.20.0_常用宫位分级.md（产品经理）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

> 版本号均以 `grep` 实际读取源码确认（2026-08-11 实测）。

| 字段 | 值 |
|------|-----|
| 目标文件 1 | `/Users/feng/clacky_workspace/10-开发项目/软件-八字排盘/八字排盘·运行/gongwei.js` |
| 当前版本号 | `v0.16.0`（文件头注释；实际经过 v0.17.0–v0.19.0 迭代，版本注释未更新） |
| 当前行数 | 861 行（`wc -l` 实测） |
| 改动类型 | 功能增强——新增常用宫位数据层 + 设置页双 tab 渲染 + 下拉面板过滤 |
| 目标文件 2 | `/Users/feng/clacky_workspace/10-开发项目/软件-八字排盘/八字排盘·运行/standalone-split.html` |
| 当前版本号 | `v0.19.0`（文件头注释 `<!-- 八字排盘 · 从真版 v0.19.0 | 2026-08-09 -->`） |
| 当前行数 | 801 行（`wc -l` 实测） |
| 改动类型 | CSS 新增（tab 切换样式、☆ 标记样式、常用 tab 列表样式）+ HTML 结构调整（设置页双 tab） |
| 目标文件 3 | `/Users/feng/clacky_workspace/10-开发项目/软件-八字排盘/八字排盘·运行/standalone.html`（内联发布版，== index.html） |
| 当前版本号 | `v0.19.0` |
| 当前行数 | 6555 行（`wc -l` 实测） |
| 改动类型 | 通过 `build_modules.py` 由 standalone-split.html + 6 模块内联合成，不直接修改 |
| 不改动 | `constants.js`（859 行）、`algorithm.js`（672 行）、`archive.js`（916 行）、`render.js`（1568 行）、`main.js`（872 行） |

> **构建同步机制（已核实）**：`build_modules.py`（L146–148）将 `standalone-split.html` 的 HTML/CSS 骨架 + 6 个 JS 模块内联写入 `standalone.html`。发布流程为：**改 standalone-split.html CSS/HTML + gongwei.js → 运行 `build_modules.py` → standalone.html 自动更新**。`standalone.html` 与 `index.html` 预期字节级相同（`diff -q` 通过）。

---

## 一、决策摘要

| # | 决策项 | 选择 | 备选方案 |
|---|--------|------|----------|
| AD-01 | 常用宫位存储 | 新增 `localStorage['bz_gongwei_fav']`，存储宫位组名称数组（顺序即显示顺序），与现有 `bz_gongwei_groups` / `bz_gongwei_selected` 解耦 | 在 `gongWeiGroups[]` 每个对象上加 `isFav` 字段（❌ 污染数据模型，且顺序更难管理） |
| AD-02 | 旧用户迁移 | `initGongWeiData()` 中检测 `bz_gongwei_fav` 缺失 → 自动初始化为 `gongWeiGroups.map(g => g.name)`（全部默认常用）。一次写入，后续不再触发 | 延迟迁移（首次打开设置页时才迁移；❌ 增加出错面，下拉面板在迁移前行为不一致） |
| AD-03 | 设置页 tab 实现 | 纯 JS DOM 切换（`gzSettingsView` 变量扩展为三态：`'all'` / `'fav'` / `'trash'`），两个列表容器互斥显示。不引入路由/框架 | 用 CSS `display:none/block` 两个独立 div（与当前列表/回收站切换模式一致） |
| AD-04 | ☆ 常用标记 UI | 全部宫位 tab 每行左侧加 ☆ 字符按钮（实心 `★` = 在常用，空心 `☆` = 不在常用）。CSS 控制颜色区分，点击区域 ≥ 24×24px | checkbox（❌ 与常用 tab 中的"排盘显示"checkbox 视觉混淆）；SVG icon（过度设计） |
| AD-05 | 下拉面板改造 | `renderGongWeiPanel()` 遍历源从 `gongWeiGroups` 改为 `getFavGroups()`（按 `bz_gongwei_fav` 顺序查找 group 对象）；`rebuildGzCbGrid()` 同理 | 新增独立函数 `renderFavPanel()`（❌ 增加维护面，两个面板逻辑重复） |
| AD-06 | 标签行遍历源 | `buildGongWeiTagRows()` 遍历源从 `gongWeiGroups` 改为 `getFavGroups()`，过滤 `selectedGongWei`。数据流：`bz_gongwei_fav`（顺序） → 过滤 `selectedGongWei`（子集） → 生成标签行 | 维持遍历全部宫位但跳过非常用（❌ 排序语义不生效） |
| AD-07 | 「默认」按钮实现 | `resetFavOrder()`：读取 `gongWeiGroups` 顺序 → 过滤 `bz_gongwei_fav` 中的 name → 重排 `bz_gongwei_fav` → 持久化 + 刷新 UI。不改变哪些组在常用中 | 用额外 flag 记录"是否手动调整过"（❌ 过度设计，用户点「默认」就是显式意图） |
| AD-08 | 新增宫位组默认不入常用 | `addGroup()` 不修改 `bz_gongwei_fav`。用户需在全部宫位 tab 手动 ☆。与旧用户迁移"全部默认常用"的差异是刻意的——预置 14 种是出厂设置，自定义是按需添加 | 新增自动加入常用（❌ 与用户预期不符——新增一个自定义组就出现在下拉面板会很突兀） |

---

## 二、上下文与约束

### 2.1 现状

- 八字排盘 v0.19.0，`standalone-split.html`（801 行）+ 6 模块 JS；`standalone.html`/`index.html`（6555 行）为内联发布版。
- 宫位体系由 gongwei.js（861 行）全权管理，挂载 `window.GONGWEI` 命名空间。
- 数据层：3 个 localStorage key — `bz_gongwei_groups`（全部宫位组数组，含顺序）、`bz_gongwei_selected`（排盘显示的组名数组）、`bz_gongwei_trash`（回收站）。
- 渲染链路：
  - **下拉面板**：`renderGongWeiPanel()` → 遍历 `gongWeiGroups` 生成 checkbox 列表 → 用户勾选 → `toggleGongWei()` 更新 `selectedGongWei` → `updateGongWeiTags()` 刷新标签行。
  - **标签行**：`buildGongWeiTagRows()` → 遍历 `gongWeiGroups` → 过滤 `selectedGongWei` → 按全部宫位顺序生成 `<tr>`。
  - **设置页**：`openGzSettings()` → `renderGzSettingsList()` → 遍历 `gongWeiGroups` 渲染带排序/编辑/删除的列表。当前只有「列表」和「回收站」两个视图（`gzSettingsView = 'list' | 'trash'`）。
- 模块依赖拓扑：constants → algorithm → archive → gongwei → render → main。gongwei.js 在模块链中位置靠前，render.js 和 main.js 依赖它，但 gongwei.js 不依赖 archive/render/main。

### 2.2 约束

1. 单文件零构建（IIFE + `window.*` 命名空间），不使用 ES module、不使用 npm 依赖。
2. localStorage 键位不动现有 3 个 key（`bz_gongwei_groups` / `bz_gongwei_selected` / `bz_gongwei_trash`），新增 `bz_gongwei_fav`。
3. 改动仅限 gongwei.js + standalone-split.html（CSS + 设置页 HTML），不涉及排盘算法、档案、渲染等其他模块。
4. `selectedGongWei` 语义不变——始终表示"排盘上显示哪些宫位组"。
5. 内联发布版与开发版必须同步（`build_modules.py` 自动内联）。

### 2.3 关键观察

- **PRD 中「常用宫位 tab 排序 → 同步标签行顺序」是本次核心行为变化**。当前标签行顺序 = 全部宫位顺序；改后 = 常用宫位顺序。这意味着 `buildGongWeiTagRows()` 的迭代源必须从 `gongWeiGroups` 改为按 `bz_gongwei_fav` 顺序获取的 group 列表。
- **`buildGongWeiTagRows()` 当前是纯函数**（接收 `area` 和 `colCount`，读全局 `gongWeiGroups` 和 `selectedGongWei`）。改造后仍需保持纯函数特性——只读全局状态，不写。
- **`rebuildGzCbGrid()` 当前遍历全部宫位生成 popover checkbox**。改造后需改为只遍历常用宫位。但与 `renderGongWeiPanel()` 初始生成逻辑保持一致的遍历源。
- **`updateGroup()` / `deleteGroup()` / `restoreFromTrash()` 已有同步 `selectedGongWei` 的逻辑**（如 `updateGroup` L177–180 同步旧名称 → 新名称）。本次需新增对 `bz_gongwei_fav` 的同步。
- **`resetToDefaults()` 恢复 14 种预置时**，需同步更新 `bz_gongwei_fav`（恢复的预置组自动加入常用，与初始迁移逻辑一致）。
- **constants.js 无需改动**：本次不需要新增常量。`GONGWEI_MAP`、`GONGWEI_COLORS` 等现有常量已满足需求。新增的 localStorage key 字符串直接硬编码在 gongwei.js 中（与现有 `'bz_gongwei_groups'` 等一致）。

---

## 三、逐决策详述

### AD-01：常用宫位独立存储键

**决策**：新增 `localStorage['bz_gongwei_fav']`，存储 `string[]`（宫位组名称，顺序即常用显示顺序）。

**理由**：
- 与现有 `bz_gongwei_selected`（也是 `string[]`）模式一致，团队和 AI 都熟悉这种模式。
- 数组天然有序——常用宫位的排序直接通过数组元素位置表达，无需额外 `order` 字段。
- 三键解耦（groups / fav / selected）使各自独立演化，不会因为一个字段的改动污染另一个。
- 旧用户迁移只需检测 key 是否存在，逻辑简单可靠。

**代价**：
- localStorage 键数从 3 增至 4，略微增加初始化时的读取次数（`getItem` × 4）。
- 编辑宫位组名称时需同步更新 `bz_gongwei_fav`（与 `bz_gongwei_selected` 同步逻辑类似，但多一个数组要维护）。

**备选方案**：

| 方案 | 优点 | 为什么不选 |
|------|------|-----------|
| 在 `gongWeiGroups[i]` 加 `isFav: boolean` | 单数据源，无需额外 key | 常用宫位需要独立排序——如果在 group 对象上加 `favOrder`，需要在两个数组间同步；且 `gongWeiGroups` 按"全部宫位"排序，`bz_gongwei_fav` 按"常用宫位"排序，两个排序维度无法共存于同一数组 |
| 在 `gongWeiGroups[i]` 加 `favOrder: number` + `isFav: boolean` | 单数据源 | 排序操作需要遍历整个数组重新编号，复杂度高；且"全部宫位排序不影响常用"的约束使两个排序必然独立 |

---

### AD-02：旧用户数据迁移策略

**决策**：`initGongWeiData()`（gongwei.js L812）中检测 `localStorage.getItem('bz_gongwei_fav')` 是否为 null → 若 null，初始化为 `gongWeiGroups.map(g => g.name)`，写入 localStorage。

**理由**：
- 迁移在模块加载时自动完成，无需用户触发任何操作。
- 全部默认常用 = 老用户升级后下拉面板与升级前一模一样（零感知变化），他们可后续手动精简常用范围。
- 一次写入后 `bz_gongwei_fav` 存在，后续加载不再触发迁移。
- 与现有 `initGongWeiData()` 的初始化模式一致（先 `loadGroups()`，再 `loadTrash()`，再 `loadSelected()`）。

**代价**：
- 老用户的 `bz_gongwei_fav` 可能包含已从全部宫位中删除但仍在 `selectedGongWei` 中的"幽灵名称"。需在迁移后立即清洗（过滤 `bz_gongwei_fav` 中不在 `gongWeiGroups` 中的名称）。

**实现伪代码**：
```js
// 在 initGongWeiData() 末尾（persistSelected() 之后）
if (!localStorage.getItem('bz_gongwei_fav')) {
  var fav = gongWeiGroups.map(function(g) { return g.name; });
  localStorage.setItem('bz_gongwei_fav', JSON.stringify(fav));
}
// 清洗：确保 fav 中的名称在 groups 中都存在
var fav = JSON.parse(localStorage.getItem('bz_gongwei_fav'));
fav = fav.filter(function(name) {
  for (var i = 0; i < gongWeiGroups.length; i++) {
    if (gongWeiGroups[i].name === name) return true;
  }
  return false;
});
localStorage.setItem('bz_gongwei_fav', JSON.stringify(fav));
```

---

### AD-03：设置页 tab 切换

**决策**：扩展现有 `gzSettingsView` 变量从二态（`'list'` / `'trash'`）为三态（`'all'` / `'fav'` / `'trash'`）。在设置页 header 下方新增两个 tab 按钮，切换时 `renderGzSettingsAll()` 或 `renderGzSettingsFav()` 重绘内容区。

**理由**：
- 复用现有 `gzSettingsView` 机制，编码模式一致（团队已有认知）。
- 列表视图的 DOM 容器 `gzSettingsListView` 可以直接复用——`renderGzSettingsAll()` 写入全部宫位列表，`renderGzSettingsFav()` 写入常用宫位列表。回收站视图 `gzSettingsTrashView` 保持不变。
- 两个 tab 切换不涉及数据变更，仅改变渲染内容——关闭设置页时统一执行 `rebuildGzCbGrid()` + `updateGongWeiTags()`。

**代价**：
- `openGzSettings()` 当前硬编码 `gzSettingsView = 'list'`，需改为 `'all'`。
- `closeGzSettings()` 内需判断当前视图，若在常用 tab 则保持不变（关闭时统一刷新下游）。

**HTML 结构变化**（standalone-split.html 设置页 `gzSettingsListView` 内）：
```html
<!-- header 下方新增 tab 栏 -->
<div class="gz-tabs">
  <button class="gz-tab active" id="gzTabAll" onclick="GONGWEI.switchGzTab('all')">全部宫位</button>
  <button class="gz-tab" id="gzTabFav" onclick="GONGWEI.switchGzTab('fav')">常用宫位</button>
</div>
<!-- 原 gzSettingsList 容器复用，根据 tab 渲染不同内容 -->
<div class="gz-settings-list" id="gzSettingsList"></div>
```

---

### AD-04：☆ 常用标记

**决策**：全部宫位 tab 的每个宫位组行左侧新增 ☆ 按钮（Unicode 字符 `★` / `☆`），CSS `font-size: 18px` + `padding: 6px` 确保触控区域 ≥ 24×24px。点击触发 `toggleFav(name)`，即时切换实心/空心 + 更新 `bz_gongwei_fav`。

**理由**：
- ☆ 符号简洁、跨平台渲染一致（无需加载图标字体或 SVG）。
- 与常用 tab 中的 checkbox（排盘显示）视觉明确区分——☆ 是五角星，checkbox 是方框打勾。
- 点击即时生效，无需确认弹窗（与 PRD 要求一致）。

**代价**：
- Unicode ★/☆ 在不同系统上渲染效果略有差异（macOS 上较细，Windows 上较粗），但不影响功能。
- 需要 CSS 定义 `.gz-star` 类（实心橙色 `★` / 空心灰色 `☆`，hover 态颜色变化）。

**实现要点**：
- `renderGzSettingsAll()` 中每行 HTML 加：`<span class="gz-star" onclick="GONGWEI.toggleFav('${g.name}')">${isFav(g.name) ? '★' : '☆'}</span>`
- `toggleFav(name)`：读 `bz_gongwei_fav` → 若存在则移除 → 若不存在则追加到末尾 → 持久化 → 重绘当前列表。
- 若从常用中移除某组：同步从 `selectedGongWei` 中移除（数据一致性约束）。

---

### AD-05：下拉面板改造

**决策**：`renderGongWeiPanel()` 和 `rebuildGzCbGrid()` 的遍历源从 `gongWeiGroups` 改为 `getFavGroups()`（工具函数：按 `bz_gongwei_fav` 顺序查找 `gongWeiGroups` 中的对应 group 对象）。

**理由**：
- 两个函数的最小改动——只改迭代源，不改 HTML 结构和交互逻辑。
- 新增 `getFavGroups()` 工具函数封装"按 fav 顺序获取 group 对象"的逻辑，复用方便。
- 空常用时下拉面板显示提示文字（PRD AC02）。

**实现**：
```js
function getFavGroups() {
  var fav = loadFav(); // 读 bz_gongwei_fav
  var result = [];
  for (var i = 0; i < fav.length; i++) {
    var g = findGroupByName(fav[i]);
    if (g) result.push(g);
  }
  return result;
}
```

**`renderGongWeiPanel()` 改动**：`for (var i = 0; i < gongWeiGroups.length; i++)` → `var favGroups = getFavGroups(); for (var i = 0; i < favGroups.length; i++)`。空数组时渲染提示文字。

**`rebuildGzCbGrid()` 改动**：同上遍历源切换。

**`selectAllGongWei()` / `clearAllGongWei()`**：`selectAllGongWei()` 的"全选"语义从全部宫位改为常用宫位（`selectedGongWei = getFavGroups().map(g => g.name)`）。与 PRD AC13 一致。

---

### AD-06：标签行遍历源切换

**决策**：`buildGongWeiTagRows()` 中 `for (var i = 0; i < gongWeiGroups.length; i++)` → `var favGroups = getFavGroups(); for (var i = 0; i < favGroups.length; i++)`。

**理由**：
- 这是实现"常用宫位排序 → 标签行顺序联动"的最直接方式。
- `selectedGongWei` 过滤逻辑不变——仍然是 `selectedGongWei.indexOf(gwName) >= 0` 决定是否渲染该行。只是迭代源变了。

**代价**：
- `getFavGroups()` 每次调用都遍历 `gongWeiGroups` 做 name 查找（O(n×m)）。当前 n≤20、m≤20，性能可忽略。若未来宫位组数增长，可在 `initGongWeiData()` 时预建 name→group 的 Map 缓存。

---

### AD-07：「默认」按钮

**决策**：`resetFavOrder()` 函数：读取 `gongWeiGroups` → 过滤出在 `bz_gongwei_fav` 中的 name → 按 group 在 `gongWeiGroups` 中的出现顺序排序 → 写回 `bz_gongwei_fav` → 持久化 → 刷新常用 tab 列表。

**理由**：
- 不改变哪些组在常用中（`bz_gongwei_fav` 的元素集合不变），只改变顺序。
- 不需要额外的"是否手动调整过"标记——用户点击「默认」就是显式意图，之后手动调整又可脱离默认顺序。

**代价**：
- 无。这是一个简单的数组排序操作。

---

### AD-08：新增宫位组默认不入常用

**决策**：`addGroup()` 返回前不修改 `bz_gongwei_fav`。

**理由**：
- 预置 14 种是"出厂设置"，所有用户都需要的基础宫位 → 默认全部常用。
- 自定义宫位是"按需添加"——用户主动创建的组，应显式选择是否加入常用。
- 若新增默认常用，用户每创建一个测试/临时组都会污染下拉面板，体验差。

---

## 四、数据一致性约束

> 以下约束表与 PRD §4.4 对齐，从架构角度补充实现细节。

| 操作 | 对 `bz_gongwei_fav` 的影响 | 对 `bz_gongwei_selected` 的影响 |
|------|---------------------------|-------------------------------|
| 全部 tab：☆ 勾选 | `fav.push(name)` → persist | 无 |
| 全部 tab：☆ 取消 | `fav.splice(idx, 1)` → persist | `selected.splice(idx, 1)` → persist（级联清理） |
| 全部 tab：删除宫位组 | 若在 fav 中 → `fav.splice(idx, 1)` → persist | 若在 selected 中 → `selected.splice(idx, 1)` → persist |
| 全部 tab：拖拽排序 | **不影响** fav | 无 |
| 常用 tab：checkbox 勾选 | 无 | 现有 `toggleSelect()` 逻辑不变 |
| 常用 tab：拖拽/箭头排序 | **重排** fav 数组 → persist | 无（selected 是 Set，无序） |
| 常用 tab：「移除」 | `fav.splice(idx, 1)` → persist | `selected.splice(idx, 1)` → persist（级联清理） |
| 常用 tab：「默认」 | 按 groups 顺序重排 fav → persist | 无 |
| `updateGroup()` 改名称 | 同步 fav 中旧名称 → 新名称 | 已有逻辑：同步 selected 中旧名称 → 新名称 |
| `restoreFromTrash()` | **不**自动加入 fav | **不**自动加入 selected |
| `resetToDefaults()` | 恢复的预置组追加到 fav（若尚未在 fav 中） | 不自动加入 selected |

**强制级联清理原则**：从常用中移除的组，**必须同时从 selected 中移除**。因为不在常用中的组不应该出现在排盘上——否则用户取消 ☆ 后发现标签行还在，会产生困惑。这是比 PRD 更强的约束（PRD 只说"同时移除"），但逻辑上是自洽的：不在常用 = 不可选中。

---

## 五、实现要点

### 5.1 gongwei.js — 数据层新增（~40 行）

| 位置 | 变更类型 | 说明 |
|------|----------|------|
| L89 附近（`loadSelected()` 之后） | 新增函数 | `loadFav()`：读 `localStorage['bz_gongwei_fav']`，返回 `string[]` |
| L89 附近 | 新增函数 | `persistFav(arr)`：写 `localStorage['bz_gongwei_fav']` |
| L89 附近 | 新增函数 | `isFav(name)`：`name` 是否在 `bz_gongwei_fav` 中 |
| L89 附近 | 新增函数 | `getFavGroups()`：按 `bz_gongwei_fav` 顺序返回 `gongWeiGroups` 中的对应 group 对象数组 |
| L812–830（`initGongWeiData()`） | 修改 | 新增旧用户迁移逻辑（检测 `bz_gongwei_fav` → 不存在则自动初始化 + 清洗） |

### 5.2 gongwei.js — 渲染层改动（~120 行）

| 位置 | 变更类型 | 说明 |
|------|----------|------|
| L260–296（`buildGongWeiTagRows()`） | 修改 | 遍历源从 `gongWeiGroups` 改为 `getFavGroups()`，改 ~3 行 |
| L342–360（`rebuildGzCbGrid()`） | 修改 | 遍历源从 `gongWeiGroups` 改为 `getFavGroups()`，改 ~3 行 |
| L364–382（`renderGongWeiPanel()`） | 修改 | 遍历源改为 `getFavGroups()`；空数组时渲染提示文字 |
| L388–407（`selectAllGongWei()` / `clearAllGongWei()`） | 修改 | `selectAllGongWei()` 改为 `getFavGroups().map(g => g.name)` |
| L469–471（`openGzSettings()`） | 修改 | `gzSettingsView = 'all'`（原 `'list'`）；默认激活「全部宫位」tab |
| L475–480（`closeGzSettings()`） | 修改 | 关闭前同步刷新 fav 相关 UI 状态 |
| L482–530（`renderGzSettingsList()`） | 重命名 + 重构 | 拆为 `renderGzSettingsAll()` + `renderGzSettingsFav()`。原函数重命名为 `renderGzSettingsAll()`，每行左侧新增 ☆ 标记 |
| 新增 | 新增函数 | `renderGzSettingsFav()`：渲染常用宫位列表（checkbox + 名称 + 排序按钮 + 移除按钮 + 默认按钮） |
| 新增 | 新增函数 | `switchGzTab(tab)`：切换 `gzSettingsView` 并重绘 |
| 新增 | 新增函数 | `toggleFav(name)`：切换常用状态 + 持久化 + 重绘 |
| 新增 | 新增函数 | `removeFromFav(name)`：从常用移除（级联清理 selected） |
| 新增 | 新增函数 | `moveFavUp(idx)` / `moveFavDown(idx)` / `moveFav(fromIdx, toIdx)`：调整 `bz_gongwei_fav` 顺序 |
| 新增 | 新增函数 | `resetFavOrder()`：「默认」按钮 → 按 `gongWeiGroups` 顺序重排 `fav` |
| L137–180（`updateGroup()`） | 修改 | L177–180 同步 `selectedGongWei` 旧名称 → 新名称的代码块后，新增同步 `bz_gongwei_fav`（改 ~4 行） |
| L182–193（`deleteGroup()`） | 修改 | L189 `selectedGongWei.filter` 后，新增同步 `bz_gongwei_fav`（改 ~4 行） |
| L195–208（`restoreFromTrash()`） | 修改 | 不自动加入 fav（与 PRD §7.6 一致），当前代码已满足 |
| L210–249（`resetToDefaults()`） | 修改 | 恢复预置组后，将恢复的组名追加到 `bz_gongwei_fav`（若尚未在 fav 中），持久化 |
| L55–61（`persistSelected` 等） | 新增 | 在 IIFE 作用域顶端新增 `persistFav` 调用点（变量提升兼容） |

### 5.3 standalone-split.html — CSS 新增（~40 行）

| 位置 | 变更类型 | 说明 |
|------|----------|------|
| L458 附近（`.gz-settings-*` 区） | 新增 CSS | `.gz-tabs`：tab 栏容器（`display:flex; border-bottom:1px solid var(--c-line)`） |
| 同上 | 新增 CSS | `.gz-tab`：单个 tab 按钮（`padding:8px 16px; cursor:pointer; border:none; background:transparent`） |
| 同上 | 新增 CSS | `.gz-tab.active`：激活态 tab（`border-bottom:2px solid var(--c-ink); font-weight:600`） |
| 同上 | 新增 CSS | `.gz-star`：☆ 标记按钮（`font-size:18px; cursor:pointer; padding:6px; min-width:24px; text-align:center`） |
| 同上 | 新增 CSS | `.gz-star.on`：实心 ★ 橙色（`color:#e6a817`）；`.gz-star.off`：空心 ☆ 灰色 |
| 同上 | 新增 CSS | `.gz-fav-item`：常用 tab 列表项（与 `.gz-set-item` 类似但含 checkbox） |
| 同上 | 新增 CSS | `.gz-fav-actions`：常用 tab 操作按钮区 |

### 5.4 standalone-split.html — HTML 结构调整（~25 行）

| 位置 | 变更类型 | 说明 |
|------|----------|------|
| L716–745（设置页 `gzSettingsListView`） | 修改 | 在 header（宫位设置 + ✕）下方新增 tab 栏（两个按钮）；`gzSettingsList` 容器保留但内容由 JS 按 tab 动态渲染 |
| L730 附近 | 修改 | footer 中「保存并关闭」保持不变；「恢复默认」「回收站」按钮保留在全部宫位 tab 中；常用 tab 有自己的 footer（「默认」按钮） |

### 5.5 不改动的文件

| 文件 | 理由 |
|------|------|
| constants.js | 无需新增常量。`GONGWEI_MAP` 等现有常量已满足需求 |
| algorithm.js | 宫位分级与排盘算法无关 |
| archive.js | 宫位分级与档案管理无关 |
| render.js | `buildGongWeiTagRows()` 和 `renderGongWeiPanel()` 均在 gongwei.js 中，render.js 仅调用 `GONGWEI.updateGongWeiTags()` / `GONGWEI.renderGongWeiPanel()`，接口不变 |
| main.js | 入口初始化无需改动（`initGongWeiData()` 在 gongwei.js 自执行 IIFE 中，先于 main.js 执行） |

---

## 六、依赖拓扑（不变）

```
constants → algorithm → archive → gongwei → render → main
```

gongwei.js 是唯一改动的 JS 模块。它的改动不影响上游（archive/algorithm/constants），也不改变对下游（render/main）的接口签名——`GONGWEI.updateGongWeiTags()`、`GONGWEI.renderGongWeiPanel()`、`GONGWEI.selectedGongWei` 等导出不变。

---

## 七、风险矩阵

| # | 风险 | 概率 | 影响 | 缓解 |
|---|------|------|------|------|
| R1 | 旧用户 `bz_gongwei_fav` 迁移后含"幽灵名称"（已删除的宫位组名还在 fav 中） | 中 | 中：`getFavGroups()` 返回不含该 group → 下拉面板/标签行跳过它，但 fav 数组膨胀 | 迁移后立即清洗（过滤 `findGroupByName !== null`） |
| R2 | `selectedGongWei` 中的名称不在 `bz_gongwei_fav` 中（从常用移除但级联清理遗漏） | 低 | 中：标签行出现不在下拉面板中的宫位行 | 所有从常用移除的路径（☆ 取消、移除按钮、删除宫位组）都做级联清理；并在 `updateGongWeiTags()` 中增加防御性过滤 |
| R3 | 拖拽排序在常用 tab 和全部 tab 之间的交互 Bug（用户在常用 tab 排序后切换到全部 tab，再切回来顺序乱了） | 低 | 低：两个 tab 的排序完全独立（全部 tab 写 `gongWeiGroups`，常用 tab 写 `bz_gongwei_fav`），互不干扰 | 每次切 tab 时从数据源重新渲染（不缓存 DOM），确保显示与数据一致 |
| R4 | 「默认」按钮把用户手动调整的顺序覆盖了，但用户期望"撤销" | 低 | 低：用户手动调整后不会主动点「默认」 | 「默认」按钮加 tooltip "按全部宫位顺序重排"；如需撤销可用浏览器后退（但 localStorage 不支持撤销——这是已知 UX 限制，非本版本范围） |
| R5 | `build_modules.py` 内联后 standalone.html 的 gongwei.js 内联块与源文件不一致（人工编辑 bug） | 低 | 高：发布版行为与开发版不一致 | 发布前 `diff` 验证（`diff <(sed -n '/gongwei.js/,/<\/script>/p' standalone.html) gongwei.js`） |
| R6 | 全部宫位为空 + 常用宫位为空 → 下拉面板和标签行的边界情况未覆盖 | 低 | 低：新用户不会删除全部预置 | 空状态提示文字覆盖所有渲染路径（下拉面板、常用 tab、标签行） |

---

## 八、实现阶段（Phase）

| Phase | 内容 | 文件 | 预估 |
|-------|------|------|------|
| P1 数据层 | 新增 `loadFav`/`persistFav`/`isFav`/`getFavGroups` + 旧用户迁移 + `initGongWeiData` 清洗 | gongwei.js | ~40 行，20min |
| P2 渲染层 — 下拉面板+标签行 | `renderGongWeiPanel` / `rebuildGzCbGrid` / `buildGongWeiTagRows` / `selectAllGongWei` 遍历源切换 | gongwei.js | ~15 行改动，15min |
| P3 渲染层 — 设置页双 tab | `renderGzSettingsAll`（重构）/ `renderGzSettingsFav`（新增）/ `switchGzTab` / `toggleFav` / `removeFromFav` / `moveFav*` / `resetFavOrder` | gongwei.js | ~80 行，45min |
| P4 HTML+CSS | 设置页 tab 栏 HTML + ☆ 样式 + 常用 tab 列表样式 + tab 切换样式 | standalone-split.html | ~65 行，30min |
| P5 数据一致性 | `updateGroup` / `deleteGroup` / `restoreFromTrash` / `resetToDefaults` 中新增 fav 同步 | gongwei.js | ~15 行，15min |
| P6 构建同步 | 运行 `build_modules.py` 内联回 `standalone.html`；验证 `diff -q standalone.html index.html` | 构建 | 5min |

**总预估**：~215 行改动（接近 PRD 预估的 200 行），净开发时间 ~2h。
