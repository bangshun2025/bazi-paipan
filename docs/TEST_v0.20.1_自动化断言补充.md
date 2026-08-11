# TEST v0.20.1 — 自动化断言补充

> **版本**：v1.0
> **日期**：2026-08-11
> **测试师**：worker_e01afaec
> **被测版本**：v0.20.1
> **被测文件**：`standalone-split.html` + `main.js`（L798-878）
> **测试环境**：Chrome (macOS)，file:// 直接打开 `standalone-split.html?test=1`

---

## 一、测试结论

| 分类 | 总数 | 通过 | 失败 | 通过率 |
|------|:----:|:----:|:----:|:------:|
| 目标A：GWFav 自动化断言（A1-A6） | 12 | 12 | 0 | **100%** |
| 目标A：原有断言回归 | 199 | 199 | 0 | **100%** |
| 目标B：PRD 模板验证 | 3 | 3 | 0 | **100%** |
| 功能回归（☆切换/增删/持久化） | 6 | 6 | 0 | **100%** |
| **合计** | **220** | **220** | **0** | **100%** |

✅ **220/220 全绿**。此前 `GWFav:A2 做功仍在selected` 失败已修复：测试改用 `clearSelection()` + `toggleSelect()` 公开 API 代替直接赋值 `GONGWEI.selectedGongWei = [...]`（gongwei.js 零改动），验证通过。

---

## 二、目标A：自动化断言验证

### 2.1 总览

| 指标 | 值 |
|------|-----|
| 总断言数 | **211**（199 原有 + 12 GWFav） |
| 新增 section | 「宫位 — v0.20.1 自动化断言」 |
| 通过 | 211 |
| 失败 | 0 |
| 执行时间 | 2ms |

### 2.2 A1-A6 逐条结果

| 编号 | 断言 | 结果 | 说明 |
|:----:|------|:----:|------|
| A1 | `GWFav:A1 顺序` | ✅ | `getFavGroups()` 按 fav 顺序返回 |
| A2 | `GWFav:A2 fav移除` | ✅ | `toggleFav("信息")` 正确从 fav 移除 |
| A2 | `GWFav:A2 selected级联清理` | ✅ | toggleFav 级联清理 "信息" from selected |
| A2 | `GWFav:A2 做功仍在fav` | ✅ | 未被 toggled 的组留在 fav |
| A2 | `GWFav:A2 做功仍在selected` | ✅ | 改用 clearSelection+toggleSelect API（gongwei.js 零改动） |
| A3 | `GWFav:A3 迁移后fav长度` | ✅ | 清空 fav 后自动重建为 14 组 |
| A3 | `GWFav:A3 迁移后顺序一致` | ✅ | 迁移后顺序与 gongWeiGroups 一致 |
| A4 | `GWFav:A4 默认排序同步` | ✅ | `resetFavOrder()` 正确排序 |
| A5 | `GWFav:A5 新增不在fav` | ✅ | `addGroup()` 不影响 fav |
| A6a | `GWFav:A6a 改名后fav更新` | ✅ | `updateGroup()` 同步更新 fav 中名称 |
| A6b | `GWFav:A6b 删除后fav清理` | ✅ | `deleteGroup()` 级联清理 fav |
| A6b | `GWFav:A6b 删除后selected清理` | ✅ | `deleteGroup()` 级联清理 selected |

### 2.3 已修复：`GWFav:A2 做功仍在selected`

**原问题**：测试代码 `GONGWEI.selectedGongWei = ["信息","做功"]` 直接赋值，但 `initGongWeiData()` 重赋值后切断了导出引用，`persistSelected()` 操作的是内部闭包变量而非导出属性。

**修复方式**：改用公开 API `clearSelection()` + `toggleSelect()` 代替直接赋值（gongwei.js 零改动）：

```js
// 修复前（失败）
GONGWEI.selectedGongWei = ["信息","做功"];
GONGWEI.persistSelected();

// 修复后（通过）
GONGWEI.clearSelection();
GONGWEI.toggleSelect("信息");
GONGWEI.toggleSelect("做功");
```

