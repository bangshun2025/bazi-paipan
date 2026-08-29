# ADR v0.25.0 — 宫位配置保护（容错改造 + 导出/导入 + 上云同步 + schema 版本化）

> **版本**：v1.0
> **日期**：2026-08-29
> **作者**：架构师（worker_498043b4）
> **状态**：待评审
> **关联文档**：PRD_v0.25.0_宫位配置保护.md（定稿）、docs/宫位数据排查报告.md（根因已确认）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `gongwei.js`（主改动，模块版） |
| 当前行数 | 1139 行（实测） |
| 改动类型 | ① loadGroups/loadTrash/loadSelected/loadFav 容错改造（FR3）；② exportConfig/importConfig/validateImportPayload/applyImportPayload 新函数（FR1/FR2）；③ GONGWEI_SCHEMA_VERSION 常量 + ensureSchemaVersion + migrateGongweiSchema 骨架（FR4）；④ persist* 末尾挂 GONGWEI_CLOUD.markDirty 钩子（FR5）；⑤ window.GONGWEI 挂载新函数 |
| **目标文件 2** | `gongwei-cloud.js`（新增，上云同步模块） |
| 当前行数 | 无（新建，预计 ~180 行） |
| 改动类型 | IIFE + window.GONGWEI_CLOUD：onLogin/onLogout/markDirty/pullCloudConfig/pushCloudConfig + 测试段（仿 auth.js/records.js v0.24 模式） |
| **目标文件 3** | `auth.js`（登录事件钩子扩展） |
| 当前行数 | 403 行（实测） |
| 改动类型 | onLoginSuccess 追加 `GONGWEI_CLOUD.onLogin(user)`；doLogout/SIGNED_OUT 追加 `GONGWEI_CLOUD.onLogout()`（最小侵入，各 ~1 行） |
| **目标文件 4** | `main.js`（测试区 + __testAppend） |
| 当前行数 | 1307 行（实测） |
| 改动类型 | ?test=1 测试区新增 T01-T06（GONGWEI 纯逻辑，gongwei.js 在 main 前加载可同步测）；**同步到 index.html/standalone.html 内联 main 段**（L1 教训） |
| **目标文件 5** | `standalone-split.html`（主产物 UI） |
| 当前行数 | 911 行（实测） |
| 改动类型 | 设置面板 gzFooterAll 加「导出配置/导入配置」按钮 + 隐藏 file input + 说明文案；`<script src="gongwei-cloud.js">` 加在 records.js 之后；头部注释 v0.24.0→v0.25.0 |
| **目标文件 6** | `standalone.html`（回退版，单体） |
| 当前行数 | 10546 行（实测） |
| 改动类型 | 同步 UI 段 + gongwei.js 内联段更新 + gongwei-cloud.js 内联段新增 + main.js 内联测试段同步 + 头部注释 v0.25.0 |
| **目标文件 7** | `index.html`（面板版，单体） |
| 当前行数 | 10547 行（实测） |
| 改动类型 | 与 standalone.html 同构同步（当前字节级一致，diff 实测通过）+ 头部注释 v0.25.0 |
| **目标文件 8** | `scripts/check-release.sh` |
| 当前行数 | ~135 行（实测） |
| 改动类型 | KEYS 追加 btnExportConfig/btnImportConfig/gzFileImport；第 4 步外部 vs 内联新增 gongwei.js（防本版本最大漂移风险） |
| **目标文件 9** | `api/handler.rb` |
| 改动类型 | %w[...] 模块列表追加 gongwei-cloud.js |
| **目标文件 10** | `docs/` + `SYSTEM.md` |
| 改动类型 | 新增 PRD/ADR/TEST/QA；SYSTEM.md 版本历史补 v0.25.0 + 文件结构补 gongwei-cloud.js |

> **文件路径**：`/Users/feng/.clacky/ext/local/bazi-paipan/`
>
> **本版本不动**：constants.js（GONGWEI_MAP 14 组默认宫位**逐字节不变**）、algorithm.js、archive.js、render.js——v0.25 是宫位数据保护层，零算法改动（AR02 保证）。

---

## 一、架构决策（对应 PRD §10 五个输入点）

### 决策 1：容错改造方案（PRD §10.1）——统一「缺失/损坏」二分 + corrupt 备份命名规范

**问题**：`loadGroups()`（gongwei.js L88-93）在 `bz_gongwei_groups` 缺失 / JSON 损坏 / 空数组时一律静默 `initGongWeiGroups()` 重建默认——这是用户「数据变回默认」的直接机制（排查报告②确认）。`loadTrash/loadSelected/loadFav` 无 try/catch，损坏时直接抛异常。

**决策：四函数统一「缺失 vs 损坏」二分容错模式**：

