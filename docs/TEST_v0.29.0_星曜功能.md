# 测试用例：v0.29.0 盘面「星曜」行 + 星曜设置页 + ALGORITHM.md §21

> 归属：八字排盘（从真版） ｜ 角色：测试工程师（worker_9933551b） ｜ 编排：orch_111162f7d306
> 日期：2026-09-11 ｜ 状态：**用例定稿（判据已锁定），待实现落地执行**
> 上游判据：
> - `docs/PRD_v0.29.0_星曜功能.md`（md5 `0c686b743e159a9ea194bdbadd58184c`，539 行）
> - `docs/ADR_v0.29.0_星曜功能.md`（md5 `a687a4c6809f22ea4c435f8b28917d07`，722 行）
> 真相源仓库：`/Users/feng/.clacky/ext/local/bazi-paipan`
> 改造前基线：`check-release.sh` PASS；`?test=1` ✅ 全部通过（429 断言，0 失败）；`grep 星曜` = 0

---

## 一、缺陷严重级别定义

| 级别 | 定义 | 示例 |
|---|---|---|
| **P0** | 致命：核心不可用 / 数据丢失 / 安全漏洞 | 盘面崩溃白屏；保存后数据丢失；XSS 注入；ALGORITHM.md 被脚本误改；用户已存星曜被静默清空 |
| **P1** | 严重：主流程阻塞 | 星曜行不出现 / 行序错位（星曜与纳音颠倒）；L2 不显示；设置页打不开；保存后盘面不生效 |
| **P2** | 一般：次要功能异常 | 清空/还原语义不符；持久化刷新后丢失；损坏防御未生成备份；导出/导入失败；大运/流年列星曜不随动 |
| **P3** | 轻微：体验 / 文案 | 文案「星耀」误写；maxlength 上限不符；tooltip 缺失；L2 标题未含「星曜」 |

---

## 二、测试环境与方法

### 2.1 环境

| 项 | 值 |
|---|---|
| 仓库 | `/Users/feng/.clacky/ext/local/bazi-paipan`（真相源） |
| 三端 | `index.html`（内联全量）/ `standalone.html`（内联全量）/ `standalone-split.html`（外链模块） |
| 浏览器 | Google Chrome 150（`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`），headless 与 headful 双跑 |
| 环境 | `file://` 与 `http://` 双环境 |
| 测试态隔离键 | `localStorage['bz_xingyao_map__test']`（`?test=1` 时） |

### 2.2 方法（全部真跑，禁止只读代码下结论）

1. **发布一致性**：`bash scripts/check-release.sh`（三端语法 + 模块段一致 + KEYS/结构 + 内联漂移）。
2. **回归套件**：`?test=1`（headless dump-dom + 真实浏览器 CDP 双跑），解析 `#test-summary`。
3. **浏览器级验收（CDP）**：真实 Chrome + `Runtime.evaluate` 注入断言（行序 token、显隐矩阵、设置页三操作、值级刷新）。
4. **静态门禁**：`grep -rn 星耀 --include='*.js' --include='*.html'`；`grep -c 星曜`。
5. **ALGORITHM 幂等**：`python3 scripts/sync-xingyao-algorithm.py --apply` 连跑两次比对 md5；负例删/重锚点。

### 2.3 复跑命令（证据留痕）

```bash
# 1) 发布一致性
cd /Users/feng/.clacky/ext/local/bazi-paipan && bash scripts/check-release.sh

# 2) 回归套件（file://）
python3 /Users/feng/clacky_workspace/星曜功能-八字排盘/测试工程师/scripts/run_test_suite.py \
  /Users/feng/.clacky/ext/local/bazi-paipan/index.html

# 3) 真实浏览器 CDP 验收
python3 /Users/feng/clacky_workspace/星曜功能-八字排盘/测试工程师/scripts/cdp_xingyao.py \
  /Users/feng/.clacky/ext/local/bazi-paipan/index.html

# 4) 文案门禁
cd /Users/feng/.clacky/ext/local/bazi-paipan && grep -rn "星耀" --include='*.js' --include='*.html' . ; echo "exit=$?"

# 5) ALGORITHM 幂等
cd /Users/feng/.clacky/ext/local/bazi-paipan && python3 scripts/sync-xingyao-algorithm.py --source /tmp/xy.json --target docs/ALGORITHM.md --apply
md5 docs/ALGORITHM.md   # 连跑两次应一致
```

