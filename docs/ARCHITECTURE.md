# 架构决策记录 (ADR)

## ADR-1: 单文件 HTML 策略

**决策**: 所有前端代码 + 排盘算法放在 `standalone.html` 一个文件中。

**理由**:
- 零构建步骤，改完即刷新
- GitHub Pages 直接托管，无需 CI
- Clacky 面板通过 iframe 嵌入，天然隔离

**代价**: 文件目前已 2200+ 行，后续需考虑模块拆分。

---

## ADR-2: 双胞胎对比布局

**决策**: 单表横向对比（大宝四柱 | 小宝四柱 | 共享大运流年），而非双表并排。

**理由**:
- 同一对双胞胎大运流年完全相同（同八字），无需重复展示
- 共享底部岁运表节省空间，一屏看完
- 横向对比八字差异比纵向更直观

**实现**: `renderTwinChart(data, targetId)` 函数，12 列表格（盘式 | 大宝×4 | sep | 小宝×4 | 大运 | 流年）

---

## ADR-3: 大运流年互动机制

**决策**: 底部 luck-table 点击事件更新顶部 chart 的大运/流年列。

**关键函数**:
- `bindEvents(data, container)` — 绑定点击事件
- `hiDy(i)` / `hiLn(di, li)` — 高亮选中单元
- `updTopCols(data, dyIdx, lnIdx, container)` — 更新 chart 表头列

**v0.3.0 修复**: `updTopCols` 原用硬编码列索引（5/6），改为自动检测 `nCols-2/nCols-1` + 用「主星」标签定位基准行，兼容单表（7列）和双胞（12列）两种布局。

---

## ADR-4: 藏干替换规则

**决策**: 双胞胎弟妹四支（日/时/命/身）藏干取中余气，规则表硬编码于 `ZHI_TWIN_MAIN` / `ZHI_TWIN_CANG`。

详见 `api/handler.rb` 常量定义。

---

## ADR-5: 面板双层设计

**决策**: 两个面板 — `launcher`（启动入口）和 `paipan`（主面板）。

- `launcher`: 侧边栏快捷入口，点击跳转独立页面
- `paipan`: iframe 嵌入 standalone，完整排盘体验
- 两个面板都 `attach: ["*"]`（挂载到所有 agent 面板区）
