# ADR v0.24.0 — Supabase 账号功能（单体版内联合成 + 凭证 + 测试挂载 + 数据结构 + RLS）

> **版本**：v1.0
> **日期**：2026-08-27
> **作者**：架构师（worker_498043b4）
> **状态**：待评审
> **关联文档**：PRD_v0.24.0_Supabase账号功能.md（定稿）

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

> 版本号/行数均以实际读取源码确认（2026-08-27 实测；split 版已集成 v0.24，单体版为 v0.23.4 基线）。

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `config.js`（Supabase 凭证，新增） |
| 当前行数 | 15 行 / 482B（实测） |
| 改动类型 | ✅ 已填真实 anonKey（`sb_publishable__OJl95ppP6lO7DsUCNdzBg_EF7Ru39J`，publishable 级别）；`window.SUPABASE_CONFIG = { url, anonKey }`；**无 service_role key、无密码** |
| **目标文件 2** | `auth.js`（账号模块，新增，320 行） |
| 当前行数 | 320 行 / 11524B（实测） |
| 改动类型 | ✅ 已写（守卫包装/会话/UI/错误映射）；**补充**：① 提取 `isConfigMissing(cfg)` 纯函数并挂到 `window.AUTH`（供 T02 测试 + init 复用）；② 文件末尾加 v0.24 测试段（T01/T02，见决策 2） |
| **目标文件 3** | `records.js`（云端记录模块，新增，485 行） |
| 当前行数 | 485 行 / 20252B（实测） |
| 改动类型 | ✅ 已写（CRUD/迁移/重试队列/预置）；**补充**：① `contentFingerprint`/`recordFingerprint` 挂到 `window.RECORDS`（供 T03/T04 测试 + 复用）；② 文件末尾加 v0.24 测试段（T03/T04，见决策 2） |
| **目标文件 4** | `supabase.min.js`（supabase-js v2 本地化，新增） |
| 当前行数 | 10 行 / 211KB（压缩格式，实测） |
| 改动类型 | ✅ 已备（本地化，无 CDN 依赖） |
| **目标文件 5** | `standalone-split.html`（外部 JS 引用版，主产物） |
| 文件头注释 | `<!-- 八字排盘 · 从真版 v0.23.0 | 2026-08-22 -->`（**需更新 v0.24.0**） |
| 当前行数 | 911 行（`wc -l` 实测） |
| 改动类型 | ✅ 已集成 v0.24：L616 `<script src="supabase.min.js">`（head 尾部）、L619 authOverlay（body 开头）、L681-683 三按钮（💾保存云端/☁️我的排盘/🚪登出，输入行 AI录入 后）、L885 recordsOverlay / L896 recordDetailOverlay（body 尾部）、L906-908 config/auth/records script（body 尾部） |
| **目标文件 6** | `standalone.html`（内联回退版，单体） |
| 文件头注释 | `<!-- 八字排盘 · 从真版 v0.23.4 | 2026-08-27 -->`（**需更新 v0.24.0**） |
| 当前行数 | 10546 行（`wc -l` 实测） |
| 改动类型 | **待同步**（T1）：内联 v0.24 全量（authOverlay + 3 按钮 + recordsOverlay/recordDetailOverlay + supabase.min.js/config/auth/records 内联段），见决策 1 |
| **目标文件 7** | `index.html`（Clacky 面板内联版，单体） |
| 文件头注释 | `<!-- 八字排盘 · 从真版 v0.23.4 | 2026-08-27 -->`（**需更新 v0.24.0**） |
| 当前行数 | 10547 行（`wc -l` 实测） |
| 改动类型 | **待同步**（T1）：与 standalone.html 同构（当前字节级一致，diff 实测通过）；内联 v0.24 全量 |
| **目标文件 8** | `main.js`（模块版，测试区所在） |
| 当前行数 | 1273 行（`wc -l` 实测） |
| 改动类型 | **补充**：测试区渲染段（L1197-1248）后暴露 `window.__testAppend(t)` 辅助（~15 行），供 auth/records 追加 v0.24 断言（见决策 2）；**同步到两个单体版内联 main 段**（L1 教训） |
| **目标文件 9** | `api/handler.rb` |
| 改动类型 | ✅ 已加 config.js/auth.js/records.js/supabase.min.js 模块路由（%w[...] 列表） |
| **目标文件 10** | `scripts/check-release.sh` |
| 当前行数 | 97 行 |
| 改动类型 | **扩展**：① KEYS 追加 v0.24 id（btnSaveCloud/btnMyRecords/btnLogout/authOverlay/recordsOverlay/recordDetailOverlay/authEmail/regEmail/btnAuthLogin/btnAuthRegister/btnAuthRegister2/authLinkLogin/authLinkRegister/recordsList/recordDetail）；② MODULES 追加 config/auth/records/supabase 四段（index vs standalone 内联一致性）；③ 新增「外部 JS vs 内联段」一致性（auth.js/records.js/config.js 与单体版内联段 cmp，防漂移） |
| **目标文件 11** | `ext.yml` / `CHANGELOG.md` / `SYSTEM.md` |
| 改动类型 | 发布师范围（T5/T6）：ext.yml v0.23.3→v0.24.0、CHANGELOG 补条目、SYSTEM.md 版本历史补 v0.23.1~v0.24.0 |