---

## 三、判据锁定（来自 ADR §0.1 D1–D12，测试真值）

| 编号 | 裁决（测试真值） |
|---|---|
| D1 | 三垣区**同步**新增星曜行（四柱 + 三垣两处镜像） |
| D2 | L2/L3/L4 **显示**；L0/L1 隐藏 |
| D3 | 未填数据时星曜行**始终存在**、单元格显示 `—`（不是隐藏整行） |
| D4 | ALGORITHM.md 新增顶层 `## 21. 星曜`（文末，不改 §1–§20） |
| D6 | 星曜名称 `maxlength=8`；来源体系 `maxlength=12` |
| D7 | 四柱区/带大运流年列 `data-row-type="xingyao xy1"`；三垣区 `data-row-type="xingyao"`；`class="rx"` |
| D8 | 大运/流年列**显示**星曜，点选后随动（`_applyDLUpdates` 加 `xy1` 条目 + 回写 `data-xy-gz`） |
| D9 | 设置页含 导出/导入 JSON（`schemaVersion` 校验，失败不写盘不产 backup） |
| D10 | 未保存关闭**不弹确认**，等同还原 |
| D11 | 盘面单元格**仅显示名称** `textContent`；来源体系放 `title` 属性（悬浮） |
| D12 | 新增独立模块 `xingyao.js`（`window.XINGYAO`） |

**关键断言口径（架构师复核确认）**：

1. 行标识必须用**子串匹配** `tr[data-row-type~="xingyao"]`，**严禁**断言完全等于 `"xingyao"`（四柱区为双 token `xingyao xy1`）。
2. 插入方案为「既有 magic index 一字不改 + `insertBeforeNayin()` 语义锚点插入」→ **无下游索引偏移**；改用「DOM 行序 + 值不串行」断言。
3. 关键负例：插入星曜后，`[data-row-type~="nayin"]` 行仍须是纳音行（防星曜/纳音颠倒）。

---

## 四、用例总表（AC01–AC14 覆盖矩阵）

