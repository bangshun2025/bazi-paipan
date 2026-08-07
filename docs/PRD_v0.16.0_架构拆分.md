# PRD：P2 架构升级 — 单体 HTML 拆分为 6 JS 模块

## 需求背景

standalone.html 当前 v0.15.0（5497 行），自 v0.2.0 起持续在一个文件中迭代，已形成严重的维护瓶颈：

- **改一处牵动全身**：CSS 样式、模板字符串、算法逻辑、事件绑定混在一起，无隔离边界
- **新功能无处插脚**：想在已有功能之间插入新逻辑，只能在大段代码中小心穿插
- **调试定位困难**：5497 行的单体脚本，报错堆栈只能定位到 `standalone.html` 的行号，没有模块名辅助定位
- **多人协作不可能**：任何改动都意味着改同一个文件，Git diff 极易冲突

拆分目标是：**在保持 100% 功能不变 + 199 条回归断言全绿的前提下**，将 JavaScript 逻辑拆分为 6 个独立模块文件，HTML 仅保留结构骨架和模块引用。

---

## AC 验收条件

- [ ] AC1: standalone.html 去掉 `<script>` 内联 JS，改为 6 个 `<script src="...">` 引用
- [ ] AC2: `?test=1` 199 条回归断言全部通过（全绿），且测试页面正常渲染
- [ ] AC3: 11 孩预置数据排盘结果不变（年/月/日/时/命/身/胎七柱对比）
- [ ] AC4: 双胞胎并排对比模式（同卵/龙凤胎）三 tab 切换正常，差异高亮不丢失
- [ ] AC5: 大运流年共享区、大运导航 pill 点击切换、流年点击展开均正常
- [ ] AC6: 精简模式（「简」按钮）正常隐藏纳音/空亡/神煞行
- [ ] AC7: 14 宫位面板拖拽排序后，排盘标签行与 Popover 联动正常
- [ ] AC8: 档案管理（新增/编辑/删除/回收站）功能完整可用，localStorage 读写正常
- [ ] AC9: 真太阳时选择（省份→城市→区县三级联动）正常
- [ ] AC10: AI 录入弹窗正常解析
- [ ] AC11: 移动端（≤900px 宽度）无横向溢出，响应式布局不崩
- [ ] AC12: 模块循环依赖为零（可通过拓扑分析验证）

---

## 影响范围

### 代码段（对照 5497 行 standalone.html）

| 区域 | 行号（约） | 代码段 | 影响类型 | 说明 |
|------|-----------|--------|----------|------|
| HTML 结构 | 1-744 | `<head>` / `<body>` / `<script>` | 修改 | 去掉内联 JS，改为模块引用 |
| 命理常数 | 751-1147 | LOC_DATA / GAN / ZHI / NAYIN / CANG_GAN 等 | 迁移 | 抽取到 constants.js |
| 排盘算法 | ~1300-2300 | paipan / shiShen / wxClass / changSheng / kongWang / shenSha / liuNianJZ 等 | 迁移 | 抽取到 algorithm.js |
| 渲染逻辑 | ~2600-4300 | buildPillarRows / renderChart / renderTwinCardsHtml / renderLongFengCardsHtml / renderLuckRows / buildDiffMap | 迁移 | 抽取到 render.js |
| 宫位面板 | 散落多处 | 14 宫位 Popover / 拖拽排序 / 标签行联动 | 迁移 | 抽取到 gongwei.js |
| 档案管理 | 散落多处 | archives 数组 / CRUD / 回收站 / 编辑弹窗 / localStorage | 迁移 | 抽取到 archive.js |
| 入口/主线 | 散落多处 | 事件绑定 / initLoc / onProvChange / onPaipan / toggleSimple / AI 录入 / 测试断言 | 迁移 | 重构到 main.js |
| CSS 样式 | 1-744 | 全部 `<style>` 块 | **不动** | 本次不拆 CSS（见非目标） |
| 版本注释 | 1-7 | HTML 注释标注 v0.13.4（滞后） | 修正 | 统一为 v0.16.0 |

### 受影响的已有功能

| 已有功能 | 影响方式 | 风险等级 |
|----------|----------|----------|
| 排盘计算 | paipan 函数迁移到 algorithm.js，调用方需改为模块引用 | 高 |
| 双胞胎卡片 | renderTwinCardsHtml / renderLongFengCardsHtml 迁入 render.js，依赖 algorithm.js 和 gongwei.js | 高 |
| 14 宫位面板 | 宫位渲染/标签行/Popover/拖拽全部迁入 gongwei.js，需向 render.js 暴露接口 | 中 |
| 档案管理 | 全部迁入 archive.js，需向 main.js 暴露 init/populate/save 等入口 | 中 |
| 精简模式 | toggleSimple 仍在 main.js，但依赖 render.js 产出的 DOM 结构 | 低 |
| 真太阳时 | LOC_DATA 迁入 constants.js，onProvChange 由 main.js 调用 | 低 |
| AI 录入 | 仍在 main.js，依赖 algorithm.js 的 paipan | 低 |
| 回归测试 | 199 条断言在 main.js 尾部，需确保所有被引函数已正确导出 | 高 |

