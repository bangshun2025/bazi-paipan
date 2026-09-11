# 验收报告：v0.27.0 节气区「真太阳日月 / 真太阳时间」

> 归属：八字排盘 · 从真版 ｜ 作者：测试工程师（worker_357e5cd9）
> 日期：2026-09-10 ｜ 编排：orch_eccabe4429eb ｜ 基线：tag `v0.26.0`
> 被测物：`/Users/feng/.clacky/ext/local/bazi-paipan`
> 依据：PRD_v0.27.0 / ADR_v0.27.0（D1–D8）｜ 对照用例：docs/test.md

---

## 一、结论（TL;DR）

**✅ 通过（建议放行内测 → 正式）**

| 级别 | 数量 | 说明 |
|---|---|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 0 | — |
| P3 | 1 | QA-01 存量问题 `redrawZuHeSVG` 未定义（v0.26.0 即存在，**非本次引入**，不阻断） |

- v0.27 AC01–AC08、R01–R03 全部通过；T01–T07 全绿。
- `?test=1` 双环境（单体 file:// + 模块 http）均「✅ 全部通过」，**393 条断言**（= v0.26 的 339 + v0.27 新增 54）。
- `check-release.sh` 四段全过，退出码 0；`index.html` 与 `standalone.html` 字节一致。
- 真太阳锚点经**独立复算**（node 加载仓库真实 `constants.js+algorithm.js`）全部吻合。

## 二、方法与证据

1. **静态比对**：逐条核查 D1–D8 落点（`render.js` / 三端 HTML / `check-release.sh`）。
2. **锚点独立复算**：`node + vm` 载入真实 `CONST/ALGO`，复算 2026 十二节 × 三经度（北京 116.4 / 喀什 75.99 / 双鸭山 131.16），与 PRD §6.3、ADR §十 逐格比对。
3. **自动化断言**：CDP 驱动 `index.html?test=1`（file://）与扩展模块版（http），读取 title / banner / 分区明细。
4. **独立 UI 级复核**：直接对真实 DOM 解析 + 真实 `renderChart` + 点击驱动，不依赖编程师断言。
5. **存量核实**：与 `git show v0.26.0:render.js` 逐行 diff。

---

## 三、逐项验收结果

### 3.1 静态核查（CI-01–CI-10）— 全部符合

| 项 | 结果 | 证据 |
|---|---|---|
| D1 经度贯穿 | ✅ | `render.js:1414` `const lng = getLng();` 在 `if(useSolar)` 之外；`d1.lng`(1437)/`d2.lng`(1443)/`data.lng`(1453,1462) 三入口写入 |
| D2 签名+判空 | ✅ | `buildJieqiHtml(year,lng)`(L304)；`hasLng = typeof lng==='number' && isFinite(lng)`(L311) |
| D2 行序 | ✅ | 生成序 `jq-md→jq-tm→jq-tsmd→jq-tstm→jq-name→jq-gz`(L329-335)；v0.26 T03 正则匹配 ×12 |
| D2 提示并列 | ✅ | `needHint`(小寒越界) 与 `needLngHint`(未选出生地) 分开累加、拼接不覆盖(L343-344) |
| D3 回退链 | ✅ | `refreshJieqi`(L381) 第三参→`_jieqiLng`→`_paipanData.lng`；调用点 723/759/1497 仍两参零改动 |
| D5 容器经度 | ✅ | `_jieqiLng` 写于 682(单人)/1231(同卵)/1350(龙凤胎 `d1.lng`) |
| D6 三端 CSS | ✅ | index/standalone/standalone-split 均含 `.jq-tsmd/.jq-tstm`（`#c9a96e`,13px） |
| D7 同步+防线 | ✅ | `cmp index.html standalone.html` 一致；`RUNTIME_KEYS` 含 `jq-tsmd jq-tstm`；`check-release.sh` EXIT=0 |
| CI-09 守卫必要性 | ✅ | 实测 `trueSolarTime(...,null)` 按 0° 返回有限值；`typeof==='number'` 排除 `null` 属必需 |
| CI-10 存量 | ✅ | `redrawZuHeSVG` 引用行内容与 v0.26.0 完全一致 |

### 3.2 真太阳锚点独立复算（与实现同源）— 全部吻合

| 节 | BJT | 北京 116.4 | 喀什 75.99 | 双鸭山 131.16 |
|---|---|---|---|---|
| 立春 | 2/4 04:01 | **2/4 03:33** | 2/4 00:51 | 2/4 04:32 |
| 清明 | 4/5 02:39 | 4/5 02:21 | **4/4 23:40** | 4/5 03:21 |
| 芒种 | 6/5 23:48 | 6/5 23:36 | 6/5 20:54 | **6/6 00:35** |
| 立冬 | 11/7 17:51 | **11/7 17:53** | 11/7 15:11 | 11/7 18:52 |
| 小寒 | 1/5 22:09 | 1/5 21:50 | 1/5 19:08 | 1/5 22:49 |

