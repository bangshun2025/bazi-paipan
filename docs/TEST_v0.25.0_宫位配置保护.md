# TEST v0.25.0 · 宫位配置保护测试用例与验收锚点

> **版本**：v0.25.0（草案，PRD §6.3 / §十一 + ADR §七 AC 映射表定稿版）
> **日期**：2026-08-29
> **测试工程师**：worker_79160b29
> **依据**：`PRD_v0.25.0_宫位配置保护.md`（§5 FR1-6 / §6 AC+AR / §十一 锚点）+ `ADR_v0.25.0_宫位配置保护.md`（§一 决策 1-5 / §七 映射表）
> **被测代码**：gongwei.js（主改动）/ gongwei-cloud.js（新增）/ auth.js（钩子）/ main.js（T01-T06）/ standalone-split.html / standalone.html / index.html / scripts/check-release.sh / api/handler.rb
> **断言数基准**：247 → **253**（v0.24 的 247 + v0.25 新增 T01-T06 共 6 条）
> **安全红线**：⚠️ 测试前必须备份 localStorage 4 键（bz_gongwei_groups / bz_gongwei_trash / bz_gongwei_selected / bz_gongwei_fav），测试后原样恢复；不得在正式账号/真实用户数据上做破坏性导入测试；报告不引用任何数据库密码。

---

## 0. 缺陷分级标准（P0-P3）

| 级别 | 定义 | 示例 |
|------|------|------|
| P0 | 崩溃/数据丢失/安全漏洞/主流程不可用 | 宫位数据静默丢失；导入覆盖且无备份；损坏数据导致排盘崩溃 |
| P1 | 功能错误，有绕过或次要路径 | 导出缺键；导入校验漏分支；三文件不同步导致某入口无导出/导入 |
| P2 | 体验问题/边界缺陷，不影响主流程 | 提示文案不准确；corrupt 备份保留超过 1 份 |
| P3 | 轻微问题/打磨项 | 按钮样式错位；说明文案缺失 |

---

## 1. 测试准备

### 1.1 环境

- 本地 http 服务：`python3 -m http.server 8765`（主环境，http://localhost:8765）
- file:// 直接打开（回退/离线环境，AR06）
- 三入口：standalone-split.html / standalone.html / index.html（AR05）
- Supabase：bazi-paipan 项目（config.js anonKey，publishable 级别；user_gongwei_config 表 + RLS 需已由编程师/架构师完成 DDL）

### 1.2 测试账号（环境内新建，沿用 v0.24.0 账号）

| 代号 | 邮箱 | 密码 | 用途 |
|------|------|------|------|
| 账号 A | test.a.v024@example.com | Test123456 | 云端已有配置（首传后）+ 登录拉取覆盖（AC10） |
| 账号 B | test.b.v024@example.com | Test123456 | 云端无配置（首传）+ 用户隔离（AC11） |

### 1.3 localStorage 4 键备份/恢复流程（数据安全红线，测试前后必须执行）

- **备份**：测试脚本（CDP）在操作前读取 4 键原文存入内存：
  ```js
  const KEYS = ['bz_gongwei_groups','bz_gongwei_trash','bz_gongwei_selected','bz_gongwei_fav'];
  const backup = {}; KEYS.forEach(k => backup[k] = localStorage.getItem(k));
  ```
- **恢复**：断言后原样写回；原值为 null（从未写过）→ `removeItem(k)` 而非 `setItem(k,'')`（ADR 决策 5 陷阱 3）
- **适用**：T03-T06 断言测试、AC03 清空导入、AC06/AC07 损坏模拟——全部走「备份→操作→断言→恢复」闭环

---

## 2. 新增自动化断言（?test=1，T01-T06）

> 挂载：main.js ?test=1 测试区（gongwei.js 六模块之一，main 前已加载，可直接同步断言）；必须同步到 index.html/standalone.html 内联 main 段（L1 教训）。断言总数 247→253。标签前缀「v0.25 T0x:」。

