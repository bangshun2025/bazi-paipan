/* 八字排盘 v0.34.0 — archive.js */
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
  var PRIVACY_KEY = CONST.PRIVACY_KEY;

  // ===== v0.32.0 档案标签 =====
  var ARCH_TAG_KEY = 'bz_archive_default_tag';  // 默认标签（打开档案时默认只显示该标签）
  var TAG_MAX = 12;                             // 单条档案标签上限
  var TAG_UNTAGGED = '__untagged__';            // 「未分类」伪标签
  var CMP_PICK_TAG = '盘面对比';                 // v0.40.0 选盘自动标签（与选盘状态互为镜像）

  // ===== 别名：来自 algorithm.js =====
  var monthDays = ALGO.monthDays;
  var normalizeDate = ALGO.normalizeDate;
  var lunarToSolar = ALGO.lunarToSolar;
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

  // NOTE: RENDER 在 archive.js 之后加载，运行时通过 RENDER.xxx 调用

// ===== v0.9.0 预置数据（自在班16孩）=====
const PRESET_ARCHIVES = [
  {nickname:"六一",name:"杨禹赫",gender:"男",year:2021,month:6,day:1,hour:22,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"子旭",name:"彭子旭",gender:"男",year:2020,month:11,day:10,hour:16,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"子阳",name:"彭子阳",gender:"男",year:2020,month:11,day:10,hour:16,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"希希",name:"陈彦希",gender:"女",year:2019,month:6,day:6,hour:8,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"东东",name:"关旭峰",gender:"男",year:2019,month:9,day:23,hour:22,min:47,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"糯米",name:"熊朗翔",gender:"男",year:2020,month:8,day:6,hour:6,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"想想",name:"李帛锴",gender:"男",year:2019,month:8,day:9,hour:14,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"NONO",name:"吴不言",gender:"男",year:2019,month:10,day:18,hour:10,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"扬扬",name:"邵开扬",gender:"男",year:2020,month:4,day:14,hour:22,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"顶顶",name:"韦环骏",gender:"男",year:2020,month:8,day:31,hour:8,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"KK",name:"吴成溪",gender:"女",year:2019,month:10,day:18,hour:10,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"二哥",name:"何沛润",gender:"男",year:2019,month:8,day:23,hour:4,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"茂茂",name:"甘志茂",gender:"男",year:2019,month:6,day:26,hour:22,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"成哥",name:"肖竟成",gender:"男",year:2019,month:9,day:18,hour:0,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"笑笑",name:"谢锦萱",gender:"女",year:2019,month:6,day:30,hour:8,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null},
  {nickname:"妍语",name:"许妍语",gender:"女",year:2020,month:1,day:20,hour:0,min:0,prov:"",city:"",dist:"",useSolar:false,calendarType:"solar",isLeap:false,lunarMonth:null}
];

// ===== v0.9.0 迁移：旧版数据 → v2 =====
function migrateFromV1() {
  try {
    var oldArch = localStorage.getItem(ARCH_KEY_OLD);
    var newArch = localStorage.getItem(ARCH_KEY);
    if (oldArch && !newArch) {
      var oldData = JSON.parse(oldArch);
      if (Array.isArray(oldData) && oldData.length > 0) {
        localStorage.setItem(ARCH_BACKUP_KEY, oldArch);
        var now = new Date().toISOString();
        var migrated = oldData.map(function(a) {
          return {
            id: a.id || Date.now() + Math.random(),
            nickname: a.nickname || a.name || '',
            name: a.name || '未命名',
            gender: a.gender || '男',
            year: a.year, month: a.month, day: a.day,
            hour: a.hour || 0, min: a.min || 0,
            prov: a.prov || '', city: a.city || '', dist: a.dist || '',
            useSolar: a.useSolar || false,
            calendarType: a.calendarType || 'solar',
            isLeap: a.isLeap || false,
            lunarMonth: a.lunarMonth || null,
            bazi: null, sanyuan: null, extras: null,
            gongWeiType: null,
            createdAt: a.createdAt || now,
            updatedAt: a.updatedAt || now,
            isPreset: false
          };
        });
        localStorage.setItem(ARCH_KEY, JSON.stringify(migrated));
      }
    }
    var oldTrash = localStorage.getItem(TRASH_KEY_OLD);
    var newTrash = localStorage.getItem(TRASH_KEY);
    if (oldTrash && !newTrash) {
      localStorage.setItem(TRASH_KEY, oldTrash);
    }
  } catch(e) { console.warn('v0.9.0迁移失败:', e); }
}

// ===== v0.9.0 预置数据初始化 =====
function initPresetArchives() {
  var existing = getArchives();
  // 检测是否已存在预置数据（而非检测是否为空），避免用户已有旧档案时预置数据不写入
  var hasPreset = existing.some(function(a) { return a.isPreset === true; });
  if (!hasPreset) {
    var now = new Date().toISOString();
    var presets = PRESET_ARCHIVES.map(function(a, i) {
      return {
        id: Date.now() + i,
        nickname: a.nickname, name: a.name, gender: a.gender,
        year: a.year, month: a.month, day: a.day,
        hour: a.hour, min: a.min,
        prov: a.prov, city: a.city, dist: a.dist,
        useSolar: a.useSolar,
        calendarType: a.calendarType,
        isLeap: a.isLeap, lunarMonth: a.lunarMonth,
        bazi: null, sanyuan: null, extras: null,
        gongWeiType: null,
        createdAt: now, updatedAt: now,
        isPreset: true
      };
    });
    // 追加预置数据到现有档案（不替换用户自建档案）
    var merged = existing.concat(presets);
    saveArchivesRaw(merged);
  }
  try { migrateOrphanRecNotes(); } catch (e) {}
}

// ===== v0.69.0 防丢：版本戳 / 删除墓碑 / 读改写合并 =====
// 病根：saveArchives 整表覆盖。两个标签页各持一份内存副本，后写的一方会把
// 另一方才新增的档案整段抹掉（renderArchiveModal 排序回写同样会触发）。
// 对策：每次写前比对版本戳，发现外部写过就先按 id 合并再落盘；删除另记墓碑，
// 避免合并时把已删档案复活。
var ARCH_REV_KEY = 'bz_archives_rev';
var ARCH_TOMB_KEY = 'bz_archives_tomb';
var TRASH_REV_KEY = 'bz_trash_rev';
var BACKUP_AT_KEY = 'bz_last_backup_at';
var _archRevSeen = null;
var _trashRevSeen = null;
var _quotaWarnAt = 0;

function readNum(key) {
  try { return Number(localStorage.getItem(key)) || 0; } catch(e) { return 0; }
}
function writeNum(key, n) {
  try { localStorage.setItem(key, String(n)); } catch(e) {}
}
function readRawArr(key) {
  try {
    var arr = JSON.parse(localStorage.getItem(key));
    return Array.isArray(arr) ? arr : [];
  } catch(e) { return []; }
}

function archKeyOf(a) {
  if (!a) return '';
  if (a.id !== undefined && a.id !== null && a.id !== '') return 'id:' + a.id;
  return 'fp:' + (a.name || '') + '|' + (a.gender || '') + '|'
    + (a.year || '') + '-' + (a.month || '') + '-' + (a.day || '')
    + '|' + (a.hour || '') + ':' + (a.min || 0);
}
function archTs(a) {
  var t = Date.parse((a && (a.updatedAt || a.createdAt)) || '');
  return isNaN(t) ? 0 : t;
}
function getTomb() {
  try {
    var o = JSON.parse(localStorage.getItem(ARCH_TOMB_KEY));
    return (o && typeof o === 'object') ? o : {};
  } catch(e) { return {}; }
}
function addTomb(id) {
  if (id === undefined || id === null || id === '') return;
  var t = getTomb();
  t[String(id)] = Date.now();
  try { localStorage.setItem(ARCH_TOMB_KEY, JSON.stringify(t)); } catch(e) {}
}

// 合并两份档案表：同键取 updatedAt 较新者，两侧独有都保留，墓碑命中的丢弃
function mergeArchives(a, b) {
  var tomb = getTomb();
  var out = [];
  var seen = {};
  function take(list) {
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it) continue;
      var k = archKeyOf(it);
      if (!k) continue;
      var tid = (it.id !== undefined && it.id !== null) ? String(it.id) : '';
      if (tid && tomb[tid] && archTs(it) <= Number(tomb[tid])) continue;
      if (!(k in seen)) { seen[k] = out.length; out.push(it); continue; }
      var cur = out[seen[k]];
      if (archTs(it) > archTs(cur)) out[seen[k]] = it;
    }
  }
  take(a);
  take(b);
  return out;
}

function onStorageWriteFail() {
  var now = Date.now();
  try { setBackupHint('保存失败：本地存储已满，请立即点「导出备份」'); } catch(e) {}
  if (now - _quotaWarnAt < 60000) return;
  _quotaWarnAt = now;
  try {
    alert('⚠ 保存失败：浏览器本地存储已满。\n\n请立刻点「⬇ 导出备份」把档案存成 JSON 文件，'
      + '再清理旧档案或分析记录后重试。');
  } catch(e) {}
}

// 写档案：外部变更过（版本戳前进）就先合并，内容没变则不写、不广播
function writeArchives(arr) {
  // 本地传入的排在前面（显示顺序 = 索引顺序），盘上独有项追加末尾，保证不丢
  var out = mergeArchives(arr || [], readRawArr(ARCH_KEY));
  var json = JSON.stringify(out);
  var old = null;
  try { old = localStorage.getItem(ARCH_KEY); } catch(e) {}
  if (json !== old) {
    try { localStorage.setItem(ARCH_KEY, json); }
    catch(e) { onStorageWriteFail(); return false; }
  }
  _archRevSeen = Date.now();
  writeNum(ARCH_REV_KEY, _archRevSeen);
  try { syncTouch(); } catch(e) {}
  return true;
}

// ===== v0.9.0 核心读写函数 =====
function getArchives() {
  var arr = readRawArr(ARCH_KEY);
  _archRevSeen = readNum(ARCH_REV_KEY);
  return arr;
}

function saveArchives(arr) {
  return writeArchives(arr);
}

// 强制整表写（迁移/初始化用，不合并）
function saveArchivesRaw(arr) {
  try { localStorage.setItem(ARCH_KEY, JSON.stringify(arr || [])); }
  catch(e) { onStorageWriteFail(); return false; }
  _archRevSeen = Date.now();
  writeNum(ARCH_REV_KEY, _archRevSeen);
  try { syncTouch(); } catch(e) {}
  return true;
}

function getTrash() {
  var arr = readRawArr(TRASH_KEY);
  _trashRevSeen = readNum(TRASH_REV_KEY);
  return arr;
}

function saveTrash(arr) {
  var out = arr || [];
  var merged = [];
  var seen = {};
  [out, readRawArr(TRASH_KEY)].forEach(function(list) {
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it) continue;
      var k = archKeyOf(it) + '|' + (it.deletedAt || '');
      if (seen[k]) continue;
      seen[k] = true;
      merged.push(it);
    }
  });
  out = merged;
  var json = JSON.stringify(out);
  var old = null;
  try { old = localStorage.getItem(TRASH_KEY); } catch(e) {}
  if (json !== old) {
    try { localStorage.setItem(TRASH_KEY, json); }
    catch(e) { onStorageWriteFail(); return false; }
  }
  _trashRevSeen = Date.now();
  writeNum(TRASH_REV_KEY, _trashRevSeen);
  return true;
}

// ===== 隐私模式（v0.19.0）=====
// 默认开启：无键或 '1' → 开启；'0' → 关闭
function getPrivacyMode() {
  return localStorage.getItem(PRIVACY_KEY) !== '0';
}
function setPrivacyMode(on) {
  localStorage.setItem(PRIVACY_KEY, on ? '1' : '0');
}
// 统一显示名：隐私关闭维持现状（小名 / 正名）；隐私开启降级链 艺名 → 小名 → 匿名
function getDisplayName(a) {
  if (!a) return '';
  if (!getPrivacyMode()) {
    return (a.nickname || '') ? (a.nickname + ' / ' + a.name) : a.name;
  }
  return (a.yiming && a.yiming.trim()) ? a.yiming
    : (a.nickname && a.nickname.trim()) ? a.nickname
    : '匿名';
}
// 切换开关：更新两处按钮状态 + 重渲染档案面板（若开）+ 重排当前标题（若 output 有数据）
function togglePrivacy() {
  var on = !getPrivacyMode();
  setPrivacyMode(on);
  // 更新两处按钮
  var b1 = document.getElementById('btnPrivacy');
  var b2 = document.getElementById('btnPrivacy2');
  var label = on ? '🔒 隐私' : '🔓 隐私';
  [b1, b2].forEach(function(b) {
    if (!b) return;
    b.textContent = label;
    if (on) b.classList.add('privacy-on'); else b.classList.remove('privacy-on');
  });
  // 重渲染档案面板（若开）
  refreshArchiveModalIfOpen();
  // 重排当前标题（若 output 有数据）
  if (window.APP && document.getElementById('output') && document.getElementById('output').innerHTML.indexOf('person-info') >= 0) {
    // P0-01 修复：统一走守卫入口（原直连 RENDER.doPaipan 可绕过未登录拦截）
    window.APP.doPaipan();
  }
}

// 档案保存后刷新弹窗列表（如果弹窗当前可见）
function refreshArchiveModalIfOpen() {
  var overlay = document.getElementById('archiveOverlay');
  if (overlay && overlay.classList.contains('show')) {
    renderArchiveModal();
  }
}

