/* 八字排盘 v0.16.0 — gongwei.js */
(function() {

  // ===== 别名：来自 constants.js =====
  var LOC_DATA = CONST.LOC_DATA;
  var TG = CONST.TG;
  var DZ = CONST.DZ;
  var WU_XING = CONST.WU_XING;
  var WX_CSS = CONST.WX_CSS;
  var GONGWEI_MAP = CONST.GONGWEI_MAP;
  var GW_INDEX = CONST.GW_INDEX;
  var GONGWEI_COLORS = CONST.GONGWEI_COLORS;
  var GONGWEI_COLOR_KEYS = CONST.GONGWEI_COLOR_KEYS;
  var LUNAR_INFO = CONST.LUNAR_INFO;
  var LUNAR_NEW_YEAR = CONST.LUNAR_NEW_YEAR;
  var LUNAR_MONTH_OPTIONS = CONST.LUNAR_MONTH_OPTIONS;
  var NAYIN = CONST.NAYIN;
  var CANG_GAN = CONST.CANG_GAN;
  var ZHI_TWIN_MAIN = CONST.ZHI_TWIN_MAIN;
  var ZHI_TWIN_CANG = CONST.ZHI_TWIN_CANG;
  var twinPillars = CONST.twinPillars;
  var CS12_MAP = CONST.CS12_MAP;
  var CS12_N = CONST.CS12_N;
  var NAYIN_WX_YANG = CONST.NAYIN_WX_YANG;
  var KONG_WANG = CONST.KONG_WANG;
  var SOLAR_TERMS = CONST.SOLAR_TERMS;
  var S_TERM_NAME = CONST.S_TERM_NAME;
  var MONTH_TERM = CONST.MONTH_TERM;
  var WU_HU_DUN = CONST.WU_HU_DUN;
  var WU_SHU_DUN = CONST.WU_SHU_DUN;
  var SHI_SHEN_SHORT = CONST.SHI_SHEN_SHORT;
  var ZHI_WX = CONST.ZHI_WX;
  var ZHI_MAIN = CONST.ZHI_MAIN;
  var ARCH_KEY = CONST.ARCH_KEY;
  var TRASH_KEY = CONST.TRASH_KEY;
  var ARCH_KEY_OLD = CONST.ARCH_KEY_OLD;
  var TRASH_KEY_OLD = CONST.TRASH_KEY_OLD;
  var ARCH_BACKUP_KEY = CONST.ARCH_BACKUP_KEY;

  // ===== 别名：来自 algorithm.js =====
  var monthDays = ALGO.monthDays;
  var normalizeDate = ALGO.normalizeDate;
  var lunarToSolar = ALGO.lunarToSolar;
  var toggleCalendar = ALGO.toggleCalendar;
  var updateSolarPreview = ALGO.updateSolarPreview;
  var getLng = ALGO.getLng;
  var dayOfYear = ALGO.dayOfYear;
  var equationOfTime = ALGO.equationOfTime;
  var trueSolarTime = ALGO.trueSolarTime;
  var getSolarTerm = ALGO.getSolarTerm;
  var yearPillar = ALGO.yearPillar;
  var monthPillar = ALGO.monthPillar;
  var dayPillar = ALGO.dayPillar;
  var hourPillar = ALGO.hourPillar;
  var shiShen = ALGO.shiShen;
  var zhiShiShen = ALGO.zhiShiShen;
  var wxClass = ALGO.wxClass;
  var changSheng = ALGO.changSheng;
  var nayunChangSheng = ALGO.nayunChangSheng;
  var cangGanAt = ALGO.cangGanAt;
  var cangGanText = ALGO.cangGanText;
  var jieCai = ALGO.jieCai;
  var cangGanLayers = ALGO.cangGanLayers;
  var fmtCGLayer = ALGO.fmtCGLayer;
  var kongWang = ALGO.kongWang;
  var shenSha = ALGO.shenSha;
  var taiYuan = ALGO.taiYuan;
  var dzNum = ALGO.dzNum;
  var numZhi = ALGO.numZhi;
  var mingGong = ALGO.mingGong;
  var shenGong = ALGO.shenGong;
  var qiYunDays = ALGO.qiYunDays;
  var computeDaYun = ALGO.computeDaYun;
  var liuNianJZ = ALGO.liuNianJZ;
  var REN_YUAN = ALGO.REN_YUAN;
  var renYuanSiLing = ALGO.renYuanSiLing;
  var paipan = ALGO.paipan;
  var fmtDate = ALGO.fmtDate;
  var pad = ALGO.pad;
  var buildShunLabel = ALGO.buildShunLabel;

// ===== v0.13.0 宫位自定义 — 数据层 =====
// 全局状态变量
let gongWeiGroups = [];
let gongWeiTrash = [];

// ===== localStorage 读写 =====
function loadGroups() {
  let raw = localStorage.getItem('bz_gongwei_groups');
  if (!raw) return initGongWeiGroups();
  try { let g = JSON.parse(raw); if (!Array.isArray(g) || g.length === 0) return initGongWeiGroups(); return g; }
  catch(e) { return initGongWeiGroups(); }
}
function loadTrash() { let raw = localStorage.getItem('bz_gongwei_trash'); return raw ? JSON.parse(raw) : []; }
function loadSelected() { let raw = localStorage.getItem('bz_gongwei_selected'); return raw ? JSON.parse(raw) : []; }
function persistGroups() { localStorage.setItem('bz_gongwei_groups', JSON.stringify(gongWeiGroups)); }
function persistTrash() { localStorage.setItem('bz_gongwei_trash', JSON.stringify(gongWeiTrash)); }
function persistSelected() { localStorage.setItem('bz_gongwei_selected', JSON.stringify(selectedGongWei)); }
function nowISO() { return new Date().toISOString(); }
function generateGwId() { return 'gw_' + Date.now().toString(36); }
function findGroupByName(name) {
  var n = name.replace(/宫位$/, '').toLowerCase();
  for (var i = 0; i < gongWeiGroups.length; i++) {
    if (gongWeiGroups[i].name.replace(/宫位$/, '').toLowerCase() === n) return gongWeiGroups[i];
  }
  return null;
}
function getGroupColor(name, isPreset) {
  if (isPreset && GONGWEI_COLORS[name]) return GONGWEI_COLORS[name];
  return '#8b7e6a';
}

// ===== 初始化（首次/数据损坏时） =====
function initGongWeiGroups() {
  var presetNames = Object.keys(GONGWEI_MAP);
  var now = nowISO();
  var groups = presetNames.map(function(name, i) {
    return {
      id: 'gw_preset_' + String(i + 1).padStart(2, '0'),
      name: name, labels: GONGWEI_MAP[name],
      isPreset: true, color: GONGWEI_COLORS[name] || '#8b7e6a',
      createdAt: now, updatedAt: now
    };
  });
  gongWeiGroups = groups; persistGroups(); persistTrash([]); persistSelected([]);
  return groups;
}

// ===== CRUD =====
function addGroup(name, labels) {
  if (!name || name.trim().length === 0) return { ok: false, error: '组名不能为空' };
  if (name.length > 6) return { ok: false, error: '组名不能超过6个字' };
  if (findGroupByName(name)) return { ok: false, error: '该名称已存在' };
  for (var i = 0; i < 7; i++) {
    if (labels[i] && labels[i].length > 12) return { ok: false, error: '标签不能超过12个字' };
  }
  var now = nowISO();
  var group = {
    id: generateGwId(), name: name.trim(),
    labels: labels.map(function(l) { return l.trim(); }),
    isPreset: false, color: '#8b7e6a',
    createdAt: now, updatedAt: now
  };
  gongWeiGroups.push(group); persistGroups();
  return { ok: true, group: group };
}

function updateGroup(id, newName, newLabels) {
  var idx = -1;
  for (var i = 0; i < gongWeiGroups.length; i++) { if (gongWeiGroups[i].id === id) { idx = i; break; } }
  if (idx === -1) return { ok: false, error: '宫位组不存在' };
  var group = gongWeiGroups[idx];
  if (!newName || newName.trim().length === 0) return { ok: false, error: '组名不能为空' };
  if (newName.length > 6) return { ok: false, error: '组名不能超过6个字' };
  var conflict = findGroupByName(newName);
  if (conflict && conflict.id !== id) return { ok: false, error: '该名称已存在' };
  for (var i = 0; i < 7; i++) {
    if (newLabels[i] && newLabels[i].length > 12) return { ok: false, error: '标签不能超过12个字' };
  }
  var oldName = group.name;
  group.name = newName.trim();
  group.labels = newLabels.map(function(l) { return l.trim(); });
  group.isPreset = false;
  group.color = getGroupColor(group.name, false);
  group.updatedAt = nowISO();
  if (oldName !== group.name) {
    var si = selectedGongWei.indexOf(oldName);
    if (si !== -1) selectedGongWei[si] = group.name;
  }
  persistGroups(); persistSelected();
  return { ok: true, group: group };
}

function deleteGroup(id) {
  var idx = -1;
  for (var i = 0; i < gongWeiGroups.length; i++) { if (gongWeiGroups[i].id === id) { idx = i; break; } }
  if (idx === -1) return { ok: false, error: '宫位组不存在' };
  var removed = gongWeiGroups.splice(idx, 1)[0];
  gongWeiTrash.push({ id: removed.id, group: removed, deletedAt: nowISO() });
  selectedGongWei = selectedGongWei.filter(function(n) { return n !== removed.name; });
  persistGroups(); persistTrash(); persistSelected();
  return { ok: true };
}

function restoreFromTrash(id) {
  var idx = -1;
  for (var i = 0; i < gongWeiTrash.length; i++) { if (gongWeiTrash[i].id === id) { idx = i; break; } }
  if (idx === -1) return { ok: false, error: '回收站中不存在' };
  var item = gongWeiTrash.splice(idx, 1)[0];
  if (findGroupByName(item.group.name)) {
    item.group.name = item.group.name + '(恢复)';
    item.group.updatedAt = nowISO();
  }
  gongWeiGroups.push(item.group);
  persistGroups(); persistTrash();
  return { ok: true, group: item.group };
}

function clearTrash() { gongWeiTrash = []; persistTrash(); return { ok: true }; }

function moveGroup(fromIdx, toIdx) {
  if (fromIdx < 0 || fromIdx >= gongWeiGroups.length || toIdx < 0 || toIdx >= gongWeiGroups.length || fromIdx === toIdx) return { ok: false };
  var item = gongWeiGroups.splice(fromIdx, 1)[0];
  gongWeiGroups.splice(toIdx, 0, item);
  persistGroups();
  return { ok: true };
}
function moveUp(idx) { if (idx <= 0) return { ok: false }; return moveGroup(idx, idx - 1); }
function moveDown(idx) { if (idx >= gongWeiGroups.length - 1) return { ok: false }; return moveGroup(idx, idx + 1); }

// ===== 选中状态管理 =====
function toggleSelect(name) {
  var idx = selectedGongWei.indexOf(name);
  if (idx === -1) selectedGongWei.push(name);
  else selectedGongWei.splice(idx, 1);
  persistSelected();
  return selectedGongWei;
}
function selectAll() { selectedGongWei = gongWeiGroups.map(function(g) { return g.name; }); persistSelected(); return selectedGongWei; }
function clearSelection() { selectedGongWei = []; persistSelected(); return selectedGongWei; }
function isSelected(name) { return selectedGongWei.indexOf(name) >= 0; }

// ===== 恢复默认 =====
function resetToDefaults() {
  var presetNames = Object.keys(GONGWEI_MAP);
  var now = nowISO();
  presetNames.forEach(function(name, i) {
    var presetId = 'gw_preset_' + String(i + 1).padStart(2, '0');
    var ti = -1;
    for (var j = 0; j < gongWeiTrash.length; j++) { if (gongWeiTrash[j].id === presetId) { ti = j; break; } }
    if (ti !== -1) {
      var item = gongWeiTrash.splice(ti, 1)[0];
      item.group.name = name; item.group.labels = GONGWEI_MAP[name].slice();
      item.group.isPreset = true; item.group.color = GONGWEI_COLORS[name] || '#8b7e6a';
      item.group.updatedAt = now;
      gongWeiGroups.push(item.group);
      return;
    }
    var gi = -1;
    for (var k = 0; k < gongWeiGroups.length; k++) { if (gongWeiGroups[k].id === presetId) { gi = k; break; } }
    if (gi !== -1) {
      gongWeiGroups[gi].name = name; gongWeiGroups[gi].labels = GONGWEI_MAP[name].slice();
      gongWeiGroups[gi].isPreset = true; gongWeiGroups[gi].color = GONGWEI_COLORS[name] || '#8b7e6a';
      gongWeiGroups[gi].updatedAt = now;
      return;
    }
    gongWeiGroups.push({
      id: presetId, name: name, labels: GONGWEI_MAP[name].slice(),
      isPreset: true, color: GONGWEI_COLORS[name] || '#8b7e6a',
      createdAt: now, updatedAt: now
    });
  });
  persistGroups(); persistTrash();
  return { ok: true };
}

// 全局选中状态（运行时变量，初始化时从 localStorage 恢复）
let selectedGongWei = [];

// ===== v0.10.0 宫位多选 — 标签行生成（纯函数） =====
// area: 'main' | 'sanyuan'
// colCount: 5 | 7（普通5列 / 含大运流年7列）
function buildGongWeiTagRows(area, colCount) {
  if (!selectedGongWei.length) return [];
  colCount = colCount || 5;
  var rows = [];
  var cols = area === 'main' ? ['nian','yue','ri','shi'] : ['tai','ming','shen'];
  var hasExt = colCount >= 7; // 是否有大运/流年扩展列

  for (var i = 0; i < gongWeiGroups.length; i++) {
    var gwName = gongWeiGroups[i].name;
    if (selectedGongWei.indexOf(gwName) < 0) continue;
    var group = gongWeiGroups[i];
    var labels = group.labels;
    var color = group.color || '#8b7e6a';
    var cls = area === 'main' ? 'gz-tags' : 'gz-tags-sy';
    var html = '<tr class="' + cls + '" data-gw-type="' + gwName + '">';
    // rl 列：显示宫位名称，左边框色
    html += '<td class="rl" style="border-left:3px solid ' + color + ';padding-left:5px;">' + gwName + '</td>';
    // area为main时有rl列，area为sanyuan时rl后还需一个空td
    if (area === 'sanyuan') { html += '<td></td>'; }
    for (var j = 0; j < cols.length; j++) {
      var gw = cols[j];
      var idx = GW_INDEX[gw];
      html += '<td data-gw="' + gw + '">' + (labels[idx] || '') + '</td>';
    }
    if (hasExt) {
      html += '<td class="sep"></td><td class="col-ln"></td>';
    }
    html += '</tr>';
    rows.push(html);
  }
  return rows;
}

// ===== v0.10.0 宫位多选 — 全局标签更新（全量重建） =====
function updateGongWeiTags() {
  // 1. 清除所有现有标签行
  var oldTags = document.querySelectorAll('.gz-tags, .gz-tags-sy');
  for (var i = 0; i < oldTags.length; i++) {
    oldTags[i].parentNode && oldTags[i].parentNode.removeChild(oldTags[i]);
  }
  if (!selectedGongWei.length) {
    updateGzTriggerText();
    return;
  }

  // 2. 遍历所有 .chart 表格，在每个表格的每个 tr.hd 之前插入标签行
  var tables = document.querySelectorAll('table.chart');
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    var hdRows = table.querySelectorAll('tr.hd');
    for (var h = 0; h < hdRows.length; h++) {
      var hdRow = hdRows[h];

      // 判断该表格是四柱区还是三垣区
      // 四柱区 hd 的结构: <th class="rl">盘式</th><th>年柱</th>...
      // 三垣区 hd 的结构: <th class="rl">三垣</th>...
      var isSanyuan = false;
      var hdThs = hdRow.querySelectorAll('th');
      if (hdThs.length > 0 && hdThs[0].textContent === '三垣') {
        isSanyuan = true;
      }

      // 计算列数
      var colCount = hdThs.length;

      // 生成标签行
      var area = isSanyuan ? 'sanyuan' : 'main';
      var tagRows = buildGongWeiTagRows(area, colCount);
      if (!tagRows.length) continue;

      // 在 hd 行之前插入
      hdRow.insertAdjacentHTML('beforebegin', tagRows.join(''));
    }
  }

  // 3. 更新面板按钮文字
  updateGzTriggerText();
  // 4. 同步 checkbox 状态
  syncGzCheckboxes();
}

// 更新面板按钮文字
function updateGzTriggerText() {
  var trigger = document.getElementById('gz-trigger');
  if (!trigger) return;
  var count = selectedGongWei.length;
  var countSpan = trigger.querySelector('.gz-count');
  var summarySpan = trigger.querySelector('.gz-summary');
  if (countSpan) {
    countSpan.textContent = count > 0 ? '(' + count + ')' : '';
  }
  if (summarySpan) {
    if (count === 0) {
      summarySpan.textContent = '';
    } else if (count <= 3) {
      summarySpan.textContent = selectedGongWei.join('·');
    } else {
      summarySpan.textContent = selectedGongWei.slice(0, 2).join('·') + ' +' + (count - 2);
    }
  }
}

// 同步 popover checkbox 状态
function syncGzCheckboxes() {
  var cbs = document.querySelectorAll('#gz-popover .gz-cb-item input[type="checkbox"]');
  for (var i = 0; i < cbs.length; i++) {
    var val = cbs[i].value;
    cbs[i].checked = selectedGongWei.indexOf(val) >= 0;
    var label = cbs[i].parentElement;
    if (cbs[i].checked) {
      label.classList.add('checked');
    } else {
      label.classList.remove('checked');
    }
  }
}

// ===== v0.13.2 重建 popover 勾选网格（排序后顺序联动）=====
function rebuildGzCbGrid() {
  var grid = document.querySelector('.gz-cb-grid');
  if (!grid) return;
  var items = '';
  for (var i = 0; i < gongWeiGroups.length; i++) {
    var g = gongWeiGroups[i];
    var checked = selectedGongWei.indexOf(g.name) >= 0 ? ' checked' : '';
    items += '<label class="gz-cb-item' + (checked ? ' checked' : '') + '"><input type="checkbox" value="' + g.name + '" onchange="GONGWEI.toggleGongWei(\'' + g.name + '\', this.checked)"' + checked + '><span>' + g.name + '宫位</span></label>';
  }
  grid.innerHTML = items;
}

// ===== v0.10.0/v0.13.0 宫位多选 — Popover 面板生成 =====
function renderGongWeiPanel() {
  var cbItems = '';
  for (var i = 0; i < gongWeiGroups.length; i++) {
    var group = gongWeiGroups[i];
    cbItems += '<label class="gz-cb-item"><input type="checkbox" value="' + group.name + '" onchange="GONGWEI.toggleGongWei(\'' + group.name + '\', this.checked)"><span>' + group.name + '宫位</span></label>';
  }
  return '<div class="gz-panel-wrapper">'
    + '<button class="btn-simple gz-trigger" id="gz-trigger" onclick="GONGWEI.toggleGzPopover(event)">宫位<span class="gz-count"></span> ▾<span class="gz-summary"></span></button>'
    + '<div class="gz-popover" id="gz-popover">'
    + '<div class="gz-cb-grid">' + cbItems + '</div>'
    + '<div class="gz-popover-actions">'
    + '<button onclick="GONGWEI.selectAllGongWei()">全选</button>'
    + '<button onclick="GONGWEI.clearAllGongWei()">清空</button>'
    + '<button class="gz-settings-btn" onclick="GONGWEI.closeGzPopover();GONGWEI.openGzSettings();">⚙ 宫位设置</button>'
    + '</div></div></div>';
}

// ===== v0.10.0/v0.13.0 宫位多选 — 交互函数 =====
function toggleGongWei(name, checked) {
  var idx = selectedGongWei.indexOf(name);
  if (checked && idx < 0) {
    selectedGongWei.push(name);
  } else if (!checked && idx >= 0) {
    selectedGongWei.splice(idx, 1);
  }
  persistSelected();
  updateGongWeiTags();
}

function selectAllGongWei() {
  selectedGongWei = gongWeiGroups.map(function(g) { return g.name; });
  persistSelected();
  updateGongWeiTags();
  closeGzPopover();
}

function clearAllGongWei() {
  selectedGongWei = [];
  persistSelected();
  updateGongWeiTags();
  closeGzPopover();
}

function toggleGzPopover(e) {
  if (e) e.stopPropagation();
  var popover = document.getElementById('gz-popover');
  if (!popover) return;
  // 每次打开前同步 checkbox（数据可能已在设置面板中变化）
  syncGzCheckboxes();
  popover.classList.toggle('open');
}

function closeGzPopover() {
  var popover = document.getElementById('gz-popover');
  if (popover) popover.classList.remove('open');
}

// 全局事件委托：popover 外部点击关闭
document.addEventListener('click', function(e) {
  var wrapper = document.querySelector('.gz-panel-wrapper');
  if (!wrapper) return;
  if (!wrapper.contains(e.target)) {
    closeGzPopover();
  }
  // 分气 popover 外部点击关闭
  var tpWrapper = document.querySelector('#tp-popover');
  if (tpWrapper) {
    var tpPanel = tpWrapper.closest('.gz-panel-wrapper');
    if (tpPanel && !tpPanel.contains(e.target)) {
      closeTpPopover();
    }
  }
});

// ===== v0.13.0 宫位设置面板渲染 =====
var gzSettingsView = 'list'; // 'list' | 'trash'
var gzEditingId = null;     // 正在编辑的宫位组 id，null=新增

function openGzSettings() {
  gzSettingsView = 'list';
  document.getElementById('gzSettingsTrashView').style.display = 'none';
  document.getElementById('gzSettingsListView').style.display = '';
  document.getElementById('gzSettingsOverlay').classList.add('show');
  renderGzSettingsList();
}

function closeGzSettings() {
  document.getElementById('gzSettingsOverlay').classList.remove('show');
  // 关闭后刷新 popover 面板（重建 cb-grid）和标签行
  rebuildGzCbGrid();
  updateGongWeiTags();
}

function renderGzSettingsList() {
  var list = document.getElementById('gzSettingsList');
  var countEl = document.getElementById('gzTrashCount');
  countEl.textContent = gongWeiTrash.length > 0 ? '(' + gongWeiTrash.length + ')' : '';

  if (gongWeiGroups.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--c-gray);padding:30px 0;font-family:var(--font-display);font-size:15px;">暂无宫位组，点击「新增」创建</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < gongWeiGroups.length; i++) {
    var g = gongWeiGroups[i];
    var preview = g.labels.join('·');
    if (preview.length > 40) preview = preview.substr(0, 40) + '…';
    var upDisabled = i === 0 ? ' disabled' : '';
    var downDisabled = i === gongWeiGroups.length - 1 ? ' disabled' : '';

    html += '<div class="gz-set-item" draggable="true" data-idx="' + i + '"'
      + ' ondragstart="GONGWEI.gzDragStart(event,' + i + ')"'
      + ' ondragover="GONGWEI.gzDragOver(event)"'
      + ' ondragleave="GONGWEI.gzDragLeave(event)"'
      + ' ondrop="GONGWEI.gzDrop(event,' + i + ')"'
      + ' ondragend="GONGWEI.gzDragEnd(event)">'
      + '<span class="gz-drag-handle" title="拖拽排序">⠿</span>'
      + '<div class="gz-set-info">'
      + '<div class="gz-set-name">' + g.name + (g.isPreset ? '<span class="gz-preset-tag">预置</span>' : '') + '</div>'
      + '<div class="gz-set-preview">' + preview + '</div>'
      + '</div>'
      + '<div class="gz-set-actions">'
      + '<button onclick="GONGWEI.openGzEdit(\'' + g.id + '\')" title="编辑">✎</button>'
      + '<button onclick="GONGWEI.confirmDeleteGroup(\'' + g.id + '\',\'' + g.name + '\')" title="删除">🗑</button>'
      + '<button onclick="GONGWEI.moveUp(' + i + ');GONGWEI.renderGzSettingsList();GONGWEI.updateGongWeiTags();"' + upDisabled + ' title="上移">↑</button>'
      + '<button onclick="GONGWEI.moveDown(' + i + ');GONGWEI.renderGzSettingsList();GONGWEI.updateGongWeiTags();"' + downDisabled + ' title="下移">↓</button>'
      + '</div></div>';
  }
  list.innerHTML = html;
}

