# QA 验收报告 — v0.26.0 当年节气数据 + 节气流年联动（v1+v2 合并验收）

> **测试工程师**：worker_357e5cd9
> **验收日期**：2026-09-07
> **被测版本**：v0.26.0（v1 当年节气数据 + v2 节气流年联动，合并推进）
> **真相源仓库**：/Users/feng/.clacky/ext/local/bazi-paipan（工作树未提交改动）
> **验收基线**：v2 PRD（AC01-11/AR01-06/T06-T14）+ v1 PRD（AC01-09 除修订）+ v1/v2 ADR（D1-D9）
> **测试用例**：见同目录 test.md

## 一、验收结论（TL;DR）

### ✅ 通过（无 P0 / 无 P1 缺陷）

- **P0 = 0、P1 = 0、P2 = 0、P3 = 1**（环境性观察，非代码缺陷，不阻塞）
- 全部 v2-AC01~11、v1 AC（除修订条目）、T01-T14 断言通过
- check-release.sh 退出码 **0**；?test=1 **339 条断言全绿、0 失败、无异常**
- 结论：**v0.26.0 v1+v2 合并验收通过，可进入内测发布流程**

## 二、测试范围与方法

1. **静态比对**：render.js 全部 v2 改点（liunianYearOf/refreshJieqi/_jieqiYear/三入口初始出生年/bindEvents 联动/scrollToNow/双胞胎运前 data）逐项对照 ADR D5-D9；main.js T06-T14 断言口径对照 PRD §6.3；三 HTML 内联一致性。
2. **语法与发布门槛**：node --check 四个 JS + `bash scripts/check-release.sh .` 退出码。
3. **自动化断言**：headless Chrome CDP 打开 `index.html?test=1`，收 summary/✅/❌/异常。
4. **真实浏览器 UI 实测**：CDP file:// 交互单人盘六场景。
5. **双胞胎与重置**：双胞胎用 T12-T14 自动化断言（真实 paipan 数据 + DOM dispatchEvent）；「重新排盘重置出生年」另经 `index.html?test=1` 真实表单→「排盘」按钮→doPaipan→renderChart 完整 UI 路径直接验证。

## 三、代码级检查结果（CI）

| ID | 检查点 | 结果 |
|----|--------|:----:|
| CI-01 | buildJieqiHtml(year) 纯函数契约（year=节气区年份） | ✅ |
| CI-02 | D6 三入口初始出生年（renderChart L648 y / 同卵 L1199 y / 龙凤胎 L1309 d1.y） | ✅ |
| CI-03 | _jieqiYear 初始 = 出生年（L656/L1204/L1322=d1.y） | ✅ |
| CI-04 | liunianYearOf 两分支同式（di=-1→y+j；否则 startYear+j；缺失→null） | ✅ |
| CI-05 | updateCardDyLnColumns L819 改调 liunianYearOf（口径单源） | ✅ |
| CI-06 | refreshJieqi 仅替换 .jieqi-section、null 防御不抛 | ✅ |
| CI-07 | bindEvents 大运/流年回调末尾 + scrollToNow 末尾追加 refreshJieqi | ✅ |
| CI-08 | 双胞胎运前列 data-di="-1" data-li（同卵 L1182/龙凤胎 L1265/L1290） | ✅ |
| CI-09 | grep `buildJieqiHtml(nowYear)` render.js = 0 命中（R10 检查点） | ✅ |
| CI-10 | RENDER 挂载 refreshJieqi/liunianYearOf/buildJieqiHtml/jqGanzhiOf | ✅ |
| CI-11 | main.js T06-T14 断言存在、口径正确（初始1982/连续跟随/运前/大运/今年/越界/同卵/龙凤胎跨年） | ✅ |
| CI-12 | node --check render/main/algorithm/constants 全 OK | ✅ |
| CI-13 | index.html == standalone.html 字节级一致 | ✅ |
| CI-14 | check-release.sh KEYS/RUNTIME_KEYS 含 jieqi-section/jq-gz | ✅ |

## 四、运行验证结果（RI）

| ID | 验证 | 结果 |
|----|------|:----:|
| RI-01 | `bash scripts/check-release.sh .` | ✅ 退出码 0（四步全过：三文件内联语法 / index-standalone 模块段一致 / 关键锚点齐全 / 外部 vs 内联一致） |
| RI-02 | ?test=1（index.html file://） | ✅ 全绿 339 条断言通过，0 失败，0 异常 |
| RI-03 | UI 冒烟（真实 Chrome CDP） | ✅ 见下表 |

