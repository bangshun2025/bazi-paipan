# ADR：P2 架构升级 — 单体 HTML 拆分为 6 JS 模块

> Architecture Decision Record — 架构决策记录。
> 版本：v0.16.0 | 日期：2026-08-06 | 作者：架构师(worker_36df7c90)

---

## 决策

将 standalone.html（5497 行单体文件）的 JavaScript 逻辑拆分为 6 个独立 JS 模块文件，通过 **IIFE + window 命名空间** 暴露接口，HTML 中按依赖拓扑顺序用 `<script src="...">` 引入。**不使用 ES module（import/export）**。

---

## 理由

### 为什么是 IIFE + window 而非 ES module

| 维度 | IIFE + window（采纳） | ES module（不采纳） |
|------|----------------------|---------------------|
| **file:// 协议兼容** | ✅ 直接双击 HTML 即可运行 | ❌ ES module 被 CORS 阻止，必须走 HTTP 服务 |
| **零构建工具** | ✅ 直接 `<script src>` 引入 | ❌ 浏览器原生 ES module 需处理裸路径导入、需服务器 |
| **迁移风险** | ✅ 最小改动——现有代码已是全局作用域，只加 IIFE 壳 | ❌ 所有 `var`→`const/let`，`window.xxx`→`export`，重写量大 |
| **加载时序** | ✅ `<script>` 天然顺序执行 | ❌ `<script type="module">` 默认 defer，初始化时序难控 |
| **调试体验** | ✅ 浏览器 Sources 面板行号直对 | ✅ 也支持，但需 source map |
| **未来演进** | ⚠️ 全局命名空间污染 | ✅ 更现代，可 tree-shaking |

**核心裁决依据**：PRD 明确"非目标"中包含「不引入构建工具」「保持零外部依赖」。standalone.html 的核心使用场景是本地双击打开（file:// 协议）。ES module 在此场景下直接失效——这是硬阻断。当前阶段 IIFE+window 是唯一务实选择。

> **给编程师的补充说明**：如果未来引入构建工具（如 esbuild），可以无缝从 IIFE+window 迁移到 ES module——只需将 `window.ALGO = ALGO` 改为 `export`，`<script src>` 改为 `import`。IIFE+window 是 ES module 的超集兼容写法，不是死胡同。

---

## 代价

1. **全局命名空间污染**：6 个 `window.CONST`/`window.ALGO`/`window.GONGWEI`/`window.RENDER`/`window.ARCHIVE`/`window.APP` 挂在全局，可能与浏览器扩展冲突（概率极低）。
2. **无法 tree-shaking**：所有导出函数都会被加载，即使部分未使用。
3. **加载瀑布**：6 个 `<script>` 标签串行下载（实际场景本地文件瞬时加载，无影响）。
4. **模块边界靠纪律**：没有编译期检查，依赖关系靠文档和加载顺序保证。

---

## 备选方案

| 方案 | 优点 | 为什么不选 |
|------|------|-----------|
| ES module（import/export） | 标准化、tree-shaking、编译期检查 | file:// 不兼容，需 HTTP 服务器 + 构建工具，违反 PRD 非目标 |
| 单一 IIFE（不拆模块） | 零风险 | 不解决 PRD 提出的维护瓶颈 |
| webpack/rollup 打包 | 模块化 + 兼容性兼得 | 引入构建工具 → 违反 PRD 非目标；每次改动需重新构建，破坏"改完即刷新"的开发体验 |
| AMD/RequireJS | 异步加载 | 引入第三方依赖，过度设计，5497 行代码不需要 |

---

## 实现要点

### 一、6 模块精确内容清单

以下清单对照 standalone.html 实际代码逐函数/常量确认，行号为当前版本（v0.15.0）的位置。

---

#### 1. constants.js（~450 行，L751-L1147 + L1550-L1700）

**命名空间**：`window.CONST`

