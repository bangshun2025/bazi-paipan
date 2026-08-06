# 代码规范

## 文件组织

```
bazi-paipan/
├── standalone.html          # 主文件：HTML + CSS + 排盘算法 + 渲染逻辑
├── api/handler.rb           # 后端 API（Clacky 扩展框架）
├── panels/                  # 面板（每个面板一个 view.js）
├── docs/                    # 项目文档
└── tests/                   # 测试（v0.4.0 起）
```

## standalone.html 内部约定

2200+ 行单文件，按区块分界：

```
<!-- ===== 样式 ===== -->
<!-- ===== 常量/数据表 ===== -->
<!-- ===== 排盘算法 ===== -->
<!-- ===== 渲染函数 ===== -->
<!-- ===== 交互逻辑 ===== -->
<!-- ===== 入口 ===== -->
```

### 命名规范
- 函数：驼峰 `cangGanText()` `renderTwinChart()`
- 常量：大写蛇形 `NAYIN` `ZHI_TWIN_MAIN`
- DOM id：短横线 `chart-twin` `luck-section`
- CSS class：短横线 `luck-row` `col-dy`

### 新增函数
- 写在对应区块内，不跨区插入
- 函数体超过 30 行考虑拆分
- 算法函数不操作 DOM，渲染函数不包含算法

## Git 规范

- 分支：`main` 唯一分支，不做 feature 分支
- Commit：`vX.Y.Z: 一句话`（发版）/ `fix: 描述`（修复）/ `feat: 描述`（功能）
- 禁止：`WIP` `tmp` `test` 等临时 commit

## 禁止事项

- ❌ 在算法函数里写 `console.log`（调试完必须删）
- ❌ 硬编码用户数据（姓名/八字）
- ❌ 引入外部依赖（保持零依赖）
- ❌ 重构和功能混合在同一个 commit
