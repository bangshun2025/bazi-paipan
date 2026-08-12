# PRD：v0.20.1 自动化断言补充

## 一、版本信息

- **版本号**：v0.20.1
- **依赖版本**：v0.20.0（常用宫位分级已上线）
- **改动范围**：main.js（?test=1 回归测试区新增断言）、docs/_TEMPLATE/PRD.md（模板增加 section）
- **改动类型**：流程改进——修复复盘→改进闭环断裂，补充自动化断言覆盖

---

## 二、上版本复盘遗留项

> 本节为 v0.20.1 新增 PRD 模板 section 后首次应用。来源：RETRO_v0.20.0_常用宫位分级.md（§五 问题1、§六 建议1）。

| 编号 | 遗留项 | 来源 | 本版本处理 | 说明 |
|------|--------|------|:----------:|------|
| L1 | 补常用宫位自动化断言（5-8 条） | v0.20.0 复盘问题3 | ✅ 落地 | 即本 PRD 目标 A |
| L2 | 回归集基线化机制（新功能→新断言） | v0.19.0 复盘建议 / v0.20.0 复盘问题1 | ✅ 落地 | 即本 PRD 目标 B：模板增加「上版本复盘遗留项」section，确保后续版本强制追溯 |
| L3 | 阶段时间戳自动采集 | v0.16.0 复盘 / v0.20.0 复盘 §六.2 | ⏭ 不做 | 成本收益比低——Leader 每次派活/收汇报已有时间戳可推算，单独建机制需改编排层，暂缓 |
| L4 | Worker 进度可见性（流水线日志） | v0.20.0 复盘 §六.3 | ⏭ 不做 | 属于编排基础设施改进，非本版本功能范围，纳入 P3 架构升级 backlog |

---

## 三、需求背景

v0.20.0 复盘（RETRO_v0.20.0_常用宫位分级.md）发现两个问题：

1. **自动化断言连续 4 个版本零增长**（199→199→199→199）。v0.19.0 隐私模式 + v0.20.0 常用宫位分级共 22 条 AC/AR 全部为手工验证，无一条沉淀为 `?test=1` 自动化断言。常用宫位的核心路径（fav 数据迁移、☆ 切换、级联清理、默认排序恢复）在后续版本可能被意外破坏而自动化回归无法发现。

2. **复盘→改进闭环断裂**：v0.19.0 复盘建议（补隐私回归断言、回归集基线化）在 v0.20.0 未落地；PRD 模板缺少追溯机制。

v0.20.1 不新增用户功能，专治这两个流程问题。

---

## 四、目标 A：补充常用宫位自动化断言（6 条）

### 4.1 断言清单

以下 6 条断言拟写入 `main.js` 的 `?test=1` 回归测试区（约 L760 附近，全盘快照之后、渲染结果之前）。所有断言均通过 `window.GONGWEI.*` 命名空间访问 gongwei.js 导出函数，可在无 DOM 环境下纯 JS 验证。

#### A1：`getFavGroups()` 返回顺序与 `bz_gongwei_fav` 数组一致

```js
// 前置：设置 fav = ["信息","做功","亲缘"]
GONGWEI.persistFav(["信息","做功","亲缘"]);
var groups = GONGWEI.getFavGroups();
tests.push(eq('GWFav:A1 顺序', groups.map(function(g){return g.name;}).join(','), '信息,做功,亲缘'));
```

**验证点**：`getFavGroups()` 按 `bz_gongwei_fav` 的顺序返回宫位组对象，而非按 `gongWeiGroups` 的自然顺序。

#### A2：`toggleFav` 取消常用 → fav 与 selected 级联清理

