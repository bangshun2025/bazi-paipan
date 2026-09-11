# QA_v0.29.0_星曜功能.md — 验收报告

> **项目**：八字排盘 · 星曜功能（v0.29.0）
> **验收人**：测试工程师（worker_9933551b）
> **验收日期**：2026-09-11
> **真相源仓库**：`/Users/feng/.clacky/ext/local/bazi-paipan`
> **配套测试用例**：`docs/TEST_v0.29.0_星曜功能.md`（32 条用例）
> **验收范围**：`index.html` / `standalone.html` / `standalone-split.html` 三端，file:// 与 http:// 双环境

---

## 一、结论（放行意见）

| 项 | 结论 |
|---|---|
| **总体判定** | ✅ **验收通过，准予发布** |
| **P0 缺陷** | 0 |
| **P1 缺陷** | 0 |
| **P2/P3 缺陷** | 0 |
| **合计缺陷** | **0（零缺陷）** |
| **回归** | 无回归（既有 429 条断言全绿，新增 88 条星曜断言全绿 → 517） |
| **已知限制** | 1 项（非缺陷，见 §十一；Leader 已裁定留 v0.29.x） |

**关键数字**：`check-release.sh` 121 项全过 · `?test=1` 6 组 × 517 断言 0 失败 · CDP 交互 6 组 × 51 项 0 失败 · 补充边界 18/18 · ALGORITHM §21 幂等 md5 一致 · 错字「星耀」源码 0 条。

---

## 二、执行环境与方法

### 2.1 环境

| 项 | 值 |
|---|---|
| OS | macOS（darwin） |
| 浏览器 | 本地 Chrome（CDP `--remote-debugging-port`，独立临时 profile，不污染用户数据） |
| file:// 环境 | `file:///Users/feng/.clacky/ext/local/bazi-paipan/<端>.html` |
| http:// 环境 | `python3 -m http.server`（本地临时端口） |
| 断言注入 | CDP `Runtime.evaluate`（`bundle_main.js` 51 项 + `cdp_extra.py` 18 项） |

### 2.2 方法

全部为**真实执行**：浏览器级 DOM/计算样式断言 + 真实点击/输入 + localStorage 真读写 + 子进程真跑脚本取退出码。**不以「读代码」下结论**；凡静态检查（§六）也均以脚本可复现。

### 2.3 复跑命令与证据路径

| 步骤 | 命令 | 证据文件 |
|---|---|---|
| 总批（A–D 四棒） | `bash scripts/final_battery.sh` | `evidence/final_battery.log` |
| 发布一致性 | `bash scripts/check-release.sh` | `evidence/check_release_v029_final.txt` |
| 内置回归（6 组） | `python3 scripts/run_test_cdp.py --all` | `evidence/testsuite_{file,http}_{index,standalone,standalone-split}.json` |
| CDP 交互（6 组） | `python3 scripts/run_cdp_all.sh` | `evidence/cdp_{index,standalone,standalone-split}_{file,http}.json` |
| 补充边界 | `python3 scripts/cdp_extra.py` | `evidence/cdp_extra_index.json` / `.log` |
| sync 脚本边界 | `bash scripts/sync_checks.sh` | `evidence/sync_checks.log` |
| 截图 | `python3 scripts/shots.py` | `evidence/shots/*.png` + `evidence/shots_run.log` |
| 静态检查 | `bash scripts/static_checks.sh` | `evidence/check_release_v029.txt` |
| 基线（v0.28） | — | `evidence/BASELINE_v0.28.md`、`evidence/check_release_baseline.txt` |

---

## 三、主干验收结果

### 3.1 A) 发布一致性 `check-release.sh`（对应 TC-01 / AC14）

```
exit=0
  ✅ supabase.min.js 外部 vs 内联一致
----------------------------------------
🎉 全部校验通过，可以发布。
grep FAIL/ERROR: 0
步骤统计: 121
```

- **121 个 ✅ / 0 个 ❌**，末行输出「🎉 全部校验通过，可以发布。」
- 新增 id/类名（`xySettingsOverlay`、`xingyao`、`rx`、`xy-table` 等）均已纳入 `KEYS` 校验，未触发未登记告警。
- `md5 index.html == standalone.html` = `6d1fe367cc894d9aa080764df515f40c`，`cmp` 结果 **IDENTICAL**；`standalone-split.html` 独立一致。

