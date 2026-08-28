# PRD：v0.24.0 Supabase 账号功能

## 一、版本信息

- **版本号**：v0.24.0（本次收尾完成后发布内测，发布师定版）
- **基线版本**：v0.23.4（节气当天出生崩溃修复，已 tag 发布线上）
- **开发状态**：存量代码已完成 80%（2026-08-23 开发中断于 v0.23.4 节气 bug 修复）；本次任务为收尾完成
- **改动范围**：config.js / auth.js / records.js / supabase.min.js（新增）+ standalone-split.html / api/handler.rb（已改）+ standalone.html / index.html（待同步）
- **改动类型**：新功能（账号系统 + 云端记录）

---

## 二、上版本复盘遗留项

> 来源：SYSTEM.md「已知问题 / 技术债」表 + RETRO_v0.23.4 复盘结论

| 编号 | 遗留项 | 来源 | 本版本处理 | 说明 |
|------|--------|------|:----------:|------|
| L1   | **测试代码段同步缺失**：改 main.js 内联断言未同步 index.html/standalone.html 内联版（P1，未处理） | RETRO v0.22.0 / SYSTEM.md | ⚠️ **本版本必须规避** | v0.24 的全部新代码（auth/records/UI）目前**只存在于分体版 standalone-split.html + 独立 JS 文件**，单体版 standalone.html / index.html 完全未集成。本次收尾必须同步三文件 + 三入口验证（§5.4） |
| L2   | 部署目录 SYSTEM.md 版本一致性检查未入 check-release.sh（P2） | RETRO v0.23.0 | ✅ 发布时落实 | SYSTEM.md 现声明 v0.23.0，但 docs 已有 v0.23.1~v0.23.4 文档，存在版本漂移；发布时一并同步至 v0.24.0 |
| L3   | 内置回归集未含隐私断言（P1，未处理） | RETRO v0.19.0 | 不适用 | v0.24 回归重点是账号/云端功能（非算法），隐私逻辑沿用 v0.19.0 |
| L4   | `pillar()` 在 render.js 重复 5 次（P0）等算法技术债 | P2 复盘 | 不适用 | 与本功能无关，不扩范围 |

---

## 三、需求背景

### 3.1 用户诉求

现有排盘记录只存本地 `localStorage`（`bz_archives_v2`）：
- 换设备/清缓存即丢失，无法跨设备取回
- 无账号体系，无法做用户隔离、付费内容绑定、个性化服务
- 无法区分「我的记录」与「预置模板」

v0.24.0 引入 **Supabase 账号系统**：注册/登录/登出 + 30 天免登录 + 云端排盘记录（保存/列表/查看/删除）+ 首次登录自动迁移本地记录 + RLS 用户隔离。

### 3.2 目标用户与使用场景

- 邦顺本人 + 生命算法学员（通过 Clacky 面板 iframe 嵌入 / GitHub Pages 独立访问）
- 场景 A：学员注册账号，排盘保存到云端，换设备登录后取回记录
- 场景 B：未登录用户打开应用 → 被拦截，要求登录后才能排盘（保证记录归属可溯）

### 3.3 根因 / 缺口（Leader 已确认，无需重新调查）

2026-08-23 已完成存量开发并端到端实测通过（注册/登录/保存/读取/用户隔离），但：
1. **未发布**：ext.yml 仍为 v0.23.3，GitHub Pages 未部署 v0.24
2. **单体版未集成**：v0.24 改动只在分体版（standalone-split.html），standalone.html / index.html 仍为 v0.23.4
3. **无自动化断言**：auth/records 均为异步网络模块，现有 ?test=1 断言体系未覆盖

---

## 四、方案概述

### 4.1 总体架构

