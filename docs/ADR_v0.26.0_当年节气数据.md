# ADR v0.26.0 — 当年节气数据（大运流年区下方新增 12 节展示块）

> **版本**：v1.0
> **日期**：2026-09-07
> **作者**：架构师（worker_67a0976f）
> **状态**：待评审
> **关联文档**：PRD_v0.26.0_当年节气数据.md（定稿，产品经理 docs/ 与主仓库 docs/ 双副本一致）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `render.js`（主改动，外部模块版） |
| 当前行数 | 1574 行（实测） |
| 改动类型 | ① 新增 `buildJieqiHtml(year)` 辅助函数（返回当年 12 节 HTML 字符串）；② renderChart（L301，单人盘）luck-col 内 `.luck-section` 之后插入节气块；③ renderTwinCardsHtml（L1053，同卵双胞胎）共享 luck 区插入一块；④ renderLongFengCardsHtml（L1133，龙凤胎）共享 luck 区插入一块；⑤ window.RENDER 挂载 buildJieqiHtml 供 ?test=1 断言（T03/T04/T05 mock 用） |
| **目标文件 2** | `index.html`（面板版，单体内联） |
| 当前行数 | 1033918 B（实测，与 standalone.html 字节级一致 md5=baf310399034e0ad728a7a4c8bb76d72） |
| 改动类型 | 内联 render 段同步（新函数 + 三处调用） + `<style>` 追加 `.jieqi-section` 样式 + 头部注释 v0.25.0→v0.26.0 + 内联 main 测试段同步 T01-T05 |
| **目标文件 3** | `standalone.html`（回退版，单体内联） |
| 当前行数 | 与 index.html 字节级一致 |
| 改动类型 | 与 index.html 同构同步（**保持字节级一致**，diff 校验门槛） |
| **目标文件 4** | `standalone-split.html`（主产物，模块版 dev） |
| 当前行数 | 63022 B（实测） |
| 改动类型 | `<style>` 追加 `.jieqi-section` 样式 + 头部注释 v0.26.0（render.js/main.js 经 `<script src>` 外链自动生效，无需同步 JS 段） |
| **目标文件 5** | `main.js`（?test=1 测试区） |
| 当前行数 | 1391 行（实测） |
| 改动类型 | 测试区新增独立 IIFE + section「当年节气数据 — v0.26.0」T01-T05（断言走 `window.RENDER.buildJieqiHtml(year)` mock 注入，无需 mock 时钟）；**同步到 index.html/standalone.html 内联 main 段**（L1 教训，三文件同步） |
| **目标文件 6** | `scripts/check-release.sh` |
| 当前行数 | ~100 行（实测） |
| 改动类型 | KEYS 追加节气块锚点 class/id（建议 `jieqi-section` 与 `jq-gz`，见 AR04） |
| **目标文件 7** | `docs/`（PRD/ADR/TEST/QA）+ `SYSTEM.md` |
| 改动类型 | 新增 PRD/ADR（本版本流程产出）；SYSTEM.md 版本历史补 v0.26.0 + render.js 功能描述补「当年节气数据块」 |

> **文件路径**：`/Users/feng/.clacky/ext/local/bazi-paipan/`
>
> **本版本零改动**：constants.js（SOLAR_TERMS / S_TERM_NAME / MONTH_TERM 仅读取）、algorithm.js（getSolarTerm / dayPillar 仅调用）、gongwei.js / config.js / auth.js / records.js / gongwei-cloud.js、supabase.min.js——纯 UI 新增，零算法改动（AR02 保证）。

---

## 一、架构决策（对应 PRD §4.4 D1-D4 决策点 + §10 ADR 输入点）

### 决策 1：干支取值 = 交节当天公历自然日的日柱（D1 定稿，PRD §10.3 确认口径）

