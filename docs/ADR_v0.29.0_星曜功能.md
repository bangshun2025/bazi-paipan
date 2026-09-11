# ADR v0.29.0：盘面「星曜」行 + 星曜设置页 + ALGORITHM.md §21

> 归属：八字排盘（从真版） ｜ 角色：架构师（worker_3526ba52） ｜ 编排：orch_111162f7d306
> 日期：2026-09-11 ｜ 状态：**架构定稿（D1–D12 已全部裁决），待编程师实现**
> 上游：`docs/PRD_v0.29.0_星曜功能.md`（md5 `0c686b743e159a9ea194bdbadd58184c`，539 行）
> 版本判定（Leader/PRD）：**v0.29.0（MINOR）** —— 新增盘面展示行 + 新增设置页 + 新增算法规范章节，向后兼容
> 基线：正式 tag `v0.26.0`（= 回滚锚点）；其上已叠加 v0.27.0（真太阳时）、v0.28.0（干支行改月建干支）**内测实现（未 commit）**
> 回滚方式见 §12（**不要用 `git checkout v0.26.0 --` 一刀切**，会连带丢失 v0.27/v0.28 成果）

---

## 0. 决策摘要（TL;DR）

### 0.1 十二项待确认项（PRD §11 D1–D12）逐条裁决

| 编号 | 议题 | **架构裁决** | 一句话理由 |
|---|---|---|---|
| **D1** | 三垣区是否同步新增星曜行 | **同步新增** | 纳音/纳运/星运/自坐/空亡/神煞均四柱+三垣镜像；不镜像则盘面行序不自洽 |
| **D2** | L3/L4 是否显示星曜 | **显示** | 现有分级为「累积展开」语义（级别越高隐藏越少），L2 起显示即 L3/L4 同显 |
| **D3** | 未填数据时显示 `—` 还是隐藏整行 | **显示 `—`（行始终存在）** | 行序稳定；隐藏会导致行序/索引随数据变化，反而不稳；且可发现功能 |
| **D4** | ALGORITHM.md 编号 | **新增顶层 `## 21. 星曜`，追加于 §20 之后** | 不重号、不动既有 §1–§20 及全库对「§15 纳音」「§16 藏干」等引用；挂 §15.3 语义不纯 |
| **D5** | 数据是否上云 | **本版仅本机 + 导出/导入 JSON** | 复用宫位模式成本最低；上云列 §11 遗留项（D5） |
| **D6** | 输入长度上限 | **星曜名称 ≤ 8 字；来源体系 ≤ 12 字**（`maxlength` 硬截断 + 轻微提示） | 与宫位标签量级一致；防撑破行宽 |
| **D7** | 类名 / row-type 命名 | **`class="rx"`；`data-row-type="xingyao xy1"`**（四柱/带大运流年列）；三垣区 `data-row-type="xingyao"` | `xingyao` 供分级 CSS；`xy1` 为**大运/流年列刷新 token**（见 D8/§6） |
| **D8** | 大运/流年列是否显示星曜 | **显示**（按大运/流年干支查表），并在 `_applyDLUpdates` 两套 updates 表各加 `xy1` 条目 | 大运/流年亦有干支，与纳音同列行为一致；不加则点选后该列星曜不随动 |
| **D9** | 设置页是否含导出/导入 JSON | **含**（复用 `gongwei.js` export/import，含 `schemaVersion` 校验） | 本机唯一数据源需可备份/迁移 |
| **D10** | 未保存关闭是否二次确认 | **不弹确认**，等同「还原」（丢弃草稿） | 不丢已保存数据；弹确认反而打断；PRD §6.4 已定 |
| **D11** | 盘面显示「名称」还是「名称+来源体系」 | **仅显示名称**；来源体系放单元格 `title` 悬浮提示 | 行窄、体系字数不定；tooltip 兼顾可查 |
| **D12** | 是否新增独立模块 `xingyao.js` | **新增独立模块**（仿 `gongwei.js`） | 设置页 + 持久化 + 查表 + 刷新自成一域；便于三端与测试 |

### 0.2 三项核心架构结论（本次最大风险点）

| 编号 | 结论 |
|---|---|
| **A1 行插入方案** | **保持所有既有 magic index 赋值一字不改**，改为在**赋值全部完成后**用 index-independent 的 `insertBeforeNayin(arr, rowHtml)` 把星曜行插到「首个含 `nayin` 的行」之前。**不重排、不改索引**，从根本上规避 PRD §2.8 标红的两处硬编码偏移。 |
| **A2 大运/流年刷新** | `_applyDLUpdates` **本就是语义选择器驱动**（`data-row-type~="dy1|ln1|…"`），非索引驱动 → 只需在两套 `updates` 表各加一条 `['xy1', …]`；并扩展通用循环支持可选 `u[5]/u[6]`（回写 `data-xy-gz`），**向后兼容**。 |
| **A3 值级刷新** | 星曜单元格携带 `data-xy-gz="<该列干支>"`；`RENDER.refreshXingyaoRows()` = 遍历 `td[data-xy-gz]` 重算文本，**不重排盘、不动分级态**，实现 FR8.2「保存后即时生效」。 |

---

## 1. 上游与基线

### 1.1 上游 PRD 要点映射

| PRD | 内容 | 本 ADR 落点 |
|---|---|---|
| FR1 | 新增星曜行（藏气与纳音之间） | §6 |
| FR2 | L2 起显示 | §7 |
| FR3 | 工具栏「星曜」按钮 | §8.1 |
| FR4 | 设置页四列 × 60 行 | §8.2 |
| FR5 | 对应关系纳入 ALGORITHM.md | §4 |
| FR6 | 修改/清空/还原 | §9 |
| FR7 | 文案统一「星曜」 | §10.6 |
| FR8 | 持久化与生效链路 | §3 + §5 |
| FR9 | 导出/导入 JSON | §3.4 |
| §9 AC01–AC14 / T01–T10 | 验收 | §11 |

### 1.2 基线事实（2026-09-11 实测）

```
render.js           1716 行
main.js             1780 行
index.html         11700 行   （内联全量）
standalone.html    11700 行   （内联全量，与 index.html 模块段一致）
standalone-split.html  941 行 （外链 render.js / main.js / xingyao.js）
ext.yml version = 0.28.0
```

