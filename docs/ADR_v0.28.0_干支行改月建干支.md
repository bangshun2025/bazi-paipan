# ADR v0.28.0：当年节气数据区 · 干支行改为月建干支

> 归属：八字排盘（从版） ｜ 角色：架构师（worker_67a0976f） ｜ 编排：orch_eccabe4429eb
> 日期：2026-09-10 ｜ 状态：**架构定稿（D1–D6 已裁决 + 2 项新增结论），待编程师实现**
> 上游：`docs/PRD_v0.28.0_干支行改月建干支.md`（md5 `7bb0f2dd5591dac7d70250664c45c1c4`，16843 B）
> 版本判定（Leader）：**v0.28.0（MINOR）** —— 展示语义 / 数据源变更；UI 版式零变化、JS 接口向后兼容
> 基线：正式 tag `v0.26.0`（= 回滚锚点）；其上已叠加 v0.27.0（真太阳时）**内测实现（已热加载、未 commit）**
> 回滚方式见 §4.3（**注意：不要用 `git checkout v0.26.0 --` 一刀切**，会连带丢失 v0.27 成果）

---

## 0. 决策摘要（TL;DR）

| 编号 | 议题 | **架构裁决** | 一句话理由 |
|---|---|---|---|
| **D1** | 函数签名方案 | 新增纯函数 `jieqiMonthGZ(yearGan, i)`；`jqGanzhiOf(st, yearGan, i)` **退化为薄壳**（判空 + 拼装）；`RENDER.jqGanzhiOf` 导出**保留**、另**新增导出** `RENDER.jieqiMonthGZ` | 可测性最好；`st` 职责纯化为「越界闸门」；采纳 PRD 倾向。实测全仓无外部调用者 → 签名变更零破坏 |
| **D2** | `st=null` 列（2100 小寒） | **保持占位「—」**，不允许「月建独立显示 + 其余列占位」的混合形态 | 同列其余 5 行皆「—」时单独冒出干支，会被误读为「本列有效」；且沿用 v0.26 表外防御的一致性 |
| **D3** | 传 `yearGan` vs 传 `year` | **传 `yearGan`**；在 `buildJieqiHtml` **循环外**算一次 `var yearGan = yearPillar(year).gan;` | 避免循环内 12× 重复计算；口径单源、便于断言与阅读 |
| **D4** | 注释 / 文档批注落点与形式 | 代码注释**就地改写**；历史 PRD **就地追加批注、不改原文**（行内 `【v0.28.0 修订：…】`） | PRD 是当时决策的忠实记录，改原文会破坏可追溯性；批注保留「原文 + 演进」双信息 |
| **D5** | 是否加「月建干支」`title` 微标注 | **不做**（备选方案与必改点见 §3.10） | 收益低（用户已明确要月建、即是受众）；**且**在 `class="jq-gz"` 后插属性会**打破 v0.26 T04 正则** → 需连带改断言，性价比为负 |
| **D6** | 断言归口与命名 | 新增独立 IIFE 段，`section:'当年节气数据(v0.28)'`，断言编号 **v0.28 T01–T04**（各版本独立命名空间，对齐 v0.27 惯例）；与 PRD 的 T15–T18 建立映射（§7.1） | 与 v0.27「独立 IIFE + T01–Tn」一致；避免与 v0.26 的 T01–T14 序列混淆（PRD 的「T15」会被误读为 v0.26 段内续号） |

### 0.1 本 ADR 超出 PRD 的 2 项新增结论（请 Leader/测试师知悉）

- **N1｜校验盲区（重要）**：`scripts/check-release.sh` **并不覆盖** `render.js` / `main.js` 外部文件与三端内联副本的一致性。实测其 4 段口径为：
  ① 三文件内联 JS `node --check`；② **index.html vs standalone.html** 六模块段逐段一致；③ 三文件关键 id/class 存在性（含 `jieqi-section/jq-gz/jq-tsmd/jq-tstm`）；④ 外部 JS vs standalone.html 内联段一致 —— 但第 4 段的模块清单 `MODULES_EXT = gongwei gongwei-cloud config auth records supabase.min`，**不含 render / main**。
  → **结论**：本版「三端同步」**必须外加人工 diff 兜底**（§6.2 给出可复制的抽取比对命令）；并建议后续版本把 `render main` 纳入第 4 段（属独立改进项，不属本版范围）。
  → 附：**更正** v0.27 ADR/沟通中「三端漏改会被 check-release 第 4 段拦下」的表述 —— 该段实际不覆盖 render/main，结论方向（必须三端同步）成立，但**兜底机制不能依赖脚本**。

- **N2｜PRD 勘误**：PRD §4.3 的「反例警示」数值有误。以真实 `constants.js` + `algorithm.js` 实测：1982 小寒列若误用 `yearPillar(year+1)` 的年干（`yearPillar(1983).gan = 癸`），得到的是 **乙丑**，**不是** PRD 所述的「甲寅」；正解为 **癸丑**。不影响 PRD 的设计结论（年基必须取 `year`），仅需更正示例数值。详见 §10。

---

## 1. 背景与决策承接

### 1.1 需求一句话
把「当年节气数据」区每列**最后一行「干支」**（`.jq-gz`）的语义，从「**交节当天公历自然日的日柱**」改为「**该节所起月份的月建干支（月柱）**」。
**仅换数据源，版式零变化**：列结构、行序 `md→tm→tsmd→tstm→name→gz`、竖排、`☀` 真太阳两行、12 节横排、`data-term`、流年联动全部保持现状。

### 1.2 与 v0.26.0 D1「备选口径」的承接（有效，无需推翻 v0.26 其余设计）
- `PRD_v0.26.0:69`：「…**若 Leader/用户确认要月柱可低成本切换（同表结构换一个数据源）**，列为架构师 ADR 决策点。」
- `PRD_v0.26.0:105`（D1 决策表）：「…若用户确认要月柱可换数据源，版式不变。」
- `PRD_v0.26.0:237-243`（§9.2 风险）：「两方案仅数据源不同，UI/版式/取数框架通用，切换成本低。」
- 本版即用户正式确认执行该备选口径；**v0.26 的取数框架（`buildJieqiHtml(year[, lng])`）、行序硬约束、表外防御全部沿用不动**。

### 1.3 不在范围（与 PRD §1.4/§6.3 一致，原样保留声明）
- ❌ **不修** `monthPillar`（`algorithm.js:203-243`）基于出生时点的节气比较链的已知 **8 小时时基偏移**。用户已明确**暂搁置**，单独立项处置。
- 本版**刻意改用五虎遁直推**（§3.1），**不进入**该比较链 → 不触发、不依赖、不修复该缺陷；**该缺陷不阻断本版验收**。
- ❌ 不改交节月日/时间/真太阳两行（v0.26/v0.27 口径不变）；❌ 不改八字主盘四柱；❌ 不增删列/不改 CSS 结构与类名/不改横排与断点。
- ❌ 不提交 git、不改 `ext.yml`（保持 `0.27.0`）、不改 CHANGELOG（留待发布阶段由发布师处理）。

---

## 2. 改动定位（精确到 文件:行，行号为 2026-09-10 工作树实测）

### 2.1 生产代码改动（4 处 × 3 端）