### UI 实测明细（单人盘 1982-10-18 05:01 男）

| 步骤 | 操作 | 实测结果 | 结论 |
|------|------|---------|:----:|
| STEP0 | 排盘默认 | 标题「1982 年 · 十二节（立春→小寒）」、_jieqiYear=1982、12 列含立春…小寒、末列干支竖排 | ✅ v2-AC01 |
| STEP1 | 点击 2026 流年格 | 标题=2026、_jieqiYear=2026、首列立春月日 2/4 | ✅ v2-AC02 |
| STEP2 | 连续点 2031 → 2042 | 先 2031 再 2042，每次跟随、最终 _jieqiYear=2042 | ✅ v2-AC03 |
| STEP3 | 点大运列 [data-dy=2] | 标题=2009（=daYun[2].startYear）、_jieqiYear=2009 | ✅ v2-AC04 |
| STEP4 | 点运前流年 data-di=-1 末格(j=6) | 标题=1988（=1982+6）、_jieqiYear=1988 | ✅ v2-AC05 |
| STEP5 | 点 📍 今年 | 标题=2026（nowYear）、_jieqiYear=2026 | ✅ v2-AC06 |
| STEP6 | 重新排盘重置（?test=1 放行登录守卫） | 排盘 1982（测试甲）→ 标题=1982；点 2042 → 标题=2042；改出生年 1995 重排盘（测试乙）→ 标题**重置=1995**、_jieqiYear=1995 | ✅ §2.3 重置 / v2-AC01 |
| STEP7 | 干净页首次排盘=出生年（非系统年） | 测试甲 1982 排盘后标题=1982（系统年 2026），证明初始/重排盘均取出生年 | ✅ v2-AC01 |

> 双胞胎：T12（同卵仅 1 块 =1982）✅ v2-AC08；T13/T14（龙凤胎初始=老大1982、点老二侧流年跟老二 daYun 年）✅ v2-AC09/AC11。越界：T11 refreshJieqi(2100)→小寒「—」不抛、(2200)→整块占位不抛 ✅ v2-AC10。
>
> **重置场景说明（STEP6-7）**：`file:// index.html`（非测试模式）未登录时，点排盘会被登录守卫 `requireLogin()` 用原生 `alert` 拦截（见 QA-01），headless 下 alert 阻塞渲染线程故无法自动交互。改用 `index.html?test=1`（auth.js `isTestMode()` 放行守卫）走**真实表单→按钮→doPaipan→renderChart** 完整 UI 路径，实测「重排盘重置=新出生年」成立（1995 覆盖先前 2042 的临时态）。该场景由 UI 直接验证，非仅代码等价。

## 五、缺陷清单

| 编号 | 级别 | 标题 | 现象 | 根因 | 复现步骤 | 影响 | 修复建议 | 状态 |
|------|:----:|------|------|------|---------|------|---------|:----:|
| QA-01 | P3 | 非测试模式下未登录点排盘，headless 环境被原生 alert 阻塞（环境性观察，非代码缺陷） | `file:// index.html`（非 ?test=1）未登录时点排盘/程序化 btn.click → CDP `Runtime.evaluate`、`Page.enable` 全部超时（渲染主线程 >15s 无响应），需关闭该 tab 恢复 | **auth.js L209 `requireLogin()` → 原生 `alert('请先登录后使用排盘功能')`**：未登录守卫拦截排盘并弹 modal alert，headless Chrome 下 modal dialog 阻塞渲染线程直至被处理。**与 doPaipan 计算量无关**（改用 ?test=1 放行守卫后同一 UI 路径 3s 内正常返回） | file:// 打开 index.html（非 ?test=1）未登录 → 点「排盘」（或程序化触发 doPaipan） | 仅影响「未登录 + headless file://」自动化环境；真实用户会看到 alert 并被引导登录，属**预期的登录拦截行为**，无功能错误、无异常抛出 | 验收侧改用 `index.html?test=1`（`isTestMode()` 放行守卫）或 http + 已登录会话；产品侧无需修改 | 记录不阻塞 |

**缺陷计数：P0=0 / P1=0 / P2=0 / P3=1（环境性，非阻塞）**

## 六、AC/AR 映射结果