- **三端架构**：`index.html` 与 `standalone.html` 为「内联全量」（各模块以 `/* 八字排盘 vX — <m>.js */` 边界注释切块）；`standalone-split.html` 为「外链模块」。
- **真源代码文件**：`constants.js` / `algorithm.js` / `archive.js` / `gongwei.js` / `render.js` / `main.js`（外部 .js）+ 两个内联 HTML 副本，共「一源三端」。
- **60 六甲子数据源**：`constants.js:885–892` `NAYIN`（`TG[i%10]+DZ[i%12]` 遍历 60 对，`i=0→甲子 … i=59→癸亥`），与 `ALGORITHM.md §1.5` 基准（1984 甲子）一致。

---

## 2. 现状勘察（精确锚点）

> 行号为 2026-09-11 实测。**内联副本相对外部文件的偏移 ≈ +7080**（例：`render.js:898` ↔ `index.html/standalone.html:7978`）。

### 2.1 `buildPillarRows()`（render.js:220–299）

四柱区 `main[]` 行序（**不新增行**）：
```
[0]主星 [1]天干(ln1) [2]地支(dy2) [3]本气 [4]中气 [5]余气
[6]纳音(nayin) [7]纳运(nayun) [8]星运(xingyun) [9]自坐(zizuo) [10]空亡(kongwang) [11]神煞(shensha)
```
三垣区 `sanyuan[]` 同序（[0]是表头 hd）。

### 2.2 单人主表（`renderChart`，render.js:519–583）—— 高风险

```js
519  var bp = buildPillarRows({ nian:pNian, … });
531  var mainRows = bp.main.slice();
533  mainRows[0] = …主星… (行内自带 7 列)
535  mainRows[1] = …天干 ln1…
537  mainRows[2] = …地支 dy2…
539  mainRows[3] = …藏气 ln2…
540  mainRows.splice(4, 2);           // ← 删中气/余气，索引整体前移
542  mainRows[4] = …纳音 nayin dy3…
544  mainRows[5] = …纳运 nayun dy4…
546  mainRows[6] = …星运 xingyun ln3…
548  mainRows[7] = …自坐 zizuo dy5…
550  mainRows[8] = …空亡 kongwang ln4…
551  mainRows[9] = …神煞 shensha dy6…
552  for (var fixI = 0; …) { … insSuffix(…, suffixMain) … }   // 给缺列行补 大运/流年 空列
555  chartRows.push.apply(chartRows, mainRows);
558  chartRows.push('<tr class="sanyuan-sep"…>');
561  var syRows = [];
563–573  三垣 主星/天干/地支/藏气/纳音(nayin)/纳运/星运/自坐/空亡/神煞
577  chartRows.push.apply(chartRows, syRows);
```

### 2.3 双人卡片（`buildCardHTML`，render.js:1034–1089）—— 高风险

```js
1034 var rows = buildPillarRows(p, { diffMap });
1039 if (includeLuckCols && curDaYun && curLiuNian) {
1042   rows.main[0]  = …主星 dy1…
1050   rows.main[1]  = …天干 ln1…
1052   rows.main[2]  = …地支 dy2…
1053   rows.main[3]  = …本气 ln2…
1055   rows.main[4]  = …中气 dy3…
1057   rows.main[5]  = …余气 ln3…
1058   rows.main[6]  = …纳音 nayin dy4…
1060   rows.main[7]  = …纳运 nayun dy5…
1062   rows.main[8]  = …星运 xingyun ln4…
1064   rows.main[9]  = …自坐 zizuo dy6…
1066   rows.main[10] = …空亡 kongwang ln5…
1068   rows.main[11] = …神煞 shensha dy7…
1070   rows.sanyuan[0] = …表头…
1071   for (si = 1; si < rows.sanyuan.length; si++) rows.sanyuan[si] += 空 sep/col-ln 列;
1075 }
1077 var titleHtml = …
1087 return … rows.main.join('\n') … rows.sanyuan.join('\n') …
```

### 2.4 `_applyDLUpdates()`（render.js:898–932；index/standalone:7978–8016）

- **语义选择器驱动**：`getRow = t => tableEl.querySelector('[data-row-type~="'+t+'"]')`。
- 单人 `updates`（10 条）：`dy1..dy6` / `ln1..ln4`（render.js:906–917）。
- 双人 `updates`（12 条）：`dy1..dy7` / `ln1..ln5`（render.js:921–932）。
- 通用循环写入 `tds[5]`（大运列）与 `tds[6]`（流年列），要求该行 `tds.length ≥ 7`。

### 2.5 分级 CSS（index.html/standalone.html:216–238；standalone-split.html 同区）

```
.level-0 隐: xingyun zizuo nayin nayun kongwang shensha
.level-1 隐: nayin nayun kongwang shensha
.level-2 隐: kongwang shensha
.level-3 隐: shensha
.level-4 隐: （无）
```

### 2.6 工具栏模板三处（render.js:673 / 1242 / 1353）

```html
<button class="btn-simple active" onclick="RENDER.toggleLevel()" title="…">极简</button>
${renderGongWeiPanel()}…
```

### 2.7 设置页先例

`gzSettingsOverlay`（index/standalone:823+）：overlay + modal + header/✕ + list + footer（恢复默认/回收站/导出/导入/保存并关闭）；函数 `GONGWEI.openGzSettings/closeGzSettings`（gongwei.js:568+）。

### 2.8 内联模块边界（index.html 实测）

```
640   supabase.min.js
906   constants.js
4127  algorithm.js
4829  archive.js
5748  gongwei.js
7081  render.js
8799  main.js
10613 config.js / 10628 auth.js / 11042 records.js / 11553 gongwei-cloud.js
```

### 2.9 需警惕的硬编码（PRD §2.8）

| 位置 | 现状 | 本 ADR 处置 |
|---|---|---|
| render.js:519–556（index/standalone:7599–7636） | `mainRows[0..9]` + `splice(4,2)` | **不改索引**；在 L551 后、L552 前插入星曜行（§6.2） |
| render.js:1040–1069（index/standalone:8120–8149） | `rows.main[3..11]` | **不改索引**；在 L1075 后统一插入（§6.3） |
| render.js:906–932（index/standalone:7986–8012） | 两套 dy/ln updates | 各加 `['xy1', …]` 一条（§6.4） |

---

## 3. 数据模型与持久化

### 3.1 存储结构与键

