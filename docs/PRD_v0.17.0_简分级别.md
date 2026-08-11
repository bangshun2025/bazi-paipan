# PRD v0.17.0 — 简分级别

> 版本：v0.17.0 | 日期：2026-08-07 | 作者：产品经理 (worker_318d0dff)
> 基于：八字排盘 v0.16.1 (`standalone-split.html` + `render.js`)

---

## 一、需求概述

八字排盘当前所有扩展信息（星运、自坐、纳运、纳音、空亡、神煞）一次性展示。邦顺希望增加「简分级别」按钮，让用户逐层展开信息，从简到详，按需查看。

核心改动：**将现有的二态「精简/完整」切换，升级为四层级循环切换。**

---

## 二、功能描述

### 2.1 层级定义

| 层级 | 按钮文字 | 显示内容 |
|------|----------|----------|
| L0（默认） | 简 | 星运、自坐 |
| L1 | 中 | 星运、自坐、纳运、纳音 |
| L2 | 详 | 星运、自坐、纳运、纳音、空亡 |
| L3 | 全 | 全部（含神煞） |

> 每点击一次按钮，层级 +1；L3 后再点回到 L0，循环。

### 2.2 层级对照表（以 data-row-type 标记的行）

| data-row-type | 中文名 | L0 | L1 | L2 | L3 |
|---------------|--------|:--:|:--:|:--:|:--:|
| `xingyun` | 星运 | ✓ | ✓ | ✓ | ✓ |
| `zizuo` | 自坐 | ✓ | ✓ | ✓ | ✓ |
| `nayun` | 纳运 | ✗ | ✓ | ✓ | ✓ |
| `nayin` | 纳音 | ✗ | ✓ | ✓ | ✓ |
| `kongwang` | 空亡 | ✗ | ✗ | ✓ | ✓ |
| `shensha` | 神煞 | ✗ | ✗ | ✗ | ✓ |

### 2.3 纳运行位置调整

**当前行序（四柱区 + 三垣区）：**

```
… → 纳音 (nayin) → 星运 (xingyun) → 自坐 (zizuo) → 纳运 (nayun) → 空亡 (kongwang) → 神煞 (shensha)
```

**目标行序：**

```
… → 纳音 (nayin) → 纳运 (nayun) → 星运 (xingyun) → 自坐 (zizuo) → 空亡 (kongwang) → 神煞 (shensha)
```

纳运从「自坐下方」移至「纳音下方」，逻辑上纳运（纳音五行十二长生）紧跟在纳音之后，更符合信息层次。

> ⚠️ 此调整同时影响四柱区、三垣区、龙凤胎卡片、以及 `_applyDLUpdates` 中的 data-row-type 语义选择器映射。

---

## 三、交互流程

```
用户进入页面 → 默认 L0，按钮显示"简"
    │
    ├── 点击按钮 → L1，按钮变为"中"，纳音+纳运行显示
    │
    ├── 再点击 → L2，按钮变为"详"，空亡行显示
    │
    ├── 再点击 → L3，按钮变为"全"，神煞行显示
    │
    └── 再点击 → 回到 L0，按钮恢复"简"
```

- 点击即时生效，无需确认。
- 同一页面内的所有 `.chart` 表格同步切换（四柱表 + 三垣表 + 龙凤胎双卡）。
- 刷新页面后重置为 L0。

---

## 四、UI 规格

### 4.1 按钮

- **位置**：排盘界面顶部栏右侧，「宫位」按钮左侧（保持现有位置不变）。
- **样式**：沿用现有 `.btn-simple` 基础样式（`font-family: var(--font-display)`, `font-size: 13px`, `padding: 4px 10px`, `border: 1px solid var(--c-line)` 等）。
- **文字**：L0→「简」, L1→「中」, L2→「详」, L3→「全」。
- **激活态**：`background: var(--c-ink); color: var(--c-paper)` — 始终激活（因为始终有一个层级生效），与当前 `.btn-simple.active` 行为一致。
- **title 属性**：随层级变化，如 L0:「简分级别：仅星运自坐（点击展开）」, L3:「简分级别：全部信息（点击收起）」。

### 4.2 表格

- 所有 `.chart` 表格增加 `level-N` CSS class（替代现有 `.simple`），用于控制行显隐。
- 宫位标签行、四柱基础行（主星/天干/地支/藏干）**不受层级影响**，始终显示。

### 4.3 CSS 变更

**删除：**
```css
.chart.simple tr[data-row-type~="nayin"],
.chart.simple tr[data-row-type~="nayun"],
.chart.simple tr[data-row-type~="kongwang"],
.chart.simple tr[data-row-type~="shensha"] { display:none; }
```

