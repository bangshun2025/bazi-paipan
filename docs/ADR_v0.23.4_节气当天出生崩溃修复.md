# ADR v0.23.4 — 节气当天出生崩溃修复（1987-05-06 立夏当天排盘崩溃）

> **版本**：v1.0
> **日期**：2026-08-27
> **作者**：架构师（worker_498043b4）
> **状态**：待评审
> **关联文档**：PRD_v0.23.1_节气当天出生崩溃修复.md（版本号经 Leader 定版为 v0.23.4，文档命名统一 v0.23.4）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

> 版本号/行数均以实际读取源码确认（2026-08-27 实测，工作区 HEAD v0.23.3，编程师已按任务书先行实现 algorithm.js 三处修复，正做内联同步）。

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `algorithm.js`（模块版算法真相源） |
| 文件头注释 | `/* 八字排盘 v0.22.0 — algorithm.js */`（**需更新 v0.23.4**） |
| 当前行数 | 700 行（`wc -l` 实测） |
| 改动类型 | **修改**——① `monthPillar()` L203-244：节气边界改用完整时刻（birthMs + BJT_OFFSET 毫秒比较）；② `renYuanSiLing()` L555-590：签名加时分参数 + 同基准比较；③ `paipan()` L596-601：立春边界改用完整时刻（lc2Ms）。三处均已带 `v0.23.4` 注释 |
| **目标文件 2** | `index.html`（Clacky 扩展内联版） |
| 文件头注释 | `<!-- 八字排盘 · 从真版 v0.23.0 | 2026-08-22 -->`（**需更新 v0.23.4**） |
| 当前行数 | 10547 行（`wc -l` 实测） |
| 改动类型 | **已改**：monthPillar L4288-4323（完整时刻）、renYuanSiLing L4644（5 参签名 + 完整时刻）、交运循环 L7217-7226（null 判空）、renYuanSiLing 调用 L8170/8175/8184/8192（5 参 ey/em/ed/eh/emi）。**⚠️ 遗漏**：paipan() 立春判断 L4684-4687 仍为旧代码 `lc2Date` 零点截断，**必须同步为 lc2Ms** |
| **目标文件 3** | `standalone.html`（内联回退版） |
| 当前行数 | 10546 行（`wc -l` 实测） |
| 改动类型 | 与 index.html 同构（monthPillar L4288 / renYuanSiLing L4644 / 交运 L7217 / 调用 L8170 附近）；**同样遗漏 paipan() 立春 L4684-4687** |
| **目标文件 4** | `standalone-split.html`（外部 JS 引用版，主产物） |
| 当前行数 | 911 行（`wc -l` 实测） |
| 改动类型 | **无需内联改动**——JS 逻辑经 `<script src="algorithm.js">` L866 + `<script src="render.js">` L869 自动获得。⚠️ 注意：工作区已有 v0.24.0 Supabase 账号功能改动（auth.js/config.js/records.js），**不属于本版本范围**，发布时勿混入 |
| **目标文件 5** | `render.js`（模块版渲染层） |
| 文件头注释 | `/* 八字排盘 v0.22.0 — render.js */`（**需更新 v0.23.4**） |
| 当前行数 | 1574 行（`wc -l` 实测） |
| 改动类型 | **⚠️ 未同步**——renYuanSiLing 调用 L1326/1331/1340/1348 仍为 3 参 `renYuanSiLing(solarY, solarM, solarD)`，**必须改为 5 参 `renYuanSiLing(ey, em, ed, eh, emi)`**（与内联版一致，否则时分丢失退化为零点比较）；交运循环 L375/381 已有 null 判空（确认即可，无需改） |

> **文件路径**：所有目标文件位于 `/Users/feng/人生资产/10-开发项目/软件-八字排盘/八字排盘·运行/`。
>
> **本版本不动**：constants.js（3220 行）、archive.js（916 行）、gongwei.js（1139 行）、main.js（954 行）——本次是算法层 + 渲染层调用点修复，不触碰数据表、存档、显示管线。`standalone-split.html` 已有 v0.24.0 账号功能改动，与本版本无耦合，但发布前需确认版本隔离。

---

## 一、架构决策

### 决策 1：monthPillar 节气区间判断改用「节气完整时刻」，统一 BJT-as-UTC 毫秒基准

