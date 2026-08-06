# ADR：v0.7.0 宫位功能 — 技术方案

> 版本：v1.0 | 日期：2026-07-15 | 作者：架构师（worker_56f4da54）
>
> 依赖 PRD：[PRD_v0.7.0_宫位功能.md](../产品经理/PRD_v0.7.0_宫位功能.md)
>
> 依赖版本：standalone.html v0.6.7

---

## 一、决策摘要

| 决策点 | 方案 | 依据 |
|--------|------|------|
| 映射表存储 | `GONGWEI_MAP` 常量对象，14 键 × 7 值数组，顺序固定 [胎元,年柱,月柱,日柱,命宫,时柱,身宫] | PRD 指定 |
| 选择器位置 | 单人：top-bar 内 btn-simple 同行；双胞胎：bz-twin-tabs 同行右侧 `margin-left:auto` | PRD 指定 |
| DOM 嵌入方式 | `<tr class="gz-tags">` 插入 `<tr class="hd">` 之前；列内 `<td>` 加 `data-gw` 属性做锚点映射 | 解耦列顺序，防错位 |
| 双胞胎适配 | `querySelectorAll` 批量操作，两张卡片标签同时更新（与性别/藏干差异无关） | PRD 指定 |

---

## 二、数据结构设计

### 2.1 GONGWEI_MAP 常量

```js
// 宫位映射表：14 种宫位 × 7 柱
// 索引顺序：[胎元, 年柱, 月柱, 日柱, 命宫, 时柱, 身宫]
const GONGWEI_MAP = {
  '信息':  ['状态门控','信息输入','信息处理','意义判定','情绪标记','输出组织','执行反馈'],
  '认知':  ['生理状态','感知输入','思考加工','认知决策','趋避决策','表达输出','行动输出'],
  '功能':  ['睡眠功能','观察功能','思考功能','记忆功能','情志功能','表达功能','动作功能'],
  '做功':  ['资源位','市场位','平台位','主体位','意愿位','能力位','执行位'],
  '亲缘':  ['母亲宫位','爷辈宫位','父亲宫位','伴侣宫位','心亲宫位','子女宫位','兄弟宫位'],
  '兴趣':  ['健康兴趣','表演兴趣','研究兴趣','主导兴趣','心理兴趣','输出兴趣','身体兴趣'],
  '场景':  ['支持场景','观摩场景','共事场景','决策场景','趋避场景','表达场景','执行场景'],
  '人设':  ['贵人人设','公众人设','职场人设','主体人设','同道人设','生活人设','搭档人设'],
  '客户':  ['贵人客户','陌生客户','在谈客户','复购客户','铁粉客户','成交客户','陪跑客户'],
  '系统':  ['支持系统','远端系统','上位系统','主体系统','趋避系统','下位系统','执行系统'],
  '关系':  ['贵人宫位','陌人宫位','同事宫位','盟友宫位','同道宫位','朋友宫位','搭档宫位'],
  '圈层':  ['原生供养圈','外部公共圈','组织共事圈','亲密核心圈','喜恶偏好圈','朋友生活圈','身体实践圈'],
  '生理':  ['底层生理稳态宫位','感官输入宫位','认知加工宫位','价值决策与长时记忆宫位','情绪生理宫位','输出与行为组织宫位','身体执行宫位'],
  '记忆':  ['记忆的生理调节条件','感觉记忆','工作记忆','陈述性长时记忆','情绪记忆','记忆提取与输出组织','程序记忆']
};
```

**设计说明**：
- Key 用短名（`'信息'`而非`'信息宫位'`），下拉 option 的 textContent 追加"宫位"后缀，保持 key 简洁
- 数组索引与七柱的对应关系固定，由 `data-gw` 属性做解耦映射（见 §4.1），修改列顺序不影响标签行正确性

### 2.2 索引映射表

```js
// 用于 updateGongWeiTags 中 data-gw → 数组索引的查找
const GW_INDEX = { tai: 0, nian: 1, yue: 2, ri: 3, ming: 4, shi: 5, shen: 6 };
```

---

## 三、DOM 结构变更

### 3.1 视图与表格总览

本功能涉及 **4 种渲染上下文**，每种上下文中各有 **2 张表**（主表 + 三垣表），共需插入 **8 个标签行**：

| 上下文 | 渲染函数 | 主表标签行 class | 三垣表标签行 class | 选择器位置 |
|--------|---------|-----------------|-------------------|-----------|
| 单人排盘 | `renderChart()` | `.gz-tags` | `.gz-tags-sy` | top-bar 内 |
| 同性双胞胎-卡1 | `buildCardHTML()` | `.gz-tags` | `.gz-tags-sy` | bz-twin-tabs 内 |
| 同性双胞胎-卡2 | `buildCardHTML()` | `.gz-tags` | `.gz-tags-sy` | 同上（共用选择器） |
| 龙凤胎-卡1 | `buildCardHTML()` | `.gz-tags` | `.gz-tags-sy` | bz-twin-tabs 内 |
| 龙凤胎-卡2 | `buildCardHTML()` | `.gz-tags` | `.gz-tags-sy` | 同上（共用选择器） |

