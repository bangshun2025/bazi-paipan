# ADR-001: 排盘表新增「纳运」行

- **日期**: 2026-08-03
- **状态**: 提议中
- **决策者**: 架构师 (worker_deb16596)
- **版本**: v0.11.1 → v0.12.0

---

## 一、背景与需求

在八字排盘表（`standalone.html` v0.11.1, 4694 行）中新增「纳运」行，展示每柱纳音五行在月令地支的十二长生状态。

现有排盘表已有「纳音」行（显示纳音名字，如「海中金」）和「星运」行（日主天干在各地支的十二长生），但缺少「纳音五行自身的十二长生」这一维度。

---

## 二、现状分析

### 2.1 纳音数据结构

```js
// L1295-1307
const NAYIN = {};
['甲子乙丑海中金','丙寅丁卯炉中火', ...]
  .forEach(s=>{for(let i=0;i<4;i+=2)NAYIN[s.substr(i,2)]=s.substr(4);});
```

- 键：干支组合（如 `'甲子'`）
- 值：纳音名（如 `'海中金'`）
- 纳音名最后一字即为五行：金/木/水/火/土

### 2.2 现有十二长生体系

```js
// L1324-1336
const CS12_MAP = {
  '甲':['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'],
  '乙':['午','巳','辰','卯','寅','丑','子','亥','戌','酉','申','未'],
  // ... 每个天干对应长生→养的12地支序列
};
const CS12_N = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
```

`changSheng(gan, zhi)` 函数（L1540-1545）通过 CS12_MAP 查 gan 对应的地支数组，找 zhi 的索引返回对应长生名。对于纳音五行，五行无阴阳之分，标准做法取阳干代表：金→庚、木→甲、水→壬、火→丙、土→戊。

### 2.3 pillar() 函数

现有两个副本（L2670-2685 和 L3177-3191），结构一致，返回：

```js
{ gan, zhi, wg, wz, rs, ny, xy, zz, kw, ly, sh }
```

目前 pillar() 不接收月令地支参数。

### 2.4 渲染行结构

**四柱区**（`renderChart()` L2667+，`buildPillarRows()` L2587+）：

行序：主星 → 天干 → 地支 → 藏气(合并) → **纳音** → 星运 → 自坐 → 空亡 → 神煞

**三垣区**（`buildPillarRows()` sanyuan 部分）：

行序与四柱一致，纳音行在藏气行之后。

**7 列扩展**（龙凤胎卡片）：四柱 + 大运 + 流年共 7 列，三垣同样扩展。

### 2.5 精简模式

```css
/* L204-207 */
.chart.simple tr[data-row-type~="nayin"],
.chart.simple tr[data-row-type~="kongwang"],
.chart.simple tr[data-row-type~="shensha"] { display:none; }
```

通过 `data-row-type` 属性的空格分隔多值匹配，实现隐藏。

---

## 三、技术决策

### 决策 1：纳音五行 → 十二长生的映射方式

**方案**：复用现有 CS12_MAP，五行取阳干代表。

| 五行 | 阳干 | CS12_MAP 键 |
|------|------|-------------|
| 金   | 庚   | `'庚'`      |
| 木   | 甲   | `'甲'`      |
| 水   | 壬   | `'壬'`      |
| 火   | 丙   | `'丙'`      |
| 土   | 戊   | `'戊'`      |

**理由**：
1. 十二长生的顺逆由天干阴阳决定，五行本身无阴阳，取阳干（顺排）是命理界通行做法
2. 完全复用现有 CS12_MAP，零新增数据结构
3. CS12_MAP 已经过八字回归测试验证，可靠性高

### 决策 2：纳运计算函数设计

新增 `nayunChangSheng(nayinName, yueZhi)` 函数：

```js
const NAYIN_WX_YANG = { '金':'庚','木':'甲','水':'壬','火':'丙','土':'戊' };

function nayunChangSheng(nayinName, yueZhi) {
  if (!nayinName || !yueZhi) return '';
  const wx = nayinName.slice(-1);           // 取最后一字 → 五行
  const yangGan = NAYIN_WX_YANG[wx];         // 五行→阳干
  if (!yangGan) return '';
  const map = CS12_MAP[yangGan];
  const i = map.indexOf(yueZhi);
  return i >= 0 ? CS12_N[i] : '?';
}
```

**理由**：
1. 与现有 `changSheng(gan, zhi)` 保持一致的接口风格（查表→取索引→返回）
2. 不含 `?` 的合法输入必然返回有效值（12 地支全覆盖）
3. 空值保护：纳音名或月令地支为空时返回空串

### 决策 3：月令地支的传递方案

**方案 A（推荐）**：在 `pillar()` 中新增可选参数 `yueZhi`，在 pillar 内部计算 `nayun`。

