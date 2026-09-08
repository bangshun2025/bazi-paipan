# ADR v0.26.0 — 节气流年联动（v2 增量技术方案）

> **版本**：v1.0
> **日期**：2026-09-07
> **作者**：架构师（worker_67a0976f）
> **状态**：待评审
> **关联文档**：
> - v2 PRD（本决策唯一需求源）：`PRD_v0.26.0_节气流年联动.md`（产品经理 docs/ 与主仓库 docs/ 双副本一致，md5=cf316446a39842a1d2fecac0641cb2d2）
> - v1 PRD：`PRD_v0.26.0_当年节气数据.md`（v1 全部 AC 仍有效，除 §二修订表所列条目）
> - v1 ADR：`ADR_v0.26.0_当年节气数据.md`（md5=a8dc4abcff0013edd45a37767d50e3ac，v2 在其上叠加）

## 📌 与 v1 ADR 的关系（先读这段）

- **v1 ADR 决策 D1-D4 全部仍有效、不推翻**：D1（干支=交节当天公历自然日日柱）不变；D2（`buildJieqiHtml(year)` 纯函数、MONTH_TERM 遍历、末位小寒 year+1、UTC 字段直取）**契约保持**；D3（渲染位置/版式/jq-* 类名）不变；D4（越界哨兵）不变、**判定对象由 nowYear 变为 jieqiYear**。
- **v2 只新增一层「状态 + 联动」**：v1 把节气块做成静态展示（渲染期一次性 `buildJieqiHtml(nowYear)`）；v2 把它升级为「年份可变的动态块」——引入独立状态 jieqiYear、三处点击入口联动、局部 DOM 刷新。**v2 不修改 v1 buildJieqiHtml 的纯函数逻辑**（签名 `buildJieqiHtml(year)` 不变，year 入参即节气区年份），只在「调用处传什么年份」与「点击后如何局部重渲染」上做文章。
- v2 新增决策编号为 **D5-D9**（接 v1 D4 后），避免与 v1 编号混淆。

## ⚠️ 目标文件信息（v2 增量）

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `render.js`（主改动，外部模块版） |
| 当前行数 | 1623 行（实测，v1 已实施后） |
| v2 改动类型 | ① 新增 `liunianYearOf(cardData, dyIdx, lnIdx)`（年份换算纯函数，与 updateCardDyLnColumns 同式）② 新增 `refreshJieqi(container, year)`（局部重渲染节气块 + 回写 `container._jieqiYear`）③ 三处渲染入口初始年份 `buildJieqiHtml(nowYear)` → `buildJieqiHtml(出生年)` ④ 三入口渲染后设 `container._jieqiYear = 出生年` ⑤ bindEvents 流年/大运点击回调末尾追加 refreshJieqi ⑥ scrollToNow 末尾追加 refreshJieqi(nowYear) ⑦ 双胞胎运前列 li 补 `data-di="-1"/data-li`（与单人 renderChart L559 对齐）⑧ window.RENDER 挂载新函数 |
| **目标文件 2** | `main.js`（?test=1 测试区） |
| 当前行数 | 1446 行（实测） |
| v2 改动类型 | 测试区新增独立 IIFE「节气流年联动(v0.26)」T06-T11（含双胞胎专项建议）；同步 index.html / standalone.html 内联 main 段（L1 教训） |
| **目标文件 3** | `index.html` / `standalone.html`（单体内联，字节级一致基线） |
| 当前状态 | 与 v1 发布态一致（v1 已同步，需 diff 确认） |
| v2 改动类型 | 内联 render 段同步 + 内联 main 测试段同步（**无 CSS 增量预期**——版式沿用 v1；若实现确需微调样式须三 HTML 同步并保持 index==standalone 字节一致） |
| **目标文件 4** | `standalone-split.html`（主产物模块版） |
| v2 改动类型 | 无直接改动（render.js / main.js 经 `<script src>` 外链自动生效）；若 CSS 微调则同步其 `<style>` |
| **目标文件 5** | `scripts/check-release.sh` |
| v2 改动类型 | **无需再扩展 KEYS**（v1 已含 `jieqi-section`、`jq-gz` 于 KEYS 与 RUNTIME_KEYS；v2 不新增 id/class 锚点），仅作为发布门槛重跑 |
| **目标文件 6** | `docs/`（ADR v2 本文件）+ `SYSTEM.md` |
| v2 改动类型 | 新增本 ADR；SYSTEM.md 版本历史补「v0.26.0：节气数据 + 节气流年联动」（若 v1 环节未补则一并补） |

> **本版本零改动**：constants.js、algorithm.js、gongwei.js / config.js / auth.js / records.js / gongwei-cloud.js、supabase.min.js（纯交互层 + 展示参数化，零算法改动，v2-AR02 保证）。

---

## 一、v1 落地现状核实（v2 决策基线，勘察于 2026-09-07 render.js L1623）

