/* 八字排盘 v0.30.0 — xingyao.js */
(function() {

  // ===== 别名：来自 constants.js =====
  var TG = CONST.TG;
  var DZ = CONST.DZ;
  var NAYIN = CONST.NAYIN;

  // ===== v0.29.0 星曜 — 常量 =====
  var XY_SCHEMA_VERSION = 1;
  var XY_STORE_KEY = 'bz_xingyao_map';        // 真实数据键
  var XY_TEST_KEY = 'bz_xingyao_map__test';   // ?test=1 测试态隔离键（不污染真实数据）

  // 运行时映射（gz → { name, system }），由 init() / save() / applyImportPayload() 维护
  var RUNTIME_MAP = {};

  // ===== v0.30.0 星曜 — 分组与视图态（搜索） =====
  var XY_GROUP_SIZE = 20;   // 每组 20 个干支
  var XY_GROUP_N = 3;       // 三组（60 = 3 × 20）
  var _xyComposing = false; // 输入法组合态闸门（ADR §3.4）
  var _rows = [];           // 数据行引用缓存 [{gz, tr, group}]（过滤时只写不读）
  // r6 / FR3.4：三栏栏头改为静态 div.xy-group-title（在表格上方 .xy-groups-heads 内，
  // 不在 <tbody> 内、无 data-gz），renderSettings 不再生成 tr.xy-group-row ⇒
  // 原「组标题行引用缓存」已无对象，按「不留幽灵白名单」原则一并移除。

  // ===== v0.29.0 星曜 — 基础工具 =====
  function xyIsTestMode() {
    return /[?&]test=1(&|$)/.test(location.search);
  }
  function storeKey() {
    return xyIsTestMode() ? XY_TEST_KEY : XY_STORE_KEY;
  }
  function nowISO() { return new Date().toISOString(); }

  // 六十甲子正序（甲子→癸亥），与 NAYIN 表键一致
  function generate60() {
    var arr = [];
    for (var i = 0; i < 60; i++) arr.push(TG[i % 10] + DZ[i % 12]);
    return arr;
  }
  var XY_GZ60 = generate60();
  function isGz(gz) { return XY_GZ60.indexOf(gz) >= 0; }
  function emptyMap() {
    var m = {};
    for (var i = 0; i < 60; i++) m[XY_GZ60[i]] = { name: '', system: '' };
    return m;
  }

  // 属性值转义（input value / title 用）
  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // 文本节点转义（单元格内容用）
  function escText(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 规范化：补齐 60 键、忽略多余键（console.warn），空串 = 未填
  function normalizeMap(raw) {
    var m = emptyMap();
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      var extra = [];
      for (var k in raw) {
        if (!Object.prototype.hasOwnProperty.call(raw, k)) continue;
        if (isGz(k)) {
          var v = raw[k] || {};
          m[k] = {
            name: String(v.name == null ? '' : v.name),
            system: String(v.system == null ? '' : v.system)
          };
        } else {
          extra.push(k);
        }
      }
      if (extra.length && typeof console !== 'undefined' && console.warn) {
        console.warn('【星曜】已忽略非六十甲子键：', extra);
      }
    }
    return m;
  }

  // ===== v0.29.0 星曜 — localStorage 容错访问 =====
  var _lsOk = true;
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { _lsOk = false; return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (e) { _lsOk = false; return false; }
  }
  function lsRemove(key) { try { localStorage.removeItem(key); } catch (e) {} }

  function notifyCorrupt() {
    if (xyIsTestMode()) return;   // 测试态静默，避免阻塞断言
    try { alert('星曜数据已损坏，已为您备份原数据并恢复为空。'); } catch (e) {}
  }
  // 同键名 corrupt 备份只保留最近 1 份（命名带时间戳区分来源）
  function backupCorrupt(raw) {
    var prefix = storeKey() + '_corrupt_';
    var toRemove = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) toRemove.push(k);
      }
      for (var j = 0; j < toRemove.length; j++) localStorage.removeItem(toRemove[j]);
      localStorage.setItem(prefix + Date.now(), raw);
    } catch (e) {}
  }

  // ===== v0.29.0 星曜 — 读取 / 持久化 =====
  function loadFromStorage() {
    var raw = lsGet(storeKey());
    if (!raw) return emptyMap();                 // 缺失（首启）→ 全空，不提示
    var obj = null;
    try { obj = JSON.parse(raw); } catch (e) { obj = null; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {  // 损坏 → 备份 + 提示 + 全空
      backupCorrupt(raw); notifyCorrupt(); return emptyMap();
    }
    if (!obj.map || typeof obj.map !== 'object' || Array.isArray(obj.map)) {
      backupCorrupt(raw); notifyCorrupt(); return emptyMap();
    }
    // schemaVersion 高于当前 → 只读降级：忽略未知字段、缺失字段补空，不崩溃
    return normalizeMap(obj.map);
  }

  function persistSavedMap() {
    var payload = {
      schemaVersion: XY_SCHEMA_VERSION,
      updatedAt: nowISO(),
      map: normalizeMap(RUNTIME_MAP)
    };
    lsSet(storeKey(), JSON.stringify(payload));
    return payload;
  }

  function init() {
    RUNTIME_MAP = loadFromStorage();
    bindSearchEvents();
    return RUNTIME_MAP;
  }

  // ===== v0.29.0 星曜 — 查表（渲染期调用） =====
  function nameOf(gz) {
    if (!gz || typeof gz !== 'string') return '—';
    var e = RUNTIME_MAP[gz];
    var nm = e && e.name ? e.name : '';
    return nm || '—';                // 未填 → '—'（D3：行始终存在）
  }
  function systemOf(gz) {
    if (!gz || typeof gz !== 'string') return '';
    var e = RUNTIME_MAP[gz];
    return (e && e.system) || '';
  }
  function getAll() { return normalizeMap(RUNTIME_MAP); }

  // ===== v0.29.0 星曜 — 设置页 =====
  // v0.30.0：分组标题文案（PRD FR3.3 定稿，分隔符 U+2013）
  function groupTitle(n) {
    var first = XY_GZ60[(n - 1) * XY_GROUP_SIZE];
    var last = XY_GZ60[n * XY_GROUP_SIZE - 1];
    return '第 ' + n + ' 组 · ' + first + ' \u2013 ' + last;
  }
  // 行引用缓存：过滤时只写不读（避免 forced reflow）
  function buildRowCache(tbody) {
    _rows = [];
    var trs = tbody.querySelectorAll('tr[data-gz]');
    for (var i = 0; i < trs.length; i++) {
      _rows.push({
        gz: trs[i].getAttribute('data-gz'),
        tr: trs[i],
        group: parseInt(trs[i].getAttribute('data-xy-group'), 10) || 1
      });
    }
    return _rows.length;
  }
  function renderSettings() {
    var tbody = document.getElementById('xySettingsList');
    if (!tbody) return false;
    var html = '';
    // r6 / FR3.4：栏头为静态 div.xy-group-title（HTML 硬编码），此处只生成 60 个数据行；
    // 分组仅通过 data-xy-group 标记，切栏由 CSS Grid 完成（不新增运行时类）。
    for (var g = 1; g <= XY_GROUP_N; g++) {
      for (var i = (g - 1) * XY_GROUP_SIZE; i < g * XY_GROUP_SIZE; i++) {
        var gz = XY_GZ60[i];
        var ny = (NAYIN && NAYIN[gz]) ? NAYIN[gz] : '';   // v0.30.0：完整纳音名（原为末字五行）
        var e = RUNTIME_MAP[gz] || { name: '', system: '' };
        html += '<tr data-gz="' + gz + '" data-xy-group="' + g + '">'
          + '<td class="xy-gz">' + gz + '</td>'
          + '<td class="xy-nayin">' + escText(ny || '—') + '</td>'
          + '<td><input type="text" class="xy-name" maxlength="8" value="' + escAttr(e.name) + '"></td>'
          + '<td><input type="text" class="xy-system" maxlength="12" value="' + escAttr(e.system) + '"></td>'
          + '</tr>';
      }
    }
    tbody.innerHTML = html;
    buildRowCache(tbody);
    return true;
  }
  // v0.30.0：搜索框事件绑定（ADR §6.3 明确允许「等价的 addEventListener」）。
  // 实测 Chrome 不会把 oncompositionstart / oncompositionend 内联属性编译为
  // 事件处理器（el.oncompositionstart === undefined），故必须用 JS 绑定才能
  // 让 IME 组合态闸门在真实输入法下生效；内联属性保留（DOM 契约）。
  function bindSearchEvents() {
    var inp = document.getElementById('xySearchInput');
    if (!inp || inp.__xySearchBound) return false;
    inp.__xySearchBound = true;
    inp.addEventListener('compositionstart', function() { onCompositionStart(); });
    inp.addEventListener('compositionend', function() {
      var el = document.getElementById('xySearchInput');
      onCompositionEnd(el ? el.value : '');
    });
    return true;
  }
  function openSettings() {
    renderSettings();                 // 草稿由「已保存值」初始化
    bindSearchEvents();
    resetSearchUI();                  // 每次打开都复位为「全量」视图（不带焦点副作用）
    var ov = document.getElementById('xySettingsOverlay');
    if (ov) ov.classList.add('show');
    var first = document.querySelector('#xySettingsList .xy-name');
    if (first && typeof first.focus === 'function') { try { first.focus(); } catch (e) {} }
    return true;
  }
  function hideOverlay() {
    var ov = document.getElementById('xySettingsOverlay');
    if (ov) ov.classList.remove('show');
  }
  // D10：草稿 ≠ 已保存 → 等同还原（丢弃草稿）；下次 openSettings 会由已保存值重填
  function closeSettings() {
    hideOverlay();
    return true;
  }
  // 清空：草稿全部输入置空（不落盘）
  function clear() {
    var els = document.querySelectorAll('#xySettingsList .xy-name, #xySettingsList .xy-system');
    for (var i = 0; i < els.length; i++) els[i].value = '';
    return true;
  }
  // 还原：丢弃草稿，用「已保存值」重填；重填后保留当前搜索词并重新筛选（FR6.3）
  function restore() {
    renderSettings();
    _xyComposing = false;
    var inp = document.getElementById('xySearchInput');
    filterRows(inp ? inp.value : '');
    return true;
  }
  function collectDraft() {
    var map = {};
    var rows = document.querySelectorAll('#xySettingsList tr[data-gz]');
    for (var i = 0; i < rows.length; i++) {
      var gz = rows[i].getAttribute('data-gz');
      var nEl = rows[i].querySelector('.xy-name');
      var sEl = rows[i].querySelector('.xy-system');
      map[gz] = { name: nEl ? nEl.value : '', system: sEl ? sEl.value : '' };
    }
    return normalizeMap(map);
  }
  // 保存：草稿 → 持久化 → 盘面值级刷新 → 关闭
  function save() {
    RUNTIME_MAP = collectDraft();
    persistSavedMap();
    refresh();
    hideOverlay();
    if (!xyIsTestMode()) { try { alert('星曜已保存'); } catch (e) {} }
    return true;
  }

  // 值级刷新（不重排盘、不动分级态）
  function refresh() {
    if (window.RENDER && typeof RENDER.refreshXingyaoRows === 'function') {
      try { RENDER.refreshXingyaoRows(); } catch (e) {}
    }
  }

  // ===== v0.29.0 星曜 — 导出 / 导入 JSON =====
  function tsStamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }
  function buildExportPayload() {
    return {
      app: 'bazi-paipan',
      config: 'xingyao',
      schemaVersion: XY_SCHEMA_VERSION,
      exportedAt: nowISO(),
      map: normalizeMap(RUNTIME_MAP)
    };
  }
  function exportJson() {
    var payload = buildExportPayload();
    try {
      var text = JSON.stringify(payload, null, 2);
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '八字排盘_星曜配置_' + tsStamp() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
    } catch (e) {}
    return payload;
  }
  function validateImportPayload(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, error: '文件不是有效的星曜配置 JSON' };
    }
    if (obj.app && obj.app !== 'bazi-paipan') {
      return { ok: false, error: '不是八字排盘配置（app 字段不符）' };
    }
    if (obj.config && obj.config !== 'xingyao') {
      return { ok: false, error: '不是星曜配置（config 字段不符）' };
    }
    if (!obj.map || typeof obj.map !== 'object' || Array.isArray(obj.map)) {
      return { ok: false, error: '缺少有效的 map 字段' };
    }
    return { ok: true };
  }
  // 校验失败绝不写盘、绝不产生 backup 键；成功后先备份旧值再覆盖
  function applyImportPayload(obj) {
    var v = validateImportPayload(obj);
    if (!v.ok) return v;
    var old = lsGet(storeKey());
    if (old) lsSet(storeKey() + Date.now() + '.backup', old);
    RUNTIME_MAP = normalizeMap(obj.map);
    persistSavedMap();
    refresh();
    restore();                        // D-02：导入后回填设置页草稿（否则「保存并关闭」用空草稿覆盖刚导入的数据）
    return { ok: true };
  }
  function importJsonPrompt() {
    var input = document.getElementById('xyFileImport');
    if (input) input.click();
  }
  function handleImportFile(event) {
    var file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      var obj = null;
      try { obj = JSON.parse(reader.result); } catch (e) { obj = null; }
      if (!obj) {
        if (!xyIsTestMode()) { try { alert('文件不是有效的星曜配置 JSON'); } catch (e) {} }
        return;
      }
      var v = validateImportPayload(obj);
      if (!v.ok) {
        if (!xyIsTestMode()) { try { alert(v.error); } catch (e) {} }
        return;
      }
      var r = applyImportPayload(obj);
      if (r.ok && !xyIsTestMode()) { try { alert('星曜配置已导入'); } catch (e) {} }
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  }

  // ===== v0.30.0 星曜 — 搜索（纯视图态：只改显隐，不落盘、不重渲染、不删 DOM） =====
  function setHidden(el, hidden) {
    if (el && el.hidden !== hidden) el.hidden = hidden;
  }
  // 输入法组合态闸门：拼音未上屏不筛（ADR §3.4 / PRD FR1.3.1）
  function onCompositionStart() { _xyComposing = true; return true; }
  function onCompositionEnd(value) { _xyComposing = false; return filterRows(value); }
  function isComposing() { return _xyComposing; }
  // 复位搜索 UI（无焦点副作用；由 openSettings 调用）
  function resetSearchUI() {
    var inp = document.getElementById('xySearchInput');
    if (inp) inp.value = '';
    _xyComposing = false;
    for (var i = 0; i < _rows.length; i++) setHidden(_rows[i].tr, false);
    var cnt = document.getElementById('xySearchCount');
    if (cnt) { cnt.hidden = true; cnt.textContent = ''; }
    var empty = document.getElementById('xySearchEmpty');
    if (empty) empty.hidden = true;
    var clr = document.getElementById('xySearchClear');
    if (clr) clr.hidden = true;
    return true;
  }
  // 过滤入口（input 直连，无防抖）：子串包含，仅写 hidden，不读几何属性
  function filterRows(value) {
    var raw = (value == null ? '' : String(value));
    if (_xyComposing) return { hit: -1, total: _rows.length, query: raw, composing: true };
    // 视图态一致性：程序化调用（测试/还原路径）也把输入框同步为同一查询
    var inp = document.getElementById('xySearchInput');
    if (inp && inp.value !== raw) inp.value = raw;
    var q = raw.trim();
    var hit = 0;
    for (var i = 0; i < _rows.length; i++) {
      var r = _rows[i];
      var ok = (q === '') || (r.gz.indexOf(q) !== -1);
      if (ok) hit++;
      setHidden(r.tr, !ok);
    }
    // r6 / FR3.8：栏头为静态元素、与筛选无联动，空栏保留占位（避免横向跳动）
    var cnt = document.getElementById('xySearchCount');
    if (cnt) {
      if (q === '') { cnt.textContent = ''; cnt.hidden = true; }
      else { cnt.textContent = '命中 ' + hit + ' 项'; cnt.hidden = false; }
    }
    var empty = document.getElementById('xySearchEmpty');
    if (empty) empty.hidden = !(q !== '' && hit === 0);
    var clr = document.getElementById('xySearchClear');
    if (clr) clr.hidden = (raw.length === 0);
    return { hit: hit, total: _rows.length, query: q };
  }
  function clearSearch() {
    resetSearchUI();
    var inp = document.getElementById('xySearchInput');
    if (inp && typeof inp.focus === 'function') { try { inp.focus(); } catch (e) {} }
    return true;
  }

  // ===== v0.29.0 星曜 — 测试辅助 =====
  function resetTestStore() {
    lsRemove(XY_TEST_KEY);
    try {
      var rm = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(XY_TEST_KEY + '_corrupt_') === 0) rm.push(k);
        if (k && k.indexOf(XY_TEST_KEY) === 0 && k.indexOf('.backup') > 0) rm.push(k);
      }
      for (var j = 0; j < rm.length; j++) localStorage.removeItem(rm[j]);
    } catch (e) {}
    RUNTIME_MAP = emptyMap();
    return true;
  }
  function gz60() { return XY_GZ60.slice(); }

  // ===== 初始化（模块加载即读 localStorage） =====
  init();

  // ===== 挂载到全局命名空间 =====
  window.XINGYAO = {
    XY_SCHEMA_VERSION: XY_SCHEMA_VERSION,
    XY_STORE_KEY: XY_STORE_KEY,
    XY_TEST_KEY: XY_TEST_KEY,
    xyIsTestMode: xyIsTestMode,
    init: init,
    nameOf: nameOf,
    systemOf: systemOf,
    getAll: getAll,
    gz60: gz60,
    openSettings: openSettings,
    closeSettings: closeSettings,
    renderSettings: renderSettings,
    collectDraft: collectDraft,
    clear: clear,
    restore: restore,
    save: save,
    refresh: refresh,
    buildExportPayload: buildExportPayload,
    exportJson: exportJson,
    validateImportPayload: validateImportPayload,
    applyImportPayload: applyImportPayload,
    importJsonPrompt: importJsonPrompt,
    handleImportFile: handleImportFile,
    resetTestStore: resetTestStore,
    // v0.30.0 搜索（搜索态为纯视图态，不落盘）
    filterRows: filterRows,
    clearSearch: clearSearch,
    resetSearchUI: resetSearchUI,
    onCompositionStart: onCompositionStart,
    onCompositionEnd: onCompositionEnd,
    isComposing: isComposing,
    groupTitle: groupTitle,
    XY_GROUP_SIZE: XY_GROUP_SIZE,
    XY_GROUP_N: XY_GROUP_N,
  };
})();