> **文件路径**：所有目标文件位于 `/Users/feng/.clacky/ext/local/bazi-paipan/`。
>
> **本版本不动**：constants.js（3220 行）、algorithm.js（700 行）、archive.js（916 行）、gongwei.js（1139 行）、render.js（1574 行）——v0.24 是纯账号/存储功能，算法与渲染零改动（AR02 保证）。

---

## 一、架构决策（对应 PRD §10 五个输入点）

### 决策 1：单体版内联合成方案（PRD §10.1）——最小 diff 五段插入 + check-release.sh 扩展

**问题**：v0.24 代码目前只存在于分体版（standalone-split.html + 4 个独立 JS 文件），单体版（standalone.html / index.html）为 v0.23.4 零集成。PRD L1 硬门槛要求单体版**自包含、离线可用**（standalone.html 是回退版/离线版，不能依赖外部 JS；index.html 是 Clacky 面板内联版）。

**决策**：以 standalone-split.html 已集成的 v0.24 UI 为**唯一真相源**，把五段内容按「同款位置」内联进单体版；内联 JS 段带版本注释块，使 check-release.sh 可定位比对（与六模块段同机制）。**插入点与 split 版位置一一对应**（编程师建议已采纳）：

| # | 内容 | 单体版插入点 | split 版参照 |
|---|------|------------|-------------|
| 1 | supabase.min.js 内联段 | `</head>` 前（head 尾部，`<script>` + `/* 八字排盘 v0.24.0 — supabase.min.js */` + 压缩内容 + `</script>`） | L616 |
| 2 | authOverlay（登录/注册双盒 + 错误提示） | `<body>` 后第一个元素 | L619-657 |
| 3 | 三按钮（💾保存云端/☁️我的排盘/🚪登出） | 输入行 `btnScreenshot` 按钮之后（注意：**以代码为准是 3 个按钮，非 PRD 写的 4 个**，PRD §4.3 措辞误差已由 Leader 确认以代码为准） | L681-683（split 实际在 AI录入 后；单体版 btnScreenshot 后位置等价） |
| 4 | recordsOverlay + recordDetailOverlay | 主 `</script>` 大块（render+main 合并块 L6811-9662）之后、隐私初始化 script 之前/之后均可（**建议在隐私初始化 script 之后**，保持 body 尾部结构稳定） | L885 / L896 |
| 5 | config.js / auth.js / records.js 内联段 | body 尾部（recordsOverlay 之后）：三个独立 `<script>` 块，各带 `/* 八字排盘 v0.24.0 — xxx.js */` 版本注释 | L906-908 |