### 3.2 B) 内置回归套件 `?test=1`（三端 × file/http，6 组；对应 TC-02 / AC14）

| 端 | 环境 | 标题 | 断言总数 | 失败 |
|---|---|---|---|---|
| index | file | ✅ 全部通过 — 八字排盘回归测试 | 517 | 0 |
| index | http | ✅ 全部通过 | 517 | 0 |
| standalone | file | ✅ 全部通过 | 517 | 0 |
| standalone | http | ✅ 全部通过 | 517 | 0 |
| standalone-split | file | ✅ 全部通过 | 517 | 0 |
| standalone-split | http | ✅ 全部通过 | 517 | 0 |

- **基线 429 条（v0.26:339 + v0.27:54 + v0.28:36）→ 本次 517 条，净增 88 条星曜断言，0 失败、0 回归。**
- 六组数字完全一致 → 三端行为等价（AC14 核心判据）。

### 3.3 C) CDP 浏览器交互验收（三端 × file/http，6 组 × 51 项；对应 TC-03~TC-19、TC-21、TC-25、TC-27、TC-28）

| 端 | 环境 | total | passed | failed |
|---|---|---|---|---|
| index | file | 51 | 51 | 0 |
| index | http | 51 | 51 | 0 |
| standalone | file | 51 | 51 | 0 |
| standalone | http | 51 | 51 | 0 |
| standalone-split | file | 51 | 51 | 0 |
| standalone-split | http | 51 | 51 | 0 |

**51 项明细（以 index/http 为例，六组同构；`evidence/cdp_index_http.json`）**

| # | 断言 ID | 结果 |
|---|---|---|
| 1 | T02a 四柱区存在星曜行（tokens `xingyao xy1`） | ✅ |
| 2 | T02b 星曜在藏气(ln2)之后（cg=3, xy=4） | ✅ |
| 3 | T02c 星曜在纳音之前（xy=4, ny=5） | ✅ |
| 4 | T05a 纳音行标签未被星曜顶替 | ✅ |
| 5 | T05b 星曜行标签为「星曜」 | ✅ |
| 6 | D7 四柱星曜行 `data-row-type` 含 `xy1` | ✅ |
| 7 | D7b 三垣区星曜行 `data-row-type` 不含 `xy1` | ✅ |
| 8 | D1b 三垣区星曜行标签为「星曜」 | ✅ |
| 9 | D1c 三垣区星曜在纳音之前 | ✅ |
| 10–14 | T03a/b L0/L1 隐藏（`display:none`）；T03c/d/e L2/L3/L4 显示（`table-row`） | ✅ |
| 15 | T24 星曜行与纳音行列数一致（7/7） | ✅ |
| 16–18 | T04a `.btn-simple` 存在；T04b 紧邻按钮为「星曜」；T04c 点击打开设置页 | ✅ |
| 19 | T05a overlay `#xy-settings-overlay.show` | ✅ |
| 20 | T05b 表头四列语义（六十甲子 / 纳音五行 / 星曜名称 / 来源体系） | ✅ |
| 21 | T05b2 首列表头 =「六十甲子」 | ✅ |
| 22 | T05c 60 数据行 | ✅ |
| 23–27 | T01a 甲子 / T01b 癸亥 / T01c 无重复 / T01d 正序 / T01e 初始两列留空 | ✅ |
| 28 | T06 纳音五行抽样 12 项（`mismatch=[]`） | ✅ |
| 29–30 | T12a/T12b 名称、体系输入框存在 | ✅ |
| 31–32 | D6a/D6b maxlength = 8 / 12 | ✅ |
| 33–35 | T07pre/T07a 盘面干支（壬戌）显示；T07b 保存后星曜名称即时生效 | ✅ |
| 36 | T25 单元格 title = 来源体系（D11） | ✅ |
| 37 | T07c 保存后设置页自动关闭 | ✅ |
| 38–40 | T16open 打开回填；T16a 清空后草稿空；T16b 清空不落盘、盘面仍为已保存值 | ✅ |
| 41 | T17 还原回上次保存值 | ✅ |
| 42–43 | D10 未保存关闭不弹确认；D10b 重开草稿 = 已保存值（脏草稿丢弃） | ✅ |
| 44–48 | D9a 导出 payload 结构；D9b 60 键；D9c 带已保存值；D9d 非法导入拒绝且不写盘；D9e 合法导入生效（cell=导入星） | ✅ |
| 49–51 | D8a 星曜行单元格均带 `data-xy-gz`；D8b 大运/流年列存在并回写干支（含 甲寅/丙午）；D8c 星曜行列宽与纳音行一致 | ✅ |

