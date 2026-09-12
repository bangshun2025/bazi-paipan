# CHANGELOG

八字排盘 · 从真版 — 版本历史

---

## v0.33.0 — 档案列表按名字拼音排序 (2026-09-12)

### 新增
- **拼音排序**：档案列表由「按修改时间倒序」改为**按名字拼音升序**（中文按读音，`localeCompare(x, 'zh')`；如 安琪 → 成哥 → 顶顶 → 东东 → 二哥 → 六一 → 茂茂 → 糯米 → … → 子旭 → 周海）
- 排序键 = **列表所见的显示名**，与隐私开关联动：隐私关排 `小名 / 姓名`、隐私开排 `艺名 → 小名 → 匿名`；隐私关排的是小名，所以两档切换后看到的顺序都是拼音序
- 同名兜底：显示名相同者按正名（姓名）拼音，再按更新时间新在前；空名字段回落「匿名 / 空」不报错

### 说明
- **落盘顺序 = 显示顺序**：`renderArchiveModal()` 排序后仍写回 `localStorage`。行内 `✏️ 修改 / 🗑️ 删除 / 排盘` 按钮按数组索引定位，两者必须一致（本次同步落盘，未改索引寻址方式）
- 排序为幂等操作：打开弹窗、切标签、搜索、切隐私开关都会重排，重复执行结果一致

### 验证
- `archive.js` 新增 `?test=1` 断言 12 条（v0.33 T01–T06：汉字拼音序 vs UTF-16 码位序 / 隐私开关两档排序键 / 落盘顺序=显示顺序 / 行内索引取到同一条档案 / 同名与幂等 / 脏数据兜底）；本机 713 条断言全绿
- 实机（本地 HTTP + 真实浏览器）灌入 18 条真实形态档案：渲染顺序 = 拼音序（安琪 … 周海、子旭、子阳、KK、NONO），落盘 id 序列 = 显示顺序；真实鼠标点第 5 行「排盘」→ 加载出「二哥 / 何沛润」2019-08-23 04:00，索引寻址端到端正确
- `bash scripts/check-release.sh` 6 步全绿；`index.html` ≡ `standalone.html`（逐字节）

---

## v0.32.0 — 档案标签：行内多标签 + 标签栏筛选 + 默认标签 (2026-09-12)

### 新增
- **行内标签**：档案每行在「✏️ 修改」**之前**多一个标签输入框，留空直接填；空格 / 逗号 / 顿号 / 分号分隔可写多个标签（单条档案上限 12 个），回车即存
- **标签栏**：弹窗顶部 chips —— `全部 N` / 各标签 / `未分类 N`，点击即筛选；与搜索框叠加生效（搜索同时命中姓名与标签）
- **默认标签**：header 新增 `🏷 默认标签` 按钮，勾选某个标签后，每次打开档案默认只显示该标签（按钮显示为 `🏷 默认：X`，chip 带 ★）；标签失效（所有档案都不再用它）时自动回落「全部」
- 档案弹窗加宽：420×480 → 880×560（`max-width:94%`），窄屏（≤560px）自适应

### 修复
- `index.html` / `standalone.html` 第 12256 行 HTML 注释缺开头 `<!--`（`</script>=== v0.25.0 我的排盘列表 ===== -->`），导致该行文本外泄显示在页面上（v0.25.0 起遗留）

### 验证
- `archive.js` 新增 `?test=1` 断言 28 条（v0.32 T01–T08：解析 / 读取降级 / 筛选匹配 / 汇总计数 / 默认标签读写 / 渲染顺序 / 行内入库与索引 / 搜索叠加）
- 三端产物同步：`archive.js` 经 `sync-module-inline.py --from-external` 回推内联段；`index.html` ≡ `standalone.html`（逐字节）；`standalone-split.html` 同步 HTML/CSS
- `scripts/check-release.sh` 6 步全绿；KEYS 断言新增 `archive-tag-bar` / `archive-tag-default-panel` / `btnDefaultTag`
- 浏览器实测（真实键鼠）：多标签入库、chips 计数、标签∩搜索、默认标签落库与「关掉重开自动筛选」

---

## v0.31.0 — 节气边界修正：月柱/人元司令/年柱取消二次 +8h（统一「BJT-as-UTC」基准）+ 真值门禁 (2026-09-12)

### 修复
- **月柱换月判定二次加 8 小时（P0 正确性）**：`getSolarTerm()` 查表返回的是「BJT-as-UTC」时刻（其 UTC 字段即北京钟表时间），与 `birthMs = Date.UTC(...)` 同基准、本应直接比较；v0.23.4 起在 `monthPillar`（`lcMs`/`stMs`/`nextMs`）、`renYuanSiLing`（`stMs`/`nextMs`）、`paipan` 年柱立春（`lc2Ms`）共 **6 处**再 `+ BJT_OFFSET`（+8h），等价于把每个节气边界整体后移 8 小时 —— 出生时刻落在「节气时刻 ~ 节气时刻 + 8h」窗口内时，月柱（连带人元司令、立春年柱）落到上一节月。现移除全部 6 处加 8h，两端同基准直接比较（`BJT_OFFSET` 常量随之下线，全库无残留引用）
- **节气当天 / 交界分钟内月柱错位**：1988-03-05 惊蛰 16:46:32 之后出生（如 17:00）原判「戊辰 / 甲寅」并推出夸张起运（121 年 8 月），修正后为「戊辰 / 乙卯」（起运 10 年 0 月）；1987 立夏 09:05:35、2026 立春 04:01:51 等边界同理。**显示层节气时刻本身一直是对的，故缺陷此前对肉眼隐形**
- **三端产物模块漂移**：`algorithm.js` / `archive.js` 外部文件落后于 `index.html` / `standalone.html` 内联副本（内联含 v0.23.1 农历取值修复与 P0-01 `doPaipan` 守卫）—— 线上 `/standalone` 端点加载的正是 `standalone-split.html` + 外部 `*.js`，该入口此前同时带着 8h 缺陷与旧漂移。本次以「内联为真相源」重写两个外部文件，五模块三端一致
- **注释订正（同一误解的产物）**：`main.js` T01 注释「立夏 17:05:35 前」改为真值 **09:05:35**（17:05:35 恰为 09:05:35 二次加 8h 后的错误值）；`monthPillar` 增加「基准契约」注释，写明「返回即 BJT-as-UTC，切勿再加 8 小时」
- **新增 T05–T11 边界真值断言（10 条）**：以香港天文台 / JPL DE421 独立真值为基准，覆盖「节气前 1 分钟 → 节气分钟」双向换月、乙巳–丙午年立春边界、1987 立夏 09:05 / 09:06、节气名与换月同源、1988-05-05 例起运回归

### 测试与门禁
- `?test=1` 内建回归：**664 → 674 条**（新增 T05–T11 共 10 条），`standalone.html` / `index.html` 双环境全绿
- 新增 `scripts/check-term-truth.js`（无浏览器；vm 加载 constants.js + algorithm.js）：12 节气 × {1987, 2026} × 3 采样点边界扫描 + 4 条显示层真值 + 10 条锚点断言。**以 v0.30.0 代码跑该门禁：30 项失败（24 个换月边界点 + 6 条锚点；显示层 4 条全绿 —— 正是缺陷隐身的原因）**，修复后全绿
- 新增 `scripts/sync-module-inline.py`：以「下一个模块标记」为切段边界，比对 constants / algorithm / archive / render / main 五模块「外部文件 ≡ index 内联 ≡ standalone 内联」（旧脚本按 `<script>` 切段，对共用同一块的 5 个模块会误判为一致）
- `scripts/check-release.sh` 由 4 步扩为 6 步（新增上述两项门禁，任一失败即退出码非 0）
- 观察项（不阻塞发布）：v0.30 T12 星曜设置页的 2 条几何断言（60 行态免纵向滚动 ≤2px）依赖视口高度 —— 在 1512×771 下稳定溢出 11px（`scrollHeight 582 / clientHeight 571`），更高视口下通过；**以 v0.30.0 原始字节同样复现，非本版引入**。CI 默认 800×600 视口 `wide()` 为假、不执行该分支，部署门禁不受影响

### 修改文件
- `algorithm.js`（6 处取消 +8h；基准契约注释）
- `index.html` / `standalone.html`（内联同步 + 版本标记 + 注释订正）
- `main.js`（T01 注释订正 + T05–T11 断言）
- `archive.js`（按内联重写：v0.23.1 农历取值 + P0-01 守卫）
- `standalone-split.html`（版本标记）
- `scripts/check-release.sh`、`scripts/check-term-truth.js`（新增）、`scripts/sync-module-inline.py`（新增）
- `ext.yml`、`CHANGELOG.md`

