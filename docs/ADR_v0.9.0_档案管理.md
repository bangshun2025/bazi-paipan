# ADR v0.9.0 — 档案管理架构决策记录

> **版本**：v1.0  
> **日期**：2026-07-21  
> **作者**：架构师（worker_4899a352）  
> **状态**：待评审  
> **关联文档**：PRD_v0.9.0_档案管理.md（产品经理）  
> **基线代码**：standalone-v0.8.1.html（3221行，位于 八字排盘·宫位功能/发布师/）

---

## 一、决策摘要

本 ADR 为 v0.9.0「档案管理」功能的所有关键架构决策提供依据。核心决策：

| # | 决策项 | 选择 | 备选方案 |
|---|--------|------|----------|
| AD-01 | 存储键名策略 | 新建 `bz_archives_v2`，自动迁移旧数据 | 原地升级 `bz_archives` |
| AD-02 | 预置数据注入时机 | 页面加载时，仅在 localStorage 为空时写入 | 构建时嵌入代码常量 |
| AD-03 | 排盘结果存储策略 | 保存时同步计算并存储完整结果 | 仅存参数，展开时实时计算 |
| AD-04 | 档案面板渲染方式 | 纯 DOM 操作，内联展开 | 引入虚拟 DOM |
| AD-05 | 搜索实现 | 实时 `String.includes()` 模糊匹配 | 引入全文搜索索引 |
| AD-06 | 双胞胎处理 | 独立档案，运行时标记关联 | 共享档案 + diff 视图 |
| AD-07 | 代码组织 | 功能模块以注释分隔区块，保持单文件 | 拆分多文件构建 |
| AD-08 | 组件复用 | 复用 `renderChart()` 渲染档案展开排盘 | 独立渲染函数 |

---

## 二、上下文与约束

### 2.1 现状

v0.8.1（3221行）是一个成熟的八字排盘单文件应用，包含：

- **排盘引擎**：`paipan()` 返回完整四柱+三垣+大运+起运+生肖
- **渲染引擎**：`renderChart()` / `buildPillarRows()` / `renderDayun()` 等
- **存档系统**：localStorage 键 `paipan_archives`，存储表单参数，通过 `<select>` 下拉切换
- **UI 模块**：双胞胎卡片、宫位标签（14种）、精简模式、AI 录入、新历/农历切换、真太阳时
- **回归测试**：URL `?test=1` 触发

### 2.2 约束

1. **单文件 HTML**：所有 HTML/CSS/JS 内联，零外部依赖
2. **localStorage 持久化**：同步 API，上限 5MB
3. **向后兼容**：不能破坏现有排盘、双胞胎、AI录入、农历等功能
4. **移动端适配**：需在 375px+ 视口正常工作
5. **代码体积**：新增代码预期 < 500 行，控制文件膨胀

### 2.3 关键观察

- 现有存档系统仅存输入参数，不存计算结果 → 展开排盘时必须改为存结果
- 现有下拉选单 (`archSel`) 适合少量档案，16+ 条时效率低 → 需要卡片列表
- v0.8.1 已引入 `calendarType` / `isLeap` / `lunarMonth` 字段 → 数据迁移需兼容

---

## 三、架构决策

### AD-01：存储键名策略 — 新建 `bz_archives_v2` + 自动迁移

**决策**：新建键名 `bz_archives_v2`（存档）和 `bz_trash_v2`（回收站），首次加载时自动检测并迁移旧 `paipan_archives` 数据。

**理由**：
- 旧版键名 `paipan_archives` 数据结构不兼容（无 `nickname`、`bazi`、`sanyuan`、`extras`、`isPreset`）
- 新建键名确保迁移出错时旧数据不丢失（迁移后保留旧键24小时再清除，给用户回滚窗口）
- 与 PRD 规格一致

**迁移逻辑**：
```
if (localStorage 有 'paipan_archives' 且 无 'bz_archives_v2') {
  读取旧数据 → 补全新字段 → 写入 bz_archives_v2
  同时写入 bz_archives_v1_backup（备份，不清除）
}
if (localStorage 无 'bz_archives_v2' 或 数组为空) {
  写入16条预置数据
}
```

**实现位置**：在 `<script>` 尾部、DOM 初始化之后、`refreshArchList()` 之前执行的一次性迁移函数。

---

### AD-02：预置数据注入时机 — 运行时首次加载

**决策**：预置16孩数据在页面加载时通过 JavaScript 写入 localStorage，而非构建时嵌入为代码常量。