| 读取函数 | 现状 | 缺失（首启） | 损坏（JSON.parse 异常 / 非数组 / 空数组） |
|---------|------|-------------|------------------------------------------|
| loadGroups() | L88-93 静默重建 | 正常 `initGongWeiGroups()`，**不提示** | ① 原始串备份到 `bz_gongwei_groups_corrupt_<时间戳>` ② 重建默认 ③ `notifyCorrupt('宫位配置数据已损坏…')` |
| loadTrash() | L94 裸 JSON.parse | 返回 `[]`，**不提示** | 备份损坏串到 `bz_gongwei_trash_corrupt_<时间戳>` → 返回 `[]` → notifyCorrupt |
| loadSelected() | L95 裸 JSON.parse | 返回 `[]`，**不提示** | 备份损坏串到 `bz_gongwei_selected_corrupt_<时间戳>` → 返回 `[]` → notifyCorrupt |
| loadFav() | 裸 JSON.parse | 返回 `[]`，**不提示** | 备份损坏串到 `bz_gongwei_fav_corrupt_<时间戳>` → 返回 `[]` → notifyCorrupt |

**统一实现模式（推荐给编程师，四函数共用）**：
```js
function safeLoad(key, fallback, label) {
  var raw = null;
  try { raw = localStorage.getItem(key); } catch (e) {}
  if (!raw) return fallback();               // 缺失（首启）：不提示，正常初始化
  try {
    var v = JSON.parse(raw);
    if (Array.isArray(v) && v.length > 0) return v;
    if (Array.isArray(v) && v.length === 0) { // 空数组：视为损坏（FR3/D5 明确「空数组→损坏」）
      backupCorrupt(key, raw); notifyCorrupt(label); return fallback();
    }
    backupCorrupt(key, raw); notifyCorrupt(label); return fallback(); // 非数组：损坏
  } catch (e) {                               // JSON.parse 异常：损坏
    backupCorrupt(key, raw); notifyCorrupt(label); return fallback();
  }
}
```

**corrupt 备份键命名与保留策略**：
- 命名：`bz_gongwei_<key>_corrupt_<时间戳>`（时间戳用 `YYYYMMDD_HHmmss`，复用导出文件名风格；或 `Date.now()`——**推荐 Date.now() 毫秒**避免同秒冲突）；
- **保留策略：每个键只保留最近 1 份**——写入新 corrupt 键前先删除同键名的旧 corrupt（按前缀扫描 `bz_gongwei_<key>_corrupt_` 全部删除，再写新键）。理由：PRD §9.5 容量风险 + 用户只需最近一份损坏现场；命名带时间戳是为区分来源，但保留 1 份足够（历史损坏现场无保留价值）；
- **不自动清理**：corrupt 键保留到用户手动清或下次损坏覆盖（与 PRD 一致「备份键不自动清理」指 backup 键，corrupt 键按上述覆盖策略）——⚠️ **此处与 PRD §9.5「corrupt 备份保留最近 1 份（同键覆盖 + 时间戳命名）」精确对齐**。

**提示时机与文案**：
- 仅损坏时提示；缺失（首启）绝不提示（AC08 要求，防误伤新用户）；
- 文案固定：「宫位配置数据已损坏，已为您备份原数据并恢复默认设置。可在宫位设置中导入备份。」（PRD FR3）；
- 实现：`notifyCorrupt(msg)` 内部 `alert(msg)`，**?test=1 模式下跳过 alert 不阻塞**（避免 T05/T06 测试被弹窗卡死）——判断 `isTestMode()`（复用 auth.js 同款正则）或检查 `window.__testAppend` 存在即跳过；
- **空数组视为损坏**（PRD D5 原文「非数组 / 空数组」→ 损坏），即「用户手动清空 groups 想重置」也会走备份+重建——符合 PRD 语义。

**为什么「空数组」算损坏而非缺失**：缺失=从未写过（首启）；空数组=写过但内容被清空/异常（有损），两种状态需要区分（AC08 首启无提示 vs AC06 空数组有备份）。

### 决策 2：导出/导入 JSON 实现（PRD §10.2）——纯函数拆分（validate/apply）+ Blob 下载 + 备份键

**问题**：导出/导入需要「可测试」（T02-T04 断言）且「可回滚」（导入前备份）。若把下载/弹窗/file input 耦合进核心逻辑，main.js 同步测试区无法可靠断言。

**决策：把导入校验与导入执行拆成两个纯函数，UI 壳只做文件读写与弹窗**：

**导出（FR1）**：
- 函数：`GONGWEI.exportConfig()`（UI 壳）：
  1. 读 4 键当前值（`loadGroups/loadTrash/loadSelected/loadFav`——注意：读的是**已加载的内存态**还是 localStorage？**决策：读 localStorage 原文反序列化后的数组**，与设置面板当前显示一致）；
  2. 组装 payload：`{ schemaVersion: GONGWEI_SCHEMA_VERSION, exportedAt: new Date().toISOString(), groups: [...], trash: [...], selected: [...], fav: [...] }`；
  3. `Blob([JSON.stringify(payload, null, 2)], {type:'application/json'})` + `URL.createObjectURL` + `<a download="gongwei-config_YYYYMMDD_HHmmss.json">` 触发下载（零依赖，PRD D2 文件名约定 `gongwei-config_YYYYMMDD_HHmmss.json`）；
  4. 空态不阻断：数据为空/未初始化时导出默认组 JSON（PRD FR1 空态）。