**问题**：`monthPillar()` 原实现用节气日期的**零点**构造边界：

```js
// 修复前（algorithm.js L223 附近）
const stDate = st ? new Date(st.getFullYear(), st.getMonth(), st.getDate()) : ...;
// 出生 1987-05-06 06:30 >= 立夏日零点 1987-05-06 00:00 → 误判已入巳月
```

1987-05-06 06:30 出生在立夏（17:05）**之前**，正确月柱为辰月（甲辰），但零点截断把「节气当天任何时刻」都判为已过节气，月柱错判巳月（乙巳）→ 逆排起运越界 → 交运渲染崩溃。

**决策**：边界改用节气**完整时刻**，且统一比较基准为 **BJT-as-UTC**（把北京钟表时间当作 UTC 字段构造，节气表内存储的真实 UTC + 8h 转回北京钟表基准），全程毫秒比较，不经过本地时区 Date 构造：

```js
// 修复后（algorithm.js L208-217）
const birthMs = Date.UTC(y, m - 1, d, h || 0, mi || 0);
const BJT_OFFSET = 288e5; // 8 小时
const lc = getSolarTerm(y, 2);
const lcMs = lc ? lc.getTime() + BJT_OFFSET : null;
const beforeLC = lcMs !== null && birthMs < lcMs;
// 循环内
const stMs = st ? st.getTime() + BJT_OFFSET : -8640000000000000;
const nextMs = nextSt ? nextSt.getTime() + BJT_OFFSET : 8640000000000000;
if (birthMs >= stMs && birthMs < nextMs) { ... }
```

**理由**：
1. 节气表 `getSolarTerm` 返回的 Date 是「BJT as UTC」语义（常量表经 `ms2000 + days*86400000 + secs*1000 - 288e5` 构造，实测 1987 立夏 getTime=547290335000 = `1987-05-06T09:05:35Z` = 北京 17:05）。把出生钟表时间用 `Date.UTC` 构造、节气 `+8h`，两侧在同一时间轴上比较，**消除运行时区依赖**（用户浏览器时区不再影响结果）。
2. 保留了 null 哨兵语义（表外年份：月初节气未到用 `-8640000000000000`、下月节气未到用 `8640000000000000`），与原有 `stDate/nextDate` 极值等价。
3. 顺带修复立春判断 `beforeLC` 的同类零点问题（PRD §9.2 风险点），避免 2026-02-04 03:00（立春 04:02 前）年柱错判。

**代价**：`birthMs` 按「钟表时间 as UTC」构造，若未来引入非东八区真太阳时修正，需同步调整 BJT_OFFSET 口径；当前项目输入恒为北京时间，无影响。

### 决策 2：renYuanSiLing 签名增加时分参数，同基准修正「节后 0 日」显示

**问题**：`renYuanSiLing(y, m, d)` 只有日期，无时分。1987-05-06 06:30 出生显示「立夏后 0 日」（实为立夏前，应属辰月）。且月柱已修完整时刻后，人元司令若仍按零点，会与月柱基准不一致。

**决策**：签名改为 `renYuanSiLing(y, m, d, h, minute)`，内部用与 monthPillar 完全相同的 `birthMs`/`BJT_OFFSET` 毫秒比较（algorithm.js L555-590）；**所有调用点同步传 5 参**：

- `render.js` L1326/1331/1340/1348：`renYuanSiLing(solarY, solarM, solarD)` → `renYuanSiLing(ey, em, ed, eh, emi)`（**⚠️ 尚未同步**）
- `index.html` / `standalone.html` L8170/8175/8184/8192：已改 5 参 `ey/em/ed/eh/emi` ✅

**理由**：人元司令是月令细分，必须与月柱共用同一个「当前在哪个节气区间」判定；若一处完整时刻、一处零点，节气当天 00:00-时刻之间会显示错月。

### 决策 3：交运节气循环补 null 判空（防 2101+ 越界崩溃）

**问题**：起运日期超出节气表（1000-2100）时 `getSolarTerm(2109, ...)` 返回 null，交运循环内联版（standalone.html/index.html ~7217/7224 行）**无判空**，直接 `st.getUTCFullYear()` 抛 `Cannot read properties of null`——这是本次用户可见崩溃的直接抛出点。

