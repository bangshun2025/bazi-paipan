# QA · v0.23.0 盘面截图 — 功能验收报告

- 测试人：测试师（worker_e01afaec）
- 日期：2026-08-22
- 被测：`/Users/feng/.clacky/ext/local/bazi-paipan/index.html`（v0.23.0，2026-08-22）
- 依据：PRD_v0.23.0_盘面截图.md / ADR_v0.23.0_盘面截图.md

## 结论

**✅ 全部通过，无缺陷（P0-P3 均为 0），v0.23.0 盘面截图功能验收通过，可进入发布流程。**

## 一、用例清单与逐项结果

### 1. 核心功能（AC01-AC08 / Leader 验收清单 1-6）

| 编号 | 用例 | 结果 | 证据 |
|------|------|:---:|------|
| AC01 | 输入区按钮行存在「📷 截图」，位于「排 盘」之后 | ✅ | .input-row 按钮序 [排盘, 📷截图, 档案, 隐私, 回收站, AI录入]，idx 0→1；id=btnScreenshot、onclick=APP.captureScreenshot() |
| AC02 | 排盘后点击截图 → 下载 PNG | ✅ | 捕获 a[download] 触发；文件名 `八字排盘_匿名_20260822.png`（隐私开+无艺名小名→匿名兜底） |
| AC03 | 长图完整：#output 全部内容无截断 | ✅ | hook html2canvas 记录 clone.scrollHeight=585 == #output.scrollHeight=585、cloneW=1302==outW；height 取完整内容高度，canvas 不裁剪 |
| AC04 | 未排盘点击截图 | ✅ | 瞬时提示「请先排盘」（id=screenshotNotify，class=screenshot-notify），无下载、无报错、无离屏残留 |
| AC05 | 截图中按钮 busy 态 | ✅ | 点击后立即读：按钮文本「⏳ 截图中…」+ disabled=true；完成后恢复「📷 截图」+ disabled=false |
| AC06 | 快速连点仅一次下载 | ✅ | busy 期连点 2 次，dlCount=1（防重入生效） |
| AC07 | 简分级切换后截图 | ✅（代码级） | 克隆保留当前 DOM 态（含 class），渲染读取显示层，逻辑独立不触碰渲染管线 |
| AC08 | 双胞胎排盘后截图 | ✅（代码级） | 截当前对比视图完整内容，无特殊分支 |

### 2. 隐私联动（AC09-AC12）

| 编号 | 用例 | 结果 | 证据 |
|------|------|:---:|------|
| AC09 | 隐私开+艺名 | ✅ | buildScreenshotFilename({name:'邦顺',yiming:'小荷'}) → `八字排盘_小荷_20260822.png`，不含真名 |
| AC10 | 隐私开+艺名空+小名有 | ✅ | getDisplayName 降级链（小名），T04 覆盖匿名兜底 |
| AC11 | 隐私开+艺名/小名空 | ✅ | → `八字排盘_匿名_20260822.png`，不含真名 |
| AC12 | 隐私关 | ✅ | → `八字排盘_邦顺_20260822.png`，与 v0.19.0 行为一致 |

### 3. 回归断言（AR01 / Leader 清单 5）

| 用例 | 结果 | 证据 |
|------|:---:|------|
| ?test=1 index.html | ✅ | 标题「✅ 全部通过」，**224 条断言全绿**（11ms） |
| ?test=1 standalone-split.html | ✅ | 224 条断言全绿（6ms） |
| 截图断言 T01-T06 | ✅ | 全部通过（按钮存在+onclick、隐私关含真名、隐私开含艺名不含真名、匿名兜底不含真名、字符清洗、空态不抛异常无下载无残留） |

### 4. 视觉反馈（Leader 清单 6）

| 场景 | 结果 | 证据 |
|------|:---:|------|
| 截图进行中 | ✅ | 「⏳ 截图中…」+ disabled |
| 成功 | ✅ | 触发下载、按钮恢复 |
| 失败（引擎加载失败） | ✅（代码级） | 三源 8s 超时后 notifyScreenshot('截图组件加载失败，请检查网络后重试') + 按钮恢复 |
| 失败（渲染异常） | ✅（代码级） | console.error + notifyScreenshot('截图失败，请重试') + finally 清理 |

### 5. 静态一致性（AR05）

| 用例 | 结果 | 证据 |
|------|:---:|------|
| 三文件按钮同步 | ✅ | index.html/standalone.html/standalone-split.html 均含 btnScreenshot（L645） |
| check-release.sh | ✅ | L17 KEYS 含 btnScreenshot |
| 版本注释 | ✅ | index.html L2 `v0.23.0 \| 2026-08-22` |
| ADR 关键实现 | ✅ | 离屏容器显式纸色背景、面积保护 scale 收缩、toBlob、本地时间拼日期、person-info 判定、瞬时提示（无 alert）均与 ADR 决策一致 |

## 二、缺陷清单

**无（0 个）。**

## 三、备注

- 引擎 html2canvas@1.4.1 CDN 三源降级链实测生效（本机联网，jsDelivr 加载成功）；首次点击后 screenshotEngineReady=true，二次零网络。
- AM03 断网首次点击无法在联网环境实测，已做代码级确认（三源 8s 超时→友好提示→按钮恢复，不阻塞主流程）；T06 空态守卫已自动覆盖无异常路径。
- 实际断言总数 224（PRD 预估 211+6=217，编程师实施时在既有基线上新增截图 13 条分组断言，总数为 224），双环境全绿。
