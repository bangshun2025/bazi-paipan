# ADR v0.18.0 — 简0级别与三垣间隔

> 版本：v0.18.0 | 日期：2026-08-08 | 作者：架构师 (worker_127d70f0)
> 基于：八字排盘 v0.17.0（`standalone-split.html` + `render.js` + `main.js`）
> 对应 PRD：`PRD_v0.18.0_简0级别与三垣间隔.md`

---

## 一、决策摘要

**结论：可行。** 修改范围限定 `standalone-split.html`（CSS 部分）和 `render.js`（toggleLevel 函数 + 按钮文字 + 分隔行插入 + 龙凤胎 CSS）+ `main.js`（无需改动，别名已为 `toggleLevel`）。不涉及 `algorithm.js`、`constants.js`、`archive.js`、`gongwei.js`。

核心策略：
- **简0级别**：4 级→5 级循环，`LEVEL_LABELS`/`LEVEL_TITLES` 各 +1 项，CSS 从 4 组 `.level-0/1/2/3` 扩展为 5 组 `.level-0/1/2/3/4`，toggleLevel 中 `% 4` → `% 5`
- **三垣间隔**：单人 renderChart 在 mainRows 和 syRows 之间插入独立 `<tr class="sanyuan-sep">`（无 data-row-type，不受层级 CSS 影响）；龙凤胎 buildCardHTML 在 `.bz-sanyuan-area` 上加 `margin-top: 0.75em`
- **附带修复**：v0.17.0 遗留的 buildPillarRows 三垣区重复纳运行 bug

---

## 二、现有代码分析

### 2.1 切换逻辑（render.js 行 189–213）

```javascript
var _currentLevel = 0;
var LEVEL_LABELS = ['简','中','详','全'];
var LEVEL_TITLES = [
  '简分级别：仅星运自坐（点击展开）',
  '简分级别：星运自坐纳运纳音（点击展开）',
  '简分级别：星运自坐纳运纳音空亡（点击展开）',
  '简分级别：全部信息（点击收起）'
];

function toggleLevel() {
  _currentLevel = (_currentLevel + 1) % 4;  // ← 改为 % 5
  // ... 更新 table class 和按钮文字
}
```

### 2.2 CSS 层级规则（standalone-split.html 行 209–222）

```css
/* 简分级别：四层级循环切换 L0(简)→L1(中)→L2(详)→L3(全) */
/* L0: 仅星运+自坐 */
.chart.level-0 tr[data-row-type~="nayin"],
.chart.level-0 tr[data-row-type~="nayun"],
.chart.level-0 tr[data-row-type~="kongwang"],
.chart.level-0 tr[data-row-type~="shensha"] { display:none; }
/* L1: 隐藏空亡+神煞 */
.chart.level-1 tr[data-row-type~="kongwang"],
.chart.level-1 tr[data-row-type~="shensha"] { display:none; }
/* L2: 仅隐藏神煞 */
.chart.level-2 tr[data-row-type~="shensha"] { display:none; }
/* L3: 全部显示（无隐藏规则） */
```

### 2.3 按钮初始化位置（render.js）

三个渲染入口的按钮和表格初始 class：

| 入口 | 行号 | 按钮文字 | 表格 class |
|------|:----:|----------|-----------|
| `renderChart()` | 548/554 | 「简」 | `level-0` |
| `renderTwinCardsHtml()` | ~1109 | 「简」 | `level-0`（buildCardHTML 内） |
| `renderLongFengCardsHtml()` | ~1250 | 「简」 | `level-0`（buildCardHTML 内） |

### 2.4 三垣行拼接位置（render.js 行 438–440）

```javascript
chartRows.push.apply(chartRows, mainRows);  // 行 438：四柱数据行结束

// 三垣行                    ← 行 440：分隔行应插入此处
var syRows = [];
syRows.push('<tr class="hd">'+th('rl','三垣')+...);  // 三垣表头
```

### 2.5 buildCardHTML 三垣区域（render.js 行 954）

```html
<div class="bz-sanyuan-area">
  <table class="chart level-0" style="margin-top:0;border-top:1px solid var(--bz-card-border);">
    ...三垣行...
  </table>
</div>
```

`margin-top:0` 当前紧贴四柱表。

### 2.6 v0.17.0 遗留 Bug：buildPillarRows 三垣区重复纳运

在 `buildPillarRows()` 的三垣区中，纳运行出现了两次：

