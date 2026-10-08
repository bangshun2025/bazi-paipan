/* 八字排盘 v0.43.2 — render.js */
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

  // ===== 别名：来自 gongwei.js =====
  var loadGroups = GONGWEI.loadGroups;
  var loadTrash = GONGWEI.loadTrash;
  var loadSelected = GONGWEI.loadSelected;
  var persistGroups = GONGWEI.persistGroups;
  var persistTrash = GONGWEI.persistTrash;
  var persistSelected = GONGWEI.persistSelected;
  var nowISO = GONGWEI.nowISO;
  var generateGwId = GONGWEI.generateGwId;
  var findGroupByName = GONGWEI.findGroupByName;
  var getGroupColor = GONGWEI.getGroupColor;
  var initGongWeiGroups = GONGWEI.initGongWeiGroups;
  var addGroup = GONGWEI.addGroup;
  var updateGroup = GONGWEI.updateGroup;
  var deleteGroup = GONGWEI.deleteGroup;
  var restoreFromTrash = GONGWEI.restoreFromTrash;
  var clearTrash = GONGWEI.clearTrash;
  var moveGroup = GONGWEI.moveGroup;
  var moveUp = GONGWEI.moveUp;
  var moveDown = GONGWEI.moveDown;
  var toggleSelect = GONGWEI.toggleSelect;
  var selectAll = GONGWEI.selectAll;
  var clearSelection = GONGWEI.clearSelection;
  var isSelected = GONGWEI.isSelected;
  var resetToDefaults = GONGWEI.resetToDefaults;
  var buildGongWeiTagRows = GONGWEI.buildGongWeiTagRows;
  var updateGongWeiTags = GONGWEI.updateGongWeiTags;
  var updateGzTriggerText = GONGWEI.updateGzTriggerText;
  var syncGzCheckboxes = GONGWEI.syncGzCheckboxes;
  var rebuildGzCbGrid = GONGWEI.rebuildGzCbGrid;
  var renderGongWeiPanel = GONGWEI.renderGongWeiPanel;
  var toggleGongWei = GONGWEI.toggleGongWei;
  var selectAllGongWei = GONGWEI.selectAllGongWei;
  var clearAllGongWei = GONGWEI.clearAllGongWei;
  var toggleGzPopover = GONGWEI.toggleGzPopover;
  var closeGzPopover = GONGWEI.closeGzPopover;
  var openGzSettings = GONGWEI.openGzSettings;
  var closeGzSettings = GONGWEI.closeGzSettings;
  var renderGzSettingsList = GONGWEI.renderGzSettingsList;
  var gzDragStart = GONGWEI.gzDragStart;
  var gzDragOver = GONGWEI.gzDragOver;
  var gzDragLeave = GONGWEI.gzDragLeave;
  var gzDrop = GONGWEI.gzDrop;
  var gzDragEnd = GONGWEI.gzDragEnd;
  var confirmDeleteGroup = GONGWEI.confirmDeleteGroup;
  var openGzEdit = GONGWEI.openGzEdit;
  var closeGzEdit = GONGWEI.closeGzEdit;
  var checkCloseGzEdit = GONGWEI.checkCloseGzEdit;
  var checkGzEditValid = GONGWEI.checkGzEditValid;
  var saveGzEdit = GONGWEI.saveGzEdit;
  var openGzTrash = GONGWEI.openGzTrash;
  var backToGzList = GONGWEI.backToGzList;
  var renderGzTrashList = GONGWEI.renderGzTrashList;
  var emptyGzTrash = GONGWEI.emptyGzTrash;
  var resetGongWeiDefaults = GONGWEI.resetGongWeiDefaults;
  var renderTwinPillarPanel = GONGWEI.renderTwinPillarPanel;
  var onTwinPillarChange = GONGWEI.onTwinPillarChange;
  var toggleTpPopover = GONGWEI.toggleTpPopover;
  var closeTpPopover = GONGWEI.closeTpPopover;
  var selectAllTwinPillars = GONGWEI.selectAllTwinPillars;
  var clearAllTwinPillars = GONGWEI.clearAllTwinPillars;
  var selectedGongWei = GONGWEI.selectedGongWei;
  var gongWeiGroups = GONGWEI.gongWeiGroups;
  var gongWeiTrash = GONGWEI.gongWeiTrash;

  // ===== 别名：来自 archive.js =====
  var PRESET_ARCHIVES = ARCHIVE.PRESET_ARCHIVES;
  var migrateFromV1 = ARCHIVE.migrateFromV1;
  var initPresetArchives = ARCHIVE.initPresetArchives;
  var getArchives = ARCHIVE.getArchives;
  var saveArchives = ARCHIVE.saveArchives;
  var saveArchivesRaw = ARCHIVE.saveArchivesRaw;
  var getTrash = ARCHIVE.getTrash;
  var saveTrash = ARCHIVE.saveTrash;
  var refreshArchiveModalIfOpen = ARCHIVE.refreshArchiveModalIfOpen;
  var getFormData = ARCHIVE.getFormData;
  var setFormData = ARCHIVE.setFormData;
  var autoSaveArchive = ARCHIVE.autoSaveArchive;
  var saveArchive = ARCHIVE.saveArchive;
  var loadArchive = ARCHIVE.loadArchive;
  var delArchive = ARCHIVE.delArchive;
  var moveToTrash = ARCHIVE.moveToTrash;
  var openEditPanel = ARCHIVE.openEditPanel;
  var closeEditPanel = ARCHIVE.closeEditPanel;
  var getEditFormData = ARCHIVE.getEditFormData;
  var isBirthFieldChanged = ARCHIVE.isBirthFieldChanged;
  var saveEdit = ARCHIVE.saveEdit;
  var editCalChange = ARCHIVE.editCalChange;
  var editSolarToggle = ARCHIVE.editSolarToggle;
  var editProvChange = ARCHIVE.editProvChange;
  var editCityChange = ARCHIVE.editCityChange;
  var showTrash = ARCHIVE.showTrash;
  var hideTrash = ARCHIVE.hideTrash;
  var renderTrash = ARCHIVE.renderTrash;
  var restoreFromTrash = ARCHIVE.restoreFromTrash;
  var permanentDelete = ARCHIVE.permanentDelete;
  var emptyTrash = ARCHIVE.emptyTrash;
  var setCurrentBaziResult = ARCHIVE.setCurrentBaziResult;
  var getCurrentBaziResult = ARCHIVE.getCurrentBaziResult;
  var escHtml = ARCHIVE.escHtml;
  var openArchivePanel = ARCHIVE.openArchivePanel;
  var closeArchivePanel = ARCHIVE.closeArchivePanel;
  var renderArchiveModal = ARCHIVE.renderArchiveModal;
  var onArchiveSearch = ARCHIVE.onArchiveSearch;
  var filterArchives = ARCHIVE.filterArchives;
  var loadFromArchive = ARCHIVE.loadFromArchive;

var LEVEL_LABELS = ['少','简','中','详','全'];
var LEVEL_ROW_KEYS = ['xingyao','nayin','nayun','zhuzuo','nianzuo','yuezuo','shizuo','taizuo','mingzuo','shenzuo','zizuo','zuonian','zuoyue','zuori','zuoshi','zuotai','zuoming','zuoshen','kongwang','shensha'];
var LEVEL_ROW_LABELS = { xingyao:'星曜', nayin:'纳音', nayun:'纳运', zhuzuo:'主坐', nianzuo:'年坐', yuezuo:'月坐', shizuo:'时坐', taizuo:'胎坐', mingzuo:'命坐', shenzuo:'身坐', zizuo:'自坐', zuonian:'坐年', zuoyue:'坐月', zuori:'坐日', zuoshi:'坐时', zuotai:'坐胎', zuoming:'坐命', zuoshen:'坐身', kongwang:'空亡', shensha:'神煞' };
var LEVEL_BASE_KEYS = ['xingyao','nayin','nayun','zizuo','kongwang','shensha'];
var LEVEL_TZ_KEYS_A = ['nianzuo','yuezuo','zhuzuo','shizuo','taizuo','mingzuo','shenzuo'];
var LEVEL_TZ_KEYS_B = ['zuonian','zuoyue','zuori','zuoshi','zuotai','zuoming','zuoshen'];
var LEVEL_PRESETS = (function() {
  var steps = [{}, {zhuzuo:1,zizuo:1}, {xingyao:1,nayin:1,nayun:1}, {kongwang:1}, {shensha:1}];
  return steps.map(function(_, lv) {
    var p = {};
    LEVEL_ROW_KEYS.forEach(function(k) {
      for (var i = 1; i <= lv; i++) { if (steps[i][k]) { p[k] = 1; break; } }
    });
    return p;
  });
})();
var _levelRows = {};
LEVEL_ROW_KEYS.forEach(function(k) { _levelRows[k] = false; });

// ===== v0.43.0 追加：主坐/七坐 与 坐X 组行（简分勾选，默认仅主坐） =====
// X坐 = 以 X 柱天干为参照对各地支求十二长生（固定干遍历支）
// 坐X = 固定 X 支，对每一个天干（四柱/大运/流年干）求十二长生（v0.43.2 裁决口径，与 X坐 互为转置）
var ZUO_GROUP = ['nianzuo','yuezuo','shizuo','taizuo','mingzuo','shenzuo'];
var SIT_MAIN_KEYS = ['zuonian','zuoyue','zuori','zuoshi'];
var SIT_SY_KEYS = ['zuotai','zuoming','zuoshen'];
var ZUO_REF = { nianzuo:'nian', yuezuo:'yue', shizuo:'shi', taizuo:'tai', mingzuo:'ming', shenzuo:'shen' };
var ZUO_TOKEN = { nianzuo:'nz1', yuezuo:'nz2', shizuo:'nz3', taizuo:'nz4', mingzuo:'nz5', shenzuo:'nz6' };
var SIT_MAIN_COL = { zuonian:'nian', zuoyue:'yue', zuori:'ri', zuoshi:'shi' };
var SIT_SY_COL = { zuotai:'tai', zuoming:'ming', zuoshen:'shen' };
var SIT_TOKEN = { zuonian:'sk1', zuoyue:'sk2', zuori:'sk3', zuoshi:'sk4' };

function insertAfterAnchor(arr, re, htmlArr) {
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      arr.splice.apply(arr, [i + 1, 0].concat(htmlArr));
      return arr;
    }
  }
  return arr;
}
function zuoRowMain(p, k, luck) {
  var ref = p[ZUO_REF[k]] ? p[ZUO_REF[k]].gan : '';
  function c(z) { return ref ? changSheng(ref, z) : ''; }
  return '<tr class="rm" data-row-type="' + k + (luck ? ' ' + ZUO_TOKEN[k] : '') + '"><td class="rl">' + LEVEL_ROW_LABELS[k] + '</td>'
    + '<td>' + c(p.nian.zhi) + '</td><td>' + c(p.yue.zhi) + '</td><td>' + c(p.ri.zhi) + '</td><td>' + c(p.shi.zhi) + '</td>'
    + (luck ? '<td class="sep col-dy">' + c(luck.dy.zhi) + '</td><td class="col-ln">' + c(luck.ln.zhi) + '</td>' : '') + '</tr>';
}
function sitRowMain(p, k, luck) {
  var zhi = p[SIT_MAIN_COL[k]] ? p[SIT_MAIN_COL[k]].zhi : '';
  function v(ck) { return zhi && p[ck] && p[ck].gan ? changSheng(p[ck].gan, zhi) : ''; }
  return '<tr class="rm" data-row-type="' + k + (luck ? ' ' + SIT_TOKEN[k] : '') + '"><td class="rl">' + LEVEL_ROW_LABELS[k] + '</td>'
    + '<td>' + v('nian') + '</td><td>' + v('yue') + '</td><td>' + v('ri') + '</td><td>' + v('shi') + '</td>'
    + (luck ? '<td class="sep col-dy">' + (zhi && luck.dy.gan ? changSheng(luck.dy.gan, zhi) : '') + '</td><td class="col-ln">' + (zhi && luck.ln.gan ? changSheng(luck.ln.gan, zhi) : '') + '</td>' : '') + '</tr>';
}
function zuoRowSy(p, k, tail) {
  var ref = p[ZUO_REF[k]] ? p[ZUO_REF[k]].gan : '';
  function c(z) { return ref ? changSheng(ref, z) : ''; }
  return '<tr class="rm" data-sec="sanyuan" data-row-type="' + k + '"><td class="rl">' + LEVEL_ROW_LABELS[k] + '</td>'
    + '<td>' + c(p.taiNian.zhi) + '</td><td>' + c(p.tai.zhi) + '</td><td>' + c(p.ming.zhi) + '</td><td>' + c(p.shen.zhi) + '</td>'
    + (tail ? '<td class="sep"></td><td class="col-ln"></td>' : '') + '</tr>';
}
function sitRowSy(p, k, tail, colMap) {
  var cm = colMap || SIT_SY_COL;
  var zhi = p[cm[k]] ? p[cm[k]].zhi : '';
  function v(ck) { return zhi && p[ck] && p[ck].gan ? changSheng(p[ck].gan, zhi) : ''; }
  return '<tr class="rm" data-sec="sanyuan" data-row-type="' + k + '"><td class="rl">' + LEVEL_ROW_LABELS[k] + '</td>'
    + '<td>' + v('taiNian') + '</td><td>' + v('tai') + '</td><td>' + v('ming') + '</td><td>' + v('shen') + '</td>'
    + (tail ? '<td class="sep"></td><td class="col-ln"></td>' : '') + '</tr>';
}

function matchLevelPreset() {
  for (var i = 0; i < 5; i++) {
    var p = LEVEL_PRESETS[i], ok = true;
    LEVEL_ROW_KEYS.forEach(function(k) {
      if (ok && !!p[k] !== !!_levelRows[k]) ok = false;
    });
    if (ok) return i;
  }
  return -1;
}

function applyLevelRows() {
  document.querySelectorAll('table.chart').forEach(function(t) {
    t.classList.remove('level-0','level-1','level-2','level-3','level-4');
    LEVEL_ROW_KEYS.forEach(function(k) {
      t.querySelectorAll('tr[data-row-type~="' + k + '"]').forEach(function(tr) {
        tr.style.display = _levelRows[k] ? '' : 'none';
      });
    });
  });
  var m = matchLevelPreset();
  var label = '简分：' + (m >= 0 ? LEVEL_LABELS[m] : '自定义');
  document.querySelectorAll('.cmp-level-wrap > .btn-simple').forEach(function(b) { b.textContent = label; });
  applyCmpSecs();
}

function levelItemHTML(k) {
  return '<label class="clp-item"><input type="checkbox"' + (_levelRows[k] ? ' checked' : '') + ' onchange="RENDER.setRowVisible(\'' + k + '\', this.checked)">' + LEVEL_ROW_LABELS[k] + '</label>';
}
function levelPopHTML() {
  var cur = matchLevelPreset();
  var h = '<div class="clp-levels">';
  for (var i = 0; i < 5; i++)
    h += '<button class="clp-lv' + (i === cur ? ' active' : '') + '" onclick="RENDER.setLevelPreset(' + i + ')">' + LEVEL_LABELS[i] + '</button>';
  h += '</div><div class="clp-rowbar">';
  LEVEL_BASE_KEYS.forEach(function(k) { h += levelItemHTML(k); });
  h += '</div><div class="clp-sep"></div><div class="clp-tzgrid">';
  LEVEL_TZ_KEYS_A.forEach(function(k) { h += levelItemHTML(k); });
  LEVEL_TZ_KEYS_B.forEach(function(k) { h += levelItemHTML(k); });
  return h + '</div>';
}

function toggleLevelPop(e) {
  if (e) e.stopPropagation();
  var wrap = (e && e.target && e.target.closest) ? e.target.closest('.cmp-level-wrap') : null;
  var pop = wrap ? wrap.querySelector('.cmp-level-pop') : null;
  if (!pop) return;
  var wasOpen = pop.classList.contains('open');
  closeAllLevelPops();
  if (!wasOpen) { pop.innerHTML = levelPopHTML(); pop.classList.add('open'); }
}

function closeAllLevelPops() {
  document.querySelectorAll('.cmp-level-pop.open').forEach(function(p) { p.classList.remove('open'); });
}

function refreshOpenLevelPops() {
  document.querySelectorAll('.cmp-level-pop.open').forEach(function(p) { p.innerHTML = levelPopHTML(); });
}

function setLevelPreset(n) {
  if (!(n >= 0 && n <= 4)) return;
  var p = LEVEL_PRESETS[n];
  LEVEL_ROW_KEYS.forEach(function(k) { _levelRows[k] = !!p[k]; });
  applyLevelRows();
  refreshOpenLevelPops();
}

function setRowVisible(k, v) {
  if (!(k in _levelRows)) return;
  _levelRows[k] = !!v;
  applyLevelRows();
  refreshOpenLevelPops();
}

function toggleLevel(e) { toggleLevelPop(e); }

// ===== v0.38 对比卡区显隐（运流项=时柱右侧大运/流年列、藏气/三垣/运流/节气，仅作用于 .cmp-card） =====
var SEC_KEYS = ['yunxiang', 'cangqi', 'sanyuan', 'yunliu', 'jieqi'];
var SEC_LABELS = { yunxiang: '运流项', cangqi: '藏气区', sanyuan: '三垣区', yunliu: '运流区', jieqi: '节气区' };
var _cmpSecs = { yunxiang: false, cangqi: false, sanyuan: true, yunliu: false, jieqi: false };

function applyCmpSecs() {
  document.querySelectorAll('.cmp-card').forEach(function(card) {
    SEC_KEYS.forEach(function(k) {
      card.classList.toggle('sec-' + k + '-off', !_cmpSecs[k]);
    });
  });
  var bar = document.getElementById('cmpSecBar');
  if (bar) {
    SEC_KEYS.forEach(function(k) {
      var cb = bar.querySelector('input[data-sec="' + k + '"]');
      if (cb) cb.checked = !!_cmpSecs[k];
    });
  }
}

function setSecVisible(k, v) {
  if (!(k in _cmpSecs)) return;
  _cmpSecs[k] = !!v;
  applyCmpSecs();
}

