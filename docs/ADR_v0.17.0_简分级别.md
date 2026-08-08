# ADR v0.17.0 — 简分级别

> 版本：v0.17.0 | 日期：2026-08-07 | 作者：架构师 (worker_c8e9a019)
> 基于：八字排盘 v0.16.1 (`standalone-split.html` + `render.js` + `main.js`)
> 对应 PRD：`PRD_v0.17.0_简分级别.md`

---

## 一、决策摘要

**结论：可行。** 修改范围限定 `standalone-split.html`（CSS 部分）和 `render.js`（切换函数 + 行序 + data-row-type 映射）+ `main.js`（别名 1 行）。不涉及 `algorithm.js`、`constants.js`、`archive.js`、`gongwei.js`。

核心策略：
- 用 CSS class `level-0/1/2/3` 替代现有 `.simple`，通过四组 `display:none` 规则控制行显隐
- 内存变量 `currentLevel`（0–3 循环），刷新重置为 0，符合 PRD 要求
- `buildPillarRows` 行序调整：纳运从自坐下移至纳音下
- `_applyDLUpdates` 语义映射同步更新，保持大运/流年列点击更新正确

---

## 二、现有代码分析

### 2.1 切换逻辑（render.js 行 191–194）

```javascript
function toggleSimple() {
  const tables = document.querySelectorAll('.chart');
  const btn = document.querySelector('.btn-simple');
  const active = btn.classList.toggle('active');
  tables.forEach(t => t.classList.toggle('simple', active));
}
```

**现状**：二态切换。按钮 `.btn-simple` 的 `active` class 控制自身样式；所有 `.chart` 表格的 `simple` class 控制哪些行隐藏。页面加载时表格默认带 `class="chart simple"`（即简化模式默认开启）。

### 2.2 CSS 显隐规则（standalone-split.html 行 207–211）

```css
.chart.simple tr[data-row-type~="nayin"],
.chart.simple tr[data-row-type~="nayun"],
.chart.simple tr[data-row-type~="kongwang"],
.chart.simple tr[data-row-type~="shensha"] { display:none; }
```

**逻辑**：`.chart.simple` 时隐藏纳音/纳运/空亡/神煞，与按钮激活态绑定。

### 2.3 当前行序（buildPillarRows，四柱区）

```
主星 (rs) → 天干 (rg, ln1) → 地支 (rg, dy2) → 本气/中气/余气 (rh)
→ 纳音 (rn, nayin) → 星运 (rm, xingyun) → 自坐 (rm, zizuo)
→ 纳运 (rm, nayun) → 空亡 (rm, kongwang) → 神煞 (rm, shensha)
```

**三垣区**行序与四柱区一致，只是列数不同（胎/命/身 vs 年/月/日/时）。

### 2.4 单人模式 mainRows 映射（renderChart，行 302–318）

splice(4,2) 删除中气/余气后：

| 索引 | data-row-type | 内容 |
|------|--------------|------|
| [0] | `dy1` | 主星 |
| [1] | `ln1` | 天干 |
| [2] | `dy2` | 地支 |
| [3] | `ln2` | 藏气（合并） |
| [4] | `nayin dy3` | 纳音 |
| [5] | `xingyun ln3` | 星运 |
| [6] | `zizuo dy4` | 自坐 |
| [7] | `nayun dy5` | 纳运 |
| [8] | `kongwang ln4` | 空亡 |
| [9] | `shensha dy6` | 神煞 |

### 2.5 龙凤胎卡片 mainRows 映射（buildCardHTML includeLuckCols=true）

藏干三层完整保留：

| 索引 | data-row-type | 内容 |
|------|--------------|------|
| [0] | `dy1` | 主星 |
| [1] | `ln1` | 天干 |
| [2] | `dy2` | 地支 |
| [3] | `ln2` | 本气 |
| [4] | `dy3` | 中气 |
| [5] | `ln3` | 余气 |
| [6] | `nayin dy4` | 纳音 |
| [7] | `xingyun ln4` | 星运 |
| [8] | `zizuo dy5` | 自坐 |
| [9] | `nayun dy6` | 纳运 |
| [10] | `kongwang ln5` | 空亡 |
| [11] | `shensha dy7` | 神煞 |

