# ADR v0.27.0：节气区新增「真太阳日月 / 真太阳时间」

> 文档归属：八字排盘 · 从真版 · 架构决策记录（ADR）
> 作者：架构师（worker_67a0976f）
> 日期：2026-09-10
> 状态：**待实现**（Leader 已裁定 PRD §14 三项口径，见 §0.2）
> 上游 PRD：`docs/PRD_v0.27.0_节气真太阳时.md`（双副本 md5 `676410d230883b80121590a5bf02dd87`）
> 基线：tag `v0.26.0`（已正式发布）
> 上一版 ADR：`docs/ADR_v0.26.0_节气流年联动.md`（v0.27 在其成果上叠加）
> 双副本：工作目录 `docs/ADR_v0.27.0_节气真太阳时.md` ｜ 主仓库 `bazi-paipan/docs/ADR_v0.27.0_节气真太阳时.md`

---

## 0. 结论摘要（TL;DR）

在 v0.26.0「当年节气数据块」基础上，为 12 个节气列的**每一列追加两行**：
`☀ 真太阳日月（M/D）` + `☀ 真太阳时间（HH:MM）`，值 = 交节时刻（BJT）经**出生地经度**换算的
真太阳时。**复用既有 `ALGO.trueSolarTime`，不新增算法**；**不改排盘口径、不改干支（D1）**。

技术核心 = 三件事：
1. **经度贯穿**：`doPaipan` 无条件 `getLng()`，把 `lng` 写入 `data.lng`（三入口一致），渲染后写 `container._jieqiLng`。（D1/D3）
2. **签名扩展 + 判空**：`buildJieqiHtml(year, lng)` 增 `lng` 参数；`lng` 非有限数 → 两行「—」+ 标题轻提示。**必须显式判空**，因 `trueSolarTime(..., undefined)` 不抛异常而是返回 `NaN`（实测），靠 try/catch 会把 `NaN/NaN` 漏到界面。（D2）
3. **插入位置硬约束**：两行插在 `.jq-tm` **之后**、`.jq-name` **之前** → 保 v0.26 断言 T03 正则（`.jq-md`→`.jq-tm` 相邻）不回归。（D2）

改动面：`render.js`（4 处）+ `main.js`（新增测试）+ 三端 HTML（内联 JS 副本 & CSS）+ `scripts/check-release.sh`（KEYS 扩展）。`algorithm.js` **零改动**。

### 0.1 与 v0.26.0 的关系
- v0.26.0 已上线：节气块（`buildJieqiHtml` / `refreshJieqi` / `_jieqiYear` 状态 / 流年联动）。
- v0.27.0 = **纯增量展示**：新增字段与两行 DOM、新增一个经度状态 `_jieqiLng`、扩展两函数签名（**向后兼容**，缺省即旧行为）。
- 不修改 v0.26 的任何既有行为（联动、双胞胎归属、越界占位、干支口径）。

### 0.2 Leader 已裁定（本次 ADR 采纳，不再列为待决）
1. 「两列」= **列内追加两行**（`.jq-tsmd` / `.jq-tstm`），12 节气仍横排；硬约束插入于 `jq-tm` 之后、`jq-name` 之前。
2. 真太阳两行与 `useSolar` 勾选**解耦，始终展示**（有经度即展示；`lng` 空则「—」）。
3. 两行加「☀」标识以区分北京时间。

---

## 一、目标与范围

### 1.1 目标
| # | 目标 | 落点 |
|---|---|---|
| G1 | 节气块每列新增 `☀ 真太阳日月` / `☀ 真太阳时间` 两行 | `buildJieqiHtml` |
| G2 | 值 = 交节 BJT 经出生地经度换算的真太阳时（可跨日） | 复用 `ALGO.trueSolarTime` |
| G3 | 年份切换（点流年/大运/📍今年）两行随年份刷新 | `refreshJieqi` 经度回传 |
| G4 | 未选出生地 → 两行「—」+ 提示，不抛异常 | 判空分支 |
| G5 | 三端同步（index/**standalone**/standalone-split）+ 断言回归 | 同步纪律 |

### 1.2 非目标（沿用 PRD §8）
- 不改干支口径（仍 BJT 公历自然日日柱）。
- 不改 12 节范围、不加「气」。
- 不新增用户输入项（不加经度手输框）。
- 不改排盘主流程真太阳时开关逻辑。
- 不改节气块 12 节范围与越界占位逻辑。