```
┌─────────────────────────────────────────────────┐
│  前端（原生 JS，零构建）                          │
│  config.js       ← Supabase 凭证（url + anonKey） │
│  supabase.min.js ← supabase-js v2 本地化（211KB） │
│  auth.js         ← 登录/注册/登出 UI+会话+拦截     │
│  records.js      ← 云端记录 CRUD+迁移+重试队列     │
│  standalone-split.html / standalone.html /       │
│  index.html      ← UI（登录弹窗+记录面板+按钮）     │
└──────────────┬──────────────────────────────────┘
               │ anon key（publishable，前端可公开）
┌──────────────▼──────────────────────────────────┐
│  Supabase（bazi-paipan，Free 套餐）              │
│  Auth：Email 登录、免确认、30 天 token、密码≥8     │
│  paipan_records：id/user_id/input_data/         │
│    result_data/created_at/updated_at            │
│  RLS 4 策略：select/insert/update/delete 限       │
│    user_id = auth.uid()                         │
└─────────────────────────────────────────────────┘
```

### 4.2 安全模型

| 层 | 机制 | 说明 |
|----|------|------|
| 认证 | Supabase Auth（Email + 密码） | anon key 仅 publishable 级别，**绝不使用 service_role key**（config.js 安全红线） |
| 授权 | RLS 策略（user_id = auth.uid()） | 用户只能读写自己的记录；伪造 user_id 插入被拒绝（8/23 实测 42501） |
| 传输 | HTTPS（Supabase 默认） | GitHub Pages 亦为 HTTPS |
| 前端 | `APP.doPaipan` 守卫 | 未登录拦截排盘入口；凭证未配置兜底提示 |
| 数据 | 结果快照存 result_data jsonb | 排盘结果冗余存储，查看详情无需重新计算 |

### 4.3 关键设计决策（架构师 ADR 细化）

1. **supabase-js 本地化**：存量已用 `supabase.min.js`（211KB 本地文件），摆脱 CDN 依赖——GitHub Pages / Clacky iframe 双环境可用，无需网络 CDN。**保持本地化，不退回 CDN**。
2. **三文件同步方式**：v0.24 前端代码为独立 JS 文件（config/auth/records/supabase.min.js）+ 分体版 UI 内联段。单体版（standalone.html / index.html）需**同步内联**同一套 UI 与逻辑（保持既有「单体版自包含」架构——standalone.html 是回退版/离线版，不能依赖外部 JS 文件；index.html 是 Clacky 面板内联版）。同步方式由架构师在 ADR 给出最小 diff 方案（可参考 v0.22.0 内联同步教训）。
3. **凭证配置**：config.js 含真实 anonKey（publishable 级别，可提交 Git）；**数据库密码/secret 只存在于档案文件，禁止进入仓库**（§9.2）。

---

## 五、需求详述

### 5.1 存量已完成项（2026-08-23，端到端实测通过 ✅）