// ============ v0.29.0 星曜行渲染（index-independent 插入，勿改既有 magic index） ============
// 星曜行恒在 DOM；L0/L1 由 CSS 隐藏，L2 起显示（累积展开）。单元格带 data-xy-gz 供值级刷新。
function _xyEscText(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _xyName(gz) { var X = window.XINGYAO; return (X && gz) ? X.nameOf(gz) : '—'; }
function _xyCell(gz, extraCls) {
  var cls = extraCls || '';
  var X = window.XINGYAO;
  if (!gz || !X) return '<td class="' + cls + '">—</td>';
  var nm = X.nameOf(gz);
  var sys = X.systemOf(gz);
  var t = sys ? ' title="' + _xyEscText(sys).replace(/"/g, '&quot;') + '"' : '';
  return '<td class="' + cls + '" data-xy-gz="' + gz + '"' + t + '>' + _xyEscText(nm) + '</td>';
}
// 在首个含 nayin 的行之前插入（语义锚点，arr 就地修改；既有索引一字不改）
function insertBeforeNayin(arr, rowHtml) {
  for (var i = 0; i < arr.length; i++) {
    if (/data-row-type="[^"]*\bnayin\b/.test(arr[i])) { arr.splice(i, 0, rowHtml); return arr; }
  }
  arr.push(rowHtml);   // 兜底：正常不会发生
  return arr;
}
// 四柱区 7 列（含大运/流年）
function xyRowMain(ps, pDy, pLn) {
  return '<tr class="rx" data-row-type="xingyao xy1"><td class="rl">星曜</td>'
    + _xyCell(ps.nian.gan + ps.nian.zhi) + _xyCell(ps.yue.gan + ps.yue.zhi)
    + _xyCell(ps.ri.gan + ps.ri.zhi) + _xyCell(ps.shi.gan + ps.shi.zhi)
    + _xyCell(pDy ? pDy.gan + pDy.zhi : '', 'sep col-dy')
    + _xyCell(pLn ? pLn.gan + pLn.zhi : '', 'col-ln') + '</tr>';
}
// 四柱区 5 列（无大运/流年，双胞胎默认分支）
function xyRowMainNoLuck(ps) {
  return '<tr class="rx" data-row-type="xingyao xy1"><td class="rl">星曜</td>'
    + _xyCell(ps.nian.gan + ps.nian.zhi) + _xyCell(ps.yue.gan + ps.yue.zhi)
    + _xyCell(ps.ri.gan + ps.ri.zhi) + _xyCell(ps.shi.gan + ps.shi.zhi) + '</tr>';
}
// 三垣区核心 5 列（尾部 sep/col-ln 由调用方或 si 循环补）；不带 xy1，避免 _applyDLUpdates 误命中
function xyRowSyCore(ps) {
  return '<tr class="rx" data-sec="sanyuan" data-row-type="xingyao"><td class="rl">星曜</td>'
    + _xyCell(ps.taiNian.gan + ps.taiNian.zhi) + _xyCell(ps.tai.gan + ps.tai.zhi) + _xyCell(ps.ming.gan + ps.ming.zhi) + _xyCell(ps.shen.gan + ps.shen.zhi) + '</tr>';
}
// 三垣区 7 列（单人 syRows，自带尾部空列）
function xyRowSy7(ps) {
  return '<tr class="rx" data-sec="sanyuan" data-row-type="xingyao"><td class="rl">星曜</td>'
    + _xyCell(ps.taiNian.gan + ps.taiNian.zhi) + _xyCell(ps.tai.gan + ps.tai.zhi) + _xyCell(ps.ming.gan + ps.ming.zhi) + _xyCell(ps.shen.gan + ps.shen.zhi)
    + '<td class="sep"></td><td class="col-ln"></td></tr>';
}
// 值级刷新：重算所有 td[data-xy-gz] 文本（不重排盘、不动分级态）
function refreshXingyaoRows() {
  var tds = document.querySelectorAll('td[data-xy-gz]');
  var X = window.XINGYAO;
  for (var i = 0; i < tds.length; i++) {
    var td = tds[i];
    var gz = td.getAttribute('data-xy-gz');
    var nm = X ? X.nameOf(gz) : '—';
    var sys = X ? X.systemOf(gz) : '';
    td.textContent = nm;
    if (sys) td.setAttribute('title', sys); else td.removeAttribute('title');
  }
  return tds.length;
}

// v0.36.1 胎年柱整体显隐：三垣表头起向后遍历兄弟行，rl 行第 2 格即胎年列。
// 盘式表头与三垣表头同表，且四柱行首格也是 rl —— 必须从三垣表头起向后走，避免误伤盘式区
function applyTaiNianColumn(root) {
  var show = !!(window.GONGWEI && typeof GONGWEI.getShowTaiNian === 'function' && GONGWEI.getShowTaiNian());
  var scope = (root && root.querySelectorAll) ? root : document;
  var hds = scope.querySelectorAll('tr.hd');
  for (var h = 0; h < hds.length; h++) {
    if (!hds[h].children[0] || hds[h].children[0].textContent.indexOf('三垣') !== 0) continue;
    var row = hds[h];
    while (row) {
      var cells = row.cells;
      if (cells.length > 1 && /(^|\s)rl(\s|$)/.test(cells[0].className)) {
        cells[1].style.visibility = show ? '' : 'hidden';
      }
      row = row.nextElementSibling;
    }
  }
}

// ============ buildPillarRows：抽取四柱+三垣行生成逻辑 ============
// 返回 { main: [string], sanyuan: [string] }，每行 5 列（盘式+四柱）
// diffMap: { 'nian.gan':true, ... } — 差异高亮标记
// includeSanyuan: 是否包含三垣行（默认 true）
function buildPillarRows(p, options) {
  options = options || {};
  var diffMap = options.diffMap || {};

  function td(cls, txt, ext) { return '<td class="' + (cls||'') + '"' + (ext||'') + '>' + (txt||'') + '</td>'; }
  function rl(lbl) { return '<td class="rl">' + lbl + '</td>'; }
  function emp(cls) { return '<td class="' + (cls||'') + '"></td>'; }
  function th(cls, txt) { return '<th class="' + (cls||'') + '">' + txt + '</th>'; }
  function dm(key, cls) {
    return (diffMap[key] ? (cls ? cls + ' bz-diff' : 'bz-diff') : (cls || ''));
  }

  var main = [], sanyuan = [];
  var cols = ['nian','yue','ri','shi'];

  // === 四柱区 ===
  // 主星
  main.push('<tr class="rs">' + rl('主星') +
    cols.map(function(k){return td(dm(k+'.rs'), p[k].rs);}).join('') + '</tr>');
  // 天干
  main.push('<tr class="rg" data-row-type="ln1">' + rl('') +
    cols.map(function(k){return td(dm(k+'.gan', p[k].wg), p[k].gan);}).join('') + '</tr>');
  // 地支
  main.push('<tr class="rg" data-row-type="dy2">' + rl('') +
    cols.map(function(k){return td(dm(k+'.zhi', p[k].wz), p[k].zhi);}).join('') + '</tr>');
  // 藏干三层
  ['本气','中气','余气'].forEach(function(lv, li) {
    main.push('<tr class="rh">' + rl(lv) +
      cols.map(function(k){return td(dm(k+'.cg.'+li), fmtCGLayer((p[k].ly||[])[li]));}).join('') + '</tr>');
  });
  // 纳音
  main.push('<tr class="rn" data-row-type="nayin">' + rl('纳音') +
    cols.map(function(k){return td(dm(k+'.ny'), p[k].ny);}).join('') + '</tr>');
  // 纳运 ← v0.17.0 从自坐下移至纳音下
  main.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') +
    cols.map(function(k){return td(dm(k+'.nayun'), p[k].nayun);}).join('') + '</tr>');
  // 主坐 ← v0.43.0 追加：原「星运」改名
  main.push('<tr class="rm" data-row-type="zhuzuo">' + rl('主坐') +
    cols.map(function(k){return td(dm(k+'.xy'), p[k].xy);}).join('') + '</tr>');
  // 自坐
  main.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') +
    cols.map(function(k){return td(dm(k+'.zz'), p[k].zz);}).join('') + '</tr>');
  // 空亡
  main.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') +
    cols.map(function(k){return td(dm(k+'.kw'), p[k].kw);}).join('') + '</tr>');
  // 神煞
  main.push('<tr class="rm" data-row-type="shensha">' + rl('神煞') +
    cols.map(function(k){return td(dm(k+'.sh'), p[k].sh);}).join('') + '</tr>');

  // === 三垣区 ===
  if (options.includeSanyuan !== false) {
    var syCols = ['taiNian','tai','ming','shen'];
    sanyuan.push('<tr class="hd">' + th('rl','三垣') +
      syCols.map(function(k){return th('', {taiNian:'胎年',tai:'胎元',ming:'命宫',shen:'身宫'}[k]);}).join('') + '</tr>');
    sanyuan.push('<tr class="rs">' + rl('主星') +
      syCols.map(function(k){return td(dm(k+'.rs'), p[k].rs);}).join('') + '</tr>');
    sanyuan.push('<tr class="rg" data-row-type="ln1">' + rl('') +
      syCols.map(function(k){return td(dm(k+'.gan', p[k].wg), p[k].gan);}).join('') + '</tr>');
    sanyuan.push('<tr class="rg" data-row-type="dy2">' + rl('') +
      syCols.map(function(k){return td(dm(k+'.zhi', p[k].wz), p[k].zhi);}).join('') + '</tr>');
    ['本气','中气','余气'].forEach(function(lv, li) {
      sanyuan.push('<tr class="rh">' + rl(lv) +
        syCols.map(function(k){return td(dm(k+'.cg.'+li), fmtCGLayer((p[k].ly||[])[li]));}).join('') + '</tr>');
    });
    sanyuan.push('<tr class="rn" data-row-type="nayin">' + rl('纳音') +
      syCols.map(function(k){return td(dm(k+'.ny'), p[k].ny);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') +
      syCols.map(function(k){return td(dm(k+'.nayun'), p[k].nayun);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="zhuzuo">' + rl('主坐') +
      syCols.map(function(k){return td(dm(k+'.xy'), p[k].xy);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') +
      syCols.map(function(k){return td(dm(k+'.zz'), p[k].zz);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') +
      syCols.map(function(k){return td(dm(k+'.kw'), p[k].kw);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="shensha">' + rl('神煞') +
      syCols.map(function(k){return td(dm(k+'.sh'), p[k].sh);}).join('') + '</tr>');
  }

  return { main: main, sanyuan: sanyuan };
}

// ============ v0.26.0 当年节气数据块（12 节，不含气） ============
// year: 注入的「当年」公历年（默认取系统当前年，便于 ?test=1 以 mock year 断言）
// 返回：大运流年区下方「当年节气数据」块 HTML；表外年份返回占位提示（不抛异常）
function buildJieqiHtml(year, lng) {
  year = year || new Date().getFullYear();
  // D4 整块越界：系统时钟异常防御（正常出生年输入 1900-2100 不可达）
  if (year < 1000 || year > 2101) {
    return '<div class="jieqi-section"><div class="jieqi-note">节气数据仅支持 1000-2100 年</div></div>';
  }
  // v0.27.0 D2：经度显式判空。trueSolarTime(..., undefined) 不抛异常而是返回 NaN，
  //   故必须 isFinite 判空（不能靠 try/catch），否则 NaN 会漏到界面。lng 缺省 → 两行「—」+ 提示。
  var hasLng = (typeof lng === 'number' && isFinite(lng));
  // D2 遍历 MONTH_TERM（12 个「节」索引）→ 天然不含「气」
  var cols = [];
  var needHint = false; // 小寒等列越界（null）时标题轻提示
  var needLngHint = false; // lng 缺省/非法时标题轻提示（与 needHint 并列，互不覆盖）

  // v0.28.0 D1/D3：月建（五虎遁）年基 —— 整块 12 列统一取「所选干支年」的年干。
  // 末位小寒的节气表年份为 year+1（公历落次年 1 月），但其干支属 year 之丑月，
  // 故仍取 yearPillar(year)，**不得**用 yearPillar(year+1)（off-by-one，见 ADR §3.3）。
  var yearGan = yearPillar(year).gan;
  for (var i = 0; i < MONTH_TERM.length; i++) {
    var idx = MONTH_TERM[i];
    var termYear = year + (i === MONTH_TERM.length - 1 ? 1 : 0); // 末位小寒取次年
    var st = getSolarTerm(termYear, idx); // null = 表外越界（如 2100 年次年小寒）
    var md = '—', tm = '—', tsmd = '—', tstm = '—';
    if (st) {
      // getSolarTerm 返回「BJT as UTC」→ 展示直接取 UTC 字段，不做时区偏移
      md = (st.getUTCMonth() + 1) + '/' + st.getUTCDate();
      tm = pad(st.getUTCHours()) + ':' + pad(st.getUTCMinutes());
      if (hasLng) {
        // 交节 BJT 经出生地经度换算真太阳时（可跨日；已处理跨月/跨年与分钟进位）
        var ts = trueSolarTime(st.getUTCFullYear(), st.getUTCMonth() + 1, st.getUTCDate(),
                               st.getUTCHours(), st.getUTCMinutes(), lng);
        tsmd = ts.m + '/' + ts.d;
        tstm = pad(ts.h) + ':' + pad(ts.mi);
      } else {
        needLngHint = true;
      }
    } else {
      needHint = true;
    }
    // 硬约束行序：jq-md → jq-tm → jq-tsmd → jq-tstm → jq-name → jq-gz（保 v0.26 T03 正则）
    cols.push('<div class="jq-col" data-term="' + S_TERM_NAME[idx] + '">'
      + '<div class="jq-md">' + md + '</div>'
      + '<div class="jq-tm">' + tm + '</div>'
      + '<div class="jq-tsmd">☀ ' + tsmd + '</div>'
      + '<div class="jq-tstm">☀ ' + tstm + '</div>'
      + '<div class="jq-name">' + S_TERM_NAME[idx] + '</div>'
      + '<div class="jq-gz">' + jqGanzhiOf(st, yearGan, i) + '</div>'
      + '</div>');
  }
  var hint = needHint ? '<span class="jieqi-hint">（小寒超出节气表）</span>' : '';
  var lngHint = needLngHint ? '<span class="jieqi-hint">（未选出生地，真太阳时不可用）</span>' : '';
  return '<div class="jieqi-section">'
    + '<div class="jieqi-title">' + year + ' 年 · 十二节（立春→小寒）' + hint + lngHint + '</div>'
    + '<div class="jieqi-wrap"><div class="jieqi-grid">' + cols.join('') + '</div></div>'
    + '</div>';
}

// ===== v0.28.0 D1：每列干支 = 该节所起月份的【月建干支（月柱）】 =====
// 语义：立春列=寅月、惊蛰列=卯月 …… 小寒列=丑月（12 节 ↔ 干支年十二月建一一对应）。
// 取数：五虎遁直推（年干 → 寅月月干，顺行 i 位），天干上、地支下竖排。
// 刻意**不进入** ALGO.monthPillar 的出生时点节气比较链（其 8h 时基缺陷用户已搁置，
//   见 PRD §1.4/§6.3）；本函数不依赖交节时刻、不依赖出生入参 → 出生时点无关（AC04）。
// 年基：12 列统一取 buildJieqiHtml 注入的 year（含末位小寒），见上方 yearGan 注释。
// st 为 null（表外越界，如 2100 年小寒）→ 保持占位「—」，与同列 md/tm 视觉一致且不抛异常（D2）。
// 日后如需切回「交节日日柱」：把 jqGanzhiOf 内部换回 dayPillar(st…) 即可（对称可逆）。
function jieqiMonthGZ(yearGan, i) {
  var start = WU_HU_DUN[yearGan];              // 五虎遁：年干 → 寅月月干
  if (!start) return null;                     // 年干非法（理论不可达）→ 调用方落占位
  var zhi = DZ[(i + 2) % 12];                  // i=0→寅月 … i=11→丑月
  var gan = TG[(TG.indexOf(start) + i) % 10];  // 自寅月起顺行 i 位
  return gan + zhi;                            // 如 '壬寅'
}

function jqGanzhiOf(st, yearGan, i) {
  if (!st) return '<span class="jq-gan">—</span><span class="jq-zhi">—</span>';
  var gz = jieqiMonthGZ(yearGan, i);
  if (!gz) return '<span class="jq-gan">—</span><span class="jq-zhi">—</span>';
  return '<span class="jq-gan">' + gz.substring(0, 1) + '</span>'
       + '<span class="jq-zhi">' + gz.substring(1, 2) + '</span>';
}

// ============ v0.26.0 节气流年联动（v2 增量） ============
// 公历年换算纯函数，与 updateCardDyLnColumns 内同式（口径单源，防漂移）：
//   dyIdx===-1 → 运前流年：出生年 + 列偏移；否则 → 该运起始年 + 列偏移。
// 数据缺失/异常时返回 null（调用方静默跳过，不崩）。
function liunianYearOf(cd, dyIdx, lnIdx) {
  if (!cd || !cd.daYun) return null;
  if (dyIdx === -1) return cd.y + lnIdx;
  var dy = cd.daYun[dyIdx];
  return dy ? dy.startYear + lnIdx : null;
}

// 把 root 内唯一的 .jieqi-section 整块替换为 buildJieqiHtml(year, lng) 的产物，
// 并回写 root._jieqiYear / root._jieqiLng。不触碰 luck-section / chart / 事件绑定（节气块纯展示）。
// root 约定：可 querySelector 到 .jieqi-section 的任意祖先（#output / .bz-twin-shared / document）。
// 若找不到节气块（异常态/旧 HTML）则静默返回（防御，不抛异常）。
// v0.27.0 D3 经度回退链（v0.26 三调用点零改动）：显式第三参 → root._jieqiLng → root._paipanData.lng。
function refreshJieqi(root, year, lng) {
  var sec = root.querySelector('.jieqi-section');
  if (!sec) return;
  if (!(typeof lng === 'number' && isFinite(lng))) {
    lng = (typeof root._jieqiLng === 'number' && isFinite(root._jieqiLng))
          ? root._jieqiLng
          : (root._paipanData ? root._paipanData.lng : undefined);
  } else {
    root._jieqiLng = lng;
  }
  root._jieqiYear = year;
  var tmp = document.createElement('div');
  tmp.innerHTML = buildJieqiHtml(year, lng);
  var neu = tmp.firstChild;
  if (neu) sec.parentNode.replaceChild(neu, sec);
}

function renderChart(data, twin, targetId, opts) {
  twin = twin || 1;
  targetId = targetId || 'output';
  opts = opts || {};
  const { name, gender, y, m, d, h, mi, nian, yue, ri, shi, tai, taiNian, ming, shen, shengXiao, daYun, qiYun, renYuan } = data;
  const riGan = ri.gan, riZhi = ri.zhi;

  // 各柱的完整解析
  function pillar(gan, zhi, type) {
    return {
      gan, zhi, wg: wxClass(gan), wz: wxClass(zhi),
      rs: (gan === riGan && type === 'ri') ? '日主' : shiShen(riGan, gan, false),
      rsCg: CANG_GAN[zhi] ? shiShen(riGan, CANG_GAN[zhi][0]) : '',
      ny: NAYIN[gan + zhi] || '',
      nayun: nayunChangSheng(NAYIN[gan + zhi], yue.zhi),
      xy: changSheng(riGan, zhi),
      zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      cg: cangGanText(zhi, riGan, twin, type),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nian.zhi, yue.zhi) : ''
    };
  }

  const pNian = pillar(nian.gan, nian.zhi, 'nian');
  const pYue = pillar(yue.gan, yue.zhi, 'yue');
  const pRi = pillar(ri.gan, ri.zhi, 'ri');
  const pShi = pillar(shi.gan, shi.zhi, 'shi');
  const pTai = pillar(tai.gan, tai.zhi, 'tai');
  const pTaiNian = pillar(taiNian.gan, taiNian.zhi, 'tain');
  const pMing = pillar(ming.gan, ming.zhi, 'ming');
  const pShen = pillar(shen.gan, shen.zhi, 'shen');

  // 当前大运索引（找覆盖当前年份的大运）
  const nowYear = new Date().getFullYear();
  let curDyIdx = 0;
  for (let i = daYun.length - 1; i >= 0; i--) {
    if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; }
  }
  const curDy = daYun.length > 0 ? daYun[curDyIdx] : null;
  const pDy = curDy ? pillar(curDy.gan, curDy.zhi) : pillar('', '');

  // 当前流年
  const curLnGz = liuNianJZ(nowYear);
  const pLn = pillar(curLnGz[0], curLnGz[1]);

  // 时间段信息
  const lunarInfo = ''; // 可选：农历日期

  // ---- 起运交运文本 ----
  let joy = 0, jom = 0, jod = 0, joh = 0;
  let qiyunText = '—';
  let preQyYears = 0;
  let jyText = '—';
  if (qiYun) {
    joy = qiYun.years; jom = qiYun.months; jod = qiYun.days; joh = qiYun.hours || 0;
    qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + joh + ' 小时';
    preQyYears = Math.ceil((qiYun.totalMonths || (qiYun.years * 12 + qiYun.months + qiYun.days / 30)) / 12);
    const WUHE = {甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
    // 起运准确日期
    const qyStartDate = new Date(y, m-1, d, h || 0, mi || 0);
    qyStartDate.setFullYear(qyStartDate.getFullYear() + joy);
    qyStartDate.setMonth(qyStartDate.getMonth() + jom);
    qyStartDate.setDate(qyStartDate.getDate() + jod);
    qyStartDate.setHours(qyStartDate.getHours() + joh);
    // 交运年天干对
    const jyYearGanIdx = (qyStartDate.getFullYear() - 4) % 10;
    const jyNextGan = TG[jyYearGanIdx];
    const jyHePair = jyNextGan + WUHE[jyNextGan];
    // 交运节气
    let jyTermName = '', daysAfterJY = 0;
    const qyY = qyStartDate.getFullYear();
    for (let mi = 0; mi < 12; mi++) {
      const tIdx = MONTH_TERM[mi];
      let stY = qyY;
      if (tIdx === 0 && mi === 11) stY = (qyStartDate.getMonth() === 0) ? qyY : qyY + 1;
      const st = getSolarTerm(stY, tIdx);
      const stDate = st ? new Date(st.getUTCFullYear(), st.getUTCMonth(), st.getUTCDate()) : new Date(-8640000000000000);
      const nextMi = (mi + 1) % 12;
      const nextTerm = MONTH_TERM[nextMi];
      let nextY = qyY;
      if (nextTerm <= tIdx) nextY = qyY + 1;
      const nextSt = getSolarTerm(nextY, nextTerm);
      const nextDate = nextSt ? new Date(nextSt.getUTCFullYear(), nextSt.getUTCMonth(), nextSt.getUTCDate()) : new Date(8640000000000000);
      if (qyStartDate >= stDate && qyStartDate < nextDate) {
        jyTermName = S_TERM_NAME[tIdx];
        const qyDay2 = new Date(qyStartDate.getFullYear(), qyStartDate.getMonth(), qyStartDate.getDate());
        daysAfterJY = Math.round((qyDay2 - stDate) / 86400000);
        break;
      }
    }
    jyText = '逢' + jyHePair[0] + '、' + jyHePair[1] + '年' + jyTermName + '后 ' + daysAfterJY + ' 天';
  }

  // ---- 上盘 HTML ----
  // v0.41.0 关系高亮：柱名 th 加 data-pk，天干/地支 td 加 data-gk/data-gz/data-pk（点击参照 + 高亮目标）
  function td(cls, txt, ext='') { return '<td class="'+cls+'"'+ext+'>'+txt+'</td>'; }
  function th(cls, txt, ext='') { return '<th class="'+cls+'"'+(ext||'')+'>'+txt+'</th>'; }
  function rl(lbl) { return '<td class="rl">'+lbl+'</td>'; }
  function emp(cls) { return '<td class="'+cls+'"></td>'; }

  const chartRows = [];
  // v0.10.0 宫位标签行由 updateGongWeiTags() 动态生成
  // 柱名头
  chartRows.push('<tr class="hd">'+th('rl','盘式')+th('','年柱',' data-pk="nian"')+th('','月柱',' data-pk="yue"')+th('','日柱',' data-pk="ri"')+th('','时柱',' data-pk="shi"')+th('sep col-dy','大运')+th('col-ln','流年')+'</tr>');

  // 生成四柱行（5列），再拼接大运/流年列
  var bp = buildPillarRows({ nian:pNian, yue:pYue, ri:pRi, shi:pShi, taiNian:pTaiNian, tai:pTai, ming:pMing, shen:pShen });
  var pAll = { nian:pNian, yue:pYue, ri:pRi, shi:pShi, taiNian:pTaiNian, tai:pTai, ming:pMing, shen:pShen };
  var luckCols = { dy:pDy, ln:pLn };
  var suffixMain = td('sep col-dy', '') + td('col-ln', '');
  var suffixSy = emp('sep') + emp('col-ln');

  // 辅助：将 suffix 插入每行的 </tr> 之前
  function insSuffix(rowHtml, suffix) {
    return rowHtml.replace('</tr>', suffix + '</tr>');
  }

  // 主星行特殊处理：大运流年需要真实数据
  var mainRows = bp.main.slice();
  // 主星行(0)：用 pDy.rs / pLn.rs 替换占位
  mainRows[0] = '<tr class="rs" data-row-type="dy1">'+rl('主星')+td('',pNian.rs)+td('',pYue.rs)+td('',pRi.rs)+td('',pShi.rs)+td('sep col-dy',pDy.rs)+td('col-ln',pLn.rs)+'</tr>';
  // 天干行(1)
  mainRows[1] = '<tr class="rg" data-row-type="ln1">'+rl('')+
    td(pNian.wg,pNian.gan,' data-gk="gan" data-gz="'+pNian.gan+'" data-pk="nian"')+
    td(pYue.wg,pYue.gan,' data-gk="gan" data-gz="'+pYue.gan+'" data-pk="yue"')+
    td(pRi.wg,pRi.gan,' data-gk="gan" data-gz="'+pRi.gan+'" data-pk="ri"')+
    td(pShi.wg,pShi.gan,' data-gk="gan" data-gz="'+pShi.gan+'" data-pk="shi"')+
    td('sep col-dy '+pDy.wg,pDy.gan)+td('col-ln '+pLn.wg,pLn.gan)+'</tr>';
  // 地支行(2)
  mainRows[2] = '<tr class="rg" data-row-type="dy2">'+rl('')+
    td(pNian.wz,pNian.zhi,' data-gk="zhi" data-gz="'+pNian.zhi+'" data-pk="nian"')+
    td(pYue.wz,pYue.zhi,' data-gk="zhi" data-gz="'+pYue.zhi+'" data-pk="yue"')+
    td(pRi.wz,pRi.zhi,' data-gk="zhi" data-gz="'+pRi.zhi+'" data-pk="ri"')+
    td(pShi.wz,pShi.zhi,' data-gk="zhi" data-gz="'+pShi.zhi+'" data-pk="shi"')+
    td('sep col-dy '+pDy.wz,pDy.zhi)+td('col-ln '+pLn.wz,pLn.zhi)+'</tr>';
  // 藏气: 单行合并（用 cg 而非 ly），删中气余气
  mainRows[3] = '<tr class="rh" data-sec="cangqi" data-row-type="ln2">'+rl('藏气')+td('',pNian.cg)+td('',pYue.cg)+td('',pRi.cg)+td('',pShi.cg)+td('sep col-dy',pDy.cg)+td('col-ln',pLn.cg)+'</tr>';
  mainRows.splice(4, 2); // 删中气、余气 — 单人排盘只保留合并藏气行
  // 纳音 — splice 后索引从 6 偏移至 4
  mainRows[4] = '<tr class="rn" data-row-type="nayin dy3">'+rl('纳音')+td('',pNian.ny)+td('',pYue.ny)+td('',pRi.ny)+td('',pShi.ny)+td('sep col-dy',pDy.ny)+td('col-ln',pLn.ny)+'</tr>';
  // 纳运 ← v0.17.0 从自坐下移至纳音下
  mainRows[5] = '<tr class="rm" data-row-type="nayun dy4">'+rl('纳运')+td('',pNian.nayun)+td('',pYue.nayun)+td('',pRi.nayun)+td('',pShi.nayun)+td('sep col-dy',pDy.nayun)+td('col-ln',pLn.nayun)+'</tr>';
  // 主坐 ← v0.43.0 追加：原「星运」改名（token ln3 保留，供 _applyDLUpdates 值级刷新）
  mainRows[6] = '<tr class="rm" data-row-type="zhuzuo ln3">'+rl('主坐')+td('',pNian.xy)+td('',pYue.xy)+td('',pRi.xy)+td('',pShi.xy)+td('sep col-dy',pDy.xy)+td('col-ln',pLn.xy)+'</tr>';
  // 自坐 ← v0.17.0 dy4→dy5
  mainRows[7] = '<tr class="rm" data-row-type="zizuo dy5">'+rl('自坐')+td('',pNian.zz)+td('',pYue.zz)+td('',pRi.zz)+td('',pShi.zz)+td('sep col-dy',pDy.zz)+td('col-ln',pLn.zz)+'</tr>';
  // 空亡
  mainRows[8] = '<tr class="rm" data-row-type="kongwang ln4">'+rl('空亡')+td('',pNian.kw)+td('',pYue.kw)+td('',pRi.kw)+td('',pShi.kw)+td('sep col-dy',pDy.kw)+td('col-ln',pLn.kw)+'</tr>';
  // 神煞
  mainRows[9] = '<tr class="rm" data-row-type="shensha dy6">'+rl('神煞')+td('',pNian.sh)+td('',pYue.sh)+td('',pRi.sh)+td('',pShi.sh)+td('sep col-dy',pDy.sh)+td('col-ln',pLn.sh)+'</tr>';
  // v0.29.0 星曜行：插入「藏气」与「纳音」之间（index-independent，既有索引一字不改）
  insertBeforeNayin(mainRows, xyRowMain({ nian:pNian, yue:pYue, ri:pRi, shi:pShi, tai:pTai, ming:pMing, shen:pShen }, pDy, pLn));
  // v0.43.0 追加：主坐后插七坐组，自坐后插坐年~坐时（index-independent 锚点插入，自带 7 列）
  insertAfterAnchor(mainRows, /data-row-type="zhuzuo ln3"/, ZUO_GROUP.map(function(k){ return zuoRowMain(pAll, k, luckCols); }));
  insertAfterAnchor(mainRows, /data-row-type="zizuo dy5"/, SIT_MAIN_KEYS.map(function(k){ return sitRowMain(pAll, k, luckCols); }));
  // 其他行（藏干4,5 等）使用 buildPillarRows 的 + suffix
  for (var fixI = 0; fixI < mainRows.length; fixI++) {
    if (mainRows[fixI] && mainRows[fixI].indexOf('sep col-dy') === -1) {
      mainRows[fixI] = insSuffix(mainRows[fixI], suffixMain);
    }
  }
  chartRows.push.apply(chartRows, mainRows);

  // 四柱-三垣分隔行
  chartRows.push('<tr class="sanyuan-sep" data-sec="sanyuan"><td colspan="7"></td></tr>');

  // 三垣行
  var syRows = [];
  // v0.10.0 三垣宫位标签行由 updateGongWeiTags() 动态生成
  syRows.push('<tr class="hd" data-sec="sanyuan">'+th('rl','三垣')+th('','胎年',' data-pk="taiNian"')+th('','胎元',' data-pk="tai"')+th('','命宫',' data-pk="ming"')+th('','身宫',' data-pk="shen"')+emp('sep')+emp('col-ln')+'</tr>');
  // 用原始 data 生成三垣（不依赖 buildPillarRows 的 level-based 结构）
  syRows.push('<tr class="rs" data-sec="sanyuan">'+rl('主星')+td('',pTaiNian.rs)+td('',pTai.rs)+td('',pMing.rs)+td('',pShen.rs)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg" data-sec="sanyuan">'+rl('')+
    td(pTaiNian.wg,pTaiNian.gan,' data-gk="gan" data-gz="'+pTaiNian.gan+'" data-pk="taiNian"')+
    td(pTai.wg,pTai.gan,' data-gk="gan" data-gz="'+pTai.gan+'" data-pk="tai"')+
    td(pMing.wg,pMing.gan,' data-gk="gan" data-gz="'+pMing.gan+'" data-pk="ming"')+
    td(pShen.wg,pShen.gan,' data-gk="gan" data-gz="'+pShen.gan+'" data-pk="shen"')+
    emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg" data-sec="sanyuan">'+rl('')+
    td(pTaiNian.wz,pTaiNian.zhi,' data-gk="zhi" data-gz="'+pTaiNian.zhi+'" data-pk="taiNian"')+
    td(pTai.wz,pTai.zhi,' data-gk="zhi" data-gz="'+pTai.zhi+'" data-pk="tai"')+
    td(pMing.wz,pMing.zhi,' data-gk="zhi" data-gz="'+pMing.zhi+'" data-pk="ming"')+
    td(pShen.wz,pShen.zhi,' data-gk="zhi" data-gz="'+pShen.zhi+'" data-pk="shen"')+
    emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rh" data-sec="sanyuan cangqi">'+rl('藏气')+td('',pTaiNian.cg)+td('',pTai.cg)+td('',pMing.cg)+td('',pShen.cg)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rn" data-sec="sanyuan" data-row-type="nayin">'+rl('纳音')+td('',pTaiNian.ny)+td('',pTai.ny)+td('',pMing.ny)+td('',pShen.ny)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-sec="sanyuan" data-row-type="nayun">'+rl('纳运')+td('',pTaiNian.nayun)+td('',pTai.nayun)+td('',pMing.nayun)+td('',pShen.nayun)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-sec="sanyuan" data-row-type="zhuzuo">'+rl('主坐')+td('',pTaiNian.xy)+td('',pTai.xy)+td('',pMing.xy)+td('',pShen.xy)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-sec="sanyuan" data-row-type="zizuo">'+rl('自坐')+td('',pTaiNian.zz)+td('',pTai.zz)+td('',pMing.zz)+td('',pShen.zz)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-sec="sanyuan" data-row-type="kongwang">'+rl('空亡')+td('',pTaiNian.kw)+td('',pTai.kw)+td('',pMing.kw)+td('',pShen.kw)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-sec="sanyuan" data-row-type="shensha">'+rl('神煞')+td('',pTaiNian.sh)+td('',pTai.sh)+td('',pMing.sh)+td('',pShen.sh)+emp('sep')+emp('col-ln')+'</tr>');
  // v0.29.0 星曜行（三垣区）：插入「藏气」与「纳音」之间
  insertBeforeNayin(syRows, xyRowSy7({ nian:pNian, yue:pYue, ri:pRi, shi:pShi, taiNian:pTaiNian, tai:pTai, ming:pMing, shen:pShen }));
  // v0.43.0 追加：三垣区主坐后插七坐组，自坐后插坐年~坐时（三垣干对四柱支）与坐胎/坐命/坐身
  insertAfterAnchor(syRows, /data-row-type="zhuzuo"/, ZUO_GROUP.map(function(k){ return zuoRowSy(pAll, k, true); }));
  insertAfterAnchor(syRows, /data-row-type="zizuo"/, SIT_MAIN_KEYS.map(function(k){ return sitRowSy(pAll, k, true, SIT_MAIN_COL); }));
  insertAfterAnchor(syRows, /data-row-type="zuoshi"/, SIT_SY_KEYS.map(function(k){ return sitRowSy(pAll, k, true); }));
  chartRows.push.apply(chartRows, syRows);

  // ---- 大运流年表 HTML ----
  const luckRows = [];

  // 表头：年份/岁数
  luckRows.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  // 运前列：qyYears > 0 时渲染
  if (preQyYears > 0) {
    luckRows.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>');
  }
  for (let i = 0; i < daYun.length; i++) {
    const dy = daYun[i];
    const cls = i === curDyIdx ? ' cell cc' : ' cell';
    luckRows.push('<div class="'+cls+'"><span class="year">'+dy.startYear+'</span><span class="age">'+dy.startAge+'岁</span></div>');
  }
  luckRows.push('</div>');

  // 大运干支
  luckRows.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  // 运前列：「运/前」，无 data-dy
  if (preQyYears > 0) {
    luckRows.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>');
  }
  for (let i = 0; i < daYun.length; i++) {
    const dy = daYun[i];
    const ss = shiShen(riGan, dy.gan), sb = zhiShiShen(riGan, dy.zhi);
    const cls = i === curDyIdx ? ' cell cc' : ' cell';
    luckRows.push('<div class="'+cls+'" data-dy="'+i+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>');
  }
  luckRows.push('</div>');

  // 始于
  luckRows.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (preQyYears > 0) {
    luckRows.push('<div class="cell pre-qy">'+y+'</div>');
  }
  for (let i = 0; i < daYun.length; i++) {
    luckRows.push('<div class="cell'+(i===curDyIdx?' cc':'')+'">'+daYun[i].startYear+'</div>');
  }
  luckRows.push('</div>');

  // 流年
  luckRows.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  // 运前列：出生年至起运前一年的流年干支
  if (preQyYears > 0) {
    let preLis = '';
    for (let py = y, liIdx = 0; py < y + preQyYears; py++, liIdx++) {
      const gz = liuNianJZ(py);
      const gzCol = '<span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span>';
      preLis += '<span class="li" data-di="-1" data-li="'+liIdx+'">'+gzCol+'</span>';
    }
    luckRows.push('<div class="cell pre-qy">'+preLis+'</div>');
  }
  for (let i = 0; i < daYun.length; i++) {
    const dy = daYun[i];
    const cls = i === curDyIdx ? ' cell cc' : ' cell';
    let lis = '';
    for (let j = 0; j < 10; j++) {
      const lnY = dy.startYear + j;
      const gz = liuNianJZ(lnY);
      const gzCol = '<span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span>';
      const curCls = (i === curDyIdx && lnY === nowYear) ? 'li cur' : 'li';
      lis += '<span class="'+curCls+'" data-di="'+i+'" data-li="'+j+'">'+gzCol+'</span>';
    }
    luckRows.push('<div class="'+cls+'">'+lis+'</div>');
  }
  luckRows.push('</div>');

  // 止于
  luckRows.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (preQyYears > 0) {
    luckRows.push('<div class="cell pre-qy">'+(y + preQyYears - 1)+'</div>');
  }
  for (let i = 0; i < daYun.length; i++) {
    luckRows.push('<div class="cell'+(i===curDyIdx?' cc':'')+'">'+(daYun[i].startYear + 9)+'</div>');
  }
  luckRows.push('</div>');

  // ---- 额外信息标签 ----
  let tstTag = '', ryTag = '', jlTag = '';
  if (data.trueSolar) {
    tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 ' + pad(data.trueSolar.h)+':'+pad(data.trueSolar.mi)+' ('+(data.trueSolar.offsetMin>=0?'+':'')+Math.round(data.trueSolar.offsetMin)+'分)</span>';
  }
  if (data.julian) {
    jlTag = '<span class="meta-tag" title="输入日期按儒略历解读，已换算为格里历排盘">📅 儒略历 ' + data.julian.fromY + '年' + data.julian.fromM + '月' + data.julian.fromD + '日</span>';
  }
  if (renYuan) {
    ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  }

  // ---- 组装完整 HTML ----
  const nowYearCn = '（当前 ' + nowYear + ' 年）';
  const shunLabel = data.qiYun ? buildShunLabel(data.qiYun.shun, data.gender, data.nian.gan) : '';
  const topBarHtml = opts.noTopBar ? '' : `
    <div class="top-bar">
      <div class="person-info"><b>${data.displayName || data.name}</b><span class="sex-tag">${gender === '男' ? '乾造' : '坤造'}</span><span class="meta">${gender} · ${y}年${m}月${d}日 ${pad(h)}:${pad(mi)}</span>${tstTag}${jlTag}${ryTag}${shunLabel}</div>
      <div style="display:flex;align-items:baseline;gap:8px;"><span class="cmp-level-wrap"><button class="btn-simple active" onclick="RENDER.toggleLevel(event)" title="简分级别（点击展开设置）">简分：少</button><div class="cmp-level-pop" onclick="event.stopPropagation()"></div></span><button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button>${renderGongWeiPanel()}${flowControlsHTML()}<div class="person-info meta bz-zodiac">${nian.gan}${nian.zhi}年生 · 属${shengXiao} ${nowYearCn}</div><button class="btn-simple rec-trigger${isRecOn() ? ' active' : ''}" onclick="RENDER.toggleRecMode()" title="记录八字分析：运流区移至左下，记录区写入即保存">分析记录</button></div>
    </div>`;
  const bodyCls = opts.luckBelow ? 'body-cols luck-below' : 'body-cols';
  const recOn = !opts.luckBelow && isRecOn();
  const luckColHtml = `
      <div class="luck-col${recOn ? ' luck-rec-below' : ''}">
        <div class="luck-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">
            <div><span class="label">起运</span>${qiyunText} &nbsp; <span class="label">交运</span>${jyText}</div>
          </div>
          <button class="btn-back" onclick="RENDER.scrollToNow(this.closest('.cmp-card'))" title="定位今年">📍 今年</button>
        </div>
        <div class="luck-section">
          <div class="luck-table">${luckRows.join('\n')}</div>
        </div>
        ${buildJieqiHtml(y, data.lng)}
      </div>`;
  const recPanelHtml = `
      <div class="record-panel${recOn ? ' open' : ''}">
        <div class="rec-head"><span class="rec-title">分析记录</span><span class="rec-status" id="bzRecStatus"></span></div>
        <textarea class="rec-text" id="bzRecText" placeholder="记录本次八字分析……写入即自动保存"></textarea>
      </div>`;
  const html = topBarHtml + `
    <div class="${bodyCls}">
      <div class="main-col">
        <div class="chart-wrap">
        <table class="chart level-0">${chartRows.join('\n')}</table>
        </div>
${recOn ? luckColHtml : ''}
      </div>
${recOn ? '' : luckColHtml}
${recPanelHtml}
    </div>`;

  // 存储数据用于交互
  const container = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
  container.innerHTML = html;
  container._flowState = null;
  applyLevelRows();
  applyTaiNianColumn(container);
  container._paipanData = data;
  container._jieqiYear = y; // v0.26.0 v2: 节气区默认出生年（D6）
  container._jieqiLng = data.lng; // v0.27.0 D1/D5: 节气区经度（refreshJieqi 回退源）
  if (targetId === 'output' || (typeof targetId === 'object' && targetId.id === 'output')) {
    window._paipanData = data;
  }
  window._getSolarTerm = getSolarTerm;

  // 绑定交互
  container._paipanData = data;
  bindEvents(data, container);
  bindRecPanel(container);
}

// ===== v0.43.6 分析记录：记录区占运流区原位，运流移左下；写入即存 localStorage =====
var LS_REC_MODE = 'bz_rec_mode';
var LS_REC_NOTES = 'bz_rec_notes_';
function isRecOn() {
  try { return localStorage.getItem(LS_REC_MODE) === '1'; } catch (e) { return false; }
}
function recNotesKey() {
  var d = window._paipanData;
  if (!d) return null;
  return LS_REC_NOTES + [d.name || '', d.gender || '', d.y, d.m, d.d, d.h, d.mi].join('|');
}
function recAutogrow(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}
function bindRecPanel(container) {
  var ta = container.querySelector('.rec-text');
  if (!ta || ta._recBound) return;
  ta._recBound = true;
  var key = recNotesKey();
  if (key) { try { ta.value = localStorage.getItem(key) || ''; } catch (e) {} }
  recAutogrow(ta);
  ta.addEventListener('input', function() {
    recAutogrow(ta);
    var k = recNotesKey();
    if (!k) return;
    try { localStorage.setItem(k, ta.value); } catch (e) {}
    var st = container.querySelector('.rec-status');
    if (st) {
      st.textContent = '已保存 ' + new Date().toTimeString().slice(0, 8);
      st.classList.add('show');
      clearTimeout(st._t);
      st._t = setTimeout(function() { st.classList.remove('show'); }, 1500);
    }
  });
}
function toggleRecMode(force, root) {
  var on = typeof force === 'boolean' ? force : !isRecOn();
  try { localStorage.setItem(LS_REC_MODE, on ? '1' : '0'); } catch (e) {}
  var out = root || (document.getElementById('output'));
  var body = out && out.querySelector ? out.querySelector('.body-cols') : null;
  if (body && !body.classList.contains('luck-below')) {
    var main = body.querySelector('.main-col');
    var luck = body.querySelector('.luck-col');
    var rec = body.querySelector('.record-panel');
    if (main && luck && rec) {
      if (on) {
        rec.classList.add('open');
        luck.classList.add('luck-rec-below');
        main.appendChild(luck);
        var taOpen = rec.querySelector('.rec-text');
        if (taOpen) recAutogrow(taOpen);
      } else {
        rec.classList.remove('open');
        luck.classList.remove('luck-rec-below');
        body.appendChild(luck);
      }
    }
  }
  var btn = out ? out.querySelector('.rec-trigger') : null;
  if (btn) btn.classList.toggle('active', on);
  return on;
}

var flowMonthOn = false;
var flowDayOn = false;

function flowMonths(year) {
  return CONST.MONTH_TERM.map(function(term, index) {
    var start = ALGO.getSolarTerm(year + (index === 11 ? 1 : 0), term);
    var nextIndex = (index + 1) % 12;
    var end = ALGO.getSolarTerm(year + (index >= 10 ? 1 : 0), CONST.MONTH_TERM[nextIndex]);
    var ganStart = CONST.TG.indexOf(CONST.WU_HU_DUN[ALGO.yearPillar(year).gan]);
    return { start: start, end: end, gan: CONST.TG[(ganStart + index) % 10], zhi: CONST.DZ[(index + 2) % 12] };
  });
}

function flowControlsHTML() {
  return '<span style="display:inline-flex;gap:10px;font-size:12px;white-space:nowrap"><label><input type="checkbox" data-flow="month" onchange="RENDER.setFlowVisible(\'month\',this.checked)">流月</label><label><input type="checkbox" data-flow="day" onchange="RENDER.setFlowVisible(\'day\',this.checked)">流月日</label></span>';
}

function setFlowVisible(kind, checked) {
  if (kind === 'month') { flowMonthOn = checked; if (!checked) flowDayOn = false; }
  else { flowDayOn = checked; if (checked) flowMonthOn = true; }
  document.querySelectorAll('[data-flow]').forEach(function(input) {
    input.checked = input.dataset.flow === 'month' ? flowMonthOn : flowDayOn;
  });
  document.querySelectorAll('.flow-panel').forEach(function(panel) { refreshFlow(panel._flowRoot, panel._flowData); });
}

function refreshFlow(root, data, year) {
  if (!root || !data) return;
  var table = root.querySelector('table.chart');
  var luck = root.querySelector('.luck-section');
  if (!luck && root.classList.contains('bz-twin-card')) {
    var parent = root.closest('.bz-twin-cards').parentElement;
    var cardIndex = Array.from(parent.querySelectorAll('.bz-twin-card')).indexOf(root);
    var luckAreas = parent.querySelectorAll('.bz-card-luck .luck-section');
    luck = luckAreas[cardIndex] || luckAreas[0] || parent.querySelector('.luck-section');
  }
  if (!table || !luck) return;
  var state = root._flowState;
  if (!state || (year !== undefined && state.year !== year)) {
    var today = new Date();
    var yearNow = today.getFullYear();
    var nowMs = Date.UTC(yearNow, today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
    var spring = ALGO.getSolarTerm(yearNow, 2);
    var targetYear = year === undefined ? yearNow - (spring && nowMs < spring.getTime() ? 1 : 0) : year;
    var monthsNow = flowMonths(targetYear);
    var monthIndex = monthsNow.findIndex(function(month) { return month.start && month.end && nowMs >= month.start.getTime() && nowMs < month.end.getTime(); });
    state = root._flowState = { year: targetYear, month: monthIndex < 0 ? 0 : monthIndex, day: null };
    if (monthIndex >= 0) state.day = Date.UTC(yearNow, today.getMonth(), today.getDate());
  }
  var panel = root._flowPanel;
  if (!panel || !panel.isConnected) {
    panel = document.createElement('div');
    panel.className = 'flow-panel';
    luck.after(panel);
    root._flowPanel = panel;
  }
  panel._flowRoot = root;
  panel._flowData = data;
  panel.hidden = !flowMonthOn;
  table.querySelectorAll('.col-lm,.col-ld').forEach(function(cell) { cell.remove(); });
  if (!flowMonthOn) { panel.innerHTML = ''; return; }
  var months = flowMonths(state.year);
  var selected = months[state.month];
  var days = [];
  if (selected.start && selected.end) {
    var firstDay = Date.UTC(selected.start.getUTCFullYear(), selected.start.getUTCMonth(), selected.start.getUTCDate());
    for (var dayMs = firstDay; dayMs < selected.end.getTime(); dayMs += 86400000) {
      var date = new Date(dayMs);
      var pillar = ALGO.dayPillar(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      days.push({ ms: dayMs, date: date, gan: pillar.gan, zhi: pillar.zhi });
    }
  }
  if (!days.some(function(day) { return day.ms === state.day; })) state.day = days.length ? days[0].ms : null;
  var selectedDay = days.find(function(day) { return day.ms === state.day; });
  function flowTable(items, kind, title) {
    var perColumn = Math.ceil(items.length / 6);
    var cells = [];
    for (var columnIndex = 0; columnIndex < 6; columnIndex++) {
      var entries = items.slice(columnIndex * perColumn, (columnIndex + 1) * perColumn);
      var content = entries.map(function(item, entryIndex) {
        var index = columnIndex * perColumn + entryIndex;
        var active = kind === 'month' ? index === state.month : item.ms === state.day;
        var value = kind === 'month' ? index : item.ms;
        var label = kind === 'month' ? (index + 1) + '月' : (item.date.getUTCMonth() + 1) + '/' + item.date.getUTCDate();
        return '<button type="button" class="li' + (active ? ' cur' : '') + '" data-flow-' + kind + '="' + value + '" aria-pressed="' + active + '"><span class="flow-date">' + label + '</span><span class="' + wxClass(item.gan) + '">' + item.gan + '</span><span class="' + wxClass(item.zhi) + '">' + item.zhi + '</span></button>';
      }).join('');
      cells.push('<td class="cell">' + content + '</td>');
    }
    return '<div class="flow-table-wrap"><table class="luck-table flow-table"><tbody><tr class="luck-row liu-row"><td class="cell rtag">' + title + '</td>' + cells.join('') + '</tr></tbody></table></div>';
  }
  panel.innerHTML = '<div class="luck-table-label">' + state.year + ' 年 · 十二节气月</div>' + flowTable(months, 'month', '流月') + (flowDayOn ? '<div class="luck-table-label flow-day-label">' + selected.gan + selected.zhi + '月 · 流日</div>' + flowTable(days, 'day', '流日') + '<div class="flow-note">' + (days.length ? '交节日同时列入相邻两月，以交节时刻为界。' : '该年份节气数据超出范围，无法展开流日。') + '</div>' : '');
  panel.querySelectorAll('[data-flow-month]').forEach(function(buttonEl) {
    buttonEl.onclick = function() { state.month = Number(buttonEl.dataset.flowMonth); state.day = null; refreshFlow(root, data); };
  });
  panel.querySelectorAll('[data-flow-day]').forEach(function(buttonEl) {
    buttonEl.onclick = function() { state.day = Number(buttonEl.dataset.flowDay); refreshFlow(root, data); };
  });
  function appendColumn(pillar, className, title) {
    var gan = pillar.gan, zhi = pillar.zhi;
    var layers = cangGanLayers(zhi, data.ri.gan, 1, 'dayun');
    var computed = { gan:gan, zhi:zhi, rs:shiShen(data.ri.gan,gan), wg:wxClass(gan), wz:wxClass(zhi), cg:cangGanText(zhi,data.ri.gan,1,'dayun'), ly:layers, ny:NAYIN[gan+zhi] || '', nayun:nayunChangSheng(NAYIN[gan+zhi],data.yue.zhi), xy:changSheng(data.ri.gan,zhi), zz:changSheng(gan,zhi), kw:kongWang(gan,zhi), sh:'' };
    var clone = table.cloneNode(true);
    clone.querySelectorAll('.col-lm,.col-ld').forEach(function(cell) { cell.remove(); });
    if (root.classList.contains('bz-twin-card')) {
      var temporary = document.createElement('div');
      temporary.innerHTML = buildCardHTML(data, { twin: root.classList.contains('twin-2') ? 2 : 1, includeLuckCols: true, curDaYun: pillar, curLiuNian: pillar });
      clone = temporary.querySelector('table.chart');
    } else _applyDLUpdates(clone, computed, computed, true, _zuoRefs(data));
    Array.from(table.rows).forEach(function(row) {
      var rowType = row.getAttribute('data-row-type');
      var matchingRow = rowType ? clone.querySelector('[data-row-type="' + rowType + '"]') : Array.from(clone.rows).find(function(candidate) { return candidate.className === row.className; });
      if (row.classList.contains('sanyuan-sep')) return;
      var isSanyuan = (row.getAttribute('data-sec') || '').split(' ').indexOf('sanyuan') >= 0 || row.closest('.bz-sanyuan-area');
      var source = !isSanyuan && matchingRow && matchingRow.querySelector('.col-ln');
      var cell = source ? source.cloneNode(true) : document.createElement(row.querySelector('th') ? 'th' : 'td');
      cell.classList.remove('col-ln');
      cell.classList.add(className);
      if (row.classList.contains('hd')) cell.textContent = row.querySelector('[data-pk="nian"]') || row.textContent.indexOf('年柱') >= 0 ? title : '';
      row.appendChild(cell);
    });
  }
  appendColumn(selected, 'col-lm', '流月');
  if (flowDayOn && selectedDay) appendColumn(selectedDay, 'col-ld', '流日');
  document.querySelectorAll('[data-flow]').forEach(function(input) { input.checked = input.dataset.flow === 'month' ? flowMonthOn : flowDayOn; });
}

function bindEvents(data, container) {
  const { daYun, ri, y } = data;
  const riGan = ri.gan;
  container = container || document;
  var cards = container.querySelectorAll('.bz-twin-card');
  if (cards.length) cards.forEach(function(card) { refreshFlow(card, card._cardData || data); });
  else refreshFlow(container, data);

  // 大运点击
  container.querySelectorAll('[data-dy]').forEach(c => {
    c.addEventListener('click', () => {
      const i = parseInt(c.dataset.dy);
      var cardEl = c.closest('.bz-twin-card');
      // 龙凤胎: 大运行在 .bz-card-luck 中, 按 data-card-index 找对应卡片
      if (!cardEl) {
        var luckScope2 = c.closest('.bz-card-luck');
        if (luckScope2) {
          var cardIdx2 = parseInt(luckScope2.dataset.cardIndex);
          if (!isNaN(cardIdx2)) {
            var allCards2 = container.querySelectorAll('.bz-twin-card');
            cardEl = allCards2[cardIdx2];
          }
        }
      }
      var daYunSrc = (cardEl && cardEl._cardData) ? cardEl._cardData.daYun : daYun;
      const dy = daYunSrc[i];
      var scope = c.closest('.bz-card-luck') || container;
      hiDy(i, scope);
      hiLn(i, 0, scope);
      updateCardDyLnColumns(container, cardEl || c, i, 0);
      // v0.26.0 v2 节气流年联动：大运列 → 该运起始年
      var cdA = (cardEl && cardEl._cardData) ? cardEl._cardData : (container._paipanData || data);
      var dyJ = cdA && cdA.daYun ? cdA.daYun[i] : null;
      if (dyJ) refreshJieqi(container, dyJ.startYear);
      setTimeout(function(){ redrawZuHeSVG(cardEl || container); }, 80);
    });
  });

  // 流年点击
  container.querySelectorAll('.liu-row .li').forEach(li => {
    li.addEventListener('click', e => {
      e.stopPropagation();
      const di = parseInt(li.dataset.di);
      const liIdx = parseInt(li.dataset.li);
      var cardEl2 = li.closest('.bz-twin-card');
      // 龙凤胎: 流年在 .bz-card-luck 中, 按 data-card-index 找对应卡片
      if (!cardEl2) {
        var luckScope = li.closest('.bz-card-luck');
        if (luckScope) {
          var cardIdx = parseInt(luckScope.dataset.cardIndex);
          if (!isNaN(cardIdx)) {
            var allCards = container.querySelectorAll('.bz-twin-card');
            cardEl2 = allCards[cardIdx];
          }
        }
      }
      var daYunSrc2 = (cardEl2 && cardEl2._cardData) ? cardEl2._cardData.daYun : daYun;
      var scope2 = li.closest('.bz-card-luck') || container;
      // 运前流年(di=-1): 只高亮流年, 不高亮大运列
      if (di === -1) {
        hiLn(-1, liIdx, scope2);
      } else {
        hiDy(di, scope2); hiLn(di, liIdx, scope2);
      }
      // 龙凤胎: 传递卡片元素确保只更新对应卡片的图表列
      updateCardDyLnColumns(container, cardEl2 || li, di, liIdx);
      // v0.26.0 v2 节气流年联动：按触发命主数据换算公历年 → 局部刷新节气块
      var cdB = (cardEl2 && cardEl2._cardData) ? cardEl2._cardData : (container._paipanData || data);
      var yB = liunianYearOf(cdB, di, liIdx);
      if (yB !== null && yB !== undefined) refreshJieqi(container, yB);
      setTimeout(function(){ redrawZuHeSVG(cardEl2 || container); }, 80);
    });
  });
}

function hiDy(i, scope) {
  scope.querySelectorAll('.luck-table').forEach(function(table) {
    table.querySelectorAll('[data-dy]').forEach(c => c.classList.remove('cc'));
    const t = table.querySelector('[data-dy="'+i+'"]');
    if (t) t.classList.add('cc');
    // 检测运前列是否存在（qyYears=0时不渲染），动态决定偏移量
    const hasPreQy = table.querySelector('.luck-row.hd .cell.pre-qy') !== null;
    const off = hasPreQy ? 2 : 1;
    // 高亮年龄头行
    const hd = table.querySelectorAll('.luck-row.hd .cell');
    hd.forEach(c => c.classList.remove('cc'));
    if (hd[i + off]) hd[i + off].classList.add('cc');
    // 高亮流年列
    const lc = table.querySelectorAll('.liu-row .cell');
    lc.forEach(c => c.classList.remove('cc'));
    if (lc[i + off]) lc[i + off].classList.add('cc');
    // 高亮始于行
    const sr = table.querySelectorAll('.start-row .cell');
    sr.forEach(c => c.classList.remove('cc'));
    if (sr[i + off]) sr[i + off].classList.add('cc');
    // 高亮止于行
    const er = table.querySelectorAll('.end-row .cell');
    er.forEach(c => c.classList.remove('cc'));
    if (er[i + off]) er[i + off].classList.add('cc');
  });
}

function hiLn(di, li, scope) {
  scope.querySelectorAll('.luck-table').forEach(function(table) {
    table.querySelectorAll('.liu-row .li').forEach(c => c.classList.remove('cur'));
    // 检测运前列是否存在（qyYears=0时不渲染），动态决定偏移量
    const hasPreQy = table.querySelector('.liu-row .cell.pre-qy') !== null;
    const off = hasPreQy ? 2 : 1;
    const cells = table.querySelectorAll('.liu-row .cell');
    const col = cells[di + off];
    if (col) {
      const lis = col.querySelectorAll('.li');
      if (lis[li]) lis[li].classList.add('cur');
    }
  });
}

// ============ v0.6.7 卡片大运流年列互动更新 ============
// 点击流年时同步更新卡片图表中的大运/流年列
// v0.43.0 追加：七坐组参照干快照（缺柱时该行不刷新）
function _zuoRefs(d) {
  if (!d) return null;
  var r = {};
  ZUO_GROUP.forEach(function(k) { var c = d[ZUO_REF[k]]; if (c && c.gan) r[ZUO_REF[k]] = c.gan; });
  SIT_MAIN_KEYS.forEach(function(k) { var c = d[SIT_MAIN_COL[k]]; if (c && c.zhi) r[SIT_MAIN_COL[k] + 'Zhi'] = c.zhi; });
  return r;
}
function updateCardDyLnColumns(container, clickedEl, dyIdx, lnIdx) {
  // 确定用哪个卡的数据：从点击元素向上找 .bz-twin-card
  var card = clickedEl.closest('.bz-twin-card');
  var cardData;
  if (card && card._cardData) {
    cardData = card._cardData;
  } else {
    cardData = container._paipanData;
  }
  if (!cardData || !cardData.daYun) return;
  var daYun = cardData.daYun;
  var riGan = cardData.ri.gan, riZhi = cardData.ri.zhi;
  var nianZhi = cardData.nian.zhi, yueZhi = cardData.yue.zhi;

  function pill(gan, zhi) {
    var cgLayers = cangGanLayers(zhi, riGan, 1, 'dayun');
    return {
      rs: shiShen(riGan, gan),
      wg: wxClass(gan), wz: wxClass(zhi),
      gan: gan, zhi: zhi,
      ny: NAYIN[gan + zhi] || '',
      xy: changSheng(riGan, zhi),
      zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      ly: cgLayers,
      cg: cangGanText(zhi, riGan, 1, 'dayun'),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nianZhi, yueZhi) : ''
    };
  }

  // 空大运对象（运前流年无对应大运时使用）
  function emptyPill() {
    return { rs:'', wg:'', wz:'', gan:'', zhi:'', ny:'', xy:'', zz:'', kw:'', ly:[], cg:'', sh:'', nayun:'' };
  }

  var pDy, pLn;
  var lnYear = liunianYearOf(cardData, dyIdx, lnIdx); // v0.26.0 v2: 口径单源（与节气区联动同式）
  if (lnYear === null || lnYear === undefined) return;
  var lnGz = liuNianJZ(lnYear);
  refreshFlow(card || container, cardData, lnYear);
  if (dyIdx === -1) {
    // 运前流年(di=-1): 无对应大运，大运列显示月柱
    pDy = pill(cardData.yue.gan, cardData.yue.zhi);
    pLn = pill(lnGz[0], lnGz[1]);
  } else {
    var dy = daYun[dyIdx];
    pDy = pill(dy.gan, dy.zhi);
    pLn = pill(lnGz[0], lnGz[1]);
  }

  // 更新目标卡片：如果点击来自具体卡片，只更新该卡片；否则更新所有卡片
  var cards = card ? [card] : Array.from(container.querySelectorAll('.bz-twin-card'));

  // v0.6.6: 单人模式回退 —— 无 .bz-twin-card 时直接更新主 chart 表格
  if (cards.length === 0) {
    var mainChart = container.querySelector('table.chart');
    if (mainChart) _applyDLUpdates(mainChart, pDy, pLn, true, _zuoRefs(cardData));
    return;
  }

  cards.forEach(function(c) {
    var ct = c.querySelector('.chart-wrap table.chart');
    if (ct) _applyDLUpdates(ct, pDy, pLn, false, _zuoRefs(cardData));
  });
}



// ============ v0.6.6 通用大运/流年列更新函数 ============
// 双模式行映射：isSingle=true → 9行（藏气合并），isSingle=false → 11行（藏干分层）
function _applyDLUpdates(tableEl, pDy, pLn, isSingle, refs) {
  // v0.10.4: 语义选择器替代硬编码行索引，宫位标签行不再影响数据定位
  var getRow = function(type) { return tableEl.querySelector('[data-row-type~="' + type + '"]'); };
  var updates;

  if (isSingle) {
    // 单人模式：藏气合并
    // v0.17.0: 纳运 dy4(namespace) 匹配 data-row-type nayun dy4, 自坐 dy5 匹配 zizuo dy5
    updates = [
      ['dy1', pDy.rs, pLn.rs],
      ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
      ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
      ['ln2', pDy.cg, pLn.cg],
      ['dy3', pDy.ny, pLn.ny],
      ['dy4', pDy.nayun, pLn.nayun],
      ['ln3', pDy.xy, pLn.xy],
      ['dy5', pDy.zz, pLn.zz],
      ['ln4', pDy.kw, pLn.kw],
      ['dy6', pDy.sh, pLn.sh],
      // v0.29.0 星曜行（大运/流年列；u[5]/u[6] 回写 data-xy-gz）
      ['xy1', _xyName(pDy.gan+pDy.zhi), _xyName(pLn.gan+pLn.zhi), undefined, undefined, pDy.gan+pDy.zhi, pLn.gan+pLn.zhi]
    ];
    // v0.43.0 追加：七坐组行大运/流年列（参照干由调用方传 refs，缺则不刷新）
    // v0.43.2 追加：坐年~坐时行（固定支遍历干，支由 refs 传 nianZhi/yueZhi/riZhi/shiZhi）
    if (refs) {
      ZUO_GROUP.forEach(function(k) {
        var g = refs[ZUO_REF[k]];
        if (g) updates.push([ZUO_TOKEN[k], changSheng(g, pDy.zhi), changSheng(g, pLn.zhi)]);
      });
      SIT_MAIN_KEYS.forEach(function(k) {
        var z = refs[SIT_MAIN_COL[k] + 'Zhi'];
        if (z) updates.push([SIT_TOKEN[k], changSheng(pDy.gan, z), changSheng(pLn.gan, z)]);
      });
    }
  } else {
    // 双胞胎模式：藏干分层
    // v0.17.0: dy5→nayun, dy6→zizuo
    updates = [
      ['dy1', pDy.rs, pLn.rs],
      ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
      ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
      ['ln2', fmtCGLayer((pDy.ly||[])[0]), fmtCGLayer((pLn.ly||[])[0])],
      ['dy3', fmtCGLayer((pDy.ly||[])[1]), fmtCGLayer((pLn.ly||[])[1])],
      ['ln3', fmtCGLayer((pDy.ly||[])[2]), fmtCGLayer((pLn.ly||[])[2])],
      ['dy4', pDy.ny, pLn.ny],
      ['dy5', pDy.nayun, pLn.nayun],
      ['ln4', pDy.xy, pLn.xy],
      ['dy6', pDy.zz, pLn.zz],
      ['ln5', pDy.kw, pLn.kw],
      ['dy7', pDy.sh, pLn.sh],
      // v0.29.0 星曜行（大运/流年列；u[5]/u[6] 回写 data-xy-gz）
      ['xy1', _xyName(pDy.gan+pDy.zhi), _xyName(pLn.gan+pLn.zhi), undefined, undefined, pDy.gan+pDy.zhi, pLn.gan+pLn.zhi]
    ];
    // v0.43.0 追加：七坐组行大运/流年列（龙凤卡 7 列；参照干由调用方传 refs，缺则不刷新）
    // v0.43.2 追加：坐年~坐时行（固定支遍历干，支由 refs 传 nianZhi/yueZhi/riZhi/shiZhi）
    if (refs) {
      ZUO_GROUP.forEach(function(k) {
        var g = refs[ZUO_REF[k]];
        if (g) updates.push([ZUO_TOKEN[k], changSheng(g, pDy.zhi), changSheng(g, pLn.zhi)]);
      });
      SIT_MAIN_KEYS.forEach(function(k) {
        var z = refs[SIT_MAIN_COL[k] + 'Zhi'];
        if (z) updates.push([SIT_TOKEN[k], changSheng(pDy.gan, z), changSheng(pLn.gan, z)]);
      });
    }
  }

  updates.forEach(function(u) {
    var row = getRow(u[0]);
    if (!row) return;
    var tds = row.querySelectorAll('td');
    if (tds.length < 7) return;
    if (u[3] !== undefined) {
      tds[5].className = 'sep col-dy ' + u[3];
      tds[6].className = 'col-ln ' + u[4];
    }
    tds[5].innerHTML = u[1] || '';
    tds[6].innerHTML = u[2] || '';
    // v0.29.0 星曜行：把当前大运/流年干支回写到 data-xy-gz，供值级刷新复用（既有条目 u[5]/u[6] 为 undefined，零影响）
    if (u[5] !== undefined) tds[5].setAttribute('data-xy-gz', u[5]);
    if (u[6] !== undefined) tds[6].setAttribute('data-xy-gz', u[6]);
  });
}


// ============ v0.5.0 差异高亮 ============
// 逐 cell 比对双胞胎两个盘式的同字段，返回 diffMap
function buildDiffMap(p1, p2) {
  var map = {};
  var fields = ['rs','gan','zhi','na_yin','xing_yun','zi_zuo','kong_wang','shen_sha'];
  // 这些字段被 pillar() 映射为：rs, gan, zhi, ny, xy, zz, kw, sh
  var mapped = ['rs','gan','zhi','ny','xy','zz','kw','sh'];
  var pillars = ['nian','yue','ri','shi','tai','ming','shen'];

  pillars.forEach(function(p) {
    mapped.forEach(function(f, i) {
      var v1 = p1[p] ? p1[p][f] : undefined;
      var v2 = p2[p] ? p2[p][f] : undefined;
      if (v1 !== v2) {
        map[p + '.' + f] = true;
      }
    });
    // 藏干分层逐层比对
    var ly1 = p1[p] ? p1[p].ly : [];
    var ly2 = p2[p] ? p2[p].ly : [];
    [0,1,2].forEach(function(li) {
      var l1 = ly1[li], l2 = ly2[li];
      var g1 = l1 ? l1.gan : '', g2 = l2 ? l2.gan : '';
      if (g1 !== g2) {
        map[p + '.cg.' + li] = true;
      }
    });
  });

  return map;
}

// ============ v0.6.0 抽取：单张卡片骨架 builder ============
// 返回完整卡片 HTML（含四柱+三垣，可选大运尾缀）
// options: { twin, label, relation, identClass, diffMap, luckHTML? }
function buildCardHTML(data, options) {
  options = options || {};
  var twin = options.twin || 1;
  var label = options.label || '老大';
  var relation = options.relation || '';
  var identClass = options.identClass || 'twin-1';
  var diffMap = options.diffMap || {};
  var luckHTML = options.luckHTML || '';
  var includeLuckCols = options.includeLuckCols || false;
  var curDaYun = options.curDaYun;
  var curLiuNian = options.curLiuNian;
  var meta = options.meta || '';

  var riGan = data.ri.gan, riZhi = data.ri.zhi;
  var nian = data.nian, yue = data.yue, ri = data.ri, shi = data.shi;
  var tai = data.tai, taiNian = data.taiNian, ming = data.ming, shen = data.shen;

  function pillar(gan, zhi, type) {
    return {
      gan: gan, zhi: zhi,
      wg: wxClass(gan), wz: wxClass(zhi),
      rs: (gan === riGan && type === 'ri') ? '日主' : shiShen(riGan, gan, false),
      ny: NAYIN[gan + zhi] || '',
      nayun: nayunChangSheng(NAYIN[gan + zhi], yue.zhi),
      xy: changSheng(riGan, zhi),
      zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      ly: cangGanLayers(zhi, riGan, twin, type),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nian.zhi, yue.zhi) : ''
    };
  }
  var p = {
    nian: pillar(nian.gan, nian.zhi, 'nian'),
    yue:  pillar(yue.gan,  yue.zhi,  'yue'),
    ri:   pillar(ri.gan,   ri.zhi,   'ri'),
    shi:  pillar(shi.gan,  shi.zhi,  'shi'),
    tai:  pillar(tai.gan,  tai.zhi,  'tai'),
    taiNian: pillar(taiNian.gan, taiNian.zhi, 'tain'),
    ming: pillar(ming.gan, ming.zhi, 'ming'),
    shen: pillar(shen.gan, shen.zhi, 'shen')
  };

  // 行内辅助
  function td(cls, txt, ext) { return '<td class="'+(cls||'')+'"'+(ext||'')+'>'+(txt||'')+'</td>'; }
  function rl(lbl) { return '<td class="rl">'+lbl+'</td>'; }
  function emp(cls) { return '<td class="'+(cls||'')+'"></td>'; }
  function dm(key, cls) { return diffMap[key] ? (cls ? cls+' bz-diff' : 'bz-diff') : (cls||''); }

  var rows = buildPillarRows(p, { diffMap: diffMap });
  var hdr = '<tr class="hd"><th class="rl">盘式</th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th></tr>';

  // v0.10.0 宫位标签行由 updateGongWeiTags() 动态生成

  // v0.6.1: 龙凤胎卡片四柱表扩展7列（+大运+流年）
  if (includeLuckCols && curDaYun && curLiuNian) {
    var pDy = pillar(curDaYun.gan, curDaYun.zhi, 'dayun');
    var pLn = pillar(curLiuNian.gan, curLiuNian.zhi, 'liunian');
    hdr = '<tr class="hd"><th class="rl">盘式</th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th><th class="sep">大运</th><th class="col-ln">流年</th></tr>';
    // v0.10.0 宫位标签行由 updateGongWeiTags() 动态生成
    // 主星(0)
    rows.main[0] = '<tr class="rs" data-row-type="dy1">'+rl('主星')+td(dm('nian.rs'),p.nian.rs)+td(dm('yue.rs'),p.yue.rs)+td(dm('ri.rs'),p.ri.rs)+td(dm('shi.rs'),p.shi.rs)+td('sep col-dy',pDy.rs)+td('col-ln',pLn.rs)+'</tr>';
    // 天干(1)
    rows.main[1] = '<tr class="rg" data-row-type="ln1">'+rl('')+td(dm('nian.gan',p.nian.wg),p.nian.gan)+td(dm('yue.gan',p.yue.wg),p.yue.gan)+td(dm('ri.gan',p.ri.wg),p.ri.gan)+td(dm('shi.gan',p.shi.wg),p.shi.gan)+td('sep col-dy '+pDy.wg,pDy.gan)+td('col-ln '+pLn.wg,pLn.gan)+'</tr>';
    // 地支(2)
    rows.main[2] = '<tr class="rg" data-row-type="dy2">'+rl('')+td(dm('nian.zhi',p.nian.wz),p.nian.zhi)+td(dm('yue.zhi',p.yue.wz),p.yue.zhi)+td(dm('ri.zhi',p.ri.wz),p.ri.zhi)+td(dm('shi.zhi',p.shi.wz),p.shi.zhi)+td('sep col-dy '+pDy.wz,pDy.zhi)+td('col-ln '+pLn.wz,pLn.zhi)+'</tr>';
    // 本气(3)
    rows.main[3] = '<tr class="rh" data-row-type="ln2">'+rl('本气')+td(dm('nian.cg.0'),fmtCGLayer((p.nian.ly||[])[0]))+td(dm('yue.cg.0'),fmtCGLayer((p.yue.ly||[])[0]))+td(dm('ri.cg.0'),fmtCGLayer((p.ri.ly||[])[0]))+td(dm('shi.cg.0'),fmtCGLayer((p.shi.ly||[])[0]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[0]))+td('col-ln',fmtCGLayer((pLn.ly||[])[0]))+'</tr>';
    // 中气(4)
    rows.main[4] = '<tr class="rh" data-row-type="dy3">'+rl('中气')+td(dm('nian.cg.1'),fmtCGLayer((p.nian.ly||[])[1]))+td(dm('yue.cg.1'),fmtCGLayer((p.yue.ly||[])[1]))+td(dm('ri.cg.1'),fmtCGLayer((p.ri.ly||[])[1]))+td(dm('shi.cg.1'),fmtCGLayer((p.shi.ly||[])[1]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[1]))+td('col-ln',fmtCGLayer((pLn.ly||[])[1]))+'</tr>';
    // 余气(5)
    rows.main[5] = '<tr class="rh" data-row-type="ln3">'+rl('余气')+td(dm('nian.cg.2'),fmtCGLayer((p.nian.ly||[])[2]))+td(dm('yue.cg.2'),fmtCGLayer((p.yue.ly||[])[2]))+td(dm('ri.cg.2'),fmtCGLayer((p.ri.ly||[])[2]))+td(dm('shi.cg.2'),fmtCGLayer((p.shi.ly||[])[2]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[2]))+td('col-ln',fmtCGLayer((pLn.ly||[])[2]))+'</tr>';
    // 纳音(6)
    rows.main[6] = '<tr class="rn" data-row-type="nayin dy4">'+rl('纳音')+td(dm('nian.ny'),p.nian.ny)+td(dm('yue.ny'),p.yue.ny)+td(dm('ri.ny'),p.ri.ny)+td(dm('shi.ny'),p.shi.ny)+td('sep col-dy',pDy.ny)+td('col-ln',pLn.ny)+'</tr>';
    // 纳运(7) ← v0.17.0 从自坐下移至纳音下
    rows.main[7] = '<tr class="rm" data-row-type="nayun dy5">'+rl('纳运')+td(dm('nian.nayun'),p.nian.nayun)+td(dm('yue.nayun'),p.yue.nayun)+td(dm('ri.nayun'),p.ri.nayun)+td(dm('shi.nayun'),p.shi.nayun)+td('sep col-dy',pDy.nayun)+td('col-ln',pLn.nayun)+'</tr>';
    // 主坐(8) ← v0.43.0 追加：原「星运」改名（token ln4 保留）
    rows.main[8] = '<tr class="rm" data-row-type="zhuzuo ln4">'+rl('主坐')+td(dm('nian.xy'),p.nian.xy)+td(dm('yue.xy'),p.yue.xy)+td(dm('ri.xy'),p.ri.xy)+td(dm('shi.xy'),p.shi.xy)+td('sep col-dy',pDy.xy)+td('col-ln',pLn.xy)+'</tr>';
    // 自坐(9) ← v0.17.0 dy5→dy6
    rows.main[9] = '<tr class="rm" data-row-type="zizuo dy6">'+rl('自坐')+td(dm('nian.zz'),p.nian.zz)+td(dm('yue.zz'),p.yue.zz)+td(dm('ri.zz'),p.ri.zz)+td(dm('shi.zz'),p.shi.zz)+td('sep col-dy',pDy.zz)+td('col-ln',pLn.zz)+'</tr>';
    // 空亡(10)
    rows.main[10] = '<tr class="rm" data-row-type="kongwang ln5">'+rl('空亡')+td(dm('nian.kw'),p.nian.kw)+td(dm('yue.kw'),p.yue.kw)+td(dm('ri.kw'),p.ri.kw)+td(dm('shi.kw'),p.shi.kw)+td('sep col-dy',pDy.kw)+td('col-ln',pLn.kw)+'</tr>';
    // 神煞(11)
    rows.main[11] = '<tr class="rm" data-row-type="shensha dy7">'+rl('神煞')+td(dm('nian.sh'),p.nian.sh)+td(dm('yue.sh'),p.yue.sh)+td(dm('ri.sh'),p.ri.sh)+td(dm('shi.sh'),p.shi.sh)+td('sep col-dy',pDy.sh)+td('col-ln',pLn.sh)+'</tr>';
    // v0.10.0 三垣扩展列：表头[0]和后续行(从1起)加空列
    rows.sanyuan[0] = '<tr class="hd">'+rl('三垣')+td('','胎年')+td('','胎元')+td('','命宫')+td('','身宫')+emp('sep')+emp('col-ln')+'</tr>';
    // v0.29.0 星曜行（三垣区）：置于 si 循环之前，自动获得尾部 sep/col-ln 空列
    insertBeforeNayin(rows.sanyuan, xyRowSyCore(p));
    // v0.43.0 追加：三垣区主坐后插七坐组，自坐后插坐胎/坐命/坐身（si 循环自动补尾列）
    insertAfterAnchor(rows.sanyuan, /data-row-type="zhuzuo"/, ZUO_GROUP.map(function(k){ return zuoRowSy(p, k, false); }));
    insertAfterAnchor(rows.sanyuan, /data-row-type="zizuo"/, SIT_SY_KEYS.map(function(k){ return sitRowSy(p, k, false); }));
    for (var si = 1; si < rows.sanyuan.length; si++) {
      rows.sanyuan[si] = rows.sanyuan[si].replace('</tr>', emp('sep')+emp('col-ln')+'</tr>');
    }
    // v0.29.0 星曜行（四柱区，7 列含大运/流年）：插入「藏气」与「纳音」之间
    insertBeforeNayin(rows.main, xyRowMain(p, pDy, pLn));
    // v0.43.0 追加：主坐后插七坐组，自坐后插坐年~坐时
    insertAfterAnchor(rows.main, /data-row-type="zhuzuo ln4"/, ZUO_GROUP.map(function(k){ return zuoRowMain(p, k, { dy:pDy, ln:pLn }); }));
    insertAfterAnchor(rows.main, /data-row-type="zizuo dy6"/, SIT_MAIN_KEYS.map(function(k){ return sitRowMain(p, k, { dy:pDy, ln:pLn }); }));
  } else {
    // v0.29.0 星曜行（无大运/流年列，5 列）
    insertBeforeNayin(rows.main, xyRowMainNoLuck(p));
    insertBeforeNayin(rows.sanyuan, xyRowSyCore(p));
    // v0.43.0 追加：5 列分支同构插入
    insertAfterAnchor(rows.sanyuan, /data-row-type="zhuzuo"/, ZUO_GROUP.map(function(k){ return zuoRowSy(p, k, false); }));
    insertAfterAnchor(rows.sanyuan, /data-row-type="zizuo"/, SIT_SY_KEYS.map(function(k){ return sitRowSy(p, k, false); }));
    insertAfterAnchor(rows.main, /data-row-type="zhuzuo"/, ZUO_GROUP.map(function(k){ return zuoRowMain(p, k, null); }));
    insertAfterAnchor(rows.main, /data-row-type="zizuo"/, SIT_MAIN_KEYS.map(function(k){ return sitRowMain(p, k, null); }));
  }

  var titleHtml = relation ? label+'（'+relation+'）' : label;
  var cardStyle = includeLuckCols ? ' style="min-width:420px"' : '';
  var metaHtml = meta ? '<div class="bz-card-meta">'+meta+'</div>' : '';

  return '<div class="bz-twin-card '+identClass+'" data-card="'+twin+'"'+cardStyle+'>'
    + '<div class="bz-card-accent"></div>'
    + '<div class="bz-card-title">'+titleHtml
    + '<span class="bz-sanyuan-toggle" onclick="var sa=this.parentElement.parentElement.querySelector(\'.bz-sanyuan-area\');var t=this;sa.classList.toggle(\'collapsed\');t.textContent=sa.classList.contains(\'collapsed\')?\'▼ 三垣\':\'▲ 三垣\';">▲ 三垣</span></div>'
    + metaHtml
    + '<div class="bz-card-tools" style="padding:0 16px 6px;display:flex;gap:6px;"></div>'
    + '<div class="chart-wrap"><table class="chart level-0">'+hdr+'\n'+rows.main.join('\n')+'</table></div>'
    + '<div class="bz-sanyuan-area"><table class="chart level-0" style="border-top:1px solid var(--bz-card-border);">'+rows.sanyuan.join('\n')+'</table></div>'
    + luckHTML
    + '</div>';
}

// ============ v0.6.1 卡片内大运表（luck-table 样式，替代 v0.6.0 pill）============
function buildCardLuckHTML(daYun, qiYun, data, options) {
  options = options || {};
  var identClass = options.identClass || 'twin-1';
  var shunLabel = options.shunLabel || '顺排';
  var riGan = data.ri.gan;
  var h = data.h, mi = data.mi;

  var nowYear = new Date().getFullYear();
  var curDyIdx = 0;
  for (var i = daYun.length - 1; i >= 0; i--) {
    if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; }
  }

  var joy = qiYun ? qiYun.years : 0, jom = qiYun ? qiYun.months : 0, jod = qiYun ? qiYun.days : 0;
  var qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + h + ' 小时 ' + mi + ' 分';
  var jyText = '';
  (function() {
    var y = data.y, startYear = y + joy;
    for (var j = 0; j < 20; j++) {
      var tY = startYear + j;
      if ('己甲'.indexOf(TG[(tY - 4) % 10]) >= 0) { jyText = '逢己、甲年白露后 ' + (jod + jom * 30) + ' 天'; return; }
    }
  })();

  // luck-table 三行：大运头、干支、流年
  var luckRows = [];
  luckRows.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  // 运前列：qyYears > 0 时渲染
  if (joy > 0) {
    luckRows.push('<div class="cell pre-qy"><span class="year">运前</span><span class="age">'+joy+'岁前</span></div>');
  }
  for (var l = 0; l < daYun.length; l++) {
    var dy = daYun[l], cls = l === curDyIdx ? ' cell cc' : ' cell';
    luckRows.push('<div class="'+cls+'"><span class="year">'+dy.startYear+'</span><span class="age">'+dy.startAge+'岁</span></div>');
  }
  luckRows.push('</div>');

  luckRows.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  // 运前列：--占位，无 data-dy
  if (joy > 0) {
    luckRows.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">--</div><div class="dy-branch" style="color:var(--c-gray)">--</div></div>');
  }
  for (var l = 0; l < daYun.length; l++) {
    var dy = daYun[l], cls = l === curDyIdx ? ' cell cc' : ' cell';
    var ss = shiShen(riGan, dy.gan), sb = zhiShiShen(riGan, dy.zhi);
    luckRows.push('<div class="'+cls+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>');
  }
  luckRows.push('</div>');

  luckRows.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  // 运前列：出生年至起运前一年的流年干支（无 data-di/data-li）
  if (joy > 0) {
    var preLis = '';
    for (var py = data.y; py < data.y + joy; py++) {
      var gz = liuNianJZ(py);
      preLis += '<span class="li"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>';
    }
    luckRows.push('<div class="cell pre-qy">'+preLis+'</div>');
  }
  for (var l = 0; l < daYun.length; l++) {
    var dy = daYun[l], cls = l === curDyIdx ? ' cell cc' : ' cell';
    var lis = '';
    for (var j = 0; j < 10; j++) {
      var lnY = dy.startYear + j;
      var gz = liuNianJZ(lnY);
      var curCls = (l === curDyIdx && lnY === nowYear) ? 'li cur' : 'li';
      lis += '<span class="'+curCls+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>';
    }
    luckRows.push('<div class="'+cls+'">'+lis+'</div>');
  }
  luckRows.push('</div>');

  return '<div class="bz-card-luck '+identClass+'">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    + '<div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">'
    + '<div><span class="label">起运</span>' + qiyunText + ' &nbsp; <span class="label">交运</span>' + jyText + '</div>'
    + '</div>'
    + '<button class="btn-back" onclick="RENDER.scrollToNow()" title="定位今年">📍 今年</button>'
    + '</div>'
    + '<div class="luck-section" style="border:none;">'
    + '<div class="luck-table">'+luckRows.join('\n')+'</div>'
    + '</div>'
    + '</div>';
}

// ============ v0.5.0 双胞胎卡片式版面（同性） ============
function renderTwinCardsHtml(data, targetId) {
  targetId = targetId || 'output';
  var name = data.name, gender = data.gender, y = data.y, m = data.m, d = data.d, h = data.h, mi = data.mi;
  var nian = data.nian, shengXiao = data.shengXiao, daYun = data.daYun, qiYun = data.qiYun, renYuan = data.renYuan;
  var nowYear = new Date().getFullYear();

  // Pillar builders for diffMap
  var riGan = data.ri.gan, riZhi = data.ri.zhi;
  function pillar(gan, zhi, twin, type) {
    return { gan: gan, zhi: zhi, wg: wxClass(gan), wz: wxClass(zhi), rs: shiShen(riGan, gan),
      ny: NAYIN[gan + zhi] || '', xy: changSheng(riGan, zhi), zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      ly: cangGanLayers(zhi, riGan, twin, type),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nian.zhi, data.yue.zhi) : '' };
  }
  var p1 = { nian: pillar(nian.gan, nian.zhi, 1, 'nian'), yue: pillar(data.yue.gan, data.yue.zhi, 1, 'yue'), ri: pillar(data.ri.gan, data.ri.zhi, 1, 'ri'), shi: pillar(data.shi.gan, data.shi.zhi, 1, 'shi'), tai: pillar(data.tai.gan, data.tai.zhi, 1, 'tai'), ming: pillar(data.ming.gan, data.ming.zhi, 1, 'ming'), shen: pillar(data.shen.gan, data.shen.zhi, 1, 'shen') };
  var p2 = { nian: pillar(nian.gan, nian.zhi, 2, 'nian'), yue: pillar(data.yue.gan, data.yue.zhi, 2, 'yue'), ri: pillar(data.ri.gan, data.ri.zhi, 2, 'ri'), shi: pillar(data.shi.gan, data.shi.zhi, 2, 'shi'), tai: pillar(data.tai.gan, data.tai.zhi, 2, 'tai'), ming: pillar(data.ming.gan, data.ming.zhi, 2, 'ming'), shen: pillar(data.shen.gan, data.shen.zhi, 2, 'shen') };
  var diffMap = buildDiffMap(p1, p2);

  // 使用共享 builder 生成卡片（不再扩展大运/流年列）
  var meta1 = (gender==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(data.qiYun.shun, data.gender, data.nian.gan);
  var card1 = buildCardHTML(data, { twin: 1, label: '老大', relation: gender==='男'?'兄':'姐', identClass: 'twin-1', diffMap: diffMap, meta: meta1 });
  var card2 = buildCardHTML(data, { twin: 2, label: '老二', relation: gender==='男'?'弟':'妹', identClass: 'twin-2', diffMap: diffMap, meta: meta1 });
  var joy = qiYun ? qiYun.years : 0, jom = qiYun ? qiYun.months : 0, jod = qiYun ? qiYun.days : 0;
  var qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + h + ' 小时 ' + mi + ' 分';
  function nextJYYear(sY) { for (var i = 0; i < 20; i++) { var tY = sY + i; if ('己甲'.includes(TG[(tY - 4) % 10])) return tY; } return sY; }
  var jyText = '逢己、甲年白露后 ' + (jod + jom * 30) + ' 天';

  var curDyIdx = 0;
  for (var i = daYun.length - 1; i >= 0; i--) { if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; } }

  var luckRows = [];
  // 表头：年份/岁数 + 运前列
  luckRows.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (joy > 0) { luckRows.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  luckRows.push('</div>');
  // 大运干支 + 运前列
  luckRows.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (joy > 0) { luckRows.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; var ss = shiShen(riGan, dy.gan), sb = zhiShiShen(riGan, dy.zhi); luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  luckRows.push('</div>');
  // 始于
  luckRows.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (joy > 0) { luckRows.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+daYun[l].startYear+'</div>'); }
  luckRows.push('</div>');
  // 流年 + 运前列
  luckRows.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (joy > 0) { var preLis = ''; for (var py = y, liI = 0; py < y + joy; py++, liI++) { var gz = liuNianJZ(py); preLis += '<span class="li" data-di="-1" data-li="'+liI+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } luckRows.push('<div class="cell pre-qy">'+preLis+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===curDyIdx&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+lis+'</div>'); }
  luckRows.push('</div>');
  // 止于
  luckRows.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (joy > 0) { luckRows.push('<div class="cell pre-qy">'+(y + joy - 1)+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+(daYun[l].startYear + 9)+'</div>'); }
  luckRows.push('</div>');

  var tstTag = '', ryTag = '';
  if (data.trueSolar) { tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 '+pad(data.trueSolar.h)+':'+pad(data.trueSolar.mi)+' ('+(data.trueSolar.offsetMin>=0?'+':'')+Math.round(data.trueSolar.offsetMin)+'分)</span>'; }
  if (renYuan) ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  var nowYearCn = '（当前 ' + nowYear + ' 年）';

  var html = '\n    <div class="top-bar">\n      <div class="person-info"><b>'+(data.displayName || data.name)+'</b><span class="sex-tag">'+(gender==='男'?'乾造':'坤造')+'</span><span class="meta">'+gender+' · '+y+'年'+m+'月'+d+'日 '+pad(h)+':'+pad(mi)+'</span>'+tstTag+ryTag+'</div>\n      <div style="display:flex;align-items:baseline;gap:8px;"><span class="cmp-level-wrap"><button class="btn-simple active" onclick="RENDER.toggleLevel(event)" title="简分级别（点击展开设置）">简分：少</button><div class="cmp-level-pop" onclick="event.stopPropagation()"></div></span><button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button><div class="person-info meta bz-zodiac">'+nian.gan+nian.zhi+'年生 · 属'+shengXiao+' '+nowYearCn+'</div></div>\n    </div>\n'
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="RENDER.switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="RENDER.switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="RENDER.switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + renderTwinPillarPanel() + flowControlsHTML() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + '\n    <div class="bz-twin-shared">\n      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\n        <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">\n          <div><span class="label">大运·流年（共享）</span> &nbsp; <span class="label">起运</span>'+qiyunText+' &nbsp; <span class="label">交运</span>'+jyText+'</div>\n        </div>\n        <button class="btn-back" onclick="RENDER.scrollToNow(this.closest(\'.bz-twin-shared\'))" title="定位今年">📍 今年</button>\n      </div>\n      <div class="luck-section" style="border:none;">\n        <div class="luck-table">'+luckRows.join('\n')+'</div>\n      </div>\n      '+buildJieqiHtml(y, data.lng)+'\n    </div>';

  var container = document.getElementById(targetId);
  container.innerHTML = html;
  container._flowState = null;
  applyLevelRows();
  applyTaiNianColumn(container);
  container._paipanData = data;
  container._jieqiYear = y; // v0.26.0 v2: 同卵默认出生年（D6/D8）
  container._jieqiLng = data.lng; // v0.27.0 D5: 同卵经度（同址同值）
  window._paipanData = data;
  window._twinType = 'same';

  // 给每张卡片绑定数据，供点击流年时更新大运/流年列
  container.querySelectorAll('.bz-twin-card').forEach(function(c) { c._cardData = data; });
  bindEvents(data, container);
}

// ============ v0.6.0 龙凤胎卡片式版面 ============
function renderLongFengCardsHtml(d1, d2, targetId) {
  targetId = targetId || 'output';
  var name = d1.name, y = d1.y, m = d1.m, d = d1.d, h = d1.h, mi = d1.mi;
  var g1 = d1.gender, g2 = d2.gender;
  var nian = d1.nian, shengXiao = d1.shengXiao, renYuan = d1.renYuan;
  var nowYear = new Date().getFullYear();

  // 使用 d1 的四柱为双胞共享（出生时间相同），twin=1/2 区分藏干
  var riGan = d1.ri.gan, riZhi = d1.ri.zhi;
  function pillar(gan, zhi, twin, type) {
    return { gan: gan, zhi: zhi, wg: wxClass(gan), wz: wxClass(zhi), rs: shiShen(riGan, gan),
      ny: NAYIN[gan + zhi] || '', xy: changSheng(riGan, zhi), zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      ly: cangGanLayers(zhi, riGan, twin, type),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nian.zhi, d1.yue.zhi) : '' };
  }
  var p1 = { nian: pillar(nian.gan, nian.zhi, 1, 'nian'), yue: pillar(d1.yue.gan, d1.yue.zhi, 1, 'yue'), ri: pillar(d1.ri.gan, d1.ri.zhi, 1, 'ri'), shi: pillar(d1.shi.gan, d1.shi.zhi, 1, 'shi'), tai: pillar(d1.tai.gan, d1.tai.zhi, 1, 'tai'), ming: pillar(d1.ming.gan, d1.ming.zhi, 1, 'ming'), shen: pillar(d1.shen.gan, d1.shen.zhi, 1, 'shen') };
  var p2 = { nian: pillar(nian.gan, nian.zhi, 2, 'nian'), yue: pillar(d1.yue.gan, d1.yue.zhi, 2, 'yue'), ri: pillar(d1.ri.gan, d1.ri.zhi, 2, 'ri'), shi: pillar(d1.shi.gan, d1.shi.zhi, 2, 'shi'), tai: pillar(d1.tai.gan, d1.tai.zhi, 2, 'tai'), ming: pillar(d1.ming.gan, d1.ming.zhi, 2, 'ming'), shen: pillar(d1.shen.gan, d1.shen.zhi, 2, 'shen') };
  var diffMap = buildDiffMap(p1, p2);

  // 老大/老二卡片（不再带内嵌大运表，恢复标准5列四柱表）
  var meta1 = (g1==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(d1.qiYun ? d1.qiYun.shun : true, d1.gender, d1.nian.gan);
  var card1 = buildCardHTML(d1, { twin: 1, label: '老大', relation: '', identClass: 'twin-1', diffMap: diffMap, meta: meta1 });
  var meta2 = (g2==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(d2.qiYun ? d2.qiYun.shun : true, d2.gender, d2.nian.gan);
  var card2 = buildCardHTML(d2, { twin: 2, label: '老二', relation: '', identClass: 'twin-2', diffMap: diffMap, meta: meta2 });

  var tstTag = '', ryTag = '';
  if (d1.trueSolar) { tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 '+pad(d1.trueSolar.h)+':'+pad(d1.trueSolar.mi)+' ('+(d1.trueSolar.offsetMin>=0?'+':'')+Math.round(d1.trueSolar.offsetMin)+'分)</span>'; }
  if (renYuan) ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  var yMc = (d1.qiYun ? d1.qiYun.shun : true) ? '顺排' : '逆排';
  var yMc2 = (d2.qiYun ? d2.qiYun.shun : true) ? '顺排' : '逆排';
  var sexTag = (g1==='男'?'乾造':'坤造')+' · '+yMc+' | '+(g2==='男'?'乾造':'坤造')+' · '+yMc2;
  var nowYearCn = '（当前 ' + nowYear + ' 年）';

  // === 老大 luckRows（六行 + 运前列）===
  var dy1 = d1.daYun, qy1 = d1.qiYun, rg1 = d1.ri.gan;
  var cd1 = 0; for (var i = dy1.length - 1; i >= 0; i--) { if (dy1[i].startYear <= nowYear) { cd1 = i; break; } }
  var lr1 = [];
  lr1.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (qy1 && qy1.years > 0) { lr1.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; lr1.push('<div class="cell'+(l===cd1?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (qy1 && qy1.years > 0) { lr1.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; var ss = shiShen(rg1, dy.gan), sb = zhiShiShen(rg1, dy.zhi); lr1.push('<div class="cell'+(l===cd1?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (qy1 && qy1.years > 0) { lr1.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+dy1[l].startYear+'</div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (qy1 && qy1.years > 0) { var pl1 = ''; for (var py = y, liI = 0; py < y + qy1.years; py++, liI++) { var gz = liuNianJZ(py); pl1 += '<span class="li" data-di="-1" data-li="'+liI+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr1.push('<div class="cell pre-qy">'+pl1+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===cd1&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+lis+'</div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (qy1 && qy1.years > 0) { lr1.push('<div class="cell pre-qy">'+(y + qy1.years - 1)+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+(dy1[l].startYear + 9)+'</div>'); }
  lr1.push('</div>');

  // === 老二 luckRows（六行 + 运前列）===
  var dy2 = d2.daYun, qy2 = d2.qiYun, rg2 = d2.ri.gan;
  var cd2 = 0; for (var i = dy2.length - 1; i >= 0; i--) { if (dy2[i].startYear <= nowYear) { cd2 = i; break; } }
  var lr2 = [];
  lr2.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (qy2 && qy2.years > 0) { lr2.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; lr2.push('<div class="cell'+(l===cd2?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (qy2 && qy2.years > 0) { lr2.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; var ss = shiShen(rg2, dy.gan), sb = zhiShiShen(rg2, dy.zhi); lr2.push('<div class="cell'+(l===cd2?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (qy2 && qy2.years > 0) { lr2.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+dy2[l].startYear+'</div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (qy2 && qy2.years > 0) { var pl2 = ''; for (var py = y, liI = 0; py < y + qy2.years; py++, liI++) { var gz = liuNianJZ(py); pl2 += '<span class="li" data-di="-1" data-li="'+liI+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr2.push('<div class="cell pre-qy">'+pl2+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===cd2&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+lis+'</div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (qy2 && qy2.years > 0) { lr2.push('<div class="cell pre-qy">'+(y + qy2.years - 1)+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+(dy2[l].startYear + 9)+'</div>'); }
  lr2.push('</div>');

  // 标签 + 起运文案
  var joy1 = qy1 ? qy1.years : 0, jom1 = qy1 ? qy1.months : 0, jod1 = qy1 ? qy1.days : 0;
  var qiyunText1 = '起运（老大）出生后 ' + joy1 + ' 年 ' + jom1 + ' 月 ' + jod1 + ' 天';
  var joy2 = qy2 ? qy2.years : 0, jom2 = qy2 ? qy2.months : 0, jod2 = qy2 ? qy2.days : 0;
  var qiyunText2 = '起运（老二）出生后 ' + joy2 + ' 年 ' + jom2 + ' 月 ' + jod2 + ' 天';
  var lbl1 = (g1==='男'?'👦':'👧')+' 老大';
  var lbl2 = (g2==='男'?'👦':'👧')+' 老二';

  var html = '\n    <div class="top-bar">\n      <div class="person-info"><b>'+(d1.displayName || d1.name)+'</b><span class="sex-tag">龙凤胎</span><span class="meta">'+sexTag+' · '+y+'年'+m+'月'+d+'日 '+pad(h)+':'+pad(mi)+'</span>'+tstTag+ryTag+'</div>\n      <div style="display:flex;align-items:baseline;gap:8px;"><span class="cmp-level-wrap"><button class="btn-simple active" onclick="RENDER.toggleLevel(event)" title="简分级别（点击展开设置）">简分：少</button><div class="cmp-level-pop" onclick="event.stopPropagation()"></div></span><button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button><div class="person-info meta bz-zodiac">'+nian.gan+nian.zhi+'年生 · 属'+shengXiao+' '+nowYearCn+'</div></div>\n    </div>\n'
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="RENDER.switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="RENDER.switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="RENDER.switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + renderTwinPillarPanel() + flowControlsHTML() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + '\n    <div class="bz-twin-shared">\n      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\n        <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">\n          <div><span class="label">大运·流年</span> &nbsp; '+qiyunText1+' &nbsp; '+qiyunText2+'</div>\n        </div>\n        <button class="btn-back" onclick="RENDER.scrollToNow(this.closest(\'.bz-twin-shared\'))" title="定位今年">📍 今年</button>\n      </div>\n      <div class="luck-section" style="border:none;">\n        <div style="display:flex; gap:24px; align-items:flex-start;">\n          <div class="bz-card-luck" data-card-index="0" style="flex:1; min-width:0;">\n            <div class="luck-table-label">'+lbl1+'</div>\n            <div class="luck-table" style="min-width:520px;">'+lr1.join('\n')+'</div>\n          </div>\n          <div class="bz-card-luck" data-card-index="1" style="flex:1; min-width:0; overflow-x:auto;">\n            <div class="luck-table-label">'+lbl2+'</div>\n            <div class="luck-table" style="min-width:520px;">'+lr2.join('\n')+'</div>\n          </div>\n        </div>\n      </div>\n      '+buildJieqiHtml(y, d1.lng)+'\n    </div>';

  var container = document.getElementById(targetId);
  container.innerHTML = html;
  container._flowState = null;
  applyLevelRows();
  applyTaiNianColumn(container);
  window._paipanData = d1;
  window._paipanData2 = d2;
  window._twinType = 'longfeng';

  // 给每张卡片绑定各自数据（大运因性别不同而异）
  var cards = container.querySelectorAll('.bz-twin-card');
  if (cards[0]) cards[0]._cardData = d1;
  if (cards[1]) cards[1]._cardData = d2;
  container._paipanData = d1;
  container._jieqiYear = d1.y; // v0.26.0 v2: 龙凤胎默认老大出生年（D6/D8）
  container._jieqiLng = d1.lng; // v0.27.0 D5: 龙凤胎经度（老大同址）
  bindEvents(d1, container);
}

// 模式切换 JS（纯 CSS + class 切换）
function switchTwinMode(tab, mode) {
  var cards = document.querySelector('.bz-twin-cards');
  if (!cards) return;
  cards.className = 'bz-twin-cards mode-' + mode;
  document.querySelectorAll('.bz-twin-tab').forEach(function(t) { t.classList.remove('active'); });
  tab.classList.add('active');
}

// ============ 入口辅助：注入当前大运/流年信息 ============
function injectCurDaYunLiuNian(data) {
  var nowYear = new Date().getFullYear();
  var daYun = data.daYun;
  if (!daYun || !daYun.length) return;
  var curDyIdx = 0;
  for (var i = daYun.length - 1; i >= 0; i--) {
    if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; }
  }
  var curDy = daYun[curDyIdx];
  data.cur_da_yun = { gan: curDy.gan, zhi: curDy.zhi };
  var curLnGz = liuNianJZ(nowYear);
  data.cur_liu_nian = { gan: curLnGz[0], zhi: curLnGz[1] };
}

// ============ 入口 ============
function doPaipan() {
  const name = document.getElementById('inName').value || '未命名';
  // v0.19.0 隐私模式：构造显示名（data.name 保持真名不动，仅显示层替换）
  const displayName = ARCHIVE.getDisplayName({
    name: name,
    nickname: document.getElementById('inNickname').value,
    yiming: document.getElementById('inYiming').value
  });
  const gender = document.getElementById('inGender').value;
  const y = parseInt(document.getElementById('inYear').value);
  const m = parseInt(APP.calendarType === 'lunar'
    ? document.getElementById('inMonthSelect').value
    : document.getElementById('inMonth').value);
  const d = parseInt(document.getElementById('inDay').value);
  const h = parseInt(document.getElementById('inHour').value);
  const mi = parseInt(document.getElementById('inMin').value) || 0;

  if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
    document.getElementById('output').innerHTML = '<div class="loading" style="color:var(--c-red)">请填写完整的出生时间</div>';
    return;
  }

  // v0.8.0 农历→公历转换（在真太阳时修正之前）
  var solarY = y, solarM = m, solarD = d;
  if (APP.calendarType === 'lunar') {
    var isLeap = document.getElementById('inLeap').checked;
    var solar = lunarToSolar(y, m, d, isLeap);
    if (!solar) {
      document.getElementById('output').innerHTML = '<div class="loading" style="color:var(--c-red)">日期超出支持范围（1000-2100）</div>';
      return;
    }
    solarY = solar.y; solarM = solar.m; solarD = solar.d;
  }

  // v0.43.0 儒略历开关：1582-10-04 及更早的西历日期按儒略历解读，先换算格里历再排
  var julianTag = null;
  if (APP.calendarType === 'solar' && document.getElementById('useJulian') && document.getElementById('useJulian').checked) {
    var g = ALGO.julianToGregorian(solarY, solarM, solarD);
    julianTag = { fromY: solarY, fromM: solarM, fromD: solarD, toY: g.y, toM: g.m, toD: g.d };
    solarY = g.y; solarM = g.m; solarD = g.d;
  }

  // v0.27.0 D1：经度无条件取（唯一权威源）——节气区真太阳时与 useSolar 勾选解耦
  const lng = getLng();
  // 真太阳时修正：仅当用户勾选了真太阳时且地址已选（基于转换后的公历日期）
  let tst = null;
  const useSolar = document.getElementById('useSolar').checked;
  if (useSolar) {
    tst = lng !== null ? trueSolarTime(solarY, solarM, solarD, h, mi, lng) : null;
  }

  const ey = tst ? tst.y : solarY, em = tst ? tst.m : solarM, ed = tst ? tst.d : solarD, eh = tst ? tst.h : h, emi = tst ? tst.mi : mi;

  try {
    // v0.10.0 排盘前保存宫位选中状态
    var savedGongWei = selectedGongWei.slice();
    const twin = document.getElementById('inTwin').value;
    const output = document.getElementById('output');

    if (twin === '2') {
      // 龙凤胎：两次 paipan，不同 gender
      const g1 = document.getElementById('inGender').value;
      const g2 = document.getElementById('inGender2').value;
      const d1 = paipan(name, g1, ey, em, ed, eh, emi);
      d1.displayName = displayName;
      d1.trueSolar = tst;
      d1.julian = julianTag;
      d1.lng = lng; // v0.27.0 D1: 出生地经度（同址同值）
      d1.renYuan = renYuanSiLing(ey, em, ed, eh, emi);
      injectCurDaYunLiuNian(d1);
      const d2 = paipan(name, g2, ey, em, ed, eh, emi);
      d2.displayName = displayName;
      d2.trueSolar = tst;
      d2.julian = julianTag;
      d2.lng = lng; // v0.27.0 D1: 龙凤胎同址 → 同经度
      d2.renYuan = renYuanSiLing(ey, em, ed, eh, emi);
      injectCurDaYunLiuNian(d2);
      output.innerHTML = '';
      renderLongFengCardsHtml(d1, d2, 'output');
      setCurrentBaziResult(extractBaziFromPaipan(d1));
    } else if (twin === '1') {
      const data = paipan(name, gender, ey, em, ed, eh, emi);
      data.displayName = displayName;
      data.trueSolar = tst;
      data.julian = julianTag;
      data.lng = lng; // v0.27.0 D1: 出生地经度（未选=null）
      data.renYuan = renYuanSiLing(ey, em, ed, eh, emi);
      output.innerHTML = '';
      renderTwinCardsHtml(data, 'output');
      setCurrentBaziResult(extractBaziFromPaipan(data));
    } else {
      const data = paipan(name, gender, ey, em, ed, eh, emi);
      data.displayName = displayName;
      data.trueSolar = tst;
      data.julian = julianTag;
      data.lng = lng; // v0.27.0 D1: 出生地经度（未选=null）
      data.renYuan = renYuanSiLing(ey, em, ed, eh, emi);
      output.innerHTML = '';
      renderChart(data);
      setCurrentBaziResult(extractBaziFromPaipan(data));
    }
    // v0.10.0 恢复宫位选中状态并重新渲染标签行
    GONGWEI.selectedGongWei = savedGongWei;
    updateGongWeiTags();
    autoSaveArchive();
  } catch(e) {
    document.getElementById('output').innerHTML = '<div class="loading" style="color:var(--c-red)">排盘出错：' + e.message + '</div>';
    console.error(e);
  }
}

// 滚动并定位到当前大运/流年
function scrollToNow(scope) {
  scope = scope || document;
  const d = scope._paipanData || window._paipanData;
  if (!d) return;
  const nowYear = new Date().getFullYear();
  // 找当前大运索引
  let curDyIdx = 0;
  for (let i = d.daYun.length - 1; i >= 0; i--) {
    if (d.daYun[i].startYear <= nowYear) { curDyIdx = i; break; }
  }
  const curLi = nowYear - d.daYun[curDyIdx].startYear;
  // 先切高亮
  hiDy(curDyIdx, scope);
  hiLn(curDyIdx, curLi, scope);
  // 更新图表大运流年列
  var container = scope.querySelector('.bz-result') || scope.querySelector('#output') || scope;
  updateCardDyLnColumns(container, container, curDyIdx, curLi);
  // v0.26.0 v2 节气流年联动：📍 今年 → 系统当前年
  refreshJieqi(container, nowYear);
  // 再滚动
  const sec = scope.querySelector('.luck-section');
  const cc = sec && sec.querySelector('.cc');
  if (cc && sec) {
    const sl = cc.offsetLeft - sec.offsetLeft - 40;
    sec.scrollTo({ left: Math.max(0, sl), behavior: 'smooth' });
  }
}

// 页面加载时用邦顺默认数据排盘
window.addEventListener('DOMContentLoaded', function() {
  migrateFromV1();
  initPresetArchives();
  refreshArchiveModalIfOpen();
  APP.setupTwinTypeChange();
  doPaipan();
});

// ============================================================
// 档案存储系统 (localStorage) — v0.9.0 升级
// ============================================================

function extractBaziFromPaipan(p) {
  return {
    bazi: {
      nian: { gan: p.nian.gan, zhi: p.nian.zhi },
      yue:  { gan: p.yue.gan, zhi: p.yue.zhi },
      ri:   { gan: p.ri.gan, zhi: p.ri.zhi },
      shi:  { gan: p.shi.gan, zhi: p.shi.zhi }
    },
    sanyuan: {
      tai:  { gan: p.tai.gan, zhi: p.tai.zhi },
      ming: { gan: p.ming.gan, zhi: p.ming.zhi },
      shen: { gan: p.shen.gan, zhi: p.shen.zhi }
    },
    extras: {
      shengXiao: p.shengXiao,
      qiYun: p.qiYun ? { year: p.qiYun.years, month: p.qiYun.months, day: p.qiYun.days, hour: p.qiYun.hours, shun: p.qiYun.shun } : null,
      daYun: p.daYun.map(function(dy) { return { gan: dy.gan, zhi: dy.zhi, startAge: dy.startAge, endAge: dy.endAge, startYear: dy.startYear }; })
    },
    gongWeiType: null
  };
}

// 从档案数据构建 renderChart 所需的完整 paipan 数据对象
function buildChartDataFromArchive(arch) {
  // 若 bazi 为空，先计算
  if (!arch.bazi) {
    var p = paipan(arch.name, arch.gender, arch.year, arch.month, arch.day, arch.hour, arch.min || 0);
    arch.bazi = {
      nian: { gan: p.nian.gan, zhi: p.nian.zhi },
      yue:  { gan: p.yue.gan, zhi: p.yue.zhi },
      ri:   { gan: p.ri.gan, zhi: p.ri.zhi },
      shi:  { gan: p.shi.gan, zhi: p.shi.zhi }
    };
    arch.sanyuan = {
      tai:  { gan: p.tai.gan, zhi: p.tai.zhi },
      ming: { gan: p.ming.gan, zhi: p.ming.zhi },
      shen: { gan: p.shen.gan, zhi: p.shen.zhi }
    };
    arch.extras = {
      shengXiao: p.shengXiao,
      qiYun: p.qiYun ? { year: p.qiYun.years, month: p.qiYun.months, day: p.qiYun.days, hour: p.qiYun.hours, shun: p.qiYun.shun } : null,
      daYun: p.daYun.map(function(dy) { return { gan: dy.gan, zhi: dy.zhi, startAge: dy.startAge, endAge: dy.endAge, startYear: dy.startYear }; })
    };
    // Save back to localStorage
    saveArchives(getArchives());
  }
  // Rebuild paipan-style data object
  var p = paipan(arch.name, arch.gender, arch.year, arch.month, arch.day, arch.hour, arch.min || 0);
  // Ensure bazi fields match (paipan recalculates, but we want consistent results)
  p.nian.gan = arch.bazi.nian.gan; p.nian.zhi = arch.bazi.nian.zhi;
  p.yue.gan = arch.bazi.yue.gan; p.yue.zhi = arch.bazi.yue.zhi;
  p.ri.gan = arch.bazi.ri.gan; p.ri.zhi = arch.bazi.ri.zhi;
  p.shi.gan = arch.bazi.shi.gan; p.shi.zhi = arch.bazi.shi.zhi;
  p.tai.gan = arch.sanyuan.tai.gan; p.tai.zhi = arch.sanyuan.tai.zhi;
  p.ming.gan = arch.sanyuan.ming.gan; p.ming.zhi = arch.sanyuan.ming.zhi;
  p.shen.gan = arch.sanyuan.shen.gan; p.shen.zhi = arch.sanyuan.shen.zhi;
  return p;
}

// 在卡片展开区渲染排盘（复用 renderChart，输出到临时容器）
function renderExpandedChart(arch, containerEl) {
  var data = buildChartDataFromArchive(arch);
  // Create a temporary div, render into it, then move to container
  var tmpId = 'archive-expanded-tmp';
  var existingTmp = document.getElementById(tmpId);
  if (existingTmp) existingTmp.parentNode.removeChild(existingTmp);
  var tmp = document.createElement('div');
  tmp.id = tmpId;
  tmp.style.display = 'none';
  document.body.appendChild(tmp);
  // Temporarily set output to tmp
  var origOutput = document.getElementById('output');
  tmp.innerHTML = '<div id="output"></div>';
  // Re-render: simplified approach — build HTML directly
  try {
    var html = renderChartToHtml(data, arch);
    containerEl.innerHTML = html;
    applyLevelRows();
    applyTaiNianColumn(containerEl);
  } catch(e) {
    containerEl.innerHTML = '<div style="color:var(--c-red);padding:10px;">排盘渲染出错: ' + e.message + '</div>';
  }
  if (tmp.parentNode) tmp.parentNode.removeChild(tmp);
}

// 生成只读排盘HTML（精简版，四柱+三垣）
function renderChartToHtml(data, arch) {
  var riGan = data.ri.gan, riZhi = data.ri.zhi;
  function pillar(gan, zhi) {
    return {
      gan: gan, zhi: zhi,
      wg: wxClass(gan), wz: wxClass(zhi),
      rs: shiShen(riGan, gan),
      ny: NAYIN[gan + zhi] || '',
      xy: changSheng(riGan, zhi),
      zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      cg: cangGanText(zhi, riGan, 1),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, data.nian.zhi, data.yue.zhi) : ''
    };
  }
  var pNian = pillar(data.nian.gan, data.nian.zhi);
  var pYue = pillar(data.yue.gan, data.yue.zhi);
  var pRi = pillar(data.ri.gan, data.ri.zhi);
  var pShi = pillar(data.shi.gan, data.shi.zhi);
  var pTai = pillar(data.tai.gan, data.tai.zhi);
  var pMing = pillar(data.ming.gan, data.ming.zhi);
  var pShen = pillar(data.shen.gan, data.shen.zhi);

  function td(cls, txt) { return '<td class="' + (cls||'') + '">' + (txt||'') + '</td>'; }
  function rl(lbl) { return '<td class="rl">' + lbl + '</td>'; }
  function emp() { return '<td></td>'; }
  function th(cls, txt) { return '<th class="' + (cls||'') + '">' + txt + '</th>'; }

  var rows = [];
  // Header
  rows.push('<tr class="hd">' + rl('') + th('','年柱') + th('','月柱') + th('','日柱') + th('','时柱') + emp() + th('','胎元') + th('','命宫') + th('','身宫') + '</tr>');
  // 主星
  rows.push('<tr class="rs">' + rl('主星') + td('',pNian.rs) + td('',pYue.rs) + td('',pRi.rs) + td('',pShi.rs) + emp() + td('',pTai.rs) + td('',pMing.rs) + td('',pShen.rs) + '</tr>');
  // 天干
  rows.push('<tr class="rg">' + rl('') + td(pNian.wg,pNian.gan) + td(pYue.wg,pYue.gan) + td(pRi.wg,pRi.gan) + td(pShi.wg,pShi.gan) + emp() + td(pTai.wg,pTai.gan) + td(pMing.wg,pMing.gan) + td(pShen.wg,pShen.gan) + '</tr>');
  // 地支
  rows.push('<tr class="rg">' + rl('') + td(pNian.wz,pNian.zhi) + td(pYue.wz,pYue.zhi) + td(pRi.wz,pRi.zhi) + td(pShi.wz,pShi.zhi) + emp() + td(pTai.wz,pTai.zhi) + td(pMing.wz,pMing.zhi) + td(pShen.wz,pShen.zhi) + '</tr>');
  // 藏气
  rows.push('<tr class="rh">' + rl('藏气') + td('',pNian.cg) + td('',pYue.cg) + td('',pRi.cg) + td('',pShi.cg) + emp() + td('',pTai.cg) + td('',pMing.cg) + td('',pShen.cg) + '</tr>');
  // 纳音
  rows.push('<tr class="rn">' + rl('纳音') + td('',pNian.ny) + td('',pYue.ny) + td('',pRi.ny) + td('',pShi.ny) + emp() + td('',pTai.ny) + td('',pMing.ny) + td('',pShen.ny) + '</tr>');
  // 主坐 ← v0.43.0 追加：原「星运」改名
  rows.push('<tr class="rm">' + rl('主坐') + td('',pNian.xy) + td('',pYue.xy) + td('',pRi.xy) + td('',pShi.xy) + emp() + td('',pTai.xy) + td('',pMing.xy) + td('',pShen.xy) + '</tr>');
  // 自坐
  rows.push('<tr class="rm">' + rl('自坐') + td('',pNian.zz) + td('',pYue.zz) + td('',pRi.zz) + td('',pShi.zz) + emp() + td('',pTai.zz) + td('',pMing.zz) + td('',pShen.zz) + '</tr>');
  // 空亡
  rows.push('<tr class="rm">' + rl('空亡') + td('',pNian.kw) + td('',pYue.kw) + td('',pRi.kw) + td('',pShi.kw) + emp() + td('',pTai.kw) + td('',pMing.kw) + td('',pShen.kw) + '</tr>');

  // Info line
  var nowYear = new Date().getFullYear();
  var sx = data.shengXiao;
  var info = '<div style="font-family:var(--font-display);font-size:14px;color:var(--c-ink);margin-bottom:6px;">'
    + '<b>' + ARCHIVE.getDisplayName(arch) + '</b> '
    + '<span class="sex-tag" style="font-family:var(--font-display);font-size:14px;color:var(--c-red);margin-left:4px;">' + (arch.gender === '男' ? '乾造' : '坤造') + '</span>'
    + ' <span style="color:var(--c-gray);font-size:13px;">' + arch.gender + ' · ' + arch.year + '年' + arch.month + '月' + arch.day + '日 ' + pad(arch.hour) + ':' + pad(arch.min||0) + '</span>'
    + ' <span style="color:var(--c-gray);font-size:13px;">' + data.nian.gan + data.nian.zhi + '年生 · 属' + sx + '</span>'
    + '</div>';

  return info + '<div class="chart-wrap" style="overflow-x:auto;"><table class="chart level-0" style="min-width:640px;width:100%;">' + rows.join('\n') + '</table></div>';
}

// ============================================================

// ============================================================
// 盘面对比 (v0.37.0) — 多盘同屏、大运流年下移、横向滚动、拖动排序
// ============================================================
var CMP_KEY = 'bz_cmp_state';
var CMP_ZOOM_KEY = 'bz_cmp_zoom';
var _cmpDragIdx = -1;
var _cmpChipDrag = null;
var _cmpZoom = (function() { var z = parseInt(localStorage.getItem(CMP_ZOOM_KEY), 10); return (z >= 50 && z <= 200) ? z : 100; })();
var CMP_COLS_KEY = 'bz_cmp_layout';
var _cmpCols = (function() { var n = parseInt(localStorage.getItem(CMP_COLS_KEY), 10); return (n >= 1 && n <= 6) ? n : 3; })();
var CMP_BAR_KEY = 'bz_cmp_bar';
var CMP_FOCUS_KEY = 'bz_cmp_focus';
var _cmpBarOn = localStorage.getItem(CMP_BAR_KEY) !== '0';
var _cmpFocusOn = localStorage.getItem(CMP_FOCUS_KEY) === '1';

// 人元司令（v0.38.0）：按出生钟表时口径现算，仅对比卡展示
function _cmpSiLing(m) {
  try {
    if (!window.ALGO || typeof ALGO.renYuanSiLing !== 'function') return '';
    if (!m.year || !m.month || !m.day) return '';
    return ALGO.renYuanSiLing(m.year, m.month, m.day, m.hour, m.min || 0) || '';
  } catch(e) { return ''; }
}

function _cmpEntries() {
  try {
    var arr = JSON.parse(localStorage.getItem(CMP_KEY));
    if (!Array.isArray(arr)) return [];
    return arr.filter(function(e) { return e && (e.type === 'current' || e.type === 'arch'); });
  } catch(e) { return []; }
}

function _cmpSave(entries) {
  localStorage.setItem(CMP_KEY, JSON.stringify(entries));
}

function _cmpArchById(id) {
  var ars = ARCHIVE.getArchives();
  for (var i = 0; i < ars.length; i++) {
    if (String(ars[i].id) === String(id)) return ars[i];
  }
  return null;
}

function _cmpCurrentForm() {
  if (typeof ARCHIVE.getFormData !== 'function') return null;
  try { return ARCHIVE.getFormData(); } catch(e) { return null; }
}

function _cmpEntryMeta(e) {
  if (e.type === 'current') {
    var f = _cmpCurrentForm();
    var mCur = {
      key: 'current',
      name: (f && (f.nickname || f.name)) || '当前盘',
      gender: (f && f.gender) || '男',
      year: (f && f.year) || '', month: (f && f.month) || '', day: (f && f.day) || '',
      hour: (f && f.hour) || 0, min: (f && f.min) || 0
    };
    mCur.siLing = _cmpSiLing(mCur);
    return mCur;
  }
  var a = _cmpArchById(e.id);
  if (!a) return null;
  var m = { key: 'arch:' + a.id, name: ARCHIVE.getDisplayName(a), gender: a.gender,
    year: a.year, month: a.month, day: a.day, hour: a.hour, min: a.min };
  m.siLing = _cmpSiLing(m);
  return m;
}

function _cmpDataFor(e) {
  // 当前盘优先用主页面最近一次排盘结果（含真太阳时），与所见面貌一致
  if (e.type === 'current') {
    if (window._paipanData && window._paipanData.nian) return window._paipanData;
    var f = _cmpCurrentForm();
    if (!f || !f.year || !f.month || !f.day) return null;
    return buildChartDataFromArchive(f);
  }
  var a = _cmpArchById(e.id);
  if (!a) return null;
  return buildChartDataFromArchive(a);
}

function _cmpEsc(s) { return (window.ARCHIVE && ARCHIVE.escHtml) ? ARCHIVE.escHtml(s) : String(s == null ? '' : s); }

function _cmpCardHtml(meta, idx) {
  return '<div class="cmp-card" data-idx="' + idx + '" data-key="' + meta.key + '" data-name="' + _cmpEsc(meta.name) + '">'
    + '<div class="cmp-card-head">'
    + '<span class="cmp-drag-handle" title="拖动调整顺序">⠿</span>'
    + '<span class="cmp-card-pos">' + (idx + 1) + '</span>'
    + '<span class="cmp-card-name">' + _cmpEsc(meta.name) + '</span>'
    + '<span class="sex-tag">' + (meta.gender === '男' ? '乾造' : '坤造') + '</span>'
    + '<span class="cmp-card-meta">' + meta.year + '年' + meta.month + '月' + meta.day + '日 ' + pad(meta.hour) + ':' + pad(meta.min || 0) + '</span>'
    + (meta.siLing ? '<span class="cmp-card-siling">' + _cmpEsc(meta.siLing) + '</span>' : '')
    + '<button class="cmp-card-close" onclick="COMPARE.removeAt(' + idx + ')" title="移除此盘">✕ 移除</button>'
    + '</div>'
    + '<div class="cmp-card-body"></div>'
    + '</div>';
}

function renderCmpTrack() {
  var track = document.getElementById('cmpTrack');
  if (!track) return;
  var entries = _cmpEntries();
  var alive = [], metas = [];
  for (var i = 0; i < entries.length; i++) {
    var m = _cmpEntryMeta(entries[i]);
    if (m) { alive.push(entries[i]); metas.push(m); }
  }
  if (alive.length !== entries.length) _cmpSave(alive);
  var count = document.getElementById('cmpCount');
  if (count) count.textContent = alive.length ? ('已选 ' + alive.length + ' 盘 · 上方名字条可拖动调序') : '未选盘';
  if (!alive.length) {
    track.innerHTML = '<div class="cmp-empty">尚未选择盘面 —— 点上方「📋 档案」，在档案面板勾选记录加入对比</div>';
    renderCmpBar();
    return;
  }
  var html = '';
  for (var c = 0; c < alive.length; c++) html += _cmpCardHtml(metas[c], c);
  track.innerHTML = html;
  applyLevelRows();
  var cards = track.querySelectorAll('.cmp-card');
  for (var k = 0; k < cards.length; k++) {
    _cmpBindCard(cards[k]);
    var body = cards[k].querySelector('.cmp-card-body');
    var data = _cmpDataFor(alive[k]);
    if (data) {
      renderChart(data, 1, body, { luckBelow: true, noTopBar: true });
    } else {
      body.innerHTML = '<div style="color:var(--c-red);padding:8px;">档案数据缺失</div>';
    }
  }
  if (window.GONGWEI && typeof GONGWEI.updateGongWeiTags === 'function') GONGWEI.updateGongWeiTags();
  applyLevelRows();
  _cmpApplyZoom();
  renderCmpBar();
  if (_hl) _cmpHlApply();
}

function _cmpBindCard(card) {
  var handle = card.querySelector('.cmp-drag-handle');
  if (handle) {
    handle.addEventListener('mousedown', function() { card.draggable = true; });
  }
  card.addEventListener('mousedown', function(ev) {
    if (ev.target.closest && ev.target.closest('.cmp-drag-handle')) return;
    card.draggable = false;
  });
  card.addEventListener('dragstart', function(ev) {
    _cmpDragIdx = parseInt(card.getAttribute('data-idx'), 10);
    ev.dataTransfer.effectAllowed = 'move';
    try { ev.dataTransfer.setData('text/plain', card.getAttribute('data-key')); } catch(e) {}
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', function() {
    card.classList.remove('dragging');
    card.draggable = false;
    _cmpDragIdx = -1;
    _cmpSyncOrderFromDom();
  });
  card.addEventListener('dragover', function(ev) {
    if (_cmpDragIdx < 0) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    var track = document.getElementById('cmpTrack');
    if (!track) return;
    var dragged = track.querySelector('.cmp-card.dragging');
    if (!dragged || dragged === card) return;
    var r = card.getBoundingClientRect();
    var before = ev.clientX < r.left + r.width / 2;
    var ref = before ? card : card.nextSibling;
    if (ref === dragged) return;
    if (before && ref.previousSibling === dragged) return;
    if (!before && !ref && track.lastElementChild === dragged) return;
    _cmpPairMove(dragged.getAttribute('data-key'), ref ? ref.getAttribute('data-key') : null, before);
  });
}

function _cmpMvInsert(parent, dragged, ref, before) {
  if (!dragged) return;
  if (ref) {
    if (ref === dragged) return;
    if (before && ref.previousSibling === dragged) return;
    if (!before && ref.nextSibling === dragged) return;
    parent.insertBefore(dragged, before ? ref : ref.nextSibling);
  } else if (parent.lastElementChild !== dragged) {
    parent.appendChild(dragged);
  }
}

function _cmpPairMove(draggedKey, refKey, before) {
  var bar = document.getElementById('cmpBar');
  var track = document.getElementById('cmpTrack');
  if (!bar || !track) return;
  var refChip = refKey ? bar.querySelector('.cmp-chip[data-key="' + refKey + '"]') : null;
  var refCard = refKey ? track.querySelector('.cmp-card[data-key="' + refKey + '"]') : null;
  _cmpMvInsert(bar, bar.querySelector('.cmp-chip[data-key="' + draggedKey + '"]'), refChip, before);
  _cmpMvInsert(track, track.querySelector('.cmp-card[data-key="' + draggedKey + '"]'), refCard, before);
}

function _cmpSyncOrderFromDom() {
  var track = document.getElementById('cmpTrack');
  if (!track) return;
  var keys = [];
  track.querySelectorAll('.cmp-card').forEach(function(c) { keys.push(c.getAttribute('data-key')); });
  _cmpApplyKeyOrder(keys);
}

function _cmpSyncBarOrderFromDom() {
  var bar = document.getElementById('cmpBar');
  if (!bar) return;
  var keys = [];
  bar.querySelectorAll('.cmp-chip').forEach(function(c) { keys.push(c.getAttribute('data-key')); });
  _cmpApplyKeyOrder(keys);
}

function _cmpApplyKeyOrder(keys) {
  var entries = _cmpEntries();
  entries.sort(function(a, b) {
    var ka = a.type === 'current' ? 'current' : 'arch:' + a.id;
    var kb = b.type === 'current' ? 'current' : 'arch:' + b.id;
    return keys.indexOf(ka) - keys.indexOf(kb);
  });
  _cmpSave(entries);
  renderCmpTrack();
}

// ===== v0.38.0 名字条：横排 chip，拖动调序、点击定位卡片 =====
function renderCmpBar() {
  var bar = document.getElementById('cmpBar');
  if (!bar) return;
  var entries = _cmpEntries();
  var metas = [];
  for (var i = 0; i < entries.length; i++) {
    var m = _cmpEntryMeta(entries[i]);
    if (m) metas.push(m);
  }
  if (!metas.length) {
    bar.innerHTML = '<span class="cmp-bar-empty">名字条：加入盘后在此拖动调序，点击名字定位卡片</span>';
    return;
  }
  var html = '';
  for (var c = 0; c < metas.length; c++) {
    html += '<span class="cmp-chip" draggable="true" data-key="' + metas[c].key + '" title="拖动调整下方排盘顺序 · 点击定位该卡">'
      + '<span class="cmp-chip-pos">' + (c + 1) + '</span>' + _cmpEsc(metas[c].name) + '</span>';
  }
  bar.innerHTML = html;
  bar.querySelectorAll('.cmp-chip').forEach(function(chip) {
    chip.addEventListener('dragstart', function(ev) {
      _cmpChipDrag = chip.getAttribute('data-key');
      ev.dataTransfer.effectAllowed = 'move';
      try { ev.dataTransfer.setData('text/plain', _cmpChipDrag); } catch(e) {}
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', function() {
      chip.classList.remove('dragging');
      _cmpChipDrag = null;
      _cmpSyncBarOrderFromDom();
    });
    chip.addEventListener('dragover', function(ev) {
      if (!_cmpChipDrag) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
      var b = document.getElementById('cmpBar');
      var dragged = b.querySelector('.cmp-chip.dragging');
      if (!dragged || dragged === chip) return;
      var r = chip.getBoundingClientRect();
      var before = ev.clientX < r.left + r.width / 2;
      var ref = before ? chip : chip.nextSibling;
      if (ref === dragged) return;
      if (before && ref.previousSibling === dragged) return;
      if (!before && !ref && b.lastElementChild === dragged) return;
      _cmpPairMove(dragged.getAttribute('data-key'), ref ? ref.getAttribute('data-key') : null, before);
    });
    chip.addEventListener('click', function() {
      var track = document.getElementById('cmpTrack');
      if (!track) return;
      var card = track.querySelector('.cmp-card[data-key="' + chip.getAttribute('data-key') + '"]');
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });
}

// ===== v0.38.0 对比页简分面板（与首页共用状态/渲染，见顶层 LEVEL_* 与 toggleLevelPop）=====
function cmpToggleLevel(e) { toggleLevelPop(e); }

// ===== v0.38.0 对比卡缩放 =====
function cmpSetZoom(v) {
  var z = parseInt(v, 10);
  if (!(z >= 50 && z <= 200)) z = 100;
  _cmpZoom = z;
  try { localStorage.setItem(CMP_ZOOM_KEY, String(z)); } catch(e) {}
  _cmpApplyZoom();
}

function _cmpApplyZoom() {
  var track = document.getElementById('cmpTrack');
  if (!track) return;
  var z = (_cmpZoom || 100) + '%';
  track.style.zoom = z;
  var slider = document.getElementById('cmpZoom');
  if (slider && String(slider.value) !== String(_cmpZoom)) slider.value = String(_cmpZoom);
  var zv = document.getElementById('cmpZoomVal');
  if (zv) zv.textContent = _cmpZoom + '%';
}

function cmpSetCols(n) {
  n = parseInt(n, 10);
  if (!(n >= 1 && n <= 6)) n = 3;
  _cmpCols = n;
  try { localStorage.setItem(CMP_COLS_KEY, String(n)); } catch(e) {}
  _cmpApplyCols();
}

function _cmpApplyCols() {
  var track = document.getElementById('cmpTrack');
  if (track) track.style.setProperty('--cmp-cols', String(_cmpCols));
  var bar = document.getElementById('cmpBar');
  if (bar) bar.style.setProperty('--cmp-cols', String(_cmpCols));
  document.querySelectorAll('.cmp-cols-btn').forEach(function(b) {
    if (parseInt(b.getAttribute('data-cols'), 10) === _cmpCols) b.classList.add('active');
    else b.classList.remove('active');
  });
}

function cmpToggleBar() {
  _cmpBarOn = !_cmpBarOn;
  try { localStorage.setItem(CMP_BAR_KEY, _cmpBarOn ? '1' : '0'); } catch(e) {}
  _cmpApplyBar();
}

function _cmpApplyBar() {
  var bar = document.getElementById('cmpBar');
  if (bar) bar.style.display = _cmpBarOn ? '' : 'none';
  document.querySelectorAll('.cmp-bar-toggle').forEach(function(b) { b.classList.toggle('active', _cmpBarOn); });
}

// ===== v0.39.0 专注模式：收起管理工具栏项与名字条，缩放/布局/简分/宫位/名字/五区勾选保留可用 =====
function cmpToggleFocus() {
  _cmpFocusOn = !_cmpFocusOn;
  try { localStorage.setItem(CMP_FOCUS_KEY, _cmpFocusOn ? '1' : '0'); } catch(e) {}
  if (_cmpFocusOn && _cmpBarOn) cmpToggleBar();
  _cmpApplyFocus();
}

var _cmpSecbarAnchor = null;
function _cmpApplyFocus() {
  var dlg = document.querySelector('#cmpOverlay .cmp-dialog');
  if (dlg) dlg.classList.toggle('focus-on', _cmpFocusOn);
  var btn = document.getElementById('btnCmpFocus');
  if (btn) {
    btn.classList.toggle('active', _cmpFocusOn);
    btn.textContent = _cmpFocusOn ? '⛶ 退出专注' : '⛶ 专注';
    btn.title = _cmpFocusOn ? '退出专注：恢复标题/档案/清空/关闭与名字条' : '专注：收起管理工具与名字条，缩放/布局/简分/宫位/名字/五区勾选并入一行';
  }
  var bar = document.getElementById('cmpSecBar');
  if (bar) {
    if (_cmpFocusOn) {
      var tb = document.querySelector('#cmpOverlay .cmp-toolbar');
      if (tb && bar.parentNode !== tb) {
        _cmpSecbarAnchor = bar.nextSibling;
        if (btn) tb.insertBefore(bar, btn); else tb.appendChild(bar);
      }
    } else if (_cmpSecbarAnchor && _cmpSecbarAnchor.parentNode && bar.parentNode !== _cmpSecbarAnchor.parentNode) {
      _cmpSecbarAnchor.parentNode.insertBefore(bar, _cmpSecbarAnchor);
    }
  }
}

function cmpOpen() {
  var ov = document.getElementById('cmpOverlay');
  if (!ov) return;
  ov.classList.add('show');
  if (window.ARCHIVE && typeof ARCHIVE.closeArchivePanel === 'function') ARCHIVE.closeArchivePanel();
  cmpClosePicker();
  closeAllLevelPops();
  var gzHost = document.getElementById('cmpGzPanel');
  if (gzHost && !gzHost.innerHTML && window.GONGWEI && typeof GONGWEI.renderGongWeiPanel === 'function') {
    gzHost.innerHTML = GONGWEI.renderGongWeiPanel();
  }
  _cmpHlBind();
  _cmpApplyZoom();
  _cmpApplyCols();
  _cmpApplyFocus();
  renderCmpTrack();
}

function cmpClose() {
  var ov = document.getElementById('cmpOverlay');
  if (ov) ov.classList.remove('show');
  _cmpHlClearAll();
  cmpClosePicker();
  closeAllLevelPops();
}

function cmpIsOpen() {
  var ov = document.getElementById('cmpOverlay');
  return !!(ov && ov.classList.contains('show'));
}

function cmpTogglePicker() {
  var p = document.getElementById('cmpPicker');
  if (!p) return;
  if (p.classList.contains('show')) { p.classList.remove('show'); return; }
  renderCmpPicker();
  p.classList.add('show');
}

function cmpClosePicker() {
  var p = document.getElementById('cmpPicker');
  if (p) p.classList.remove('show');
}

function renderCmpPicker() {
  var p = document.getElementById('cmpPicker');
  if (!p) return;
  var entries = _cmpEntries();
  function has(type, id) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].type !== type) continue;
      if (type === 'current' || String(entries[i].id) === String(id)) return true;
    }
    return false;
  }
  var html = '<div class="cmp-picker-tip">勾选加入对比 / 再点取消；顺序在下方卡片拖 ⠿ 调整</div>';
  var curOn = has('current');
  html += '<div class="cmp-pick-row' + (curOn ? ' on' : '') + '" onclick="COMPARE.pickToggle(\'current\')">'
    + '<input type="checkbox"' + (curOn ? ' checked' : '') + '>'
    + '<span class="cmp-pick-name"><b>当前盘</b></span>'
    + '<span class="cmp-pick-meta">主页面正在看的盘</span></div>';
  var ars = ARCHIVE.getArchives();
  for (var i = 0; i < ars.length; i++) {
    var a = ars[i];
    var on = has('arch', a.id);
    html += '<div class="cmp-pick-row' + (on ? ' on' : '') + '" onclick="COMPARE.pickToggle(\'arch\',\'' + String(a.id).replace(/'/g, '') + '\')">'
      + '<input type="checkbox"' + (on ? ' checked' : '') + '>'
      + '<span class="cmp-pick-name">' + _cmpEsc(ARCHIVE.getDisplayName(a)) + '</span>'
      + '<span class="sex-tag">' + (a.gender === '男' ? '乾造' : '坤造') + '</span>'
      + '<span class="cmp-pick-meta">' + a.year + '年' + a.month + '月' + a.day + '日 ' + pad(a.hour) + ':' + pad(a.min || 0) + '</span>'
      + '</div>';
  }
  p.innerHTML = html;
}

function cmpIsPicked(type, id) {
  var entries = _cmpEntries();
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type !== type) continue;
    if (type === 'current' || String(entries[i].id) === String(id)) return true;
  }
  return false;
}

function cmpPickToggle(type, id) {
  var entries = _cmpEntries();
  var found = -1;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type !== type) continue;
    if (type === 'current' || String(entries[i].id) === String(id)) { found = i; break; }
  }
  if (found >= 0) entries.splice(found, 1);
  else entries.push(type === 'current' ? { type: 'current' } : { type: 'arch', id: id });
  _cmpSave(entries);
  if (type === 'arch' && window.ARCHIVE && typeof ARCHIVE.syncCmpTag === 'function') ARCHIVE.syncCmpTag(id, found < 0);
  // 对比页未打开时（档案面板勾选）只存状态，不渲染隐藏 DOM；打开时会全量渲染
  if (cmpIsOpen()) {
    renderCmpTrack();
    renderCmpPicker();
  }
}

function cmpAddCurrent() {
  var entries = _cmpEntries();
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'current') { renderCmpTrack(); return; }
  }
  entries.push({ type: 'current' });
  _cmpSave(entries);
  renderCmpTrack();
}

function cmpRemoveAt(idx) {
  var entries = _cmpEntries();
  if (idx < 0 || idx >= entries.length) return;
  var it = entries.splice(idx, 1)[0];
  _cmpSave(entries);
  if (it && it.type === 'arch' && window.ARCHIVE && typeof ARCHIVE.syncCmpTag === 'function') ARCHIVE.syncCmpTag(it.id, false);
  renderCmpTrack();
  if (cmpIsOpen()) renderCmpPicker();
}

function cmpMove(from, to) {
  var entries = _cmpEntries();
  if (from < 0 || from >= entries.length || to < 0 || to >= entries.length) return;
  var it = entries.splice(from, 1)[0];
  entries.splice(to, 0, it);
  _cmpSave(entries);
  renderCmpTrack();
}

function cmpClear() {
  var entries = _cmpEntries();
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'arch' && window.ARCHIVE && typeof ARCHIVE.syncCmpTag === 'function') ARCHIVE.syncCmpTag(entries[i].id, false);
  }
  _cmpSave([]);
  renderCmpTrack();
  if (cmpIsOpen()) renderCmpPicker();
}

function cmpSetState(entries) {
  _cmpSave(entries || []);
  renderCmpTrack();
}

  // ===== 挂载到全局命名空间 =====
  window.RENDER = {
    toggleLevel: toggleLevel,
    setLevelPreset: setLevelPreset,
    setRowVisible: setRowVisible,
    setSecVisible: setSecVisible,
    setFlowVisible: setFlowVisible,
    flowMonths: flowMonths,
    flowControlsHTML: flowControlsHTML,
    refreshFlow: refreshFlow,
    applyLevelRows: applyLevelRows,
    refreshXingyaoRows: refreshXingyaoRows,
    applyTaiNianColumn: applyTaiNianColumn,
    insertBeforeNayin: insertBeforeNayin,
    buildPillarRows: buildPillarRows,
    buildJieqiHtml: buildJieqiHtml,
    jqGanzhiOf: jqGanzhiOf,
    jieqiMonthGZ: jieqiMonthGZ,
    liunianYearOf: liunianYearOf,
    refreshJieqi: refreshJieqi,
    renderChart: renderChart,
    bindEvents: bindEvents,
    toggleRecMode: toggleRecMode,
    isRecOn: isRecOn,
    hiDy: hiDy,
    hiLn: hiLn,
    updateCardDyLnColumns: updateCardDyLnColumns,
    _applyDLUpdates: _applyDLUpdates,
    buildDiffMap: buildDiffMap,
    buildCardHTML: buildCardHTML,
    buildCardLuckHTML: buildCardLuckHTML,
    renderTwinCardsHtml: renderTwinCardsHtml,
    renderLongFengCardsHtml: renderLongFengCardsHtml,
    switchTwinMode: switchTwinMode,
    injectCurDaYunLiuNian: injectCurDaYunLiuNian,
    doPaipan: doPaipan,
    scrollToNow: scrollToNow,
    extractBaziFromPaipan: extractBaziFromPaipan,
    buildChartDataFromArchive: buildChartDataFromArchive,
    renderExpandedChart: renderExpandedChart,
    renderChartToHtml: renderChartToHtml,
  };

  // ===== v0.41.0 对比页关系高亮：点击柱名/天干/地支 → 上方功能条 → 跨盘标亮，其余变暗 =====
  var CMP_HL_PKS = ['nian','yue','ri','shi','taiNian','tai','ming','shen'];
  var CMP_HL_PK_LABEL = { nian:'年柱', yue:'月柱', ri:'日柱', shi:'时柱', taiNian:'胎年', tai:'胎元', ming:'命宫', shen:'身宫' };
  var CMP_HL_GAN_RELS = ['tong','yi','sheng_tong','sheng_yi','beisheng_tong','beisheng_yi','ke_tong','ke_yi','beike_tong','beike_yi','he','chong'];
  var CMP_HL_GAN_REL_LABEL = { tong:'同干', yi:'异干', sheng_tong:'主生同干', sheng_yi:'主生异干', beisheng_tong:'被生同干', beisheng_yi:'被生异干', ke_tong:'主克同干', ke_yi:'主克异干', beike_tong:'被克同干', beike_yi:'被克异干', he:'合干', chong:'冲干' };
  var CMP_HL_ZHI_RELS = ['tong','yi','zhuSheng','beiSheng','zhuKe','beiKe','xing','chong','he6','sanhe','sanhui','hai','po'];
  var CMP_HL_ZHI_REL_LABEL = { tong:'同支', yi:'异支', zhuSheng:'主生支', beiSheng:'被生支', zhuKe:'主克支', beiKe:'被克支', xing:'刑', chong:'冲', he6:'六合', sanhe:'三合', sanhui:'三会', hai:'害', po:'破' };
  var _HL_WX_GAN = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
  var _HL_WX_ZHI = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
  var _HL_SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
  var _HL_SHENG_INV = { '木':'水','火':'木','土':'火','金':'土','水':'金' };
  var _HL_KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };
  var _HL_KE_INV = { '木':'金','火':'水','土':'木','金':'火','水':'土' };
  var _HL_WUHE = { '甲':'己','己':'甲','乙':'庚','庚':'乙','丙':'辛','辛':'丙','丁':'壬','壬':'丁','戊':'癸','癸':'戊' };
  var _HL_GAN_CHONG = { '甲':'庚','庚':'甲','乙':'辛','辛':'乙','丙':'壬','壬':'丙','丁':'癸','癸':'丁' };
  var _HL_ZHI_CHONG = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' };
  var _HL_ZHI_HE6 = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' };
  var _HL_ZHI_HAI = { '子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉' };
  var _HL_ZHI_PO = { '子':'酉','酉':'子','午':'卯','卯':'午','申':'巳','巳':'申','寅':'亥','亥':'寅','辰':'丑','丑':'辰','戌':'未','未':'戌' };
  var _HL_SANHE = { '子':['申','辰'],'申':['子','辰'],'辰':['申','子'],'寅':['午','戌'],'午':['寅','戌'],'戌':['寅','午'],'巳':['酉','丑'],'酉':['巳','丑'],'丑':['巳','酉'],'亥':['卯','未'],'卯':['亥','未'],'未':['亥','卯'] };
  var _HL_SANHUI = { '寅':['卯','辰'],'卯':['寅','辰'],'辰':['寅','卯'],'巳':['午','未'],'午':['巳','未'],'未':['巳','午'],'申':['酉','戌'],'酉':['申','戌'],'戌':['申','酉'],'亥':['子','丑'],'子':['亥','丑'],'丑':['亥','子'] };

  function _hlYang(ch) { return TG.indexOf(ch) % 2 === 0; }
  function _hlGanByWx(wx, yang) {
    return TG.filter(function(g) { return _HL_WX_GAN[g] === wx && _hlYang(g) === yang; });
  }
  function _hlZhiByWx(wx) {
    return DZ.filter(function(z) { return _HL_WX_ZHI[z] === wx; });
  }
  // 寅巳申 / 丑戌未 任意两支相见即刑；子卯互刑；辰午酉亥自刑
  function _hlZhiXingSet(z) {
    if (z === '子') return ['卯'];
    if (z === '卯') return ['子'];
    if (z === '寅' || z === '巳' || z === '申') return ['寅','巳','申'].filter(function(x) { return x !== z; });
    if (z === '丑' || z === '戌' || z === '未') return ['丑','戌','未'].filter(function(x) { return x !== z; });
    return [z];
  }
  function _hlGanSet(g, rel) {
    var w = _HL_WX_GAN[g], y = _hlYang(g);
    switch (rel) {
      case 'tong': return [g];
      case 'yi': return TG.filter(function(x) { return x !== g; });
      case 'sheng_tong': return _hlGanByWx(_HL_SHENG[w], y);
      case 'sheng_yi': return _hlGanByWx(_HL_SHENG[w], !y);
      case 'beisheng_tong': return _hlGanByWx(_HL_SHENG_INV[w], y);
      case 'beisheng_yi': return _hlGanByWx(_HL_SHENG_INV[w], !y);
      case 'ke_tong': return _hlGanByWx(_HL_KE[w], y);
      case 'ke_yi': return _hlGanByWx(_HL_KE[w], !y);
      case 'beike_tong': return _hlGanByWx(_HL_KE_INV[w], y);
      case 'beike_yi': return _hlGanByWx(_HL_KE_INV[w], !y);
      case 'he': return [_HL_WUHE[g]];
      case 'chong': return _HL_GAN_CHONG[g] ? [_HL_GAN_CHONG[g]] : [];
      default: return [];
    }
  }
  function _hlZhiSet(z, rel) {
    var w = _HL_WX_ZHI[z];
    switch (rel) {
      case 'tong': return [z];
      case 'yi': return DZ.filter(function(x) { return x !== z; });
      case 'zhuSheng': return _hlZhiByWx(_HL_SHENG[w]);
      case 'beiSheng': return _hlZhiByWx(_HL_SHENG_INV[w]);
      case 'zhuKe': return _hlZhiByWx(_HL_KE[w]);
      case 'beiKe': return _hlZhiByWx(_HL_KE_INV[w]);
      case 'xing': return [z].concat(_hlZhiXingSet(z));
      case 'chong': return [z, _HL_ZHI_CHONG[z]];
      case 'he6': return [z, _HL_ZHI_HE6[z]];
      case 'sanhe': return [z].concat(_HL_SANHE[z]);
      case 'sanhui': return [z].concat(_HL_SANHUI[z]);
      case 'hai': return [z, _HL_ZHI_HAI[z]];
      case 'po': return [z, _HL_ZHI_PO[z]];
      default: return [];
    }
  }
  function _cmpHlRelSet(mode, rel, ch) {
    if (mode === 'gan') return _hlGanSet(ch, rel);
    if (mode === 'zhi') return _hlZhiSet(ch, rel);
    return [];
  }

  var _hl = null;
  var _lockG = null;
  var _lockZ = null;
  var _cmpHlBound = false;

  function _hlGanC() { return _lockG || (_hl && _hl.gan) || null; }
  function _hlZhiC() { return _lockZ || (_hl && _hl.zhi) || null; }

  function _cmpHlClearClasses() {
    var track = document.getElementById('cmpTrack');
    if (track) track.querySelectorAll('.bz-hl-on,.bz-hl-off,.bz-hl-ref').forEach(function(el) {
      el.classList.remove('bz-hl-on','bz-hl-off','bz-hl-ref');
    });
  }
  function _cmpHlClearAllClasses() {
    var track = document.getElementById('cmpTrack');
    if (track) track.querySelectorAll('.bz-hl-on,.bz-hl-off,.bz-hl-ref,.bz-hl-refmark').forEach(function(el) {
      el.classList.remove('bz-hl-on','bz-hl-off','bz-hl-ref','bz-hl-refmark');
    });
  }
  function _cmpHlClearHl() {
    _hl = null;
    _cmpHlClearClasses();
    var bar = document.getElementById('cmpHLBar');
    if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
  }
  function _cmpHlClearAll() {
    _hl = null;
    _lockG = null;
    _lockZ = null;
    var track = document.getElementById('cmpTrack');
    if (track) track.querySelectorAll('.bz-hl-on,.bz-hl-off,.bz-hl-ref,.bz-hl-refmark').forEach(function(el) {
      el.classList.remove('bz-hl-on','bz-hl-off','bz-hl-ref','bz-hl-refmark');
    });
    var bar = document.getElementById('cmpHLBar');
    if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
  }
  function _cmpHlRefText() {
    if (!_hl) return '';
    if (_hl.focus === 'pillar') {
      var idxP = 0;
      var trackP = document.getElementById('cmpTrack');
      if (trackP) {
        var cardsP = trackP.querySelectorAll('.cmp-card');
        for (var i = 0; i < cardsP.length; i++) {
          if (cardsP[i].getAttribute('data-key') === _hl.refKey) { idxP = i; break; }
        }
      }
      return (idxP + 1) + '号盘 · ' + (CMP_HL_PK_LABEL[_hl.refPk] || _hl.refPk);
    }
    var isGan = _hl.focus === 'gan';
    var c = isGan ? _hlGanC() : _hlZhiC();
    if (!c) return '';
    var idx = 0;
    var track = document.getElementById('cmpTrack');
    if (track) {
      var cards = track.querySelectorAll('.cmp-card');
      for (var j = 0; j < cards.length; j++) {
        if (cards[j].getAttribute('data-key') === c.key) { idx = j; break; }
      }
    }
    var s = (idx + 1) + '号盘 · ' + (CMP_HL_PK_LABEL[c.pk] || c.pk) + ' ｜ ' + (isGan ? '干 ' : '支 ') + c.ch;
    if (isGan ? _lockG : _lockZ) s += ' 🔒';
    return s;
  }
  function _cmpHlRenderBar() {
    var bar = document.getElementById('cmpHLBar');
    if (!bar || !_hl) return;
    var html = '<span class="cmp-hl-ref">' + _cmpEsc(_cmpHlRefText()) + '</span>';
    if (_hl.focus === 'pillar') {
      for (var i = 0; i < CMP_HL_PKS.length; i++) {
        var pk = CMP_HL_PKS[i];
        html += '<label class="cmp-hl-pk"><input type="checkbox" value="' + pk + '"' + (_hl.pillars.indexOf(pk) >= 0 ? ' checked' : '') + '>' + CMP_HL_PK_LABEL[pk] + '</label>';
      }
      html += '<button class="cmp-hl-apply" title="所有盘勾选柱位高亮，其余柱变暗">◌ 标亮同柱</button>';
    } else {
      var relRow = function(row, rels, labels, kind) {
        var arr = row === 'g' ? _hl.relsG : _hl.relsZ;
        var lk = row === 'g' ? _lockG : _lockZ;
        var h = '<span class="cmp-hl-rowtag">' + kind + '</span>';
        for (var r = 0; r < rels.length; r++) {
          var rel = rels[r];
          h += '<button class="cmp-hl-rel' + (arr.indexOf(rel) >= 0 ? ' active' : '') + '" data-row="' + row + '" data-rel="' + rel + '" title="所有盘符合条件的' + labels[rel] + '高亮，其余' + kind + '变暗；再点一次取消，可与其它键叠加">' + labels[rel] + '</button>';
        }
        h += '<button class="cmp-hl-rel cmp-hl-lock' + (lk ? ' active' : '') + '" data-row-lock="' + row + '" title="' + (lk ? '该行已锁定：本行功能只以锁定的' + kind + '（红圈格）为中心计算，点击盘中其他' + kind + '不切换中心；再点一次解除' : '锁定当前' + kind + '为本行计算中心：之后点击盘中任何' + kind + '都不切换，本行功能始终以它为中心') + '">🔒 ' + (lk ? '已锁定' : '锁定') + '</button>';
        return '<span class="cmp-hl-row">' + h + '</span>';
      };
      html += relRow('g', CMP_HL_GAN_RELS, CMP_HL_GAN_REL_LABEL, '干');
      html += relRow('z', CMP_HL_ZHI_RELS, CMP_HL_ZHI_REL_LABEL, '支');
    }
    html += '<button class="cmp-hl-close" title="清除高亮并收起（锁定中心与红圈保留）">✕</button>';
    bar.innerHTML = html;
    bar.style.display = '';
    if (_hl.focus === 'pillar') {
      bar.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function() {
          var sel = [];
          bar.querySelectorAll('input[type="checkbox"]').forEach(function(c2) { if (c2.checked) sel.push(c2.value); });
          _hl.pillars = sel;
        });
      });
      bar.querySelector('.cmp-hl-apply').addEventListener('click', function() {
        _cmpHlApply();
      });
    } else {
      bar.querySelectorAll('.cmp-hl-rel[data-rel]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var rel = btn.getAttribute('data-rel');
          var arr = btn.getAttribute('data-row') === 'g' ? _hl.relsG : _hl.relsZ;
          var i = arr.indexOf(rel);
          if (i >= 0) arr.splice(i, 1); else arr.push(rel);
          _cmpHlApply();
        });
      });
      bar.querySelectorAll('.cmp-hl-lock').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var row = btn.getAttribute('data-row-lock');
          if (row === 'g') {
            if (_lockG) { _hl.gan = _lockG; _lockG = null; }
            else if (_hlGanC()) _lockG = { face:'gan', ch:_hlGanC().ch, pk:_hlGanC().pk, key:_hlGanC().key };
          } else {
            if (_lockZ) { _hl.zhi = _lockZ; _lockZ = null; }
            else if (_hlZhiC()) _lockZ = { face:'zhi', ch:_hlZhiC().ch, pk:_hlZhiC().pk, key:_hlZhiC().key };
          }
          _cmpHlApply();
        });
      });
    }
    bar.querySelector('.cmp-hl-close').addEventListener('click', _cmpHlClearHl);
  }
  function _cmpHlApply() {
    _cmpHlClearAllClasses();
    if (!_hl) return;
    var track = document.getElementById('cmpTrack');
    if (!track) return;
    if (_hl.focus === 'pillar') {
      track.querySelectorAll('.cmp-card').forEach(function(card) {
        card.querySelectorAll('td[data-gk]').forEach(function(td) {
          td.classList.add(_hl.pillars.indexOf(td.getAttribute('data-pk')) >= 0 ? 'bz-hl-on' : 'bz-hl-off');
        });
      });
      var refCard = _hl.refKey ? track.querySelector('.cmp-card[data-key="' + _hl.refKey + '"]') : null;
      if (refCard) {
        var refTh = refCard.querySelector('th[data-pk="' + _hl.refPk + '"]');
        if (refTh) refTh.classList.add('bz-hl-ref');
      }
    } else {
      var applyRow = function(gk, ch, rels) {
        if (!ch || !rels.length) return;
        var set = [];
        rels.forEach(function(rel) {
          (gk === 'gan' ? _hlGanSet(ch, rel) : _hlZhiSet(ch, rel)).forEach(function(x) {
            if (set.indexOf(x) < 0) set.push(x);
          });
        });
        track.querySelectorAll('.cmp-card td[data-gk="' + gk + '"]').forEach(function(td) {
          td.classList.add(set.indexOf(td.getAttribute('data-gz')) >= 0 ? 'bz-hl-on' : 'bz-hl-off');
        });
      };
      var gc = _hlGanC(), zc = _hlZhiC();
      applyRow('gan', gc ? gc.ch : null, _hl.relsG);
      applyRow('zhi', zc ? zc.ch : null, _hl.relsZ);
      var fc = _hl.focus === 'gan' ? gc : zc;
      var fLock = _hl.focus === 'gan' ? _lockG : _lockZ;
      if (fc && !fLock) {
        var refCard2 = fc.key ? track.querySelector('.cmp-card[data-key="' + fc.key + '"]') : null;
        if (refCard2) {
          var refTd = refCard2.querySelector('td[data-gk="' + _hl.focus + '"][data-gz="' + fc.ch + '"][data-pk="' + fc.pk + '"]');
          if (refTd) refTd.classList.add('bz-hl-ref');
        }
      }
    }
    [_lockG, _lockZ].forEach(function(l) {
      if (!l) return;
      var card = l.key ? track.querySelector('.cmp-card[data-key="' + l.key + '"]') : null;
      if (!card) return;
      var el = card.querySelector('td[data-gk="' + l.face + '"][data-gz="' + l.ch + '"][data-pk="' + l.pk + '"]');
      if (el) el.classList.add('bz-hl-refmark');
    });
    _cmpHlRenderBar();
  }
  function _cmpHlBind() {
    if (_cmpHlBound) return;
    var track = document.getElementById('cmpTrack');
    if (!track) return;
    _cmpHlBound = true;
    track.addEventListener('click', function(ev) {
      var t = ev.target;
      if (!t || t.nodeType !== 1) return;
      var pk, gk, gz, card, refKey;
      if (t.tagName === 'TH' && (pk = t.getAttribute('data-pk'))) {
        card = t.closest('.cmp-card');
        refKey = card ? card.getAttribute('data-key') : '';
        if (_hl && _hl.focus === 'pillar' && _hl.refPk === pk && _hl.refKey === refKey) { _cmpHlClearHl(); return; }
        _cmpHlClearHl();
        _hl = { focus:'pillar', refPk:pk, refKey:refKey, pillars:[pk] };
        _cmpHlApply();
        return;
      }
      if (t.tagName === 'TD' && (gk = t.getAttribute('data-gk')) && (gz = t.getAttribute('data-gz'))) {
        pk = t.getAttribute('data-pk');
        card = t.closest('.cmp-card');
        refKey = card ? card.getAttribute('data-key') : '';
        var isNew = false;
        if (!_hl) { _hl = { focus:gk, relsG:[], relsZ:[] }; isNew = true; }
        var lk = gk === 'gan' ? _lockG : _lockZ;
        var cc = gk === 'gan' ? _hlGanC() : _hlZhiC();
        if (!isNew && _hl.focus === gk && cc && cc.ch === gz && cc.pk === pk && cc.key === refKey) { _cmpHlClearHl(); return; }
        if (!lk) {
          var o = { face:gk, ch:gz, pk:pk, key:refKey };
          if (gk === 'gan') _hl.gan = o; else _hl.zhi = o;
        }
        var other = gk === 'gan' ? 'zhi' : 'gan';
        var otherC = other === 'gan' ? _hlGanC() : _hlZhiC();
        var otherLock = other === 'gan' ? _lockG : _lockZ;
        if (!otherC && !otherLock) {
          var otherTd = card ? card.querySelector('td[data-gk="' + other + '"][data-pk="' + pk + '"]') : null;
          if (otherTd) {
            var oc = { face:other, ch:otherTd.getAttribute('data-gz'), pk:pk, key:refKey };
            if (other === 'gan') _hl.gan = oc; else _hl.zhi = oc;
          }
        }
        _hl.focus = gk;
        _cmpHlApply();
      }
    });
    document.addEventListener('keydown', function(ev) {
      if (ev.key !== 'Escape' || !_hl) return;
      var ov = document.getElementById('cmpOverlay');
      if (ov && ov.classList.contains('show')) _cmpHlClearHl();
    });
  }

  // ===== 盘面对比 (v0.37.0) =====
  document.addEventListener('click', function(e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('.cmp-level-wrap')) return;
    closeAllLevelPops();
  });

  window.COMPARE = {
    open: cmpOpen,
    close: cmpClose,
    isOpen: cmpIsOpen,
    refresh: renderCmpTrack,
    togglePicker: cmpTogglePicker,
    closePicker: cmpClosePicker,
    pickToggle: cmpPickToggle,
    isPicked: cmpIsPicked,
    addCurrent: cmpAddCurrent,
    removeAt: cmpRemoveAt,
    move: cmpMove,
    clear: cmpClear,
    toggleLevel: cmpToggleLevel,
    setLevel: setLevelPreset,
    setZoom: cmpSetZoom,
    setCols: cmpSetCols,
    toggleBar: cmpToggleBar,
    toggleFocus: cmpToggleFocus,
    _setState: cmpSetState,
    hlRelSet: _cmpHlRelSet,
    hlClear: _cmpHlClearAll,
  };
  _cmpApplyCols();
  _cmpApplyBar();
  _cmpApplyFocus();
})();