**主键**：`localStorage['bz_xingyao_map']`

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-09-11T07:40:00+08:00",
  "map": {
    "甲子": { "name": "", "system": "" },
    "乙丑": { "name": "", "system": "" },
    "……":  { "name": "", "system": "" },
    "癸亥": { "name": "", "system": "" }
  }
}
```

- **主键 = 六十甲子字串**（`甲子`…`癸亥`），与 `NAYIN` 表键完全一致；**写盘时规范化补齐 60 键**（缺失补 `{"name":"","system":""}`）。
- `name` = 星曜名称；`system` = 来源体系；**空串 = 未填**。
- **纳音五行不入库**：由 `NAYIN[干支].slice(-1)` 派生（只读列），杜绝冗余漂移。
- `schemaVersion = 1`（常量 `XY_SCHEMA_VERSION`）。

### 3.2 键清单

| 键 | 用途 |
|---|---|
| `bz_xingyao_map` | 主数据（§3.1） |
| `bz_xingyao_map_corrupt_<时间戳>` | 损坏串备份（v0.25.0「防静默重置」同款） |
| `bz_xingyao_map__test` | `?test=1` 测试态隔离键（**不污染真实数据**） |

### 3.3 读取与容错（PRD §8-1..§8-5）

1. `JSON.parse` 失败 / 非对象 → 备份原串到 `bz_xingyao_map_corrupt_<ts>` → 恢复全空 → `alert('星曜数据已损坏，已为您备份原数据并恢复为空。')`（**测试态跳过 alert**）。
2. `schemaVersion` 高于当前 → 只读降级：忽略未知字段、缺失字段补空，不崩溃。
3. 缺项（<60）→ 以程序生成的 60 甲子为准，缺失视为空。
4. 多余键（非六十甲子）→ 忽略，`console.warn`，不渲染、不报错。
5. `localStorage` 不可用（隐私模式/配额）→ 降级内存态，页脚提示「星曜数据仅本次会话有效」，不抛异常。

### 3.4 导出 / 导入 JSON（FR9 / D9）

**导出**（`XINGYAO.exportJson()`）：
```json
{
  "app": "bazi-paipan",
  "config": "xingyao",
  "schemaVersion": 1,
  "exportedAt": "2026-09-11T07:40:00+08:00",
  "map": { "甲子": { "name": "", "system": "" }, "…": {} }
}
```
文件名：`八字排盘_星曜配置_<yyyyMMdd-HHmm>.json`。

**导入**（`XINGYAO.importJson(obj)`）：先 `validateImportPayload`（`app/config/schemaVersion/map` 结构 + 60 键类型），**校验失败绝不写盘、绝不产生 backup 键**；成功后按 `bz_xingyao_map<ts>.backup` 备份旧值再覆盖，并 `refresh` 盘面。

---

## 4. `docs/ALGORITHM.md` 写入规范

### 4.1 章节位置与编号（D4）

- 新增顶层章节 **`## 21. 星曜`**，追加于 `## 20. 验证数据集`（文件末）之后。
- **同步更新文首目录**（第 21 项）。
- **不改动 §1–§20 任何内容与编号**（全库大量引用「§15 纳音」等，中途插入会大面积失效）。

### 4.2 章节内容与锚点

```markdown
## 21. 星曜

### 21.1 定义
星曜 = 以「六十甲子」为键、由用户自定义的「星曜名称」与「来源体系」映射表；
不参与任何命理推导，仅作盘面展示。纳音五行列为只读派生列（引用 §15.1）。
键序与 §1.5 干支纪年周期一致（甲子→癸亥，基准 1984 甲子）。

### 21.2 六十甲子 → 星曜名称 / 来源体系 对应表

<!-- XINGYAO_TABLE_START -->
| 六十甲子 | 纳音五行 | 星曜名称 | 来源体系 |
|---------|---------|---------|---------|
| 甲子 | 金 | — | — |
| 乙丑 | 金 | — | — |
| …（共 60 数据行，六十甲子正序）… | | | |
| 癸亥 | 水 | — | — |
<!-- XINGYAO_TABLE_END -->

### 21.3 生效机制
1. 运行时数据源：浏览器 `localStorage.bz_xingyao_map`（schemaVersion 1）。
2. 盘面按各柱干支查 §21.2 语义呈现；未填显示「—」。
3. §21.2 为「可归档的项目级默认表」（默认全「—」）；**用户私有数据默认不写入仓库**。
```

**硬约束**：四列、表头固定、**60 数据行**、`—` 表空；表格区块**必须**被
`<!-- XINGYAO_TABLE_START -->` 与 `<!-- XINGYAO_TABLE_END -->` 包裹（**下划线**，与 PRD §6.2 字面一致）。

### 4.3 写入时机（三阶段）

| 阶段 | 何时 | 谁 | 写入内容 |
|---|---|---|---|
| **T1 骨架** | 本 ADR 定稿后、实现期 | 编程师 | `## 21. 星曜` + 表头 + 60 行占位「—」+ 锚点 + 目录项 |
| **T2 运行时** | 用户每次「保存并关闭」 | 程序（浏览器） | 只写 `localStorage.bz_xingyao_map`，**不写仓库文件**（浏览器无文件写权限 + 隐私） |
| **T3 固化** | 需将某套体系固化为项目默认时（发布阶段） | 发布师 | `python3 scripts/sync-xingyao-algorithm.py --apply` 用导出的 JSON 重写 §21.2 区块 |

> **裁决（回应需求 5「写入 ALGORITHM.md」）**：浏览器无法直接写仓库文件，故拆为两条闭环——
> **运行时闭环**：设置页保存 → `localStorage` → 渲染即时生效（T2）；
> **规范闭环**：导出 JSON → `sync-xingyao-algorithm.py` 幂等重写 §21.2 → 规范与运行时同源可追溯（T3）。
> 二者共同构成「存储 / 加载 / 生效」完整链路，满足需求 5 的实质（可追溯且被渲染实际使用）。

### 4.4 幂等重写脚本 `scripts/sync-xingyao-algorithm.py`

**接口**：
```
python3 scripts/sync-xingyao-algorithm.py \
    --source <导出JSON 或 bz_xingyao_map JSON> \
    --target docs/ALGORITHM.md \
    [--apply]        # 缺省 dry-run，只打印将写入的区块
```

