# 八字排盘 · 从真版

输入出生时间，排四柱、大运、流年，支持真太阳时修正与双胞胎对比。

**当前版本**: v0.3.0  
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
├── standalone.html          # 独立页面（前端 + 排盘算法内嵌）
├── api/handler.rb           # Rails API 后端
├── panels/
│   ├── launcher/view.js     # 侧边栏启动面板
│   └── paipan/view.js       # 排盘面板（iframe 嵌入 standalone）
├── archives.json            # 本地档案数据
├── CHANGELOG.md             # 版本历史
└── docs/
    ├── ARCHITECTURE.md      # 技术决策记录
    ├── ROADMAP.md           # 需求演化与路线图
    ├── TEST.md              # 测试用例与回归基准
    ├── RELEASE.md           # 发版检查清单
    ├── CONTRIBUTING.md      # 代码规范
    └── BUGS.md              # 已知问题追踪
```

## 入口

- **独立页面**: `/api/ext/bazi-paipan/standalone`
- **面板**: 侧边栏「八字排盘」启动器 → 内嵌面板
- **GitHub Pages**: `clacky.github.io/bazi-paipan/standalone.html`

## 技术栈

- **前端**: 原生 JS + CSS（单文件，零依赖）
- **后端**: Ruby（Clacky `ApiExtension` 框架）
- **部署**: GitHub Pages（静态）+ Clacky 扩展（Rails API）