### 文档
- [ADR](docs/ADR_v0.31.0_节气边界8小时修正.md) / [TEST](docs/TEST_v0.31.0_节气边界8小时修正.md)

---

## v0.30.0 — 星曜设置页迭代（搜索筛选 / 三栏同屏 / 纳音全名）(2026-09-11)

### Added
- **设置页搜索框**：按「包含」关系实时筛选六十甲子（`己` = 6 行 / `戌` = 5 行 / 留空 = 60 行）；含命中计数「命中 N 项」、无结果提示「没有匹配的干支」（全局仅 1 处）、`✕` 一键清空
- **IME 组合态闸门**：拼音/日文输入法组合期间（`ji` → `己`）不做过滤，避免列表在 60/1/0 行之间抖动；`compositionend` 后才按最终值筛选
- **设置页三栏同屏**（≥1280px）：60 行按 20 行拆三栏并排 —— 单一 `<tbody id="xySettingsList">` 容器内 60 个 `tr[data-gz][data-xy-group]` 全为其后代（不拆表、不拆 tbody）；三栏**共享一行表头**（`thead th` 恒 4）
- **静态栏头**：表格上方 `.xy-groups-heads` 内 3 个 `div.xy-group-title[data-xy-group]`（文案「第 N 组 · 首干支 – 末干支」），不在 tbody 内、无 `data-gz`（不参与草稿采集）；空栏保留占位、栏头不隐藏

### Changed
- **筛选只改显隐 + 栏位不变**：命中行仍留在本栏（每栏 20 行槽位固定、空栏保留占位），`己` 严格 2/2/2 且各栏位左边界正确；命中 0 行时全局唯一空提示 + 3 栏头仍可见
- **设置页纳音列**：列名「纳音五行」→「**纳音**」；取值由末字五行（如 `火`）→ **完整纳音名**（如 `甲戌` → `山头火`）；主盘纳音行本就为全名，本次仅对齐设置页
- **表头几何（ADR v1.6 §15.3 C3）**：`thead` 宽度显式 `calc((100% - 32px)/3)`（= 一栏宽），列模板与数据行逐像素同构（`56px 76px minmax(0,1fr) minmax(0,1fr)` + `gap:4px`）⇒ 4 个标签与第 1 栏各列左边界偏差实测 **[0,0,0,0]**（修正前等分铺满全宽，偏差最大 615.7px，「纳音」标签悬在第 2 栏干支列上方）
- **设置页免滚动（AC20）**：`td` 纵向 padding `2px → 1px`（选择器 `.xy-table tbody > tr > td`，仅星曜设置弹层；主盘 `div.luck-table` 零影响），行高 24.00px → **22.00px**；弹层 `width:90vw; max-width:1200px; max-height:92vh` ⇒ 1280×800 表区纵向溢出 **15px → 0px**，三基线（1440×900 / 1280×800 / 1600×1000）溢出 **0/0/0px**
- **自动化断言 517 → 664**：`?test=1` 新增「星曜(v0.30)」段 T01–T15（含 C8 表头几何 3 条：`th`=4 + 逐列偏差 ≤12px + `th[i].width` ≥40px；AC25 筛选态栏位正确性）；原 v0.29 段纳音相关 13 条同步改严（全名 + 末字一致性双断）
- **`scripts/check-release.sh` 门禁扩容**（L1 方案 A）：`KEYS` 追加 `xySearchBar` / `xySearchInput` / `xySearchClear` / `xySearchCount` / `xySearchEmpty` / `xy-group-title`；`RUNTIME_KEYS` 改为 `jieqi-section jq-gz jq-tsmd jq-tstm xy-trigger`（移除 `xy-group-row` —— 静态栏头后组标题行已不存在，按「不留幽灵」原则清理）；【3/4】兜底扫描文件由 `render.js` / `main.js` 扩为含 `xingyao.js`（PASS 121 → 139，无新增失败）
- **`docs/ALGORITHM.md` §21.1/§21.2 + `scripts/sync-xingyao-algorithm.py` 连带同步**：§21.2 表头改「纳音」、60 行取完整纳音名；脚本 `HEADER` 常量与 `NAYIN[gz][-1]` → `NAYIN[gz]`；同一入参复跑**幂等无变更**
- 已改：`xingyao.js` / `main.js` / `index.html` / `standalone.html` / `standalone-split.html` / `scripts/check-release.sh` / `scripts/sync-xingyao-algorithm.py` / `docs/ALGORITHM.md` / `CHANGELOG.md`
- 文档：`docs/PRD_v0.30.0_星曜设置页迭代.md`(r7) / `docs/ADR_v0.30.0_星曜设置页迭代.md`(v1.6) / `docs/实施记录-v0.30.0-星曜设置页迭代.md`

### Notes
- 筛选**只改显隐**（`tr[hidden]` + 兜底 CSS `.xy-settings-modal [hidden]{display:none!important}`，C2 必需项 —— `tr{display:grid}` 会压过 UA 的 `[hidden]{display:none}`，无兜底则被筛掉的行仍显示），**不删 DOM、不重渲染行、不新增/重建元素**；`collectDraft()` 仍全量遍历 60 行，筛选态下隐藏行的草稿照常采集与保存
- **切栏实现**（ADR §15.3 C1/C3）：`grid-auto-flow:row dense` + 按 `data-xy-group` 钉 `grid-column`（**非** `grid-auto-flow:column` —— 后者在筛选态会塌栏，已列入被否决方案 D19）；三栏宽只在 ≥1280px 生效，`<1280px` 单栏纵向（E15，已知行为 L，允许纵向滚动）
- localStorage 键 `bz_xingyao_map` 结构、`schemaVersion=1` 一律不变、不迁移；**搜索态不落盘**（无任何 search 相关新键）
- 搜索仅匹配干支文本，纯空白（半角/全角）视为留空，按字面匹配（正则元字符不生效）
- 断言只锁钩子 / 行为 / 几何，**不锁** computed `grid-auto-flow` / `grid-template-*` 字面值（PRD r7 FR3.4.3 / D20）
- 主盘零影响：三条红线未触碰（筛选只改 `hidden`、主盘纳音行不动、localStorage 键与 schema 不变）；`?test=1` 测试态键隔离 `bz_xingyao_map__test`
- `ext.yml` 版本由发布师在发布环节由 `0.29.0` 升至 `0.30.0`
- 冻结产物内 6 处代码注释（`index.html:301/:11727`、`standalone.html:301/:11727`、`standalone-split.html:301`、`main.js:2248`）引用的「ADR v1.4 §15.3 C3」为**编写时引用**，其语义与现行 **ADR v1.6 §15.3** 一致（v1.5 勘误 `gap:0`→`gap:4px` 与作用域表述、v1.6 勘误 `R7`→`R8`）；按「冻结产物字节永不为引用改名而改」原则，**产物零改动**。
- 已知限制：
  - **页面级**横向溢出（1280×800 = 15px / 1024×800 = 56px / 390×844 = 276px）来自主盘 `div.luck-table`（816px 固定宽 / `min-width:620px`）**既有行为、非本版引入**，本轮不修（Leader 裁定备案）；星曜设置弹层内横向溢出 **0**
  - 导入 JSON 后设置页列表不即时重绘（v0.29 遗留，非缺陷，Leader 裁定留 v0.30.x）
  - `<1280px` 单栏纵向需纵向滚动（E15；AC20 免滚动仅约束 ≥1280px）

---

## v0.29.0 — 盘面「星曜」行 + 星曜设置页 + ALGORITHM.md §21 (2026-09-11)

### Added
- **盘面「星曜」行**：在四柱区与三垣区盘面的「藏气」行与「纳音」行之间新增一行 `星曜`；显示级别 **L0/L1 隐藏、L2 起显示**；值按「六十甲子」键查询用户自定义的「星曜名称 / 来源体系」映射表（出厂全空）
- **工具栏「星曜」按钮 + 星曜设置页**：工具栏「简」按钮之后新增「星曜」按钮，点击弹出设置页（`xySettingsOverlay`）；表格**四列**（六十甲子 / 纳音五行 / 星曜名称 / 来源体系）× **60 行**，支持**修改 / 清空 / 还原**
- **新模块 `xingyao.js`**：星曜数据读写（localStorage）与设置页交互、盘面星曜行取值；纳入三端内联与模块加载顺序
- **`docs/ALGORITHM.md` §21 星曜**：新增「星曜」章节（21.1 定义 / 21.2 六十甲子↔星曜名称·来源体系对应表 / 21.3 生效机制），由 `scripts/sync-xingyao-algorithm.py` **幂等重写**