| 编号 | 断言 | 实现（ADR 决策 5） | 级别 |
|------|------|--------------------|:---:|
| T01 | GONGWEI_SCHEMA_VERSION=1，初始化后 localStorage 有 bz_gongwei_schema_version=1 | 读 window.GONGWEI.GONGWEI_SCHEMA_VERSION + localStorage.getItem | P0 |
| T02 | buildExportPayload() 返回 JSON 含 4 键 + schemaVersion，JSON.parse(JSON.stringify()) 可逆 | 调 GONGWEI.buildExportPayload()，断言 keys 与往返相等 | P0 |
| T03 | applyImportPayload(合法数据) 后 loadGroups/loadSelected/loadFav 与导入值一致 + 产生 *_backup_* 键 | 备份 4 键→构造合法 payload→apply→断言→恢复 | P0 |
| T04 | validateImportPayload(非法数据) 返回 ok:false；数据不变、无 backup 键 | validate({bad:1}) → ok:false；apply 不被调/不产生 backup→恢复 | P0 |
| T05 | loadGroups() 遇损坏 JSON → 返回默认 14 组 + 产生 *_corrupt_* 备份键 | setItem('{broken')→loadGroups()→断言默认组+corrupt 键→恢复 | P0 |
| T06 | loadGroups() 遇缺失 → 正常初始化默认 14 组，无 corrupt 备份 | removeItem→loadGroups()→断言默认组+无 corrupt 键→恢复 | P0 |

- **通过标准**：三入口（split/standalone/index）× 双环境（http/file）`?test=1` 均输出「全部 253 条断言通过」；默认组数 = Object.keys(CONST.GONGWEI_MAP).length = 14

---

## 3. 功能验收（AC01-AC13，浏览器级）

### AC01 宫位设置面板显示导出/导入按钮 — P0

- **前置**：正常打开应用；宫位设置面板 `gzSettingsOverlay`
- **步骤**：打开宫位设置面板 → 查看 footer 区（gzFooterAll）
- **预期**：可见「📤 导出配置」`#btnExportConfig`、「📥 导入配置」`#btnImportConfig`；隐藏 file input `#gzFileImport` 存在；说明文案 `#gzCloudSyncNote` 可见（「宫位配置仅保存在本机浏览器…登录后自动同步到云端」）
- **级别**：P0（FR1/FR2 入口缺失即主功能不可用）

### AC02 点击导出下载 JSON 含 4 键 + schemaVersion — P0

- **前置**：AC01 状态；当前有宫位数据（默认 14 组即可）
- **步骤**：点「导出配置」→ 检查下载文件
- **预期**：下载文件名匹配 `gongwei-config_YYYYMMDD_HHmmss.json`；内容为 JSON：`{schemaVersion:1, exportedAt:<ISO>, groups:[...], trash:[...], selected:[...], fav:[...]}` 6 字段齐全；JSON.parse 可逆
- **级别**：P0

### AC03 导出→清空→导入完整恢复 — P0

- **前置**：AC02 已导出文件（含用户修改：新增组「测试组」+ 改标签 + 勾选若干 + 常用宫位）
- **步骤**：修改宫位（增组/改标签/勾选/常用）→ 导出 → 按 1.3 备份 4 键 → 清空 4 键 → 刷新页面（此时恢复默认 14 组）→ 导入刚才的 JSON 文件
- **预期**：宫位数据完整恢复——组/标签/勾选/常用与导出前一致；alert「宫位配置已导入」
- **级别**：P0

### AC04 导入非法文件不覆盖 + 具体错误 — P0

- **前置**：AC01 状态；当前 4 键有已知值；按 1.3 备份
- **步骤**（3 个子用例）：
  1. 导入非 JSON 文件（如 .txt 内容 hello）→ 预期 alert「文件不是有效的宫位配置 JSON」
  2. 导入缺 groups 字段 JSON（`{schemaVersion:1, trash:[]}`）→ 预期 alert「数据结构不完整」
  3. 导入 schemaVersion 超版本 JSON（`{schemaVersion:99, groups:[]}`）→ 预期 alert「版本不兼容（文件 v99 > 当前 v1）」
- **预期**：每次失败均 ① alert 具体错误 ② 现有 4 键保持不变 ③ 无 `*_backup_*` 键产生
- **级别**：P0

### AC05 导入合法文件前备份当前 4 键 — P0

- **前置**：AC01 状态；按 1.3 备份当前 4 键
- **步骤**：导入 AC02 导出的合法 JSON → 检查 localStorage
- **预期**：导入成功后 localStorage 存在 `bz_gongwei_groups_backup_<ts>` / `bz_gongwei_trash_backup_<ts>` / `bz_gongwei_selected_backup_<ts>` / `bz_gongwei_fav_backup_<ts>` 4 个备份键；UI 刷新为导入值
- **级别**：P0

### AC06 groups 损坏 → alert + corrupt 备份 + 恢复默认 — P0

- **前置**：按 1.3 备份 4 键
- **步骤**：`localStorage.setItem('bz_gongwei_groups','{broken')` → 刷新页面
- **预期**：① alert「宫位配置数据已损坏，已为您备份原数据并恢复默认设置。可在宫位设置中导入备份。」 ② 存在 `bz_gongwei_groups_corrupt_<ts>`（内容 = 损坏原文 '{broken'） ③ 宫位恢复默认 14 组
- **级别**：P0（防静默重置核心）