| 类型 | 名称 | 行号（约）| 说明 |
|------|------|----------|------|
| const | `LOC_DATA` | L751 | 中国省市县经度数据（397 行大对象） |
| const | `TG` | L1550 | 十天干数组 |
| const | `DZ` | L1550 | 十二地支数组 |
| const | `WU_XING` | L1551 | 干支→五行映射 |
| const | `WX_CSS` | L1552 | 五行→CSS class 映射 |
| const | `GONGWEI_MAP` | L1558 | 14 宫位 × 7 柱标签映射表 |
| const | `GW_INDEX` | L1574 | data-gw → 数组索引 |
| const | `GONGWEI_COLORS` | L1577 | 宫位→颜色映射 |
| const | `GONGWEI_COLOR_KEYS` | L1584 | 宫位→CSS 变量 key |
| const | `NAYIN` | L1650 | 60 甲子纳音映射表 |
| const | `CANG_GAN` | L1659 | 地支藏干表 |
| const | `ZHI_TWIN_MAIN` | L1665 | 双胞胎后出者地支主气 |
| const | `ZHI_TWIN_CANG` | L1669 | 双胞胎后出者地支藏干 |
| var | `twinPillars` | L1675 | 双胞胎分气柱类型数组（需暴露为读写） |
| const | `CS12_MAP` | L1678 | 十二长生表 |
| const | `CS12_N` | L1688 | 十二长生名称 |
| const | `NAYIN_WX_YANG` | L1691 | 纳音五行→阳干映射 |
| const | `KONG_WANG` | L1694 | 空亡表（60 甲子） |
| const | `SHI_SHEN_SHORT` | L2051 | 十神全称→缩写 |
| const | `ZHI_WX` | L2070 | 地支→五行（仅算法内部用，可不暴露） |
| const | `ZHI_MAIN` | L2071 | 地支本气天干（仅算法内部用，可不暴露） |
| const | `WU_HU_DUN` | L1973 | 五虎遁年起月表 |
| const | `WU_SHU_DUN` | L2037 | 五鼠遁日起时表 |
| const | `S_TERM_NAME` | L1979 | 节气名数组 |
| const | `MONTH_TERM` | L1985 | 月→节气索引映射 |
| const | `LUNAR_INFO` | L1698 | 农历数据表（1900-2100） |
| const | `LUNAR_NEW_YEAR` | L1715 | 农历正月初一日期 |
| const | `LUNAR_MONTH_OPTIONS` | L1748 | 农历月份 select options |
| const | `REN_YUAN` | L2266 | 人元司令表 |
| const | `SOLAR_TERMS` | L1698 | 节气精确时间表（JPL DE440s，200 年） |
| const | `TIME_MOD` | L5245 | AI 录入时间修饰词映射 |

**不纳入 constants.js**（运行时变量）：
- `calendarType` — 移到 main.js
- `selectedGongWei` — 移到 gongwei.js
- `gongWeiGroups` / `gongWeiTrash` — 移到 gongwei.js

---

#### 2. algorithm.js（~1000 行，L1300-L2300）

**命名空间**：`window.ALGO`