```js
// 前置：fav = ["信息","做功"]，selected = ["信息","做功"]
GONGWEI.persistFav(["信息","做功"]);
GONGWEI.persistSelected(["信息","做功"]);
GONGWEI.selectedGongWei = ["信息","做功"];
// 取消"信息"的常用标记
GONGWEI.toggleFav("信息");
var favAfter = GONGWEI.loadFav();
var selAfter = GONGWEI.loadSelected();
tests.push(eq('GWFav:A2 fav移除', favAfter.indexOf('信息') === -1, true));
tests.push(eq('GWFav:A2 selected级联清理', selAfter.indexOf('信息') === -1, true));
tests.push(eq('GWFav:A2 做功仍在fav', favAfter.indexOf('做功') >= 0, true));
tests.push(eq('GWFav:A2 做功仍在selected', selAfter.indexOf('做功') >= 0, true));
```

**验证点**：取消常用时，被取消的组同时从 `bz_gongwei_fav` 和 `bz_gongwei_selected` 中移除（级联清理）；未被取消的组保持原状。

#### A3：旧用户迁移——清除 `bz_gongwei_fav` → 自动重建为全部 groups

```js
// 前置：gongWeiGroups 含 14 种预置宫位
localStorage.removeItem('bz_gongwei_fav');
// 模拟首次加载逻辑
var fav = GONGWEI.loadFav();
if (fav.length === 0) {
  fav = GONGWEI.gongWeiGroups.map(function(g) { return g.name; });
  GONGWEI.persistFav(fav);
}
// 验证
var favRebuilt = GONGWEI.loadFav();
tests.push(eq('GWFav:A3 迁移后fav长度', favRebuilt.length, GONGWEI.gongWeiGroups.length));
tests.push(eq('GWFav:A3 迁移后顺序一致', favRebuilt.join(','), GONGWEI.gongWeiGroups.map(function(g){return g.name;}).join(',')));
```

**验证点**：当 `bz_gongwei_fav` 不存在时，自动以 `gongWeiGroups` 的全部 name 初始化，顺序与 groups 一致。

#### A4：`resetFavOrder()` 默认排序 → fav 顺序同步 gongWeiGroups 顺序

```js
// 前置：groups 顺序为 A,B,C,D；故意将 fav 顺序打乱为 C,A,B
var originalGroupNames = GONGWEI.gongWeiGroups.map(function(g){return g.name;});
// 只取 groups 中在 fav 中的那些
GONGWEI.persistFav(["信息","做功","亲缘"]); // 故意不按 groups 顺序
var indices = {};
for (var i = 0; i < originalGroupNames.length; i++) indices[originalGroupNames[i]] = i;
GONGWEI.resetFavOrder();
var favOrdered = GONGWEI.loadFav();
// 验证：fav 中的组按其在 groups 中的位置升序排列
var sorted = true;
for (var i = 1; i < favOrdered.length; i++) {
  if (indices[favOrdered[i]] < indices[favOrdered[i-1]]) { sorted = false; break; }
}
tests.push(eq('GWFav:A4 默认排序同步', sorted, true));
```

**验证点**：点击「默认」按钮后，常用宫位的排列顺序恢复到与全部宫位中这些组的相对顺序一致。

#### A5：新增宫位组默认不在 fav（不污染下拉面板）

```js
// 前置：记录当前 fav
var favBefore = GONGWEI.loadFav().slice();
// 新增一个自定义宫位组
var r = GONGWEI.addGroup('测试A5', ['A','B','C','D','E','F','G']);
var favAfter = GONGWEI.loadFav();
tests.push(eq('GWFav:A5 新增不在fav', r.ok && favAfter.length === favBefore.length, true));
// 清理
if (r.ok) GONGWEI.deleteGroup(r.group.id);
```

**验证点**：`addGroup()` 后，新组出现在 `gongWeiGroups` 中但不出现在 `bz_gongwei_fav` 中。

#### A6：改名 → fav 幽灵名清理；删除组 → fav 同步移除

