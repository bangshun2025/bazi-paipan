/* 八字排盘 v0.21.0 — archive.js */
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
}

// ===== v0.9.0 核心读写函数 =====
function getArchives() {
  try {
    var arr = JSON.parse(localStorage.getItem(ARCH_KEY));
    if (!arr || !Array.isArray(arr)) return [];
    return arr;
  } catch(e) { return []; }
}

function saveArchives(arr) {
  localStorage.setItem(ARCH_KEY, JSON.stringify(arr));
}

function saveArchivesRaw(arr) {
  localStorage.setItem(ARCH_KEY, JSON.stringify(arr));
}

function getTrash() {
  try { return JSON.parse(localStorage.getItem(TRASH_KEY)) || []; }
  catch(e) { return []; }
}

function saveTrash(arr) {
  localStorage.setItem(TRASH_KEY, JSON.stringify(arr));
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
  if (window.RENDER && document.getElementById('output') && document.getElementById('output').innerHTML.indexOf('person-info') >= 0) {
    window.RENDER.doPaipan();
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
    lunarMonth: isLunar ? parseInt(document.getElementById('inMonthSelect').value) : null
  };
}

function setFormData(d) {
  // v0.8.0 先切换历法模式（会重建月控件），再回填值
  var calType = d.calendarType || 'solar';
  if (calType !== APP.calendarType) {
    toggleCalendar(calType);
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
  document.getElementById('useSolar').checked = d.useSolar;
  APP.toggleSolar();
  if (d.useSolar) {
    if (d.prov) { document.getElementById('inProv').value = d.prov; onProvChange(); }
    setTimeout(() => {
      if (d.city) { document.getElementById('inCity').value = d.city; onCityChange(); }
      setTimeout(() => {
        if (d.dist) document.getElementById('inDist').value = d.dist;
      }, 50);
    }, 50);
  }
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
  if (!edited.year || edited.year < 1600 || edited.year > 2100) {
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
  // 直接关闭弹窗（不经过 closeEditPanel，避免"未保存修改"确认）
  document.getElementById('editOverlay').classList.remove('show');
  _editOriginal = null;
  _editIdx = -1;
  refreshArchiveModalIfOpen();
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
  trash.splice(idx, 1);
  saveTrash(trash);
  renderTrash();
}

function emptyTrash() {
  const trash = getTrash();
  if (!trash.length) return;
  if (!confirm('确定清空回收站？所有档案将被永久删除。')) return;
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
  renderArchiveModal();
  document.getElementById('archiveOverlay').classList.add('show');
  document.getElementById('archive-search-modal').value = '';
  setTimeout(function() { document.getElementById('archive-search-modal').focus(); }, 100);
}

function closeArchivePanel() {
  document.getElementById('archiveOverlay').classList.remove('show');
}

function renderArchiveModal() {
  var listEl = document.getElementById('archive-modal-list');
  var archives = getArchives();
  if (!listEl) return;

  if (archives.length === 0) {
    listEl.innerHTML = '<div class="archive-modal-empty">暂无档案，排盘后自动保存</div>';
    return;
  }

  // Sort by updatedAt desc
  archives.sort(function(a, b) {
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
  saveArchives(archives);

  var html = '';
  for (var i = 0; i < archives.length; i++) {
    var a = archives[i];
    var genderIcon = a.gender === '男' ? '♂' : '♀';
    var genderCls = a.gender === '男' ? 'male' : 'female';
    var displayName = getDisplayName(a);
    var dateStr = a.year + '年';
    html += '<div class="archive-modal-row">'
      + '<div class="archive-row-info">'
      + '<span class="archive-row-name">' + escHtml(displayName) + '</span>'
      + '<span class="archive-row-gender ' + genderCls + '">' + genderIcon + '</span>'
      + '<span class="archive-row-date">' + escHtml(dateStr) + '</span>'
      + '</div>'
      + '<div class="archive-row-actions">'
      + '<button class="archive-row-edit" onclick="ARCHIVE.openEditPanel(' + i + ')">✏️ 修改</button>'
      + '<button class="archive-row-del" onclick="ARCHIVE.moveToTrash(' + i + ')">🗑️ 删除</button>'
      + '<button class="archive-row-btn" onclick="ARCHIVE.loadFromArchive(' + i + ')">排盘</button>'
      + '</div>'
      + '</div>';
  }
  listEl.innerHTML = html;
}

// P1：搜索防抖 150ms，减少输入过程中的中间态渲染
var _filterTimer = null;
function onArchiveSearch(val) {
  clearTimeout(_filterTimer);
  _filterTimer = setTimeout(function() { filterArchives(val); }, 150);
}

function filterArchives(keyword) {
  var k = (keyword || '').trim().toLowerCase();
  var archives = getArchives();
  var listEl = document.getElementById('archive-modal-list');
  if (!listEl) return;

  if (!k) {
    renderArchiveModal();
    return;
  }

  var filtered = [];
  for (var i = 0; i < archives.length; i++) {
    var a = archives[i];
    var match = (a.nickname || '').toLowerCase().indexOf(k) >= 0
      || (a.yiming || '').toLowerCase().indexOf(k) >= 0
      || (a.name || '').toLowerCase().indexOf(k) >= 0;
    if (match) filtered.push({arch: a, idx: i});
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="archive-modal-empty">未找到匹配档案</div>';
    return;
  }

  var html = '';
  for (var j = 0; j < filtered.length; j++) {
    var a = filtered[j].arch;
    var idx = filtered[j].idx;
    var genderIcon = a.gender === '男' ? '♂' : '♀';
    var genderCls = a.gender === '男' ? 'male' : 'female';
    var displayName = getDisplayName(a);
    var dateStr = a.year + '年';
    html += '<div class="archive-modal-row">'
      + '<div class="archive-row-info">'
      + '<span class="archive-row-name">' + escHtml(displayName) + '</span>'
      + '<span class="archive-row-gender ' + genderCls + '">' + genderIcon + '</span>'
      + '<span class="archive-row-date">' + escHtml(dateStr) + '</span>'
      + '</div>'
      + '<div class="archive-row-actions">'
      + '<button class="archive-row-edit" onclick="ARCHIVE.openEditPanel(' + idx + ')">✏️ 修改</button>'
      + '<button class="archive-row-del" onclick="ARCHIVE.moveToTrash(' + idx + ')">🗑️ 删除</button>'
      + '<button class="archive-row-btn" onclick="ARCHIVE.loadFromArchive(' + idx + ')">排盘</button>'
      + '</div>'
      + '</div>';
  }
  listEl.innerHTML = html;
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

  // ===== 挂载到全局命名空间 =====
  window.ARCHIVE = {
    PRESET_ARCHIVES: PRESET_ARCHIVES,
    migrateFromV1: migrateFromV1,
    initPresetArchives: initPresetArchives,
    getArchives: getArchives,
    saveArchives: saveArchives,
    saveArchivesRaw: saveArchivesRaw,
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
    onArchiveSearch: onArchiveSearch,
    filterArchives: filterArchives,
    getPrivacyMode: getPrivacyMode,
    setPrivacyMode: setPrivacyMode,
    getDisplayName: getDisplayName,
    togglePrivacy: togglePrivacy,
    loadFromArchive: loadFromArchive,
  };
})();