| 函数 | 行号（约）| 说明 |
|------|----------|------|
| `monthDays(info, m, isLeap, leapMonth)` | L1156 | 农历月天数 |
| `normalizeDate(y, m, d)` | L1166 | 日期规范化（跨月跨年） |
| `lunarToSolar(ly, lm, ld, isLeap)` | L1178 | 农历→公历 |
| `dayOfYear(y, m, d)` | L1310 | 一年中第几天 |
| `equationOfTime(y, m, d)` | L1318 | 均时差（Spencer 1971） |
| `trueSolarTime(y, m, d, h, mi, lng)` | L1326 | 真太阳时修正 |
| `getSolarTerm(y, idx)` | L1995 | 节气精确时间（从 SOLAR_TERMS 解包） |
| `yearPillar(y)` | L2008 | 年柱计算 |
| `monthPillar(y, m, d, h, mi, yearGan)` | L2011 | 月柱计算（含节气边界判定） |
| `dayPillar(y, m, d)` | L2027 | 日柱计算（1900 基准） |
| `hourPillar(dayGan, hour)` | L2037 | 时柱计算（五鼠遁） |
| `shiShen(riGan, gan, short)` | L2053 | 十神计算 |
| `zhiShiShen(riGan, zhi, twin, pillarType)` | L2074 | 地支十神（按主气） |
| `wxClass(gan)` | L2086 | 五行 CSS class |
| `changSheng(gan, zhi)` | L2089 | 十二长生 |
| `nayunChangSheng(nayinName, yueZhi)` | L2095 | 纳音五行长生 |
| `cangGanAt(zhi, riGan, twin, pillarType, level)` | L2103 | 藏干单层 |
| `cangGanText(zhi, riGan, twin, pillarType)` | L2112 | 藏干格式化文本 |
| `jieCai(gan)` | L2122 | 劫财配对（阴阳翻转） |
| `cangGanLayers(zhi, riGan, twin, pillarType)` | L2125 | 藏干三层（含双胞胎逻辑） |
| `fmtCGLayer(l)` | L2161 | 藏干层格式化 |
| `kongWang(riGan, riZhi)` | L2164 | 空亡 |
| `shenSha(riGan, riZhi, nianZhi, yueZhi)` | L2168 | 神煞（天乙/文昌/禄神/驿马/桃花/华盖/国印） |
| `taiYuan(yueGan, yueZhi)` | L2205 | 胎元计算 |
| `dzNum(zhi)` | L2210 | 地支→序号（寅=1） |
| `numZhi(n)` | L2212 | 序号→地支 |
| `mingGong(yueZhi, shiZhi, nianGan)` | L2216 | 命宫计算 |
| `shenGong(yueZhi, shiZhi, nianGan)` | L2225 | 身宫计算 |
| `qiYunDays(birth, monthZhi, shun)` | L2235 | 起运天数（精确到小时） |
| `computeDaYun(gender, nianGan, yueGan, yueZhi, birth)` | L2251 | 大运 + 起运计算 |
| `liuNianJZ(y)` | L2285 | 流年干支（y-4 mod 60） |
| `renYuanSiLing(y, m, d)` | L2297 | 人元司令 |
| `paipan(name, gender, y, m, d, h, mi)` | L2333 | **主入口**：完整排盘 |

**内部辅助（不暴露）**：`jieCai`（仅被 cangGanLayers 内部调用）

---

#### 3. gongwei.js（~500 行，散落 L1558-L1700 + L2500-L2900）

**命名空间**：`window.GONGWEI`

| 函数/变量 | 行号（约）| 说明 |
|-----------|----------|------|
| `gongWeiGroups` | L1593 | 宫位组数组 |
| `gongWeiTrash` | L1594 | 宫位回收站 |
| `selectedGongWei` | L1745 | 当前选中宫位名称数组 |
| `loadGroups()` | L1597 | 从 localStorage 加载宫位组 |
| `loadTrash()` | L1602 | 从 localStorage 加载回收站 |
| `loadSelected()` | L1603 | 从 localStorage 加载选中状态 |
| `persistGroups()` | L1604 | 保存宫位组到 localStorage |
| `persistTrash()` | L1605 | 保存回收站 |
| `persistSelected()` | L1606 | 保存选中状态 |
| `nowISO()` | L1607 | 当前时间 ISO 字符串 |
| `generateGwId()` | L1608 | 生成宫位组 ID |
| `findGroupByName(name)` | L1609 | 按名查找宫位组 |
| `getGroupColor(name, isPreset)` | L1617 | 获取宫位组颜色 |
| `initGongWeiGroups()` | L1622 | 初始化预置 14 宫位组 |
| `addGroup(name, labels)` | L1636 | 新增宫位组 |
| `updateGroup(id, newName, newLabels)` | L1654 | 更新宫位组 |
| `deleteGroup(id)` | L1685 | 删除宫位组（移入回收站） |
| `restoreFromTrash(id)` | L1696 | 从回收站恢复 |
| `clearTrash()` | L1709 | 清空回收站 |
| `moveGroup(fromIdx, toIdx)` | L1711 | 移动宫位组（拖拽排序） |
| `moveUp(idx)` | L1719 | 上移 |
| `moveDown(idx)` | L1720 | 下移 |
| `toggleSelect(name)` | L1723 | 切换宫位选中 |
| `selectAll()` | L1729 | 全选 |
| `clearSelection()` | L1730 | 清空选中 |
| `isSelected(name)` | L1731 | 是否选中 |
| `resetToDefaults()` | L1734 | 恢复默认 14 宫位 |
| `buildGongWeiTagRows(area, colCount)` | L2380 | 生成标签行 HTML |
| `updateGongWeiTags()` | L2430 | 全局刷新标签行 |
| `updateGzTriggerText()` | L2470 | 更新面板按钮文字 |
| `syncGzCheckboxes()` | L2485 | 同步 Popover checkbox |
| `rebuildGzCbGrid()` | L2496 | 重建 Popover 勾选网格 |
| `renderGongWeiPanel()` | L2508 | 生成宫位面板 HTML |
| `toggleGongWei(name, checked)` | L2521 | 切换宫位勾选 |
| `selectAllGongWei()` | L2532 | 全选宫位 |
| `clearAllGongWei()` | L2538 | 清空宫位 |
| `toggleGzPopover(e)` | L2544 | 切换 Popover |
| `closeGzPopover()` | L2552 | 关闭 Popover |
| `openGzSettings()` | L2570 | 打开宫位设置面板 |
| `closeGzSettings()` | L2577 | 关闭宫位设置面板 |
| `renderGzSettingsList()` | L2583 | 渲染设置列表 |
| `gzDragStart/Over/Leave/Drop/End` | L2635-2655 | 拖拽排序事件 |
| `confirmDeleteGroup(id, name)` | L2660 | 删除确认 |
| `openGzEdit(id)` | L2666 | 打开编辑弹窗 |
| `closeGzEdit()` | L2691 | 关闭编辑弹窗 |
| `checkCloseGzEdit()` | L2696 | 检查关闭 |
| `checkGzEditValid()` | L2701 | 校验编辑表单 |
| `saveGzEdit()` | L2713 | 保存编辑 |
| `openGzTrash()` | L2742 | 打开回收站面板 |
| `backToGzList()` | L2748 | 返回列表视图 |
| `renderGzTrashList()` | L2754 | 渲染回收站列表 |
| `emptyGzTrash()` | L2780 | 清空回收站 |
| `resetGongWeiDefaults()` | L2788 | 恢复默认 |