```js
// A6a: 改名同步
// 前置：确保有一个非预置组在 fav 中
GONGWEI.persistFav(["信息","做功"]);
// 将"信息"改为"信息2"
var infoGroup = GONGWEI.findGroupByName("信息");
var origName = infoGroup.name;
GONGWEI.updateGroup(infoGroup.id, "信息2", GONGWEI_MAP["信息"]);
var favAfterRename = GONGWEI.loadFav();
tests.push(eq('GWFav:A6a 改名后fav更新', favAfterRename.indexOf("信息2") >= 0 && favAfterRename.indexOf("信息") === -1, true));
// 改回来
GONGWEI.updateGroup(infoGroup.id, origName, GONGWEI_MAP["信息"]);

// A6b: 删除组同步
// 新增一个临时组，加入 fav + selected
GONGWEI.addGroup('测试A6b', ['A','B','C','D','E','F','G']);
GONGWEI.persistFav(GONGWEI.loadFav().concat(['测试A6b']));
GONGWEI.persistSelected(GONGWEI.loadSelected().concat(['测试A6b']));
GONGWEI.selectedGongWei = GONGWEI.loadSelected();
var tmpGroup = GONGWEI.findGroupByName("测试A6b");
GONGWEI.deleteGroup(tmpGroup.id);
var favAfterDel = GONGWEI.loadFav();
var selAfterDel = GONGWEI.loadSelected();
tests.push(eq('GWFav:A6b 删除后fav清理', favAfterDel.indexOf('测试A6b') === -1, true));
tests.push(eq('GWFav:A6b 删除后selected清理', selAfterDel.indexOf('测试A6b') === -1, true));
```

**验证点**：
- A6a：修改宫位组名称后，`bz_gongwei_fav` 中对应的旧名称自动替换为新名称（无幽灵名残留）。
- A6b：删除宫位组后，`bz_gongwei_fav` 和 `bz_gongwei_selected` 中自动移除该名称。

### 4.2 插入位置

```text
main.js 结构（自上而下）：
  L539  ?test=1 入口
  L570  十神 / 纳音 / 十二长生 / 流年 / 地支序号
  L600  全盘回归（9 孩 testChart）
  L700  函数级（命宫/身宫/胎元）
  L718  纳音土五行边界
  L731  幂等性
  L742  真太阳时
  L753  身宫 v0.9.4 hi 未定义
  L759  全盘快照（11 孩）
  ...
  L830  渲染结果 ← 断言在此之前插入
```

**建议插入位置**：全盘快照之后（~L820）、渲染结果之前。新增 section 标题 `// === v0.20.1 常用宫位自动化断言 ===`。

### 4.3 对现有测试的影响

- 现有 199 条断言不变（不删除、不修改）。
- 新增 6 条断言全部操作 localStorage，测试结束后恢复——但 `?test=1` 模式不加载完整 DOM，GONGWEI 模块的 `initGongWeiData()` 会在 `DOMContentLoaded` 时执行（从 localStorage 恢复数据）。因此断言前置中通过 `persistFav/persistSelected` 设置的数据即为测试数据，不会污染用户实际存储——因为用户不会在 `?test=1` URL 下使用排盘。
- 断言数量：199 → 205。

---

## 五、目标 B：PRD 模板增加「上版本复盘遗留项」section

### 5.1 修改内容

在 `docs/_TEMPLATE/PRD.md` 中，「需求背景」和「AC 验收条件」之间，新增以下 section：

```markdown
## 上版本复盘遗留项

> 回顾上一版本的复盘报告（RETRO_v*.md），逐条列出待办建议，
> 并说明本版本的处理方式（落地 / 明确不做 + 理由）。
> 目标是修复复盘→改进闭环，确保复盘报告的建议不被遗忘。

| 编号 | 遗留项 | 来源 | 本版本处理 | 说明 |
|------|--------|------|:----------:|------|
| L1   | ...    | vX.Y 复盘 §X | ✅ 落地 / ⏭ 不做 | ... |

> 删除本行：如无上版本复盘，写「无上版本复盘遗留项」即可。
```

### 5.2 位置

插在「需求背景」之后、「AC 验收条件」之前。逻辑关系：
1. 需求背景（为什么做）
2. 上版本复盘遗留项（上次说了要改但没改的，这次要么落地要么明确放弃）← 新增
3. AC 验收条件（做成什么样才算完）
4. 影响范围
5. 非目标
6. 测试要点