**顺序要求（关键）**：supabase.min.js 必须在 config.js 之前（head 尾部天然满足）；config → auth → records 必须按序（auth 依赖 config 的 SUPABASE_CONFIG；records 依赖 AUTH 与 ALGO；auth 守卫包装 APP.doPaipan 必须在 main 段之后执行 → 内联段放 body 尾部天然满足）。

**check-release.sh 扩展（三处，防 L1 复发）**：
1. `KEYS` 追加 16 个 v0.24 id（见目标文件信息表）；
2. `MODULES` 由 `constants algorithm archive gongwei render main` 追加 `config auth records supabase` 四段——用 `— xxx.js */` 注释定位提取 index.html 与 standalone.html 内联段做 `cmp`（与六模块段同机制）；
3. **新增第 4 步「外部 JS vs 内联段」一致性**：`cmp auth.js <(提取 standalone.html 内联 auth 段)`、records.js、config.js 同理；supabase.min.js 同理（单体版内联的压缩内容必须与外部文件字节一致）。这是本次防漂移的核心防线（v0.22.0/v0.23.4 教训：模块版改了内联版没改）。

**理由**：五段插入点与 split 版一一对应，编程师可直接从 split 版复制 UI 段（零重写）；内联段带版本注释使 check-release.sh 能机械验证一致性；四段独立 `<script>` 块（非并入 render+main 大块）避免与既有六模块段提取逻辑冲突。

**代价**：standalone.html/index.html 各增大 ~211KB（supabase.min.js）+ ~31KB（auth+records+config）+ UI ~10KB；与 constants.js 735KB 同级，可接受（PRD §9.6 已确认）。

### 决策 2：T3 自动化断言挂载点（PRD §10.2）——`window.__testAppend` 异步追加 + auth/records 文件内测试段

**问题（编程师侦察确认的硬约束）**：main.js 测试区（L767 起）是**同步渲染**（`for` 循环一次渲染完 `#test-results`/`#test-summary`，无异步等待机制）；而 auth.js/records.js 在 main.js 段**之后**加载（split 是 body 尾部 src；单体版将内联在 main 段后）→ 测试区同步执行时 `window.AUTH` / `window.RECORDS` **尚不存在**。若 T01-T04 直接放 main.js 测试区，会因依赖未加载而崩。

**决策：混合方案——「main.js 暴露追加辅助 + auth/records 文件内测试段 + 纯函数微重构」**：

1. **main.js 测试区渲染段后**（L1248 `})();` 之前）暴露：
   ```js
   // v0.24.0 追加断言辅助：auth/records 加载完成后可继续追加断言并重算统计
   window.__testAppend = function(t) {
     var results = document.getElementById('test-results');
     var summary = document.getElementById('test-summary');
     if (!results) return;
     var passed = 0, failed = 0, existing = 0;
     Array.prototype.forEach.call(results.querySelectorAll('[data-ok]'), function(el) {
       existing++;
       if (el.getAttribute('data-ok') === '1') passed++; else failed++;
     });
     var ok = !!t.ok;
     if (ok) passed++; else failed++;
     var block = document.createElement('div');
     block.setAttribute('data-ok', ok ? '1' : '0');
     block.style.cssText = 'margin-bottom:6px;padding:8px 12px;border-radius:4px;font-size:14px;font-family:monospace;background:' + (ok ? '#1b3a1b' : '#3a1b1b') + ';border-left:3px solid ' + (ok ? '#4caf50' : '#f44336');
     block.textContent = (ok ? '✅ ' : '❌ ') + t.label + (t.detail ? ' — ' + t.detail : '');
     results.appendChild(block);
     var total = existing + 1;
     var bannerColor = failed === 0 ? '#4caf50' : '#f44336';
     var bannerBg = failed === 0 ? '#1b3a1b' : '#3a1b1b';
     var bannerIcon = failed === 0 ? '✅ 全绿' : '❌ 失败';
     var bannerText = failed === 0 ? '全部 ' + total + ' 条断言通过！' : failed + '/' + total + ' 条断言失败';
     summary.style.cssText = 'background:' + bannerBg + ';border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;border:2px solid ' + bannerColor;
     summary.innerHTML = '<div style="font-size:32px;margin-bottom:8px">' + bannerIcon + '</div><div style="font-size:20px;font-weight:bold;color:' + bannerColor + '">' + bannerText + '</div><div style="color:#888;font-size:13px;margin-top:4px">含 v0.24 追加断言</div>';
     document.title = failed === 0 ? '✅ 全部通过 — 八字排盘回归测试' : '❌ ' + failed + ' 失败 — 八字排盘回归测试';
   };
   ```