### Changed
- **自动化断言 429 → 517**：`?test=1` 新增 v0.29「星曜」段 **88** 条（覆盖 T01–T10），三端 × file/http 双环境 6 组全绿
- **三端内联同步**：`index.html` / `standalone.html` 内联 JS + `standalone-split.html` 模块加载
- `ext.yml` 版本 `0.28.0` → `0.29.0`（本次内测发布）
- 已改：`xingyao.js`(新增) / `render.js` / `main.js` / `standalone.html` / `index.html` / `standalone-split.html` / `scripts/check-release.sh` / `docs/ALGORITHM.md` / `ext.yml` / `CHANGELOG.md` / `SYSTEM.md`
- 文档：`docs/PRD_v0.29.0_星曜功能.md` / `docs/ADR_v0.29.0_星曜功能.md` / `docs/TEST_v0.29.0_星曜功能.md` / `docs/QA_v0.29.0_星曜功能.md` / `docs/部署报告-v0.29.0-内测发布.md`

### Notes
- 星曜数据**出厂即全空**、**不由程序推演**（不内置任何星曜体系默认数据），名称/来源体系完全由用户手填；不参与任何命理推导，仅作盘面展示。
- 本版为**内测发布**（local 层，不 commit、不打 tag）；待用户 L4 验收后再走正式发布。
- 已知限制（非缺陷，Leader 裁定留 v0.29.x）：`renderChartToHtml` / `renderExpandedChart` 未加星曜行，全仓库无调用点，不影响发布。

---

## v0.28.0 — 当年节气数据区 · 干支行改为月建干支 (2026-09-10)

### Changed
- **节气区干支数据源**：12 节气列最后一行「干支」由**交节日柱**（旧口径，如 1982 立春列显 `戊午`）改为**该节所起月份的月建干支（月柱）**（新口径，如 `壬寅`）；按**五虎遁**（年干推月干）直推。`render.js` 新增纯函数 `jieqiMonthGZ(yearGan, idx)` 并挂 `RENDER.jieqiMonthGZ`
- **年基口径**：整块 12 列统一取「所选干支年」的年干（`ALGO.yearPillar(year).gan`）为五虎遁年基；小寒列同取**本年**年基（`jieqiMonthGZ('癸',11)` = `乙丑`，反例：误用次年干得此值）
- **版式零变化**：仅换数据源，列数 / 行序 / CSS / DOM 结构不变；`algorithm.js`、`constants.js` **零改动**，排盘口径与四柱（D1）不动
- **自动化断言 393 → 429**：`?test=1` 新增 v0.28 T01–T04 共 **36** 条（1982 十二节锚点 12/12、五虎遁纯函数含反例、经度无关性、真实渲染 + `refreshJieqi` 一致性），双环境全绿
- 三端内联同步；`ext.yml` 版本 `0.27.0` → `0.28.0`（本次内测发布）
- 已改：`render.js` / `main.js` / `standalone.html` / `index.html` / `ext.yml` / `CHANGELOG.md` / `SYSTEM.md`
- 文档：`docs/PRD_v0.28.0_干支行改月建干支.md` / `docs/ADR_v0.28.0_干支行改月建干支.md` / `docs/report_v0.28.0_干支行改月建干支.md` / `docs/部署报告-v0.28.0-内测发布.md`

### Notes
- 口径变更为**需求确认**的结果（旧口径「交节日柱」易被误读为月柱），非缺陷修复。
- 本次内测**仅升版 + 版本注释 + 文档**；功能代码已 freeze（编程师交付 md5 基线），发布师未改功能逻辑。
- 观察项 OBS-01/02/03 见部署报告 §六（均非本版缺陷）。

---

## v0.27.0 — 节气区真太阳日月 + 真太阳时间 (2026-09-10)

### Added
- **节气区真太阳两行**：12 节气列由 4 行扩展为 6 行，在 `.jq-tm`（北京时间）**之后**、`.jq-name` 之前插入两行：`☀ 真太阳日月`（`.jq-tsmd`，M/D）与 `☀ 真太阳时间`（`.jq-tstm`，HH:MM）；值 = 交节时刻（BJT）经**出生地经度**换算的真太阳时
- **经度贯穿**：`doPaipan` 无条件 `getLng()`（与 `useSolar` 勾选**解耦**），写入 `data.lng`（三入口一致），渲染后落 `container._jieqiLng`；`buildJieqiHtml(year, lng)` / `refreshJieqi(..., lng)` 签名扩展（向后兼容，缺省即旧行为）
- **缺省经度降级**：`lng` 非有限数（未选出生地）时 12 列两行显「—」，区块标题追加轻提示「（未选出生地，真太阳时不可用）」
- **自动化断言 339→393**：`?test=1` 新增 v0.27-T01~T07（真太阳换算锚点 / 行序正则回归 / `lng` 缺省「—」 / 跨日两例 / 三端同步），三入口 393 条全绿
- 复用既有 `ALGO.trueSolarTime`（含均时差 `equationOfTime`），**不新增算法、不改排盘口径与干支（D1）**；`algorithm.js` 零改动

### Changed
- `render.js`：`buildJieqiHtml` / `refreshJieqi` 增 `lng` 参数与**显式判空**（`trueSolarTime` 传 undefined 返回 NaN 不抛，靠 try/catch 会漏）；三入口 `renderChart` / 同卵 / 龙凤胎渲染传 `lng`；`doPaipan` 取 `lng`
- `main.js`：新增 v0.27-T01~T07 断言段（内联同步三入口）
- `index.html` / `standalone.html`：内联 JS 副本 + CSS（`.jq-tsmd` / `.jq-tstm`）+ 断言同步 + 头部版本注释 v0.27.0
- `standalone-split.html`：CSS 同步（JS 走外链）+ 头部版本注释 v0.27.0
- `scripts/check-release.sh`：`KEYS` / `RUNTIME_KEYS` 扩展 `jq-tsmd` `jq-tstm`
- 版本号 v0.26.0 → v0.27.0（本次内测发布）

### Notes
- 验收基线：PRD AC01-AC08 / R01-R03 + ADR D1-D8；QA 结论 ✅ 无 P0/P1/P2，仅 1 项**存量** P3（龙凤胎点大运/流年 `redrawZuHeSVG` 未定义，基线 v0.26.0 即存在、非本版回归，不阻断）
- `check-release.sh` 退出码 0；`?test=1` 393 条断言全绿 0 失败
- 基线 tag `v0.26.0` 保留用于回滚

### 修改文件
- 已改：`render.js` / `main.js` / `standalone.html` / `index.html` / `standalone-split.html` / `scripts/check-release.sh` / `ext.yml` / `CHANGELOG.md` / `SYSTEM.md`
- 文档：`docs/PRD_v0.27.0_节气真太阳时.md` / `docs/ADR_v0.27.0_节气真太阳时.md` / `docs/部署报告-v0.27.0-内测发布.md`

---

## v0.26.0 — 当年节气数据 + 节气流年联动 (2026-09-07)

### Added
- **当年节气数据块（v1）**：大运流年区下方新增 12 节数据（立春/惊蛰/清明/立夏/芒种/小暑/立秋/白露/寒露/立冬/大雪/小寒，不含「气」），四行竖排版式（第一行月日 / 第二行时间 / 第三行节名 / 第四行干支竖排），`render.js` 新增 `buildJieqiHtml(year)` 纯函数 + `jqGanzhiOf` 干支换算
- **节气流年联动（v2）**：节气区默认年份 = 命主出生年；点流年格 / 大运列 / 运前「出生前流年」/ 📍 今年按钮时，节气区局部刷新跟随（`refreshJieqi` 仅替换 `.jieqi-section`，null 防御不抛）
- **流年口径单源**：`liunianYearOf(cardData, dyIdx, lnIdx)` 统一换算公历年（大运列表高亮与节气区联动同式），双胞胎运前列补 `data-di="-1"` / `data-li`
- **双胞胎适配**：同卵/龙凤胎共享一块节气区，初始年份取老大出生年，点各自侧流年跟随各自 daYun 年
- **自动化断言 269→339**：`?test=1` 新增 v0.26 断言 T01-T14（buildJieqiHtml 纯函数 / 三入口初始出生年 / 连续跟随 / 运前 / 大运 / 📍 今年 / 越界 2100·2200 不抛 / 同卵 / 龙凤胎跨年），三入口 339 条全绿

### Changed
- `render.js`：新增节气区渲染与联动层（三入口 `renderChart`/同卵/龙凤胎均挂 `_jieqiYear`，`bindEvents` 大运/流年回调 + `scrollToNow` 末尾追加 `refreshJieqi`）
- `standalone.html` / `index.html` / `standalone-split.html`：三 HTML 内联同步 + 头部版本注释 v0.26.0
- `main.js`：新增 T01-T14 断言段（内联同步三入口）
- 版本号 v0.25.0 → v0.26.0（本次内测发布）

