# TEST v0.55.2 — 干净环境首访 ？test=1 全量回归修复验证

**日期**: 2026-10-17
**版本**: v0.55.2（commit 267fbb5，tag 已推送，GitHub Pages 已上线）
**前置**: v0.55.1 发版后线上 ？test=1 回归发现干净环境炸页（v0.55.1 文件在干净 profile 复现一致，非线上特有）

---

## 一、Bug 复现与根因

**复现**：全新 Chrome profile（localStorage 空）打开 ？test=1（file:// 与线上均复现），SUMMARY 永远「⏳ 运行中…」，Runtime.exceptionThrown 捕获 4 条异常：

1. `TypeError: Cannot read properties of null (reading 'id')` @ index.html:15868（v0.37.0 盘面对比段 `C._setState([{type:'arch',id:a1.id},…])`，a1=预置档案杨禹赫）
2. `TypeError: Cannot read properties of undefined (reading 'doPaipan')` @ 18108（window.APP 未挂载）
3. `ReferenceError: APP is not defined` @ 12055（DOMContentLoaded 回调）
4. `ReferenceError: APP is not defined` @ getFormData(5540) ← runV034Tests(6788)

**根因链**：测试主 IIFE 在 DOMContentLoaded **之前**同步执行 → 干净环境预置档案尚未建立（initPresetArchives 在 DOMContentLoaded 才跑）→ `ARCHIVE.getArchives()` 找不到杨禹赫 → a1=null → `.id` 抛 TypeError → **main 大块顶层同步执行中断** → 同块后续的 `window.__testAppend` 与 `window.APP = {...}` 均未执行 → 级联异常 2/3/4。

**掩盖史**：历次本地全量实测复用同一 Chrome profile（含档案数据），a1 有值跳过炸点，1371/1372「假绿」。v0.54.0 起线上 ？test=1 回归一直「待做」，本次 v0.55.1 补做时首次用干净 profile 暴露。**线上正常用户（有数据）不受影响**；此雷为 v0.37.0 测试段时代埋下，非 v0.55.1 引入。

## 二、修复

main.js 测试框架开头（`const tests = []` 后）同步补建预置档案：

```js
try { if (typeof ARCHIVE !== 'undefined' && ARCHIVE.initPresetArchives) ARCHIVE.initPresetArchives(); } catch(e) {}
```

initPresetArchives 幂等（检测 `hasPreset`，追加不替换），DOMContentLoaded 再跑一次不会重复写入。

## 三、验证结果

| 场景 | 环境 | 结果 |
|---|---|---|
| ？test=1 全量回归（修复后） | 本地 file:// + 全新 profile | 1372 断言、**0 异常**、失败 1 条 = v0.43 T02（已知历史基线，与本修复无关） |
| ？test=1 全量回归（修复后） | 线上 + 全新 profile | 同上：1372 断言、0 异常、仅 v0.43 T02 |
| 正常模式（无 ？test=1） | 本地 file:// + 全新 profile | title「八字排盘 · 从真版」、typeof APP=object、0 异常 |
| 正常模式（无 ？test=1） | 线上 + 全新 profile | 同上 0 异常、APP 挂载正常 |

## 四、发版证据

- 门禁 check-release.sh 6/6 全绿
- commit 267fbb5（7 files：main.js / index.html / standalone.html / standalone-split.html / CHANGELOG.md / README.md / ext.yml），pre-commit 两道检查过
- tag v0.55.2 推送，Pages 重建后线上三产物 md5 与本地一致：
  - index.html = standalone.html = `58feae249d15b56bacd66cba333f31d3`
  - standalone-split.html = `1ec5aa422f785418a263ad995eeabdb6`
- 扩展目录 ~/.clacky/ext/local/bazi-paipan 三产物与运行目录一致（cmp SAME ×3）

## 五、遗留

- v0.43 T02「标题带档案名」为既有历史基线失败（干净环境无选中档案名 →「匿名」），与本修复无关，另立迭代处理。
- **流程教训**：全量 ？test=1 回归必须包含「全新 profile 干净首访」场景，脏 profile 只能作辅助对照。
