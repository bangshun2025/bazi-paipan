# 验收报告：v0.28.0 当年节气数据区 · 干支行改为月建干支

> 归属：八字排盘 · 从真版 ｜ 作者：测试工程师（worker_357e5cd9）
> 日期：2026-09-10 ｜ 编排：orch_eccabe4429eb ｜ 基线：tag `v0.26.0` + v0.27.0 内测态
> 被测物：`/Users/feng/.clacky/ext/local/bazi-paipan`
> 依据：PRD_v0.28.0（md5 `7bb0f2dd5591dac7d70250664c45c1c4` ✅）/ ADR_v0.28.0（md5 `c8cd91d9f3d054b781491dcd3af68618` ✅）
> 对照用例：`docs/test_v0.28.0_干支行改月建干支.md`

---

## 一、结论（TL;DR）

**✅ 通过（建议放行内测 → 正式）**

| 级别 | 数量 | 说明 |
|---|---|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 0 | — |
| P3 | 0 | — |

- v0.28-AC01 ~ AC10 全部通过；R01–R03 通过。
- `?test=1` 双环境（file:// 单体 + http 模块版）均「✅ 全部通过」，**429 条断言**（= v0.26 339 + v0.27 54 + v0.28 **36**），❌ **0**。
- 1982 十二节锚点 **12/12 全中**（独立复算 + 页内断言 + 真实 DOM 三重证据）。
- `check-release.sh` EXIT=0；`index.html` 与 `standalone.html` 字节一致；`render.js`/`main.js` 三端一致。
- 版本纪律：`ext.yml` 仍 0.27.0、CHANGELOG 无 v0.28 条目、无新 git commit。

## 二、方法与证据来源

1. **独立复算**（不信编程师结论）：`node + vm` 沙箱加载**仓库真实** `constants.js` + `algorithm.js`，取 `window.CONST`/`window.ALGO`，按五虎遁自算 12 列并与 ADR §5.2 锚点比对。
2. **静态走查**：逐条核对 ADR 的 D1–D6 / N1 / N2 落点与 CI-01~CI-11。
3. **自动化断言**：CDP 驱动 `?test=1` 双环境，统计总数/失败数/分区明细。
4. **真实 UI 复核**：真实 `ALGO.paipan` → `renderChart` 进真实 `#output` → DOM 读取 + 真实点击流年 / 📍今年。
5. **门禁与 diff**：`check-release.sh` + ADR §6.2 人工 diff 兜底 + `cmp` 字节比对。

---

## 三、逐项验收结果

### 3.1 独立复算（`/tmp/v28_anchor_test.js`，node+vm 载入真实库）

```
CONST keys: 35 | ALGO keys: 40
A.yearPillar(1982) = 壬戌 (gan=壬)
1982 直推 12 列: 壬寅 癸卯 甲辰 乙巳 丙午 丁未 戊申 己酉 庚戌 辛亥 壬子 癸丑
1982 vs ADR锚点: 12/12 ✅ 全中
yearPillar(1983).gan = 癸
小寒(i=11) 正解(年干=壬): 癸丑 | 误用次年干(癸): 乙丑
1982 年干=壬 直推寅月=壬寅 monthPillar=壬寅 ✅
2026 / 2000 / 1990 / 2100 直推寅月 vs monthPillar 全部 ✅（5/5）
2026 年干=丙 12 列: 庚寅 辛卯 壬辰 癸巳 甲午 乙未 丙申 丁酉 戊戌 己亥 庚子 辛丑
getSolarTerm(2101,0) = null
```

- **AC02 锚点 12/12 全中**；**AC03 切换证据**：1982 立春 旧口径 戊午 → 新口径 **壬寅**。
- **R-V28-01（P0 off-by-one）已排除**：代码走 `yearPillar(year)`（正解 癸丑）；反例「误用 `yearPillar(year+1)`」实测得 **乙丑**，与 ADR §10（N2）勘误一致（**PRD §4.3 原文误写「甲寅」**，不影响设计结论）。
- 与 `ALGO.monthPillar` **同源同式**、5 组年份交叉一致 → 口径正确性双向印证。

### 3.2 静态走查（CI-01~CI-11）

