# TEST v0.64.0 — 十神藏气排版回归竖形，组对应名并入右侧

## 需求（邦顺原话）

> 点击十神按钮，藏干的排版改回原来的竖形。比如 戌 / 戊 / 辛 / 丁。十神的对应内容统一放到右边。比如 戊 才 外块。
> 勾选多个十神组的话：波动 / 戊 才 外块 / 机会；规则 / 辛 官 流程 / 约束。

拆成三条硬指标：

1. 勾选十神组后，藏干必须**竖排**（一个藏干一行），不被横排化成一行等宽 span
2. 每层的十神简称紧跟藏干，组对应名在该层**右侧**
3. 勾多个组时：同一层的组名在右侧**竖排堆叠**（顺序=勾选顺序），原来「每组一条独立对应名行」取消

## 修前形态（v0.63.2）

| 位置 | 形态 |
|---|---|
| 藏干单元格 | `戊才 辛官 丁伤` 横排等宽 span（`sshCgSpans`） |
| 组对应名 | 每组单独一条 `tr.ssh-cg-row`（`sshCgRow` / `sshCgRowSy`），勾几组就多几行 |

组一多，表格行数膨胀，藏干分不清层级。

## 修后结构

```html
<td>
  <span class="ssh-cg-v">                 <!-- 竖向容器 -->
    <span class="ssh-cg-l">               <!-- 一层：藏干 + 十神 + 该层组名 -->
      <span class="ssh-cg-g">戊</span>
      <span class="ssh-cg-t">才</span>
      <span class="ssh-cg-ns">            <!-- 组名竖排堆叠 -->
        <span class="ssh-cg-n">支前员</span>
        <span class="ssh-cg-n">外快</span>
      </span>
    </span>
    …辛 官 / 丁 伤…
  </span>
</td>
```

四柱藏气行（`ln2`）与三垣藏气行（`sy-cg`）六列全部走 `sshCgVert`；大运/流年藏气同步同样走它。

## 断言（1484 条，仅 2 条已知基线失败）

| 断言 | 内容 |
|---|---|
| T07 | 反证：不存在独立藏干对应名行 `tr.ssh-cg-row` |
| T10c | `.ssh-cg-l` 数量 = 非空藏干层数 |
| T10d | 每层首列 = 藏干字 |
| T10e | 每层次列 = 十神简称 |
| T11 | 组对应名数 = 非空层数 × 组数 |
| T12 / T12b / T12c | 单组/双组每层对应名条数、顺序=勾选顺序 |
| T21 / T22 | 三垣区同样成立 |
| X05 / X06 / X07 | 几何：藏干列、十神列、对应名列三者逐层左缘各自一致，且自左向右排列 |

2 条已知失败与本次无关：`RECFL 前置: 开记录前容器无超宽内容`（1300px 视口 scrollWidth=1513）、`v0.43 T02: 标题带档案名`。

## CDP 实测（独立 Chrome 9234 + 临时 profile）

DOM（`#output tr[data-row-type="ln2"]` 第 2 格，戌）：

- 单组（军队）：`戊|才|支前员` `辛|官|军务` `丁|伤|宣传员`
- 双组（军队+社会）：`戊|才|支前员|外快` `辛|官|军务|领导` `丁|伤|宣传员|作品`

几何：td 106×84，`.ssh-cg-v` 66×72，`.ssh-cg-l` 66×24 → 3 层竖排成立，层与层左缘对齐。

真实 UI 路径：`SSH.toggleGroup('社会', true)`（等价于点面板勾选）→ localStorage 写入两组 → `refresh()` 重渲 output，DOM 立即出现 `外快/领导/作品`。

## 门禁

- `node --check render.js` / `main.js` 通过
- `scripts/sync-module-inline.py --from-external render/main --apply` 内联回推，五核心模块三端一致
- `index.html` ≡ `standalone.html`，md5 `3b241e6e032949924390857421710848`
- `scripts/check-release.sh` 6/6（含节气真值 24 点）
- 截图：`TEST_v0.64.0_UI实测_双组藏气竖排.png`