- **可测性**：拆 `GONGWEI.buildExportPayload()` 纯函数（返回 payload 对象，不触发下载）供 T02 断言；`exportConfig()` 内部调用它 + 下载。

**导入（FR2）**：
- 函数拆分：
  - `GONGWEI.validateImportPayload(obj)`（**纯函数**）→ `{ ok: true } | { ok: false, error: '文件不是有效的宫位配置 JSON' | '版本不兼容（文件 vX > 当前 v1）' | '数据结构不完整' }`：
    1. `obj` 为对象且非 null；
    2. `typeof obj.schemaVersion === 'number'` 且 `obj.schemaVersion <= GONGWEI_SCHEMA_VERSION`；
    3. `Array.isArray(obj.groups)`（可空）；`trash/selected/fav` 缺失时按空数组兼容（`Array.isArray(obj.trash||[])` 等）。
  - `GONGWEI.applyImportPayload(obj)`（纯逻辑，可测）：校验通过后
    1. 备份当前 4 键为 `bz_gongwei_<key>_backup_<Date.now()>`（**不自动清理**，PRD D3/§9.5）；
    2. 写入导入数据 4 键 + `bz_gongwei_schema_version=1`；
    3. 刷新内存态与 UI：`gongWeiGroups = loadGroups()` / `selectedGongWei = loadSelected()` 等 + `renderGzSettingsAll(); rebuildGzCbGrid(); updateGongWeiTags()`（PRD FR2 列出的等价流程）；
    4. 返回 `{ ok: true }`。
  - `GONGWEI.importConfig()`（UI 壳）：触发隐藏 `<input type="file" id="gzFileImport" accept=".json">` click；file input `onchange` → `FileReader` 读文本 → `JSON.parse`（失败 → alert「文件不是有效的宫位配置 JSON」，**不覆盖任何数据**）→ `validateImportPayload`（失败 → alert 具体错误，**不覆盖**）→ `applyImportPayload`（成功 → alert「宫位配置已导入」）。
- **校验失败绝不产生 backup 键**（PRD D4：T04 断言「导入非法数据后无 backup 键」）；
- **测试模式**：`applyImportPayload` 内 alert 在 ?test=1 跳过（与 notifyCorrupt 同策略）。

**设置面板 DOM（三文件一致，check-release.sh KEYS 检查）**：
```html
<!-- gzFooterAll 内，「恢复默认」按钮旁 -->
<div style="display:flex;gap:8px;align-items:center;">
  <button id="btnExportConfig" onclick="GONGWEI.exportConfig()">📤 导出配置</button>
  <button id="btnImportConfig" onclick="GONGWEI.importConfig()">📥 导入配置</button>
  <input type="file" id="gzFileImport" accept=".json" style="display:none" onchange="GONGWEI.handleImportFile(event)">
  <!-- 恢复默认 / 回收站 原按钮保留 -->
</div>
<!-- gzSettingsListView 底部说明（FR6） -->
<div id="gzCloudSyncNote" style="font-size:11px;color:var(--c-gray);padding:8px 16px;">宫位配置仅保存在本机浏览器，可点「导出配置」备份；登录后自动同步到云端。</div>
```
- 位置：**仅 gzFooterAll（全部宫位 footer）**，gzFooterFav 不放（PRD FR1「与恢复默认按钮同排」= 恢复默认在 gzFooterAll）；说明文案放 gzSettingsListView 内、footer 上方。

### 决策 3：Supabase 上云同步设计（PRD §10.3）——新表 user_gongwei_config + gongwei-cloud.js 独立模块

**问题**：宫位配置需要登录用户上云（FR5），表结构与同步时序必须与 v0.24 的 paipan_records 模式对齐，且不得影响未登录用户的本地体验（AC13）。

**决策**：

**(a) 表 DDL（Supabase SQL Editor 执行，沿用 v0.24 已验证流程：DDL → GRANT → RLS 实测）**：
```sql
-- 用户宫位配置表（v0.25.0）——单行/用户：user_id 即 PK，upsert on conflict
create table if not exists public.user_gongwei_config (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  groups         jsonb not null default '[]'::jsonb,
  trash          jsonb not null default '[]'::jsonb,
  selected       jsonb not null default '[]'::jsonb,
  fav            jsonb not null default '[]'::jsonb,
  schema_version int   not null default 1,
  updated_at     timestamptz not null default now()
);
alter table public.user_gongwei_config enable row level security;

-- RLS 4 策略（对齐 paipan_records：user_id = auth.uid()）
create policy "own gongwei config select" on public.user_gongwei_config
  for select using (auth.uid() = user_id);
create policy "own gongwei config insert" on public.user_gongwei_config
  for insert with check (auth.uid() = user_id);
create policy "own gongwei config update" on public.user_gongwei_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own gongwei config delete" on public.user_gongwei_config
  for delete using (auth.uid() = user_id);

-- 授权（authenticated 角色；沿用 v0.24 手动 GRANT 流程）
grant select, insert, update, delete on public.user_gongwei_config to authenticated;
```
- **PK 即 user_id**（单行/用户）→ upsert 用 `onConflict: 'user_id'`；无需独立 id 列（与 paipan_records 多行不同，此处是配置单行语义）；
- `updated_at` 由客户端显式写 `new Date().toISOString()`（前端可控时间戳，为未来 merge 预留——本版本用不上但表结构一步到位）。

