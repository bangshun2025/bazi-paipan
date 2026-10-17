# v0.57.0 测试记录 — 多选岁运模式

**日期**: 2026-10-18
**环境**: 独立 Chrome (CDP :9240) / 干净 profile / file:// 本地 index.html?test=1

## 断言回归

- 总断言 **1414**（v0.56.0 基线 1396 + MLT 新增 18）
- 失败 **4**，全部为 RECFL 基线既有失败（1440 窗口下记录面板历史超宽 1824/1863，与 v0.56.0 完全一致，与本轮改动无关）
- MLT 18 条全过：列数对齐 / 大运一二表头年份 / 流年升序 / 主星·干·支·颜色类 / colspan / 三垣 hd（th+td=10）/ 星曜 data-xy-gz / 状态机 / 关闭恢复 7 列

## 调试中修复的两个实现 bug

1. **三垣 hd 行 cells 选择**：三垣 hd 行尾两列（sep/col-ln 占位）是 `td` 不是 `th`，`querySelectorAll('th')` 只取到 5 个 → `cells.length<7` 被跳过整行不插列。修法 `'th,td'` 混选 + 插列标签 isSy 用 `td`。
2. **星曜行正则**：行类型为 `xingyao xy1`，`/\bxy\b/` 不匹配（xy 后是数字无词边界），须 `/\bxy\d\b/`。否则星曜多列不填、data-xy-gz 不更新。

## 门禁

- `scripts/check-release.sh` 6/6 全绿
- sync-module-inline：render / main 外部与两处内联一致

## 正常模式 UI 实测（CDP :9254，8/8 全绿）

真实点击「多选岁运」按钮 → 勾选大运1/大运4 → 勾选流年1999/2001 → 断言 → 关闭恢复：

| # | 断言 | 结果 |
|---|------|------|
| 1 | 多选按钮存在且进入 active | ✅ |
| 2 | 勾选两大运 dys=[1,4] | ✅ |
| 3 | 勾选两流年 lns=[1999,2001] 升序 | ✅ |
| 4 | 表头 9 列（7+大运二+流年扩1） | ✅ |
| 5 | 大运二表头年份 2029 | ✅ |
| 6 | 流年表头 ["1999","2001"] 升序 | ✅ |
| 7 | 关闭后 active 清除 | ✅ |
| 8 | 关闭恢复 7 列且无 col-dy2 | ✅ |

截图：/tmp/bazi057-ui.png（时柱→大运1999→大运2029→流年1999/2001）

**测试环境绕行说明**：干净 profile 未登录，`auth.js` 登录守卫包装 `APP.doPaipan`，`isLoggedIn()=false` 时 `requireLogin()` 拦截——多选每次点选调 `doPaipan` 重排全被拦。UI 脚本用 `history.replaceState(null,'','?test=1')` 使 `isTestMode()` 放行（不刷新页面、测试框架不启动）。**真实登录用户无此问题，属既有正确行为**。

**附带发现（疑似既有 bug，非本轮引入）**：`_updateCardDyLnColumns` 生成的卡片 pill 无 `nayun` 字段，切大运后卡片纳运行清空；主表纳运行正常。

## 最终复核

- 删除 applyMultiDL 临时 MDL-DBG 日志 → sync-module-inline 回推 → check-release 6/6 全绿
- test=1 回归重跑：1414 断言、失败 5 与基线一致（RECFL 历史已知）
