# RELEASE · v0.23.0 盘面截图 — 部署报告

- 发布：发布师（worker_f852d8ec）/ Leader 兜底接管
- 日期：2026-08-22
- 被测：`/Users/feng/.clacky/ext/local/bazi-paipan/index.html`（v0.23.0）

## 结论

**✅ v0.23.0 内测版发布完成。源目录与部署目录 check-release.sh 双全绿，六模块 md5 一致，可交付。**

## 一、部署清单

| 项目 | 源目录 | 部署目录（bazi-paipan-test） |
|------|--------|------------------------------|
| index.html | ✅ v0.23.0 | ✅ v0.23.0（同步） |
| standalone.html | ✅ v0.23.0 | ✅ v0.23.0（同步） |
| standalone-split.html | ✅ v0.23.0 | ✅ v0.23.0（同步） |
| 六模块（constants/algorithm/archive/gongwei/render/main） | ✅ | ✅ md5 一致 |
| scripts/check-release.sh | ✅ | ✅ |
| SYSTEM.md | ✅ v0.23.0 | ✅ v0.23.0（同步） |
| CHANGELOG.md | ✅ v0.23.0 条目 | ✅ v0.23.0 条目（同步） |
| 旧版备份 | — | ✅ .bak_v0220/ |

## 二、校验结果

| 校验项 | 结果 |
|--------|------|
| 源目录 check-release.sh | ✅ 全部通过（语法/六模块一致/关键 id 含 btnScreenshot） |
| 部署目录 check-release.sh | ✅ 全部通过 |
| 六模块 md5 比对（src vs test） | ✅ ALL6_MODULES_SYNCED |
| ?test=1 回归（QA 阶段） | ✅ 224 条断言全绿（index + split 双环境） |

## 三、变更摘要（v0.22.0 → v0.23.0）

1. **新增功能**：输入区「📷 截图」按钮，将 #output 排盘内容完整截图为 PNG 长图下载
2. **文件名**：`八字排盘_{隐私名}_{日期}.png`，隐私降级链 艺名→小名→匿名
3. **技术**：html2canvas@1.4.1 CDN 按需加载（jsDelivr/unpkg 三源降级 + 8s 超时提示）
4. **健壮性**：防重入 busy 态、未排盘即时提示、失败清理、离屏容器显式纸色背景 + 面积保护 scale 收缩
5. **断言**：211 → 224（新增截图 13 条）

## 四、备注

- 发布师在文件同步后停滞（SYSTEM.md/CHANGELOG/RELEASE 报告未产出），Leader 两次催办无响应后兜底接管完成文档更新与报告
- 部署目录 SYSTEM.md 此前停留在 v0.20.1，本次整体同步为源目录最新版（含 v0.21/v0.22 历史）