> 12 节 × 3 经度全格与 PRD §6.3 / ADR §十 一致；跨前（喀什清明）、跨后（双鸭山芒种）均复现。

### 3.3 自动化断言（T01–T07）— 全绿

- 单体 `file://index.html?test=1`：title「✅ 全部通过」，banner「全部 393 条断言通过！」。
- 模块 `http://localhost:7070/api/ext/bazi-paipan/standalone?test=1`：同上，逐项一致。
- v0.27 分区「节气真太阳时(v0.27)」54 条断言（=393−339）：T01(27)/T02(2)/T03(2)/T04(5)/T05(1)/T06(9)/T07(8) 全 ✅，零失败。

### 3.4 独立 UI 级复核（不经编程师断言）— 全过

| 场景 | 观测 |
|---|---|
| DOM 解析 2026×116.4 | 12 列；首列子元素序 `[jq-md,jq-tm,jq-tsmd,jq-tstm,jq-name,jq-gz]`；`.jq-tsmd/.jq-tstm` 各 12；☀ 前缀 ✓ |
| 真实渲染 1982 北京 | `container._jieqiLng=116.4`、`_jieqiYear=1982`；样式 `rgb(201,169,110)`/13px；初始 `1982 年 · 十二节`、立春 `☀ 2/4 11:17` |
| 点大运 `[data-dy=2]` | 标题 → 2009 |
| 点运前 `[data-di=-1][data-li=6]` | 标题 → 1988（1982+6） |
| 点流年 `[data-di=0][data-li=0]` | 标题 → 1989（daYun[0].startYear） |
| 📍今年 `scrollToNow` | 标题 → 2026 |
| 未选出生地（`lng=null`）真实渲染 | `_jieqiLng=null`；12 列两行全「—」；标题含「未选出生地，真太阳时不可用」；无 NaN |

---

## 四、缺陷清单

### QA-01（P3，存量，非本次引入，不阻断）
- **现象**：龙凤胎（同卵/龙凤胎）路径下，点击大运/流年列触发 `setTimeout(function(){ redrawZuHeSVG(...) },80)` 时，控制台报 `Uncaught ReferenceError: redrawZuHeSVG is not defined`。
- **复现**：`index.html?test=1` → 构造龙凤胎 → 点任一大运/流年格 → Console 见 1 条 ReferenceError。
- **根因定位**：`render.js` 仅**引用**未**定义**该符号。
- **存量证据**：
  - `git show v0.26.0:render.js | grep -c redrawZuHeSVG` = **2**（基线即只引用）；
  - v0.27.0 当前 `grep -c` = 2，且参考行内容与基线**逐字一致**（仅行号因上方插入而上移 698/734 → 724/760）；
  - 全仓定义仅存在于历史文件 `发布师/standalone-v0.12.1.html:2192`，未进入现运行时。
- **判定**：**存量缺陷**（v0.26.0 及更早已存在），与 v0.27.0 真太阳时改动无因果关系。建议单独立单、后续版本修复；**不阻断**本次验收。
- **影响评估**：仅龙凤胎点击大运/流年时控制台报错；真太阳时两行展示不受影响（该调用只重绘组合 SVG）。

> 本次未发现 P0/P1/P2 缺陷。

## 五、未覆盖 / 限制
- **移动端多档 dpr 截图**：本版无布局/CSS 结构改动（仅新增两行 + 既有配色），沿用 v0.26 结论，未重复截图。
- **跨月 / 跨年**：由 `trueSolarTime` 既有逻辑保障，本版仅按 PRD 抽验跨日（跨前/跨后）。
- **auth 登录守卫**：真实 UI 冒烟统一用 `?test=1`（`isTestMode()` 放行），非测试模式未登录点排盘会被原生 `alert` 阻塞（沿用 v0.26 QA-01，属预期拦截，非缺陷）。

## 六、结论与放行建议
- v0.27.0「节气区真太阳日月/时间」D1–D8 全部落地，AC01–AC08 / R01–R03 通过，T01–T07 全绿（393 条断言），三端同步与发布防线通过。
- **建议放行**：先发内测 tag 验证，再发正式 tag。**升版（ext.yml / CHANGELOG / 版本头注释）由发布师负责**，测试侧未改动任何版本号。
- 唯一遗留 QA-01 为存量 P3，建议下版本随「组合 SVG 重绘」一并处理，不阻断本次发布。

---

### 附：本次执行证据来源
- 静态：`render.js` / `index.html` / `standalone.html` / `standalone-split.html` / `scripts/check-release.sh`
- 锚点复算脚本：`/tmp/anchor_verify.js`（node + vm 载入真实 `CONST/ALGO`）
- 断言执行：`/tmp/v27_run.py`、`/tmp/v27_locate.py`、`/tmp/v27_tail.py`（CDP 9333）
- 独立 UI 复核：`/tmp/v27_ui_probe.py`