### 3.4 D) `docs/ALGORITHM.md` §21 幂等（对应 TC-21 / TC-22 / AC13）

```
md5 d52bc4f6f4dadfb60ad94f55f3e5364b / d52bc4f6f4dadfb60ad94f55f3e5364b  idempotent=YES
```

- 顶层标题 `## 21. 星曜`（`docs/ALGORITHM.md:691`），文末追加，**未改动 §1–§20**。
- 表格区块被 `<!-- XINGYAO_TABLE_START -->`（行 700）/ `<!-- XINGYAO_TABLE_END -->`（行 763）锚点包裹。
- 区块内表格行 **62 行 = 表头 1 + 分隔 1 + 数据 60**。
- `sync-xingyao-algorithm.py --apply` 连续两次执行，md5 前后一致 → **幂等**。

---

## 四、补充边界用例（`cdp_extra.py`，18/18）

覆盖 TEST 中未进 51 项主 bundle 的用例：

| 断言 | 结果 | 观测值 |
|---|---|---|
| T14a 保存后盘面显示 | ✅ | 持久星 |
| T14b 存储结构 `schemaVersion=1` + 60 键 | ✅ | `schemaVersion=1 keys=60` |
| T14c 刷新后盘面复显 | ✅ | 持久星 |
| T14d 刷新后设置页回填 | ✅ | 持久星 \| 持久体系 |
| T19a 损坏后生成备份键 | ✅ | `bz_xingyao_map_corrupt_1789084096201` |
| T19b 备份值 = 原始损坏串 | ✅ | `{损坏` |
| T19c 盘面星曜行全部为 `—` | ✅ | 4 柱均 `—` |
| T19d 损坏后不抛异常 | ✅ | true |
| T29a 不产生 `<img>` 元素 | ✅ | `imgs:0` |
| T29b XSS 原样转义 | ✅ | `html=&lt;img src=x onerror=alert(1)&gt;` |
| T31 无星曜数据时行存在且全 `—` | ✅ | 4 柱均 `—` |
| T32a 双胞胎分支含星曜行 + 星曜按钮 | ✅ | `cards:2 rows:4 btn:星曜` |
| T32b 龙凤胎分支含星曜行 + 星曜按钮 | ✅ | `lfRows:4 lfBtn:星曜` |
| T24 简分级别标题含「星曜」(L2) | ✅ | 「简分级别：星运自坐纳运纳音星曜（点击展开）」 |
| T26 maxlength 8/12 | ✅ | `8/12` |
| T30 屏蔽 localStorage 后各入口不抛异常 | ✅ | `init/open/save/refresh = ok` |
| X00 星曜行存在（前置） / X00b 取到盘面干支键（壬戌） | ✅ | 前置校验 |

> 注：T32a/b 首版因脚本以 `paipan(...)` 直接调用顶层函数失败（该函数封装在 IIFE 内、非全局），改用页面真实全局 `window.ALGO.paipan(...)` 后 18/18 全绿。属**测试脚本取数方式问题**，非实现缺陷。

---

## 五、幂等 / 同步脚本边界（`sync_checks.sh`，S1–S5）

| 场景 | 期望 | 实际 | 结论 |
|---|---|---|---|
| S1 `--dry-run` 不落盘 | 文件 md5 不变 | 不变 | ✅ |
| S2 `--apply` 连跑两次 md5 一致 | 幂等 | 两次均 `07d33e20ae124b2943d5ff7ce6fda7ec` | ✅ |
| S3 锚点缺失（START=0/END=1） | exit≠0 且不写文件 | `exit=1`，`unchanged=YES`，报「❌ 锚点必须各出现一次（START=0, END=1），不写文件」 | ✅ |
| S4 `--source` 非法 JSON | exit≠0 且不写文件 | `exit=1`，`unchanged=YES`，JSON 解析错误信息完整 | ✅ |
| S5 真实 target 未被误写 | `docs/ALGORITHM.md` md5 不变 | 仍为 `d52bc4f6f4dadfb60ad94f55f3e5364b` | ✅ |