**问题**：需求只说「干支（竖）」未指明干支语义。备选 A=交节当天日柱（历法日历语义，dayPillar 现成）；备选 B=节当月月柱（节=换月语义，需年干五虎遁额外推导，用户未明确）。

**决策：采用备选 A——交节当天（公历自然日）的日柱干支。**

- 取数路径：交节 Date（getSolarTerm 返回，BJT-as-UTC）→ 取其 UTC 字段 `getUTCFullYear()/getUTCMonth()+1/getUTCDate()` 得公历 y/m/d → `dayPillar(y, m, d)`（algorithm.js L247，纯公历自然日 Date.UTC 差值计算，无 23 点换日进位）→ 返回 `{gan, zhi, idx}`。
- **23 点后交节的边界（PRD §9.4）**：项目 dayPillar 以 y/m/d 论日柱、无时刻进位 → 只要按交节日**公历自然日**调用即与日历标注一致。**严禁**把交节时刻换算后按子时/夜子时逻辑重算（会引入与主盘算法不一致）。实现时直接取 UTC 日期字段，不经北京时间偏移再取日。
- 备选 B 不采用，但**保留低成本切换路径**：buildJieqiHtml 内每列干支由单一取数函数 `jqGanzhiOf(termDate)` 产出，若日后确认要月柱只需替换该函数内部实现，UI/版式/表格框架不动（PRD §9.2 缓解）。
- 验收锚点：AC06（立春当天日柱与 dayPillar 输出一致）+ T04（干支竖排结构断言）。

### 决策 2：数据取用 / 读函数与入参——buildJieqiHtml(year) 纯函数 + MONTH_TERM 驱动 + 小寒 nowYear+1（D2 定稿）

**决策：新增纯函数 `RENDER.buildJieqiHtml(year)`（year 可注入，默认取当前系统公历年）返回 HTML 字符串。**

```js
// 伪码骨架（编程师实现时按 render.js 现有风格落地）
function buildJieqiHtml(year) {
  year = year || new Date().getFullYear();
  if (year < 1000 || year > 2101) {          // 整块越界（D4）
    return '<div class="jieqi-section"><div class="jieqi-note">节气数据仅支持 1000-2100 年</div></div>';
  }
  var rows = [];                              // 每行 = 一个「节」列
  for (var i = 0; i < MONTH_TERM.length; i++) {
    var idx = MONTH_TERM[i];
    var termYear = year + (i === MONTH_TERM.length - 1 ? 1 : 0);  // 最后一项小寒取次年
    var st = getSolarTerm(termYear, idx);     // null = 表外越界
    rows.push(buildJieqiCol(termYear, idx, st));
  }
  // 组表：标题行（year + 12节序）+ 四行（月日/时间/节名/干支竖排）
  return '<div class="jieqi-section">'
       + '<div class="jieqi-title">' + year + ' 年 · 十二节（立春→小寒）' + (needHint ? '（小寒超出节气表）' : '') + '</div>'
       + '<div class="jieqi-wrap">' + buildJieqiTable(year, rows) + '</div>'
       + '</div>';
}
```

- **12 节集合 = 遍历 `MONTH_TERM`（constants.js L3160，=[2,4,6,8,10,12,14,16,18,20,22,0]）**，对应节名用 `S_TERM_NAME[idx]`：立春(2)、惊蛰(4)、清明(6)、立夏(8)、芒种(10)、小暑(12)、立秋(14)、白露(16)、寒露(18)、立冬(20)、大雪(22)、小寒(0)。**不遍历 0-23 全表 → 天然不含「气」**（FR3）。
- **年份口径**：i=0..10（立春…大雪）交节在 year 年内 → `getSolarTerm(year, MONTH_TERM[i])`；i=11（小寒）→ `getSolarTerm(year + 1, 0)`（D2，保证时间递增与节气年完整，AC04）。
- **时间展示**：getSolarTerm 返回 Date 按项目惯例为「BJT as UTC」→ 展示直接取 UTC 字段 `getUTCMonth()+1`、`getUTCDate()`、`getUTCHours()`、`getUTCMinutes()`（pad 两位），与月柱/交运渲染既有取法一致，不做任何时区偏移。
- **跨年列年份小标（可选）**：PRD 5.2 允许小寒列带年份小标以消歧；**默认实现可省略小标**（标题已注明「跨至次年小寒」/整表时序递增），若 UI 走查觉得歧义再加 `title="2027-01-05"` 或右上角年份角标，不阻塞 AC04。
- 入参设计成 `year` 形参而非闭包读 nowYear 的原因：**T03/T04/T05 需 mock nowYear=2026/2100 等固定年份**，传参注入比 mock 时钟廉价可靠（PRD §10.5）。