### 1.3 口径澄清（源自 PRD，ADR 固化）
- `.jq-tsmd` / `.jq-tstm` 的经度来源 = **出生地经度**（`LOC_DATA` 省/市 → `lng`），与命主是否勾选真太阳时排盘无关。
- 真太阳日月可跨日（如清明 BJT 4/5 02:39 → 经度 75.99 真太阳 4/4 23:40）。
- `trueSolarTime` 已处理跨月/跨年与分钟进位，本版直接复用。

---

## 二、现状核实（代码事实，2026-09-10 勘察）

| 项 | 事实 | 位置 |
|---|---|---|
| 节气块构建 | `buildJieqiHtml(year)`，纯函数，三处调用均传 `nowYear` | `render.js:304-337` |
| 节气块刷新 | `refreshJieqi(root, year)` 整块替换 `.jieqi-section`，回写 `root._jieqiYear` | `render.js:363-371` |
| 干支口径 | `jqGanzhiOf(st)` 取 UTC 自然日日柱 | `render.js:340-346` |
| 节气年份换算 | `liunianYearOf(cd,dyIdx,lnIdx)` | `render.js:352-357` |
| 三入口渲染 | 单人 `renderChart` / 同卵 `renderTwinCardsHtml` / 龙凤胎 `renderLongFengCardsHtml` | `render.js:648 / 1199 / 1309` |
| 容器状态 | `container._paipanData`、`container._jieqiYear` | `render.js:655-656 / 1203-1204 / 1321-1322` |
| 龙凤胎年份变量 | `var y = d1.y`（老大出生年），`buildJieqiHtml(y)` | `render.js:1216 / 1309` |
| 流年联动调用点 | 大运点击 / 流年点击 / `scrollToNow` | `render.js:697 / 733 / 1464` |
| 真太阳时算法 | `ALGO.trueSolarTime(y,m,d,h,mi,lng)` → `{y,m,d,h,mi,offsetMin,orig}`；跨日/进位已处理 | `algorithm.js:156` |
| 均时差 | `equationOfTime`（Spencer 1971） | `algorithm.js:148` |
| 经度读取 | `getLng()` 读 `#inProv/#inCity` → `LOC_DATA`；未选返回 `null` | `algorithm.js:128` |
| **经度现状** | `doPaipan` **仅在 `useSolar` 勾选时** `getLng()`，且只存 `data.trueSolar`；**`data` 不携带 `lng`** | `render.js:1379-1385` |
| 交节时刻 | `getSolarTerm(y,n)` 返回「BJT as UTC」`Date` | `algorithm.js:182` |
| 三端一 | `index.html` 与 `standalone.html` **字节级相同**（1050567B，同 mtime） | 根目录 |
| 三端二 | `standalone-split.html` 走外链 `render.js/main.js`，CSS 内联 | 根目录 |
| 三端 CSS | `.jq-md` / `.jq-tm` / `.jq-name` | index `279-281`；split `280-282` |
| 发布校验 | `scripts/check-release.sh`：`KEYS`(含 `jieqi-section jq-gz`) + `RUNTIME_KEYS="jieqi-section jq-gz"` | `scripts/check-release.sh` |
| 测试基建 | `?test=1` IIFE，`eq()/fail()/tests[]`；v0.26 T01-T05（纯函数）、T06-T14（真实渲染 #tst-out） | `main.js:770 / 1282 / 1337` |

### 2.1 关键实测（node 复核 PRD §6.3 锚点，复用仓库真实 `ALGO`）

北京 116.4 / 2026（节选）：
| 节 | BJT | 真太阳（116.4） |
|---|---|---|
| 立春 | 2/4 04:01 | **2/4 03:33** |
| 清明 | 4/5 02:39 | 4/5 02:21 |
| 立冬 | 11/7 17:51 | **11/7 17:53**（EoT 正向） |
| 小寒 | 1/5 22:09 | 1/5 21:50 |

跨日：`lng=75.99` 清明 → **4/4 23:40**（跨前）；`lng=131.16` 芒种 → **6/6 00:35**（跨后）。与 PRD §6.3 完全一致。

> **⚠️ 重要实测结论**：`ALGO.trueSolarTime(y,m,d,h,mi,undefined)` **不抛异常**，而是返回
> `{h:NaN, mi:NaN, offsetMin:NaN}`（因 `(undefined-120)*4 = NaN`）。
> 因此「lng 缺省」分支**必须显式判空**，**不能**依赖 `try/catch`——否则会把 `NaN/NaN` 渲染到界面。

---

## 三、架构决策（D1–D8）