**决策**：内联版补判空，与 render.js L375/381 既有写法对齐：

```js
const stDate = st ? new Date(st.getUTCFullYear(), st.getUTCMonth(), st.getUTCDate()) : new Date(-8640000000000000);
const nextDate = nextSt ? new Date(nextSt.getUTCFullYear(), nextSt.getUTCMonth(), nextSt.getUTCDate()) : new Date(8640000000000000);
```

**理由**：极值哨兵语义与月份循环一致——起点未到用最小时间、终点未到用最大时间，循环自然落入「越界即不匹配」分支，无崩溃、显示合理兜底。render.js 已有此判空（v0.22.0 时代遗留），本次仅同步内联版，消除模块版/内联版漂移（SYSTEM.md 遗留项 L1 同类问题）。

### 决策 4（顺带）：paipan 年柱立春判断改用完整时刻（内联版必须同步）

**问题**：`paipan()` 年柱判断同样用立春**日期零点**：

```js
// 修复前（algorithm.js L598-600；index.html L4684-4687）
const lc2Date = lc2 ? new Date(lc2.getFullYear(), lc2.getMonth(), lc2.getDate()) : null;
const birth = new Date(y, m - 1, d, h, mi);
const effYear = (lc2Date && birth < lc2Date) ? y - 1 : y;
```

立春当天 00:00-节气时刻之间出生会错判年柱（实测 2026-02-04 03:00 → 错判丙午，应为乙巳），年柱错误会向下污染月柱（年干起五虎遁）与全部十神。

**决策**：algorithm.js 已修为 `birthMs`/`lc2Ms` 完整时刻比较（L596-601）。**⚠️ 但 index.html/standalone.html 内联版 paipan() 仍是旧代码，必须同步**（本次 ADR 明确列为编程师待办）。

---

## 二、时区基准（本次修复的核心决策依据）

| 概念 | 语义 | 实现 |
|------|------|------|
| 出生钟表时间 | 北京钟表时间（用户输入） | `birthMs = Date.UTC(y, m-1, d, h||0, mi||0)`——把钟表字段当 UTC 字段，**不经本地时区** |
| 节气表存储 | 真实 UTC（北京 - 8h） | `getSolarTerm` 返回 Date，`getTime()` 即真实 UTC |
| 比较基准 | 北京钟表时间 | `stMs = st.getTime() + 288e5`（真实 UTC + 8h 转回北京钟表） |
| 为什么不用 `new Date(y, m-1, d, h, mi)` | 受浏览器本地时区影响；且若浏览器时区非东八区，Date 构造偏移导致误判 | 全程毫秒比较，零本地时区依赖 |

实测锚点（Node 环境，`bazi_fix_verify.js`）：

| 输入 | 修复前 | 修复后 | 期望 |
|------|--------|--------|------|
| 1987-05-06 06:30 | 月柱乙巳、起运 121 年 8 月、人元「立夏后 0 日」、2109 交运崩溃 | 月柱**甲辰**、起运 10 年 2 月 13 天、人元「清明后 30 日」 | ✅ |
| 1987-05-06 18:00（立夏 17:05 后） | — | 月柱**乙巳** | ✅ |
| 1987-05-07 | — | 月柱**乙巳** | ✅ |

---

## 三、变更影响面（目标文件修改清单）

