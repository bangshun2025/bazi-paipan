# v0.19.0 隐私模式（艺名）测试验收报告

> 测试师：worker_54e70e2e | 日期：2026-08-09
> 验收对象：八字排盘 v0.19.0 隐私模式
> 验收依据：PRD_v0.19.0_隐私模式艺名.md（AC1-AC13 + AC7b）、ADR_v0.19.0_隐私模式艺名.md、实现说明_v0.19.0_隐私模式艺名.md

---

## 一、验收结论

**✅ 通过（PASS）**

v0.19.0 隐私模式（艺名）全部 14 条验收条件（AC1-AC13 + AC7b）逐条核验通过；
内置回归 `?test=1` **199 条断言全绿**；浏览器冒烟覆盖排盘标题（普通/同性双胞胎/龙凤胎）、
档案列表/搜索/删除/覆盖弹窗、AI 预览、降级链、开关持久化、storage 结构完整性、字节一致性，
未发现产品级缺陷。可进入发布流程。

---

## 二、验收环境与方法

| 项 | 内容 |
|----|------|
| 目标代码 | `/Users/feng/.clacky/ext/local/bazi-paipan/`（standalone-split.html + 6 模块 + standalone.html/index.html 内联版） |
| 版本注释 | 三文件均为 `<!-- 八字排盘 · 从真版 v0.19.0 | 2026-08-09 -->` |
| 运行方式 | 真实 Chrome，`file://` 打开 standalone.html（正常页 + `?test=1` 回归页） |
| 数据准备 | 首次测试前 `localStorage.clear()`，保证全新状态验证 AC1 |
| 验证手段 | 浏览器 UI 操作 + DOM/JS 断言 + localStorage 直读 + 脚本字节比对 + git diff 核对 |

---

## 三、AC 逐条核对表

| AC | 验收条件 | 结果 | 实测证据 |
|----|---------|------|----------|
| AC1 | 全新打开（无 localStorage）隐私默认开启 | ✅ | clear 后 store=null，`getPrivacyMode()=true`，两按钮显示「🔒 隐私」+ privacy-on 高亮 |
| AC2 | 切换后刷新状态保持 | ✅ | 切关闭后 store='0'、按钮「🔓 隐私」；`location.reload()` 后仍 '0'、🔓 不变 |
| AC3 | 开启时列表显示 艺名/小名/匿名，无真名 | ✅ | 18 行档案逐一检查：清风（艺名）、六一/子旭/希希…（小名）、邦顺（匿名）；modal 全文无任何档案 `name` 命中 |
| AC4 | 关闭时「小名 / 正名」与 v0.18.0 一致 | ✅ | 关闭后列表：「小伟 / 张伟」「六一 / 杨禹赫」「子旭 / 彭子旭」…格式逐字一致 |
| AC5 | 开启时搜索脱敏名；按艺名可搜到 | ✅ | `onArchiveSearch('清风')` 命中唯一档案「清风♂1990年」（去重后 1 行）；匹配字段含 nickname/yiming/name 三元 |
| AC6 | 普通排盘标题：开=脱敏名，关=真名 | ✅ | 开：标题「清风」（页面无「张伟」）；关：标题「小伟 / 张伟」（v0.18.0 格式） |
| AC7 | 同性双胞胎排盘标题脱敏 | ✅ | inTwin='1' 排盘，person-info 显示「清风」，页面无真名 |
| AC7b | 龙凤胎顶部 person-info 脱敏、不出现老大/老二真名、卡片标签保留 | ✅ | inTwin='2' 排盘，顶部「清风」；「老大/老二」标签存在；页面无真名 |
| AC8 | 删除/覆盖确认弹窗显示脱敏名 | ✅ | 覆盖：「「清风」已存在，覆盖更新？」；删除：「确定删除「清风」的档案？…」（均拦截 confirm 捕获原文，非真名） |
| AC9 | AI 录入解析预览不显示真名 | ✅ | 预览文本「姓名：已隐藏 性别：男 1985年3月8日 8:00」；真名仅回填 inName 输入框（不脱敏，符合非目标） |
| AC10 | 主表单/编辑弹窗可填写保存艺名；localStorage 含 yiming | ✅ | 主表单 inYiming='清风' 保存 → `bz_archives_v2` 张伟档案含 `yiming:'清风'`；编辑弹窗改 '清风2' 保存 → 字段更新为 '清风2'（用档案 id 精确定位验证） |
| AC11 | 旧档案（无 yiming）正常打开/编辑/保存不报错，按降级链显示 | ✅ | 预置档案（无 yiming 字段）打开编辑弹窗回填空、保存成功无报错；开启时按 小名→匿名 降级显示 |
| AC12 | 开关全局生效：档案面板与排盘标题同步 | ✅ | togglePrivacy 一次点击：两处按钮文本/高亮同步、档案面板立即重渲染、当前排盘标题立即重排 |
| AC13 | 16 孩预置档案开启时全部不出现真名 | ✅ | modal 全文与 18 个档案 `name` 逐一比对，泄漏=无 |

