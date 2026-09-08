# TEST — v0.26.0 当年节气数据 + 节气流年联动（v1+v2 合并验收）

> **版本**：v0.26.0
> **测试工程师**：worker_357e5cd9
> **日期**：2026-09-07
> **关联文档**：PRD_v0.26.0_当年节气数据.md（v1，281 行）、PRD_v0.26.0_节气流年联动.md（v2，221 行）、ADR_v0.26.0_当年节气数据.md（v1，224 行）、ADR_v0.26.0_节气流年联动.md（v2，292 行）
> **真相源仓库**：/Users/feng/.clacky/ext/local/bazi-paipan（未提交 git，HEAD=9015275，基线 tag v0.25.0）
> **测试方法**：静态代码比对 + 自动化断言（?test=1）+ 真实浏览器 UI 实测（headless Chrome CDP）

## 一、缺陷严重级别定义

| 级别 | 定义 | 处理 |
|------|------|------|
| P0 | 致命：核心功能不可用 / 数据错误 / 崩溃 | 必须修复后发布 |
| P1 | 严重：主流程阻塞 / AC 不满足 | 必须修复后发布 |
| P2 | 一般：次要功能异常 / 边界遗漏 | 视发布窗口处理 |
| P3 | 轻微：体验 / 文案 / 一致性瑕疵 | 可记录不阻塞 |

## 二、验收判据（AC 口径）

### 2.1 v1 AC（当年节气数据，除 §二修订条目外仍有效）

- **AC01 位置**：节气块位于右侧大运流年区下方（luck-section 之后）。
- **AC02 集合**：只含 12 节（立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒），不含 12 气（雨水…大寒）。
- **AC03 顺序**：按节气历序 12 列。
- **AC04 年份口径**：【v2 修订】默认 = 出生年（非 nowYear）。
- **AC05 数据正确**：2026 锚点真实交节时刻（BJT 直取）：
  立春 2/4 04:01、惊蛰 3/5 21:58、清明 4/5 02:39、立夏 5/5 19:48、芒种 6/5 23:48、小暑 7/7 09:56、立秋 8/7 19:42、白露 9/7 22:40、寒露 10/8 14:28、立冬 11/7 17:51、大雪 12/7 10:52、小寒(次年) 1/5 22:09。
- **AC06 版式**：四行 —— 第一行月日（jq-md）、第二行时间（jq-tm）、第三行节名（jq-name）、第四行干支竖排（jq-gz：天干上 .jq-gan、地支下 .jq-zhi）。
- **AC07 双胞胎**：共享区只渲染一块节气块。
- **AC08 越界**：2100 年小寒列显示「—」+ 标题轻提示；>2101 整块占位「节气数据仅支持 1000-2100 年」，不崩溃。
- **AC09 回归**：三 HTML（index/standalone/standalone-split）+ check-release.sh 通过。

### 2.2 v2 AC（节气流年联动）

| 编号 | 场景 | 预期 |
|------|------|------|
| v2-AC01 | 单人默认排盘 1982-10-18 05:01 男 | 节气标题 = 1982（出生年），12 节数据 1982 立春…大雪 + 1983 小寒 |
| v2-AC02 | 点击 2026 流年格 | 切到 2026，立春列 2/4 04:01（AC05 锚点） |
| v2-AC03 | 连续点击 2031 → 2042 | 每次跟随，最终 2042 |
| v2-AC04 | 点击某大运列 [data-dy=i] | 切到该运起始年 startYear |
| v2-AC05 | 点击运前流年 data-di=-1 | 切到出生年 + j（列偏移） |
| v2-AC06 | 点击「📍 今年」 | 切到 nowYear（系统当前年） |
| v2-AC07 | 初始态回归 | 大运表初始高亮仍 = nowYear；顶部「（当前 YYYY 年）」不变 |
| v2-AC08 | 双胞胎同年默认 | 共享区一块，标题 = 出生年 |
| v2-AC09 | 双胞胎点击老二侧流年 | 共享块跟随老二侧流年公历年 |
| v2-AC10 | 越界防御（2100 / >2101） | 「—」/整块占位，不崩溃 |
| v2-AC11 | 双胞胎跨年（出生年不同） | 初始 = 老大出生年；点老二侧后跟老二 |

### 2.3 状态机（v2-PRD §5.1）

排盘完成 → jieqiYear=出生年；点流年(di≥0) → daYun[i].startYear+j；点运前(di=-1) → data.y+j；点大运 → daYun[i].startYear；点今年 → nowYear；重新排盘 → 重置出生年。

### 2.4 自动化断言 ?test=1

- v1 T01-T05：12节齐全不含气 / 小寒取次年 / 2026 锚点全列 / 干支竖排×12 / 2100·2200 边界。
- v2 T06-T14：初始1982（T06）/ 点2026+连续2031→2042（T07）/ 运前（T08）/ 大运（T09）/ 今年（T10）/ 越界 DOM 替换（T11）/ 同卵一块（T12）/ 龙凤胎初始老大+点老二跟老二（T13/T14）。

## 三、功能模块用例

