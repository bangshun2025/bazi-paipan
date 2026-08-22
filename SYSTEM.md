# 八字排盘 · 项目总览

> 最后更新：2026-08-22 | 当前版本：v0.23.0
> 本文档是 AI 理解本项目的入口。新 AI 进入项目后，先读此文件。

## 项目简介

- **是什么**：八字排盘网页应用，输入出生时间排四柱、大运、流年，支持真太阳时修正与双胞胎对比
- **给谁用**：邦顺本人 + 生命算法学员（通过 Clacky 面板 iframe 嵌入 / GitHub Pages 独立访问）
- **技术栈**：原生 JS + CSS（零构建步骤）+ 6 模块 `<script>` 标签加载；后端 Ruby（Clacky ApiExtension）；部署 GitHub Pages

## 版本历史

| 版本 | 日期 | 功能 | 关键文档 |
|------|------|------|----------|
| v0.23.0 | 08-22 | 盘面截图：📷 截图按钮 + html2canvas 长图下载（隐私名+日期命名、防重入、三源降级），断言 211→224 | [PRD](docs/PRD_v0.23.0_盘面截图.md)、[ADR](docs/ADR_v0.23.0_盘面截图.md)、[QA](docs/QA_v0.23.0_盘面截图.md)、[RELEASE](docs/RELEASE_v0.23.0_盘面截图.md) |
| v0.22.0 | 08-13 | 年份扩展 1000-2100：sxtwl 数据全量重生 1101 年 + 1400 前大运留空（简化排盘）+ qiYun 空指针修复 + 小寒节气偏移修正（1/1-1/5 月柱 丑→子）+ 素素月柱断言同步，断言 211/212 双环境 | [PRD](docs/PRD_v0.22.0_年份扩展.md)、[ADR](docs/ADR_v0.22.0_年份扩展.md)、[TEST](docs/TEST_v0.22.0_年份扩展.md)、[RELEASE](docs/RELEASE_v0.22.0.md) |
| v0.21.0 | 08-12 | 1900 前排盘支持：年份 1600-2100（sxtwl 节气/农历数据）+ 大运/流年适配 + 王阳明 1472 验证 | [TEST](docs/TEST_v0.21.0_1900前排盘支持.md)、[RETRO](docs/RETRO_v0.21.0_1900前排盘支持.md) |
| v0.20.1 | 08-11 | 自动化断言补充：GWFav 常用宫位 12 条断言（迁移/级联/排序/增删/改名）+ PRD 模板新增「上版本复盘遗留项」section，断言 199→211 | [PRD](docs/PRD_v0.20.1_自动化断言补充.md)、[ADR](docs/ADR_v0.20.1_自动化断言补充.md)、[TEST](docs/TEST_v0.20.1_自动化断言补充.md)、[RETRO](docs/RETRO_v0.20.1_自动化断言补充.md) |
| v0.20.0 | 08-11 | 常用宫位分级：14 宫位两级管理（全部/常用）+ 设置页双 tab + ☆标记/独立排序/默认排序 + 旧用户自动迁移 | [PRD](docs/PRD_v0.20.0_常用宫位分级.md)、[ADR](docs/ADR_v0.20.0_常用宫位分级.md)、[TEST](docs/TEST_v0.20.0_常用宫位分级.md)、[RETRO](docs/RETRO_v0.20.0_常用宫位分级.md)、[RELEASE](docs/RELEASE_v0.20.0.md) |
| v0.19.0 | 08-09 | 隐私模式：艺名字段 + 全局隐私开关（默认开启）+ 显示层脱敏（降级链 艺名→小名→匿名） | [PRD](docs/PRD_v0.19.0_隐私模式艺名.md)、[ADR](docs/ADR_v0.19.0_隐私模式艺名.md)、[TEST](docs/TEST_v0.19.0_隐私模式艺名.md)、[RETRO](docs/RETRO_v0.19.0_隐私模式艺名.md)、[RELEASE](docs/RELEASE_v0.19.0.md) |
| v0.18.0 | 08-08 | 简0级别：新增极简层级（五层级循环）+ 四柱三垣间隔 | [PRD](docs/PRD_v0.18.0_简0级别与三垣间隔.md)、[ADR](docs/ADR_v0.18.0_简0级别与三垣间隔.md)、[TEST](docs/TEST_v0.18.0_简0级别与三垣间隔.md) |
| v0.17.0 | 08-07 | 简分级别：四层级循环切换（L0-L3）+ 纳运行位置调整 | [PRD](docs/PRD_v0.17.0_简分级别.md)、[ADR](docs/ADR_v0.17.0_简分级别.md)、[TEST](docs/TEST_v0.17.0_简分级别.md)、[RETRO](docs/RETRO_v0.17.0_简分级别.md) |
| v0.16.1 | 08-07 | 档案弹窗布局优化：dateStr 精简为仅年份 | [PRD](docs/PRD_v0.16.1_档案布局优化.md)、[ADR](docs/ADR_v0.16.1_档案布局优化.md)、[TEST](docs/TEST_v0.16.1_档案布局优化.md)、[RETRO](docs/RETRO_v0.16.1_档案布局优化.md) |
| v0.16.0 | 08-06 | P2 架构升级：5384行单体拆分为 6 个 JS 模块 | [PRD](docs/PRD_v0.16.0_架构拆分.md)、[ADR](docs/ADR_v0.16.0_架构拆分.md)、[TEST](docs/TEST_v0.16.0_P2架构升级.md)、[RETRO](docs/RETRO_v0.16.0_架构拆分.md)、[RELEASE](docs/RELEASE_v0.16.0.md) |
| v0.15.0 | 08-06 | P1 效率基建：文档精简、模板统一 | CHANGELOG |
| v0.14.0 | 08-06 | P0 安全加固：回归测试 80→199 条、发布检查清单 | CHANGELOG |
| v0.13.4 | 08-05 | 宫位标签选填 | [PRD](docs/PRD_v0.7.0_宫位功能.md)（⚠️ 共用旧版 PRD） |
| v0.12.0 | 08-03 | 纳运功能：纳音五行在月令的十二长生状态 | [PRD](docs/PRD_v0.12.0_纳运功能.md)、[ADR](docs/ADR_v0.12.0_纳运功能.md)、[TEST](docs/TEST_v0.12.0_纳运功能.md) |
| v0.11.0 | 07-26 | 能力按钮功能 | 档案/八字的能力按钮开发/ |
| v0.10.4 | 07-26 | 宫位多选：流年 Bug 根治 | [RETRO](docs/RETRO_v0.10.4_宫位多选.md) |
| v0.10.0 | 07-25 | 宫位多选功能 | 档案/宫位多选/ |
| v0.9.4 | 07-25 | 身宫 Bug 修复 | [BUG](docs/BUG_v0.9.4_身宫根因分析.md) |
| v0.9.3 | 07-24 | 丑月司令 Bug 修复 + 16孩时辰补全 | [PRD](docs/PRD_v0.9.3_排盘校验.md)、[ADR](docs/ADR_v0.9.3_排盘修复.md) |
| v0.9.1 | 07-22 | 岁流板块运前内容 + 搜索稳定性 | [PRD](docs/PRD_v0.9.1_搜索稳定性.md)、[ADR](docs/ADR_v0.9.1_搜索稳定性.md)、[RETRO](docs/RETRO_v0.9.1_搜索稳定性.md) |
| v0.9.0 | 07-21 | 档案管理系统 | [PRD](docs/PRD_v0.9.0_档案管理.md)、[ADR](docs/ADR_v0.9.0_档案管理.md)、[TEST](docs/TEST_v0.9.0_档案管理.md) |
| v0.8.1 | 07-15 | 宫位标签系统 + 农历录入 + UI 改进 | 档案/八字排盘·宫位功能/ |
| v0.7.0 | 07-15 | 宫位功能：自定义宫位体系 | [PRD](docs/PRD_v0.7.0_宫位功能.md)、[ADR](docs/ADR_v0.7.0_宫位功能.md)、[TEST](docs/TEST_v0.7.0_宫位功能.md) |
| v0.2.0 | 07-13 | 双胞胎排盘 | [PRD](docs/PRD_v0.2.0_双胞胎.md) |
| v0.1.0 | 07-11 | 基础排盘 | — |

