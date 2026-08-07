# 八字排盘 · 项目总览

> 最后更新：2026-08-07 | 当前版本：v0.16.0
> 本文档是 AI 理解本项目的入口。新 AI 进入项目后，先读此文件。

## 项目简介

- **是什么**：八字排盘网页应用，输入出生时间排四柱、大运、流年，支持真太阳时修正与双胞胎对比
- **给谁用**：邦顺本人 + 生命算法学员（通过 Clacky 面板 iframe 嵌入 / GitHub Pages 独立访问）
- **技术栈**：原生 JS + CSS（零构建步骤）+ 6 模块 `<script>` 标签加载；后端 Ruby（Clacky ApiExtension）；部署 GitHub Pages

## 版本历史

| 版本 | 日期 | 功能 | 关键文档 |
|------|------|------|----------|
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

### 文件结构（v0.16.0）

```
运行/
├── standalone.html          ← HTML/CSS 骨架（754行）
├── standalone-split.html    ← 拆分版（等同于 standalone.html，拆分后的主产物）
├── build_modules.py         ← 构建脚本：JS 模块 → 内联回 standalone.html
├── constants.js             ← 常量/数据表（857行）
├── algorithm.js             ← 排盘核心（672行）
├── archive.js               ← 档案管理（866行）
├── gongwei.js               ← 宫位自定义（860行）
├── render.js                ← UI 渲染（1513行）
├── main.js                  ← 入口/事件/测试（873行）
├── debug_all.html           ← 调试页面：8 iframe 加载组合
└── docs/                    ← 系统文档（25 份）
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
| pillar() 函数在 render.js 中重复 5 次（应统一到 constants.js） | P0 | 未处理 | P2 复盘 |
| 全局状态散落（被选宫位、当前大运/流年索引分布在 module 作用域） | P1 | 未处理 | P2 复盘 |
| standalone.html 和 standalone-split.html CSS 完全相同（534行逐字一致） | P1 | 未处理 | P2 复盘 |
| `?test=1` 199 条断言 vs 部分功能未覆盖（如分气 checkbox） | P1 | 部分覆盖 | 测试复盘 |
| onclick 全部改为命名空间前缀，但仍有少量 `onchange` 遗留 | P2 | 大部分完成 | v0.16.0 |
| 档案 13 个目录命名不规范（无版本号前缀、角色名混用） | P2 | 待标准化 | 本次 audit |

## 如何继续开发

1. **入口文件**：`standalone-split.html`（当前主产物）；`standalone.html`（回退版，保持同步）
2. **本地运行**：浏览器直接打开 `standalone-split.html`；或启动 Clacky server 通过面板访问
3. **测试方式**：打开 `standalone-split.html?test=1` 跑 199 条自动断言 + `debug_all.html` 多组合验证
4. **发布流程**：
   - QA 验证通过 → `build_modules.py` 内联回 `standalone.html` → 更新 CHANGELOG → Git tag → push
   - 详细检查清单见 `RELEASE_CHECKLIST.md`
5. **新功能开发**：复制 `docs/_TEMPLATE/` → 填写 PRD/ADR → 开发 → QA → 发布 → **执行「开发文件归拢」归档**

## 文档索引

### 架构
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 架构决策记录总览
- [ALGORITHM.md](docs/ALGORITHM.md) — 算法真相源（所有排盘规则的宪法文件）
- [DEVELOPER_QUICKSTART.md](DEVELOPER_QUICKSTART.md) — 开发者速查（代码段索引）

### 功能文档
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
- [TEST_全量测评手册.md](docs/TEST_全量测评手册.md) — 全量测评手册
- [TEST_v0.16.0_P2架构升级.md](docs/TEST_v0.16.0_P2架构升级.md)
- [TEST_v0.12.0_纳运功能.md](docs/TEST_v0.12.0_纳运功能.md)
- [TEST_v0.9.0_档案管理.md](docs/TEST_v0.9.0_档案管理.md)
- [TEST_v0.9.0_弹窗验证.md](docs/TEST_v0.9.0_弹窗验证.md)
- [TEST_v0.9.1_搜索稳定性.md](docs/TEST_v0.9.1_搜索稳定性.md)
- [TEST_v0.7.0_宫位功能.md](docs/TEST_v0.7.0_宫位功能.md)

### 复盘
- [RETRO_v0.16.0_架构拆分.md](docs/RETRO_v0.16.0_架构拆分.md)
- [RETRO_v0.10.4_宫位多选.md](docs/RETRO_v0.10.4_宫位多选.md)
- [RETRO_v0.9.1_搜索稳定性.md](docs/RETRO_v0.9.1_搜索稳定性.md)

### 发布
- [RELEASE_v0.16.0.md](docs/RELEASE_v0.16.0.md)
- [RELEASE_v0.9.0.md](docs/RELEASE_v0.9.0.md)

### 其他
- [BUG_v0.9.4_身宫根因分析.md](docs/BUG_v0.9.4_身宫根因分析.md)
- [PIPELINE_v0.9.0.md](docs/PIPELINE_v0.9.0.md)
- [GIT_v0.10.0_baseline.md](docs/GIT_v0.10.0_baseline.md)