---

## 6 模块职责边界

```
standalone.html
├── constants.js   — 命理常数与静态数据
├── algorithm.js   — 纯排盘算法（无 DOM 依赖）
├── gongwei.js     — 14 宫位 UI 逻辑
├── render.js      — 排盘结果视图渲染
├── archive.js     — 档案数据管理
└── main.js        — 入口 / 事件绑定 / 测试断言
```

### 1. constants.js（~400 行）

**职责**：所有不随输入变化的静态数据。

| 内容 | 说明 |
|------|------|
| `LOC_DATA` | 中国省市县经度数据（真太阳时用） |
| `TG` / `DZ` | 十天干 / 十二地支数组 |
| `WU_XING` | 五行映射表 |
| `NAYIN` | 60 甲子纳音映射表 |
| `CANG_GAN` | 地支藏干表 |
| `SHEN_SHA_RULES` | 神煞计算规则 |
| `NAYIN_CHANG_SHENG` | 纳音五行长生表 |
| `CHANG_SHENG_ORDER` | 五行长生顺序表（寅申巳亥 4 起点） |
| `SS_FULL` / `SS_ABBR` | 十神全称/缩写映射 |

**依赖**：无外部依赖，纯数据模块。

**不包含**：
- province/city/district 初始化逻辑（那是 main.js 的事）
- 任何 DOM 操作

---

### 2. algorithm.js（~1000 行）

**职责**：纯排盘计算函数，输入时间/地点，输出完整的八字数据结构。**零 DOM 依赖。**

| 函数 | 说明 |
|------|------|
| `paipan(name, gender, y, m, d, h, mi, prov, city, dist)` | 主入口：返回完整排盘结果（含四柱/三垣/大运/流年/起运/真太阳时） |
| `shiShen(riGan, gan, isFull)` | 十神计算 |
| `zhiShiShen(riGan, zhi)` | 地支藏干本气十神 |
| `wxClass(gan)` | 五行 CSS class（木火土金水） |
| `changSheng(gan, zhi)` | 十二长生（干在支的状态） |
| `nayunChangSheng(nayinWuXing, yueZhi)` | 纳运长生 |
| `kongWang(gan, zhi)` | 空亡 |
| `shenSha(riGan, riZhi, nianZhi, yueZhi)` | 神煞 |
| `cangGanLayers(zhi, riGan, twin, pillarType)` | 藏干三层（含双胞胎差异） |
| `cangGanText(zhi, riGan, twin, pillarType)` | 藏干格式化文本 |
| `liuNianJZ(year)` | 流年干支 |
| `qiYunCalculate(...)` | 起运计算 |
| `trueSolarAdjust(...)` | 真太阳时调整 |
| 日柱计算相关辅助函数 | 公历转农历 / 节气查找等 |

**依赖**：仅依赖 `constants.js`。

**不包含**：
- 任何 DOM 操作 / innerHTML
- 档案读写
- 事件处理

---

### 3. gongwei.js（~500 行）

**职责**：14 宫位的 UI 逻辑——面板渲染、标签行生成、Popover、拖拽排序。

| 内容 | 说明 |
|------|------|
| `renderGongWeiPanel()` | 宫位选择面板 HTML |
| `renderGongWeiTagRow(data)` | 根据当前选择生成排盘标签行 |
| `renderGongWeiPopover(data, palaceName)` | 单个宫位的 Popover 内容（含解读） |
| `initGongWeiDrag()` | 拖拽排序事件绑定 |
| `onGongWeiChange()` | 宫位勾选/排序变化时触发重渲染 |
| `getSelectedGongWei()` | 获取当前选中宫位列表 |
| 14 宫位配置常量 | 宫位名称/颜色/描述 |

**依赖**：依赖 `algorithm.js`（藏干/十神数据），`render.js`（buildPillarRows 返回的 DOM 结构做联动）。

**不包含**：
- 排盘计算
- 档案管理
- 大运流年渲染

---

### 4. render.js（~1500 行）

**职责**：将排盘数据渲染为 HTML 字符串。**不操作 DOM，只生成字符串。**