| # | 文件:行 | 当前内容（摘要） | 改为 | 端 |
|---|---|---|---|---|
| **C1** | `render.js:345` | `+ '<div class="jq-gz">' + jqGanzhiOf(st) + '</div>'` | `+ '<div class="jq-gz">' + jqGanzhiOf(st, yearGan, i) + '</div>'` | 源 |
| **C2** | `index.html:7424` | 同上 | 同上 | 内联副本 |
| **C3** | `standalone.html:7424` | 同上 | 同上 | 内联副本 |
| **C4** | `render.js:316` 之后（`var needLngHint = false;` 与 `for (var i…)` 之间） | —（新增 3 行） | 新增 `var yearGan = yearPillar(year).gan;` + 注释（§3.2） | 源 |
| **C5** | `index.html:7395` 之后 | — | 同 C4 | 内联副本 |
| **C6** | `standalone.html:7395` 之后 | — | 同 C4 | 内联副本 |
| **C7** | `render.js:356-363`（注释 3 行 + 函数 5 行） | 日柱口径注释 + `function jqGanzhiOf(st)`（`dayPillar` 取日柱） | 月建口径注释 + 新增 `jieqiMonthGZ` + 改写 `jqGanzhiOf(st,yearGan,i)`（§3.2） | 源 |
| **C8** | `index.html:7435-7442` / `standalone.html:7435-7442` | 同上 | 同上 | 内联副本 |
| **C9** | `render.js:1672`（导出块） | `jqGanzhiOf: jqGanzhiOf,` | 保留该行，并在其后新增 `jieqiMonthGZ: jieqiMonthGZ,`（§3.6） | 源 |
| **C10** | `index.html:8751` / `standalone.html:8751` | 同上 | 同上 | 内联副本 |
| **C11** | `standalone-split.html` | `<script src="render.js">`（:898）、`<script src="main.js">`（:899） | **无需改**（自动随外部文件生效） | — |

> **三端行号偏移关系（已实测）**：`index.html` = `standalone.html` = `render.js` 行号 **+7079**；
> 校验点：`render.js:316 ↔ 7395`、`render.js:345 ↔ 7424`、`render.js:363 ↔ 7442`、`render.js:1672 ↔ 8751`，全部吻合。
> **三端当前字节级一致（实测）**：`render.js` 抽取段 = 87219 B（index 副本 / standalone 副本 / 外部文件三者 `SAME`）；`main.js` = 73596 B（同样三者 `SAME`）。

### 2.2 测试代码改动（1 块 × 3 端）

| # | 文件:行（插入点） | 动作 |
|---|---|---|
| **C12** | `main.js:1564`（v0.27 块 `})();` 之后、`// 渲染结果（增强版…` **之前**） | 插入 v0.28 测试 IIFE 段（§7.2 规格） |
| **C13** | `index.html:10340`（同位置，index 内联 main 段） | 同一段代码，**逐字节相同** |
| **C14** | `standalone.html:10340` | 同一段代码，**逐字节相同** |

> 插入点判据（三端一致）：定位字符串 `  // 渲染结果（增强版：顶部横幅 + 详情折叠）`，**在其上一行之前**插入新段（前置一个空行）。
> 现有分区（`main.js` grep `section:'`）：`800 十神计算 … 1284 当年节气数据(v0.26) … 1339 节气流年联动(v0.26) … 1448 节气真太阳时(v0.27) … ` → 新增段接在 **v0.27 段之后**，成为最后一个功能分区。

### 2.3 文档批注改动（仅 `docs/`，不参与三端打包）

| # | 文件:行 | 动作 |
|---|---|---|
| **C15** | `docs/PRD_v0.26.0_当年节气数据.md:171`（v0.26-AC06 行） | **就地追加批注**（不改原文）——文案见 §7.3 |
| **C16** | `docs/PRD_v0.27.0_节气真太阳时.md:192` | **就地追加批注**——文案见 §7.3 |

### 2.4 明确**无需改动**项（已核实）

| 项 | 位置 | 核实结论 |
|---|---|---|
| `check-release.sh` KEYS | `scripts/check-release.sh:17` | 含 `jieqi-section jq-gz jq-tsmd jq-tstm`；本版**类名与结构零变化** → 防线仍有效，**不改** ✅ |
| `check-release.sh` RUNTIME_KEYS | `scripts/check-release.sh:81` | 同上，**不改** ✅ |
| `algorithm.js` / `constants.js` | — | **零改动**（复用 `ALGO.yearPillar`、常量 `TG/DZ/WU_HU_DUN`） ✅ |
| v0.26 T04 结构断言 | `main.js:1324` | 正则 `/class="jq-gz"><span class="jq-gan">[^<]+<\/span><span class="jq-zhi">[^<]+<\/span><\/div>/g` 仅校验**结构**，换值后仍绿 → **不改**（但正因如此必须新增值级断言，§7） |
| 日柱的其他引用 | `index.html:4735/9738/9792/11133` 等 | 属**八字主盘四柱**与命宫/身宫，**与节气块无关，不动** ✅ |
| `render.js:53` 别名 `var dayPillar = ALGO.dayPillar;` | — | 改后在本文件内变为**无引用（死别名）**。**裁决：保留**（零功能影响、diff 最小、无 lint 门禁）；「死代码清理」列为可选后续项，不在本版动。 |

---

## 3. 技术方案

### 3.1 数据流（新口径）

```
buildJieqiHtml(year, lng)
  ├─ (新增) yearGan = yearPillar(year).gan          ← 循环外算一次；年基 = 「所选年」，含小寒列
  └─ for i in 0..11:                                 ← MONTH_TERM 顺序（立春…小寒）
       ├─ termYear = year + (i==11 ? 1 : 0)          ← 仅用于取节气时刻（不改）
       ├─ st = getSolarTerm(termYear, idx)            ← 仅用于 md/tm/真太阳 & 越界闸门（不改）
       └─ .jq-gz = jqGanzhiOf(st, yearGan, i)
                     └─ st==null → 占位「—」（越界闸门，D2）
                     └─ 否则 jieqiMonthGZ(yearGan, i)  ← 五虎遁直推月柱（**不依赖 st 的时刻**）
```

**口径同源声明**：`jieqiMonthGZ` 的月支/月干式与 `algorithm.js:203-243` 的 `monthPillar` **同源同式**
（`zhi = DZ[(i+2)%12]`、`gan = TG[(TG.indexOf(WU_HU_DUN[yearGan]) + i) % 10]`），
但**刻意剥离**其「基于出生时点的节气边界比较」——即本版与 8h 缺陷**物理隔离**（§1.3）。

### 3.2 代码规格（可直接照抄）

**(a) 循环外新增（C4/C5/C6）——插在 `var needLngHint = false;` 之后空一行：**

```js
  // v0.28.0 D1/D3：月建（五虎遁）年基 —— 整块 12 列统一取「所选干支年」的年干。
  // 末位小寒的节气表年份为 year+1（公历落次年 1 月），但其干支属 year 之丑月，
  // 故仍取 yearPillar(year)，**不得**用 yearPillar(year+1)（off-by-one，见 ADR §3.3）。
  var yearGan = yearPillar(year).gan;
```

**(b) 调用点（C1/C2/C3）：**

```js
      + '<div class="jq-gz">' + jqGanzhiOf(st, yearGan, i) + '</div>'
```

> ⚠️ **行序与 class 名绝对不动**：该行仍是第 6 行、仍为 `<div class="jq-gz">…</div>`，且 `class="jq-gz"` 与 `>` 之间**不得**插入任何属性/空白（D5 的硬理由，见 §3.5）。