---

## 六、截图证据（`evidence/shots/`）

| 文件 | 字节 | 内容 |
|---|---|---|
| `01_chart_L4.png` | 269605 | L4 全量盘面（四柱主表 + 三垣表 + 大运/流年面板 + 节气表） |
| `02_chart_L2.png` | 257809 | L2 盘面 |
| `03_chart_L1_hidden.png` | 229498 | L1（星曜行隐藏） |
| `04_chart_L0_hidden.png` | 211452 | L0（星曜行隐藏） |
| `05_settings.png` | 191062 | 星曜设置页（四列表头 + 60 数据行） |

5 张 md5 各不相同；OCR 抽查 `01_chart_L4.png` 可辨工具栏「星曜」按钮与完整盘面结构。

---

## 七、AC01–AC14 逐条判定

| AC | 内容 | 判定 | 依据 |
|---|---|---|---|
| AC01 | 行序 藏气→星曜→纳音 | ✅ | CDP T02b/T02c、D1c；列数 T24（7/7） |
| AC02 | 分级显隐 L0/L1 隐、L2–L4 显 | ✅ | CDP T03a–e（6 组 × 5 级） |
| AC03 | 工具栏「星曜」紧邻 `btn-simple`，三模板均有 | ✅ | CDP T04a–c；`?test=1` T04×3；cdp_extra T32a/b |
| AC04 | 设置页弹出 + 四列表头 + 60 行 | ✅ | CDP T05a/T05b/T05b2/T05c |
| AC05 | 60 甲子首末/无重复 + 纳音抽样 + 输入框首次为空 | ✅ | CDP T01a–e、T06、T12a/b、D6a/b |
| AC06 | 保存生效（四柱 + 三垣） | ✅ | CDP T07pre/T07a/T07b/T25/D1b |
| AC07 | 持久化刷新回填 + 复显 + 结构合规 | ✅ | cdp_extra T14a–d（`schemaVersion=1`，60 键） |
| AC08 | 修改后即时更新 | ✅ | CDP T16a/T16b/D9e；cdp_extra T14a |
| AC09 | 清空：草稿空、盘面不变；保存后全 `—` | ✅ | CDP T16a/T16b/T17 |
| AC10 | 还原 + 未保存关闭等同还原 | ✅ | CDP T17、D10、D10b |
| AC11 | 损坏防御：备份 + 恢复全空 + 不抛异常 | ✅ | cdp_extra T19a–d（备份键 `bz_xingyao_map_corrupt_<ts>`） |
| AC12 | 文案统一「星曜」，源码无「星耀」 | ✅ | `grep -rn "星耀" --include='*.js' --include='*.html'` = **0 条**（6 个源文件） |
| AC13 | ALGORITHM §21 结构 + 锚点 + 60 行 + `--apply` 幂等 | ✅ | §3.4、§五 S1–S5 |
| AC14 | 三端一致 + 无回归 + 双环境全绿 | ✅ | §3.1（121✅）、§3.2（6×517/0）、`index==standalone` md5 一致 |

---

## 八、TC-01 ~ TC-32 逐条判定