2. **auth.js 文件末尾加 v0.24 测试段**（`?test=1` 时执行）：
   - T01：`isTestMode() === true`（URL 含 test=1）且 `window.APP.__authGuarded === true`（守卫已包装 doPaipan）→ 验证「测试模式放行」前提成立；
   - T02：`AUTH.isConfigMissing({ url: 'PASTE_xxx', anonKey: '' }) === true` 且 `AUTH.isConfigMissing({ url: 'https://ok.supabase.co', anonKey: 'sb_publishable__x' }) === false` → 凭证兜底纯逻辑。
   - **微重构**：把 init() 内的凭证判定提取为 `isConfigMissing(cfg)` 纯函数（`return !cfg || !cfg.url || !cfg.anonKey || cfg.url.indexOf('PASTE_') === 0;`），init 复用它，同时挂到 `window.AUTH`。
3. **records.js 文件末尾加 v0.24 测试段**（`?test=1` 时执行）：
   - T03：`contentFingerprint({name:'邦顺',gender:'男',year:1982,month:10,day:18,hour:5,min:1})` 两次调用 === 同值（幂等）；改 day 后 !==（不同输入不同指纹）；
   - T04：`recordFingerprint({id:'x'}) === 'arch-x'`（含 id 用 arch-id）；`recordFingerprint({name:'邦顺',...})` 以 `'fp-'` 前缀（无 id 用内容摘要）。
   - **微重构**：`contentFingerprint`/`recordFingerprint` 挂到 `window.RECORDS`（测试段直接调用，未来亦可复用）。
4. **追加方式**：auth.js/records.js 测试段末尾 `if (window.__testAppend) { window.__testAppend(...); }`，无辅助时退化为 `console.log`（兼容单独调试）；**必须同步到两个单体版的内联 auth/records 段**（L1 教训：改了外部文件没改内联段 = 三入口断言不一致）。

**为什么不用「main.js 测试区直接引用 AUTH/RECORDS」**：同步渲染时 AUTH/RECORDS 未定义，会 ReferenceError 中断整个测试区（更糟：掩盖 224 条旧断言结果）。
**为什么不用「setTimeout 延迟二次渲染」**：需侵入 main.js 渲染逻辑（把同步 for 循环改造成可重入），改动面大、易引入回归；`__testAppend` 只追加不重排，最小侵入。
**为什么不用「独立 v0.24 测试面板」**：会与 main.js 测试 UI 并存两套统计，回归报告口径分裂；复用 `#test-results` 保持单一统计与标题。

**同步要求**：main.js 的 `__testAppend` 段、auth.js 的测试段、records.js 的测试段**三处都要落到 standalone-split.html 的对应外部文件 + standalone.html/index.html 的内联段**——共 3 份 × 3 入口 = 9 处一致（check-release.sh 第 4 步覆盖外部 vs 内联，六模块/新增模块覆盖 index vs standalone）。

### 决策 3：凭证注入方案（PRD §10.3）——本次内测直接使用 config.js 真实 anonKey；GitHub Secrets 方案本次不落实

