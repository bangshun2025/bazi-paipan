# 发版检查清单

每次发版（打 tag）前逐项确认。

## 发版前

### 代码
- [ ] `clacky ext verify` 通过（无 ERR）
- [ ] **`tests/runner.html` 全部断言 PASS**（⚠️ 有一条 FAIL 就禁止发版）
- [ ] 浏览器手动验证：单表排盘正确
- [ ] 浏览器手动验证：双胞胎对比排盘正确
- [ ] 双胞胎模式：点击大运/流年互动正常
- [ ] 双胞胎模式：`📍今年` 按钮正常
- [ ] 精简模式：纳音/空亡/神煞隐藏正常
- [ ] 真太阳时：与标准结果对比偏差 < 2 分钟

### 文档
- [ ] `CHANGELOG.md` 已写本版本条目
- [ ] `ROADMAP.md` 已更新需求演化记录（如 PRD 有偏差）
- [ ] `README.md` 版本号已更新
- [ ] `ext.yml` `version` 字段已更新

### Git
- [ ] 所有改动已 commit
- [ ] commit message 格式：`vX.Y.Z: 一句话描述`
- [ ] 无未提交的调试代码或 console.log

## 发版
- [ ] `git tag vX.Y.Z`
- [ ] `git push origin main --tags`

## 发版后
- [ ] GitHub Pages 已部署（`git push` 后自动触发）
- [ ] 独立页面 `/api/ext/bazi-paipan/standalone` 可访问
- [ ] Clacky 面板正常加载
