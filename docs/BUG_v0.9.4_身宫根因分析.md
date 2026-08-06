# 身宫Bug根因分析 — 妍语（#16）

**日期**: 2026-07-24  
**版本**: v0.9.3 → v0.9.4  
**分析者**: 编程师（worker_4c2399e9）

---

## 一、问题概述

| 项目 | 值 |
|------|-----|
| 案例 | 妍语（#16） |
| 出生 | 2020-01-20 00:00 |
| 八字 | 己亥 丁丑 壬戌 庚子 |
| 性别 | 女 |
| 当前身宫 | **丙寅** ❌ |
| 参考身宫 | **戊寅** ✓（成熟排盘软件） |

其他15孩身宫全部正确，唯独妍语天干偏差（丙→戊），地支正确（寅）。

---

## 二、数据链溯源

### 2.1 调用链

```
paipan() → shenGong(yueZhi, shiZhi, nianGan)
         → mingGong(yueZhi, shiZhi, nianGan)
```

```
effYear = birth < lc2Date ? y - 1 : y  // line 1672
nian = yearPillar(effYear)              // line 1673
shen = shenGong(yue.zhi, shi.zhi, nian.gan)  // line 1691
ming = mingGong(yue.zhi, shi.zhi, nian.gan)  // line 1688
```

### 2.2 妍语的关键数据

| 变量 | 值 | 说明 |
|------|-----|------|
| y | 2020 | 公历出生年 |
| lc2Date | 2020-02-04 | 立春 |
| effYear | 2019 | birth(01-20) < lc2Date(02-04) |
| nian.gan | **己** | yearPillar(2019) → 己亥 |
| yue.zhi | 丑 | 月柱地支 |
| shi.zhi | 子 | 时柱地支 |

### 2.3 当前代码的身宫计算

```
dzNum(丑) = ((1 + 10) % 12) + 1 = 12  // 丑的序号
DZ.indexOf(子) = 0                      // 子在数组中的位置

n = (12 + 0 + 1) % 12 = 1              // 地支序号
→ 地支 = 寅 ✓                          // 正确

WU_HU_DUN["己"] = "丙"                 // 五虎遁起寅
gan = TG[(丙_idx + 0) % 10] = 丙       // 天干 = 丙
→ 身宫 = 丙寅 ❌
```

### 2.4 参考数据的正确路径

```
WU_HU_DUN["庚"] = "戊"                 // 年干若为庚
gan = TG[(戊_idx + 0) % 10] = 戊       // 天干 = 戊
→ 身宫 = 戊寅 ✓
```

---

## 三、根因确认

### 核心矛盾

**年干来源不同**。当前代码用节气年界调整后的 `nian.gan`（己），参考软件用公历年份直接映射的年干（庚）。

```
公历 2020 → 干支 庚子 → 年干 庚 → WU_HU_DUN[庚] = 戊 → 身宫 戊寅 ✓
节气 2019 → 干支 己亥 → 年干 己 → WU_HU_DUN[己] = 丙 → 身宫 丙寅 ❌
```

### 为什么只有妍语受影响？

妍语是16孩中**唯一**出生在立春前（2020-01-20 < 2020-02-04）的案例。对她的八字排盘而言：

- `effYear = 2019`（节气年），`nian.gan = "己"`
- `y = 2020`（公历年），`yearPillar(y).gan = "庚"`

对其他15孩：出生在立春后，`effYear == y == 实际公历年份`，两个年干相同，无差异。

### 本质

命宫和身宫的五虎遁应基于**公历出生年的太岁干支**（即 `yearPillar(y).gan`），而年柱的五虎遁用于月柱推算时基于节气年界调整后的年干（即 `nian.gan`）。在立春前出生时两者不同，当前代码混淆了这两个年干。

---

## 四、修复方案

### 代码修改（standalone_v0.9.3.html → v0.9.4）

在 `paipan()` 函数中新增变量 `gongNianGan`：命宫/身宫专用的年干，取公历出生年直接映射的干支天干。

```javascript
// 修改前（line 1688-1691）
const ming = mingGong(yue.zhi, shi.zhi, nian.gan);
const shen = shenGong(yue.zhi, shi.zhi, nian.gan);

// 修改后
const gongNianGan = yearPillar(y).gan;  // 命宫/身宫用公历年的年干
const ming = mingGong(yue.zhi, shi.zhi, gongNianGan);
const shen = shenGong(yue.zhi, shi.zhi, gongNianGan);
```

### 影响面分析

| 群体 | effYear vs y | 影响 |
|------|:---:|------|
| 立春后出生（15孩） | effYear == y | **无影响** — gongNianGan == nian.gan |
| 立春前出生（妍语） | effYear ≠ y | **修复** — 身宫 丙寅→戊寅 ✓ |

命宫同理受影响，妍语的命宫也将从「戊辰」修正为正确值。

---

## 五、修复验证

| 项目 | 修复前 | 修复后 | 参考 |
|------|--------|--------|------|
| 妍语身宫 | 丙寅 | **戊寅** ✓ | 戊寅 |
| 其他15孩身宫 | 正确 | **不变** ✓ | 各自正确值 |

---

## 六、附录：关键常量

```javascript
// 五虎遁：甲己之年丙作首，乙庚之年戊为头，丙辛必定寻庚起，
//         丁壬壬位顺行流，若问戊癸何方发，甲寅之上好追求。
const WU_HU_DUN = {
  '甲':'丙','己':'丙',  // 甲己 → 丙寅起
  '乙':'戊','庚':'戊',  // 乙庚 → 戊寅起
  '丙':'庚','辛':'庚',  // 丙辛 → 庚寅起
  '丁':'壬','壬':'壬',  // 丁壬 → 壬寅起
  '戊':'甲','癸':'甲'   // 戊癸 → 甲寅起
};
```

```javascript
// 干支推算：1984=甲子年，yearPillar(y) 计算公历年对应的干支
function yearPillar(y) {
  const base = 4; // 1984 = 甲子年
  let idx = (y - base) % 60;
  if (idx < 0) idx += 60;
  return { gan: TG[idx % 10], zhi: DZ[idx % 12], idx };
}
// 2020 → (2020-4)%60 = 36 → gan=TG[6]="庚", zhi=DZ[0]="子" → 庚子 ✓
```
