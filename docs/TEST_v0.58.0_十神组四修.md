# TEST v0.58.0 — 十神组四问题修复

日期：2026-10-18
版本：v0.58.0
测试环境：CDP 独立 Chrome（headless=new，9256-9268 端口序列），测试盘 1984-5-11 12时 男 测试甲

## 修复内容

| # | 问题 | 根因 | 修复 |
|---|------|------|------|
| ① | 首次点十神弹出宫位页面 | 多实例（主页/对比/双胞胎卡）共用 `#ssh-popover` id，getElementById 拿错实例；且 popover 挂 `.gz-popover` 类被宫位全局关闭逻辑连带 | 改自有 `.ssh-popover` 类 + `closest('.gz-panel-wrapper')` 就近定位 + 独立外点关闭监听 |
| ② | 午子卯酉单字藏干靠左 | sshCgSpans 固定输出 3 个 min-width:3.2em span，空层 `&nbsp;` 占位撑满 | 非空层才输出 span（`if(!l) continue`），min-width 降 2.8em |
| ③ | 十神组行文字太大 | `.chart .rm td{17px}`(0,2,1) 压过 `.ssh-gan-row td{12px}`(0,1,1) | 新增 `.chart tr.ssh-X-row > td / .rl` 11px 规则 (0,2,2)+(0,3,0) 源序覆盖 |
| ④ | 十神开启时大运流年右侧出界 | 十神行 3.2em span 撑主表列到 172px，窄窗主表 1088 贴满 1090 | span 3.2em→2.8em；1152 窗主表回落 680px，docOverflowX=0 |

## 断言回归（?test=1）

- **1416 条断言，3 败，全部 ⊆ v0.57.0 基线 5 败**（基线名单：RECFL 前置/F01后/F01宽/F02/v0.43 T02）
- 较基线减少 2 条：RECFL F01 开记录后、RECFL F02 先记录后开流月（十神列宽回落连带修复）
- 断言改造：T10/T11/T20/T21「固定3span」→「span数=非空层数」；新增 T10b 无空占位、T23 popover 自有类名

## 正常模式 UI 实测（截图 bazi058-ui-final3.png）

| 项 | 实测 | 结果 |
|----|------|------|
| ①popover 就地开 | `.ssh-popover.open`、display block、无 gz-popover 类、含「军队」、外点关闭+重开 | ✅ |
| ②单字支居中 | ssh-cg-row 单字格（支前员/盟友）leftGap=0 rightGap=0 | ✅ |
| ③组行字号 11px | ganRowTd/ganRowRl/cgRowTd/cgName 全 11px（.ssh-cg-g 在主表藏气行 17px 属主表规格） | ✅ |
| ④窄窗不出界 | 1152 窗：mainTblW=680 ≤ outCw=1090，lnRight=711 ≤ outRight=1121，docOverflowX=0 | ✅ |

## 门禁

- node --check main/render/shishen ✅
- check-release.sh 六道全过（含三产物内联一致性、节气真值）✅
- index.html ≡ standalone.html md5 一致 ✅

## 已知边界

- 主表藏气行（rh 行）的横排 span 字号 17px 为主表原有规格，未改动（用户诉求范围是十神组行）
- RECFL 3 条历史失败与窗口宽 1440 下记录面板布局相关，属既有挂账，与本轮无关