// ===== v0.13.0 拖拽排序 =====
function gzDragStart(e, idx) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(idx));
  e.target.classList.add('dragging');
}
function gzDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  var item = e.target.closest('.gz-set-item');
  if (item) item.classList.add('drag-over');
}
function gzDragLeave(e) {
  var item = e.target.closest('.gz-set-item');
  if (item) item.classList.remove('drag-over');
}
function gzDrop(e, toIdx) {
  e.preventDefault();
  var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
  if (isNaN(fromIdx) || fromIdx === toIdx) return;
  moveGroup(fromIdx, toIdx);
  renderGzSettingsList();
  updateGongWeiTags();
}
function gzDragEnd(e) {
  e.target.classList.remove('dragging');
  var items = document.querySelectorAll('.gz-set-item');
  for (var i = 0; i < items.length; i++) items[i].classList.remove('drag-over');
}

// ===== v0.13.0 删除确认 =====
function confirmDeleteGroup(id, name) {
  if (!confirm('确定删除「' + name + '宫位」？\n删除后可从回收站恢复。')) return;
  deleteGroup(id);
  renderGzSettingsList();
  updateGongWeiTags();
}

// ===== v0.13.0 编辑弹窗 =====
function openGzEdit(id) {
  gzEditingId = id || null;
  var titleEl = document.getElementById('gzEditTitle');
  var nameEl = document.getElementById('gzEditName');
  var errEl = document.getElementById('gzEditNameErr');
  errEl.style.display = 'none';
  errEl.textContent = '';

  if (id) {
    var group = null;
    for (var i = 0; i < gongWeiGroups.length; i++) {
      if (gongWeiGroups[i].id === id) { group = gongWeiGroups[i]; break; }
    }
    if (!group) return;
    titleEl.textContent = '编辑「' + group.name + '宫位」';
    nameEl.value = group.name;
    for (var j = 0; j < 7; j++) {
      document.getElementById('gzEditL' + j).value = group.labels[j] || '';
    }
  } else {
    titleEl.textContent = '新增宫位组';
    nameEl.value = '';
    for (var k = 0; k < 7; k++) {
      document.getElementById('gzEditL' + k).value = '';
    }
  }
  checkGzEditValid();
  document.getElementById('gzEditOverlay').classList.add('show');
  setTimeout(function() { nameEl.focus(); }, 100);
}