**初始化**：gongwei.js 加载后立即执行 `gongWeiGroups = loadGroups(); gongWeiTrash = loadTrash(); selectedGongWei = loadSelected(); cleanup selectedGongWei`

---

#### 4. render.js（~1500 行，L2350-L4300）

**命名空间**：`window.RENDER`

| 函数 | 行号（约）| 说明 |
|------|----------|------|
| `fmtDate(y,m,d)` | L2355 | 日期格式化 |
| `pad(n)` | L2357 | 补零 |
| `buildShunLabel(shun, gender, nianGan)` | L2360 | 顺逆排标签 |
| `toggleSimple()` | L2957 | 精简模式（DOM 操作） |
| `buildPillarRows(p, options)` | L2960 | 构建四柱+三垣行数组（核心纯函数） |
| `renderChart(data, twin, targetId)` | L3030 | 单人排盘渲染（注入 DOM） |
| `buildLuckRows(...)` | 多处 (~3400-3600) | 构建大运流年行（在 renderChart 内部 + renderTwinCardsHtml 内部） |
| `buildDiffMap(p1, p2)` | L3700 | 双胞胎差异标记（调 cangGanLayers 对比） |
| `buildCardHTML(data, opts)` | L3720 | 构建单张双胞胎卡片 HTML |
| `renderTwinCardsHtml(data, targetId)` | L3780 | 同卵双胞胎卡片视图 |
| `renderLongFengCardsHtml(d1, d2, targetId)` | L3950 | 龙凤胎卡片视图 |
| `renderTwinPillarPanel()` | L2905 | 分气多选面板 HTML |
| `onTwinPillarChange()` | L2935 | 分气变化回调 |
| `toggleTpPopover(e)` | L2945 | 分气 Popover 切换 |
| `closeTpPopover()` | L2951 | 关闭分气 Popover |
| `selectAllTwinPillars()` | L2956 | 全选分气 |
| `clearAllTwinPillars()` | L2962 | 清空分气 |
| `bindEvents(data, container)` | L3180 | 事件绑定（大运/流年点击） |
| `hiDy(i, scope)` | L3240 | 高亮大运 |
| `hiLn(di, li, scope)` | L3270 | 高亮流年 |
| `updateCardDyLnColumns(container, clickedEl, dyIdx, lnIdx)` | L3290 | 卡片大运流年列更新 |
| `_applyDLUpdates(tableEl, pDy, pLn, isSingle)` | L3320 | 通用大运流年列更新 |
| `scrollToNow(scope)` | L4090 | 滚动定位到今年 |
| `switchTwinMode(tab, mode)` | L4070 | 三模式 tab 切换 |
| `injectCurDaYunLiuNian(data)` | L4080 | 注入当前大运流年信息 |

