# TEST v0.24.0 · Supabase 账号功能测试用例与验收锚点

> **版本**：v0.24.0（草案，PRD §6/§11 锚点定稿版）
> **日期**：2026-08-27
> **测试工程师**：worker_79160b29
> **依据**：`PRD_v0.24.0_Supabase账号功能.md`（§6 AC 验收条件 / §11 验收锚点）
> **被测代码**：config.js / auth.js / records.js / supabase.min.js / standalone-split.html（已集成）+ standalone.html / index.html（待同步）
> **安全红线**：档案 `Supabase配置记录.md` 含数据库密码，**本报告及一切测试记录不得引用该密码**；验收仅使用 config.js 的 anonKey 与环境内新建测试账号。

---

## 0. 缺陷分级标准（P0-P3）

| 级别 | 定义 | 示例 |
|------|------|------|
| P0 | 崩溃/数据丢失/安全漏洞/主流程不可用 | 排盘崩溃；记录丢失；用户 A 能看到 B 的记录 |
| P1 | 功能错误，有绕过或次要路径 | 迁移重复产生记录；删除后列表不刷新 |
| P2 | 体验问题/边界缺陷，不影响主流程 | 错误提示文案不准确；分页加载异常 |
| P3 | 轻微问题/打磨项 | 样式错位；提示延迟 |

---

## 1. 测试准备

### 1.1 环境

- 本地 http 服务：`python3 -m http.server`（主环境）
- file:// 直接打开（离线/回退环境，AR05）
- 三入口：standalone-split.html / standalone.html / index.html（AR05）
- Supabase：bazi-paipan 项目（config.js 真实 anonKey，publishable 级别）

### 1.2 测试账号（环境内新建，不得使用档案中的真实用户）

| 代号 | 邮箱（环境内新建） | 密码 | 用途 |
|------|-------------------|------|------|
| 账号 A | test.a.v024@example.com（新建） | Test123456 | 主流程 + 保存/列表/删除 |
| 账号 B | test.b.v024@example.com（新建） | Test123456 | 用户隔离验证（AC13） |

> 注：@example.com 为保留域，Supabase 免邮箱确认已开启，注册即登录，无需真实收信。

### 1.3 本地数据准备（迁移用例）

- 清空 localStorage：`bz_archives_v2`、`PAIPAN_MIGRATED`、`PAIPAN_PRESET_MIGRATED`、`bz_pending_ops`、`bz_remember_email`
- 构造本地记录：手动排盘 2~3 条（含 1 条 1987-05-06 06:30 节气边界数据，1 条普通数据），确认 `bz_archives_v2` 非空

---

## 2. 账号功能用例（AC01-AC08）

### AC01 未登录打开应用显示登录遮罩 — P0

- **前置**：清空会话（localStorage 无 `sb-bazi-paipan-auth-token`）；config.js 凭证已配置
- **步骤**：
  1. 打开三入口任一（http 环境）
  2. 观察首屏
- **预期**：`#authOverlay` 显示（flex），排盘页 `.page` 隐藏；无法看到/操作排盘表单
- **缺陷级别**：P0（主流程不可用）

### AC02 注册新账号成功并自动登录 — P0

- **前置**：AC01 状态；账号 A 未注册过
- **步骤**：
  1. 登录遮罩点「注册」→ 切到注册盒（`#authRegisterBox` 显示）
  2. 输入合法邮箱（test.a.v024@example.com）+ ≥8 位密码（Test123456）
  3. 点「注册并登录」（`#btnAuthRegister2`）
- **预期**：注册成功且免邮箱确认 → 自动登录 → `#authOverlay` 隐藏、排盘页可用；无邮箱验证提示
- **缺陷级别**：P0

### AC03 注册已存在邮箱 / 密码过短 — P1

- **前置**：账号 A 已注册（AC02 后）
- **步骤**：
  1. 注册盒输入已存在邮箱 + 任意 ≥8 位密码 → 提交
  2. 注册盒输入新邮箱 + 密码 `123`（<8 位）→ 提交
- **预期**：① `#regError` 显示「该邮箱已注册」；② 前端即拦截，`#regError` 显示「密码至少 8 位」，不发网络请求
- **缺陷级别**：P1（错误分支）