### 决策 3：渲染位置与版式 DOM/class（D3 定稿 + jq-* 前缀防冲突）

**位置**：三个渲染入口的 luck 区 html 组装处，`.luck-section`（大运流年表）**之后、所在列容器闭合之前**追加 `${buildJieqiHtml(nowYear)}`：

| 入口 | 函数（行号基线） | 插入锚点 |
|------|-----------------|---------|
| 单人盘 | renderChart（L301，html 模板 L559-577） | luck-col（L566）内 luck-section（L573-575）闭合 `</div>` 之后、luck-col 闭合（L576）之前 |
| 同卵双胞胎 | renderTwinCardsHtml（L1053，html 串 L1116-1123） | bz-twin-shared（L1119）内 luck-section 闭合后、bz-twin-shared 闭合前——**只插一块**（AC08） |
| 龙凤胎 | renderLongFengCardsHtml（L1133，html 串 L1226-1230） | bz-twin-shared（L1228）内 luck-section 闭合后、bz-twin-shared 闭合前——**只插一块**（AC08） |

- **双胞胎只渲染一块的理由**：PRD 4.3——节气数据是「当年」外部年份信息，与命主无关；双胞胎共享大运流年区 → 节气块渲染在共享区下方一份。两入口共用 `buildJieqiHtml(nowYear)`，不按宝宝复制。
- **版式 DOM 结构（新 class 统一 `jq-` 前缀，避免与既有 luck 体系 `.luck-table/.luck-row/.cell/.li/.dy-stem/.dy-branch` 及 hiDy/hiLn/bindEvents 选择器冲突）**：

```html
<div class="jieqi-section">                    <!-- 块容器，与 .luck-section 同宽并列 -->
  <div class="jieqi-title">2026 年 · 十二节（立春→小寒）</div>
  <div class="jieqi-wrap">                     <!-- overflow-x:auto，横向滚动容器 -->
    <div class="jieqi-grid">                   <!-- 12 列 grid / 或 flex 行，min-width 12×44px -->
      <div class="jq-col" data-term="立春">
        <div class="jq-md">2/4</div>           <!-- ① 月日 -->
        <div class="jq-tm">04:01</div>         <!-- ② 时间 HH:mm -->
        <div class="jq-name">立春</div>        <!-- ③ 节名 -->
        <div class="jq-gz">                    <!-- ④ 干支竖排：天干上、地支下 -->
          <span class="jq-gan">甲</span>
          <span class="jq-zhi">子</span>
        </div>
      </div>
      <!-- × 12 列 -->
    </div>
  </div>
</div>
```

- **表外占位列**：`st === null` 时该列月日/时间显示「—」（节名正常显示，干支显示「—/—」或该行留空均可，**以不抛异常为准**），标题追加「（小寒超出节气表）」轻提示（D4/FR5/AC09）。
- 四行顺序 = 月日 → 时间 → 节名 → 干支竖排（AC07 验收锁定）。
- **无任何交互**：节气块不绑 click/hover，`pointer-events` 可留默认；不得引入跳转/展开（FR4/非目标）。

---

## 二、风险矩阵

