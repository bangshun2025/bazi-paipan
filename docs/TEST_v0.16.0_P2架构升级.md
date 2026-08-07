# QA 测试报告 · P2 架构升级 v0.16.0

> 测试日期：2026-08-06 | 测试人：测试师(worker_92bec2d2)
> 项目：八字排盘 · 从真版
> 被测版本：standalone.html v0.16.0（单体拆分→6 JS 模块）

---

## 测试结论：✅ 全部通过

**P2 架构升级质量合格，建议发布。**

---

## 一、语法检查

| 模块 | node -c | 结果 |
|------|:-------:|:----:|
| constants.js | ✅ | 无错误 |
| algorithm.js | ✅ | 无错误 |
| archive.js | ✅ | 无错误 |
| gongwei.js | ✅ | 无错误 |
| render.js | ✅ | 无错误 |
| main.js | ✅ | 无错误 |

---

## 二、加载顺序

实际顺序：`constants → algorithm → archive → gongwei → render → main`

与 ADR（`ADR_v0.16.0_架构拆分.md`）规定一致：
- constants.js：无依赖 ✅
- algorithm.js：→ constants.js ✅
- archive.js：→ constants.js（弱依赖）✅
- gongwei.js：→ constants.js, algorithm.js ✅
- render.js：→ 以上全部 ✅
- main.js：→ 入口/初始化 ✅

> ⚠️ 注意：UPGRADE_PLAN.md 中规划的加载顺序为 `gongwei→render→archive`，与 ADR 和实际实现不一致。建议更新 UPGRADE_PLAN.md 与 ADR 对齐。

---

## 三、功能回归（?test=1）

| 项目 | 结果 |
|------|:----:|
| 总断言数 | 199 |
| 通过 | 199 |
| 失败 | 0 |
| 执行耗时 | 1ms |

测试覆盖：十神计算、纳音、十二长生（含阴干逆排）、流年干支、地支序号、7 人全盘验证（邦顺/芝晓/素素/小龙/苓菲/新善/冯际州）

---

## 四、手动 UI 功能验证

| 功能 | 结果 | 备注 |
|------|:----:|------|
| 排盘渲染（四柱八字） | ✅ | 邦顺数据：壬戌 庚戌 甲戌 丁卯，颜色编码正确 |
| 大运/流年网格 | ✅ | 2019甲寅大运高亮，流年2026丙午正确 |
| 宫位标签显示 | ✅ | 15 个宫位组正常显示 |
| 精简模式（简按钮） | ✅ | 正常切换，无残留行 |
| 宫位 Popover | ✅ | 弹出和关闭正常 |
| 档案面板 | ✅ | 打开/关闭正常，预置数据（郑顺/六一/子*/爷爷/东*/颖*/甜甜*）完整 |
| 双胞胎模式（同性） | ✅ | 老大/老二对照对比视图正常，宫位矩阵+四柱均正确 |
| 双胞胎导航（仅看老大/仅看老二） | ✅ | 标签切换正常 |
| Console 错误 | ✅ | 零 JavaScript 错误 |

---

## 五、跨模块引用验证

| 命名空间 | 状态 | 关键属性 |
|----------|:----:|----------|
| window.CONST | ✅ object | — |
| window.ALGO | ✅ object | paipan, shiShen, cangGanLayers, trueSolarTime 等 20 个函数 |
| window.ARCHIVE | ✅ object | getArchives, saveArchives, PRESET_ARCHIVES 等 20 个函数 |
| window.GONGWEI | ✅ object | selectedGongWei (长度 15), updateTags 等 30+ 函数 |
| window.RENDER | ✅ object | renderChart, toggleSimple, renderTwinCardsHtml 等 30+ 函数 |
| window.APP | ✅ object | calendarType="solar", doPaipan, onProvChange 等 20 个函数 |

所有 HTML onclick/onchange 属性已加上命名空间前缀（如 `APP.doPaipan()`、`RENDER.toggleSimple()`）。

---

## 六、发现的问题

| # | 严重度 | 描述 | 建议 |
|---|:------:|------|------|
| 1 | 🟡 低 | UPGRADE_PLAN.md 中模块加载顺序与 ADR/实际不一致（archive↔gongwei 顺序对调） | 更新 UPGRADE_PLAN.md 以 ADR 为准 |
| 2 | 🟢 提示 | 6 个模块位于根目录而非 `js/` 子目录（与 UPGRADE_PLAN.md 规划有差异，但与 ADR 的 `<script src="constants.js">`（无路径前缀）一致） | 可接受，建议统一文档描述 |

---

## 七、发布建议

- ✅ P2 架构拆分质量合格，199 条回归断言全绿
- ✅ 所有 UI 交互功能正常，无任何 JS 错误
- ✅ 跨模块引用全部就绪，命名空间划分清晰
- 📋 发布前建议更新 UPGRADE_PLAN.md 加载顺序（问题1）
- 📋 可执行 `RELEASE_CHECKLIST.md` 中其余检查项后发布