**新增：**
```css
/* L0: 隐藏纳音/纳运/空亡/神煞 */
.chart.level-0 tr[data-row-type~="nayin"],
.chart.level-0 tr[data-row-type~="nayun"],
.chart.level-0 tr[data-row-type~="kongwang"],
.chart.level-0 tr[data-row-type~="shensha"] { display:none; }

/* L1: 隐藏空亡/神煞 */
.chart.level-1 tr[data-row-type~="kongwang"],
.chart.level-1 tr[data-row-type~="shensha"] { display:none; }

/* L2: 仅隐藏神煞 */
.chart.level-2 tr[data-row-type~="shensha"] { display:none; }

/* L3: 无隐藏 */
```

---

## 五、代码影响范围

### 5.1 `standalone-split.html`

| 位置 | 改动 |
|------|------|
| CSS `.chart.simple …`（行 207-211） | 替换为 `.chart.level-0/1/2/3` 四组规则 |
| 无 HTML 直接改动 | 按钮在 JS 中动态生成 |

### 5.2 `render.js`

| 函数/位置 | 改动说明 |
|-----------|----------|
| `toggleSimple()`（行 191-194） | **重写为 `toggleLevel()`**：内部维护 `currentLevel` 状态变量（0-3 循环），更新所有 `.chart` 的 `level-N` class，更新按钮文字及 title |
| `renderChart()` 中的按钮（行 ~380） | `<button class="btn-simple" onclick="RENDER.toggleSimple()">` → `onclick="RENDER.toggleLevel()"`，默认文字从「简」开始 |
| `renderChart()` 中的 `<table class="chart simple">` | `simple` → `level-0` |
| `buildPillarRows()` — 四柱区行序（行 231-235） | 纳运行（nayun）从自坐之后移至纳音之后：纳音 → 纳运 → 星运 → 自坐 → 空亡 → 神煞 |
| `buildPillarRows()` — 三垣区行序（行 252-258） | 同上调整 |
| `renderChart()` — 单人模式行索引（行 302-318） | 因 row 顺序变化，需更新 `mainRows[4]~[9]` 的 data-row-type 标注及索引（第5行纳音→第4行纳音、第5行纳运、第6行星运…）同时更新 `_applyDLUpdates` 中单人模式映射 |
| `buildCardHTML()` — 龙凤胎卡片行序（行 ~500+） | `rows.main[6]~[11]` 索引和 data-row-type 需对应调整 |

### 5.3 `main.js`

| 位置 | 改动 |
|------|------|
| 行 147：`var toggleSimple = RENDER.toggleSimple;` | 改为 `var toggleLevel = RENDER.toggleLevel;` |

### 5.4 `_applyDLUpdates` 函数（render.js）

此函数通过 `data-row-type` 语义选择器定位行来更新大运/流年列数据。单人模式下的映射：

```
当前：dy1(主星) ln1(天干) dy2(地支) ln2(藏气) dy3(纳音) ln3(星运) dy4(自坐) dy5(纳运) ln4(空亡) dy6(神煞)
目标：dy1(主星) ln1(天干) dy2(地支) ln2(藏气) dy3(纳音) dy4(纳运) ln3(星运) dy4(自坐) ln4(空亡) dy5(神煞)
```

> ⚠️ 这里的 dyN/lnN 不是 row-type，是 data-row-type 中的组合标记（如 `nayin dy3`）。行序改变后只需确保各行 data-row-type 属性中的 dy/ln 组合与 `_applyDLUpdates` 的语义映射一致即可。具体调整由架构师/开发者确认。

### 5.5 不影响的部分

- `gongwei.js` 中的 `.btn-simple` 用于宫位/分气按钮，仅共用 CSS 样式，不受层级功能影响。
- `algorithm.js`、`constants.js`：无改动。
- 流年大运表（`.luck-table`）：无改动。

---

## 六、边界条件

| 场景 | 预期行为 |
|------|----------|
| 页面首次加载 | 默认 L0，按钮显示「简」，仅星运+自坐可见 |
| 页面刷新 | 层级重置为 L0（不持久化） |
| 龙凤胎双卡模式 | 两张卡片的 `.chart` 表格共享同一层级，按钮只出现一次（位于顶部栏），点击同步切换 |
| 切换层级后点击大运/流年 | `_applyDLUpdates` 仍正确更新对应列数据（因使用语义选择器，不受 display:none 影响） |
| 宫位标签行 | 始终显示，不受层级控制 |
| 三垣区域收起/展开 | 与层级切换独立，各自控制各自的显隐 |
| 连续快速点击 | 每次点击正常切换，不丢状态（单变量 `currentLevel` 保证一致性） |

---

## 七、验收标准

1. 默认显示：页面加载后仅见星运、自坐两行，按钮显示「简」。
2. 点击「简」→ 显示纳音+纳运，按钮变为「中」。
3. 点击「中」→ 显示空亡，按钮变为「详」。
4. 点击「详」→ 显示神煞，按钮变为「全」。
5. 点击「全」→ 回到 L0，按钮恢复「简」。
6. 纳运行始终紧挨纳音行下方。
7. 龙凤胎双卡模式下两张卡片的四柱表同步切换。
8. 三垣区同样应用层级规则（如三垣展开，其纳音/纳运/空亡/神煞与四柱同步显隐）。
