# PRD — 档案弹窗搜索稳定性

> **版本**：v1.0  
> **日期**：2026-07-22  
> **作者**：产品经理  
> **状态**：待评审  
> **关联文件**：`/Users/feng/.clacky/ext/local/bazi-paipan/standalone.html`（v0.9.0, 3616行）

---

## 一、问题定性

### 1.1 用户反馈

> 在搜索框输入时，窗口会变。不要变。

### 1.2 根因分析

**问题现象**：档案弹窗（`.archive-modal`）的垂直尺寸在搜索过滤时发生抖动/缩放。

**直接原因**：弹窗高度由内容撑开，搜索前后列表条目数变化 → 弹窗高度跟随变化。

**CSS 层面拆解**：

```
当前样式链：
  .archive-modal {
    max-height: 80vh;    ← 只有上限，无下限，无固定高度
    display: flex;
    flex-direction: column;
  }
  .archive-modal-list {
    flex: 1;             ← 试图占满剩余空间
    overflow-y: auto;    ← 内容溢出时滚动
  }
```

`flex: 1` 在 flex 容器**没有明确高度**时表现不稳定：浏览器先按内容最小高度布局，`flex: 1` 只能分配「多余」空间。当搜索结果从 16 条变成 2 条时，列表内容最小高度骤降 → 弹窗整体收缩。

**同时触发抖动的三个子因素**：

| 因素 | 说明 |
|------|------|
| **高度不稳定** | 弹窗无 `min-height`，列表区高度 = 内容高度 |
| **空状态塌陷** | 无匹配结果时渲染单行 `<div class="archive-modal-empty">`，高度从 N 行崩塌到 ~60px |
| **`oninput` 逐字触发** | 每次按键都重绘列表，输入过程中反复伸缩（如输入"子旭"，"子"→2条，"子旭"→1条，高度跳两次） |

### 1.3 问题严重性

| 维度 | 评估 |
|------|------|
| 频率 | 每次搜索都触发，100% 复现 |
| 影响面 | 所有使用档案弹窗的用户 |
| 体验伤害 | 高——弹窗抖动是 UI 基础体验红线 |

---

## 二、解决方案

### 2.1 设计原则

弹窗一旦打开，**外框尺寸锁定**。内部列表区域高度固定，内容变化仅在列表区域内通过滚动处理。

### 2.2 CSS 修改点

```css
/* 修改：.archive-modal */
.archive-modal {
  /* 新增：固定弹窗高度 */
  height: 480px;           /* 固定高度，替代 max-height */
  max-height: 80vh;        /* 保留：小屏幕兜底 */
  min-height: 360px;       /* 保留：极小屏幕保底 */
  /* 以下不变 */
  display: flex;
  flex-direction: column;
  ...
}

/* 修改：.archive-modal-list */
.archive-modal-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;           /* 关键：允许 flex 子元素收缩到小于内容高度，否则 overflow 不生效 */
  padding: 4px 0;
}
```

> **`min-height: 0` 解释**：flex 子元素默认 `min-height: auto`，即最小高度 = 内容高度。当列表只有 1 条结果时，浏览器不让它缩到比内容更小，`overflow-y: auto` 形同虚设。设为 `min-height: 0` 后，列表区高度真正由 flex 容器分配，内容不足时保持区域大小不变。

### 2.3 空状态优化

空状态行（`archive-modal-empty`）改为撑满列表区高度，而非自然高度：

```css
.archive-modal-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;            /* 撑满父容器（列表区） */
  min-height: 200px;       /* 视觉上的最小舒适高度 */
  text-align: center;
  padding: 40px 20px;
  color: var(--c-gray);
  font-size: 14px;
}
```

### 2.4 搜索防抖（可选优化，降低重绘频率）

`oninput` 改为带防抖（debounce 150ms），减少输入过程中的中间态渲染：

```javascript
// 在 filterArchives 调用处
var _filterTimer = null;
function onArchiveSearch(val) {
  clearTimeout(_filterTimer);
  _filterTimer = setTimeout(function() {
    filterArchives(val);
  }, 150);
}
```

HTML 侧改为 `oninput="onArchiveSearch(this.value)"`。

> **是否必须**：如 CSS 高度已锁定，逐字渲染不再引起弹窗抖动（仅列表内容变化），防抖可降低重绘开销但非必要。建议列为 P2 优化。

---

## 三、验收标准（Acceptance Criteria）

### 3.1 核心验收

- [ ] **AC-01**：打开档案弹窗后，弹窗外框（`.archive-modal`）尺寸固定，不随搜索输入变化
- [ ] **AC-02**：搜索输入过程中（逐字输入），弹窗位置和尺寸不发生任何偏移或抖动
- [ ] **AC-03**：搜索结果从 16 条变为 1 条时，弹窗保持相同尺寸，列表区域内部滚动
- [ ] **AC-04**：搜索无匹配结果时（空状态），弹窗保持相同尺寸
- [ ] **AC-05**：清空搜索框恢复完整列表时，弹窗尺寸不变

### 3.2 边界验收

- [ ] **AC-06**：弹窗在移动端（屏幕高度 ≤ 667px）不超出可视区域（`max-height: 80vh` 生效）
- [ ] **AC-07**：列表区域可正常滚动（鼠标滚轮 / 触摸滑动），滚动条可见
- [ ] **AC-08**：弹窗打开时，搜索框自动聚焦，不引起弹窗尺寸变化
- [ ] **AC-09**：弹窗关闭再打开，尺寸保持一致

### 3.3 回归验收

- [ ] **AC-10**：点击列表项「排盘」按钮，正常加载并关闭弹窗
- [ ] **AC-11**：点击遮罩层关闭弹窗，功能正常
- [ ] **AC-12**：点击 ✕ 按钮关闭弹窗，功能正常

---

## 四、非功能约束

### 4.1 弹窗尺寸规格

| 属性 | 值 | 说明 |
|------|-----|------|
| `width` | `90%`，`max-width: 420px` | 不变 |
| `height` | `480px` | 新增固定值 |
| `max-height` | `80vh` | 小屏幕兜底 |
| `min-height` | `360px` | 极小屏幕保底 |

### 4.2 列表区域行为

| 场景 | 行为 |
|------|------|
| 列表条目多于可视区 | 列表区内滚动，弹窗不动 |
| 列表条目少于可视区 | 列表区保持固定高度，底部留白 |
| 无匹配结果 | 空状态提示居中显示在列表区内 |

### 4.3 兼容约束

- 仅修改 CSS，不改动 JS 逻辑（`renderArchiveModal`、`filterArchives` 接口不变）
- 不改动弹窗 header / search bar 的布局
- 移动端 `@media (max-width:900px)` 下弹窗宽度自适应，高度行为一致
- 不影响 AI 录入弹窗（`.ai-overlay`）的独立行为

---

## 五、影响范围

| 模块 | 影响 | 风险 |
|------|------|------|
| `.archive-modal` CSS | 新增 `height`、补充 `min-height` | 低——纯 CSS 改动 |
| `.archive-modal-list` CSS | 新增 `min-height: 0` | 低——修复 flex 默认行为 |
| `.archive-modal-empty` CSS | 改为 `display: flex` + `height: 100%` | 低——仅影响空状态 |
| HTML `oninput` 属性 | 可选改为防抖版 | 极低——函数签名不变 |
| 其余模块 | 无影响 | — |

---

## 六、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-22 | 初稿：问题定性 + CSS 修复方案 + 验收标准 |
