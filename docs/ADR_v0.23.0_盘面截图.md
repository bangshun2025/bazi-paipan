# ADR v0.23.0 — 盘面截图（#output 一键导出 PNG 长图）

> **版本**：v1.0
> **日期**：2026-08-22
> **作者**：架构师（worker_36df7c90）
> **状态**：待评审
> **关联文档**：PRD_v0.23.0_盘面截图.md

---

## ⚠️ 目标文件信息（必填——实现前 Leader 会验证）

> 版本号/行数均以实际读取源码确认（2026-08-22 实测，v0.22.0 已上线基线）。

| 字段 | 值 |
|------|-----|
| **目标文件 1** | `main.js` |
| 文件头注释 | `/* 八字排盘 v0.22.0 — main.js */` |
| 当前行数 | 954 行（`wc -l` 实测） |
| 改动类型 | **新增**——`APP.captureScreenshot` + `buildScreenshotFilename`/`sanitizeFilename` 纯函数 + `notifyScreenshot` 提示 + 测试 IIFE 内 6 条断言 + `window.APP` 挂载 2 成员 |
| **目标文件 2** | `index.html`（Clacky 扩展内联版） |
| 文件头注释 | `<!-- 八字排盘 · 从真版 v0.22.0 | 2026-08-11 -->` |
| 当前行数 | 9331 行（`wc -l` 实测） |
| 改动类型 | 输入区按钮行 L633「排 盘」按钮后插入「📷 截图」按钮（1 行）+ `<style>` 段新增截图提示 CSS（~12 行）+ main 内联段整段替换同步（+~120 行）+ 头部注释版本号更新 |
| **目标文件 3** | `standalone.html`（内联回退版） |
| 当前行数 | 9331 行（与 index.html **字节级一致**，diff 实测） |
| 改动类型 | `cp index.html standalone.html`（保持字节级一致） |
| **目标文件 4** | `standalone-split.html`（外部 JS 引用版，主产物） |
| 当前行数 | 838 行（`wc -l` 实测） |
| 改动类型 | 按钮 + CSS 同步（JS 逻辑经 `<script src="main.js">` L824 自动获得，无需内联） |
| **目标文件 5** | `scripts/check-release.sh` |
| 当前行数 | 97 行 |
| 改动类型 | L17 `KEYS="..."` 末尾追加 `btnScreenshot`（1 行） |

> **文件路径**：所有目标文件位于 `/Users/feng/.clacky/ext/local/bazi-paipan/`（ext 版与运行目录版 `/Users/feng/人生资产/10-开发项目/软件-八字排盘/八字排盘·运行/` 当前字节级一致，diff 实测通过）。
>
> **本版本不动**：constants.js（3220 行）、algorithm.js（689 行）、archive.js（916 行）、gongwei.js（1139 行）、render.js（1574 行）——截图是显示层的**读取**，不触碰数据层与渲染层。`ARCHIVE.getDisplayName`（archive.js L210）已存在，直接调用，无需新增。
>
> **与 v0.22.0 的关键差异**：v0.22.0 是数据表全量重生（constants/algorithm 大改）；v0.23.0 是纯增量功能，核心改动集中在 main.js 单文件，三文件同步是唯一的多文件风险点。

---

## 一、架构决策

### 决策 1：渲染引擎选型——html2canvas@1.4.1 CDN 按需加载 + 三源降级链

**问题**：DOM→PNG 渲染引擎选型。约束：零构建、纯原生 JS、单文件体积敏感（index.html 已 9331 行）。

**选项**：

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|------|------|------|------|------|
| A. html2canvas CDN 按需加载 | 首次点击动态注入 script，多源降级 | 成熟稳定、DOM 保真度高、长图（离屏克隆渲染）行业标准；运行时文件零膨胀 | 首次点击依赖网络 | ✅ **采纳** |
| B. html2canvas 内联 | minified 库写进单文件 | 离线可用 | 三文件各 +200KB；后续升级手动替换 | 🟡 备选（仅当邦顺反馈离线高频时启用） |
| C. 纯原生手写 | SVG foreignObject 或自绘 Canvas | 零依赖 | foreignObject iOS Safari 兼容性差；自绘需双份维护渲染逻辑，必漂移 | ❌ 否决 |

