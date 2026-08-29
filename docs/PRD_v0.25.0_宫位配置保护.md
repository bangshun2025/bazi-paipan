# PRD：v0.25.0 宫位配置保护

## 一、版本信息

- **版本号**：v0.25.0
- **基线版本**：v0.24.0（Supabase 账号功能，已正式上线 2026-08-29）
- **改动类型**：功能新增（宫位配置保护：导出/导入 + 防静默重置 + 上云同步 + schema 版本化）
- **涉及文件**：gongwei.js（主）、standalone-split.html / standalone.html / index.html（设置面板 UI + 三文件同步）、main.js（断言 + 内联同步）、records.js（上云扩展，可选）、docs/
- **触发来源**：用户反馈「宫位数据不一致」——公测版调过的宫位数据（常用宫位等）在现用版本中与以前不一样

---

## 二、上版本复盘遗留项

> 来源：SYSTEM.md「已知问题 / 技术债」表 + RETRO_v0.24.0 复盘结论

| 编号 | 遗留项 | 来源 | 本版本处理 | 说明 |
|------|--------|------|:----------:|------|
| L1   | **测试代码段同步缺失**：改 main.js 内联断言未同步 index.html/standalone.html 内联版（P1，v0.24.0 已再次规避但未根治） | RETRO v0.22.0 / SYSTEM.md | ⚠️ **本版本必须规避** | v0.25 新增 UI（导出/导入按钮）与 gongwei.js 容错逻辑**必须三文件同步**：standalone-split.html（主产物）、standalone.html（回退版）、index.html（面板版）。发布门槛：`bash scripts/check-release.sh .` 通过 |
| L2   | **云端化只覆盖档案记录**：v0.24.0 的 Supabase 云端化只做了 records.js（档案），宫位自定义数据（bz_gongwei_*）仍在 localStorage，无云端副本 | RETRO v0.24.0 | ✅ **本版本解决（中期方案）** | 新建 user_gongwei_config 表，登录用户宫位配置上云（FR2） |
| L3   | **loadGroups 静默重建**：localStorage 数据缺失/损坏时静默重建默认 14 组，用户无感知（本次 bug 直接机制） | 编程师排查报告 | ✅ **本版本解决（P0）** | 损坏时备份 + 提示，缺失（首启）正常初始化（FR3） |
| L4   | localStorage 无 schema 版本号，未来升级无法做 merge/迁移 | 编程师排查报告 | ✅ **本版本解决（P1）** | 引入 bz_gongwei_schema_version（FR4） |

---

## 三、需求背景

### 3.1 用户问题

用户反馈「宫位数据不一致」——在公测版（GitHub Pages）调好的宫位数据（分组/标签/常用宫位/勾选），切到现用版本后变成了默认 14 组。

### 3.2 根因（编程师排查已确认，本 PRD 直接引用）

1. **v0.23.4 → v0.24.0 宫位代码零改动**：`gongwei.js`、`constants.js`（GONGWEI_MAP 14 组默认宫位）逐字节一致，不是版本升级改数据；
2. **用户自定义宫位全部存浏览器 localStorage**，按 origin（协议+域名+端口）隔离：

| localStorage 键 | 内容 | 引入版本 |
|---|---|---|
| `bz_gongwei_groups` | 宫位分组数据（14 组预置 + 用户新增/修改的组与标签） | v0.13.0 |
| `bz_gongwei_trash` | 宫位回收站 | v0.13.0 |
| `bz_gongwei_selected` | 勾选中的宫位 | v0.10.0 |
| `bz_gongwei_fav` | 常用宫位列表 | v0.20.0 |

3. **origin 隔离**：公测版（`https://bangshun2025.github.io`）与内测版（`http://localhost:7070` / `file://`）localStorage 不互通；
4. **loadGroups() 静默重建**（gongwei.js:88-93）：`bz_gongwei_groups` 缺失 / JSON 损坏 / 空数组 → 静默 `initGongWeiGroups()` 重建默认 14 组 → 用户看到「数据被改」；
5. **无云端副本**：v0.24.0 云端化只覆盖档案（records.js），宫位数据未上云，localStorage 清空即永久丢失。

