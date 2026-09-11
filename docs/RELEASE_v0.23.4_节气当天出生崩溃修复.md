# 部署报告 — v0.23.4 节气当天出生排盘崩溃修复

> 发布角色：发布师（worker_59b8f12a）| 编排：orch_68e4b93af179
> 日期：2026-08-27 | 发布类型：内测版（bazi-paipan-test）

---

## 一、发布内容

| 项 | 值 |
|---|---|
| 版本号 | v0.23.3 → **v0.23.4**（SemVer PATCH，bug 修复） |
| 基线 | 公测 v0.23.3（commit 38b34db）+ 修复 commit 9fe5af3（4 文件，173+/56-） |
| 发布方式 | 内测目录 = v0.23.3 干净基线 + 仅叠加本次修复 diff（天然排除 v0.24.0 Supabase 账号功能） |

## 二、修复内容（commit 9fe5af3）

1. **P0 崩溃根因**：`monthPillar` 节气区间判断原按「节气日零点」截断 → 1987-05-06 立夏（17:05）当天 06:30 出生误判巳月 → 逆排起运 121 年 8 月 → 起运日期 2109 年越出节气表 → `getSolarTerm` 返回 null → 交运循环 `.getUTCFullYear()` 崩溃。现统一「BJT-as-UTC」完整时刻比较（`Date.UTC(y,m-1,d,h,mi)` vs 节气 `getTime()+288e5`）
2. **人元司令**：`renYuanSiLing` 增加时分参数，同基准完整时刻比较，节气当天不再显示「立夏后 0 日」
3. **年柱立春**：`paipan` 年柱立春判断同步改完整时刻（同类边界，顺带修复）
4. **交运越界 null 防护**：standalone.html / index.html 交运循环 `st`/`nextSt` 为 null 时用哨兵日期，对齐 render.js 375/381 既有判空
5. **自动化断言 224→232**：`?test=1` 新增 T01-T04，双环境全绿

## 三、部署与验证记录

### 3.1 文件部署（内测目录）
| 文件 | 校验 |
|---|---|
| algorithm.js / index.html / standalone.html / main.js | git apply patch 477 行；4 文件与 commit 9fe5af3 完全一致（diff 0）；无 v0.24.0/authOverlay/我的排盘 字样 |
| ext.yml | version: "v0.23.4" |
| CHANGELOG.md | 新增 v0.23.4 条目 + 补齐 v0.23.1~v0.23.3 历史 |
| SYSTEM.md | 头部「当前版本 v0.23.4」+ 版本历史表新增 v0.23.1~v0.23.4 行 |
| api/handler.rb | 未改动；/standalone 服务 standalone-split.html；6 条 JS 模块路由完整（constants/algorithm/archive/gongwei/render/main） |

### 3.2 端点验证（热加载后实测）
| 端点 | 状态 |
|---|---|
| /api/ext/bazi-paipan-test/standalone | 200（55,755B） |
| /api/ext/bazi-paipan-test/constants.js | 200 |
| /api/ext/bazi-paipan-test/algorithm.js | 200（含 BJT_OFFSET 新逻辑，10 处命中） |
| /api/ext/bazi-paipan-test/archive.js | 200 |
| /api/ext/bazi-paipan-test/gongwei.js | 200 |
| /api/ext/bazi-paipan-test/render.js | 200 |
| /api/ext/bazi-paipan-test/main.js | 200 |
| /api/ext/bazi-paipan-test/config.js | 404（✅ 确认内测无 v0.24.0 泄漏） |

### 3.3 基线纯净性
- 内测 4 文件与公测 v0.23.3 基线（38b34db）diff 0（应用前），应用后与 commit 9fe5af3 diff 0
- 内测无 config.js/auth.js/records.js/supabase.min.js；handler.rb 仍为 6 条 JS 路由
- 公测运行目录工作区 v0.24.0 未提交改动未触碰（发布师未做任何写操作）

## 四、风险与遗留

| 项 | 说明 |
|---|---|
| 公测版发布 | 待测试工程师验收绿灯后由 Leader 决策；公测 handler.rb 含 v0.24.0 未提交改动，正式发布需另行处理基线 |
| PRD 文件名 | PRD_v0.23.1_节气当天出生崩溃修复.md 为起草名，CHANGELOG 已标注「起草 v0.23.1，Leader 定版 v0.23.4」；如需统一可后续改名 |
| SYSTEM.md 公测版 | 公测 SYSTEM.md 仍停在 v0.23.0（L4 遗留项），本次仅同步内测版 |

## 五、结论

内测版 v0.23.4 已部署并通过端点验证：P0 崩溃修复就位、6 条 JS 路由完整、无 v0.24.0 混入、热加载生效。**待测试工程师验收绿灯后，方可推进正式发布流程。**

---

## 六、覆盖部署记录（177834f，2026-08-27 补录）

| 项 | 值 |
|---|---|
| 触发 | Leader 确认测试绿灯 + 架构师复核；编程师补齐遗漏 commit 177834f（父 9fe5af3，5 文件 21+/17-） |
| 内容 | ① render.js 4 处 renYuanSiLing 改 5 参 ② index/standalone 内联 paipan 立春完整时刻 ③ 版本注释统一 v0.23.4（5 文件头部） |
| 部署方式 | 内测已处 9fe5af3 状态（5 文件 diff 0）→ git apply 增量 patch /tmp/v0234_fix.patch（149 行） |
| 校验 | algorithm.js/index.html/standalone.html/main.js/render.js 与 177834f **diff 0**；main.js:1 与 standalone.html 头部均 v0.23.4；无 v0.24.0/auth.js/config.js/supabase 泄漏 |
| 端点实测 | /standalone 200（55,755B）；constants/algorithm/archive/gongwei/render/main 全部 200；config.js 404（无泄漏） |
| 基线纯净性 | 公测 v0.24.0 未提交改动（handler.rb 10 条路由、auth.js/config.js 等）未触碰 |

**正式发布待 Leader 决策：公测 handler.rb 含 v0.24.0 未提交改动，正式发布基线方案——内测路径（v0.23.3 基线 + 修复 diff 177834f）可确保不含 v0.24.0。**