### Notes
- 仅显示「节」不显示「气」（用户需求明确）；「当年」默认口径经 v2 裁决改为出生年，`nowYear` 仅用于大运表初始高亮定位与 📍 今年按钮语义
- 验收基线：v1 PRD AC01-09 + v2 PRD AC01-11 / AR01-06 / T06-T14 + ADR D1-D9；QA 结论 ✅ 无 P0/P1/P2，P3=1 为测试环境观察项
- `check-release.sh` 退出码 0；?test=1 339 条断言全绿 0 失败

### 修改文件
- 已改：`render.js` / `main.js` / `standalone.html` / `index.html` / `standalone-split.html` / `ext.yml` / `CHANGELOG.md` / `SYSTEM.md`
- 文档：`docs/PRD_v0.26.0_当年节气数据.md` / `docs/ADR_v0.26.0_当年节气数据.md` / `docs/PRD_v0.26.0_节气流年联动.md` / `docs/ADR_v0.26.0_节气流年联动.md` / `docs/TEST_v0.26.0_当年节气数据+节气流年联动.md` / `docs/QA_v0.26.0_当年节气数据+节气流年联动验收报告.md`

---

## v0.25.0 — 宫位配置保护：容错 + 导出导入 + 云同步 (2026-08-29)

### Added
- **宫位配置容错改造**：`gongwei.js` 新增 `safeLoad`（损坏配置安全加载兜底）/ `backupCorrupt`（损坏配置自动备份）/ `notifyCorrupt`（损坏提示），本地宫位配置损坏时不再崩溃
- **导出 / 导入配置**：宫位配置支持导出为文件 / 从文件导入，含 schema 版本化（`schema_version`）
- **云同步模块**：`gongwei-cloud.js` 上云同步（AC10 云拉取 / AC11 首传推云），登录后宫位配置可云端备份与恢复
- **auth.js 钩子**：登录 / 登出事件接入云同步触发
- **自动化断言 247→269**：`?test=1` 新增 v0.25 断言（safeLoad / backupCorrupt / notifyCorrupt / 导出导入 / schema 版本化），三入口 269 条全绿
- **check-release 增强**：gongwei.js / gongwei-cloud.js 纳入外部 JS vs 内联段一致性比对

### Changed
- `standalone.html` / `index.html`：gongwei 段内联同步 + 导出/导入 UI + 云同步 UI
- `standalone-split.html`：同步 UI 与内联段
- `api/handler.rb`：新增 gongwei-cloud.js 静态路由
- 版本号 v0.24.0 → v0.25.0（本次正式发布，公测线上 v0.24.0 → v0.25.0）

### Notes
- AC10/11（云拉取 / 首传推云）依赖 Supabase 建表：`docs/sql/user_gongwei_config.sql`（项目 vugckrqxqufiyfrpptwt 的 SQL Editor 执行）
- 未建表时云同步静默降级，本地功能完全正常

### 修改文件
- 新增：`gongwei-cloud.js` / `docs/sql/user_gongwei_config.sql`
- 已改：`gongwei.js` / `auth.js` / `main.js` / `standalone.html` / `index.html` / `standalone-split.html` / `api/handler.rb` / `scripts/check-release.sh`
- 版本声明：`ext.yml` / `CHANGELOG.md`

---

## v0.24.0 — Supabase 账号功能：云端排盘记录 + 30 天免登 + 首次登录本地迁移 (2026-08-29)

### Added
- **账号系统（Supabase Auth）**：Email + 密码登录/注册/登出，30 天免登（本地持久会话）；登录遮罩 + 三按钮（登录/注册/游客）UI
- **云端排盘记录**：登录后排盘自动保存，列表 / 查看 / 删除（RLS 用户隔离，仅本人可见）
- **首次登录本地迁移**：登录时将本地档案合并/上传云端，避免数据孤岛
- **AI 录入守卫强化（P0-01 修复）**：`doAiParse` 统一走 `APP.doPaipan` 守卫入口（原绕过守卫），守卫同时包装 `RENDER.doPaipan` 纵深防御，未登录 AI 录入被拦截
- **自动化断言 232→247**：`?test=1` 新增 v0.24 T01-T04（指纹幂等/唯一、含 id 档案指纹）+ T05（守卫包装/守卫入口/patch 计数），三入口 247 条全绿
- **check-release 增强**：KEYS 补 16 个 v0.24 id、MODULES 补 4 新模块、新增第 4 步外部 JS vs 内联段一致性校验

### Changed
- `standalone.html` / `index.html`：按 ADR 五段内联 supabase/config/auth/records + 登录 UI + 记录列表，头部版本注释升 v0.24.0
- `standalone-split.html`：头部版本注释升 v0.24.0
- `api/handler.rb`：新增 config.js / auth.js / records.js / supabase.min.js 静态路由
- 版本号 v0.23.3 → v0.24.0（公测基线线上 v0.23.4 保留，本次仅发内测版）

### Security
- config.js 含真实 anonKey（publishable 级别，可提交 Git）；数据库密码/secret 仅存档案文件（仓库外），`.gitignore` 补 `.bak*/`、`*密码*`、`*password*`、`*secret*`、`*service_role*`、`Supabase配置记录*` 防呆规则

### 修改文件
- 新增：`config.js` / `auth.js` / `records.js` / `supabase.min.js`
- 已改：`standalone.html` / `index.html` / `standalone-split.html` / `main.js` / `api/handler.rb` / `scripts/check-release.sh` / `.gitignore`
- 版本声明：`ext.yml` / `CHANGELOG.md` / `SYSTEM.md`

### 文档
- [PRD](docs/PRD_v0.24.0_Supabase账号功能.md) / [ADR](docs/ADR_v0.24.0_Supabase账号功能.md) / [TEST](docs/TEST_v0.24.0_Supabase账号功能.md) / [QA 回归报告](docs/QA_v0.24.0_P0-01修复回归报告.md)

---

## v0.23.4 — 节气当天出生排盘崩溃修复：节气边界完整时刻比较 + 交运越界 null 防护 (2026-08-27)

### 修复
- **节气当天出生月柱误判（P0 崩溃根因）**：`monthPillar` 节气区间判断原按「节气日零点」截断，1987-05-06 立夏（17:05）当天 06:30 出生被误判巳月 → 逆排起运回退找立夏 → 起运 121 年 8 月 → 起运日期 2109 年越出节气表 → `getSolarTerm` 返回 null → 交运循环 `.getUTCFullYear()` 崩溃。现统一按「BJT-as-UTC」完整时刻比较（`Date.UTC(y,m-1,d,h,mi)` vs 节气 `getTime()+8h`），节气当天、节气前出生不再误判
- **人元司令同日零点截断**：`renYuanSiLing` 增加时分参数、与 monthPillar 同基准完整时刻比较，节气当天不再显示「立夏后 0 日」
- **年柱立春边界同类零点截断**：`paipan` 年柱立春判断同步改完整时刻（同类边界，顺带修复）
- **交运节气循环 null 防护**：standalone.html / index.html 交运循环 `st`/`nextSt` 为 null（2101+ 越界）时用哨兵日期，不再抛 `Cannot read properties of null (reading 'getUTCFullYear')`（对齐 render.js 375/381 既有判空）
- **自动化断言 224→232**：`?test=1` 新增 T01-T04（节气当天 06:30→辰月、18:00→巳月、人元司令含谷雨、交运越界不抛异常），双环境全绿

### 修改文件
- `algorithm.js`（monthPillar / renYuanSiLing / paipan 年柱立春）
- `standalone.html` / `index.html`（内联同步 + 交运循环判空）
- `main.js`（T01-T04 断言）

### 文档
- [PRD](docs/PRD_v0.23.1_节气当天出生崩溃修复.md)（起草 v0.23.1，Leader 定版 v0.23.4）/ [ADR](docs/ADR_v0.23.4_节气当天出生崩溃修复.md) / [QA](docs/QA_v0.23.4_节气当天出生崩溃修复.md) / [TEST](docs/TEST_v0.23.4_节气当天出生崩溃修复.md)

---

## v0.23.3 — AI 录入识别农历/县份 + 农历模式排盘崩溃修复 (2026-08-23)

### 修复
- **AI 录入日期识别**：`年/月/日` 正则的「日/号」后缀改为可选——「1986年7月26（农历）」不再报「未能识别完整日期」
- **农历标志识别**：文本含「农历/阴历/旧历/老历」（含括号写法）→ 自动切农历模式排盘，预览标注「（农历）」
- **AI 录入填表农历兼容**：原代码固定写 `inMonth.value`，农历模式下该控件已被替换为 `inMonthSelect` → null 崩溃导致排盘中断；现先按识别结果切日历模式再按模式分派填月
- **出生地识别增强**：省名支持无后缀写法（「广东」→广东省、「北京」→北京市）；区县支持省县写法（「南丹」→南丹县、「海淀」→海淀区）；直辖市省=市（北京市）不再因省名替换导致城市/区县失配（地址匹配改用原始文本基准）