| # | 模块 | 内容 | 代码位置 | 状态 |
|---|------|------|---------|:---:|
| S1 | 后端 | paipan_records 表（id uuid PK / user_id / input_data jsonb / result_data jsonb / created_at / updated_at）+ 索引 idx_paipan_records_user_created + 触发器 touch_updated_at | Supabase SQL | ✅ 已建 |
| S2 | 后端 | RLS 4 条策略（select/insert/update/delete 均限 user_id = auth.uid()）+ GRANT authenticated（SQL Editor DDL 后手动补授权，踩坑已解决） | Supabase SQL | ✅ 已建 |
| S3 | 后端 | Auth：Email 登录开启、免邮箱确认（mailer_autoconfirm）、30 天 token、密码≥8 位 | Supabase Console | ✅ 已配 |
| S4 | 后端 | 端到端实测：注册/登录/保存(insert)/读取(select)/用户隔离（B 读不到 A；伪造 user_id 被拒 42501） | 8/23 实测 | ✅ 通过 |
| S5 | 前端 | config.js：window.SUPABASE_CONFIG（url + anonKey 真实值） | config.js | ✅ 已填 |
| S6 | 前端 | auth.js（320 行）：登录/注册/登出 UI 逻辑 + 会话恢复（30 天持久化 + autoRefreshToken + onAuthStateChange）+ 未登录拦截排盘（包装 APP.doPaipan）+ 凭证未配置兜底 + test 模式放行 | auth.js | ✅ 已写 |
| S7 | 前端 | records.js（485 行）：保存当前排盘（input_data 快照 + result_data 快照）/ 列表（倒序分页每页 50）/ 查看 / 删除 + 首次登录 localStorage 迁移（幂等 + 指纹去重 + 失败队列）+ 预置 16 孩模板迁移 | records.js | ✅ 已写 |
| S8 | 前端 | supabase.min.js 本地化（211KB） | supabase.min.js | ✅ 已备 |
| S9 | 前端 | api/handler.rb：模块路由列表加入 config.js/auth.js/records.js/supabase.min.js | api/handler.rb | ✅ 已改 |
| S10 | 前端 | standalone-split.html：登录弹窗（authOverlay 登录/注册双盒）+ 输入行 4 个按钮（💾保存云端/☁️我的排盘/🚪登出）+ 记录列表弹层（recordsOverlay）+ 记录详情弹层（recordDetailOverlay）+ script 引入 config/auth/records | standalone-split.html（+63 行） | ✅ 已改 |

### 5.2 剩余待办项（本次收尾范围）

| # | 模块 | 内容 | 依赖 | 优先级 |
|---|------|------|------|:---:|
| T1 | **单体版集成** | standalone.html / index.html 同步 v0.24：① 登录弹窗 UI ② 记录列表/详情弹层 UI ③ 输入行 4 个按钮 ④ supabase.min.js + config.js + auth.js + records.js 内联（或等价的 script 引入方案）⑤ 版本注释 v0.24.0 | 架构师 ADR | P0 |
| T2 | **三文件一致性** | `bash scripts/check-release.sh .` 通过（六模块段一致性 + HTML 关键 id + 新增 v0.24 id/按钮覆盖） | 编程师 | P0 |
| T3 | **自动化断言** | ?test=1 新增 v0.24 断言（最少 4 条，允许扩展）：AUTH 守卫、RECORDS 数据结构、迁移指纹、凭证未配置兜底（详见 §6.4） | 编程师 + 测试师 | P1 |
| T4 | **回归验证** | 224 条旧断言 + 新增断言全过；三入口（split/standalone/index）功能一致；双环境（http:// 与 file://） | 测试师 | P0 |
| T5 | **内测发布** | ext.yml version v0.23.3 → v0.24.0；CHANGELOG 补 v0.24.0 条目；SYSTEM.md 版本历史补 v0.23.1~v0.24.0；发布内测（clacky ext release） | 发布师 | P1 |
| T6 | **线上发布** | GitHub Pages 部署（v0.24 含 supabase 凭证，需确认 anonKey 可公开；config.js 安全红线遵守） | 发布师 + Leader 确认 | P1 |

### 5.3 功能需求详述

#### FR1 注册（AC2/AC3）
- 登录弹窗默认显示登录盒，点击「注 册」切到注册盒
- 邮箱格式校验（前端正则）+ 密码 ≥ 8 位（前端 + 后端双重校验）
- 注册成功：Supabase 免邮箱确认 → 注册即登录 → 自动进入排盘页
- 错误映射：已注册 / 密码过短 / 网络异常 / 次数过多（不泄漏具体原因，AC3 安全）

#### FR2 登录（AC1）
- 邮箱 + 密码登录；成功 → 隐藏登录遮罩 → 进入排盘页
- 记住邮箱（localStorage bz_remember_email，预填）
- Enter 键提交
- 失败统一提示「邮箱或密码错误」

