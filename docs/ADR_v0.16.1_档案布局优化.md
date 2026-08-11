# ADR：档案弹窗布局优化 — dateStr 精简为仅年份

> Architecture Decision Record — 架构决策记录。
> 版本：v0.16.1 | 日期：2026-08-07 | 作者：架构师(worker_f64cbffc)

---

## 决策

将档案弹窗列表行中的 `dateStr` 从完整日期 `YYYY年MM月DD日 HH:MM` 精简为仅年份 `YYYY年`，释放横向空间以保障名字（小名 / 大名）完整可见。弹窗宽度 420px 保持不变，不改任何 CSS，不改数据结构。

---

## 理由

### 为什么是"缩日期"而非"扩弹窗"

| 维度 | 缩日期（采纳） | 扩弹窗（不采纳） |
|------|---------------|-----------------|
| **改动量** | 3 行 JS（两处 dateStr + standalone.html 同步） | CSS 多处联动（弹窗宽度 + 内部排版 + 响应式断点） |
| **风险面** | 仅影响展示字符串，零 DOM/CSS 变动 | 牵动弹窗容器、搜索栏、按钮区、移动端适配 |
| **回归成本** | 编辑弹窗/排盘表单/数据结构完全不触达 | 需全量验证弹窗在三端（桌面/平板/手机）表现 |
| **用户需求对齐** | 邦顺明确：「中间生日只留年就好」 | 扩宽治标不治本——名字再长仍可能截断 |

**核心裁决依据**：PRD 根因分析表明 dateStr 占用 ~14-16 字符宽度是名字被截断的直接原因。仅保留年份（~5 字符）可释放 ~10 字符宽度，在 420px 弹窗内足以让最长名字组合（如「二哥 / 何沛润」）完整展示。不改 CSS 意味着零布局回归风险，改动面最小。

---

## 代价

1. **信息密度下降**：档案列表不再显示月日时分，用户需打开编辑弹窗或加载排盘才能查看完整出生时间。但档案列表的核心用途是"识别—选择—排盘"，年份+名字足以区分 16 孩预置数据。
2. **同名同年档案辨别力弱**：若存在同年出生且名字相同的两条档案，列表无法区分。此场景在 16 孩预置数据中不存在（每个名字唯一），手动录入场景也极罕见（同一人不会重复建档）。可接受。
3. **未来可能反弹**：若后续用户反馈需要更多日期信息，可通过 hover tooltip 或副行展示月日来恢复——但此 ADR 不做预设计。

---

## 备选方案

| 方案 | 优点 | 为什么不选 |
|------|------|-----------|
| **A. 扩大弹窗宽度**（如 max-width: 560px） | 信息不丢失 | CSS 多处联动，回归成本高；移动端 90vw 已占满屏幕，扩 max-width 无意义；名字再长仍可能截断 |
| **B. 名字+日期分行**（两行布局） | 信息不丢失 | 行高翻倍，列表容量减半（480px 弹窗约从 10 行→5 行）；涉及 CSS 重构 |
| **C. dateStr 保留月日、去掉时分**（如 `2021年8月7日`） | 折中方案 | 仅节省 ~4 字符，名字截断问题改善有限；邦顺明确要求「只留年就好」 |
| **D. 操作按钮收折**（图标化或更多菜单） | 释放按钮区空间 | 操作按钮非截断根因；图标化降低可发现性；三个操作都高频使用 |

---

## 实现要点

### 目标文件信息

| 文件 | 版本 | 修改类型 | 修改行号 | 说明 |
|------|------|----------|----------|------|
| `运行/archive.js` | v0.16.0→v0.16.1 | 修改 | L739 | `renderArchiveModal()` 中 dateStr 精简为 `a.year + '年'` |
| `运行/archive.js` | v0.16.0→v0.16.1 | 修改 | L794 | `filterArchives()` 中 dateStr 同步精简 |
| `运行/standalone.html` | v0.16.0→v0.16.1 | 修改 | L4942 | 内联版 dateStr 同步精简（与 archive.js 保持一致） |
| `运行/standalone-split.html` | v0.16.0→v0.16.1 | 不变 | — | CSS 无需修改；`<script src="archive.js">` 自动加载最新逻辑 |
| `运行/docs/SYSTEM.md` | v0.16.0→v0.16.1 | 更新 | 版本表 | 新增 v0.16.1 条目 |
| `运行/docs/ARCHITECTURE.md` | v0.16.0→v0.16.1 | 不变 | — | 本次改动不涉及架构决策变更，仅展示层微调 |