---

#### 5. archive.js（~600 行，L4300-L4950）

**命名空间**：`window.ARCHIVE`

| 函数/常量 | 行号（约）| 说明 |
|-----------|----------|------|
| `ARCH_KEY` / `TRASH_KEY` 等 | L4300 | localStorage key 常量 |
| `PRESET_ARCHIVES` | L4325 | 16 孩预置数据 |
| `migrateFromV1()` | L4350 | v1→v2 数据迁移 |
| `initPresetArchives()` | L4370 | 初始化预置档案 |
| `getArchives()` | L4400 | 读取档案数组 |
| `saveArchives(arr)` | L4405 | 保存档案 |
| `saveArchivesRaw(arr)` | L4409 | 原始保存 |
| `getTrash()` | L4413 | 读取回收站 |
| `saveTrash(arr)` | L4417 | 保存回收站 |
| `refreshArchiveModalIfOpen()` | L4421 | 刷新弹窗 |
| `getFormData()` | L4427 | 从表单读取数据 |
| `setFormData(d)` | L4445 | 回填表单 |
| `autoSaveArchive()` | L4475 | 自动保存（排盘后触发） |
| `saveArchive()` | L4495 | 手动保存 |
| `loadArchive(idx)` | L4515 | 加载档案并排盘 |
| `moveToTrash(idx)` | L4525 | 软删除：移入回收站 |
| `openEditPanel(idx)` | L4540 | 打开编辑弹窗 |
| `closeEditPanel()` | L4580 | 关闭编辑弹窗 |
| `getEditFormData()` | L4600 | 读取编辑表单 |
| `isBirthFieldChanged(oldData, newData)` | L4625 | 出生字段变更检测 |
| `saveEdit()` | L4635 | 保存编辑 |
| `editCalChange()` | L4720 | 历法切换 |
| `editSolarToggle()` | L4740 | 真太阳时切换 |
| `editProvChange()` | L4750 | 省下拉联动 |
| `editCityChange()` | L4760 | 市下拉联动 |
| `showTrash()` | L4775 | 显示回收站 |
| `hideTrash()` | L4779 | 隐藏回收站 |
| `renderTrash()` | L4783 | 渲染回收站列表 |
| `restoreFromTrash(idx)` | L4810 | 从回收站恢复 |
| `permanentDelete(idx)` | L4830 | 彻底删除 |
| `emptyTrash()` | L4840 | 清空回收站 |
| `_currentBaziResult` | L4850 | 当前排盘结果缓存 |
| `setCurrentBaziResult(data)` | L4853 | 设置当前结果 |
| `getCurrentBaziResult()` | L4857 | 获取当前结果 |
| `extractBaziFromPaipan(p)` | L4870 | 从 paipan 结果提取关键数据 |
| `buildChartDataFromArchive(arch)` | L4890 | 从档案构建 chart 数据 |
| `renderExpandedChart(arch, containerEl)` | L4930 | 渲染档案展开排盘 |
| `renderChartToHtml(data, arch)` | L4940 | 生成只读排盘 HTML |
| `escHtml(s)` | L4990 | HTML 转义 |
| `openArchivePanel()` | L4995 | 打开档案弹窗 |
| `closeArchivePanel()` | L5000 | 关闭档案弹窗 |
| `renderArchiveModal()` | L5005 | 渲染档案列表 |
| `onArchiveSearch(val)` | L5050 | 搜索防抖 |
| `filterArchives(keyword)` | L5055 | 搜索筛选 |
| `loadFromArchive(idx)` | L5100 | 从档案加载并排盘 |

---

#### 6. main.js（~400 行，L1133-L1300 + L4100-L4300 + L4950-L5497）

**命名空间**：`window.APP`