```
纳音 → 纳运(v0.17.0 新位置) → 星运 → 自坐 → 纳运(旧位置) → 空亡 → 神煞
                                                              ↑ 冗余
```

第一次（行 ~281）是 v0.17.0 行序调整时正确前移的；第二次（行 ~295）是旧代码未删除。**本版本一并修复**，删除第二次出现的冗余纳运行。

> 注：此 bug 不影响 `renderChart()`（该函数使用独立的 syRows 构建），但影响 `buildCardHTML()` 的龙凤胎卡片三垣区（使用 `bp.sanyuan`）。

### 2.7 main.js 别名（main.js 行 147）

```javascript
var toggleLevel = RENDER.toggleLevel;
```

已为 `toggleLevel`，v0.18.0 无需改动。

---

## 三、精确修改方案

### 3.1 standalone-split.html — CSS 层级规则（替换）

**删除**（行 209–222，v0.17.0 的四组规则）：
```css
/* 简分级别：四层级循环切换 L0(简)→L1(中)→L2(详)→L3(全) */
/* L0: 仅星运+自坐 */
.chart.level-0 tr[data-row-type~="nayin"],
.chart.level-0 tr[data-row-type~="nayun"],
.chart.level-0 tr[data-row-type~="kongwang"],
.chart.level-0 tr[data-row-type~="shensha"] { display:none; }
/* L1: 隐藏空亡+神煞 */
.chart.level-1 tr[data-row-type~="kongwang"],
.chart.level-1 tr[data-row-type~="shensha"] { display:none; }
/* L2: 仅隐藏神煞 */
.chart.level-2 tr[data-row-type~="shensha"] { display:none; }
/* L3: 全部显示（无隐藏规则） */
```

**新增**（替代位置）：
```css
/* 简分级别：五层级循环切换 L0(极简)→L1(简)→L2(中)→L3(详)→L4(全) */

/* L0 → 极简：隐藏所有扩展信息行 */
.chart.level-0 tr[data-row-type~="xingyun"],
.chart.level-0 tr[data-row-type~="zizuo"],
.chart.level-0 tr[data-row-type~="nayin"],
.chart.level-0 tr[data-row-type~="nayun"],
.chart.level-0 tr[data-row-type~="kongwang"],
.chart.level-0 tr[data-row-type~="shensha"] { display:none; }

/* L1 → 简：隐藏纳音/纳运/空亡/神煞（仅星运+自坐可见） */
.chart.level-1 tr[data-row-type~="nayin"],
.chart.level-1 tr[data-row-type~="nayun"],
.chart.level-1 tr[data-row-type~="kongwang"],
.chart.level-1 tr[data-row-type~="shensha"] { display:none; }

/* L2 → 中：隐藏空亡+神煞 */
.chart.level-2 tr[data-row-type~="kongwang"],
.chart.level-2 tr[data-row-type~="shensha"] { display:none; }

/* L3 → 详：仅隐藏神煞 */
.chart.level-3 tr[data-row-type~="shensha"] { display:none; }

/* L4 → 全：无隐藏（空规则块保留以便理解） */
```

### 3.2 standalone-split.html — 三垣分隔行与龙凤胎间距（新增）

在层级规则之后新增：

```css
/* 四柱-三垣分隔行 */
tr.sanyuan-sep { height: 0.75em; }
tr.sanyuan-sep td { padding: 0; border-bottom: 2px solid var(--c-line); }

/* 龙凤胎卡片三垣区间距 */
.bz-twin-card .bz-sanyuan-area { margin-top: 0.75em; }
```

### 3.3 render.js — toggleLevel 函数（行 189–213）

**改动点**：
1. `_currentLevel` 初始值保持 `0`（语义变为「极简」）
2. `LEVEL_LABELS` 从 4 项扩展为 5 项
3. `LEVEL_TITLES` 从 4 项扩展为 5 项
4. `% 4` → `% 5`
5. classList.remove 增加 `'level-4'`

**替换为**：
```javascript
var _currentLevel = 0;
var LEVEL_LABELS = ['极简','简','中','详','全'];
var LEVEL_TITLES = [
  '简分级别：仅四柱干支骨架（点击展开）',
  '简分级别：星运自坐（点击展开）',
  '简分级别：星运自坐纳运纳音（点击展开）',
  '简分级别：星运自坐纳运纳音空亡（点击展开）',
  '简分级别：全部信息（点击收起）'
];

function toggleLevel() {
  _currentLevel = (_currentLevel + 1) % 5;
  var tables = document.querySelectorAll('.chart');
  var btn = document.querySelector('.btn-simple');
  
  tables.forEach(function(t) {
    t.classList.remove('level-0','level-1','level-2','level-3','level-4');
    t.classList.add('level-' + _currentLevel);
  });
  
  if (btn) {
    btn.textContent = LEVEL_LABELS[_currentLevel];
    btn.title = LEVEL_TITLES[_currentLevel];
    btn.classList.add('active');
  }
}
```