### 3.3 目标用户与使用场景

- 邦顺本人 + 生命算法学员（多环境使用：Clacky 面板 / GitHub Pages / file:// 直开）
- 场景 A：跨环境迁移——公测版调好的宫位配置迁移到内测版（短期：导出/导入；中期：登录后上云自动同步）
- 场景 B：数据防丢——localStorage 损坏/被清时不再静默重置（备份 + 提示）
- 场景 C：未来升级安全——schema 版本化，升级时 merge 而非覆盖

---

## 四、方案概述

### 4.1 总体思路（4 层防护，按优先级落地）

```
┌───────────────────────────────────────────────────────┐
│ 第 1 层（P0）：防静默重置                                │
│   loadGroups()/loadTrash()/loadSelected()/loadFav()     │
│   损坏 → 备份损坏串 + 提示用户；缺失（首启）→ 正常初始化   │
├───────────────────────────────────────────────────────┤
│ 第 2 层（P0）：导出/导入 JSON（短期手动备份迁移）          │
│   宫位设置面板新增「导出配置/导入配置」按钮                 │
│   导出：4 键 + schemaVersion → .json 文件                 │
│   导入：schema 校验 → 备份当前 → 覆盖 → 刷新 UI            │
├───────────────────────────────────────────────────────┤
│ 第 3 层（P1）：localStorage schema 版本号                │
│   bz_gongwei_schema_version = 1（v0.25.0 引入）           │
│   未来升级：旧版本走 merge 迁移，非整体覆盖                │
├───────────────────────────────────────────────────────┤
│ 第 4 层（P1）：Supabase 上云同步（中期）                  │
│   新表 user_gongwei_config（user_id + 4 JSON 字段）       │
│   登录用户：云端为准拉取 + persist 后防抖推云               │
│   未登录：回落 localStorage（现状不变）                    │
└───────────────────────────────────────────────────────┘
```

### 4.2 技术方案决策点（架构师 ADR 细化）

| 决策点 | 推荐结论 | 理由 | 备注 |
|--------|---------|------|------|
| D1 导出文件格式 | 单 JSON 文件：`{schemaVersion, exportedAt, groups, trash, selected, fav}` | 与 localStorage 4 键一一对应，导入可逆 | 架构师定文件名约定 |
| D2 导出文件名 | `gongwei-config_YYYYMMDD_HHmmss.json` | 时间戳防覆盖、语义清晰 | 沿用 v0.23.0 截图命名风格 |
| D3 导入策略 | 校验通过 → 先备份当前 4 键（`*_backup_<时间戳>`）→ 覆盖 → 刷新 UI | 可回滚，防误操作 | 备份键不自动清理 |
| D4 导入校验失败 | 提示具体错误（格式/版本/结构），**不覆盖任何现有数据** | 防误导入 | — |
| D5 损坏检测 | 「缺失」与「损坏」区分：缺失（首启）→ 正常初始化；损坏（JSON.parse 失败 / 非数组 / 空数组）→ 备份 + 重建 + 提示 | 首启不误报，异常不静默 | — |
| D6 上云表结构 | `user_gongwei_config`（user_id uuid PK / groups jsonb / trash jsonb / selected jsonb / fav jsonb / schema_version int / updated_at timestamptz） | 与 paipan_records 模式一致 | 架构师 ADR 细化 DDL + RLS |
| D7 云同步冲突策略 | 简化策略：登录成功 → 云端有记录 → 拉取覆盖本地（云端为准）；云端无记录 → 本地推云（首传）；后续 persist 后防抖 3s 推云 | 满足「跨设备同步」核心目标，避免复杂 merge UI | 手动合并留后续版本 |
| D8 云同步挂载位置 | 新建 `gongwei-cloud.js`（独立模块）或 gongwei.js 内扩展 | 由架构师定（与 v0.24 的 auth.js/records.js 独立模块模式对齐） | — |

---

## 五、需求详述

### 5.1 功能需求

#### FR1 导出配置 JSON（P0）