**(b) gongwei-cloud.js 独立模块（决策：新建，不在 gongwei.js 内扩展）**：
- **理由**：与 v0.24 的 auth.js/records.js 独立模块模式对齐；gongwei.js 是纯本地数据层（六模块之一，需保持零网络依赖，测试可离线）；云同步是账号体系职责，放独立模块可独立测试/独立回滚（云同步挂了不影响本地宫位功能）；
- **加载位置**：standalone-split.html `<script src="gongwei-cloud.js">` 加在 records.js 之后（依赖 AUTH 已挂载 + GONGWEI 已挂载）；api/handler.rb %w[] 追加 gongwei-cloud.js；单体内联段同理（check-release.sh 第 4 步覆盖外部 vs 内联一致性）；
- **模块结构**（IIFE，window.GONGWEI_CLOUD）：
  ```js
  window.GONGWEI_CLOUD = {
    onLogin: onLogin,          // 登录成功 → 拉取云端为准 / 首传本地
    onLogout: onLogout,        // 登出 → 停防抖定时器，本地不回退
    markDirty: markDirty,      // gongwei.js persist* 钩子 → 防抖 3s 推云
    pullCloudConfig: pullCloudConfig,   // 云端拉取（内部 + 测试）
    pushCloudConfig: pushCloudConfig,   // 本地推云（内部 + 测试）
    getLastSyncError: getLastSyncError, // 诊断用（可选）
    _test: { ... }             // v0.25 测试段（?test=1 经 __testAppend 追加，仿 v0.24）
  };
  ```
- **同步时序（D7 简化策略）**：
  1. `onLogin(user)`：`sb = AUTH.getClient()`；若 !sb 直接 return（降级本地）；
     - `pullCloudConfig()`：`sb.from('user_gongwei_config').select('*').eq('user_id', user.id).maybeSingle()`；
     - 云端有记录 → **云端为准**：写入 4 键 + schema_version → 刷新 UI（复用 applyImportPayload 的刷新段）→ 完成；
     - 云端无记录 → **本地推云（首传）**：`pushCloudConfig()` upsert（本地 4 键 + schema_version=1）；
     - 任一失败（断网/限流/RLS）→ `catch` 静默降级本地（console.warn + 记录 lastSyncError），**不丢本地数据、不崩溃**（AC12）；
  2. `markDirty()`：若 `!AUTH.isLoggedIn()` return（未登录纯本地，AC13）；防抖 3s（clearTimeout + setTimeout）→ `pushCloudConfig()`；
  3. `pushCloudConfig()`：读本地 4 键 + schema_version → `sb.from('user_gongwei_config').upsert({ user_id, groups, trash, selected, fav, schema_version, updated_at }, { onConflict: 'user_id' })`；失败 → 静默（下次 markDirty 重试）+ lastSyncError；
  4. `onLogout()`：clearTimeout 防抖定时器；**本地不回退**（PRD FR5「登出不回退本地」）；置 currentUser=null；
- **gongwei.js persist* 钩子（FR5 挂载点）**：persistGroups/persistTrash/persistSelected/persistFav 末尾各加一行：
  ```js
  if (window.GONGWEI_CLOUD && window.GONGWEI_CLOUD.markDirty) window.GONGWEI_CLOUD.markDirty();
  ```
  （gongwei.js 加载早于 gongwei-cloud.js，运行时条件判断即可；未登录时 markDirty 内部直接 return，零网络开销）
- **auth.js 扩展（最小侵入）**：`onLoginSuccess(user)` 内 RECORDS.onLogin 之后追加 `if (window.GONGWEI_CLOUD && window.GONGWEI_CLOUD.onLogin) window.GONGWEI_CLOUD.onLogin(user);`；`doLogout()` 与 SIGNED_OUT 事件中追加 `if (window.GONGWEI_CLOUD && window.GONGWEI_CLOUD.onLogout) window.GONGWEI_CLOUD.onLogout();`（各 1 行）；
- **依赖顺序**：constants → algorithm → archive → gongwei → render → main → config → auth → records → **gongwei-cloud**（auth 提供 AUTH.getClient/isLoggedIn；gongwei 提供 4 键读写；records 不依赖 gongwei-cloud）；
- **?test=1 与云同步**：云同步断言（AC10-AC13）属网络/浏览器级，由测试师手动覆盖；gongwei-cloud.js 测试段只做「未登录 markDirty 不触发」「pushCloudConfig 无 sb 时安全 return」等纯逻辑（可选，不做硬门槛）。

### 决策 4：schema 版本迁移机制（PRD §10.4）——常量 + 版本号写入 + 迁移骨架