### 2.6 _applyDLUpdates 语义映射

**单人模式**（isSingle=true）：
```
dy1→主星, ln1→天干, dy2→地支, ln2→藏气,
dy3→纳音, ln3→星运, dy4→自坐, dy5→纳运, ln4→空亡, dy6→神煞
```

**双胞胎模式**（isSingle=false）：
```
dy1→主星, ln1→天干, dy2→地支,
ln2→本气, dy3→中气, ln3→余气,
dy4→纳音, ln4→星运, dy5→自坐, dy6→纳运, ln5→空亡, dy7→神煞
```

### 2.7 main.js 中的别名（main.js 行 147）

```javascript
var toggleSimple = RENDER.toggleSimple;
```

### 2.8 遗留 _simpleMode 代码

`renderTwinCardsHtml` 和 `renderLongFengCardsHtml` 中存在：
```javascript
if (window._simpleMode) {
    container.querySelectorAll('[data-row-type~="nayin"],[data-row-type~="nayun"],[data-row-type~="kongwang"],[data-row-type~="shensha"]')
        .forEach(function(r){r.style.display='none';});
}
```
这是旧版 inline style 显隐方式，当前实际走 CSS `.chart.simple` 规则，`window._simpleMode` 未在任何地方被赋值。**本版本应删除此死代码。**

### 2.9 按钮 HTML 位置

在 `renderChart()` 和 `renderTwinCardsHtml()`/`renderLongFengCardsHtml()` 的 top-bar 中：
```html
<button class="btn-simple" onclick="RENDER.toggleSimple()" title="精简显示（隐藏纳音/空亡/神煞）">简</button>
```

---

## 三、精确修改方案

### 3.1 CSS（standalone-split.html）

**删除**（行 207–211）：
```css
.chart.simple tr[data-row-type~="nayin"],
.chart.simple tr[data-row-type~="nayun"],
.chart.simple tr[data-row-type~="kongwang"],
.chart.simple tr[data-row-type~="shensha"] { display:none; }
```

**新增**（替代位置）：
```css
/* L0 → 简：仅星运+自坐 */
.chart.level-0 tr[data-row-type~="nayin"],
.chart.level-0 tr[data-row-type~="nayun"],
.chart.level-0 tr[data-row-type~="kongwang"],
.chart.level-0 tr[data-row-type~="shensha"] { display:none; }

/* L1 → 中：隐藏空亡+神煞 */
.chart.level-1 tr[data-row-type~="kongwang"],
.chart.level-1 tr[data-row-type~="shensha"] { display:none; }

/* L2 → 详：仅隐藏神煞 */
.chart.level-2 tr[data-row-type~="shensha"] { display:none; }

/* L3 → 全：无隐藏（空规则块保留以便理解） */
```

### 3.2 render.js — toggleSimple 重写为 toggleLevel

**原函数**（行 191–194）：
```javascript
function toggleSimple() {
  const tables = document.querySelectorAll('.chart');
  const btn = document.querySelector('.btn-simple');
  const active = btn.classList.toggle('active');
  tables.forEach(t => t.classList.toggle('simple', active));
}
```

**替换为**：
```javascript
var _currentLevel = 0;  // 模块级状态变量
var LEVEL_LABELS = ['简','中','详','全'];
var LEVEL_TITLES = [
  '简分级别：仅星运自坐（点击展开）',
  '简分级别：星运自坐纳运纳音（点击展开）',
  '简分级别：星运自坐纳运纳音空亡（点击展开）',
  '简分级别：全部信息（点击收起）'
];

function toggleLevel() {
  _currentLevel = (_currentLevel + 1) % 4;
  var tables = document.querySelectorAll('.chart');
  var btn = document.querySelector('.btn-simple');
  
  // 更新表格 class
  tables.forEach(function(t) {
    t.classList.remove('level-0','level-1','level-2','level-3');
    t.classList.add('level-' + _currentLevel);
  });
  
  // 更新按钮文字和 title（按钮永远激活态）
  if (btn) {
    btn.textContent = LEVEL_LABELS[_currentLevel];
    btn.title = LEVEL_TITLES[_currentLevel];
    btn.classList.add('active');  // 始终激活
  }
}
```