**实现要点**：
1. 读 `--source`，按 `TG[i%10]+DZ[i%12]`（i=0..59）正序渲染 60 行；纳音五行 = `NAYIN[干支]` 末字；空值渲染为 `—`。
2. 读 `--target`，定位 `<!-- XINGYAO_TABLE_START -->`…`<!-- XINGYAO_TABLE_END -->`，**整块替换**。
3. 生成内容**无随机、无时间戳、行序固定** → 同一 source 重复执行结果字节一致。

**失败即不写（幂等安全）**：
| 情形 | 行为 |
|---|---|
| 锚点缺失 | 打印错误，**退出码 ≠ 0，不写文件** |
| 锚点重复出现 | 打印错误，**退出码 ≠ 0，不写文件** |
| `--source` 解析失败 / 非 A 模式 | 报错退出，不写 |
| 表外内容（§21.1/§21.3 及其它章节） | **一字不改** |

**验收**：连续执行两次 `--apply` → `md5 docs/ALGORITHM.md` 相同（AC13）。

---

## 5. 加载与渲染生效链路

### 5.1 模块加载顺序（新增 `xingyao.js`）

```
constants.js → algorithm.js → archive.js → gongwei.js → xingyao.js → render.js → main.js → …
```

- `xingyao.js` 依赖 `TG/DZ/NAYIN`（constants）与 `escHtml`（archive），但**必须在 render.js 之前**（render 渲染期调用 `XINGYAO.nameOf`）。
- `render.js` 通过 `window.XINGYAO` 惰性引用（渲染期调用，非加载期）。

### 5.2 闭环链路

```
[设置页] 编辑草稿 → 保存 → persist() 写 localStorage['bz_xingyao_map']
                                   ↓
                          XINGYAO 内存 RUNTIME_MAP 更新
                                   ↓
              RENDER.refreshXingyaoRows()  ← 值级刷新，不重排盘、不动分级态
                                   ↓
              遍历 td[data-xy-gz] → textContent = nameOf(gz) / title = systemOf(gz)
                                   ↓
                        盘面星曜行即时更新（FR8.2 / AC08）

[页面加载] XINGYAO.init() 读 localStorage → 建 RUNTIME_MAP
                                   ↓
              renderChart / buildCardHTML 渲染时逐柱 XINGYAO.nameOf(柱干支)
                                   ↓
              无数据 → 单元格 '—'（D3）；历史档案无星曜数据 → 同样全 '—'，天然兼容
```

### 5.3 历史档案 / 兼容降级

- 星曜配置为**全局本机配置**，**不随档案存储**。历史档案（含 v0.26 之前）打开时，`RUNTIME_MAP` 若无该干支则渲染 `—`，**不报错、不阻塞**。
- 档案导入导出、云端记录（records.js）**不含星曜字段**，零影响。

### 5.4 测试态隔离（PRD §8-13）

- `xyIsTestMode()` = `/[?&]test=1(&|$)/.test(location.search)`。
- 测试态：读写 `bz_xingyao_map__test`；alert 类提示静默；测试段结束可 `resetTestStore()` 复位。

---

## 6. 行插入与索引偏移统一方案（**核心**）

### 6.1 统一原则

> **不改任何既有 magic index 赋值；星曜行在赋值全部完成之后，按「语义锚点」插入。**

新增 render.js 内部 helper：

```js
// v0.29.0：在首个含 nayin 的行之前插入星曜行（index-independent）
function insertBeforeNayin(arr, rowHtml) {
  for (var i = 0; i < arr.length; i++) {
    if (/data-row-type="[^"]*\bnayin\b/.test(arr[i])) { arr.splice(i, 0, rowHtml); return; }
  }
  arr.push(rowHtml); // 兜底：不会发生，仅防御
}
```

行构造 helper（含 D11 tooltip、D8 大运/流年、`data-xy-gz` 刷新锚）：

```js
function xyTd(gz, extraCls) {                 // 单个星曜单元格
  if (!gz) return '<td class="' + (extraCls||'') + '">—</td>';
  var nm = XINGYAO.nameOf(gz), sys = XINGYAO.systemOf(gz);
  var t = sys ? ' title="' + escHtml(sys) + '"' : '';
  return '<td class="' + (extraCls||'') + '" data-xy-gz="' + gz + '"' + t + '>' + escHtml(nm) + '</td>';
}
// 四柱区 7 列（含大运/流年）
function xyRowMain(p, pDy, pLn) {
  return '<tr class="rx" data-row-type="xingyao xy1">' + rl('星曜')
    + xyTd(p.nian.gan + p.nian.zhi) + xyTd(p.yue.gan + p.yue.zhi)
    + xyTd(p.ri.gan + p.ri.zhi) + xyTd(p.shi.gan + p.shi.zhi)
    + xyTd(pDy.gan + pDy.zhi, 'sep col-dy')
    + xyTd(pLn.gan + pLn.zhi, 'col-ln') + '</tr>';
}
// 三垣区 7 列（尾部为占位空列，视分支）
function xyRowSy(p, pDy, pLn, withTail) { … }   // 逻辑同上，列取 tai/ming/shen
```

> `XINGYAO.nameOf(gz)`：`gz` 为空 / 非法 / 未填 → 返回 `'—'`。`escHtml` 防注入（PRD §8-8）。

### 6.2 单人主表插入点（render.js:519–556）

| 位置 | 处置 |
|---|---|
| L533–551 `mainRows[0..9]` 赋值 | **一字不改** |
| L540 `splice(4, 2)` | **一字不改** |
| **L551 之后、L552（`for` insSuffix 循环）之前** | **插入** `insertBeforeNayin(mainRows, xyRowMain(p, pDy, pLn))` ∎ |
| L552–556 insSuffix 循环 | **不改**：星曜行已自带 `sep col-dy`，循环条件 `indexOf('sep col-dy')===-1` 自然跳过 |

> 插入后 `mainRows` 变为 11 项，星曜位于 `[4]`（藏气 `[3]` 与纳音 `[5]` 之间）；**此前无任何索引赋值，此后无任何索引赋值** → 零偏移。

### 6.3 三垣区（单人 syRows 与双人 rows.sanyuan）