### D1　经度贯穿：`data.lng` 无条件写入（唯一经度源）

**现状问题**：`doPaipan` 只在 `useSolar` 为真时才取 `lng`，且只把换算结果存 `data.trueSolar`，`data` 里没有经度 → 未勾选真太阳时排盘时，节气块拿不到经度，功能失效（违反 PRD AC04 解耦）。

**决策**：把 `getLng()` 提为**无条件**执行，并写入三入口 `data.lng`。

```js
// doPaipan（render.js ~1379）改动后：
const lng = getLng();                       // ← 无条件取出生地经度（唯一权威源）
const useSolar = document.getElementById('useSolar').checked;
let tst = null;
if (useSolar) { tst = lng !== null ? trueSolarTime(solarY, solarM, solarD, h, mi, lng) : null; }

// 三入口写字段：
//   单人：  data.lng = lng;
//   同卵：  data.lng = lng;
//   龙凤胎：d1.lng = lng; d2.lng = lng;   // 同址 → 同经度
```

**约束**：
- 字段名固定 `lng`（number | null）。`null`（未选出生地）→ 界面「—」。
- `data.trueSolar` 语义**不变**（勾选时的排盘换算结果），与 `data.lng` 并存互不影响。
- 老存档（`ARCHIVE`）无 `lng` 字段 → `undefined` → 判空走「—」，不崩（向后兼容）。
- `getLng()` 复用同一变量，**不重复调用**（原 `useSolar` 分支内的 `getLng()` 删除，改用外层 `lng`）。

**理由**：真太阳时是「地点属性」，节气块展示的是交节时刻在该出生地的真太阳时，与命主本人是否勾选真太阳时排盘无关（PRD §3.4）。

---

### D2　`buildJieqiHtml(year, lng)`：签名扩展 + 判空 + 两行插入

**签名**：`function buildJieqiHtml(year, lng)`（`lng` 可缺省）。

**判空（关键）**：
```js
var tsmd = '—', tstm = '—';
if (st) {
  if (typeof lng === 'number' && isFinite(lng)) {
    var ts = ALGO.trueSolarTime(st.getUTCFullYear(), st.getUTCMonth() + 1, st.getUTCDate(),
                                st.getUTCHours(), st.getUTCMinutes(), lng);
    tsmd = ts.m + '/' + ts.d;
    tstm = pad(ts.h) + ':' + pad(ts.mi);
  } else {
    needLngHint = true;      // lng 缺省 → 标题轻提示
  }
}
```
> 必须 `isFinite` 判空；`undefined/NaN` 直接跳过调用（见 §2.1 实测）。

**列结构（硬约束顺序）**：
```html
<div class="jq-col" data-term="立春">
  <div class="jq-md">2/4</div>        <!-- 现值 -->
  <div class="jq-tm">04:01</div>      <!-- 现值 -->
  <div class="jq-tsmd">☀ 2/4</div>    <!-- 新增 -->
  <div class="jq-tstm">☀ 03:33</div>  <!-- 新增 -->
  <div class="jq-name">立春</div>
  <div class="jq-gz">…gan/zhi…</div>
</div>
```
- 两行文本前置 `☀`（区分北京时间）；颜色由 CSS `.jq-tsmd/.jq-tstm` 控制（见 D6）。
- **插入点**：`jq-tm` 生成之后、`jq-name` 生成之前 → 保 v0.26 T03 正则 `class="jq-md">…</div><div class="jq-tm">…</div>` 相邻；`jq-gz` 结构不变 → T04 不回归。

**标题提示**：`lng` 缺省时追加 `<span class="jieqi-hint">（未选出生地，真太阳时不可用）</span>`。
与既有 `needHint`（小寒越界「（小寒超出节气表）」）**并列**，两者可同时出现，互不覆盖。

**越界年份**：`year < 1000 || year > 2101` 的整块占位分支**保持不变**（不渲染两行）。

**向后兼容**：旧调用 `buildJieqiHtml(year)`（缺 `lng`）→ 每列两行「—」+ 提示，不抛。故 v0.26 现有测试 T05（越界）不受影响。

---

### D3　`refreshJieqi(root, year, lng)`：经度经容器状态回传（零调用点改动）

**现状**：`refreshJieqi(root, year)` 从 `root._jieqiYear` 语义 + `buildJieqiHtml(year)`。v0.26 三个调用点（大运/流年/scrollToNow）只传 `(container, year)`。