**决策**：方案 A。理由：截图是低频工具型操作，不进入排盘主路径，不值得为它膨胀单文件或引入高风险自绘；html2canvas 是 DOM→Canvas 事实标准（npm 周下载百万级）。

**细化参数**：

- **版本锁定**：`html2canvas@1.4.1`（2021-11 发布的 npm 事实终版，无 2.x），URL 中硬编码 `@1.4.1` 防 CDN 隐式升级导致渲染行为漂移。
- **CDN 三源降级链**（按序尝试，任一成功即停止）：

  | 优先级 | 源 | URL |
  |--------|-----|-----|
  | 1（主） | jsDelivr | `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` |
  | 2（备） | BootCDN（国内快） | `https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` |
  | 3（备） | unpkg | `https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js` |

- **加载实现**：`loadScreenshotEngine(cb)` 内部函数——逐源动态注入 `<script>`；每源 **8 秒超时**（`onload`/`onerror` 与 `setTimeout` 竞态，先到先裁决，清理失败源节点）；加载成功后校验 `typeof window.html2canvas === 'function'`（轻量可用性校验，不引入 SRI hash——CDN 内容变体多，hash 易误杀）；成功后置模块级标志 `screenshotEngineReady = true`，**二次点击零网络**（浏览器缓存 + 标志短路）。
- **失败降级路径**：三源全失败/超时 → 移除残留 script 节点 → 恢复按钮 → `notifyScreenshot('截图组件加载失败，请检查网络后重试')` → return。**不阻塞排盘主流程**。
- **方案 B 切换预案**：若邦顺反馈离线场景高频，后续版本将 `html2canvas.min.js` 下载后内联进两个内联版（各 +200KB），逻辑函数接口不变，仅 `loadScreenshotEngine` 改为直接 return 已就绪。

### 决策 2：克隆渲染实现——挂 body 离屏容器 + 显式纸色背景 + dpr 上限 2

**问题**：克隆 #output 后如何保证「所见即所得」——样式继承完整、底色正确、Retina 清晰。

**决策与参数**：

| 参数 | 值 | 理由 |
|------|-----|------|
| 克隆方式 | `output.cloneNode(true)` 深克隆 | 完整复制当前 DOM 态（含当前高亮 class、宫位标签、简分级别显示态） |
| 挂载点 | **document.body**（非离屏 iframe/documentFragment） | 克隆体脱离 document 则 CSS 不生效；body 是样式继承根，`:root` CSS 变量（`--c-ink` 等）在 body 下自然解析，零额外修正 |
| 容器定位 | `position:fixed; left:-9999px; top:0; z-index:-1; pointer-events:none` | 移出视口且不可交互，不影响页面滚动与布局 |
| 容器宽度 | 显式 `width: <原 #output offsetWidth>px` | 防克隆后父容器环境变化导致百分比宽度/布局漂移 |
| **容器背景** | 显式 `background:var(--c-paper)`（#f5f0e8） | **关键陷阱**：#output 自身无底色，页面观感底色来自 `.page` 的 `--c-paper`。克隆挂 body 后脱离 .page，若不显式声明容器背景，截图底色会变 body 土色 #e8e0d3 或透明——与页面观感不一致，直接击穿 AM01 验收。此点 PRD 未点名，架构师补充 |
| dpr 适配 | `scale = Math.min(window.devicePixelRatio || 1, 2)` | Retina 屏文字清晰；上限 2 防外接高分屏 dpr 过大导致 canvas 面积爆炸（配合决策 3 面积保护） |
| 字体 | 无需 webfont 等待 | 项目字体为系统字体族（Songti SC / PingFang SC），无远程字体资源 |
| emoji | 盘面内容（干支文字/宫位标签）不含 emoji，无渲染风险 | 截图按钮自身的 📷 在 #output 之外，不参与捕获 |
| 高亮态 | 克隆保留 class 自然继承（大运/流年选中态等） | hover 伪类态不捕获——属预期（屏幕上也仅 hover 时可见，截图时鼠标在按钮上） |
| html2canvas 选项 | `{ scale, useCORS:true, logging:false, backgroundColor:null }` | 背景由容器承担，canvas 背景置 null 防叠加变深；useCORS 对无跨域资源页面无副作用 |