function closeGzEdit() {
  document.getElementById('gzEditOverlay').classList.remove('show');
  gzEditingId = null;
}

function checkCloseGzEdit() {
  // 简单策略：直接关闭（未保存的内容丢失提示由 product 保持一致）
  closeGzEdit();
}

function checkGzEditValid() {
  var btn = document.getElementById('gzEditSaveBtn');
  var name = document.getElementById('gzEditName').value.trim();
  btn.disabled = name.length === 0;
}

// 监听输入变化以启用/禁用保存按钮
(function() {
  var inputs = [document.getElementById('gzEditName')];
  for (var i = 0; i < 7; i++) inputs.push(document.getElementById('gzEditL' + i));
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].addEventListener('input', checkGzEditValid);
  }
})();

function saveGzEdit() {
  var name = document.getElementById('gzEditName').value.trim();
  var labels = [];
  for (var i = 0; i < 7; i++) {
    labels.push(document.getElementById('gzEditL' + i).value.trim());
  }

  var result;
  if (gzEditingId) {
    result = updateGroup(gzEditingId, name, labels);
  } else {
    result = addGroup(name, labels);
  }

  if (!result.ok) {
    var errEl = document.getElementById('gzEditNameErr');
    errEl.textContent = result.error;
    errEl.style.display = 'block';
    return;
  }

  closeGzEdit();
  renderGzSettingsList();
  updateGongWeiTags();
}