### 补充：降级链单元级验证（PRD 8.1 边界）

| 输入 | 结果 | 预期 |
|------|------|------|
| 开-有艺名 `{name:'张伟',nickname:'小伟',yiming:'清风'}` | 清风 | ✅ |
| 开-艺名纯空格 `yiming:'   '` | 小伟 | ✅（trim 后降级） |
| 开-无艺名有小名 `yiming:undefined` | 六一 | ✅（旧档案兼容） |
| 开-全无 | 匿名 | ✅ |
| 开-对象无字段/空对象 | 匿名 | ✅ |
| 开-null | ''（不报错） | ✅ |
| 关-有小名 | 小伟 / 张伟 | ✅（v0.18.0 逐字一致） |
| 关-无小名 | 邦顺 | ✅ |
| 关-有艺名仍显示小名/正名 | 雷子 / 李雷 | ✅（关闭时忽略艺名，维持现状） |

---

## 四、回归结果

| 项 | 结果 |
|----|------|
| 内置回归 `?test=1` | ✅ **199 条断言全绿**（十神/纳音/十二长生/干支/大运/流年/宫位等全部分组无 ❌） |
| 内联块一致性 | ✅ standalone.html 6 个 `<script>` 块与 6 模块文件逐字节一致（strip 首尾后） |
| 字节一致性 | ✅ `standalone.html == index.html`（均 6555 行，diff -q 通过） |
| HTML 关键 token | ✅ inYiming / editYiming / btnPrivacy / btnPrivacy2 / privacy-on / 已隐藏 / bz_privacy_mode / getDisplayName 齐备 |
| git 改动范围 | ✅ 仅 7 文件：archive/constants/main/render/standalone-split/standalone/index；**algorithm.js、gongwei.js 零改动** |
| 隐私关闭回归 | ✅ 显示格式、排盘标题、档案列表均与 v0.18.0 行为一致（AC4/AC6 关闭分支验证） |

---

## 五、发现问题清单

### 严重问题
- **无。**

### 一般问题 / 改进建议（不阻塞发布）

| # | 级别 | 描述 | 建议 |
|---|------|------|------|
| 1 | 建议 | 内置回归 `?test=1` 仍为 199 条原断言集，**未新增隐私断言**（页面无任何 yiming/艺名/已隐藏 相关断言） | 隐私逻辑目前靠人工冒烟覆盖，建议下版本在回归集中补 AC1/AC3/AC6 对应断言（getDisplayName 降级链、开关默认值、隐私关闭格式），防止后续回归漏检 |

### 测试过程说明（非缺陷）
- 冒烟测试中创建的测试档案（张伟/李雷等）与临时 yiming 已在测试后清理，不影响最终代码状态。
- 档案列表按 updatedAt 排序导致数组索引在编辑后变化，属 v0.18.0 既有行为，与隐私功能无关。

---

## 六、关键实现点核对（代码级）

| 位置 | 内容 | 核对 |
|------|------|------|
| constants.js L819/L857 | `PRIVACY_KEY='bz_privacy_mode'` + 导出 | ✅ |
| archive.js L203-232 | getPrivacyMode（`!== '0'` 默认开）/ setPrivacyMode / getDisplayName（降级链）/ togglePrivacy | ✅ |
| archive.js getFormData/setFormData/getEditFormData/openEditPanel/closeEditPanel | yiming 读写 + changed 检测 | ✅ |
| archive.js L342/371/570/691/707 | 覆盖/删除/保存冲突/恢复/彻底删除弹窗全部走 getDisplayName | ✅（超出 PRD 范围，回收站也脱敏） |
| archive.js L670/783/839 | renderArchiveModal / renderTrash / filterArchives 显示名 + 搜索含 yiming | ✅ |
| render.js L1266/L1318/1323/1329/1337 | doPaipan 构造 displayName，普通/同性/龙凤三分支附加 | ✅ |
| render.js L549/L1110/L1219 | 三处排盘标题 `data.displayName \|\| data.name`（龙凤胎用 d1） | ✅ |
| render.js L1533 | 档案展开渲染 `ARCHIVE.getDisplayName(arch)` | ✅ |
| main.js L490 | AI 预览隐私开启「姓名：已隐藏」 | ✅ |
| standalone-split.html | inYiming L587 / btnPrivacy L610 / btnPrivacy2 L649 / editYiming L673 / privacy-on CSS L49 / 初始化同步 L792 | ✅ |
| 数据层 | `bz_archives_v2` 键不变、yiming 可选、`data.name` 保持真名、输入框不脱敏 | ✅ |

---

*验收人：测试师 worker_54e70e2e | 结论：✅ 通过*