**决策**：新增容器状态 `_jieqiLng`（与 `_jieqiYear` 同层），`refreshJieqi` 读取顺序：
1. **显式第三参** `lng`（若 `typeof lng === 'number' && isFinite(lng)`）→ 采用，并回写 `root._jieqiLng`；
2. 否则 `root._jieqiLng`；
3. 否则 `root._paipanData && root._paipanData.lng`（兜底）。

```js
function refreshJieqi(root, year, lng) {
  var sec = root.querySelector('.jieqi-section');
  if (!sec) return;
  if (!(typeof lng === 'number' && isFinite(lng))) {
    lng = (typeof root._jieqiLng === 'number' && isFinite(root._jieqiLng))
          ? root._jieqiLng
          : (root._paipanData ? root._paipanData.lng : undefined);
  } else {
    root._jieqiLng = lng;
  }
  root._jieqiYear = year;
  var tmp = document.createElement('div');
  tmp.innerHTML = buildJieqiHtml(year, lng);
  var neu = tmp.firstChild;
  if (neu) sec.parentNode.replaceChild(neu, sec);
}
```

**收益**：
- v0.26 的三个调用点（`render.js:697 / 733 / 1464`）**零改动**，自动跟随容器经度。
- 第三参保留 → 便于测试注入经度、也便于未来需要时显式覆盖。
- 签名向后兼容：`refreshJieqi(root, year)` 仍可用。

**同步写入**：三入口渲染时在写 `_jieqiYear` 的同一处写 `_jieqiLng`（见 D5 的具体位置）。

---

### D4　初始口径（延续 v0.26 D6，不变）

- 三入口初始渲染：`buildJieqiHtml(y, lng)`（**出生年 + 出生地经度**）。
  - 单人：`buildJieqiHtml(y, data.lng)`（`render.js:648`）
  - 同卵：`buildJieqiHtml(y, data.lng)`（`render.js:1199`）
  - 龙凤胎：`buildJieqiHtml(d1.y, d1.lng)`（`render.js:1309`，`y = d1.y`）
- `nowYear` 仍只用于大运高亮（`cc`）、顶部「当前年」文案、📍今年定位；**不参与**节气块初始年份。
- 初始「高亮 = nowYear」与「节气块 = 出生年」的有意不同步，延续 v0.26，本版不改。

---

### D5　双胞胎（同卵 / 龙凤胎）

- `d1.lng = d2.lng = lng`（同址同经度）。
- 共享节气块**唯一**（`.bz-twin-shared` 内一块），`refreshJieqi(container, year)` 命中共享块。
- 渲染后写容器经度：
  - 同卵：`render.js:1204` 旁 → `container._jieqiLng = data.lng;`
  - 龙凤胎：`render.js:1322` 旁 → `container._jieqiLng = d1.lng;`
- 与 v0.26「点谁跟谁」无耦合：真太阳时是**地点**属性，双胞胎同址 → 同一值，点老大/老二侧年份变化时两行同步刷新。
- `switchTwinMode`（仅切 class）无需任何改动。

---

### D6　CSS：`.jq-tsmd` / `.jq-tstm`（三端）

在 `.jq-tm` 规则之后新增（三端 HTML 的 `<style>` 内）：
```css
.jq-tsmd { font-size:13px; color:#c9a96e; }
.jq-tstm { font-size:13px; color:#c9a96e; }
```
- 颜色 `#c9a96e` = 节气标题底色 `rgba(201,169,110,.06)` 同源暖金，**无需新增 CSS 变量**；与 `.jq-md/.jq-tm`（`--c-gray`）区分明显。
- 不改变行高/边框（`.jq-col > div` 规则已统一 `padding/border`），列高自然增加两行。
- 落点：`index.html`（`.jq-tm` L280 后）、`standalone.html`（同 index）、`standalone-split.html`（`.jq-tm` L281 后）。

---

### D7　三端同步 + `check-release.sh` 防线

- 三端文件：`index.html`、`standalone.html`（**二者字节级一致**）、`standalone-split.html`。
- **同步红线**：`render.js` / `main.js` 的任何改动，必须同步到 `index.html` 与 `standalone.html` 的**内联副本**（二者保持一致），否则 `check-release.sh` 【2/4】【4/4】失败，禁止发布。
- `standalone-split.html` 走外链 JS，**只需同步 CSS**。
- **扩展 `scripts/check-release.sh`**：`RUNTIME_KEYS="jieqi-section jq-gz"` → `"jieqi-section jq-gz jq-tsmd jq-tstm"`。
  - 理由：`jq-tsmd/jq-tstm` 出现在 CSS（三端都有 `.jq-tsmd {` 但非 `class="`）与运行时生成的 HTML（`class="jq-tsmd"`，仅在 render.js）；对 `standalone-split.html` 的 `class=` 检查需回退到 `render.js` 源码命中——与 `jq-gz` 同策略。