> **关键**：所有标签行初始 `style="display:none"`，用户选择宫位类型后由 `updateGongWeiTags()` 统一显隐和填充。

### 3.2 单人视图（renderChart）

#### 主表标签行

插入位置：chartRows 数组头部，`<tr class="hd">` 之前。

```html
<tr class="gz-tags" style="display:none">
  <td class="rl"></td>
  <td data-gw="nian"></td>
  <td data-gw="yue"></td>
  <td data-gw="ri"></td>
  <td data-gw="shi"></td>
  <td class="sep"></td>
  <td class="col-ln"></td>
</tr>
```

**改动方式**：在 `renderChart()` 中 `chartRows.push(...)` 之前，`chartRows.unshift(gzTagsRow)`。

#### 三垣表标签行

插入位置：syRows 数组头部，三垣 `<tr class="hd">` 之前。

```html
<tr class="gz-tags-sy" style="display:none">
  <td class="rl"></td>
  <td></td>
  <td data-gw="tai"></td>
  <td data-gw="ming"></td>
  <td data-gw="shen"></td>
  <td class="sep"></td>
  <td class="col-ln"></td>
</tr>
```

**改动方式**：`syRows.unshift(gzTagsSyRow)`。

#### 选择器

插入位置：`top-bar` 内 `btn-simple` 同行。

```html
<select id="gz-select" onchange="updateGongWeiTags(this.value||null)"
  style="font-family:var(--font-display);font-size:13px;padding:4px 8px;
    border:1px solid var(--c-line);border-radius:2px;background:var(--c-paper);
    color:var(--c-ink);cursor:pointer;margin-left:8px;">
  <option value="">无</option>
  <option value="信息">信息宫位</option>
  <option value="认知">认知宫位</option>
  <!-- ... 其余12个 -->
</select>
```

### 3.3 双胞胎卡片（buildCardHTML）

#### 主表标签行

插入位置：`hdr` 之前。当前代码：

```js
return '...<table class="chart">'+hdr+'\n'+rows.main.join('\n')+'</table>...'
```

改为：

```js
var gzTagsMain = '<tr class="gz-tags" style="display:none"><td class="rl"></td><td data-gw="nian"></td><td data-gw="yue"></td><td data-gw="ri"></td><td data-gw="shi"></td>' + (includeLuckCols ? '<td class="sep"></td><td class="col-ln"></td>' : '') + '</tr>';
// ...
return '...<table class="chart">'+gzTagsMain+hdr+'\n'+rows.main.join('\n')+'</table>...'
```

> **条件列处理**：`includeLuckCols` 为 true 时追加 sep + col-ln 空列，与 hdr 列数一致。

#### 三垣表标签行

插入位置：`rows.sanyuan` 数组头部。当前代码直接 join rows.sanyuan。改为：

```js
var gzTagsSy = '<tr class="gz-tags-sy" style="display:none"><td class="rl"></td><td></td><td data-gw="tai"></td><td data-gw="ming"></td><td data-gw="shen"></td>' + (includeLuckCols ? '<td class="sep"></td><td class="col-ln"></td>' : '') + '</tr>';
rows.sanyuan.unshift(gzTagsSy);
```

**注意**：sanyuan 的 `rows.sanyuan[0]` 后续被 `includeLuckCols` 分支覆盖（覆盖的是原 hd 行，标签行在索引 0，hd 变为索引 1）。需确认覆盖逻辑使用的是 `rows.sanyuan[1]` 而非 `rows.sanyuan[0]`。

**代码审查结论**：当前代码中 `includeLuckCols` 分支覆盖的是 `rows.sanyuan[0]`（即 hd 行）和遍历 `si=1..` 添加空列。插入标签行后，原 hd 变为 `rows.sanyuan[1]`，需将覆盖索引同步偏移：

```js
// 改前：
rows.sanyuan[0] = '<tr class="hd">...';
for (var si = 1; si < rows.sanyuan.length; si++) { ... }

// 改后（标签行已在 unshift 时插入索引 0）：
rows.sanyuan[1] = '<tr class="hd">...';  // 原 [0] → [1]
for (var si = 2; si < rows.sanyuan.length; si++) { ... }  // 原 1 → 2
```

#### 选择器