#### FR3 会话（AC6/AC7）
- 30 天免登录：Supabase persistSession:true + autoRefreshToken + storageKey sb-bazi-paipan-auth-token
- 页面刷新后 getSession() 恢复会话；SIGNED_OUT 事件 → 回登录屏

#### FR4 未登录拦截排盘（AC8）
- 包装 `APP.doPaipan`：未登录时 alert「请先登录后使用排盘功能」+ 显示登录遮罩
- AI 录入路径（doAiParse → doPaipan）同受拦截（已核实 main.js:537）
- ?test=1 模式放行（回归测试兼容，AC22）

#### FR5 登出（AC5）
- 输入行「🚪 登出」按钮 → signOut() → 回登录屏；SIGNED_OUT 事件兜底

#### FR6 云端保存（AC9/AC10）
- 输入行「💾 保存云端」按钮 → 需已登录 + 已排盘（否则提示）
- input_data：表单快照（姓名/性别/年月日时分/省份城市区县/真太阳时/日历类型/闰月/指纹 _fp）
- result_data：当前排盘结果快照（bazi/sanyuan/extras/gongWeiType）
- 保存成功：alert「已保存到云端」+ 列表刷新到第 1 页
- 保存失败：入本地重试队列（bz_pending_ops）+ alert 提示

#### FR7 云端列表 / 分页（AC11）
- 输入行「☁️ 我的排盘」按钮 → 弹层显示记录列表（倒序，每页 50，加载更多）
- 每条显示：隐私名（getDisplayName 降级链）+ 出生时间 + 保存时间 + 查看/删除按钮

#### FR8 查看详情（AC11）
- 点击「查看」→ 弹层显示：隐私名 / 性别 / 出生 / 日历类型 / 真太阳时 / 保存时间 / 四柱简表

#### FR9 删除（AC12）
- 点击「删除」→ confirm 确认 → delete（RLS 限本人）→ 刷新列表

#### FR10 首次登录本地迁移（AC16-AC20）
- 登录成功后检测 localStorage `bz_archives_v2`：
  - 无本地数据 → 直接标记已迁移（不弹窗）
  - 有本地数据 → confirm「检测到本地有 N 条排盘记录，是否迁移到当前账号云端？」
    - 确认 → 逐条上传（幂等：指纹 _fp / 内容摘要双路去重，云端已有则跳过）
    - 取消 → 本次不迁移，下次登录再提示
  - 迁移失败条数入重试队列（flushPendingQueue 网络恢复自动补传）
- 预置 16 孩模板（PRESET_ARCHIVES）单独标记（PAIPAN_PRESET_MIGRATED），登录后自动上传一次
- 迁移标记：PAIPAN_MIGRATED（幂等，一条不丢）

#### FR11 凭证未配置兜底（AC21）
- config.js 未填凭证（PASTE_ 占位或空）→ 显示登录遮罩 + 提示「Supabase 凭证未配置」
- ?test=1 跳过（回归可跑）

### 5.4 三文件同步（承接 L1，本次硬性门槛）

| 文件 | 角色 | v0.24 同步内容 |
|------|------|---------------|
| standalone-split.html | 主产物（分体版） | ✅ 已集成（S10） |
| standalone.html | 回退版单体（GitHub Pages 独立访问） | ⚠️ **待同步**：登录弹窗 UI + 记录弹层 UI + 4 按钮 + 内联 JS（config/auth/records/supabase.min.js） |
| index.html | Clacky 面板内联版 | ⚠️ **待同步**：同上 |

- 同步后运行 `bash scripts/check-release.sh .` 验证。
- ⚠️ 教训：v0.22.0 素素断言 / v0.23.4 交运判空都因「模块版改了、内联版没改」引发，本次收尾同步是 P0 硬门槛。

### 5.5 交互 / 显示行为