**问题**：config.js 已填真实 anonKey（publishable 级别）。是否可提交 Git？数据库密码如何防泄露？

**决策**：
1. **真实 anonKey 直接提交 Git，可接受**——anon key 是 Supabase 设计的 publishable 凭证（前端公开安全，配合 RLS 兜底；PRD §9.2 已确认）。`sb_publishable__` 前缀即 Supabase 新式 publishable key，仅能触达 RLS 放行的数据。**绝不使用 service_role key**（config.js 文件头注释已声明红线）。
2. **数据库密码 / service_role key 绝对禁止进仓库**——config.js 只含 url + anonKey，不含密码。档案 `Supabase配置记录.md` 含数据库密码：**不得 git add**，ADR 要求 .gitignore 追加 `*配置记录*` 或发布检查清单人工核对（发布师 T5 落实）。测试报告/验收记录引用凭证时只用 config.js 的 anonKey（PRD §11 安全红线）。
3. **GitHub Secrets 注入方案（PRD §9.2 提的 ADR §1.3）本次不落实**——理由：GitHub Pages 是纯静态托管，无运行时注入通道；本次内测直接提交静态 config.js 最简可行。**留待线上发布（T6）评估**：若需强化，可在 CI 构建时用 GitHub Secrets 生成 config.js（避免 anonKey 明文进 git 历史），但这属于发布流程增强，不是本版本必须。Leader 可决策：若线上发布也不走 CI 注入，则永久接受 anonKey 进仓库（Supabase 官方推荐做法）。

### 决策 4：迁移数据结构确认（PRD §10.4）——input_data / result_data 结构与详情只读

**决策：按 records.js 现行实现确认结构，无改动**：

- **input_data（jsonb）**：`{ _fp, name, nickname, yiming, gender, year, month, day, hour, min, prov, city, dist, useSolar, calendarType, isLeap, lunarMonth, savedAt }`；迁移追加 `migratedFromLocal: true, migratedAt: ISO`；预置追加 `isPreset: true`。`_fp` 指纹字段：手动保存用 `contentFingerprint`（内容摘要），迁移用 `recordFingerprint`（档案 id 优先）。
- **result_data（jsonb）**：`{ bazi, sanyuan, extras, gongWeiType }`——保存时取 `APP.getCurrentBaziResult()` 快照；迁移时优先档案已有 `bazi/sanyuan` 快照，否则 `ALGO.paipan()` 现算（try/catch 兜底为空骨架）；预置同理现算。
- **详情只读 result_data，不重算（已确认）**：`showRecordDetail` 只用 `r.input_data` 与 `r.result_data.bazi` 渲染四柱简表，无 ALGO 调用（records.js L183-226 实测）。→ 查看详情 O(1) 网络读，性能无忧；归档可离线保留快照。
- **指纹双路去重（迁移幂等）**：云端已有集合按 `_fp` + `contentFingerprint(input)` 双路比对（兼容早期无 `_fp` 的手动保存记录），迁移前跳过已存在 → AC17 幂等成立。
- **边界风险**：1400 前简化排盘 / 无快照档案 → result_data 可能不完整（PRD §9.5），迁移逻辑已 try/catch 兜底 + 入重试队列；测试师补边界用例。

### 决策 5：RLS 策略确认（PRD §10.5）——4 条策略保留，update 策略保留（防御性）

**决策：4 条 RLS 策略（select/insert/update/delete 均限 `user_id = auth.uid()`）全部保留，满足 AC13 用户隔离**：

- **select**：必须（列表/详情/迁移去重）；
- **insert**：必须（保存/迁移/预置/重试队列）；RLS 拒绝伪造 user_id（8/23 实测 42501）；
- **delete**：必须（FR9 删除）；
- **update**：**保留（虽前端当前无 update 操作）**——理由：① RLS 策略存在本身无副作用、不增加攻击面；② 未来「编辑记录」功能（非目标但极可能后续）直接复用；③ 若删除 update 策略，未来误配置/误提交 SQL 时容易在缺失状态下上线，且策略补齐需重新授权（GRANT 踩坑已发生过，S2）；④ Supabase 默认安全模型建议四操作全覆盖。成本仅一行 SQL，无风险。