两个 twin 渲染函数（`renderTwinCardsHtml` / `renderLongFengCardsHtml`）中各插入一次选择器，位于 `.bz-twin-tabs` 内。

```html
<div class="bz-twin-tabs">
  <button class="bz-twin-tab active" ...>并排对比</button>
  <button class="bz-twin-tab" ...>仅看老大</button>
  <button class="bz-twin-tab" ...>仅看老二</button>
  <select id="gz-select" onchange="updateGongWeiTags(this.value||null)" style="...margin-left:auto;">...</select>
</div>
```

`.bz-twin-tabs` 已是 flex 容器，`margin-left: auto` 将选择器推到右侧。

---

## 四、JS 函数设计

### 4.1 updateGongWeiTags()

```js
/**
 * 更新所有宫位标签行
 * @param {string|null} type - 宫位类型 key（如 '信息'/'认知'），null 隐藏所有标签行
 */
function updateGongWeiTags(type) {
  var labels = type ? GONGWEI_MAP[type] : null;

  // 显隐所有标签行
  var allTags = document.querySelectorAll('.gz-tags, .gz-tags-sy');
  for (var i = 0; i < allTags.length; i++) {
    allTags[i].style.display = labels ? '' : 'none';
  }
  if (!labels) return;

  // 填充标签文字：通过 data-gw 属性定位列
  var cells = document.querySelectorAll('.gz-tags td[data-gw], .gz-tags-sy td[data-gw]');
  for (var j = 0; j < cells.length; j++) {
    var gw = cells[j].getAttribute('data-gw');
    cells[j].textContent = labels[GW_INDEX[gw]] || '';
  }
}
```

**设计要点**：

1. **`querySelectorAll` 批量操作**：一次调用命中所有表的所有标签行（单人1主+1三垣 = 2行；双胞胎2卡×2表 = 4行；龙凤胎同上），无需区分视图类型
2. **`data-gw` 解耦**：列顺序变更不影响映射正确性。`GW_INDEX` 只定义一次，不随 DOM 结构变化
3. **`style.display` 而非 class toggle**：避免 CSS 优先级冲突（标签行初始 `display:none` 为最高优先级的内联样式）
4. **`textContent` 而非 `innerHTML`**：纯文本赋值，防 XSS，性能更优

### 4.2 选择器 onchange

```html
<select onchange="updateGongWeiTags(this.value||null)">...</select>
```

- `this.value` 为空字符串 `""` 时（选择"无"），`""||null` → `null` → 隐藏标签行
- 选择具体类型时，`this.value` 为 key（如 `"信息"`）→ 查找 `GONGWEI_MAP["信息"]` → 填充标签

### 4.3 精简模式兼容

`toggleSimple()` 函数现有逻辑操作 `data-row-type` 选择器，**不影响** `.gz-tags` / `.gz-tags-sy`（它们没有 `data-row-type` 属性），无需改动。

`_simpleMode` 恢复逻辑（重新排盘时恢复精简状态）同样不受影响。

---

## 五、CSS 样式方案

### 5.1 新增样式

```css
/* ===== v0.7.0 宫位标签行 ===== */
.gz-tags td, .gz-tags-sy td {
  font-family: var(--font-body);
  font-size: 12px;
  color: #8b7e6a;
  background: rgba(201,169,110,.06);
  padding: 4px 3px;
  letter-spacing: .04em;
  border-bottom: 1px dashed var(--c-line);
}
.gz-tags td.rl, .gz-tags-sy td.rl {
  background: transparent;  /* rl 列不覆盖 rgba 底色 */
}
```

### 5.2 长标签防换行

PRD 验收标准 AV03 要求"价值决策与长时记忆宫位"（9字）不换行。在当前 12px 字号 + `table-layout:auto` 布局下，单列宽度由内容撑开，9 字不会换行。**但为防御极端窄屏**，建议给标签 td 加：

```css
.gz-tags td, .gz-tags-sy td {
  white-space: nowrap;
}
```

> 如果编程师担心 nowrap 导致表格撑破，可在窄屏媒体查询中移除 nowrap 或换更小字号。当前 1340px 最大宽度下，7 列 × 9 字 × 12px ≈ 756px，远小于可用宽度，不会溢出。

### 5.3 选择器样式

选择器使用内联样式（与现有 `.btn-simple` 风格一致），不新增 CSS 类。样式要点：
- `font-family: var(--font-display)` — 与排盘字体一致
- `font-size: 13px` — 与 btn-simple 字号一致  
- `border: 1px solid var(--c-line)` — 与输入区控件一致
- 颜色 `var(--c-ink)` / 背景 `var(--c-paper)`

### 5.4 响应式

窄屏（≤900px）时双胞胎卡片变为纵向堆叠（已有 CSS `.bz-twin-cards { flex-direction: column }`）。标签行在堆叠卡片中宽度自适配，无需额外处理。