| 场景 | 行为 |
|------|------|
| 首次打开（未登录） | 登录遮罩显示，排盘页隐藏；点「排盘」也被拦截 |
| 登录成功 | 遮罩消失，排盘页可用；云端记录自动加载 + 迁移检测 |
| 注册成功 | 免确认直接登录，进入排盘页 |
| 保存/查看/删除 | 即时反馈（alert + 列表刷新）；失败入队，网络恢复自动补传 |
| 登出 | 回登录遮罩；本地排盘结果不清空（保持浏览器状态） |

---

## 六、AC 验收条件

### 6.1 账号功能验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC01 | 打开应用（未登录） | 显示登录遮罩，无法看到排盘表单 / 无法排盘 |
| AC02 | 注册新账号（合法邮箱 + ≥8 位密码） | 注册成功并自动登录，进入排盘页 |
| AC03 | 注册已存在邮箱 | 提示「该邮箱已注册」；注册密码 < 8 位 → 提示「密码至少 8 位」 |
| AC04 | 登录（正确邮箱+密码） | 登录成功进入排盘页 |
| AC05 | 登出 | 回到登录遮罩；再次排盘被拦截 |
| AC06 | 刷新页面（已登录） | 会话恢复，无需重新登录（30 天免登录） |
| AC07 | 登录错误密码 | 提示「邮箱或密码错误」；不泄漏具体原因 |
| AC08 | 未登录点「排盘」/「AI录入」 | 拦截：alert + 登录遮罩 |

### 6.2 云端记录验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC09 | 登录后排盘 → 点「保存云端」 | alert「已保存到云端」；列表刷新到第 1 页 |
| AC10 | 未排盘点「保存云端」 | 提示「请先完成排盘，再保存到云端」 |
| AC11 | 打开「我的排盘」 | 列表显示（隐私名/出生/时间），可查看详情（含四柱简表） |
| AC12 | 删除记录 | confirm 确认后删除，列表刷新 |
| AC13 | 用户隔离 | 用户 B 看不到用户 A 的记录；B 删除 A 的记录被 RLS 拒绝 |
| AC14 | 保存失败（断网） | 提示已入本地队列；恢复网络后自动补传成功 |

### 6.3 迁移验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC15 | 登录时本地无记录 | 不弹窗，直接标记已迁移 |
| AC16 | 登录时本地有 N 条记录 → 确认迁移 | N 条全部上传（一条不丢）；云端列表出现 |
| AC17 | 重复迁移（再次登录 / 手动触发） | 幂等：不产生重复记录（指纹去重） |
| AC18 | 迁移中途失败 | 失败条数入重试队列，网络恢复自动补传 |
| AC19 | 预置 16 孩模板 | 登录后自动上传（只一次），不重复 |

### 6.4 新增自动化断言（?test=1，最少 4 条，允许扩展）

> 说明：auth/records 为异步网络模块，自动断言聚焦纯逻辑层（守卫、数据结构、指纹、兜底），网络交互由测试师浏览器级用例覆盖。

| 编号 | 断言 | 说明 |
|------|------|------|
| T01 | ?test=1 模式下 doPaipan 不被拦截（回归兼容） | auth 守卫放行逻辑 |
| T02 | config.js 未配置（PASTE_ 占位）时走兜底提示分支 | 凭证兜底逻辑 |
| T03 | contentFingerprint 幂等：相同输入产生相同指纹；不同输入产生不同指纹 | 迁移去重基础 |
| T04 | recordFingerprint：含 id 用 arch-id、无 id 用内容摘要 | 迁移指纹规则 |

> 断言数表述：最少 4 条，实施时允许按分组细化扩展（沿用 RETRO v0.23.0 R6 口径）。