### 具体变更内容

#### 1. archive.js L739 — `renderArchiveModal()` 中 dateStr 行

```diff
-    var dateStr = a.year + '年' + a.month + '月' + a.day + '日 ' + pad(a.hour) + ':' + pad(a.min || 0);
+    var dateStr = a.year + '年';
```

#### 2. archive.js L794 — `filterArchives()` 中 dateStr 行

```diff
-    var dateStr = a.year + '年' + a.month + '月' + a.day + '日 ' + pad(a.hour) + ':' + pad(a.min || 0);
+    var dateStr = a.year + '年';
```

#### 3. standalone.html L4942 — 内联版同步

```diff
-    var dateStr = a.year + '年' + a.month + '月' + a.day + '日 ' + pad(a.hour) + ':' + pad(a.min || 0);
+    var dateStr = a.year + '年';
```

### 不改动项（明确排除）

| 排除项 | 理由 |
|--------|------|
| `.archive-row-date` CSS | 现有 `font-size:12px; white-space:nowrap` 对短文本完全适用 |
| `.archive-modal` max-width | 保持 420px |
| 编辑弹窗（edit-dialog） | 独立表单，日期字段完整展示年月日时分 |
| 数据结构（archive 对象） | `year/month/day/hour/min` 字段全部保留 |
| `ARCHIVE.loadFromArchive()` / `setFormData()` | 排盘表单回填走原始数据，不受 dateStr 影响 |
| 其他 JS 模块（constants / algorithm / gongwei / render / main） | 不涉及 |

---

## 影响评估

### 受影响模块

| 模块 | 是否受影响 | 说明 |
|------|-----------|------|
| archive.js | ✅ 是 | 两处 dateStr 精简（L739 + L794） |
| standalone-split.html | ✅ 是（间接） | 通过 `<script src="archive.js">` 自动获取变更 |
| standalone.html | ✅ 是 | 内联版需同步修改 L4942 |
| algorithm.js | ❌ 否 | 排盘算法不涉及 |
| render.js | ❌ 否 | 渲染逻辑不涉及 |
| gongwei.js | ❌ 否 | 宫位模块不涉及 |
| main.js | ❌ 否 | 入口逻辑不涉及 |
| constants.js | ❌ 否 | 常量表不涉及 |

### 回归风险

| 风险点 | 等级 | 说明 |
|--------|------|------|
| 搜索行与列表行不一致 | 🟢 低 | 两处 dateStr 同步修改（L739+L794），格式天然一致 |
| 编辑弹窗受影响 | 🟢 低 | 编辑弹窗直接读写 archive 对象字段，不引用 dateStr |
| 排盘结果受影响 | 🟢 低 | `loadFromArchive()` → `setFormData()` 用原始 year/month/day/hour/min，排盘输入不变 |
| 16孩预置数据 | 🟢 低 | 仅列表展示变化，预置数据完整保留 |
| standalone.html 漏同步 | 🟡 中 | 需手动同步 L4942，或通过 `build_modules.py` 内联重建 |

---

## 附录：验证 checklist

- [ ] `renderArchiveModal()` 列表行仅显示 `YYYY年`
- [ ] `filterArchives()` 搜索结果行仅显示 `YYYY年`（格式一致）
- [ ] 「二哥 / 何沛润」等最长名字组合完整可见，无省略号截断
- [ ] 编辑弹窗中年月日时分字段完整可编辑
- [ ] 点击「排盘」后表单回填完整，排盘结果不变
- [ ] `?test=1` 199 条回归断言全绿（与排盘无关，但应跑一遍）
- [ ] standalone.html 内联版与 standalone-split.html 行为一致
