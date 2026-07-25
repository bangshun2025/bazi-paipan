# 八字排盘 · 从真版

输入出生时间，排四柱、大运、流年，支持真太阳时修正与双胞胎对比。

**当前版本**: v0.10.4  
**作者**: 邦顺  
**许可**: 私有

## 功能

| 模块 | 内容 |
|------|------|
| 四柱 | 年柱、月柱、日柱、时柱（干支 + 十神 + 藏干） |
| 三垣 | 胎元、命宫、身宫 |
| 辅助 | 纳音、十二长生星运、自坐、空亡、神煞 |
| 岁运 | 大运（10柱）+ 流年（10年/柱），点击互动联动上盘 |
| 双胞胎 | 兄姐本气 / 弟妹中余气，单表对比布局 |
| 工具 | 真太阳时修正、精简模式、本地档案管理 |

## 文件结构

```
bazi-paipan/
├── ext.yml                  # Clacky 扩展清单
├── standalone.html          # 独立页面（前端 + 排盘算法实现）
├── api/handler.rb           # Rails API 后端
├── panels/
│   ├── launcher/view.js     # 侧边栏启动面板
│   └── paipan/view.js       # 排盘面板（iframe 嵌入 standalone）
├── archives.json            # 本地档案数据
├── CHANGELOG.md             # 版本历史
└── docs/                     # 📚 全部文档（28份，按版本号归档）
    ├── ALGORITHM.md           # ⚠️ 算法宪法 — 全部规则/常量/公式（不可与代码冲突）
    ├── ARCHITECTURE.md        # 技术决策记录
    ├── ROADMAP.md             # 需求演化与路线图
    ├── TEST.md                # 测试用例与回归基准
    ├── RELEASE.md             # 发版检查清单
    ├── CONTRIBUTING.md        # 代码规范
    ├── BUGS.md                # 已知问题追踪
    ├── DEVELOPMENT.md         # 开发指南
    ├── CHANGELOG.md           # 版本历史
    ├── TEST_全量测评手册.md    # 全量测评手册
    ├── GIT_v0.10.0_baseline.md # Git基线信息
    │
    ├── v0.2.0:  PRD_v0.2.0_双胞胎.md
    ├── v0.7.0:  PRD/ADR/TEST_v0.7.0_宫位功能.md
    ├── v0.9.0:  PRD/ADR/PIPELINE/RELEASE/TEST(弹窗+档案)_v0.9.0_*
    ├── v0.9.1:  PRD/ADR/TEST/RETRO_v0.9.1_搜索稳定性.md
    ├── v0.9.3:  PRD_v0.9.3_排盘校验 / ADR_v0.9.3_排盘修复
    ├── v0.9.4:  BUG_v0.9.4_身宫根因分析.md
    └── v0.10.4: RETRO_v0.10.4_宫位多选.md
```

## 入口

- **独立页面**: `/api/ext/bazi-paipan/standalone`
- **面板**: 侧边栏「八字排盘」启动器 → 内嵌面板
- **GitHub Pages**: `clacky.github.io/bazi-paipan/standalone.html`

## 技术栈

- **前端**: 原生 JS + CSS（单文件，零依赖）
- **后端**: Ruby（Clacky `ApiExtension` 框架）
- **部署**: GitHub Pages（静态）+ Clacky 扩展（Rails API）