| 位置 | 处置 |
|---|---|
| 单人 `syRows`（render.js:561–577） | **L577（`chartRows.push.apply`）之前** 插入 `insertBeforeNayin(syRows, xyRowSy(p, null, null, false))` ∎ |
| 双人 `rows.sanyuan`（render.js:1071–1074） | **L1070 之前**（si 循环之前）插入，使其自动获得尾部空列 ∎ |
| 双人 `rows.main`（render.js:1040–1069） | **L1075（`}` 结束）之后、L1077 之前** 插入 `insertBeforeNayin(rows.main, xyRowMain(p, pDy, pLn))`；非 `includeLuckCols` 分支用 5 列版 `xyRowMainNoLuck(p)` ∎ |

> 单人 mode：`pDy/pLn` 在 renderChart 内可用；双人 mode：`pDy/pLn` 在 `includeLuckCols` 分支内构造，需将插入语句置于该分支作用域内或提前取出变量。

### 6.4 `_applyDLUpdates` 扩展（render.js:898–932 及 index/standalone 7978–8016）

**两套 `updates` 各追加一条**（位置任意，语义定位）：
```js
// 单人 updates（L906–917）
['xy1', XINGYAO.nameOf(pDy.gan+pDy.zhi), XINGYAO.nameOf(pLn.gan+pLn.zhi),
         undefined, undefined, pDy.gan+pDy.zhi, pLn.gan+pLn.zhi],
// 双人 updates（L921–932）：同上
```

**通用循环扩展**（向后兼容，既有条目 `u[5]/u[6]` 为 `undefined`，不受影响）：
```js
if (u[5] !== undefined) tds[5].setAttribute('data-xy-gz', u[5]);
if (u[6] !== undefined) tds[6].setAttribute('data-xy-gz', u[6]);
```

> `getRow('xy1')` 在单人合并表内取**首个**匹配（四柱区星曜行）；三垣星曜行**不带 `xy1`**（避免误命中），其单元值由渲染期写入 + §5.2 属性刷新维护。

### 6.5 受影响索引清单（供编程师逐条核对，**均"不改"**）

| 文件 | 行号 | 内容 | 处置 |
|---|---|---|---|
| render.js | 533–551 | `mainRows[0..9]` 赋值 | **不改**（插入点在 551 之后） |
| render.js | 540 | `mainRows.splice(4,2)` | **不改** |
| render.js | 1042–1068 | `rows.main[0..11]` 赋值 | **不改**（插入点在 1075 之后） |
| render.js | 1071–1074 | `rows.sanyuan` si 循环 | **不改**（星曜行在 1070 前插入，随循环补列） |
| index.html / standalone.html | +7080 偏移（7599–7636、8120–8149） | 同上 | **不改** |
| render.js | 906–932 | `_applyDLUpdates` 两套 updates | **各 +1 条 `xy1`**（追加，不重排） |

### 6.6 导出路径 `renderChartToHtml`（render.js:1624–1687）

- 该路径无 `data-row-type`、不参与分级；为「档案展开/导出」保持一致，**建议**在 L1653（藏气）之后、L1655（纳音）之前加 `<tr class="rx"><td class="rl">星曜</td>…</tr>`（含 `data-xy-gz`）。
- 优先级 **P2**（不阻塞主 AC）；若时间紧可裁剪，但需在实施记录注明。

---

## 7. 简分级别显示矩阵

| 级别 | 标签 | 星曜行 | 说明 |
|---|---|---|---|
| `level-0` | 极简 | **隐藏** | 与 nayin/xingyun 同档 |
| `level-1` | 简 | **隐藏** | |
| `level-2` | 中 | **显示** | 起始显示级别（FR2.2） |
| `level-3` | 详 | **显示** | 累积展开 |
| `level-4` | 全 | **显示** | |

**CSS 改动**（三端各一份，追加于 index.html/standalone.html:216–238 区）：
```css
/* v0.29.0 星曜：L0 极简、L1 简 隐藏；L2 中起显示 */
.chart.level-0 tr[data-row-type~="xingyao"],
.chart.level-1 tr[data-row-type~="xingyao"] { display:none; }
```
> `.level-2/3/4` 无需新增规则（累积展开语义下自然可见）。
> **行始终插入**（D3/§6），显隐纯由 CSS 控制 —— 与 `ln2/ln3` 同法，DOM 结构稳定，断言更稳。

**L2 标题文案**（render.js:194 `LEVEL_TITLES[2]`）：
```
'简分级别：星运自坐纳运纳音星曜（点击展开）'
```

---

## 8. 设置页 UI 结构

### 8.1 工具栏「星曜」按钮（FR3 / D7）

在三处模板的 `btn-simple` 与 `renderGongWeiPanel()` 之间插入：
```html
<button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button>
```
| 位置 | 场景 |
|---|---|
| render.js:673 | 单人排盘 top-bar |
| render.js:1242 | 双胞胎（龙凤胎）top-bar |
| render.js:1353 | 双胞胎另一分支 top-bar |

### 8.2 设置页结构（FR4 / D12）

沿用宫位设置骨架（overlay + modal），类前缀 `xy-`（静态结构放三端 HTML，动态列表由 `xingyao.js` 渲染）：

```html
<div class="xy-settings-overlay" id="xySettingsOverlay" onclick="XINGYAO.closeSettings()">
  <div class="xy-settings-modal" onclick="event.stopPropagation()">
    <div class="xy-settings-header">
      <span class="xy-settings-title">✦ 星曜设置</span>
      <button class="xy-settings-close" onclick="XINGYAO.closeSettings()">✕</button>
    </div>
    <div class="xy-settings-body">
      <table class="xy-table">
        <thead><tr>
          <th>六十甲子</th><th>纳音五行</th><th>星曜名称</th><th>来源体系</th>
        </tr></thead>
        <tbody id="xySettingsList"><!-- 60 行由 XINGYAO.renderSettings() 生成 --></tbody>
      </table>
    </div>
    <div class="xy-settings-footer">
      <button onclick="XINGYAO.clear()">清空</button>
      <button onclick="XINGYAO.restore()">还原</button>
      <button id="btnXyExport" onclick="XINGYAO.exportJson()">📤 导出 JSON</button>
      <button id="btnXyImport" onclick="XINGYAO.importJsonPrompt()">📥 导入 JSON</button>
      <input type="file" id="xyFileImport" accept=".json" style="display:none" onchange="XINGYAO.handleImportFile(event)">
      <button class="btn-save-close" onclick="XINGYAO.save()">保存并关闭</button>
    </div>
    <div class="xy-note">星曜数据仅保存在本机浏览器，可点「导出 JSON」备份。</div>
  </div>
</div>
```