| 函数 | 说明 |
|------|------|
| `buildPillarRows(p, options)` | 构建四柱+三垣行（返回 {main, sanyuan}），支持 diffMap 差异高亮 |
| `buildDiffMap(p1, p2)` | 比较两组排盘数据，生成差异标记 |
| `buildLuckRows(data, curDyIdx, nowYear)` | 构建大运/流年行 |
| `renderChart(data, twin, targetId)` | 渲染单人排盘视图（注入 DOM） |
| `renderTwinCardsHtml(data, targetId)` | 同卵双胞胎卡片式视图（调用 buildPillarRows + buildLuckRows） |
| `renderLongFengCardsHtml(d1, d2, targetId)` | 龙凤胎卡片式视图 |
| `renderPersonCard(data, twin, cardClass)` | 单张人物卡片 |
| `renderSharedLuckSection(data, targetId)` | 共享大运流年区 |
| `bindEvents(data, container)` | 绑定点击事件（流年/大运导航/宫位 Popover） |
| `scrollToNow(container)` | 定位到当前年份 |
| `switchTwinMode(btn, mode)` | 三模式 tab 切换 |

**依赖**：依赖 `algorithm.js`、`gongwei.js`、`constants.js`。

**不包含**：
- 排盘计算逻辑
- 档案读写
- 表单事件绑定（那是 main.js 的职责）

---

### 5. archive.js（~600 行）

**职责**：档案数据的完整生命周期管理。

| 内容 | 说明 |
|------|------|
| `archiveData` / `archiveState` | 档案数组与状态 |
| `initArchive()` | 从 localStorage 载入，合并预置数据 |
| `saveArchive()` | 保存到 localStorage |
| `addToArchive(data, groupName)` | 新增档案条目 |
| `editArchive(id, fields)` | 编辑档案 |
| `moveToTrash(id)` | 移入回收站 |
| `restoreFromTrash(id)` | 从回收站恢复 |
| `deletePermanently(id)` | 永久删除 |
| `renderArchivePanel()` | 档案面板 HTML |
| `renderEditModal()` | 编辑弹窗 HTML |
| `bindArchiveEvents()` | 档案相关事件绑定 |

**依赖**：仅依赖 `constants.js`（不需要排盘算法，档案只是存数据）。

**不包含**：
- 排盘计算（档案调用者通过 main.js 的排盘按钮触发 paipan，然后把结果传入 archive）
- 渲染排盘表（那是 render.js 的职责）

---

### 6. main.js（~400 行）

**职责**：应用的入口，将所有模块串起来。

| 内容 | 说明 |
|------|------|
| `initLoc()` | 初始化省份下拉 |
| `onProvChange()` / `onCityChange()` | 省市联动 |
| `onPaipan()` | 排盘按钮主流程：收集输入 → 调用 algorithm.paipan → 判断双胞胎模式 → 调用 render → 调用 gongwei 更新标签行 |
| `toggleSimple()` | 精简模式切换 |
| `onAIAnalyze()` | AI 录入弹窗 |
| `onSaveArchive()` | 保存到档案（调用 archive.js） |
| `init()` | 全局初始化：绑定所有事件、初始化档案、默认触发一次排盘 |
| 回归测试（199 条） | 在 `?test=1` 时执行，依赖 algorithm.js 的 paipan |

**依赖**：依赖所有其他 5 个模块，是唯一有"上帝视角"的模块。

**不包含**：
- 任何算法实现
- 渲染 HTML 字符串生成
- 档案数据逻辑
- 宫位 UI 逻辑

---

## 非目标（明确不做）

- **CSS 拆分**：`<style>` 块约 744 行，保持内联在 standalone.html 中。CSS 改名/重组/模块化留给后续版本。
- **HTML 模板引擎引入**：不引入任何模板引擎或框架（Handlebars/EJS/Vue 等），保持零外部依赖。
- **构建工具引入**：不做 webpack/rollup/esbuild 打包，6 个 JS 文件在 HTML 中用 `<script src="...">` 直接引入（注意依赖顺序）。
- **TypeScript 迁移**：保持纯 JavaScript（ES5 兼容语法，不要求 ES6 import/export——各模块用 IIFE + 全局命名空间暴露接口）。
- **功能新增/变更**：本次只做等价拆分，不新增功能、不修改任何业务逻辑。
- **性能优化**：拆分本身可能导致多几个 HTTP 请求，但在本地部署场景下可忽略。不做代码层面性能优化。
- **版本号更新范围**：仅修正 HTML 注释中的版本号（v0.13.4 → v0.16.0），不追溯修改所有历史注释。

---

## 测试要点

### 边界 case

