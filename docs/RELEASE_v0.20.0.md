# RELEASE v0.20.0 — 常用宫位分级

> **发布日期**：2026-08-11
> **发布师**：worker_f852d8ec
> **版本**：v0.20.0
> **发布类型**：内测版（bazi-paipan-test）

---

## 一、版本概要

v0.20.0 常用宫位分级：设置页新增「常用宫位」功能，支持自定义常用宫位分组、双tab管理（全部宫位/常用宫位）、排盘界面下拉面板只显示常用宫位、标签行顺序联动常用排序。

---

## 二、改动文件

| 文件 | 变更 | 行数 |
|------|------|------|
| gongwei.js | 核心逻辑（常用宫位数据层 + 双tab渲染 + 下拉面板过滤 + ☆标记） | 861→1139 |
| standalone-split.html | 设置页 CSS + HTML（tab栏、☆样式、常用tab列表样式） | 801→838 |
| standalone.html | 内联构建同步（build_modules.py） | 6555→6837 |
| index.html | ≡ standalone.html | 同上 |

---

## 三、测试状态

全量测试 22/22 通过（AC01-14 + AR01-08），无Bug。
详见：`docs/TEST_v0.20.0_常用宫位分级.md`

---

## 四、发布检查清单

| # | 检查项 | 结果 |
|---|--------|:--:|
| 1 | 代码同步：standalone-split.html MD5 == 正式版 | ✅ |
| 2 | 代码同步：gongwei.js MD5 == 正式版 | ✅ |
| 3 | handler.rb 类名：BaziPaipanTestExt | ✅ |
| 4 | handler.rb /standalone 路由 → standalone-split.html | ✅ |
| 5 | handler.rb 6条 JS 模块路由完整 | ✅ |
| 6 | /standalone HTTP 200 | ✅ |
| 7 | 6个 JS 模块全部 HTTP 200 | ✅ |
| 8 | 版本注释：standalone-split.html 头为 v0.20.0 | ✅ |
| 9 | 新功能代码：bz_gongwei_fav 存在 | ✅ |
| 10 | 新功能代码：toggleFav 存在 | ✅ |
| 11 | ext.yml 版本号：v0.20.0 | ✅ |
| 12 | 浏览器实测：页面正常渲染 | ✅ |

---

## 五、内测版访问地址

```
http://localhost:7070/api/ext/bazi-paipan-test/standalone
```

---

## 六、内测版同步记录

### 同步文件清单

| 文件 | 操作 | MD5核对 |
|------|------|:--:|
| standalone-split.html | 从正式版复制 | ✅ |
| gongwei.js | 从正式版复制 | ✅ |
| ext.yml | 版本号 0.19.0→0.20.0 | N/A |

### 未同步文件

| 文件 | 原因 |
|------|------|
| standalone.html | 非内测入口（内测版用 standalone-split.html，handler.rb /standalone 路由返回 standalone-split.html） |
| index.html | 同上 |
| archive.js / render.js / main.js / constants.js / algorithm.js / CHANGELOG.md | MD5 与正式版一致，无需同步 |

### 备份

同步前已将内测版旧文件（v0.19.0）备份到 `.bak_v0.19.0/`：
- `standalone-split.html`（52249 bytes）
- `gongwei.js`（31858 bytes）

### handler.rb 说明

两版 handler.rb 逻辑已一致（仅类名 BaziPaipanExt vs BaziPaipanTestExt 和挂载路径不同），未覆盖。