| 风险 | 级别 | 影响 | 缓解（落地到验收） |
|------|:---:|------|------|
| R1 三文件同步遗漏（L1 复发） | **P0** | 新增节气块/断言只进外部 render.js/main.js，index/standalone 内联版缺失 → 面板版功能不一致 | T1=编程师 P0 自检（改动段同步三文件）；AR04 check-release.sh KEYS 追加节气块锚点；AR05 三入口实测一致 |
| R2 干支语义歧义（D1 未定稿就实现） | P1 | 若用户本意月柱，返工 | ADR 决策 1 已定稿日柱；取数收敛到单一函数 `jqGanzhiOf`，切换成本低；Leader 可向用户一句话复核 |
| R3 小寒跨年取数错误 | P1 | 取当年 1 月小寒致与大雪乱序 / 漏取次年小寒只剩 11 节 | 决策 2 明确 `i===11 → year+1`；AC04/AC05/T02/T03 锚点锁定；代码走查重点看最后一列年份 |
| R4 节气当天日柱进位边界 | P2 | 23 点后交节误按时刻重算日柱 → 与日历标注不一致 | 决策 1 明确按公历自然日取 UTC 日期字段调 dayPillar，不做 23 点换算；AC06 验证 |
| R5 布局过宽挤压右侧 | P2 | 12 列挤窄 luck-col / 大运区观感受损 | 决策 3 用 `.jieqi-wrap` 独立横向滚动容器（min-width 12×44px），块标题固定；AC/截图走查三档宽度 |
| R6 类名与既有 luck 交互冲突 | P2 | 新增元素误命中 hiDy/hiLn/bindEvents/scrollToNow 选择器 | 决策 3 新 class 统一 `jq-` 前缀 + 独立 `.jieqi-section`，不复用 .luck-table/.cell/.li 等 |
| R7 越界年份崩溃 | P2 | nowYear 极端（时钟异常）→ getSolarTerm 返回 null 未守卫 → 抛异常 | 决策 2/3 哨兵：st===null 占位「—」；year<1000/>2101 整块灰字占位；T05 断言不抛异常 |

## 三、实现指引（给编程师的分步落地清单）

### 步骤 0：基线确认（动手前必做）
1. `cd /Users/feng/.clacky/ext/local/bazi-paipan`，确认工作区干净、基线 v0.25.0 可回滚（git status / tag）。
2. 确认 index.html 与 standalone.html 仍字节级一致（`diff -q` 为空）；确认外部 render.js / main.js 与两内联版同段一致（若 /tmp/check_inline.py 报历史差异，**以外部文件为准重灌内联段**，避免带旧差异出发）。
3. 读 `docs/DEVELOPER.md`（三文件同步红线）与 `docs/SYSTEM.md`（版本规范）。

### 步骤 1：render.js 实现（主改动）
1. 文件头注释 `v0.23.4` → `v0.26.0`（与本次发布版本一致）。
2. 新增 `buildJieqiHtml(year)`（决策 2 伪码）与内部 `buildJieqiCol/buildJieqiTable/jqGanzhiOf`（helper 按 render.js 既有风格——IIFE 内私有 + 仅暴露 buildJieqiHtml 到 window.RENDER）。
3. 三处调用点插入 `${buildJieqiHtml(nowYear)}`（决策 3 表格锚点）：
   - renderChart 单人盘 html 模板 L573-577 区间；
   - renderTwinCardsHtml 同卵 bz-twin-shared html 串；
   - renderLongFengCardsHtml 龙凤胎 bz-twin-shared html 串。
   - 注意：单人是模板字符串内插 `${...}`；两处双胞胎是字符串拼接 `+`——按所在函数的既有语法落地，不要混用引号风格。
4. `window.RENDER` 挂载新增 buildJieqiHtml（render.js L1551 附近 window.RENDER = { ... }）。
5. 自检：`node --check render.js`。