---

## 二、变更影响面（目标文件修改清单）

| 文件 | 改动点 | 位置 | 规模 | 状态 |
|------|--------|------|:---:|:---:|
| config.js | 凭证（真实 anonKey） | 全文件 | 15 行 | ✅ 已备 |
| auth.js | 主体逻辑 | 全文件 | 320 行 | ✅ 已写 |
| auth.js | isConfigMissing 提取 + 挂 AUTH | init 内 + window.AUTH | ~8 行 | ⚠️ 待办 |
| auth.js | v0.24 测试段（T01/T02） | 文件末尾 | ~25 行 | ⚠️ 待办 |
| records.js | 主体逻辑 | 全文件 | 485 行 | ✅ 已写 |
| records.js | 指纹函数挂 RECORDS | window.RECORDS | ~3 行 | ⚠️ 待办 |
| records.js | v0.24 测试段（T03/T04） | 文件末尾 | ~25 行 | ⚠️ 待办 |
| supabase.min.js | 本地化库 | 全文件 | 10 行/211KB | ✅ 已备 |
| standalone-split.html | 头部注释 v0.23.0→v0.24.0 | L2 | 1 行 | ⚠️ 待办 |
| standalone.html | 内联 v0.24 五段 + 头部注释 v0.24.0 | head 尾部/body 开头/输入行/body 尾部 | ~+252KB | ⚠️ 待办 |
| index.html | 与 standalone.html 同构同步 | 同上 | ~+252KB | ⚠️ 待办 |
| main.js | `window.__testAppend` 辅助 | L1248 前 | ~25 行 | ⚠️ 待办 |
| main.js | 内联 main 段同步（index/standalone） | index L8389 段 / standalone 同 | ~25 行×2 | ⚠️ 待办 |
| api/handler.rb | 模块路由 | %w[...] 列表 | ✅ 已改 |
| scripts/check-release.sh | KEYS 16 个 id + MODULES 4 段 + 第 4 步外部 vs 内联 | L17/L25/新增 | ~40 行 | ⚠️ 待办 |
| **合计** | | | **~+520KB（含 211KB×2 压缩库）** | |

**体积/性能影响**：两单体版各增大 ~252KB（supabase.min.js 211KB 为主要开销），与 constants.js 735KB 同级可接受；弹层均为 display:none 常驻 DOM（PRD §七 已确认无实质性能影响）；无新增网络请求（supabase 本地化，零 CDN）。

---

## 三、风险矩阵

| 编号 | 风险 | 概率 | 影响 | 缓解 |
|------|------|:---:|:---:|------|
| R1 | **单体版同步遗漏（L1 复发，本版最高风险）**：只改 split 版/外部文件，忘同步 standalone.html/index.html | 高（历史两次复发） | 高 | 决策 1 五段插入点与 split 一一对应；check-release.sh KEYS+MODULES+第 4 步三重校验；AR04/AR05 三入口双环境回归 |
| R2 | 内联 auth/records/config 与外部 JS 漂移（模块版改了、单体内联没改） | 中 | 高 | check-release.sh 新增第 4 步「外部 JS vs 内联段」cmp（决策 1） |
| R3 | T3 测试断言时序：main.js 测试区同步执行时 AUTH/RECORDS 未加载导致 ReferenceError | 高（编程师已确认） | 高 | 决策 2：`__testAppend` 追加辅助 + auth/records 文件内测试段，零侵入 main.js 渲染 |
| R4 | 凭证安全：数据库密码/secret 误提交 Git | 低 | 严重 | config.js 只含 anonKey；.gitignore 追加配置记录；发布师 T5 检查清单（决策 3） |
| R5 | 内联 supabase.min.js 体积（211KB×2） | 低 | 低 | 与 constants 735KB 同级可接受（PRD §9.6） |
| R6 | PRD 措辞「4 个按钮」与代码 3 个不一致 | 低 | 低 | Leader 已确认以代码为准（💾/☁️/🚪 三按钮），ADR 决策 1 注明 |
| R7 | auth/records 网络异步导致迁移/列表时序竞态（onLogin 内 loadAndRenderRecords 与 checkAndMigrate 并行） | 中 | 中 | 存量已实测通过；测试师浏览器级用例覆盖 AC16-AC20 |
| R8 | 回滚后 standalone-split 与单体版版本不一致（回滚只回单体版） | 低 | 中 | 回滚按四入口整体回退到 v0.23.4 tag（§六） |