**CSS 变量/个别属性兼容性**：html2canvas 对 `var()` 支持良好；多层 box-shadow、个别渐变可能渲染有差异。缓解：克隆体留在 document 内（样式已计算）；测试师 AM01/AM02 人工比对截图与页面观感；若个别样式丢失，实施时对该样式降级适配（截图分支），**不反向改主样式**。

### 决策 3：长图导出——toBlob + a[download] + canvas 面积保护

**问题**：完整高度捕获（无截断）+ 大图内存效率 + 浏览器 canvas 上限。

**决策**：

1. **捕获尺寸**：`width = clone.offsetWidth`、`height = clone.scrollHeight`（完整内容高度，远超视口的部分一并捕获）。本项目盘面实测约 1300px 宽 × 数千 px 高。
2. **canvas 面积保护**（PRD 9.3 的落地细化）：计算物理像素 `px = (width*scale) * (height*scale)`；若 `px > 32,000,000`（3200 万，Chrome 桌面安全阈值；iOS Safari 单 canvas 上限约 1678 万即 4096²），**scale 逐级收缩**：2 → 1.5 → 1 → 按 `sqrt(32e6/(width*height))` 取比例。scale=1 时 1300px 宽长图在手机上仍清晰可读，优先保证「能导出」而非「极限清晰」。分片合成（多段截取后拼接）列为未来项，本版本不实现。
3. **导出管道**：`canvas.toBlob(blob => …, 'image/png')`——**弃用 toDataURL**：toBlob 异步流式，大图内存占用约为 dataURL 字符串驻留的一半以下。Blob → `URL.createObjectURL` → 动态 `a` 元素（`a.download = filename`、`a.href`）→ `a.click()` → `revokeObjectURL` + 移除 a。
4. **a[download] 兼容**：目标环境（现代桌面 Chrome/Edge、Clacky 面板 iframe、GitHub Pages）均原生支持；不做旧浏览器兼容。若未来 Clacky 面板 iframe 加 sandbox 限制下载（AM04 冒烟覆盖），降级路径为 blob URL `window.open`——ADR 备注，本版本不实现。
5. **文件名**：`八字排盘_<显示名清洗>_<YYYYMMDD>.png`（隐私联动见决策 4/5）。YYYYMMDD **用本地时间手工拼接**（`getFullYear() + pad(getMonth()+1) + pad(getDate())`）——**禁用 `toISOString()`**：UTC 会在本地晚间跨天偏移一天。
6. **清理**：finally 块统一执行——移除离屏容器 → `canvas.width = 0` 释放内存 → 恢复按钮文案「📷 截图」+ 解除 disabled + busy 标志复位。任何异常路径都走到 finally。

### 决策 4：未排盘判定与提示方式——沿用 person-info 判定 + 瞬时提示（拒绝 alert）

**问题**：PRD 第十节提出「含 person-info 判定 vs 显式状态标志」二选一，及提示方式选型。

**决策（判定标准）**：沿用现有代码模式 `document.getElementById('output').innerHTML.indexOf('person-info') >= 0`。理由：

- 该判定已存在于 archive.js L235（togglePrivacy 重渲染判定）与内联段 L4964，**行为必然与现有重渲染逻辑一致**，零新增状态。
- 显式状态标志需在 `RENDER.doPaipan` 所有出口（正常排盘、报错出口、AI 解析出口、档案载入出口、联动切换出口）维护 set/clear——侵入面大、易漏、与现有代码异构。
- 报错态（红字 .loading）不含 person-info，判定自然排除。