**理由**：
- 预置数据与手动保存的档案在数据模型上完全一致（`isPreset: true` 仅做标记），运行时注入保持统一路径
- 构建时嵌入会混入代码和数据，违反关注点分离；运行时注入使数据可独立更新
- 用户清除 localStorage 后刷新页面可重新获得预置数据

**实现**：
```javascript
const PRESET_ARCHIVES = [ /* 16条，仅含表单参数，不含计算结果 */ ];
function initPresetArchives() {
  const existing = JSON.parse(localStorage.getItem('bz_archives_v2') || '[]');
  if (existing.length === 0) {
    const now = new Date().toISOString();
    const presets = PRESET_ARCHIVES.map(a => ({
      ...a, id: Date.now() + Math.random(), createdAt: now, updatedAt: now,
      isPreset: true, bazi: null, sanyuan: null, extras: null, gongWeiType: null
    }));
    localStorage.setItem('bz_archives_v2', JSON.stringify(presets));
    // 触发首次展开时自动计算并回填 bazi
  }
}
```

**预置数据时辰标注**：原始数据无精确时辰，统一设 `hour: 0, min: 0`。PRD 中已标注此为占位值。未来可补充精确时辰后更新 `PRESET_ARCHIVES` 常量。

---

### AD-03：排盘结果存储策略 — 保存时同步计算

**决策**：`saveArchive()` 时调用 `paipan()` 获取完整结果，与表单参数一并存入 localStorage。

**理由**：
- PRD US4 要求点击卡片展开排盘时「无需重新计算」
- 保存时计算一次，展开时零延迟直接渲染，用户体验最优
- 数据一致性：保存时的计算结果与用户当时看到的排盘结果完全一致
- 额外存储成本可忽略（单条 bazi 结果约 1.5KB）

**存储的 bazi 结果结构**（精简版，仅存渲染所需数据）：
```javascript
{
  bazi: {
    nian: { gan, zhi }, yue: { gan, zhi },
    ri:   { gan, zhi }, shi:  { gan, zhi }
  },
  sanyuan: {
    tai:  { gan, zhi }, ming: { gan, zhi }, shen: { gan, zhi }
  },
  extras: {
    shengXiao: String,
    qiYun: { year, month, day, hour, shun },
    daYun: [{ gan, zhi, startAge, endAge }]
  }
}
```

**展开渲染时的回退机制**：若档案的 `bazi` 为 null（旧迁移数据或预置数据），展开时自动调用 `paipan()` 计算并回填到 localStorage，保证后续展开零延迟。

---

### AD-04：档案面板渲染方式 — 纯 DOM 操作

**决策**：所有卡片列表、搜索过滤、展开/折叠均使用原生 DOM API（`createElement`、`innerHTML`、事件委托），不引入虚拟 DOM 或模板引擎。

**理由**：
- 保持零外部依赖的铁律
- 档案数量 < 100 条，DOM 节点数可控
- 搜索过滤通过 `display: none/block` 切换，避免频繁创建销毁 DOM
- 现有代码库已全量使用原生 DOM 操作，保持一致风格

**性能优化措施**：
- 搜索过滤使用 CSS `display` 而非 innerHTML 重建，减少重排
- 展开排盘使用 `innerHTML` 一次性注入渲染结果（renderChart 返回 HTML 字符串）
- 卡片列表容器使用事件委托（在父容器监听 click），避免每条记录绑定事件

---

### AD-05：搜索实现 — 实时 `String.includes()` 模糊匹配

**决策**：输入事件触发即搜，在 `nickname` + `name` 字段做 `toLowerCase().includes()` 匹配，O(n) 遍历。

**理由**：
- 档案数量 < 100，O(n) 遍历延迟 < 1ms，无感知
- `includes()` 天然支持中文单字/多字匹配，无需分词
- 零依赖，无需引入搜索索引库

**实现细节**：
```javascript
function filterArchives(keyword) {
  const k = keyword.trim().toLowerCase();
  if (!k) return showAll();  // 空关键词显示全部
  archives.forEach((a, i) => {
    const match = a.nickname.toLowerCase().includes(k) ||
                  a.name.toLowerCase().includes(k);
    cardElements[i].style.display = match ? '' : 'none';
  });
}
```

**防抖**：不加防抖。`includes()` 调用极快，且用户期望"输入即搜"的即时反馈感。

---

### AD-06：双胞胎处理 — 独立档案 + 元数据关联

