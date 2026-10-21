# TEST v0.63.0 多选流月 + 多选流日

日期：2026-10-21 ｜ 版本：v0.63.0 ｜ 执行：单 agent CDP 实测

## 功能范围

- 流月面板月格多选（≤4，`multiDLPickLm`），只能挂已勾流年
- 流日面板日格多选（≤4，`multiDLPickLd`），只能挂已勾流月
- 取消上层（大运/流年/流月）联动清下层
- 主表插 `col-lm`/`col-ld` 列（流年列右侧），hd「流月·己巳·1月」两行式
- 显示序升序与勾选序解耦（`_mdlSortLms`/`_mdlSortLds`）

## 断言回归（?test=1，独立 Chrome 9231，1680×1050 干净 profile）

- 总断言 1474，败 2：RECFL F01（记录面板宽度，历史环境性）/ v0.43 T02（新 profile 无档案名显示「匿名」，环境性）——均与第 32-34 轮基线一致，零本版引入
- MLM（多选流月流日）24 条全过

## 真实页面 UI 实测（t68-ui.js，14 条全绿）

| # | 步骤 | 断言 |
|---|------|------|
| 1 | 点 btnMultiDL | 按钮 active=true |
| 2 | multiDLState.on | true |
| 3 | 勾流月面板开关 | .flow-panel 出现 |
| 4 | 点运表大运格 | dys=1 |
| 5 | 点流年格（data-di=运干支） | lns=1 |
| 6 | 点月格 | lms=1 + aria-selected=true |
| 7 | 主表 col-lm | 出现（th+td） |
| 8 | 开流日开关后点日格 | lds=1 + aria-selected=true |
| 9 | 主表 col-ld | 出现 |
| 10 | 再点大运格取消 | on=true/dys=0/lns=0 |
| 11 | 级联清流月 | lms=0 |
| 12 | 级联清流日 | lds=0 |
| 13 | 主表 col-lm 移除 | 0 |
| 14 | 关闭多选 | on=false |

截图：TEST_v0.63.0_UI实测.png（月格 1月丙寅 红框选中态，双卡面板「己巳年·十二节气月」）

## 本版修复的三个集成 bug（真实页面才暴露）

1. **refreshFlow 清列**：无条件 `querySelectorAll('.col-lm,.col-ld').forEach(remove)` 把 applyMultiDL 刚插的列删光（bindEvents→refreshFlow 在 applyMultiDL 之后跑）。断言环境隐藏容器无 `.luck-section`，refreshFlow 早退不触清列，掩盖 bug。修复：`if (!_multiDL.on)` 守卫。
2. **doPaipan 清面板 state**：multiDLPickLm/Ld 调 `APP.doPaipan()` 重排后 `container._flowState=null`，面板年跳回当前年——月格选中态丢失、日格点击被「未勾流月」拒。修复：doPaipan 之后恢复各面板 `_flowState={year,month,day}` 并 refreshFlow。
3. **hd 文案双重包裹**：`dyLnYearHtml(lmHeadLabel(...))` → 改 `lmHeadLabel(...)` 直出。

## 诊断方法论留痕

真实页面 col-lm=0 而断言环境全过，定位链：applyMultiDL 加 `window.__mdlLog` 打点（早退点/行插列/isConnected）→ CDP evaluate 单步复现 → 「插:r1/connected=true/cls=col-lm/trCells=8 但全页查询=0」→ 锁定插入后被删 → grep 全部 `.col-lm` 写点 → refreshFlow 清列落网。打点已全部移除（grep __mdlLog=0）。

## 门禁

- node --check render.js/main.js 过
- sync-module-inline（render/main）外部≡内联一致
- index.html ≡ standalone.html md5 一致
- check-release.sh 六道全绿