- `ext.yml`（0.26.0→0.27.0）、`CHANGELOG.md`、`SYSTEM.md` 版本表由**发布师**负责，本 ADR 列出即可。

---

### D8　测试：新增 v0.27 T01–T07（`?test=1`）

新增独立 IIFE，`section = '节气真太阳时(v0.27)'`，插在 v0.26「节气流年联动」块（`main.js` v0.26 T14 结尾 `})();`）**之后**、结果渲染之前。

| 编号 | 断言 | 依据 |
|---|---|---|
| **v0.27-T01** | `RJ(2026, 116.4)` 含 12 组 `.jq-tsmd/.jq-tstm`；立春=`2/4 03:33`、立冬=`11/7 17:53` | AC01/AC02 |
| **v0.27-T02** | `RJ(2026, 75.99)` 清明 `.jq-tsmd`=`4/4`、`.jq-tstm`=`23:40`（跨前一日） | AC02 |
| **v0.27-T03** | `RJ(2026, 131.16)` 芒种 `.jq-tsmd`=`6/6`、`.jq-tstm`=`00:35`（跨后一日） | AC02 |
| **v0.27-T04** | `RJ(2026)`（`lng` 缺省）→ 两行「—」、不抛、标题含「未选出生地」 | AC03 |
| **v0.27-T05** | DOM 行序正则 `jq-md→jq-tm→jq-tsmd→jq-tstm→jq-name` | AC07 / 回归 R01 |
| **v0.27-T06** | `renderChart` 后 `container._jieqiLng === 数据经度`；`refreshJieqi` 切年后真太阳值随之变 | AC04/AC05 |
| **v0.27-T07** | 同卵/龙凤胎共享块**仅 1 组**真太阳两行，且随年份刷新 | AC06 |

**测试要点**：
- T01–T04 为纯函数断言（同 v0.26 T01-T05 风格，直接 `RJ(year, lng)` 取字符串）。
- T06/T07 需真实渲染：沿用 v0.26 T06+ 的 `#tst-out` 容器 + `pd.lng = 116.4` 注入（`paipan` 不产出 lng，测试内手动赋值为准），
  用 `tst.querySelectorAll('.jq-tsmd')` 计数、正则抽值断言。
- **不 mock 时钟**；年份差异用显式 `refreshJieqi(tst, 2026, 116.4)` 或点击驱动。

---

## 四、改动定位清单（三端）

> 行号为 2026-09-10 勘察快照；`index.html` 内联副本行号 ≈ 外部文件行号 + 固定偏移（render.js 段约 +7076）。

| # | 文件 | 位置（现状） | 改动 | 类型 |
|---|---|---|---|---|
| 1 | `algorithm.js` | — | **不改**（复用 `ALGO.trueSolarTime` / `getLng` / `getSolarTerm`） | — |
| 2 | `render.js` | `buildJieqiHtml` `L304-337` | 签名 `(year,lng)`；每列增两行；`isFinite` 判空；标题提示 | 核心 |
| 3 | `render.js` | `refreshJieqi` `L363-371` | 增 `lng` 回退读取（第三参/`_jieqiLng`/`_paipanData.lng`）；`buildJieqiHtml(year, lng)` | 核心 |
| 4 | `render.js` | `doPaipan` `L1379-1385` | `getLng()` 提为无条件；三入口写 `data.lng`/`d1.lng`/`d2.lng` | 核心 |
| 5 | `render.js` | `renderChart` `L648`(调用) / `L655-656`(状态) | `buildJieqiHtml(y, data.lng)`；`container._jieqiLng = data.lng` | 核心 |
| 6 | `render.js` | `renderTwinCardsHtml` `L1199`(调用) / `L1203-1204`(状态) | `buildJieqiHtml(y, data.lng)`；`container._jieqiLng = data.lng` | 核心 |
| 7 | `render.js` | `renderLongFengCardsHtml` `L1309`(调用) / `L1321-1322`(状态) | `buildJieqiHtml(d1.y, d1.lng)`；`container._jieqiLng = d1.lng` | 核心 |
| 8 | `render.js` | `scrollToNow L1464` / `bindEvents L697,L733` | **不改**（`refreshJieqi` 自动读容器经度） | — |
| 9 | `index.html` | CSS `L280` 后；内联 render.js 段（`buildJieqiHtml L7380`、`refreshJieqi L7439`、调用 `L7724/8275/8385`、状态 `L655` 对应段）；内联 main.js 测试段 `L10022` 后 | 同步 render.js + main.js + CSS 三处 | 同步 |
| 10 | `standalone.html` | 同 `index.html` | **必须与 index.html 字节级一致** | 同步 |
| 11 | `standalone-split.html` | CSS `L281` 后 | **仅 CSS**（JS 走外链） | 同步 |
| 12 | `main.js` | v0.26 T14 块 `})();` 后（`L1436` 附近） | 新增 v0.27 T01-T07 独立 IIFE | 测试 |
| 13 | `scripts/check-release.sh` | `RUNTIME_KEYS` 行 | 追加 `jq-tsmd jq-tstm` | 防线 |
| 14 | `ext.yml` / `CHANGELOG.md` / `SYSTEM.md` | 版本 0.26.0→0.27.0 | 发布师负责 | 发布 |