### 修改文件
- `main.js`（parseNaturalInput + doAiParse）
- `index.html` / `standalone.html`（内联同步）

---

## v0.23.2 — 子时换日修复：真太阳时 23:00 后日柱取次日 (2026-08-22)

### 修复
- **子时换日**：真太阳时（及排盘时间）≥ 23:00 时日柱取次日（`dayPillar(y, m, d + 1)`，Date.UTC 自动处理月末/年末进位）。原实现时柱已按子时，但日柱仍取当天，且时干按当天日干起五鼠遁——日柱、时柱双双错位
- **规则口径**：无早子时/晚子时之分——23:00 统一换日；0:00–1:00 早子时不再重复进位

### 修改文件
- `algorithm.js`（paipan 日柱子时换日）
- `index.html` / `standalone.html`（内联同步）

---

## v0.23.1 — 农历+真太阳时排盘修复 (2026-08-22)

### 修复
- **农历模式排盘无反应**：`APP.calendarType` 由创建时值快照改为 getter 实时读取（原值快照恒为 'solar'，农历模式下 doPaipan 误走公历 DOM 分支 → `inMonth` 为 null → TypeError 中断）；`updateSolarPreview` 月份取值 DOM 自适应（inMonthSelect || inMonth），勾选真太阳时时不再崩溃
- **真太阳时分钟进位**：`Math.round(adjMin % 60)` 小数偏移（如 59.6 分）取整为 60 分时未进位到小时（显示 04:60），现进位为 05:00；`adjH` 同步改 `let`

### 修改文件
- `main.js`（APP.calendarType getter + updateSolarPreview DOM 自适应）
- `algorithm.js`（trueSolarTime 分钟进位）
- `index.html` / `standalone.html`（内联同步）

---

## v0.23.0 — 盘面截图 (2026-08-22)

### 新增
- 📷 截图按钮（输入区「排 盘」之后）：将 #output 排盘内容完整截图为 PNG 长图下载
- 文件名规则：`八字排盘_{隐私名}_{日期}.png`（隐私降级链 艺名→小名→匿名）
- 截图防重入（busy 态）、未排盘即时提示、html2canvas CDN 三源降级链（jsDelivr/unpkg/本地兜底 8s 超时）
- 自动化断言 211→224（截图按钮/文件名/清洗/空态 13 条）

### 修复
- 截图长图左右贴边：离屏克隆容器左右各加 36px 纸色留白（holder 加宽 2×36px 保持内容区原宽，不挤压排版）

### 文档
- [PRD](docs/PRD_v0.23.0_盘面截图.md) / [ADR](docs/ADR_v0.23.0_盘面截图.md) / [QA](docs/QA_v0.23.0_盘面截图.md) / [RELEASE](docs/RELEASE_v0.23.0_盘面截图.md)

---

## v0.22.0 — 年份扩展 1000-2100 (2026-08-13)

### 新增
- **年份范围扩展至 1000-2100**：三表（LUNAR_YEAR_INFO / LUNAR_MONTH_INFO / LUNAR_DAY_INFO + SOLAR_TERMS 节气表）数据全量重生，基于寿星天文历（sxtwl）权威数据，覆盖 1000-2099 年
- **1400 年以前出生者大运留空**：sxtwl 数据 1400 年以前无节令时刻，按需显示「（暂无数据）」占位，避免错排

### 修复
- **渲染层 qiYun 空指针崩溃**：部分年份组合下气运数据为 null 导致白屏，已做空值防护
- **小寒节气系统性偏移约 5 天（数据重生附带修复）**：旧版数据每年 1/1~1/5 月柱误排为丑月（小寒定早约 5 天），实际应属子月（大雪→小寒区间）。本次数据重生修正——影响 1900-2100 每年 1/1 至小寒前出生者的月柱（如 1986-1-1 素素：己丑→戊子）

### 测试
- L1 自动化断言全绿（standalone.html file:// 211/211、standalone-split.html http:// 212/212 双环境）
- L2 回归：素素（1986-1-1）月柱数据修正后断言同步更新（main.js + index.html + standalone.html 三处一致）

### 修改文件
- `constants.js`（四表全量重生 1000-2100，基于 sxtwl）
- `algorithm.js`（年份范围、大运留空逻辑）
- `render.js` / `archive.js` / `main.js`（渲染与测试断言适配）
- `standalone-split.html` / `index.html` / `standalone.html`（同步更新）

---

## v0.21.0 — 1900 前排盘支持（数据表扩展 1600） (2026-08-12)

### 新增
- **农历数据扩展至 1600-1899 年**：三表（LUNAR_YEAR_INFO / LUNAR_MONTH_INFO / LUNAR_DAY_INFO）头部各 +300 年，索引基准从 1900 改为 1600，覆盖 300 年历史排盘
- constants.js 数据体量：115K → 211K（+300 年农历数据）

### 测试
- L1 自动化断言 211/211 全绿（standalone.html / standalone-split.html 双环境）
- L2 渲染验证：三组 1600-1899 年历史案例排盘正确（年柱/月柱/日柱/时柱/胎元/命宫/身宫 七柱一致）

### 修改文件
- `constants.js`（三表各 +300 年数据，索引基准调整）
- `algorithm.js`（日柱算法适配 1600 基准）
- `render.js`（渲染适配）
- `archive.js`（档案适配）
- `standalone-split.html` / `index.html` / `standalone.html`（同步更新）

---

## v0.20.3 — 常用宫位双 tab 补同步 (2026-08-11)

### 修复
- **index.html / standalone.html 设置弹窗缺「全部宫位/常用宫位」双 tab**：v0.20.0 常用宫位分级开发时，tab 栏 HTML + CSS（gz-tabs/gz-tab/gz-star/gz-fav-footer）只同步进了 standalone-split.html，index.html 与 standalone.html 漏同步——导致正式版/公测版主入口看不到常用宫位管理功能（JS 引用元素为空，null-safe 静默失效）
- 补同步内容：`gz-tabs` 栏（gzTabAll/gzTabFav）、`gzSettingsActionsAll`/`gzFooterAll`/`gzFooterFav` id、`.gz-tabs`/`.gz-tab`/`.gz-star`/`.gz-fav-footer` CSS 块

### 测试
- 本地 + 公测版浏览器实测：双 tab 渲染、切换、footer 联动、星标、常用列表、默认排序全部正常
- `?test=1` 211/211 全绿

### 修改文件
- `index.html` / `standalone.html`（正式版 + 公测版各两份）

---

## v0.20.2 — 紧急修复：index.html 排盘崩溃 (2026-08-11)

### 修复
- **正式版 / 公测版 index.html 排盘全挂（线上事故）**：v0.20.1 修复 standalone.html 的 `\n` 转义符→字面换行缺陷时，index.html 漏同步。该缺陷导致 gongwei 内联段 SyntaxError → GONGWEI/APP 未定义 → 排盘功能整体崩溃
- **index.html 补同步 v0.20.1 自动化断言块**：main 段与 standalone.html 完全一致（此前 index.html 缺 12 条 GWFav 断言）

### 测试
- 本地 + 线上 `?test=1` 均 211/211 全绿
- 线上正式版排盘实测正常出盘（浏览器实测 APP.doPaipan）

### 流程改进（复盘落地）
- 发布前校验升级：`node --check` 语法校验扩展至 **index.html / standalone.html / standalone-split.html 三文件**，并做六模块 JS 段一致性对比，防止再次漏同步

### 修改文件
- `index.html`（两处 `\n` 缺陷修复 + main 段同步断言块）

---

## v0.20.1 — 自动化断言补充 (2026-08-11)

### 新增
- **GWFav 常用宫位自动化断言（12 条）**：覆盖 fav 首次初始化、☆ 取消级联清理（fav/selected）、旧用户迁移重建、默认排序复位、新增组默认不在 fav、增删改组幽灵名清理——内置回归集 199→211 条
- **PRD 模板新增「上版本复盘遗留项」section**：强制后续版本追溯复盘建议，修复复盘→改进闭环断裂

### 修复
- `standalone.html` 两处 `\n` 转义符→字面换行缺陷（破坏 gongwei.js 内联段语法，导致 GONGWEI 模块加载失败误判）

### 测试
- `?test=1` 内置回归 211 条全绿（standalone.html / standalone-split.html 双环境）
- 复盘闭环首次跑通：v0.20.0 两条核心建议（补断言、模板加 section）全部落地

### 修改文件
- `main.js`（?test=1 断言区 +12 条 GWFav）
- `docs/_TEMPLATE/PRD.md`（新增复盘遗留项 section）
- `standalone.html` / `standalone-split.html`（同步断言 + 修复 `\n` 缺陷）

