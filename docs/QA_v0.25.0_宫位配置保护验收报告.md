# QA_v0.25.0_宫位配置保护验收报告

- 版本：v0.25.0（宫位配置保护 / 数据安全）
- 验收执行：测试工程师（worker_79160b29）
- 验收日期：2026-08-29
- 被测范围：八字排盘扩展（~/.clacky/ext/local/bazi-paipan/）
- 结论：**通过** — 本地功能与回归全部通过；**AC10/AC11（云同步）已于 Supabase 表建好后回归通过（2026-08-29），P1 阻塞项解除，可进入内测发布流程**

## 一、验收对象

| 项 | 值 |
|---|---|
| 版本 | v0.25.0 |
| 主题 | 宫位配置保护（防损坏自动备份恢复 / 导出导入 / schema 版本化 / 云端同步） |
| 改动 | 8 改（api/handler.rb、api/auth.js、gongwei.js、index.html、main.js、scripts/check-release.sh、standalone-split.html、standalone.html，+1231/-68）+ 2 新增（gongwei-cloud.js、docs/sql/user_gongwei_config.sql） |
| 测试基线 | TEST_v0.25.0 用例（T01-T06 共 22 条细化断言，六入口累计 269 条） |

## 二、验收结论摘要

| 验收项 | 结果 |
|---|---|
| T1 改动核对（git status/diff） | ✅ 通过（8 改 + 2 新增，gongwei.js 含全部 v0.25 函数） |
| T2 六入口 269 条断言（3 网页 + 扩展端点 + 2 file://） | ✅ 全部通过 |
| T3 check-release.sh 四步复核 | ✅ 四步全绿（第 4 步外部 vs 内联 6 模块比对一致） |
| T4 AC01-13 浏览器级功能验收 | ⚠️ AC01-09、AC12/13 通过；**AC10/11 阻塞（Supabase 表未建）** |
| T5 AR01-06 回归验收 | ✅ 通过（三锚点排盘 / 宫位 CRUD / 三入口一致性 / file:// 双环境） |
| T6 docs/sql/user_gongwei_config.sql 与 ADR 核对 | ✅ 一致（DDL + RLS 4 策略 + GRANT authenticated） |
| 数据安全红线（4 键备份闭环 / 损坏恢复 / 防重置） | ✅ 通过 |

**结论**：本地功能与回归全通过，可进入内测发布流程；**上云功能（云端拉取/首传）需发布师或用户侧执行 docs/sql/user_gongwei_config.sql 建表后回归 AC10/AC11**。发布时须在发布说明中标注该阻塞项。

## 三、缺陷清单

| 级别 | 缺陷 | 影响 | 复现 | 状态/建议 |
|---|---|---|---|---|
| P1 阻塞 | Supabase `user_gongwei_config` 表未建（curl 返回 PGRST205 404：Could not find the table 'public.user_gongwei_config'） | AC10（云拉取覆盖）/ AC11（首传推云）无法真实验证；登录用户云同步静默降级本地 | 登录账号后触发云端 pull/push | 执行 docs/sql/user_gongwei_config.sql 后回归；当前已验证表缺失时静默降级本地、页面不崩溃（符合 AC12 降级语义） |
| P2 遗留 | `addGroup(name)` 单参数调用崩溃（`Cannot read properties of undefined (reading '0')`，labels[i] 在 labels=undefined 时崩溃） | 仅影响 API 单参数调用；UI 总传 7 标签不受影响 | `GONGWEI.addGroup('某组')` | 非 v0.25 引入（v0.20 既有）；建议后续 `labels = labels || []` 加固 |
| P2 观察项 | 多次导入产生多个 `*_backup_<ts>` 键且不清理累积 | localStorage 长期累积膨胀 | 连续导入多份配置 | ADR 仅规定 corrupt 保留最近 1 份；建议后续备份清理策略 |
| 环境观察 | Chrome 缓存旧版 gongwei.js 导致首次 ?test=1 假失败 | 测试环境误判 | 升级后未强刷 | 验收脚本已禁用缓存规避；建议发布流程提示用户清缓存 |