| 用例 | 判定 | 证据 |
|---|---|---|
| TC-01 三端发布一致性 | ✅ | check-release 121✅/0❌；md5 一致 |
| TC-02 既有回归全绿（无回归） | ✅ | 6 组 × 517 断言 0 失败（基线 429） |
| TC-03 单人盘面行序 | ✅ | CDP T02a/T02b(ln2→xy)/T02c(xy→ny) |
| TC-04 三垣区行序镜像 | ✅ | CDP D1b/D1c、D7b |
| TC-05 星曜与纳音未颠倒 | ✅ | CDP T05a（纳音标签仍为「纳音」） |
| TC-06 值级错位回归 | ✅ | CDP T24（列数 7/7）、T06（纳音抽样 mismatch=[]）、D8a/D8c |
| TC-07 L0/L1 隐藏 | ✅ | CDP T03a/T03b |
| TC-08 L2/L3/L4 显示 | ✅ | CDP T03c/T03d/T03e |
| TC-09 工具栏按钮三模板 | ✅ | CDP T04a–c + `?test=1` T04×3 + cdp_extra T32a/b |
| TC-10 设置页弹出 + 表头 + 60 行 | ✅ | CDP T05a/T05b/T05b2/T05c |
| TC-11 60 甲子首末/无重复 + 纳音抽样 | ✅ | CDP T01a–d、T06 |
| TC-12 输入框首次为空 | ✅ | CDP T01e、T12a/T12b |
| TC-13 保存后即时生效（四柱 + 三垣） | ✅ | CDP T07pre/T07a/T07b、D1b |
| TC-14 持久化刷新回填/复显/结构 | ✅ | cdp_extra T14a–d |
| TC-15 修改已存值 → 保存 → 更新 | ✅ | CDP T16a/T16b（保存→改→保存→盘面更新序列）、D9e |
| TC-16 清空行为 | ✅ | CDP T16a/T16b |
| TC-17 还原行为 | ✅ | CDP T17 |
| TC-18 未保存关闭 = 还原 | ✅ | CDP D10、D10b |
| TC-19 损坏防御 | ✅ | cdp_extra T19a–d |
| TC-20 文案统一「星曜」 | ✅ | 源码 grep「星耀」= 0 |
| TC-21 ALGORITHM §21 结构 | ✅ | 标题 + 锚点 + 62 表格行（60 数据） |
| TC-22 两次 `--apply` md5 一致 | ✅ | §3.4 / S2 |
| TC-23 幂等负例（锚点缺失/非法 JSON） | ✅ | S3、S4（exit=1 且不写文件） |
| TC-24 L2 标题含「星曜」 | ✅ | cdp_extra T24 标题数组 |
| TC-25 单元格 title = 来源体系 | ✅ | CDP T25 |
| TC-26 maxlength 8/12 | ✅ | CDP D6a/D6b、cdp_extra T26 |
| TC-27 大运/流年列随点选刷新 | ✅ | CDP D8a/D8b/D8c |
| TC-28 导出/导入 JSON | ✅ | CDP D9a–e（非法拒绝且不写盘） |
| TC-29 XSS 注入防御 | ✅ | cdp_extra T29a/T29b（`imgs:0`，HTML 转义） |
| TC-30 localStorage 降级 | ✅ | cdp_extra T30（各入口不抛异常） |
| TC-31 历史档案全 `—` | ✅ | cdp_extra T31 |
| TC-32 双胞胎/龙凤胎两分支 | ✅ | cdp_extra T32a/b（rows=4，btn=星曜）+ `?test=1` T04×2 |

**覆盖统计：32/32 用例通过，AC01–AC14 全覆盖。**

---

## 九、缺陷清单

**无。** P0/P1/P2/P3 合计 **0** 条。

---

## 十、非缺陷 / 已知限制（不开缺陷单）

| 编号 | 事项 | 事实与依据 | 处置 |
|---|---|---|---|
| L1 | `renderChartToHtml` / `renderExpandedChart`（精简版只读排盘）**未加星曜行** | Leader 已核实**全仓库无调用点**（仅 `main.js` 变量别名声明，无实际调用）；两函数在 v0.29 冻结版中维持原状 | **本次不补，留 v0.29.x**（Leader 裁定）。非缺陷、不影响三端主流程 |

> 说明：该限制**不构成发布阻塞**——三端所有可达路径均已含星曜行与按钮（TC-09/TC-13 证据）。

---

## 十一、被验证版本指纹（md5 / 行数）