function getFormData() {
  var isLunar = (APP.calendarType === 'lunar');
  return {
    nickname: document.getElementById('inNickname').value || '',
    yiming: document.getElementById('inYiming').value || '',
    name: document.getElementById('inName').value || '未命名',
    gender: document.getElementById('inGender').value,
    year: parseInt(document.getElementById('inYear').value),
    month: parseInt(isLunar
      ? document.getElementById('inMonthSelect').value
      : document.getElementById('inMonth').value),
    day: parseInt(document.getElementById('inDay').value),
    hour: parseInt(document.getElementById('inHour').value),
    min: parseInt(document.getElementById('inMin').value) || 0,
    prov: document.getElementById('useSolar').checked ? document.getElementById('inProv').value : '',
    city: document.getElementById('useSolar').checked ? document.getElementById('inCity').value : '',
    dist: document.getElementById('useSolar').checked ? document.getElementById('inDist').value : '',
    useSolar: document.getElementById('useSolar').checked,
    // v0.8.0 农历字段
    calendarType: APP.calendarType,
    isLeap: isLunar ? document.getElementById('inLeap').checked : false,
    lunarMonth: isLunar ? parseInt(document.getElementById('inMonthSelect').value) : null,
    // v0.43.0 儒略历开关（仅新历模式有意义）
    isJulian: !isLunar ? !!(document.getElementById('useJulian') && document.getElementById('useJulian').checked) : false
  };
}

function setFormData(d) {
  // v0.8.0 先切换历法模式（会重建月控件），再回填值
  var calType = d.calendarType || 'solar';
  if (calType !== APP.calendarType) {
    APP.toggleCalendar(calType);
  }
  document.getElementById('inNickname').value = d.nickname || '';
  document.getElementById('inYiming').value = d.yiming || '';
  document.getElementById('inName').value = d.name;
  document.getElementById('inGender').value = d.gender;
  document.getElementById('inYear').value = d.year;
  if (calType === 'lunar') {
    document.getElementById('inMonthSelect').value = d.lunarMonth || d.month;
    document.getElementById('inLeap').checked = !!d.isLeap;
  } else {
    document.getElementById('inMonth').value = d.month;
  }
  document.getElementById('inDay').value = d.day;
  document.getElementById('inHour').value = d.hour;
  document.getElementById('inMin').value = d.min || 0;
  document.getElementById('useJulian').checked = !!(calType === 'solar' && d.isJulian);
  document.getElementById('useSolar').checked = d.useSolar;
  APP.toggleSolar();
  // v0.34.0 同步回填地址：onProvChange/onCityChange 都是同步建 option，
  // 原先 50ms 两级 setTimeout 会让紧随其后的排盘拿不到 市/区县（真太阳时失准），
  // 且跨模块裸调用 onProvChange/onCityChange 在 IIFE 下是 ReferenceError（中断排盘）。
  if (d.useSolar && d.prov) {
    document.getElementById('inProv').value = d.prov;
    APP.onProvChange();
    var cSel = document.getElementById('inCity');
    if (d.city && hasOption(cSel, d.city)) cSel.value = d.city;
    APP.onCityChange();
    var dSel = document.getElementById('inDist');
    if (d.dist && hasOption(dSel, d.dist)) dSel.value = d.dist;
  }
}

// 下拉框里没有该选项时保持原值，避免回填出列表里不存在的地址
function hasOption(sel, val) {
  if (!sel) return false;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === val) return true;
  }
  return false;
}

function autoSaveArchive() {
  var d = getFormData();
  if (!d.name) return;
  var archives = getArchives();
  var ts = new Date().toISOString();
  // 附加当前排盘计算结果
  var baziData = getCurrentBaziResult();
  d.bazi = baziData.bazi;
  d.sanyuan = baziData.sanyuan;
  d.extras = baziData.extras;
  d.gongWeiType = baziData.gongWeiType;
  var existIdx = archives.findIndex(function(a) { return a.name === d.name && a.gender === d.gender; });
  if (existIdx >= 0) {
    archives[existIdx] = Object.assign({}, archives[existIdx], d, {updatedAt: ts});
  } else {
    archives.push(Object.assign({}, d, {id: Date.now(), createdAt: ts, updatedAt: ts, isPreset: false}));
  }
  saveArchives(archives);
  refreshArchiveModalIfOpen();
  refreshArchiveModalIfOpen();
}

function saveArchive() {
  var d = getFormData();
  if (!d.name) { alert('请填写姓名'); return; }
  var archives = getArchives();
  var ts = new Date().toISOString();
  // 附加当前排盘计算结果
  var baziData = getCurrentBaziResult();
  d.bazi = baziData.bazi;
  d.sanyuan = baziData.sanyuan;
  d.extras = baziData.extras;
  d.gongWeiType = baziData.gongWeiType;
  // 检查同名同性别是否已存在
  var existIdx = archives.findIndex(function(a) { return a.name === d.name && a.gender === d.gender; });
  if (existIdx >= 0) {
    if (!confirm('「' + getDisplayName(d) + '」已存在，覆盖更新？')) return;
    archives[existIdx] = Object.assign({}, archives[existIdx], d, {updatedAt: ts});
  } else {
    archives.push(Object.assign({}, d, {id: Date.now(), createdAt: ts, updatedAt: ts, isPreset: false}));
  }
  saveArchives(archives);
  refreshArchiveModalIfOpen();
}

function loadArchive(idx) {
  if (typeof idx !== 'number') return;
  var archives = getArchives();
  if (!archives[idx]) return;
  setFormData(archives[idx]);
  APP.doPaipan();
}

function delArchive() {
  // 此函数依赖 archSel，现已移除。保留函数体供兼容，实际删除操作通过弹窗内的按钮进行。
  // 如需删除，请在终端中手动操作 localStorage。
  alert('请在档案弹窗中操作。如需删除，请联系开发者。');
}

// v0.12.0 软删除：移入回收站
function moveToTrash(idx) {
  var archives = getArchives();
  if (!archives[idx]) return;
  var a = archives[idx];
  var extraMsg = a.isPreset ? '\n⚠ 这是预置档案，删除后可在回收站恢复。' : '';
  if (!confirm('确定删除「' + getDisplayName(a) + '」的档案？可在回收站恢复。' + extraMsg)) return;
  var ts = new Date().toISOString();
  var trashItem = Object.assign({}, a, {deletedAt: ts});
  addTomb(a.id);
  var trash = getTrash();
  trash.push(trashItem);
  saveTrash(trash);
  archives.splice(idx, 1);
  saveArchives(archives);
  refreshArchiveModalIfOpen();
}

// ============================================================
// v0.12.0 编辑弹窗
// ============================================================
var _editOriginal = null; // 编辑前的档案快照，用于检测未保存修改
var _editIdx = -1;

function openEditPanel(idx) {
  var archives = getArchives();
  if (!archives[idx]) return;
  var a = archives[idx];
  _editIdx = idx;
  _editOriginal = JSON.parse(JSON.stringify(a));

  document.getElementById('editNickname').value = a.nickname || '';
  document.getElementById('editYiming').value = a.yiming || '';
  document.getElementById('editName').value = a.name || '';
  document.getElementById('editGender').value = a.gender;
  var isLunar = a.calendarType === 'lunar';
  if (isLunar) {
    document.getElementById('editCalLunar').checked = true;
  } else {
    document.getElementById('editCalSolar').checked = true;
  }
  editCalChange(); // 切换月控件
  document.getElementById('editYear').value = a.year;
  if (isLunar) {
    var ms = document.getElementById('editMonthSelect');
    if (ms) ms.value = a.lunarMonth || a.month;
    document.getElementById('editLeap').checked = !!a.isLeap;
  } else {
    document.getElementById('editMonth').value = a.month;
  }
  document.getElementById('editDay').value = a.day;
  document.getElementById('editHour').value = a.hour;
  document.getElementById('editMin').value = a.min || 0;
  document.getElementById('editSolar').checked = a.useSolar;
  editSolarToggle();
  if (a.useSolar) {
    if (a.prov) { document.getElementById('editProv').value = a.prov; editProvChange(); }
    setTimeout(function() {
      if (a.city) { document.getElementById('editCity').value = a.city; editCityChange(); }
      setTimeout(function() {
        if (a.dist) document.getElementById('editDist').value = a.dist;
      }, 80);
    }, 80);
  }
  document.getElementById('editOverlay').classList.add('show');
  // 清除错误标记
  document.getElementById('editName').classList.remove('edit-error');
  document.getElementById('editYear').classList.remove('edit-error');
  document.getElementById('editMonth').classList.remove('edit-error');
  document.getElementById('editDay').classList.remove('edit-error');
  document.getElementById('editHour').classList.remove('edit-error');
  document.getElementById('editMin').classList.remove('edit-error');
}

function closeEditPanel() {
  var edited = getEditFormData();
  var changed = _editOriginal && (
    edited.name !== _editOriginal.name ||
    edited.nickname !== _editOriginal.nickname ||
    edited.yiming !== _editOriginal.yiming ||
    edited.gender !== _editOriginal.gender ||
    edited.year !== _editOriginal.year ||
    edited.month !== _editOriginal.month ||
    edited.day !== _editOriginal.day ||
    edited.hour !== _editOriginal.hour ||
    edited.min !== _editOriginal.min ||
    edited.useSolar !== _editOriginal.useSolar ||
    edited.calendarType !== _editOriginal.calendarType ||
    edited.isLeap !== _editOriginal.isLeap ||
    edited.lunarMonth !== _editOriginal.lunarMonth ||
    edited.prov !== _editOriginal.prov ||
    edited.city !== _editOriginal.city ||
    edited.dist !== _editOriginal.dist
  );
  if (changed && !confirm('有未保存的修改，确定关闭？')) return;
  document.getElementById('editOverlay').classList.remove('show');
  _editOriginal = null;
  _editIdx = -1;
}

function getEditFormData() {
  var isLunar = document.getElementById('editCalLunar').checked;
  var monthVal;
  if (isLunar) {
    var ms = document.getElementById('editMonthSelect');
    monthVal = ms ? parseInt(ms.value) : 1;
  } else {
    monthVal = parseInt(document.getElementById('editMonth').value);
  }
  return {
    nickname: document.getElementById('editNickname').value || '',
    yiming: document.getElementById('editYiming').value || '',
    name: document.getElementById('editName').value || '',
    gender: document.getElementById('editGender').value,
    year: parseInt(document.getElementById('editYear').value) || 0,
    month: monthVal || 0,
    day: parseInt(document.getElementById('editDay').value) || 0,
    hour: parseInt(document.getElementById('editHour').value) || 0,
    min: parseInt(document.getElementById('editMin').value) || 0,
    calendarType: isLunar ? 'lunar' : 'solar',
    isLeap: isLunar ? document.getElementById('editLeap').checked : false,
    lunarMonth: isLunar ? monthVal : null,
    useSolar: document.getElementById('editSolar').checked,
    prov: document.getElementById('editSolar').checked ? document.getElementById('editProv').value : '',
    city: document.getElementById('editSolar').checked ? document.getElementById('editCity').value : '',
    dist: document.getElementById('editSolar').checked ? document.getElementById('editDist').value : ''
  };
}

function isBirthFieldChanged(oldData, newData) {
  var keys = ['year','month','day','hour','min','gender','APP.calendarType','isLeap','lunarMonth','useSolar'];
  if (newData.useSolar) keys.push('prov', 'city', 'dist');
  for (var i = 0; i < keys.length; i++) {
    if (oldData[keys[i]] !== newData[keys[i]]) return true;
  }
  return false;
}