| 文件 | 改动点 | 位置 | 规模 | 状态 |
|------|--------|------|:---:|:---:|
| algorithm.js | monthPillar 完整时刻（birthMs/BJT_OFFSET/stMs/nextMs/lcMs） | L203-244 | ~15 行 | ✅ 已改 |
| algorithm.js | renYuanSiLing 签名 + 完整时刻 | L555-590 | ~8 行 | ✅ 已改 |
| algorithm.js | paipan 立春 lc2Ms | L596-601 | ~4 行 | ✅ 已改 |
| algorithm.js | 头部注释 v0.22.0 → v0.23.4 | L1 | 1 行 | ⚠️ 待办 |
| index.html | monthPillar 完整时刻（同步） | L4288-4323 | ~15 行 | ✅ 已改 |
| index.html | renYuanSiLing 5 参签名（同步） | L4644-4680 | ~8 行 | ✅ 已改 |
| index.html | renYuanSiLing 调用 5 参 | L8170/8175/8184/8192 | 4 行 | ✅ 已改 |
| index.html | 交运循环 null 判空 | L7217-7226 | ~4 行 | ✅ 已改 |
| index.html | **paipan 立春 lc2Ms（同步遗漏）** | L4684-4687 | ~4 行 | ⚠️ **待办** |
| index.html | 头部注释 v0.23.0 → v0.23.4 | L2 | 1 行 | ⚠️ 待办 |
| standalone.html | 与 index.html 同构（同 5 项） | 同上 | — | ⚠️ 立春待办 + 头部待办 |
| render.js | **renYuanSiLing 调用 3 参 → 5 参** | L1326/1331/1340/1348 | 4 行 | ⚠️ **待办** |
| render.js | 交运循环判空（已有，确认） | L375/381 | 0 | ✅ 无需改 |
| render.js | 头部注释 v0.22.0 → v0.23.4 | L1 | 1 行 | ⚠️ 待办 |
| standalone-split.html | 无内联 JS 改动（script src 自动获得） | — | 0 | ✅ |
| **合计** | | | **~70 行** | |

**体积/性能影响**：纯算法比较逻辑替换，无新增依赖、无网络请求、无渲染管线改动；每次排盘多一次 `getTime()+288e5` 算术，可忽略。

---

## 四、风险矩阵

| 编号 | 风险 | 概率 | 影响 | 缓解 |
|------|------|:---:|:---:|------|
| R1 | **内联同步遗漏（本版最大风险）**：render.js 调用仍是 3 参、内联版 paipan 立春未同步——模块版与内联版行为不一致，复现 L1 历史事故 | 高（已实际发生） | 高 | ADR §三 明确待办；编程师按清单改；测试师双环境回归（standalone-split 与 index.html 同锚点）；check-release.sh 六模块一致性兜底 |
| R2 | 时区基准理解偏差：误用 `new Date(y,m-1,d,h,mi)` 本地构造比较 | 中 | 高 | ADR §二 固化 BJT-as-UTC；实现必须用 `Date.UTC` + `getTime()+288e5`；测试锚点双环境断言 |
| R3 | beforeLC 立春边界在极端年份（999/2100 边界 null）未处理 | 低 | 中 | 已保留 `lcMs !== null` 判断 + 极值哨兵；T03 边界断言覆盖 |
| R4 | daysAfter 语义变化：renYuanSiLing 改完整时刻后「节后 N 日」跨节气当天的显示值可能 ±0/±1 | 低 | 低 | 语义更精确（节后真实经过天数）；测试锚点 6:30/18:00 双点断言 |
| R5 | standalone-split.html 混入 v0.24.0 账号功能（工作区已有 auth/config/records.js 改动） | 中 | 中 | 发布时版本隔离：本版本只提交 algorithm.js/index.html/standalone.html/standalone-split.html 与节气修复相关的 diff，不打包 v0.24.0 文件 |
| R6 | 回滚时内联版/模块版不同步导致线上偶发 | 低 | 中 | 回滚方案见 §六：四文件整体回退到 v0.23.3 tag |

---

## 五、实现指引（给编程师）

### 改动顺序（按依赖排序，8 步）

1. `algorithm.js`：确认三处已改（monthPillar L203 / renYuanSiLing L555 / paipan L596）——如已改跳过；
2. `algorithm.js` L1：头部注释 `v0.22.0` → `v0.23.4`；
3. `index.html` L4684-4687：**paipan 立春同步为 lc2Ms**（`const lc2Ms = lc2 ? lc2.getTime() + 288e5 : null;` + `const effYear = (lc2Ms !== null && birthMs < lc2Ms) ? y - 1 : y;`，birthMs 需在同函数内定义）；
4. `standalone.html`：**paipan 立春同样同步**（保持与 index.html 一致；若已整段同步可 `diff` 校验）；
5. `render.js` L1326/1331/1340/1348：调用改 `renYuanSiLing(ey, em, ed, eh, emi)`（该作用域已有 ey/em/ed/eh/emi 真太阳时变量，L1310 处定义）；
6. `render.js` L1：头部注释 `v0.22.0` → `v0.23.4`；
7. `index.html` / `standalone.html` L2：头部注释 `v0.23.0` → `v0.23.4`；
8. 四文件一致性校验：`diff <(sed 's/v0\.23\.4/VER/g' index.html) <(sed 's/v0\.23\.4/VER/g' standalone.html)` 确认内联版同构；`node bazi_fix_verify.js` 复测锚点。