| 用例 ID | 标题 | 关联 AC | 关联 T | 级别 |
|---|---|---|---|---|
| TC-01 | 三端发布一致性校验 | AC14 | — | P0 |
| TC-02 | 既有回归套件全绿（无回归） | AC14 | — | P0 |
| TC-03 | 单人盘面行序（藏气→星曜→纳音） | AC01 | T02 | P1 |
| TC-04 | 三垣区行序镜像 | AC01/D1 | T02 | P1 |
| TC-05 | 星曜与纳音未颠倒（关键负例） | AC01 | T02 | P1 |
| TC-06 | 值级错位回归（6 行取值不串） | AC01 | — | P1 |
| TC-07 | L0/L1 隐藏星曜行 | AC02 | T03 | P1 |
| TC-08 | L2/L3/L4 显示星曜行 | AC02 | T03 | P1 |
| TC-09 | 工具栏「星曜」按钮紧邻「简」按钮（三处模板） | AC03 | T04 | P1 |
| TC-10 | 设置页弹出 + 四列表头 + 60 数据行 | AC04 | T05 | P1 |
| TC-11 | 60 甲子首末项/无重复 + 纳音五行抽样 | AC05 | T01/T06 | P1 |
| TC-12 | 名称/体系输入框首次为空 | AC05 | T05 | P2 |
| TC-13 | 保存后盘面即时生效（四柱 + 三垣） | AC06/AC08 | T07 | P1 |
| TC-14 | 持久化：刷新回填 + 盘面复显 + 结构合规 | AC07 | T08 | P1 |
| TC-15 | 修改：改已存值 → 保存 → 即时更新 | AC08 | T07 | P2 |
| TC-16 | 清空：草稿全空、盘面不变；保存后全 `—` | AC09 | T09 | P1 |
| TC-17 | 还原：丢弃草稿回上次保存 | AC10 | T09 | P1 |
| TC-18 | 未保存关闭 = 还原（不弹确认） | AC10/D10 | T09 | P2 |
| TC-19 | 损坏防御：备份 + 恢复全空 + alert | AC11 | T08 | P0 |
| TC-20 | 文案统一「星曜」（源码无「星耀」） | AC12 | — | P3 |
| TC-21 | ALGORITHM.md §21 结构 + 锚点 + 60 行 | AC13 | T10 | P1 |
| TC-22 | 幂等脚本两次 `--apply` md5 一致 | AC13 | T10 | P1 |
| TC-23 | 幂等负例：锚点缺失/重复 → 退出码≠0 且文件不变 | AC13 | T10 | P2 |
| TC-24 | L2 标题文案含「星曜」 | FR2.3 | — | P3 |
| TC-25 | 盘面单元格 title = 来源体系（D11） | D11 | T07 | P2 |
| TC-26 | maxlength 上限（8 / 12） | D6 | — | P3 |
| TC-27 | 大运/流年列星曜值随点选刷新 | D8 | — | P2 |
| TC-28 | 导出/导入 JSON（结构 + 校验 + 失败不写盘） | AC06/D9 | — | P2 |
| TC-29 | XSS 注入防御（HTML 字符转义） | PRD §8-8 | — | P0 |
| TC-30 | localStorage 不可用降级内存态 | PRD §8-1 | — | P2 |
| TC-31 | 历史档案（无星曜数据）全 `—` 不报错 | ADR §5.3 | — | P2 |
| TC-32 | 双胞胎/龙凤胎两分支均含按钮与行 | ADR §12.2 | — | P2 |

---

## 五、详细用例

### G1 发布一致性 / 回归（P0）

#### TC-01 三端发布一致性校验 ｜ P0 ｜ AC14
- **前置**：实现完成，四文件已同步。
- **步骤**：
  1. `cd <repo> && bash scripts/check-release.sh`
- **预期**：
  - 退出码 0，末行 `🎉 全部校验通过，可以发布。`
  - 三端内联 JS `node --check` 全 OK；
  - `index.html` vs `standalone.html` 模块段逐段一致（含新增 `xingyao`）；
  - `KEYS` 含 `xySettingsOverlay`、`xySettingsList`、`xy-trigger`、`xy-note`；
  - 步骤 4 `xingyao.js 外部 vs 内联一致`。

#### TC-02 既有回归套件全绿 ｜ P0 ｜ AC14
- **步骤**：
  1. `python3 scripts/run_test_suite.py .../index.html`（file://）
  2. 真实浏览器 CDP 打开 http 环境 `?test=1`
- **预期**：`#test-summary` = `✅ 全绿 / 全部 N 条断言通过！`，`N ≥ 429`（既有全绿 + 新增 T01–T10，失败 0）。
- **判据**：失败数必须 = 0；任一既有断言转红即 P0 回归。

### G2 盘面行序与取值（P1）

#### TC-03 单人盘面行序 ｜ P1 ｜ AC01
- **步骤**（CDP `Runtime.evaluate`）：排一个已知八字（如邦顺 1982-10-18 05:01 男）→
  ```js
  [...document.querySelectorAll('.chart')][0]
    .querySelectorAll('tr[data-row-type]')
  ```
  取每行 `data-row-type` token，按 DOM 顺序输出数组。
- **预期**（四柱区，含 `xingyao` 位于 `ln2`/藏气 与 `nayin` 之间）：
  `主星→(天干 ln1)→(地支 dy2)→藏气 ln2→`**`xingyao`**`→nayin→nayun→xingyun→zizuo→kongwang→shensha`