| 项 | 现状（真实代码） |
|----|-----------------|
| `buildJieqiHtml(year)` | L304-338 已实现：D4 整块占位（year<1000/>2101）→ jieqi-note；D2 遍历 MONTH_TERM 12 节、末位小寒 year+1、UTC 字段直取；D1 `jqGanzhiOf(st)` dayPillar 自然日日柱；`needHint` 小寒越界轻提示。签名 `(year)`，`year = year \|\| nowYear` 兜底 |
| 三入口渲染调用 | 单人 renderChart L623（html 模板 `${buildJieqiHtml(nowYear)}`）；同卵 renderTwinCardsHtml L1167（html 串 `'+buildJieqiHtml(nowYear)+'`，插入 .bz-twin-shared 内 luck-section 后）；龙凤胎 renderLongFengCardsHtml L1276（同式，.bz-twin-shared 内、两 .bz-card-luck 之后）——**三处均为 nowYear**（v2 待改出生年） |
| 渲染容器数据挂载 | renderChart L630/L637 `container._paipanData = data`；同卵 L1171 `container._paipanData = data`；龙凤胎 L1288 `container._paipanData = d1`，另 cards[0]._cardData=d1、cards[1]._cardData=d2（L1293-1294）——**v2 状态 _jieqiYear 挂在同一 container 上，风格一致** |
| bindEvents | L641-704：`[data-dy]` 大运点击（L648-666）+ `.liu-row .li` 流年点击（L683-703）。两回调均已解析触发命主卡片：`cardEl = c.closest('.bz-twin-card')`，龙凤胎内 li 落 `.bz-card-luck` 时经 `data-card-index` → `container.querySelectorAll('.bz-twin-card')[cardIdx]` 定位；`daYunSrc = cardEl._cardData.daYun \|\| daYun`（闭包）。**v2 联动直接复用该 cardEl/cardData 解析结果**，不新增事件委托 |
| 运前流年 data | 单人 renderChart L559 已带 `data-di="-1" data-li=liIdx`；**同卵 preLis（L1158 前）、龙凤胎 pl1/pl2（L1232/L1257）均无 data-di/data-li** → 双胞胎运前点击当前无效，v2 需补全（v2-D4） |
| updateCardDyLnColumns | L749-831：cardData = `card._cardData \|\| container._paipanData`；年份换算 dyIdx===-1 → `cardData.y + lnIdx`，否则 `daYun[dyIdx].startYear + lnIdx`（L795-806）——**v2 换算函数与此同式** |
| scrollToNow | L1412-1440：scope 默认 document；`d = scope._paipanData \|\| window._paipanData`；算 nowYear 所在 curDyIdx/curLi → hiDy/hiLn → updateCardDyLnColumns(container...) → 滚动 .luck-section .cc。**v2 在其 updateCardDyLnColumns 后追加 refreshJieqi(nowYear)** |
| main.js 测试区 | L769 起 ?test=1 独立 IIFE；v1 当年节气数据 T01-T05 已落 L1282-1336（section「当年节气数据(v0.26)」，走 `window.RENDER.buildJieqiHtml` mock year 注入） |
| check-release.sh | KEYS（L17）与 RUNTIME_KEYS（L81）已含 jieqi-section / jq-gz |

---

## 二、v2 架构决策

### 决策 5（D5）：jieqiYear 状态管理——容器挂载 `container._jieqiYear` + 局部重渲染函数 refreshJieqi

**问题**：v1 节气区年份 = nowYear 且渲染期写死；v2 需「状态可被点击改写、改写后只刷新节气块」。
备选 A：模块级/全局变量 `_jieqiYear`（如 RENDER 命名空间字段）；备选 B：DOM dataset（如 `container.dataset.jieqiYear`）；备选 C：渲染上下文容器挂载 `container._jieqiYear`。

**决策：采用备选 C——`container._jieqiYear`（container = 排盘容器，即 #output 或测试容器元素），与既有 `container._paipanData`（renderChart L630/637、同卵 L1171、龙凤胎 L1288）同层挂载。**

- 选 C 理由：① 状态生命周期 = 容器生命周期——每次 renderChart/renderTwinCardsHtml/renderLongFengCardsHtml 重建 innerHTML 时自然重置（v2-PRD §5.1「重新排盘重置为出生年」免费获得，无需显式 reset）；② 双胞胎场景同页只有一个共享节气块但两个命主数据，全局字段会串台、DOM dataset 类型需 string/number 转换，容器字段与 `_paipanData` 同级最自然；③ 测试可读断言（`container._jieqiYear === 1982`）稳定。
- **初始值**：三入口渲染完成时设 `container._jieqiYear = 出生年`（单人/同卵 = data.y；龙凤胎 = d1.y = 老大出生年，覆盖 v2-AC11 默认老大）。
- **改写时机**：仅三个入口——点击流年 / 点击大运 / 点击「📍 今年」（v2-D7）。无独立 setter 暴露给用户，哨兵由 buildJieqiHtml 内 D4 兜底。
- **不引入全局 `RENDER._jieqiYear`**：避免双胞胎点谁跟谁时跨容器污染（v2-D8）。