---

## 四、实现指引（给编程师）

### 改动顺序（按依赖排序，10 步）

1. **auth.js**：提取 `isConfigMissing(cfg)` 纯函数 → init() 复用 + `window.AUTH.isConfigMissing` 挂出；文件末尾加 v0.24 测试段（T01/T02，调用 `window.__testAppend`，无则 console.log）；
2. **records.js**：`contentFingerprint`/`recordFingerprint` 挂到 `window.RECORDS`；文件末尾加 v0.24 测试段（T03/T04）；
3. **main.js**：测试区渲染段后（L1248 `})();` 前）插入 `window.__testAppend` 辅助；
4. **standalone-split.html**：L2 头部注释 v0.23.0 → v0.24.0（脚本引用顺序已正确：head 有 supabase.min.js，body 尾部 main 后 config/auth/records）；
5. **standalone.html（模板）**：按决策 1 五段插入（head 尾部 supabase 内联、body 开头 authOverlay、输入行 btnScreenshot 后 3 按钮、body 尾部 recordsOverlay/recordDetailOverlay + config/auth/records 内联段），每段带 `/* 八字排盘 v0.24.0 — xxx */` 注释；L2 头部 v0.23.4 → v0.24.0；
6. **index.html**：与 standalone.html 保持字节级一致（可直接 `cp standalone.html index.html`，当前两文件 diff 为 0）；
7. **check-release.sh**：KEYS 追加 16 个 v0.24 id；MODULES 追加 config/auth/records/supabase；新增第 4 步「外部 JS vs 内联段」一致性（提取 standalone.html 内联段与 auth.js/records.js/config.js/supabase.min.js cmp）；
8. **验证**：`bash scripts/check-release.sh .` 全过；`node --check` 内联段语法 OK（supabase.min.js 压缩格式 node --check 应通过，若因 `var supabase=...` 单行过场需确认提取逻辑不截断）；
9. **回归冒烟**：`?test=1` 三入口跑 224 旧断言 + T01-T04；手动 1982-10-18 排盘与 v0.23.4 结果一致（AR02）；
10. **交付测试师**：三入口（split/standalone/index）× 双环境（http/file）账号功能全链路用例（注册/登录/保存/查看/删除/迁移/隔离）。

### 自检清单（8 项）

- S1 三文件（split/standalone/index）均有 authOverlay、recordsOverlay、recordDetailOverlay、btnSaveCloud、btnMyRecords、btnLogout（grep 各 1 命中）；
- S2 index.html 与 standalone.html 字节级一致（`diff` 0）；
- S3 单体版内联 config/auth/records 段与外部 JS 文件一致（check-release.sh 第 4 步通过）；
- S4 `?test=1` 三入口 T01-T04 全绿且追加到统一统计（#test-summary 含 v0.24 追加断言字样）；
- S5 224 条旧断言三入口全过（v0.24 不触碰算法）；
- S6 `bash scripts/check-release.sh .` 退出码 0；
- S7 config.js 不含 service_role key/密码（grep 无 `service_role`、无密码特征）；
- S8 未登录访问被拦截（登录遮罩 + 排盘守卫）；?test=1 放行。