**决策（提示方式）**：按钮旁**瞬时提示**（`notifyScreenshot(msg)` 内部函数——绝对定位 div 浮于按钮上方，2.5 秒后移除，重复提示前先清旧节点）。**拒绝 alert**，理由三条：

1. alert 阻塞交互，体验差；
2. **alert 会挂起 T06 自动化断言**（测试 IIFE 调用 `captureScreenshot()` 时弹窗等待用户点击，断言永远跑不完）——瞬时提示不阻塞，T06 可直接断言「返回且无异常」；
3. iframe 内 alert 行为跨环境不一致（AM04 风险）。

CSS ~12 行 + JS ~8 行，与 PRD「~120 行」估算兼容。

### 决策 5：文件名纯函数设计与断言挂载点

**问题**：PRD 第十节要求给出文件名纯函数放哪个命名空间、断言如何对接 ?test=1 框架。

**决策**：

1. **两层纯函数**（均放 main.js IIFE 内部）：
   - `sanitizeFilename(s)`：入参字符串 → 替换 `/ \ : * ? " < > |` 及空白字符为 `-` → trim → 空串返回 `'匿名'`。纯字符串函数，直接喂 T05。
   - `buildScreenshotFilename(person)`：`'八字排盘_' + sanitizeFilename(ARCHIVE.getDisplayName(person)) + '_' + localYYYYMMDD() + '.png'`。person 入参 `{name, nickname, yiming}`——与 RENDER.doPaipan L1270-1274 构造 getDisplayName 入参**同构**（从表单 `inName/inNickname/inYiming` 取值）。**文件名绝不直接读 data.name**（隐私铁律，PRD 9.4）。
2. **命名空间挂载**：`window.APP` 新增 `captureScreenshot`、`buildScreenshotFilename` 两成员（sanitizeFilename 不对外）。
3. **断言对接**：测试 IIFE（main.js L539 起）在 `window.APP` 挂载（L936）**之前**执行，断言直接引用 IIFE 内部函数名——与现有 shiShen/NAYIN 断言同构，无需 window 引用。6 条断言设计：

| 编号 | 断言 | 实现要点 |
|------|------|----------|
| T01 | `getElementById('btnScreenshot')` 非空 且 `getAttribute('onclick')` 含 `captureScreenshot` | DOM 断言：测试 UI 隐藏 .page（display:none）但 DOM 仍在，可查 |
| T02 | 隐私关闭 + 真名「邦顺」→ `buildScreenshotFilename({name:'邦顺',nickname:'',yiming:''})` 含「邦顺」 | 调 `ARCHIVE.setPrivacyMode(false)` 前置 |
| T03 | 隐私开启 + 艺名「小荷」→ 含「小荷」、不含真名 | 调 `ARCHIVE.setPrivacyMode(true)` 前置 |
| T04 | 隐私开启 + 艺名空 + 小名空 → 含「匿名」 | 降级链兜底 |
| T05 | `sanitizeFilename('小/荷 花')` → 不含 `/`、不含空格 | 纯函数直测 |
| T06 | 主动将 #output 置为占位态（`.loading`）后调 `captureScreenshot()` → 不抛异常、无下载、无残留节点 | **不能依赖「当前恰是占位态」**——测试段其他断言（v0.22.0 王阳明锚点）可能已排盘渲染，必须主动重置 #output 再断言，保证确定性 |

> **断言隔离铁律**：T02-T04 会改写 localStorage 隐私开关——**必须 try/finally 恢复原状态**（断言前读 `ARCHIVE.getPrivacyMode()` 原值，finally 中 `setPrivacyMode(原值)`），防止污染后续断言顺序依赖。断言总数 211 → 217。

---

## 二、三文件同步方案（承接遗留项 L1）与 check-release.sh

**同步机制**（沿袭 v0.21.0/v0.22.0 模式，明确分工）：

