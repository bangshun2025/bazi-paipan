# 发布记录 — v0.19.0 隐私模式（艺名）

- **发布日期**：2026-08-09
- **发布人**：发布师（worker_b62d6c1d）
- **线上地址**：https://bangshun2025.github.io/bazi-paipan/
- **版本号**：v0.19.0（来源：`standalone.html` 版本注释，唯一真相源）

## 一、发布内容

**v0.19.0 — 隐私模式（艺名）**

- 全局隐私开关：默认开启、localStorage 持久化（`bz_privacy_mode`）
- 档案艺名字段：档案新增艺名（小名）字段
- 显示层脱敏（降级链 艺名→小名→匿名）：开启隐私模式后页面展示优先用艺名，无艺名则用小名，均无则「匿名」；`data.name` 始终保留真名不动
- AI 解析预览脱敏：开启隐私模式时姓名显示「已隐藏」

## 二、Git 发布动作

| 项目 | 值 |
|---|---|
| 发布 commit | `cedf1e3` v0.19.0: 隐私模式（艺名）— 全局隐私开关 + 艺名字段 + 显示层脱敏 |
| CHANGELOG commit | `76d399e` v0.19.0: 更新 CHANGELOG（发布线上） |
| 强制触发部署 commit | `c84664e` ci: 触发 GitHub Pages 重新部署 |
| Git tag | `v0.19.0`（annotated，`git tag -a`） |
| Tag message | v0.19.0: 隐私模式（艺名）— 全局隐私开关 + 艺名字段 + 显示层脱敏 |
| 变更范围 | 8 files changed, 314 insertions(+), 48 deletions(-) |
| 修改文件 | standalone.html / index.html / archive.js / constants.js / main.js / render.js / standalone-split.html / CHANGELOG.md |

## 三、CHANGELOG 条目

已写入仓库 `CHANGELOG.md`（v0.18.0 条目之后）：

```markdown
## v0.19.0 — 隐私模式（艺名） (2026-08-09)

### 新增
- **全局隐私开关**：默认开启、localStorage 持久化（`bz_privacy_mode`），可在设置中切换
- **档案艺名字段**：档案新增艺名（小名）字段，供显示层脱敏使用
- **显示层脱敏（降级链 艺名→小名→匿名）**：开启隐私模式后，页面展示优先用艺名，无艺名则用小名，均无则显示「匿名」，`data.name` 始终保留真名不动
- **AI 解析预览脱敏**：开启隐私模式时，AI 解析预览区姓名显示为「已隐藏」

### 测试
- AC1-AC13 + AC7b 隐私模式验收用例全过
- 199 条内置回归全绿
- `standalone.html == index.html` 字节一致

### 修改文件
- `standalone.html` / `index.html`（隐私开关 UI + 显示层脱敏逻辑）
- `archive.js`（艺名字段 + 显示名构造 + 降级链）
- `constants.js`（`PRIVACY_KEY`）
- `render.js`（显示层脱敏）
- `main.js`（AI 解析预览姓名脱敏）
- `standalone-split.html`（同步脱敏逻辑）
```

## 四、部署验证（线上实测）

**GitHub Actions 状态**：
- `c84664e` pages build and deployment：**completed success**
- 注：首次 push 后 pages build 未自动触发（回归测试偶发不触发 pages 的问题），按技能指引推空提交 `c84664e` 强制触发，1 分钟后部署成功

**线上页面实测**（浏览器访问 https://bangshun2025.github.io/bazi-paipan/）：

| 验证项 | 结果 |
|---|---|
| 页面版本号 | v0.19.0 ✓（HTML 版本注释） |
| 页面 HTTP 状态 | 200 ✓ |
| 隐私模式代码存在 | PRIVACY_KEY / getPrivacyMode / 隐私 共 21 处 ✓ |
| 隐私开关默认开启 | 进入页面按钮为「🔒 隐私」，姓名显示「匿名」✓ |
| 开关切换 | 点击后 🔒 ↔ 🔓 正常切换 ✓ |
| 关闭隐私 | 姓名恢复显示真名「邦顺」✓ |
| 开启隐私 + 填艺名 | 姓名显示艺名「测试艺名」✓ |
| 真名保留 | 输入框 `data.name` 仍为「邦顺」，仅显示层脱敏 ✓ |

## 五、结论

v0.19.0 隐私模式（艺名）已成功发布上线，线上正式版生效，隐私开关/艺名/降级链功能实测正常。

---

## 六、内测版同步（2026-08-11）

> 补发：v0.19.0 发布时跳过内测版，按邦顺要求同步 `bazi-paipan-test`。

| 项 | 内容 |
|---|---|
| 目标目录 | `~/.clacky/ext/local/bazi-paipan-test/` |
| 同步文件 | standalone-split.html / archive.js / render.js / main.js / constants.js / CHANGELOG.md（6 文件 MD5 与正式版一致） |
| ext.yml | version `0.17.0` → `0.19.0`（保留内测 id/name/description） |
| handler.rb | 未覆盖（类名 `BaziPaipanTestExt` 必须保留，逻辑已与正式版一致） |
| 备份 | `bazi-paipan-test/.bak_v0180/` |
| 验证 | 内测版 `/standalone` 返回 v0.19.0 ✓；JS 模块路由全 200 ✓；页面实测：艺名字段出现、🔒 隐私默认开启、姓名显示「匿名」、开关切换恢复真名、排盘渲染正常 ✓ |

内测版地址：`http://localhost:7070/api/ext/bazi-paipan-test/standalone`（Clacky 服务实时读文件，无需重启）。

---
*发布记录由发布师 worker_b62d6c1d 生成；内测版同步由 Leader 于 2026-08-11 补记*