**决策**：双胞胎（子旭/子阳、NONO/KK）各自存储为独立档案，不合并。在 `extras` 中新增可选字段 `twinGroup` 标记关联。

**理由**：
- 双胞胎虽八字相同，但作为独立个体在业务上是不同的人（不同小名、不同姓名）
- 独立档案支持各自独立的操作（加载到表单、展开、删除）
- 现有双胞胎对比功能（`inTwin` 选择器 + 卡片布局）与档案系统互补：用户可从档案面板加载两个档案后在双胞胎模式下对比
- `twinGroup` 字段为未来功能（如「查看双胞胎对」快捷链接）预留扩展点

**实现**：预置数据中，子旭和子阳的 `extras.twinGroup = "子旭子阳"`，NONO 和 KK 的 `extras.twinGroup = "NONOKK"`。当前版本不渲染该字段，仅做数据标记。

---

### AD-07：代码组织 — 注释分隔的功能区块

**决策**：所有新增代码写在 standalone.html 的 `<script>` 标签内，以清晰的注释头分隔为独立区块。不拆分文件。

**推荐代码区块结构**（在现有 `</script>` 之前新增以下区块）：

```
<!-- ===== v0.9.0 档案管理 ===== -->
// 区块 1：数据层 — 常量、迁移、CRUD（~80行）
//   1.1 PRESET_ARCHIVES 常量（16条预置数据）
//   1.2 migrateFromV1() — 旧版数据迁移
//   1.3 initPresetArchives() — 预置数据初始化
//   1.4 getArchives() / saveArchives() — 覆盖旧版（改用新键名）
//   1.5 buildArchiveBazi() — 保存时计算并附加 bazi 结果

// 区块 2：UI层 — 档案面板（~200行）
//   2.1 renderArchivePanel() — 渲染卡片列表 + 搜索框
//   2.2 renderArchiveCard(a) — 单张卡片 HTML 生成
//   2.3 toggleCardExpand(idx) — 展开/折叠手风琴
//   2.4 filterArchives(keyword) — 搜索过滤
//   2.5 loadFromArchive(idx) — 加载到表单

// 区块 3：集成 — 修改现有函数（~30行）
//   3.1 saveArchive() — 增加 bazi 结果保存
//   3.2 autoSaveArchive() — 增加 bazi 结果保存
//   3.3 refreshArchList() — 同步更新下拉选单
```

**总新增代码预估**：~310 行 JavaScript + ~120 行 CSS = ~430 行。

---

### AD-08：组件复用 — 复用 renderChart() 渲染档案展开排盘

**决策**：档案卡片展开的完整排盘，复用现有 `renderChart()` 函数。需要将其改造为可接受「预计算结果」作为参数，跳过 `paipan()` 调用。

**改造方案**：新增工具函数 `renderChartFromArchive(archiveData)`——

```javascript
function renderChartFromArchive(archiveData) {
  // 若 bazi 为空（旧迁移/预置数据），先计算
  if (!archiveData.bazi) {
    const p = paipan(
      archiveData.name, archiveData.gender,
      archiveData.year, archiveData.month, archiveData.day,
      archiveData.hour, archiveData.min
    );
    // 回填并保存
    archiveData.bazi = { /* 提取 p 中的四柱 */ };
    archiveData.sanyuan = { /* 提取 p 中的三垣 */ };
    archiveData.extras = { /* 提取 p 中的 extras */ };
    saveArchivesToStorage();
  }
  // 构造 renderChart 所需的 data 对象（兼容现有接口）
  const data = buildChartDataFromArchive(archiveData);
  return renderChart(data).outerHTML; // 或返回 HTML 字符串直接注入
}
```

**注意**：`renderChart()` 当前直接输出到 DOM（`document.getElementById('output')`），且依赖 `data` 对象中的 `nian`/`yue`/`ri`/`shi`/`tai`/`ming`/`shen` 等字段包含完整解析结果（`wg`、`wz`、`rs`、`ny`、`xy`、`zz`、`kw`、`cg`、`ly`、`sh`）。这些字段由 `pillar()` 内部函数在 `renderChart` 中计算。

**两个子方案**：

**子方案 A（推荐）**：将 `pillar()` 函数提取为模块级函数，档案展开时单独调用 `pillar()` 为每柱生成完整数据，然后传入 `renderChart()`。

**子方案 B**：`renderChart()` 内部已包含 `pillar()` 调用，档案展开时仅需传入最简四柱+三垣数据，`renderChart()` 自动补全解析字段。