- **注意**：星曜行 token 为 `xingyao xy1`，须用子串匹配。

#### TC-04 三垣区行序镜像 ｜ P1 ｜ AC01 / D1
- **步骤**：取三垣区 `.chart`（`bz-sanyuan-area` 内的表）行序。
- **预期**：同序含 `xingyao`（位于藏气与纳音之间），列 = 胎元/命宫/身宫；三垣星曜行 token 为单 `xingyao`。

#### TC-05 星曜与纳音未颠倒（关键负例）｜ P1 ｜ AC01
- **步骤**：
  ```js
  var rows=[...document.querySelectorAll('.chart')][0].querySelectorAll('tr[data-row-type]');
  var iXy=[...rows].findIndex(r=>/xingyao/.test(r.getAttribute('data-row-type')));
  var iNy=[...rows].findIndex(r=>/nayin/.test(r.getAttribute('data-row-type')));
  var nyText=rows[iNy].querySelector('td.rl').textContent.trim();
  ({iXy, iNy, nyText, xyText: rows[iXy].querySelector('td.rl').textContent.trim()})
  ```
- **预期**：`iXy < iNy`；`nyText==='纳音'`；`xyText==='星曜'`。（防插入点写错导致行标签互换。）

#### TC-06 值级错位回归 ｜ P1 ｜ AC01
- **步骤**：对已知八字（邦顺 1982-10-18 05:01 男），逐行核对第 k 行第 j 列：
  - 年/月/日/时柱干支 = `壬戌/庚戌/甲戌/丁卯`；
  - 纳音行四柱 = 对应干支纳音（`壬戌→大海水` 等）；
  - 纳运/星运/自坐/空亡/神煞 6 行取值与插入前既有断言（v0.26 T 段）一致；
  - 星曜行四柱 = 查表值（默认 `—`）。
- **预期**：无串行、无错位；星曜行插入不影响其余 6 行取值。

### G3 简分级别显隐（P1）

#### TC-07 L0/L1 隐藏 ｜ P1 ｜ AC02
- **步骤**：CDP 点击 `.btn-simple` 至 `level-0` / `level-1`，读
  `getComputedStyle(document.querySelector('.chart tr[data-row-type~="xingyao"]')).display`
- **预期**：均 `none`。

#### TC-08 L2/L3/L4 显示 ｜ P1 ｜ AC02
- **步骤**：切换至 `level-2/3/4`，同上读取。
- **预期**：均非 `none`（`table-row`）。
- **矩阵**：4 级 × 显隐 = L0隐/L1隐/L2显/L3显/L4显。

### G4 工具栏按钮（P1）

#### TC-09 「星曜」按钮紧邻「简」按钮 ｜ P1 ｜ AC03
- **步骤**（三处模板：单人 / 双胞胎两分支）：
  ```js
  var b=document.querySelector('.btn-simple');
  b.nextElementSibling && b.nextElementSibling.textContent.trim() // 期望「星曜」
  b.nextElementSibling && b.nextElementSibling.getAttribute('onclick') // 期望含 XINGYAO.openSettings
  ```
- **预期**：`btn-simple` 的 `nextElementSibling` 为 `星曜` 按钮（`class="btn-simple xy-trigger"`，`title="星曜设置"`）；三处模板均满足。

### G5 设置页（P1）

#### TC-10 设置页弹出 + 结构 ｜ P1 ｜ AC04
- **步骤**：点击「星曜」按钮 → 读 `#xySettingsOverlay` class、表头、`#xySettingsList tr` 数。
- **预期**：`classList.contains('show')`；表头四列 `六十甲子/纳音五行/星曜名称/来源体系`；`tbody tr` = 60；标题 `✦ 星曜设置`。