**配套新增局部重渲染函数（v2 核心新代码）**：

```js
// 把 container 内唯一的 .jieqi-section 整块替换为 buildJieqiHtml(year) 的产物，
// 并回写 container._jieqiYear。不触碰 luck-section / chart / 事件绑定。
// root 约定：可命中 .jieqi-section 的任意祖先（#output / .bz-twin-shared / document）。
// 若找不到节气块（异常态/旧 HTML）则静默返回，不抛异常（防御）。
function refreshJieqi(root, year) {
  var sec = root.querySelector('.jieqi-section');
  if (!sec) return;
  root._jieqiYear = year;
  var tmp = document.createElement('div');
  tmp.innerHTML = buildJieqiHtml(year);
  var neu = tmp.firstChild;
  if (neu) sec.parentNode.replaceChild(neu, sec);
}
```

- **重渲染范围 = 只替换 `.jieqi-section` 整块**：v1 节气块无内部事件监听（纯展示，v1-ADR D3/PRD §11.4 确认）→ 整块 outerHTML 替换无监听泄漏；luck-section / chart / 双胞胎模式按钮及其既有监听（.li、[data-dy]、tabs 等均挂在它们自己身上或经 bindEvents 委托到 container）完全不受影响（v2-AR02/AR03）。
- **横向滚动天然复位**：.jieqi-wrap 随整块重建 → scrollLeft 归零，符合 PRD §七/§11.6「新一年从头看」（不承诺平滑保持位置）。
- **入参 root 取法**：bindEvents 回调内用 bindEvents 的 container 实参（#output，含节气块）；scrollToNow 内复用其已解析的 `container`（`scope.querySelector('.bz-result') || scope.querySelector('#output') || scope`，双胞胎时命中 .bz-twin-shared 亦含节气块）——统一约定：**refreshJieqi 第一个实参必须能 querySelector 到 .jieqi-section**。
- **与 v1 buildJieqiHtml 的关系（明确回答 Leader 问题）**：**不改纯函数签名与内部逻辑**。v1 `buildJieqiHtml(year)` 契约 =「year 入参即节气区公历年、返回完整 .jieqi-section HTML 字符串」已天然支持 v2（PRD §5.3「v1 已实现的渲染函数保持契约不变」）。v2 全部工作 = ① 初始调用传出生年 ② 新增 refreshJieqi 负责「用新 year 重新调用 buildJieqiHtml 并替换 DOM」③ 点击时算出新 year。**唯一小改**：`buildJieqiHtml` 内部 `year = year || new Date().getFullYear()` 兜底保留不动（防 undefined 误渲染系统年），但 v2 所有调用点显式传参、禁止依赖该兜底。

### 决策 6（D6）：初始口径与三渲染入口改动——默认出生年，nowYear 降级（v2-PRD §四-b 裁决落地）

**决策：三处渲染调用 `buildJieqiHtml(nowYear)` → `buildJieqiHtml(出生年)`；大运表初始高亮/「📍 今年」仍用 nowYear（既有功能不动）。**

| 入口 | 函数 | 渲染调用改点 | 状态初始 |
|------|------|-------------|---------|
| 单人盘 | renderChart（L623 html 模板） | `${buildJieqiHtml(nowYear)}` → `${buildJieqiHtml(y)}`（renderChart 顶部已解构 `y`） | container._jieqiYear = data.y |
| 同卵双胞胎 | renderTwinCardsHtml（L1167 html 串） | `'+buildJieqiHtml(nowYear)+'` → `'+buildJieqiHtml(y)+'`（y=data.y） | container._jieqiYear = data.y |
| 龙凤胎 | renderLongFengCardsHtml（L1276 html 串） | 同上改 `y`（y=d1.y=老大出生年） | container._jieqiYear = d1.y |

- 三入口 html 串内部 **nowYear 的其他用途保持不动**：curDyIdx 计算（L379/L1130/L1308）、cur 高亮 class（L571/L1151）、顶部「（当前 nowYear 年）」（L598/L1162/L1300）——这些仍是「大运表初始高亮 = nowYear」的既有功能（v2-AC07 回归基线）。
- **状态机语义**（v2-PRD §5.1）：初始「大运高亮 = nowYear」vs「节气区 = 出生年」**有意不同步**——前者看当下、后者看出生年；一旦点击任意流年/大运/「今年」，refreshJieqi 把两者同步为选中年份，之后不再分叉。此语义由 D5 状态 + D7 绑定自然实现，无特判代码。

### 决策 7（D7）：联动绑定——既有回调末尾追加，不新增事件委托（v2-PRD §四-e 裁决）

**决策：在 bindEvents 两个点击回调（[data-dy]、.liu-row .li）与 scrollToNow 函数内部各追加一段「换算年份 → refreshJieqi」；不新增 click 委托、不新增全局监听。**

**三条路径的年份换算规则（与 updateCardDyLnColumns L795-806 同式，v2-PRD §5.2）：**