- **入口**：宫位设置面板（`gzSettingsOverlay`）新增「导出配置」按钮（位置：设置面板 footer 区，与现有「恢复默认」按钮同排）
- **行为**：
  - 点击 → 读取当前 4 个 localStorage 键（`bz_gongwei_groups` / `bz_gongwei_trash` / `bz_gongwei_selected` / `bz_gongwei_fav`）+ schemaVersion
  - 生成 JSON：`{schemaVersion: 1, exportedAt: <ISO>, groups: [...], trash: [...], selected: [...], fav: [...]}`
  - 下载为 `gongwei-config_YYYYMMDD_HHmmss.json`（Blob + a[download]，零依赖）
- **空态**：宫位数据为空/未初始化时仍可导出（导出默认组 JSON），不阻断

#### FR2 导入配置 JSON（P0）

- **入口**：宫位设置面板新增「导入配置」按钮（同 footer 区，触发隐藏 `<input type="file" accept=".json">`）
- **校验**（导入前必须全过，任一失败即中止且不覆盖）：
  1. 文件可解析为 JSON 对象
  2. 含 `schemaVersion`（数值）且 ≤ 当前支持版本（=1）
  3. `groups` 为数组（可空）；`trash`/`selected`/`fav` 为数组（缺失时按空数组兼容）
- **行为**：
  - 校验通过 → 将当前 4 键备份为 `bz_gongwei_groups_backup_<时间戳>` / `bz_gongwei_trash_backup_<时间戳>` / `bz_gongwei_selected_backup_<时间戳>` / `bz_gongwei_fav_backup_<时间戳>`
  - 写入导入数据（4 键 + schemaVersion）
  - 刷新宫位 UI（`gongWeiGroups = 导入值; renderGzSettingsAll(); rebuildGzCbGrid(); updateGongWeiTags()` 等价流程）
  - alert「宫位配置已导入」
- **校验失败**：alert 具体错误（「文件不是有效的宫位配置 JSON」「版本不兼容（文件 vX > 当前 v1）」「数据结构不完整」），现有数据保持不动

#### FR3 防静默重置（P0）

改造 `loadGroups()` / `loadTrash()` / `loadSelected()` / `loadFav()` 的容错逻辑：

| 读取函数 | 现状（gongwei.js 行号） | 改造后 |
|---------|------------------------|--------|
| loadGroups() | 88-93：缺失/损坏/空数组 → 静默 initGongWeiGroups() | 缺失（首次使用）→ 正常初始化；**损坏**（JSON.parse 异常 / 非数组 / 空数组）→ ① 原始串备份到 `bz_gongwei_groups_corrupt_<时间戳>` ② initGongWeiGroups() 重建 ③ alert「宫位数据损坏，已备份并恢复默认」 |
| loadTrash() | 94：直接 JSON.parse 无 catch | try/catch：异常 → 空数组 + 备份损坏串 |
| loadSelected() | 95：直接 JSON.parse 无 catch | try/catch：异常 → 空数组 + 备份损坏串 |
| loadFav() | 直接 JSON.parse 无 catch | try/catch：异常 → 空数组 + 备份损坏串 |

- **提示时机**：仅「损坏」时提示；「缺失（首启）」不提示（避免新用户被吓到）
- **提示文案**：「宫位配置数据已损坏，已为您备份原数据并恢复默认设置。可在宫位设置中导入备份。」

#### FR4 localStorage schema 版本号（P1）

- 新增常量 `GONGWEI_SCHEMA_VERSION = 1`
- 新增键 `bz_gongwei_schema_version`，`persist*` 时一并写入（或首次初始化时写入）
- 导出 JSON 含 `schemaVersion` 字段；导入时校验版本
- 未来升级（v0.26+ 若宫位结构变更）：读旧版本号 → 执行 merge 迁移（补齐新默认字段、保留用户自定义），**禁止整体覆盖**

#### FR5 上云同步（P1，随账号体系）

- **前置**：Supabase 新建表 `user_gongwei_config`（D6），RLS 沿用 paipan_records 模式（user_id = auth.uid() 的 select/insert/update/delete 4 策略）
- **登录成功时**：
  - 云端有该用户配置 → 拉取 → **云端为准**覆盖本地（含 schemaVersion）→ 刷新 UI
  - 云端无配置 → 本地推云（首传）
