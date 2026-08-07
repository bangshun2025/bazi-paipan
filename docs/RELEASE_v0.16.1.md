# 发布报告：档案弹窗布局优化 v0.16.1

## 版本信息

| 字段 | 值 |
|------|-----|
| 版本号 | v0.16.1 |
| 发布日期 | 2026-08-07 |
| 发布类型 | patch bump（向后兼容） |
| 关联 PRD | 档案页面布局优化 |
| 关联 TEST | TEST_v0.16.1_档案布局优化.md |
| 上一版本 | v0.16.0（P2 架构升级） |

## CHANGELOG 条目

### 优化
- 档案弹窗中每条档案行仅显示 `YYYY年`，精简掉月/日/时/分
- dateStr 精简释放横向空间，最长名字组合（如「NONO / 吴不言」10字符）完整可见，无截断
- 搜索过滤结果的 dateStr 格式与完整列表一致（均为 `YYYY年`）

### 技术
- `archive.js`：`renderArchiveModal()` 和 `filterArchives()` 两处 dateStr 生成为仅年份
- `standalone.html`：版本号更新为 v0.16.1，changelog 注释同步
- 编辑弹窗走独立表单（不引用 dateStr），排盘回填读原始字段，均不受影响

## 修改文件

| 文件 | 变更类型 |
|------|----------|
| `archive.js` | 修改（dateStr 精简） |
| `standalone.html` | 修改（版本号 + 注释） |

## 测试结果

| 指标 | 值 |
|------|-----|
| AC 总数 | 6 |
| 通过 | 6 |
| 失败 | 0 |
| 通过率 | **100%** |
| 必修 Bug | 0 |

### AC 清单
- [x] AC-1：档案弹窗中每条档案行仅显示 `YYYY年`
- [x] AC-2：最长名字组合完整可见，无截断
- [x] AC-3：搜索结果行与完整列表行 dateStr 格式一致
- [x] AC-4：弹窗宽度保持 420px
- [x] AC-5：编辑弹窗中年月日时分字段完整可编辑
- [x] AC-6：排盘后表单回填完整，排盘结果正确

## 部署

| 环境 | 路径 | 状态 |
|------|------|:--:|
| 内测版 | `~/.clacky/ext/local/bazi-paipan-test/` | ✅ 已部署 |
| 公测版 | GitHub Pages | ⏳ 待 Leader 执行 |
| 正式版 | GitHub Pages (tag) | ⏳ 待 Leader 执行 |

### 部署文件清单
- `archive.js`（v0.16.1）
- `standalone.html`（v0.16.1）
- `standalone-split.html`（同步）
- `algorithm.js`（同步）
- `constants.js`（同步）
- `gongwei.js`（同步）
- `render.js`（同步）
- `main.js`（同步）
- `index.html`（同步）

## 发布检查清单

- [x] `?test=1` 199 条断言 0 FAIL
- [x] 16孩预置数据排盘一致
- [x] 双胞胎模式正常
- [x] 精简模式正常
- [x] 宫位标签 Popover 正常
- [x] 移动端无溢出
- [ ] CHANGELOG.md 已更新（待 Leader 执行）
- [ ] Git tag 已打（待 Leader 执行）
- [ ] Git push 成功（待 Leader 执行）