### AC04 登录（正确邮箱+密码）— P0

- **前置**：账号 A 已注册；当前未登录（登出态）
- **步骤**：登录盒输入账号 A 邮箱+密码 → 点「登 录」（`#btnAuthLogin`）
- **预期**：登录成功 → `#authOverlay` 隐藏、排盘页可用；邮箱被记住（`bz_remember_email` 预填，AC 复用）
- **缺陷级别**：P0

### AC05 登出回到登录遮罩 — P0

- **前置**：已登录（AC04）
- **步骤**：点输入行「🚪 登出」（`#btnLogout`）
- **预期**：`#authOverlay` 显示、排盘页隐藏；再次点「排盘」被拦截（alert「请先登录后使用排盘功能」）
- **缺陷级别**：P0

### AC06 刷新页面会话恢复（30 天免登录）— P0

- **前置**：已登录（AC04）
- **步骤**：F5 刷新页面（不清 localStorage）
- **预期**：无需重新登录直接进入排盘页（`getSession()` 恢复；storageKey `sb-bazi-paipan-auth-token` 存在）
- **缺陷级别**：P0

### AC07 登录错误密码统一提示 — P1

- **前置**：未登录
- **步骤**：登录盒输入账号 A 邮箱 + 错误密码 → 提交
- **预期**：`#authError` 显示「邮箱或密码错误」；不泄漏具体原因（不区分「邮箱不存在」与「密码错误」）
- **缺陷级别**：P1

### AC08 未登录点「排盘」/「AI录入」被拦截 — P0

- **前置**：未登录（AC05 登出态）；不勾选 ?test=1
- **步骤**：
  1. 手动输入出生信息 → 点「排盘」
  2. 点「AI录入」入口（doAiParse → doPaipan 链路）
- **预期**：两次均 alert「请先登录后使用排盘功能」+ `#authOverlay` 显示；排盘结果不产生
- **缺陷级别**：P0（守卫核心）

---

## 3. 云端记录用例（AC09-AC14）

### AC09 登录后排盘 → 保存云端成功 — P0

- **前置**：账号 A 已登录（AC04）；已排盘（如 1982-10-18 05:01 男）
- **步骤**：点「💾 保存云端」（`#btnSaveCloud`）
- **预期**：alert「已保存到云端」；列表刷新到第 1 页（`#recordsList` 出现该条，显示隐私名/出生/保存时间）
- **缺陷级别**：P0

### AC10 未排盘点「保存云端」被提示 — P1

- **前置**：已登录；未排盘（结果区为空）
- **步骤**：点「💾 保存云端」
- **预期**：alert「请先完成排盘，再保存到云端」；云端不产生记录
- **缺陷级别**：P1

### AC11 打开「我的排盘」列表 + 查看详情 — P0

- **前置**：账号 A 云端已有 ≥1 条（AC09）
- **步骤**：
  1. 点「☁️ 我的排盘」（`#btnMyRecords`）→ `#recordsOverlay` 显示
  2. 点列表某条「查看」→ `#recordDetailOverlay` 显示