- **本地 persist 后**：防抖 3s 推云（upsert）
- **未登录**：完全回落 localStorage，现状不变
- **失败降级**：云端拉取/推送失败（断网/限流）→ 静默降级本地，不丢本地数据、不崩溃；下次登录重试
- **登出**：不回退本地（本地保持登出前的最后状态）

#### FR6 文档与提示（P2）

- 宫位设置面板加一行说明：「宫位配置仅保存在本机浏览器，可点『导出配置』备份；登录后自动同步到云端」
- README/部署报告明确「自定义宫位仅存本机浏览器 localStorage、按环境隔离」

### 5.2 交互细节

| 场景 | 行为 |
|------|------|
| 首次打开应用（无任何宫位数据） | 正常初始化默认 14 组，无提示（FR3 缺失分支） |
| localStorage 宫位数据被改坏（手动/异常） | alert 提示 + 备份损坏串 + 恢复默认（FR3 损坏分支） |
| 导出 | 下载 gongwei-config_*.json，零弹窗 |
| 导入合法文件 | 备份当前 → 覆盖 → alert「宫位配置已导入」 |
| 导入非法文件 | alert 具体错误，现有数据不动 |
| 登录成功（云端有配置） | 云端配置覆盖本地，宫位 UI 刷新 |
| 登录成功（云端无配置） | 本地配置推云，无感 |
| 断网时保存宫位修改 | 本地正常保存，云端同步失败静默，下次登录重试 |

---

## 六、AC 验收条件

### 6.1 功能验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AC01 | 打开宫位设置面板 | 可见「导出配置」「导入配置」按钮（footer 区） |
| AC02 | 点击导出 | 下载 `gongwei-config_YYYYMMDD_HHmmss.json`，内容含 schemaVersion=1 + groups/trash/selected/fav 4 键 |
| AC03 | 修改若干宫位（增组/改标签/勾选/常用）→ 导出 → 清空 localStorage → 导入 | 宫位数据完整恢复（组/标签/勾选/常用均一致） |
| AC04 | 导入非法文件（非 JSON / 缺 groups / schemaVersion 超版本） | 提示具体错误，现有宫位数据保持不变 |
| AC05 | 导入合法文件 | 导入前当前 4 键被备份为 `*_backup_<时间戳>`，导入后 UI 刷新 |
| AC06 | 手动把 `bz_gongwei_groups` 改成损坏 JSON → 刷新 | alert 提示 + 损坏串备份到 `bz_gongwei_groups_corrupt_<时间戳>` + 恢复默认 14 组 |
| AC07 | 把 `bz_gongwei_selected` / `bz_gongwei_trash` / `bz_gongwei_fav` 改成损坏 JSON → 刷新 | 不抛异常，按空数组处理 + 损坏串备份 |
| AC08 | 全新浏览器打开（无任何 bz_gongwei_* 键） | 正常初始化默认 14 组，无任何提示、无 corrupt 备份 |
| AC09 | 初始化后检查 localStorage | 存在 `bz_gongwei_schema_version` = 1 |
| AC10 | 登录账号 A（云端已有配置） | 云端配置覆盖本地，宫位 UI 刷新为云端状态 |
| AC11 | 登录账号 B（云端无配置） | 本地配置推云（首传），下次登录 A 环境可拉回 |
| AC12 | 断网状态登录 | 回落本地，不崩溃、不丢本地数据 |
| AC13 | 未登录状态修改宫位 | 仅存 localStorage，不触发云请求，行为与 v0.24.0 一致 |

### 6.2 回归验收

| 编号 | 场景 | 预期结果 |
|------|------|----------|
| AR01 | ?test=1 全量断言 | 247 条旧断言全过 + 新增断言（见 6.3）通过 |
| AR02 | 常规排盘回归：1982-10-18 05:01 男、王阳明 1472-10-31 22:01、苏轼 1037 | 结果与 v0.24.0 完全一致（宫位保护不触碰算法） |
| AR03 | 宫位功能回归：分组增删改/标签/勾选/常用宫位/排序/回收站 | 与 v0.20.0-v0.24.0 行为一致 |
| AR04 | 三文件一致性：`bash scripts/check-release.sh .` | 通过（含新增导出/导入按钮 id 检查） |
| AR05 | 三入口（standalone-split / standalone / index）功能一致 | 导出/导入/防重置行为一致 |
| AR06 | 双环境（http / file://） | 导出/导入功能正常 |

