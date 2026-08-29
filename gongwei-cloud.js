/* 八字排盘 v0.25.0 — gongwei-cloud.js */
(function() {
  'use strict';
  var currentUser = null;
  var dirtyTimer = null;
  var lastSyncError = null;

  function isTestMode() { return /[\?&]test=1(&|$)/.test(location.search); }

  function getSb() {
    if (window.AUTH && typeof window.AUTH.getClient === 'function') return window.AUTH.getClient();
    return null;
  }
  function isLoggedIn() {
    if (window.AUTH && typeof window.AUTH.isLoggedIn === 'function') return window.AUTH.isLoggedIn();
    return !!currentUser;
  }

  function readLocalConfig() {
    function read(key, fb) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return fb;
        var v = JSON.parse(raw);
        return Array.isArray(v) ? v : fb;
      } catch (e) { return fb; }
    }
    var schema = 1;
    try { schema = parseInt(localStorage.getItem('bz_gongwei_schema_version') || '1', 10) || 1; } catch (e) {}
    return {
      groups: read('bz_gongwei_groups', []),
      trash: read('bz_gongwei_trash', []),
      selected: read('bz_gongwei_selected', []),
      fav: read('bz_gongwei_fav', []),
      schema_version: schema
    };
  }

  function writeLocalConfig(cfg) {
    try {
      localStorage.setItem('bz_gongwei_groups', JSON.stringify(cfg.groups || []));
      localStorage.setItem('bz_gongwei_trash', JSON.stringify(cfg.trash || []));
      localStorage.setItem('bz_gongwei_selected', JSON.stringify(cfg.selected || []));
      localStorage.setItem('bz_gongwei_fav', JSON.stringify(cfg.fav || []));
      localStorage.setItem('bz_gongwei_schema_version', String(cfg.schema_version || 1));
    } catch (e) {}
  }

  function pushCloudConfig() {
    var sb = getSb();
    if (!sb || !currentUser) return Promise.resolve({ ok: false, reason: 'no-auth' });
    var cfg = readLocalConfig();
    return sb.from('user_gongwei_config').upsert({
      user_id: currentUser.id,
      groups: cfg.groups,
      trash: cfg.trash,
      selected: cfg.selected,
      fav: cfg.fav,
      schema_version: cfg.schema_version,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).then(function(res) {
      if (res && res.error) {
        lastSyncError = (res.error.message) || 'push failed';
        console.warn('[gongwei-cloud] push 失败(静默降级本地):', res.error);
        return { ok: false, reason: lastSyncError };
      }
      lastSyncError = null;
      return { ok: true };
    }).catch(function(e) {
      lastSyncError = (e && e.message) || 'push exception';
      console.warn('[gongwei-cloud] push 异常(静默降级本地):', e);
      return { ok: false, reason: lastSyncError };
    });
  }

  function pullCloudConfig() {
    var sb = getSb();
    if (!sb || !currentUser) return Promise.resolve({ ok: false, reason: 'no-auth' });
    return sb.from('user_gongwei_config').select('*').eq('user_id', currentUser.id).maybeSingle().then(function(res) {
      if (res && res.error) {
        lastSyncError = (res.error.message) || 'pull failed';
        console.warn('[gongwei-cloud] pull 失败(静默降级本地):', res.error);
        return { ok: false, reason: lastSyncError };
      }
      var row = res && res.data;
      if (row) {
        // 云端为准：覆盖本地 4 键 + schema，再刷新宫位 UI
        writeLocalConfig({
          groups: row.groups, trash: row.trash,
          selected: row.selected, fav: row.fav,
          schema_version: row.schema_version || 1
        });
        if (window.GONGWEI && typeof window.GONGWEI.refreshGongWeiState === 'function') {
          window.GONGWEI.refreshGongWeiState();
        }
        lastSyncError = null;
        return { ok: true, source: 'cloud' };
      }
      // 云端无记录 → 本地首传
      return pushCloudConfig().then(function(r) {
        return { ok: r.ok, source: 'first-push' };
      });
    }).catch(function(e) {
      lastSyncError = (e && e.message) || 'pull exception';
      console.warn('[gongwei-cloud] pull 异常(静默降级本地):', e);
      return { ok: false, reason: lastSyncError };
    });
  }

  function markDirty() {
    if (!isLoggedIn()) return; // 未登录纯本地，零网络请求（AC13）
    if (dirtyTimer) clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(function() { dirtyTimer = null; pushCloudConfig(); }, 3000);
  }

  function onLogin(user) {
    currentUser = user;
    if (dirtyTimer) { clearTimeout(dirtyTimer); dirtyTimer = null; }
    if (!getSb()) { console.warn('[gongwei-cloud] Supabase 未就绪，降级本地'); return; }
    pullCloudConfig(); // 云端为准 / 无记录首传本地；失败静默降级
  }

  function onLogout() {
    if (dirtyTimer) { clearTimeout(dirtyTimer); dirtyTimer = null; }
    currentUser = null; // 本地不回退（PRD FR5）
    lastSyncError = null;
  }

  function getLastSyncError() { return lastSyncError; }

  window.GONGWEI_CLOUD = {
    onLogin: onLogin,
    onLogout: onLogout,
    markDirty: markDirty,
    pullCloudConfig: pullCloudConfig,
    pushCloudConfig: pushCloudConfig,
    getLastSyncError: getLastSyncError,
    _test: {
      isLoggedIn: isLoggedIn,
      readLocalConfig: readLocalConfig,
      writeLocalConfig: writeLocalConfig
    }
  };
})();