**选择子方案 A**，理由：
- 档案中存储的数据量可控（仅存干支，不存解析结果）
- `pillar()` 计算开销极低（几微秒），展开时重新计算不影响体验
- 避免在档案中存储大量派生数据（`wg`、`wz`、`rs`、`ny`、`xy`、`zz`、`kw`、`cg`、`ly`、`sh` 等），减小 localStorage 占用

---

## 四、数据结构设计

### 4.1 档案对象完整 Schema

```typescript
interface Archive {
  // === 标识 ===
  id: number;           // Date.now() 时间戳，唯一标识
  isPreset: boolean;    // 是否预置数据，默认 false

  // === 表单输入参数 ===
  nickname: string;     // 小名（v0.9.0 新增），可为空
  name: string;         // 姓名
  gender: "男" | "女";
  year: number;
  month: number;
  day: number;
  hour: number;         // 0-23
  min: number;          // 0-59
  prov: string;         // 省份，真太阳时用
  city: string;         // 城市
  dist: string;         // 区县
  useSolar: boolean;    // 是否使用真太阳时
  calendarType: "solar" | "lunar";  // v0.8.0 新增
  isLeap: boolean;      // 是否农历闰月
  lunarMonth: number | null;  // 农历月份

  // === 排盘计算结果（v0.9.0 新增） ===
  bazi: {
    nian: { gan: string; zhi: string };
    yue:  { gan: string; zhi: string };
    ri:   { gan: string; zhi: string };
    shi:  { gan: string; zhi: string };
  } | null;

  sanyuan: {
    tai:  { gan: string; zhi: string };
    ming: { gan: string; zhi: string };
    shen: { gan: string; zhi: string };
  } | null;

  extras: {
    shengXiao: string;
    qiYun: { year: number; month: number; day: number; hour: number; shun: boolean };
    daYun: Array<{ gan: string; zhi: string; startAge: number; endAge: number }>;
    twinGroup?: string;  // 双胞胎关联标记，可选
  } | null;

  gongWeiType: string | null;  // 当前选中的宫位类型

  // === 元信息 ===
  createdAt: string;    // ISO 8601 时间戳
  updatedAt: string;    // ISO 8601 时间戳
}
```

### 4.2 localStorage Schema

| 键名 | 类型 | 说明 |
|------|------|------|
| `bz_archives_v2` | `Archive[]` | 主档案列表 |
| `bz_trash_v2` | `Archive[]` | 回收站（元素含 `deletedAt` 字段） |
| `bz_archives_v1_backup` | `Archive[]` (旧格式) | v0.8.x 旧数据备份，迁移后写入，供回滚使用 |
| `paipan_archives` | 旧格式 | v0.8.x 主键，迁移后保留（不主动清除） |
| `paipan_trash` | 旧格式 | v0.8.x 回收站，迁移后保留（不主动清除） |

**迁移后旧键处理**：不主动清除 `paipan_archives` 和 `paipan_trash`，避免误删。用户如需清理需手动清除 localStorage。

### 4.3 预置数据 Schema（仅表单参数）

预置数据的 `bazi`、`sanyuan`、`extras` 均为 `null`，首次展开时自动计算回填。

```javascript
const PRESET_ARCHIVES = [
  {
    nickname: "六一", name: "杨禹赫", gender: "男",
    year: 2021, month: 6, day: 1, hour: 0, min: 0,
    prov: "", city: "", dist: "", useSolar: false,
    calendarType: "solar", isLeap: false, lunarMonth: null
  },
  // ... 其余15条
];
```

---

## 五、UI 组件拆分

### 5.1 组件树

```
Page (现有 .page)
├── InputSection (现有 .input-section) [修改：新增小名字段]
├── OutputArea (现有 #output) [不变]
└── ArchivePanel (新增 #archive-panel)
    ├── ArchiveSearchBar (新增)
    │   └── <input> 搜索框，placeholder="🔍 搜索档案…"
    └── ArchiveCardList (新增 #archive-list)
        └── ArchiveCard[] (新增 .archive-card)
            ├── CardHeader (小名 + 姓名 + 性别图标)
            ├── CardBaziSummary (八字四柱摘要行)
            ├── CardMeta (保存时间)
            ├── CardActions ([加载] [展开 ▼])
            └── CardExpanded (展开区，初始 display:none)
                └── 复用 renderChart() 输出
```

### 5.2 各组件 CSS 类名规划