### 6.3 新增自动化断言（?test=1，最少 6 条，允许扩展）

| 编号 | 断言 | 说明 |
|------|------|------|
| T01 | GONGWEI_SCHEMA_VERSION = 1，初始化后 localStorage 有 bz_gongwei_schema_version | schema 版本写入 |
| T02 | exportConfig() 返回 JSON 含 4 键 + schemaVersion，JSON.parse 可逆 | 导出结构 |
| T03 | importConfig(合法数据) 后 gongWeiGroups/selected/fav 与导入值一致，且产生 backup 键 | 导入生效 + 备份 |
| T04 | importConfig(非法数据) 后数据不变、无 backup 键 | 导入失败不覆盖 |
| T05 | loadGroups() 遇损坏 JSON → 返回默认组 + 产生 corrupt 备份键 | 防静默重置 |
| T06 | loadGroups() 遇缺失 → 正常初始化默认，无 corrupt 备份 | 首启不误报 |

> 断言数表述：最少 6 条，实施时允许按分组细化扩展（沿用 RETRO v0.23.0 R6 口径）。

---

## 七、影响范围

| 文件 | 现状 | 改动 | 规模 |
|------|:---:|------|:---:|
| gongwei.js | 1139 行 | ① loadGroups/loadTrash/loadSelected/loadFav 容错改造 ② exportConfig/importConfig 函数 ③ GONGWEI_SCHEMA_VERSION 常量 + persist 写入 ④ 上云同步（FR5，可新建 gongwei-cloud.js）⑤ GONGWEI 命名空间挂载新函数 | +150~250 行 |
| standalone-split.html | 主产物 | 设置面板 footer 加「导出配置/导入配置」按钮 + 隐藏 file input + 说明文案 | +15~25 行 |
| standalone.html | 回退版 | **同步同段 UI + gongwei.js 内联段（L1 门槛）** | 随内联 |
| index.html | 面板版 | **同步同段 UI + gongwei.js 内联段（L1 门槛）** | 随内联 |
| main.js | 247 断言 | 新增 T01-T06 断言 + 内联同步 | +30~40 行 |
| records.js | v0.24.0 | 云同步复用其 Supabase client（如 FR5 走独立模块则不动） | ~0 行 |
| docs/ | — | 新增 PRD/ADR/TEST/QA 文档 | — |
| SYSTEM.md | v0.24.0 | 版本历史补 v0.25.0 + 文件结构更新 | ~15 行 |

**发布注意**：
- v0.25.0 引入新的 localStorage 键（schema_version / backup_* / corrupt_*），旧版本应用不识别但**不影响**（多出键会被忽略）
- 上云方案涉及 Supabase DDL（user_gongwei_config 表 + RLS），需在发布前完成并实测（沿用 v0.24 的 SQL Editor + 手动 GRANT 流程）

---

## 八、非目标（明确不做）

- **不做** 手动合并冲突 UI（云端/本地双向编辑冲突时由简化策略自动处理，手动合并后续版本）
- **不做** 云端配置加密（RLS 已保证用户隔离；宫位配置非敏感数据，与 paipan_records 同级）
- **不做** 跨浏览器自动云备份向导（导出/导入 JSON 已覆盖手动场景）
- **不做** 宫位默认数据/算法任何改动（GONGWEI_MAP 保持逐字节不变）
- **不引入** 任何第三方依赖（导出/导入用 Blob + FileReader 原生实现；云同步沿用 supabase.min.js）
- **不做** 损坏数据的自动修复尝试（只备份 + 重建默认，不猜测性修复损坏 JSON）

---

## 九、风险评估

### 9.1 三文件同步遗漏（L1 复发风险，最高）

**风险**：v0.25 改动集中在 gongwei.js（分体版）+ standalone-split.html，若忘记同步 standalone.html / index.html 内联段 → 回退版/面板版无导出导入或容错不一致。