| 编号 | 结果 | 证据 |
|---|---|---|
| CI-01 `yearGan` 循环外、null 闸门后 | ✅ | `render.js:321` `var yearGan = yearPillar(year).gan;`（在 `needLngHint` 之后、`for` 之前）；三端 3/3 |
| CI-02 纯函数 + 薄壳 | ✅ | `render.js:369 jieqiMonthGZ(yearGan,i)`；`:377 jqGanzhiOf(st,yearGan,i)` 双判空（`!st` / `!gz`） |
| CI-03 `.jq-gz` 形态不变 | ✅ | 调用点 `:350`；输出逐字节 `<div class="jq-gz"><span class="jq-gan">干</span><span class="jq-zhi">支</span></div>`，无属性 |
| CI-04 `st=null`→占位 | ✅ | `jqGanzhiOf` 首行；2100 小寒 T04 |
| CI-09 无 `yearPillar(year+1)` | ✅ | 全仓走查，未见次年干推算 |
| CI-11 `dayPillar` 未被新函数引用 | ✅ | `grep dayPillar render.js` 仅 `:53` 死别名 + 一行注释（符合 ADR 保留裁决） |
| CI-10 版本纪律 | ✅ | 见 §3.5 |

### 3.3 断言执行（`?test=1` 双环境）

| 环境 | title | 通过 | 失败 | 分区 |
|---|---|---|---|---|
| A) `file://…/index.html?test=1` | ✅ 全部通过 | **429** | 0 | 当年节气数据区(V0.28) 存在 |
| B) `http://localhost:7070/api/ext/bazi-paipan/standalone?test=1` | ✅ 全部通过 | **429** | 0 | 同上 |

- **v0.28 分区「当年节气数据区(V0.28)」36 条全 ✅**：T01=19 / T02=3 / T03=7 / T04=7。
- T01 含 12 列逐列等值 + 立春切换 + 小寒 off-by-one + 3 条 `jieqiMonthGZ` 纯函数单测（含反例 `jieqiMonthGZ('癸',11)=乙丑`）。
- T03 覆盖 `refreshJieqi(2030/2026/1982)`、同卵共享块唯一、显式经度；T04 覆盖 2100/2200/999/2102 边界 + v0.26 T04 结构正则回归。
- **AC10 无回归**：v0.26（339）+ v0.27（54）= 393 条仍全绿（总数 429 = 393 + 36）。

### 3.4 真实浏览器 UI 复核（`/tmp/v28_ui_probe2.py`，真实 `#output`）

| 场景 | 观测 |
|---|---|
| 1982（出生年）渲染 | 12 列 `.jq-gz` = 壬寅…癸丑（**12/12**）；行序 `jq-md→jq-tm→jq-tsmd→jq-tstm→jq-name→jq-gz`；标题「1982 年 · 十二节（立春→小寒）」；`_jieqiLng=116.4`、`_jieqiYear=1982`；立春列 `☀ 2/4 / ☀ 11:17` |
| 首列 HTML | `<div class="jq-gz"><span class="jq-gan">壬</span><span class="jq-zhi">寅</span></div>`（无属性，符合 T04 正则） |
| 点流年 `.liu-row .li[di=0,li=0]` | 标题 → **1988**；12 列 → 甲寅 乙卯 … 乙丑（1988 戊辰年寅月=甲寅 ✅） |
| 点 📍今年 | 标题 → **2026**；12 列 → 庚寅 辛卯 … 辛丑（2026 丙午年寅月=庚寅 ✅） |
| `lng=null` 真实渲染 | `_jieqiLng=null`；12 列干支仍为正确月建（**与经度无关**）；`☀` 两行全「—」；标题含「（未选出生地，真太阳时不可用）」 |

> **AC04 出生时点无关性**：签名无出生入参 + T02（不同经度/无经度一致）+ UI `lng=null` 三重证据；干支仅取决于 `year`。

### 3.5 三端一致 / 门禁 / 版本纪律

