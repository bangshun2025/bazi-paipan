# 开发体系升级规划 · 八字排盘项目

> 目标：持续迭代中做到高效而正确——上手快、少出错、Bug能快速定位、发布有底气。
> 制定：2026-08-06 | 状态：待执行

---

## 总览

| 阶段 | 内容 | 优先级 | 工作量 |
|------|------|:--:|:--:|
| P0 | 自动回归测试 + 发布检查清单 | 🔴 必须 | 中 |
| P1 | 统一文档体系 + 新功能模板 | 🟡 重要 | 小 |
| P2 | 代码模块拆分 | 🟢 升级 | 大 |

---

## P0：兜底安全——不修每次发布都在赌

### P0-A：自动回归测试

**现状**：`?test=1` 模式输出排盘结果到页面，需要人眼对比。无自动化断言。

**目标**：打开 `standalone.html?test=1`，页面自动运行断言，绿条=全过，红条=哪个 case 挂了。

**实现方案**：

1. 在回归测试区新增断言引擎：定义测试用例数组，每个用例含输入（年月日时+选项）和关键断言（如年柱=甲子、十神=正印）
2. 对 16 孩预置数据自动跑全量排盘，对比上次存档的预期结果（snapshot）
3. 关键边界 case 独立断言：身宫跨中气、真太阳时跨日、纳运土五行
4. 输出：页面顶部绿/红横幅 + console 详细结果

**文件变更**：仅 `standalone.html`（回归测试区，行 5180+）

**验收标准**：
- [ ] 16 孩全量排盘 snapshot 对比，0 diff
- [ ] 至少 5 个关键边界 case 独立断言
- [ ] 绿/红结果一眼可见，无需人眼对比

### P0-B：发布检查清单

**新建文件**：`运行/RELEASE_CHECKLIST.md`

```markdown
# 发布检查清单

每次发布前逐项打勾，全部通过才能 git tag + push。

## 代码
- [ ] `git status` 干净，无未追踪/未提交文件
- [ ] 无 console.log / debugger 残留
- [ ] JavaScript 语法无报错（浏览器 Console 无红）

## 回归
- [ ] `?test=1` 全量回归 0 FAIL
- [ ] 16 孩预置数据排盘结果与上次发布一致

## UI
- [ ] 双胞胎模式渲染正常（布局不塌）
- [ ] 精简模式（简按钮）无残留行/列
- [ ] 宫位标签 Popover 正常弹出/勾选
- [ ] 移动端（375px）无横向溢出

## 文档
- [ ] CHANGELOG.md 已更新本次变更
- [ ] DEVELOPER_QUICKSTART.md 行号已刷新（如有偏移）
- [ ] ROADMAP.md 已更新版本号

## 发布
- [ ] Git tag 已打（格式 vX.Y.Z）
- [ ] Git push（含 tags）成功
- [ ] GitHub Actions 通过（如有）
```

---

## P1：效率基建——让每轮开发不重造轮子

### P1-C：统一文档体系

**现状问题**：`运行/docs/`（旧，扁平）和 `档案/<功能>/`（新，树形）两套并存。

**决策**：

```
运行/docs/  →  冻结。仅维护 ALGORITHM.md、ARCHITECTURE.md、DEVELOPER_QUICKSTART.md
运行/       →  根目录仅放：代码文件 + 3个核心文档（QUICKSTART/CHANGELOG/RELEASE_CHECKLIST）
档案/       →  成为唯一的"功能开发文档归档地"
```

**迁移动作**：

| 动作 | 说明 |
|------|------|
| `运行/ROADMAP.md` | 删除（CHANGELOG + QUICKSTART 已覆盖其功能） |
| `运行/docs/BUGS.md` | 合并进 QUICKSTART 踩坑录，原文件删除 |
| `运行/docs/CONTRIBUTING.md` | 删除（DEVELOPER_QUICKSTART 覆盖） |
| `运行/docs/DEVELOPMENT.md` | 删除（同上） |
| `运行/docs/GIT_*.md` | 移到 `档案/开发档案/` |
| `运行/docs/PIPELINE_*.md` | 移到 `档案/开发档案/` |
| `运行/docs/RELEASE*.md` | 移到 `档案/开发档案/` |
| `运行/docs/TEST.md` | 移到 `档案/开发档案/` |
| `运行/docs/ROADMAP.md` | 移到 `档案/开发档案/`（历史参考） |
| ALGORITHM/ARCHITECTURE/QUICKSTART | 保留在 `运行/docs/` |
| 各版本 PRD/ADR/TEST/RETRO | 保留在 `运行/docs/`（它们是代码的历史配套） |

**最终结构**：