| ID | 标题 | 步骤 | 预期 | 级别 | 对应 |
|----|------|------|------|:----:|------|
| TC-01 | 单人默认=出生年 | 排 1982-10-18 05:01 男 | .jieqi-title 含 1982；container._jieqiYear=1982 | — | v2-AC01 |
| TC-02 | 点 2026 流年跟随 | 点击年份=2026 的 .li | 标题=2026、立春 2/4 04:01 | — | v2-AC02 |
| TC-03 | 连续跟随 | 依次点 2031、2042 | 每次跟随、最后 2042 | — | v2-AC03 |
| TC-04 | 点大运列 | 点 [data-dy=2] | 标题=该运 startYear | — | v2-AC04 |
| TC-05 | 点运前流年 | 点 .li[data-di=-1] 第 j 格 | 标题=出生年+j | — | v2-AC05 |
| TC-06 | 点今年 | 点 📍 今年 | 标题=nowYear（2026） | — | v2-AC06 |
| TC-07 | 重置 | 点流年后再点排盘 | 回出生年 | — | §2.3 |
| TC-08 | 同卵双胞胎 | 同卵模式排盘 | 仅一块 .jieqi-section，标题=出生年 | — | v2-AC08 |
| TC-09 | 龙凤胎跨年 | 构造 d1.y=1982/d2.y=1983 | 初始=1982；点老二侧=跟老二 | — | v2-AC09/11 |
| TC-10 | 越界渲染 | refreshJieqi(2100)/(2200) | 不抛、小寒「—」/整块占位 | — | v2-AC10 |
| TC-11 | 12节无气 | buildJieqiHtml(2026) | 12 节 data-term、无气 | — | AC02 |
| TC-12 | 四行竖排 | 检查 jq-col HTML | md/tm/name 行 + gz 内 gan 上 zhi 下 | — | AC06 |
| TC-13 | 大运列更新不回归 | 点流年后观察主盘列 | 大运/流年列更新 = v0.25.0 行为 | P0 | v2-AR02 |
| TC-14 | 高亮/滚动不回归 | 点今年 | 滚动定位当前年、高亮正常 | — | v2-AR03 |
| TC-15 | 无「气」泄漏到 DOM | 渲染后 grep 气名 | 无雨水/春分等 | — | AR01 |

## 四、代码级检查项（静态比对）

| ID | 检查点 | 方法 | 级别 |
|----|--------|------|:----:|
| CI-01 | buildJieqiHtml 纯函数契约不变（year 入参=节气区年份） | 读 render.js L304-336 | — |
| CI-02 | D6 三入口初始出生年：renderChart L648 `${buildJieqiHtml(y)}`；同卵 L1199 `'+buildJieqiHtml(y)+'`；龙凤胎 L1309 `'+buildJieqiHtml(y)+'`（y=d1.y） | grep buildJieqiHtml | P1(R10) |
| CI-03 | `container._jieqiYear` 三入口初始=出生年（renderChart L656 / 同卵 L1204 / 龙凤胎 L1322=d1.y） | grep _jieqiYear | P1(R13) |
| CI-04 | liunianYearOf 纯函数两分支同式（di=-1→cd.y+j；否则 startYear+j） | 读 L352-357 | P1 |
| CI-05 | updateCardDyLnColumns 等价改调 liunianYearOf（L819 单源） | 读 L783-830 | P1(R14) |
| CI-06 | refreshJieqi 仅替换 .jieqi-section，null 防御不抛 | 读 L363-371 | P1 |
| CI-07 | bindEvents 大运回调末尾追加 refreshJieqi(dyJ.startYear)；流年回调末尾 refreshJieqi(liunianYearOf(cdB,di,liIdx))；scrollToNow 末尾 refreshJieqi(nowYear) | 读 L648-666/683-740/1460-1463 | P0(R8) |
| CI-08 | 双胞胎运前列补 data-di="-1" data-li（同卵 L1182 / 龙凤胎 L1265/L1290） | grep data-di | P2(R12) |
| CI-09 | `grep buildJieqiHtml(nowYear)` = 0 命中（兜底除外） | grep | P1(R10) |
| CI-10 | RENDER 挂载 refreshJieqi/liunianYearOf/buildJieqiHtml/jqGanzhiOf（L1638-1641） | 读挂载段 | P1 |
| CI-11 | main.js T06-T14 断言存在且口径正确 | 读 main.js L1337-1444 | — |
| CI-12 | node --check render.js / main.js / algorithm.js / constants.js | 语法 | — |
| CI-13 | index.html == standalone.html 字节级一致 | diff -q | P0(L1) |
| CI-14 | check-release.sh KEYS/RUNTIME_KEYS 含 jieqi-section/jq-gz；三 HTML 关键锚点齐全 | 跑脚本 | P0 |

## 五、运行验证项

| ID | 验证 | 方法 | 通过标准 |
|----|------|------|---------|
| RI-01 | check-release.sh | `bash scripts/check-release.sh .` | 退出码 0 |
| RI-02 | ?test=1 全量断言 | CDP 打开 index.html?test=1 | 339 条全绿、0 失败、无异常 |
| RI-03 | UI 冒烟（真实 Chrome） | CDP file:// index.html 交互 | 六步见 TC-01~06 |

## 六、未覆盖项说明

- 双胞胎 UI 场景以 ?test=1 T12-T14（真实 paipan 数据 + 真实 DOM dispatchEvent click）覆盖，等同 UI 级验证。
- 「重新排盘重置出生年」UI 直接点击路径因 CDP+file:// 环境 doPaipan 同步大计算阻塞 evaluate 无法自动断言，以代码链（renderChart 每次渲染设 _jieqiYear=y）+ T06/T12 初始断言兜底（每次 renderChart 后 _jieqiYear=出生年已由 T06 断言）。