// ===== v0.13.0 回收站面板 =====
function openGzTrash() {
  gzSettingsView = 'trash';
  document.getElementById('gzSettingsListView').style.display = 'none';
  document.getElementById('gzSettingsTrashView').style.display = 'flex';
  renderGzTrashList();
}

function backToGzList() {
  gzSettingsView = 'list';
  document.getElementById('gzSettingsTrashView').style.display = 'none';
  document.getElementById('gzSettingsListView').style.display = '';
  renderGzSettingsList();
}

function renderGzTrashList() {
  var list = document.getElementById('gzTrashList');
  if (gongWeiTrash.length === 0) {
    list.innerHTML = '<div class="gz-trash-empty">回收站为空</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < gongWeiTrash.length; i++) {
    var t = gongWeiTrash[i];
    var g = t.group;
    var preview = g.labels.join('·');
    if (preview.length > 40) preview = preview.substr(0, 40) + '…';
    var dt = new Date(t.deletedAt);
    var timeStr = dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-'
      + String(dt.getDate()).padStart(2,'0') + ' ' + String(dt.getHours()).padStart(2,'0')
      + ':' + String(dt.getMinutes()).padStart(2,'0');

    html += '<div class="gz-trash-item">'
      + '<div class="gz-trash-info">'
      + '<div class="gz-trash-name">' + g.name + '宫位</div>'
      + '<div class="gz-trash-preview">' + preview + '</div>'
      + '<div class="gz-trash-time">删除于 ' + timeStr + '</div>'
      + '</div>'
      + '<div class="gz-trash-actions">'
      + '<button onclick="GONGWEI.restoreFromTrash(\'' + t.id + '\');GONGWEI.renderGzTrashList();GONGWEI.renderGzSettingsList();GONGWEI.updateGongWeiTags();">恢复</button>'
      + '</div></div>';
  }
  list.innerHTML = html;
}