### 5.3 模板完整更新

以 `edit` 工具直接在 `docs/_TEMPLATE/PRD.md` 中插入上述 section。

---

## 六、AC 验收条件

### 6.1 目标 A（自动化断言）

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC-A1 | `?test=1` 打开排盘页面 | 新增 6 条断言全部通过，总断言数 205 条，零失败 |
| AC-A2 | 各断言覆盖场景 | A1（顺序）、A2（级联清理）、A3（旧用户迁移）、A4（默认排序）、A5（新增不入 fav）、A6（改名/删除清理） |
| AC-A3 | 断言不破坏现有测试 | 原有 199 条断言全绿，零新增失败项 |
| AC-A4 | 断言在无 DOM 环境可运行 | 所有断言不依赖 `document.querySelector` 或 UI 状态，纯 JS 调用 GONGWEI 命名空间函数 |
| AC-A5 | 断言幂等 | 多次运行 `?test=1` 结果一致 |

### 6.2 目标 B（PRD 模板）

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC-B1 | 打开 `docs/_TEMPLATE/PRD.md` | 新增「上版本复盘遗留项」section 在需求背景与 AC 验收条件之间 |
| AC-B2 | section 内容 | 包含注释（说明用途、删除指引）、表格结构（编号/遗留项/来源/本版本处理/说明） |
| AC-B3 | 新建 PRD 时能正确填写 | 产品经理可逐条列出上版本复盘建议及处理方式 |

---

## 七、影响范围

| 文件 | 改动 | 行数 |
|------|------|:---:|
| main.js | 新增 6 条宫位自动化断言（`?test=1` 回归区） | ~60 行 |
| docs/_TEMPLATE/PRD.md | 新增「上版本复盘遗留项」section | ~12 行 |
| **合计** | | **~72 行** |

**对已有功能的影响**：
- 不影响排盘算法、宫位逻辑、UI 渲染的任何已有功能。
- `?test=1` 模式下会短暂操作 localStorage 的 `bz_gongwei_fav` 和 `bz_gongwei_selected`，测试结束后页面关闭即丢弃——但若测试代码中未做清理，后续断言可能受脏数据影响。**实现时需注意**：每个断言组开始前显式 `persistFav/persistSelected` 设置前置数据，不依赖跨断言的 localStorage 状态。

---

## 八、非目标

- 不新增任何用户可见功能（无 UI 改动）。
- 不改 gongwei.js 的任何逻辑（纯测试代码 + 文档模板）。
- 不为 v0.19.0 隐私模式补断言（那是 v0.19.1 的范围，不在此版本范围）。
- 不引入自动化测试框架或 CI——继续沿用 `?test=1` 手跑模式。
- 不修改编排协议、消息格式、或 Worker 角色定义。

---

## 九、测试要点

### 边界 case

- **断言顺序依赖**：A1-A6 断言之间不应有隐式顺序依赖（每条断言独立设置前置数据）。若某条断言修改了 localStorage 后未恢复，后续断言可能受影响。
- **fav 与 selected 的空状态**：断言应覆盖 fav 为空、selected 为空的边界（已覆盖于 A3 迁移逻辑）。
- **GONGWEI_MAP 引用**：A6 断言中引用 `GONGWEI_MAP` 常量——需确保 main.js 中此常量可访问（当前已通过 `CONST.GONGWEI_MAP` 在 gongwei.js 中有别名，但 main.js 的 ?test=1 闭包可能无法直接访问）。**实现时需使用 `GONGWEI.gongWeiGroups` 中的实际 labels 而非直接引用 GONGWEI_MAP**。

### 回归风险点

- 新增断言不应修改 `gongWeiGroups` 的实际内容（A5/A6 测试后需清理新增/修改的组）。
- 测试代码中的 `localStorage.removeItem('bz_gongwei_fav')` 可能被浏览器安全策略拒绝（file:// 协议下 localStorage 一般可用，但需确认）。