**行渲染**（`XINGYAO.renderSettings()`，60 行，顺序 `TG[i%10]+DZ[i%12]`，i=0..59）：
```html
<tr data-gz="甲子">
  <td class="xy-gz">甲子</td>
  <td class="xy-nayin">金</td>                       <!-- NAYIN['甲子'].slice(-1) -->
  <td><input class="xy-name"   maxlength="8"  value="…"></td>
  <td><input class="xy-system" maxlength="12" value="…"></td>
</tr>
```
- 表头 **sticky**（`position:sticky;top:0`）；列表区独立滚动。
- 已填值行可加轻微底色（可选）。
- 弹出时焦点入首个输入框；`Esc` 关闭（= 还原，D10）。

---

## 9. 修改 / 清空 / 还原 语义与实现（FR6 / §7，**唯一确定**）

### 9.1 三态模型

| 概念 | 定义 |
|---|---|
| **已保存值** | `localStorage['bz_xingyao_map']` 最后一次保存成功的数据 |
| **草稿** | 设置页 DOM 输入框当前值；打开时由「已保存值」初始化 |
| **修改** | 编辑草稿 → 「保存并关闭」→ 草稿成为新的已保存值 |
| **清空** | 草稿全部输入置空（60×2）；**不落盘** |
| **还原** | 丢弃草稿，用「已保存值」重填草稿（**restore last saved**，非 restore default） |

> **还原 = 恢复上次保存**（PRD §7.3）。从未保存过 → 还原 = 全空（此时"上次保存"即出厂默认）。**不设「恢复默认」按钮**（出厂默认即全空，数值上等价清空+保存）。

### 9.2 状态机（可测）

| 初始 | 操作 | 草稿 | 已保存 / 盘面 |
|---|---|---|---|
| A | 编辑为 B | B | A |
| B | 保存 | B | **B**（盘面更新） |
| B | 清空 | 全空 | A |
| B | 还原 | A | A |
| B | 关闭（✕/空白/Esc） | — | A |
| 全空 | 保存 | 全空 | 全空（盘面全 `—`） |

### 9.3 实现要点

- `openSettings()`：`initDraftFromSaved()` → 渲染 60 行 → `overlay.classList.add('show')`。
- `clear()`：将所有 `.xy-name/.xy-system` 置空（仅草稿）。
- `restore()`：`initDraftFromSaved()` 重填（丢弃草稿）。
- `closeSettings()`：若草稿 ≠ 已保存 → 等同 `restore()` 后关闭（D10 不弹确认）；若相等 → 直接关闭。
- `save()`：`collectDraft()` → 规范化 60 键 → `persist()` → `refresh` 盘面 → 关闭 → 轻提示「星曜已保存」。

---

## 10. 三端改动清单

> 内联副本行号 = 外部文件行号 + 7079（render.js）；`main.js` 内联起点 index/standalone:8799。

### 10.1 外部源文件

| 文件 | 改动 | 优先级 |
|---|---|---|
| **`xingyao.js`（新增）** | 设置页渲染、`nameOf/systemOf/getAll`、`bz_xingyao_map` 持久化、容错、导出/导入、`refresh`、测试态隔离、`window.XINGYAO` 导出 | P0 |
| `render.js` | ① `insertBeforeNayin` + `xyTd/xyRowMain/xyRowSy` helper；② 单人主表 L551/552 间插入；③ 单人 syRows L577 前插入；④ 双人 L1075 后插入（main+sanyuan）；⑤ `_applyDLUpdates` 两套 updates 各 +1 条 + 循环支持 u[5]/u[6]；⑥ `LEVEL_TITLES[2]` 文案；⑦ 三处工具栏模板加按钮；⑧ `RENDER` 导出新增 `refreshXingyaoRows`、`insertBeforeNayin`；⑨（P2）`renderChartToHtml` 加星曜行 | P0 |
| `main.js` | ① 别名区加 `var xyNameOf = XINGYAO.nameOf;`（可选）；② 新增测试段 `tests.push({section:'星曜(v0.29)'})` + T01–T10；③ 底部结果页文案的断言计数更新 | P0 |
| `scripts/sync-xingyao-algorithm.py`（新增） | §4.4 幂等重写脚本 | P0 |
| `scripts/check-release.sh` | ① `KEYS`(:17) 追加 `xySettingsOverlay xySettingsList xy-trigger xy-note`；② `MODULES`(:14) 在 `gongwei` 后 `render` 前插入 `xingyao`；③ 步骤 4 外部↔内联比对列表加 `xingyao` | P0 |
| `docs/ALGORITHM.md` | 目录 + `## 21. 星曜` + 锚点 + 60 行占位（T1）；§20 末尾「103 条断言」计数按实现后更新 | P0 |
| `CHANGELOG.md` / `ext.yml` | **不改**（留发布阶段） | — |

### 10.2 三端 HTML

| 文件 | 改动 |
|---|---|
| `index.html` | ① CSS:216–238 区加星曜隐藏规则；② `#xySettingsOverlay` 静态结构（放 `gzSettingsOverlay` 附近，~L823+）；③ **在 `/* 八字排盘 v0.29.0 — render.js */`（L7081）之前** 新增内联 `<script>/* 八字排盘 v0.29.0 — xingyao.js */ …</script>`；④ render.js 内联段同步全部改动（+7080 偏移处） |
| `standalone.html` | 同 `index.html` 四项（该文件与 index.html 模块段须逐字节一致，由 check-release 步骤 2 守护） |
| `standalone-split.html` | ① CSS 同规则；② `#xySettingsOverlay` 静态结构；③ 在 `<script src="gongwei.js">` 之后、`<script src="render.js">` 之前插入 `<script src="xingyao.js"></script>` |

### 10.3 文案统一（FR7）

- 源码（`*.js` / `*.html`）统一「星曜」，禁止「星耀」。
- 门禁：`grep -rn "星耀" --include='*.js' --include='*.html' .` 结果为 0（PRD/复盘等引用性文档白名单）。

### 10.4 `?test=1` 新增断言（T01–T10，写入 main.js）

