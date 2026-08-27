/* 八字排盘 v0.24.0 — auth.js（Supabase 账号模块）
 * ------------------------------------------------------------
 * 职责：登录/注册/登出 UI + 会话管理（30 天免登录）+ 未登录拦截排盘
 * 依赖：config.js（window.SUPABASE_CONFIG）+ supabase-js v2（CDN 全局 supabase）
 * 加载顺序：supabase-js(CDN) → constants → algorithm → archive → gongwei
 *           → render → main → auth → records
 */
(function() {

  var CFG = (window.SUPABASE_CONFIG || {});
  var sb = null;          // supabase client
  var currentUser = null; // 当前登录用户（null = 未登录）

  // 会话 key（Supabase SDK 自动写入 localStorage，仅作展示/判断用）
  var MIGRATED_KEY = 'PAIPAN_MIGRATED';
  var PRESET_KEY = 'PAIPAN_PRESET_MIGRATED';
  var REMEMBER_EMAIL_KEY = 'bz_remember_email';

  // ===== 排盘守卫（P3-04 修复）=====
  // 顶层立即执行（不依赖 DOMContentLoaded）：无论凭证是否配置/是否初始化，都先包装
  // APP.doPaipan，保证未登录时排盘入口始终被拦截。init() 内同逻辑因 __authGuarded
  // 标记而幂等跳过；此处提前执行确保 auth.js 文件尾回归测试段能断言到守卫已包装。
  (function() {
    if (window.APP && typeof window.APP.doPaipan === 'function' && !window.APP.__authGuarded) {
      var origDoPaipan = window.APP.doPaipan;
      window.APP.doPaipan = function() {
        if (isTestMode()) return origDoPaipan.apply(this, arguments); // 回归测试放行
        if (!isLoggedIn()) { requireLogin(); return; }
        return origDoPaipan.apply(this, arguments);
      };
      window.APP.__authGuarded = true;
    }
  })();

  // ===== 初始化 =====
  function init() {
    // 排盘守卫（P3-04 修复）：无论凭证是否配置/是否初始化，都先包装 APP.doPaipan，
    // 保证未登录时排盘入口始终被拦截（凭证未配置态同样生效）
    if (window.APP && typeof window.APP.doPaipan === 'function' && !window.APP.__authGuarded) {
      var origDoPaipan = window.APP.doPaipan;
      window.APP.doPaipan = function() {
        if (isTestMode()) return origDoPaipan.apply(this, arguments); // 回归测试放行
        if (!isLoggedIn()) { requireLogin(); return; }
        return origDoPaipan.apply(this, arguments);
      };
      window.APP.__authGuarded = true;
    }
    if (!window.supabase) {
      console.error('[auth] supabase-js CDN 未加载');
      if (!isTestMode()) showLoginScreen();
      return;
    }
    if (isConfigMissing(CFG)) {
      // 凭证未配置：显示遮罩 + 提示（不进入排盘）；test 模式跳过
      if (isTestMode()) return;
      showLoginScreen();
      var tip = document.getElementById('authError');
      if (tip) tip.textContent = 'Supabase 凭证未配置，请先填写 config.js';
      return;
    }
    sb = window.supabase.createClient(CFG.url, CFG.anonKey, {
      auth: {
        persistSession: true,    // 30 天会话持久化（AC7）
        autoRefreshToken: true,  // token 自动续期
        storageKey: 'sb-bazi-paipan-auth-token'
      }
    });
    // 恢复/探测会话
    sb.auth.getSession().then(function(res) {
      var session = res.data && res.data.session;
      if (session && session.user) {
        currentUser = session.user;
        onLoginSuccess(session.user);
      } else {
        currentUser = null;
        showLoginScreen();
      }
    }).catch(function() {
      currentUser = null;
      showLoginScreen();
    });
    // 监听登出事件
    if (sb.auth.onAuthStateChange) {
      sb.auth.onAuthStateChange(function(event, session) {
        if (event === 'SIGNED_OUT') {
          currentUser = null;
          showLoginScreen();
        } else if (event === 'SIGNED_IN' && session && session.user) {
          currentUser = session.user;
          onLoginSuccess(session.user);
        }
      });
    }
  }

  // ===== 状态查询 =====
  function isLoggedIn() { return !!currentUser && !!sb; }
  function getUser() { return currentUser; }
  function getClient() { return sb; }

  // 凭证是否缺失（占位 PASTE_ / 空 url / 空 anonKey）——纯函数，init 复用 + T02 测试
  function isConfigMissing(cfg) {
    return !cfg || !cfg.url || !cfg.anonKey || cfg.url.indexOf('PASTE_') === 0;
  }

  // 回归测试模式（?test=1）：跳过登录守卫，保证算法回归可跑（AC22 兼容）
  function isTestMode() {
    return /[\?&]test=1(&|$)/.test(location.search);
  }

  // ===== 登录/注册 =====
  function doLogin(email, password) {
    if (!sb) return Promise.reject(new Error('Supabase 未初始化'));
    return sb.auth.signInWithPassword({ email: email, password: password })
      .then(function(res) {
        if (res.error) throw res.error;
        currentUser = res.data.user;
        try { localStorage.setItem(REMEMBER_EMAIL_KEY, email); } catch(e) {}
        onLoginSuccess(currentUser);
        return { ok: true, user: currentUser };
      });
  }

  function doRegister(email, password) {
    if (!sb) return Promise.reject(new Error('Supabase 未初始化'));
    return sb.auth.signUp({ email: email, password: password })
      .then(function(res) {
        // 关 Confirm email 时 signUp 即登录；若开验证则需检查
        if (res.error) throw res.error;
        if (res.data && res.data.session && res.data.session.user) {
          currentUser = res.data.session.user;
          try { localStorage.setItem(REMEMBER_EMAIL_KEY, email); } catch(e) {}
          onLoginSuccess(currentUser);
          return { ok: true, user: currentUser };
        }
        if (res.data && res.data.user) {
          // 需邮箱验证的情况：提示
          return { ok: false, needConfirm: true };
        }
        return { ok: false };
      });
  }

  function doLogout() {
    if (!sb) return Promise.resolve();
    return sb.auth.signOut().then(function() {
      currentUser = null;
      showLoginScreen();
    }).catch(function() { currentUser = null; showLoginScreen(); });
  }

  // ===== 登录成功回调 =====
  function onLoginSuccess(user) {
    hideLoginScreen();
    // 触发云端记录加载 + 迁移检测（records.js）
    if (window.RECORDS && window.RECORDS.onLogin) {
      window.RECORDS.onLogin(user);
    }
  }

  // ===== 登录/注册表单 UI =====
  function showLoginScreen() {
    if (isTestMode()) return; // 回归测试模式不显示登录遮罩
    var overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'flex';
    var page = document.querySelector('.page');
    if (page) page.style.display = 'none';
    focusEmail();
  }

  function hideLoginScreen() {
    if (isTestMode()) return;
    var overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'none';
    var page = document.querySelector('.page');
    if (page) page.style.display = '';
  }

  function requireLogin() {
    alert('请先登录后使用排盘功能');
    showLoginScreen();
  }

  function focusEmail() {
    setTimeout(function() {
      var el = document.getElementById('authEmail');
      if (el) el.focus();
    }, 60);
  }

  // 记住邮箱预填
  function prefillRememberedEmail() {
    try {
      var saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        var el = document.getElementById('authEmail');
        if (el) el.value = saved;
      }
    } catch(e) {}
  }

  // 错误文案映射（AC3/AC5：不泄漏是哪个错）
  function mapAuthError(err) {
    if (!err) return '操作失败，请稍后重试';
    var msg = (err.message || err.error_description || err.msg || '').toLowerCase();
    if (msg.indexOf('already registered') >= 0 || msg.indexOf('already exists') >= 0 || msg.indexOf('user already') >= 0) {
      return '该邮箱已注册';
    }
    // 密码过短需在泛 password 匹配之前判断（P3-02 修复）
    if (msg.indexOf('password') >= 0 && (msg.indexOf('short') >= 0 || msg.indexOf('length') >= 0 || msg.indexOf('least') >= 0)) {
      return '密码至少 8 位';
    }
    if (msg.indexOf('invalid login') >= 0 || msg.indexOf('invalid credentials') >= 0 || msg.indexOf('password') >= 0 || msg.indexOf('email not confirmed') >= 0) {
      return '邮箱或密码错误';
    }
    if (msg.indexOf('rate limit') >= 0 || msg.indexOf('too many') >= 0) {
      return '尝试次数过多，请稍后再试';
    }
    if (msg.indexOf('network') >= 0 || msg.indexOf('fetch') >= 0) {
      return '网络异常，请稍后重试';
    }
    return '操作失败，请稍后重试';
  }

  // ===== 表单事件绑定 =====
  function bindEvents() {
    var btnLogin = document.getElementById('btnAuthLogin');
    var btnRegister = document.getElementById('btnAuthRegister');
    var btnLogout = document.getElementById('btnLogout');

    function setError(el, t) { if (el) el.textContent = t; }
    function clearError(el) { if (el) el.textContent = ''; }

    function submit(mode) {
      var emailEl = (mode === 'login') ? document.getElementById('authEmail') : document.getElementById('regEmail');
      var pwdEl = (mode === 'login') ? document.getElementById('authPassword') : document.getElementById('regPassword');
      var errEl = (mode === 'login') ? document.getElementById('authError') : document.getElementById('regError');
      var e = emailEl ? emailEl.value.trim().toLowerCase() : '';
      var p = pwdEl ? pwdEl.value : '';
      clearError(errEl);
      if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setError(errEl, '请输入有效的邮箱地址'); return; }
      if (!p) { setError(errEl, '请输入密码'); return; }
      if (mode === 'register' && p.length < 8) { setError(errEl, '密码至少 8 位'); return; }
      var btnSubmit = (mode === 'login') ? btnLogin : document.getElementById('btnAuthRegister2');
      if (btnSubmit) btnSubmit.disabled = true;
      var promise = (mode === 'login') ? doLogin(e, p) : doRegister(e, p);
      promise.then(function(r) {
        if (r && r.needConfirm) {
          setError(errEl, '注册成功，请按提示完成邮箱确认后登录');
        }
        // 成功自动进入排盘页（AC2/AC4），无需额外处理
      }).catch(function(err) {
        setError(errEl, mapAuthError(err));
      }).finally(function() {
        if (btnSubmit) btnSubmit.disabled = false;
      });
    }

    if (btnLogin) btnLogin.addEventListener('click', function() { submit('login'); });

    // 登录盒子中的「注册」按钮：切换到注册盒子
    var btnRegSwitch = document.getElementById('btnAuthRegister');
    if (btnRegSwitch) btnRegSwitch.addEventListener('click', function() { switchToRegister(); });
    // 注册盒子中的「注册并登录」按钮：提交注册
    var btnRegSubmit = document.getElementById('btnAuthRegister2');
    if (btnRegSubmit) btnRegSubmit.addEventListener('click', function() { submit('register'); });

    // Enter 提交
    ['authEmail', 'authPassword', 'regEmail', 'regPassword'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function(ev) {
        if (ev.key === 'Enter') submit(id.indexOf('reg') === 0 ? 'register' : 'login');
      });
    });
    if (btnLogout) btnLogout.addEventListener('click', function() { doLogout(); });

    // 登录/注册表单切换
    function switchToRegister() {
      var loginBox = document.getElementById('authLoginBox');
      var regBox = document.getElementById('authRegisterBox');
      if (loginBox) loginBox.style.display = 'none';
      if (regBox) regBox.style.display = 'block';
      var e = document.getElementById('regEmail'); if (e) e.focus();
    }
    function switchToLogin() {
      var loginBox = document.getElementById('authLoginBox');
      var regBox = document.getElementById('authRegisterBox');
      if (regBox) regBox.style.display = 'none';
      if (loginBox) loginBox.style.display = 'block';
      var e = document.getElementById('authEmail'); if (e) e.focus();
    }
    var linkToReg = document.getElementById('authLinkRegister');
    var linkToLogin = document.getElementById('authLinkLogin');
    if (linkToReg) linkToReg.addEventListener('click', function(ev) {
      ev.preventDefault();
      switchToRegister();
    });
    if (linkToLogin) linkToLogin.addEventListener('click', function(ev) {
      ev.preventDefault();
      switchToLogin();
    });
  }

  // ===== 迁移标记工具（records.js 复用）=====
  function getMigratedFlag() { try { return localStorage.getItem(MIGRATED_KEY) === '1'; } catch(e) { return false; } }
  function setMigratedFlag() { try { localStorage.setItem(MIGRATED_KEY, '1'); } catch(e) {} }
  function getPresetFlag() { try { return localStorage.getItem(PRESET_KEY) === '1'; } catch(e) { return false; } }
  function setPresetFlag() { try { localStorage.setItem(PRESET_KEY, '1'); } catch(e) {} }

  // ===== 启动 =====
  function boot() {
    bindEvents();
    prefillRememberedEmail();
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 挂载全局
  window.AUTH = {
    init: init,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    getClient: getClient,
    doLogin: doLogin,
    doRegister: doRegister,
    doLogout: doLogout,
    showLoginScreen: showLoginScreen,
    hideLoginScreen: hideLoginScreen,
    requireLogin: requireLogin,
    mapAuthError: mapAuthError,
    getMigratedFlag: getMigratedFlag,
    setMigratedFlag: setMigratedFlag,
    getPresetFlag: getPresetFlag,
    setPresetFlag: setPresetFlag,
    isConfigMissing: isConfigMissing
  };

  // ===== v0.24.0 回归测试段（?test=1，经 __testAppend 追加到统一统计）=====
  (function() {
    if (!/[\?&]test=1(&|$)/.test(location.search)) return;
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    t('v0.24 T01:test模式 isTestMode=true', isTestMode() === true, 'isTestMode()=' + isTestMode());
    t('v0.24 T01:守卫已包装 __authGuarded', !!(window.APP && window.APP.__authGuarded === true), 'guarded=' + (window.APP && window.APP.__authGuarded));
    t('v0.24 T02:占位PASTE_判定缺配置', isConfigMissing({ url: 'PASTE_xxx', anonKey: 'x' }) === true, 'PASTE_→missing');
    t('v0.24 T02:空url判定缺配置', isConfigMissing({ url: '', anonKey: 'x' }) === true, '空url→missing');
    t('v0.24 T02:null判定缺配置', isConfigMissing(null) === true, 'null→missing');
    t('v0.24 T02:有效凭证非缺配置', isConfigMissing({ url: 'https://ok.supabase.co', anonKey: 'sb_publishable__x' }) === false, '有效→ok');
  })();
})();
