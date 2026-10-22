# TEST v0.63.2 — 点「十神」弹出宫位界面

## 需求（邦顺报障）

点击工具栏「十神」按钮，弹出的面板内容是宫位界面（脑区宫位/年龄宫位/…），十神组「军队/社会」看不到。

## 复现（独立 Chrome + CDP，干净 profile）

| 步骤 | openGz | openSsh | 面板文本 |
|---|---|---|---|
| 初始 | false | false | — |
| 点「宫位」 | true | false | 脑区宫位/年龄宫位/… |
| 点「十神」 | false | **true** | **脑区宫位/年龄宫位/…（错）** |

面板开合逻辑本身是对的（宫位关了、十神开了），但十神 popover 里的勾选网格被填成了宫位组。修前 ssh 面板高 379px，修后 94px（只有军队/社会两项）。

## 病根

`gongwei.js` 的 `rebuildGzCbGrid()` 扫的是**全局** `.gz-cb-grid`：

```js
var grids = document.querySelectorAll('.gz-cb-grid');
```

而 `shishen.js` 的十神 popover 复用了同一个类名 `gz-cb-grid`（为了共用网格 CSS）。宫位侧每次重建网格（初始化、勾选、恢复默认），都会把十神 popover 里的网格 innerHTML 覆盖成「XX宫位」。

v0.58.0 / v0.60.2 修的是「面板互斥」和「popover 类名/id 冲突」，两处都只动了 `.gz-popover` / `.ssh-popover` 这一层容器，没有动里层网格类名，所以病根一直在。

## 修复

1. `gongwei.js`：`querySelectorAll('.gz-popover .gz-cb-grid')` —— 只重建宫位 popover 内的网格
2. `shishen.js`：十神网格加自有类 `class="gz-cb-grid ssh-cb-grid"`（保留 `gz-cb-grid` 共用样式），`rebuildPanels()` 选择器改 `.ssh-popover .ssh-cb-grid`
3. 双向隔离：以后无论哪一侧再改重建逻辑，都不会串台

## 断言（+3）

| 标签 | 内容 | 结果 |
|---|---|---|
| SSH T24 | 十神网格自有类名 ssh-cb-grid | ✅ Y |
| SSH T25 | 宫位重建不覆盖十神网格（造 GZ/SSH 双网格 → 调 rebuildGzCbGrid → ssh 网格仍 SSH-OWN） | ✅ SSH-OWN |
| SSH T26 | 宫位网格照常重建 | ✅ Y |

## 验证证据

- `?test=1`：**1469 条断言全过**（本版 +3；线上基线 1476 含 7 条依赖真实档案数据的用例）
- `check-release.sh`：六道门禁全过（含节气 24 边界真值）
- index.html ≡ standalone.html：md5 `d0a22a5cae12946d3cb45f1d697ec1fb`（1549507 B）
- standalone-split.html：md5 `713043de7f10a2007084f35150c040d8`（118083 B）
- 真实 UI 实测（CDP，单页签）：

| 步骤 | openGz | openSsh | ssh 内容 |
|---|---|---|---|
| 点宫位 | true | false | — |
| 点十神 | false | true | 军队/社会 + 全选/清空/⚙十神设置 |
| 再点十神 | false | false | 关闭 |
| 十神→宫位 | true | false | 宫位互斥正常 |

- 运行时异常 0 条