**(c) 注释 + 函数（C7/C8）——整体替换 `render.js:356-363`：**

```js
// ===== v0.28.0 D1：每列干支 = 该节所起月份的【月建干支（月柱）】 =====
// 语义：立春列=寅月、惊蛰列=卯月 …… 小寒列=丑月（12 节 ↔ 干支年十二月建一一对应）。
// 取数：五虎遁直推（年干 → 寅月月干，顺行 i 位），天干上、地支下竖排。
// 刻意**不进入** ALGO.monthPillar 的出生时点节气比较链（其 8h 时基缺陷用户已搁置，
//   见 PRD §1.4/§6.3）；本函数不依赖交节时刻、不依赖出生入参 → 出生时点无关（AC04）。
// 年基：12 列统一取 buildJieqiHtml 注入的 year（含末位小寒），见上方 yearGan 注释。
// st 为 null（表外越界，如 2100 年小寒）→ 保持占位「—」，与同列 md/tm 视觉一致且不抛异常（D2）。
// 日后如需切回「交节日日柱」：把 jqGanzhiOf 内部换回 dayPillar(st…) 即可（对称可逆）。
function jieqiMonthGZ(yearGan, i) {
  var start = WU_HU_DUN[yearGan];              // 五虎遁：年干 → 寅月月干
  if (!start) return null;                     // 年干非法（理论不可达）→ 调用方落占位
  var zhi = DZ[(i + 2) % 12];                  // i=0→寅月 … i=11→丑月
  var gan = TG[(TG.indexOf(start) + i) % 10];  // 自寅月起顺行 i 位
  return gan + zhi;                            // 如 '壬寅'
}

function jqGanzhiOf(st, yearGan, i) {
  if (!st) return '<span class="jq-gan">—</span><span class="jq-zhi">—</span>';
  var gz = jieqiMonthGZ(yearGan, i);
  if (!gz) return '<span class="jq-gan">—</span><span class="jq-zhi">—</span>';
  return '<span class="jq-gan">' + gz.substring(0, 1) + '</span>'
       + '<span class="jq-zhi">' + gz.substring(1, 2) + '</span>';
}
```

**(d) 导出（C9/C10）——在 `jqGanzhiOf: jqGanzhiOf,` 之后新增一行：**

```js
    jieqiMonthGZ: jieqiMonthGZ,
```

### 3.3 年基防 off-by-one（本版最高风险点，P0）

- 年基 = **节气块注入的 `year`**，**对全部 12 列一致**，**含末位小寒**。
- 末位小寒的 `termYear = year + 1` 只影响**取哪个节气时刻**（公历 1 月），**不影响**五虎遁年基。
- **实测反例（ADR §10 勘误依据）**：1982 年
  - 正解：`yearPillar(1982).gan = 壬` → 小寒（i=11）= **癸丑** ✅
  - 错解：`yearPillar(1983).gan = 癸` → 小寒 = **乙丑** ❌（PRD 原文误写为「甲寅」）
- **锁定手段**：新增值级断言 v0.28 T01 直接对 1982 全 12 列含小寒做等值比对（§7.2）。

### 3.4 表外防御（沿用 v0.26 口径，D2）

| 场景 | 现状（v0.26/v0.27） | 本版行为 |
|---|---|---|
| `st === null`（如 `buildJieqiHtml(2100)` 的小寒列） | `.jq-md/.jq-tm/.jq-tsmd/.jq-tstm` 均「—」，标题附「（小寒超出节气表）」 | `.jq-gz` **同样「—」**（不抛、不独立显示月建） |
| 整块越界（`year<1000 || year>2101`） | 返回 `.jieqi-note`「节气数据仅支持 1000-2100 年」 | **不变** |
| `lng` 非有限数 | 两行 `☀` = 「—」 + 标题「（未选出生地，真太阳时不可用）」 | **不变**（与 `.jq-gz` 无关） |

### 3.5 版式零变化 / 正则兼容（硬约束）

必须保持 v0.26 T04 正则仍能命中 12 次，即 `.jq-gz` 的输出形态**逐字节**为：

```
<div class="jq-gz"><span class="jq-gan">干</span><span class="jq-zhi">支</span></div>
```

- `class="jq-gz"` 与 `>` 之间**不得**有属性、空白或换行；
- `.jq-gan` 必须在前、`.jq-zhi` 必须在后（竖排语义）；
- `<span>` 内**恰好 1 个字符**（正则用 `[^<]+` 宽容，但保持 1 字以便视觉一致）；
- 干支为占位时同样输出「—」（`[^<]+` 兼容）。

### 3.6 D1 详述：签名与导出兼容策略

- 现签名 `jqGanzhiOf(st)` → 新签名 `jqGanzhiOf(st, yearGan, i)`。
- **破坏性评估（实测）**：全仓 `jqGanzhiOf` 出现点仅 9 处 —— `render.js:345`（调用）+ `:359`（定义）+ `:1672`（导出）；`index.html`/`standalone.html` 各 3 处同构（7424/7438/8751）。**无任何外部调用者**（`main.js` 内零引用）→ **零破坏**。
- **保留导出** `RENDER.jqGanzhiOf`：保持命名空间稳定（外部脚本/未来复用不感知变更）。
- **新增导出** `RENDER.jieqiMonthGZ`：供测试做**值级单测**（`jieqiMonthGZ('壬',0) === '壬寅'`），并作为「口径单源」的公开入口。
- `buildJieqiHtml(year, lng)` / `refreshJieqi(root, year, lng)` 签名**不变** → v0.26/v0.27 的全部调用点（`render.js:673/723/759/1497` 等）与断言**零改动**。
- `jieqiMonthGZ` 返回值约定：**2 字符串**（干+支）或 `null`（年干非法）——不做 HTML，不做判空（判空在 `jqGanzhiOf`），保证纯函数可测。

### 3.7 D2 详述：`st=null` 保持占位（否决混合形态）

- **采纳**：`st === null` → `.jq-gz` 输出占位「—」。
- **理由**：① 与同列 5 行 `—` 视觉一致，避免「整列无效但干支有效」的认知撕裂；② 该列本就带标题提示「（小寒超出节气表）」，语义完整；③ 沿用 v0.26 表外防御的一致性，回归面最小。
- **备选（否决）**：允许月建独立显示（因月建**不依赖**交节时刻）。否决原因：会产生「2100 年小寒列 = 5 个 `—` + 1 个 `癸丑`」的混合列，用户难以解读，且破坏 v0.26 T05「2100 小寒列月日=—」的**整列占位**直觉。
- **边界说明**：`year` 上限 2101 时，仅**末列小寒**可能 null；`year=2100` 时 `getSolarTerm(2101, 0) = null`（实测）→ 正是本场景。

### 3.8 D3 详述：传 `yearGan`，循环外算一次

- **采纳 PRD 倾向**：调用点传 `yearGan`，不传 `year`。
- **计算位置**：`buildJieqiHtml` 内、`for` 循环**之前**（`var yearGan = yearPillar(year).gan;`）。
  - 若在函数内自算：12 次 `yearPillar` 冗余调用（可忽略但无意义）；
  - 若在循环内自算：口径分散、易在后续改动中漂移。