```js
function pillar(gan, zhi, type, yueZhi) {
  return {
    // ... 现有字段
    ny: NAYIN[gan + zhi] || '',
    nayun: nayunChangSheng(NAYIN[gan + zhi] || '', yueZhi),
    // ...
  };
}
```

**方案 B**：pillar() 不变，在外部对每个 pillar 结果后补 nayun 字段。

**选择方案 A**。理由：
1. 最小侵入：只改 pillar 签名（加一个可选参数），调用处传 `yue.zhi`
2. 数据内聚：nayun 与其他 pillar 字段在一起，后续引用无需额外处理
3. 向后兼容：yueZhi 为可选参数，不影响现有 `buildPillarRows` 中的 pillar 调用（如大运/流年的 pillar 可不传月令）

注意：两个 pillar() 副本都需要同步修改（L2670 和 L3177）。

### 决策 4：纳运行的插入位置

**紧接纳音行之后**。四柱区行序变为：

主星 → 天干 → 地支 → 藏气(合并) → 纳音 → **纳运** → 星运 → 自坐 → 空亡 → 神煞

**理由**：
1. 语义关联：纳运是纳音的衍生信息，紧随其后符合认知
2. 视觉分组：纳音+纳运构成「纳音信息组」，与下方的星运/自坐组形成层次

### 决策 5：CSS 样式与精简模式

**样式**：纳运行复用 `.rn` 样式（与纳音行一致），额外添加独立的 `data-row-type`：

```html
<tr class="rn" data-row-type="nayun"> ... </tr>
```

**精简模式兼容**：修改 CSS 选择器，新增 nayun：

```css
.chart.simple tr[data-row-type~="nayin"],
.chart.simple tr[data-row-type~="nayun"],
.chart.simple tr[data-row-type~="kongwang"],
.chart.simple tr[data-row-type~="shensha"] { display:none; }
```

**理由**：
1. 纳运行的视觉权重与纳音一致（辅助信息），复用 .rn 样式即可
2. 独立 data-row-type 允许未来独立控制纳运的显隐
3. 精简模式下纳运应与纳音一同隐藏

### 决策 6：三垣区的纳运行

三垣（胎元/命宫/身宫）的纳运同样以月令地支为基准。

```html
<tr class="rn" data-row-type="nayun">
  <td class="rl">纳运</td><td></td>
  <td>pTai.nayun</td><td>pMing.nayun</td><td>pShen.nayun</td>
  <td class="sep"></td><td class="col-ln"></td>
</tr>
```

三垣区行序：... → 纳音 → **纳运** → 星运 → 自坐 → 空亡 → 神煞

### 决策 7：大运/流年列的纳运

大运和流年的纳运值也基于月令地支计算。在 7 列布局中，大运列和流年列都填入各自的纳运值。

```js
// pillar 调用处传入 yueZhi
const pDy = pillar(curDy.gan, curDy.zhi, 'dayun', yue.zhi);
const pLn = pillar(curLnGz[0], curLnGz[1], 'liunian', yue.zhi);
```

---

## 四、修改清单

### 4.1 数据层

| 位置 | 修改内容 |
|------|----------|
| L1324 附近 | 新增 `NAYIN_WX_YANG` 映射常量 |
| L1545 附近 | 新增 `nayunChangSheng()` 函数 |
| L2670-2685 | pillar() #1：新增 yueZhi 参数 + nayun 字段 |
| L3177-3191 | pillar() #2：同上 |

### 4.2 渲染层（renderChart / buildPillarRows）

| 位置 | 修改内容 |
|------|----------|
| renderChart() pillar 调用处 | 传入 `yue.zhi` 作为第 4 参数 |
| buildPillarRows() main | 纳音行后追加纳运行 |
| buildPillarRows() sanyuan | 纳音行后追加纳运行 |
| 龙凤胎卡片行索引 | L3200+ 所有硬编码行索引需要重新计算 |

### 4.3 CSS

| 位置 | 修改内容 |
|------|----------|
| L204-207 | 精简模式选择器新增 `[data-row-type~="nayun"]` |

### 4.4 龙凤胎行索引影响分析

当前 `renderChart()` 单人排盘中四柱行索引（L2729+）：

| 索引 | 行 | data-row-type |
|------|----|---------------|
| 0 | 主星 | dy1 |
| 1 | 天干 | ln1 |
| 2 | 地支 | dy2 |
| 3 | 藏气 | ln2 |
| 4 | 纳音 | nayin dy3 |
| 5 | 星运 | xingyun ln3 |
| 6 | 自坐 | zizuo dy4 |
| 7 | 空亡 | kongwang ln4 |
| 8 | 神煞 | shensha dy5 |

插入纳运行后：

