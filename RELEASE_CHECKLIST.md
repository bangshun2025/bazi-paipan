# 发布检查清单

每次发布前逐项打勾，全部通过才能 `git tag` + `git push`。

## 代码
- [ ] `git status` 干净，无未追踪/未提交文件
- [ ] 无 `console.log` / `debugger` 残留
- [ ] JavaScript 语法无报错（浏览器 Console 无红）

## 回归
- [ ] `standalone.html?test=1` 199 条断言 0 FAIL（全绿横幅）
- [ ] 16 孩预置数据排盘结果与上次发布一致

## UI
- [ ] 双胞胎模式渲染正常（布局不塌）
- [ ] 精简模式（简按钮）无残留行/列
- [ ] 宫位标签 Popover 正常弹出/勾选
- [ ] 移动端（375px）无横向溢出

## 文档
- [ ] CHANGELOG.md 已更新本次变更
- [ ] DEVELOPER_QUICKSTART.md 行号已刷新（如有偏移）

## 发布
- [ ] `git tag vX.Y.Z` 已打
- [ ] `git push --tags` 成功
- [ ] GitHub Pages 正常加载
