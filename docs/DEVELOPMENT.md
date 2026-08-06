# 开发流程

> 本项目遵循通用开发管理体系：[`开发管理体系/DEVELOPMENT.md`](../../../clacky_workspace/开发管理体系/DEVELOPMENT.md)

## 项目特定补充

### 测试
- 测试入口：`standalone.html?test=1`
- 回归数据：76 条断言，9 组八字
- CI 配置：`.github/workflows/test.yml`（Puppeteer 加载测试页）

### 八字排盘特定禁则
- 算法函数不操作 DOM，渲染函数不包含算法
- 禁止在算法函数里残留 `console.log`
- 测试预期值必须人工验证后才能修改

---

完整体系见：[`clacky_workspace/开发管理体系/`](../../../clacky_workspace/开发管理体系/)