| 文件 | md5 | 行数 |
|---|---|---|
| `index.html` | `6d1fe367cc894d9aa080764df515f40c` | 12435 |
| `standalone.html` | `6d1fe367cc894d9aa080764df515f40c`（== index） | 12435 |
| `standalone-split.html` | `682052a9a9ea4330a2c26fff2952ede3` | 1009 |
| `xingyao.js` | `a16caa34be449536f91f459a3d224f7d` | 355 |
| `render.js` | `0afb05dc20b3898742d70a75207e545a` | 1800 |
| `main.js` | `75f257851ef0922c995fb0044a41b3ab` | 2007 |
| `docs/ALGORITHM.md` | `d52bc4f6f4dadfb60ad94f55f3e5364b` | 768 |
| `scripts/check-release.sh` | `78984aeba6ec3d5436d06369d950bca7` | — |
| `scripts/sync-xingyao-algorithm.py` | `c51d3ac0d760ab0abdc9462803379703` | 125 |

> 以上 md5 为本报告**全部结论对应**的被测版本，发布师须以此为准；若发布前源码再变更，本报告结论自动失效，需重跑 §2.3 总批。

---

## 十二、测试工具自修复说明（防止误判为实现缺陷）

验收过程中出现的 3 类现象均为**测试脚手架问题**，已在脚手架侧修复，**与实现代码无关**，特此留痕：

| 现象 | 根因 | 修复 |
|---|---|---|
| CDP `Runtime.evaluate` 挂死 | 非测试态 `XINGYAO.save()` 弹 `alert('星曜已保存')` 阻塞 JS | 驱动层捕获 `Page.javascriptDialogOpening` 并自动 `Page.handleJavaScriptDialog{accept:true}` |
| 5 张截图内容全同 / 空白 | ① 认证守卫将主容器 `.page` 置 `display:none`，盘面不可见；② 默认渲染分级为 L0，导致「L4 / L0」两图实为同级 | ① RENDER 时显式 `document.querySelector('.page').style.display='block'`；② 显式循环设置 L4/L2/L1/L0 后再拍 |
| 连不上 DevTools / 502 | macOS 系统代理劫持 localhost | `urllib` 显式 `ProxyHandler({})` + 清代理 env + `NO_PROXY=*` |
| T32a/b 报 `paipan is not defined` | 脚本直呼 IIFE 内顶层函数（非全局） | 改用页面真实全局 `window.ALGO.paipan(...)` → 18/18 |

---

## 十三、复跑指引（发布前复核）

```bash
cd /Users/feng/.clacky/ext/local/bazi-paipan
bash scripts/check-release.sh                  # 期望 exit=0，121 ✅，末行「🎉 …可以发布。」
python3 /Users/feng/clacky_workspace/星曜功能-八字排盘/测试工程师/scripts/run_test_cdp.py --all
python3 /Users/feng/clacky_workspace/星曜功能-八字排盘/测试工程师/scripts/cdp_extra.py
bash /Users/feng/clacky_workspace/星曜功能-八字排盘/测试工程师/scripts/sync_checks.sh
```

期望：`?test=1` 六组均为 `total_assertions=517 / failed=0 / pass=true`；`cdp_extra` 为 `18/18 passed`；sync S1–S5 全绿。

---

## 附：证据文件索引

```
evidence/
├── final_battery.log                  # A–D 四棒总批原始输出
├── check_release_v029_final.txt       # check-release 全量 121 项
├── check_release_baseline.txt         # v0.28 基线
├── BASELINE_v0.28.md                  # 无回归比对基准
├── testsuite_file_index.json          ┐
├── testsuite_http_index.json          │
├── testsuite_file_standalone.json     │ ?test=1 六组原始 JSON
├── testsuite_http_standalone.json     │ （517 / 0 / true）
├── testsuite_file_standalone-split.json│
├── testsuite_http_standalone-split.json┘
├── cdp_index_file.json                ┐
├── cdp_index_http.json                │
├── cdp_standalone_file.json           │ CDP 交互六组原始 JSON
├── cdp_standalone_http.json           │ （51 / 51 / 0）
├── cdp_standalone-split_file.json     │
├── cdp_standalone-split_http.json     ┘
├── cdp_extra_index.json / .log        # 补充边界 18/18
├── sync_checks.log                    # S1–S5
├── shots_run.log
└── shots/                             # 01_chart_L4 / 02_chart_L2 / 03_chart_L1_hidden / 04_chart_L0_hidden / 05_settings
```

---

**验收结论：v0.29.0 星曜功能通过验收，零缺陷，准予发布。**