### AC07 selected/trash/fav 损坏 → 不抛异常 + 空数组 + 备份 — P0

- **前置**：按 1.3 备份 4 键
- **步骤**：三个键分别 `setItem('...','not json')` → 刷新
- **预期**：页面不崩溃、控制台无未捕获异常；对应键按空数组处理；存在 `*_corrupt_<ts>` 备份键
- **级别**：P0

### AC08 全新浏览器首启 → 正常初始化，无提示无 corrupt 备份 — P0

- **前置**：全新 profile（或清空全部 bz_gongwei_* 键 + schema 键）
- **步骤**：打开应用 → 宫位设置面板
- **预期**：正常初始化默认 14 组；**无任何 alert**；无 `*_corrupt_*` 键
- **级别**：P0（防误伤首启用户）

### AC09 初始化后 bz_gongwei_schema_version=1 — P1

- **前置**：AC08 状态
- **步骤**：检查 localStorage
- **预期**：`bz_gongwei_schema_version` = `"1"`（GONGWEI_SCHEMA_VERSION=1）
- **级别**：P1

### AC10 登录账号 A（云端已有配置）→ 云端覆盖本地 — P1

- **前置**：账号 A 云端 user_gongwei_config 已有记录（先登录 A 修改宫位 → 触发首传/推云，再登出）；本地 4 键改为与云端不同的值
- **步骤**：登录账号 A → 观察宫位
- **预期**：登录后宫位 UI 刷新为**云端值**（云端为准）；localStorage 4 键被云端覆盖；无报错
- **级别**：P1

### AC11 登录账号 B（云端无配置）→ 本地首传推云 — P1

- **前置**：账号 B 云端无记录；B 本地 4 键有自定义值
- **步骤**：登录账号 B → 检查云端 user_gongwei_config
- **预期**：登录后云端出现 B 的记录（groups/trash/selected/fav = B 本地值，schema_version=1）；本地不被覆盖
- **级别**：P1

### AC12 断网状态登录 → 回落本地不崩溃 — P1

- **前置**：断网（或 CDP 拦截 supabase 请求）；本地 4 键有值
- **步骤**：登录（云端不可达）→ 观察
- **预期**：登录流程不崩溃；宫位保持本地值；无未捕获异常；恢复网络后修改宫位可正常推云
- **级别**：P1

### AC13 未登录修改宫位 → 纯本地零云请求 — P1

- **前置**：未登录状态；网络面板监听 supabase 请求
- **步骤**：修改宫位（增组/勾选/常用）→ 观察网络
- **预期**：localStorage 4 键正常更新；**无任何 user_gongwei_config 云请求**；行为与 v0.24.0 一致
- **级别**：P1

---

## 4. 回归验收（AR01-AR06）

| 编号 | 场景 | 步骤 | 预期 | 级别 |
|------|------|------|------|:---:|
| AR01 | ?test=1 全量断言 | 三入口 × 双环境跑 ?test=1 | 253 条全绿（247 旧 + T01-T06） | P0 |
| AR02 | 排盘结果回归 | 1982-10-18 05:01 男 / 王阳明 1472-10-31 22:01 / 苏轼 1037 排盘 | 结果与 v0.24.0 完全一致（宫位保护零算法改动） | P0 |
| AR03 | 宫位功能回归 | 分组增删改/标签/勾选/常用宫位/排序/回收站 | 与 v0.20.0-v0.24.0 行为一致（仅数据层容错 + UI 壳，CRUD 逻辑不变） | P0 |
| AR04 | 三文件一致性 | `bash scripts/check-release.sh .` | 退出码 0「全部校验通过」；KEYS 含 btnExportConfig/btnImportConfig/gzFileImport；第 4 步覆盖 gongwei.js 外部 vs 内联 | P0 |
| AR05 | 三入口功能一致 | split/standalone/index 各执行导出/导入/防重置 | 行为一致；内联版含导出/导入按钮与容错（grep 各 1 命中 btnExportConfig/btnImportConfig/gzFileImport/gzCloudSyncNote） | P0 |
| AR06 | 双环境（http/file） | http:// 与 file:// 各执行导出/导入 | 均正常（Blob 下载 + FileReader 原生 API 双环境兼容） | P1 |

---

## 5. 执行记录

> 待编程师实现完成汇报后填写：六入口 253 断言结果 / check-release 结果 / AC 各用例 PASS-FAIL / 缺陷清单（编号-级别-复现-根因）/ 回归结论。


