# 发布检查清单

每次发布前逐项打勾，全部通过才能 `git tag` + `git push`。

## 代码
- [ ] `git status` 干净，无未追踪/未提交文件
- [ ] 无 `console.log` / `debugger` 残留
- [ ] JavaScript 语法无报错（浏览器 Console 无红）
- [ ] **三文件语法校验**：`index.html` / `standalone.html` / `standalone-split.html` 各自提取全部内联 JS 后 `node --check` 通过（防 `\n` 转义符→字面换行缺陷）
- [ ] **六模块段一致性**：`index.html` 与 `standalone.html` 的 constants/algorithm/archive/gongwei/render/main 六段 JS 逐段对比一致（v0.20.2 事故根因：main.js 改动只同步 standalone，index.html 漏同步）

## 回归
- [ ] `index.html?test=1` / `standalone.html?test=1` 211 条断言 0 FAIL（全绿横幅，**两个文件都要测**）
- [ ] 16 孩预置数据排盘结果与上次发布一致

## UI
- [ ] 双胞胎模式渲染正常（布局不塌）
- [ ] 精简模式（简按钮）无残留行/列
- [ ] 宫位标签 Popover 正常弹出/勾选
- [ ] 移动端（375px）无横向溢出

## 文档
- [ ] CHANGELOG.md 已更新本次变更
- [ ] DEVELOPER_QUICKSTART.md 行号已刷新（如有偏移）
- [ ] `api/handler.rb` 已与公测版同步（`/standalone` 路由 + JS 模块路由）

## 发布
- [ ] `git tag vX.Y.Z` 已打
- [ ] `git push --tags` 成功
- [ ] GitHub Pages 正常加载