| 索引 | 行 | data-row-type |
|------|----|---------------|
| 0 | 主星 | dy1 |
| 1 | 天干 | ln1 |
| 2 | 地支 | dy2 |
| 3 | 藏气 | ln2 |
| 4 | 纳音 | nayin dy3 |
| **5** | **纳运** | **nayun ln3** |
| 6 | 星运 | xingyun dy4 |
| 7 | 自坐 | zizuo ln4 |
| 8 | 空亡 | kongwang dy5 |
| 9 | 神煞 | shensha ln5 |

所有后续 data-row-type 的 dy/ln 编号需要顺延。

`buildPillarRows()` 返回的 `main` 数组长度从 9 变为 10。

龙凤胎卡片（L3200+）中：
- 现有纳音在 `rows.main[6]` → 变为 `rows.main[7]`（插入后纳音位置不变，但索引+1因为前面插入了纳运）

等等，需要仔细分析 `buildPillarRows` 和 `renderChart` 的关系。

`buildPillarRows` 中四柱区 rows.main 的结构：
- [0] 主星, [1] 天干, [2] 地支, [3] 本气, [4] 中气, [5] 余气, [6] 纳音, [7] 星运, [8] 自坐, [9] 空亡, [10] 神煞

在 renderChart 单人排盘中，buildPillarRows 的结果被部分覆盖：
- mainRows[0-3] 被手动重写（L2729-2742）
- mainRows[4-5] 被 splice 删除（L2743: 删中气余气，合并藏气）
- mainRows[4] 变成纳音（L2745）
- mainRows[5] 星运, [6] 自坐, [7] 空亡, [8] 神煞

所以在 renderChart 单人排盘中，splice 后实际结构为：
- [0] 主星, [1] 天干, [2] 地支, [3] 藏气(合并), [4] 纳音, [5] 星运, [6] 自坐, [7] 空亡, [8] 神煞

在 `buildPillarRows` 中插入纳运到纳音行后（index 7），则 buildPillarRows 返回：
- [0-6] 不变, [7] 纳运, [8] 星运, [9] 自坐, [10] 空亡, [11] 神煞

在 renderChart 中 splice 后：
- [0-3] 不变, [4] 纳音(原[6]), [5] 纳运(原[7]), [6] 星运(原[8]), [7] 自坐(原[9]), [8] 空亡(原[10]), [9] 神煞(原[11])

需要更新 renderChart 中的硬编码行赋值：
- L2745: `mainRows[4]` = 纳音 → 不变
- L2747: `mainRows[5]` = 星运 → 需插入纳运行
- L2748: `mainRows[6]` = 自坐 → `mainRows[6]` + 1 → `mainRows[7]`
- 等等

龙凤胎卡片中（L3200+），`buildPillarRows` 返回的行被全部覆盖：
- L3234+: rows.main[6] = 纳音 → 不变
- L3236+: rows.main[7] = 星运 → 需插入纳运，后续全部 +1

实际上，更好的方案是：在两个使用点（renderChart 和 renderTwinCard）都插入纳运行的生成代码。

---

## 五、风险与约束

1. **双胞胎逻辑不变**：纳运对双胞胎老大老二是相同值（都基于月令），无需特殊处理
2. **龙凤胎卡片行索引**：现有硬编码索引较多（~20 处），插入新行需逐处检查，建议使用 `data-row-type` 属性选择器而非索引定位，降低未来维护成本
3. **能力排盘模式**：`toggleYuanNengLi()` 中是否需要处理纳运行？——不需要，纳运行使用 `.rn` class，与纳音行一致，元能力模式不操作 `.rn` 行
4. **回归测试**：变更涉及所有排盘模式（单人/双胞胎/龙凤胎/能力排盘），需完整回归测试

---

## 六、待确认事项

1. 纳运在大运/流年列是否显示？—— 是，均基于月令地支
2. 三垣的纳运基准地支是否也用月令？—— 是，统一用月令

---

## 附录：关键代码位置索引

| 代码段 | 行号 | 说明 |
|--------|------|------|
| NAYIN 字典 | 1295-1307 | 六十甲子纳音 |
| CS12_MAP | 1324-1335 | 十天干十二长生地支序列表 |
| CS12_N | 1336 | 十二长生名称数组 |
| changSheng() | 1540-1545 | 天干十二长生计算 |
| pillar() #1 | 2670-2685 | renderChart 用 |
| buildPillarRows() | 2587-2660 | 生成四柱+三垣行 |
| pillar() #2 | 3177-3191 | renderTwinCard 用 |
| toggleSimple() | 2048-2054 | 精简模式切换 |
| 精简模式 CSS | 204-207 | .chart.simple 隐藏规则 |
| .rn CSS | 201 | 纳音行样式 |
| renderChart 主星行 | 2729 | data-row-type 索引 |
| renderChart 龙凤胎 | 3200+ | 硬编码行覆盖 |
