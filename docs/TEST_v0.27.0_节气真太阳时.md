# 测试用例：v0.27.0 节气区「真太阳日月 / 真太阳时间」

> 归属：八字排盘 · 从真版 ｜ 作者：测试工程师（worker_357e5cd9）
> 日期：2026-09-10 ｜ 编排：orch_eccabe4429eb
> 被测物：`/Users/feng/.clacky/ext/local/bazi-paipan`（render.js / main.js / index.html / standalone.html / standalone-split.html / scripts/check-release.sh）
> 基线：tag `v0.26.0`（已正式发布）
> 依据：PRD_v0.27.0_节气真太阳时.md、ADR_v0.27.0_节气真太阳时.md（D1–D8）
> 验收口径：AC01–AC08（功能）、R01–R03（回归）、T01–T07（新增断言）

---

## 一、验收口径映射

| 编号 | 口径 | 验证手段 |
|---|---|---|
| AC01 | 每列新增真太阳日月(M/D)/时间(HH:MM)，格式同 `.jq-md/.jq-tm` | CI-02 / TC-02 / T01 |
| AC02 | 值 = `trueSolarTime(交节BJT, 出生地经度)`，可跨日 | TC-03/T04 / T01-T03 |
| AC03 | 未选出生地 → 两行「—」+ 标题提示，不抛 | TC-05 / T04 |
| AC04 | 与 `useSolar` 解耦（未勾选也展示） | CI-01 / TC-06 / T06 |
| AC05 | 点流年/大运/📍今年 → 两行随年份刷新 | TC-07 / T06 |
| AC06 | 双胞胎共享块含两行且随年份 | TC-08 / T07 |
| AC07 | 插入位置 `jq-tm`后/`jq-name`前；每列 6 行；横排不变；有 ☀ 标识 | CI-03 / TC-02 / T05 |
| AC08 | 越界年份沿用整块占位；小寒 null → 「—」 | CI-04 / TC-09 |
| R01 | v0.26 全量断言（339）仍全绿（尤其 T03/T04） | TC-10 / CI-05 |
| R02 | 三端一致，`check-release.sh` 通过 | CI-06/07/08 |
| R03 | 未选出生地/表外年份/2100 小寒 边界不抛 | TC-05/TC-09 |

---

## 二、功能测试用例（TC）

| 编号 | 用例 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| TC-01 | 有出生地基础展示 | 出生地=北京市(116.4)，2026 十二节 | `buildJieqiHtml(2026,116.4)` | 12 列，每列 6 行；`.jq-tsmd/.jq-tstm` 各 12 |
| TC-02 | 格式与插入位 | 同上 | 解析 DOM 列内子元素 | 顺序 md→tm→tsmd→tstm→name→gz；值形如 `☀ 2/4`、`☀ 03:33` |
| TC-03 | 锚点·北京 | 同上 | 取立春/立冬 | 立春 `2/4 03:33`；立冬 `11/7 17:53`（EoT 正向） |
| TC-04 | 跨日·喀什/双鸭山 | 经度 75.99 / 131.16 | 取清明 / 芒种 | 清明 `4/4 23:40`（跨前）；芒种 `6/6 00:35`（跨后） |
| TC-05 | 未选出生地 | `lng` 缺省/`null` | `buildJieqiHtml(2026)` | 12 列两行全「—」；标题含「未选出生地，真太阳时不可用」；无 NaN |
| TC-06 | 与 useSolar 解耦 | useSolar 未勾选 | 真实渲染后排盘 | 仍展示两行（值随经度） |
| TC-07 | 年份联动 | 排盘 1982 北京 | 点流年/大运/运前/📍今年 | 标题与两行同步变为目标年 |
| TC-08 | 双胞胎 | 同卵/龙凤胎（同址） | 渲染共享块 | 仅 1 块 `.jieqi-section`、仅一组 12×2 行；随点谁跟谁 |
| TC-09 | 越界/小寒 | year<1000 或 >2101；2100 年次年小寒 | 调用 | 越界→整块占位不渲染两行；小寒 null→该列两行「—」 |

## 三、代码级检查（CI，静态）

| 编号 | 检查项 | 期望 |
|---|---|---|
| CI-01 | D1 经度贯穿 | `doPaipan` 中 `getLng()` 无条件执行（不在 `if(useSolar)` 内）；三入口写 `data.lng/d1.lng/d2.lng` |
| CI-02 | D2 签名与判空 | `buildJieqiHtml(year,lng)`；`typeof lng==='number' && isFinite(lng)` 显式判空（`null` 走「—」，不得只靠 try/catch） |
| CI-03 | D2 插入位与行序 | `jq-md→jq-tm→jq-tsmd→jq-tstm→jq-name→jq-gz`；v0.26 T03 正则 `jq-md→jq-tm` 相邻仍匹配 ×12 |
| CI-04 | D2 标题提示并列 | `needHint`（小寒越界）与 `needLngHint` 互不覆盖 |
| CI-05 | D3 回退链 | `refreshJieqi(root,year,lng)`：显式第三参 → `root._jieqiLng` → `root._paipanData.lng`；v0.26 三调用点零改动 |
| CI-06 | D5 容器经度 | 三入口渲染后写 `container._jieqiLng`（单人/同卵=data.lng，龙凤胎=d1.lng） |
| CI-07 | D6 三端 CSS | index/standalone/standalone-split 均含 `.jq-tsmd/.jq-tstm`（`#c9a96e`,13px） |
| CI-08 | D7 三端同步与防线 | `index.html` == `standalone.html`（字节）；`RUNTIME_KEYS` 含 `jq-tsmd jq-tstm`；`check-release.sh` 退出码 0 |
| CI-09 | 守卫必要性 | `trueSolarTime(...,null)` 会按 0° 返回有限值 → 必须 `typeof==='number'` 排除 `null` |
| CI-10 | 存量问题 | `redrawZuHeSVG` 引用与 v0.26.0 基线一致（未被本版引入） |

## 四、回归项（RI）

| 编号 | 内容 |
|---|---|
| RI-01 | `?test=1` v0.26 全量 339 条仍全绿（含 T03/T04） |
| RI-02 | 三端渲染一致；`check-release.sh` 4 段全过 |
| RI-03 | 边界（未选出生地 / 表外年份 / 2100 小寒）不抛异常 |
| RI-04 | 单/同卵/龙凤胎三条渲染路径均无回归 |

## 五、环境与未覆盖说明
- 执行环境：headless Chrome（CDP 9333）+ `?test=1`（绕过 auth 登录守卫，见 v0.26 QA-01）。
- 未覆盖：真实移动端 dpr 多档截图（本版无布局改动，沿用 v0.26 结论）；跨月/跨年（由 `trueSolarTime` 既有逻辑保障，本版仅抽验跨日）。