| 组件 | CSS 类名 | 说明 |
|------|----------|------|
| 档案面板容器 | `#archive-panel` | 位于 #output 下方 |
| 面板标题 | `.archive-panel-title` | "📋 档案" |
| 搜索框 | `#archive-search` | 输入即搜 |
| 卡片列表 | `#archive-list` | 可滚动的卡片容器 |
| 单张卡片 | `.archive-card` | 复用 `--bz-card-bg` 等变量 |
| 小名 | `.archive-nickname` | color: `--bz-nickname` (#8b5e3c) |
| 姓名 | `.archive-name` | color: `--c-ink` |
| 性别图标 | `.archive-gender` | ♂ 蓝色 / ♀ 红色 |
| 八字摘要 | `.archive-bazi-summary` | 四柱一行 |
| 保存时间 | `.archive-meta` | 灰色小字 |
| 操作按钮 | `.archive-btn` | 复用 `.btn-arch` 样式 |
| 展开区 | `.archive-expanded` | 初始 `display:none` |
| 空状态 | `.archive-empty` | 无档案/无搜索结果时显示 |
| 搜索高亮 | `.archive-highlight` | （可选）搜索词高亮 |

### 5.3 HTML 骨架（插入位置）

档案面板插入在 `#output` 之后、`</div>` (page) 之前：

```html
<!-- ===== v0.9.0 档案面板 ===== -->
<div id="archive-panel" style="margin-top:20px; border-top:1px solid var(--c-line); padding-top:16px;">
  <div class="archive-panel-title" style="font-family:var(--font-display);font-size:16px;color:var(--c-ink);margin-bottom:10px;">
    📋 档案 <span id="archive-count" style="font-size:13px;color:var(--c-gray);"></span>
  </div>
  <input type="text" id="archive-search" placeholder="🔍 搜索小名或姓名…"
    style="width:100%;padding:8px 12px;border:1px solid var(--c-line);border-radius:4px;
    font-family:var(--font-body);font-size:14px;margin-bottom:12px;background:var(--c-paper);"
    oninput="filterArchives(this.value)">
  <div id="archive-list"></div>
</div>
```

---

## 六、集成方案

### 6.1 需要修改的现有函数

| 函数 | 修改内容 | 影响范围 |
|------|----------|----------|
| `saveArchive()` | 调用 `paipan()` 获取结果，存入 `bazi`/`sanyuan`/`extras`；使用新键名 | 保存流程 |
| `autoSaveArchive()` | 同上 | 自动保存流程 |
| `getArchives()` | 改用 `bz_archives_v2` 键名；增加回退逻辑（若 bazi 为 null 则不报错） | 所有读取场景 |
| `saveArchives()` | 改用 `bz_archives_v2` 键名 | 所有写入场景 |
| `getTrash()` / `saveTrash()` | 改用 `bz_trash_v2` 键名 | 回收站 |
| `refreshArchList()` | 从 `bz_archives_v2` 读取；同步更新 `#archive-count` | 下拉选单 + 面板 |
| `loadArchive()` | 改用 `bz_archives_v2`；加载后同步滚动到档案面板 | 加载流程 |
| `delArchive()` / `restoreFromTrash()` | 改用新键名 | 删除/恢复流程 |
| `getFormData()` | 新增 `nickname` 字段读取 | 表单序列化 |
| `setFormData()` | 新增 `nickname` 字段回填 | 表单反序列化 |

### 6.2 需要新增的函数

| 函数 | 职责 | 行数预估 |
|------|------|----------|
| `migrateFromV1()` | 检测旧键 → 迁移 → 备份 | 30 |
| `initPresetArchives()` | 首次加载写入预置数据 | 25 |
| `renderArchivePanel()` | 渲染完整卡片列表 | 40 |
| `renderArchiveCard(archive, idx)` | 单张卡片 HTML 生成 | 50 |
| `toggleCardExpand(idx)` | 手风琴展开/折叠 | 25 |
| `filterArchives(keyword)` | 搜索过滤（含空状态） | 15 |
| `loadFromArchive(idx)` | 加载档案到表单 + 排盘 | 10 |
| `buildChartDataFromArchive(archive)` | 从档案构建 renderChart 所需 data | 40 |
| `renderExpandedChart(idx)` | 在展开区渲染排盘 HTML | 30 |

### 6.3 初始化时序

```
DOMContentLoaded
  → migrateFromV1()           // 1. 迁移旧数据
  → initPresetArchives()      // 2. 注入预置数据（如需要）
  → refreshArchList()         // 3. 更新下拉选单
  → renderArchivePanel()      // 4. 渲染档案面板卡片列表
  → [现有初始化逻辑]           // 5. 省份初始化、绑事件等
```

### 6.4 与现有功能的交互矩阵

| 功能 | 交互方式 | 风险评估 |
|------|----------|----------|
| 双胞胎对比 | 无直接交互。档案面板加载后表单回填 → 用户在输入区选择双胞模式 | 低 |
| AI 录入 | AI 录入后自动保存 → 档案面板自动刷新 | 低 |
| 农历录入 | 保存时包含 `calendarType`/`isLeap`/`lunarMonth`，加载时正确回填 | 低 |
| 真太阳时 | 保存时包含 `prov`/`city`/`dist`/`useSolar`，加载时正确回填 | 低 |
| 宫位标签 | 展开排盘时复用 renderChart，宫位标签自动渲染 | 低 |
| 精简模式 | 展开排盘不受精简模式影响（展开区独立渲染） | 低 |
| 回归测试 | 不影响 `?test=1` 模式，无需改动 | 无 |

---

## 七、CSS 设计规范

### 7.1 新增 CSS 变量

```css
:root {
  --bz-nickname: #8b5e3c;    /* 小名暖棕色 */
  --bz-card-hover-shadow: 0 2px 8px rgba(0,0,0,.08), 0 6px 24px rgba(0,0,0,.1);
}
```

### 7.2 档案面板 CSS（~120行）

核心样式规则：

```css
/* 搜索框 */
#archive-search { transition: border-color .2s; }
#archive-search:focus { outline: none; border-color: var(--c-ink); }

/* 卡片列表 */
#archive-list { display: flex; flex-direction: column; gap: 8px; }

/* 单张卡片 */
.archive-card {
  background: var(--bz-card-bg);
  border: 1px solid var(--bz-card-border);
  border-radius: 4px;
  padding: 12px 14px;
  box-shadow: var(--bz-card-shadow);
  transition: box-shadow .15s, border-color .15s;
  cursor: default;
}
.archive-card:hover {
  box-shadow: var(--bz-card-hover-shadow);
  border-color: #d0c8b8;
}

/* 卡片标题行 */
.archive-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.archive-nickname { font-size: 16px; font-weight: 600; color: var(--bz-nickname); }
.archive-name { font-size: 14px; color: var(--c-ink); }
.archive-gender { font-size: 14px; font-weight: 600; }
.archive-gender.male { color: var(--c-water); }
.archive-gender.female { color: var(--c-red); }

/* 八字摘要 */
.archive-bazi-summary {
  font-family: var(--font-display);
  font-size: 13px; color: var(--c-gray);
  margin-bottom: 4px;
}

/* 元信息 */
.archive-meta { font-size: 12px; color: #b0a590; margin-bottom: 8px; }

/* 操作行 */
.archive-actions { display: flex; justify-content: flex-end; gap: 6px; }
.archive-btn { /* 复用 .btn-arch 样式 */ }

/* 展开区 */
.archive-expanded {
  display: none;
  margin-top: 10px;
  background: var(--bz-shared-bg);
  border-top: 1px solid var(--c-line);
  padding: 10px;
  overflow-x: auto;
}
.archive-expanded.show { display: block; }

/* 空状态 */
.archive-empty {
  text-align: center;
  padding: 30px;
  color: var(--c-gray);
  font-size: 14px;
}

/* 移动端 */
@media (max-width: 900px) {
  .archive-card { padding: 10px; }
  .archive-nickname { font-size: 15px; }
}
```

---

## 八、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 旧数据迁移丢失 | 低 | 高 | 迁移前写 `bz_archives_v1_backup` 备份，不清除旧键 |
| 预置数据时辰不准 | 中 | 中 | hour=0 占位标注，用户可手动调整；后期可更新 PRESET_ARCHIVES |
| renderChart 复用复杂度 | 中 | 中 | 子方案A：提取 pillar() 为独立函数，降低耦合 |
| 卡片列表长时滚动性能 | 低 | 低 | 搜索过滤减少可见卡片；100条内 DOM 数量可控 |
| localStorage 容量 | 极低 | 低 | 100条 ≈ 300KB，5MB 上限绰绰有余 |
| 迁移后旧键残留 | 低 | 低 | 不清除旧键（安全策略），用户可手动清理 |

---

## 九、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-21 | 初稿，基于 PRD v1.0 + 基线代码 v0.8.1 编写 |