| 文件 | 角色 | 同步方式 |
|------|------|----------|
| `main.js` | 唯一 JS 真相源 | 全部截图逻辑（决策 1-5）落此文件 |
| `standalone-split.html` | 主产物 | 按钮 + CSS 人工同步（JS 经 `<script src>` 自动获得） |
| `index.html` | Clacky 扩展内联版 | 按钮 + CSS 人工同步 + **main 内联段整段替换**（从 `/* 八字排盘 v0.22.0 — main.js */` 起至对应 `</script>`，共 ~500 行整段复制新 main.js） |
| `standalone.html` | 内联回退版 | `cp index.html standalone.html`（当前字节级一致，保持） |

**check-release.sh 检查点**（L17 一行改动）：

```bash
KEYS="gzTabAll gzTabFav gzFooterFav gzSettingsActionsAll gzFooterAll btnScreenshot"
```

- 第 3/3 步「HTML 关键 id 存在性」自动覆盖三文件按钮存在性——**L1（测试代码段同步缺失）的防线之一**；
- 第 2/2 步「六模块段一致性」自动覆盖 main.js → 两个内联版的主逻辑同步（截图代码进 main 段，若只改了 standalone-split 而漏同步内联版，此步立刻红）；
- pre-commit 已挂载该脚本（SYSTEM.md 确认），改动进 git 时强制拦截。

---

## 三、变更影响面（目标文件修改清单）

| 文件 | 改动点 | 位置 | 规模 |
|------|--------|------|:---:|
| index.html | 「📷 截图」按钮（`id="btnScreenshot"`、`onclick="APP.captureScreenshot()"`、`.btn btn-privacy` 同款次按钮样式） | `.input-row` 内、「排 盘」按钮 L633 之后 | 1 行 |
| index.html | 截图瞬时提示 CSS（绝对定位、fade 过渡） | `<style>` 段末尾 | ~12 行 |
| index.html | main 内联段整段替换（含新逻辑与 6 条断言） | L7986 附近 main 段 | +~120 行 |
| index.html | 头部注释版本号 v0.22.0 → v0.23.0 | L2 | 1 行 |
| main.js | `loadScreenshotEngine`（三源降级+超时）、`captureScreenshot`（守卫/防重入/busy/克隆/渲染/导出/清理）、`sanitizeFilename`、`buildScreenshotFilename`、`notifyScreenshot` | IIFE 内部（建议置测试 IIFE 之前） | ~110 行 |
| main.js | 测试 IIFE 内 6 条断言（T01-T06） | 测试 IIFE 尾部 | ~18 行 |
| main.js | `window.APP` 挂载 +2 成员 | L936-953 | 2 行 |
| standalone.html | == index.html（cp 同步） | 全文 | — |
| standalone-split.html | 按钮 1 行 + CSS ~12 行（JS 自动获得） | 输入区 + style 段 | ~13 行 |
| scripts/check-release.sh | KEYS 追加 `btnScreenshot` | L17 | 1 行 |
| **合计** | | | **~270 行** |

**体积/性能影响**：运行时文件零膨胀（引擎 ~200KB 按需加载，仅首次，浏览器缓存复用）；排盘主路径零影响（截图逻辑完全独立，不触碰渲染管线）；截图一次性内存 = canvas 物理像素 × 4B（决策 3 面积保护下 ≤ 128MB，现代设备无压力）。

**隐私影响面**：文件名走 `getDisplayName`（决策 5），截图为显示层忠实拷贝（PRD 5.6 已决：不做截图时二次打码）。补上 L2（隐私逻辑无自动断言）缺口：T03/T04 首次将隐私降级链纳入自动化回归。

---

## 四、风险矩阵