**内联副本定位提示（index.html）**：`buildJieqiHtml` 函数体在 `L7380` 起；`refreshJieqi` `L7439` 起；`renderChart` 内调用 `L7724`；同卵共享区 `L8275`；龙凤胎共享区 `L8385`；`scrollToNow` 内调用 `L8540`；`RENDER` 导出 `buildJieqiHtml/refreshJieqi` `L8714/L8717`。**以 `check-release.sh`【4/4】外部 vs 内联逐段一致校验为准**。

---

## 五、风险矩阵

| 编号 | 风险 | 等级 | 触发条件 | 缓解 / 验证 |
|---|---|---|---|---|
| **R-V27-01** | `lng` 未判空 → `trueSolarTime` 收 `undefined` 返回 `NaN` → 渲染 `NaN/NaN` | **P0** | 用 try/catch 代替判空（实测不抛） | D2 显式 `isFinite` 判空；T04 断言「—」 |
| **R-V27-02** | 两行插错位置（插在 `jq-md` 与 `jq-tm` 之间）→ 破 v0.26 T03 正则 | **P0** | 插入点错误 | D2 硬约束（`jq-tm` 之后）；T05 + v0.26 T03 回归 |
| **R-V27-03** | `data.lng` 未贯穿（仍只在 `useSolar` 内取）→ 未勾选时全「—」功能失效 | **P0** | `getLng()` 未提为无条件 | D1 无条件取；三入口写入；T06 + AC04 |
| **R-V27-04** | 三端不同步（改了 render.js 未改内联副本） | **P0** | 手工漏同步 | D7 同步纪律；`check-release.sh`【2/4】【4/4】 |
| **R-V27-05** | `check-release.sh` 未加 `jq-tsmd/jq-tstm` → 无结构性防线 | P2 | KEYS 未扩展 | D7 追加 `RUNTIME_KEYS` |
| **R-V27-06** | 双胞胎 `d1/d2` 未写 `lng` → 共享块「—」 | P1 | 入口漏写 | D5 三入口统一写；T07 |
| **R-V27-07** | `refreshJieqi` 经度回退顺序错 → 切年后不刷新/取错地点 | P1 | 回退链写错 | D3 固定回退顺序；T06 |
| **R-V27-08** | 越界年份整块占位被破坏 | P1 | 改动 for 循环误伤前置分支 | 占位分支前置不动；v0.26 T05 回归 |
| **R-V27-09** | 真太阳跨月/跨年边界 | P3 | 极端经度 | `trueSolarTime` 已处理；T02/T03 抽验跨日 |
| **R-V27-10** | `☀` 前缀 / 新样式破坏既有断言 | P3 | 正则过窄 | v0.26 T03/T04 全绿；T05 行序 |
| **R-V27-11** | 老存档无 `lng` 字段 | P3 | 加载历史记录 | `undefined` → 「—」，不崩（D1） |
| **R-V27-12** | `data.trueSolar` 与新 `data.lng` 混淆 | P3 | 语义混用 | D1：二者并存、语义独立 |

---

## 六、编程师实现指引（7 步）

> 基线 = **tag `v0.26.0` 已发布态**（当前工作区即 v0.26.0，含 v2 节气联动成果）。