function emptyGzTrash() {
  if (!confirm('确定清空回收站？此操作不可恢复。')) return;
  clearTrash();
  renderGzTrashList();
  renderGzSettingsList();
}

// ===== v0.13.0 恢复默认 =====
function resetGongWeiDefaults() {
  if (!confirm('将恢复 14 种预置宫位组的原始名称和标签。\n您自定义的宫位组不受影响。\n确定继续？')) return;
  resetToDefaults();
  renderGzSettingsList();
  updateGongWeiTags();
}

// ===== 分气多选面板 =====
function renderTwinPillarPanel() {
  var pillarLabels = { nian:'年', yue:'月', ri:'日', shi:'时', tai:'胎', shen:'身', ming:'命' };
  var row1 = ['nian','yue','ri','shi'];
  var row2 = ['','tai','ming','shen'];
  function buildRow(keys) {
    var items = '';
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === '') {
        items += '<span></span>';
        continue;
      }
      var p = keys[i];
      var checked = twinPillars.indexOf(p) >= 0 ? ' checked' : '';
      items += '<label class="gz-cb-item"><input type="checkbox" value="' + p + '"' + checked + ' onchange="GONGWEI.onTwinPillarChange()"><span>' + pillarLabels[p] + '</span></label>';
    }
    return items;
  }
  var row1Html = buildRow(row1);
  var row2Html = buildRow(row2);
  return '<div class="gz-panel-wrapper">'
    + '<button class="btn-simple gz-trigger" onclick="GONGWEI.toggleTpPopover(event)">分气<span class="gz-count"></span> ▾</button>'
    + '<div class="gz-popover" id="tp-popover">'
    + '<div class="tp-cb-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:4px 16px;">' + row1Html + row2Html + '</div>'
    + '<div class="gz-popover-actions">'
    + '<button onclick="GONGWEI.selectAllTwinPillars()">全选</button>'
    + '<button onclick="GONGWEI.clearAllTwinPillars()">清空</button>'
    + '</div></div></div>';
}

