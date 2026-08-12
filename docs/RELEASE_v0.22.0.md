# RELEASE v0.22.0 — 年份扩展 1000-2100（<1400 大运留空）

> **发布日期**：2026-08-13
> **发布师**：worker_f852d8ec（Leader 代行，worker 唤醒失效）
> **版本**：v0.22.0
> **发布类型**：内测版（bazi-paipan-test）

---

## 一、版本概要

v0.22.0 年份扩展：排盘年份范围从 1600-2100 扩展至 1000-2100（sxtwl 数据全量重生）。**1400 年以下（1000-1399）大运留空**（qiYun=null、daYun=[]，界面仅显示四柱骨架，不显示大运/流年/起运），1400 年起恢复完整大运。

---

## 二、改动文件

| 文件 | 变更 |
|------|------|
| algorithm.js | 年份扩展逻辑 + 3 个 bug 修复 + qiYun=null 渲染防护 |
| render.js | qiYun=null 防护（changSheng/pillar/双胞卡/龙凤卡/存档） |
| constants.js | 三数组全量重生（LUNAR_NEW_YEAR 1101 条、LUNAR_INFO、SOLAR_TERMS 26424 条） |
| main.js | 年份校验放宽至 1000-2100 |
| archive.js | 年份字段适配 |
| standalone-split.html | 版本注释 v0.22.0 |
| index.html / standalone.html | 内联构建同步（build_modules.py） |

### 本版修复的 bug

1. **空指针**：`if (qiYun) qiYun.shun = shun` —— 1000-1399 年不再崩溃
2. **qiYunDays 顺/逆排跨年 bug**（影响所有年份 1 月出生者，-114y 根因）：顺排 `if (st.getTime() < birthMs) st = getSolarTerm(y+1, nextTerm)`，逆排 `if (st.getTime() > birthMs) st = getSolarTerm(y-1, termIdx)`
3. **数据层**：1400-1582 年小寒（SOLAR_TERMS idx=0）错位 +1 年（183 条），sxtwl 按格里年归属重新生成写回
4. **渲染层（内测发布实测发现）**：<1400 年 daYun 为空 → `pillar('','')` → `changSheng('','')` mapGan undefined 崩溃；同批修复 extractBaziFromPaipan/双胞卡/龙凤卡/卡片 HTML 中 qiYun=null 的 11 处访问点
5. **数据层 2（编程师追加，测试师浏览器实测发现）**：1000-1399 年小寒（SOLAR_TERMS idx=0）错位 +1 年（400 年）+ 1000 年边界越界，sxtwl 重新生成写回；测试师定向复验（范围一+范围二）全部通过

---

## 三、测试状态

- ?test=1 回归：**211/211 全绿**
- 分级边界：1000/1399 简化排盘不崩（dy=0 qy=null）；1400/1472 完整（dy=10）
- 起运修复：1400-1-1 qiYun=8年4月29天（原 -114y 已修复）
- 小寒错位修复：1400/1450/1500/1580/1582/1583/1600/1000/2100 全部同年无 +1 错位
- 三数组长度：1101/1101/26424
- 浏览器实测（正式版+内测版）：1000 年 UI 排盘成功（庚子年·属鼠），全链路 paipan→inject→renderChart→extract 无异常

---

## 四、发布检查清单

| # | 检查项 | 结果 |
|---|--------|:--:|
| 1 | 代码同步：standalone-split.html MD5 == 正式版 | ✅ |
| 2 | 代码同步：archive.js / render.js / main.js / constants.js / algorithm.js MD5 == 正式版 | ✅ |
| 3 | handler.rb 类名：BaziPaipanTestExt（本次修复：原为 BaziPaipanExt 导致内测 API 404） | ✅ |
| 4 | handler.rb /standalone 路由 → standalone-split.html | ✅ |
| 5 | 6 个 JS 模块路由完整 | ✅ |
| 6 | /standalone HTTP 200 | ✅ |
| 7 | 6 个 JS 模块全部 HTTP 200 | ✅ |
| 8 | 版本注释：standalone-split.html 头为 v0.22.0 | ✅ |
| 9 | ext.yml 版本号：v0.22.0 | ✅ |
| 10 | 浏览器实测：1000 年排盘正常渲染 | ✅ |
| 11 | 正式版（bazi-paipan）未受影响 | ✅ |

---

## 五、内测版同步记录

- **同步文件**：standalone-split.html、archive.js、render.js、main.js、constants.js、algorithm.js（6 个，MD5 全部一致）
- **未同步**：gongwei.js、ability-chart.html、CHANGELOG.md（无差异）
- **handler.rb**：不覆盖（内测版独立改类名 BaziPaipanTestExt，与正式版逻辑 diff 一致）
- **备份**：内测版 `.bak_v0220/`（8 个文件）
- **版本号**：内测版 ext.yml v0.22.0（正式版 ext.yml 仍为 v0.21.0，待邦顺验收后升级）

---

## 六、内测版访问地址

```
http://localhost:7070/api/ext/bazi-paipan-test/standalone
```