| 函数/变量 | 行号（约）| 说明 |
|-----------|----------|------|
| `calendarType` | L1750 | 当前历法模式 |
| `initLoc()` | L1133 | 初始化省份下拉 + 默认选广西 |
| `onProvChange()` | L1148 | 省份切换联动 |
| `onCityChange()` | L1185 | 城市切换联动 |
| `toggleCalendar(type)` | L1235 | 新历/农历切换 |
| `updateSolarPreview()` | L1255 | 真太阳时实时预览 |
| `getLng()` | L1280 | 获取所选位置经度 |
| `toggleSolar()` | L1310 | 真太阳时勾选切换 |
| `setupTwinTypeChange()` | L1320 | 双胞胎类型切换事件 |
| `doPaipan()` | L4100 | **主入口**：收集输入→调 ALGO.paipan→调 RENDER→调 GONGWEI |
| `parseNaturalInput(text)` | L5250 | AI 自然语言解析 |
| `showAiInput()` | L5235 | 显示 AI 录入弹窗 |
| `hideAiInput()` | L5240 | 隐藏 AI 录入弹窗 |
| `doAiParse()` | L5320 | AI 解析并排盘 |
| `init()` (DOMContentLoaded) | L4295 | 全局初始化 |
| 回归测试（199 条） | L5360 | `?test=1` 时执行 |

**初始化顺序**（main.js 末尾或 DOMContentLoaded 中）：
1. `migrateFromV1()` — 数据迁移
2. `initPresetArchives()` — 预置档案
3. `initGongWeiData()` — 宫位数据加载
4. `refreshArchiveModalIfOpen()` — 刷新弹窗
5. `setupTwinTypeChange()` — 双胞类型事件
6. `doPaipan()` — 默认排盘

---

### 二、模块间依赖拓扑图

```
                ┌─────────────┐
                │ constants.js│  (零依赖)
                │ window.CONST│
                └──────┬──────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │algorithm │ │gongwei.js│ │archive.js│
   │ .js      │ │window.   │ │window.   │
   │window.   │ │GONGWEI   │ │ARCHIVE   │
   │ALGO      │ └────┬─────┘ └────┬─────┘
   └────┬─────┘      │            │
        │            │            │
        ▼            ▼            │
   ┌──────────┐      │            │
   │render.js │◄─────┘            │
   │window.   │                   │
   │RENDER    │                   │
   └────┬─────┘                   │
        │                         │
        ▼                         ▼
   ┌──────────────────────────────────┐
   │           main.js                │
   │          window.APP              │
   │  (依赖全部 5 个模块，唯一入口)      │
   └──────────────────────────────────┘
```

**依赖矩阵**：

| 依赖方 ↓ / 被依赖 → | CONST | ALGO | GONGWEI | RENDER | ARCHIVE | APP |
|---------------------|-------|------|---------|--------|---------|-----|
| **CONST** | — | | | | | |
| **ALGO** | ✅ | — | | | | |
| **GONGWEI** | ✅ | ✅ | — | (loose) | | |
| **RENDER** | ✅ | ✅ | ✅ | — | | |
| **ARCHIVE** | ✅ | | | | — | |
| **APP** | ✅ | ✅ | ✅ | ✅ | ✅ | — |

> **loose 依赖说明**：GONGWEI 对 RENDER 的依赖是"松散"的——updateGongWeiTags() 通过 DOM 选择器（`.chart tr.hd`）定位渲染产出的 DOM 结构，不直接调用 RENDER 的函数。这意味着 gongwei.js 可以在 render.js 之前加载（只要 DOM 中已有 .chart 表格），但为了保证首次排盘后宫位标签行正确渲染，加载顺序仍应 RENDER 在前。

---

### 三、IIFE + window 通信方案细节

每个模块的标准模板：

```javascript
/* 八字排盘 v0.16.0 — algorithm.js */
(function() {
  'use strict';
  
  // ===== 内部辅助函数（不暴露） =====
  function jieCai(gan) { /* ... */ }
  
  // ===== 公开 API =====
  function paipan(name, gender, y, m, d, h, mi) { /* ... */ }
  function shiShen(riGan, gan, short) { /* ... */ }
  // ... 其他公开函数
  
  // ===== 挂载到全局命名空间 =====
  window.ALGO = {
    paipan: paipan,
    shiShen: shiShen,
    zhiShiShen: zhiShiShen,
    wxClass: wxClass,
    changSheng: changSheng,
    nayunChangSheng: nayunChangSheng,
    kongWang: kongWang,
    shenSha: shenSha,
    cangGanLayers: cangGanLayers,
    cangGanText: cangGanText,
    liuNianJZ: liuNianJZ,
    taiYuan: taiYuan,
    mingGong: mingGong,
    shenGong: shenGong,
    dzNum: dzNum,
    numZhi: numZhi,
    renYuanSiLing: renYuanSiLing,
    trueSolarTime: trueSolarTime,
    lunarToSolar: lunarToSolar,
    getSolarTerm: getSolarTerm
  };
})();
```