**决策**：
- 常量 `GONGWEI_SCHEMA_VERSION = 1` 放 gongwei.js 数据层顶部（loadGroups 之前），并挂到 `window.GONGWEI`（T01 断言）；
- 新增 `bz_gongwei_schema_version` 键：`ensureSchemaVersion()` 在 `initGongWeiData()` IIFE（L1027）内调用——若无该键则写入 `GONGWEI_SCHEMA_VERSION`；persist* 不重复写（一次性写入足够）；
- 未来升级迁移框架（本次只写骨架，不实现逻辑）：
  ```js
  // 未来 schema 升级：读旧版本号 → 按版本执行 merge（补齐新默认字段、保留用户自定义），禁止整体覆盖
  function migrateGongweiSchema(fromVersion) {
    // v0.26+ 若宫位结构变更：switch(fromVersion){ case 1: /* merge 规则 */ break; }
    return GONGWEI_SCHEMA_VERSION;
  }
  ```
  `initGongWeiData()` 中：`var v = parseInt(localStorage.getItem('bz_gongwei_schema_version') || '1', 10); if (v < GONGWEI_SCHEMA_VERSION) migrateGongweiSchema(v);`（当前 v=1 恒等，骨架即可）；
- 导出 JSON 含 `schemaVersion`；导入校验 `schemaVersion <= 1`（决策 2 已含）；
- **旧版本应用兼容**：v0.24.0 及更早不识别新键，但**多出键会被忽略**（PRD §七 发布注意），无回滚风险。

### 决策 5：断言挂载（PRD §10.5）——T01-T06 放 main.js 测试区同步断言 + 三入口同步（L1 教训）

**问题**：T01-T06 是否可放 main.js ?test=1 测试区？与 v0.24 的 auth/records 不同——**gongwei.js 是六模块之一，在 main.js 之前加载**（加载顺序 constants→algorithm→archive→gongwei→render→main），所以 main.js 测试区同步执行时 `window.GONGWEI` **已可用**，T01-T06 全部是 GONGWEI 纯逻辑（schema 版本/导出结构/导入校验/loadGroups 容错），**可以同步断言，无需 __testAppend 追加**。

**决策**：
- T01-T06 直接放进 main.js 测试区（在现有断言之后、渲染段之前，`tests.push` 或 IIFE 内 push）；**必须同步到 index.html/standalone.html 内联 main 段**（L1 教训：改 main.js 断言必须同步两内联版，否则内联版假绿）；
- T03/T04 涉及 localStorage 写入（applyImportPayload 会备份+覆盖 4 键）——**测试前必须先备份当前 4 键到内存，断言后恢复**（PRD §十一 数据安全红线；且避免污染测试环境真实数据）；
- T05/T06 涉及「写损坏数据再 loadGroups」——同样先备份 4 键，断言后恢复；notifyCorrupt 在 ?test=1 跳过 alert（决策 1 已含）；
- **断言编号**：沿用 PRD 的 T01-T06 编号（不引入 v0.25 前缀），与 v0.24 的 T01-T04（auth/records 段）**不冲突**——v0.24 的 T01-T04 在 auth.js/records.js 测试段经 __testAppend 追加，main.js 测试区本身无 T01 编号；但为清晰，main.js 内新增断言统一加「v0.25 T0x:」标签前缀（仿 v0.24 auth.js 测试段写法「v0.24 T01:」），避免统计混淆；
- 新增断言 6 条（PRD 6.3），断言总数 247 → **253**（AR01 更新）；
- gongwei-cloud.js 测试段（可选）经 __testAppend 追加，不在 253 计数内（或按实现计入，测试师口径统一即可）。

**断言明细（PRD 6.3 逐条落实）**：

| 编号 | 断言 | 实现 |
|------|------|------|
| T01 | GONGWEI_SCHEMA_VERSION=1 + 初始化后 localStorage 有 bz_gongwei_schema_version=1 | 读 `window.GONGWEI.GONGWEI_SCHEMA_VERSION` + `localStorage.getItem('bz_gongwei_schema_version')` |
| T02 | buildExportPayload() 返回 JSON 含 4 键 + schemaVersion，JSON.parse(JSON.stringify()) 可逆 | 调 `GONGWEI.buildExportPayload()`，断言 keys 与 JSON.parse 往返相等 |
| T03 | importConfig(合法数据) 后 gongWeiGroups/selected/fav 与导入值一致，且产生 backup 键 | 备份现 4 键→构造合法 payload→`GONGWEI.applyImportPayload(payload)`→断言 `loadGroups()/loadSelected()/loadFav()` 与导入值一致 + localStorage 存在 `*_backup_*`→恢复 |
| T04 | importConfig(非法数据) 后数据不变、无 backup 键 | `GONGWEI.validateImportPayload({bad:1})` 返回 ok:false；`applyImportPayload` 不被调（或调用后返回 ok:false 且数据不变、无 backup）→恢复 |
| T05 | loadGroups() 遇损坏 JSON → 返回默认组 + 产生 corrupt 备份键 | 备份→`localStorage.setItem('bz_gongwei_groups','{broken')`→`loadGroups()` 返回默认 14 组→localStorage 有 `bz_gongwei_groups_corrupt_*`→恢复 |
| T06 | loadGroups() 遇缺失 → 正常初始化默认，无 corrupt 备份 | 备份→removeItem→`loadGroups()` 返回默认 14 组→无 corrupt 键→恢复 |