```
$ bash scripts/check-release.sh .        → 🎉 全部校验通过，EXIT=0（四段全过）
  【2/4】index vs standalone：constants/algorithm/archive/gongwei/render/main/config/auth/records/gongwei-cloud/supabase.min 全一致
  【3/4】三文件关键 id/class（含 jieqi-section / jq-gz / jq-tsmd / jq-tstm）全绿
  【4/4】外部 JS vs 内联段：gongwei/gongwei-cloud/config/auth/records/supabase.min 一致（※ 不含 render/main，见 N1）
$ cmp index.html standalone.html         → 字节一致 ✅
$ node --check render.js / main.js       → OK ✅
$ python3 /tmp/v28_diff_adr_exact.py     → render.js: 内联×2 与外部 全 True（len 88242×3）
                                          main.js:   内联×2 与外部 全 True（len 79253×3）
$ 版本纪律                                → ext.yml version "0.27.0" ✅；CHANGELOG 无 v0.28 条目 ✅；HEAD 仍 28940ad（无新 commit）✅
```

- **N1 校验盲区已确认并兜底**：`check-release.sh` 第 4 段 `MODULES_EXT` 确不含 `render/main`（实测第 4 段仅 6 项），故本版**额外执行 ADR §6.2 人工 diff**，render/main 三端一致性由人工兜底保证（两行均 True）。
- `standalone-split.html` 走外链（`:898 render.js` / `:899 main.js`），本次**未改**（mtime 20:59 = v0.27 期；含 0 处 v0.28 特征）✅。
- CHANGELOG/SYSTEM 的未提交改动 mtime（20:59）早于 v0.28 代码（render 21:42、index 21:43）→ 属 **v0.27 遗留**，本次未触碰 ✅。

---

## 四、缺陷清单

**本次未发现 P0 / P1 / P2 / P3 缺陷。**

### 观察项（非缺陷，供 Leader 知悉）
| 编号 | 内容 | 判定 |
|---|---|---|
| OBS-01 | `check-release.sh` 第 4 段 `MODULES_EXT` 不含 `render/main`，外部↔内联漂移无自动检查（ADR N1） | 非本版引入；本版已人工 diff 兜底；建议后续版本纳入脚本（独立改进项） |
| OBS-02 | PRD §4.3「反例警示」示例数值有误：误用次年干得 **乙丑**，非「甲寅」（ADR N2 已勘误） | 文档勘误，不影响设计结论与实现；建议 PRD 下一版顺手修订 |
| OBS-03 | `render.js:53` `var dayPillar = ALGO.dayPillar;` 改后为死别名 | ADR 明确裁决保留（diff 最小）；非缺陷 |
| OBS-04 | `clacky ext verify` 对 `bazi-paipan-test`/`qimen-*` 的 version 带 `v` 前缀报 schema 告警 | 存量、非本次引入（Leader 已明示不计入本版） |

## 五、未覆盖 / 限制
- **`monthPillar` 8h 时基缺陷**：按 PRD §1.3/§6.3 明确**不在本版范围**，本版刻意不经该比较链；本次仅做「与直推同源一致」交叉印证，未对其做修复性验证。
- **移动端多档 dpr**：本版无 CSS/布局改动（仅 `.jq-gz` 数值数据源变更），未重复截图。
- **AC04「不同出生时分」**：以「不同经度 / 无经度」作可观测代理 + 代码级签名无出生入参佐证（未逐一枚举各时辰，因干支只取决于 `year`，结构上不可能随时分变化）。

## 六、结论与放行建议
- v0.28.0「干支行改为月建干支」D1–D6 全部落地，AC01–AC10 通过，R01–R03 通过，429 条断言全绿（❌0），1982 锚点 12/12，三端一致与发布门禁通过。
- **建议放行**：先出内测 tag 验证，再升正式。**升版（`ext.yml` / CHANGELOG / SYSTEM / 版本头注释）属发布师职责**，测试侧未改动任何版本号、未 commit。
- 无可阻断缺陷；OBS-01（脚本盲区）建议作为独立改进项排期。

---

### 附：执行证据来源
- 独立复算：`/tmp/v28_anchor_test.js`（node + vm，真实 `constants.js`/`algorithm.js`）
- 断言执行：`/tmp/v28_run.py`、`/tmp/v28_locate.py`（CDP 9333，`?test=1` 双环境）
- UI 复核：`/tmp/v28_ui_probe2.py`（真实 `#output` + DOM 点击）
- 门禁/diff：`bash scripts/check-release.sh .`、`/tmp/v28_diff_adr_exact.py`