**跨模块调用示例**（main.js 中）：

```javascript
// 原代码：const p = paipan(name, gender, ey, em, ed, eh, emi);
// 改为：  const p = ALGO.paipan(name, gender, ey, em, ed, eh, emi);

// 原代码：renderChart(data);
// 改为：  RENDER.renderChart(data);

// 原代码：updateGongWeiTags();
// 改为：  GONGWEI.updateTags();
```

**全局变量迁移清单**：

| 原变量 | 迁移方式 | 新访问方式 |
|--------|----------|-----------|
| `window._paipanData` | main.js 中通过闭包持有 | `APP.getPaipanData()` |
| `window._paipanData2` | main.js 中通过闭包持有 | `APP.getPaipanData2()` |
| `window._twinType` | main.js 中通过闭包持有 | `APP.getTwinType()` |
| `window._simpleMode` | main.js 中通过布尔变量 | `APP.isSimpleMode()` |
| `window._getSolarTerm` | 不再需要全局暴露 | `ALGO.getSolarTerm()` |
| `window.ARCHIVE.*` | 通过 ARCHIVE 命名空间 | `ARCHIVE.save(data)` |
| `doPaipan()` (onclick) | HTML 中改为 `APP.doPaipan()` | HTML onclick 属性 |
| `toggleSimple()` (onclick) | HTML 中改为 `RENDER.toggleSimple()` | HTML onclick 属性 |
| `onProvChange()` (onchange) | HTML 中改为 `APP.onProvChange()` | HTML onchange 属性 |
| 所有 HTML onclick/onchange | 统一加命名空间前缀 | — |

**HTML `<script>` 加载顺序（写入 standalone.html `<head>` 或 `<body>` 底部）**：

```html
<!-- 八字排盘 v0.16.0 — 模块加载 -->
<script src="constants.js"></script>   <!-- 无依赖 -->
<script src="algorithm.js"></script>   <!-- → constants.js -->
<script src="archive.js"></script>     <!-- → constants.js (弱依赖) -->
<script src="gongwei.js"></script>     <!-- → constants.js, algorithm.js -->
<script src="render.js"></script>      <!-- → constants.js, algorithm.js, gongwei.js -->
<script src="main.js"></script>        <!-- → 全部 -->
```

**加载顺序理由**：
1. `constants.js` 必须最先——所有模块都依赖它
2. `algorithm.js` 第二——纯计算无 DOM 依赖，gongwei/render/main 都依赖它
3. `archive.js` 可在 algorithm 之后——只依赖 CONST，不依赖 ALGO（archive 存的是表单数据，不存储排盘结果对象）
4. `gongwei.js` 在 render 之前——render.js 调用 GONGWEI.renderPanel() 生成宫位面板 HTML
5. `render.js` 在 main 之前——main 调用 RENDER.renderChart() 等
6. `main.js` 最后——初始化所有事件，触发首次排盘

---

### 四、standalone.html 变更清单

| 变更 | 位置 | 说明 |
|------|------|------|
| 版本注释 | L1-L7 | `v0.13.4` → `v0.16.0` |
| `<script>` 块 | L750-L5497 | **整体移除**，替换为 6 个 `<script src="...">` |
| HTML onclick/onchange | 散落各处 | `doPaipan()` → `APP.doPaipan()`，`onProvChange()` → `APP.onProvChange()` 等 |
| `<style>` 块 | L1-L744 | **不动**（PRD 非目标） |
| `<body>` HTML | L1-L744 | **不动**（仅改 onclick/onchange 属性值） |

---

### 五、风险点与回滚方案