function onTwinPillarChange() {
  var cbs = document.querySelectorAll('#tp-popover input[type=checkbox]');
  twinPillars.length = 0;
  for (var i = 0; i < cbs.length; i++) {
    if (cbs[i].checked) twinPillars.push(cbs[i].value);
  }
  var twinType = window._twinType;
  if (twinType === 'longfeng') {
    var d1 = window._paipanData, d2 = window._paipanData2;
    if (d1 && d2) RENDER.renderLongFengCardsHtml(d1, d2, 'output');
  } else if (twinType === 'same') {
    var d = window._paipanData;
    if (d) RENDER.renderTwinCardsHtml(d, 'output');
  }
  GONGWEI.updateGongWeiTags();
}

function toggleTpPopover(e) {
  if (e) e.stopPropagation();
  var popover = document.getElementById('tp-popover');
  if (!popover) return;
  popover.classList.toggle('open');
}

function closeTpPopover() {
  var popover = document.getElementById('tp-popover');
  if (popover) popover.classList.remove('open');
}

function selectAllTwinPillars() {
  var cbs = document.querySelectorAll('#tp-popover input[type=checkbox]');
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = true;
  onTwinPillarChange();
  closeTpPopover();
}

function clearAllTwinPillars() {
  var cbs = document.querySelectorAll('#tp-popover input[type=checkbox]');
  for (var i = 0; i < cbs.length; i++) cbs[i].checked = false;
  onTwinPillarChange();
  closeTpPopover();
}
// ===== v0.13.0 宫位数据初始化 =====
(function initGongWeiData() {
  gongWeiGroups = loadGroups();
  gongWeiTrash = loadTrash();
  selectedGongWei = loadSelected();
  // 清理无效选中（已删除的宫位组名称）
  selectedGongWei = selectedGongWei.filter(function(name) {
    for (var i = 0; i < gongWeiGroups.length; i++) {
      if (gongWeiGroups[i].name === name) return true;
    }
    return false;
  });
  persistSelected();
})();


  // ===== 挂载到全局命名空间 =====
  window.GONGWEI = {
    loadGroups: loadGroups,
    loadTrash: loadTrash,
    loadSelected: loadSelected,
    persistGroups: persistGroups,
    persistTrash: persistTrash,
    persistSelected: persistSelected,
    nowISO: nowISO,
    generateGwId: generateGwId,
    findGroupByName: findGroupByName,
    getGroupColor: getGroupColor,
    initGongWeiGroups: initGongWeiGroups,
    addGroup: addGroup,
    updateGroup: updateGroup,
    deleteGroup: deleteGroup,
    restoreFromTrash: restoreFromTrash,
    clearTrash: clearTrash,
    moveGroup: moveGroup,
    moveUp: moveUp,
    moveDown: moveDown,
    toggleSelect: toggleSelect,
    selectAll: selectAll,
    clearSelection: clearSelection,
    isSelected: isSelected,
    resetToDefaults: resetToDefaults,
    buildGongWeiTagRows: buildGongWeiTagRows,
    updateGongWeiTags: updateGongWeiTags,
    updateGzTriggerText: updateGzTriggerText,
    syncGzCheckboxes: syncGzCheckboxes,
    rebuildGzCbGrid: rebuildGzCbGrid,
    renderGongWeiPanel: renderGongWeiPanel,
    toggleGongWei: toggleGongWei,
    selectAllGongWei: selectAllGongWei,
    clearAllGongWei: clearAllGongWei,
    toggleGzPopover: toggleGzPopover,
    closeGzPopover: closeGzPopover,
    openGzSettings: openGzSettings,
    closeGzSettings: closeGzSettings,
    renderGzSettingsList: renderGzSettingsList,
    gzDragStart: gzDragStart,
    gzDragOver: gzDragOver,
    gzDragLeave: gzDragLeave,
    gzDrop: gzDrop,
    gzDragEnd: gzDragEnd,
    confirmDeleteGroup: confirmDeleteGroup,
    openGzEdit: openGzEdit,
    closeGzEdit: closeGzEdit,
    checkCloseGzEdit: checkCloseGzEdit,
    checkGzEditValid: checkGzEditValid,
    saveGzEdit: saveGzEdit,
    openGzTrash: openGzTrash,
    backToGzList: backToGzList,
    renderGzTrashList: renderGzTrashList,
    emptyGzTrash: emptyGzTrash,
    resetGongWeiDefaults: resetGongWeiDefaults,
    renderTwinPillarPanel: renderTwinPillarPanel,
    onTwinPillarChange: onTwinPillarChange,
    toggleTpPopover: toggleTpPopover,
    closeTpPopover: closeTpPopover,
    selectAllTwinPillars: selectAllTwinPillars,
    clearAllTwinPillars: clearAllTwinPillars,
    selectedGongWei: selectedGongWei,
    gongWeiGroups: gongWeiGroups,
    gongWeiTrash: gongWeiTrash,
  };
})();