function saveEdit() {
  var edited = getEditFormData();
  // 校验
  var valid = true;
  if (!edited.name || edited.name.trim() === '') {
    document.getElementById('editName').classList.add('edit-error');
    valid = false;
  }
  if (/[<>&\"]/.test(edited.name)) {
    document.getElementById('editName').classList.add('edit-error');
    alert('姓名包含非法字符（< > & "）');
    valid = false;
  }
  if (!edited.year || edited.year < 1000 || edited.year > 2100) {
    document.getElementById('editYear').classList.add('edit-error');
    valid = false;
  }
  if (!edited.month || edited.month < 1 || edited.month > 12) {
    var mel = document.getElementById('editMonth') || document.getElementById('editMonthSelect');
    if (mel) mel.classList.add('edit-error');
    valid = false;
  }
  if (!edited.day || edited.day < 1 || edited.day > 31) {
    document.getElementById('editDay').classList.add('edit-error');
    valid = false;
  }
  if (edited.hour < 0 || edited.hour > 23 || edited.hour === undefined) {
    document.getElementById('editHour').classList.add('edit-error');
    valid = false;
  }
  if (edited.min < 0 || edited.min > 59) {
    document.getElementById('editMin').classList.add('edit-error');
    valid = false;
  }
  if (!valid) {
    if (!document.getElementById('editName').classList.contains('edit-error')) {
      alert('请检查红色标注的字段');
    }
    return;
  }

  // 从 localStorage 重新读取，避免并发覆盖
  var archives = getArchives();
  var old = archives[_editIdx];
  if (!old) { alert('档案已被删除'); closeEditPanel(); return; }

  // 出生字段变更 → 清除排盘缓存
  if (isBirthFieldChanged(old, edited)) {
    edited.bazi = null;
    edited.sanyuan = null;
    edited.extras = null;
  } else {
    edited.bazi = old.bazi;
    edited.sanyuan = old.sanyuan;
    edited.extras = old.extras;
    edited.gongWeiType = old.gongWeiType;
  }

  // 同名同性别冲突检查（排除自身）
  var conflictIdx = -1;
  for (var c = 0; c < archives.length; c++) {
    if (c === _editIdx) continue;
    if (archives[c].name === edited.name && archives[c].gender === edited.gender) {
      conflictIdx = c;
      break;
    }
  }
  if (conflictIdx >= 0) {
    if (!confirm('「' + getDisplayName(edited) + '」已存在，覆盖更新？')) return;
    // 删除冲突项，保留当前编辑项
    archives.splice(conflictIdx, 1);
    if (conflictIdx < _editIdx) _editIdx--;
  }

  edited.updatedAt = new Date().toISOString();
  if (old.isPreset) edited.isPreset = false;
  else edited.isPreset = old.isPreset;

  // 合并到原对象
  archives[_editIdx] = Object.assign({}, old, edited);
  saveArchives(archives);
  migrateRecNotesKeys(old, edited);
  try { migrateRecAudioKeys(old, edited); } catch (e) {}
  // 直接关闭弹窗（不经过 closeEditPanel，避免"未保存修改"确认）
  document.getElementById('editOverlay').classList.remove('show');
  _editOriginal = null;
  _editIdx = -1;
  refreshArchiveModalIfOpen();
}

// ===== v0.55.1 分析记录随档案变更迁移（记录 key 含 name|gender|公历y|m|d|h|mi） =====
function archiveSolarYmd(a) {
  var y = +a.year, m = +a.month, d = +a.day;
  if (a.calendarType === 'lunar') {
    var s = lunarToSolar(y, m, d, !!a.isLeap);
    if (!s) return null;
    y = s.y; m = s.m; d = s.d;
  }
  return { y: y, m: m, d: d };
}
function recNotesKeyFor(a, suffix) {
  var s = archiveSolarYmd(a);
  if (!s) return null;
  return 'bz_rec_notes_' + (suffix || '') + [a.name || '', a.gender || '', s.y, s.m, s.d, +a.hour || 0, +a.min || 0].join('|');
}
var REC_SUFFIXES = ['', 'twin|'];
function migrateRecNotesKeys(oldA, newA) {
  for (var i = 0; i < REC_SUFFIXES.length; i++) {
    var ok = recNotesKeyFor(oldA, REC_SUFFIXES[i]);
    var nk = recNotesKeyFor(newA, REC_SUFFIXES[i]);
    if (!ok || !nk || ok === nk) continue;
    var ov = null, nv = null;
    try { ov = localStorage.getItem(ok); nv = localStorage.getItem(nk); } catch (e) {}
    if (ov == null || (nv != null && nv !== '')) continue;
    try { localStorage.setItem(nk, ov); localStorage.removeItem(ok); } catch (e) {}
  }
}
function migrateOrphanRecNotes() {
  var archives = getArchives();
  var keys = [];
  try { for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); } catch (e) { return; }
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    if (key.indexOf('bz_rec_notes_') !== 0) continue;
    var rest = key.slice('bz_rec_notes_'.length);
    var suffix = '';
    if (rest.indexOf('twin|') === 0) { suffix = 'twin|'; rest = rest.slice(5); }
    var parts = rest.split('|');
    if (parts.length !== 7) continue;
    var og = parts[1], oy = +parts[2], om = +parts[3], od = +parts[4], oh = +parts[5], omi = +parts[6];
    var hits = [];
    for (var j = 0; j < archives.length; j++) {
      var a = archives[j];
      if ((a.gender || '') !== og) continue;
      var s = archiveSolarYmd(a);
      if (!s || s.y !== oy || s.m !== om || s.d !== od) continue;
      if ((+a.hour || 0) !== oh || (+a.min || 0) !== omi) continue;
      hits.push(a);
    }
    if (hits.length !== 1) continue;
    if (hits[0].name === parts[0]) continue;
    var nk = recNotesKeyFor(hits[0], suffix);
    if (!nk || nk === key) continue;
    var ov2 = null, nv2 = null;
    try { ov2 = localStorage.getItem(key); nv2 = localStorage.getItem(nk); } catch (e) {}
    if (ov2 == null) continue;
    var merged = (nv2 != null && nv2 !== '') ? ov2 + '\n\n' + nv2 : ov2;
    try { localStorage.setItem(nk, merged); localStorage.removeItem(key); } catch (e) {}
  }
  // 二轮：生日/时辰变更（含农历互转）后旧 key 按 7 字段匹配不上任何档案，改按名字+性别回收；
  // 双胞胎同生日场景靠名字区分（彭子旭/彭子阳类），重名档案 hits!==1 跳过
  for (var k2 = 0; k2 < keys.length; k2++) {
    var key2 = keys[k2];
    if (key2.indexOf('bz_rec_notes_') !== 0) continue;
    var rest2 = key2.slice('bz_rec_notes_'.length);
    var suffix2 = '';
    if (rest2.indexOf('twin|') === 0) { suffix2 = 'twin|'; rest2 = rest2.slice(5); }
    var parts2 = rest2.split('|');
    if (parts2.length !== 7) continue;
    var hits2 = [];
    for (var j2 = 0; j2 < archives.length; j2++) {
      if ((archives[j2].name || '') === parts2[0] && (archives[j2].gender || '') === parts2[1]) hits2.push(archives[j2]);
    }
    if (hits2.length !== 1) continue;
    var nk2 = recNotesKeyFor(hits2[0], suffix2);
    if (!nk2 || nk2 === key2) continue;
    var ov3 = null, nv3 = null;
    try { ov3 = localStorage.getItem(key2); nv3 = localStorage.getItem(nk2); } catch (e) {}
    if (ov3 == null) continue;
    if (nv3 != null && nv3 !== '') {
      if (String(nv3).indexOf(String(ov3)) >= 0) { try { localStorage.removeItem(key2); } catch (e) {} }
      continue;
    }
    try { localStorage.setItem(nk2, ov3); localStorage.removeItem(key2); } catch (e) {}
  }
}

// ===== v0.80.0 录音随档案变更迁移（IndexedDB fire-and-forget，键指纹与分析记录同构） =====
function migrateRecAudioKeys(oldA, newA) {
  if (!window.RENDER || typeof window.RENDER.recAudioRewriteKey !== 'function') return;
  for (var i = 0; i < REC_SUFFIXES.length; i++) {
    var ok = recNotesKeyFor(oldA, REC_SUFFIXES[i]);
    var nk = recNotesKeyFor(newA, REC_SUFFIXES[i]);
    if (!ok || !nk || ok === nk) continue;
    try {
      window.RENDER.recAudioRewriteKey(
        'bz_rec_audio_' + ok.slice(REC_NOTES_PREFIX.length),
        'bz_rec_audio_' + nk.slice(REC_NOTES_PREFIX.length)
      ).catch(function() {});
    } catch (e) {}
  }
}

// 编辑弹窗 — 历法切换
function editCalChange() {
  var isLunar = document.getElementById('editCalLunar').checked;
  var mc = document.getElementById('editMonthCell');
  var lg = document.getElementById('editLeapGroup');
  if (isLunar) {
    mc.innerHTML = '<select id="editMonthSelect" style="width:60px;">'
      + '<option value="1">正月</option><option value="2">二月</option><option value="3">三月</option>'
      + '<option value="4">四月</option><option value="5">五月</option><option value="6">六月</option>'
      + '<option value="7">七月</option><option value="8">八月</option><option value="9">九月</option>'
      + '<option value="10">十月</option><option value="11">冬月</option><option value="12">腊月</option>'
      + '</select>';
    lg.style.display = 'inline';
  } else {
    mc.innerHTML = '<input type="number" id="editMonth" min="1" max="12" placeholder="月" style="width:48px;">';
    lg.style.display = 'none';
  }
}

// 编辑弹窗 — 真太阳时切换
function editSolarToggle() {
  var checked = document.getElementById('editSolar').checked;
  document.getElementById('editSolarGroup').style.display = checked ? 'flex' : 'none';
  if (!checked) {
    document.getElementById('editProv').value = '';
    document.getElementById('editCity').innerHTML = '<option value="">—</option>';
    document.getElementById('editDist').innerHTML = '<option value="">—</option>';
  }
}

// 编辑弹窗 — 省市区联动
function editProvChange() {
  var prov = document.getElementById('editProv').value;
  var citySel = document.getElementById('editCity');
  var distSel = document.getElementById('editDist');
  citySel.innerHTML = '<option value="">—</option>';
  distSel.innerHTML = '<option value="">—</option>';
  if (!prov || !LOC_DATA[prov]) return;
  var cities = LOC_DATA[prov].cities;
  var names = Object.keys(cities).sort();
  for (var i = 0; i < names.length; i++) {
    citySel.innerHTML += '<option value="' + names[i] + '">' + names[i] + '</option>';
  }
}

function editCityChange() {
  var prov = document.getElementById('editProv').value;
  var city = document.getElementById('editCity').value;
  var distSel = document.getElementById('editDist');
  distSel.innerHTML = '<option value="">—</option>';
  if (!prov || !city || !LOC_DATA[prov] || !LOC_DATA[prov].cities[city]) return;
  var dists = LOC_DATA[prov].cities[city].dist;
  if (!dists) return;
  for (var i = 0; i < dists.length; i++) {
    distSel.innerHTML += '<option value="' + dists[i] + '">' + dists[i] + '</option>';
  }
}

// ---- 回收站 ----
function showTrash() {
  renderTrash();
  document.getElementById('trashOverlay').classList.add('show');
}

function hideTrash() {
  document.getElementById('trashOverlay').classList.remove('show');
}

function renderTrash() {
  const list = document.getElementById('trashList');
  const trash = getTrash();
  if (!trash.length) {
    list.innerHTML = '<div style="color:var(--c-gray);text-align:center;padding:20px;">回收站为空</div>';
    return;
  }
  list.innerHTML = trash.map((a, i) => {
    const solar = a.useSolar ? '☀' : '';
    var delTime = a.deletedAt ? new Date(a.deletedAt).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).replace(/\//g,'-') : '';
    return `<div style="display:flex;flex-direction:column;padding:8px 8px;border-bottom:1px solid rgba(128,128,128,.15);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>${getDisplayName(a)} ${a.gender === '男' ? '♂' : '♀'} ${a.year}/${a.month}/${a.day} ${a.hour}:${String(a.min||0).padStart(2,'0')} ${solar}</span>
        <div style="display:flex;gap:6px;">
          <button class="archive-row-edit" onclick="ARCHIVE.restoreFromTrash(${i})" title="恢复">↩️ 恢复</button>
          <button class="archive-row-del" onclick="ARCHIVE.permanentDelete(${i})" title="彻底删除">🗑️ 彻底删除</button>
        </div>
      </div>
      ${delTime ? '<div style="font-size:11px;color:var(--c-gray);margin-top:2px;">删除于: ' + delTime + '</div>' : ''}
    </div>`;
  }).join('');
}

function restoreFromTrash(idx) {
  const trash = getTrash();
  if (!trash[idx]) return;
  const item = trash[idx];
  const { deletedAt, ...arch } = item;
  // 恢复后预置标记置为false（PRD E1）
  const restored = Object.assign({}, arch, { isPreset: false, updatedAt: new Date().toISOString() });
  const archives = getArchives();
  const existIdx = archives.findIndex(a => a.name === restored.name && a.gender === restored.gender);
  if (existIdx >= 0) {
    if (!confirm('「' + getDisplayName(restored) + '」已存在，覆盖恢复？')) return;
    archives[existIdx] = restored;
  } else {
    archives.push(restored);
  }
  saveArchives(archives);
  trash.splice(idx, 1);
  saveTrash(trash);
  refreshArchiveModalIfOpen();
  renderTrash();
}

// v0.12.0 彻底删除单条
function permanentDelete(idx) {
  const trash = getTrash();
  if (!trash[idx]) return;
  if (!confirm('确定彻底删除「' + getDisplayName(trash[idx]) + '」？此操作不可恢复。')) return;
  if (trash[idx].id !== undefined && trash[idx].id !== null) deleteNote(trash[idx].id);
  trash.splice(idx, 1);
  saveTrash(trash);
  renderTrash();
}

function emptyTrash() {
  const trash = getTrash();
  if (!trash.length) return;
  if (!confirm('确定清空回收站？所有档案将被永久删除。')) return;
  trash.forEach(function(a) { if (a && a.id !== undefined && a.id !== null) deleteNote(a.id); });
  saveTrash([]);
  hideTrash();
}

// ============================================================
// v0.9.0 档案管理 — 当前排盘结果存取
// ============================================================
var _currentBaziResult = null;

function setCurrentBaziResult(data) {
  _currentBaziResult = data;
}

function getCurrentBaziResult() {
  if (!_currentBaziResult) {
    return { bazi: null, sanyuan: null, extras: null, gongWeiType: null };
  }
  return {
    bazi: _currentBaziResult.bazi,
    sanyuan: _currentBaziResult.sanyuan,
    extras: _currentBaziResult.extras,
    gongWeiType: _currentBaziResult.gongWeiType || null
  };
}

// ============================================================
// v0.9.0 档案管理 — 展开渲染引擎
// ============================================================

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openArchivePanel() {
  var searchEl = document.getElementById('archive-search-modal');
  _searchKeyword = '';
  if (searchEl) searchEl.value = '';
  // 默认标签：打开时只显示默认标签下的档案；未设默认 / 默认标签已空 → 显示全部
  _activeTag = resolveDefaultFilter();
  hideDefaultTagPicker();
  renderArchiveModal();
  document.getElementById('archiveOverlay').classList.add('show');
  if (searchEl) setTimeout(function() { searchEl.focus(); }, 100);
}

function closeArchivePanel() {
  hideDefaultTagPicker();
  document.getElementById('archiveOverlay').classList.remove('show');
}

// ============================================================
// v0.32.0 档案标签（行内直接填 + 标签筛选 + 默认标签）
// ============================================================

// 单条档案的标签（缺省 / 脏数据一律降级为空数组）
function getArchiveTags(a) {
  if (!a || !Array.isArray(a.tags)) return [];
  var out = [];
  for (var i = 0; i < a.tags.length; i++) {
    var t = String(a.tags[i] == null ? '' : a.tags[i]).trim();
    if (t && out.indexOf(t) < 0) out.push(t);
  }
  return out;
}

// 输入框文本 → 标签数组：空格 / 逗号 / 顿号 / 分号 / 竖线分隔，去重并限量
function parseTagInput(v) {
  var parts = String(v == null ? '' : v).split(/[\s,，、;；|]+/);
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var t = parts[i].trim();
    if (!t || out.indexOf(t) >= 0) continue;
    out.push(t);
    if (out.length >= TAG_MAX) break;
  }
  return out;
}

// 行内标签输入落库（失焦 / 回车触发）。只重绘标签栏，不重绘列表：
// 若当场重绘列表，输入框 blur 与「修改」按钮 click 之间节点被替换，点击会丢。
function saveRowTags(idx, value) {
  var archives = getArchives();
  if (!archives[idx]) return;
  var tags = parseTagInput(value);
  if (getArchiveTags(archives[idx]).join('\u0001') === tags.join('\u0001')) return;
  archives[idx].tags = tags;
  saveArchives(archives);
  renderTagBar();
}

function getDefaultTag() {
  try { return localStorage.getItem(ARCH_TAG_KEY) || ''; } catch (e) { return ''; }
}