- **口径单源**：`yearGan` 由 `ALGO.yearPillar(year)`（`algorithm.js:195`）提供，即「立春换年」的干支年干，与其余模块一致。
- **取值安全**：`year` 已由函数入口守卫（`year<1000 || year>2101` 直接返回占位），故 `yearPillar(year)` 恒可用。

### 3.9 D4 详述：注释与文档批注

- **代码注释**：**就地改写** `render.js:356-358`（三行），文案见 §3.2(c) —— 含「新口径说明 + 不进入 monthPillar 链的原因 + 年基说明 + null 行为 + 可逆提示」。
  - 三端同步：`render.js:356-358` ↔ `index.html:7435-7437` ↔ `standalone.html:7435-7437`。
- **历史 PRD**：**就地追加批注，不改原文**（保史料可追溯）：
  - `PRD_v0.26.0:171`（AC06 行）：行尾追加 `【v0.28.0 修订：干支语义改为「该节所起月建（月柱）」，按五虎遁直推；原「第 4 行」表述亦同步更正为「第 6 行」（v0.27 新增 ☀ 两行后行序变化）。见 PRD_v0.28.0 / ADR_v0.28.0】`
  - `PRD_v0.27.0:192`（「不改干支口径…日柱」行）：行尾追加 `【v0.28.0 取代：本条在 v0.27 范围内仍成立；干支口径已于 v0.28.0 正式变更为月建（月柱）。见 PRD_v0.28.0 / ADR_v0.28.0】`
- **批注形式统一为**：`【vX.Y.Z 修订|取代：<结论>；见 <引用>】`，行内追加、不改动原句、不删行。

### 3.10 D5 详述：`title` 微标注 —— **不做**（并给出「若要做」的必改点）

- **裁决：不做。**
- **理由**：① 用户原话已明确「看所选年内的月建干支」，即是受众本人，误读风险本就低；② **关键**：`title` 只能加在 `.jq-gz` 上（`<div class="jq-gz" title="月建干支">`），而这会**直接打破 v0.26 T04 正则**（该正则要求 `class="jq-gz"` 后紧跟 `>`）→ 必须连带修改既有断言正则，**改动面从「1 处函数」扩大到「函数 + 断言 + 三端 6 个点位」**，性价比为负。
- **若 Leader/用户坚持要做（备选方案，供将来版本）**：
  1. 形态：`<div class="jq-gz" title="月建干支">`（或加到 `.jieqi-title` 的静态文案上，**不触碰 `.jq-gz`** —— 此路零断言影响，**推荐若要做就走这条**）；
  2. 必须同步：v0.26 T04 正则改为 `/class="jq-gz"[^>]*><span class="jq-gan">…/g`（三端）；
  3. 影响：`check-release.sh` KEYS 用 `grep -qE "class=\"[^\"]*jq-gz([ \"]|$)"` 判定，`title` 不影响该匹配 ✅。

### 3.11 D6 详述：断言归口（详见 §7）

- 新增独立 IIFE 段（与 v0.26/v0.27 同构），`section:'当年节气数据(v0.28)'`；
- 断言编号 **v0.28 T01–T04**（各版本独立命名空间）；
- 与 PRD T15–T18 的映射：T15→T01、T16→T02、T17→T03、T18→T04（§7.1 表）。
- 插入点三端一致（§2.2）。**前置依赖**：`window.RENDER.buildJieqiHtml` / `window.RENDER.refreshJieqi` / `window.RENDER.jieqiMonthGZ` 已挂载（缺失则 `fail` 前置断言并 return，沿用 v0.26 T01 写法）。
---

## 4. 风险与回滚预案

### 4.1 风险矩阵

| 编号 | 风险 | 等级 | 触发/观测 | 缓解措施（本 ADR 已内置） |
|---|---|---|---|---|
| **R-V28-01** | **年基 off-by-one**：末列小寒误用 `yearPillar(year+1)` 的年干 | **P0（高）** | 1982 小寒将得 `乙丑`（正解 `癸丑`），肉眼可辨 | §3.3 明文 + §3.2(a) 注释警示 + **T01 锚点直接锁定 12 列** |
| **R-V28-02** | 三端漏同步（`render.js` / `index.html` / `standalone.html`）→ 单体版与模块版行为不一致 | **P1（中）** | `standalone-split.html` 走外链 `render.js`，与内联两份可能漂移 | §6 清单 + **人工 diff 兜底**（`check-release.sh` 有盲区，见 N1）+ 建议纳入脚本 |
| **R-V28-03** | **值级无旧断言保护**：v0.26 T04 仅校验结构正则，换数据源「换错了也不会报警」 | **P1（中）** | 若漏加 T01，错误口径会静默上线 | §7.2 **强制新增值级断言 T01（12 条 + 切换对照）** |
| **R-V28-04** | 测试块只改了 `main.js`、漏改两个内联副本 | **P1（中）** | `?test=1` 在单体版（file://）看不到 v0.28 断言 → 误判「测试没跑」 | §2.2 三个插入点（`main.js:1564` / `index.html:10340` / `standalone.html:10340`）+ §6.2 diff |
| **R-V28-05** | 误把「月建」当「交节日日柱」（旧语义残留） | 低 | 用户/测试师疑问 | PRD §1.3 + 本 ADR §0/§3.2 明文；D5 备选方案留档（§3.10） |
| **R-V28-06** | `WU_HU_DUN` / `TG` / `DZ` 在 `render.js` 作用域不可见 | 低（**已排除**） | 若不可见会 `ReferenceError` 当场崩 | 实测 `render.js:29/6/7` 已有 `var WU_HU_DUN/TG/DZ = CONST.*` 别名 ✅ |
| **R-V28-07** | `dayPillar` 别名（`render.js:53`）变为死代码 | 低 | 静态阅读困惑 | **裁决保留**（零影响、diff 最小）；清理留待后续版本 |
| **R-V28-08** | 行序 / class 名被无意改动 → 打破 v0.26 T03/AC07 与 v0.27 T05 行序断言 | 低 | `?test=1` 立即红 | §3.5 硬约束 + 本版**只改 L345 一个参数与 L356-363 一段函数体**，不触碰 L339-346 |
| **R-V28-09** | 把 v0.27 的真太阳两行 `/` 经度回退链误改 | 低 | v0.27 T01–T07 回归红 | 本版**不触碰** `hasLng` / `trueSolarTime` / `refreshJieqi` / `_jieqiLng` 任何一行 |
| **R-V28-10** | 与 v0.27 内测态的 **git 叠加混乱**（未 commit 的工作树） | 中 | 回滚时误伤 v0.27 成果 | §4.3 明确回滚方式，**禁止** `git checkout v0.26.0 --` 一刀切 |

### 4.2 联动风险（与 v0.27 内测态叠加）
当前工作树 = `tag v0.26.0` **+ v0.27.0 真太阳时实现（已热加载、未 commit）**。本版是在**工作树之上**继续叠加，因此：
- 一切行号（§2）均以 **2026-09-10 实测工作树**为准，**不是** tag 快照；若编程师在动手前发现行号漂移，以**定位字符串**为准（本 ADR 每处均给出锚点串）。
- 回滚目标是「回到 **v0.27 内测态**」，**不是**回到 tag v0.26.0（除非要连带放弃 v0.27）。

### 4.3 回滚预案

**A. 推荐回滚（精确、不伤 v0.27）——「按 diff 逆改」**
本版仅 4 类改动，逐类逆改即回到 v0.27 内测态：