| 编号 | 断言 | 关联 AC |
|---|---|---|
| T01 | 60 甲子生成：`length=60`、`[0]='甲子'`、`[59]='癸亥'`、无重复 | AC05 |
| T02 | 单人行序数组：`主星→天干→地支→藏气→xingyao→nayin→nayun→xingyun→zizuo→kongwang→shensha` | AC01 |
| T03 | 分级显隐 4×2 矩阵（level-0/1 隐、level-2/3 可见） | AC02 |
| T04 | 三处模板「星曜」按钮紧随 `btn-simple`（`nextElementSibling`） | AC03 |
| T05 | 设置页：`#xySettingsOverlay.show` + 表头四列 + `tbody tr` 计数 = 60 | AC04 |
| T06 | 纳音五行抽样 12 项（甲子→金、丙寅→火…） | AC05 |
| T07 | 填某柱干支 → 保存 → 盘面该柱星曜单元格文本 = 输入值 | AC06 |
| T08 | 保存 → 刷新 → 回填 + 盘面复显；`bz_xingyao_map` 结构（schemaVersion=1、map 60 键）；损坏串 → 备份键生成 + 全空 | AC07/AC11 |
| T09 | 三功能状态机（§9.2 全表路径） | AC09/AC10 |
| T10 | `docs/ALGORITHM.md` 含 `## 21. 星曜`、锚点成对、60 行；脚本连跑两次 md5 一致（由 check-release 或独立脚本执行） | AC13 |

> 测试态用 `bz_xingyao_map__test` 隔离；每段断言后可复位，不污染真实 localStorage。

---

## 11. 验收断言点清单（映射 PRD §9）

| PRD AC | 覆盖点 | 本 ADR 落点 |
|---|---|---|
| AC01 行序 | DOM 顺序 | §6.2 / T02 |
| AC02 分级显隐 | 4 级 × 显隐 | §7 / T03 |
| AC03 工具栏按钮 | 三处模板 | §8.1 / T04 |
| AC04 设置页 | overlay + 4 列 + 60 行 | §8.2 / T05 |
| AC05 列内容 | 首末 60 甲子 + 纳音五行抽样 | §3 / T01/T06 |
| AC06 保存生效 | 值级断言（四柱 + 三垣 D1） | §5.2 / T07 |
| AC07 持久化 | schemaVersion=1 / map 60 键 / 复显 | §3.1 / T08 |
| AC08 修改即时 | 无需刷新 | §5.2 / T07 |
| AC09 清空 | 状态机 | §9.2 / T09 |
| AC10 还原 | 状态机 | §9.2 / T09 |
| AC11 损坏防御 | 备份键 + 全空 + 不抛 | §3.3 / T08 |
| AC12 文案 | grep 门禁 | §10.3 |
| AC13 ALGORITHM.md 幂等 | 锚点 + 60 行 + md5 | §4 / T10 |
| AC14 三端一致 + 无回归 | check-release + 既有断言全绿 | §10 + §12.3 |

**既有断言护航**：v0.26（339）+ v0.27（54）+ v0.28 全部须保持全绿；新增 T01–T10 追加其后。

---

## 12. 版本、兼容性与回滚

### 12.1 版本号

- **v0.29.0（MINOR）**：新增盘面展示行 + 设置页 + 算法规范章节；**JS 接口向后兼容**（无既有函数签名变更）。
- `ext.yml` version → `0.29.0`（**发布阶段由发布师执行**，编程师不改）。

### 12.2 兼容性

| 场景 | 行为 |
|---|---|
| 历史档案（无星曜数据） | 星曜行全 `—`（`RUNTIME_MAP` 空），不报错 |
| localStorage 无 `bz_xingyao_map` | 首次打开全空；盘面全 `—` |
| `?test=1` | 独立存储键，不污染真实数据 |
| 大运/流年点选 | `xy1` 条目刷新星曜列（D8） |
| 双胞胎 / 龙凤胎 / 仅老大 / 仅老二 | 三处模板均含按钮与行，值按各柱干支查表 |
| 月份越界（1000 前 / 2100 后） | 与既有一致；可用干支正常查表，缺则 `—`，不抛异常 |

### 12.3 回滚预案

> ⚠️ **不要用 `git checkout v0.26.0 -- <file>` 一刀切**：会连带丢失 v0.27（真太阳时）/v0.28（干支行）未 commit 成果。

**实施前（编程师）**：对将改动的 7 个文件做快照备份
```
mkdir -p .bak_v0.29.pre
cp render.js main.js index.html standalone.html standalone-split.html scripts/check-release.sh docs/ALGORITHM.md .bak_v0.29.pre/
```
**回滚**：`.bak_v0.29.pre/` 覆盖回原文件 + 删除 `xingyao.js` / `scripts/sync-xingyao-algorithm.py`；`#xySettingsOverlay` 与 CSS 随 HTML 回滚自然消失。

**验证回滚成功**：`bash scripts/check-release.sh` 通过 + `?test=1` 既有断言全绿。

---

## 13. 决策与理由（含 PRD 裁决）

### 13.1 逐项理由

| 编号 | 裁决 | 理由 |
|---|---|---|
| D1 三垣同步 | **同步** | 纳音/纳运/星运/自坐/空亡/神煞均四柱+三垣镜像；缺一破坏盘面自洽；用户已有三垣语义预期 |
| D2 L3/L4 显示 | **显示** | 分级为累积展开，L2 起显示即 L3/L4 同显；与 nayin 同档 |
| D3 未填 `—` | **显示 `—`** | 行序/索引稳定；隐藏行会随数据变化，反而制造不一致；且用户可发现该功能 |
| D4 §21 | **新增 §21** | 既有 §1–§20 被全库大量引用；文末追加零破坏。挂 §15.3 语义不纯（星曜有独立「来源体系」语义） |
| D5 仅本机 | **仅本机 + JSON** | 复用宫位模式成本最低、隐私最优；上云列遗留 |
| D6 长度 | **8 / 12 字** | 与宫位标签量级一致；`maxlength` 硬截断避免撑破行宽 |
| D7 命名 | **`.rx` / `xingyao xy1`** | `xingyao` 供 CSS；`xy1` 让 `_applyDLUpdates` 语义定位大运/流年列（D8） |
| D8 大运/流年显示 | **显示** | 大运/流年亦有干支，与纳音同列行为一致；并经 `xy1` 接入既有语义刷新机制 |
| D9 导出/导入 | **含** | 本机唯一数据源，需可备份/迁移；复用 gongwei export/import |
| D10 不弹确认 | **不弹** | 等同还原，不丢已保存数据；弹窗打断且 PRD §6.4 已定 |
| D11 仅名称 | **仅名称 + title** | 行窄；来源体系字数不定；tooltip 兼顾可查，不牺牲盘面整洁 |
| D12 独立模块 | **新增 xingyao.js** | 自成一域（设置页/持久化/查表/刷新），三端与测试友好；同 gongwei.js 先例 |

