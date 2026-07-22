# ADR — 档案弹窗搜索稳定性

> **版本**：v1.0  
> **日期**：2026-07-22  
> **作者**：架构师（worker_4899a352）  
> **状态**：已评审，建议通过  
> **关联文档**：PRD_档案弹窗搜索稳定性.md（产品经理）  
> **基线代码**：standalone.html v0.9.0（3616行，`~/.clacky/ext/local/bazi-paipan/`）

---

## 一、决策摘要

| 决策项 | 结论 | 优先级 |
|--------|------|--------|
| CSS 修复路线 | **同意**，方案正确且最小化 | P0 |
| 3 处 CSS 修改 | 通过，含 1 处补充 | P0 |
| 搜索防抖 150ms | 建议采纳，列为 P1 | P1 |
| 对其它模块影响 | **零影响**，已逐一验证 | — |

---

## 二、方案评审

### 2.1 根因分析 — 准确

PRD 的三层分析（高度不稳定 → 空状态塌陷 → oninput 逐字触发）完全吻合实际代码：

```
当前 CSS（v0.9.0 实际代码，第 251 行）：
.archive-modal {
  max-height: 80vh;        ← 仅上限，无固定高度
  display: flex;
  flex-direction: column;
}

.archive-modal-list {
  flex: 1;                 ← 在无高度容器中，flex:1 只能分配"多余"空间
  overflow-y: auto;
  /* 缺少 min-height: 0 */  ← flex 默认 min-height:auto 阻止收缩
}
```

浏览器布局流程：`archive-overlay`（flex 居中）→ `.archive-modal`（由内容撑高）→ flex 子元素按内容需求分配高度。搜索减少条目后，`.archive-modal-list` 内容高度骤降，但 `min-height: auto`（flex 默认值）阻止其缩到小于新内容高度 → 弹窗整体变矮。

### 2.2 CSS 修复方案 — 通过，含 1 处补充

逐条验证：

#### ✅ 改动 1：`.archive-modal` 加 `height: 480px`

```diff
 .archive-modal {
+  height: 480px;
   max-height: 80vh;       /* 保留：小屏幕兜底 */
   ...
 }
```

**验证**：
- 与现有 `max-height: 80vh` 不冲突：当 80vh < 480px 时自动降级（iPhone SE: 80vh=533px > 480，使用480；320×480设备: 80vh=384px < 480，使用384）
- 弹窗 header + search 区域实际占用约 108px（header: 52px 含 padding+border；search: 56px 含 padding+border），列表区可用高度 = 480 - 108 = **372px**
- 每行档案约 46px，372px 可展示 **8 行**，滚动体验合理

#### ✅ 改动 2：`.archive-modal-list` 加 `min-height: 0`

```diff
 .archive-modal-list {
   flex: 1;
   overflow-y: auto;
+  min-height: 0;
   padding: 4px 0;
 }
```

**验证**：CSS Flexbox 规范中，flex 子元素默认 `min-height: auto` = 内容最小高度。不加 `min-height: 0`，列表区无法收缩到小于内容高度，`overflow-y: auto` 不生效。这是该修复最关键的 1 行。

#### ⚠️ 改动 3：`.archive-modal-empty` 改为 flex 居中 — 通过，需补充 `box-sizing` 确认

PRD 提议：
```css
.archive-modal-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 40px 20px;
  color: var(--c-gray);
  font-size: 14px;
}
```

**验证**：
- `height: 100%` + `display: flex` + `align-items: center` → 文本垂直居中，视觉效果优于当前固定 padding 方案
- `min-height: 200px` 保底：当列表区高度较小时（极小屏幕）保证空状态有足够视觉空间
- 全局已设置 `* { box-sizing: border-box; }`（第18行），`height: 100%` 包含 padding，不会溢出 ✅

**补充建议**：PRD 中未提及是否需要移除原有 `padding: 40px 20px`。保持 `padding` 不变即可（与 flex 居中配合，padding 提供呼吸空间，flex 居中保证文本在剩余空间内居中）。

### 2.3 搜索防抖 — 建议采纳，P1

PRD 提供的防抖方案：
```javascript
var _filterTimer = null;
function onArchiveSearch(val) {
  clearTimeout(_filterTimer);
  _filterTimer = setTimeout(function() {
    filterArchives(val);
  }, 150);
}
```

**分析**：CSS 修复后，弹窗高度已锁定，逐字渲染不再引起弹窗抖动。但防抖仍有价值：
- 减少 DOM 重绘次数（输入"子旭"从 2 次重绘降为 1 次）
- 中文输入法（IME）组合输入过程中避免中间态渲染
- 16 条数据虽不构成性能瓶颈，但作为良好实践值得保留

**建议**：P1 采纳。HTML 侧 `oninput="filterArchives(this.value)"` 改为 `oninput="onArchiveSearch(this.value)"`。

---

## 三、影响范围交叉验证

### 3.1 AI 录入弹窗（`.ai-overlay`） — 零影响