| 逆改 # | 位置（三端） | 逆操作 |
|---|---|---|
| 1 | `render.js:345` / `index.html:7424` / `standalone.html:7424` | `jqGanzhiOf(st, yearGan, i)` → `jqGanzhiOf(st)` |
| 2 | `render.js:316后` / `7395后` / `7395后` | 删除新增的 `var yearGan = yearPillar(year).gan;` 及其 3 行注释 |
| 3 | `render.js:356-363` / `7435-7442` / `7435-7442` | 还原为日柱版注释 + `function jqGanzhiOf(st) { … dayPillar(…) … }`（原文见 §11.2） |
| 4 | 导出块 `render.js:1672` / `8751` / `8751` | 删除 `jieqiMonthGZ: jieqiMonthGZ,` |
| 5 | 测试块 `main.js:1564` / `index.html:10340` / `standalone.html:10340` | 删除整段 v0.28 IIFE |

**B. 备份式回滚（最省事，推荐编程师动手前先做）**
```bash
mkdir -p /tmp/bazi-v027-backup && cd /Users/feng/.clacky/ext/local/bazi-paipan \
  && cp render.js index.html standalone.html main.js /tmp/bazi-v027-backup/
# 需要回滚时：
# cp /tmp/bazi-v027-backup/{render.js,index.html,standalone.html,main.js} .
```

**C. 禁用方式（⚠️ 会连带回退 v0.27）**
```bash
# ❌ 不要这样：会把 v0.27 真太阳时实现一起丢掉
# git checkout v0.26.0 -- render.js index.html standalone.html main.js
```

**D. 回滚验证（必做）**
1. `?test=1` **双环境**（`file://` 单体 + `http` 模块版）全绿，且断言总数回到 **393 条**（= v0.26 的 339 + v0.27 的 54）；
2. 抽查 `buildJieqiHtml(1982)` 立春列干支回到旧口径 **戊午**（新口径为 壬寅）；
3. `bash scripts/check-release.sh` 退出码 0。

---

## 5. 验收基线

### 5.1 AC → 验证手段映射

| AC（PRD §5） | 验证手段 | 本 ADR 落点 |
|---|---|---|
| v0.28-AC01 每列第 6 行为月建、竖排 | 代码走查 + **T01 值级** + 结构断言 | §3.2(c) / §7.2 T01 |
| v0.28-AC02 1982 十二节锚点全中 | **T01**（12 条等值） | §5.2 锚点表 / §7.2 |
| v0.28-AC03 口径切换证据（立春 戊午→壬寅） | **T01**（立春单列 + 前后对照） | §5.2 / §7.2 |
| v0.28-AC04 出生时点无关性 | 代码级（**签名无出生入参**）+ **T02**（不同经度作可观测代理） | §3.1 / §7.2 T02 |
| v0.28-AC05 版式零变化 | 复用 **v0.26 T03/T04** + **v0.27 T05**；新增段内「结构×12」自检 | §3.5 / §7.2 T04 |
| v0.28-AC06 流年联动 | **T03**（`refreshJieqi` 后值 = `buildJieqiHtml` 值）+ TC-06 人工交互 | §7.2 T03 |
| v0.28-AC07 双胞胎共享块 | TC-07 人工交互 + **T03**（共享块同为 `.jieqi-section`，同一刷新路径） | §7.2 T03 |
| v0.28-AC08 表外防御 | **T04**（2100 小寒占位 / 2200 整块占位，均不抛）+ v0.26 T05 复测 | §3.4 / §7.2 T04 |
| v0.28-AC09 三端一致 | CI-06/07/08（`check-release.sh` EXIT=0）+ **人工 diff**（§6.2） | §6 |
| v0.28-AC10 无回归 | `?test=1` 双环境：v0.26（339）+ v0.27（54）仍全绿 + 新增 v0.28 全绿 | §5.4 R01–R03 |

### 5.2 1982 年十二节锚点（**本 ADR 独立复算结果**，AC02/AC03 权威锚点）

复算环境：真实 `constants.js` + `algorithm.js`（`node` + `vm` 沙箱），非人为推算。
`ALGO.yearPillar(1982)` = **壬戌**（gan=壬, idx=58）；五虎遁「丁壬壬位顺行流」→ 寅月 = 壬寅。

| 列 | 节 | 交节公历(BJT) | **月建（新口径）** | 日柱（旧口径，对照） |
|---|---|---|---|---|
| 1 | 立春 | 2/4 11:45 | **壬寅** | 戊午 |
| 2 | 惊蛰 | 3/6 05:54 | **癸卯** | 戊子 |
| 3 | 清明 | 4/5 10:52 | **甲辰** | 戊午 |
| 4 | 立夏 | 5/6 04:19 | **乙巳** | 己丑 |
| 5 | 芒种 | 6/6 08:35 | **丙午** | 庚申 |
| 6 | 小暑 | 7/7 18:54 | **丁未** | 辛卯 |
| 7 | 立秋 | 8/8 04:41 | **戊申** | 癸亥 |
| 8 | 白露 | 9/8 07:31 | **己酉** | 甲午 |
| 9 | 寒露 | 10/8 23:02 | **庚戌** | 甲子 |
| 10 | 立冬 | 11/8 02:04 | **辛亥** | 乙未 |
| 11 | 大雪 | 12/7 18:48 | **壬子** | 甲子 |
| 12 | 小寒 | 1983-1/6 05:58 | **癸丑** | 甲午 |

- 比对结果：**12/12 全中**（与 PRD §5.1 完全一致）；
- **AC03 切换证据**：立春 **戊午 → 壬寅**；
- **交叉一致性**（实测）：`ALGO.monthPillar(y, 2, 15, 12, 0, yearPillar(y).gan)` 的寅月 = 直推寅月，在 **2026 / 2000 / 1990 / 1982 / 2100** 五组年份全部一致 ✅（`monthPillar` 与直推**同源同式**，仅剥离了时点比较链）。

### 5.3 复算方法留档（可复现）

```bash
cd /Users/feng/.clacky/ext/local/bazi-paipan && node /tmp/adr28_anchor.js
# 沙箱： vm.runInContext(constants.js) → vm.runInContext(algorithm.js) → 读 sandbox.CONST / sandbox.ALGO
# 直推式： zhi = DZ[(i+2)%12]; gan = TG[(TG.indexOf(WU_HU_DUN[yearGan]) + i) % 10]
```
关键输出（原样，见 §11.1）：`1982 锚点比对: ✅ 12/12 全中`、`小寒列：yearPillar(1982).gan=壬 → 癸丑 | 若误用 yearPillar(1983).gan=癸 → 乙丑`、`getSolarTerm(2101,0) = null`。

### 5.4 回归基线（R01–R03，与 v0.27 同构）

| 编号 | 内容 | 通过判据 |
|---|---|---|
| **R01** | 既有断言全绿 | v0.26（**339** 条）+ v0.27（**54** 条）= **393** 条全绿（`?test=1`，`file://` + `http` 双环境） |
| **R02** | 三端一致 + 发布门禁 | `bash scripts/check-release.sh` **EXIT=0**；外加 §6.2 **人工 diff** 三端 `render`/`main` 抽取段 `SAME` |
| **R03** | 边界不抛 | `buildJieqiHtml(2100)` / `(2200)` / `(999)` / `(2102)` 不抛；无 `NaN`/`undefined` 泄漏到 DOM |