| 触发 | 换算 | 落点 |
|------|------|------|
| 点击流年 `.li`（data-di=i≥0, data-li=j） | `liunianYearOf(cardData, i, j)` = `cardData.daYun[i].startYear + j` | bindEvents 流年回调末尾（现 L703 updateCardDyLnColumns 之后） |
| 点击运前流年 `.li`（data-di=-1, data-li=j） | `liunianYearOf(cardData, -1, j)` = `cardData.y + j` | 同上（di===-1 分支内追加，且需 v2-D8 双胞胎运前补全） |
| 点击大运列 `[data-dy=i]` | `cardData.daYun[i].startYear`（= hiLn(i,0) 的高亮年，即运首年） | bindEvents 大运回调末尾（现 L666 updateCardDyLnColumns 之后） |
| 点击「📍 今年」scrollToNow | `new Date().getFullYear()`（nowYear） | scrollToNow 内 L1431 updateCardDyLnColumns 之后 |

**换算纯函数（提取共享，防口径漂移）**：

```js
// 与 updateCardDyLnColumns 内 L795-806 同式的公历年换算，供节气区联动与列更新共用。
// dyIdx===-1 → 运前流年：出生年 + 列偏移；否则 → 该运起始年 + 列偏移。
function liunianYearOf(cd, dyIdx, lnIdx) {
  if (!cd || !cd.daYun) return null;
  if (dyIdx === -1) return cd.y + lnIdx;
  var dy = cd.daYun[dyIdx];
  return dy ? dy.startYear + lnIdx : null;
}
```

- **更新 updateCardDyLnColumns 内部改为调用 liunianYearOf（等价替换）**：其 L795-806 两分支换为 `var lnYear = liunianYearOf(cardData, dyIdx, lnIdx);`。等价性由同式保证；好处是两处口径永不分叉（v2-PRD §十一-2）。**替换有回归风险 → 以 v2-AR02（点击流年后主盘列更新 = v0.25.0 行为）+ ?test=1 旧断言锁定**；若编程师实测替换有意外，可退化为「updateCardDyLnColumns 保持原样 + liunianYearOf 独立同式」（两处并行），由 AR02 判断。
- **换算输入 cardData 的取法（与既有解析一致，不新写归属逻辑）**：
  - 大运回调：已有 `cardEl`（c.closest('.bz-twin-card') / 龙凤胎经 data-card-index 定位），`cardData = (cardEl && cardEl._cardData) ? cardEl._cardData : container._paipanData`。
  - 流年回调：已有 `cardEl2`，同理取 `cardData = (cardEl2 && cardEl2._cardData) ? cardEl2._cardData : container._paipanData`（bindEvents 闭包 data 仅作最后兜底；龙凤胎点老二时 cardEl2._cardData = d2）。
  - **null/缺失防御**：liunianYearOf 返回 null 时不调用 refreshJieqi（静默跳过，不崩）。
- **追加位置**：统一在各自 updateCardDyLnColumns(...) 调用**之后**（列更新成功后再刷新节气区）；不动 hiDy/hiLn/updateCardDyLnColumns 主体与 redrawZuHeSVG 的 setTimeout（v2-PRD §九 P0 风险缓解）。

### 决策 8（D8）：双胞胎共享区「点谁跟谁」与运前列 data 补全

**（1）共享一块、跟随最近操作命主**：共享节气块 DOM 唯一（v1 决定，位于 .bz-twin-shared 内 luck 区之后）。v2 联动时 refreshJieqi 的 root 传 bindEvents 的 container（#output）→ `container.querySelector('.jieqi-section')` 必命中共享那一块。换算 cardData 取**触发点击所在命主**（D7 的 cardEl/cardEl2 解析在龙凤胎中已正确落到 d1/d2）→ 共享块即跟随「最近一次点击的命主」（v2-AC09/AC11）。

| 场景 | cardEl2 解析 | 换算命主 | 结果 |
|------|-------------|---------|------|
| 同卵（同年同盘，两卡 _cardData 均=同一 data） | 共享 luck 表 li 不在 .bz-twin-card 内 → cardEl2=null | container._paipanData = data | 点哪侧都等价（同年同盘），符合预期 |
| 龙凤胎点老大侧 | .bz-card-luck[data-card-index=0] → cards[0]._cardData = d1 | d1 | 跟老大 |
| 龙凤胎点老二侧 | data-card-index=1 → cards[1]._cardData = d2 | d2 | 跟老二 |
| 龙凤胎初始（未点击） | —（渲染期） | buildJieqiHtml(d1.y) | 老大出生年（v2-AC11） |