```css
/* 第 36-37 行 */
.ai-overlay { display:none; position:fixed; ...; z-index:999; }
.ai-overlay.show { display:flex; }
```

`ai-overlay` 使用独立的 CSS 类和完全不同的布局策略（`justify-content:center; align-items:center`），与 `archive-overlay` / `archive-modal` 无任何 CSS 选择器交叉。**零影响**。

### 3.2 回收站功能 — 零影响

v0.9.0 代码中的回收站逻辑通过独立的 `delArchive()` / `restoreFromTrash()` 函数操作 `bz_trash_v2` 键。当前版本未有独立的回收站弹窗（可能为后续版本预留），即使未来新增回收站弹窗，也应在新的 CSS 类名下实现。**零影响**。

### 3.3 移动端 — 行为一致

```css
.archive-modal {
  height: 480px;
  max-height: 80vh;   /* 小屏幕降级 */
}
```

| 设备 | 视口高度 | 80vh | 实际弹窗高度 | 列表区可用 | 结论 |
|------|----------|------|-------------|-----------|------|
| iPhone 14 Pro Max | 932px | 746px | 480px | 372px | ✅ |
| iPhone 14 | 844px | 675px | 480px | 372px | ✅ |
| iPhone SE 2022 | 667px | 533px | 480px | 372px | ✅ |
| iPhone SE 2016 | 568px | 454px | 454px | 346px | ✅ |
| 极小设备 | 480px | 384px | 384px | 276px | ✅ 仍可用 |

`max-height: 80vh` 在极小屏幕触发，弹窗顶部仍有约 48px 呼吸空间（(480-384)/2），不会贴边。

当前 `@media (max-width:900px)` 块中无 archive-modal 专属覆写 → 弹窗宽度由 `width:90%; max-width:420px` 控制，移动端自适应良好。

### 3.4 主排盘页面 — 零影响

档案弹窗使用 `position:fixed` + `z-index:999`，完全脱离文档流，不影响主页面布局。

---

## 四、实现规格（最终版 CSS）

```css
/* ===== v0.9.1 档案弹窗搜索稳定性修复 ===== */

/* 修改 1：.archive-modal — 固定高度 */
.archive-modal {
  /* ... 现有属性保持不变 ... */
  height: 480px;           /* 新增：固定弹窗高度 */
  max-height: 80vh;        /* 保留：小屏幕兜底 */
  min-height: 360px;       /* 新增：极小屏幕保底（PRD 建议） */
  /* 以下不变：width, max-width, display:flex, flex-direction:column 等 */
}

/* 修改 2：.archive-modal-list — 允许收缩 */
.archive-modal-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;           /* 新增：解除 flex 默认 min-height:auto */
  padding: 4px 0;          /* 不变 */
}

/* 修改 3：.archive-modal-empty — 撑满列表区 */
.archive-modal-empty {
  display: flex;           /* 改为 flex */
  align-items: center;     /* 新增：垂直居中 */
  justify-content: center; /* 新增：水平居中 */
  height: 100%;            /* 新增：撑满父容器 */
  min-height: 200px;       /* 新增：极小屏幕保底 */
  text-align: center;      /* 保留 */
  padding: 40px 20px;      /* 保留（box-sizing:border-box 下安全） */
  color: var(--c-gray);    /* 保留 */
  font-size: 14px;         /* 保留 */
}

/* 修改 4（可选 P1）：搜索防抖 JS */
/* HTML: oninput="filterArchives(this.value)" → oninput="onArchiveSearch(this.value)" */
```

---

## 五、验收标准评审

PRD 列出的 12 条 AC 完整且可验证：

| 类别 | AC 数量 | 评审 |
|------|---------|------|
| 核心验收（AC-01~05） | 5 | 覆盖弹窗尺寸固定、搜索过程、空状态、清空恢复，完整 ✅ |
| 边界验收（AC-06~09） | 4 | 覆盖移动端、滚动、自动聚焦、开关弹窗，完整 ✅ |
| 回归验收（AC-10~12） | 3 | 覆盖排盘按钮、遮罩关闭、✕关闭，完整 ✅ |

**补充建议**：增加 1 条边界 AC：
- **AC-13**：弹窗内容区高度为 0 的极端情况（如某条档案 nickname/name/date 均极长导致换行），行高增加不应导致弹窗整体高度变化。

---

## 六、风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 480px 在某些设备显得过高/过低 | 低 | 低 | `max-height: 80vh` 兜底；可后续调优数值 |
| `min-height: 0` 导致 Safari 旧版行为差异 | 极低 | 中 | Safari 9+ 完全支持；standalone.html 目标浏览器均支持 |
| 空状态 `height: 100%` + `min-height: 200px` 边界冲突 | 极低 | 低 | CSS 规范：`min-height` 优先级高于 `height`，行为明确 |

---

## 七、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-22 | 初稿：方案评审 + 影响范围验证 + 实现规格 |