## 架构概览

### 文件结构（v0.22.0）

```
运行/
├── standalone.html          ← HTML/CSS 骨架（内联版，7673行，build_modules.py 合成，含全量数据 735KB）
├── standalone-split.html    ← 拆分版（838行，等同于 standalone.html，拆分后的主产物）
├── build_modules.py         ← 构建脚本：JS 模块 → 内联回 standalone.html
├── constants.js             ← 常量/数据表（1585行，1000-2100 全量重生 sxtwl 数据）
├── algorithm.js             ← 排盘核心（672行）
├── archive.js               ← 档案管理（866行）
├── gongwei.js               ← 宫位自定义（1139行，含常用宫位分级 fav 逻辑）
├── render.js                ← UI 渲染（1513行）
├── main.js                  ← 入口/事件/测试（873行）
├── debug_all.html           ← 调试页面：8 iframe 加载组合
└── docs/                    ← 系统文档（30 份）
```

### 加载顺序

```
constants → algorithm → archive → gongwei → render → main
```

### 命名空间

```
window.CONST / ALGO / ARCHIVE / GONGWEI / RENDER / APP
```

### 技术选型

- **IIFE + window 命名空间**（非 ES modules）：零构建步骤、GitHub Pages 原生兼容
- **`<script>` 标签直接加载**：改完即刷新
- **Clacky 扩展 + iframe 嵌入**：与 AI 编排系统深度整合

