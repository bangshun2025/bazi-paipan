/* 八字排盘 v0.54.0 — hepan.js */
/* 合盘档案：把排盘对比（当前组合）存为合盘档案，可从档案界面一键恢复对比界面；合盘界面内置分析记录（写入即存，按合盘 id 隔离，未存档组合用稳定指纹 key） */
(function() {
  'use strict';

  var HP_KEY = 'bz_hepans_v1';
  var NOTES_KEY = 'bz_hepan_notes_';
  var CMP_KEY = 'bz_cmp_state'; // 与 render.js CMP_KEY 同源，改动需两处同步

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (e) { return false; }
  }
  function lsRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function normalizeEntries(raw) {
    var arr = Array.isArray(raw) ? raw : [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      if (!e || typeof e !== 'object') continue;
      if (e.type === 'current') out.push({ type: 'current' });
      else if (e.type === 'arch' && e.id != null) out.push({ type: 'arch', id: e.id });
    }
    return out;
  }

  function getHePans() {
    var raw = lsGet(HP_KEY);
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var h = arr[i];
        if (!h || !h.id) continue;
        out.push({ id: String(h.id), name: String(h.name || '未命名合盘'), entries: normalizeEntries(h.entries), createdAt: h.createdAt || '' });
      }
      return out;
    } catch (e) { return []; }
  }

  function saveHePans(list) {
    return lsSet(HP_KEY, JSON.stringify(list));
  }

  function entriesSig(entries) {
    var arr = normalizeEntries(entries);
    var parts = [];
    for (var i = 0; i < arr.length; i++) {
      parts.push(arr[i].type === 'current' ? 'cur' : 'a' + arr[i].id);
    }
    return parts.join('|');
  }

  function matchHePan(entries) {
    var sig = entriesSig(entries);
    if (!sig) return null;
    var list = getHePans();
    for (var i = 0; i < list.length; i++) {
      if (entriesSig(list[i].entries) === sig) return list[i];
    }
    return null;
  }

  function noteKeyFor(entries) {
    var hp = matchHePan(entries);
    if (hp) return NOTES_KEY + hp.id;
    var sig = entriesSig(entries);
    return sig ? NOTES_KEY + 'fp-' + sig : null;
  }

  function currentCmpEntries() {
    var raw = lsGet(CMP_KEY);
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  // ===== 保存（CMP 工具栏入口）=====
  function saveFromCmp() {
    var entries = currentCmpEntries();
    if (!entries.length) {
      alert('当前对比未选择任何盘面，先勾选档案再加入对比');
      return;
    }
    var exist = matchHePan(entries);
    var defName = exist ? exist.name : defaultName(entries);
    var name = prompt('合盘名称：', defName);
    if (name == null) return;
    name = String(name).trim();
    if (!name) { alert('名称不能为空'); return; }
    var list = getHePans();
    if (exist) {
      if (!confirm('「' + exist.name + '」已存在，覆盖更新？')) return;
      // exist 是 matchHePan 内部另一次 getHePans 的对象引用，直接改它会脱节，必须按 id 在本 list 内改
      for (var k = 0; k < list.length; k++) {
        if (list[k].id === exist.id) { list[k].name = name; break; }
      }
      saveHePans(list);
    } else {
      list.push({ id: 'hp_' + Date.now().toString(36), name: name, entries: normalizeEntries(entries), createdAt: new Date().toISOString().slice(0, 10) });
      saveHePans(list);
    }
    // fp key 里的旧记录迁移到 id key
    var fpKey = NOTES_KEY + 'fp-' + entriesSig(entries);
    var hp = matchHePan(entries);
    if (hp) {
      var idKey = NOTES_KEY + hp.id;
      var old = lsGet(fpKey);
      if (old != null && lsGet(idKey) == null) {
        lsSet(idKey, old);
        lsRemove(fpKey);
      }
    }
    renderHePanModal();
  }

  // ARCHIVE 方法内部引用裸 APP，APP 挂载前调用会抛 ReferenceError，这里统一兜底
  function archGetFormData() {
    if (!window.ARCHIVE || typeof ARCHIVE.getFormData !== 'function') return null;
    try { return ARCHIVE.getFormData(); } catch (e) { return null; }
  }

  function archGetArchives() {
    if (!window.ARCHIVE || typeof ARCHIVE.getArchives !== 'function') return [];
    try { return ARCHIVE.getArchives() || []; } catch (e) { return []; }
  }

  function defaultName(entries) {
    var names = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.type === 'current') {
        var f = archGetFormData();
        names.push((f && (f.nickname || f.name)) || '当前盘');
      } else if (window.ARCHIVE) {
        var ars = archGetArchives();
        for (var j = 0; j < ars.length; j++) {
          if (String(ars[j].id) === String(e.id)) { names.push(ARCHIVE.getDisplayName ? ARCHIVE.getDisplayName(ars[j]) : ars[j].name); break; }
        }
      }
    }
    return names.length ? names.join('×') + ' 合盘' : '未命名合盘';
  }

  function entryDesc(e) {
    if (!e) return '';
    if (e.type === 'current') {
      var f = archGetFormData();
      return (f && (f.nickname || f.name)) || '当前盘';
    }
    if (window.ARCHIVE) {
      var ars = archGetArchives();
      for (var i = 0; i < ars.length; i++) {
        if (String(ars[i].id) === String(e.id)) return ARCHIVE.getDisplayName ? ARCHIVE.getDisplayName(ars[i]) : ars[i].name;
      }
    }
    return '(档案已删)';
  }

  // ===== 打开 / 重命名 / 删除 =====
  function openHePan(id) {
    var hp = null;
    var list = getHePans();
    for (var i = 0; i < list.length; i++) { if (list[i].id === String(id)) { hp = list[i]; break; } }
    if (!hp) { alert('合盘不存在或已删除'); renderHePanModal(); return; }
    if (!window.COMPARE || typeof COMPARE._setState !== 'function') { alert('对比模块未就绪'); return; }
    COMPARE._setState(hp.entries);
    closePanel();
    COMPARE.open();
  }

  function renameHePan(id) {
    var list = getHePans();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === String(id)) {
        var name = prompt('新的合盘名称：', list[i].name);
        if (name == null) return;
        name = String(name).trim();
        if (!name) { alert('名称不能为空'); return; }
        list[i].name = name;
        saveHePans(list);
        renderHePanModal();
        return;
      }
    }
  }

  function deleteHePan(id) {
    var list = getHePans();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === String(id)) {
        if (!confirm('确定删除合盘「' + list[i].name + '」？其分析记录将一并删除，此操作不可恢复。')) return;
        lsRemove(NOTES_KEY + list[i].id);
        list.splice(i, 1);
        saveHePans(list);
        renderHePanModal();
        return;
      }
    }
  }

  // ===== 弹窗 =====
  var _searchKeyword = '';

  function openPanel() {
    _searchKeyword = '';
    var searchEl = document.getElementById('hepan-search');
    if (searchEl) searchEl.value = '';
    if (window.ARCHIVE && typeof ARCHIVE.closeArchivePanel === 'function') ARCHIVE.closeArchivePanel();
    renderHePanModal();
    var ov = document.getElementById('hepanOverlay');
    if (ov) ov.classList.add('show');
    if (searchEl) setTimeout(function() { searchEl.focus(); }, 100);
  }

  function closePanel() {
    var ov = document.getElementById('hepanOverlay');
    if (ov) ov.classList.remove('show');
  }

  function onHePanSearch(v) {
    _searchKeyword = String(v || '');
    renderHePanModal();
  }

  function renderHePanModal() {
    var listEl = document.getElementById('hepan-modal-list');
    if (!listEl) return;
    var list = getHePans();
    if (!list.length) {
      listEl.innerHTML = '<div class="archive-modal-empty">暂无合盘 —— 打开「盘面对比」勾选盘面后，点「💾 存为合盘」</div>';
      return;
    }
    var k = _searchKeyword.trim().toLowerCase();
    var html = '';
    var hit = 0;
    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      var desc = [];
      for (var j = 0; j < h.entries.length; j++) desc.push(entryDesc(h.entries[j]));
      var rowText = (h.name + ' ' + desc.join(' ')).toLowerCase();
      if (k && rowText.indexOf(k) < 0) continue;
      html += '<div class="hepan-row" data-id="' + esc(h.id) + '">'
        + '<div class="hepan-row-main">'
        + '<span class="hepan-row-name">' + esc(h.name) + '</span>'
        + '<span class="hepan-row-meta">' + h.entries.length + '盘 · ' + esc(desc.join(' × ')) + '</span>'
        + (h.createdAt ? '<span class="hepan-row-date">' + esc(h.createdAt) + '</span>' : '')
        + '</div>'
        + '<div class="hepan-row-ops">'
        + '<button class="hepan-btn hepan-btn-open" onclick="HEPAN.openHePan(\'' + esc(h.id) + '\')">打开</button>'
        + '<button class="hepan-btn" onclick="HEPAN.renameHePan(\'' + esc(h.id) + '\')" title="重命名">✏️</button>'
        + '<button class="hepan-btn" onclick="HEPAN.deleteHePan(\'' + esc(h.id) + '\')" title="删除">🗑️</button>'
        + '</div>'
        + '</div>';
      hit++;
    }
    listEl.innerHTML = hit ? html : '<div class="archive-modal-empty">未找到匹配合盘</div>';
  }

  // ===== 合盘分析记录（CMP 内） =====
  function toggleCmpRec(btn) {
    var panel = document.getElementById('cmpRecPanel');
    if (!panel) return false;
    var on = !panel.classList.contains('open');
    panel.classList.toggle('open', on);
    if (btn) btn.classList.toggle('active', on);
    if (on) refreshCmpRec();
    return on;
  }

  function refreshCmpRec() {
    var panel = document.getElementById('cmpRecPanel');
    if (!panel || !panel.classList.contains('open')) return;
    var ta = panel.querySelector('.rec-text');
    if (!ta) return;
    var key = noteKeyFor(currentCmpEntries());
    ta.value = key ? (lsGet(key) || '') : '';
    autoGrow(ta);
  }

  function autoGrow(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  function bindCmpRec() {
    var ta = document.getElementById('cmpRecText');
    if (!ta || ta._hepanBound) return;
    ta._hepanBound = true;
    ta.addEventListener('input', function() {
      autoGrow(ta);
      var key = noteKeyFor(currentCmpEntries());
      if (!key) return;
      lsSet(key, ta.value);
      var st = document.getElementById('cmpRecStatus');
      if (st) {
        st.textContent = '已保存 ' + new Date().toTimeString().slice(0, 8);
        st.classList.add('show');
        clearTimeout(st._t);
        st._t = setTimeout(function() { st.classList.remove('show'); }, 1500);
      }
    });
  }

  window.HEPAN = {
    HP_KEY: HP_KEY,
    NOTES_KEY: NOTES_KEY,
    getHePans: getHePans,
    saveHePan: function(name, entries) {
      var list = getHePans();
      var hp = { id: 'hp_' + Date.now().toString(36), name: String(name || '').trim() || '未命名合盘', entries: normalizeEntries(entries), createdAt: new Date().toISOString().slice(0, 10) };
      list.push(hp);
      saveHePans(list);
      return hp;
    },
    entriesSig: entriesSig,
    matchHePan: matchHePan,
    noteKeyFor: noteKeyFor,
    currentCmpEntries: currentCmpEntries,
    saveFromCmp: saveFromCmp,
    openHePan: openHePan,
    renameHePan: renameHePan,
    deleteHePan: deleteHePan,
    openPanel: openPanel,
    closePanel: closePanel,
    onHePanSearch: onHePanSearch,
    renderHePanModal: renderHePanModal,
    toggleCmpRec: toggleCmpRec,
    refreshCmpRec: refreshCmpRec,
    bindCmpRec: bindCmpRec
  };

  bindCmpRec();
})();