**（2）双胞胎运前列补全 data-di/data-li（v2 必要前置）**：单人 renderChart 运前列已带 `data-di="-1" data-li=liIdx`（L559）；但**同卵 renderTwinCardsHtml 运前列 preLis（L1157 附近 `'<span class="li">'`）与龙凤胎 pl1/pl2（L1232/L1257）均未带 data 属性** → 当前双胞胎运前 li 点击时 di=NaN、走 hiDy(NaN) 分支无正确联动。v2-AC05 状态机要求「点击运前流年 → 出生年+j」，双胞胎同样应成立 → **三处运前列 li 均补 `data-di="-1" data-li="<j>"`（j 从 0 起，与单人同式）**。补全后 bindEvents di===-1 分支自然生效：hiLn(-1, liIdx, scope2) + liunianYearOf(cardData, -1, liIdx) → refreshJieqi。此改动同时顺带修复「双胞胎运前点击无效果」的既有小缺陷（正向变更，无破坏面；v2-AC05 回归覆盖）。
- 实现注意：同卵 preLis 与龙凤胎 pl1/pl2 的 for 循环目前用 `for (var py = y; py < y + joy; py++)`，补 data-li 需引入从 0 起的偏移计数（如 `for (var py = y, liI = 0; py < y + joy; py++, liI++)`），与单人 L557-559 写法完全对齐。

**（3）双胞胎模式切换（并排/仅看老大/仅看老二）**：switchTwinMode（L1303-1311）只切 `.bz-twin-cards` 的 class，不重建 DOM、不影响 .bz-twin-shared 内节气块 → **无需处理**；「切换命主」= 重新输入排盘 = doPaipan → 容器重建 → 初始重置出生年（D5 免费获得）。

### 决策 9（D9）：测试钩子与自动化断言 T06-T11 落点

**决策：main.js ?test=1 测试区新增独立 IIFE（section「节气流年联动(v0.26)」），采用「真实 paipan 数据 → 渲染到测试容器 → 模拟 click / 直接调函数 → 断言 .jieqi-title 年份与 _jieqiYear」路线。**

- **前提：window.RENDER 需暴露 `refreshJieqi` 与 `liunianYearOf`**（新增挂载，D7 函数一并导出），scrollToNow / renderChart / bindEvents 等已挂载。测试容器：新建 `div#tst-out`（append 到测试 root 或 body），paipan(出生信息) 后 `RENDER.renderChart(data, undefined, 'tst-out')`（renderChart 已支持 targetId 参数，L348-349）。
- **断言口径（最少条目，可扩展）**：

| 编号 | 断言（对 PRD §6.3） | 推荐实现 |
|------|--------------------|---------|
| T06 | 排盘完成后 .jieqi-title 含出生年（data.y），非 nowYear（当二者不同） | renderChart(paipan(1982-10-18 05:01 男)) 到 #tst-out → `#tst-out .jieqi-title` 文本含 '1982'；`_jieqiYear === 1982`（v2-AC01） |
| T07 | 点击流年 .li 后标题 = daYun[i].startYear+j，且 12 列刷新 | 找到 lnYear 对应 li（`[data-di][data-li]`，按 daYun[i].startYear+j===目标年 定位）→ `dispatchEvent(new MouseEvent('click'))` → 断言标题含目标年、_jieqiYear 同步；**连续点两次不同年份验证每次跟随**（v2-AC02/AC03） |
| T08 | 点击运前流年（data-di=-1）后标题 = data.y+j | 断言运前列存在（qyYears>0）→ 点击 `[data-di="-1"]` 第一个 → 标题含 data.y（j=0）或 data.y+j（v2-AC05） |
| T09 | 点击大运 [data-dy=i] 后标题 = 该运 startYear | 点击某 `[data-dy]` → 标题含 daYun[i].startYear（v2-AC04） |
| T10 | 点击「📍 今年」后标题 = nowYear | 直接 `RENDER.scrollToNow(#tst-out 内 .luck-col 或容器)` 或点击 .btn-back → 标题含 String(new Date().getFullYear())（v2-AC06；不 mock 时钟，与 v1 原则一致；当前系统年 2026 ≠ 出生年 1982，断言天然有效） |
| T11 | 越界年份渲染不抛、占位/「—」存在 | 直接 `RENDER.refreshJieqi(container, 2200)` → 断言含 .jieqi-note + '仅支持'、不抛；`refreshJieqi(container, 2100)` → 小寒列「—」+ 轻提示（v2-AC10；与 v1 T05 互补——T05 测纯函数、T11 测 DOM 替换路径） |

- **双胞胎专项（v2-AC08/09/11，PRD §6.3 允许扩展）**：同 section 追加（编号 T12+ 或并入 T07 子断言，实现时定）：
  - 同卵：`RENDER.renderTwinCardsHtml(paipan(...同年...), 'tst-out')` → 断言仅一块 .jieqi-section + 标题 = 出生年（v2-AC08）。
  - 龙凤胎跨年（代码级构造）：d2 用 d1 数据改 y（如 d1.y=1982 → 构造 d2 = paipan(name, gender2, 1982...); d2.y 手工覆写 1983 并重算 daYun 边界——若难构造则退化为断言「龙凤胎初始=老大 d1.y；点老二侧流年标题跟老二 daYun」）→ 断言初始老大、点击老二侧后跟老二（v2-AC09/AC11）。
  - 实现注意：双胞胎渲染需要 paipan 数据内 daYun 等完整；测试可复用 AR02 锚点数据；点击老二侧 li 需 `container.querySelector('.bz-card-luck[data-card-index="1"] .liu-row .li')` 定位后 dispatch click。