### 关键设计决策（ADR 摘要）

- ADR-1：单文件 HTML → v0.16.0 拆分为 6 模块（仍零构建）
- ADR-2：双胞胎单表横向对比（非双表并排）
- ADR-3：大运流年点击互动联动上盘
- ADR-4：藏干替换规则（弟妹中余气）
- ADR-5：面板双层设计（launcher + paipan iframe）

详见 [ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 已知问题 / 技术债

| 事项 | 优先级 | 状态 | 来源 |
|------|--------|------|------|
| 编排系统缺「任务超时自动告警/兜底」机制：发布师/流程师连续停滞，Leader 人工催办 2 次无响应后兜底接管 | P1 | 未处理 | RETRO v0.23.0 |
| 发布/复盘类 worker 任务无小步回报协议（任务拆分 + 每步回报） | P2 | 未处理 | RETRO v0.23.0 |
| 部署目录 SYSTEM.md/CHANGELOG 与源目录同步缺失（部署目录曾停留 v0.20.1） | P2 | ✅ 已修复(v0.23.0)：发布检查清单补同步项 | RETRO v0.23.0 |
| 测试代码段同步缺失：编程师改 main.js 内联断言未同步 index.html/standalone.html 内联版，靠双环境回归抓出 | P1 | 未处理（构建流程需加「测试代码段同步」检查） | RETRO v0.22.0 |
| 数据表重生缺少常规年份行为对比验证（本次靠 201 天抽样 + 逐日细化量化节气偏移 4-5 天） | P2 | 已沉淀为流程经验（数据重生必须做行为对比） | RETRO v0.22.0 |
| 复盘→改进行动闭环断裂：v0.19.0 复盘两条建议（补隐私断言、回归集基线化）在 v0.20.0 未落地 | P1 | ✅ 已修复(v0.20.1)：PRD 模板新增「上版本复盘遗留项」section，强制追溯 | RETRO v0.20.0 |
| 自动化回归断言零增长：连续四版本（v0.17-v0.20）199 条不变，常用宫位核心路径（fav 迁移/☆切换/级联清理/默认排序）无自动断言 | P1 | ✅ 已修复(v0.20.1)：新增 GWFav 12 条断言，总数 199→211 | RETRO v0.20.0 |
| build_modules.py 定位混淆：实为「拆分工具」（standalone → 6 模块），非内联工具；ADR「无需运行」表述有误；且内联过程存在 `\n` 转义符→字面换行缺陷（已修复 2 处 confirm） | P2 | 已澄清：standalone.html 为手动同步 | RETRO v0.20.1 建议2 |
| Worker 无进展超时无通知机制：测试师两次卡住靠 Leader 催促恢复 | P2 | 未处理 | RETRO v0.20.1 建议1（高优先级，纳入编排层改进） |
| 测试断言计数口径混乱（PRD「6 条场景」vs 实际 12 条断言） | P3 | 未处理 | RETRO v0.20.1 建议3 |
| v0.17.0 三垣区重复纳运行 bug | P0 | ✅ 已修复(v0.18.0) | ADR v0.18.0 |
| 内置回归集（?test=1 211 条）未含隐私断言，隐私逻辑仅靠人工冒烟覆盖 | P1 | 未处理 | RETRO v0.19.0 |
| pillar() 函数在 render.js 中重复 5 次（应统一到 constants.js） | P0 | 未处理 | P2 复盘 |
| 全局状态散落（被选宫位、当前大运/流年索引分布在 module 作用域） | P1 | 未处理 | P2 复盘 |
| standalone.html 和 standalone-split.html CSS 完全相同（534行逐字一致） | P1 | 未处理 | P2 复盘 |
| `?test=1` 211 条断言 vs 部分功能未覆盖（如分气 checkbox） | P1 | 部分覆盖 | 测试复盘 |
| onclick 全部改为命名空间前缀，但仍有少量 `onchange` 遗留 | P2 | 大部分完成 | v0.16.0 |
| 档案 13 个目录命名不规范（无版本号前缀、角色名混用） | P2 | 待标准化 | 本次 audit |
| 编程师实现自查遗漏（多渲染路径）导致 TC-10 Bug | P2 | 已修复 | RETRO v0.17.0 |

## 如何继续开发

1. **入口文件**：`standalone-split.html`（当前主产物）；`standalone.html`（回退版，保持同步）
2. **本地运行**：浏览器直接打开 `standalone-split.html`；或启动 Clacky server 通过面板访问
3. **测试方式**：打开 `standalone-split.html?test=1` 跑 211 条自动断言（含 GWFav 常用宫位 12 条）+ `debug_all.html` 多组合验证
4. **发布流程**：
   - QA 验证通过 → **手动同步**改动到 `standalone.html`（⚠️ `build_modules.py` 是拆分工具：standalone → 6 模块，非内联工具，勿依赖它回写）→ 更新 CHANGELOG → Git tag → push
   - **三文件一致性校验（v0.20.2/v0.20.3 事故防线）**：`bash scripts/check-release.sh .`（内联 JS `node --check` + 六模块段一致性 + HTML 关键 id），已挂载 pre-commit 自动拦截 + 内嵌「开发-流水线-八字」Step 3/4/6 与「发布八字本地/线上」skill
   - 详细检查清单见 `RELEASE_CHECKLIST.md`
5. **新功能开发**：复制 `docs/_TEMPLATE/` → 填写 PRD/ADR → 开发 → QA → 发布 → **执行「开发文件归拢」归档**

## 文档索引

### 架构
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 架构决策记录总览
- [ALGORITHM.md](docs/ALGORITHM.md) — 算法真相源（所有排盘规则的宪法文件）
- [DEVELOPER_QUICKSTART.md](DEVELOPER_QUICKSTART.md) — 开发者速查（代码段索引）

### 功能文档
- [PRD_v0.20.1_自动化断言补充.md](docs/PRD_v0.20.1_自动化断言补充.md)
- [ADR_v0.20.1_自动化断言补充.md](docs/ADR_v0.20.1_自动化断言补充.md)
- [PRD_v0.20.0_常用宫位分级.md](docs/PRD_v0.20.0_常用宫位分级.md)
- [ADR_v0.20.0_常用宫位分级.md](docs/ADR_v0.20.0_常用宫位分级.md)
- [PRD_v0.19.0_隐私模式艺名.md](docs/PRD_v0.19.0_隐私模式艺名.md)
- [ADR_v0.19.0_隐私模式艺名.md](docs/ADR_v0.19.0_隐私模式艺名.md)
- [PRD_v0.18.0_简0级别与三垣间隔.md](docs/PRD_v0.18.0_简0级别与三垣间隔.md)
- [ADR_v0.18.0_简0级别与三垣间隔.md](docs/ADR_v0.18.0_简0级别与三垣间隔.md)
- [PRD_v0.17.0_简分级别.md](docs/PRD_v0.17.0_简分级别.md)
- [ADR_v0.17.0_简分级别.md](docs/ADR_v0.17.0_简分级别.md)
- [PRD_v0.16.1_档案布局优化.md](docs/PRD_v0.16.1_档案布局优化.md)
- [ADR_v0.16.1_档案布局优化.md](docs/ADR_v0.16.1_档案布局优化.md)
- [PRD_v0.16.0_架构拆分.md](docs/PRD_v0.16.0_架构拆分.md)
- [ADR_v0.16.0_架构拆分.md](docs/ADR_v0.16.0_架构拆分.md)
- [PRD_v0.12.0_纳运功能.md](docs/PRD_v0.12.0_纳运功能.md)
- [ADR_v0.12.0_纳运功能.md](docs/ADR_v0.12.0_纳运功能.md)
- [PRD_v0.9.3_排盘校验.md](docs/PRD_v0.9.3_排盘校验.md)
- [ADR_v0.9.3_排盘修复.md](docs/ADR_v0.9.3_排盘修复.md)
- [PRD_v0.9.1_搜索稳定性.md](docs/PRD_v0.9.1_搜索稳定性.md)
- [ADR_v0.9.1_搜索稳定性.md](docs/ADR_v0.9.1_搜索稳定性.md)
- [PRD_v0.9.0_档案管理.md](docs/PRD_v0.9.0_档案管理.md)
- [ADR_v0.9.0_档案管理.md](docs/ADR_v0.9.0_档案管理.md)
- [PRD_v0.7.0_宫位功能.md](docs/PRD_v0.7.0_宫位功能.md)
- [ADR_v0.7.0_宫位功能.md](docs/PRD_v0.7.0_宫位功能.md)
- [PRD_v0.2.0_双胞胎.md](docs/PRD_v0.2.0_双胞胎.md)

### 测试
- [TEST_v0.20.1_自动化断言补充.md](docs/TEST_v0.20.1_自动化断言补充.md)
- [TEST_v0.20.0_常用宫位分级.md](docs/TEST_v0.20.0_常用宫位分级.md)
- [TEST_v0.19.0_隐私模式艺名.md](docs/TEST_v0.19.0_隐私模式艺名.md)
- [TEST_v0.17.0_简分级别.md](docs/TEST_v0.17.0_简分级别.md)
- [TEST_v0.16.1_档案布局优化.md](docs/TEST_v0.16.1_档案布局优化.md)
- [TEST_全量测评手册.md](docs/TEST_全量测评手册.md) — 全量测评手册
- [TEST_v0.16.0_P2架构升级.md](docs/TEST_v0.16.0_P2架构升级.md)
- [TEST_v0.12.0_纳运功能.md](docs/TEST_v0.12.0_纳运功能.md)
- [TEST_v0.9.0_档案管理.md](docs/TEST_v0.9.0_档案管理.md)
- [TEST_v0.9.0_弹窗验证.md](docs/TEST_v0.9.0_弹窗验证.md)
- [TEST_v0.9.1_搜索稳定性.md](docs/TEST_v0.9.1_搜索稳定性.md)
- [TEST_v0.7.0_宫位功能.md](docs/TEST_v0.7.0_宫位功能.md)

### 复盘
- [RETRO_v0.20.1_自动化断言补充.md](docs/RETRO_v0.20.1_自动化断言补充.md)
- [RETRO_v0.20.0_常用宫位分级.md](docs/RETRO_v0.20.0_常用宫位分级.md)
- [RETRO_v0.19.0_隐私模式艺名.md](docs/RETRO_v0.19.0_隐私模式艺名.md)
- [RETRO_v0.17.0_简分级别.md](docs/RETRO_v0.17.0_简分级别.md)
- [RETRO_v0.16.1_档案布局优化.md](docs/RETRO_v0.16.1_档案布局优化.md)
- [RETRO_v0.16.0_架构拆分.md](docs/RETRO_v0.16.0_架构拆分.md)
- [RETRO_v0.10.4_宫位多选.md](docs/RETRO_v0.10.4_宫位多选.md)
- [RETRO_v0.9.1_搜索稳定性.md](docs/RETRO_v0.9.1_搜索稳定性.md)

### 发布
- [RELEASE_v0.20.0.md](docs/RELEASE_v0.20.0.md)
- [RELEASE_v0.19.0.md](docs/RELEASE_v0.19.0.md)
- [RELEASE_v0.16.0.md](docs/RELEASE_v0.16.0.md)
- [RELEASE_v0.9.0.md](docs/RELEASE_v0.9.0.md)

### 其他
- [BUG_v0.9.4_身宫根因分析.md](docs/BUG_v0.9.4_身宫根因分析.md)
- [PIPELINE_v0.9.0.md](docs/PIPELINE_v0.9.0.md)
- [GIT_v0.10.0_baseline.md](docs/GIT_v0.10.0_baseline.md)