---

## v0.20.0 — 常用宫位分级 (2026-08-11)

### 新增
- **常用宫位分级**：14 宫位两级管理（全部/常用），设置页双 tab 切换
- **☆ 常用标记**：任意宫位可标记/取消常用，下拉面板只显示常用宫位
- **常用宫位独立排序**：与全部宫位排序解耦，标签行顺序联动常用顺序
- **↺ 默认排序**：一键恢复常用宫位为全部宫位顺序
- **旧用户自动迁移**：无 fav 数据时自动以全部宫位初始化（默认全部常用）
- **数据一致性级联**：改名/删除宫位组时同步清理 fav / selected / trash

### 测试
- 常用宫位 13 条 AC/AR 手工验证全过 + 全量回归 199 条全绿

### 修改文件
- `gongwei.js`（两级管理 + ☆ 标记 + fav 持久化 + 级联清理）
- `standalone.html` / `index.html` / `standalone-split.html`（设置页双 tab + 下拉面板改造）

---

## v0.19.0 — 隐私模式（艺名） (2026-08-09)

### 新增
- **全局隐私开关**：默认开启、localStorage 持久化（`bz_privacy_mode`），可在设置中切换
- **档案艺名字段**：档案新增艺名（小名）字段，供显示层脱敏使用
- **显示层脱敏（降级链 艺名→小名→匿名）**：开启隐私模式后，页面展示优先用艺名，无艺名则用小名，均无则显示「匿名」，`data.name` 始终保留真名不动
- **AI 解析预览脱敏**：开启隐私模式时，AI 解析预览区姓名显示为「已隐藏」

### 测试
- AC1-AC13 + AC7b 隐私模式验收用例全过
- 199 条内置回归全绿
- `standalone.html == index.html` 字节一致

### 修改文件
- `standalone.html` / `index.html`（隐私开关 UI + 显示层脱敏逻辑）
- `archive.js`（艺名字段 + 显示名构造 + 降级链）
- `constants.js`（`PRIVACY_KEY`）
- `render.js`（显示层脱敏）
- `main.js`（AI 解析预览姓名脱敏）
- `standalone-split.html`（同步脱敏逻辑）

---

## v0.18.0 — 简0级别（五层级循环）+ 四柱三垣间隔 (2026-08-08)

### 新增
- **简0级别（L0极简）**：在 L1(简) 之前插入新层级，仅显示四柱干支骨架，不显示星运/自坐/纳运/纳音/空亡/神煞
- 简分级别从四层级扩展为五层级循环：极简→简→中→详→全→极简
- **四柱-三垣间隔行**：单人排盘在四柱数据行与三垣表头之间插入独立 `<tr class="sanyuan-sep">`（0.75em 分隔）
- **龙凤胎卡片三垣间距**：`.bz-sanyuan-area` 增加 `margin-top: 0.75em`

### 修复
- v0.17.0 遗留 bug：buildPillarRows 三垣区纳运行重复出现（删除冗余行）

### 技术
- CSS 层级规则从 4 组 `.level-0/1/2/3` 扩展为 5 组 `.level-0/1/2/3/4`
- `LEVEL_LABELS`：`['极简','简','中','详','全']`；`toggleLevel()` 改为 `% 5`
- 三处渲染入口按钮文字「简」→「极简」

### 修改文件
- `standalone-split.html`（CSS 层级规则 + 分隔行样式 + 龙凤胎间距）
- `render.js`（toggleLevel + 分隔行插入 + 按钮文字 + 冗余纳运修复）

---

## v0.17.0 — 简分级别（四层级循环） (2026-08-07)

### 新增
- **简分级别按钮**：将二态「精简/完整」升级为四层级循环切换，用户逐层展开信息
- 层级定义：L0(简)=星运+自坐 → L1(中)=+纳运+纳音 → L2(详)=+空亡 → L3(全)=全部（含神煞）

### 优化
- 纳运行位置调整

### 测试
- 12 条用例，初测 11/12 (91.7%)，修复 1 Bug 后 12/12 (100%)
- 内测版部署成功，6 项功能验证通过

### 修改文件
- `standalone-split.html`、`render.js`、`main.js`

---

## v0.16.1 — 档案布局优化 + API 路由修复 (2026-08-07)

### 优化
- 档案弹窗每条档案行仅显示 `YYYY年`，精简掉月/日/时/分
- dateStr 精简释放横向空间，最长名字组合完整可见，无截断
- 搜索过滤结果的 dateStr 格式与完整列表一致

### 修复
- API 端点 `/standalone` 从旧版单体 `standalone.html` 切换到模块化 `standalone-split.html`
- 新增 6 个 JS 模块文件的显式路由（constants.js 等），避免通配路由冲突
- gongwei.js 全局 onclick 函数引用改为 `GONGWEI.*` 命名空间前缀
- archive.js `toggleSolar()`/`doPaipan()` 改为 `APP.toggleSolar()`/`APP.doPaipan()`

### 技术
- standalone-split.html 内建运前流年 `data-di="-1"` 和分气×宫位 `updateGongWeiTags()` 修复

### 测试
- 199 条断言全绿（0 FAIL）
- AC-1~AC-6 档案布局验收 6/6 通过

---

## v0.16.0 — P2 架构升级 (2026-08-06)

### 架构
- standalone.html 从 5384 行单体文件拆分为 HTML 骨架（754行）+ 6 个 JS 模块
- 模块划分：constants.js（857行，常量/数据表）、algorithm.js（672行，排盘核心）、archive.js（866行，档案管理）、gongwei.js（860行，宫位自定义）、render.js（1513行，UI渲染）、main.js（873行，入口/事件/测试）
- 加载顺序：constants → algorithm → archive → gongwei → render → main
- 命名空间：window.CONST / ALGO / ARCHIVE / GONGWEI / RENDER / APP
- 零构建步骤，`<script>` 标签直接加载，GitHub Pages 原生兼容
- 新增 build_modules.py 构建脚本，支持将 JS 模块内联回 standalone.html

### 技术
- HTML onclick/onchange 全部替换为命名空间前缀（如 APP.doPaipan()、RENDER.toggleSimple()）
- 每个模块通过 window.CONST 引用常量，解除循环依赖
- debug_all.html 调试页面：8 iframe 同时加载所有组合验证

### 测试
- 199 条断言全绿（0 FAIL）
- 6 模块 node -c 语法检查全通过
- UI 功能验证全部正常（双胞胎/精简/宫位Popover/档案/龙凤胎）
- 跨模块引用全部就绪，零 JS 错误

### 文档
- UPGRADE_PLAN.md 加载顺序与 ADR 对齐（archive↔gongwei 对调）
- DEVELOPER_QUICKSTART.md 代码段索引改为模块化索引

---

## v0.15.0 — P1 效率基建 (2026-08-06)

### 文档统一
- 删除 6 个冗余/过期文档：ROADMAP.md, BUGS.md, CONTRIBUTING.md, DEVELOPMENT.md, RELEASE.md, TEST.md
- docs/ 精简为 25 个核心文档：算法真相源 + 架构决策 + 版本配套 PRD/ADR/TEST/RETRO + 历史记录

### 新功能模板
- 新增 `docs/_TEMPLATE/`：PRD / ADR / 变更记录 / QA / 流程记录 / 发布报告 六合一
- 开发新功能时复制模板目录 → 填写即可，不再每轮重造文档结构

### 文档
- QUICKSTART 文件地图同步更新，新增 RELEASE_CHECKLIST 和 UPGRADE_PLAN 条目

---

## v0.14.0 — P0 开发体系安全加固 (2026-08-06)

### 回归测试增强
- `?test=1` 从 ~80 条扩展到 199 条自动断言
- 新增：11 孩全量快照（年/月/日/时/命/身/胎柱全对比）
- 新增：纳音土五行全覆盖（6 组 12 干支）
- 新增：幂等测试（同八字多次排盘一致性）
- 新增：身宫 hi 未定义回归验证（v0.9.4 bug 防复发）
- 新增：真太阳时功能存在性检测（优雅跳过，非失败）
- UI 增强：顶部显眼绿/红横幅 + 数字摘要

### 发布流程
- 新增 `RELEASE_CHECKLIST.md`：代码/回归/UI/文档/发布 五大检查项

### 文档
- 新增 `UPGRADE_PLAN.md`：三阶段升级规划（P0 安全/P1 效率/P2 架构）
- 更新 `DEVELOPER_QUICKSTART.md`：行号同步至 5497 行

---

## v0.12.0 — 纳运功能 (2026-08-03)