### 3.3 render.js — 按钮初始化

**renderChart() 中**（~行 380）：

原表格：
```html
<table class="chart simple">
```
改为：
```html
<table class="chart level-0">
```

原按钮：
```html
<button class="btn-simple" onclick="RENDER.toggleSimple()" title="精简显示（隐藏纳音/空亡/神煞）">简</button>
```
改为：
```html
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="简分级别：仅星运自坐（点击展开）">简</button>
```

**renderTwinCardsHtml() 和 renderLongFengCardsHtml() 中**：

按钮同上修改；表格从 `class="chart"`（这些卡片当前不带 simple class）改为 `class="chart level-0"`（统一初始状态）。

同时删除两个函数中的 `window._simpleMode` 死代码块。

### 3.4 render.js — buildPillarRows 行序调整

**四柱区** — 调整纳运行位置：当前在自坐之后，改为纳音之后、星运之前。

目标行序：
```
… → 纳音 (nayin) → 纳运 (nayun) → 星运 (xingyun) → 自坐 (zizuo) → 空亡 (kongwang) → 神煞 (shensha)
```

具体改动：将纳运的 push 语句从自坐之后移到纳音之后。四柱区和三垣区同时调整。

**改动前**（四柱区）：
```javascript
// 纳音
main.push('<tr class="rn" data-row-type="nayin">' + ...);
// 星运
main.push('<tr class="rm" data-row-type="xingyun">' + ...);
// 自坐
main.push('<tr class="rm" data-row-type="zizuo">' + ...);
// 纳运
main.push('<tr class="rm" data-row-type="nayun">' + ...);
```

**改动后**（四柱区）：
```javascript
// 纳音
main.push('<tr class="rn" data-row-type="nayin">' + ...);
// 纳运 ← 从自坐下移至此
main.push('<tr class="rm" data-row-type="nayun">' + ...);
// 星运
main.push('<tr class="rm" data-row-type="xingyun">' + ...);
// 自坐
main.push('<tr class="rm" data-row-type="zizuo">' + ...);
```

三垣区同理。

### 3.5 render.js — renderChart mainRows 行序 + data-row-type 调整

行序变更后，单人模式 mainRows 的索引和 data-row-type 需调整：

**改动后**（splice(4,2) 之后）：

| 索引 | data-row-type | 内容 |
|------|--------------|------|
| [0] | `dy1` | 主星 |
| [1] | `ln1` | 天干 |
| [2] | `dy2` | 地支 |
| [3] | `ln2` | 藏气 |
| [4] | `nayin dy3` | 纳音 |
| [5] | `nayun dy4` | **纳运** ← 从索引7移到5 |
| [6] | `xingyun ln3` | 星运 ← 从索引5移到6 |
| [7] | `zizuo dy5` | 自坐 ← 从索引6移到7，dy4→dy5 |
| [8] | `kongwang ln4` | 空亡 |
| [9] | `shensha dy6` | 神煞 |

**具体代码改动**：

- `mainRows[5]`（原星运 `xingyun ln3`）→ 改为纳运 `nayun dy4`
- `mainRows[6]`（原自坐 `zizuo dy4`）→ 改为星运 `xingyun ln3`
- `mainRows[7]`（原纳运 `nayun dy5`）→ 改为自坐 `zizuo dy5`

⚠️ **注意**：data-row-type 中的 dy/ln 标记含义是「此行的第5列大运列标记」和「此行的第6列流年列标记」，用于 `_applyDLUpdates` 的 `getRow(type)` 定位。行序变后，只需保证每行的 dyN/lnN 与 `_applyDLUpdates` 中的映射一致即可。