---

## 6. 三端同步要求

### 6.1 同步清单（本版全部落点）

| 类别 | 文件 | 位置 | 是否必须 |
|---|---|---|---|
| 生产代码 | `render.js`（源） | `:316后`(新增)、`:345`(改)、`:356-363`(改)、`:1672`(增导出) | ✅ |
| 生产代码 | `index.html`（内联） | `:7395后`、`:7424`、`:7435-7442`、`:8751` | ✅ |
| 生产代码 | `standalone.html`（内联） | `:7395后`、`:7424`、`:7435-7442`、`:8751` | ✅ |
| 生产代码 | `standalone-split.html` | —（外链 `render.js:898` + `main.js:899`） | ⛔ **无需改** |
| 断言 | `main.js`（源） | `:1564` 插入 v0.28 IIFE 段 | ✅ |
| 断言 | `index.html`（内联） | `:10340` 同一段，逐字节相同 | ✅ |
| 断言 | `standalone.html`（内联） | `:10340` 同一段，逐字节相同 | ✅ |
| 文档 | `docs/PRD_v0.26.0_当年节气数据.md` | `:171` 行尾追加批注 | ✅（不打包） |
| 文档 | `docs/PRD_v0.27.0_节气真太阳时.md` | `:192` 行尾追加批注 | ✅（不打包） |
| 门禁脚本 | `scripts/check-release.sh` | — | ⛔ **无需改**（§2.4 已核实） |

### 6.2 人工 diff 兜底（**必做**，因 `check-release.sh` 有盲区）

```bash
cd /Users/feng/.clacky/ext/local/bazi-paipan && python3 - <<'PY'
import re
def extract(fn, m):
    src = open(fn, encoding='utf-8').read()
    i = src.find(f'— {m}.js */')
    if i == -1: return None
    s = src.rfind('<script>', 0, i); e = src.find('</script>', i)
    return src[s:e][len('<script>'):].lstrip('\n')
def strip_header(s):
    L = s.split('\n'); i = 0
    while i < len(L):
        t = L[i].lstrip()
        if t.startswith('/* 八字排盘 v'):
            i += 1
            while i < len(L) and '*/' not in L[i-1]: i += 1
        else: break
    return '\n'.join(L[i:]).lstrip('\n')
for m in ('render','main'):
    only = [strip_header(extract(f, m)).rstrip('\n') for f in ('index.html','standalone.html')]
    ext  = strip_header(open(m+'.js', encoding='utf-8').read()).rstrip('\n')
    print(f'{m}.js:', 'index==standalone:', only[0]==only[1], '| index==外部:', only[0]==ext)
PY
# 期望：两份均 True（v0.28 实现前的现状实测亦为 True，见 §11.3）
```
> 说明：人工 diff 是**唯一能拦住「外部 `render.js` 改了、两个内联副本没改」**的检查（`standalone-split.html` 用的是外部文件，会与单体版行为分叉）。

### 6.3 盲区与改进建议（N1）
- 现状：`check-release.sh` 第 2 段只比 **index vs standalone**；第 4 段只比 **gongwei/gongwei-cloud/config/auth/records/supabase.min** 的外部↔内联。
- **`render`/`main` 的外部↔内联一致性没有任何自动检查** → 建议后续版本把 `render main` 加进第 4 段的 `MODULES_EXT` 清单（属独立改进项，**不在本版范围**，可由 Leader 决定是否单独立项）。

---

## 7. 断言新增 / 修订清单

### 7.1 编号映射（PRD ↔ ADR 定稿）

| PRD 建议编号 | **ADR 定稿编号** | 内容 |
|---|---|---|
| T15 | **v0.28 T01** | 1982 十二节值级锚点 + 口径切换证据 + 纯函数单测 |
| T16 | **v0.28 T02** | 出生入参无关性（不同经度 → 12 列干支一致） |
| T17 | **v0.28 T03** | `refreshJieqi(year)` 后干支 = `buildJieqiHtml(year)` 对应值 |
| T18 | **v0.28 T04** | 表外防御（2100 小寒占位 / 2200 整块占位，均不抛）+ 结构×12 自检 |

- 分区名：`section:'当年节气数据(v0.28)'`（与 `当年节气数据(v0.26)`、`节气真太阳时(v0.27)` 并列）；
- 位置：**独立 IIFE**，插在 v0.27 段之后（§2.2 三端插入点）；
- 前置依赖：`window.RENDER.buildJieqiHtml` / `refreshJieqi` / `jieqiMonthGZ` 已挂载；缺失则 `fail` 并 `return`（沿用 v0.26 T01 写法）；
- ⚠️ **实现细节**：v0.27 段内的 `pull()` 是**该 IIFE 的局部函数，不可跨段访问** → 新段必须**自带**取值器（§7.2 给出 `gzVals`）。

### 7.2 断言规格（代码骨架，可直接落地）