### 步骤 2：三文件 CSS 同步
1. `.jieqi-section/.jieqi-title/.jieqi-wrap/.jieqi-grid/.jq-col/.jq-md/.jq-tm/.jq-name/.jq-gz/.jq-gan/.jq-zhi/.jieqi-note` 样式追加到 index.html 与 standalone.html 的 `<style>`（**同段同内容**，位置建议紧跟 `.luck-section/.luck-table` 相关规则之后），并同步到 standalone-split.html `<style>`。
2. 样式要点：块内横向滚动（.jieqi-wrap { overflow-x:auto }）；列最小宽度 ~44px（.jq-col { min-width:44px }）；干支竖排（.jq-gan/.jq-zhi 块级上下排列，参考主盘 dy-stem/dy-branch 上下结构）；字色字号贴近现有大运区（用现有 CSS 变量 --c-* 与字号体系）。
3. 自检：diff index.html standalone.html 仍为空。

### 步骤 3：main.js T01-T05 断言
1. 测试区（main.js L769 起 ?test=1 回归区）新增独立 IIFE，section 标签「当年节气数据 — v0.26.0」（沿用既有 `tests.push({ section, fn })` 或等价的 v0.25.0 IIFE 模式）。
2. T01-T05 具体口径（对 PRD §6.3）：
   - T01：`RENDER.buildJieqiHtml(2026)` 返回串含 12 个节名且不含 12 个气名（立春…小寒齐全；雨水/春分/谷雨/小满/夏至/大暑/处暑/秋分/霜降/小雪/冬至/大寒不出现）。
   - T02：代码走查断言 MONTH_TERM 末位=0（小寒）且渲染函数对末列传 year+1（可通过暴露小函数或正则提取校验；若不可行则降级为 T03 时间递增锚点覆盖——实现时选稳妥可测形式）。
   - T03：mock year=2026，断言立春/大雪/小寒三列月日时间等于表内锚点（立春 2/4 04:01；大雪 12/7 10:52；小寒(2027) 1/5 22:09——AC05 全 12 个锚点至少抽查首/中/尾，推荐全查）。
   - T04：断言返回串含 `.jq-gz` 下 `.jq-gan` 在上、`.jq-zhi` 在下（字符串顺序或 DOM 结构均可）。
   - T05：`RENDER.buildJieqiHtml(2100)` 不抛异常且小寒列含「—」；`RENDER.buildJieqiHtml(2200)` 不抛异常（返回占位/灰字提示）。
3. **三文件同步**：main.js 改动复制到 index.html 内联 main 段 + standalone.html 内联 main 段（L1 教训）。
4. 自检：`node --check main.js`；`?test=1` 双环境跑通（file:// index.html + http:// standalone-split.html）。

### 步骤 4：check-release.sh KEYS 扩展（AR04）
1. KEYS 追加 `jieqi-section`（块容器 class 锚点）与 `jq-gz`（干支竖排结构锚点）。
2. 自检：`bash scripts/check-release.sh .` 退出码 0。

### 步骤 5：文档同步
1. docs/ 新增 PRD/ADR（本流程已有）+ 测试工程师 TEST 文档 + QA 报告（后续环节产出）。
2. SYSTEM.md 版本历史补 v0.26.0；render.js 功能描述补「当年节气数据块」。

## 四、自检清单（实现完成 → 交测试前，编程师逐条勾）

- [ ] 单人盘 / 同卵双胞胎 / 龙凤胎三入口均出现且**只出现一块**节气块（AC01/AC08）
- [ ] 12 节齐全顺序=立春…小寒；无「气」（AC02/AC03）
- [ ] 月日/时间/节名/干支四行齐全、干支竖排天干上地支下（AC06/AC07）
- [ ] 当前年份跨年场景：nowYear 2026 时小寒列取 2027-01-05（AC04 代码走查）
- [ ] 交节时刻与 constants.js 锚点一致（AC05）
- [ ] nowYear=2100 mock：小寒「—」不崩溃；nowYear=2200：占位提示不崩溃（AC09）
- [ ] 窄屏横向滚动、不挤压大运区（FR4）
- [ ] 大运区既有交互（点击高亮/scrollToNow/双胞胎模式切换）无回归（AR03）
- [ ] index.html==standalone.html 字节一致；外部 render/main 与内联同段一致
- [ ] `?test=1` 双环境全量旧断言 + T01-T05 全绿（AR01/AR06）
- [ ] `bash scripts/check-release.sh .` 退出码 0（AR04）