1. **算法层（不改）**：确认 `algorithm.js` 导出 `ALGO.trueSolarTime`（`L156`）与 `ALGO.getLng`（`L128`）可直接复用；**不新增算法**。
2. **`render.js` → `buildJieqiHtml(year, lng)`**：按 D2 改造（判空 + 两行插入 `jq-tm` 之后 + 标题提示 + 越界分支不动）。
3. **`render.js` → `refreshJieqi(root, year, lng)`**：按 D3 增经度回退链 + 回写 `_jieqiLng`。
4. **`render.js` → `doPaipan`**：`getLng()` 提为无条件；三入口写 `data.lng` / `d1.lng` / `d2.lng`（D1）。
5. **`render.js` → 三入口渲染**：`buildJieqiHtml(y[, lng])` 传经度；写 `container._jieqiLng`（D4/D5；`renderChart L648/655`、`renderTwinCardsHtml L1199/1203`、`renderLongFengCardsHtml L1309/1321`）。
6. **三端 CSS**：`index.html`/`standalone.html`/`standalone-split.html` 加 `.jq-tsmd/.jq-tstm`（D6）。
7. **测试 + 防线 + 文档**：
   - `main.js` 新增 v0.27 T01-T07（D8）；
   - `scripts/check-release.sh` `RUNTIME_KEYS` 追加 `jq-tsmd jq-tstm`（D7）；
   - 同步三端（`index.html` == `standalone.html`；内联段 == 外部 `render.js/main.js`）；
   - 运行 `bash scripts/check-release.sh` 直至「全部校验通过」；
   - 文档（`ext.yml` 0.27.0 / `CHANGELOG.md` / `SYSTEM.md`）由发布师补齐。
8. **自测**：浏览器打开 `index.html?test=1`，确认 v0.26 全量（T01–T14）+ v0.27（T01–T07）全绿。

---

## 七、验证与回滚预案

### 7.1 验证
- **自动化**：`?test=1` 页面 v0.26 全量（**339 条**）+ v0.27 T01-T07 全绿。
- **三端一致性**：`bash scripts/check-release.sh` → 「🎉 全部校验通过」（含 4 段检查）。
- **手工抽验**（真实 UI）：
  1. 出生地选**克拉玛依/喀什**（经度 ~75.99），排盘 → 清明列真太阳日月应为 `4/4`（跨前）。
  2. 出生地选**双鸭山**（经度 ~131.16），芒种列真太阳时间应为 `6/6 00:35`（跨后）。
  3. 出生地**留空** → 两行「—」+ 标题「未选出生地，真太阳时不可用」。
  4. 点流年/大运/📍今年 → 两行随年份刷新。
  5. 双胞胎（同卵/龙凤胎）→ 共享块仅一组两行。

### 7.2 回滚
- **基线**：tag `v0.26.0`（已正式发布，`git tag` 可见）。
- **全量回滚**（如发版后发现问题）：
  ```
  git checkout v0.26.0 -- index.html standalone.html standalone-split.html \
                          render.js main.js scripts/check-release.sh
  bash scripts/check-release.sh          # 确认三端一致
  ```
  （`ext.yml` / `CHANGELOG.md` / `SYSTEM.md` 由发布师一并回退）
- **局部回退**（仅关掉真太阳两行，保留其余）：
  1. 三入口调用改回 `buildJieqiHtml(y)`（忽略 `lng`）；
  2. 或 `buildJieqiHtml` 内两行渲染分支短路。
  → 不影响 v0.26 既有功能（联动/双胞胎/越界）。
- **发布节奏**：先发**内测 tag** 验证（三端 + 断言），AC 全绿后再发**正式 tag**。

---

## 八、验收映射表

### 8.1 功能验收（PRD §6.1）
| AC | 内容 | 落点 | 断言 |
|---|---|---|---|
| v0.27-AC01 | 有出生地：每列显示真太阳日月/时间，格式同 `.jq-md/.jq-tm` | D2/D6 | T01 |
| v0.27-AC02 | 真太阳 = `trueSolarTime(交节 BJT, 出生地经度)`，跨日随变 | D2 | T01/T02/T03 |
| v0.27-AC03 | 未选出生地 → 两行「—」+ 提示，不抛 | D2 | T04 |
| v0.27-AC04 | 与 `useSolar` **解耦**（未勾选也展示，只要有经度） | D1 | T06 + 手工 |
| v0.27-AC05 | 点流年/大运/📍今年 → 两行随年份刷新 | D3/D4 | T06 |
| v0.27-AC06 | 双胞胎共享块含两行且显示当前年份 | D5 | T07 |
| v0.27-AC07 | 插入位置 `jq-tm`→后/`jq-name`→前；每列 6 行；横排不变；有 `☀` 标识 | D2/D6 | T05 |
| v0.27-AC08 | 越界年份沿用整块占位；小寒 null → 「—」 | D2 | v0.26 T05 回归 |