```js
  // ===== v0.28.0 当年节气数据 · 干支行改月建干支 T01-T04 =====
  (function() {
    tests.push({ section:'当年节气数据(v0.28)' });
    var R = window.RENDER;
    if (!R || typeof R.buildJieqiHtml !== 'function' || typeof R.refreshJieqi !== 'function') {
      tests.push(fail('v0.28 T01: 前置 RENDER.buildJieqiHtml/refreshJieqi 已挂载', '缺失'));
      return;
    }
    var RJ = R.buildJieqiHtml;

    // 取值器：从 HTML 抽 12 列 .jq-gz 的「干+支」（同时隐含校验竖排结构）
    function gzVals(html) {
      var re = /class="jq-gz"><span class="jq-gan">([^<]+)<\/span><span class="jq-zhi">([^<]+)<\/span><\/div>/g;
      var out = [], m;
      while ((m = re.exec(html)) !== null) out.push(m[1] + m[2]);
      return out;
    }

    // ---- T01 值级锚点：1982 壬戌年 12 节月建（AC01/AC02/AC03）----
    var s82 = '', e82 = null;
    try { s82 = RJ(1982); } catch (e) { e82 = e; }
    tests.push(eq('v0.28 T01:buildJieqiHtml(1982) 不抛', e82 === null, true));
    var EXP82 = ['壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑'];
    var got82 = gzVals(s82);
    tests.push(eq('v0.28 T01:1982 干支列×12', got82.length, 12));
    for (var z = 0; z < EXP82.length; z++) {
      tests.push(eq('v0.28 T01:1982 第' + (z + 1) + '列月建=' + EXP82[z], got82[z], EXP82[z]));
    }
    // 口径切换证据（AC03）：立春 现口径 戊午 → 新口径 壬寅
    tests.push(eq('v0.28 T01:1982 立春列=壬寅（现口径为戊午）', got82[0], '壬寅'));
    // 纯函数单测（D1 新导出；含 off-by-one 反例固化）
    if (typeof R.jieqiMonthGZ === 'function') {
      tests.push(eq("v0.28 T01:jieqiMonthGZ('壬',0)=壬寅(寅月)", R.jieqiMonthGZ('壬', 0), '壬寅'));
      tests.push(eq("v0.28 T01:jieqiMonthGZ('壬',11)=癸丑(小寒·年基取本年)", R.jieqiMonthGZ('壬', 11), '癸丑'));
      tests.push(eq("v0.28 T01:jieqiMonthGZ('癸',11)=乙丑(反例：误用次年干得此值)", R.jieqiMonthGZ('癸', 11), '乙丑'));
    } else {
      tests.push(fail('v0.28 T01:RENDER.jieqiMonthGZ 已导出', '缺失'));
    }

    // ---- T02 出生时点无关性（AC04）：不同经度/有无经度 → 12 列干支完全一致 ----
    var g1 = gzVals(RJ(2026, 116.4)).join(',');
    var g2 = gzVals(RJ(2026, 75.9)).join(',');
    var g3 = gzVals(RJ(2026)).join(',');
    tests.push(eq('v0.28 T02:不同经度(116.4/75.9)干支一致', g1 === g2, true));
    tests.push(eq('v0.28 T02:有/无经度干支一致', g1 === g3, true));
    tests.push(eq('v0.28 T02:2026 十二列非空且无 NaN', g1.indexOf('NaN') < 0 && gzVals(RJ(2026, 116.4)).length === 12, true));

    // ---- T03 流年联动（AC06/AC07）：refreshJieqi 后与 buildJieqiHtml 同值 ----
    // 复用 v0.26/v0.27 的测试容器写法（renderChart 注入 → 定位 .jieqi-section → refreshJieqi）
    var host = document.getElementById('t28-out');
    if (!host) { host = document.createElement('div'); host.id = 't28-out'; host.style.cssText = 'position:absolute;left:-9999px;'; document.body.appendChild(host); }
    var pd = { /* 以 v0.26/v0.27 段内同一份真实 paipan 数据为准（避免新造口径） */ };
    // 说明：若沿用固定测试数据变量不可见，可就地调用 window.ALGO.paipan(...) 生成，或抽取 v0.27 段同一构造方式。
    if (typeof R.renderChart === 'function') {
      R.renderChart(pd, undefined, 't28-out');
      R.refreshJieqi(host, 2030);
      var sec = host.querySelector('.jieqi-section');
      tests.push(eq('v0.28 T03:refreshJieqi(2030) 后干支=buildJieqiHtml(2030)',
        sec ? gzVals(sec.outerHTML).join(',') : 'NO_SEC', gzVals(RJ(2030)).join(','), true));
      R.refreshJieqi(host, 2026);
      var sec2 = host.querySelector('.jieqi-section');
      tests.push(eq('v0.28 T03:refreshJieqi(2026) 回刷亦一致',
        sec2 ? gzVals(sec2.outerHTML).join(',') : 'NO_SEC', gzVals(RJ(2026)).join(','), true));
    } else {
      tests.push(fail('v0.28 T03:前置 RENDER.renderChart 已挂载', '缺失'));
    }

    // ---- T04 表外防御（AC08）+ 结构未破（AC05）----
    var s2100 = '', e2100 = null, s2200 = '', e2200 = null;
    try { s2100 = RJ(2100); } catch (e) { e2100 = e; }
    tests.push(eq('v0.28 T04:buildJieqiHtml(2100) 不抛', e2100 === null, true));
    tests.push(eq('v0.28 T04:2100 小寒列干支=—（占位，不独立显示月建）',
      /data-term="小寒"[\s\S]*?class="jq-gz"><span class="jq-gan">—<\/span><span class="jq-zhi">—<\/span><\/div>/.test(s2100), true));
    try { s2200 = RJ(2200); } catch (e) { e2200 = e; }
    tests.push(eq('v0.28 T04:buildJieqiHtml(2200) 不抛', e2200 === null, true));
    tests.push(eq('v0.28 T04:2200 整块占位提示', s2200.indexOf('jieqi-note') >= 0, true));
    tests.push(eq('v0.28 T04:2026 干支竖排块×12（结构未破）', gzVals(RJ(2026)).length, 12));
  })();
```
> **T03 数据来源注意**：v0.26/v0.27 段内的 `pd`（真实 paipan 数据）是该 IIFE 的局部变量，**新段不可见**。编程师须在段内**就地重建**（推荐：复用 v0.27 T01 段生成 `pd` 的同一表达式/同一输入，保持口径一致），或直接对该断言降级为「调 `RJ(y)` 与刷新后 DOM 比对」所需的**最小可渲染数据**。此点必须在实现时确认，**不得**新造一套与 v0.26/v0.27 不同的出生数据。

### 7.3 关联条目修订（ADR 处理结论）

| 关联条目 | 位置 | ADR 处理结论 | 批注文案（就地追加，不改原文） |
|---|---|---|---|
| **v0.26-AC06** | `docs/PRD_v0.26.0_当年节气数据.md:171` | **修订语义**（并顺带更正行号表述） | `【v0.28.0 修订：干支语义改为「该节所起月建（月柱）」，按五虎遁直推；原「第 4 行」表述同步更正为「第 6 行」（v0.27 新增 ☀ 两行后行序变化）。安全网见 T01。见 PRD_v0.28.0 / ADR_v0.28.0】` |
| **v0.27 非目标声明** | `docs/PRD_v0.27.0_节气真太阳时.md:192` | **标注被取代**（v0.27 范围内仍成立） | `【v0.28.0 取代：本条于 v0.27 范围内仍成立；干支口径已于 v0.28.0 正式变更为月建（月柱）。见 PRD_v0.28.0 / ADR_v0.28.0】` |
| **v0.26 T04 断言** | `main.js:1324`（三端） | **不改**（结构正则，换值仍绿）；新增 T01 补值级空白 | — |
| **`check-release.sh`** | `:17 KEYS` / `:81 RUNTIME_KEYS` | **不改**（类名结构零变化，防线仍有效） | — |
| **日柱其他引用** | `index.html:4735/9738/9792/11133` 等 | **不动**（八字主盘，与节气块无关） | — |

---

## 8. 编程师实现指引（建议顺序）

1. **备份**：`mkdir -p /tmp/bazi-v027-backup && cp render.js index.html standalone.html main.js /tmp/bazi-v027-backup/`（回滚用，§4.3-B）。
2. **改源文件 `render.js`**（4 处，按 §2.1 C1/C4/C7/C9）：① 循环外新增 `yearGan`；② 调用点传 `(st, yearGan, i)`；③ 替换 `:356-363` 为 §3.2(c) 代码；④ 导出块新增 `jieqiMonthGZ`。
3. **同步两内联副本**：以 `render.js` 为源，把同样的 4 处改动落到 `index.html`（`7395后/7424/7435-7442/8751`）与 `standalone.html`（同）。**建议用「抽取-替换-回填」**而非手工行号定位，避免偏移。
4. **新增断言段**：在 `main.js:1564` 插入 §7.2 的 IIFE（补齐 T03 的数据构造），**逐字节复制**到 `index.html:10340` 与 `standalone.html:10340`。
5. **文档批注**：按 §7.3 对两份历史 PRD 行尾追加批注。
6. **自检**（§9 全部）→ `bash scripts/check-release.sh`（期望 EXIT=0）→ §6.2 人工 diff（期望两行 `True`）。
7. **跑测试**：`?test=1` 在 `file://`（单体 `index.html`）与 `http`（`standalone-split.html` 模块版）双环境各跑一次，确认全绿且断言总数 = **393 + 新增（约 25–30 条）**。
8. **不改** `ext.yml` / CHANGELOG / 不 commit（留待发布阶段）。

## 9. 自检清单（实现后逐条打勾）