### 功能
- 新增「纳运」行：展示每柱纳音五行在月令的十二长生状态
- 七柱（年月日时 + 胎命身）全覆盖
- 五行→十二长生映射：金→庚、木→甲、水→壬、火→丙、土→壬（水土同源）
- UI：位于自坐行下方，class=rm，data-row-type=nayun；点击「简」时同步隐藏
- 龙凤胎卡片同步插入纳运行

### 技术
- 新增常量 NAYIN_WX_YANG（五行→阳干映射）
- 新增函数 nayunChangSheng(nayinName, yueZhi)
- pillar() 返回值新增 nayun 字段，两个副本均增加 yueZhi 参数
- CSS 精简模式新增 [data-row-type~="nayun"] 隐藏规则

### 变更量
- standalone.html：15处 nayun 引用

### 测试
- QA 全量验收通过 ✅（五列纳运值全部正确，水/木/火/金/土 20/20 纳音类型）
- 土五行修复：水土同源（戊→壬），一行改动

### 文档
- PRD_v0.12.0_纳运功能.md
- ADR_v0.12.0_纳运功能.md
- TEST_v0.12.0_纳运功能.md

---

## v0.11.1 — 能力排盘架构重构 (2026-07-28)

### 架构
- 能力排盘从 standalone.html 内嵌改为独立模块 ability-chart.html
- 跨窗口数据传递：序列化命盘数据 → base64 URL hash → window.open()

### 功能
- standalone.html：3 处 .top-bar 新增「能力排盘」按钮 + openAbilityChart() 函数
- ability-chart.html：独立能力排盘页面（元能力卡片 + 组合能力 SVG 关系图）

### 变更量
- standalone.html：修改（+能力排盘按钮入口）
- ability-chart.html：新增（独立模块，16,166 bytes）

### 测试
- QA v3 全量验收通过 ✅（25/25 PASS，含一轮回归）

---

## v0.11.0 — 能力按钮功能 (2026-07-26)

### 功能
- 宫位能力标签交互系统：点击宫位标签展示对应能力信息
- 能力按钮在八字排盘界面中的集成

### 变更量
- 前端：standalone.html（能力按钮功能模块）

### 测试
- QA 回归测试通过 ✅（23/25 AC，4项缺陷全部修复）

---

## v0.10.4 — 流年Bug根治：data-row-type 语义选择器 (2026-07-26)

### 根因
v0.10.2 硬编码 `rowIndex = 9 + tagRowCount` 的 `_applyDLUpdates`，在多组宫位标签行插入后仍会偏移错位。

### 根治方案
- 每个流年和大运行注入 `data-row-type` 属性：`dy1`~`dy5`、`ln1`~`ln5`
- `_applyDLUpdates` 改为 `getRow(type) → tableEl.querySelector('[data-row-type~="' + type + '"]')` 语义选择器
- 彻底消除行索引硬编码，无论塞多少标签行都不会漂

### 变更量
- 前端：standalone.html（data-row-type 注入 + _applyDLUpdates 重写）

### 测试
- 浏览器验证通过 ✅（3组标签行 + 大运流年数据精准定位 + JS 零报错）

---

## v0.10.3 — 合并到生产文件 + 小名预存修复 (2026-07-25)

### 背景
v0.10.0~v0.10.2 的开发发生在错误文件（旧 fork）上，导致改动未进入生产部署文件。

### 修复
- 将所有 v0.10.x 改动合并到正确部署文件 `~/.clacky/ext/local/bazi-paipan/standalone.html`
- 小名显示预存问题修复

### 测试
- QA 回归测试通过 ✅

---

## v0.10.2 — 大运流年列错乱紧急修复 (2026-07-25)

### Bug
- 选中多个宫位后，大运流年列数据错乱：`_applyDLUpdates` 行索引偏移未计入宫位标签行增量

### 修复
- `_applyDLUpdates` 加入 `tagRowCount` 动态偏移量

### 变更量
- 前端：standalone.html（单函数修复）

### 测试
- QA 回归测试通过 ✅

---

## v0.10.1 — 首次发布 (2026-07-25)

### 新增
- **宫位多选**：14 种宫位维度复选框下拉，支持多选叠加
- 宫位标签行注入到排盘表格（单人和双胞胎模式均支持）
- 宫位选择器与 localStorage 持久化

### Bug（v0.10.2 修复）
- 双胞胎模式面板缺失

### 测试
- QA 浏览器回归测试，P0 Bug 识别并修复

---

## v0.10.0 — 宫位多选开发 (2026-07-25)

### 新增
- 14 种宫位维度定义
- 宫位多选下拉组件
- 宫位标签行数据映射与渲染管线

### 注意
- 本版本开发在 fork 文件上进行，未直接修改生产部署文件（v0.10.3 合并修复）

---

## v0.9.4 — 身宫Bug修复 (2026-07-25)

### 修复
- **P0 身宫计算Bug**：身宫算法中地支定位偏移错误，导致部分命例身宫偏差一位

### 变更量
- 前端：standalone.html（身宫算法修正）

### 测试
- 回归测试通过 ✅

---

## v0.9.3 — 丑月司令Bug修复 + 16孩时辰补全 (2026-07-24)

### 修复
- **P0 丑月司令年份偏移Bug**：`renYuanSiLing()` 中丑月（小寒）年份查找逻辑错误，导致1月出生者（如妍语）司令返回空字符串。修复 `stY = (m===1) ? y : y+1` → 丑月正确映射，妍语司令从空→「己」。

### 增补
- **PRESET_ARCHIVES 补全16孩准确时辰**：自在班全部16孩预置数据补全准确出生时辰。

### 已知限制（pre-existing）
- 1月1日子月司令缺失（跨年边界问题，非v0.9.3引入，影响极小）

### 变更量
- 前端：standalone.html（renYuanSiLing 修复 + PRESET_ARCHIVES 补全）

### 测试
- 回归测试通过 ✅（妍语Bug修复确认，已有孩子无回归，边界抽查通过）

---

## v0.9.1 — 岁流板块运前内容 (2026-07-22)

### 新增
- **运前列**：大运流年表格新增运前列，展示起运前流年干支（`--` 占位、浅灰底色）
- **边界修复**：hiDy/hiLn 动态偏移检测修复 `qyYears=0` 边界 bug

### 修复
- 档案弹窗搜索时窗口抖动：锁定弹窗高度 480px，列表区 `min-height:0` 解除 flex 约束，空状态撑满居中
- 搜索增加 150ms 防抖，减少重绘

### 变更量
- 前端：standalone.html（5处修改）

### 测试
- 13/13 验收标准全部通过 ✅

---

## v0.9.2 — 大运流年UI重构 (2026-07-22)

### 新增
- **运前表头**：大运流年表格增加运前标识列
- **干支行运前列**：干支信息前置展示于运前列
- **始于止于行**：大运起止年份显示优化
- **双胞胎合并**：双胞胎排盘结果合并展示

### 变更量
- 前端：standalone.html（UI重构）

### 测试
- 32/32 回归测试全量通过 ✅

---

## v0.9.0 — 档案管理 (2026-07-21)

### 新增
- **档案卡片列表**：卡片式展示，含小名、姓名、性别图标、八字四柱摘要
- **搜索过滤**：模糊匹配小名和姓名
- **展开排盘**：点击卡片展开完整八字排盘，手风琴模式
- **加载到表单**：一键回填表单并自动排盘
- **小名字段**：输入表单新增选填字段
- **预置数据**：自在班16孩首次自动写入
- **数据模型**：`bz_archives_v2`（含完整八字结果），旧数据自动迁移

### 变更量
- 前端：档案面板 UI + JS 逻辑
- 外部依赖：零

### 测试
- 算法回归 100% 通过 ✅
- 新功能 20/29 通过，0 失败，9 未测

---

## v0.8.1 — 宫位标签系统 + 农历录入 + UI 改进 (2026-07-15)

含 v0.8.0 与 v0.8.1 合版发布（含 v0.7.x 宫位基础设施）。

### v0.8.1 新增
- 宫位标签系统：14种宫位维度 × 7柱映射（信息/认知/功能/做功/亲缘/兴趣/场景/人设/客户/系统/关系/圈层/生理/记忆）
- 宫位选择器下拉菜单，单人和双胞胎/龙凤胎均集成
- 宫位标签行 CSS（`.gz-tags` / `.gz-tags-sy`），data-gw 属性定位
- 宫位标签定制：记忆/生理两行标签重命名
- 年输入框加长：48px → 72px

### v0.8.0 新增
- 新历/农历录入切换（radio 切换器 + `toggleCalendar`）
- 农历数据表（1900–2100，寿星万年历，200年）
- `lunarToSolar`：农历→公历转换（查表法 + 闰月处理）
- 排盘管线集成：农历→公历转换在真太阳时修正之前

### 变更量
- 前端：+~400 行（农历数据表 + 宫位系统 + UI）
- 后端：无变更

