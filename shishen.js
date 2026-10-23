/* 八字排盘 v0.70.0 — shishen.js */
(function() {
  'use strict';

  var GROUPS_KEY = 'bz_ssh_groups_v1';
  var SEL_KEY = 'bz_ssh_selected_v1';

  var GAN_GROUPS_KEY = 'bz_gan_groups_v1';
  var GAN_SEL_KEY = 'bz_gan_selected_v1';

  var SHI_SHEN_KEYS = ['七杀', '正官', '枭神', '正印', '比肩', '劫财', '正财', '偏财', '食神', '伤官'];
  var GAN_KEYS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  var DEFAULT_GAN_GROUPS = [
    { name: '德性', map: { '甲': '怜悯', '乙': '', '丙': '', '丁': '', '戊': '诚信', '己': '', '庚': '', '辛': '', '壬': '', '癸': '' } }
  ];

  var DEFAULT_GROUPS = [
    {
      name: '军队',
      map: { '七杀': '司令', '正官': '军务', '枭神': '军师', '正印': '政委', '比肩': '战友', '劫财': '盟友', '正财': '军需官', '偏财': '支前员', '食神': '炊事员', '伤官': '宣传员' }
    },
    {
      name: '社会',
      map: { '七杀': '对手', '正官': '领导', '枭神': '导师', '正印': '顾问', '比肩': '同事', '劫财': '伙伴', '正财': '工资', '偏财': '外快', '食神': '爱好', '伤官': '作品' }
    }
  ];

  var _lsOk = true;
  var _draft = [];
  var _ganDraft = [];

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { _lsOk = false; return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (e) { _lsOk = false; return false; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function normalizeGroups(raw, keys) {
    keys = keys || SHI_SHEN_KEYS;
    var arr = Array.isArray(raw) ? raw : [];
    var out = [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var g = arr[i];
      if (!g || typeof g !== 'object') continue;
      var name = String(g.name || '').trim();
      if (!name || seen[name]) continue;
      seen[name] = 1;
      var src = (g.map && typeof g.map === 'object') ? g.map : {};
      var map = {};
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        map[k] = String(src[k] == null ? '' : src[k]).trim();
      }
      out.push({ name: name, map: map });
    }
    return out;
  }

  function loadGroups(key, defs, keys) {
    key = key || GROUPS_KEY;
    defs = defs || DEFAULT_GROUPS;
    var raw = lsGet(key);
    if (raw == null) return JSON.parse(JSON.stringify(defs));
    try {
      var parsed = normalizeGroups(JSON.parse(raw), keys);
      return parsed.length ? parsed : JSON.parse(JSON.stringify(defs));
    } catch (e) { return JSON.parse(JSON.stringify(defs)); }
  }

  function persistGroups(groups, key, keys) {
    return lsSet(key || GROUPS_KEY, JSON.stringify(normalizeGroups(groups, keys)));
  }

  function loadSelected(key) {
    var isGan = (key === GAN_SEL_KEY);
    var dflt = isGan ? [] : ['军队'];
    var raw = lsGet(key || SEL_KEY);
    if (raw == null) return dflt.slice();
    try {
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return dflt.slice();
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] === 'string' && arr[i] && out.indexOf(arr[i]) < 0) out.push(arr[i]);
      }
      return out;
    } catch (e) { return dflt.slice(); }
  }

  function persistSelected(sel, key) {
    return lsSet(key || SEL_KEY, JSON.stringify(sel));
  }

  // 勾选顺序即主表行顺序；组不存在或重复勾选时静默丢弃
  function selectedGroups() {
    var groups = loadGroups();
    var sel = loadSelected();
    var byName = {};
    var out = [];
    for (var i = 0; i < groups.length; i++) byName[groups[i].name] = groups[i];
    for (var j = 0; j < sel.length; j++) {
      var g = byName[sel[j]];
      if (g && out.indexOf(g) < 0) out.push(g);
    }
    return out;
  }

  function groupByName(name) {
    var groups = loadGroups();
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].name === name) return groups[i];
    }
    return null;
  }

  // 十神全名 → 组内对应名；未配置或键不存在返回空串
  function mapName(group, ssName) {
    if (!group || !ssName || !group.map) return '';
    return group.map[ssName] || '';
  }

  // ===== 十干对应（v0.70.0）：与十神组同构，独立组表 + 独立勾选，渲染在十神组名左侧、竖线分隔 =====
  function loadGanGroups() { return loadGroups(GAN_GROUPS_KEY, DEFAULT_GAN_GROUPS, GAN_KEYS); }
  function persistGanGroups(groups) { return persistGroups(groups, GAN_GROUPS_KEY, GAN_KEYS); }
  function loadGanSelected() { return loadSelected(GAN_SEL_KEY); }
  function persistGanSelected(sel) { return persistSelected(sel, GAN_SEL_KEY); }

  function selectedGanGroups() {
    var groups = loadGanGroups();
    var sel = loadGanSelected();
    var byName = {};
    var out = [];
    for (var i = 0; i < groups.length; i++) byName[groups[i].name] = groups[i];
    for (var j = 0; j < sel.length; j++) {
      var g = byName[sel[j]];
      if (g && out.indexOf(g) < 0) out.push(g);
    }
    return out;
  }

  function ganGroupByName(name) {
    var groups = loadGanGroups();
    for (var i = 0; i < groups.length; i++) if (groups[i].name === name) return groups[i];
    return null;
  }

  // 天干字 → 组内对应名；未配置返回空串
  function ganMapName(group, gan) {
    if (!group || !gan || !group.map) return '';
    return group.map[gan] || '';
  }

  function ganCbGridHtml() {
    var groups = loadGanGroups();
    var sel = loadGanSelected();
    if (!groups.length) {
      return '<div style="text-align:center;color:var(--c-gray);padding:16px 0;font-size:12px;">暂无十干组，点击 ⚙ 十干设置添加</div>';
    }
    var items = '';
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      var checked = sel.indexOf(g.name) >= 0;
      items += '<label class="gz-cb-item' + (checked ? ' checked' : '') + '">'
        + '<input type="checkbox" value="' + esc(g.name) + '" onchange="GAN.toggleGroup(this.value, this.checked)"' + (checked ? ' checked' : '') + '>'
        + '<span>' + esc(g.name) + '</span></label>';
    }
    return items;
  }

  function renderGanPanel() {
    var sel = loadGanSelected();
    return '<div class="gz-panel-wrapper">'
      + '<button class="btn-simple gan-trigger" onclick="GAN.togglePanel(event)">十干<span class="gan-count"> ' + sel.length + '</span> ▾</button>'
      + '<div class="gan-popover" onclick="event.stopPropagation()">'
      + '<div class="gz-cb-grid gan-cb-grid">' + ganCbGridHtml() + '</div>'
      + '<div class="gz-popover-actions">'
      + '<button onclick="GAN.selectAll()">全选</button>'
      + '<button onclick="GAN.clearAll()">清空</button>'
      + '<button class="gz-settings-btn" onclick="GAN.closePanel();GAN.openSettings();">⚙ 十干设置</button>'
      + '</div></div></div>';
  }

  function ganPopOf(e) {
    var t = e && e.target && e.target.closest ? e.target : null;
    var wrapper = t ? t.closest('.gz-panel-wrapper') : null;
    return wrapper ? wrapper.querySelector('.gan-popover') : document.querySelector('.gan-popover');
  }

  function toggleGanPanel(e) {
    if (e) e.stopPropagation();
    var pop = ganPopOf(e);
    if (!pop) return;
    if (!pop.classList.contains('open')) {
      var others = document.querySelectorAll('.gz-popover, .ssh-popover');
      for (var i = 0; i < others.length; i++) others[i].classList.remove('open');
    }
    pop.classList.toggle('open');
  }

  function closeGanPanel() {
    var pops = document.querySelectorAll('.gan-popover');
    for (var i = 0; i < pops.length; i++) pops[i].classList.remove('open');
  }

  document.addEventListener('click', function(e) {
    var pops = document.querySelectorAll('.gan-popover');
    for (var i = 0; i < pops.length; i++) {
      var w = pops[i].closest('.gz-panel-wrapper');
      if (pops[i].classList.contains('open') && w && !w.contains(e.target)) pops[i].classList.remove('open');
    }
  });

  function toggleGanGroup(name, checked) {
    var sel = loadGanSelected();
    var idx = sel.indexOf(name);
    if (checked && idx < 0) sel.push(name);
    else if (!checked && idx >= 0) sel.splice(idx, 1);
    persistGanSelected(sel);
    rebuildPanels();
    refresh();
  }

  function ganSelectAll() {
    var groups = loadGanGroups();
    var sel = [];
    for (var i = 0; i < groups.length; i++) sel.push(groups[i].name);
    persistGanSelected(sel);
    rebuildPanels();
    refresh();
    closeGanPanel();
  }

  function ganClearAll() {
    persistGanSelected([]);
    rebuildPanels();
    refresh();
    closeGanPanel();
  }

  function cbGridHtml() {
    var groups = loadGroups();
    var sel = loadSelected();
    if (!groups.length) {
      return '<div style="text-align:center;color:var(--c-gray);padding:16px 0;font-size:12px;">暂无十神组，点击 ⚙ 十神设置添加</div>';
    }
    var items = '';
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      var checked = sel.indexOf(g.name) >= 0;
      items += '<label class="gz-cb-item' + (checked ? ' checked' : '') + '">'
        + '<input type="checkbox" value="' + esc(g.name) + '" onchange="SSH.toggleGroup(this.value, this.checked)"' + (checked ? ' checked' : '') + '>'
        + '<span>' + esc(g.name) + '</span></label>';
    }
    return items;
  }

  function renderPanel() {
    var sel = loadSelected();
    return '<div class="gz-panel-wrapper">'
      + '<button class="btn-simple ssh-trigger" onclick="SSH.togglePanel(event)">十神<span class="ssh-count"> ' + sel.length + '</span> ▾</button>'
      + '<div class="ssh-popover" onclick="event.stopPropagation()">'
      + '<div class="gz-cb-grid ssh-cb-grid">' + cbGridHtml() + '</div>'
      + '<div class="gz-popover-actions">'
      + '<button onclick="SSH.selectAll()">全选</button>'
      + '<button onclick="SSH.clearAll()">清空</button>'
      + '<button class="gz-settings-btn" onclick="SSH.closePanel();SSH.openSettings();">⚙ 十神设置</button>'
      + '</div></div></div>';
  }

  // 就近定位本实例 popover：页内多份（主页/对比/双胞胎卡）时 getElementById 会拿错实例
  function popOf(e) {
    var t = e && e.target && e.target.closest ? e.target : null;
    var wrapper = t ? t.closest('.gz-panel-wrapper') : null;
    return wrapper ? wrapper.querySelector('.ssh-popover') : document.querySelector('.ssh-popover');
  }

  function togglePanel(e) {
    if (e) e.stopPropagation();
    var pop = popOf(e);
    if (!pop) return;
    // v0.60.2 互斥：两按钮 onclick 均 stopPropagation，document 委托收不到，打开十神面板前显式关宫位
    if (!pop.classList.contains('open')) {
      var gzs = document.querySelectorAll('.gz-popover, .gan-popover');
      for (var i = 0; i < gzs.length; i++) gzs[i].classList.remove('open');
    }
    pop.classList.toggle('open');
  }

  function closePanel() {
    var pops = document.querySelectorAll('.ssh-popover, .gan-popover');
    for (var i = 0; i < pops.length; i++) pops[i].classList.remove('open');
  }

  // popover 外部点击关闭（自带监听，不混入宫位的全局关闭逻辑）
  document.addEventListener('click', function(e) {
    var pops = document.querySelectorAll('.ssh-popover');
    for (var i = 0; i < pops.length; i++) {
      var w = pops[i].closest('.gz-panel-wrapper');
      if (pops[i].classList.contains('open') && w && !w.contains(e.target)) pops[i].classList.remove('open');
    }
  });

  // 勾选变化后刷新所有已注入的 SSH 面板（主页 topbar 与对比页各一份，只动 cb-grid 与计数，保 popover 开合状态）
  function rebuildPanels() {
    var grids = document.querySelectorAll('.ssh-popover .ssh-cb-grid');
    for (var i = 0; i < grids.length; i++) grids[i].innerHTML = cbGridHtml();
    var counts = document.querySelectorAll('.ssh-trigger .ssh-count');
    var n = loadSelected().length;
    for (var j = 0; j < counts.length; j++) counts[j].textContent = ' ' + n;
    var ggrids = document.querySelectorAll('.gan-popover .gan-cb-grid');
    for (var m = 0; m < ggrids.length; m++) ggrids[m].innerHTML = ganCbGridHtml();
    var gcounts = document.querySelectorAll('.gan-trigger .gan-count');
    var gn = loadGanSelected().length;
    for (var q = 0; q < gcounts.length; q++) gcounts[q].textContent = ' ' + gn;
  }

  // 勾选变化后重渲当前视图：对比页 overlay 打开 → renderCmpTrack；否则主页主表全量重渲
  function refresh() {
    var ov = document.getElementById('cmpOverlay');
    if (ov && ov.classList.contains('show')) {
      if (typeof window.renderCmpTrack === 'function') window.renderCmpTrack();
      return;
    }
    var data = window._paipanData;
    if (data && window.RENDER && typeof RENDER.renderChart === 'function') RENDER.renderChart(data, 1, 'output');
  }

  function toggleGroup(name, checked) {
    var sel = loadSelected();
    var idx = sel.indexOf(name);
    if (checked && idx < 0) sel.push(name);
    else if (!checked && idx >= 0) sel.splice(idx, 1);
    persistSelected(sel);
    rebuildPanels();
    refresh();
  }

  function selectAll() {
    var groups = loadGroups();
    var sel = [];
    for (var i = 0; i < groups.length; i++) sel.push(groups[i].name);
    persistSelected(sel);
    rebuildPanels();
    refresh();
    closePanel();
  }

  function clearAll() {
    persistSelected([]);
    rebuildPanels();
    refresh();
    closePanel();
  }

  // ===== 设置弹窗（动态构建，骨架复用 gz-settings-*） =====
  function buildSettingsModal() {
    var div = document.createElement('div');
    div.className = 'gz-settings-overlay';
    div.id = 'sshSettingsOverlay';
    div.innerHTML = '<div class="gz-settings-modal" style="max-width:680px;">'
      + '<div class="gz-settings-header"><span class="gz-settings-title">十神设置</span>'
      + '<button class="gz-settings-close" onclick="SSH.closeSettings()">✕</button></div>'
      + '<div id="sshSettingsList" style="overflow-y:auto;padding:12px 18px;flex:1;"></div>'
      + '<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 18px 14px;border-top:1px solid var(--c-line);">'
      + '<div style="display:flex;gap:8px;">'
      + '<button class="btn-simple" onclick="SSH.addGroup()">+ 新增组</button>'
      + '<button class="btn-simple" onclick="SSH.resetGroups()">恢复默认</button>'
      + '</div>'
      + '<div style="display:flex;gap:8px;">'
      + '<button class="btn-simple" onclick="SSH.closeSettings()">取消</button>'
      + '<button class="btn-simple active" onclick="SSH.saveSettings()">保存</button>'
      + '</div>'
      + '</div></div>';
    div.addEventListener('click', function(e) { if (e.target === div) closeSettings(); });
    document.body.appendChild(div);
  }

  function renderSettingsList() {
    var host = document.getElementById('sshSettingsList');
    if (!host) return;
    var html = '';
    for (var i = 0; i < _draft.length; i++) {
      var g = _draft[i];
      var fields = '';
      for (var j = 0; j < SHI_SHEN_KEYS.length; j++) {
        var k = SHI_SHEN_KEYS[j];
        fields += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;min-width:0;">'
          + '<span style="width:36px;flex-shrink:0;color:var(--c-gray);">' + k + '</span>'
          + '<input type="text" value="' + esc(g.map[k]) + '" oninput="SSH.setMap(' + i + ',\'' + k + '\',this.value)" '
          + 'style="flex:1;min-width:0;padding:3px 6px;border:1px solid var(--c-line);border-radius:3px;font-size:12px;background:transparent;color:var(--c-ink);">'
          + '</label>';
      }
      html += '<div style="border:1px solid var(--c-line);border-radius:4px;padding:10px 12px;margin-bottom:10px;">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
        + '<input type="text" value="' + esc(g.name) + '" oninput="SSH.setGroupName(' + i + ',this.value)" placeholder="组名" '
        + 'style="width:140px;padding:3px 6px;border:1px solid var(--c-line);border-radius:3px;font-size:13px;background:transparent;color:var(--c-ink);">'
        + '<button class="btn-simple" style="margin-left:auto;" onclick="SSH.removeGroup(' + i + ')">删除</button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;">' + fields + '</div>'
        + '</div>';
    }
    if (!_draft.length) {
      html = '<div style="text-align:center;color:var(--c-gray);padding:24px 0;font-size:13px;">暂无十神组，点击「+ 新增组」创建</div>';
    }
    host.innerHTML = html;
  }

  function openSettings() {
    closePanel();
    var overlay = document.getElementById('sshSettingsOverlay');
    if (!overlay) {
      buildSettingsModal();
      overlay = document.getElementById('sshSettingsOverlay');
    }
    _draft = loadGroups();
    renderSettingsList();
    overlay.classList.add('show');
  }

  function closeSettings() {
    var ov = document.getElementById('sshSettingsOverlay');
    if (ov) ov.classList.remove('show');
    _draft = [];
  }

  function setGroupName(i, v) {
    if (_draft[i]) _draft[i].name = v;
  }

  function setMap(i, key, v) {
    if (_draft[i] && _draft[i].map && SHI_SHEN_KEYS.indexOf(key) >= 0) _draft[i].map[key] = v;
  }

  function addGroup() {
    var n = _draft.length + 1;
    var name = '新组';
    while (true) {
      var dup = false;
      for (var i = 0; i < _draft.length; i++) {
        if (_draft[i].name === name) { dup = true; break; }
      }
      if (!dup) break;
      name = '新组' + (++n);
    }
    var map = {};
    for (var j = 0; j < SHI_SHEN_KEYS.length; j++) map[SHI_SHEN_KEYS[j]] = '';
    _draft.push({ name: name, map: map });
    renderSettingsList();
  }

  function removeGroup(i) {
    _draft.splice(i, 1);
    renderSettingsList();
  }

  function resetGroups() {
    _draft = JSON.parse(JSON.stringify(DEFAULT_GROUPS));
    renderSettingsList();
  }

  // 保存：trim/去重后落盘；已删除或改名的组自动移出勾选
  function saveSettings() {
    var groups = normalizeGroups(_draft);
    persistGroups(groups);
    var names = {};
    for (var i = 0; i < groups.length; i++) names[groups[i].name] = 1;
    var oldSel = loadSelected();
    var sel = [];
    for (var j = 0; j < oldSel.length; j++) {
      if (names[oldSel[j]] && sel.indexOf(oldSel[j]) < 0) sel.push(oldSel[j]);
    }
    persistSelected(sel);
    closeSettings();
    rebuildPanels();
    refresh();
  }

  // ===== 十干设置弹窗（骨架复用 gz-settings-*） =====
  function buildGanSettingsModal() {
    var div = document.createElement('div');
    div.className = 'gz-settings-overlay';
    div.id = 'ganSettingsOverlay';
    div.innerHTML = '<div class="gz-settings-modal" style="max-width:680px;">'
      + '<div class="gz-settings-header"><span class="gz-settings-title">十干设置</span>'
      + '<button class="gz-settings-close" onclick="GAN.closeSettings()">✕</button></div>'
      + '<div id="ganSettingsList" style="overflow-y:auto;padding:12px 18px;flex:1;"></div>'
      + '<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 18px 14px;border-top:1px solid var(--c-line);">'
      + '<div style="display:flex;gap:8px;">'
      + '<button class="btn-simple" onclick="GAN.addGroup()">+ 新增组</button>'
      + '<button class="btn-simple" onclick="GAN.resetGroups()">恢复默认</button>'
      + '</div>'
      + '<div style="display:flex;gap:8px;">'
      + '<button class="btn-simple" onclick="GAN.closeSettings()">取消</button>'
      + '<button class="btn-simple active" onclick="GAN.saveSettings()">保存</button>'
      + '</div>'
      + '</div></div>';
    div.addEventListener('click', function(e) { if (e.target === div) closeGanSettings(); });
    document.body.appendChild(div);
  }

  function renderGanSettingsList() {
    var host = document.getElementById('ganSettingsList');
    if (!host) return;
    var html = '';
    for (var i = 0; i < _ganDraft.length; i++) {
      var g = _ganDraft[i];
      var fields = '';
      for (var j = 0; j < GAN_KEYS.length; j++) {
        var k = GAN_KEYS[j];
        fields += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;min-width:0;">'
          + '<span style="width:20px;flex-shrink:0;color:var(--c-gray);">' + k + '</span>'
          + '<input type="text" value="' + esc(g.map[k]) + '" oninput="GAN.setMap(' + i + ',\'' + k + '\',this.value)" '
          + 'style="flex:1;min-width:0;padding:3px 6px;border:1px solid var(--c-line);border-radius:3px;font-size:12px;background:transparent;color:var(--c-ink);">'
          + '</label>';
      }
      html += '<div style="border:1px solid var(--c-line);border-radius:4px;padding:10px 12px;margin-bottom:10px;">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
        + '<input type="text" value="' + esc(g.name) + '" oninput="GAN.setGroupName(' + i + ',this.value)" placeholder="组名" '
        + 'style="width:140px;padding:3px 6px;border:1px solid var(--c-line);border-radius:3px;font-size:13px;background:transparent;color:var(--c-ink);">'
        + '<button class="btn-simple" style="margin-left:auto;" onclick="GAN.removeGroup(' + i + ')">删除</button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;">' + fields + '</div>'
        + '</div>';
    }
    if (!_ganDraft.length) {
      html = '<div style="text-align:center;color:var(--c-gray);padding:24px 0;font-size:13px;">暂无十干组，点击「+ 新增组」创建</div>';
    }
    host.innerHTML = html;
  }

  function openGanSettings() {
    closeGanPanel();
    var overlay = document.getElementById('ganSettingsOverlay');
    if (!overlay) {
      buildGanSettingsModal();
      overlay = document.getElementById('ganSettingsOverlay');
    }
    _ganDraft = loadGanGroups();
    renderGanSettingsList();
    overlay.classList.add('show');
  }

  function closeGanSettings() {
    var ov = document.getElementById('ganSettingsOverlay');
    if (ov) ov.classList.remove('show');
    _ganDraft = [];
  }

  function setGanGroupName(i, v) {
    if (_ganDraft[i]) _ganDraft[i].name = v;
  }

  function setGanMap(i, key, v) {
    if (_ganDraft[i] && _ganDraft[i].map && GAN_KEYS.indexOf(key) >= 0) _ganDraft[i].map[key] = v;
  }

  function addGanGroup() {
    var n = _ganDraft.length + 1;
    var name = '新组';
    while (true) {
      var dup = false;
      for (var i = 0; i < _ganDraft.length; i++) {
        if (_ganDraft[i].name === name) { dup = true; break; }
      }
      if (!dup) break;
      name = '新组' + (++n);
    }
    var map = {};
    for (var j = 0; j < GAN_KEYS.length; j++) map[GAN_KEYS[j]] = '';
    _ganDraft.push({ name: name, map: map });
    renderGanSettingsList();
  }

  function removeGanGroup(i) {
    _ganDraft.splice(i, 1);
    renderGanSettingsList();
  }

  function resetGanGroups() {
    _ganDraft = JSON.parse(JSON.stringify(DEFAULT_GAN_GROUPS));
    renderGanSettingsList();
  }

  function saveGanSettings() {
    var groups = normalizeGroups(_ganDraft, GAN_KEYS);
    persistGanGroups(groups);
    var names = {};
    for (var i = 0; i < groups.length; i++) names[groups[i].name] = 1;
    var oldSel = loadGanSelected();
    var sel = [];
    for (var j = 0; j < oldSel.length; j++) {
      if (names[oldSel[j]] && sel.indexOf(oldSel[j]) < 0) sel.push(oldSel[j]);
    }
    persistGanSelected(sel);
    closeGanSettings();
    rebuildPanels();
    refresh();
  }

  window.SSH = {
    SHI_SHEN_KEYS: SHI_SHEN_KEYS,
    DEFAULT_GROUPS: DEFAULT_GROUPS,
    esc: esc,
    loadGroups: loadGroups,
    persistGroups: persistGroups,
    loadSelected: loadSelected,
    persistSelected: persistSelected,
    selectedGroups: selectedGroups,
    groupByName: groupByName,
    mapName: mapName,
    renderPanel: renderPanel,
    togglePanel: togglePanel,
    closePanel: closePanel,
    toggleGroup: toggleGroup,
    selectAll: selectAll,
    clearAll: clearAll,
    openSettings: openSettings,
    closeSettings: closeSettings,
    setGroupName: setGroupName,
    setMap: setMap,
    addGroup: addGroup,
    removeGroup: removeGroup,
    resetGroups: resetGroups,
    saveSettings: saveSettings,
    refresh: refresh
  };

  // 十干对应：与 SSH 同构的独立命名空间（独立组表 + 独立勾选，不改动十神组配置）
  window.GAN = {
    GAN_KEYS: GAN_KEYS,
    DEFAULT_GROUPS: DEFAULT_GAN_GROUPS,
    loadGroups: loadGanGroups,
    persistGroups: persistGanGroups,
    loadSelected: loadGanSelected,
    persistSelected: persistGanSelected,
    selectedGroups: selectedGanGroups,
    groupByName: ganGroupByName,
    mapName: ganMapName,
    renderPanel: renderGanPanel,
    togglePanel: toggleGanPanel,
    closePanel: closeGanPanel,
    toggleGroup: toggleGanGroup,
    selectAll: ganSelectAll,
    clearAll: ganClearAll,
    openSettings: openGanSettings,
    closeSettings: closeGanSettings,
    setGroupName: setGanGroupName,
    setMap: setGanMap,
    addGroup: addGanGroup,
    removeGroup: removeGanGroup,
    resetGroups: resetGanGroups,
    saveSettings: saveGanSettings,
    refresh: refresh
  };
})();
