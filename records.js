/* 八字排盘 v0.25.0 — records.js（排盘记录云端模块）
 * ------------------------------------------------------------
 * 职责：保存/列表/查看/删除排盘记录 + 首次登录 localStorage 迁移
 * 依赖：auth.js（window.AUTH）+ supabase-js v2 + algorithm.js（迁移现算）
 * 表：paipan_records（id uuid / user_id / input_data jsonb / result_data jsonb / created_at / updated_at）
 */
(function() {

  var sb = null;
  var currentUser = null;
  var pendingQueueKey = 'bz_pending_ops'; // 失败重试队列（localStorage）

  // ===== 初始化（登录后由 AUTH.onLoginSuccess 触发）=====
  function onLogin(user) {
    sb = window.AUTH.getClient();
    currentUser = user;
    if (!sb) return;
    // 1) 加载云端列表刷新 UI
    loadAndRenderRecords();
    // 2) 迁移检测（一条不丢 + 幂等 + 可重试）
    checkAndMigrate();
    // 3) 补传失败队列
    flushPendingQueue();
  }

  // ===== 保存当前排盘为云端记录（R3/AC9）=====
  function saveCurrentPaipan() {
    if (!window.AUTH.isLoggedIn() || !sb) {
      alert('请先登录');
      if (window.AUTH && typeof window.AUTH.showLoginScreen === 'function') window.AUTH.showLoginScreen();
      return Promise.resolve(false);
    }
    // 组装输入快照（对齐现有档案结构）
    function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
    var calType = (window.APP && window.APP.calendarType) ? window.APP.calendarType : 'solar';
    var monthEl = document.getElementById(calType === 'lunar' ? 'inMonthSelect' : 'inMonth');
    var inputData = {
      _fp: contentFingerprint({ name: val('inName') || '未命名', gender: val('inGender') || '男', year: parseInt(val('inYear')) || null, month: monthEl ? parseInt(monthEl.value) : null, day: parseInt(val('inDay')) || null, hour: parseInt(val('inHour')) || null, min: parseInt(val('inMin')) || 0 }),
      name: val('inName') || '未命名',
      nickname: val('inNickname'),
      yiming: val('inYiming'),
      gender: val('inGender') || '男',
      year: parseInt(val('inYear')) || null,
      month: monthEl ? parseInt(monthEl.value) : null,
      day: parseInt(val('inDay')) || null,
      hour: parseInt(val('inHour')) || null,
      min: parseInt(val('inMin')) || 0,
      prov: val('inProv'), city: val('inCity'), dist: val('inDist'),
      useSolar: !!(document.getElementById('useSolar') && document.getElementById('useSolar').checked),
      calendarType: calType,
      isLeap: !!(document.getElementById('inLeap') && document.getElementById('inLeap').checked),
      lunarMonth: calType === 'lunar' && monthEl ? (parseInt(monthEl.value) || null) : null,
      savedAt: new Date().toISOString()
    };
    // 结果快照（ALGO.paipan() 输出，getCurrentBaziResult 已含 bazi/sanyuan/extras/gongWeiType）
    var resultData = window.APP.getCurrentBaziResult();
    if (!resultData || !resultData.bazi) {
      alert('请先完成排盘，再保存到云端');
      return Promise.resolve(false);
    }
    return upsertRecord(inputData, resultData);
  }

  // ===== upsert 记录（含失败入队）=====
  function upsertRecord(inputData, resultData) {
    var user = window.AUTH.getUser();
    if (!user) return Promise.resolve(false);
    return sb.from('paipan_records').insert({
      user_id: user.id,
      input_data: inputData,
      result_data: resultData
    }).then(function(res) {
      if (res.error) {
        enqueuePending({ input_data: inputData, result_data: resultData });
        alert('保存失败（' + (res.error.message || '网络异常') + '），已加入本地队列，网络恢复后自动重试');
        return false;
      }
      alert('已保存到云端'); // P9：保存成功弹窗提示
      loadAndRenderRecords(true); // 保存成功重置到第 1 页（P2-02）
      return true;
    }).catch(function(err) {
      enqueuePending({ input_data: inputData, result_data: resultData });
      alert('保存失败，已加入本地队列，网络恢复后自动重试');
      return false;
    });
  }

  // ===== 列表（倒序，分页每页 50，P2-02 修复；ADR §4.8 range(0,49)）=====
  var __pageSize = 50;        // 每页条数（ADR 约定）
  var __pageOffset = 0;       // 当前已加载到第几条
  var __totalCount = 0;       // 云端总条数（count 模式）

  function fetchRecords(offset, limit) {
    if (!sb) return Promise.resolve({ list: [], total: 0 });
    var from = offset || 0;
    var to = from + (limit || __pageSize) - 1;
    return sb.from('paipan_records')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(function(res) {
        if (res.error) return { list: [], total: 0 };
        return { list: res.data || [], total: (res.count != null ? res.count : (res.data || []).length) };
      })
      .catch(function() { return { list: [], total: 0 }; });
  }

  // ===== 渲染列表到「我的排盘」弹层 =====
  function loadAndRenderRecords(reset) {
    if (reset) __pageOffset = 0;
    fetchRecords(__pageOffset, __pageSize).then(function(r) {
      __totalCount = r.total;
      window.RECORDS.__lastList = r.list;
      if (reset) window.RECORDS.__allLoaded = r.list.slice();
      else {
        var prev = window.RECORDS.__allLoaded || [];
        var seen = {};
        prev.concat(r.list).forEach(function(it) { seen[it.id] = it; });
        window.RECORDS.__allLoaded = Object.keys(seen).map(function(k) { return seen[k]; });
      }
      renderRecordsList(window.RECORDS.__allLoaded, r.total);
    });
  }

  // 加载更多（追加下一页）
  function loadMoreRecords() {
    __pageOffset += __pageSize;
    fetchRecords(__pageOffset, __pageSize).then(function(r) {
      __totalCount = r.total;
      var prev = window.RECORDS.__allLoaded || [];
      var seen = {};
      prev.concat(r.list).forEach(function(it) { seen[it.id] = it; });
      window.RECORDS.__allLoaded = Object.keys(seen).map(function(k) { return seen[k]; });
      renderRecordsList(window.RECORDS.__allLoaded, r.total);
    });
  }

  function renderRecordsList(list, total) {
    var box = document.getElementById('recordsList');
    if (!box) return;
    if (!list || !list.length) {
      box.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">暂无排盘记录</div>';
      return;
    }
    var html = list.map(function(r) {
      var inp = r.input_data || {};
      var disp = '';
      // 隐私降级链：云端数据显示同样走 getDisplayName（L3/AC24）
      if (window.ARCHIVE && window.ARCHIVE.getDisplayName) {
        disp = window.ARCHIVE.getDisplayName(inp);
      } else {
        disp = inp.name || inp.nickname || '未命名';
      }
      var time = (r.created_at || '').replace('T', ' ').replace('Z', '');
      var birth = (inp.year || '') + '-' + (inp.month || '') + '-' + (inp.day || '') + ' ' + (inp.hour != null ? inp.hour : '') + ':' + (inp.min != null ? inp.min : '');
      return '<div class="record-item" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--c-line,#e5e0d5);font-size:13px;">'
        + '<span style="flex:1;min-width:0;"><b>' + esc(disp) + '</b> <span style="color:#888;">' + esc(birth) + '</span><br>'
        + '<span style="color:#aaa;font-size:12px;">保存于 ' + esc(time) + '</span></span>'
        + '<button class="btn btn-sm" onclick="window.RECORDS.viewRecord(\'' + r.id + '\')" style="padding:3px 10px;border:1px solid var(--c-line,#e5e0d5);background:var(--c-paper,#fff);cursor:pointer;border-radius:2px;">查看</button>'
        + '<button class="btn btn-sm" onclick="window.RECORDS.deleteRecord(\'' + r.id + '\')" style="padding:3px 10px;border:1px solid #d8b0b0;background:#fdf5f5;cursor:pointer;border-radius:2px;color:#b04a4a;">删除</button>'
        + '</div>';
    }).join('');
    // 分页信息 + 加载更多（P2-02）
    var totalN = (total != null) ? total : list.length;
    var showN = list.length;
    if (showN < totalN) {
      html += '<div style="padding:10px;text-align:center;font-size:12px;color:#888;">'
        + '已显示 ' + showN + ' / ' + totalN + ' 条'
        + '<button onclick="window.RECORDS.loadMoreRecords()" style="margin-left:10px;padding:4px 14px;border:1px solid var(--c-line,#e5e0d5);background:var(--c-paper,#fff);cursor:pointer;border-radius:2px;font-size:12px;">加载更多</button>'
        + '</div>';
    } else {
      html += '<div style="padding:8px;text-align:center;font-size:12px;color:#aaa;">共 ' + showN + ' 条</div>';
    }
    box.innerHTML = html;
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ===== 查看单条（AC11）=====
  function viewRecord(id) {
    if (!sb) return;
    sb.from('paipan_records').select('*').eq('id', id).single().then(function(res) {
      if (res.error || !res.data) { alert('记录不存在或无权访问'); return; }
      showRecordDetail(res.data);
    }).catch(function() { alert('加载失败'); });
  }

  function showRecordDetail(r) {
    var inp = r.input_data || {};
    var res = r.result_data || {};
    var disp = '';
    if (window.ARCHIVE && window.ARCHIVE.getDisplayName) {
      disp = window.ARCHIVE.getDisplayName(inp);
    } else {
      disp = inp.name || inp.nickname || '未命名';
    }
    var detail = document.getElementById('recordDetail');
    var overlay = document.getElementById('recordDetailOverlay');
    if (!detail) return;
    var html = '<div style="padding:16px;">'
      + '<div style="font-size:16px;font-weight:600;margin-bottom:8px;">' + esc(disp) + '</div>'
      + '<div style="font-size:13px;color:#555;margin-bottom:12px;line-height:1.7;">'
      + '性别：' + esc(inp.gender || '') + '<br>'
      + '出生：' + esc((inp.year||'') + '-' + (inp.month||'') + '-' + (inp.day||'') + ' ' + (inp.hour!=null?inp.hour:'') + ':' + (inp.min!=null?inp.min:'')) + '<br>'
      + '日历：' + esc(inp.calendarType === 'lunar' ? '农历' : '新历') + (inp.isLeap ? '（闰月）' : '') + '<br>'
      + (inp.useSolar ? '真太阳时：' + esc((inp.prov||'') + (inp.city||'') + (inp.dist||'')) + '<br>' : '')
      + '保存时间：' + esc((r.created_at || '').replace('T',' ').replace('Z','')) + '<br>'
      + '</div>'
      + '<div style="font-size:13px;border-top:1px solid var(--c-line,#e5e0d5);padding-top:10px;">';
    // 四柱简表
    if (res.bazi) {
      var bz = res.bazi;
      html += '<div style="font-family:var(--font-display,serif);letter-spacing:.1em;font-size:15px;line-height:1.8;">'
        + '年柱 ' + esc(bz.yearGan || bz.yearPillar || '') + ' ' + esc(bz.yearZhi || '') + '　'
        + '月柱 ' + esc(bz.monthGan || bz.monthPillar || '') + ' ' + esc(bz.monthZhi || '') + '　'
        + '日柱 ' + esc(bz.dayGan || bz.dayPillar || '') + ' ' + esc(bz.dayZhi || '') + '　'
        + '时柱 ' + esc(bz.hourGan || bz.hourPillar || '') + ' ' + esc(bz.hourZhi || '') + '</div>';
    }
    html += '</div></div>';
    detail.innerHTML = html;
    if (overlay) overlay.style.display = 'flex';
  }

  function closeRecordDetail() {
    var overlay = document.getElementById('recordDetailOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // ===== 删除（AC12）=====
  function deleteRecord(id) {
    if (!sb) return;
    if (!confirm('确定删除这条排盘记录？')) return;
    sb.from('paipan_records').delete().eq('id', id).then(function(res) {
      if (res.error) { alert('删除失败：' + (res.error.message || '网络异常')); return; }
      loadAndRenderRecords(true); // 删除成功后重置到第 1 页（P2-02）
      closeRecordDetail();
    }).catch(function() { alert('删除失败'); });
  }

  // ===== 打开/关闭列表 =====
  function openRecordsPanel() {
    if (!window.AUTH.isLoggedIn() || !sb) {
      alert('请先登录');
      if (window.AUTH && typeof window.AUTH.showLoginScreen === 'function') window.AUTH.showLoginScreen();
      return;
    }
    var overlay = document.getElementById('recordsOverlay');
    if (overlay) overlay.style.display = 'flex';
    loadAndRenderRecords(true); // 每次打开重置分页到第 1 页
  }
  function closeRecordsPanel() {
    var overlay = document.getElementById('recordsOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  // ===== 迁移（R5/AC16-AC20）=====
  function checkAndMigrate() {
    if (!sb) return;
    var migrated = window.AUTH.getMigratedFlag();
    var hasLocal = hasLocalRecords();
    if (migrated) {
      // 已迁移过：仍检查预置模板
      checkPresetMigrate();
      return;
    }
    if (!hasLocal) {
      // 无本地数据：直接标记已迁移，避免每次弹窗
      window.AUTH.setMigratedFlag();
      checkPresetMigrate();
      return;
    }
    // 弹窗确认（本地有数据 → 迁移）
    var n = countLocalRecords();
    if (confirm('检测到本地有 ' + n + ' 条排盘记录，是否迁移到当前账号云端？\n（迁移后可在任何设备登录取回，一条不丢）')) {
      migrateLocalToCloud().then(function(r) {
        window.AUTH.setMigratedFlag();
        console.log('迁移完成：成功 ' + r.ok + ' 条' + (r.fail ? '，失败 ' + r.fail + ' 条（可稍后自动重试）' : ''));
        checkPresetMigrate();
        loadAndRenderRecords();
      });
    } else {
      // 用户取消：本次不迁移，下次登录再提示
      checkPresetMigrate();
    }
  }

  function hasLocalRecords() {
    try {
      var raw = localStorage.getItem('bz_archives_v2');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) && arr.length > 0;
    } catch(e) { return false; }
  }

  function countLocalRecords() {
    try {
      var raw = localStorage.getItem('bz_archives_v2');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.length : 0;
    } catch(e) { return 0; }
  }

  function getLocalArchives() {
    try {
      var raw = localStorage.getItem('bz_archives_v2');
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch(e) { return []; }
  }

  // 指纹：档案 id（若存在）或内容摘要
  function recordFingerprint(arch) {
    if (arch && arch.id) return 'arch-' + arch.id;
    if (!arch) return '';
    return 'fp-' + [arch.name, arch.gender, arch.year, arch.month, arch.day, arch.hour, arch.min].join('-');
  }

  // 内容摘要指纹（P2-03）：与 id 无关，手动保存/迁移共用，供去重比对
  function contentFingerprint(obj) {
    if (!obj) return '';
    return 'fp-' + [obj.name, obj.gender, obj.year, obj.month, obj.day, obj.hour, obj.min].join('-');
  }

  // 迁移：逐条上传（幂等 + 失败队列）
  function migrateLocalToCloud() {
    var user = window.AUTH.getUser();
    if (!user || !sb) return Promise.resolve({ ok: 0, fail: 0 });
    var archives = getLocalArchives();
    var ok = 0, fail = 0;
    var pending = [];

    // 已存在于云端的指纹集合（去重：_fp 指纹 + 内容摘要双路，P2-03 修复）
    return sb.from('paipan_records').select('input_data').then(function(res) {
      var cloudFps = new Set();
      var cloudContent = new Set();
      (res.data || []).forEach(function(r) {
        var inp = r.input_data || {};
        if (inp._fp) cloudFps.add(inp._fp);
        // 兼容手动保存（早期版本无 _fp）：用内容摘要兜底
        cloudContent.add(contentFingerprint(inp));
      });

      var chain = Promise.resolve();
      archives.forEach(function(arch) {
        chain = chain.then(function() {
          var fp = recordFingerprint(arch);
          var fpContent = contentFingerprint(arch);
          if (cloudFps.has(fp) || cloudContent.has(fpContent)) { return; } // 云端已有 → 跳过（幂等）
          // 构造 input_data（对齐档案结构 + 指纹）
          var inputData = {
            _fp: fp,
            name: arch.name || '',
            nickname: arch.nickname || '',
            yiming: arch.yiming || '',
            gender: arch.gender || '男',
            year: arch.year, month: arch.month, day: arch.day,
            hour: arch.hour, min: arch.min || 0,
            prov: arch.prov || '', city: arch.city || '', dist: arch.dist || '',
            useSolar: !!arch.useSolar,
            calendarType: arch.calendarType || 'solar',
            isLeap: !!arch.isLeap,
            lunarMonth: arch.lunarMonth || null,
            migratedFromLocal: true,
            migratedAt: new Date().toISOString()
          };
          // result_data：优先用档案里已有快照，否则现算
          var resultData = null;
          if (arch.bazi || arch.sanyuan) {
            resultData = { bazi: arch.bazi || null, sanyuan: arch.sanyuan || null, extras: arch.extras || null, gongWeiType: arch.gongWeiType || null };
          }
          if (!resultData || !resultData.bazi) {
            try {
              var r2 = window.ALGO.paipan(inputData.name, inputData.gender, inputData.year, inputData.month, inputData.day, inputData.hour, inputData.min);
              resultData = { bazi: r2, sanyuan: null, extras: null, gongWeiType: null };
            } catch(e) { resultData = { bazi: null, sanyuan: null, extras: null, gongWeiType: null }; }
          }
          return sb.from('paipan_records').insert({ user_id: user.id, input_data: inputData, result_data: resultData })
            .then(function(res2) {
              if (res2.error) { fail++; pending.push({ input_data: inputData, result_data: resultData }); }
              else { ok++; cloudFps.add(fp); cloudContent.add(fpContent); }
            })
            .catch(function() { fail++; pending.push({ input_data: inputData, result_data: resultData }); });
        });
      });
      return chain.then(function() {
        if (pending.length) savePendingQueue(pending);
        return { ok: ok, fail: fail };
      });
    });
  }

  // ===== 预置 16 孩模板（AC19）=====
  function checkPresetMigrate() {
    if (!sb) return;
    if (window.AUTH.getPresetFlag()) return;
    if (!window.ARCHIVE || !window.ARCHIVE.PRESET_ARCHIVES) { window.AUTH.setPresetFlag(); return; }
    var presets = window.ARCHIVE.PRESET_ARCHIVES || [];
    if (!presets.length) { window.AUTH.setPresetFlag(); return; }
    var user = window.AUTH.getUser();
    var ok = 0, fail = 0;
    var chain = Promise.resolve();
    presets.forEach(function(p) {
      chain = chain.then(function() {
        var fp = 'preset-' + (p.name || '') + '-' + (p.gender || '') + '-' + (p.year||'') + '-' + (p.month||'') + '-' + (p.day||'');
        var inputData = {
          _fp: fp,
          name: p.name || '', nickname: p.nickname || '', yiming: p.yiming || '',
          gender: p.gender || '男',
          year: p.year, month: p.month, day: p.day,
          hour: p.hour, min: p.min || 0,
          prov: p.prov || '', city: p.city || '', dist: p.dist || '',
          useSolar: !!p.useSolar, calendarType: p.calendarType || 'solar',
          isLeap: !!p.isLeap, lunarMonth: p.lunarMonth || null,
          isPreset: true, migratedFromLocal: true, migratedAt: new Date().toISOString()
        };
        var resultData = null;
        try {
          var r3 = window.ALGO.paipan(inputData.name, inputData.gender, inputData.year, inputData.month, inputData.day, inputData.hour, inputData.min);
          resultData = { bazi: r3, sanyuan: null, extras: null, gongWeiType: null };
        } catch(e) { resultData = { bazi: null, sanyuan: null, extras: null, gongWeiType: null }; }
        return sb.from('paipan_records').insert({ user_id: user.id, input_data: inputData, result_data: resultData })
          .then(function(res) {
            if (res.error) fail++; else ok++;
          }).catch(function() { fail++; });
      });
    });
    chain.then(function() {
      window.AUTH.setPresetFlag();
      if (ok || fail) { /* 静默完成 */ }
      loadAndRenderRecords();
    });
  }

  // ===== 失败重试队列 =====
  function loadPendingQueue() {
    try { var raw = localStorage.getItem(pendingQueueKey); return raw ? JSON.parse(raw) : []; }
    catch(e) { return []; }
  }
  function savePendingQueue(list) {
    try { localStorage.setItem(pendingQueueKey, JSON.stringify(list)); } catch(e) {}
  }
  function enqueuePending(item) {
    var q = loadPendingQueue(); q.push(item); savePendingQueue(q);
  }
  function flushPendingQueue() {
    if (!sb) return;
    var q = loadPendingQueue();
    if (!q.length) return;
    var user = window.AUTH.getUser();
    if (!user) return;
    var remain = [];
    var chain = Promise.resolve();
    q.forEach(function(item) {
      chain = chain.then(function() {
        return sb.from('paipan_records').insert({ user_id: user.id, input_data: item.input_data, result_data: item.result_data })
          .then(function(res) { if (res.error) remain.push(item); })
          .catch(function() { remain.push(item); });
      });
    });
    chain.then(function() {
      savePendingQueue(remain);
      if (remain.length === 0) loadAndRenderRecords();
    });
  }

  // ===== 挂载全局 =====
  window.RECORDS = {
    onLogin: onLogin,
    saveCurrentPaipan: saveCurrentPaipan,
    fetchRecords: fetchRecords,
    loadAndRenderRecords: loadAndRenderRecords,
    loadMoreRecords: loadMoreRecords,
    viewRecord: viewRecord,
    closeRecordDetail: closeRecordDetail,
    deleteRecord: deleteRecord,
    openRecordsPanel: openRecordsPanel,
    closeRecordsPanel: closeRecordsPanel,
    checkAndMigrate: checkAndMigrate,
    migrateLocalToCloud: migrateLocalToCloud,
    contentFingerprint: contentFingerprint,
    recordFingerprint: recordFingerprint,
    PRESET_ARCHIVES: (window.ARCHIVE && window.ARCHIVE.PRESET_ARCHIVES) || []
  };

  // ===== v0.25.0 回归测试段（?test=1，经 __testAppend 追加到统一统计）=====
  (function() {
    if (!/[\?&]test=1(&|$)/.test(location.search)) return;
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    var base = { name: '邦顺', gender: '男', year: 1982, month: 10, day: 18, hour: 5, min: 1 };
    var fp1 = contentFingerprint(base);
    var fp2 = contentFingerprint(base);
    var fp3 = contentFingerprint({ name: '邦顺', gender: '男', year: 1982, month: 10, day: 19, hour: 5, min: 1 });
    t('v0.24 T03:contentFingerprint幂等', fp1 === fp2, fp1);
    t('v0.24 T03:不同输入不同指纹', fp1 !== fp3, fp1 + ' vs ' + fp3);
    t('v0.24 T03:内容摘要前缀fp-', fp1.indexOf('fp-') === 0, fp1);
    t('v0.24 T04:含id档案用arch-id', recordFingerprint({ id: 'abc' }) === 'arch-abc', recordFingerprint({ id: 'abc' }));
    var fp4 = recordFingerprint(base);
    t('v0.24 T04:无id档案用内容摘要', fp4 === contentFingerprint(base), fp4);
    t('v0.24 T04:无id指纹前缀fp-', fp4.indexOf('fp-') === 0, fp4);
  })();
})();
