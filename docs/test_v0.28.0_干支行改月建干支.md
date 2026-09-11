# 测试用例：v0.28.0 当年节气数据区 · 干支行改为月建干支

> 归属：八字排盘（从真版） ｜ 作者：测试工程师（worker_357e5cd9） ｜ 编排：orch_eccabe4429eb
> 日期：2026-09-10 ｜ 基线：tag `v0.26.0` + v0.27.0 内测态（工作树）
> 被测物：`/Users/feng/.clacky/ext/local/bazi-paipan`
> 依据：PRD_v0.28.0（md5 7bb0f2dd…） / ADR_v0.28.0（md5 c8cd91d9…，D1–D6 + N1/N2）
> 需求一句话：每列最后一行 `.jq-gz` 由「交节当天公历自然日日柱」改为「该节所起月份的**月建干支（月柱）**」；**仅换数据源，版式零变化**。

---

## 一、口径映射（AC → 用例 → 断言）

| AC（PRD §5） | 用例 | 断言/证据 | 判定 |
|---|---|---|---|
| v0.28-AC01 每列第 6 行=月建、竖排 | TC-01 | CI-02 / T01 / UI-01 | 结构+值 |
| v0.28-AC02 1982 十二节锚点全中 | TC-01 | AN-01 / T01 / UI-01 | 12/12 |
| v0.28-AC03 口径切换证据（戊午→壬寅） | TC-01 | AN-01 / T01 | 立春 |
| v0.28-AC04 出生时点无关性 | TC-02 | CI-01 / T02 / UI-04 | 经度代理 |
| v0.28-AC05 版式零变化 | TC-03 | CI-03 / T04 / UI-01 | 行序×12 |
| v0.28-AC06 流年联动 | TC-06 | T03 / UI-02/03 | DOM 刷新 |
| v0.28-AC07 双胞胎共享块 | TC-07 | T03 | 共享块唯一 |
| v0.28-AC08 表外防御 | TC-08 | CI-04 / T04 | 占位不抛 |
| v0.28-AC09 三端一致 | TC-09 | CI-05/06/07 | diff+门禁 |
| v0.28-AC10 无回归 | TC-00 | CI-08 / T01–T04 全绿 | 429 条 |

回归项：R01 旧断言全绿（393）/ R02 三端一致 + `check-release.sh` EXIT=0 / R03 边界不抛。

## 二、测试用例

### TC-01 锚点与口径切换（P0）
- **输入**：`buildJieqiHtml(1982)`（1982 = 壬戌年，年干 壬）。
- **期望**：12 列 `.jq-gz` = 壬寅/癸卯/甲辰/乙巳/丙午/丁未/戊申/己酉/庚戌/辛亥/壬子/癸丑；立春列由旧口径 **戊午** 变为 **壬寅**。
- **方法**：① 独立复算（node+vm 载入真实 constants.js/algorithm.js）；② 页内 T01 值级断言；③ 真实 DOM 读取。

### TC-02 出生时点无关性（P1）
- **输入**：同 `year=2026`，分别用经度 116.4 / 75.9 / 无经度（null）。
- **期望**：三者的 12 列 `.jq-gz` **完全一致**（证明不依赖出生时点比较链）。
- **方法**：T02 断言 + UI-04（lng=null 真实渲染）；代码级签名无出生入参。

### TC-03 版式零变化（P0）
- **输入**：任意 year 渲染。
- **期望**：每列仍 6 行，子元素序 `jq-md → jq-tm → jq-tsmd → jq-tstm → jq-name → jq-gz`；`.jq-gz` 输出逐字节 `<div class="jq-gz"><span class="jq-gan">干</span><span class="jq-zhi">支</span></div>`（无属性/空白）；12 节横排、`data-term` 不变。
- **方法**：CI-03 正则 + T04 + UI-01 行序读取。

### TC-06 流年联动（P0）
- **输入**：1982 命主，点击 `#output .liu-row .li[data-di=0][data-li=0]` 与 `button[title="定位今年"]`。
- **期望**：节气块标题与 12 列 `.jq-gz` 随年份刷新，且值 = `buildJieqiHtml(新year)`。
- **方法**：UI-02/03 + T03。

### TC-07 双胞胎共享块（P1）
- **输入**：同卵双胞胎命主。
- **期望**：共享节气块唯一（×1）且干支随年份刷新。
- **方法**：T03（同卵共享/刷新）。

### TC-08 表外防御（P1）
- **输入**：`buildJieqiHtml(2100)` / `(2200)` / `(999)` / `(2102)`。
- **期望**：2100 小寒列 `.jq-gz` 为「—」（整列占位，不独立显示月建）；2200 整块 `.jieqi-note` 占位；全部**不抛异常**、无 NaN/undefined 泄漏。
- **方法**：T04 + CI-04。

### TC-09 三端一致与门禁（P0）
- **期望**：`render.js` / `main.js` 的 index 内联副本、standalone 内联副本、外部文件三方一致；`index.html` 与 `standalone.html` 字节一致；`standalone-split.html` 走外链未改；`check-release.sh` EXIT=0。
- **方法**：CI-05（cmp）/ CI-06（N1 人工 diff）/ CI-07（check-release）。

### TC-00 无回归（P0）
- **期望**：`?test=1` 双环境（file:// 单体 + http 模块版）全绿，总数 **429 = 393（v0.26 339 + v0.27 54）+ 36（v0.28）**；v0.26 T04 结构正则仍命中×12。

## 三、静态检查项（CI）

| 编号 | 检查内容 | 判据 |
|---|---|---|
| CI-01 | `yearGan` 在 `for` 循环**外**、`st` null 闸门**之后**算一次 | 三端 3/3；`render.js:321` |
| CI-02 | `jieqiMonthGZ` 纯函数（五虎遁直推）+ `jqGanzhiOf` 薄壳（st/gz 双判空） | 三端 3/3；`render.js:369/377` |
| CI-03 | `.jq-gz` 输出形态逐字节不变、无属性 | 正则命中×12 |
| CI-04 | `st=null` → 占位「—」 | 2100 小寒 |
| CI-05 | `cmp index.html standalone.html` | 一致 |
| CI-06 | N1 人工 diff（render/main：内联×2 vs 外部） | 2×True |
| CI-07 | `check-release.sh` | EXIT=0 |
| CI-08 | v0.28 IIFE 段在 main/index/standalone **逐字节相同** | 由 CI-06 覆盖 |
| CI-09 | `yearGan` 只取 `yearPillar(year).gan`，**无** `yearPillar(year+1)` | 走查 |
| CI-10 | 版本纪律：`ext.yml` 仍 0.27.0、CHANGELOG 无 v0.28 条目、无新 commit | git/mtime |
| CI-11 | `dayPillar` 未被 `jieqiMonthGZ`/`jqGanzhiOf` 引用（仅余 `:53` 死别名） | 走查 |

## 四、环境与脚本
- 断言执行：headless Chrome / CDP（端口 9333），`?test=1`。
- 独立复算：`node + vm` 载入真实 `constants.js` + `algorithm.js`（`/tmp/v28_anchor_test.js`）。
- UI 冒烟：`/tmp/v28_ui_probe2.py`（真实 `ALGO.paipan` + `renderChart` 进 `#output` + DOM 点击）。
- 门禁：`bash scripts/check-release.sh .`；N1 兜底 `/tmp/v28_diff_adr_exact.py`。