### 3.4 render.js — renderChart 分隔行插入（行 438 之后）

**行 438** `chartRows.push.apply(chartRows, mainRows);` 之后，**行 440** syRows 之前，插入：

```javascript
// 四柱-三垣分隔行
chartRows.push('<tr class="sanyuan-sep"><td colspan="7"></td></tr>');
```

> colspan="7" 覆盖：盘式 + 年/月/日/时 + 大运 + 流年，共 7 列。

### 3.5 render.js — renderChart 按钮文字（行 548–549）

```html
<!-- 改前 -->
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="简分级别：仅星运自坐（点击展开）">简</button>
<!-- 改后 -->
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="简分级别：仅四柱干支骨架（点击展开）">极简</button>
```

### 3.6 render.js — buildCardHTML 三垣区间距（行 954）

```html
<!-- 改前 -->
<div class="bz-sanyuan-area"><table class="chart level-0" style="margin-top:0;border-top:1px solid var(--bz-card-border);">
<!-- 改后 -->
<div class="bz-sanyuan-area"><table class="chart level-0" style="border-top:1px solid var(--bz-card-border);">
```

`margin-top:0` 移除，改为由 CSS 规则 `.bz-twin-card .bz-sanyuan-area { margin-top: 0.75em; }` 统一控制（见 3.2）。

### 3.7 render.js — renderTwinCardsHtml / renderLongFengCardsHtml 按钮文字

两处按钮与 renderChart 相同，均从：

```html
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="简分级别：仅星运自坐（点击展开）">简</button>
```

改为：

```html
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="简分级别：仅四柱干支骨架（点击展开）">极简</button>
```

### 3.8 render.js — buildPillarRows 三垣区冗余纳运修复（Bug Fix）

**删除**三垣区中第二次出现的纳运行（在自坐行之后、空亡行之前），保留第一次（纳音之后、星运之前）。

改动前（三垣区）：
```javascript
    sanyuan.push('<tr class="rn" data-row-type="nayin">' + rl('纳音') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') + emp('') + ...);  // ← 保留（纳音后）
    sanyuan.push('<tr class="rm" data-row-type="xingyun">' + rl('星运') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') + emp('') + ...);  // ← 删除（冗余）
    sanyuan.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') + emp('') + ...);
```

改动后：
```javascript
    sanyuan.push('<tr class="rn" data-row-type="nayin">' + rl('纳音') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="xingyun">' + rl('星运') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') + emp('') + ...);
    sanyuan.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') + emp('') + ...);
```

### 3.9 不影响的部分

- `buildPillarRows()` — 四柱区行序不变（v0.17.0 已调整完毕）
- `_applyDLUpdates()` — dy/ln 映射不变（v0.17.0 已调整完毕）
- `renderChart()` 的 mainRows 索引 — 不变
- `buildCardHTML()` 的 mainRows 索引 — 不变
- `main.js` — 别名已为 `toggleLevel`，无需改动
- `algorithm.js`、`constants.js`、`archive.js`、`gongwei.js` — 无改动

---

## 四、风险矩阵