## 四、T2 六入口 269 条断言明细

六入口（均带 `?test=1`，脚本禁用缓存 + URL 时间戳防旧缓存）：

| # | 入口 | 断言数 | 结果 |
|---|---|---|---|
| 1 | http://localhost:8765/index.html | 269 | ✅ 全绿 |
| 2 | http://localhost:8765/standalone.html | 269 | ✅ 全绿 |
| 3 | http://localhost:8765/standalone-split.html | 269 | ✅ 全绿 |
| 4 | 扩展端点 http://localhost:7070/api/ext/bazi-paipan/standalone | 269 | ✅ 全绿 |
| 5 | file://…/standalone.html | 269 | ✅ 全绿 |
| 6 | file://…/standalone-split.html | 269 | ✅ 全绿 |

覆盖 T01-T06 全部 22 条细化断言：schema 版本 / safeLoad / corrupt 备份 / notifyCorrupt / migrateGongweiSchema / buildExportPayload / exportConfig / validateImportPayload / applyImportPayload / importConfig / handleImportFile / 4 键备份恢复闭环（snap/restore）。

## 五、AC01-13 浏览器级用例结果

| 用例 | 内容 | 结果 |
|---|---|---|
| AC01 | 宫位设置入口按钮 6 元素存在 | ✅ |
| AC02 | 导出 payload 6 字段（schema/version/groups/trash/selected/fav）可逆，schema=1 | ✅ |
| AC03 | 导出→清空→导入完整恢复（组/selected/fav） | ✅（以 7 标签参数调用；见 P2 遗留） |
| AC04 | 非法导入三子用例（非法 JSON / 无 schema / 版本不支持）均 ok=false | ✅ |
| AC05 | 导入产生 4 前缀 backup 键（groups/trash/selected/fav） | ✅ |
| AC06 | groups 损坏 → alert 文案正确 + corrupt 备份 + 默认 14 组恢复 | ✅（CDP Page.javascriptDialogOpening 捕获） |
| AC07 | 其他键（selected 等）损坏不抛异常、空数组容错 | ✅ |
| AC08 | 全新首启无 alert、无 corrupt 键 | ✅ |
| AC09 | schema_version 持久化为 1 | ✅ |
| AC10 | 云拉取覆盖（需 Supabase 表） | ⚠️ 阻塞（表未建，PGRST205 404） |
| AC11 | 首传推云（需 Supabase 表） | ⚠️ 阻塞（表未建，PGRST205 404） |
| AC12 | 未登录修改宫位零云请求（网络监听 = []） | ✅ |
| AC13 | 登录账号 A：select/upsert 请求发出，表缺失 404 → 静默降级本地、页面不崩溃 | ✅ |

## 六、AR01-06 回归结果

| 回归项 | 内容 | 结果 |
|---|---|---|
| AR01 | 六入口 ?test=1 断言全绿（269×6） | ✅ |
| AR02 | 三锚点排盘（登录后 doAiParse）：1982-10-18 05:01 → 壬戌年生·属狗、人元司令辛（寒露后 8 日）阳年男·顺排；1472-10-31 22:01（王阳明）→ 壬辰年生·属龙、人元司令戊（寒露后 23 日）；1037-1-8 12:00（苏轼）→ 丙子年生·属鼠、人元司令癸（小寒后 1 日），四柱齐全 | ✅ |
| AR03 | 宫位 CRUD：addGroup/updateGroup/deleteGroup→inTrash/restoreFromTrash→backInGroups/clearTrash 全部 true（组名 ≤6 字） | ✅ |
| AR04 | check-release.sh 四步全绿，EXIT=0 | ✅ |
| AR05 | 三入口一致性：check-release 第 4 步内联 vs 外部 6 模块 md5 比对一致 + 六入口全绿 | ✅ |
| AR06 | file:// 双环境（standalone.html / standalone-split.html）全绿 | ✅ |

## 七、测试环境与方法说明