function setDefaultTag(tag) {
  var t = String(tag || '').trim();
  if (t) localStorage.setItem(ARCH_TAG_KEY, t);
  else localStorage.removeItem(ARCH_TAG_KEY);
}

// 默认标签若已不在任何档案上 → 回落「全部」，避免打开就是空列表
function resolveDefaultFilter() {
  var def = getDefaultTag();
  if (!def) return '';
  var archives = getArchives();
  for (var i = 0; i < archives.length; i++) {
    if (getArchiveTags(archives[i]).indexOf(def) >= 0) return def;
  }
  return '';
}

function matchTagFilter(a, filter) {
  if (!filter) return true;
  var tags = getArchiveTags(a);
  if (filter === TAG_UNTAGGED) return tags.length === 0;
  return tags.indexOf(filter) >= 0;
}

// 现存标签汇总：按标签名排序（中文按拼音），附条数与未分类数
function collectTags(archives) {
  var counts = {}, list = [], untagged = 0;
  for (var i = 0; i < archives.length; i++) {
    var tags = getArchiveTags(archives[i]);
    if (!tags.length) untagged++;
    for (var j = 0; j < tags.length; j++) {
      if (counts[tags[j]]) { counts[tags[j]]++; continue; }
      counts[tags[j]] = 1;
      list.push(tags[j]);
    }
  }
  list.sort(function(a, b) { return a.localeCompare(b, 'zh'); });
  return { tags: list, counts: counts, untagged: untagged, total: archives.length };
}

function renderTagBar() {
  var bar = document.getElementById('archive-tag-bar');
  if (!bar) return;
  var hasUntagged = false;
  var info = collectTags(getArchives());
  var def = getDefaultTag();
  var html = '<span class="archive-tag-label">标签</span>'
    + '<button class="archive-tag-chip' + (_activeTag === '' ? ' active' : '') + '" data-tag="">全部<span class="n">' + info.total + '</span></button>';
  for (var i = 0; i < info.tags.length; i++) {
    var t = info.tags[i];
    html += '<button class="archive-tag-chip' + (_activeTag === t ? ' active' : '') + '" data-tag="' + escHtml(t) + '">'
      + (t === def ? '<span class="star">★</span>' : '') + escHtml(t) + '<span class="n">' + info.counts[t] + '</span></button>';
  }
  hasUntagged = info.untagged > 0;
  if (hasUntagged) {
    html += '<button class="archive-tag-chip' + (_activeTag === TAG_UNTAGGED ? ' active' : '') + '" data-tag="' + TAG_UNTAGGED + '">未分类<span class="n">' + info.untagged + '</span></button>';
  }
  bar.innerHTML = html;
  if (!bar._tagBound) {
    bar.addEventListener('click', function(e) {
      var el = e.target.closest ? e.target.closest('.archive-tag-chip') : null;
      if (!el) return;
      setTagFilter(el.getAttribute('data-tag') || '');
    });
    bar._tagBound = true;
  }
  var btn = document.getElementById('btnDefaultTag');
  if (btn) btn.textContent = def ? ('🏷 默认：' + def) : '🏷 默认标签';
  renderDefaultTagPicker(info, def);
}

function renderDefaultTagPicker(info, def) {
  var panel = document.getElementById('archive-tag-default-panel');
  if (!panel) return;
  var html = '<div class="archive-tag-default-title">默认标签：打开档案时默认只显示该标签（随时点上方标签可切换）</div>'
    + '<label class="archive-tag-default-opt"><input type="checkbox" class="archive-tag-default-cb" data-tag=""' + (def ? '' : ' checked') + '>全部显示</label>';
  for (var i = 0; i < info.tags.length; i++) {
    var t = info.tags[i];
    html += '<label class="archive-tag-default-opt"><input type="checkbox" class="archive-tag-default-cb" data-tag="' + escHtml(t) + '"'
      + (t === def ? ' checked' : '') + '>' + escHtml(t) + '<span class="n">' + info.counts[t] + '</span></label>';
  }
  if (info.untagged > 0) {
    html += '<label class="archive-tag-default-opt"><input type="checkbox" class="archive-tag-default-cb" data-tag="' + TAG_UNTAGGED + '"'
      + (def === TAG_UNTAGGED ? ' checked' : '') + '>未分类<span class="n">' + info.untagged + '</span></label>';
  }
  panel.innerHTML = html;
  if (!panel._tagBound) {
    panel.addEventListener('change', function(e) {
      var el = e.target;
      if (!el || !el.classList || !el.classList.contains('archive-tag-default-cb')) return;
      var tag = el.getAttribute('data-tag') || '';
      setDefaultTag(tag);
      _activeTag = tag ? resolveDefaultFilter() : '';
      hideDefaultTagPicker();
      renderArchiveModal();
    });
    panel._tagBound = true;
  }
}

function toggleDefaultTagPicker() {
  var panel = document.getElementById('archive-tag-default-panel');
  if (!panel) return;
  var show = panel.style.display === 'none' || !panel.style.display;
  renderTagBar();
  panel.style.display = show ? 'block' : 'none';
}

function hideDefaultTagPicker() {
  var panel = document.getElementById('archive-tag-default-panel');
  if (panel) panel.style.display = 'none';
}

function setTagFilter(tag) {
  _activeTag = String(tag || '');
  hideDefaultTagPicker();
  renderArchiveModal();
}

// 排序键 = 列表所见的那一行名字（隐私关：小名 / 姓名；隐私开：艺名 → 小名 → 匿名），
// 保证「看到的顺序 = 拼音顺序」，隐私开关切换后同样成立
function archiveSortKey(a) {
  return getDisplayName(a);
}

// 按名字拼音升序（中文按拼音，localeCompare 'zh'）；同名再按正名、更新时间兜底
function sortArchivesByName(archives) {
  archives.sort(function(a, b) {
    var c = archiveSortKey(a).localeCompare(archiveSortKey(b), 'zh');
    if (c !== 0) return c;
    c = String((a && a.name) || '').localeCompare(String((b && b.name) || ''), 'zh');
    if (c !== 0) return c;
    return String((b && b.updatedAt) || '').localeCompare(String((a && a.updatedAt) || ''));
  });
  return archives;
}

// v0.38.0 档案行勾选 → 盘面对比选盘（与 COMPARE.pickToggle 同键，语义为置位而非翻转）
function cmpPick(id, checked) {
  var entries;
  try { entries = JSON.parse(localStorage.getItem('bz_cmp_state')); } catch(e) { entries = null; }
  if (!Array.isArray(entries)) entries = [];
  var found = -1;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i] && entries[i].type === 'arch' && String(entries[i].id) === String(id)) { found = i; break; }
  }
  if (checked && found < 0) entries.push({ type: 'arch', id: id });
  if (!checked && found >= 0) entries.splice(found, 1);
  localStorage.setItem('bz_cmp_state', JSON.stringify(entries));
  syncCmpTag(id, checked);
  if (window.COMPARE && COMPARE.isOpen && COMPARE.isOpen()) COMPARE.refresh();
}

// v0.40.0 选盘状态与「盘面对比」标签互为镜像：勾上补标、取消摘标（手动标签不受影响）
function syncCmpTag(id, on) {
  var archives = getArchives();
  for (var i = 0; i < archives.length; i++) {
    if (String(archives[i].id) !== String(id)) continue;
    var tags = getArchiveTags(archives[i]);
    var at = tags.indexOf(CMP_PICK_TAG);
    if (on && at < 0) {
      tags.push(CMP_PICK_TAG);
      archives[i].tags = tags;
      saveArchives(archives);
      renderTagBar();
      refreshArchiveModalIfOpen();
    } else if (!on && at >= 0) {
      tags.splice(at, 1);
      archives[i].tags = tags;
      saveArchives(archives);
      renderTagBar();
      refreshArchiveModalIfOpen();
    }
    break;
  }
}

function renderArchiveModal() {
  var listEl = document.getElementById('archive-modal-list');
  if (!listEl) return;
  var archives = getArchives();

  // 落盘顺序 = 显示顺序：行内 ✏️修改/🗑️删除/排盘 都按数组索引定位，两者必须一致
  sortArchivesByName(archives);
  saveArchives(archives);

  renderTagBar();
  renderArchiveBackupWarn();

  var k = _searchKeyword.trim().toLowerCase();
  if (archives.length === 0) {
    listEl.innerHTML = '<div class="archive-modal-empty">暂无档案，排盘后自动保存</div>';
    return;
  }

  var html = '';
  var hit = 0;
  for (var i = 0; i < archives.length; i++) {
    var a = archives[i];
    if (!matchTagFilter(a, _activeTag)) continue;
    if (k && !archiveMatchesKeyword(a, k)) continue;
    html += archiveRowHtml(a, i);
    hit++;
  }
  listEl.innerHTML = hit ? html : '<div class="archive-modal-empty">未找到匹配档案</div>';
}

function archiveMatchesKeyword(a, k) {
  return (a.nickname || '').toLowerCase().indexOf(k) >= 0
    || (a.yiming || '').toLowerCase().indexOf(k) >= 0
    || (a.name || '').toLowerCase().indexOf(k) >= 0
    || getArchiveTags(a).join(' ').toLowerCase().indexOf(k) >= 0;
}

function archiveRowHtml(a, idx) {
  var genderIcon = a.gender === '男' ? '♂' : '♀';
  var genderCls = a.gender === '男' ? 'male' : 'female';
  // v0.38.0 行首勾选 = 盘面对比选盘（按 id 记入 bz_cmp_state，与列表排序无关）
  var picked = !!(window.COMPARE && typeof COMPARE.isPicked === 'function' && COMPARE.isPicked('arch', a.id));
  return '<div class="archive-modal-row">'
    + '<input type="checkbox" class="archive-row-cmp" data-id="' + String(a.id).replace(/"/g, '') + '" title="勾选加入盘面对比"'
    + (picked ? ' checked' : '')
    + ' onchange="ARCHIVE.cmpPick(\'' + String(a.id).replace(/'/g, '') + '\', this.checked)">'
    + '<div class="archive-row-info">'
    + '<span class="archive-row-name">' + escHtml(getDisplayName(a)) + '</span>'
    + '<span class="archive-row-gender ' + genderCls + '">' + genderIcon + '</span>'
    + '<span class="archive-row-date">' + escHtml(a.year + '年') + '</span>'
    + '</div>'
    + '<div class="archive-row-actions">'
    + '<input class="archive-row-tags" type="text" placeholder="标签" title="多个标签用空格分隔，回车保存"'
    + ' value="' + escHtml(getArchiveTags(a).join(' ')) + '"'
    + ' onchange="ARCHIVE.saveRowTags(' + idx + ', this.value)"'
    + ' onkeydown="if(event.key===\'Enter\'){this.blur();}">'
    + '<button class="archive-row-note" title="命盘分析记录" onclick="ARCHIVE.openNotePanel(' + idx + ')">📝 记录</button>'
    + '<button class="archive-row-edit" onclick="ARCHIVE.openEditPanel(' + idx + ')">✏️ 修改</button>'
    + '<button class="archive-row-del" onclick="ARCHIVE.moveToTrash(' + idx + ')">🗑️ 删除</button>'
    + '<button class="archive-row-btn" onclick="ARCHIVE.loadFromArchive(' + idx + ')">排盘</button>'
    + '</div>'
    + '</div>';
}

// 标签筛选与搜索词（两者叠加生效）
var _activeTag = '';
var _searchKeyword = '';

// P1：搜索防抖 150ms，减少输入过程中的中间态渲染
var _filterTimer = null;
function onArchiveSearch(val) {
  clearTimeout(_filterTimer);
  _filterTimer = setTimeout(function() { filterArchives(val); }, 150);
}

function filterArchives(keyword) {
  _searchKeyword = String(keyword == null ? '' : keyword);
  renderArchiveModal();
}

function loadFromArchive(idx) {
  var archives = getArchives();
  if (!archives[idx]) return;
  setFormData(archives[idx]);
  closeArchivePanel();
  APP.doPaipan();
  // Scroll to top to see form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================

  // ============================================================
// v0.43.0 命盘分析记录：右侧滑出抽屉，内容按档案 id 存 localStorage
// ============================================================
var NOTE_KEY_PREFIX = 'bz_note_';
var _noteArchId = null;   // 当前抽屉绑定的档案 id（字符串）
var _noteTimer = null;    // 输入防抖句柄

function noteKey(id) { return NOTE_KEY_PREFIX + id; }

function readNote(id) {
  try {
    var v = JSON.parse(localStorage.getItem(noteKey(id)));
    if (v && typeof v.text === 'string') return v;
  } catch (e) {}
  return { text: '', updatedAt: null };
}

function openNotePanel(idx) {
  var archives = getArchives();
  var a = archives[idx];
  if (!a) return;
  flushNote();
  _noteArchId = String(a.id);
  var data = readNote(_noteArchId);
  document.getElementById('noteTitle').textContent = '📝 命盘分析记录 · ' + getDisplayName(a);
  document.getElementById('noteText').value = data.text;
  updateNoteMeta(data.updatedAt);
  document.getElementById('noteOverlay').classList.add('show');
}

function closeNotePanel() {
  flushNote();
  document.getElementById('noteOverlay').classList.remove('show');
  _noteArchId = null;
}

function onNoteInput() {
  if (!_noteArchId) return;
  document.getElementById('noteStatus').textContent = '正在输入…';
  document.getElementById('noteCount').textContent = document.getElementById('noteText').value.length + ' 字';
  clearTimeout(_noteTimer);
  _noteTimer = setTimeout(noteSaveNow, 800);
}

function noteSaveNow() {
  if (!_noteArchId) return;
  clearTimeout(_noteTimer);
  _noteTimer = null;
  var ts = new Date().toISOString();
  localStorage.setItem(noteKey(_noteArchId), JSON.stringify({ text: document.getElementById('noteText').value, updatedAt: ts }));
  updateNoteMeta(ts);
}

function flushNote() {
  if (_noteTimer) noteSaveNow();
}

function updateNoteMeta(ts) {
  document.getElementById('noteCount').textContent = document.getElementById('noteText').value.length + ' 字';
  var st = document.getElementById('noteStatus');
  if (!ts) { st.textContent = '尚未保存'; return; }
  var d = new Date(ts);
  st.textContent = '已自动保存 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function deleteNote(id) {
  localStorage.removeItem(noteKey(id));
}

// ============================================================
// v0.66.0 备份：档案 + 回收站 + 分析记录 一键导出 / 导入 JSON
// 分析记录只存本机 localStorage（不上云），换电脑 / 清缓存前必须先导一份
// ============================================================
var REC_NOTES_PREFIX = 'bz_rec_notes_';
var BACKUP_APP = 'bazi-paipan';

function collectRecNotes() {
  var out = {};
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(REC_NOTES_PREFIX) === 0) out[k] = localStorage.getItem(k) || '';
    }
  } catch (e) {}
  return out;
}