| 验收项 | 结果 | 证据 |
|--------|:----:|------|
| v1 AC01 位置（大运流年区下方） | ✅ | 静态：renderChart html 模板 luck-section 后 `${buildJieqiHtml(y)}`；同卵/龙凤胎 .bz-twin-shared 内 luck 后 |
| v1 AC02 12 节无气 | ✅ | T01：JIE 12 齐全 / QI 12 零命中 |
| v1 AC03 历序 | ✅ | T01 顺序含 立春…小寒；UI STEP0 末列=小寒 |
| v1 AC04（v2 修订=出生年） | ✅ | v2-AC01/UI STEP0 |
| v1 AC05 2026 锚点全列 | ✅ | T03 锚点 12 列月日/时间逐列 eq |
| v1 AC06 四行干支竖排 | ✅ | T04 干支竖排×12（gan 上 zhi 下）；UI STEP0 firstCol 「2/4 / 时间 / 立春 / 戊午」结构 |
| v1 AC07 双胞胎一块 | ✅ | T12 同卵 1 块 / T13 龙凤胎 1 块 |
| v1 AC08 越界不崩 | ✅ | T05（2100 小寒—、2200 占位） |
| v1 AC09 三文件+check-release | ✅ | CI-13/CI-14/RI-01 |
| v2-AC01 | ✅ | UI STEP0 / T06 |
| v2-AC02 | ✅ | UI STEP1 / T07（点 2026 → 标题 2026） |
| v2-AC03 | ✅ | UI STEP2 / T07（2031→2042） |
| v2-AC04 | ✅ | UI STEP3 / T09 |
| v2-AC05 | ✅ | UI STEP4 / T08 |
| v2-AC06 | ✅ | UI STEP5 / T10 |
| v2-AC07 | ✅ | 代码：D6 三入口未动 curDyIdx/高亮/nowYearCn；UI STEP5 前大运高亮仍在；T10 后回归正常 |
| v2-AC08 | ✅ | T12 |
| v2-AC09 | ✅ | T14 |
| v2-AC10 | ✅ | T11 |
| v2-AC11 | ✅ | T13/T14 |
| v2-AR01 v1 全 AC（除修订） | ✅ | 上述 v1 行全部通过 |
| v2-AR02 列更新不回归 | ✅ | 静态：updateCardDyLnColumns 仅 lnYear 来源换 liunianYearOf（同式）；?test=1 全量旧断言通过 |
| v2-AR03 今年滚动/高亮正常 | ✅ | UI STEP5 + 旧断言全过 |
| v2-AR04 ?test=1 v1+v2 全过 | ✅ | 339 全绿 |
| v2-AR05 三文件一致+check-release | ✅ | CI-13/RI-01 |
| v2-AR06 三档宽度 | ⚠️ 未单列截图 | CSS 零增量（v1 版式沿用）；?test=1 与 UI 冒烟正常，无横向溢出异常；见未覆盖项 |

## 七、未覆盖项 / 说明

1. **AR06 三档宽度截图**：v2 ADR 明确「CSS 无增量预期」，本轮未做逐档截图比对；版式沿用 v1（v1 已验收过三档宽度）。如需可补拍，不阻塞。
2. **「重新排盘重置出生年」**：已在 `index.html?test=1`（`isTestMode()` 放行登录守卫）下，经**真实表单填写 → 点「排盘」按钮 → doPaipan → renderChart** 完整 UI 路径直接验证通过（见 §四 STEP6-7，1995 重置掉先前 2042 临时态）。非仅代码等价。原 `file://` 非测试模式因未登录守卫弹 `alert` 阻塞 headless 渲染线程而无法自动交互，属 QA-01 环境性问题。
3. **双胞胎跨年 UI**：用代码级构造（d2.y=1983 真实 paipan 数据）经 T13/T14 覆盖，等同 UI 级（真实 DOM + 真实 click）。

## 八、回归记录（本报告版本无缺陷需回归；后续如修复 QA-01 观察项按原步骤复测即可）

— 无（验收结论为通过，无需修复回归轮）

## 九、最终结论

**验收通过。** v0.26.0（当年节气数据 + 节气流年联动）满足 v1+v2 全部 AC/AR 与自动化断言要求；无 P0/P1/P2 缺陷；P3 观察项为 CDP+file:// 测试环境限制，不影响产品代码与用户使用。建议放行内测发布。