| 编号 | 风险 | 概率 | 影响 | 缓解 |
|------|------|:---:|:---:|------|
| R1 | **底色漂移**：克隆体脱离 .page 后无纸色背景，截图底色变 body 土色或透明 | 高 | 中（AM01 击穿） | 离屏容器显式 `background:var(--c-paper)`（决策 2），列为自检项 S3 |
| R2 | html2canvas 对个别 CSS 特性（多层 box-shadow 等）渲染差异 | 中 | 低 | AM01/AM02 人工比对；实施时对该样式降级适配，不改主样式 |
| R3 | CDN 三源全部失败（离线首次使用） | 低 | 低 | 三源降级链 + 明确提示 + 按钮恢复；成功后缓存免网；高频离线再切方案 B |
| R4 | canvas 面积触浏览器上限（dpr=2 + 极长盘面） | 中低 | 中 | scale 动态收缩（决策 3），优先「能导出」 |
| R5 | 三文件同步遗漏（L1 复发） | 中 | 中 | check-release.sh `btnScreenshot` 检查点 + 六模块一致 + pre-commit 拦截 |
| R6 | 隐私泄漏：实现时图省事用 `data.name` 拼文件名 | 低 | 高 | `buildScreenshotFilename` 强制走 `getDisplayName`（决策 5）；T03/T04 断言固化；AC09-AC12 测试师专项覆盖 |
| R7 | T02-T04 断言污染隐私开关 localStorage，影响后续断言 | 低 | 中 | 断言 try/finally 恢复原状态（决策 5 铁律） |
| R8 | T06 断言被 alert 挂起（若提示误用 alert） | — | — | 已由瞬时提示方案从源头消除（决策 4） |

---

## 五、实现指引（给编程师）

### 改动顺序（8 步）

1. `main.js`：新增 5 个函数（loadScreenshotEngine → notifyScreenshot → sanitizeFilename → buildScreenshotFilename → captureScreenshot）+ `window.APP` 挂载 2 成员；
2. `main.js`：测试 IIFE 尾部追加 T01-T06（注意 T02-T04 的 try/finally 隔离）；
3. `index.html`：按钮 + CSS + main 内联段整段替换 + 版本注释；
4. `standalone.html`：`cp index.html standalone.html`；
5. `standalone-split.html`：按钮 + CSS；
6. `scripts/check-release.sh`：KEYS 追加；
7. 本地验证：`standalone-split.html` 排盘后手动截图（长图完整、底色正确、文件名正确）+ `standalone-split.html?test=1` 断言 217 条；
8. 发布前 `bash scripts/check-release.sh .` 全绿 + 测试师 AM01-AM05 冒烟。

### 自检清单（10 项）

- S1 按钮在「排 盘」之后第一位置，id/onclick 正确；
- S2 未排盘点击 → 瞬时提示，无下载、无残留节点；
- S3 截图底色 = 纸色 #f5f0e8（离屏容器背景声明生效），与页面观感一致；
- S4 长图含盘面最底部内容（盘式/三垣/大运/流年/宫位标签无截断）；
- S5 文件名：隐私开启 → 艺名/小名/匿名；隐私关闭 → `小名 / 真名`；无非法字符；
- S6 Retina 屏文字清晰（scale 生效）；
- S7 连点截图仅一次下载（busy 防重入）；异常路径按钮恢复；
- S8 `?test=1` 双环境（standalone-split.html 与内联版）断言 217 条全绿；
- S9 `bash scripts/check-release.sh .` 全绿（含 btnScreenshot）；
- S10 断网首次点击 → 三源超时后友好提示，页面无异常。

### 关键陷阱（4 个）

1. **容器底色必须显式声明**（R1）——最易漏、最直观击穿验收的一处；
2. **YYYYMMDD 禁 toISOString**——UTC 跨天偏移，用本地时间手工拼接；
3. **main 内联段替换必须整段**（从模块注释起至 `</script>`），不可只插入新函数——漏替换测试段正是 L1 事故根因；check-release.sh 第 2 步兜底；
4. **断言改隐私开关必须 finally 恢复**——否则 217 条断言顺序跑动时互相污染。

---

## 六、非目标（与 PRD 第八节一致）

不做截图后编辑/标注/涂鸦；不做社交平台直接分享；不做截图自动存档/云端；不做水印；不做输入区与盘面合并整页截图（Ctrl+P 打印 PDF 已覆盖）；不做视频/GIF；不改排盘渲染逻辑；不新增常驻第三方依赖；不做每档案独立截图设置。