#### TC-11 六十甲子与纳音五行 ｜ P1 ｜ AC05
- **步骤**：读 60 行 `data-gz` 与 `.xy-nayin` 文本。
- **预期**：`length=60`，`[0]='甲子'`，`[59]='癸亥'`，无重复；抽样 12 项：`甲子→金`、`乙丑→金`、`丙寅→火`、`丁卯→火`、`戊辰→木`、`己巳→木`、`庚午→土`、`辛未→土`、`壬申→金`、`癸酉→金`、`甲戌→火`、`乙亥→火`（纳音五行 = `NAYIN[干支]` 末字）。

#### TC-12 首次为空 ｜ P2 ｜ AC05
- **步骤**：清 localStorage 后重开设置页。
- **预期**：全部 `.xy-name` / `.xy-system` 的 `value` 为 `''`。

### G6 保存 / 生效 / 持久化（P1）

#### TC-13 保存后即时生效 ｜ P1 ｜ AC06 / AC08
- **步骤**：打开设置页 → 给「甲子」填名称 `测试星`、体系 `测试体系` → 点「保存并关闭」→ 读盘面年柱（甲子）星曜单元格。
- **预期**：无需刷新，该单元格 `textContent === '测试星'`，`title === '测试体系'`（D11）；三垣区对应柱同步。

#### TC-14 持久化 ｜ P1 ｜ AC07
- **步骤**：保存后 `location.reload()` → 重开设置页 + 读盘面。
- **预期**：设置页回填 `测试星/测试体系`；盘面仍显示；`JSON.parse(localStorage.bz_xingyao_map)` 满足 `schemaVersion===1` 且 `Object.keys(map).length===60`。

#### TC-15 修改 ｜ P2 ｜ AC08
- **步骤**：改已存值 → 保存 → 读盘面。
- **预期**：即时更新为新值（无需刷新）。

### G7 三功能状态机（P1）

> 状态机真值（ADR §9.2）：A=已保存值，B=草稿。

#### TC-16 清空 ｜ P1 ｜ AC09
- 已保存 A，编辑为 B → 点「清空」→ 草稿全空、盘面仍 A；再「保存并关闭」→ 盘面全 `—`。

#### TC-17 还原 ｜ P1 ｜ AC10
- 草稿 B（未保存）→ 点「还原」→ 草稿回到 A、盘面 A；localStorage 仍 A。

#### TC-18 未保存关闭 = 还原 ｜ P2 ｜ AC10 / D10
- 草稿 B → 点 ✕（或点空白 / Esc）→ 无二次确认弹窗；重开设置页草稿 = A；盘面 A。

### G8 损坏防御（P0）

#### TC-19 损坏数据防御 ｜ P0 ｜ AC11
- **步骤**：`localStorage.bz_xingyao_map = '{损坏'` → `location.reload()`。
- **预期**：
  - 生成 `bz_xingyao_map_corrupt_<ts>` 备份键（值 = 原损坏串）；
  - `bz_xingyao_map` 恢复为全空结构；
  - 弹出/触发提示文案 `星曜数据已损坏，已为您备份原数据并恢复为空。`；
  - 不抛异常、盘面正常渲染（全 `—`）。
- **注**：测试态 `?test=1` 时 alert 静默、走 `__test` 键。

### G9 文案与长度（P3）

#### TC-20 文案统一 ｜ P3 ｜ AC12
- `grep -rn "星耀" --include='*.js' --include='*.html' .` → 输出为空、退出码 1；`grep -c 星曜` > 0。

#### TC-24 L2 标题含「星曜」｜ P3 ｜ FR2.3
- `RENDER` 切到 L2 后按钮 `title` 含「星曜」（`简分级别：星运自坐纳运纳音星曜（点击展开）`）。

#### TC-26 maxlength ｜ P3 ｜ D6
- `.xy-name[maxlength="8"]`、`.xy-system[maxlength="12"]`。

### G10 ALGORITHM.md（P1）