- **注意**：T06-T11 的渲染容器应独立于页面 #output（测试区已隐藏 .page，但用独立 #tst-out 可避免与既有 doPaipan 渲染互相干扰）；多用例共用时可复用同一容器并每次重 renderChart 覆盖。
- 测试区若在 v1 T01-T05 之后追加，保持 `tests.push({section})` 分节结构，沿用 eq/fail 断言函数。

---

## 三、风险矩阵（v2 新增，接 v1 R1-R7）

| 风险 | 级别 | 影响 | 缓解（落地到验收） |
|------|:---:|------|------|
| R8 联动改坏既有点击流年→主盘列更新 / 大运高亮 | **P0** | v0.25.0 既有交互回归 | 改动只在既有回调**末尾追加** refreshJieqi，不动 hiDy/hiLn/updateCardDyLnColumns 主体；v2-AR02（列更新 = v0.25.0 行为）+ AR03（高亮/滚动）+ ?test=1 旧断言回归 |
| R9 双胞胎点老二侧用错数据（落到 d1） | P1 | 共享节气块跟随错命主 | D7/D8：换算 cardData 取 cardEl2._cardData（龙凤胎 cards[1]=d2），仅 cardEl2 缺失时退 container._paipanData；v2-AC09/AC11 + 双胞胎专项断言 |
| R10 初始口径漏改仍用 nowYear（三处只改了一两处） | P1 | 默认不是出生年，v2-AC01 失败 | D6 三入口逐一改点表（renderChart L623 / 同卵 L1167 / 龙凤胎 L1276）；T06 断言 + 编程师自检 grep `buildJieqiHtml(nowYear)` 应为 0 命中（兜底默认除外） |
| R11 重渲染节气块连带破坏 luck/chart 事件绑定 | P1 | 点击流年后大运区失灵 | D5 refreshJieqi 只替换 .jieqi-section 整块，不重建 luck/chart；v1 节气块无内部监听；AR03 交互回归实测 |
| R12 双胞胎运前列补 data 引发未知交互变化 | P2 | 运前 li 从「无效果」变「有效果」，若有异常绑定会暴露 | 补全 = 与单人 L559 完全同式；bindEvents di===-1 分支既有；T08 + 双胞胎点击实测覆盖；行为变化为正向（修复无效果缺陷） |
| R13 状态字段命名/位置不一致（测试读不到） | P2 | 断言与实现口径漂移 | D5 明确 `container._jieqiYear` 挂容器、命名唯一；T06/T07 断言同字段；ADR 目标文件表供实现对照 |
| R14 updateCardDyLnColumns 改调 liunianYearOf 引入回归 | P1 | 列更新错位/报错 | 等价替换（同式提取），AR02 三盘回归 + ?test=1 全量；若异常退化为并行同式（两处独立），AR02 判定 |
| R15 三文件同步遗漏（L1 复发，v2 交互改动多入口） | **P0** | 面板版/回退版行为不一致 | 改动段（liunianYearOf/refreshJieqi/三入口调用/bindEvents/scrollToNow/运前 data）同步 render.js + index.html + standalone.html 内联段；main.js 测试段同步三处；check-release.sh AR05 门槛 |

## 四、实现指引（给编程师的分步落地清单）

### 步骤 0：基线确认（动手前必做）
1. `cd /Users/feng/.clacky/ext/local/bazi-paipan`；确认 v1 已发布态可回滚（v2 的回滚基线 = v1，不是 v0.25）。
2. `diff -q index.html standalone.html` 为空（v1 三文件字节一致未破坏）。
3. 通读 v2 PRD §二（修订表）与 v1 ADR D1-D4（避免把 v1 AC04 nowYear 语义当 bug 改回去）。
4. 读 docs/DEVELOPER.md（三文件同步红线）+ SYSTEM.md。

### 步骤 1：render.js 新增两函数（放 buildJieqiHtml/jqGanzhiOf 之后，L338 附近）
1. `liunianYearOf(cd, dyIdx, lnIdx)`（D7 伪码）——纯函数。
2. `refreshJieqi(root, year)`（D5 伪码）——局部替换 .jieqi-section + 回写 `root._jieqiYear`。
3. `window.RENDER` 挂载追加 `refreshJieqi: refreshJieqi, liunianYearOf: liunianYearOf`（现 L1602 附近）。
4. 自检：`node --check render.js`。

### 步骤 2：updateCardDyLnColumns 等价替换（D7）
1. L795-806 两分支换算改为调用 `liunianYearOf(cardData, dyIdx, lnIdx)`（先算出 lnYear 再走 pill 分支；注意原代码 dyIdx===-1 与 else 都先算 lnYear 再构造 pill，替换后结构不变、只换 lnYear 来源）。
2. 若担心回归：可先保留原样只加 liunianYearOf 供节气区用（两处并行同式），交测试时以 v2-AR02 验收；编程师任选其一，ADR 推荐等价替换（口径单源）。