> 注：T03-T06 中「返回默认组」用 `GONGWEI.initGongWeiGroups()` 后 groups 数量 = `Object.keys(CONST.GONGWEI_MAP).length`（14）断言；恢复用「备份 4 键原值 → 断言后原样写回」，若原值本身为空则 removeItem。

---

## 二、变更影响面（目标文件修改清单）

| 文件 | 改动点 | 位置 | 规模 | 状态 |
|------|--------|------|:---:|:---:|
| gongwei.js | 容错改造（loadGroups/loadTrash/loadSelected/loadFav + safeLoad/backupCorrupt/notifyCorrupt） | L88-95 数据层 | ~+35 行 | ⚠️ 待办 |
| gongwei.js | GONGWEI_SCHEMA_VERSION + ensureSchemaVersion + migrateGongweiSchema 骨架 | 数据层顶部 + initGongWeiData | ~+15 行 | ⚠️ 待办 |
| gongwei.js | buildExportPayload/exportConfig/validateImportPayload/applyImportPayload/importConfig/handleImportFile | 数据层后段 | ~+90 行 | ⚠️ 待办 |
| gongwei.js | persist* 末尾 markDirty 钩子 ×4 | persistGroups/persistTrash/persistSelected/persistFav | +4 行 | ⚠️ 待办 |
| gongwei.js | window.GONGWEI 挂载新函数 | L1054 挂载区 | ~+10 行 | ⚠️ 待办 |
| gongwei-cloud.js | 新增模块（IIFE + onLogin/onLogout/markDirty/pull/push + 测试段） | 新建 | ~180 行 | ⚠️ 待办 |
| auth.js | onLoginSuccess 加 GONGWEI_CLOUD.onLogin；doLogout/SIGNED_OUT 加 onLogout | L174-179 + 登出分支 | +3 行 | ⚠️ 待办 |
| main.js | T01-T06 测试段（含 localStorage 备份/恢复） | ?test=1 测试区 | +50 行 | ⚠️ 待办 |
| main.js 内联段 | 同步 T01-T06 到 index.html/standalone.html 内联 main 段 | index L8389 段 / standalone 同 | +50 行×2 | ⚠️ 待办 |
| standalone-split.html | gzFooterAll 加 2 按钮 + file input + 说明文案；script 加 gongwei-cloud.js；头部 v0.25.0 | L800 区 / L908 后 / L2 | +20 行 | ⚠️ 待办 |
| standalone.html | 同步 UI 段 + gongwei.js 内联更新 + gongwei-cloud.js 内联新增 + main 内联测试段同步 + 头部 | 多处 | ~+250 行 | ⚠️ 待办 |
| index.html | 与 standalone.html 同构同步 + 头部 | 同上 | ~+250 行 | ⚠️ 待办 |
| api/handler.rb | %w[] 追加 gongwei-cloud.js | 模块路由列表 | +1 行 | ⚠️ 待办 |
| scripts/check-release.sh | KEYS + btnExportConfig/btnImportConfig/gzFileImport；第 4 步 + gongwei.js | L17 / 新增 | ~+10 行 | ⚠️ 待办 |
| SYSTEM.md | 版本历史补 v0.25.0 + 文件结构补 gongwei-cloud.js | 发布师范围 | ~15 行 | ⚠️ 待办 |

**体积影响**：gongwei-cloud.js ~5KB（外部文件）；单体版内联新增 gongwei-cloud 段 + gongwei.js 增量 ~10KB；相对 v0.24 的 1MB 级文件可忽略。

---

## 三、风险矩阵

| 编号 | 风险 | 概率 | 影响 | 缓解 |
|------|------|:---:|:---:|------|
| R1 | **gongwei.js 外部改/内联没改漂移（本版最高风险）**：gongwei.js 是主改动，standalone.html/index.html 内联 gongwei 段漏同步 → 内联版无容错/导出导入 | 高（L1 历史多次复发） | 高 | check-release.sh 第 4 步新增 gongwei.js 外部 vs 内联 cmp（决策 5）；AR04/AR05 三入口双环境 |
| R2 | main.js 测试断言同步缺失（L1 精确复刻）：T01-T06 只改 main.js 未同步内联版 → 内联版假绿 | 高（v0.22.0 素素断言教训） | 高 | 决策 5 明确三入口同步；check-release.sh 六模块段一致性（main 段）已覆盖 index vs standalone |
| R3 | 容错误判：空数组被当「缺失」→ 首启用户被 alert 打扰 | 中 | 中 | 决策 1 明确空数组=损坏（PRD D5）；AC08 验证首启无提示 |
| R4 | 导入覆盖误操作（合法但非预期文件覆盖现有配置） | 中 | 中 | 导入前自动备份（决策 2）；AC05 验证 backup 键；导入后 alert 确认 |
| R5 | 云同步与本地冲突（多设备同时编辑，云端为准覆盖较新本地） | 中 | 中 | 简化策略（D7）+ 本地 persist 防抖 3s 推云缩小窗口；导出/导入 JSON 终极兜底；复杂 merge 后续版本 |
| R6 | RLS 误配导致全员可读写（SQL Editor 手动执行踩坑） | 低 | 严重 | 沿用 v0.24 已验证流程（DDL→GRANT→RLS 实测）；测试师覆盖 AC10-AC13 + 用户隔离 |
| R7 | gongwei-cloud.js 未登录时 markDirty 触发网络请求 | 低 | 低 | markDirty 内部 `!AUTH.isLoggedIn()` 提前 return（决策 3） |
| R8 | 测试污染真实 localStorage（T03-T06 写入损坏/导入数据） | 中 | 中 | 测试段先备份 4 键 + 断言后恢复（决策 5）；PRD §十一 数据安全红线 |
| R9 | 回滚版本不一致：只回滚单体版忘记 split 版 | 低 | 中 | 回滚按三文件整体回退到 v0.24.0 tag（§六） |