### 6.5 回归验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AR01 | ?test=1 全量断言 | 224 条旧断言全过 + 新增断言通过 |
| AR02 | 常规排盘回归：1982-10-18 05:01 男、王阳明 1472-10-31 22:01、苏轼 1037 | 结果与 v0.23.4 完全一致（v0.24 不触碰算法） |
| AR03 | 真太阳时 / 农历 / 双胞胎 / 隐私开关 / 截图功能回归 | 不受影响 |
| AR04 | 三文件一致性：`bash scripts/check-release.sh .` | 通过（含新增 v0.24 UI/脚本段） |
| AR05 | 三入口双环境：split/standalone/index × http/file | 账号功能与排盘结果一致 |
| AR06 | 未配置凭证环境（占位 config.js） | 应用不崩溃，显示配置提示 |

---

## 七、影响范围

| 文件 | 现状 | 收尾动作 | 规模 |
|------|:---:|---------|:---:|
| config.js | 新增未跟踪 | 保留（anonKey 可提交 Git） | ~0 行 |
| auth.js | 新增未跟踪 | 保留 | ~0 行 |
| records.js | 新增未跟踪 | 保留 | ~0 行 |
| supabase.min.js | 新增未跟踪 | 保留（本地化） | 211KB |
| standalone-split.html | 已改（+63 行） | 保留，可能补断言挂钩 | ~0 行 |
| api/handler.rb | 已改（+2/-1） | 保留 | ~0 行 |
| **standalone.html** | v0.23.4（无 v0.24） | **同步 v0.24 UI + 内联 JS** | ~+63 行 UI + ~800 行 JS |
| **index.html** | v0.23.4（无 v0.24） | **同步 v0.24 UI + 内联 JS** | ~+63 行 UI + ~800 行 JS |
| main.js | v0.23.4 | 新增断言 T01-T04（最少 4 条）+ 同步三文件内联断言段 | ~30 行 |
| ext.yml | v0.23.3 | 升版 v0.24.0 | ~1 行 |
| CHANGELOG.md | v0.23.4 | 补 v0.24.0 条目 | ~10 行 |
| SYSTEM.md | v0.23.0（漂移） | 版本历史补 v0.23.1~v0.24.0 + 架构文件结构更新 | ~20 行 |

**发布注意**：
- config.js 含真实 anonKey（publishable 级别，公开安全）；**数据库密码仅存档案，绝不进仓库**（§9.2）
- SYSTEM.md 版本漂移（v0.23.0 vs docs v0.23.1~v0.23.4）本次发布一并修正

**性能影响**：仅新增登录弹层与记录弹层（display:none 常驻 DOM），无实质性能影响；supabase.min.js 211KB 为本地静态资源，首屏加载略有增加但可接受（与 constants.js 735KB 同级）。

---

## 八、非目标（明确不做）

- **不做** 付费 / 订阅 / 会员体系（Free 套餐够用；付费与 RLS 权限扩展留待后续版本）
- **不做** 第三方登录（Google/微信 OAuth）——仅 Email 密码
- **不做** 密码找回 / 邮箱验证流程（免邮箱确认已开启，密码找回依赖 Supabase 默认行为，不额外开发）
- **不做** 云端记录与本地档案的双向实时同步（本版本仅单向：本地 → 云端迁移 + 云端保存/读取）
- **不做** 记录搜索 / 导出 / 批量操作（后续版本）
- **不做** 算法层任何改动（v0.24 纯账号/存储功能）
- **不新增** 第三方依赖（supabase-js 已本地化）

---

## 九、风险评估

### 9.1 单体版同步遗漏（L1 复发风险，最高）

**风险**：收尾只保留分体版，忘记同步 standalone.html / index.html → 线上（GitHub Pages 主入口 standalone.html）无账号功能，或 check-release.sh 失败。

**缓解**：T1/T2 列为 P0；AR04/AR05 三入口验证；check-release.sh 六模块一致性 + 新增 v0.24 关键 id/按钮检查（编程师确认覆盖）。

### 9.2 凭证安全

**风险**：config.js 真实 anonKey 进仓库（publishable 级别可接受）；但档案 `Supabase配置记录.md` 含**数据库密码**，若误提交 Git 将严重泄露。