### 3.6 render.js — buildCardHTML mainRows 调整

龙凤胎卡片（includeLuckCols=true）的 mainRows 同样需要调整：

**改动后**：

| 索引 | data-row-type | 内容 |
|------|--------------|------|
| [6] | `nayin dy4` | 纳音 |
| [7] | `nayun dy5` | **纳运** ← 从索引9移到7，dy6→dy5 |
| [8] | `xingyun ln4` | 星运 ← 从索引7移到8 |
| [9] | `zizuo dy6` | 自坐 ← 从索引8移到9，dy5→dy6 |
| [10] | `kongwang ln5` | 空亡 |
| [11] | `shensha dy7` | 神煞 |

### 3.7 render.js — _applyDLUpdates 语义映射调整

由于 data-row-type 中的 dy/ln 编号变了，`_applyDLUpdates` 需要对应更新：

**单人模式**（isSingle=true），改动后：
```javascript
updates = [
  ['dy1', pDy.rs, pLn.rs],
  ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
  ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
  ['ln2', pDy.cg, pLn.cg],
  ['dy3', pDy.ny, pLn.ny],        // nayin — 不变
  ['dy4', pDy.nayun, pLn.nayun],  // nayun — 从 dy5→dy4（因为行序上移到纳音之后）
  ['ln3', pDy.xy, pLn.xy],        // xingyun — 不变
  ['dy5', pDy.zz, pLn.zz],        // zizuo — 从 dy4→dy5（因为被纳运占用了 dy4）
  ['ln4', pDy.kw, pLn.kw],        // kongwang — 不变
  ['dy6', pDy.sh, pLn.sh]         // shensha — 不变
];
```

⚠️ **关键变更**：
- 纳运从 `dy5` 变为 `dy4`（行序上移）
- 自坐从 `dy4` 变为 `dy5`（行序下移，编号被纳运占用后顺延）

**双胞胎模式**（isSingle=false），改动后：
```javascript
updates = [
  ['dy1', pDy.rs, pLn.rs],
  ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
  ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
  ['ln2', fmtCGLayer((pDy.ly||[])[0]), fmtCGLayer((pLn.ly||[])[0])],
  ['dy3', fmtCGLayer((pDy.ly||[])[1]), fmtCGLayer((pLn.ly||[])[1])],
  ['ln3', fmtCGLayer((pDy.ly||[])[2]), fmtCGLayer((pLn.ly||[])[2])],
  ['dy4', pDy.ny, pLn.ny],        // nayin — 不变
  ['dy5', pDy.nayun, pLn.nayun],  // nayun — 从 dy6→dy5
  ['ln4', pDy.xy, pLn.xy],        // xingyun — 不变
  ['dy6', pDy.zz, pLn.zz],        // zizuo — 从 dy5→dy6
  ['ln5', pDy.kw, pLn.kw],        // kongwang — 不变
  ['dy7', pDy.sh, pLn.sh]         // shensha — 不变
];
```

### 3.8 main.js — 别名更新

**行 147**：
```javascript
// 改前
var toggleSimple = RENDER.toggleSimple;
// 改后
var toggleLevel = RENDER.toggleLevel;
```

### 3.9 RENDER 挂载更新（render.js 末尾）

```javascript
window.RENDER = {
  toggleLevel: toggleLevel,  // ← toggleSimple → toggleLevel
  // ... 其余不变
};
```

---

## 四、风险矩阵