```
运行/
├── standalone.html
├── index.html
├── ability-chart.html
├── CHANGELOG.md
├── DEVELOPER_QUICKSTART.md
├── RELEASE_CHECKLIST.md       ← 新增
├── docs/                      ← 精简后
│   ├── ALGORITHM.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_QUICKSTART.md
│   └── PRD/ADR/TEST/RETRO_*.md（版本配套文档）
├── api/ scripts/ tests/ panels/
└── .github/

档案/
├── <功能名>/                  ← 每个功能一个目录
│   ├── 产品经理/PRD.md
│   ├── 架构师/ADR.md
│   ├── 前端开发/（代码片段/变更记录）
│   ├── 测试工程师/QA报告.md
│   └── ...
├── 开发档案/                  ← 项目级历史（旧 RELEASE/GIT/PIPELINE/ROADMAP）
└── ...
```

**验收标准**：
- [ ] `运行/docs/` 无冗余文件
- [ ] `档案/开发档案/` 接收了迁移文件
- [ ] QUICKSTART 文件地图章节已同步更新

### P1-D：新功能开发模板

**新建文件**：`档案/_TEMPLATE/`（开发时复制此目录）

```
档案/_TEMPLATE/
├── README.md               ← 本模板说明
├── 产品经理/
│   └── PRD.md              ← 模板：需求背景、AC验收条件、影响范围、非目标
├── 架构师/
│   └── ADR.md              ← 模板：决策、理由、代价、备选方案
├── 前端开发/
│   └── 变更记录.md          ← 模板：改了哪些代码段、新增/删除行数
├── 测试工程师/
│   └── QA计划.md           ← 模板：回归用例、新功能用例、边界case
├── 流程师/
│   └── 流程记录.md          ← 模板：关键决策时间线
└── 发布工程师/
    └── 发布报告.md          ← 模板：版本号、CHANGELOG条目、检查清单打勾
```

**PRD 模板核心字段**：

```markdown
# PRD：<功能名>

## 需求背景
（为什么做这个功能）

## AC 验收条件
- [ ] AC1: ...
- [ ] AC2: ...

## 影响范围
- 代码段：（参考 QUICKSTART 代码段索引）
- 受影响的已有功能：（如：双胞胎模式、精简模式）

## 非目标（明确不做）
- ...

## 测试要点
- 边界 case：
- 回归风险点：
```

---

## P2：架构升级——单文件拆分

**现状**：standalone.html 5384 行，HTML/CSS/JS 混杂。

**目标**：拆为独立 JS 文件，保持零构建（`<script>` 标签加载），GitHub Pages 直接可用。

**拆分方案**：

```
运行/
├── standalone.html          ← 精简为 HTML 骨架 + CSS（~500行）
├── js/
│   ├── constants.js         ← 天干地支、五行、宫位映射、农历数据（~1200行）
│   ├── algorithm.js         ← 排盘核心：四柱/十神/十二长生/纳音/神煞（~800行）
│   ├── gongwei.js           ← 宫位自定义数据层（~400行）
│   ├── render.js            ← UI 渲染：表格/标签行/Popover/大运流年（~1200行）
│   ├── archive.js           ← 档案管理（~600行）
│   └── main.js              ← 入口/初始化/事件绑定（~200行）
├── index.html
├── ability-chart.html
└── ...
```

**加载顺序**（`standalone.html` 底部）：

```html
<script src="js/constants.js"></script>
<script src="js/algorithm.js"></script>
<script src="js/gongwei.js"></script>
<script src="js/render.js"></script>
<script src="js/archive.js"></script>
<script src="js/main.js"></script>
```

**风险控制**：
- 拆分后必须全量回归通过（P0-A 的测试来兜底）
- 先拆 constants + algorithm（低风险），再拆 render（中风险），最后拆 archive（高风险）
- 每一步拆分后独立提交 + 打 tag，方便回滚

**验收标准**：
- [ ] `?test=1` 全量回归 0 FAIL
- [ ] 双胞胎模式正常
- [ ] 精简模式正常
- [ ] 宫位自定义 CRUD 正常
- [ ] 档案管理搜索/展开/回收站正常
- [ ] standalone.html 体积从 5384 行降到 ~500 行

---

## 执行顺序

```
第一轮：P0-A（回归测试增强）→ P0-B（发布清单）
第二轮：P1-C（文档统一）     → P1-D（开发模板）
第三轮：P2（代码拆分，分 3 步）
```

每轮结束后 Git tag + push，可独立回滚。

---

## 本轮（P0）立即开始？

P0-A 和 P0-B 可以并行推进。P0-B 是纯文档（5分钟），P0-A 需要改代码（预计 30-60 分钟）。