#### TC-21 §21 结构 ｜ P1 ｜ AC13
- `grep -n "^## 21. 星曜" docs/ALGORITHM.md` 命中；文首目录含第 21 项；`<!-- XINGYAO_TABLE_START -->`/`END` 各 1 次；两锚点间 60 数据行 + 表头四列；§1–§20 内容与编号未被改动（`git diff` 仅追加）。

#### TC-22 幂等两次 md5 ｜ P1 ｜ AC13
- `python3 scripts/sync-xingyao-algorithm.py --source /tmp/xy.json --target docs/ALGORITHM.md --apply` 连跑两次，`md5` 相同；表外内容一字不改。

#### TC-23 幂等负例 ｜ P2 ｜ AC13
- 删除或复制 `START` 锚点 → 脚本退出码 ≠ 0 且 `ALGORITHM.md` 字节不变（`md5` 前后一致）。

### G11 边界与异常（P2）

| 用例 | 步骤 | 预期 | 级别 |
|---|---|---|---|
| **TC-25** title 来源体系 | 保存名称+体系 → 读单元格 `title` | `title === 体系值` | P2 |
| **TC-27** 大运/流年随动 | 点选某大运/流年 → 读该列星曜单元格 | 值 = 该干支查表值；`data-xy-gz` 已回写 | P2 |
| **TC-28** 导出/导入 | 导出 JSON 检查结构；导入非法 payload | 导出含 `schemaVersion`；非法导入不写盘、不产 backup | P2 |
| **TC-29** XSS | 名称填 `<img src=x onerror=alert(1)>` → 保存 → 查看盘面 | 原样转义显示，无脚本执行 | **P0** |
| **TC-30** localStorage 不可用 | 禁用 localStorage 后打开 | 降级内存态 + 页脚提示，不抛异常 | P2 |
| **TC-31** 历史档案 | 打开无星曜数据的档案 | 星曜行全 `—`，不报错 | P2 |
| **TC-32** 双胞胎 | 打开龙凤胎/仅老大/仅老二 | 两分支 top-bar 含星曜按钮，行存在，值按柱查表 | P2 |

---

## 六、代码级检查项（静态，辅助）

| # | 检查 | 期望 |
|---|---|---|
| C1 | `render.js` 存在 `insertBeforeNayin` helper | 有；按 `data-row-type` 含 `nayin` 定位 |
| C2 | `mainRows[0..9]` / `rows.main[3..11]` 赋值与 `splice(4,2)` | **未被改动**（`git diff` 验证） |
| C3 | `_applyDLUpdates` 两套 updates | 各新增 1 条 `xy1`；循环支持可选 `u[5]/u[6]` |
| C4 | `LEVEL_TITLES[2]` | 含「星曜」 |
| C5 | `xingyao.js` | 存在 `window.XINGYAO`（`openSettings/closeSettings/save/clear/restore/nameOf/systemOf/exportJson/importJson/init`） |
| C6 | `check-release.sh` | `KEYS` 补 4 项、`MODULES` 含 `xingyao` |
| C7 | 三端 CSS | `.chart.level-0/1 tr[data-row-type~="xingyao"] { display:none; }` 各一份 |
| C8 | 加载顺序 | `xingyao.js` 在 `render.js` 之前 |
| C9 | `escHtml` 应用 | 星曜名称/来源体系渲染前转义 |

---

## 七、未覆盖项 / 限制

| 项 | 原因 | 兜底 |
|---|---|---|
| 真实用户云端同步 | D5 明确不在本版 | 不适用 |
| `renderChartToHtml` 导出路径星曜行 | ADR §6.6 标 P2，可能裁剪 | 若裁剪 → 记录并在报告标注 |
| 多浏览器（Safari/Firefox） | 项目既有验收仅 Chrome | 静态审查 CSS `~=` 与 `maxlength` 兼容性 |

---

## 八、回归策略

1. 每个 P0/P1 缺陷修复后，用**原复现步骤**复测。
2. 复测后回归：TC-01/02（一致性 + 既有断言）+ 受影响用例。
3. 报告追加「回归记录」章节（修复确认 + 回归结果 + 最终结论）。