#### 风险矩阵

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| paipan 内部辅助函数作用域断裂 | 🔴 高 | algorithm.js IIFE 内保留所有内部函数；严格对照原代码逐函数迁移，不改名 |
| HTML onclick 属性改名遗漏 | 🔴 高 | 用 grep 列出所有 `onclick=`/`onchange=`，逐条检查 |
| 回归断言 199 条挂载点 | 🟡 中 | 测试代码整体移入 main.js IIFE 内部，断言函数引用 `ALGO.paipan` 替代 `paipan` |
| gongwei.js 依赖 render.js DOM 选择器 | 🟡 中 | 确保选择器 `.chart tr.hd`、`[data-row-type]` 不变；宫位标签行插入逻辑不变 |
| localStorage key 名变更 | 🟢 低 | 所有 key（`bz_gongwei_groups`、`bz_archives_v2` 等）保持不变 |
| 精简模式 `toggleSimple` | 🟢 低 | 函数迁移到 render.js，HTML onclick 改为 `RENDER.toggleSimple()` |
| 循环依赖 | 🟢 低 | 拓扑分析已确认无环（见依赖矩阵） |

#### 回滚方案

1. **Git 分支策略**：在新分支 `feat/module-split` 上开发，main 分支保留 v0.15.0 单体版本
2. **回滚步骤**：如果拆分后回归断言失败 > 0 条：
   - `git checkout main` 恢复单体版本
   - 按失败断言定位出问题的模块，逐模块修复
3. **渐进式拆分**（若风险过高）：先只拆 constants.js + algorithm.js，验证通过后再拆其余 4 个

---

### 六、实现步骤建议（给编程师的路线图）

```
Phase 1: 基础设施（预计 30min）
├── Step 1.1: 创建 6 个空 JS 文件，写入 IIFE 壳 + 版本注释
├── Step 1.2: 修改 standalone.html：将 <script> 内联 JS 替换为 6 个 <script src>
├── Step 1.3: HTML onclick/onchange 属性加命名空间前缀
└── Step 1.4: 此时页面应白屏，但无 JS 报错（所有 IIFE 为空）

Phase 2: 逐模块迁移（预计 2h）
├── Step 2.1: 迁移 constants.js → 验证页面不再报「xxx is not defined」的常量错误
├── Step 2.2: 迁移 algorithm.js → 测试 paipan('测试','男',2000,1,1,12,0) 返回正确对象
├── Step 2.3: 迁移 archive.js → 验证 localStorage 读写正常
├── Step 2.4: 迁移 gongwei.js → 验证 14 宫位面板渲染
├── Step 2.5: 迁移 render.js → 验证单人排盘完整渲染
└── Step 2.6: 迁移 main.js → 验证全流程 + 事件绑定

Phase 3: 回归验证（预计 30min）
├── Step 3.1: ?test=1 199 条断言全绿
├── Step 3.2: 11 孩预置数据排盘结果逐柱对比
├── Step 3.3: 双胞胎并排/龙凤胎三 tab 切换
├── Step 3.4: 精简模式/真太阳时/大运流年交互
└── Step 3.5: 档案新增/编辑/删除/回收站

Phase 4: 收尾（预计 15min）
├── Step 4.1: 删除 standalone.html 中的内联 JS（已替换为引用）
├── Step 4.2: 修正 HTML 头部版本注释 v0.16.0
└── Step 4.3: 提交前自查：6 文件 + 1 HTML = 7 文件
```

**每步验证命令**：
```bash
# 回归测试
open "file:///Users/feng/clacky_workspace/10-开发项目/八字排盘功能/八字排盘·运行/standalone.html?test=1"

# 检查全局命名空间
# 打开浏览器控制台，依次输入：
CONST  // 应返回对象
ALGO   // 应返回对象，含 paipan/shiShen 等
ALGO.paipan('测试','男',2000,1,1,12,0)  // 应返回完整排盘对象
```

---

## 附录：文件大小预估

| 文件 | 预估行数 | 说明 |
|------|---------|------|
| standalone.html | ~750 | HTML + CSS 骨架 + 6 个 script 引用 |
| constants.js | ~450 | 纯数据/常量 |
| algorithm.js | ~1000 | 纯算法 |
| gongwei.js | ~500 | 宫位 UI 逻辑 + 数据层 |
| render.js | ~1500 | 渲染函数 |
| archive.js | ~600 | 档案 CRUD |
| main.js | ~700 | 入口 + 测试 |
| **合计** | **~5500** | 与原单体基本持平（IIFE 壳有少量增量） |