### 步骤 3：三入口初始年份与状态（D6）
1. renderChart L623：`${buildJieqiHtml(nowYear)}` → `${buildJieqiHtml(y)}`；renderChart 内 html 写入后（L630 附近 `container._paipanData = data;` 旁）加 `container._jieqiYear = y;`。
2. renderTwinCardsHtml L1167：`'+buildJieqiHtml(nowYear)+'` → `'+buildJieqiHtml(y)+'`；L1171 附近加 `container._jieqiYear = y;`。
3. renderLongFengCardsHtml L1276：同改 `y`（y=d1.y）；L1288 附近加 `container._jieqiYear = y;`（老大）。
4. 自检：`grep -n 'buildJieqiHtml(nowYear)' render.js` 应 **0 命中**（若有遗漏即 R10）；保留 `buildJieqiHtml` 函数内 `year || nowYear` 兜底。

### 步骤 4：bindEvents 联动（D7/D8）
1. 大运回调（L666 updateCardDyLnColumns 之后）：`var cdA = (cardEl && cardEl._cardData) ? cardEl._cardData : (container._paipanData || data); var dyJ = cdA && cdA.daYun ? cdA.daYun[i] : null; if (dyJ) refreshJieqi(container, dyJ.startYear);`
2. 流年回调（L703 之后）：
   - `var cdB = (cardEl2 && cardEl2._cardData) ? cardEl2._cardData : (container._paipanData || data);`
   - `var yB = liunianYearOf(cdB, di, liIdx); if (yB !== null && yB !== undefined) refreshJieqi(container, yB);`
   - 注意 di 可能为 NaN（老 HTML/异常 li）→ liunianYearOf 内 `dyIdx===-1` 不命中、`daYun[NaN]` undefined → 返回 null → 静默跳过 ✓。
3. 双胞胎运前列补 data（v2-D8）：同卵 renderTwinCardsHtml 运前 for（L1157 前）与龙凤胎 pl1/pl2（L1232/L1257）循环改为 `for (var py = y, liI = 0; py < y + joy; py++, liI++)` 并给 `<span class="li"` 加 ` data-di="-1" data-li="'+liI+'"`（与单人 L559 完全同式；注意同卵变量 joy、龙凤胎 qy1.years/qy2.years 各自的起运年上限）。
4. 自检：`node --check render.js`。

### 步骤 5：scrollToNow 联动（D7）
1. L1431 updateCardDyLnColumns(container, container, curDyIdx, curLi) 之后追加 `refreshJieqi(container, nowYear);`（container 已含节气块：单人=#output、双胞胎 scope=shared 时 container 变量解析见 L1430——若解析落空，直接 `refreshJieqi(scope, nowYear)` 亦可，scope 恒含 .jieqi-section）。
2. 自检：手动点 📍 看标题年份。

### 步骤 6：main.js T06-T11（D9）
1. 在 v1 当年节气数据 IIFE（L1282-1336）后追加新 IIFE，section「节气流年联动(v0.26)」。
2. 按 D9 表格实现 T06-T11（+ 双胞胎专项建议）。
3. 三文件同步：main.js 改动复制到 index.html / standalone.html 内联 main 段（L1 红线）。
4. 自检：`node --check main.js`；`?test=1` 双环境（file:// index.html + http:// standalone-split.html）全量通过（v1 T01-T05 + v2 T06-T11 + 全部旧断言）。

### 步骤 7：check-release 与文档
1. `bash scripts/check-release.sh .` 退出码 0（KEYS 无需再扩；若实现新增了 id/class 锚点则同步追加）。
2. docs/ 同步：本 ADR（架构师双副本）+ 测试工程师 TEST/QA 后续产出；SYSTEM.md 版本历史 v0.26.0（含联动）。

## 五、自检清单（实现完成 → 交测试前，编程师逐条勾）

- [ ] 单人默认排盘（1982-10-18 05:01 男）：节气标题 = 1982（v2-AC01），大运表初始高亮仍在 nowYear、顶部「当前 2026 年」不变（v2-AC07）
- [ ] 点击 2026 流年格：标题 = 2026、立春列 = 2/4 04:01（v2-AC02 锚点）
- [ ] 连续点 2031 → 2042：每次跟随、最终 2042（v2-AC03）
- [ ] 点击大运列：标题 = 该运 startYear（v2-AC04）；运前流年（若有）：标题 = 出生年+j（v2-AC05）
- [ ] 点击 📍 今年：滚动定位不变 + 标题 = nowYear（v2-AC06）
- [ ] 双胞胎：共享区仍只有一块；默认 = 出生年/老大（v2-AC08/AC11）；点老二侧流年 → 跟老二（v2-AC09）；点老大侧 → 跟老大
- [ ] 越界：jieqiYear=2100 小寒「—」；>2101 整块占位；不抛（v2-AC10）
- [ ] 点击流年后主盘大运流年列更新 = v0.25.0 行为（v2-AR02）；大运高亮/滚动正常（v2-AR03）
- [ ] `grep -n 'buildJieqiHtml(nowYear)' render.js` = 0 命中
- [ ] index.html == standalone.html 字节一致；外部 render/main 与两内联同段一致；三文件齐全
- [ ] `?test=1` 双环境全量旧断言 + v1 T01-T05 + v2 T06-T11 全绿（v2-AR04/AR06）
- [ ] `bash scripts/check-release.sh .` 退出码 0（v2-AR05）