| 风险 | 等级 | 说明 | 缓解 |
|------|:----:|------|------|
| CSS 层级规则数组越界 | **中** | v0.17.0 只有 `.level-0/1/2/3` 四组规则；v0.18.0 新增 `.level-4` 时，若 toggleLevel 先更新为 5 级循环但 CSS 未同步更新，点击到 L4 后无对应隐藏规则（预期行为：L4 无隐藏，恰为空规则），不构成功能 bug | 确认 CSS 五组规则与 `% 5` 同步上线，L4 显式写空注释块 |
| 默认 L0 语义变化 | **中** | 页面加载时 `table class="level-0"`，旧含义「简：仅星运自坐」，新含义「极简：无扩展信息」。用户首次打开时看到的行数减少两行（星运+自坐也隐藏），可能以为出 bug | 按钮文字「极简」明确传达当前状态；title 属性说明「仅四柱干支骨架」 |
| 龙凤胎卡片三垣区间距叠加 | **低** | `.bz-sanyuan-area` 原来 `margin-top:0` + `border-top:1px`；改为 CSS `margin-top: 0.75em` 后需确认不和 `.chart-wrap` 底部 margin 叠加 | 两个元素是兄弟节点（`chart-wrap` 和 `.bz-sanyuan-area`），margin 不会 collapse（它们之间有 border-top 阻隔） |
| 分隔行被宫位标签插入破坏 | **低** | 宫位标签行由 `updateGongWeiTags()` 动态插入，若选择器匹配到 `.sanyuan-sep` 之前/之后可能出错 | `sanyuan-sep` 在 chartRows 数组中的位置固定（mainRows 之后、syRows 之前），宫位标签插入逻辑基于 data-row-type 选择器，不依赖行索引 |
| buildPillarRows 三垣区冗余行修复遗漏 | **低** | 修复只影响 `buildCardHTML()` 的龙凤胎三垣区，`renderChart()` 使用独立的 syRows 不受影响 | grep 确认三垣区 nayun 出现次数从 2→1 |
| 连续快速点击 | **极低** | `% 5` 原子操作，不受影响 | 无需缓解 |
| 刷新后层级重置 | **极低** | `_currentLevel = 0` 在页面刷新后归零，符合 PRD | 无需缓解 |

---

## 五、层级状态存储方案

延续 v0.17.0 的内存变量方案，不变。

| 维度 | 内存变量 |
|------|:--------:|
| 刷新保持 | ✗（符合 PRD：刷新回 L0 极简） |
| 实现复杂度 | 极简 |
| 与现有代码一致 | ✓ |

---

## 六、影响范围汇总

| 文件 | 改动量 | 改动内容 |
|------|:------:|----------|
| `standalone-split.html` | ~25 行 | 删除旧 4 组 CSS 规则，新增 5 组 `.level-0/1/2/3/4` 规则 + 分隔行样式 + 龙凤胎间距样式 |
| `render.js` | ~25 行 | toggleLevel: `%4→%5`、LABELS/TITLES 扩展、classList.remove 增加 level-4；renderChart 插入分隔行；三处按钮文字「简→极简」；buildPillarRows 删除冗余纳运行；buildCardHTML 移除 inline margin-top |
| `main.js` | 0 | 无需改动（别名已为 `toggleLevel`） |
| `algorithm.js` | 0 | 无改动 |
| `constants.js` | 0 | 无改动 |
| `archive.js` | 0 | 无改动 |
| `gongwei.js` | 0 | 无改动 |

---

## 七、测试要点（供测试师参考）

1. **默认 L0 极简**：页面加载后，仅四柱干支骨架可见（主星/天干/地支/藏气/纳音），星运/自坐/纳运/空亡/神煞均不可见。按钮显示「极简」。
2. **L0→L1**：点击「极简」→ 星运+自坐出现，按钮「简」。
3. **L1→L2**：点击「简」→ 纳运+纳音（纳音本就在，确认纳运出现），按钮「中」。
4. **L2→L3**：点击「中」→ 空亡出现，按钮「详」。
5. **L3→L4**：点击「详」→ 神煞出现，按钮「全」。
6. **L4→L0**：点击「全」→ 回到极简，按钮「极简」。
7. **连续快点**：5 次点击完成一个完整循环。
8. **四柱-三垣分隔**：单人排盘中，四柱最后一行与三垣表头之间有 ~0.75em 间隔，底部带分隔线。
9. **分隔稳定性**：在 L4（全）状态切换层级，分隔行始终可见（无 data-row-type，不受层级规则影响）。
10. **龙凤胎卡片间隔**：卡片内四柱表和 `.bz-sanyuan-area` 之间有 ≥0.75em 间距。
11. **龙凤胎三垣无重复纳运**：三垣区仅出现一次纳运行（在纳音后、星运前）。
12. **刷新重置**：刷新页面 → 回到 L0 极简。
13. **三垣展开后层级同步**：展开三垣后，三垣内扩展信息行显隐与四柱区同步。

---

## 八、目标文件信息

| 文件 | 当前版本 | 目标版本 | 路径 |
|------|:--------:|:--------:|------|
| `standalone-split.html` | v0.17.0 | v0.18.0 | `~/.clacky/ext/local/bazi-paipan/standalone-split.html` |
| `render.js` | v0.17.0 | v0.18.0 | `~/.clacky/ext/local/bazi-paipan/render.js` |
| `main.js` | v0.17.0 | v0.18.0（无改动） | `~/.clacky/ext/local/bazi-paipan/main.js` |
