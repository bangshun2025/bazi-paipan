# TEST v0.56.0 运列表头年份

## 需求

主表（table.chart）时柱右侧的大运列/流年列表头，干支上方显示对应公历年份：大运格=该运起始年（curDy.startYear），流年格=当前年份（nowYear）；点击大运/流年格切换时表头年份同步联动。

## 改动清单

- `render.js`：新增 `dyLnYearHtml(y)`（756 行）；单人表头（880 行）、buildCardHTML 表头（2024 行）接入；`buildCardHTML` 新增 `curDyYear/curLnYear` 选项；`_applyDLUpdates` 第 6 参 `yr` 同步表头年份（1922-1926 行）；`_updateCardDyLnColumns` 两调用点传参。
- 三 HTML CSS：`.chart tr.hd th .dyln-yr { display:block; font-size:11px; font-weight:400; color:var(--c-gray); letter-spacing:.05em; margin-top:1px; opacity:.85; }`
- `main.js` 断言：DL56 新段 10 条（渲染值/点击联动/运前空值）；TWN48 列序改写+每卡年份断言；合盘表头 7 列年份语义。
- RECFL 三条 scrollWidth 断言改为对象字面量带 detail 诊断（eq() 仅三参不透传 detail）。

## 测试结果

### 1. CDP 全量回归（?test=1，全新 profile，1440 窗口）

- 总断言 1451 条，失败 5 条 = RECFL×4 + v0.43 T02，**与 v0.55.2 基线完全一致，无新增失败**。
- RECFL 数值（诊断 detail）：开记录前 scrollWidth=1863 vs winW=1440；开记录后 1824。系 1440 窗口下主表固有超宽（历史基线，本轮 display:block 副行不增横向宽度）。
- `#test-results div` 统计陷阱：外层容器 div 的 textContent 拼接多条断言导致 failCount 虚高（6 vs 实际 5），按去重断言文本数。

### 2. 正常模式真实 UI 实测（?test=1 免登录墙 → 等回归跑完 → 真实表单操作）

- 登录墙发现：正常模式 `APP.doPaipan()` 被 P3-04 守卫包装，未登录直接 `requireLogin()` 弹 authOverlay 不排盘（这也是直连 evaluate 超时的根因——排除 alert）。`?test=1` 下守卫放行且 `showLoginScreen` 直接 return，为 UI 实测唯一通路。
- 点「排 盘」按钮（真实 click）：主表渲染，表头大运年份=**2019**、流年年份=**2026**（1982-10-18 男，第 4 运 2019 起，与 DL56 数据吻合）。
- 点 data-dy=0 大运格：表头年份 2019→**1989**、cc 高亮 3→0，联动正确；流年列重置为该运 10 年，流年表头同步为该运首年。
- 几何取证：主表滚动容器 `.body-cols[sw=1484, cw=1302]`，大运/流年列需横向滚动入镜（RECFL 超宽的 DOM 层解释）。

## 结论

功能全部验证通过，无新增回归失败。门禁 check-release.sh 6/6 全绿。