---

## 四、实现指引（给编程师）

### 改动顺序（按依赖排序，12 步）

1. **gongwei.js（数据层）**：safeLoad/backupCorrupt/notifyCorrupt + 四函数容错改造（决策 1）；
2. **gongwei.js（schema）**：GONGWEI_SCHEMA_VERSION + ensureSchemaVersion + migrateGongweiSchema 骨架 + initGongWeiData 调用（决策 4）；
3. **gongwei.js（导出/导入）**：buildExportPayload/exportConfig/validateImportPayload/applyImportPayload/importConfig/handleImportFile（决策 2）；
4. **gongwei.js（钩子）**：persistGroups/persistTrash/persistSelected/persistFav 末尾加 markDirty 条件调用（决策 3b）；
5. **gongwei.js（挂载）**：window.GONGWEI 挂载 8 个新成员（GONGWEI_SCHEMA_VERSION/safeLoad 不挂、buildExportPayload/exportConfig/validateImportPayload/applyImportPayload/importConfig/handleImportFile/ensureSchemaVersion/migrateGongweiSchema）；
6. **gongwei-cloud.js（新建）**：IIFE + onLogin/onLogout/markDirty/pullCloudConfig/pushCloudConfig + 测试段（决策 3）；
7. **auth.js**：onLoginSuccess + doLogout + SIGNED_OUT 三处追加 GONGWEI_CLOUD 调用（决策 3）；
8. **main.js**：?test=1 测试区新增 T01-T06（含 localStorage 备份/恢复 IIFE）；
9. **standalone-split.html**：gzFooterAll 加 2 按钮 + gzFileImport + gzCloudSyncNote；`<script src="gongwei-cloud.js">` 加在 records.js 后；头部注释 v0.25.0；
10. **standalone.html**：同步 UI 段 + gongwei.js 内联段更新 + gongwei-cloud.js 内联段新增 + main 内联测试段同步 + 头部注释 v0.25.0；
11. **index.html**：与 standalone.html 字节级一致（`cp standalone.html index.html`，当前 diff=0）；
12. **check-release.sh + api/handler.rb**：KEYS 追加 3 id；第 4 步新增 gongwei.js；handler.rb %w[] 追加 gongwei-cloud.js；验证 `bash scripts/check-release.sh .` 全过。

### 自检清单（8 项）

- S1 三文件（split/standalone/index）均有 btnExportConfig/btnImportConfig/gzFileImport/gzCloudSyncNote（grep 各 1 命中）；
- S2 index.html 与 standalone.html 字节级一致（`diff` 0）；
- S3 单体版内联 gongwei 段与外部 gongwei.js 一致（check-release.sh 第 4 步通过）；
- S4 单体版内联 gongwei-cloud 段与外部 gongwei-cloud.js 一致（第 4 步）；
- S5 `?test=1` 三入口 253 条断言全绿（247 旧 + T01-T06）；
- S6 空数组损坏有 corrupt 备份 + 提示；首启无提示（AC08）；
- S7 导入非法文件不覆盖、无 backup；导入合法文件有 backup（AC04/AC05）；
- S8 登录拉取云端覆盖（AC10）/ 首传（AC11）/ 断网降级（AC12）/ 未登录纯本地（AC13）——浏览器级由测试师覆盖。

### 关键陷阱（5 个）

1. **gongwei.js 是六模块之一**（非 auth/records 那种尾部模块）：T01-T06 可直接放 main.js 测试区同步断言（决策 5），**不要**试图用 __testAppend 追加——但 gongwei-cloud.js 的测试段仍需 __testAppend（它在 main 后加载）；
2. **test 模式下 alert 会卡死测试**：notifyCorrupt/applyImportPayload 的 alert 必须跳过（?test=1 检测），否则 T03-T06 弹窗阻塞整个测试区；
3. **T03-T06 会写坏 localStorage**：测试前必须备份 4 键 + 断言后恢复（决策 5 红色警戒）；恢复时若原值为空要 removeItem 而不是 setItem('');
4. **gongwei.js 内联段同步不能用文本替换硬塞**：它属于六模块段，check-release.sh 第 2 步用 `— gongwei.js */` 注释定位 + rfind('<script>') 取整块——内联 gongwei 段必须是独立 `<script>` 块且带版本注释，否则会被并入前一段导致 cmp 失败；
5. **gongwei-cloud.js 必须加进 api/handler.rb 与 check-release.sh 两处**：只加 script 标签不加路由 → Clacky 面板 404；只加路由不加 check-release → 三文件漂移漏检。

