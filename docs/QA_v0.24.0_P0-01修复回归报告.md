# QA v0.24.0 · P0-01 修复回归报告（未登录绕过排盘守卫）

- 日期：2026-08-29
- 测试工程师：worker_79160b29
- 被测版本：commit 07c7953（fix: P0-01 AI录入绕过排盘守卫）
- 基线：v0.24.0（Supabase 账号功能）
- 结论：**P0-01 已关闭，无新增缺陷，可以进入内测发布**

## 1. 修复内容确认（静态核查）

commit 07c7953 共 153 插入 / 10 删除，改动面：

| 文件 | 改动 |
|---|---|
| auth.js | APP.doPaipan 守卫（顶层 L24-31 + init L50-57，__authGuarded 幂等）；RENDER.doPaipan 守卫（L35-42/L60-67，纵深防御封堵 togglePrivacy 等直连 RENDER 入口）；T05 断言 3 条（L379-387） |
| main.js | doAiParse 两处排盘调用改为 window.APP.doPaipan()（L538/L546） |
| standalone.html / index.html | togglePrivacy 重排改走 APP.doPaipan；内联段与外部文件同步 |

核查确认无其它裸 doPaipan() 绕过路径（main.js 作用域局部引用 L162 仍在，但全部调用点已走守卫；archive.js L236/L356/L862 均走守卫入口）。

## 2. P0-01 复现重测（未登录绕过守卫）— 通过

独立 Chrome profile（全新 localStorage）打开 http://localhost:8765/standalone.html（非 test 模式）：

| 检查项 | 结果 |
|---|---|
| APP 守卫已包装 | guarded: true ✅ |
| RENDER 守卫已包装 | renderGuarded: true ✅ |
| 未登录触发 AI 录入（doAiParse） | alerts: ["请先登录后使用排盘功能"] ✅ |
| 登录遮罩显示 | overlayAfter: flex ✅ |
| 排盘未执行 | output 1086 → 1086（不变）✅ |
| 云端记录 | 无写入 ✅ |

→ **未登录 AI 录入被守卫完整拦截，P0-01 关闭。**

## 3. ?test=1 断言回归 — 六入口 247 条全绿

六入口（file:// 三入口 + http://localhost:8765 三入口）均输出「全部 247 条断言通过！含 v0.24 追加断言」：
- standalone-split.html ?test=1
- standalone.html ?test=1
- index.html ?test=1
- 对应 http:// 三入口

247 = 244 旧断言 + 3 条新增 T05 断言（守卫已包装 RENDER / APP.doPaipan 非原始引用 / doAiParse 走守卫入口被调）。

## 4. check-release.sh — 四步全绿

`bash scripts/check-release.sh` 输出「🎉 全部校验通过，可以发布」：
- standalone-split 关键 id 存在性 ✅
- 外部 JS 与内联段一致性（auth.js / config.js / records.js / supabase.min.js）✅
- 其余两步 ✅

## 5. 登录后 AI 录入正常排盘（守卫放行）— 通过

独立 profile + 账号 test.a.v024@example.com（云端 50 条模板记录）：

| 检查项 | 结果 |
|---|---|
| 登录 | loginResult: ok，loggedIn: true ✅ |
| 登录后遮罩隐藏 | overlayAfterLogin: none ✅ |
| AI 录入触发（doAiParse 走守卫） | 无拦截 alert（alerts: []）✅ |
| 排盘真实执行 | output 渲染完整 person-info 盘面（21853→23509 字符，含 人元司令 等数据）✅ |
| 控制台异常 | 无 ✅ |

## 6. AC01-AC13 冒烟覆盖说明

改动面集中在排盘守卫与入口，回归重点覆盖：AC-登录（登录成功/遮罩隐藏）、AC-AI录入（未登录拦截 / 登录放行）、AC-排盘渲染（person-info 完整盘面）、AC-守卫入口（doAiParse 统一走 APP.doPaipan）。此前 v0.24.0 验收已覆盖注册/记录增删查/迁移/用户隔离/单体版五段同步，本次守卫改动不触及上述数据链路。

## 7. 结论

- **P0-01（未登录绕过排盘守卫）：已关闭** ✅
- 新缺陷：无 ✅
- 回归结论：**通过，可以进入内测发布** ✅

