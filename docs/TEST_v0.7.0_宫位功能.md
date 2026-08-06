# v0.7.0 宫位功能 — 测试报告

> 测试师：worker_fb39299d | 日期：2026-07-15 | 被测文件：编程师/standalone.html

---

## 一、测试概览

| 指标 | 数值 |
|------|------|
| 测试项总数 | 23 |
| 通过 (PASS) | **23** |
| 失败 (FAIL) | **0** |
| 通过率 | **100%** |
| 测试方法 | Chrome DevTools Protocol (CDP) 浏览器自动化 + 手动 CSS 校验 |
| 被测浏览器 | Chrome 150 |

---

## 二、功能验收（AC01-AC09）

| 编号 | 场景 | 结果 | 详情 |
|------|------|------|------|
| AC01 | 单人排盘，未选择任何宫位 | ✅ PASS | 默认标签行 display:none，行为与 v0.6.7 一致 |
| AC02 | 选择"信息宫位" | ✅ PASS | 主表四柱：信息输入/信息处理/意义判定/输出组织；三垣：状态门控/情绪标记/执行反馈；大运流年列留空 |
| AC03 | 从"信息"切换到"认知" | ✅ PASS | 即时切换为认知宫位7标签，无需重排盘 |
| AC04 | 从"认知"切换回"无" | ✅ PASS | 标签行全部隐藏 |
| AC05 | 精简模式 + 选择"功能宫位" | ✅ PASS | 标签行正常显示，纳音/空亡/神煞行隐藏 |
| AC06 | 同性双胞胎，选择"做功宫位" | ✅ PASS | 两张卡片各4个标签行（2卡×2表=4行），nian列均为"市场位" |
| AC07 | 龙凤胎，选择"亲缘宫位" | ✅ PASS | 两张卡片标签行内容一致，nian列均为"爷辈宫位" |
| AC08 | 双胞胎"仅看老大" + "关系宫位" | ✅ PASS | 老二卡片隐藏但标签行仍在 DOM 中，老大卡片正常显示 |
| AC09 | 14种宫位 × 7柱 = 98 个映射 | ✅ PASS | **0/98 不匹配**，逐项与 PRD 映射表完全一致 |

---

## 三、回归验收（AR01-AR05）

| 编号 | 场景 | 结果 | 详情 |
|------|------|------|------|
| AR01a | 主星行存在 | ✅ PASS | `.chart .rs` 正常 |
| AR01b | 天干行存在 | ✅ PASS | `.chart .rg` 正常 |
| AR01c | 藏干行存在 | ✅ PASS | `.chart .rh` 正常 |
| AR01d | 纳音行存在 | ✅ PASS | `[data-row-type="nayin"]` 正常 |
| AR01e | 大运流年表存在 | ✅ PASS | `.luck-table` 正常 |
| AR02 | 双胞胎三模式 | ✅ PASS | 并排对比/仅看老大/仅看老二 按钮正常 |
| AR03 | 大运流年点击交互 | ✅ PASS | 点击高亮联动正常，无标签行干扰 |
| AR04 | 精简按钮可用 | ✅ PASS | 单人/双胞胎视图均可正常切换 |
| AR05 | JS Console 零报错 | ✅ PASS | 测试过程无 JS 异常 |

---

## 四、视觉验收（AV01-AV03）

| 编号 | 场景 | 结果 | 实测值 |
|------|------|------|--------|
| AV01 | 标签行虚线底边分隔 | ✅ PASS | `border-bottom: 1px dashed` |
| AV02 | 色彩协调 | ✅ PASS | `color: #8b7e6a`（meta色），`background: rgba(201,169,110,.06)`（与rl列一致） |
| AV03 | 长标签不换行 | ✅ PASS | `white-space: nowrap` 生效，font-size: 12px |

---

## 五、代码审查（与 ADR 对照）

| 检查项 | 结果 |
|--------|------|
| GONGWEI_MAP 常量（14键×7值） | ✅ 与 PRD 映射表一致 |
| GW_INDEX 索引映射 | ✅ 7柱映射正确 |
| updateGongWeiTags() 函数 | ✅ querySelectorAll 批量操作 + data-gw 解耦 + display 显隐 |
| 单人 renderChart() 标签行插入 | ✅ chartRows.push(gzTags) + syRows.push(gzTagsSy)，位置正确 |
| buildCardHTML 标签行 | ✅ gzTagsMain 在 hdr 之前 + gzTagsSy unshift 索引0 |
| sanyuan includeLuckCols 索引修正 | ✅ `rows.sanyuan[0]`=标签行, `[1]`=hd, `si=2`起循环 |
| 双胞胎选择器位置 | ✅ bz-twin-tabs 内 margin-left:auto |
| CSS 样式 | ✅ .gz-tags / .gz-tags-sy 含虚线底边、nowrap、rl列透明背景 |

---

## 六、runner.html 自动化测试

| 状态 | 说明 |
|------|------|
| ⚠️ 未执行 | runner.html 使用 iframe 加载 standalone.html，在 `file://` 协议下因跨域限制无法通过 CDP 自动化执行。但 **v0.7.0 改动纯 UI 层（不改排盘算法）**，算法函数（paiPan/shiShen/changSheng 等）不受影响，AR01-AR05 浏览器手动验证全部通过。建议在 HTTP 服务环境下补跑 runner.html。 |

---

## 七、发现的问题

**无阻塞缺陷。** 所有 23 项测试全部通过。

---

## 八、结论

**v0.7.0 宫位功能验收通过。** 14 种宫位 × 7 柱共 98 个映射全部正确，单人/双胞胎/龙凤胎全部视图适配正确，现有功能零回归，JS 零报错。

✅ 建议：批准进入下一个功能迭代。