- [ ] `render.js` / `index.html` / `standalone.html` 三处的**调用点参数**均为 `jqGanzhiOf(st, yearGan, i)`（3/3）。
- [ ] 三处均新增了 `var yearGan = yearPillar(year).gan;`，且位置在 **`for` 循环之前**（3/3）。
- [ ] 三处函数体一致：`jieqiMonthGZ` + `jqGanzhiOf`，未引用 `dayPillar`（3/3）。
- [ ] 三处导出块均含 `jieqiMonthGZ: jieqiMonthGZ,`，且仍保留 `jqGanzhiOf: jqGanzhiOf,`（3/3）。
- [ ] `.jq-gz` 输出形态**逐字节**仍为 `<div class="jq-gz"><span class="jq-gan">干</span><span class="jq-zhi">支</span></div>`，**未插入任何属性**。
- [ ] 行序未变：`jq-md → jq-tm → jq-tsmd → jq-tstm → jq-name → jq-gz`。
- [ ] 未触碰 `hasLng` / `trueSolarTime` / `refreshJieqi` / `_jieqiLng` / `MONTH_TERM` 循环逻辑（v0.27 零回归）。
- [ ] v0.28 断言段在 `main.js` / `index.html` / `standalone.html` 三处**逐字节相同**，且插在 `// 渲染结果（增强版` **之前**。
- [ ] 1982 立春列显示 **壬寅**（不再是 戊午）；1982 小寒列为 **癸丑**（不是 乙丑）。
- [ ] `?test=1` 双环境全绿；v0.26 的 339 + v0.27 的 54 **仍全绿**。
- [ ] `bash scripts/check-release.sh` EXIT=0；§6.2 人工 diff 两行均 `True`。
- [ ] `ext.yml` 仍为 `0.27.0`、CHANGELOG 未改、无 git commit。

---

## 10. PRD 勘误（N2）

| 项 | PRD 原文（§4.3 反例警示） | **实测更正** |
|---|---|---|
| 1982 小寒误用次年干的结果 | 「否则 1982 年小寒会错成**甲寅**」 | 误用 `yearPillar(1983).gan = 癸` → 小寒 = **乙丑**（实测）；正解 **癸丑** |

- 复算依据：`TG.indexOf(WU_HU_DUN['癸']) = TG.indexOf('甲') = 0` → `TG[(0 + 11) % 10] = TG[1] = 乙` → **乙丑**。
- 影响：**不影响 PRD 设计结论**（「年基必须取 `year`」成立且本 ADR 已锁定）；仅示例数值需更正。建议 PRD 作者在下一版 PRD 中顺手修订，或在 §7.3 批注体系里补一条。

---

## 11. 附录：本次勘察实测原始数据

### 11.1 锚点复算输出（`node /tmp/adr28_anchor.js`，2026-09-10 实测）
```
CONST keys: 35 | ALGO keys: 40
=== 1982 yearPillar = 壬戌 (idx 58)
i | term | 交节(BJT) | 新口径月建 | 旧口径日柱
0 | 立春 | 2/4 11:45 | 壬寅 | 戊午
1 | 惊蛰 | 3/6 05:54 | 癸卯 | 戊子
2 | 清明 | 4/5 10:52 | 甲辰 | 戊午
3 | 立夏 | 5/6 04:19 | 乙巳 | 己丑
4 | 芒种 | 6/6 08:35 | 丙午 | 庚申
5 | 小暑 | 7/7 18:54 | 丁未 | 辛卯
6 | 立秋 | 8/8 04:41 | 戊申 | 癸亥
7 | 白露 | 9/8 07:31 | 己酉 | 甲午
8 | 寒露 | 10/8 23:02 | 庚戌 | 甲子
9 | 立冬 | 11/8 02:04 | 辛亥 | 乙未
10 | 大雪 | 12/7 18:48 | 壬子 | 甲子
11 | 小寒 | 1/6 05:58 | 癸丑 | 甲午
1982 锚点比对: ✅ 12/12 全中
交叉验证 ALGO.monthPillar(1982,2,15,12,0,'壬') = {"gan":"壬","zhi":"寅","monthIdx":0}
2026 yearGan=丙 直推寅月=庚寅 monthPillar=庚寅 ✅
2000 yearGan=庚 直推寅月=戊寅 monthPillar=戊寅 ✅
1990 yearGan=庚 直推寅月=戊寅 monthPillar=戊寅 ✅
1982 yearGan=壬 直推寅月=壬寅 monthPillar=壬寅 ✅
2100 yearGan=庚 直推寅月=戊寅 monthPillar=戊寅 ✅
小寒列：yearPillar(1982).gan=壬 → 癸丑 | 若误用 yearPillar(1983).gan=癸 → 乙丑 (应为癸丑)
2100 块：getSolarTerm(2101,0)= null → st=null 时 gz 应保持占位
```

### 11.2 被替换的原文（v0.27 内测态，回滚用）

`render.js:356-363`（= `index.html`/`standalone.html:7435-7442`），**逐字节**如下：
```js
// D1 每列干支：交节当天（公历自然日）的日柱，天干上、地支下竖排。
// 取 UTC 字段直接定位自然日 → dayPillar，不做 23 点换算（与日历标注一致）。
// st 为 null（表外越界）时返回占位。日后如需切月柱只改本函数内部。
function jqGanzhiOf(st) {
  if (!st) return '<span class="jq-gan">—</span><span class="jq-zhi">—</span>';
  var p = dayPillar(st.getUTCFullYear(), st.getUTCMonth() + 1, st.getUTCDate());
  return '<span class="jq-gan">' + p.gan + '</span><span class="jq-zhi">' + p.zhi + '</span>';
}
```

### 11.3 三端一致性现状（v0.28 实现前实测）
```
--- render.js ---
  index内联 vs standalone内联 : SAME
  index内联 vs 外部render.js : SAME
  standalone内联 vs 外部 : SAME
  len inline=87219 inlineS=87219 ext=87219
--- main.js ---
  index内联 vs standalone内联 : SAME
  index内联 vs 外部main.js : SAME
  standalone内联 vs 外部 : SAME
  len inline=73596 inlineS=73596 ext=73596
```

### 11.4 关键锚点行号速查（三端，2026-09-10 实测）

| 语义 | `render.js` | `index.html` | `standalone.html` | `main.js` |
|---|---|---|---|---|
| `var needLngHint = false;` | 316 | 7395 | 7395 | — |
| 调用点 `jqGanzhiOf(st)` | 345 | 7424 | 7424 | — |
| 注释（3 行） | 356-358 | 7435-7437 | 7435-7437 | — |
| `function jqGanzhiOf(st)` | 359-363 | 7438-7442 | 7438-7442 | — |
| 导出 `jqGanzhiOf:` | 1672 | 8751 | 8751 | — |
| 测试段插入点（`// 渲染结果（增强版` 之前） | — | 10340 | 10340 | 1564 |
| `dayPillar` 别名 | 53 | — | — | — |
| `WU_HU_DUN` 别名 | 29 | 4154 等 | — | — |

---

## 12. 变更记录

| 版本 | 日期 | 内容 | 作者 |
|---|---|---|---|
| v1.0 | 2026-09-10 | 初版定稿：D1–D6 裁决 + N1 校验盲区 + N2 PRD 勘误 + 改动定位 + 三端同步 + 断言清单 + 回滚预案 | 架构师（worker_67a0976f） |