### 8.2 回归验收（PRD §6.2）
| 编号 | 内容 | 保障 |
|---|---|---|
| v0.27-R01 | v0.26 全量断言（T01–T14，339 条）仍全绿（尤其 T03/T04） | D2 插入点约束；`?test=1` |
| v0.27-R02 | 三端渲染一致，`check-release.sh` 通过 | D7 同步纪律 |
| v0.27-R03 | 未选出生地 / 表外年份 / 2100 小寒 边界不抛 | D2/越界分支；T04 + v0.26 T05 |

### 8.3 新增断言（PRD §6.3）
v0.27-T01 ~ T07，见 D8 表。

---

## 九、自检清单（实现后逐条核对）

1. [ ] `buildJieqiHtml` 第二参缺省时**不调用** `trueSolarTime`（`isFinite` 判空），界面无 `NaN`。
2. [ ] 两行插在 `.jq-tm` **之后**、`.jq-name` **之前**（`grep` 验证 DOM 顺序）。
3. [ ] `doPaipan` 中 `getLng()` **无条件**执行（不在 `if (useSolar)` 内）。
4. [ ] 三入口 `data.lng` / `d1.lng` / `d2.lng` 均写入（`grep` 验证）。
5. [ ] 三入口 `container._jieqiLng` 均写入。
6. [ ] `refreshJieqi` 经度回退顺序正确（第三参 → `_jieqiLng` → `_paipanData.lng`）。
7. [ ] 三端 CSS 均含 `.jq-tsmd/.jq-tstm`。
8. [ ] `index.html` 与 `standalone.html` **字节级一致**（`cmp`）。
9. [ ] 内联 render.js/main.js 段与外部文件**逐段一致**（`check-release.sh`【4/4】）。
10. [ ] `RUNTIME_KEYS` 已加 `jq-tsmd jq-tstm`。
11. [ ] `?test=1`：v0.26 全量 + v0.27 T01-T07 全绿，无失败。
12. [ ] `bash scripts/check-release.sh` 退出码 0。

---

## 十、附：锚点数据（2026，供测试与人工核对）

| 节 | BJT（北京时间） | 真太阳·北京 116.4 | 真太阳·喀什 75.99 | 真太阳·双鸭山 131.16 |
|---|---|---|---|---|
| 立春 | 2/4 04:01 | 2/4 03:33 | 2/4 00:51 | 2/4 04:32 |
| 惊蛰 | 3/5 21:58 | 3/5 21:31 | 3/5 18:50 | 3/5 22:31 |
| 清明 | 4/5 02:39 | 4/5 02:21 | **4/4 23:40** | 4/5 03:21 |
| 立夏 | 5/5 19:48 | 5/5 19:37 | 5/5 16:55 | 5/5 20:36 |
| 芒种 | 6/5 23:48 | 6/5 23:36 | 6/5 20:54 | **6/6 00:35** |
| 小暑 | 7/7 09:56 | 7/7 09:37 | 7/7 06:55 | 7/7 10:36 |
| 立秋 | 8/7 19:42 | 8/7 19:22 | 8/7 16:40 | 8/7 20:21 |
| 白露 | 9/7 22:40 | 9/7 22:27 | 9/7 19:46 | 9/7 23:26 |
| 寒露 | 10/8 14:28 | 10/8 14:26 | 10/8 11:45 | 10/8 15:25 |
| 立冬 | 11/7 17:51 | **11/7 17:53** | 11/7 15:11 | 11/7 18:52 |
| 大雪 | 12/7 10:52 | 12/7 10:46 | 12/7 08:04 | 12/7 11:45 |
| 小寒 | 1/5 22:09 | 1/5 21:50 | 1/5 19:08 | 1/5 22:49 |

> 上表由 `node` 加载仓库真实 `constants.js + algorithm.js`、调用 `ALGO.trueSolarTime` 计算得出（非手写公式复刻），与 PRD §6.3 锚点逐一吻合。

---

*（本 ADR 覆盖 PRD §11「给架构师的 ADR 输入」四项：①`lng` 贯穿方案与函数签名=D1/D2/D3；②缺省 `lng` 的「—」与提示策略=D2；③CSS 命名与视觉标识=D6；④三端同步清单与校验点=D7。可交编程师实现。）*