## 五、验证与回滚预案

**验证基线（测试工程师可引用）**：
- 主验收锚点 = PRD §11 清单 + AC01-AC09 + T01-T05（PRD §6.3），年份锚点以 PRD §6.1 AC05 表为准（2026 立春 2/4 04:01 … 小寒(2027) 1/5 22:09）。
- 代码级检查点：`render.js` 三处调用点 + `buildJieqiHtml` 年份分支（`i===11 → year+1`）+ `st===null` 哨兵 + `.jieqi-*`/`.jq-*` 类名前缀不复用 luck 类。
- 回归基线：AR02 三个锚点盘（1982-10-18 05:01 男 / 王阳明 1472-10-31 22:01 / 苏轼 1037）四柱大运流年与 v0.25.0 完全一致——**若算法结果变化即判 P0 缺陷**（本版本零算法改动）。

**回滚预案**：
1. 发布前（开发期）：git 回滚 render.js / main.js / 三 HTML / check-release.sh 至 v0.25.0 基线 tag，重新同步即可。
2. 已发布（线上面板）：内联单体内直接恢复 v0.25.0 版三文件（index.html / standalone.html / standalone-split.html 对应段），节气块即消失、其余功能不受影响（改动彼此独立、无数据迁移）。
3. 回滚后必跑：`bash scripts/check-release.sh .` + `?test=1` 双环境，确认回到 v0.25.0 全绿态。

## 六、PRD AC 映射表（ADR 落实点）

| PRD AC | 验收点 | ADR 落实 |
|--------|--------|---------|
| AC01 | 默认排盘大运区下方出现节气块 | 决策 3：三入口 luck 区后插 `buildJieqiHtml(nowYear)` |
| AC02 | 恰 12 节、顺序立春…小寒 | 决策 2：遍历 MONTH_TERM；T01 |
| AC03 | 不含 12 气 | 决策 2：仅 MONTH_TERM 12 索引；T01 |
| AC04 | 年份口径（小寒次年） | 决策 2：`i===11 → year+1`；T02/T03 |
| AC05 | 交节时刻与表一致（2026 锚点） | 决策 2：getSolarTerm UTC 字段直取；T03 全锚点 |
| AC06 | 干支竖排（日柱） | 决策 1：dayPillar(y,m,d) 自然日；T04 |
| AC07 | 四行结构顺序 | 决策 3：.jq-md/.jq-tm/.jq-name/.jq-gz 顺序 |
| AC08 | 双胞胎共享区只一块 | 决策 3：两个双胞胎入口均只插一块 |
| AC09 | 表外防御不崩溃 | 决策 2/3：null 哨兵「—」+ 越界占位；T05 |
| AR01 | ?test=1 全量断言 | 步骤 3：T01-T05 + 旧断言回归 |
| AR02 | 算法回归三盘不变 | 本版本 constants/algorithm 零改动；步骤 0 基线确认 |
| AR03 | 大运区交互回归 | 决策 3：jq-* 前缀防冲突；实现自检清单 |
| AR04 | check-release.sh 通过 + 新 id/class 纳入 | 步骤 4：KEYS 追加 jieqi-section/jq-gz |
| AR05 | 三入口功能一致 | 步骤 1-3：三文件同步 + 实测 |
| AR06 | 双环境（http/file://） | 步骤 3 自检 |