### 测试
- R2 全量回归全部通过 ✅
- 无阻塞缺陷

---

## v0.6.7 — 流年交互修复 + 龙凤流年着色修复 (2026-07-12)

含 v0.6.6 与 v0.6.7 合版发布。

### v0.6.7 修复
- 龙凤模式点击右卡流年时 luck table 高亮错位到左卡：hiDy/hiLn 加 scope 参数，bindEvents 传入 clickedEl.closest('.bz-card-luck')

### v0.6.6 修复
- 单人/双胞胎点击流年时大运流年列不更新：新增 _applyDLUpdates 双模式行映射
- pill() 加 cg 字段（藏干合并格式）
- renderChart 挂载 _paipanData

### 变更量
- 前端：2952 行（+33 vs v0.6.5）
- 后端：无变更

### 测试
- 全量回归 12/12 场景全部通过 ✅
- 单人(4) + 同性双胞(2) + 龙凤胎(4) + 通用(2)
- JS Console 零 error ✅

---

## v0.6.5 — 双胞胎交互修复 + 龙凤胎性别选择修复 (2026-07-12)

### 修复
- 双胞胎卡片流年点击后大运/流年列不更新：bindEvents 内大运来源优先从 `_cardData` 取
- 龙凤胎性别选择老大被强制设男：setupTwinTypeChange 移除 g1.value='男'
- v0.6.4 纳音/星运重复修复已确认不回归

### 测试
- 全量回归 6 项场景全部通过 ✅
- 单人/同性双胞/龙凤三种模式纳音+星运始终 6 项 ✅
- 共享流年点击双卡同步更新 ✅
- 龙凤胎独立流年互不串扰 ✅
- 零 JS 报错 ✅

---

## v0.6.4 — 回归修复：纳音重复 + 双胞胎大运列缺失 (2026-07-12)

### 修复
- 单人排盘纳音/星运重复：splice 后索引修正 [6-10]→[4-8]
- 同性双胞胎时柱后缺大运流年列：renderTwinCardsHtml 两个 buildCardHTML 各加 includeLuckCols:true

### 测试
- 全量回归全部通过 ✅
- 浏览器验证：纳音/星运/自坐/空亡/神煞无重复 ✅；双胞胎大运流年列正常 ✅；JS Console 零报错 ✅

---

## v0.6.2 — 取消经典视图 + 大运顺逆排标签 (2026-07-12)

### 变更
- 取消经典视图（移除 renderTwinChart 及关联代码），统一使用卡片视图
- 大运区新增顺排/逆排标签（阳年男顺排、阴年女顺排等）
- 单人排盘顶栏显示顺逆排标签
- 双胞/龙凤胎卡片各自显示对应顺逆排标签
- 净变化：前端 -392 行（2827 vs v0.6.1 的 3219），后端 +~15 行 handler.rb

### 测试
- 9/9 全部通过，无阻塞缺陷

---

## v0.6.1 — 龙凤胎卡片列扩展 + 大运表重构 (2026-07-12)

### 变更
- 标题去亲属称谓：龙凤胎卡片「老大」「老二」不加兄/弟/姐/妹
- 四柱卡片列扩展：5列→7列，新增「大运」「流年」列
- 底部大运导航重构：pill 横向滑动 → 经典三行 luck-table
- 净变化：+34 行

### 测试
- 13/13 全部通过，无阻塞缺陷

---

## v0.6.0 — 龙凤胎版面重设计 (2026-07-12)

### 新增
- 龙凤胎独立双卡布局：老大顺排/老二逆排各自大运区，大运 pill 横向滑动
- 双胞下拉三选项（无/同性/龙凤）+ 龙凤模式老二性别选择
- 大运 pill 选中态配色：老大暖金(#c8961f) / 老二冷蓝(#4a7fb5)
- 经典↔卡片双向视图切换，默认选中当前大运
- 全局「大宝/二宝」→「老大/老二」命名替换

### 兼容
- 同性双胞：保持 v0.5.2 双卡+共享底栏模式，无回归
- 单人排盘：选「无」完全不受影响

### 测试
- 17 项验证，13 通过 + 2 已知缺陷（经典视图缺回切链接、龙凤切换性别状态丢失）+ 2 建议优化，条件通过

---

## v0.5.2 — 经典视图三垣占位列 + updTopCols 藏干偏移修复 (2026-07-12)

### 修复
- 双胞胎经典视图三垣区域补齐 emp 占位列，修复大运流年排版偏移
- renderTwinChart 三垣区域 12 行在 twinSep() 后补 emp 占位列
- updTopCols 藏干3行（本气/中气/余气）导致纳音/星运/自坐行偏移+2 的 bug 修复

### 测试
- 103 项回归 + 4 项专项验证全部通过，经典视图 + 卡片视图均无回归

---

## v0.5.1 — 卡片视图共享区点击串位修复 (2026-07-12)

### 修复
- 卡片视图共享区点击大运/流年时，不再错误串到大宝日时柱
- bindEvents 中两处 `updTopCols` 调用加 `if (window._twinViewMode !== 'cards')` 守卫

### 测试
- 5/5 全部通过，经典视图 + 非双胞版均无回归

---

## v0.5.0 — 双胞胎卡片式版面 (2026-07-12)

### 新增
- 双卡并排布局：大宝/小宝各自独立卡片（5列：盘式+年/月/日/时柱），带金色/蓝色顶边标识
- 差异高亮：大宝11处暖金底纹，小宝11处冷蓝底纹，差异一目了然
- 三模式切换：「并排对比」「仅看大宝」「仅看小宝」
- 经典视图保留：一键切回12列单表格布局，可随时返回卡片视图
- 三垣折叠：点击 ▲/▼ 折叠/展开胎元、命宫、身宫区域
- 窄屏响应（<900px）：卡片纵向堆叠，移动端友好

### 架构
- 重写 `renderTwinChart()`→卡片式渲染
- 新增 `.bz-twin-card` / `.bz-tab` / `.bz-shared` 组件体系
- 非双胞胎模式完全不受影响

### 测试
- 9/9 全部通过，无回归问题

---

## v0.4.1 — updTopCols 修复 + 占位符清理 (2026-07-12)

### 修复
- updTopCols 列号算法修复：双胞胎版面因 colspan 导致大运/流年列号计算错误，改为按 class（`col-dy`/`col-ln`）定位列，解决点击流年时上盘大运流年列不更新的问题
- 占位符 `'—'` 全部替换为空字符串，表格空白处不再显示横线

---

## v0.4.0 — 双胞胎版面优化 (2026-07-12)

### 新增
- 藏干分层显示：日/时/命/身四柱藏干区分本气、中气、余气三层，各自独立行显示
- 盘式标签横排：所有数据行横向排列，藏干等长文本不再因列宽换行挤压

### 优化
- 紧凑度对标原版：双胞胎表格宽度和留白向非双胞胎原版对齐

### 变更
- 后端 handler.rb：pillar_info 新增 `cang_gan_layers` 结构化字段
- 前端：新增 `cangGanLayers()` / `fmtCGLayer()` 渲染函数
- 独气支劫财填充：统一使用 CANG_GAN 藏干表

### 测试
- 回归测试 103/103 全部通过

---

## v0.3.0 — 双胞胎对比布局 (2026-07-12)

### 新增
- 双胞胎对比模式：单表三栏布局（大宝 | 小宝 | 共享大运流年）
- 双胞胎藏干替换规则：弟妹日/时/命/身四支取中余气
- 底部共享大运流年表，两端共用一套岁运
- `scrollToNow` 支持双胞胎模式自动定位今年

### 修复
- `updTopCols` 列索引硬编码 → 自动检测布局（单表7列 / 双胞12列）
- `updTopCols` 行偏移修复：sub-header 行导致索引错位，改用「主星」标签定位基准行

### 技术要点
- 新函数 `renderTwinChart(data, targetId)` 渲染双胞胎对比表
- `twinSep()` 生成大宝/小宝分隔列

---

## v0.1.0 — 基础排盘 (2026-07-11)

### 功能
- 四柱八字：年柱、月柱、日柱、时柱
- 十神、藏干、纳音、十二长生星运、自坐、空亡、神煞
- 三垣：胎元、命宫、身宫
- 大运排盘（顺逆、起运年龄）
- 流年排盘（10年/大运）
- 真太阳时修正
- 本地档案管理：保存 / 加载 / 回收站
- 精简模式（隐藏纳音/空亡/神煞）
- 大运流年点击互动（高亮 + 上盘联动）

### 架构
- 单文件 `standalone.html`（前端 + 算法全内嵌）
- Rails API 后端 `api/handler.rb`（Clacky 扩展框架）
- 面板 `panels/launcher/view.js` + `panels/paipan/view.js`
