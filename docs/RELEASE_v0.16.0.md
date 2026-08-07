# 发布报告：P2 架构升级 v0.16.0

## 版本信息

| 字段 | 值 |
|------|-----|
| 版本号 | v0.16.0 |
| 发布日期 | 2026-08-06 |
| 关联 PRD | docs/PRD_v0.16.0_架构拆分.md |
| 关联 ADR | docs/ADR_v0.16.0_架构拆分.md |

## CHANGELOG 条目

### 架构
- standalone.html 从 5384 行单体文件拆分为 HTML 骨架（754行）+ 6 个 JS 模块
- 模块划分：constants.js（857行，常量/数据表）、algorithm.js（672行，排盘核心）、archive.js（866行，档案管理）、gongwei.js（860行，宫位自定义）、render.js（1513行，UI渲染）、main.js（873行，入口/事件/测试）
- 加载顺序：constants → algorithm → archive → gongwei → render → main
- 命名空间：window.CONST / ALGO / ARCHIVE / GONGWEI / RENDER / APP
- 零构建步骤，`<script>` 标签直接加载，GitHub Pages 原生兼容
- 新增 build_modules.py 构建脚本，支持将 JS 模块内联回 standalone.html

### 技术
- HTML onclick/onchange 全部替换为命名空间前缀（如 APP.doPaipan()、RENDER.toggleSimple()）
- 每个模块通过 window.CONST 引用常量，解除循环依赖
- debug_all.html 调试页面：8 iframe 同时加载所有组合验证

### 修复
- UPGRADE_PLAN.md 加载顺序与 ADR 对齐（archive↔gongwei 对调）

## 发布检查清单

- [x] `?test=1` 199 条断言 0 FAIL
- [x] 16孩预置数据排盘一致
- [x] 双胞胎模式正常
- [x] 精简模式正常
- [x] 宫位标签 Popover 正常
- [x] 移动端无溢出
- [x] CHANGELOG.md 已更新
- [x] DEVELOPER_QUICKSTART.md 行号已刷新（模块化索引）
- [x] Git tag 已打（v0.16.0）
- [x] Git push 成功