**缓解**：
- anonKey 可提交（Supabase 设计如此，RLS 兜底）
- **数据库密码文件禁止 git add / 外发**（Leader 明确要求）；必要时在 .gitignore 或发布检查清单中加防呆项
- 生产发布建议由 GitHub Secrets 注入生成本文件（ADR §1.3），本次内测可先用真实凭证

### 9.3 auth/records 无自动化测试覆盖

**风险**：账号/云端功能主要靠浏览器级手动测试，回归成本高、易漏。

**缓解**：T3 新增纯逻辑断言（守卫/指纹/兜底）+ 测试师浏览器级用例（§6.1-6.3）；后续版本可引入 Playwright 级端到端（非本版本范围）。

### 9.4 Supabase Free 套餐限制

**风险**：Free 套餐有并发连接数 / 存储限制（50MB 数据库、500MB 存储、2 并发连接等），大量用户同时使用可能受限。

**缓解**：当前学员规模下够用；若增长，后续可升级付费套餐或引入本地缓存降级（非本版本范围）。

### 9.5 迁移数据一致性

**风险**：本地档案结构与云端 input_data 结构有差异（档案有 bazi/sanyuan 快照，云端统一存 result_data）；迁移时若档案无快照则现算（ALGO.paipan），极端数据（如 1400 前简化排盘）可能 result_data 不完整。

**缓解**：迁移逻辑已做 try/catch 兜底（失败置 result_data 空骨架 + 入重试队列）；测试师补充边界用例（1400 前 / 农历闰月 / 无快照档案）。

### 9.6 内联版体积

**风险**：standalone.html / index.html 内联 supabase.min.js（211KB）+ auth/records（~800 行）后体积增大。

**缓解**：与 constants.js 735KB 同级可接受；若后续需优化可拆 CDN（非本版本范围）。

---

## 十、给架构师的 ADR 输入

1. **单体版内联合成方案**：standalone.html / index.html 如何内联 v0.24（UI 段 + config/auth/records/supabase.min.js），最小 diff 且保持 check-release.sh 通过；参考 v0.22.0 内联同步教训。
2. **测试断言挂载点**：T01-T04 放 main.js ?test=1 的对接方式；是否同步到两个内联版断言段（L1 教训）。
3. **凭证注入方案**：本次内测直接用 config.js 真实 anonKey（publishable）是否可接受；GitHub Secrets 注入方案（ADR §1.3）是否本次落实。
4. **迁移数据结构确认**：input_data / result_data 的 jsonb 结构（对齐档案结构 + 指纹 _fp），确认查看详情只读 result_data 无需重算。
5. **RLS 策略确认**：4 条策略（select/insert/update/delete user_id=auth.uid()）是否满足 AC13 用户隔离；update 是否真正需要（当前前端无 update 操作，仅 insert/delete）。

---

## 十一、给测试工程师的验收锚点

- **核心锚点（PRD 定稿即锁定）**：
  - 未登录拦截：打开应用见登录遮罩；点排盘被拦截（AC01/AC08）
  - 注册即登录（AC02）；登录 30 天免登（AC06）
  - 保存 → 列表可见 → 查看详情 → 删除（AC09/AC11/AC12）
  - 用户隔离：B 读不到 A 的记录（AC13）
  - 迁移：本地 N 条 → 登录确认 → 云端 N 条一条不丢（AC16）；重复迁移幂等（AC17）
- **回归锚点**：224 条旧断言全过；1982-10-18 / 王阳明 1472 / 苏轼 1037 排盘结果不变（AR02）
- **同步门槛**：AR04 check-release.sh 通过 + AR05 三入口（split/standalone/index）双环境（http/file）功能一致
- **⚠️ 安全红线**：档案 `Supabase配置记录.md` 含数据库密码，测试报告 / 测试记录中不得引用该密码；验收用例只用 config.js 的 anonKey 与环境内新建账号。