function buildBackup() {
  return {
    app: BACKUP_APP,
    exportedAt: new Date().toISOString(),
    archives: getArchives(),
    trash: getTrash(),
    recNotes: collectRecNotes()
  };
}

function backupFilename(t) {
  t = t || new Date();
  return '八字排盘备份-' + t.getFullYear() + pad(t.getMonth() + 1) + pad(t.getDate())
    + '-' + pad(t.getHours()) + pad(t.getMinutes()) + '.json';
}

function setBackupHint(msg) {
  var el = document.getElementById('archiveBackupHint');
  if (el) el.textContent = msg || '';
}

function exportBackup() {
  var data = buildBackup();
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 10000);
  writeNum(BACKUP_AT_KEY, Date.now());
  renderArchiveBackupWarn();
  setBackupHint('已导出 ' + data.archives.length + ' 条档案、' + Object.keys(data.recNotes).length + ' 条分析记录');
  return data;
}

// ===== v0.69.0 备份强提示 =====
// 档案只在浏览器本地，清缓存 / 换电脑即归零；距上次导出超 7 天就顶上常驻警示
var BACKUP_WARN_DAYS = 7;

function backupAgeDays() {
  var t = readNum(BACKUP_AT_KEY);
  if (!t) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

function backupWarnText(archiveCount) {
  var n = (archiveCount === undefined) ? getArchives().length : archiveCount;
  if (!n) return '';
  var d = backupAgeDays();
  if (d === null) return '⚠ 还没导出过备份 · 清浏览器缓存会全部丢失，点此导出';
  if (d >= BACKUP_WARN_DAYS) return '⚠ 已 ' + d + ' 天未导出备份 · 清浏览器缓存会全部丢失，点此导出';
  return '';
}

function renderArchiveBackupWarn() {
  var el = document.getElementById('archiveBackupWarn');
  if (!el) return;
  var msg = backupWarnText();
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

function pickImportBackup() {
  var el = document.getElementById('archiveImportFile');
  if (el) { el.value = ''; el.click(); }
}

// 合并式导入：档案按 id、记录按键，已存在的一律跳过，绝不覆盖现有内容
function importBackup(obj) {
  var res = { addedArchives: 0, skippedArchives: 0, addedNotes: 0, keptNotes: 0, addedTrash: 0 };
  if (!obj || !Array.isArray(obj.archives)) return res;
  var arr = getArchives();
  var ids = {};
  for (var i = 0; i < arr.length; i++) if (arr[i] && arr[i].id) ids[arr[i].id] = true;
  for (var j = 0; j < obj.archives.length; j++) {
    var a = obj.archives[j];
    if (!a || !a.id) continue;
    if (ids[a.id]) { res.skippedArchives++; continue; }
    arr.push(a);
    ids[a.id] = true;
    res.addedArchives++;
  }
  if (res.addedArchives) saveArchives(arr);
  if (Array.isArray(obj.trash) && obj.trash.length) {
    var tr = getTrash(), tids = {};
    for (var m = 0; m < tr.length; m++) if (tr[m] && tr[m].id) tids[tr[m].id] = true;
    for (var n = 0; n < obj.trash.length; n++) {
      var t = obj.trash[n];
      if (!t || !t.id || tids[t.id]) continue;
      tr.push(t); tids[t.id] = true; res.addedTrash++;
    }
    if (res.addedTrash) saveTrash(tr);
  }
  var notes = obj.recNotes || {};
  for (var k in notes) {
    if (!Object.prototype.hasOwnProperty.call(notes, k) || k.indexOf(REC_NOTES_PREFIX) !== 0) continue;
    var cur = '';
    try { cur = localStorage.getItem(k) || ''; } catch (e) { cur = ''; }
    if (cur.trim()) { res.keptNotes++; continue; }
    try { localStorage.setItem(k, String(notes[k] == null ? '' : notes[k])); res.addedNotes++; } catch (e) {}
  }
  return res;
}

function onImportFile(input) {
  var f = input && input.files && input.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function() {
    var obj = null;
    try { obj = JSON.parse(String(reader.result)); } catch (e) { obj = null; }
    if (!obj || !Array.isArray(obj.archives)) {
      alert('这不是八字排盘的备份文件（缺少 archives 字段）');
      input.value = '';
      return;
    }
    var nNotes = obj.recNotes ? Object.keys(obj.recNotes).length : 0;
    var ok = window.confirm('即将导入备份：\n· 档案 ' + obj.archives.length + ' 条（已存在的跳过）\n· 分析记录 ' + nNotes + ' 条（已有内容的不覆盖）\n\n不会删除或覆盖任何现有内容，是否继续？');
    if (!ok) { input.value = ''; return; }
    var r = importBackup(obj);
    if (typeof refreshArchiveModalIfOpen === 'function') refreshArchiveModalIfOpen();
    var msg = '导入完成：新增档案 ' + r.addedArchives + ' 条（跳过 ' + r.skippedArchives + '），新增记录 ' + r.addedNotes + ' 条（保留 ' + r.keptNotes + '）';
    setBackupHint(msg);
    alert(msg);
    input.value = '';
  };
  reader.readAsText(f);
}

// ============================================================
// v0.79.0 本地文件夹同步（File System Access API）
// 档案 / 分析记录 / 每人盘面 Markdown 实时写入本地固定目录，
// 数据不再只活在 localStorage 里，清缓存也不会归零。
// ============================================================
var SYNC_DB = 'bz_sync_db', SYNC_STORE = 'handles', SYNC_ID = 'dir';
var SYNC_ON_KEY = 'bz_sync_on', SYNC_NAME_KEY = 'bz_sync_name', SYNC_AT_KEY = 'bz_sync_at';
var _syncDir = null, _syncTimer = 0, _syncRunning = false, _syncPending = false;

function syncSupported() {
  return typeof window.showDirectoryPicker === 'function';
}
function syncPad2(n) {
  n = Number(n) || 0;
  return (n < 10 ? '0' : '') + n;
}
function syncOpenDb() {
  return new Promise(function(res, rej) {
    var r = indexedDB.open(SYNC_DB, 1);
    r.onupgradeneeded = function() { r.result.createObjectStore(SYNC_STORE); };
    r.onsuccess = function() { res(r.result); };
    r.onerror = function() { rej(r.error); };
  });
}
function syncDbOp(mode, fn) {
  return syncOpenDb().then(function(db) {
    return new Promise(function(res) {
      var rq = fn(db.transaction(SYNC_STORE, mode).objectStore(SYNC_STORE));
      rq.onsuccess = function() { res(rq.result); };
      rq.onerror = function() { res(null); };
    });
  }).catch(function() { return null; });
}
function syncEl() { return document.getElementById('syncHint'); }
function syncSetHint(text, color) {
  var el = syncEl();
  if (!el) return;
  el.textContent = text || '';
  el.style.color = color || '#0a7d33';
}
function syncShowBtn(id, on) {
  var b = document.getElementById(id);
  if (b) b.style.display = on ? '' : 'none';
}
function syncStatus() {
  var on = localStorage.getItem(SYNC_ON_KEY) === '1';
  var nm = localStorage.getItem(SYNC_NAME_KEY) || '';
  syncShowBtn('btnSyncOff', on && !!nm);
  syncShowBtn('btnSyncNow', on && !!nm);
  var pick = document.getElementById('btnSyncFolder');
  if (pick) pick.textContent = (on && nm) ? ('📁 ' + nm) : '📁 本地同步';
  if (!syncSupported()) {
    syncSetHint('当前浏览器不支持本地同步（需 Chrome/Edge，且用 https 或 localhost 打开）', '#b3261e');
    return;
  }
  if (!on || !nm) { syncSetHint('未开启：档案只存在浏览器里，清缓存会丢', '#b26a00'); return; }
  var at = readNum(SYNC_AT_KEY);
  var when = at ? new Date(at).toTimeString().slice(0, 8) : '—';
  syncSetHint('已同步到「' + nm + '」· 上次 ' + when, '#0a7d33');
}
function syncGz(o) { return o && o.gan ? (o.gan + o.zhi) : '—'; }

function syncChartMd(a, noteText) {
  var L = [];
  var nm = a.name || '未命名';
  L.push('# ' + nm + '　' + (a.gender || ''));
  L.push('');
  L.push('出生：' + a.year + '-' + syncPad2(a.month) + '-' + syncPad2(a.day)
    + ' ' + syncPad2(a.hour) + ':' + syncPad2(a.min || 0));
  if (a.updatedAt) L.push('');
  if (a.updatedAt) L.push('档案更新：' + a.updatedAt);
  L.push('');
  var al = null;
  try {
    al = window.ALGO.paipan(nm, a.gender || '男', a.year, a.month, a.day, a.hour, a.min || 0);
  } catch (e) {}
  if (!al) {
    L.push('（排盘失败：生日字段不完整）');
    L.push('');
    if (noteText) { L.push('## 分析记录'); L.push(''); L.push(noteText); }
    return L.join('\n') + '\n';
  }
  var heads = ['年柱', '月柱', '日柱', '时柱'];
  var g = [al.nian.gan, al.yue.gan, al.ri.gan, al.shi.gan];
  var z = [al.nian.zhi, al.yue.zhi, al.ri.zhi, al.shi.zhi];
  L.push('## 四柱');
  L.push('');
  L.push('| 　 | ' + heads.join(' | ') + ' |');
  L.push('| --- | --- | --- | --- | --- |');
  L.push('| 天干 | ' + g.join(' | ') + ' |');
  L.push('| 地支 | ' + z.join(' | ') + ' |');
  L.push('| 藏干 | ' + z.map(function(zz) { return (CANG_GAN[zz] || []).join(''); }).join(' | ') + ' |');
  L.push('| 十神 | ' + g.map(function(gg, i) {
    if (i === 2) return '日主';
    var s = '';
    try { s = window.ALGO.shiShen(al.ri.gan, gg, true) || ''; } catch (e) {}
    return s || '—';
  }).join(' | ') + ' |');
  L.push('');
  L.push('## 要位');
  L.push('');
  L.push('- 生肖：' + (al.shengXiao || '—'));
  L.push('- 命宫：' + syncGz(al.ming));
  L.push('- 身宫：' + syncGz(al.shen));
  L.push('- 胎元：' + syncGz(al.tai));
  L.push('- 胎年：' + syncGz(al.taiNian));
  if (al.qiYun) {
    L.push('- 起运：' + al.qiYun.years + ' 年 ' + al.qiYun.months + ' 个月 ' + al.qiYun.days + ' 天，'
      + al.qiYun.jyYear + ' 年交运'
      + (al.qiYun.shun === undefined || al.qiYun.shun === null ? '' : (al.qiYun.shun ? '（顺排）' : '（逆排）')));
  }
  L.push('');
  if (al.daYun && al.daYun.length) {
    L.push('## 大运');
    L.push('');
    L.push('| 起于 | 年龄 | 干支 |');
    L.push('| --- | --- | --- |');
    for (var i = 0; i < al.daYun.length; i++) {
      L.push('| ' + al.daYun[i].startYear + ' | ' + al.daYun[i].startAge + ' 岁 | '
        + al.daYun[i].gan + al.daYun[i].zhi + ' |');
    }
    L.push('');
  }
  L.push('## 分析记录');
  L.push('');
  L.push(noteText ? noteText : '（暂无）');
  L.push('');
  return L.join('\n');
}

function syncNoteOf(a, notes) {
  var base = REC_NOTES_PREFIX + (a.name || '') + '|' + (a.gender || '') + '|'
    + a.year + '|' + a.month + '|' + a.day + '|' + a.hour + '|' + (a.min || 0);
  if (notes[base]) return notes[base];
  var pfx = (a.name || '') + '|' + (a.gender || '') + '|' + a.year + '|' + a.month + '|' + a.day + '|';
  var best = '';
  for (var k in notes) {
    if (k.indexOf(REC_NOTES_PREFIX + pfx) !== 0) continue;
    if ((notes[k] || '').trim().length > best.trim().length) best = notes[k];
  }
  return best;
}

function syncBuildFiles() {
  var arch = getArchives();
  var notes = collectRecNotes();
  var files = [];
  files.push(['archives.json', JSON.stringify(arch, null, 2) + '\n']);
  files.push(['records.json', JSON.stringify(notes, null, 2) + '\n']);
  var used = {};
  var idx = ['# 八字排盘档案总览', '', '更新时间：' + new Date().toISOString(), '',
    '共 ' + arch.length + ' 份档案。每人一份「盘面-姓名.md」，含四柱、大运与分析记录。', '',
    '| 姓名 | 性别 | 出生 | 记录字数 |', '| --- | --- | --- | --- |'];
  for (var i = 0; i < arch.length; i++) {
    var a = arch[i];
    var nm = a.name || '未命名';
    var note = syncNoteOf(a, notes);
    var fn = '盘面-' + nm + '.md';
    if (used[fn]) fn = '盘面-' + nm + '-' + (a.id || i) + '.md';
    used[fn] = true;
    files.push([fn, syncChartMd(a, note)]);
    var vf = syncVerDecide(a, i, note, Date.now());
    if (vf) files.push([vf, '<!-- 八字排盘记录版本 ' + new Date().toISOString() + ' -->\n' + syncChartMd(a, note)]);
    idx.push('| ' + nm + ' | ' + (a.gender || '') + ' | '
      + a.year + '-' + syncPad2(a.month) + '-' + syncPad2(a.day) + ' ' + syncPad2(a.hour) + ':' + syncPad2(a.min || 0)
      + ' | ' + (note ? note.trim().length : 0) + ' |');
  }
  idx.push('');
  files.push(['INDEX.md', idx.join('\n')]);
  return files;
}

function syncWriteOne(dir, name, text) {
  return dir.getFileHandle(name, { create: true }).then(function(fh) {
    return fh.createWritable();
  }).then(function(w) {
    return w.write(text).then(function() { return w.close(); });
  });
}

function syncAll() {
  if (!_syncDir) return Promise.resolve(0);
  if (_syncRunning) { _syncPending = true; return Promise.resolve(-1); }
  _syncRunning = true;
  var files = [];
  try { files = syncBuildFiles(); } catch (e) { _syncRunning = false; return Promise.resolve(0); }
  var p = Promise.resolve();
  files.forEach(function(f) {
    p = p.then(function() {
      var name = f[0], slash = name.indexOf('/');
      if (slash < 0) return syncWriteOne(_syncDir, name, f[1]);
      return _syncDir.getDirectoryHandle(name.slice(0, slash), { create: true }).then(function(d) {
        return syncWriteOne(d, name.slice(slash + 1), f[1]);
      });
    });
  });
  return p.then(function() {
    _syncRunning = false;
    writeNum(SYNC_AT_KEY, Date.now());
    syncStatus();
    if (_syncPending) { _syncPending = false; return syncAll(); }
    return files.length;
  }).catch(function(err) {
    _syncRunning = false;
    syncSetHint('同步失败：' + (err && err.name === 'NotAllowedError' ? '目录权限已失效，点「本地同步」重新选择' : (err && err.message) || '未知错误'), '#b3261e');
    return 0;
  });
}

function syncTouch() {
  if (!_syncDir) return;
  if (localStorage.getItem(SYNC_ON_KEY) !== '1') return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(function() { syncAll(); }, 1200);
}

function pickSyncFolder() {
  if (!syncSupported()) {
    alert('当前浏览器不支持本地文件夹同步。\n\n请用 Chrome 或 Edge，通过 https:// 或 localhost 打开本页面（file:// 不支持）。');
    return;
  }
  window.showDirectoryPicker({ mode: 'readwrite', id: 'bz-sync', startIn: 'documents' })
    .then(function(handle) {
      _syncDir = handle;
      localStorage.setItem(SYNC_ON_KEY, '1');
      localStorage.setItem(SYNC_NAME_KEY, handle.name || '已选目录');
      return syncDbOp('readwrite', function(st) { return st.put(handle, SYNC_ID); })
        .then(function() { return syncAll(); });
    })
    .then(function(n) {
      if (n > 0) syncSetHint('已开启：' + n + ' 个文件已写入「' + (localStorage.getItem(SYNC_NAME_KEY) || '') + '」', '#0a7d33');
    })
    .catch(function(err) {
      if (err && err.name === 'AbortError') return;
      syncSetHint('选择目录失败：' + ((err && err.message) || '未知错误'), '#b3261e');
    });
}

function syncAllNow() {
  if (!_syncDir) { pickSyncFolder(); return; }
  syncSetHint('正在同步……', '#b26a00');
  syncAll().then(function(n) {
    if (n > 0) syncSetHint('已同步 ' + n + ' 个文件 · ' + new Date().toTimeString().slice(0, 8), '#0a7d33');
  });
}

function syncOff() {
  if (!confirm('关闭后，档案与分析记录将不再写入本地文件夹（浏览器里的数据不受影响）。确定关闭？')) return;
  clearTimeout(_syncTimer);
  _syncDir = null;
  localStorage.setItem(SYNC_ON_KEY, '0');
  syncDbOp('readwrite', function(st) { return st['delete'](SYNC_ID); });
  syncStatus();
}

function syncResume() {
  if (!syncSupported()) { syncStatus(); return; }
  if (localStorage.getItem(SYNC_ON_KEY) !== '1') { syncStatus(); return; }
  syncDbOp('readonly', function(st) { return st.get(SYNC_ID); }).then(function(h) {
    if (!h || !h.queryPermission) { syncStatus(); return; }
    return h.queryPermission({ mode: 'readwrite' }).then(function(perm) {
      if (perm === 'granted') {
        _syncDir = h;
        return syncAll();
      }
      syncSetHint('目录权限需重新授予，点「' + (localStorage.getItem(SYNC_NAME_KEY) || '本地同步') + '」重选一次即可', '#b26a00');
    });
  }).catch(function() { syncStatus(); });
}

function syncSubDir(sub) {
  if (!_syncDir) return Promise.resolve(null);
  return _syncDir.getDirectoryHandle(sub, { create: true }).catch(function() { return null; });
}
function syncReadText(sub, name) {
  if (!_syncDir || !name) return Promise.resolve(null);
  return syncSubDir(sub).then(function(d) {
    if (!d) return null;
    return d.getFileHandle(name).then(function(fh) { return fh.getFile(); })
      .then(function(f) { return f.text(); });
  }).catch(function() { return null; });
}
function syncWriteBlob(sub, name, blob) {
  if (!_syncDir || !name || !blob) return Promise.resolve(false);
  return syncSubDir(sub).then(function(d) {
    if (!d) return false;
    return d.getFileHandle(name, { create: true }).then(function(fh) {
      return fh.createWritable();
    }).then(function(w) { return w.write(blob).then(function() { return w.close(); }); });
  }).then(function(ok) {
    if (ok) { writeNum(SYNC_AT_KEY, Date.now()); syncStatus(); }
    return !!ok;
  }).catch(function() { return false; });
}
function syncDeleteFile(sub, name) {
  if (!_syncDir || !name) return Promise.resolve(false);
  return syncSubDir(sub).then(function(d) {
    if (!d) return false;
    return d.removeEntry(name).then(function() { return true; }).catch(function() { return false; });
  });
}

// ===== v0.81.0 分析记录版本管理：内容变化落「历史/盘面-姓名-时间.md」，10 分钟窗内持续编辑复用同一版 =====
var _syncVerMemo = {};
function syncVerReset() { _syncVerMemo = {}; }
function syncVerKey(a, idx) {
  return (a.name || '') + '|' + (a.gender || '') + '|' + a.year + '|' + a.month + '|'
    + a.day + '|' + a.hour + '|' + (a.min || 0) + '|' + (a.id || idx);
}
function syncVerDecide(a, idx, noteText, now) {
  now = new Date(now);
  var vk = syncVerKey(a, idx);
  var memo = _syncVerMemo[vk];
  if (!memo) { _syncVerMemo[vk] = { text: noteText || '', at: now.getTime(), file: '', bornAt: 0 }; return ''; }
  if ((memo.text || '') === (noteText || '')) return '';
  if (memo.file && now.getTime() - memo.bornAt < 600000) {
    memo.text = noteText || ''; memo.at = now.getTime();
    return memo.file;
  }
  var file = '历史/盘面-' + (a.name || '未命名') + '-'
    + syncPad2(now.getMonth() + 1) + '-' + syncPad2(now.getDate()) + '_'
    + syncPad2(now.getHours()) + '-' + syncPad2(now.getMinutes()) + '-' + syncPad2(now.getSeconds()) + '.md';
  memo.text = noteText || ''; memo.at = now.getTime(); memo.bornAt = now.getTime(); memo.file = file;
  return file;
}

// ===== v0.83.5 右栏「档案md」：打开当前命盘在本地同步目录里的最新 Markdown =====
function syncEnsureDir() {
  if (_syncDir) return Promise.resolve(_syncDir);
  if (localStorage.getItem(SYNC_ON_KEY) !== '1') return Promise.resolve(null);
  return syncDbOp('readonly', function(st) { return st.get(SYNC_ID); }).then(function(h) {
    if (!h || !h.queryPermission) return null;
    return h.queryPermission({ mode: 'readwrite' }).then(function(perm) {
      if (perm !== 'granted') return null;
      _syncDir = h;
      return h;
    });
  }).catch(function() { return null; });
}

function syncWaitIdle(tries) {
  tries = tries || 0;
  if (!_syncDir) return Promise.resolve(0);
  if ((_syncRunning || _syncPending) && tries < 60) {
    return new Promise(function(r) { setTimeout(r, 120); }).then(function() { return syncWaitIdle(tries + 1); });
  }
  return syncAll().then(function(n) {
    if (n === -1 && tries < 60) {
      return new Promise(function(r) { setTimeout(r, 120); }).then(function() { return syncWaitIdle(tries + 1); });
    }
    return n;
  }).catch(function() { return 0; });
}

function syncListDir(dir) {
  var out = [];
  if (!dir || typeof dir.values !== 'function') return Promise.resolve(out);
  var it = dir.values();
  return new Promise(function(done) {
    (function next() {
      it.next().then(function(r) {
        if (r.done) return done(out);
        out.push(r.value);
        next();
      }).catch(function() { done(out); });
    })();
  });
}

// 同名档案可能落成「盘面-姓名.md」或「盘面-姓名-<id>.md」，按 mtime 取最新那份
function syncChartNameMatch(nm, fn) {
  var head = '盘面-' + nm;
  fn = String(fn || '');
  if (fn.indexOf(head) !== 0 || !/\.md$/.test(fn)) return false;
  var tail = fn.slice(head.length);
  return tail === '.md' || /^-[^\/]*\.md$/.test(tail);
}
function syncNewestOf(list) {
  var best = null;
  (list || []).forEach(function(o) {
    if (o && (!best || (o.lastModified || 0) > (best.lastModified || 0))) best = o;
  });
  return best;
}
function syncLatestChartFile(nm, dir) {
  dir = dir || _syncDir;
  return syncListDir(dir).then(function(items) {
    var cands = (items || []).filter(function(h) {
      return h && h.kind === 'file' && syncChartNameMatch(nm, h.name);
    });
    if (!cands.length) return null;
    return Promise.all(cands.map(function(h) {
      return h.getFile().then(function(f) {
        return { h: h, name: h.name, lastModified: (f && f.lastModified) || 0, f: f };
      }).catch(function() { return null; });
    })).then(function(list) {
      var best = syncNewestOf(list);
      return best ? { h: best.h, f: best.f } : null;
    });
  });
}

function syncEscapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncPaintWindow(win, title, inner) {
  var doc = win.document;
  doc.open();
  doc.write('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>'
    + syncEscapeHtml(title) + '</title><style>'
    + 'html,body{margin:0;background:#faf8f3;color:#1f1f1f}'
    + 'body{padding:28px 32px 60px;font:15px/1.8 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}'
    + 'pre{max-width:920px;margin:0 auto;white-space:pre-wrap;word-break:break-word;'
    + 'font:13.5px/1.85 "SF Mono",Menlo,Consolas,monospace}'
    + '.hint{max-width:920px;margin:40px auto;font-size:15px;color:#8a6a2f}'
    + '.hint.err{color:#b3261e;white-space:pre-wrap}'
    + '</style></head><body>' + inner + '</body></html>');
  doc.close();
}

function openChartMd() {
  var d = window._paipanData || {};
  var nm = String(d.name || '').trim();
  var ta = document.querySelector('.record-panel .rec-text');
  if (ta) { try { ta.blur(); } catch (e) {} }
  if (!syncSupported()) {
    alert('当前浏览器不支持读取本地文件夹。\n\n请用 Chrome 或 Edge 打开 https:// 或 localhost 版本。');
    return;
  }
  if (!nm) {
    alert('当前盘面没有姓名，定位不到档案 md。\n\n请先把这份盘「存为档案」，或从档案里打开命盘。');
    return;
  }
  var win = window.open('', '_blank');
  if (win) { try { syncPaintWindow(win, '盘面-' + nm + '.md', '<p class="hint">正在同步并读取最新 md……</p>'); } catch (e) {} }

  syncEnsureDir().then(function(dir) {
    if (!dir) throw new Error('没有可用的本地同步目录（未开启，或目录权限已失效）。\n\n请在档案面板里点一次本地同步按钮，重选目录授权。');
    return syncWaitIdle(0).then(function() { return syncLatestChartFile(nm); });
  }).then(function(best) {
    if (!best) throw new Error('同步目录里没找到「盘面-' + nm + '.md」。\n\n这份盘可能还没存成档案，或存在别的目录里。');
    return best.f.text().then(function(text) { return { name: best.h.name, text: text }; });
  }).then(function(o) {
    if (!win || win.closed) { alert('新窗口被浏览器拦截了。\n\n请允许本站打开弹窗后再点。'); return; }
    syncPaintWindow(win, o.name, '<pre>' + syncEscapeHtml(o.text) + '</pre>');
  }).catch(function(err) {
    var msg = (err && err.message) || '未知错误';
    if (win && !win.closed) syncPaintWindow(win, '打开失败', '<p class="hint err">' + syncEscapeHtml(msg) + '</p>');
    else alert(msg);
  });
}

// ===== 挂载到全局命名空间 =====
  window.ARCHIVE = {
    PRESET_ARCHIVES: PRESET_ARCHIVES,
    buildBackup: buildBackup,
    exportBackup: exportBackup,
    pickImportBackup: pickImportBackup,
    importBackup: importBackup,
    onImportFile: onImportFile,
    collectRecNotes: collectRecNotes,
    syncSupported: syncSupported,
    syncStatus: syncStatus,
    syncAll: syncAll,
    syncAllNow: syncAllNow,
    syncTouch: syncTouch,
    syncResume: syncResume,
    syncBuildFiles: syncBuildFiles,
    syncWriteBlob: syncWriteBlob,
    syncReadText: syncReadText,
    syncDeleteFile: syncDeleteFile,
    syncChartMd: syncChartMd,
    openChartMd: openChartMd,
    syncLatestChartFile: syncLatestChartFile,
    syncChartNameMatch: syncChartNameMatch,
    syncNewestOf: syncNewestOf,
    syncEscapeHtml: syncEscapeHtml,
    syncVerDecide: syncVerDecide,
    syncVerReset: syncVerReset,
    pickSyncFolder: pickSyncFolder,
    syncOff: syncOff,
    backupFilename: backupFilename,
    migrateFromV1: migrateFromV1,
    initPresetArchives: initPresetArchives,
    getArchives: getArchives,
    saveArchives: saveArchives,
    saveArchivesRaw: saveArchivesRaw,
    mergeArchives: mergeArchives,
    archKeyOf: archKeyOf,
    addTomb: addTomb,
    getTomb: getTomb,
    backupAgeDays: backupAgeDays,
    backupWarnText: backupWarnText,
    renderArchiveBackupWarn: renderArchiveBackupWarn,
    getTrash: getTrash,
    saveTrash: saveTrash,
    refreshArchiveModalIfOpen: refreshArchiveModalIfOpen,
    getFormData: getFormData,
    setFormData: setFormData,
    autoSaveArchive: autoSaveArchive,
    saveArchive: saveArchive,
    loadArchive: loadArchive,
    delArchive: delArchive,
    moveToTrash: moveToTrash,
    openEditPanel: openEditPanel,
    closeEditPanel: closeEditPanel,
    getEditFormData: getEditFormData,
    isBirthFieldChanged: isBirthFieldChanged,
    saveEdit: saveEdit,
    migrateRecNotesKeys: migrateRecNotesKeys,
    migrateOrphanRecNotes: migrateOrphanRecNotes,
    migrateRecAudioKeys: migrateRecAudioKeys,
    recNotesKeyFor: recNotesKeyFor,
    editCalChange: editCalChange,
    editSolarToggle: editSolarToggle,
    editProvChange: editProvChange,
    editCityChange: editCityChange,
    showTrash: showTrash,
    hideTrash: hideTrash,
    renderTrash: renderTrash,
    restoreFromTrash: restoreFromTrash,
    permanentDelete: permanentDelete,
    emptyTrash: emptyTrash,
    setCurrentBaziResult: setCurrentBaziResult,
    getCurrentBaziResult: getCurrentBaziResult,
    escHtml: escHtml,
    openArchivePanel: openArchivePanel,
    closeArchivePanel: closeArchivePanel,
    renderArchiveModal: renderArchiveModal,
    cmpPick: cmpPick,
    syncCmpTag: syncCmpTag,
    onArchiveSearch: onArchiveSearch,
    filterArchives: filterArchives,
    // v0.32.0 标签
    TAG_UNTAGGED: TAG_UNTAGGED,
    TAG_MAX: TAG_MAX,
    ARCH_TAG_KEY: ARCH_TAG_KEY,
    getArchiveTags: getArchiveTags,
    parseTagInput: parseTagInput,
    saveRowTags: saveRowTags,
    getDefaultTag: getDefaultTag,
    setDefaultTag: setDefaultTag,
    resolveDefaultFilter: resolveDefaultFilter,
    matchTagFilter: matchTagFilter,
    collectTags: collectTags,
    renderTagBar: renderTagBar,
    renderDefaultTagPicker: renderDefaultTagPicker,
    toggleDefaultTagPicker: toggleDefaultTagPicker,
    hideDefaultTagPicker: hideDefaultTagPicker,
    setTagFilter: setTagFilter,
    archiveRowHtml: archiveRowHtml,
    // v0.33.0 按名字拼音排序
    archiveSortKey: archiveSortKey,
    sortArchivesByName: sortArchivesByName,
    getActiveTagFilter: function() { return _activeTag; },
    getPrivacyMode: getPrivacyMode,
    setPrivacyMode: setPrivacyMode,
    getDisplayName: getDisplayName,
    togglePrivacy: togglePrivacy,
    loadFromArchive: loadFromArchive,
    // v0.43.0 命盘分析记录
    openNotePanel: openNotePanel,
    closeNotePanel: closeNotePanel,
    onNoteInput: onNoteInput,
    noteSaveNow: noteSaveNow,
    readNote: readNote,
    deleteNote: deleteNote,
    noteKey: noteKey,
  };

  // ===== v0.69.0 跨标签页同步：别的窗口写过档案，本页立刻跟上 =====
  // 只更新基线 + 重渲染，不写盘，避免两个标签页互相触发写入
  window.addEventListener('storage', function(e) {
    if (!e.key) return;
    if (e.key === ARCH_KEY || e.key === ARCH_REV_KEY) {
      _archRevSeen = readNum(ARCH_REV_KEY);
      try { refreshArchiveModalIfOpen(); } catch (err) {}
      try { renderArchiveBackupWarn(); } catch (err) {}
    } else if (e.key === TRASH_KEY || e.key === TRASH_REV_KEY) {
      _trashRevSeen = readNum(TRASH_REV_KEY);
    }
  });

  // ===== v0.32.0 回归测试段（?test=1，经 __testAppend 追加到统一统计）=====
  // archive.js 早于 main.js 加载，__testAppend（main.js 定义）此刻尚不存在，
  // 故断言推到 load 之后跑，确保并入统一统计
  function runV032Tests() {
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else if (window.console) console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    var eqJson = function(a, b) { return JSON.stringify(a) === JSON.stringify(b); };

    // T01 标签解析
    t('v0.32 T01:空格分隔', eqJson(parseTagInput('自在班 老大'), ['自在班', '老大']), JSON.stringify(parseTagInput('自在班 老大')));
    t('v0.32 T01:中英分隔符混用', eqJson(parseTagInput('a,b，c、d;e；f|g'), ['a', 'b', 'c', 'd', 'e', 'f', 'g']), JSON.stringify(parseTagInput('a,b，c、d;e；f|g')));
    t('v0.32 T01:重复标签去重', eqJson(parseTagInput('a a  a'), ['a']), JSON.stringify(parseTagInput('a a  a')));
    t('v0.32 T01:空输入得空数组', parseTagInput('   ').length === 0, JSON.stringify(parseTagInput('   ')));
    t('v0.32 T01:上限 12 个', parseTagInput('t1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 t13').length === 12, parseTagInput('t1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11 t12 t13').length);

    // T02 标签读取（脏数据降级）
    t('v0.32 T02:空值过滤+trim+去重', eqJson(getArchiveTags({ tags: ['a', '', '  ', null, 'a', ' b '] }), ['a', 'b']), JSON.stringify(getArchiveTags({ tags: ['a', '', '  ', null, 'a', ' b '] })));
    t('v0.32 T02:无 tags 字段→空数组', getArchiveTags({}).length === 0 && getArchiveTags(null).length === 0, 'nos');

    // T03 筛选匹配
    t('v0.32 T03:空筛选命中全部', matchTagFilter({ tags: [] }, '') === true);
    t('v0.32 T03:命中标签', matchTagFilter({ tags: ['班A', '班B'] }, '班B') === true);
    t('v0.32 T03:未命中标签', matchTagFilter({ tags: ['班A'] }, '班B') === false);
    t('v0.32 T03:未分类伪标签', matchTagFilter({ tags: [] }, TAG_UNTAGGED) === true && matchTagFilter({ tags: ['x'] }, TAG_UNTAGGED) === false);

    // T04 标签汇总
    var info = collectTags([{ tags: ['乙', '甲'] }, { tags: ['甲'] }, { tags: [] }]);
    t('v0.32 T04:标签去重+计数', info.tags.length === 2 && info.tags.indexOf('甲') >= 0 && info.tags.indexOf('乙') >= 0 && info.counts['甲'] === 2 && info.counts['乙'] === 1, JSON.stringify(info.tags));
    t('v0.32 T04:标签按名排序(ASCII)', eqJson(collectTags([{ tags: ['b'] }, { tags: ['a'] }]).tags, ['a', 'b']), JSON.stringify(collectTags([{ tags: ['b'] }, { tags: ['a'] }]).tags));
    t('v0.32 T04:未分类计数', info.untagged === 1 && info.total === 3, info.untagged + '/' + info.total);

    // T05 默认标签读写（用完还原）
    var bakDefault = getDefaultTag();
    setDefaultTag('回归默认');
    t('v0.32 T05:写后读一致', getDefaultTag() === '回归默认', getDefaultTag());
    setDefaultTag('');
    t('v0.32 T05:清空后为空', getDefaultTag() === '', getDefaultTag());

    // T06-T08 渲染冒烟 + 筛选 + 默认标签（临时替换档案库，断言后完整还原）
    var bakArch = localStorage.getItem(ARCH_KEY);
    try {
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 't1', name: '测试甲', gender: '男', year: 2020, month: 1, day: 1, hour: 0, min: 0, tags: ['自在班', '老大'], updatedAt: '2020-01-02T00:00:00.000Z' },
        { id: 't2', name: '测试乙', gender: '女', year: 2021, month: 2, day: 2, hour: 1, min: 0, updatedAt: '2020-01-01T00:00:00.000Z' }
      ]));
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
      var rows = document.querySelectorAll('#archive-modal-list .archive-modal-row');
      t('v0.32 T06:无标签旧档案照常渲染', rows.length === 2, rows.length);
      var tagInput = document.querySelector('#archive-modal-list .archive-row-tags');
      t('v0.32 T06:标签框紧邻记录按钮之前', !!tagInput && !!tagInput.nextElementSibling && tagInput.nextElementSibling.className.indexOf('archive-row-note') === 0, tagInput && tagInput.nextElementSibling && tagInput.nextElementSibling.className);
      t('v0.32 T06:记录按钮后接修改按钮', !!tagInput && !!tagInput.nextElementSibling && tagInput.nextElementSibling.nextElementSibling.className.indexOf('archive-row-edit') === 0, tagInput && tagInput.nextElementSibling && tagInput.nextElementSibling.nextElementSibling && tagInput.nextElementSibling.nextElementSibling.className);
      t('v0.32 T06:标签框回填多标签', !!tagInput && tagInput.value === '自在班 老大', tagInput && tagInput.value);
      t('v0.32 T06:标签栏 全部+2标签+未分类', document.querySelectorAll('#archive-tag-bar .archive-tag-chip').length === 4, document.querySelectorAll('#archive-tag-bar .archive-tag-chip').length);

      saveRowTags(0, '自在班 新标签');
      var t1 = getArchives().filter(function(x) { return x.id === 't1'; })[0];
      t('v0.32 T07:行内填写直接入库', eqJson(getArchiveTags(t1), ['自在班', '新标签']), JSON.stringify(getArchiveTags(t1)));
      saveRowTags(0, '');
      t1 = getArchives().filter(function(x) { return x.id === 't1'; })[0];
      t('v0.32 T07:清空输入即删标签', getArchiveTags(t1).length === 0, JSON.stringify(getArchiveTags(t1)));
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 't1', name: '测试甲', gender: '男', year: 2020, month: 1, day: 1, hour: 0, min: 0, tags: ['自在班', '老大'], updatedAt: '2020-01-02T00:00:00.000Z' },
        { id: 't2', name: '测试乙', gender: '女', year: 2021, month: 2, day: 2, hour: 1, min: 0, updatedAt: '2020-01-01T00:00:00.000Z' }
      ]));
      renderArchiveModal();

      setTagFilter('自在班');
      t('v0.32 T07:按标签筛选剩 1 行', document.querySelectorAll('#archive-modal-list .archive-modal-row').length === 1, document.querySelectorAll('#archive-modal-list .archive-modal-row').length);
      setTagFilter(TAG_UNTAGGED);
      var editBtn = document.querySelector('#archive-modal-list .archive-row-edit');
      t('v0.32 T07:未分类筛选剩 1 行且索引正确', document.querySelectorAll('#archive-modal-list .archive-modal-row').length === 1 && !!editBtn && editBtn.getAttribute('onclick').indexOf('openEditPanel(1)') >= 0, editBtn && editBtn.getAttribute('onclick'));
      setTagFilter('不存在的标签');
      t('v0.32 T07:空结果出提示', !!document.querySelector('#archive-modal-list .archive-modal-empty'), document.querySelector('#archive-modal-list').textContent);
      setTagFilter('');
      filterArchives('测试乙');
      t('v0.32 T08:搜索与标签筛选叠加', document.querySelectorAll('#archive-modal-list .archive-modal-row').length === 1, document.querySelectorAll('#archive-modal-list .archive-modal-row').length);
      filterArchives('');
      setDefaultTag('自在班');
      t('v0.32 T08:默认标签存在时命中', resolveDefaultFilter() === '自在班', resolveDefaultFilter());
      setDefaultTag('不存在的标签');
      t('v0.32 T08:默认标签失效回落全部', resolveDefaultFilter() === '', resolveDefaultFilter());
    } catch (e) {
      t('v0.32 T06:渲染冒烟异常', false, String(e));
    } finally {
      if (bakArch === null) localStorage.removeItem(ARCH_KEY); else localStorage.setItem(ARCH_KEY, bakArch);
      setDefaultTag(bakDefault);
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
    }
  }
  // ===== v0.33.0 回归测试段（?test=1，经 __testAppend 追加到统一统计）：档案按名字拼音排序 =====
  function runV033Tests() {
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else if (window.console) console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    var idsOf = function(arr) { return arr.map(function(x) { return x && x.id; }).join(','); };
    var shownNames = function() {
      return [].map.call(document.querySelectorAll('#archive-modal-list .archive-row-name'), function(el) { return el.textContent; }).join(',');
    };
    var syncPrivacyBtns = function() {
      var on = getPrivacyMode();
      [document.getElementById('btnPrivacy'), document.getElementById('btnPrivacy2')].forEach(function(b) {
        if (!b) return;
        b.textContent = on ? '🔒 隐私' : '🔓 隐私';
        if (on) b.classList.add('privacy-on'); else b.classList.remove('privacy-on');
      });
    };
    var bakArch = localStorage.getItem(ARCH_KEY);
    var bakPrivacy = localStorage.getItem(PRIVACY_KEY);
    var bakDefault = getDefaultTag();
    try {
      // T01 纯汉字按读音升序（非 UTF-16 码位序：码位序会得 张,李,王,陈）
      var hz = [{ id: 'h1', name: '张伟' }, { id: 'h2', name: '李娜' }, { id: 'h3', name: '王芳' }, { id: 'h4', name: '陈晨' }];
      sortArchivesByName(hz);
      t('v0.33 T01:汉字按拼音升序', idsOf(hz) === 'h4,h2,h3,h1', idsOf(hz));
      var byCode = [{ name: '张伟' }, { name: '李娜' }, { name: '王芳' }, { name: '陈晨' }]
        .sort(function(x, y) { return x.name < y.name ? -1 : 1; }).map(function(x) { return x.name; }).join(',');
      t('v0.33 T01:与码位序不同（真按读音）', idsOf(hz) === 'h4,h2,h3,h1' && byCode !== '陈晨,李娜,王芳,张伟', byCode);

      // T02 排序键 = 列表所见显示名（隐私关：小名 / 姓名；隐私开：小名）
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 's1', name: '李帛锴', nickname: '想想', gender: '男', year: 2019, month: 8, day: 9, hour: 14, min: 0, updatedAt: '2020-01-03T00:00:00.000Z' },
        { id: 's2', name: '杨禹赫', nickname: '六一', gender: '男', year: 2021, month: 6, day: 1, hour: 22, min: 0, updatedAt: '2020-01-01T00:00:00.000Z' },
        { id: 's3', name: '熊朗翔', nickname: '糯米', gender: '男', year: 2020, month: 8, day: 6, hour: 6, min: 0, updatedAt: '2020-01-02T00:00:00.000Z' }
      ]));
      setPrivacyMode(false);
      renderArchiveModal();
      t('v0.33 T02:隐私关按小名升序', shownNames() === '六一 / 杨禹赫,糯米 / 熊朗翔,想想 / 李帛锴', shownNames());
      setPrivacyMode(true);
      renderArchiveModal();
      t('v0.33 T02:隐私开仍按小名升序', shownNames() === '六一,糯米,想想', shownNames());

      // T03 落盘顺序 = 显示顺序（行内 ✏️修改/🗑️删除/排盘 都按数组索引定位，此为前提）
      var storedIds = idsOf(getArchives());
      t('v0.33 T03:落盘顺序=显示顺序', storedIds === 's2,s3,s1', storedIds);
      t('v0.33 T03:不再按修改时间排', storedIds !== 's1,s3,s2', storedIds);

      // T04 行内索引取到的就是那一行的人
      var rows = document.querySelectorAll('#archive-modal-list .archive-modal-row');
      var oc3 = rows[2] ? rows[2].querySelector('.archive-row-edit').getAttribute('onclick') : '';
      var idx3 = Number((oc3.match(/openEditPanel\((\d+)\)/) || [])[1]);
      t('v0.33 T04:第3行索引=2', idx3 === 2, oc3);
      t('v0.33 T04:索引取到同一条档案', (getArchives()[idx3] || {}).id === 's1', 'idx=' + idx3);

      // T05 同名兜底（按更新时间新在前）+ 幂等
      var dup = [{ name: '张伟', updatedAt: '2020-01-01T00:00:00.000Z' }, { id: 'd2', name: '张伟', updatedAt: '2020-02-01T00:00:00.000Z' }];
      sortArchivesByName(dup);
      t('v0.33 T05:同名按更新时间新在前', dup[0].id === 'd2', dup.map(function(x) { return x.updatedAt; }).join(','));
      var idem = [{ id: 'i1', name: '王芳' }, { id: 'i2', name: '李娜' }, { id: 'i3', name: '张伟' }, { id: 'i4', name: '陈晨' }];
      sortArchivesByName(idem);
      var once = idsOf(idem);
      sortArchivesByName(idem);
      t('v0.33 T05:排序幂等', idsOf(idem) === once, once);

      // T06 脏数据兜底（缺字段 / null 不抛错，空名回落匿名）
      var okDirty = true;
      try { sortArchivesByName([null, {}, { name: '' }, { nickname: null, name: '阿三' }]); } catch (e) { okDirty = false; }
      t('v0.33 T06:脏数据不抛错', okDirty);
      setPrivacyMode(true);
      t('v0.33 T06:无名字段回落 匿名/空', archiveSortKey({}) === '匿名' && archiveSortKey(null) === '', JSON.stringify([archiveSortKey({}), archiveSortKey(null)]));
    } catch (e) {
      t('v0.33 T00:测试异常', false, String(e));
    } finally {
      if (bakArch === null) localStorage.removeItem(ARCH_KEY); else localStorage.setItem(ARCH_KEY, bakArch);
      if (bakPrivacy === null) localStorage.removeItem(PRIVACY_KEY); else localStorage.setItem(PRIVACY_KEY, bakPrivacy);
      setDefaultTag(bakDefault);
      syncPrivacyBtns();
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
    }
  }
  // ===== v0.34.0 回归测试段：点档案行「排盘」必须立即排盘（出生地回填要同步、且不得抛错） =====
  function runV034Tests() {
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else if (window.console) console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    var val = function(id) { var el = document.getElementById(id); return el ? el.value : null; };
    var bakArch = localStorage.getItem(ARCH_KEY);
    var bakForm = getFormData();
    try {
      // T01 回填含出生地的档案不得抛错（旧版裸调 onProvChange/onCityChange → ReferenceError，中断排盘）
      var threw = null;
      try {
        setFormData({ name: '回归出生地', gender: '男', year: 2000, month: 1, day: 1, hour: 12, min: 0,
                      useSolar: true, prov: '四川省', city: '乐山市', dist: '市中区', calendarType: 'solar' });
      } catch (e) { threw = String(e); }
      t('v0.34 T01:回填出生地不抛错', threw === null, threw || 'ok');

      // T02 省/市/区县同步就位（旧版 50ms 两级定时器 → setFormData 返回时仍是上一条档案的地址）
      t('v0.34 T02:省市区同步就位',
        val('inProv') === '四川省' && val('inCity') === '乐山市' && val('inDist') === '市中区',
        [val('inProv'), val('inCity'), val('inDist')].join('/'));

      // T03 列表里不存在的区县不写入，省/市保持合法值
      setFormData({ name: '回归脏地址', gender: '男', year: 2000, month: 1, day: 1, hour: 12, min: 0,
                    useSolar: true, prov: '四川省', city: '乐山市', dist: '不存在的区', calendarType: 'solar' });
      t('v0.34 T03:未知区县不写入', val('inDist') !== '不存在的区' && val('inProv') === '四川省' && val('inCity') === '乐山市',
        [val('inProv'), val('inCity'), val('inDist')].join('/'));

      // T04 端到端：档案行「排盘」→ 立刻出该档案的结果（含真太阳时）
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 'v34e2e', name: '回归真太阳时', gender: '男', year: 2000, month: 1, day: 1, hour: 12, min: 0,
          useSolar: true, prov: '四川省', city: '乐山市', dist: '市中区', calendarType: 'solar',
          updatedAt: '2026-09-19T00:00:00.000Z' }
      ]));
      loadFromArchive(0);
      var outEl = document.getElementById('output');
      var txt = outEl ? outEl.innerText : '';
      t('v0.34 T04:点档案立即排该档案', val('inName') === '回归真太阳时' && txt.indexOf('2000年1月1日') >= 0,
        txt.replace(/\s+/g, ' ').slice(0, 48));
      t('v0.34 T04:真太阳时随出生地生效', txt.indexOf('真太阳时') >= 0);
      t('v0.34 T04:点击后排盘弹窗已关闭', !document.getElementById('archiveOverlay').classList.contains('show'));

      // T05/T06 农历档案回填（v0.43.6）：旧版走 ALGO.toggleCalendar（内部引用未定义 calendarType）
      // → ReferenceError 中断，农历档案点「排盘」无反应
      var threwLunar = null;
      try {
        setFormData({ name: '回归农历', gender: '女', year: 1979, month: 8, day: 25, hour: 10, min: 0,
                      useSolar: false, calendarType: 'lunar', lunarMonth: 8, isLeap: false });
      } catch (e) { threwLunar = String(e); }
      t('v0.34 T05:农历档案回填不抛错', threwLunar === null, threwLunar || 'ok');
      t('v0.34 T05:农历月控件就位', !!document.getElementById('inMonthSelect') && document.getElementById('inMonthSelect').value === '8' && APP.calendarType === 'lunar',
        [APP.calendarType, document.getElementById('inMonthSelect') ? document.getElementById('inMonthSelect').value : 'null'].join('/'));

      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 'v34lunar', name: '回归农历档案', gender: '女', year: 1979, month: 8, day: 25, hour: 10, min: 0,
          useSolar: false, calendarType: 'lunar', lunarMonth: 8, isLeap: false,
          updatedAt: '2026-10-06T00:00:00.000Z' }
      ]));
      loadFromArchive(0);
      var txtLunar = (document.getElementById('output') || {}).innerText || '';
      t('v0.34 T06:农历档案点排盘立即出盘', val('inName') === '回归农历档案' && txtLunar.indexOf('乙卯') >= 0,
        txtLunar.replace(/\s+/g, ' ').slice(0, 48));
    } catch (e) {
      t('v0.34 T00:测试异常', false, String(e));
    } finally {
      if (bakArch === null) localStorage.removeItem(ARCH_KEY); else localStorage.setItem(ARCH_KEY, bakArch);
      setFormData(bakForm);
      APP.doPaipan();
      renderArchiveModal();
    }
  }
  // ===== v0.43.0 回归测试段（?test=1，经 __testAppend 追加到统一统计）：命盘分析记录 =====
  function runV043Tests() {
    var t = function(label, ok, detail) {
      var item = { label: label, ok: !!ok, detail: detail };
      if (window.__testAppend) window.__testAppend(item);
      else if (window.console) console.log((ok ? '✅ ' : '❌ ') + label, detail || '');
    };
    var bakArch = localStorage.getItem(ARCH_KEY);
    var ov = document.getElementById('noteOverlay');
    var ta = document.getElementById('noteText');
    if (!ov || !ta) { t('v0.43 T00:记录抽屉 DOM 缺失', false, 'noteOverlay/noteText'); return; }
    try {
      // T01 行内按钮：存在、索引正确、位于标签框与修改键之间
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 't43note', name: '记录测试', gender: '男', year: 2000, month: 1, day: 1, hour: 0, min: 0, updatedAt: '2026-09-28T00:00:00.000Z' }
      ]));
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
      var noteBtn = document.querySelector('#archive-modal-list .archive-row-note');
      t('v0.43 T01:记录按钮存在且索引正确', !!noteBtn && (noteBtn.getAttribute('onclick') || '').indexOf('openNotePanel(0)') >= 0, noteBtn && noteBtn.getAttribute('onclick'));

      // T02 点击滑出抽屉：标题带档案显示名、空白页
      noteBtn.click();
      t('v0.43 T02:点击滑出抽屉', ov.classList.contains('show'), ov.className);
      t('v0.43 T02:标题带档案名', document.getElementById('noteTitle').textContent.indexOf('记录测试') >= 0, document.getElementById('noteTitle').textContent);
      t('v0.43 T02:新档案空白页', ta.value === '' && document.getElementById('noteStatus').textContent === '尚未保存', document.getElementById('noteStatus').textContent);

      // T03 输入即落盘 bz_note_<id>（JSON 带时间戳）+ 字数统计
      ta.value = '案例一：乙木生巳月。';
      onNoteInput();
      noteSaveNow();
      var raw = localStorage.getItem(noteKey('t43note'));
      var parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) {}
      t('v0.43 T03:输入落盘 bz_note_<id>', !!parsed && parsed.text === '案例一：乙木生巳月。' && typeof parsed.updatedAt === 'string', raw);
      t('v0.43 T03:字数统计', document.getElementById('noteCount').textContent === (ta.value.length + ' 字'), document.getElementById('noteCount').textContent);

      // T04 关闭再开：文本回填 + 状态行
      closeNotePanel();
      t('v0.43 T04:关闭后抽屉收起', !ov.classList.contains('show'), ov.className);
      openNotePanel(0);
      t('v0.43 T04:重开回填已存文本', ta.value === '案例一：乙木生巳月。', ta.value);
      t('v0.43 T04:状态行显示已保存', document.getElementById('noteStatus').textContent.indexOf('已自动保存') >= 0, document.getElementById('noteStatus').textContent);

      // T05 档案改名（nickname）后记录仍按 id 绑定不丢
      var arr5 = getArchives();
      arr5[0].nickname = '改名了';
      saveArchives(arr5);
      renderArchiveModal();
      openNotePanel(0);
      t('v0.43 T05:改名后记录仍在', ta.value === '案例一：乙木生巳月。', ta.value);
      t('v0.43 T05:标题随改名', document.getElementById('noteTitle').textContent.indexOf('改名了') >= 0, document.getElementById('noteTitle').textContent);

      // T06 多档案隔离：第二条档案各写各的
      localStorage.setItem(ARCH_KEY, JSON.stringify([
        { id: 't43note', name: '记录测试', gender: '男', year: 2000, month: 1, day: 1, hour: 0, min: 0, updatedAt: '2026-09-28T00:00:00.000Z' },
        { id: 't43blank', name: '空白测试', gender: '女', year: 2001, month: 1, day: 1, hour: 0, min: 0, updatedAt: '2026-09-28T00:00:00.000Z' }
      ]));
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
      document.querySelectorAll('#archive-modal-list .archive-row-note')[1].click();
      t('v0.43 T06:第二档案是独立空白页', ta.value === '', ta.value);
      closeNotePanel();
      openNotePanel(0);
      t('v0.43 T06:第一档案记录不受干扰', ta.value === '案例一：乙木生巳月。', ta.value);
      closeNotePanel();
    } catch (e) {
      t('v0.43 T00:测试异常', false, String(e));
    } finally {
      localStorage.removeItem(noteKey('t43note'));
      localStorage.removeItem(noteKey('t43blank'));
      if (bakArch === null) localStorage.removeItem(ARCH_KEY); else localStorage.setItem(ARCH_KEY, bakArch);
      _activeTag = ''; _searchKeyword = '';
      renderArchiveModal();
    }
  }
  if (/[\?&]test=1(&|$)/.test(location.search)) {
    var runAllTests = function() { runV032Tests(); runV033Tests(); runV034Tests(); runV043Tests(); };
    if (document.readyState === 'complete') runAllTests();
    else window.addEventListener('load', runAllTests);
  }
})();