- **预期**：① 列表倒序显示（最新在前），含隐私名（getDisplayName 降级链）+ 出生 + 保存时间；② 详情含：隐私名/性别/出生/日历类型/真太阳时/保存时间/**四柱简表**（result_data.bazi 渲染，无需重算）
- **缺陷级别**：P0

### AC12 删除记录 — P0

- **前置**：AC11 列表态
- **步骤**：点某条「删除」→ confirm「确定删除这条排盘记录？」→ 确认
- **预期**：记录删除，列表刷新（该条消失）；再次打开列表不存在
- **缺陷级别**：P0

### AC13 用户隔离（核心安全锚点）— P0

- **前置**：账号 A 已保存 ≥1 条记录；账号 B 已注册并登录
- **步骤**：
  1. 账号 B 登录 → 打开「我的排盘」
  2. 构造请求：账号 B 的会话直接 select/delete 账号 A 的记录 id（浏览器控制台 / Supabase REST）
- **预期**：① 账号 B 列表**看不到**账号 A 的任何记录（RLS select 限 user_id=auth.uid()）；② 直接跨用户 select/delete 被 RLS 拒绝（错误 42501 类，不返回 A 数据）；③ 伪造 user_id 的 insert 被拒
- **缺陷级别**：P0（安全）

### AC14 保存失败（断网）入队列，恢复后自动补传 — P1

- **前置**：已登录；已排盘
- **步骤**：
  1. 开发者工具 Network 切 Offline（或断网）→ 点「保存云端」
  2. 恢复网络（切 Online）→ 等待自动重试（登录态下 flushPendingQueue 触发）
- **预期**：① 断网时 alert「保存失败…已加入本地队列」；`bz_pending_ops` 含 1 条；② 恢复后自动补传成功，`bz_pending_ops` 清空，云端列表出现该条
- **缺陷级别**：P1

---

## 4. 迁移用例（AC15-AC19）

### AC15 登录时本地无记录：不弹窗直接标记 — P0

- **前置**：清空 localStorage（`bz_archives_v2` 为空/不存在）；账号 A 未登录
- **步骤**：登录账号 A
- **预期**：无迁移 confirm 弹窗；`PAIPAN_MIGRATED` 被标记为 1；直接进入排盘页
- **缺陷级别**：P0（防误弹窗）

### AC16 登录时本地有 N 条 → 确认迁移，N 条全上传 — P0

- **前置**：1.3 已构造本地记录（如 3 条：1987-05-06 06:30 节气边界 + 普通 + 农历闰月）；`PAIPAN_MIGRATED` 未标记；账号 A 未登录
- **步骤**：登录账号 A → confirm「检测到本地有 3 条排盘记录，是否迁移…」→ 确认
- **预期**：3 条全部上传成功（一条不丢）；云端列表出现 3 条；`PAIPAN_MIGRATED=1`；数据含 `migratedFromLocal:true` 标记；1987-05-06 06:30 条 result_data 完整（四柱可显示）
- **缺陷级别**：P0

### AC17 重复迁移幂等（不产生重复记录）— P0

- **前置**：AC16 完成（已迁移 3 条）
- **步骤**：
  1. 登出 → 登录账号 A（再次触发 checkAndMigrate）
  2. 手动再次调用 `window.RECORDS.migrateLocalToCloud()`
- **预期**：云端记录数仍为 3（不新增）；无重复；`_fp` 指纹 + 内容摘要双路去重生效（arch-id / fp-内容 命中跳过）
- **缺陷级别**：P0（迁移核心）

### AC18 迁移中途失败入队列，恢复自动补传 — P1

- **前置**：本地有 2 条未迁移记录；账号 A 未登录
- **步骤**：
  1. Network 切 Offline → 登录账号 A → confirm 确认迁移
  2. Network 切 Online → 等待重试
- **预期**：① 失败条数进 `bz_pending_ops`；② 网络恢复后自动补传成功，队列清空，云端最终 2 条全到
- **缺陷级别**：P1

### AC19 预置 16 孩模板自动上传（只一次）— P2

- **前置**：账号 A 已登录；`PAIPAN_PRESET_MIGRATED` 未标记
- **步骤**：登录（checkPresetMigrate 自动触发）
- **预期**：预置模板自动上传（isPreset:true）；`PAIPAN_PRESET_MIGRATED=1`；再次登录/刷新不重复上传（预置记录数不变）
- **缺陷级别**：P2（模板数据，非用户主数据）

---

## 5. 自动化断言（T01-T04，?test=1）

> 实现位置：main.js ?test=1 断言段（v0.24.0 新增小节）；**必须同步到 standalone.html / index.html 内联版断言段**（v0.22.0 素素断言 / v0.23.4 交运判空教训）。断言数：v0.23.4 基线 232 条 + 新增 ≥4 条。

### T01 ?test=1 模式 doPaipan 不被拦截（回归兼容）— P1

- **断言**：`window.APP.__authGuarded === true`（守卫已包装）；且 `?test=1` 下调用 doPaipan 不弹登录遮罩、不 alert「请先登录」
- **代码锚点**：auth.js init() 守卫分支 `if (isTestMode()) return origDoPaipan.apply(...)`
- **缺陷级别**：P1（缺此则 224 条算法回归全崩）

### T02 凭证未配置走兜底提示分支 — P1

- **断言**：`CFG.url` 含 `PASTE_` 或空时，auth.init 不创建 client、非 test 模式显示登录遮罩并提示「Supabase 凭证未配置」；test 模式直接放行
- **代码锚点**：auth.js init() 凭证检查分支
- **缺陷级别**：P1

### T03 contentFingerprint 幂等 — P1

- **断言**：相同输入对象（name/gender/year/month/day/hour/min 相同）→ 相同指纹；任一字段不同 → 不同指纹；不含 id（内容摘要 `fp-...` 前缀）
- **代码锚点**：records.js contentFingerprint
- **缺陷级别**：P1（迁移去重基础，错则 AC17 幂等失效）

### T04 recordFingerprint 指纹规则 — P1

- **断言**：含 id 的档案 → `arch-{id}`；无 id → `fp-{name-gender-year-month-day-hour-min}` 内容摘要
- **代码锚点**：records.js recordFingerprint
- **缺陷级别**：P1（迁移指纹规则，错则 AC16 去重失效）

---

## 6. 回归验收用例（AR01-AR06）

### AR01 ?test=1 全量断言 — P0

- **步骤**：三入口各以 `?test=1` 打开，执行全量断言
- **预期**：v0.23.4 基线 224+8=232 条旧断言全过 + 新增 T01-T04（≥4 条）通过，0 失败
- **缺陷级别**：P0（硬性门槛）

### AR02 常规排盘结果不变（v0.24 不触碰算法）— P0

- **步骤**：`?test=1` 模式（守卫放行）排盘：① 1982-10-18 05:01 男；② 王阳明 1472-10-31 22:01；③ 苏轼 1037
- **预期**：结果与 v0.23.4 完全一致（月柱/日柱/起运/交运等关键字段逐项比对）；节气当天 1987-05-06 06:30 仍为辰月（回归 v0.23.4 修复不退化）
- **缺陷级别**：P0

### AR03 真太阳时 / 农历 / 双胞胎 / 隐私开关 / 截图功能回归 — P1

- **步骤**：?test=1 模式下依次验证：真太阳时（跨省）、农历含闰月、双胞胎同八字、隐私开关（艺名显示）、盘面截图（#btnScreenshot 导出 PNG）
- **预期**：全部行为与 v0.23.4 一致，无异常
- **缺陷级别**：P1

### AR04 三文件一致性 check-release.sh — P0

- **步骤**：`bash scripts/check-release.sh .`
- **预期**：退出码 0；六模块段（constants/algorithm/archive/gongwei/render/main）index vs standalone 一致；三文件内联 JS 语法通过；HTML 关键 id 全覆盖（**建议编程师把 v0.24 新增 id 纳入 KEYS：authOverlay/authEmail/btnAuthLogin/btnSaveCloud/btnMyRecords/recordsOverlay/recordsList/recordDetailOverlay**）
- **缺陷级别**：P0（L1 教训防线）

### AR05 三入口 × 双环境功能一致 — P0

- **步骤**：standalone-split / standalone / index × http:// / file:// 共 6 组合，各执行：打开→登录遮罩→登录→排盘→保存→列表→详情→删除→登出
- **预期**：6 组合账号功能与排盘结果完全一致；file:// 下 supabase.min.js 本地化可用（无 CDN 依赖）
- **缺陷级别**：P0（单体版同步门槛）

### AR06 未配置凭证环境不崩溃 — P1

- **步骤**：临时将 config.js 凭证改为占位（PASTE_xxx 或空）→ 打开应用（非 test）
- **预期**：应用不崩溃；显示登录遮罩 + 提示「Supabase 凭证未配置」；?test=1 下可正常排盘（放行）
- **缺陷级别**：P1（兜底路径）

---

## 7. 验收执行计划（发布前回归清单）

| 阶段 | 内容 | 依赖 |
|------|------|------|
| A | T01-T04 自动化断言实现 + 三入口同步 | 编程师 T3 |
| B | ?test=1 全量断言（AR01）+ 算法回归（AR02/AR03） | A |
| C | check-release.sh 通过（AR04） | 编程师 T2 |
| D | 浏览器级功能：AC01-AC08 / AC09-AC14 / AC15-AC19 | A |
| E | 三入口双环境（AR05）+ 未配置凭证（AR06） | D |
| F | 输出验收报告（缺陷清单 + 复现 + 根因） | B-E 完成 |

## 8. 用例统计

| 分组 | 用例数 | P0 | P1 | P2 |
|------|:---:|:---:|:---:|:---:|
| 账号 AC01-AC08 | 8 | 6 | 2 | 0 |
| 云端记录 AC09-AC14 | 6 | 4 | 2 | 0 |
| 迁移 AC15-AC19 | 5 | 3 | 1 | 1 |
| 自动化 T01-T04 | 4 | 0 | 4 | 0 |
| 回归 AR01-AR06 | 6 | 4 | 2 | 0 |
| **合计** | **29** | **17** | **11** | **1** |

## 9. 安全声明

- 本测试文档与后续验收报告**不含任何数据库密码 / service_role key / secret**；config.js 中 anonKey 为 publishable 级别，可公开。
- 测试账号均为环境内新建（@example.com），与生产真实用户无关联。

---

## 10. ADR v0.24.0 对齐补充（2026-08-27 读取 ADR 后新增）

> 来源：ADR_v0.24.0_Supabase账号功能.md（决策 1/2/4/5 + 验证方案 + 风险矩阵）

### 10.1 T01-T04 挂载机制与 9 处一致检查（AR01 执行说明）

- 挂载机制（ADR 决策 2）：main.js 测试区渲染段后暴露 `window.__testAppend`（L1248 `})();` 前）；auth.js 末尾测试段（T01/T02，含 `isConfigMissing` 纯函数）；records.js 末尾测试段（T03/T04，指纹函数挂 `window.RECORDS`）。
- **9 处一致检查**：main.js `__testAppend` 段、auth.js 测试段、records.js 测试段 × 三入口（split 外部 + standalone 内联 + index 内联）必须全部存在且一致。
- 断言失败排查顺序：① 三入口 ?test=1 各自看 #test-summary 是否含「含 v0.24 追加断言」字样；② 缺则查对应入口内联段未同步（L1 教训）。

### 10.2 check-release.sh 扩展验收点（AR04 细化）

- KEYS 应含 16 个 v0.24 id（authOverlay/authLoginBox/authRegisterBox/authEmail/authPassword/regEmail/regPassword/btnAuthLogin/btnAuthRegister2/btnLogout/btnSaveCloud/btnMyRecords/recordsOverlay/recordsList/recordDetailOverlay/recordDetail，以实际为准）；
- MODULES 追加 config/auth/records/supabase 四段（index vs standalone 内联段 cmp）；
- 新增第 4 步：外部 JS（auth.js/records.js/config.js/supabase.min.js）vs standalone.html 内联段字节一致；
- 验收时同时确认：supabase.min.js 内联段 node --check 通过（压缩代码不被换行转义破坏）。

### 10.3 R7 竞态观察点（AC16 补充）

- onLogin 内 `loadAndRenderRecords` 与 `checkAndMigrate` 并行触发；迁移确认后再次 `loadAndRenderRecords` 刷新。
- 观察点：登录 → 迁移 confirm → 迁移完成后列表应出现迁移记录（最终一致）；若列表短暂为空后刷新出现为正常竞态，若持续缺失为缺陷（P1）。

### 10.4 1400 前简化排盘迁移边界（AC16 补充）

- 本地档案含 1400 年前出生（如苏轼 1037）且无 bazi 快照 → 迁移现算 try/catch 兜底：result_data 可为空骨架，记录仍上传（input_data 完整），不中断后续迁移；若整条迁移中断/抛异常 → P1。
- 详情页对空骨架 result_data 应不崩溃（四柱简表区显示空白而非报错）→ P1。

### 10.5 file:// 环境 CORS 验证（AR05 补充）

- file:// 下 Supabase 网络调用预期通过（Supabase 默认允许 all origins）；若 file:// 打开后登录/列表报 CORS/网络错误 → P1 缺陷（本地化库 + anonKey 双环境兼容失败）。

### 10.6 RLS 4 条策略验证口径（AC13 补充）

- 按 ADR 决策 5：select/insert/update/delete 四策略均限 `user_id = auth.uid()`；update 保留为防御性（前端无 update 操作）。
- AC13 执行时除 B 读不到 A 外，可附加验证：B 以 A 记录 id 执行 update 被 RLS 拒（42501 类）→ 同为 P0 安全项。