### 13.2 与 PRD 的偏差 / 补充（已在 ADR 内固化）

1. **行插入方案为「不改索引 + 语义锚点插入」**（PRD §2.8 建议「同步调整索引 或 改 data-row-type 驱动」）。本 ADR 选择第三、风险最低的路径：既不改索引，也不需大改 data-row-type 驱动——因为 `_applyDLUpdates` **本已**是语义驱动，而索引仅存在于「数组构造期」，插入点后移至构造完成之后即天然规避偏移。
2. **`data-row-type` 用双 token `xingyao xy1`**（PRD D7 建议单 token `xingyao`）。增加 `xy1` 的唯一目的是让 D8 的大运/流年值复用既有语义刷新通道；CSS 用 `~="xingyao"` 仍精确命中，无副作用。
3. **需求 5「写入 ALGORITHM.md」拆为运行时闭环 + 规范闭环**（§4.3）。浏览器无文件写权限，且用户私有数据不宜入库；以「导出 JSON → 幂等脚本重写 §21.2」达成可追溯且被渲染实际使用。
4. **新增 `data-xy-gz` 属性**作为值级刷新的稳定锚（§5.2），使 FR8.2「保存即时生效」无需重排盘、不动分级态。

---

## 14. 变更记录

| 版本 | 日期 | 内容 | 作者 |
|---|---|---|---|
| v1.0 | 2026-09-11 | 初版定稿：D1–D12 全部裁决 + 三核心结论（A1 行插入/A2 语义刷新/A3 值级刷新）+ 数据模型 + ALGORITHM §21 幂等规范 + 三端改动清单 + 断言清单 + 回滚预案 | 架构师（worker_3526ba52） |
| v1.1 | 2026-09-11 | 追加 §15 发布期勘误与遗留项（append-only，正文 D1–D12 未改）：E1 服务端路由白名单漏登记 xingyao.js（已修复）；E2 门禁跨层引用完整性断言（P2，留 v0.29.x） | 架构师（worker_3526ba52） |


---

## 15. 发布期勘误与遗留项（v0.29.0 内测发布窗口内补录）

> 本节为**追加（append-only）**内容，不改动 §1–§13 正文与 D1–D12 任何裁决；
> §6/§7/§10 的结论、索引与行锚点均不受影响。

### 15.1 E1（已在发布期修复）服务端路由白名单漏登记 `xingyao.js`

- **现象**：`standalone-split.html:966` 已引用 `<script src="xingyao.js">`，但 `api/handler.rb:717` 的静态 JS 白名单未登记该文件 ⇒ 模块版请求 404 ⇒ `window.XINGYAO` 不存在 ⇒ 工具栏「星曜」设置入口报错。
  （单体 `index.html` / `standalone.html` 为内联脚本，不受此路由影响。）
- **根因**：D12「新增独立模块 `xingyao.js`」在本次 ADR 的 §10.1/§10.2 清单中覆盖了「源文件 + 三端 HTML + 加载顺序」，但**未覆盖「服务端模块路由注册」这一跨层引用点**。
- **修复**（发布期，经 Leader 裁定）：两份 `api/handler.rb`（`bazi-paipan` 与内测容器 `bazi-paipan-test`）第 717 行各插入 `xingyao.js`，位置为 `gongwei.js` 之后、`render.js` 之前；**纯路由注册，未动算法与 UI**。
- **验证**：`scripts/check-release.sh` exit=0 / 121✅0❌；`/xingyao.js` 路由 404→200；内测路由页面 CDP 实测 `window.XINGYAO` 存在、星曜 overlay 可开且渲染 60 行、无失败 JS 资源。
- **架构定性**：非架构变更，属交付清单遗漏项的发布期补齐；不触发 ADR 修订。

### 15.2 E2（P2，留 v0.29.x）门禁缺一条「跨层引用完整性」断言

- **缺口描述**：`scripts/check-release.sh` 当前覆盖
  (a) 三端 HTML 与外部源文件的内容一致性（`FILES="index.html standalone.html standalone-split.html"`），
  (b) `MODULES` 列表在各端内联脚本中的存在性；
  但**未覆盖**：「`api/handler.rb` 的 JS 模块白名单 ⊇ `standalone-split.html` 的 `script[src]` 清单」。
  这两份清单是同一事实（模块集合与加载顺序）在两个层次（服务端路由 / 浏览器加载）的副本，任一处漏登记即产生 E1 类 404，且**不会**被现有门禁捕获。
- **建议断言规格（可直接实施）**：
  1. **提取 A（浏览器侧）**：从 `standalone-split.html` 按出现顺序抓取所有 `<script src="X.js">`，得有序列表 A。
  2. **提取 B（服务端侧）**：从 `api/handler.rb` 中匹配形如 `%w[...].each do |js_file|` 的模块白名单行（即 717 行；用正则而非硬编码行号），得有序列表 B。
  3. **断言 A ⊆ B**：A 中每个文件名必须存在于 B；否则 `exit≠0` 并打印缺失文件名（这是 E1 的直接哨兵）。
  4. **断言顺序一致**：A 的顺序 == B 的顺序（防加载次序回归；顺序错配同样 `exit≠0`）。
  5. **允许 B ⊃ A 但告警**：白名单中的孤儿条目以 `warning` 报告（非失败），便于发现已删除模块的残留注册。
  6. **双副本覆盖**：`bazi-paipan` 与内测容器 `bazi-paipan-test` 各跑一次（或由发布流程对两副本各执行）。
- **优先级**：P2 —— 不影响 v0.29.0 内测发布（E1 已修复），但下一次新增/删除 JS 模块时会再次触发同类故障，建议 v0.29.x 首个迭代补入门禁。
- **责任归属建议**：脚本改动属编程师；断言规格已由本节固化，无需再出 ADR。