- 浏览器自动化：Chrome CDP（端口 9224）直连，Network.setCacheDisabled + URL `&ts=` 防旧缓存。
- 登录账号：test.a.v024@example.com（v0.24 验收沿用账号）。
- 环境：本地 python http.server :8765、扩展端点 :7070。
- alert 断言：用 CDP Page.javascriptDialogOpening 事件捕获（Page.reload 后 window.alert hook 会丢失）。
- 数据安全红线：每次用例前后 snap/restore 4 键（bz_gongwei_groups/trash/selected/fav + schema_version），用例间互不污染。

## 八、建议（供 Leader/发布师决策）

1. 发布内测前执行 docs/sql/user_gongwei_config.sql 建表（Supabase 项目 vugckrqxqufiyfrpptwt），完成后回归 AC10/AC11。
2. 发布说明标注：AC10/11 依赖线上建表，未建表时云同步静默降级本地（不崩溃）。
3. 后续版本建议：addGroup 参数加固（labels 默认 []）；backup 键清理策略；发布流程提示清浏览器缓存。

## 九、AC10/11 回归（Supabase 表已建，2026-08-29 补测）

> 背景：Leader 已用数据库密码直连执行 docs/sql/user_gongwei_config.sql（DDL + RLS 4 策略 + GRANT authenticated），P1 阻塞解除。本回归在内测入口 http://localhost:7070/api/ext/bazi-paipan-test/standalone 执行。

### AC10 云拉取覆盖（账号 A，云端已有配置）— ✅ 通过

| 步骤 | 结果 |
|---|---|
| 前置：登录 A 首传默认组，加组「云覆盖组A」→ 推云 | 云端 A 记录 15 组，含「云覆盖组A」，schema=1 ✅ |
| 登出 + 清 sb 会话 + 本地改 L（groups/selected/fav = 本地残留组L）→ reload | reload 后未登录（isLoggedIn=false），本地 = ["本地残留组L"]，与云端 15 组不同 ✅ |
| 登录 A → pull 云端 | 本地被覆盖为云端 15 组：含「云覆盖组A」、无「本地残留组L」；selected 从 L 覆盖为 []；fav 恢复云端 14 项；lastSyncError=null ✅ |

**结论**：登录后云端为准，localStorage 4 键被云端覆盖，UI 刷新为云端值，无报错。

### AC11 首传推云（账号 B，云端无配置）— ✅ 通过

| 步骤 | 结果 |
|---|---|
| 前置：B 云端无记录；本地含「首传组B」 | 本地 groups=15（默认14+首传组B）✅ |
| 登录 B → pull 无记录 → 首传推云 | 云端出现 B 记录：groups 含「首传组B」、schema_version=1 ✅ |
| 本地不被覆盖 | 登录后本地仍含「首传组B」（localKept=true）、长度 15 ✅ |
| 同步状态 | lastSyncError=null ✅ |

**结论**：云端无记录时本地首传推云（upsert onConflict user_id），本地不被覆盖。

### RLS 用户隔离 — ✅ 通过

| 场景 | 结果 |
|---|---|
| A 会话 select 全部记录 | 仅 1 条（A 自己的 user_id）✅ |
| A 会话 select user_id=B | 0 条（RLS 过滤）✅ |
| B 会话 select user_id=A | 0 条（RLS 过滤）✅ |
| B 会话 select 全部记录 | 仅 1 条（B 自己的 user_id）✅ |

**结论**：4 个 RLS 策略（auth.uid()=user_id）生效，用户 A/B 配置完全隔离。

### 回归缺陷

- **无新缺陷**。云同步（pull/push/RLS 隔离）全部按 ADR 预期工作。
- 测试数据清理：B 云端测试记录已删除（保持 B 云端无记录，便于后续 AC11 回归）；A 云端记录保留（AC10 前置）。

### 版本结论更新

**P1 阻塞项已解除。AC01-13 全部通过，AR01-06 全部通过。v0.25.0 验收结论升级为：完全通过，可进入内测发布流程。**