- 不同省份/城市经度数据 → 真太阳时计算结果不变
- 跨年/跨月出生 → paipan 结果不变
- 子时（23:00-00:59）→ 日柱计算不变（已有 "子时按次日" 逻辑）
- 空标签（七柱标签缺值）→ 不报错，正常显示
- 龙凤胎模式 → 同一时间两份性别不同的结果

### 回归风险点（按风险从高到低）

1. **paipan 相关函数被拆到 algorithm.js 后作用域变化**：所有内部辅助函数（如节气查找、农历转公历）必须正确暴露或在 module 内可见
2. **render.js 中大量模板字符串直接拼接 HTML**：拆模块后 CSS class 名引用（如 `.bz-twin-cards`）必须保持一致
3. **archive.js 的 localStorage 读写**：key 名不变，数据结构序列化/反序列化逻辑不变
4. **gongwei.js 依赖 render.js 产出的 DOM 结构**：宫位标签行与 Popover 的联动靠 DOM 选择器（如 `data-row-type`），拆模块后选择器不能变
5. **main.js 的全局变量（如 `window._paipanData`）**：拆模块后这些跨模块通信的变量必须保留
6. **回归断言直接挂在 main.js 尾部**：断言中引用的 `paipan` 等函数必须能在 test 执行时正确访问

---

## 模块间通信约定

由于不引入 ES module 或打包工具，各模块通过以下方式暴露和引用：

```
// 每个模块用 IIFE 包裹，向 window 挂载一个命名空间对象
// 例：algorithm.js
(function() {
  var ALGO = {};
  ALGO.paipan = function(...) { ... };
  ALGO.shiShen = function(...) { ... };
  // ... 内部辅助函数不暴露
  window.ALGO = ALGO;
})();
```

| 命名空间 | 对应模块 | 暴露的公开 API |
|----------|----------|---------------|
| `window.CONST` | constants.js | `LOC_DATA`, `TG`, `DZ`, `WU_XING`, `NAYIN`, `CANG_GAN`, `NAYIN_CHANG_SHENG`, `CHANG_SHENG_ORDER`, `SS_FULL`, `SS_ABBR` |
| `window.ALGO` | algorithm.js | `paipan`, `shiShen`, `zhiShiShen`, `wxClass`, `changSheng`, `nayunChangSheng`, `kongWang`, `shenSha`, `cangGanLayers`, `cangGanText`, `liuNianJZ` |
| `window.GONGWEI` | gongwei.js | `renderPanel`, `renderTagRow`, `renderPopover`, `initDrag`, `getSelected` |
| `window.RENDER` | render.js | `renderChart`, `renderTwinCardsHtml`, `renderLongFengCardsHtml`, `buildPillarRows`, `buildDiffMap`, `bindEvents`, `switchTwinMode`, `scrollToNow` |
| `window.ARCHIVE` | archive.js | `init`, `save`, `add`, `edit`, `moveToTrash`, `restore`, `deletePermanently`, `renderPanel`, `bindEvents` |
| `window.APP` | main.js | `init`, `onPaipan`, `toggleSimple`, `onProvChange` |

### script 加载顺序（依赖拓扑）

```html
<script src="constants.js"></script>   <!-- 无依赖 -->
<script src="algorithm.js"></script>   <!-- → constants.js -->
<script src="gongwei.js"></script>     <!-- → algorithm.js, render.js (loose) -->
<script src="render.js"></script>      <!-- → algorithm.js, gongwei.js -->
<script src="archive.js"></script>     <!-- → 无强依赖 -->
<script src="main.js"></script>        <!-- → 全部 -->
```

---

## 版本号处理

- standalone.html 头部注释版本号从 `v0.13.4` 修正为 `v0.16.0`
- 版本标记：`<!-- 八字排盘 · 从真版 v0.16.0 | 2026-08-06 -->`
- 各 JS 模块文件头部标注：`/* 八字排盘 v0.16.0 — constants.js */`

---

## 附录：当前文件大小估算

| 来源 | 行数（约） | 说明 |
|------|-----------|------|
| standalone.html（总） | 5497 | |
| ─ HTML + CSS | 744 | 保留在 standalone.html |
| ─ LOC_DATA | 397 | → constants.js |
| ─ 其他常数 | ~50 | → constants.js |
| ─ 排盘算法 | ~1000 | → algorithm.js |
| ─ 渲染逻辑 | ~1500 | → render.js |
| ─ 宫位逻辑 | ~500 | → gongwei.js |
| ─ 档案管理 | ~600 | → archive.js |
| ─ 入口/事件/测试 | ~700 | → main.js |
| standalone.html 剩余 | ~744 | 只有 HTML + CSS，不含 JS |