### 关键陷阱（4 个）

1. **supabase.min.js 内联段不能用文本替换方式硬塞**——它是 10 行压缩代码，直接粘贴进 `<script>` 时若编辑器/脚本做了换行转义会破坏语法；建议用脚本读文件生成内联段（`<script>/* 八字排盘 v0.24.0 — supabase.min.js */\n` + 原文 + `\n</script>`），并跑 check-release.sh 第 1 步 node --check 验证；
2. **T3 测试段不能放 main.js 测试区内部**——同步渲染时 AUTH/RECORDS 未加载必然 ReferenceError，还会让 224 条旧断言全灭；必须用 `__testAppend` 追加方案（决策 2）；
3. **三入口断言一致**——main.js `__testAppend` 与 auth/records 测试段改完后，**三个入口（split 外部 + 两单体内联）都要同步**，只改外部文件会让 index.html?test=1 缺 v0.24 断言（L1 教训的精确复刻）；
4. **check-release.sh 第 2 步提取逻辑**——它用 `— xxx.js */` 注释定位 + `rfind('<script>')` 取整块，新增四段必须各自独立 `<script>` 块且带注释，否则会被并入前一段导致 cmp 失败。

---

## 五、验证方案与回滚

### 验证方案（对齐 PRD §6 断言 AC01-AC22 + T01-T04 + AR01-AR06）

1. **自动化断言**：`?test=1` 三入口各跑 224 旧断言 + T01-T04（决策 2 挂载）全绿；T03/T04 验证指纹幂等与规则；
2. **回归锚点**：1982-10-18 05:01 男 / 王阳明 1472-10-31 22:01 / 苏轼 1037 三锚点排盘结果与 v0.23.4 完全一致（AR02）；
3. **三文件一致性**：`bash scripts/check-release.sh .` 退出码 0（AR04，含新增 KEYS/MODULES/第 4 步）；
4. **三入口双环境**：split/standalone/index × http/file 账号功能一致（AR05）；file:// 下 Supabase 网络调用由测试师验证（CORS 由 Supabase 默认允许 all origins，预期通过）；
5. **手动全链路**（测试师浏览器级）：注册即登录（AC02）→ 登录 30 天免登（AC06）→ 保存/列表/查看详情/删除（AC09/AC11/AC12）→ 用户隔离 B 读不到 A（AC13）→ 断网保存入队恢复补传（AC14）→ 本地迁移 N 条一条不丢 + 重复幂等（AC16/AC17）→ 预置 16 孩只上传一次（AC19）→ 未配置凭证兜底（AC21，临时把 config.js 改占位验证后还原）。

### 回滚方案

- 四入口整体回退：`git checkout v0.23.4 -- index.html standalone.html standalone-split.html main.js` + 删除未跟踪的 config.js/auth.js/records.js/supabase.min.js（或保留不影响旧版，旧版不引用它们）；
- 若仅账号功能出问题、算法排盘正常：可**只回退账号层**（删除 body 尾部 v0.24 内联段 + authOverlay/按钮/弹层 + head supabase 内联段），算法段不受影响（v0.24 零触碰算法，AR02 保证）——但需重新过 check-release.sh；
- 回滚后验证：1982-10-18 排盘正常、`?test=1` 224 旧断言全过（不含 T01-T04）。

---

## 六、非目标（与 PRD §八一致）

不做付费/订阅/会员；不做第三方登录（仅 Email 密码）；不做密码找回/邮箱验证开发；不做云端与本地双向实时同步（本版单向：本地→云端迁移 + 云端保存/读取）；不做记录搜索/导出/批量操作；不做算法层任何改动；不新增第三方依赖（supabase-js 已本地化）。GitHub Secrets 注入本次不落实（决策 3），留线上发布评估。