---

## 六、视图覆盖矩阵

| 验收编号 | 视图类型 | 表数量 | 标签行 class | 更新方式 |
|---------|---------|--------|-------------|---------|
| AC01 | 单人-无选择 | 2（主+三垣） | gz-tags, gz-tags-sy | display:none |
| AC02 | 单人-信息宫位 | 2 | 同上 | display:'' + textContent 填充 |
| AC05 | 单人-精简+功能 | 2 | 同上 | 精简不影响标签行 |
| AC06 | 同性双胞-做功 | 4（2卡×2表） | 同上 | querySelectorAll 批量 |
| AC07 | 龙凤胎-亲缘 | 4 | 同上 | 同 AC06 |
| AC08 | 双胞-仅看老大 | 4（DOM 中存在，CSS 隐藏卡2） | 同上 | 标签行仍在隐藏卡片中更新 |

**验证方法**：`document.querySelectorAll('.gz-tags, .gz-tags-sy').length` 在所有场景下应始终等于 2×卡片数（单人=2，双胞=4）。

---

## 七、改动范围估算

| 位置 | 改动 | 行数 |
|------|------|------|
| `<style>` 区 | 新增 `.gz-tags` / `.gz-tags-sy` 样式 | ~10 |
| JS 全局区 | 新增 `GONGWEI_MAP` + `GW_INDEX` 常量 | ~30 |
| JS 全局区 | 新增 `updateGongWeiTags()` 函数 | ~18 |
| `renderChart()` | 插入主表标签行 + 三垣标签行 + 选择器 HTML | ~8 |
| `buildCardHTML()` | 插入主表标签行 + 三垣标签行（含 sanyuan 索引偏移修正） | ~8 |
| `renderTwinCardsHtml()` | 插入选择器 HTML | ~3 |
| `renderLongFengCardsHtml()` | 插入选择器 HTML | ~3 |
| **总计** | | **~80** |

---

## 八、风险点与注意事项

### R1：buildCardHTML 中 sanyuan 行索引偏移

**风险**：`rows.sanyuan.unshift(gzTagsSy)` 后，原 `rows.sanyuan[0]`（hd 行）变为 `[1]`，后续覆盖代码需同步修改索引。

**当前代码**（standalone.html L2045-2048）：
```js
rows.sanyuan[0] = '<tr class="hd">...';   // 需改为 [1]
for (var si = 1; si < rows.sanyuan.length; si++) { ... }  // 需改为 si=2
```

**严重程度**：中。不改会导致 sanyuan hd 行被覆盖为标签行内容，表头丢失。

**缓解**：代码审查时重点检查此区域。

### R2：龙凤胎卡片的 _cardData 绑定

**风险**：龙凤胎两张卡片的大运表因性别不同而异（`d1.daYun` vs `d2.daYun`），但宫位标签行针对七柱与性别无关，标签内容一致。实现时只需确保 `updateGongWeiTags` 对所有卡片同时操作即可，无需区分卡片。

**严重程度**：低。设计已规避。

### R3：响应式窄屏下的标签行宽度

**风险**：≤900px 时双胞胎卡片纵向堆叠，但单人视图的主表仍为单表 7 列。7 列 × 9 字（最长标签）× 12px ≈ 756px，小于 900px 断点，不会溢出。

**严重程度**：低。加 `white-space: nowrap` 后小于 680px 极窄屏可能溢出，但现有 `min-width: 680px` 已保证表格不缩至此宽度以下。

### R4：innerHTML 替换导致选择器状态丢失

**风险**：切换排盘模式（单人→双胞胎）或重新排盘时，`output.innerHTML` 被整体替换，选择器的选中状态丢失（重置为"无"）。

**影响**：用户体验微瑕——每次重新排盘需重新选择宫位类型。

**决策**：**不处理**。重新排盘本身就是"重置"操作，选择器归零符合用户预期。若未来需要保持选择状态，可在 `doPaipan()` 末尾读取 `gz-select.value` 并在新 DOM 渲染后恢复。

---

## 九、实现顺序建议

1. **CSS**：新增 `.gz-tags` / `.gz-tags-sy` 样式（独立，无依赖）
2. **JS 常量**：`GONGWEI_MAP` + `GW_INDEX`（独立）
3. **JS 函数**：`updateGongWeiTags()`（依赖常量）
4. **单人视图**：`renderChart()` 插入标签行 + 选择器
5. **双胞胎卡片**：`buildCardHTML()` 插入标签行（含索引修正）
6. **双胞胎视图**：两个 twin 渲染函数插入选择器
7. **全量回归测试**：按 PRD 验收标准 AC01-AC09 + AR01-AR05 逐项验证