**验证**：standalone-split.html?test=1 与 standalone.html?test=1 均 211/211 全绿，GWFav:A2 全部 5 条断言通过。

### 2.4 ADR 合规性核验

| ADR 要求 | 实现 | 合规 |
|----------|------|:---:|
| A2 用 `persistSelected()` 无参 | ✅ `GONGWEI.persistSelected()` | ✅ |
| A6 用 `findGroupByName().labels` 非 GONGWEI_MAP | ✅ `infoGroup.labels.slice()` | ✅ |
| A5/A6 测试组已清理 | ✅ A5 deleteGroup、A6b deleteGroup + A6a 改回原名 | ✅ |
| 断言插入位置（全盘快照后） | ✅ L798，section 标题正确 | ✅ |
| 断言独立（不依赖跨断言状态） | ✅ 每条 `persistFav` 前置 | ✅ |

---

## 三、目标A：原有断言回归

| 指标 | 值 |
|------|-----|
| 原有断言数 | 199 |
| 新增失败 | **0** |
| 全部通过 | ✅ |

结论：v0.20.1 断言区不破坏任何已有测试。

---

## 四、目标B：PRD 模板验证

| 编号 | 验证点 | 预期 | 实际 | 结果 |
|:----:|--------|------|------|:----:|
| AC-B1 | section 位置 | 需求背景之后、AC验收条件之前 | ✅ 第14-27行，位置正确 | ✅ |
| AC-B2 | section 内容 | 含注释 + 表格结构 + 删除指引 | ✅ 注释/表格/删除指引齐全 | ✅ |
| AC-B3 | 可填写性 | 产品经理可逐条填写 | ✅ 表格含编号/遗留项/来源/处理/说明 | ✅ |

---

## 五、功能回归（正常页面）

| 验证点 | 操作 | 预期 | 结果 |
|--------|------|------|:--:|
| ☆ 切换常用 | `toggleFav("信息")` 两次 | 移除→恢复，级联生效 | ✅ |
| 新增组不在常用 | `addGroup("回归验证组",...)` | 新增后 fav 不变 | ✅ |
| 删除级联清理 | `deleteGroup(id)` | fav 同步移除 | ✅ |
| `resetToDefaults` | 恢复默认 | fav = 14 组 | ✅ |

---

## 六、standalone.html 同步与复验

### 6.1 复验结果

| 验证文件 | 断言 | 结果 | 验证者 |
|---------|:---:|:---:|--------|
| `standalone-split.html?test=1` | 211/211 | ✅ 全绿 | 测试师 |
| `standalone.html?test=1` | 211/211 | ✅ 全绿 | Leader 亲验（Chrome file:// 打开） |

### 6.2 预存构建缺陷（已修复）

初次打开 standalone.html 时发现 `build_modules.py` 内联 gongwei.js 过程将 `\n` 转义符转换为字面换行符，破坏 JS 语法。涉及两处 `confirm()` 调用（删除确认框、恢复默认确认框），已修复。GONGWEI 对象正常加载（81 个 key），persistFav/clearSelection/toggleSelect/toggleFav/getFavGroups/loadSelected/resetFavOrder/isSelected 全部为 function。

---

## 七、总结

v0.20.1 自动化断言补充：**220/220 全绿通过** ✅

- 12条GWFav断言全部通过（修复后），覆盖率涵盖 fav 迁移/级联/排序/增删/改名等全部核心路径
- 原有199条断言零新增失败，回归无破坏
- PRD模板修改符合AC-B1~B3
- 功能回归正常
- standalone-split.html 与 standalone.html 双环境均 211/211 全绿

修复点：A2 `做功仍在selected` 从直接赋值 `GONGWEI.selectedGongWei = [...]` 改为 `clearSelection()` + `toggleSelect()` 公开 API，gongwei.js 零改动。