| 风险 | 等级 | 说明 | 缓解 |
|------|:----:|------|------|
| 行序变更导致 _applyDLUpdates 映射断裂 | **中** | dy/ln 编号变更涉及 2 张映射表（单人 + 双胞胎），遗漏任何一处会导致大运/流年点击更新错列 | 逐行对照变更，测试时覆盖：单人排盘 → 点击大运/流年 → 验证各列数据正确 |
| 龙凤胎卡片 mainRows 行序遗漏 | **中** | buildCardHTML 与 renderChart 的 mainRows 各自独立维护，需分别修改 | 明确 diff：buildCardHTML 有藏干三层（11行扩展列），renderChart 藏气合并（9行扩展列），两份代码并行修改 |
| CSS class `.simple` 残留 | **低** | 若某处表格未改为 `level-0`，该表格的层级切换将无效 | grep 全局搜索 `.simple`，确保无遗漏；搜索 `toggleSimple` 确保无残留调用 |
| 刷新后层级重置 | **低** | 内存变量 `_currentLevel` 在页面刷新后归零，符合 PRD 要求 | 不需要缓解，这是预期行为 |
| 连续快速点击丢状态 | **低** | `_currentLevel = (_currentLevel + 1) % 4` 是原子操作，JS 单线程不丢 | 无需缓解 |
| 三垣区收起/展开与层级切换冲突 | **低** | 三垣折叠由 `.collapsed` 控制、层级由 `.level-N` 控制，互不干扰 | 验证：在 L0 下展开三垣 → 三垣表也应为 L0（仅星运+自坐可见） |
| `window._simpleMode` 死代码 | **极低** | 当前无赋值源，删除不影响功能 | 一并清理 |

---

## 五、层级状态存储方案

### 决策：内存变量（`var _currentLevel`）

**理由**：
1. **与 PRD 一致**：PRD 明确「刷新页面后重置为 L0」，无需持久化
2. **简单可靠**：单变量 0–3 循环，无序列化/反序列化开销，无 localStorage 跨标签同步问题
3. **与现有架构一致**：当前 `toggleSimple` 也是纯内存状态（按钮 class + 表格 class），不持久化
4. **无副作用**：不同档案/排盘之间不共享层级状态，每次排盘重新渲染时表格 class 由 HTML 模板决定（初始 `level-0`），与 `_currentLevel` 无关

### 不考虑 localStorage 的权衡

| 维度 | 内存变量 | localStorage |
|------|:--------:|:------------:|
| 刷新保持 | ✗（符合 PRD） | ✓（违反 PRD） |
| 实现复杂度 | 极简 | 需序列化+读取+默认值 |
| 跨标签一致 | 不需考虑 | 需监听 storage 事件 |
| 与现有代码一致 | ✓ | ✗ |

**结论**：内存变量是正确选择。未来如需持久化（如用户偏好设置），可在 `_currentLevel` 赋值处加一行 `localStorage.setItem('bazi-level', _currentLevel)` 即可，不影响现有架构。

---

## 六、影响范围汇总

| 文件 | 改动量 | 改动内容 |
|------|:------:|----------|
| `standalone-split.html` | ~15 行 | 删除旧 CSS `.chart.simple …`，新增四组 `.chart.level-0/1/2/3` 规则 |
| `render.js` | ~80 行 | toggleSimple→toggleLevel、buildPillarRows 行序、renderChart mainRows、buildCardHTML mainRows、_applyDLUpdates 映射、按钮 HTML、RENDER 挂载、删除 _simpleMode 死代码 |
| `main.js` | 1 行 | `toggleSimple` → `toggleLevel` 别名 |
| `algorithm.js` | 0 | 无改动 |
| `constants.js` | 0 | 无改动 |
| `archive.js` | 0 | 无改动 |
| `gongwei.js` | 0 | 无改动 |

---

## 七、测试要点（供测试师参考）

1. **层级切换**：L0→L1→L2→L3→L0 循环，按钮文字同步变化
2. **默认状态**：页面首次加载 / 排盘后，默认 L0，仅星运+自坐可见
3. **纳运行位置**：始终紧挨纳音行下方（四柱区 + 三垣区）
4. **单人模式**：大运/流年列数据在层级切换后点击更新正确（验证所有 dy/ln 列的纳音/纳运/星运/自坐/空亡/神煞）
5. **龙凤胎双卡**：两张卡片四柱表同步切换层级；大运流年点击更新各自卡片列数据正确
6. **三垣区**：展开三垣后，层级切换同步生效
7. **刷新重置**：刷新页面 → 回到 L0
8. **宫位标签行**：始终显示，不受层级影响