**缓解**：T1 三文件同步列为 P0；AR04 check-release.sh 覆盖新增按钮 id；AR05 三入口验证。

### 9.2 导入覆盖误操作

**风险**：导入合法但内容非用户预期的文件 → 覆盖现有配置。

**缓解**：导入前自动备份（FR2）→ 可回滚；导入后 alert 确认；导出文件名带时间戳便于追溯。

### 9.3 防静默重置误伤首启用户

**风险**：把「缺失」误判为「损坏」→ 新用户首次打开被 alert 打扰。

**缓解**：严格区分缺失与损坏（D5）；AC08 验证首启无提示。

### 9.4 云同步与本地冲突

**风险**：多设备同时编辑 → 云端为准策略可能覆盖较新的本地编辑。

**缓解**：简化策略（D7）满足核心跨设备需求；本地 persist 防抖推云降低窗口；手动导出/导入 JSON 作为终极兜底；复杂 merge 列入后续版本。

### 9.5 localStorage 容量（5MB）

**风险**：宫位配置数据量小（<50KB），无实质风险；但 corrupt/backup 键累积可能增多。

**缓解**：corrupt 备份保留最近 1 份（同键覆盖 + 时间戳命名）；backup 键仅导入时产生，正常频率极低；后续版本可做清理（非本版本范围）。

### 9.6 上云方案发布复杂度

**风险**：user_gongwei_config 表 + RLS + GRANT 需 SQL Editor 手动执行，流程与 v0.24.0 相同，有踩坑可能（如 RLS 误配导致全员可读写）。

**缓解**：沿用 v0.24.0 已验证流程（SQL Editor DDL → 手动 GRANT authenticated → 端到端实测用户隔离）；测试师覆盖 AC10-AC12 + 用户隔离用例。

---

## 十、给架构师的 ADR 输入

1. **容错改造方案**：loadGroups/loadTrash/loadSelected/loadFav 的 try/catch 统一模式（D5 缺失/损坏区分）；corrupt 备份键命名与保留策略。
2. **导出/导入实现**：exportConfig/importConfig 函数签名、文件命名约定（D1/D2）、导入校验规则（D4）、备份键（D3）；设置面板 footer 按钮与 file input 的 DOM 结构（三文件一致）。
3. **上云同步设计**：user_gongwei_config 表 DDL + RLS（D6）；同步时序（登录拉取/首传/persist 防抖推云）（D7）；挂载位置（新建 gongwei-cloud.js 或 gongwei.js 内扩展）（D8）；与 auth.js/records.js 的依赖顺序（gongwei-cloud 需在登录事件后初始化）。
4. **schema 版本迁移机制**：GONGWEI_SCHEMA_VERSION 常量位置、未来 merge 迁移框架（本次只写版本号，迁移框架骨架）。
5. **断言挂载**：T01-T06 放 main.js ?test=1 的对接方式；同步到两个内联版断言段（L1 教训）。

---

## 十一、给测试工程师的验收锚点

- **核心锚点（PRD 定稿即锁定）**：
  - 导出可下载 JSON（AC02），导出→清空→导入可完整恢复（AC03）
  - 导入非法文件不覆盖（AC04），导入前有备份（AC05）
  - 损坏数据不静默：alert + corrupt 备份 + 恢复默认（AC06/AC07）
  - 首启无提示（AC08），schema_version 写入（AC09）
  - 云同步：登录拉取覆盖（AC10）/ 首传（AC11）/ 断网降级（AC12）/ 未登录纯本地（AC13）
- **回归锚点**：247 条旧断言全过；1982-10-18 / 王阳明 1472 / 苏轼 1037 排盘结果不变（AR02）；宫位 CRUD/常用宫位/回收站回归（AR03）
- **同步门槛**：AR04 check-release.sh 通过 + AR05 三入口功能一致
- **⚠️ 数据安全红线**：测试环境使用独立 Supabase 测试账号（或临时用户），不得在正式账号上做破坏性导入测试；损坏数据测试用「手动改写 localStorage」模拟，不要清空真实用户的公测版数据。