## 六、验证与回滚预案

**验证基线（测试工程师可引用）**：
- 功能锚点 = v2 PRD §6.1 v2-AC01~11 + §6.3 T06-T11；年份数据锚点沿用 v1 AC05（2026 十二节真实时刻）。
- 换算对照：点「2026 流年」→ 节气数据必须与 v1 AC05 的 2026 十二节一致（证明联动年份正确进入 buildJieqiHtml 取数）；点 1982 流年/初始默认 → 1982 数据（立春 2/4 等可用 constants.js 交叉验证）。
- 回归基线：v1 AC01-AC09（除修订条目）+ v0.25.0 三锚点盘（1982-10-18 05:01 男 / 王阳明 1472-10-31 22:01 / 苏轼 1037）四柱大运流年不变；点击流年列更新不回归。
- 代码级检查点：liunianYearOf 两分支同式；refreshJieqi 仅动 .jieqi-section；三入口初始 y；双胞胎运前 data-di=-1；scrollToNow 追加位置。

**回滚预案**：
1. 开发期：git 回滚 render.js / main.js / 三 HTML 至 **v1 已发布态**（v2 基线），重新同步；check-release.sh 若被改则一并回滚。
2. 已发布：内联单体恢复 v1 版三文件 → 节气块回到静态 nowYear（v1 行为），其余功能不受影响（v2 改动彼此独立、无数据迁移）。
3. 局部回退选项：若仅联动交互有问题，可只撤 bindEvents/scrollToNow 追加段与运前 data 补全（保留默认出生年），节气区退回 v1 静态。
4. 回滚后必跑：check-release.sh + ?test=1 双环境（v1 T01-T05 全绿 = 回到 v1 态）。

## 七、PRD v2 AC/AR/T 映射表（ADR 落实点）

| v2 AC | 验收点 | ADR 落实 |
|--------|--------|---------|
| v2-AC01 | 默认节气 = 出生年 | D6：三入口 buildJieqiHtml(y) + _jieqiYear=y；T06 |
| v2-AC02 | 点流年切对应公历年（2026 锚点） | D7：流年回调 refreshJieqi(liunianYearOf(cdB,i,j))；T07 |
| v2-AC03 | 连续点击每次跟随 | D7 每次点击都刷新；T07 双次断言 |
| v2-AC04 | 点大运列 = 运首 startYear | D7：大运回调 refreshJieqi(dyJ.startYear)；T09 |
| v2-AC05 | 点运前流年 = 出生年+j | D7/D8：di=-1 分支 + 双胞胎运前 data 补全；T08 |
| v2-AC06 | 点📍 今年 = nowYear | D7：scrollToNow 追加 refreshJieqi(container, nowYear)；T10 |
| v2-AC07 | 初始大运高亮仍 nowYear、当前年文案不变 | D6：三入口仅改节气调用，不动 curDyIdx/curCls/nowYearCn；回归走查 |
| v2-AC08 | 双胞胎默认一块 = 出生年 | D8(1)：共享唯一 + _jieqiYear=data.y；双胞胎专项 T |
| v2-AC09 | 双胞胎点老二侧 → 跟老二 | D8(1)：cardEl2._cardData=d2 换算；专项 T |
| v2-AC10 | 越界不崩溃 | D5/D7：refreshJieqi null 防御 + buildJieqiHtml D4 哨兵；T11 |
| v2-AC11 | 双胞胎跨年默认老大、点老二跟老二 | D8：初始 d1.y + cardData 归属；专项 T |
| v2-AR01 | v1 AC01-09 除修订全成立 | D5-D9 不动版式/结构/无气/四行/竖排/一块/防御 |
| v2-AR02 | 点击后主盘列更新不回归 | D7 追加式改动 + 等价替换或并行；步骤 2/5 |
| v2-AR03 | 📍 今年滚动/高亮正常 | D7 scrollToNow 仅末尾追加 |
| v2-AR04 | ?test=1 v1+v2 全过 | D9 + 步骤 6 |
| v2-AR05 | 三文件一致 + 三入口一致 | D6/D8 同步清单 + check-release.sh |
| v2-AR06 | 三档宽度截图正常 | 版式零改动（CSS 无增量预期）；若微调须三文件同步 |
| T06-T11 | 自动化断言 | D9 落点表 + 步骤 6 |