---

## 五、验证方案与回滚

### 验证方案（对齐 PRD §6 断言 AC01-AC13 + T01-T06 + AR01-AR06）

1. **自动化断言**：`?test=1` 三入口 253 条全绿（247 旧 + T01-T06）；T02 验证导出结构可逆；T03/T04 验证导入生效/失败不覆盖；T05/T06 验证损坏/缺失二分（AR01）；
2. **回归锚点**：1982-10-18 05:01 男 / 王阳明 1472-10-31 22:01 / 苏轼 1037 三锚点排盘结果与 v0.24.0 完全一致（AR02，v0.25 零算法改动）；
3. **宫位功能回归**：分组增删改/标签/勾选/常用宫位/排序/回收站与 v0.20.0-v0.24.0 行为一致（AR03）；
4. **三文件一致性**：`bash scripts/check-release.sh .` 退出码 0（AR04，含新增 KEYS/第 4 步 gongwei.js）；
5. **三入口双环境**：split/standalone/index × http/file 导出/导入/防重置行为一致（AR05/AR06）；
6. **手动全链路**（测试师浏览器级）：导出→清空→导入完整恢复（AC03）；损坏数据不静默（AC06/AC07）；云同步 AC10-AC13 + 用户隔离（A 改云端 → B 登录拉取 A 的配置 ≠ B 本地配置被覆盖为 A；B 登出再登录 A 恢复）。

### 回滚方案

- 三文件整体回退：`git checkout v0.24.0 -- index.html standalone.html standalone-split.html main.js gongwei.js auth.js records.js config.js` + 删除未跟踪的 gongwei-cloud.js（或保留不影响旧版，旧版不引用它）；
- 若仅云同步出问题、本地功能正常：**只回退账号层**（删除 gongwei-cloud.js 引用 + auth.js 3 行钩子 + gongwei.js persist 钩子 4 行），本地容错/导出/导入保留——但需重新过 check-release.sh；
- 回滚后验证：1982-10-18 排盘正常、`?test=1` 247 旧断言全过（不含 T01-T06）。

---

## 六、非目标（与 PRD §八一致）

不做手动合并冲突 UI（云端/本地双向冲突由简化策略自动处理）；不做云端配置加密（RLS 已保证隔离，宫位配置非敏感数据）；不做跨浏览器自动云备份向导（导出/导入 JSON 已覆盖手动场景）；不做宫位默认数据/算法任何改动（GONGWEI_MAP 逐字节不变）；不引入任何第三方依赖（导出/导入 Blob+FileReader 原生实现；云同步沿用 supabase.min.js）；不做损坏数据的自动修复尝试（只备份+重建默认，不猜测性修复损坏 JSON）。

---

## 七、与 PRD AC 映射表（供测试师验收）

| PRD AC | 验收要点 | ADR 落点 |
|--------|---------|---------|
| AC01 | 设置面板可见导出/导入按钮 | 决策 2 DOM（gzFooterAll 2 按钮） |
| AC02 | 导出下载 gongwei-config_*.json 含 4 键+schemaVersion | 决策 2 buildExportPayload + Blob 下载 |
| AC03 | 导出→清空→导入完整恢复 | 决策 2 applyImportPayload（4 键覆盖 + UI 刷新） |
| AC04 | 导入非法不覆盖 + 具体错误 | 决策 2 validateImportPayload 三错误分支 |
| AC05 | 导入合法有 backup 键 + UI 刷新 | 决策 2 备份键 `*_backup_<ts>` |
| AC06 | groups 损坏 → alert + corrupt 备份 + 恢复默认 | 决策 1 loadGroups 损坏分支 |
| AC07 | selected/trash/fav 损坏 → 不抛异常 + 空数组 + 备份 | 决策 1 三函数损坏分支 |
| AC08 | 首启无提示、无 corrupt 备份 | 决策 1 缺失分支 |
| AC09 | 初始化后 bz_gongwei_schema_version=1 | 决策 4 ensureSchemaVersion |
| AC10 | 登录拉取云端覆盖本地 | 决策 3 pullCloudConfig 云端为准 |
| AC11 | 登录首传本地推云 | 决策 3 pushCloudConfig upsert |
| AC12 | 断网登录降级本地不崩溃 | 决策 3 catch 静默降级 |
| AC13 | 未登录纯本地零云请求 | 决策 3 markDirty isLoggedIn 守卫 |
| AR01 | ?test=1 247 旧 + T01-T06 全过 | 决策 5 |
| AR02 | 三锚点排盘不变 | 本版本零算法改动 |
| AR03 | 宫位功能回归 | gongwei.js 仅数据层/UI 壳，CRUD 不变 |
| AR04 | check-release.sh 通过 | 决策 5 KEYS/第 4 步 |
| AR05 | 三入口功能一致 | 决策 5 三文件同步 |
| AR06 | http/file 双环境 | 导出/导入原生 API 双环境兼容 |