### 自检清单（8 项）

- S1 algorithm.js 三处修复存在且带 v0.23.4 注释；
- S2 render.js 4 处调用均为 5 参 `(ey, em, ed, eh, emi)`；
- S3 index.html 与 standalone.html 的 paipan 立春均为 lc2Ms 完整时刻（grep `lc2Ms` 双文件命中）；
- S4 index.html 与 standalone.html 交运循环均有 `st ? ... : new Date(-8640000000000000)` 判空；
- S5 四文件头部注释均为 v0.23.4；
- S6 1987-05-06 06:30 排盘正常：月柱甲辰、起运约 10 年（5~20 年区间）、无人元「立夏后 0 日」、无崩溃；
- S7 1987-05-06 18:00 排盘正常：月柱乙巳；
- S8 `standalone-split.html?test=1` 与 `index.html?test=1` 双环境断言全绿。

### 关键陷阱（3 个）

1. **render.js 调用 3 参是最容易漏的一处**——algorithm.js 已改签名但 render.js 没同步时，`h/minute` 参数为 undefined，`h||0` 退化为零点，修复等于没生效；grep `renYuanSiLing(solarY` 应 0 命中；
2. **内联版 paipan 立春同步**——编程师先改 algorithm.js 时容易只同步 monthPillar/renYuanSiLing/交运三处，漏掉 paipan 的 lc2Ms；grep `lc2Date` 双文件应 0 命中；
3. **时区口径**——所有新比较必须 `Date.UTC` + `getTime()+288e5`，禁止引入 `new Date(y, m-1, d, h, mi)` 本地构造（即使当前环境是东八区，浏览器用户时区可能不是）。

---

## 六、验证方案与回滚

### 验证方案（对齐 PRD §6 断言 AC01-AC08 + T01-T04）

1. **Node 层验证**（架构师已做）：`/tmp/bazi_fix_verify.js` 实测——1987-05-06 06:30 月柱甲辰、起运 10 年 2 月 13 天；18:00 乙巳；05-07 乙巳；人元司令 6:30 = 清明后 30 日（不再「立夏后 0 日」）；
2. **自动化断言**：`main.js` 测试 IIFE（`?test=1`）追加/对齐 T01-T04：
   - T01：1987-05-06 06:30 → 月柱甲辰；
   - T02：1987-05-06 06:30 → 起运总月数 ∈ [60, 240]（5~20 年），拒绝 1456；
   - T03：边界年份（如 1000/2100 附近）→ 排盘不抛异常；
   - T04：1987-05-06 18:00 → 月柱乙巳（对照锚点）；
3. **双环境回归**：`standalone-split.html?test=1`（模块版）+ `index.html?test=1`（内联版）断言全绿——**这是 L1 同步防线**；
4. **手动冒烟**：三文件各排一次 1987-05-06 06:30，确认无崩溃、月柱/起运/人元司令正确、交运文案正常。

### 回滚方案

- 四文件整体回退：`git checkout v0.23.3 -- algorithm.js render.js index.html standalone.html standalone-split.html`（v0.23.3 tag 为崩溃前基线）；
- 若仅 render.js 回退：因 algorithm.js 签名已 5 参、render.js 3 参调用不崩但退化零点比较，**必须成对回退**（algorithm.js 与 render.js 同进同退）；
- 回滚后验证 1987-05-06 06:30 恢复崩溃前行为（预期复现原 bug，确认基线一致），再评估修复方案调整。

---

## 七、非目标（与 PRD 第八节一致）

不做节气表数据修正（节气时刻本身准确，问题在比较基准）；不做起运年限的上限校验/告警（根因修复后不会再有 121 年这类越界值）；不做交运显示格式变更；不改农历/真太阳时逻辑；不做其他年份/时区扩展；不处理 v0.24.0 账号功能（工作区并行改动，另行发布）。
