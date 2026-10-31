/* 八字排盘 v0.56.0 — render.js */
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
  var addYMDH = ALGO.addYMDH;
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
  var getTaiji = ALGO.getTaiji;
  var taijiStemLabel = ALGO.taijiStemLabel;

  // 太极点天干的主星位置标签（年主/月主/日主/时主）；gan 比对防跨排盘残留。
  // 太极激活后日干格不再是「日主」例外，统一显示对新中心的十神（col='ri' 时 taijiStemRs 已接管）
  function taijiStemRs(gan, type) {
    var t = getTaiji();
    if (!t.active || t.kind !== 'gan' || type !== t.col || gan !== t.gan) return '';
    return taijiStemLabel(t.col);
  }

  function taijiRingHtml(gan, wg) {
    return '<span class="taiji-ring ' + (wg || wxClass(gan)) + '">' + gan + '</span>';
  }
  function stemCellHtml(p, k) {
    var t = getTaiji();
    if (t.active && t.kind === 'gan' && k === t.col && p.gan === t.gan) return taijiRingHtml(p.gan, p.wg);
    return p.gan;
  }
  function cgCellHtml(l, k) {
    var t = getTaiji();
    if (l && t.active && t.kind === 'cang' && k === t.col && l.gan === t.gan)
      return '<span class="taiji-ring ' + wxClass(l.gan) + '">' + l.gan + '</span> 主';
    return fmtCGLayer(l);
  }

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

  // ===== 别名：来自 shishen.js =====
  var sshSelectedGroups = SSH.selectedGroups;
  var sshMapName = SSH.mapName;
  var sshGroupByName = SSH.groupByName;
  var sshEsc = SSH.esc;

  // ===== 别名：十干对应（ganying 由 shishen.js 的 GAN 命名空间提供） =====
  var ganSelectedGroups = (window.GAN && window.GAN.selectedGroups)
    ? window.GAN.selectedGroups : function() { return []; };
  var ganMapName = (window.GAN && window.GAN.mapName)
    ? window.GAN.mapName : function() { return ''; };

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
    var saveLastChart = ARCHIVE.saveLastChart;
    var restoreLastChart = ARCHIVE.restoreLastChart;
    var parseLastChart = ARCHIVE.parseLastChart;  var loadArchive = ARCHIVE.loadArchive;
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

// ===== v0.48.0 双胞胎卡区显隐（同步对比卡勾选；状态独立于 _cmpSecs，默认全显示） =====
// 运流项=时柱右侧大运/流年列；运流区/节气区作用于 .bz-twin-shared（luck-section/jieqi-section 在卡外）
var _twinSecs = { yunxiang: true, cangqi: true, sanyuan: true, yunliu: true, jieqi: true };

function twinSecControlsHTML() {
  var defs = [['yunxiang', '运流项'], ['cangqi', '藏气区'], ['sanyuan', '三垣区'], ['yunliu', '运流区'], ['jieqi', '节气区']];
  var html = '<span class="twin-secbar" id="twinSecBar" title="双胞胎卡区显示（与排盘对比勾选一致）">';
  for (var i = 0; i < defs.length; i++) {
    var k = defs[i][0];
    html += '<label><input type="checkbox" data-tsec="' + k + '"' + (_twinSecs[k] ? ' checked' : '')
      + ' onchange="RENDER.setTwinSecVisible(\'' + k + '\',this.checked)">' + defs[i][1] + '</label>';
  }
  return html + '</span>';
}

function applyTwinSecs() {
  document.querySelectorAll('.bz-twin-card').forEach(function(card) {
    SEC_KEYS.forEach(function(k) { card.classList.toggle('sec-' + k + '-off', !_twinSecs[k]); });
  });
  document.querySelectorAll('.bz-twin-shared').forEach(function(sh) {
    sh.classList.toggle('sec-yunliu-off', !_twinSecs.yunliu);
    sh.classList.toggle('sec-jieqi-off', !_twinSecs.jieqi);
  });
  document.querySelectorAll('#twinSecBar input[data-tsec]').forEach(function(cb) {
    cb.checked = !!_twinSecs[cb.getAttribute('data-tsec')];
  });
}

function setTwinSecVisible(k, v) {
  if (!(k in _twinSecs)) return;
  _twinSecs[k] = !!v;
  applyTwinSecs();
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

// ===== v0.53.0 十神组行 =====
// 外层独立 td（renderChart 内的 td() 局部函数此处不可见）
function sshTd(cls, txt) { return '<td class="' + (cls || '') + '">' + (txt || '') + '</td>'; }

// 藏气竖排单元：每层一行「藏干 | 十神 | 十干对应 ｜ 组对应名」，组对应名按勾选顺序在右侧竖排堆叠（整块居中于该层）
function sshCgVert(p, colKey, twin, riGan, groups, ganGroups) {
  var layers = cangGanLayers(p.zhi, riGan, twin, colKey);
  var t = getTaiji();
  var out = '';
  if (!groups) groups = [];
  if (!ganGroups) ganGroups = [];
  for (var i = 0; i < 3; i++) {
    var l = layers[i];
    if (!l) continue;
    var g = (t.active && t.kind === 'cang' && colKey === t.col && l.gan === t.gan)
      ? '<span class="taiji-ring ' + wxClass(l.gan) + '">' + l.gan + '</span>'
      : '<span class="' + wxClass(l.gan) + '">' + l.gan + '</span>';
    var ns = '';
    for (var k = 0; k < groups.length; k++) {
      ns += '<span class="ssh-cg-n">' + sshEsc(sshMapName(groups[k], shiShen(riGan, l.gan, false))) + '</span>';
    }
    var gy = '';
    for (var m = 0; m < ganGroups.length; m++) {
      var gv = ganMapName(ganGroups[m], l.gan);
      if (gv) gy += '<span class="gy-n">' + sshEsc(gv) + '</span>';
    }
    var cgHead = '<span class="ssh-cg-l"><span class="ssh-cg-g">' + g + '</span>'
      + '<span class="ssh-cg-t">' + sshEsc(l.shiShen) + '</span>';
    // 十干组勾选后固定两区（十干｜十神），该干无对应词也留竖线与占位，避免十神名左移进十干区
    if (!(ganGroups && ganGroups.length)) {
      out += cgHead + (ns ? '<span class="ssh-cg-ns">' + ns + '</span>' : '') + '</span>';
      continue;
    }
    out += cgHead
      + '<span class="gy-ns' + (gy ? '' : ' gy-empty') + '">' + gy + '</span>'
      + '<span class="ssh-cg-ns gy-sep' + (ns ? '' : ' gy-empty') + '">' + ns + '</span></span>';
  }
  return '<span class="ssh-cg-v">' + out + '</span>';
}

// 天干单元：天干在左，十干对应（竖线分隔）→ 组对应名按勾选顺序右侧竖排堆叠
function sshGanVert(ganHtml, rs, groups, gan, ganGroups) {
  var ns = '';
  if (groups) {
    for (var k = 0; k < groups.length; k++) {
      ns += '<span class="ssh-g-n">' + sshEsc(sshMapName(groups[k], rs)) + '</span>';
    }
  }
  var gy = '';
  if (ganGroups) {
    for (var m = 0; m < ganGroups.length; m++) {
      var gv = ganMapName(ganGroups[m], gan);
      if (gv) gy += '<span class="gy-n">' + sshEsc(gv) + '</span>';
    }
  }
  var head = '<span class="ssh-g-v"><span class="ssh-g-l"><span class="ssh-g-g">' + ganHtml + '</span>';
  // 十干组勾选后固定两区（十干｜十神），该干无对应词也保留竖线与占位
  if (!(ganGroups && ganGroups.length)) {
    if (!ns) return ganHtml;
    return head + '<span class="ssh-g-ns">' + ns + '</span></span></span>';
  }
  return head
    + '<span class="gy-ns' + (gy ? '' : ' gy-empty') + '">' + gy + '</span>'
    + '<span class="ssh-g-ns gy-sep' + (ns ? '' : ' gy-empty') + '">' + ns + '</span>'
    + '</span></span>';
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
    cols.map(function(k){return td(dm(k+'.gan', p[k].wg), stemCellHtml(p[k], k));}).join('') + '</tr>');
  // 地支
  main.push('<tr class="rg" data-row-type="dy2">' + rl('') +
    cols.map(function(k){return td(dm(k+'.zhi', p[k].wz), p[k].zhi);}).join('') + '</tr>');
  // 藏干三层
  ['本气','中气','余气'].forEach(function(lv, li) {
    main.push('<tr class="rh" data-sec="cangqi">' + rl(lv) +
      cols.map(function(k){return td(dm(k+'.cg.'+li), cgCellHtml((p[k].ly||[])[li], k));}).join('') + '</tr>');
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

// v0.56.0 运列表头年份小字（大运=该运起始年，流年=当年）
function dyLnYearHtml(y) { return (y !== null && y !== undefined && y !== '') ? '<span class="dyln-yr">'+y+'</span>' : ''; }
function gzYearLabel(y) { return y ? CONST.TG[((y - 4) % 10 + 10) % 10] + CONST.DZ[((y - 4) % 12 + 12) % 12] : ''; }

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
      rs: taijiStemRs(gan, type) || ((gan === riGan && type === 'ri' && !getTaiji().active) ? '日主' : shiShen(riGan, gan, false)),
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
    // 运前年数 = 交运年 − 出生年：与 daYun[0].startYear 同源，避免两处口径漂移
    preQyYears = daYun.length > 0 ? Math.max(0, daYun[0].startYear - y) : 0;
    const WUHE = {甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
    // 起运准确日期
    const qyStartDate = addYMDH(new Date(y, m-1, d, h || 0, mi || 0), joy, jom, jod, joh);
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
  chartRows.push('<tr class="hd">'+th('rl','盘式')+th('','年柱',' data-pk="nian"')+th('','月柱',' data-pk="yue"')+th('','日柱',' data-pk="ri"')+th('','时柱',' data-pk="shi"')+th('sep col-dy','大运'+dyLnYearHtml(curDy?curDy.startYear:''))+th('col-ln','流年'+dyLnYearHtml(nowYear))+'</tr>');

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
  var sshSel = sshSelectedGroups();
  var ganSel = ganSelectedGroups();
  // 主星行(0)：用 pDy.rs / pLn.rs 替换占位
  mainRows[0] = '<tr class="rs" data-row-type="dy1">'+rl('主星')+td('',pNian.rs)+td('',pYue.rs)+td('',pRi.rs)+td('',pShi.rs)+td('sep col-dy',pDy.rs)+td('col-ln',pLn.rs)+'</tr>';
  // 天干行(1)
  mainRows[1] = '<tr class="rg" data-row-type="ln1">'+rl('')+
    td(pNian.wg,sshGanVert(stemCellHtml(pNian,'nian'), pNian.rs, sshSel, pNian.gan, ganSel),' data-gk="gan" data-gz="'+pNian.gan+'" data-pk="nian"')+
    td(pYue.wg,sshGanVert(stemCellHtml(pYue,'yue'), pYue.rs, sshSel, pYue.gan, ganSel),' data-gk="gan" data-gz="'+pYue.gan+'" data-pk="yue"')+
    td(pRi.wg,sshGanVert(stemCellHtml(pRi,'ri'), pRi.rs, sshSel, pRi.gan, ganSel),' data-gk="gan" data-gz="'+pRi.gan+'" data-pk="ri"')+
    td(pShi.wg,sshGanVert(stemCellHtml(pShi,'shi'), pShi.rs, sshSel, pShi.gan, ganSel),' data-gk="gan" data-gz="'+pShi.gan+'" data-pk="shi"')+
    td('sep col-dy '+pDy.wg,sshGanVert(pDy.gan, pDy.rs, sshSel, pDy.gan, ganSel))+td('col-ln '+pLn.wg,sshGanVert(pLn.gan, pLn.rs, sshSel, pLn.gan, ganSel))+'</tr>';
  // 地支行(2)
  mainRows[2] = '<tr class="rg" data-row-type="dy2">'+rl('')+
    td(pNian.wz,pNian.zhi,' data-gk="zhi" data-gz="'+pNian.zhi+'" data-pk="nian"')+
    td(pYue.wz,pYue.zhi,' data-gk="zhi" data-gz="'+pYue.zhi+'" data-pk="yue"')+
    td(pRi.wz,pRi.zhi,' data-gk="zhi" data-gz="'+pRi.zhi+'" data-pk="ri"')+
    td(pShi.wz,pShi.zhi,' data-gk="zhi" data-gz="'+pShi.zhi+'" data-pk="shi"')+
    td('sep col-dy '+pDy.wz,pDy.zhi)+td('col-ln '+pLn.wz,pLn.zhi)+'</tr>';
  // 藏气: 单行合并（用 cg 而非 ly），删中气余气
  // v0.64.0 十神组：勾选组时藏气行竖排三列
  var sshCg = sshSel.length > 0 || ganSel.length > 0;
  mainRows[3] = '<tr class="rh" data-sec="cangqi" data-row-type="ln2">'+rl('藏气')
    +td('', sshCg ? sshCgVert(pNian,'nian',twin,riGan,sshSel,ganSel) : pNian.cg)
    +td('', sshCg ? sshCgVert(pYue,'yue',twin,riGan,sshSel,ganSel) : pYue.cg)
    +td('', sshCg ? sshCgVert(pRi,'ri',twin,riGan,sshSel,ganSel) : pRi.cg)
    +td('', sshCg ? sshCgVert(pShi,'shi',twin,riGan,sshSel,ganSel) : pShi.cg)
    +td('sep col-dy', sshCg ? sshCgVert(pDy,'dayun',0,riGan,sshSel,ganSel) : pDy.cg)
    +td('col-ln', sshCg ? sshCgVert(pLn,'liunian',0,riGan,sshSel,ganSel) : pLn.cg)+'</tr>';
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
  // v0.65.0 十神组对应名并入天干单元（不再另起组名行）
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
  syRows.push('<tr class="rs" data-sec="sanyuan" data-row-type="sy-rs">'+rl('主星')+td('',pTaiNian.rs)+td('',pTai.rs)+td('',pMing.rs)+td('',pShen.rs)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg" data-sec="sanyuan" data-row-type="sy-gan">'+rl('')+
    td(pTaiNian.wg,sshGanVert(stemCellHtml(pTaiNian,'taiNian'), pTaiNian.rs, sshSel, pTaiNian.gan, ganSel),' data-gk="gan" data-gz="'+pTaiNian.gan+'" data-pk="taiNian"')+
    td(pTai.wg,sshGanVert(stemCellHtml(pTai,'tai'), pTai.rs, sshSel, pTai.gan, ganSel),' data-gk="gan" data-gz="'+pTai.gan+'" data-pk="tai"')+
    td(pMing.wg,sshGanVert(stemCellHtml(pMing,'ming'), pMing.rs, sshSel, pMing.gan, ganSel),' data-gk="gan" data-gz="'+pMing.gan+'" data-pk="ming"')+
    td(pShen.wg,sshGanVert(stemCellHtml(pShen,'shen'), pShen.rs, sshSel, pShen.gan, ganSel),' data-gk="gan" data-gz="'+pShen.gan+'" data-pk="shen"')+
    emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg" data-sec="sanyuan" data-row-type="sy-zhi">'+rl('')+
    td(pTaiNian.wz,pTaiNian.zhi,' data-gk="zhi" data-gz="'+pTaiNian.zhi+'" data-pk="taiNian"')+
    td(pTai.wz,pTai.zhi,' data-gk="zhi" data-gz="'+pTai.zhi+'" data-pk="tai"')+
    td(pMing.wz,pMing.zhi,' data-gk="zhi" data-gz="'+pMing.zhi+'" data-pk="ming"')+
    td(pShen.wz,pShen.zhi,' data-gk="zhi" data-gz="'+pShen.zhi+'" data-pk="shen"')+
    emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rh" data-sec="sanyuan cangqi" data-row-type="sy-cg">'+rl('藏气')
    +td('', sshCg ? sshCgVert(pTaiNian,'taiNian',twin,riGan,sshSel,ganSel) : pTaiNian.cg)
    +td('', sshCg ? sshCgVert(pTai,'tai',twin,riGan,sshSel,ganSel) : pTai.cg)
    +td('', sshCg ? sshCgVert(pMing,'ming',twin,riGan,sshSel,ganSel) : pMing.cg)
    +td('', sshCg ? sshCgVert(pShen,'shen',twin,riGan,sshSel,ganSel) : pShen.cg)
    +emp('sep')+emp('col-ln')+'</tr>');
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
  // v0.65.0 三垣区组对应名并入天干单元（不再另起组名行）
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
      <div style="display:flex;align-items:baseline;gap:8px;"><span class="cmp-level-wrap"><button class="btn-simple active" onclick="RENDER.toggleLevel(event)" title="简分级别（点击展开设置）">简分：少</button><div class="cmp-level-pop" onclick="event.stopPropagation()"></div></span><button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button>${renderGongWeiPanel()}${GAN.renderPanel()}${SSH.renderPanel()}${flowControlsHTML()}<div class="person-info meta bz-zodiac">${nian.gan}${nian.zhi}年生 · 属${shengXiao} ${nowYearCn}</div><button class="btn-simple rec-trigger${isRecOn() ? ' active' : ''}" onclick="RENDER.toggleRecMode()" title="记录八字分析：运流区移至左下，记录区写入即保存">分析记录</button><button class="btn-simple chart-md-trigger" onclick="ARCHIVE.openChartMd()" title="在本地同步目录里打开该命盘最新的「盘面-姓名.md」">📄 档案md</button></div>
    </div>`;
  const sshOn = !!(sshSel.length || ganSel.length);
  const recOn = !opts.luckBelow && isRecOn();
  const bodyCls = opts.luckBelow ? 'body-cols luck-below' : ((sshOn && !recOn) ? 'body-cols luck-moved' : 'body-cols');
  const luckColHtml = `
      <div class="luck-col${recOn ? ' luck-rec-below' : ''}${(sshSel.length || ganSel.length) ? ' ssh-on' : ''}">
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
        <div class="rec-head"><span style="display:inline-flex;align-items:center;gap:8px;"><span class="rec-title">分析记录</span><span class="rec-dim-wrap"><button type="button" class="rec-dim-btn" onclick="RENDER.toggleDimPop(event)" title="分析维度：勾选本命盘显示的维度，或新增/移除维度">维度 ▾</button><div class="rec-dim-pop" onclick="event.stopPropagation()"></div></span></span><span class="rec-status" id="bzRecStatus"></span></div>
        <div class="rec-tabs" role="tablist"></div>
        <div class="rec-alts"></div>
        <textarea class="rec-text" id="bzRecText" placeholder="记录本次八字分析……写入即自动保存"></textarea>
        <div class="rec-audio" data-suffix="">
          <div class="rec-audio-bar">
            <button type="button" class="rec-audio-btn" onclick="RENDER.recAudioToggle(this)" title="录制语音分析，自动挂在当前档案下">● 录音</button>
            <span class="rec-audio-timer"></span>
            <span class="rec-audio-hint">录音自动存入本地同步文件夹（未开启时仅存浏览器）</span>
          </div>
          <div class="rec-audio-list"></div>
        </div>
      </div>`;
  const html = topBarHtml + `
    <div class="${bodyCls}">
      <div class="main-col">
        <div class="chart-wrap">
        <table class="chart level-0${(sshSel.length || ganSel.length) ? ' ssh-on' : ''}">${chartRows.join('\n')}</table>
        </div>
${recOn ? luckColHtml : ''}
      </div>
${recOn ? '' : luckColHtml}
${recPanelHtml}
    </div>
<div id="bzRecZone" class="rec-zone" style="display:none;"></div>`;

  // 存储数据用于交互
  const container = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
  container.innerHTML = html;
  container._flowState = null;
  applyMultiDL(container, data); // v0.57.0 多选岁运列注入（先于分级/胎年列显隐，插列不影响其定位）
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
  if (targetId === 'output' || (typeof targetId === 'object' && targetId.id === 'output')) {
    try { renderRecZone(); } catch (e) {}
  }
  // v0.75.0 渲染统一补挂宫位标签行：innerHTML 重置会冲掉 .gz-tags，
  // 此前只有 doPaipan/renderCmpTrack/applyTaiji 显式补挂，十神/十干面板的 refresh() 漏挂，
  // 表现为勾选/清空十神十干后宫位标签行消失（勾选数据本身未丢）
  if (window.GONGWEI && typeof GONGWEI.updateGongWeiTags === 'function') GONGWEI.updateGongWeiTags();
}

// ===== v0.43.6 分析记录：记录区占运流区原位，运流移左下；写入即存 localStorage =====
var LS_REC_MODE = 'bz_rec_mode';
var LS_REC_NOTES = 'bz_rec_notes_';
function isRecOn() {
  try { return localStorage.getItem(LS_REC_MODE) === '1'; } catch (e) { return false; }
}
// ===== v0.87.0 分析维度：全局维度表 + 每命盘显隐 + 记录区维度 tabs =====
// 主维度「分析记录」键不带 § 段，与历史数据完全兼容；子维度键 = bz_rec_notes_[twin|]§维度名|指纹
var LS_DIM_LIST = 'bz_dim_list_v1';
var LS_DIM_VIS = 'bz_dim_vis_';
var DIM_MAIN = '分析记录';
var DIM_SEG_MARK = '§';
var DIM_NAME_MAX = 12;
var DIM_COUNT_MAX = 12;
function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return escHtml(s).replace(/"/g, '&quot;'); }
function dimSegOf(dim) { return (dim && dim !== DIM_MAIN) ? (DIM_SEG_MARK + dim + '|') : ''; }
function dimList() {
  var arr = null;
  try { arr = JSON.parse(localStorage.getItem(LS_DIM_LIST)); } catch (e) {}
  if (!Array.isArray(arr)) arr = [DIM_MAIN];
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var nm = String(arr[i] == null ? '' : arr[i]).trim();
    if (!nm || out.indexOf(nm) < 0) out.push(nm);
  }
  if (out.indexOf(DIM_MAIN) < 0) out.unshift(DIM_MAIN);
  return out;
}
function dimSetList(arr) {
  try { localStorage.setItem(LS_DIM_LIST, JSON.stringify(arr)); return true; } catch (e) { return false; }
}
function dimAdd(name) {
  var nm = String(name == null ? '' : name).trim();
  if (!nm) return { ok: false, err: '维度名不能为空' };
  if (/[|§"'<>]/.test(nm)) return { ok: false, err: '维度名不能含 | § " \' < > 字符' };
  if (nm.length > DIM_NAME_MAX) return { ok: false, err: '维度名最长 ' + DIM_NAME_MAX + ' 字' };
  var list = dimList();
  if (list.indexOf(nm) >= 0) return { ok: false, err: '维度「' + nm + '」已存在' };
  if (list.length >= DIM_COUNT_MAX) return { ok: false, err: '最多 ' + DIM_COUNT_MAX + ' 个维度' };
  list.push(nm);
  return dimSetList(list) ? { ok: true, list: list } : { ok: false, err: '保存失败：浏览器存储空间不足' };
}
function dimRemove(name) {
  if (name === DIM_MAIN) return { ok: false, err: '「' + DIM_MAIN + '」是默认维度，不能删除' };
  var list = dimList();
  var i = list.indexOf(name);
  if (i < 0) return { ok: false, err: '维度不存在' };
  list.splice(i, 1);
  // 只从列表移除；文档数据保留在本机（重新添加同名维度即可找回）
  return dimSetList(list) ? { ok: true, list: list } : { ok: false, err: '保存失败：浏览器存储空间不足' };
}
function dimVisKey() {
  var d = window._paipanData;
  if (!d) return null;
  return LS_DIM_VIS + [d.name || '', d.gender || '', d.y, d.m, d.d, d.h, d.mi].join('|');
}
function dimVisGet() {
  var v = null;
  try { v = JSON.parse(localStorage.getItem(dimVisKey())); } catch (e) {}
  var out = { hideEmpty: false, hidden: {} };
  if (v && typeof v === 'object') {
    out.hideEmpty = !!v.hideEmpty;
    if (v.hidden && typeof v.hidden === 'object') out.hidden = v.hidden;
  }
  return out;
}
function dimVisSet(vis) {
  var k = dimVisKey();
  if (!k) return false;
  try { localStorage.setItem(k, JSON.stringify(vis || {})); return true; } catch (e) { return false; }
}
function dimVisibleDims(suffix, pd) {
  var dims = dimList(), vis = dimVisGet(), out = [];
  for (var i = 0; i < dims.length; i++) {
    var dm = dims[i];
    if (vis.hidden[dm]) continue;
    if (vis.hideEmpty && !recNoteGet(recNotesKey(suffix || '', dm, pd)).trim()) continue; // v0.87.1 suffix/pd 穿透：twin 盘判空不再错用主盘键
    out.push(dm);
  }
  if (!out.length) out.push(DIM_MAIN); // 全被隐藏时兜底显示主维度，编辑区不落空
  return out;
}
function recNotesKey(suffix, dim, pd) {
  var d = pd || window._paipanData;
  if (!d) return null;
  return LS_REC_NOTES + (suffix || '') + dimSegOf(dim) + [d.name || '', d.gender || '', d.y, d.m, d.d, d.h, d.mi].join('|');
}

// ===== v0.66.0 分析记录防丢（指纹取不到时不再显示空白）=====
// 键 = 姓名|性别|公历生日|时|分，任一位不同即取不到；改名/改生日/换时辰后内容看着像丢了。
// 兜底顺序：精确键 → 同生日（仅时/分不同）唯一命中自动回捞 → 只列出同名历史记录供手动载入。
var REC_ALT_LIMIT = 6;
function recPad(n) { n = Number(n) || 0; return (n < 10 ? '0' : '') + n; }
function recKeyParts(key) {
  if (!key || key.indexOf(LS_REC_NOTES) !== 0) return null;
  var raw = key.slice(LS_REC_NOTES.length), prefix = '';
  if (raw.indexOf('twin|') === 0) { prefix = 'twin|'; raw = raw.slice(5); }
  // v0.87.0：可选维度段 §维度名| （主维度无此段）
  var dim = '';
  if (raw.charAt(0) === DIM_SEG_MARK) {
    var cut = raw.indexOf('|');
    if (cut < 1) return null;
    dim = raw.slice(1, cut);
    raw = raw.slice(cut + 1);
  }
  var p = raw.split('|');
  if (p.length !== 7) return null;
  return { prefix: prefix, dim: dim, name: p[0], gender: p[1], y: p[2], m: p[3], d: p[4], h: p[5], mi: p[6] };
}
function recNoteGet(key) {
  try { return localStorage.getItem(key) || ''; } catch (e) { return ''; }
}
function recNoteSet(key, val) {
  try { localStorage.setItem(key, val); return true; } catch (e) { return false; }
}
function recNoteCandidates(suffix, dim, pd) {
  dim = (dim && dim !== DIM_MAIN) ? dim : ''; // 主维度键段为空串，须归一化后再过滤
  var out = { key: null, text: '', sameBirthday: [], sameName: [], better: [] };
  var d = pd || window._paipanData;
  if (!d) return out;
  var prefix = suffix || '';
  out.key = LS_REC_NOTES + prefix + dimSegOf(dim) + [d.name || '', d.gender || '', d.y, d.m, d.d, d.h, d.mi].join('|');
  var exact = recNoteGet(out.key);
  // v0.79.0：精确键有内容也继续收集候选，否则档案改时辰后完整版被永久隐藏
  if (exact.trim()) out.text = exact;
  var name = d.name || '', gender = d.gender || '';
  if (!name) return out;
  var ymd = [d.y, d.m, d.d].join('|');
  var all = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k === out.key || k.indexOf(LS_REC_NOTES) !== 0) continue;
      var p = recKeyParts(k);
      if (!p || p.prefix !== prefix || p.dim !== dim || p.name !== name || p.gender !== gender) continue;
      var txt = recNoteGet(k);
      if (!txt.trim()) continue;
      all.push({ key: k, ymd: [p.y, p.m, p.d].join('|'), h: p.h, mi: p.mi, text: txt });
    }
  } catch (e) {}
  for (var j = 0; j < all.length; j++) {
    if (all[j].ymd === ymd) out.sameBirthday.push(all[j]);
    else out.sameName.push(all[j]);
  }
  // v0.79.0：当前键有内容时，找出更完整的历史版本（档案改时辰后完整版会隐身）
  if (out.text.trim()) {
    var cur = out.text.trim(), curLen = cur.length;
    var pool = out.sameBirthday.concat(out.sameName);
    for (var m = 0; m < pool.length; m++) {
      var t = pool[m].text.trim();
      if (t.length <= curLen) continue;
      var holds = t.indexOf(cur) >= 0;
      if (!holds && t.length < curLen * 1.2) continue;
      pool[m].holds = holds;
      out.better.push(pool[m]);
    }
    out.better.sort(function(a, b) { return b.text.trim().length - a.text.trim().length; });
    out.better = out.better.slice(0, 1);
  }
  return out;
}
function recStatusShow(container, text, sticky) {
  var st = container.querySelector('.rec-status');
  if (!st) return;
  st.style.color = '';
  st.style.fontWeight = '';
  st.textContent = text;
  st.classList.add('show');
  clearTimeout(st._t);
  if (!sticky) st._t = setTimeout(function() { st.classList.remove('show'); }, 1500);
}
function recRenderAlts(container, list, hint, suffix, dim) {
  var box = container.querySelector('.rec-alts');
  if (!box || !list.length) return;
  var h = '<div style="font-size:12px;color:#a86400;margin:2px 0 4px;">' + hint + '</div>';
  for (var i = 0; i < list.length && i < REC_ALT_LIMIT; i++) {
    var it = list[i];
    var label = it.ymd.replace(/\|/g, '-') + ' ' + recPad(it.h) + ':' + recPad(it.mi) + ' · ' + it.text.trim().length + ' 字';
    h += '<button type="button" class="rec-alt" data-key="' + it.key.replace(/"/g, '&quot;') + '" data-suffix="' + (suffix || '') + '" data-dim="' + escAttr(dim || '') + '"'
      + ' onclick="RENDER.loadRecAlt(this)"'
      + ' style="margin:0 6px 4px 0;padding:2px 8px;background:var(--c-paper);color:var(--c-ink);border:1px solid var(--c-line);border-radius:2px;cursor:pointer;font-size:12px;font-family:var(--font-display);">'
      + label + '</button>';
  }
  box.innerHTML = h;
  box.style.display = '';
}
function recRenderBetter(container, list, suffix, dim) {
  var box = container.querySelector('.rec-alts');
  if (!box || !list.length) return;
  var ta = container.querySelector('.rec-text');
  var curLen = ta ? (ta.value || '').trim().length : 0;
  var best = list[0];
  var bestLen = best.text.trim().length;
  var hint = '⚠ 发现更完整的历史版本（' + bestLen + ' 字，当前 ' + curLen + ' 字'
    + (best.holds ? '，已包含当前全部内容' : '，内容有差异') + '），点此载入：';
  recRenderAlts(container, [best], hint, suffix, dim);
}
function loadRecAlt(btn) {
  var panel = btn && btn.closest ? btn.closest('.record-panel') : null;
  var ta = panel ? panel.querySelector('.rec-text') : null;
  var k = btn ? btn.getAttribute('data-key') : '';
  if (!panel || !ta || !k) return;
  var txt = recNoteGet(k);
  if (!txt) return;
  ta.value = txt;
  recAutogrow(ta);
  var dim = btn.getAttribute('data-dim') || '';
  var taX = panel.querySelector('.rec-text');
  var cur = recNotesKey(btn.getAttribute('data-suffix') || '', dim, taX && taX._recPd);
  if (cur && cur !== k) recNoteSet(cur, txt);
  var box = panel.querySelector('.rec-alts');
  if (box) { box.innerHTML = ''; box.style.display = 'none'; }
  var p = recKeyParts(k);
  recStatusShow(panel, '已载入 ' + (p ? p.y + '-' + p.m + '-' + p.d + ' ' + recPad(p.h) + ':' + recPad(p.mi) : ''), true);
}
function recAutogrow(ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}
function bindRecPanel(container, suffix) {
  var ta = container.querySelector('.rec-text');
  if (!ta || ta._recBound) return;
  ta._recBound = true;
  suffix = suffix || '';
  // v0.87.1 数据源自愈：window._paipanData 可能被其他视图渲染清掉，容器副本与 DOM 同生命周期必在；
  // 装载/保存一律以 ta._recPd 为准，发现 window 份丢失时顺手补回（流年/录音等仍读 window）
  ta._recPd = container._paipanData || window._paipanData || null;
  if (!window._paipanData && ta._recPd) window._paipanData = ta._recPd;
  // v0.87.0 维度：初始编辑首个可见维度的文档，候选回捞按维度隔离
  var dims = dimVisibleDims(suffix, ta._recPd);
  var firstDim = dims.length ? dims[0] : DIM_MAIN;
  ta._recSuffix = suffix;
  ta._recDim = firstDim;
  var cand = recNoteCandidates(suffix, firstDim, ta._recPd);
  if (cand.text) {
    ta.value = cand.text;
    if (cand.better.length) recRenderBetter(container, cand.better, suffix, firstDim);
  } else if (cand.sameBirthday.length === 1) {
    ta.value = cand.sameBirthday[0].text;
    recStatusShow(container, '已按同生日记录恢复（原 ' + recPad(cand.sameBirthday[0].h) + ':' + recPad(cand.sameBirthday[0].mi) + '）', true);
  } else if (cand.sameBirthday.length + cand.sameName.length) {
    var list = cand.sameBirthday.concat(cand.sameName);
    var hint = cand.sameBirthday.length > 1
      ? '同名同生日有 ' + cand.sameBirthday.length + ' 条记录（时辰不同），点选载入：'
      : '有 ' + cand.sameName.length + ' 条同名记录（生日不同），点选载入：';
    recRenderAlts(container, list, hint, suffix, firstDim);
  }
  ta._recKey0 = recNotesKey(suffix, firstDim, ta._recPd);
  renderRecTabs(container, suffix);
  recAutogrow(ta);
  ta.addEventListener('input', function() {
    recAutogrow(ta);
    recSaveNow(container, ta, suffix, true);
  });
  // v0.83.2 丢字加固：听写/部分输入法直填 value 不派发 input 事件，字只存在内存、刷新即蒸发，
  // 补 compositionend + blur + 定时巡检 + beforeunload 拦截四道兜底
  ta.addEventListener('compositionend', function() { recSaveNow(container, ta, suffix, true); });
  ta.addEventListener('blur', function() { recSaveNow(container, ta, suffix, true); });
  if (ta._recWatch) clearInterval(ta._recWatch);
  ta._recWatch = setInterval(function() {
    if (!document.body || !document.body.contains(ta)) { clearInterval(ta._recWatch); return; }
    recSaveNow(container, ta, suffix); // 巡检非用户主动：空写保护生效
  }, 4000);
  var rp = ta.closest ? ta.closest('.record-panel') : null;
  initRecAudioPanel(rp, suffix);
}
// ===== v0.87.0 维度 tabs：渲染/切换/字数徽标 =====
function renderRecTabs(container, suffix) {
  if (!container || !container.querySelector) return;
  var tabs = container.querySelector('.rec-tabs');
  var ta = container.querySelector('.rec-text');
  if (!tabs || !ta) return;
  suffix = suffix || ta._recSuffix || '';
  var dims = dimVisibleDims(suffix, ta ? ta._recPd : null);
  var cur = ta._recDim || '';
  if (dims.indexOf(cur) < 0) {
    recSaveNow(container, ta, suffix, true); // 当前维度被隐藏：先把草稿落盘再切走
    cur = dims[0] || DIM_MAIN;
    applyDimToTa(container, ta, cur);
  }
  var html = '';
  for (var i = 0; i < dims.length; i++) {
    var dm = dims[i];
    var n = recNoteGet(recNotesKey(suffix, dm)).trim().length;
    html += '<button type="button" role="tab" class="rec-tab' + (dm === cur ? ' active' : '') + '" data-dim="' + escAttr(dm) + '" onclick="RENDER.switchRecDim(this)">'
      + escHtml(dm) + (n ? '<span class="rec-tab-len">' + n + '</span>' : '') + '</button>';
  }
  tabs.innerHTML = html;
}
function applyDimToTa(container, ta, dim) {
  if (!window._paipanData && ta._recPd) window._paipanData = ta._recPd; // v0.87.1 自愈
  ta._recDim = dim;
  ta._recKey0 = recNotesKey(ta._recSuffix || '', dim, ta._recPd);
  var cand = recNoteCandidates(ta._recSuffix || '', dim, ta._recPd);
  ta.value = cand.text;
  var alts = container.querySelector('.rec-alts');
  if (alts) { alts.innerHTML = ''; alts.style.display = 'none'; }
  if (cand.better.length) recRenderBetter(container, cand.better, ta._recSuffix || '', dim);
  recAutogrow(ta);
  return cand;
}
function switchRecDim(btn) {
  var panel = btn && btn.closest ? btn.closest('.record-panel') : null;
  if (!panel) return;
  var ta = panel.querySelector('.rec-text');
  if (!ta) return;
  var dm = btn.getAttribute('data-dim') || '';
  if (ta._recDim === dm) { btn.classList.add('active'); return; }
  recSaveNow(panel, ta, ta._recSuffix || '', true);
  var cand = applyDimToTa(panel, ta, dm);
  panel.querySelectorAll('.rec-tab').forEach(function(b) { b.classList.toggle('active', b === btn); });
  recStatusShow(panel, '「' + dm + '」' + (cand.text.trim() ? cand.text.trim().length + ' 字' : '空'), true);
}
function updateRecTabLen(container, dim, text) {
  if (!container || !container.querySelector) return;
  var tab = container.querySelector('.rec-tab[data-dim="' + escAttr(dim || '') + '"]');
  if (!tab) return;
  var n = (text || '').trim().length;
  var len = tab.querySelector('.rec-tab-len');
  if (n) {
    if (!len) { len = document.createElement('span'); len.className = 'rec-tab-len'; tab.appendChild(len); }
    len.textContent = n;
  } else if (len) len.remove();
}
// ===== v0.87.0 维度下拉：每命盘显隐 + 全局维度管理 =====
function toggleDimPop(e) {
  var wrap = e && e.target && e.target.closest ? e.target.closest('.rec-dim-wrap') : null;
  if (!wrap) return;
  var pop = wrap.querySelector('.rec-dim-pop');
  if (!pop) return;
  var was = pop.classList.contains('open');
  closeDimPops();
  if (was) return;
  var panel = wrap.closest('.record-panel');
  var ta = panel ? panel.querySelector('.rec-text') : null;
  pop._suffix = (ta && ta._recSuffix) || '';
  pop.innerHTML = buildDimPopHtml(pop._suffix);
  pop.classList.add('open');
}
function closeDimPops() {
  document.querySelectorAll('.rec-dim-pop.open').forEach(function(p) { p.classList.remove('open'); });
}
if (typeof window !== 'undefined' && !window._dimPopGuard) {
  window._dimPopGuard = true;
  document.addEventListener('click', function(e) {
    if (e.target.closest && e.target.closest('.rec-dim-wrap')) return;
    closeDimPops();
  }, true);
}
function dimLenOf(suffix, dim) { return recNoteGet(recNotesKey(suffix || '', dim)).trim().length; }
function buildDimPopHtml(suffix) {
  var dims = dimList(), vis = dimVisGet();
  var h = '<div class="rec-dim-sec">本命盘显示（只影响当前命盘）</div>';
  h += '<label class="rec-dim-row"><input type="checkbox"' + (vis.hideEmpty ? ' checked' : '') + ' onchange="RENDER.dimHideEmptyToggle(this)">隐藏内容为空的维度</label>';
  h += '<div class="rec-dim-sec">显示哪些维度</div>';
  for (var i = 0; i < dims.length; i++) {
    var dm = dims[i];
    var n = dimLenOf(suffix, dm);
    var ren = dm === DIM_MAIN ? '' : '<button type="button" class="rec-dim-ren" data-dim="' + escAttr(dm) + '" onclick="RENDER.dimRenameBtn(this)" title="重命名维度（本机文档与显隐设置一并迁移）">✎</button>';
    var del = dm === DIM_MAIN ? '' : '<button type="button" class="rec-dim-del" data-dim="' + escAttr(dm) + '" onclick="RENDER.dimDeleteBtn(this)" title="从维度列表移除（文档内容保留本机）">✕</button>';
    h += '<label class="rec-dim-row"><input type="checkbox" data-dim="' + escAttr(dm) + '"' + (vis.hidden[dm] ? '' : ' checked') + ' onchange="RENDER.dimVisToggle(this)">'
      + escHtml(dm) + '<span class="rec-dim-len">' + (n ? n + ' 字' : '空') + '</span>' + ren + del + '</label>';
  }
  h += '<div class="rec-dim-sec">新增维度（全局，所有命盘可用）</div>';
  h += '<div class="rec-dim-add"><input type="text" class="rec-dim-new" maxlength="' + DIM_NAME_MAX + '" placeholder="如：事业 / 婚姻 / 健康" onkeydown="if(event.key===\'Enter\'){event.preventDefault();RENDER.dimAddBtn(this)}"><button type="button" class="rec-dim-addbtn" onclick="RENDER.dimAddBtn(this)">＋ 新增</button></div>';
  h += '<div class="rec-dim-hint">✎ 改名会把本机文档与显隐设置一并迁到新名字下；移除维度只从列表去掉，文档内容保留本机，重新添加同名维度即可找回。</div>';
  return h;
}
function dimVisToggle(input) {
  var dm = input.getAttribute('data-dim') || '';
  var vis = dimVisGet();
  if (input.checked) delete vis.hidden[dm]; else vis.hidden[dm] = 1;
  if (!dimVisSet(vis)) return;
  refreshDimUI();
}
function dimHideEmptyToggle(input) {
  var vis = dimVisGet();
  vis.hideEmpty = !!input.checked;
  if (!dimVisSet(vis)) return;
  refreshDimUI();
}
function refreshDimUI() {
  document.querySelectorAll('.record-panel').forEach(function(panel) {
    var ta = panel.querySelector('.rec-text');
    if (!ta) return;
    renderRecTabs(panel, ta._recSuffix || '');
  });
  var pop = document.querySelector('.rec-dim-pop.open');
  if (pop) pop.innerHTML = buildDimPopHtml(pop._suffix || '');
}
function dimAddBtn(btn) {
  var pop = btn.closest ? btn.closest('.rec-dim-pop') : null;
  var input = pop ? pop.querySelector('.rec-dim-new') : null;
  var r = dimAdd(input ? input.value : '');
  var panel = btn.closest ? btn.closest('.record-panel') : null;
  if (!r.ok) {
    recStatusShow(panel || document.body, '⚠ ' + r.err, true);
    if (input) input.focus();
    return;
  }
  refreshDimUI();
}
function dimDeleteBtn(btn) {
  var dm = btn.getAttribute('data-dim') || '';
  var r = dimRemove(dm);
  var panel = btn.closest ? btn.closest('.record-panel') : null;
  if (!r.ok) { recStatusShow(panel || document.body, '⚠ ' + r.err, true); return; }
  refreshDimUI();
}
// v0.87.2 行内改名：✎ 把该行换成输入框，Enter/✓ 确认，Esc/失焦取消（✓ 用 mousedown 抢在 blur 前）
function dimRenameBtn(btn) {
  var dm = btn.getAttribute('data-dim') || '';
  var row = btn.closest ? btn.closest('.rec-dim-row') : null;
  if (!row || !dm || dm === DIM_MAIN) return;
  row.innerHTML = '<input type="text" class="rec-dim-renin" maxlength="' + DIM_NAME_MAX + '" value="' + escAttr(dm) + '" onkeydown="RENDER.dimRenameKey(event,this)" onblur="RENDER.dimRenameCancel(this)">'
    + '<button type="button" class="rec-dim-addbtn" onmousedown="RENDER.dimRenameCommit(this)" title="确认改名">✓</button>';
  var inp = row.querySelector('.rec-dim-renin');
  if (inp) { inp.focus(); inp.select(); }
}
function dimRenameKey(e, inp) {
  if (e.key === 'Enter') { e.preventDefault(); dimRenameCommit(inp); }
  else if (e.key === 'Escape') { e.preventDefault(); dimRenameCancel(inp); }
}
function dimRenameCommit(inp) {
  var oldName = inp && inp.defaultValue || '';
  var r = dimRename(oldName, inp ? inp.value : '');
  var panel = inp && inp.closest ? inp.closest('.record-panel') : null;
  if (!r.ok) {
    refreshDimUI();
    recStatusShow(panel || document.body, '⚠ ' + r.err, true);
    return;
  }
  refreshDimUI();
}
function dimRenameCancel(inp) {
  if (!inp || !document.body.contains(inp)) return;
  refreshDimUI();
}
// v0.87.2 维度改名：维度表替换 + 本机文档/显隐设置一并迁移到新名，旧名不留孤儿键
function dimRename(oldName, newName) {
  if (oldName === DIM_MAIN) return { ok: false, err: '「' + DIM_MAIN + '」是默认维度，不能改名' };
  newName = String(newName == null ? '' : newName).trim();
  if (!newName) return { ok: false, err: '维度名不能为空' };
  if (newName === oldName) return { ok: true, list: dimList() };
  if (/[|§"'<>]/.test(newName)) return { ok: false, err: '维度名不能含 | § " \' < > 字符' };
  if (newName.length > DIM_NAME_MAX) return { ok: false, err: '维度名最长 ' + DIM_NAME_MAX + ' 字' };
  var list = dimList();
  if (list.indexOf(newName) >= 0) return { ok: false, err: '维度「' + newName + '」已存在' };
  // 冲突预检：目标名在本机留有历史文档（曾删维度的孤儿数据）时拒绝，防覆盖
  var moves = [], conflict = null;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k) continue;
      var p = recKeyParts(k);
      if (p && p.dim === oldName) {
        var nk = LS_REC_NOTES + p.prefix + dimSegOf(newName) + [p.name, p.gender, p.y, p.m, p.d, p.h, p.mi].join('|');
        if (recNoteGet(nk).trim()) { conflict = nk; break; }
        moves.push({ from: k, to: nk });
      } else if (k.indexOf(LS_DIM_VIS) === 0) {
        var v = null;
        try { v = JSON.parse(localStorage.getItem(k)); } catch (e) {}
        if (v && v.hidden && Object.prototype.hasOwnProperty.call(v.hidden, oldName)) moves.push({ vis: k });
      }
    }
  } catch (e) { return { ok: false, err: '读取本机存储失败，改名中止' }; }
  if (conflict) return { ok: false, err: '「' + newName + '」名下已有本机历史文档，为防覆盖请换个名字' };
  for (var j = 0; j < moves.length; j++) {
    var mv = moves[j];
    if (mv.vis) {
      try {
        var vv = JSON.parse(localStorage.getItem(mv.vis));
        if (vv && vv.hidden && Object.prototype.hasOwnProperty.call(vv.hidden, oldName)) {
          vv.hidden[newName] = vv.hidden[oldName];
          delete vv.hidden[oldName];
          localStorage.setItem(mv.vis, JSON.stringify(vv));
        }
      } catch (e) {}
    } else {
      if (!recNoteSet(mv.to, recNoteGet(mv.from))) return { ok: false, err: '写入失败：存储空间不足，改名中止（原数据未动）' };
      try { localStorage.removeItem(mv.from); } catch (e) {}
    }
  }
  var idx = list.indexOf(oldName);
  if (idx >= 0) list[idx] = newName;
  if (!dimSetList(list)) return { ok: false, err: '保存失败：存储空间不足' };
  // 打开中的编辑区：当前维度旧名 → 新名，避免 tabs 刷新时把草稿存回旧键
  document.querySelectorAll('.rec-text').forEach(function(ta) {
    if (ta._recDim === oldName) {
      ta._recDim = newName;
      ta._recKey0 = recNotesKey(ta._recSuffix || '', newName, ta._recPd);
    }
  });
  return { ok: true, list: list };
}
function recSaveNow(container, ta, suffix, userAct) {
  var k = recNotesKey(suffix, ta._recDim, ta._recPd);
  if (!k || k !== ta._recKey0) return false;
  var prev = null;
  try { prev = localStorage.getItem(k); } catch (e) {}
  if (prev === ta.value) return true;
  // v0.87.1 空写保护：非用户主动的保存（定时巡检等）在已存值非空时不写空，
  // 防止其他视图渲染清掉数据源后、或双开页面旧状态下，巡检把空值盖掉真实内容
  if (!userAct && !ta.value && prev && prev.trim()) return true;
  recAutogrow(ta);
  if (!recNoteSet(k, ta.value)) {
    recStatusShow(container, '⚠ 保存失败：浏览器存储空间不足，请先复制内容再清理', true);
    return false;
  }
  recStatusShow(container, '「' + (ta._recDim || DIM_MAIN) + '」已保存 ' + new Date().toTimeString().slice(0, 8));
  updateRecTabLen(container, ta._recDim, ta.value);
  if (window.ARCHIVE && window.ARCHIVE.syncTouch) window.ARCHIVE.syncTouch();
  return true;
}
if (typeof window !== 'undefined' && !window._recUnloadGuard) {
  window._recUnloadGuard = true;
  window.addEventListener('beforeunload', function(e) {
    var tas = document.querySelectorAll('textarea.rec-text');
    for (var i = 0; i < tas.length; i++) {
      var t = tas[i];
      if (!(t.value || '').trim()) continue;
      var stored = null;
      try { stored = localStorage.getItem(recNotesKey(t._recSuffix, t._recDim, t._recPd)); } catch (err) {}
      if (stored !== t.value) { e.preventDefault(); e.returnValue = ''; return ''; }
    }
  });
}

// ===== v0.80.0 分析记录·录音：面板内 MediaRecorder 录音，IndexedDB 存 blob（不进 localStorage），随档案指纹挂载 =====
var LS_REC_AUDIO = 'bz_rec_audio_';
function recAudioKey(suffix) {
  var d = window._paipanData;
  if (!d) return null;
  return LS_REC_AUDIO + (suffix || '') + [d.name || '', d.gender || '', d.y, d.m, d.d, d.h, d.mi].join('|');
}
function recAudioDb() {
  return new Promise(function(res, rej) {
    var rq = indexedDB.open('bz_rec_audio', 1);
    rq.onupgradeneeded = function() {
      var db = rq.result;
      if (!db.objectStoreNames.contains('clips')) {
        var st = db.createObjectStore('clips', { keyPath: 'id' });
        st.createIndex('key', 'key', { unique: false });
      }
    };
    rq.onsuccess = function() { res(rq.result); };
    rq.onerror = function() { rej(rq.error); };
  });
}
function recAudioStore(db, mode) { return db.transaction('clips', mode).objectStore('clips'); }
function recAudioList(key) {
  return recAudioDb().then(function(db) {
    return new Promise(function(res, rej) {
      var rq = recAudioStore(db, 'readonly').index('key').getAll(key);
      rq.onsuccess = function() { db.close(); res((rq.result || []).sort(function(a, b) { return a.ts - b.ts; })); };
      rq.onerror = function() { db.close(); rej(rq.error); };
    });
  });
}
function recAudioPut(clip) {
  return recAudioDb().then(function(db) {
    return new Promise(function(res, rej) {
      var rq = recAudioStore(db, 'readwrite').put(clip);
      rq.onsuccess = function() { db.close(); res(true); };
      rq.onerror = function() { db.close(); rej(rq.error); };
    });
  });
}
function recAudioDel(id) {
  return recAudioDb().then(function(db) {
    return new Promise(function(res, rej) {
      var rq = recAudioStore(db, 'readwrite').delete(id);
      rq.onsuccess = function() { db.close(); res(true); };
      rq.onerror = function() { db.close(); rej(rq.error); };
    });
  });
}
function recAudioClearKey(key) {
  return recAudioDb().then(function(db) {
    return new Promise(function(res, rej) {
      var st = recAudioStore(db, 'readwrite');
      var rq = st.index('key').getAll(key);
      rq.onsuccess = function() {
        var rows = rq.result || [];
        for (var i = 0; i < rows.length; i++) st.delete(rows[i].id);
        st.transaction.oncomplete = function() { db.close(); res(rows.length); };
      };
      rq.onerror = function() { db.close(); rej(rq.error); };
    });
  });
}
function recAudioRewriteKey(oldKey, newKey) {
  return recAudioList(oldKey).then(function(rows) {
    if (!rows.length) return 0;
    return recAudioDb().then(function(db) {
      return new Promise(function(res, rej) {
        var st = recAudioStore(db, 'readwrite');
        for (var i = 0; i < rows.length; i++) {
          st.delete(rows[i].id);
          rows[i].key = newKey;
          rows[i].id = newKey + '|' + rows[i].ts;
          st.put(rows[i]);
        }
        st.transaction.oncomplete = function() { db.close(); res(rows.length); };
        st.transaction.onerror = function() { db.close(); rej(st.transaction.error); };
      });
    });
  });
}
function recAudioFmt(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  return Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60);
}
function recAudioExt(mime) {
  mime = mime || '';
  if (mime.indexOf('mp4') >= 0) return 'm4a';
  if (mime.indexOf('ogg') >= 0) return 'ogg';
  return 'webm';
}
function initRecAudioPanel(panel, suffix) {
  if (!panel || panel._raBound) return;
  panel._raBound = true;
  var au = panel.querySelector('.rec-audio');
  if (!au) return;
  au.setAttribute('data-suffix', suffix || '');
  var k = recAudioKey(suffix);
  if (!k) return;
  recAudioList(k).then(function(list) { renderRecAudioList(panel, list); }).catch(function() {});
}
function renderRecAudioList(panel, list) {
  var box = panel.querySelector('.rec-audio-list');
  if (!box) return;
  panel._raClips = {};
  if (!list.length) { box.innerHTML = '<div class="rec-audio-empty">暂无录音</div>'; return; }
  var h = '';
  for (var i = list.length - 1; i >= 0; i--) {
    var c = list[i];
    panel._raClips[c.id] = c;
    h += '<div class="rec-audio-item" data-id="' + c.id.replace(/"/g, '&quot;') + '">'
      + '<button type="button" class="ra-play" onclick="RENDER.recAudioPlay(this)" title="播放/暂停">▶</button>'
      + '<span class="ra-name">' + c.name + ' · ' + recAudioFmt(c.dur) + '</span>'
      + '<a class="ra-dl" href="#" onclick="return RENDER.recAudioDownload(this)" title="下载">下载</a>'
      + '<button type="button" class="ra-tf" onclick="RENDER.bzViewTranscript(this)" title="' + (c.transcript ? '查看转录稿' : '转录') + '"'
      + ' style="color:' + (c.transcript ? '#0a7d33' : '#bbb') + ';border:0;background:none;cursor:pointer;">📝</button>'
      + '<button type="button" class="ra-retf" onclick="RENDER.recRetf(this)" title="用最新模型重新转录（旧稿保留）" '
      + 'style="border:0;background:none;cursor:pointer;font-size:13px;">🔄</button>'
      + '<button type="button" class="ra-del" onclick="RENDER.recAudioDelete(this)" title="删除">✕</button>'
      + '</div>';
  }
  box.innerHTML = h;
}
function recAudioStopPlayback(panel) {
  if (panel._raAudio) { try { panel._raAudio.pause(); } catch (e) {} }
  if (panel._raPlayBtn) { panel._raPlayBtn.textContent = '▶'; }
  if (panel._raUrl) { try { URL.revokeObjectURL(panel._raUrl); } catch (e) {} }
  panel._raAudio = null; panel._raAudioId = null; panel._raUrl = null; panel._raPlayBtn = null;
}
function recAudioPlay(btn) {
  var panel = btn.closest('.record-panel');
  var item = btn.closest('.rec-audio-item');
  if (!panel || !item) return;
  var clip = panel._raClips && panel._raClips[item.getAttribute('data-id')];
  if (!clip || !clip.blob) return;
  if (panel._raAudioId === clip.id && panel._raAudio) {
    if (panel._raAudio.paused) { panel._raAudio.play(); btn.textContent = '⏸'; }
    else { panel._raAudio.pause(); btn.textContent = '▶'; }
    return;
  }
  recAudioStopPlayback(panel);
  var url = URL.createObjectURL(clip.blob);
  var au = new Audio(url);
  panel._raAudio = au; panel._raAudioId = clip.id; panel._raUrl = url; panel._raPlayBtn = btn;
  au.onended = function() { if (panel._raPlayBtn === btn) btn.textContent = '▶'; };
  au.play();
  btn.textContent = '⏸';
}
function recAudioDownload(a) {
  var panel = a.closest('.record-panel');
  var item = a.closest('.rec-audio-item');
  if (!panel || !item) return false;
  var clip = panel._raClips && panel._raClips[item.getAttribute('data-id')];
  if (!clip || !clip.blob) return false;
  a.href = URL.createObjectURL(clip.blob);
  a.download = clip.fname || '录音.' + recAudioExt(clip.mime);
  return true;
}
function recRetf(btn) {
  var panel = btn.closest('.record-panel');
  var item = btn.closest('.rec-audio-item');
  if (!panel || !item) return;
  var id = item.getAttribute('data-id');
  var clip = panel._raClips && panel._raClips[id];
  if (!clip) return;
  if (!clip.blob) { recStatusShow(panel, '这条录音没有保留音频，无法重转', true); return; }
  if (!confirm('用最新模型重新转录「' + clip.name + '」？\n\n原稿不会丢，会保留在录音稿的「历史转录」里。')) return;
  if (clip.transcript) {
    clip.prev = (clip.prev || []).concat([{
      text: clip.transcript.text, raw: clip.transcript.raw, ts: clip.transcript.ts, models: clip.transcript.models
    }]).slice(-3);
  }
  clip.transcript = null;
  recStatusShow(panel, '重新转录中…（' + clip.name + '）');
  recAudioPut(clip).then(function() {
    return transcribeClip(clip, panel);
  }).then(function() {
    return recAudioList(clip.key);
  }).then(function(list) {
    renderRecAudioList(panel, list);
    renderRecZone();
  }).catch(function(e) { recStatusShow(panel, '重转失败：' + (e && e.message || e), true); });
}
function recAudioDelete(btn) {
  var panel = btn.closest('.record-panel');
  var item = btn.closest('.rec-audio-item');
  if (!panel || !item) return;
  var id = item.getAttribute('data-id');
  if (!confirm('删除这条录音？删除后不可恢复。')) return;
  if (panel._raAudioId === id) recAudioStopPlayback(panel);
  var au = panel.querySelector('.rec-audio');
  var suffix = au ? (au.getAttribute('data-suffix') || '') : '';
  var k = recAudioKey(suffix);
  var clip = panel._raClips && panel._raClips[id];
  recAudioDel(id).then(function() {
    try {
      if (clip && window.ARCHIVE && window.ARCHIVE.syncDeleteFile) {
        window.ARCHIVE.syncDeleteFile('录音', clip.fname);
        if (clip.tfname) window.ARCHIVE.syncDeleteFile('录音稿', clip.tfname);
      }
    } catch (e) {}
    recStatusShow(panel, '已删除录音');
    if (!k) return null;
    return recAudioList(k).then(function(list) { renderRecAudioList(panel, list); });
  }).catch(function(e) { recStatusShow(panel, '删除失败：' + (e && e.message || e), true); });
}
// ===== v0.82.0 录音自动转录（v0.83.1 升级：VAD 分段带真实时间戳 + GLM 说话人归属→文字记录「对话还原」），key 存 localStorage 不进仓库 =====
var BZ_AI_LS = 'bz_ai_cfg';
var BZ_LLM_BASE = 'https://api.siliconflow.cn/v1';
var BZ_LLM_MODEL = 'deepseek-ai/DeepSeek-V4-Flash';
var BZ_ASR_URL = 'https://api.siliconflow.cn/v1/audio/transcriptions';
var BZ_ASR_MODEL = 'Qwen/Qwen3-ASR-1.7B';
var BZ_ASR_PREV = 'FunAudioLLM/SenseVoiceSmall';
var BZ_ASR_FALLBACK = 'FunAudioLLM/SenseVoiceSmall';
var BZ_ASR_SWITCH_TS = 1792974900000;
var BZ_LLM_PREV = 'Qwen/Qwen2.5-72B-Instruct';
var BZ_LLM_SWITCH_TS = 1792971835000;
var BZ_LLM_PREV2 = 'Qwen/Qwen3-235B-A22B-Instruct-2507';
var BZ_LLM_SWITCH_TS2 = 1793165414037;
var BZ_KB_LINES = '财富体系（财库/获取方式）；十神做功表（十神组合与做事方式）；四柱信息流（年月日时四层信息）；职业匹配喜忌；宫位与命理结构（六亲/身体/空间）；五行基础；国家组织对应';
// v0.85.0 术语表纠错：只纠正实测反复出现的同音错，整段须先命中 BZ_CTX 关键词才启用，避免误伤日常用语
var BZ_CTX = /八字|命盘|命理|日主|日干|月令|月支|年干|时柱|十神|食神|伤官|七杀|正官|正印|偏印|比肩|劫财|偏财|正财|大运|流年|格局|天干|地支|旺衰|喜忌|宫位|刑冲|合害|扶抑|用神/;
var BZ_ASR_FIX = [
  ['行冲合害', '刑冲合害'], ['行冲和害', '刑冲合害'], ['行冲和亥', '刑冲合害'], ['刑冲和害', '刑冲合害'],
  ['欺杀', '七杀'], ['七沙', '七杀'], ['正官杀', '正官七杀'],
  ['得令而亡', '得令而旺'], ['得令而妄', '得令而旺'],
  ['年甘', '年干'], ['月之', '月支'], ['石柱', '时柱'], ['曰主', '日主'], ['日住', '日主'],
  ['月另', '月令'], ['旺哀', '旺衰'], ['喜寄', '喜忌'],
  ['恭位', '宫位'], ['工位', '宫位'],
  ['伏益', '扶抑'], ['负益', '扶抑'], ['扶益', '扶抑'],
  ['食伸', '食神'], ['食晨', '食神'], ['十审', '十神'], ['十伸', '十神'],
  ['伤关', '伤官'], ['观星', '官星'], ['印心', '印星'], ['比洁', '比劫'], ['比接', '比劫'],
  ['才星', '财星'], ['材星', '财星'], ['大云', '大运'], ['流连', '流年'], ['流粘', '流年'],
  ['天干地支', '天干地支'], ['干之', '干支'],
  ['人子', '壬子'], ['人午', '壬午'], ['丙武', '丙午'], ['戊土', '戊土'],
  ['甲新', '甲申'], ['甲深', '甲申'], ['乙酉', '乙酉'],
  ['夫妻供', '夫妻宫'], ['夫妻公', '夫妻宫'], ['夫妻功', '夫妻宫'], ['夫妻宫冯聪', '夫妻宫逢冲'],
  ['夫妻宫逢聪', '夫妻宫逢冲'], ['逢冲', '逢冲'],
  ['事业供', '事业宫'], ['命供', '命宫']
];
function bzAsrFix(txt) {
  var s = String(txt == null ? '' : txt);
  if (!BZ_CTX.test(s)) return { text: s, n: 0, pairs: [] };
  var n = 0, pairs = [];
  for (var i = 0; i < BZ_ASR_FIX.length; i++) {
    var a = BZ_ASR_FIX[i][0], b = BZ_ASR_FIX[i][1];
    if (a === b || s.indexOf(a) < 0) continue;
    var c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    if (pairs.length < 8) pairs.push(a + '→' + b);
  }
  return { text: s, n: n, pairs: pairs };
}
function bzAiCfg() {
  try { return JSON.parse(localStorage.getItem(BZ_AI_LS) || '{}') || {}; } catch (e) { return {}; }
}
function bzAiSave(sfKey) {
  localStorage.setItem(BZ_AI_LS, JSON.stringify({ sfKey: sfKey || '', llmKey: '' }));
}
function bzMono16kNorm(blob) {
  var AB = blob.arrayBuffer ? blob.arrayBuffer() : new Promise(function(res, rej) {
    var r = new FileReader(); r.onload = function() { res(r.result); }; r.onerror = rej; r.readAsArrayBuffer(blob);
  });
  var AC = window.AudioContext || window.webkitAudioContext;
  return AB.then(function(buf) { return new AC().decodeAudioData(buf); }).then(function(src) {
    var rate = 16000, len = Math.max(1, Math.ceil(src.duration * rate));
    var oc = new OfflineAudioContext(1, len, rate);
    var s = oc.createBufferSource(); s.buffer = src; s.connect(oc.destination); s.start(0);
    return oc.startRendering();
  }).then(function(out) {
    var ch = out.getChannelData(0), n = ch.length;
    var peak = 0, i;
    for (i = 0; i < n; i++) { var a = Math.abs(ch[i]); if (a > peak) peak = a; }
    if (peak > 0.001 && peak < 0.85) {
      var g = Math.min(0.85 / peak, 8);
      for (i = 0; i < n; i++) ch[i] *= g;
    }
    return { ch: ch, rate: 16000 };
  });
}
function bzEncWav(ch, rate) {
  var n = ch.length;
  var buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, n * 2, true);
  for (var i = 0; i < n; i++) { var x = Math.max(-1, Math.min(1, ch[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7FFF, true); }
  return new Blob([buf], { type: 'audio/wav' });
}
function bzWav16k(blob) {
  return bzMono16kNorm(blob).then(function(o) { return bzEncWav(o.ch, o.rate); });
}
function bzFmtTs(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function bzVadSegs(ch, rate) {
  rate = rate || 16000;
  var win = Math.round(rate * 0.032), hop = Math.round(rate * 0.016), total = ch.length / rate;
  if (ch.length <= win) return total > 0 ? [{ s: 0, e: total }] : [];
  var n = Math.floor((ch.length - win) / hop);
  var rms = new Float32Array(n), i, j;
  for (i = 0; i < n; i++) {
    var sum = 0, off = i * hop;
    for (j = 0; j < win; j++) { var v = ch[off + j]; sum += v * v; }
    rms[i] = Math.sqrt(sum / win);
  }
  var sorted = Array.prototype.slice.call(rms).sort(function(a, b) { return a - b; });
  var nf = sorted[Math.floor(sorted.length * 0.2)] || 0;
  var pk = sorted[sorted.length - 1] || 0;
  var th = Math.max(nf * 2.5, pk * 0.07, 1e-4);
  var spk = [];
  for (i = 0; i < n; i++) if (rms[i] > th) spk.push(i);
  if (!spk.length) return [];
  var gapMerge = Math.round(0.5 / (hop / rate));
  var pad = Math.round(0.12 / (hop / rate));
  var runs = [], rs = spk[0], re = spk[0];
  for (i = 1; i < spk.length; i++) {
    if (spk[i] - re <= gapMerge) re = spk[i];
    else { runs.push([rs, re]); rs = re = spk[i]; }
  }
  runs.push([rs, re]);
  var segs = [];
  for (i = 0; i < runs.length; i++) {
    var s0 = Math.max(0, (runs[i][0] - pad) * hop / rate);
    var e0 = Math.min(total, (runs[i][1] + pad + 1) * hop / rate);
    if (e0 - s0 < 0.25) continue;
    var t = s0;
    while (t < e0 - 0.01) {
      var ne = Math.min(t + 25, e0);
      segs.push({ s: t, e: ne });
      t = ne;
    }
  }
  return segs;
}
function bzAsrSegs(segs, ch, rate, key) {
  var out = new Array(segs.length), idx = 0, used = BZ_ASR_MODEL;
  function worker() {
    if (idx >= segs.length) return Promise.resolve();
    var i = idx++, sg = segs[i];
    var a = Math.max(0, Math.round(sg.s * rate)), b = Math.min(ch.length, Math.round(sg.e * rate));
    function run(md) {
      return b > a ? bzAsr(bzEncWav(ch.subarray(a, b), rate), key, md) : Promise.reject(new Error('空分段'));
    }
    return run(used).catch(function() {
      if (used === BZ_ASR_FALLBACK) return Promise.reject(new Error('fallback fail'));
      used = BZ_ASR_FALLBACK;
      return run(used);
    }).then(function(t) {
      out[i] = { s: sg.s, e: sg.e, t: String(t || '').trim() };
    }).catch(function() {
      out[i] = { s: sg.s, e: sg.e, t: '' };
    }).then(worker);
  }
  var WN = Math.min(3, segs.length) || 1, ps = [], w;
  for (w = 0; w < WN; w++) ps.push(worker());
  return Promise.all(ps).then(function() { return { segs: out, model: used }; });
}
function bzAsr(wavBlob, key, model) {
  var fd = new FormData();
  fd.append('file', wavBlob, 'audio.wav');
  fd.append('model', model || BZ_ASR_MODEL);
  return fetch(BZ_ASR_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd })
    .then(function(r) {
      return r.json().then(function(j) {
        if (!r.ok) throw new Error((j && (j.message || (j.error && j.error.message))) || ('HTTP ' + r.status));
        return j;
      });
    })
    .then(function(j) { return (j.text || '').trim(); });
}
var BZ_LLM_STALL_MS = 60000;
function bzLlm(prompt, key) {
  var tries = 0;
  function once() {
    var ac = new AbortController();
    return fetch(BZ_LLM_BASE + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: BZ_LLM_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 32768, temperature: 0.3, stream: true }),
      signal: ac.signal
    }).then(function(r) {
      if (!r.ok) return r.json().then(function(j) { throw new Error((j && (j.error && j.error.message || j.message)) || ('HTTP ' + r.status)); });
      var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', out = '', last = Date.now();
      var wd = setInterval(function() { if (Date.now() - last > BZ_LLM_STALL_MS) { try { ac.abort(); } catch (e) {} } }, Math.max(2000, BZ_LLM_STALL_MS / 4));
      function pump() {
        return reader.read().then(function(res) {
          last = Date.now();
          if (res.done) { clearInterval(wd); return out; }
          buf += dec.decode(res.value, { stream: true });
          var ls = buf.split('\n'); buf = ls.pop();
          for (var i = 0; i < ls.length; i++) {
            var ln = ls[i].trim();
            if (ln.slice(0, 5) !== 'data:') continue;
            var dt = ln.slice(5).trim();
            if (dt === '[DONE]') continue;
            try {
              var j = JSON.parse(dt);
              var d = j.choices && j.choices[0] && (j.choices[0].delta || j.choices[0].message);
              if (d && d.content) out += d.content;
            } catch (e) {}
          }
          return pump();
        }, function(e) { clearInterval(wd); throw e; });
      }
      return pump();
    }).catch(function(e) {
      var stalled = e && (e.name === 'AbortError' || /abort/i.test(String(e.message || '')));
      if (stalled && tries < 2) { tries++; return once(); }
      if (stalled) throw new Error('整理模型流式停滞，已自动重试 3 次仍无输出（多为高峰期排队），请稍后重试');
      throw e;
    });
  }
  return once().then(function(out) { return String(out).trim(); });
}
function bzPromptOf(clip, raw) {
  var d = window._paipanData || {};
  var chart = '';
  try {
    if (window.ARCHIVE && window.ARCHIVE.syncChartMd) {
      chart = window.ARCHIVE.syncChartMd({ name: d.name, gender: d.gender, year: d.y, month: d.m, day: d.d, hour: d.h, min: d.mi });
    }
  } catch (e) {}
  if (chart.length > 3500) chart = chart.slice(0, 3500) + '\n…（已截断）';
  return [
    '你是八字命理分析师的录音稿编辑。下面是同一段录音的「盘面资料」和「语音识别逐段文字」（每行 [时:分:秒] 是该句在录音中的开始时间）。请整理成高质量分析录音稿：',
    '1. 只修正语音识别的错别字与断句（尤其命理术语：十神、食伤、官杀、印星、比劫、财星、宫位、大运、流年、天干地支名），不改原意，不增删观点，不添加录音里没有的内容；',
    '2. 口语顺成可读书面语，保留讲解的条理；',
    '3. 输出 markdown，格式固定，依次为：先一段 3-5 句「总述」概括这段录音讲了什么（包含核心结论与整体脉络）；',
    '3a. 空一行；「## 要点」，每行一条「- **要点标题**：细节」，共 12-25 条，必须覆盖录音中全部实质性内容、不漏任何一个话题——每条写足 3-6 句，把分析的理由、盘面对照依据（哪个宫位、哪柱何字、何十神、大运流年如何作用）、推出的结论、给案主举的例子与关键原话都完整写出来，具像到具体的人、事、物、数字与日期，宁多勿漏，不得只写半句概括；',
    '3b. 空一行；「## 章节时间线」，每行一条「- [时:分:秒] 小标题：具体内容」（3-10 条，时间用该章节第一句的时间戳），每条具体内容用 2-4 句还原该章节实际讲了什么——提到的具体宫位、干支、大运流年、判断与依据、给对方的建议都要写进去，不许只写一句话概括（整段录音不足 1 分钟时可省略此节）；',
    '3c. 空一行；「## 金句」，0-3 条录音里的原话（每行「- 」+ 原句，长句可截核心）；',
    '3d. 空一行；「## 解读的思路与步骤」，按录音时序逐步还原整个解读过程，从开场第一个动作到收尾：每一步单独一行「- **第N步·小标题**：…」，写清先看盘面的什么→为什么看它→从哪个宫位/干支/十神推出什么→当时是怎么向案主表达的（尽量引原话）→案主有什么反应或追问；解读细节全部写出来，让没听过录音的人照着文字就能复盘整个思路、学会这套解法；',
    '3e. 空一行；「## 规划的结果以及原理」，把录音中给出的全部规划、建议、判断结论逐条列出，每行一条「- **结论/建议**：内容写具像可执行＋命理原理写由盘面哪个结构怎么推出来的＋预期与时间线写何时应验、多大程度、前提条件」，录音里没有给出规划的写「本次录音未给出具体规划」；',
    '4. 两个章节「解读的思路与步骤」与「规划的结果以及原理」是重点输出，篇幅不设上限，宁可长不可略。除此之外不要输出任何额外说明、前后缀或代码块标记。',
    '知识库术语参考：' + BZ_KB_LINES,
    '',
    '【盘面资料】',
    chart || '（无盘面）',
    '',
    '【语音识别逐段文字】',
    raw
  ].join('\n');
}
// ===== v0.83.6 咨询人物：默认「邦顺、案主」，可编辑加人，录音稿与说话人归属都按这份名单 =====
function recPeopleDefault() { return '邦顺、案主'; }
function recPeopleNorm(s) {
  var arr = String(s == null ? '' : s).split(/[、,，;；\/|]+|\s{2,}/);
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    var t = arr[i].replace(/^\s+|\s+$/g, '');
    if (t && out.indexOf(t) < 0) out.push(t);
  }
  return out.length ? out.join('、') : recPeopleDefault();
}
function recPeopleOf(clip) {
  return recPeopleNorm(clip && clip.people ? clip.people : recPeopleDefault());
}
function recPeopleOthers(clip) {
  var list = recPeopleOf(clip).split('、');
  var out = [];
  for (var i = 0; i < list.length; i++) if (list[i] !== '邦顺') out.push(list[i]);
  return out;
}
function recModelShort(m) {
  var s = String(m || '').split('/').pop();
  return s.replace(/-Instruct-.*$/, '');
}
function recModelsOf(clip) {
  var t = clip && clip.transcript;
  var mm = (t && t.models) || {};
  if (mm.llm) return { asr: mm.asr || BZ_ASR_MODEL, llm: mm.llm, src: mm.src || 'snap' };
  var oldAsr = (t && t.ts && t.ts < BZ_ASR_SWITCH_TS) ? BZ_ASR_PREV : BZ_ASR_MODEL;
  if (t && t.ts && t.ts < BZ_LLM_SWITCH_TS) return { asr: BZ_ASR_PREV, llm: BZ_LLM_PREV, src: 'guess' };
  if (t && t.ts && t.ts < BZ_LLM_SWITCH_TS2) return { asr: oldAsr, llm: BZ_LLM_PREV2, src: 'guess' };
  return { asr: oldAsr, llm: BZ_LLM_MODEL, src: 'cur' };
}
function recModelSrcNote(m) {
  if (m.src === 'guess') {
    if (m.llm === BZ_LLM_PREV2) return '（推定：这次转录早于 2026-10-28 切换 DeepSeek-V4-Flash，当时整理用 Qwen3-235B）';
    return '（推定：这次转录早于 2026-10-26 07:43 的模型升级，当时未记录模型名）';
  }
  if (m.src === 'md') return '（从归档录音稿 md 头部读回的真实记录）';
  if (m.src === 'cur') return '（未留模型名，按当前模型显示）';
  return '';
}
function recModelTitleOf(clip) {
  var m = recModelsOf(clip);
  return '识别：' + m.asr + '｜整理与说话人归属：' + m.llm + recModelSrcNote(m);
}
function recModelLineHtml(clip) {
  if (!clip || !clip.transcript) return '';
  var m = recModelsOf(clip);
  return '<span class="rz-model" title="' + bzEsc(recModelTitleOf(clip)) + '">🧠 ' + bzEsc(recModelShort(m.asr)) + ' · ' + bzEsc(recModelShort(m.llm)) + (m.src === 'guess' ? '（推定）' : '') + '</span>';
}
function recParseMdModels(txt) {
  var s = String(txt || '');
  var m2 = s.match(/识别：(\S+)\s*｜\s*整理\/归属：(\S+)/);
  if (m2) return { asr: m2[1], llm: m2[2], src: 'md' };
  var m1 = s.match(/整理：(\S+)/);
  if (m1) return { asr: BZ_ASR_PREV, llm: m1[1], src: 'md' };
  return null;
}
function recModelBackfill(clip) {
  var t = clip && clip.transcript;
  if (!t || (t.models && t.models.llm) || clip._mdChecked) return Promise.resolve(false);
  clip._mdChecked = true;
  if (!window.ARCHIVE || !window.ARCHIVE.syncReadText) return Promise.resolve(false);
  var nm = clip.tfname || bzTfName(clip);
  return window.ARCHIVE.syncReadText('录音稿', nm).then(function(txt) {
    var got = recParseMdModels(txt);
    if (!got) return false;
    t.models = got;
    return recAudioPut(clip).then(function() { return true; }).catch(function() { return true; });
  }).catch(function() { return false; });
}
function bzTfName(clip) {
  return (window._paipanData && window._paipanData.name ? window._paipanData.name + '-' : '')
    + '录音稿-' + clip.name.replace(' ', '_').replace(':', '-') + '.md';
}
var BZ_NFFT = 512, BZ_MEL = 26, BZ_MELBANK = null;
function bzFft(re, im) {
  var n = re.length, i, j = 0, bit, t, len, half, ang, wr, wi, cr, ci, ur, ui, vr, vi, ncr, k;
  for (i = 1; i < n; i++) {
    bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (len = 2; len <= n; len <<= 1) {
    half = len >> 1; ang = -2 * Math.PI / len; wr = Math.cos(ang); wi = Math.sin(ang);
    for (i = 0; i < n; i += len) {
      cr = 1; ci = 0;
      for (k = 0; k < half; k++) {
        ur = re[i + k]; ui = im[i + k];
        vr = re[i + k + half] * cr - im[i + k + half] * ci;
        vi = re[i + k + half] * ci + im[i + k + half] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + half] = ur - vr; im[i + k + half] = ui - vi;
        ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}
function bzMelBank() {
  if (BZ_MELBANK) return BZ_MELBANK;
  var sr = 16000, nfft = BZ_NFFT, bank = [], pts = [], i, k, m, a, b, c, v;
  function toMel(f) { return 2595 * Math.log(1 + f / 700) / Math.LN10; }
  function toHz(x) { return 700 * (Math.pow(10, x / 2595) - 1); }
  var lo = toMel(80), hi = toMel(sr / 2);
  for (i = 0; i < BZ_MEL + 2; i++) pts.push(toHz(lo + (hi - lo) * i / (BZ_MEL + 1)) * nfft / sr);
  for (m = 1; m <= BZ_MEL; m++) {
    a = pts[m - 1]; b = pts[m]; c = pts[m + 1];
    var f = [];
    for (k = 0; k <= nfft / 2; k++) {
      v = 0;
      if (k >= a && k <= b) v = (k - a) / Math.max(1e-9, b - a);
      else if (k > b && k <= c) v = (c - k) / Math.max(1e-9, c - b);
      f.push(v);
    }
    bank.push(f);
  }
  BZ_MELBANK = bank;
  return bank;
}
function bzVoiceFeat(ch, rate, segs) {
  var bank = bzMelBank(), nfft = BZ_NFFT, hop = Math.round(rate * 0.02), dim = 12;
  var dct = [], c, m, i, j;
  for (c = 1; c <= dim; c++) { var row = []; for (m = 0; m < BZ_MEL; m++) row.push(Math.cos(Math.PI * c * (m + 0.5) / BZ_MEL)); dct.push(row); }
  var feats = [];
  for (i = 0; i < segs.length; i++) {
    var a = Math.round(segs[i].s * rate), b = Math.min(ch.length, Math.round(segs[i].e * rate));
    var nf = Math.floor((b - a - nfft) / hop);
    if (nf < 8) { feats.push(null); continue; }
    var step = Math.max(1, Math.floor(nf / 120)), acc = new Float64Array(dim), cnt = 0;
    for (var t = a; t + nfft < b; t += hop * step) {
      var re = new Float64Array(nfft), im = new Float64Array(nfft), en = 0, v2;
      for (j = 0; j < nfft; j++) { v2 = ch[t + j] * (0.54 - 0.46 * Math.cos(2 * Math.PI * j / (nfft - 1))); re[j] = v2; en += v2 * v2; }
      if (en / nfft < 1e-6) continue;
      bzFft(re, im);
      var pw = [], logs = [], k2;
      for (k2 = 0; k2 <= nfft / 2; k2++) pw.push(re[k2] * re[k2] + im[k2] * im[k2]);
      for (m = 0; m < BZ_MEL; m++) { var s2 = 0; for (k2 = 0; k2 <= nfft / 2; k2++) s2 += pw[k2] * bank[m][k2]; logs.push(Math.log(Math.max(s2, 1e-10))); }
      for (c = 0; c < dim; c++) { var s3 = 0; for (m = 0; m < BZ_MEL; m++) s3 += logs[m] * dct[c][m]; acc[c] += s3; }
      cnt++;
    }
    if (cnt < 10) { feats.push(null); continue; }
    for (c = 0; c < dim; c++) acc[c] /= cnt;
    feats.push(acc);
  }
  return feats;
}
function bzVoiceClus(feats, segs) {
  var dim = 12, use = [], i, j, q;
  for (i = 0; i < feats.length; i++) if (feats[i]) use.push(i);
  if (use.length < 4) return null;
  var mu = new Float64Array(dim), sd = new Float64Array(dim);
  for (i = 0; i < use.length; i++) for (j = 0; j < dim; j++) mu[j] += feats[use[i]][j] / use.length;
  for (i = 0; i < use.length; i++) for (j = 0; j < dim; j++) sd[j] += Math.pow(feats[use[i]][j] - mu[j], 2) / use.length;
  var Z = use.map(function(ix) {
    var f = feats[ix], z = new Float64Array(dim);
    for (var t = 0; t < dim; t++) z[t] = (f[t] - mu[t]) / (Math.sqrt(sd[t]) || 1);
    return z;
  });
  var best = null;
  for (var tr = 0; tr < 6; tr++) {
    var cts = [Z[tr % Z.length].slice(0), Z[(tr * 7 + 1) % Z.length].slice(0)], lab = new Array(Z.length).fill(0), it;
    for (it = 0; it < 25; it++) {
      for (i = 0; i < Z.length; i++) {
        var d0 = 0, d1 = 0;
        for (j = 0; j < dim; j++) { d0 += Math.pow(Z[i][j] - cts[0][j], 2); d1 += Math.pow(Z[i][j] - cts[1][j], 2); }
        lab[i] = d0 <= d1 ? 0 : 1;
      }
      for (q = 0; q < 2; q++) {
        var mem = [], s4;
        for (i = 0; i < Z.length; i++) if (lab[i] === q) mem.push(Z[i]);
        if (!mem.length) continue;
        for (j = 0; j < dim; j++) { s4 = 0; for (i = 0; i < mem.length; i++) s4 += mem[i][j]; cts[q][j] = s4 / mem.length; }
      }
    }
    var inert = 0;
    for (i = 0; i < Z.length; i++) for (j = 0; j < dim; j++) inert += Math.pow(Z[i][j] - cts[lab[i]][j], 2);
    var n0 = lab.filter(function(v) { return v === 0; }).length;
    if (n0 && n0 < Z.length && (!best || inert < best.inert)) best = { lab: lab, inert: inert, cts: cts };
  }
  if (!best) return null;
  var out = new Array(segs.length).fill(-1), groups = [[], []];
  for (i = 0; i < use.length; i++) { out[use[i]] = best.lab[i]; groups[best.lab[i]].push(use[i]); }
  for (i = 0; i < out.length; i++) {
    if (out[i] >= 0) continue;
    var pivot = -1, pd = 1e9;
    for (j = 0; j < out.length; j++) {
      if (out[j] < 0) continue;
      var dd = Math.min(Math.abs(segs[j].s - segs[i].s), Math.abs(segs[j].e - segs[i].e));
      if (dd < pd) { pd = dd; pivot = j; }
    }
    out[i] = pivot < 0 ? 0 : out[pivot];
  }
  return { lab: out, groups: groups, n: use.length };
}
function bzF0OfSeg(ch, rate, s0, e0) {
  var ds = 2, sr = Math.round(rate / ds);
  var a = Math.round(s0 * rate), b = Math.min(ch.length, Math.round(e0 * rate));
  b = Math.min(b, a + Math.round(sr * 1.5) * ds);
  var n = Math.floor((b - a) / ds), i;
  if (n < 600) return null;
  var x = new Float32Array(n);
  for (i = 0; i < n; i++) x[i] = (ch[a + i * ds] + ch[a + i * ds + 1]) / 2;
  var win = 512, hop = 256, minLag = Math.floor(sr / 400), maxLag = Math.floor(sr / 70);
  if (n < win + maxLag) return null;
  var vals = [], rs = new Float32Array(maxLag + 2);
  for (var t = 0; t + win + maxLag < n; t += hop) {
    var en = 0;
    for (i = 0; i < win; i++) en += x[t + i] * x[t + i];
    if (en < 0.04) continue;
    var best = 0;
    for (var lag = minLag; lag <= maxLag; lag++) {
      var sxy = 0, sxx = 0, syy = 0, vx, vy;
      for (i = 0; i < win; i++) { vx = x[t + i]; vy = x[t + i + lag]; sxy += vx * vy; sxx += vx * vx; syy += vy * vy; }
      var r = sxy / (Math.sqrt(sxx * syy) || 1);
      rs[lag] = r;
      if (r > best) best = r;
    }
    if (best < 0.5) continue;
    var pick = 0;
    for (lag = minLag + 1; lag < maxLag; lag++) {
      if (rs[lag] >= best * 0.9 && rs[lag] >= rs[lag - 1] && rs[lag] >= rs[lag + 1]) { pick = lag; break; }
    }
    if (pick) vals.push(sr / pick);
  }
  if (vals.length < 4) return null;
  vals.sort(function(p, q) { return p - q; });
  var med = vals[Math.floor(vals.length / 2)], sdv = 0;
  for (i = 0; i < vals.length; i++) sdv += Math.pow(vals[i] - med, 2);
  return { f0: med, sd: Math.sqrt(sdv / vals.length), n: vals.length };
}
function bzSpkSplit(ch, rate, segs) {
  var fs = [], i, k;
  for (i = 0; i < segs.length; i++) {
    var v = null;
    try { v = bzF0OfSeg(ch, rate, segs[i].s, segs[i].e); } catch (e) { v = null; }
    fs.push(v);
  }
  var use = [];
  for (i = 0; i < fs.length; i++) if (fs[i]) use.push(i);
  if (use.length < 6) return null;
  var th = 165, g = [[], []], vv = [[], []];
  for (i = 0; i < use.length; i++) {
    var l = fs[use[i]].f0 < th ? 0 : 1;
    g[l].push(use[i]); vv[l].push(fs[use[i]].f0);
  }
  if (g[0].length < 3 || g[1].length < 3) return null;
  var med = [];
  for (k = 0; k < 2; k++) {
    vv[k].sort(function(p, q) { return p - q; });
    med.push(vv[k][Math.floor(vv[k].length / 2)]);
  }
  if (!(med[0] <= 150 && med[1] >= 170 && med[1] - med[0] >= 40)) return null;
  var out = new Array(segs.length).fill(-1);
  for (i = 0; i < use.length; i++) out[use[i]] = fs[use[i]].f0 < th ? 0 : 1;
  for (i = 0; i < out.length; i++) {
    if (out[i] >= 0) continue;
    var pv = -1, pd = 1e9, dd;
    for (k = 0; k < out.length; k++) {
      if (out[k] < 0) continue;
      dd = Math.min(Math.abs(segs[k].s - segs[i].s), Math.abs(segs[k].e - segs[i].e));
      if (dd < pd) { pd = dd; pv = k; }
    }
    out[i] = pv < 0 ? 0 : out[pv];
  }
  return { lab: out, groups: g, n: use.length, th: th, d: med[1] - med[0], mode: 'f0' };
}
function bzSpkPrompt(segs, pdName, people, vc) {
  var others = recPeopleOthers({ people: people });
  var otherTxt = others.length ? others.join('、') : '对方';
  var hasVc = !!(vc && vc.groups && vc.groups[0].length && vc.groups[1].length);
  var L = ['下面是同一段录音的逐段语音识别结果（[序号] [开始时间] 文字）。录音的人是邦顺（命理分析师，录音主导者）'
    + (others.length ? '，本次咨询的其他人：' + otherTxt + (pdName ? '（其中「案主」即本次命盘主人「' + pdName + '」）' : '') : '') + '。请逐段判断该段是谁说的。',
    '规则：1. 独白讲解、分析、下结论的段落标「邦顺」；',
    others.length
      ? '2. 其他人提问、回应、补充信息的段落，标最贴合的具体人名，只能从这些名字里选：' + otherTxt + '；'
      : '2. 明显不是邦顺本人的插话、提问标「对方」；',
    '3. 拿不准的一律标「邦顺」；',
    hasVc ? '4. 末尾【声学分组】是按嗓音高低（基频）分的：A 组嗓音低（男声，通常就是邦顺本人），B 组嗓音高（女性说话人）。同一组里可能有不止一个人——现场若有两位女性，它们都会落在 B 组，请按内容分辨；分不清就统一标同一个名字，不要臆造第三人。' : '',
    (hasVc ? '5' : '4') + '. 只输出 JSON 数组，格式 [{"i":0,"s":"邦顺"},{"i":1,"s":"' + (others[0] || '对方') + '"}]，不要任何其他文字或代码块标记。',
    '', '【逐段识别文字】'];
  var cap = Math.min(segs.length, 160);
  for (var i = 0; i < cap; i++) L.push('[' + i + '] [' + bzFmtTs(segs[i].s) + '] ' + segs[i].t);
  if (hasVc) {
    var ga = [], gb = [];
    for (var t2 = 0; t2 < vc.lab.length && t2 < cap; t2++) (vc.lab[t2] === 0 ? ga : gb).push(t2);
    L.push('', '【声学分组】A 组段号：' + (ga.join(',') || '无'), 'B 组段号：' + (gb.join(',') || '无'));
  }
  return L.join('\n');
}
function bzParseSpk(txt, n) {
  var spk = [];
  try {
    var m = String(txt || '').match(/\[[\s\S]*\]/);
    if (m) {
      var arr = JSON.parse(m[0]);
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] && typeof arr[i].i === 'number' && arr[i].s) spk[arr[i].i] = String(arr[i].s).slice(0, 12);
      }
    }
  } catch (e) {}
  for (var j = 0; j < n; j++) if (!spk[j]) spk[j] = '邦顺';
  return spk;
}
var BZ_SPK_COLORS = ['#8a5a2b', '#2f6fed', '#0a7d33', '#7a4ea3', '#2b8a8a', '#a83a5c', '#b0682c'];
function bzSpkColor(who) {
  var h = 0, s = String(who || '');
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return BZ_SPK_COLORS[h % BZ_SPK_COLORS.length];
}
function bzDialogHtml(segs, spk) {
  var h = '';
  for (var i = 0; i < segs.length; i++) {
    var sg = segs[i];
    if (!sg.t) continue;
    var who = (spk && spk[i]) || '邦顺';
    h += '<div class="rz-seg"><div class="rz-seg-head">'
      + '<span class="rz-seg-avatar" style="background:' + bzSpkColor(who) + ';">' + bzEsc(who.slice(0, 1)) + '</span>'
      + '<span class="rz-seg-spk">' + bzEsc(who) + '</span>'
      + '<span class="rz-seg-ts" data-s="' + Math.round(sg.s) + '" onclick="RENDER.recZoneSeekTs(this)" title="点此跳播放">⏵ ' + bzFmtTs(sg.s) + '</span></div>'
      + '<div class="rz-seg-txt">' + bzEsc(sg.t) + '</div></div>';
  }
  return h || '<div class="rz-empty">未识别出语音内容</div>';
}
function bzTranscriptMd(clip, answer, raw) {
  var d = window._paipanData || {};
  var L = [];
  L.push('# 录音稿 · ' + clip.name + (d.name ? '（' + d.name + '）' : ''));
  L.push('');
  var mm = recModelsOf(clip);
  L.push('> 咨询人物：' + recPeopleOf(clip) + ' ｜ 来源：排盘录音自动转录 ｜ 时长：' + recAudioFmt(clip.dur) + ' ｜ 识别：' + mm.asr + ' ｜ 整理/归属：' + mm.llm + ' ｜ ' + new Date(clip.ts).toLocaleString());
  L.push('');
  L.push(answer);
  var tr = clip.transcript;
  if (tr && tr.fix && tr.fix.n) {
    L.push('');
    L.push('> 术语纠错：' + tr.fix.n + ' 处' + (tr.fix.pairs && tr.fix.pairs.length ? '（' + tr.fix.pairs.join('、') + '）' : '') + '，原始识别原文见文末「原始识别」');
  }
  if (tr && tr.segs && tr.segs.length) {
    L.push('');
    L.push('## 对话还原');
    L.push('');
    for (var i = 0; i < tr.segs.length; i++) {
      var sg = tr.segs[i];
      if (!sg.t) continue;
      L.push('[' + bzFmtTs(sg.s) + '] ' + ((tr.spk && tr.spk[i]) || '邦顺') + '：' + sg.t);
    }
  }
  L.push('');
  L.push('## 原始识别');
  L.push('');
  L.push(raw);
  L.push('');
  if (clip.prev && clip.prev.length) {
    L.push('## 历史转录（旧模型，重转前的版本）');
    L.push('');
    for (var pi = clip.prev.length - 1; pi >= 0; pi--) {
      var pv = clip.prev[pi];
      var pmm = pv.models || {};
      L.push('### ' + new Date(pv.ts || 0).toLocaleString() + ' ｜ 识别：' + (pmm.asr || '未知') + ' ｜ 整理：' + (pmm.llm || '未知'));
      L.push('');
      L.push(String(pv.text || ''));
      L.push('');
    }
  }
  return L.join('\n');
}
function transcribeClip(clip, panel) {
  var cfg = bzAiCfg();
  if (!cfg.sfKey) {
    if (panel) recStatusShow(panel, '未配置转录 API Key，点条目📝可配置', true);
    recTfToast('还没配置转录 API Key', clip, panel);
    return Promise.resolve(false);
  }
  if (clip._tfBusy) return Promise.resolve(false);
  clip._tfBusy = true;
  if (panel) recStatusShow(panel, '转录中…（' + clip.name + '）');
  var EMPTY_MSG = '未识别出语音内容——离麦太远或音量太小，建议靠近手机/麦克风再录一次';
  var asrUsed = BZ_ASR_MODEL, asrFixN = 0, audio = null;
  return bzMono16kNorm(clip.blob)
    .then(function(o) {
      audio = o;
      var segs0 = bzVadSegs(o.ch, o.rate);
      if (!segs0.length) throw new Error(EMPTY_MSG);
      if (panel) recStatusShow(panel, '分段识别中…（' + segs0.length + ' 段 · ' + recModelShort(BZ_ASR_MODEL) + '）');
      return bzAsrSegs(segs0, o.ch, o.rate, cfg.sfKey);
    })
    .then(function(ar) {
      var segs = ar.segs;
      asrUsed = ar.model || BZ_ASR_MODEL;
      if (!segs.filter(function(x) { return x.t; }).length) throw new Error(EMPTY_MSG);
      var raw = segs.filter(function(x) { return x.t; }).map(function(x) { return x.t; }).join('');
      var fixN = 0, fixPairs = [];
      var tsTxt = segs.filter(function(x) { return x.t; }).map(function(x) {
        var f = bzAsrFix(x.t);
        fixN += f.n;
        for (var k = 0; k < f.pairs.length && fixPairs.length < 8; k++) if (fixPairs.indexOf(f.pairs[k]) < 0) fixPairs.push(f.pairs[k]);
        return '[' + bzFmtTs(x.s) + '] ' + f.text;
      }).join('\n');
      asrFixN = fixN;
      var pdName = window._paipanData && window._paipanData.name || '';
      var vc = null;
      try { if (audio) vc = bzSpkSplit(audio.ch, audio.rate, segs); } catch (e) { vc = null; }
      var pSpk = segs.length > 1
        ? bzLlm(bzSpkPrompt(segs, pdName, clip.people, vc), cfg.sfKey).then(function(a) { return bzParseSpk(a, segs.length); }).catch(function() { return null; })
        : Promise.resolve(null);
      return Promise.all([bzLlm(bzPromptOf(clip, tsTxt), cfg.sfKey), pSpk]).then(function(rs) {
        return { segs: segs, raw: raw, ans: rs[0], spk: rs[1], fix: { n: fixN, pairs: fixPairs } };
      });
    })
    .then(function(r) {
      clip._tfBusy = false;
      clip.transcript = { text: r.ans, raw: r.raw, segs: r.segs, spk: r.spk, fix: r.fix, ts: Date.now(), models: { asr: asrUsed, llm: BZ_LLM_MODEL } };
      clip.tfname = clip.tfname || bzTfName(clip);
      var md = bzTranscriptMd(clip, r.ans, r.raw);
      try {
        if (window.ARCHIVE && window.ARCHIVE.syncWriteBlob) {
          window.ARCHIVE.syncWriteBlob('录音稿', clip.tfname, new Blob([md], { type: 'text/markdown' }));
        }
      } catch (e) {}
      return recAudioPut(clip);
    })
    .then(function() {
      if (panel) recStatusShow(panel, '转录完成：' + clip.name + '（' + recModelShort(asrUsed) + ' + ' + recModelShort(BZ_LLM_MODEL) + '）' + (asrFixN ? ' · 术语纠错 ' + asrFixN + ' 处' : ''));
      bzShowTranscript(clip);
      return recAudioList(clip.key);
    })
    .then(function(list) { if (panel) renderRecAudioList(panel, list); return true; })
    .then(function(ok) { clip._tfBusy = false; return ok; })
    .catch(function(e) {
      clip._tfBusy = false;
      var msg = '录音「' + clip.name + '」转录失败：' + (e && e.message || e);
      if (panel) recStatusShow(panel, '转录失败：' + (e && e.message || e), true);
      recTfToast(msg, clip, panel);
      return false;
    });
}
function recTfToast(msg, clip, panel) {
  var old = document.getElementById('bzTfToast');
  if (old) old.remove();
  var t = document.createElement('div');
  t.id = 'bzTfToast';
  t.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99995;background:#2b2f36;color:#fff;padding:12px 16px;border-radius:10px;font-size:13px;line-height:1.6;box-shadow:0 6px 24px rgba(0,0,0,.25);max-width:340px;';
  t.innerHTML = '<div style="margin-bottom:' + (clip ? '8' : '0') + 'px;">🎙 ' + msg + '</div>'
    + (clip ? '<button id="bzTfRetry" type="button" style="padding:5px 12px;border:0;background:#2f6fed;color:#fff;border-radius:6px;cursor:pointer;">🔄 重试转录</button>' : '');
  document.body.appendChild(t);
  if (clip) document.getElementById('bzTfRetry').onclick = function() { t.remove(); transcribeClip(clip, panel); };
  setTimeout(function() { if (t.parentNode) t.remove(); }, 12000);
}
function bzEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function bzAiSettings(panel, clip) {
  var old = document.getElementById('bzAiOverlay');
  if (old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'bzAiOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99990;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:12px;padding:20px 22px;width:min(92vw,420px);font-size:14px;line-height:1.6;color:#333;';
  box.innerHTML = '<div style="font-weight:700;margin-bottom:10px;">转录设置（只保存在本机浏览器）</div>'
    + '<label style="display:block;margin:8px 0 4px;">SiliconFlow API Key（语音转文字 + 稿件整理）</label>'
    + '<input id="bzAiSfKey" type="password" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #ddd;border-radius:8px;">'
    + '<div style="margin-top:14px;text-align:right;">'
    + '<button id="bzAiCancel" type="button" style="padding:7px 14px;border:1px solid #ddd;background:#fff;border-radius:8px;margin-right:8px;">取消</button>'
    + '<button id="bzAiOk" type="button" style="padding:7px 14px;border:0;background:#2f6fed;color:#fff;border-radius:8px;">保存</button></div>';
  ov.appendChild(box);
  document.body.appendChild(ov);
  var c = bzAiCfg();
  document.getElementById('bzAiSfKey').value = c.sfKey || '';
  document.getElementById('bzAiCancel').onclick = function() { ov.remove(); };
  ov.onclick = function(e) { if (e.target === ov) ov.remove(); };
  document.getElementById('bzAiOk').onclick = function() {
    bzAiSave(document.getElementById('bzAiSfKey').value.trim());
    ov.remove();
    if (panel) recStatusShow(panel, '转录设置已保存');
    if (clip) transcribeClip(clip, panel);
  };
}
function bzShowTranscript(clip) {
  var old = document.getElementById('bzTfOverlay');
  if (old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'bzTfOverlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99990;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:12px;padding:18px 20px;width:min(94vw,640px);max-height:82vh;overflow:auto;font-size:14px;line-height:1.7;color:#333;';
  box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    + '<b>' + bzEsc(clip.name) + ' · 转录稿</b>'
    + '<span><a href="#" id="bzTfCopy" style="margin-right:10px;">复制</a><a href="#" id="bzTfClose">关闭</a></span></div>'
    + '<pre id="bzTfBody" style="white-space:pre-wrap;word-break:break-word;background:#f7f8fa;border-radius:8px;padding:12px;margin:0;font-family:inherit;">'
    + bzEsc(clip.transcript.text) + '</pre>';
  ov.appendChild(box);
  document.body.appendChild(ov);
  ov.onclick = function(e) { if (e.target === ov || e.target.id === 'bzTfClose') { e.preventDefault(); ov.remove(); } };
  document.getElementById('bzTfCopy').onclick = function(e) {
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(clip.transcript.text);
  };
}
function bzViewTranscript(btn) {
  var panel = btn.closest('.record-panel');
  var item = btn.closest('.rec-audio-item');
  if (!panel || !item) return;
  var clip = panel._raClips && panel._raClips[item.getAttribute('data-id')];
  if (!clip) return;
  if (!clip.transcript) { transcribeClip(clip, panel); return; }
  bzShowTranscript(clip);
}
function recAudioResetBtn(panel) {
  panel._raRec = null; panel._raExpectStop = false;
  if (panel._raG) { panel._raG.stop(); panel._raG = null; }
  clearInterval(panel._raTimer);
  var btn = panel.querySelector('.rec-audio-btn');
  if (btn) { btn.textContent = '● 录音'; btn.classList.remove('recording'); }
  var tEl = panel.querySelector('.rec-audio-timer');
  if (tEl) tEl.textContent = '';
}
// ===== v0.85.1 录音锁定内置麦克风 + 静音守卫 =====
var REC_MIC_BLOCK = /blackhole|virtual|虚拟|aggregate|soundflower|loopback|doubao|豆包|oray|ishot|miaowa|iphone|ipad|airpods|bluetooth|蓝牙|display/i;
var REC_MIC_BUILTIN = /built-?in|内置|macbook.*(麦克风|microphone)|imac.*(麦克风|microphone)/i;
function recMicIsMine(label) {
  var lb = String(label || '');
  if (!lb || REC_MIC_BLOCK.test(lb)) return false;
  return REC_MIC_BUILTIN.test(lb);
}
function recMicOpen() {
  var md = navigator.mediaDevices;
  return md.getUserMedia({ audio: true }).then(function(probe) {
    return md.enumerateDevices().then(function(list) {
      var mics = (list || []).filter(function(d) { return d.kind === 'audioinput'; });
      var chosen = null;
      for (var i = 0; i < mics.length; i++) if (recMicIsMine(mics[i].label)) { chosen = mics[i]; break; }
      var tr = probe.getAudioTracks()[0];
      var curLabel = tr ? (tr.label || '') : '';
      if (!chosen || recMicIsMine(curLabel)) {
        return { stream: probe, label: curLabel || (chosen && chosen.label) || '默认麦克风', locked: !!recMicIsMine(curLabel) };
      }
      try { probe.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {}
      return md.getUserMedia({ audio: { deviceId: { exact: chosen.deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .then(function(s) {
          var t2 = s.getAudioTracks()[0];
          return { stream: s, label: (t2 && t2.label) || chosen.label || '内置麦克风', locked: true };
        }).catch(function() {
          return md.getUserMedia({ audio: true }).then(function(s) {
            var t3 = s.getAudioTracks()[0];
            return { stream: s, label: (t3 && t3.label) || '默认麦克风', locked: false };
          });
        });
    });
  });
}
function recAlarmBeep(ctx) {
  if (!ctx) return;
  try {
    for (var i = 0; i < 3; i++) {
      var t0 = ctx.currentTime + i * 0.32;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + 0.2);
    }
  } catch (e) {}
}
function recMicGuard(stream, onSilent) {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  var ctx, an;
  try {
    ctx = new AC();
    if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    an = ctx.createAnalyser();
    an.fftSize = 1024;
    var src = ctx.createMediaStreamSource(stream);
    var sink = ctx.createGain();
    sink.gain.value = 0;
    src.connect(an); an.connect(sink); sink.connect(ctx.destination);
  } catch (e) {
    try { ctx && ctx.close(); } catch (e2) {}
    return null;
  }
  var buf = new Uint8Array(an.fftSize);
  var total = 0, silent = 0, streak = 0, fired = 0;
  var timer = setInterval(function() {
    var rms = 0;
    try {
      an.getByteTimeDomainData(buf);
      var sum = 0;
      for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
      rms = Math.sqrt(sum / buf.length);
    } catch (e) { return; }
    total += 3;
    if (rms < 0.004) { silent += 3; streak += 3; } else { streak = 0; }
    if (streak >= 18 && (fired === 0 || streak - fired >= 60)) { fired = streak; onSilent(streak, ctx); }
  }, 3000);
  return {
    stop: function() { clearInterval(timer); try { ctx.close(); } catch (e) {} },
    stat: function() { return { total: total, silent: silent }; }
  };
}
function recWatchAlert(panel, text, ctx) {
  if (!panel) return;
  var st = panel.querySelector('.rec-status');
  if (st) {
    st.textContent = text;
    st.classList.add('show');
    st.style.color = '#c0392b';
    st.style.fontWeight = '700';
    clearTimeout(st._t);
  }
  var now = Date.now();
  if (panel._raAlertAt && now - panel._raAlertAt < 20000) return;
  panel._raAlertAt = now;
  recAlarmBeep(ctx);
}
function recSilentVerdict(gstat) {
  if (!gstat || gstat.total < 30) return false;
  return gstat.silent >= gstat.total * 0.7;
}

function recAudioToggle(btn) {
  var panel = btn.closest('.record-panel');
  if (!panel) return;
  if (panel._raRec) {
    if (panel._raRec.state === 'recording') { panel._raExpectStop = true; try { panel._raRec.stop(); } catch (e) {} return; }
    recAudioResetBtn(panel);
    recStatusShow(panel, '检测到上次录音已中断，重新开始', true);
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    recStatusShow(panel, '当前环境不支持录音', true); return;
  }
  var au = panel.querySelector('.rec-audio');
  var suffix = au ? (au.getAttribute('data-suffix') || '') : '';
  var k = recAudioKey(suffix);
  if (!k) { recStatusShow(panel, '请先排盘再录音', true); return; }
  recMicOpen().then(function(mic) {
    var stream = mic.stream;
    var mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    var mime = '';
    for (var i = 0; i < mimes.length; i++) {
      if (MediaRecorder.isTypeSupported(mimes[i])) { mime = mimes[i]; break; }
    }
    var mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    var chunks = [];
    var done = false;
    function finalize(interrupted) {
      if (done) return;
      done = true;
      panel._raExpectStop = false;
      var gstat = null;
      if (panel._raG) { gstat = panel._raG.stat(); panel._raG.stop(); panel._raG = null; }
      try { stream.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {}
      clearInterval(panel._raTimer);
      panel._raRec = null;
      btn.textContent = '● 录音'; btn.classList.remove('recording');
      var tEl = panel.querySelector('.rec-audio-timer');
      if (tEl) tEl.textContent = '';
      if (!chunks.length) {
        if (interrupted) recStatusShow(panel, '⚠ 录音中断：未录到内容', true);
        return;
      }
      var dur = Math.max(1, Math.round((Date.now() - panel._raT0) / 1000));
      var m = mr.mimeType || mime || 'audio/webm';
      var now = new Date();
      var nm = recPad(now.getMonth() + 1) + '-' + recPad(now.getDate()) + ' ' + recPad(now.getHours()) + ':' + recPad(now.getMinutes());
      var d0 = window._paipanData;
      var allSilent = recSilentVerdict(gstat);
      var clip = {
        id: k + '|' + now.getTime(), key: k, name: nm + (interrupted ? ' ⚠中断' : '') + (allSilent ? ' ⚠静音' : ''), ts: now.getTime(), dur: dur, mime: m,
        people: recPeopleDefault(),
        fname: (d0 && d0.name ? d0.name + '-' : '') + '录音' + (interrupted ? '-中断' : '') + '-' + nm.replace(' ', '_').replace(':', '-') + '.' + recAudioExt(m),
        blob: new Blob(chunks, { type: m.split(';')[0] })
      };
      recAudioPut(clip).then(function() {
        try {
          if (window.ARCHIVE && window.ARCHIVE.syncWriteBlob) window.ARCHIVE.syncWriteBlob('录音', clip.fname, clip.blob);
        } catch (e) {}
        transcribeClip(clip, panel);
        return recAudioList(k).then(function(list) { renderRecAudioList(panel, list); });
      }).then(function() {
        if (allSilent) recStatusShow(panel, '⚠ 本段 ' + recAudioFmt(dur) + ' 几乎全是静音，麦克风当时已断开', true);
        else recStatusShow(panel, interrupted ? '⚠ 录音中断：已保留 ' + recAudioFmt(dur) + '，内容可能不完整' : '已保存录音 ' + recAudioFmt(dur), interrupted);
      }).catch(function(e) {
        recStatusShow(panel, '录音保存失败：' + (e && e.message || e), true);
      });
    }
    mr.ondataavailable = function(e) { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = function() { finalize(!panel._raExpectStop); };
    mr.onerror = function() { finalize(true); };
    stream.getTracks().forEach(function(t) {
      t.addEventListener('ended', function() {
        if (panel._raRec !== mr || done) return;
        if (mr.state === 'recording') { try { mr.stop(); } catch (e) {} }
        else finalize(true);
      });
      t.addEventListener('mute', function() {
        if (panel._raRec !== mr || done) return;
        recWatchAlert(panel, '⚠ 麦克风被系统断开（可能切换到了别的设备）', null);
      });
    });
    panel._raRec = mr;
    panel._raT0 = Date.now();
    mr.start();
    panel._raG = recMicGuard(stream, function(silentSec, actx) {
      if (panel._raRec !== mr || done) return;
      recWatchAlert(panel, silentSec >= 60
        ? '⚠ 已连续 ' + silentSec + ' 秒没有声音输入，这段录音可能是空的'
        : '⚠ 麦克风没有声音输入（' + silentSec + ' 秒），请检查设备', actx);
    });
    recStatusShow(panel, '🎙 录音设备：' + mic.label + (mic.locked ? '（已锁定内置）' : '（⚠ 未锁定内置麦克风）'), !mic.locked);
    btn.textContent = '■ 停止'; btn.classList.add('recording');
    var timerEl = panel.querySelector('.rec-audio-timer');
    panel._raTimer = setInterval(function() {
      if (!panel._raRec || panel._raRec.state !== 'recording') { if (!panel._raExpectStop) finalize(true); return; }
      if (timerEl) timerEl.textContent = recAudioFmt(Math.floor((Date.now() - panel._raT0) / 1000));
    }, 250);
  }).catch(function(err) {
    recStatusShow(panel, '无法访问麦克风：' + (err && (err.name || err.message) || err), true);
  });
}
// ===== v0.83.0 录音与 AI 交互区：命盘下方时间轴 + 录音卡 + 详情三 tab（图文纪要/文字记录/追加笔记）=====
function recZoneCssOnce() {
  if (document.getElementById('bzRecZoneCss')) return;
  var st = document.createElement('style');
  st.id = 'bzRecZoneCss';
  st.textContent = [
    '.rec-zone{margin:14px 4px 30px;padding:14px 16px 18px;background:var(--c-paper,#faf7f0);border:1px solid var(--c-line,#e3dccb);border-radius:8px;}',
    '.rec-zone .rz-head{display:flex;align-items:baseline;gap:10px;margin-bottom:12px;flex-wrap:wrap;}',
    '.rec-zone .rz-title{font-size:15px;font-weight:700;color:var(--c-ink,#2b2620);}',
    '.rec-zone .rz-count{font-size:12px;color:#8a7f6a;}',
    '.rec-zone .rz-rec-btn{margin-left:auto;padding:4px 14px;border:0;border-radius:14px;background:#c0392b;color:#fff;font-size:13px;cursor:pointer;font-family:var(--font-display);}',
    '.rec-zone .rz-rec-btn.recording{background:#7a1f14;animation:rzPulse 1.2s infinite;}',
    '@keyframes rzPulse{0%,100%{opacity:1}50%{opacity:.55}}',
    '.rec-zone .rz-timer{font-size:12px;color:#c0392b;min-width:34px;}',
    '.rec-zone .rz-timeline{position:relative;padding-left:22px;}',
    '.rec-zone .rz-timeline:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--c-line,#e3dccb);}',
    '.rec-zone .rz-day{position:relative;padding-bottom:14px;}',
    '.rec-zone .rz-day:before{content:"";position:absolute;left:-21px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--c-accent,#8a5a2b);border:2px solid var(--c-paper,#faf7f0);box-shadow:0 0 0 1px var(--c-accent,#8a5a2b);}',
    '.rec-zone .rz-day-title{font-size:13px;font-weight:700;color:var(--c-ink,#2b2620);margin-bottom:8px;}',
    '.rec-zone .rz-cards{display:flex;flex-direction:column;gap:10px;}',
    '.rec-zone .rz-card{background:#fff;border:1px solid var(--c-line,#e3dccb);border-radius:8px;padding:10px 14px;cursor:pointer;transition:box-shadow .15s;}',
    '.rec-zone .rz-card:hover{box-shadow:0 2px 8px rgba(60,45,20,.12);}',
    '.rec-zone .rz-card-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;row-gap:5px;}',
    '.rec-zone .rz-card-name{font-size:14px;font-weight:700;color:var(--c-ink,#2b2620);flex:1 1 auto;min-width:86px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.rec-zone .rz-card-time{font-size:12px;color:#8a7f6a;white-space:nowrap;}',
    '.rec-zone .rz-people-wrap{display:inline-flex;align-items:center;gap:4px;flex:0 1 auto;max-width:100%;background:#fbf7ee;border:1px solid #e6dcc6;border-radius:8px;padding:2px 6px;}',
    '.rec-zone .rz-people-label{font-size:11px;color:#a39880;white-space:nowrap;}',
    '.rec-zone .rz-people{width:132px;min-width:64px;max-width:100%;border:0;background:transparent;font:inherit;font-size:12px;color:#7a5c1f;font-weight:600;outline:none;padding:1px 2px;border-bottom:1px dashed #d9c9a3;}',
    '.rec-zone .rz-people:focus{border-bottom-color:#b8892b;background:#fffdf7;}',
    '.rec-zone .rz-audio-line{display:flex;align-items:center;gap:10px;margin-top:6px;font-size:12px;color:#6a6154;flex-wrap:wrap;}',
    '.rec-zone .rz-badge{display:inline-block;padding:1px 8px;border-radius:9px;font-size:11px;}',
    '.rec-zone .rz-badge.ok{background:#e6f4ea;color:#0a7d33;}',
    '.rec-zone .rz-badge.no{background:#f1ede4;color:#8a7f6a;}',
    '.rec-zone .rz-badge.busy{background:#fdf3e0;color:#a86400;}',
    '.rec-zone .rz-play{width:26px;height:26px;border-radius:50%;border:1px solid var(--c-line,#e3dccb);background:#fff;cursor:pointer;font-size:11px;line-height:1;color:var(--c-ink,#2b2620);}',
    '.rec-zone .rz-summary{margin-top:6px;font-size:13px;line-height:1.6;color:#4a4438;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.rec-zone .rz-card-foot{margin-top:6px;display:flex;flex-wrap:wrap;row-gap:4px;gap:8px;align-items:center;font-size:11px;color:#a39880;}',
    '.rec-zone .rz-model{font-size:11px;color:#8a7f6a;background:#f6f1e4;border:1px solid #ece2cb;border-radius:9px;padding:1px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}',
    '.rec-zone .rz-model-line{margin:-2px 0 8px;font-size:11px;color:#a39880;line-height:1.6;word-break:break-all;}',
    '.rec-zone .rz-empty{padding:26px 0;text-align:center;font-size:13px;color:#a39880;}',
    '.rec-zone .rz-detail{margin-top:14px;background:#fff;border:1px solid var(--c-line,#e3dccb);border-radius:8px;padding:14px 16px;}',
    '.rec-zone .rz-detail-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;}',
    '.rec-zone .rz-detail-name{font-size:15px;font-weight:700;color:var(--c-ink,#2b2620);flex:1;}',
    '.rec-zone .rz-close{border:0;background:none;font-size:16px;cursor:pointer;color:#8a7f6a;}',
    '.rec-zone .rz-tabs{display:flex;gap:6px;border-bottom:1px solid var(--c-line,#e3dccb);margin-bottom:10px;}',
    '.rec-zone .rz-tab{padding:6px 14px;border:0;background:none;font-size:13px;color:#8a7f6a;cursor:pointer;border-radius:6px 6px 0 0;font-family:var(--font-display);}',
    '.rec-zone .rz-tab.active{color:var(--c-ink,#2b2620);font-weight:700;box-shadow:inset 0 -2px 0 var(--c-accent,#8a5a2b);}',
    '.rec-zone .rz-pane{font-size:13px;line-height:1.7;color:#3c362c;max-height:46vh;overflow:auto;}',
    '.rec-zone .rz-pane h3{font-size:14px;margin:10px 0 4px;}',
    '.rec-zone .rz-pane h2{font-size:14px;margin:12px 0 4px;color:var(--c-accent,#8a5a2b);}',
    '.rec-zone .rz-pane ul{margin:4px 0;padding-left:18px;}',
    '.rec-zone .rz-pane li{margin:2px 0;}',
    '.rec-zone .rz-notes{margin:0 0 10px;padding:0;list-style:none;}',
    '.rec-zone .rz-notes li{padding:6px 8px;border-bottom:1px dashed var(--c-line,#e3dccb);font-size:13px;}',
    '.rec-zone .rz-note-ts{color:#a39880;font-size:11px;margin-right:6px;}',
    '.rec-zone .rz-note-form{display:flex;gap:8px;}',
    '.rec-zone .rz-note-input{flex:1;padding:7px 10px;border:1px solid var(--c-line,#e3dccb);border-radius:6px;font-size:13px;font-family:var(--font-display);}',
    '.rec-zone .rz-note-add{padding:6px 16px;border:0;border-radius:6px;background:var(--c-accent,#8a5a2b);color:#fff;cursor:pointer;font-size:13px;}',
    '.rec-zone .rz-segs{display:flex;flex-direction:column;gap:14px;}',
    '.rec-zone .rz-seg-head{display:flex;align-items:center;gap:8px;margin-bottom:4px;}',
    '.rec-zone .rz-seg-avatar{width:22px;height:22px;border-radius:50%;color:#fff;font-size:12px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 22px;font-family:var(--font-display);}',
    '.rec-zone .rz-seg-spk{font-size:13px;font-weight:600;color:#4a4438;}',
    '.rec-zone .rz-seg-ts{margin-left:auto;font-size:12px;color:#a39880;cursor:pointer;user-select:none;white-space:nowrap;}',
    '.rec-zone .rz-seg-ts:hover{color:var(--c-accent,#8a5a2b);}',
    '.rec-zone .rz-seg-txt{font-size:14px;line-height:1.75;color:#2b2620;margin:0 0 0 30px;}'
  ].join('\n');
  document.head.appendChild(st);
}
function recZoneGroupByDay(list) {
  var WD = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  var days = [], map = {};
  for (var i = 0; i < list.length; i++) {
    var dt = new Date(list[i].ts);
    var dk = dt.getFullYear() + '-' + recPad(dt.getMonth() + 1) + '-' + recPad(dt.getDate());
    if (!map[dk]) { map[dk] = { key: dk, label: (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + WD[dt.getDay()], clips: [] }; days.push(map[dk]); }
    map[dk].clips.push(list[i]);
  }
  days.sort(function(a, b) { return a.key < b.key ? 1 : -1; });
  for (var j = 0; j < days.length; j++) days[j].clips.sort(function(a, b) { return b.ts - a.ts; });
  return days;
}
function recZoneMd(s) {
  var lines = String(s == null ? '' : s).split('\n'), out = [], inUl = false;
  function inline(t) {
    return bzEsc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i];
    if (/^#{1,6}\s/.test(t)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<h2>' + inline(t.replace(/^#{1,6}\s/, '')) + '</h2>');
    } else if (/^[-*]\s/.test(t)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + inline(t.replace(/^[-*]\s/, '')) + '</li>');
    } else if (t.trim()) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<p style="margin:6px 0;">' + inline(t) + '</p>');
    }
  }
  if (inUl) out.push('</ul>');
  return out.join('\n');
}
function recZoneBadgeOf(c) {
  if (c._tfBusy && !c.transcript) return '<span class="rz-badge busy">转录中…</span>';
  if (c.transcript) return '<span class="rz-badge ok">已转录</span>';
  return '<span class="rz-badge no">未转录</span>';
}
function recZoneSummaryOf(c) {
  if (!c.transcript || !c.transcript.text) return '';
  var lines = c.transcript.text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trim();
    if (t && !/^#/.test(t)) return t;
  }
  return '';
}
function recZoneCardHtml(c) {
  var dt = new Date(c.ts);
  var hhmm = recPad(dt.getHours()) + ':' + recPad(dt.getMinutes());
  return '<div class="rz-card" data-id="' + bzEsc(c.id) + '" onclick="RENDER.recZoneOpenDetail(this)">'
    + '<div class="rz-card-top"><span class="rz-card-name">' + bzEsc(c.name) + '</span>'
    + '<span class="rz-card-time">' + hhmm + ' · ' + recAudioFmt(c.dur) + '</span>'
    + '<span class="rz-people-wrap" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">'
    + '<span class="rz-people-label">咨询人物</span>'
    + '<input class="rz-people" data-id="' + bzEsc(c.id) + '" value="' + bzEsc(recPeopleOf(c)).replace(/"/g, '&quot;') + '"'
    + ' onclick="event.stopPropagation()" onmousedown="event.stopPropagation()"'
    + ' onchange="RENDER.recZonePeopleSave(this)" onblur="RENDER.recZonePeopleSave(this)"'
    + ' title="本次咨询的参与人，顿号分隔，可加其他人；「案主」＝本次命盘主人">'
    + '</span></div>'
    + '<div class="rz-audio-line">'
    + '<button type="button" class="rz-play" onclick="event.stopPropagation();RENDER.recZonePlay(this)" title="播放/暂停">▶</button>'
    + '<span>🎙 ' + recAudioFmt(c.dur) + '</span>' + recZoneBadgeOf(c)
    + '</div>'
    + (recZoneSummaryOf(c) ? '<div class="rz-summary">' + bzEsc(recZoneSummaryOf(c)) + '</div>' : '')
    + '<div class="rz-card-foot"><span class="rz-badge no">录音卡</span>' + recModelLineHtml(c) + '<span>' + hhmm + ' 创建</span></div>'
    + '</div>';
}
function recZoneRenderInto(box, list) {
  if (!box) return;
  recZoneCssOnce();
  var days = recZoneGroupByDay(list || []);
  for (var d = 0; d < (list || []).length; d++) delete list[d]._tfBusy;
  var h = '<div class="rz-head"><span class="rz-title">🎙 录音与 AI 交互区</span>'
    + '<span class="rz-count">全部录音 ' + (list || []).length + '</span>'
    + '<button type="button" class="rz-rec-btn" onclick="RENDER.recZoneRecord(this)">● 录音</button>'
    + '<span class="rz-timer"></span><span class="rec-status"></span></div>';
  if (!days.length) {
    h += '<div class="rz-empty">暂无录音 · 点右上「● 录音」开始语音分析，自动转录成纪要</div>';
  } else {
    h += '<div class="rz-timeline">';
    for (var i = 0; i < days.length; i++) {
      h += '<div class="rz-day"><div class="rz-day-title">' + days[i].label + '</div><div class="rz-cards">';
      for (var j = 0; j < days[i].clips.length; j++) h += recZoneCardHtml(days[i].clips[j]);
      h += '</div></div>';
    }
    h += '</div>';
  }
  h += '<div class="rz-detail" id="bzRecZoneDetail" style="display:none;"></div>';
  box.innerHTML = h;
  box._rzClips = {};
  for (var k = 0; k < (list || []).length; k++) box._rzClips[list[k].id] = list[k];
  var pend = (list || []).filter(function(c) {
    return c && c.transcript && !(c.transcript.models && c.transcript.models.llm) && !c._mdChecked;
  });
  if (pend.length && window.ARCHIVE && window.ARCHIVE.syncReadText) {
    Promise.all(pend.map(function(c) { return recModelBackfill(c); })).then(function(rs) {
      if (rs.filter(function(x) { return x; }).length) recZoneRenderInto(box, list);
    });
  }
}
function renderRecZone() {
  var zone = document.getElementById('bzRecZone');
  if (!zone || !window._paipanData) return Promise.resolve(false);
  var k = recAudioKey('');
  if (!k) return Promise.resolve(false);
  return recAudioList(k).then(function(list) {
    recZoneRenderInto(zone, list);
    zone.style.display = '';
    return true;
  }).catch(function() { return false; });
}
var _rzRec = null, _rzT0 = 0, _rzTimer = null, _rzExpectStop = false, _rzGuard = null;
function recZoneResetBtn() {
  var zone = document.getElementById('bzRecZone');
  _rzRec = null; _rzExpectStop = false;
  if (_rzGuard) { _rzGuard.stop(); _rzGuard = null; }
  clearInterval(_rzTimer); _rzTimer = null;
  var btn = zone && zone.querySelector('.rz-rec-btn');
  if (btn) { btn.textContent = '● 录音'; btn.classList.remove('recording'); }
  var tEl = zone && zone.querySelector('.rz-timer'); if (tEl) tEl.textContent = '';
}
function recZoneRecord(btn) {
  var zone = document.getElementById('bzRecZone');
  if (_rzRec) {
    if (_rzRec.state === 'recording') { _rzExpectStop = true; try { _rzRec.stop(); } catch (e) {} return; }
    recZoneResetBtn();
    recStatusShow(zone, '检测到上次录音已中断，重新开始', true);
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    recStatusShow(zone, '当前环境不支持录音', true); return;
  }
  var k = recAudioKey('');
  if (!k) { recStatusShow(zone, '请先排盘再录音', true); return; }
  recMicOpen().then(function(mic) {
    var stream = mic.stream;
    var mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    var mime = '';
    for (var i = 0; i < mimes.length; i++) if (MediaRecorder.isTypeSupported(mimes[i])) { mime = mimes[i]; break; }
    var mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    var chunks = [];
    var done = false;
    function finalize(interrupted) {
      if (done) return;
      done = true;
      _rzExpectStop = false;
      var gstat = null;
      if (_rzGuard) { gstat = _rzGuard.stat(); _rzGuard.stop(); _rzGuard = null; }
      try { stream.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {}
      clearInterval(_rzTimer); _rzTimer = null;
      _rzRec = null;
      btn.textContent = '● 录音'; btn.classList.remove('recording');
      var tEl = zone.querySelector('.rz-timer'); if (tEl) tEl.textContent = '';
      if (!chunks.length) {
        if (interrupted) recStatusShow(zone, '⚠ 录音中断：未录到内容', true);
        return;
      }
      var dur = Math.max(1, Math.round((Date.now() - _rzT0) / 1000));
      var m = mr.mimeType || mime || 'audio/webm';
      var now = new Date();
      var nm = recPad(now.getMonth() + 1) + '-' + recPad(now.getDate()) + ' ' + recPad(now.getHours()) + ':' + recPad(now.getMinutes());
      var d0 = window._paipanData;
      var allSilent = recSilentVerdict(gstat);
      var clip = {
        id: k + '|' + now.getTime(), key: k, name: nm + (interrupted ? ' ⚠中断' : '') + (allSilent ? ' ⚠静音' : ''), ts: now.getTime(), dur: dur, mime: m,
        people: recPeopleDefault(),
        fname: (d0 && d0.name ? d0.name + '-' : '') + '录音' + (interrupted ? '-中断' : '') + '-' + nm.replace(' ', '_').replace(':', '-') + '.' + recAudioExt(m),
        blob: new Blob(chunks, { type: m.split(';')[0] })
      };
      recAudioPut(clip).then(function() {
        try { if (window.ARCHIVE && window.ARCHIVE.syncWriteBlob) window.ARCHIVE.syncWriteBlob('录音', clip.fname, clip.blob); } catch (e) {}
        transcribeClip(clip, null);
        return renderRecZone();
      }).then(function() {
        if (allSilent) recStatusShow(zone, '⚠ 本段 ' + recAudioFmt(dur) + ' 几乎全是静音，麦克风当时已断开', true);
        else if (interrupted) recStatusShow(zone, '⚠ 录音中断：已保留 ' + recAudioFmt(dur) + '，内容可能不完整', true);
      }).catch(function(e) { recStatusShow(zone, '录音保存失败：' + (e && e.message || e), true); });
    }
    mr.ondataavailable = function(e) { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = function() { finalize(!_rzExpectStop); };
    mr.onerror = function() { finalize(true); };
    stream.getTracks().forEach(function(t) {
      t.addEventListener('ended', function() {
        if (_rzRec !== mr || done) return;
        if (mr.state === 'recording') { try { mr.stop(); } catch (e) {} }
        else finalize(true);
      });
      t.addEventListener('mute', function() {
        if (_rzRec !== mr || done) return;
        recWatchAlert(zone, '⚠ 麦克风被系统断开（可能切换到了别的设备）', null);
      });
    });
    _rzRec = mr; _rzT0 = Date.now();
    mr.start();
    _rzGuard = recMicGuard(stream, function(silentSec, actx) {
      if (_rzRec !== mr || done) return;
      recWatchAlert(zone, silentSec >= 60
        ? '⚠ 已连续 ' + silentSec + ' 秒没有声音输入，这段录音可能是空的'
        : '⚠ 麦克风没有声音输入（' + silentSec + ' 秒），请检查设备', actx);
    });
    recStatusShow(zone, '🎙 录音设备：' + mic.label + (mic.locked ? '（已锁定内置）' : '（⚠ 未锁定内置麦克风）'), !mic.locked);
    btn.textContent = '■ 停止'; btn.classList.add('recording');
    var timerEl = zone.querySelector('.rz-timer');
    _rzTimer = setInterval(function() {
      if (!_rzRec || _rzRec.state !== 'recording') { if (!_rzExpectStop) finalize(true); return; }
      if (timerEl) timerEl.textContent = recAudioFmt(Math.floor((Date.now() - _rzT0) / 1000));
    }, 250);
  }).catch(function(err) {
    recStatusShow(zone, '无法访问麦克风：' + (err && (err.name || err.message) || err), true);
  });
}
function recZoneClipOf(el) {
  var zone = document.getElementById('bzRecZone');
  if (!zone) return null;
  var card = el.closest ? el.closest('.rz-card') : null;
  return (card && zone._rzClips) ? zone._rzClips[card.getAttribute('data-id')] : null;
}
function recZonePlay(btn) {
  var zone = document.getElementById('bzRecZone');
  var clip = recZoneClipOf(btn);
  if (!zone || !clip || !clip.blob) return;
  if (zone._rzAudioId === clip.id && zone._rzAudio) {
    if (zone._rzAudio.paused) { zone._rzAudio.play(); btn.textContent = '⏸'; }
    else { zone._rzAudio.pause(); btn.textContent = '▶'; }
    return;
  }
  if (zone._rzAudio) { try { zone._rzAudio.pause(); } catch (e) {} }
  if (zone._rzUrl) { try { URL.revokeObjectURL(zone._rzUrl); } catch (e) {} }
  var url = URL.createObjectURL(clip.blob);
  var au = new Audio(url);
  zone._rzAudio = au; zone._rzAudioId = clip.id; zone._rzUrl = url; zone._rzPlayBtn = btn;
  au.onended = function() { if (zone._rzPlayBtn) zone._rzPlayBtn.textContent = '▶'; };
  au.play();
  btn.textContent = '⏸';
}
function recZoneSeekTs(btn) {
  var zone = document.getElementById('bzRecZone');
  if (!zone) return;
  var clip = zone._rzClips && zone._rzClips[zone._rzOpenId];
  var sec = parseFloat(btn && btn.getAttribute && btn.getAttribute('data-s')) || 0;
  if (!clip || !clip.blob) return;
  var au = zone._rzAudio;
  if (zone._rzAudioId !== clip.id || !au) {
    if (zone._rzUrl) { try { URL.revokeObjectURL(zone._rzUrl); } catch (e) {} }
    au = new Audio(URL.createObjectURL(clip.blob));
    zone._rzAudio = au; zone._rzAudioId = clip.id; zone._rzUrl = au.src; zone._rzPlayBtn = null;
    au.onended = function() { if (zone._rzPlayBtn) zone._rzPlayBtn.textContent = '▶'; };
  }
  try { au.currentTime = sec; au.play(); } catch (e) {}
}
// ===== v0.86.7 录音稿：要点全面具像化 + 新章节「解读的思路与步骤」「规划的结果以及原理」页签 =====
function bzMdSectionOf(text, title) {
  var lines = String(text == null ? '' : text).split('\n');
  var out = [], on = false;
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i];
    if (/^#{1,6}\s/.test(t)) {
      if (on) break;
      on = t.replace(/^#{1,6}\s/, '').trim().indexOf(title) === 0;
      continue;
    }
    if (on) out.push(t);
  }
  while (out.length && !out[0].trim()) out.shift();
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out.join('\n');
}
function recZonePaneOf(clip, tab) {
  if (tab === 'steps' || tab === 'plan') {
    var title = tab === 'steps' ? '解读的思路与步骤' : '规划的结果以及原理';
    var sec = bzMdSectionOf(clip.transcript && clip.transcript.text, title);
    if (sec) return recZoneMd('## ' + title + '\n\n' + sec);
    return '<div class="rz-empty">本稿为旧版整理，暂无「' + title + '」章节 · 点上方「🔄 重转录」用新版整理升级</div>';
  }
  if (tab === 'raw') {
    var tr = clip.transcript;
    if (tr && tr.segs && tr.segs.length) return '<div class="rz-segs">' + bzDialogHtml(tr.segs, tr.spk) + '</div>';
    var raw = tr && tr.raw;
    if (raw) return '<div style="font-size:12px;color:#a39880;margin-bottom:8px;">旧版转录无时间戳与说话人 · 点上方「🔄 重转录」升级为对话还原</div>' + recZoneMd(raw);
    return '<div class="rz-empty">暂无原始识别文字（转录后生成）</div>';
  }
  if (tab === 'notes') {
    var notes = clip.notes || [];
    var h = notes.length ? '<ul class="rz-notes">' : '<div class="rz-empty">暂无追加笔记</div>';
    for (var i = 0; i < notes.length; i++) {
      h += '<li><span class="rz-note-ts">' + new Date(notes[i].ts).toLocaleString() + '</span>' + bzEsc(notes[i].text) + '</li>';
    }
    if (notes.length) h += '</ul>';
    h += '<div class="rz-note-form"><input class="rz-note-input" id="rzNoteInput" placeholder="追加笔记：写想法、补信息…回车保存">'
      + '<button type="button" class="rz-note-add" onclick="RENDER.recZoneAddNote(this)">追加</button></div>';
    return h;
  }
  if (clip.transcript && clip.transcript.text) return recZoneMd(clip.transcript.text);
  return '<div class="rz-empty">尚未转录 · 点转录按钮开始，或等待自动转录完成</div>';
}
function recZoneRenderDetail(zone, clip) {
  var box = zone.querySelector('#bzRecZoneDetail');
  if (!box) return;
  var tab = zone._rzTab || 'md';
  var dt = new Date(clip.ts);
  var created = dt.getFullYear() + '-' + recPad(dt.getMonth() + 1) + '-' + recPad(dt.getDate()) + ' ' + recPad(dt.getHours()) + ':' + recPad(dt.getMinutes());
  box.style.display = '';
  box.innerHTML = '<div class="rz-detail-head">'
    + '<span class="rz-detail-name">' + bzEsc(clip.name) + '</span>'
    + '<span class="rz-card-time">' + created + ' · ' + recAudioFmt(clip.dur) + '</span>'
    + recZoneBadgeOf(clip)
    + '<button type="button" class="rz-tab" style="border:1px solid var(--c-line,#e3dccb);" onclick="RENDER.bzZoneTranscribe(this)" title="转录">' + (clip.transcript ? '🔄 重转录' : '📝 转录') + '</button>'
    + '<button type="button" class="rz-close" onclick="RENDER.recZoneCloseDetail(this)" title="关闭">✕</button></div>'
    + (clip.transcript ? '<div class="rz-model-line" title="' + bzEsc(recModelTitleOf(clip)) + '">🧠 识别 ' + bzEsc(recModelsOf(clip).asr) + ' ｜ 整理/归属 ' + bzEsc(recModelsOf(clip).llm) + (recModelsOf(clip).src === 'guess' ? '（推定）' : '') + ' ｜ 转录于 ' + new Date(clip.transcript.ts).toLocaleString() + '</div>' : '')
    + '<div class="rz-tabs">'
    + '<button type="button" class="rz-tab' + (tab === 'md' ? ' active' : '') + '" onclick="RENDER.recZoneTab(this,\'md\')">图文纪要</button>'
    + '<button type="button" class="rz-tab' + (tab === 'steps' ? ' active' : '') + '" onclick="RENDER.recZoneTab(this,\'steps\')">解读的思路与步骤</button>'
    + '<button type="button" class="rz-tab' + (tab === 'plan' ? ' active' : '') + '" onclick="RENDER.recZoneTab(this,\'plan\')">规划的结果以及原理</button>'
    + '<button type="button" class="rz-tab' + (tab === 'raw' ? ' active' : '') + '" onclick="RENDER.recZoneTab(this,\'raw\')">文字记录</button>'
    + '<button type="button" class="rz-tab' + (tab === 'notes' ? ' active' : '') + '" onclick="RENDER.recZoneTab(this,\'notes\')">追加笔记' + (clip.notes && clip.notes.length ? '（' + clip.notes.length + '）' : '') + '</button>'
    + '</div>'
    + '<div class="rz-pane" id="rzPane">' + recZonePaneOf(clip, tab) + '</div>';
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function recZoneOpenDetail(el) {
  var zone = document.getElementById('bzRecZone');
  var clip = recZoneClipOf(el);
  if (!zone || !clip) return;
  zone._rzOpenId = clip.id;
  recZoneRenderDetail(zone, clip);
}
function bzZoneTranscribe() {
  var zone = document.getElementById('bzRecZone');
  if (!zone) return;
  var clip = zone._rzClips && zone._rzClips[zone._rzOpenId];
  if (!clip) return;
  if (!clip.transcript && !bzAiCfg().sfKey) { bzAiSettings(zone, clip); return; }
  if (clip.transcript) {
    if (!confirm('用最新模型重新转录这条录音？\n\n原稿不会丢，会保留在录音稿的「历史转录」里。')) return;
    clip.prev = (clip.prev || []).concat([{
      text: clip.transcript.text, raw: clip.transcript.raw, ts: clip.transcript.ts, models: clip.transcript.models
    }]).slice(-3);
    clip.transcript = null;
  }
  transcribeClip(clip, null).then(function() { return renderRecZone(); }).then(function() {
    var z2 = document.getElementById('bzRecZone');
    if (z2 && z2._rzClips && z2._rzClips[zone._rzOpenId]) recZoneRenderDetail(z2, z2._rzClips[zone._rzOpenId]);
  });
}
function recZoneCloseDetail() {
  var zone = document.getElementById('bzRecZone');
  var box = zone && zone.querySelector('#bzRecZoneDetail');
  if (box) box.style.display = 'none';
  if (zone) zone._rzOpenId = null;
}
function recZoneTab(btn, tab) {
  var zone = document.getElementById('bzRecZone');
  if (!zone) return;
  zone._rzTab = tab;
  var clip = zone._rzClips && zone._rzClips[zone._rzOpenId];
  if (!clip) return;
  var tabs = zone.querySelectorAll('.rz-tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i] === btn);
  var pane = zone.querySelector('#rzPane');
  if (pane) pane.innerHTML = recZonePaneOf(clip, tab);
}
function recZoneSaveNotesMd(clip) {
  if (!clip.transcript || !window.ARCHIVE || !window.ARCHIVE.syncWriteBlob) return;
  try {
    clip.tfname = clip.tfname || bzTfName(clip);
    var md = bzTranscriptMd(clip, clip.transcript.text, clip.transcript.raw);
    if (clip.notes && clip.notes.length) {
      md += '## 追加笔记\n\n';
      for (var i = 0; i < clip.notes.length; i++) {
        md += '- ' + new Date(clip.notes[i].ts).toLocaleString() + '　' + clip.notes[i].text + '\n';
      }
    }
    window.ARCHIVE.syncWriteBlob('录音稿', clip.tfname, new Blob([md], { type: 'text/markdown' }));
  } catch (e) {}
}
function recZonePeopleSave(input) {
  var zone = (input && input.closest) ? input.closest('.rec-zone') : null;
  if (!zone) zone = document.getElementById('bzRecZone');
  if (!zone || !input || !input.getAttribute) return;
  var clip = zone._rzClips && zone._rzClips[input.getAttribute('data-id')];
  if (!clip) return;
  var v = recPeopleNorm(input.value);
  if (input.value !== v) input.value = v;
  if (clip.people === v) return;
  clip.people = v;
  recAudioPut(clip).then(function() {
    try { if (window.ARCHIVE && window.ARCHIVE.syncTouch) window.ARCHIVE.syncTouch(); } catch (e) {}
    recZoneSaveNotesMd(clip);
    recStatusShow(zone, '咨询人物已保存：' + v + '（重转录后说话人按这份名单归属）');
  }).catch(function(e) {
    recStatusShow(zone, '咨询人物保存失败：' + (e && e.message || e), true);
  });
}
function recZoneAddNote(btn) {
  var zone = document.getElementById('bzRecZone');
  if (!zone) return;
  var clip = zone._rzClips && zone._rzClips[zone._rzOpenId];
  var input = zone.querySelector('#rzNoteInput');
  var text = input ? input.value.trim() : '';
  if (!clip || !text) return;
  if (!clip.notes) clip.notes = [];
  clip.notes.push({ ts: Date.now(), text: text });
  clip.tfname = clip.tfname || bzTfName(clip);
  recAudioPut(clip).then(function() {
    recZoneSaveNotesMd(clip);
    var pane = zone.querySelector('#rzPane');
    if (pane) pane.innerHTML = recZonePaneOf(clip, 'notes');
    recStatusShow(zone, '已追加笔记并同步档案');
  }).catch(function(e) { recStatusShow(zone, '追加失败：' + (e && e.message || e), true); });
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

// ===== v0.49.0 双胞胎卡分析记录：tabs 行入口，面板居卡片与共享运流之间，key 带 twin| 前缀与普通盘隔离 =====
function twinRecBtnHtml() {
  return '<button class="btn-simple twin-rec-trigger' + (isRecOn() ? ' active' : '') + '" onclick="RENDER.toggleTwinRec(this)" title="记录双胞胎合盘分析：面板展开于卡片下方，写入即保存">分析记录</button>';
}
function twinRecPanelHtml() {
  var on = isRecOn();
  return '<div class="record-panel twin-rec' + (on ? ' open' : '') + '">'
    + '<div class="rec-head"><span style="display:inline-flex;align-items:center;gap:8px;"><span class="rec-title">分析记录（双胞胎）</span><span class="rec-dim-wrap"><button type="button" class="rec-dim-btn" onclick="RENDER.toggleDimPop(event)" title="分析维度：勾选本命盘显示的维度，或新增/移除维度">维度 ▾</button><div class="rec-dim-pop" onclick="event.stopPropagation()"></div></span></span><span class="rec-status" role="status"></span></div>'
    + '<div class="rec-tabs" role="tablist"></div>'
    + '<div class="rec-alts"></div>'
    + '<textarea class="rec-text" placeholder="记录本次双胞胎合盘分析……写入即自动保存"></textarea>'
    + '<div class="rec-audio" data-suffix="">'
    + '<div class="rec-audio-bar">'
    + '<button type="button" class="rec-audio-btn" onclick="RENDER.recAudioToggle(this)" title="录制语音分析，自动挂在当前档案下">● 录音</button>'
    + '<span class="rec-audio-timer"></span>'
    + '<span class="rec-audio-hint">录音保存在本机浏览器</span>'
    + '</div>'
    + '<div class="rec-audio-list"></div>'
    + '</div>'
    + '</div>';
}
function toggleTwinRec(btn) {
  var on = !isRecOn();
  try { localStorage.setItem(LS_REC_MODE, on ? '1' : '0'); } catch (e) {}
  var panel = btn.closest('.bz-twin-tabs').parentElement.querySelector('.record-panel.twin-rec');
  if (panel) {
    panel.classList.toggle('open', on);
    var ta = panel.querySelector('.rec-text');
    if (ta && on) recAutogrow(ta);
  }
  btn.classList.toggle('active', on);
  return on;
}

var flowMonthOn = false;
var flowDayOn = false;
var flowNewCal = false;

function flowMonths(year) {
  return CONST.MONTH_TERM.map(function(term, index) {
    var start = ALGO.getSolarTerm(year + (index === 11 ? 1 : 0), term);
    var nextIndex = (index + 1) % 12;
    var end = ALGO.getSolarTerm(year + (index >= 10 ? 1 : 0), CONST.MONTH_TERM[nextIndex]);
    var ganStart = CONST.TG.indexOf(CONST.WU_HU_DUN[ALGO.yearPillar(year).gan]);
    return { start: start, end: end, gan: CONST.TG[(ganStart + index) % 10], zhi: CONST.DZ[(index + 2) % 12] };
  });
}

var CN_MONTHS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
function cnMonthLabel(index) { return CN_MONTHS[index] + '月'; }

function flowControlsHTML() {
  return '<span class="flow-date-picker"><label>新历 <input type="date" aria-label="新历流年流月流日" onchange="RENDER.locateFlowDate(this)"></label><button type="button" onclick="RENDER.locateFlowDate(this.previousElementSibling.querySelector(\'input\'))">定位</button><span class="flow-date-status" role="status"></span></span><span style="display:inline-flex;align-items:center;gap:10px;font-size:12px;white-space:nowrap"><label><input type="checkbox" data-flow="month" onchange="RENDER.setFlowVisible(\'month\',this.checked)">流月</label><label><input type="checkbox" data-flow="day" onchange="RENDER.setFlowVisible(\'day\',this.checked)">流月日</label><label><input type="checkbox" data-flow="newcal" onchange="RENDER.setFlowNewCal(this.checked)">新历</label></span>';
}

function setFlowNewCal(checked) {
  flowNewCal = checked;
  document.querySelectorAll('[data-flow="newcal"]').forEach(function(input) { input.checked = checked; });
  // v0.76.0 多选列头标签由 applyMultiDL 在渲染期算，切新历需重渲主表并恢复面板状态
  if (_multiDL.on && window.APP && APP.doPaipan) {
    var savedFlows = [];
    document.querySelectorAll('.flow-panel').forEach(function(panel) {
      if (panel._flowRoot && panel._flowRoot._flowState) savedFlows.push({ root: panel._flowRoot, st: panel._flowRoot._flowState, data: panel._flowData });
    });
    APP.doPaipan();
    savedFlows.forEach(function(s) { s.root._flowState = s.st; refreshFlow(s.root, s.data); });
    return;
  }
  document.querySelectorAll('.flow-panel').forEach(function(panel) { refreshFlow(panel._flowRoot, panel._flowData); });
}

function locateFlowDate(input) {
  var status = input.closest('.flow-date-picker').querySelector('.flow-date-status');
  if (!input.value || !input.validity.valid) { status.textContent = '请选择有效的新历日期'; return; }
  var parts = input.value.split('-').map(Number);
  var date = new Date(0);
  date.setUTCFullYear(parts[0], parts[1] - 1, parts[2]);
  var day = date.getTime();
  var spring = ALGO.getSolarTerm(parts[0], 2);
  if (!spring) { status.textContent = '所选日期超出节气数据范围'; return; }
  var year = parts[0] - (day < spring.getTime() ? 1 : 0);
  var months = flowMonths(year);
  var month = months.findIndex(function(entry) { return entry.start && entry.end && day >= entry.start.getTime() && day < entry.end.getTime(); });
  if (month < 0) { status.textContent = '所选日期超出节气数据范围'; return; }
  var container = input.parentElement;
  while (container && !container._paipanData) container = container.parentElement;
  if (!container) return;
  var cards = Array.from(container.querySelectorAll('.bz-twin-card'));
  var roots = cards.length ? cards : [container];
  var targets = roots.map(function(root, index) {
    var data = root._cardData || container._paipanData;
    var luckScope = cards.length ? container.querySelectorAll('.bz-card-luck')[index] || container : container;
    var cell = Array.from(luckScope.querySelectorAll('.li[data-di][data-li]')).find(function(entry) {
      return liunianYearOf(data, Number(entry.dataset.di), Number(entry.dataset.li)) === year;
    });
    return { root: root, data: data, scope: luckScope, cell: cell };
  });
  if (targets.some(function(target) { return !target.cell; })) { status.textContent = '所选日期超出当前排盘的流年范围'; return; }
  targets.forEach(function(target) {
    var dy = Number(target.cell.dataset.di), li = Number(target.cell.dataset.li);
    if (dy >= 0) hiDy(dy, target.scope);
    hiLn(dy, li, target.scope);
    updateCardDyLnColumns(container, target.root, dy, li);
    target.root._flowState = { year: year, month: month, day: day };
  });
  setFlowVisible('day', true);
  targets.forEach(function(target) {
    refreshFlow(target.root, target.data);
    target.root._flowPanel.querySelectorAll('.flow-table-wrap').forEach(function(wrap) {
      var selected = wrap.querySelector('.li.cur');
      if (selected) wrap.scrollTo({ left: Math.max(0, wrap.scrollLeft + selected.getBoundingClientRect().left - wrap.getBoundingClientRect().left - 40), behavior: 'smooth' });
    });
    var section = target.cell.closest('.luck-section');
    if (section) section.scrollTo({ left: Math.max(0, section.scrollLeft + target.cell.getBoundingClientRect().left - section.getBoundingClientRect().left - 40), behavior: 'smooth' });
  });
  refreshJieqi(container, year);
  status.textContent = year + '流年 · ' + months[month].gan + months[month].zhi + '月 · ' + parts[1] + '/' + parts[2] + '日（零点）';
}

function setFlowVisible(kind, checked) {
  if (kind === 'month') { flowMonthOn = checked; if (!checked) flowDayOn = false; }
  else { flowDayOn = checked; if (checked) flowMonthOn = true; }
  document.querySelectorAll('[data-flow]').forEach(function(input) {
    input.checked = input.dataset.flow === 'month' ? flowMonthOn : input.dataset.flow === 'newcal' ? flowNewCal : flowDayOn;
  });
  document.querySelectorAll('.flow-panel').forEach(function(panel) { refreshFlow(panel._flowRoot, panel._flowData); });
}

function refreshFlow(root, data, year) {
  withPanTaiji(root, function() { _refreshFlowInner(root, data, year); });
}
function _refreshFlowInner(root, data, year) {
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
  if (!_multiDL.on) table.querySelectorAll('.col-lm,.col-ld').forEach(function(cell) { cell.remove(); });
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
    function btnHtml(kd, value, active, picked, label, item) {
      return '<button type="button" class="li' + (active ? ' cur' : '') + (picked ? ' msel' : '') + '" data-flow-' + kd + '="' + value + '" aria-pressed="' + active + '" aria-selected="' + picked + '"><span class="flow-date">' + label + '</span><span class="flow-gz"><span class="' + wxClass(item.gan) + '">' + item.gan + '</span><span class="' + wxClass(item.zhi) + '">' + item.zhi + '</span></span></button>';
    }
    if (kind === 'day') {
      var dows = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      var bodyRows = [];
      var curCells = [];
      var lead = items.length ? (items[0].date.getUTCDay() + 6) % 7 : 0;
      function flushDayRow() {
        while (curCells.length > 0 && curCells.length < 7) curCells.push('<td class="cell flow-day-blank"></td>');
        bodyRows.push('<tr class="luck-row liu-row"><td class="cell rtag">' + (bodyRows.length === 0 ? title : '') + '</td>' + curCells.join('') + '</tr>');
        curCells = [];
      }
      for (var bi = 0; bi < lead; bi++) curCells.push('<td class="cell flow-day-blank"></td>');
      for (var di = 0; di < items.length; di++) {
        var it = items[di];
        var lab = (it.date.getUTCMonth() + 1) + '/' + it.date.getUTCDate();
        curCells.push('<td class="cell">' + btnHtml('day', it.ms, it.ms === state.day, _mdlHasLd(state.year, state.month, it.ms), lab, it) + '</td>');
        if (curCells.length === 7) flushDayRow();
      }
      if (curCells.length) flushDayRow();
      return '<div class="flow-table-wrap"><table class="luck-table flow-table flow-day-table"><tbody><tr class="luck-row flow-dow-row"><td class="cell rtag">' + title + '</td>' + dows.map(function(d) { return '<td class="cell flow-dow">' + d + '</td>'; }).join('') + '</tr>' + bodyRows.join('') + '</tbody></table></div>';
    }
    var rowCount = Math.ceil(items.length / 6);
    var cells = [];
    for (var columnIndex = 0; columnIndex < 6; columnIndex++) {
      var entries = [];
      for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        var at = rowIndex * 6 + columnIndex;
        if (at < items.length) entries.push(at);
      }
      var content = entries.map(function(index) {
        var item = items[index];
        var active = index === state.month;
        var label = flowNewCal && item.start ? (item.start.getUTCMonth() + 1) + '月' : cnMonthLabel(index);
        return btnHtml('month', index, active, _mdlHasLm(state.year, index), label, item);
      }).join('');
      cells.push('<td class="cell">' + content + '</td>');
    }
    return '<div class="flow-table-wrap"><table class="luck-table flow-table"><tbody><tr class="luck-row liu-row"><td class="cell rtag">' + title + '</td>' + cells.join('') + '</tr></tbody></table></div>';
  }
  panel.innerHTML = '<div class="luck-table-label">' + (flowNewCal ? state.year + ' 年' : gzYearLabel(state.year) + '年') + ' · 十二节气月</div>' + (_multiDL.on ? '<div class="flow-msel-hint">多选模式：先在运表勾大运/流年，再勾流月（≤' + MDL_LM_MAX + '）与流日（≤' + MDL_LD_MAX + '）；未勾流年的月不响应，取消上层联动清下层</div>' : '') + flowTable(months, 'month', '流月') + (flowDayOn ? '<div class="luck-table-label flow-day-label">' + selected.gan + selected.zhi + '月 · 流日</div>' + flowTable(days, 'day', '流日') + '<div class="flow-note">' + (days.length ? '交节日同时列入相邻两月，以交节时刻为界。' : '该年份节气数据超出范围，无法展开流日。') + '</div>' : '');
  panel.querySelectorAll('[data-flow-month]').forEach(function(buttonEl) {
    var mIdx = Number(buttonEl.dataset.flowMonth);
    buttonEl.onclick = function() {
      if (_multiDL.on) {
        state.month = mIdx; state.day = null;
        multiDLPickLm(root, state.year, mIdx);
        return;
      }
      state.month = mIdx; state.day = null; refreshFlow(root, data);
    };
  });
  panel.querySelectorAll('[data-flow-day]').forEach(function(buttonEl) {
    var dMs = Number(buttonEl.dataset.flowDay);
    buttonEl.onclick = function() {
      if (_multiDL.on) { multiDLPickLd(root, state.year, state.month, dMs); return; }
      state.day = dMs; refreshFlow(root, data);
    };
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
      if (row.classList.contains('hd')) cell.innerHTML = row.querySelector('[data-pk="nian"]') || row.textContent.indexOf('年柱') >= 0 ? title : '';
      row.appendChild(cell);
    });
  }
  // v0.63.0 多选模式下主表流月/流日列由 applyMultiDL 统一插（此处单选列会被其清除，直接跳过省一次重复插）
  // v0.76.0 列头对齐大运流年：始终带 dyln-yr 月/日小字，标签算法与面板按钮一致
  if (!_multiDL.on) {
    var yrTag63 = flowNewCal ? state.year + '年' : gzYearLabel(state.year);
    appendColumn(selected, 'col-lm', '流月' + dyLnYearHtml(yrTag63 + '·' + (flowNewCal && selected.start ? (selected.start.getUTCMonth() + 1) + '月' : cnMonthLabel(state.month))));
    if (flowDayOn && selectedDay) appendColumn(selectedDay, 'col-ld', '流日' + dyLnYearHtml(yrTag63 + '·' + (selectedDay.date.getUTCMonth() + 1) + '/' + selectedDay.date.getUTCDate()));
  }
  document.querySelectorAll('[data-flow]').forEach(function(input) {
    input.checked = input.dataset.flow === 'month' ? flowMonthOn : input.dataset.flow === 'newcal' ? flowNewCal : flowDayOn;
  });
}

// ===== 转换太极点：点击原局四柱天干/藏干弹窗换十神参照系（仅单盘主表） =====
var TAIJI_COLS = ['nian', 'yue', 'ri', 'shi'];
var TAIJI_COL_NAMES = { nian:'年干', yue:'月干', ri:'日干', shi:'时干', taiNian:'胎年干', tai:'胎元干', ming:'命宫干', shen:'身宫干' };
function inMainChart(el) {
  var t = el.closest ? el.closest('table.chart') : null;
  return !!(t && !t.closest('.bz-twin-card') && !t.closest('.cmp-card') && !t.closest('.bz-card-luck'));
}
// v0.51.0 对比排盘太极点：本盘 > 全局 > 主表TAIJI（渲染包络内生效，主表状态不受影响）
var CMP_TAIJI = { byPan: {}, global: null };
function setCmpTaijiLocal(panKey, info) { CMP_TAIJI.byPan[panKey] = { gan: info.gan, col: info.col, kind: info.kind }; }
function setCmpTaijiGlobal(info) { CMP_TAIJI.global = { gan: info.gan, col: info.col, kind: info.kind }; CMP_TAIJI.byPan = {}; }
function clearCmpTaijiLocal(panKey) { delete CMP_TAIJI.byPan[panKey]; }
function clearCmpTaijiGlobal() { CMP_TAIJI.global = null; }
function clearAllCmpTaiji() { CMP_TAIJI.byPan = {}; CMP_TAIJI.global = null; }
function getCmpTaiji() { return CMP_TAIJI; }
function cmpEffTaiji(panKey) {
  if (CMP_TAIJI.byPan[panKey]) return CMP_TAIJI.byPan[panKey];
  if (CMP_TAIJI.global) return CMP_TAIJI.global;
  var t = getTaiji();
  return t.active ? t : null;
}
function withPanTaiji(el, fn) {
  var card = el && el.closest ? el.closest('.cmp-card') : null;
  if (!card) { fn(); return; }
  var saved = getTaiji();
  var eff = cmpEffTaiji(card.getAttribute('data-key'));
  if (eff) ALGO.setTaiji(eff.gan, eff.col, eff.kind); else ALGO.clearTaiji();
  try { fn(); } finally {
    if (saved.active) ALGO.setTaiji(saved.gan, saved.col, saved.kind); else ALGO.clearTaiji();
  }
}
function taijiScopeOf(tr) {
  if (inMainChart(tr)) return 'main';
  if (tr.closest && tr.closest('.cmp-card')) return 'cmp';
  return null;
}
function taijiDispatch(e, scope, td, info) {
  // main 拦冒泡；cmp 不拦——v0.43 关系高亮委托（cmpTrack 级）需照常收到点击
  if (scope === 'main') e.stopPropagation();
  if (scope === 'cmp') {
    var card = td.closest('.cmp-card');
    showCmpTaijiMenu(e, info, card ? card.getAttribute('data-key') : '');
    return;
  }
  showTaijiMenu(e, info);
}
function cellGanText(td) {
  var g = td.querySelector('.ssh-g-g');
  return (g ? g.textContent : td.textContent).trim();
}
function bindTaijiClicks(container) {
  container.querySelectorAll('tr[data-row-type="ln1"]').forEach(function(tr) {
    var scope = taijiScopeOf(tr);
    if (!scope) return;
    Array.prototype.forEach.call(tr.cells, function(td) {
      var i = td.cellIndex;
      if (i < 1 || i > 4) return;
      td.addEventListener('click', function(e) {
        taijiDispatch(e, scope, td, { gan: cellGanText(td), col: TAIJI_COLS[i - 1], kind: 'gan' });
      });
    });
  });
  container.querySelectorAll('tr[data-sec="cangqi"]').forEach(function(tr) {
    var scope = taijiScopeOf(tr);
    if (!scope) return;
    Array.prototype.forEach.call(tr.cells, function(td) {
      var i = td.cellIndex;
      if (i < 1 || i > 4) return;
      td.addEventListener('click', function(e) {
        var sp = (e.target && e.target.tagName === 'SPAN' && !e.target.classList.contains('rl')) ? e.target : null;
        if (!sp) return;
        taijiDispatch(e, scope, td, { gan: sp.textContent.trim(), col: TAIJI_COLS[i - 1], kind: 'cang' });
      });
    });
  });
  // v0.50.0 三垣区：干行（tr.rg 含 data-gk="gan"）与藏气行可设太极点，col=taiNian/tai/ming/shen
  var SY_KEYS = ['taiNian', 'tai', 'ming', 'shen'];
  container.querySelectorAll('tr.rg[data-sec="sanyuan"]').forEach(function(tr) {
    if (!tr.querySelector('td[data-gk="gan"]')) return;
    var scope = taijiScopeOf(tr);
    if (!scope) return;
    Array.prototype.forEach.call(tr.cells, function(td) {
      var i = td.cellIndex;
      if (i < 1 || i > 4) return;
      td.addEventListener('click', function(e) {
        if (!td.textContent.trim()) return;
        taijiDispatch(e, scope, td, { gan: cellGanText(td), col: SY_KEYS[i - 1], kind: 'gan' });
      });
    });
  });
  container.querySelectorAll('tr[data-sec="sanyuan cangqi"]').forEach(function(tr) {
    var scope = taijiScopeOf(tr);
    if (!scope) return;
    Array.prototype.forEach.call(tr.cells, function(td) {
      var i = td.cellIndex;
      if (i < 1 || i > 4) return;
      td.addEventListener('click', function(e) {
        var sp = (e.target && e.target.tagName === 'SPAN' && !e.target.classList.contains('rl')) ? e.target : null;
        if (!sp || !sp.textContent.trim()) return;
        taijiDispatch(e, scope, td, { gan: sp.textContent.trim(), col: SY_KEYS[i - 1], kind: 'cang' });
      });
    });
  });
}
function closeTaijiMenu() {
  document.removeEventListener('click', closeTaijiMenu);
  var m = document.getElementById('taijiMenu');
  if (m) m.parentNode.removeChild(m);
}
function showTaijiMenu(e, info) {
  closeTaijiMenu();
  var t = getTaiji();
  var isCur = t.active && t.gan === info.gan && t.col === info.col && t.kind === info.kind;
  var colName = TAIJI_COL_NAMES[info.col] || info.col;
  var posName = colName + (info.kind === 'cang' ? '·藏干' : '');
  var m = document.createElement('div');
  m.id = 'taijiMenu';
  m.className = 'tj-menu';
  var mainBtn = document.createElement('button');
  mainBtn.textContent = isCur
    ? '恢复日主太极点（当前 ' + info.gan + ' · ' + posName + '）'
    : '设为新太极点：' + info.gan + '（' + posName + '）';
  mainBtn.onclick = function(ev) { ev.stopPropagation(); applyTaiji(info, isCur); };
  var cancelBtn = document.createElement('button');
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = function(ev) { ev.stopPropagation(); closeTaijiMenu(); };
  m.appendChild(mainBtn);
  m.appendChild(cancelBtn);
  document.body.appendChild(m);
  var x = Math.min(e.clientX, window.innerWidth - m.offsetWidth - 12);
  var y = Math.min(e.clientY, window.innerHeight - m.offsetHeight - 12);
  m.style.left = Math.max(8, x) + 'px';
  m.style.top = Math.max(8, y) + 'px';
  setTimeout(function() { document.addEventListener('click', closeTaijiMenu, { once: true }); }, 0);
}
function applyTaiji(info, isCur) {
  if (isCur) ALGO.clearTaiji();
  else ALGO.setTaiji(info.gan, info.col, info.kind);
  closeTaijiMenu();
  var data = window._paipanData;
  if (!data) return;
  renderChart(data, 1, 'output');
  if (window.GONGWEI && typeof GONGWEI.updateGongWeiTags === 'function') GONGWEI.updateGongWeiTags();
}

// v0.51.0 对比排盘太极点菜单：本盘（仅该卡换算）/ 全局（所有对比卡以该干为中心）
function finishCmpTaiji() {
  closeTaijiMenu();
  if (typeof _cmpHlClearAll === 'function') _cmpHlClearAll();
  renderCmpTrack();
}
function showCmpTaijiMenu(e, info, panKey) {
  closeTaijiMenu();
  var colName = TAIJI_COL_NAMES[info.col] || info.col;
  var posName = colName + (info.kind === 'cang' ? '·藏干' : '');
  var local = CMP_TAIJI.byPan[panKey];
  var glob = CMP_TAIJI.global;
  var samePos = function(t) { return t && t.gan === info.gan && t.col === info.col && t.kind === info.kind; };
  var isLocalCur = !!local && samePos(local);
  var isGlobalCur = !local && !!glob && samePos(glob);
  var m = document.createElement('div');
  m.id = 'taijiMenu';
  m.className = 'tj-menu';
  var b1 = document.createElement('button');
  b1.textContent = isLocalCur
    ? '恢复本盘日主太极点（当前 ' + info.gan + ' · ' + posName + '）'
    : '设为本盘新的太极点：' + info.gan + '（' + posName + '）';
  b1.onclick = function(ev) {
    ev.stopPropagation();
    if (isLocalCur) clearCmpTaijiLocal(panKey); else setCmpTaijiLocal(panKey, info);
    finishCmpTaiji();
  };
  var b2 = document.createElement('button');
  b2.textContent = isGlobalCur
    ? '恢复全局日主太极点（当前 ' + info.gan + ' · ' + posName + '）'
    : '设为全局新的太极点：' + info.gan + '（' + posName + '）';
  b2.onclick = function(ev) {
    ev.stopPropagation();
    if (isGlobalCur) clearCmpTaijiGlobal(); else setCmpTaijiGlobal(info);
    finishCmpTaiji();
  };
  var cancelBtn = document.createElement('button');
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = function(ev) { ev.stopPropagation(); closeTaijiMenu(); };
  m.appendChild(b1);
  m.appendChild(b2);
  m.appendChild(cancelBtn);
  document.body.appendChild(m);
  var x = Math.min(e.clientX, window.innerWidth - m.offsetWidth - 12);
  var y = Math.min(e.clientY, window.innerHeight - m.offsetHeight - 12);
  m.style.left = Math.max(8, x) + 'px';
  m.style.top = Math.max(8, y) + 'px';
  setTimeout(function() { document.addEventListener('click', closeTaijiMenu, { once: true }); }, 0);
}

function bindEvents(data, container) {
  const { daYun, ri, y } = data;
  const riGan = ri.gan;
  container = container || document;
  var cards = container.querySelectorAll('.bz-twin-card');
  if (cards.length) cards.forEach(function(card) { refreshFlow(card, card._cardData || data); });
  else refreshFlow(container, data);

  bindTaijiClicks(container);

  // 大运点击
  container.querySelectorAll('[data-dy]').forEach(c => {
    c.addEventListener('click', () => {
      const i = parseInt(c.dataset.dy);
      // v0.57.0 多选岁运：单人盘勾选大运（≤2，取消时联动清其流年）
      if (_multiDL.on) { multiDLPickDy(container, i, c); return; }
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
    });
  });

  // 流年点击
  container.querySelectorAll('.liu-row .li').forEach(li => {
    li.addEventListener('click', e => {
      e.stopPropagation();
      const di = parseInt(li.dataset.di);
      const liIdx = parseInt(li.dataset.li);
      // v0.57.0 多选岁运：单人盘勾选流年（运前流年不参与）
      if (_multiDL.on) { multiDLPickLn(container, di, liIdx, li); return; }
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
  // v0.53.0 十神组对应名行刷新需要十神参照干
  if (d.ri && d.ri.gan) r.riGan = d.ri.gan;
  return r;
}
function updateCardDyLnColumns(container, clickedEl, dyIdx, lnIdx) {
  withPanTaiji(clickedEl, function() { _updateCardDyLnColumns(container, clickedEl, dyIdx, lnIdx); });
}
function _updateCardDyLnColumns(container, clickedEl, dyIdx, lnIdx) {
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
    if (mainChart) _applyDLUpdates(mainChart, pDy, pLn, true, _zuoRefs(cardData), { dyYear: (dyIdx >= 0 && daYun[dyIdx]) ? daYun[dyIdx].startYear : '', lnYear: lnYear });
    return;
  }

  cards.forEach(function(c) {
    var ct = c.querySelector('.chart-wrap table.chart');
    if (ct) _applyDLUpdates(ct, pDy, pLn, false, _zuoRefs(cardData), { dyYear: (dyIdx >= 0 && daYun[dyIdx]) ? daYun[dyIdx].startYear : '', lnYear: lnYear });
  });
}



// ============ v0.6.6 通用大运/流年列更新函数 ============
// 双模式行映射：isSingle=true → 9行（藏气合并），isSingle=false → 11行（藏干分层）
function _applyDLUpdates(tableEl, pDy, pLn, isSingle, refs, yr) {
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

  var dlGroups = sshSelectedGroups();
  var dlGan = ganSelectedGroups();
  updates.forEach(function(u) {
    var row = getRow(u[0]);
    if (!row) return;
    var tds = row.querySelectorAll('td');
    if (tds.length < 7) return;
    if (u[3] !== undefined) {
      tds[5].className = 'sep col-dy ' + u[3];
      tds[6].className = 'col-ln ' + u[4];
    }
    if (u[0] === 'ln1' && dlGroups.length) {
      tds[5].innerHTML = sshGanVert(u[1] || '', pDy.rs, dlGroups, pDy.gan, dlGan);
      tds[6].innerHTML = sshGanVert(u[2] || '', pLn.rs, dlGroups, pLn.gan, dlGan);
    } else {
      tds[5].innerHTML = u[1] || '';
      tds[6].innerHTML = u[2] || '';
    }
    // v0.29.0 星曜行：把当前大运/流年干支回写到 data-xy-gz，供值级刷新复用（既有条目 u[5]/u[6] 为 undefined，零影响）
    if (u[5] !== undefined) tds[5].setAttribute('data-xy-gz', u[5]);
    if (u[6] !== undefined) tds[6].setAttribute('data-xy-gz', u[6]);
  });

  // v0.56.0 运列表头年份同步（大运=该运起始年，运前无大运年份置空；流年=换算年份）
  if (yr) {
    var dyYrEl = tableEl.querySelector('tr.hd th.col-dy .dyln-yr');
    if (dyYrEl) dyYrEl.textContent = (yr.dyYear === null || yr.dyYear === undefined) ? '' : String(yr.dyYear);
    var lnYrEl = tableEl.querySelector('tr.hd th.col-ln .dyln-yr');
    if (lnYrEl) lnYrEl.textContent = (yr.lnYear === null || yr.lnYear === undefined) ? '' : String(yr.lnYear);
  }
}


// ============ v0.57.0 多选岁运 ============
// 状态：on 开关；dys 已勾大运索引（≤2，点击序，超出挤掉最早）；lns 已勾流年年份（升序，只能属于已勾大运）。
// 主表插列由 applyMultiDL 在 renderChart 尾部做 DOM 注入：早大运=主段时柱右 col-dy，晚大运=三垣段身宫右 col-dy2（复用占位列），流年按归属跟各自大运（col-ln 复用+右扩）；显示序按起始年升序与点击序解耦。取消/挤出大运时其底下的流年联动清除（_mdlPruneLns）。
var _multiDL = { on: false, dys: [], lns: [], lms: [], lds: [] };

function toggleMultiDL() {
  _multiDL.on = !_multiDL.on;
  if (!_multiDL.on) { _multiDL.dys = []; _multiDL.lns = []; _multiDL.lms = []; _multiDL.lds = []; }
  syncMultiDLBtn();
  if (window.APP && APP.doPaipan) APP.doPaipan();
  return _multiDL.on;
}

function syncMultiDLBtn() {
  var btn = document.getElementById('btnMultiDL');
  if (btn) btn.classList.toggle('active', _multiDL.on);
}

function multiDLState() {
  return { on: _multiDL.on, dys: _multiDL.dys.slice(), lns: _multiDL.lns.slice(), lms: _multiDL.lms.map(function(x) { return { y: x.y, m: x.m }; }), lds: _multiDL.lds.map(function(x) { return { y: x.y, m: x.m, d: x.d }; }) };
}

function setMultiDLState(st) {
  _multiDL.on = !!st.on;
  _multiDL.dys = (st.dys || []).slice();
  _multiDL.lns = (st.lns || []).slice().sort(function(a, b) { return a - b; });
  _multiDL.lms = (st.lms || []).slice();
  _multiDL.lds = (st.lds || []).slice();
  _mdlSortLms();
  _mdlSortLds();
}

function _mdlHasLm(y, m) {
  return _multiDL.lms.some(function(x) { return x.y === y && x.m === m; });
}

function _mdlHasLd(y, m, d) {
  return _multiDL.lds.some(function(x) { return x.y === y && x.m === m && x.d === d; });
}

function _mdlSortLms() {
  _multiDL.lms.sort(function(a, b) { return a.y - b.y || a.m - b.m; });
}

function _mdlSortLds() {
  _multiDL.lds.sort(function(a, b) { return a.y - b.y || a.m - b.m || a.d - b.d; });
}

// 流日只能挂在已勾流月底下：流月变更后剪掉失去归属的流日
function _mdlPruneLds() {
  _multiDL.lds = _multiDL.lds.filter(function(x) { return _mdlHasLm(x.y, x.m); });
}

// 流月上限（超出挤掉年份/月份最旧的）
var MDL_LM_MAX = 4, MDL_LD_MAX = 4;

// 流年只能挂在已勾大运底下：大运变更后剪掉失去归属的流年（十年运区间=startYear..+9）；流月/流日级联剪
function _mdlPruneLns(data) {
  if (!data || !data.daYun) return;
  var ok = {};
  _multiDL.dys.forEach(function(di) {
    var d = data.daYun[di];
    if (!d) return;
    for (var yr = d.startYear; yr <= d.startYear + 9; yr++) ok[yr] = true;
  });
  _multiDL.lns = _multiDL.lns.filter(function(yr) { return ok[yr]; });
  _multiDL.lms = _multiDL.lms.filter(function(x) { return _multiDL.lns.indexOf(x.y) >= 0; });
  _mdlPruneLds();
}

// 多选模式点大运格（仅单人盘；双胞胎/合盘卡点击不响应）
function multiDLPickDy(container, i, clickedEl) {
  if (clickedEl && clickedEl.closest && (clickedEl.closest('.bz-twin-card') || clickedEl.closest('.bz-card-luck'))) return;
  var pos = _multiDL.dys.indexOf(i);
  if (pos >= 0) _multiDL.dys.splice(pos, 1);
  else { if (_multiDL.dys.length >= 2) _multiDL.dys.shift(); _multiDL.dys.push(i); }
  _mdlPruneLns(container && container._paipanData);
  if (window.APP && APP.doPaipan) APP.doPaipan();
}

// 多选模式点流年格（运前流年与未勾选大运底下的流年不参与）
function multiDLPickLn(container, di, liIdx, clickedEl) {
  if (di === -1 || _multiDL.dys.indexOf(di) < 0) return;
  if (clickedEl && clickedEl.closest && (clickedEl.closest('.bz-twin-card') || clickedEl.closest('.bz-card-luck'))) return;
  var yr = liunianYearOf(container._paipanData, di, liIdx);
  if (yr === null || yr === undefined) return;
  var pos = _multiDL.lns.indexOf(yr);
  if (pos >= 0) _multiDL.lns.splice(pos, 1);
  else _multiDL.lns.push(yr);
  _multiDL.lns.sort(function(a, b) { return a - b; });
  _multiDL.lms = _multiDL.lms.filter(function(x) { return _multiDL.lns.indexOf(x.y) >= 0; });
  _mdlPruneLds();
  if (window.APP && APP.doPaipan) APP.doPaipan();
  if (pos < 0) {
    // 多选模式下点流年后面板联动切年（必须在 doPaipan 之后设，渲染会清 _flowState），否则后续点月全被「未勾流年」约束拒掉
    document.querySelectorAll('.flow-panel').forEach(function(panel) {
      var root = panel._flowRoot;
      if (root) { root._flowState = { year: yr, month: 0, day: null }; refreshFlow(root, panel._flowData); }
    });
  }
}

// 多选模式勾流月（面板月格）：只能挂已勾流年，取消时联动清其流日；返回是否发生了勾选变更
function multiDLPickLm(container, y, m) {
  if (!_multiDL.on || _multiDL.lns.indexOf(y) < 0) return false;
  var pos = -1;
  for (var i = 0; i < _multiDL.lms.length; i++) {
    if (_multiDL.lms[i].y === y && _multiDL.lms[i].m === m) { pos = i; break; }
  }
  if (pos >= 0) { _multiDL.lms.splice(pos, 1); _mdlPruneLds(); }
  else { if (_multiDL.lms.length >= MDL_LM_MAX) _multiDL.lms.shift(); _multiDL.lms.push({ y: y, m: m }); }
  _mdlSortLms();
  if (window.APP && APP.doPaipan) {
    APP.doPaipan();
    // doPaipan 渲染会清 _flowState，面板年必须在其后恢复，否则月格选中态丢失
    document.querySelectorAll('.flow-panel').forEach(function(panel) {
      var root = panel._flowRoot;
      if (root) { root._flowState = { year: y, month: m, day: null }; refreshFlow(root, panel._flowData); }
    });
  }
  return true;
}

// 多选模式勾流日（面板日格）：只能挂已勾流月
function multiDLPickLd(container, y, m, d) {
  if (!_multiDL.on || !_mdlHasLm(y, m)) return false;
  var pos = -1;
  for (var i = 0; i < _multiDL.lds.length; i++) {
    if (_multiDL.lds[i].y === y && _multiDL.lds[i].m === m && _multiDL.lds[i].d === d) { pos = i; break; }
  }
  if (pos >= 0) _multiDL.lds.splice(pos, 1);
  else { if (_multiDL.lds.length >= MDL_LD_MAX) _multiDL.lds.shift(); _multiDL.lds.push({ y: y, m: m, d: d }); }
  _mdlSortLds();
  if (window.APP && APP.doPaipan) {
    APP.doPaipan();
    document.querySelectorAll('.flow-panel').forEach(function(panel) {
      var root = panel._flowRoot;
      if (root) { root._flowState = { year: y, month: m, day: d }; refreshFlow(root, panel._flowData); }
    });
  }
  return true;
}

function _mdlPill(data) {
  var riGan = data.ri.gan, riZhi = data.ri.zhi, nianZhi = data.nian.zhi, yueZhi = data.yue.zhi;
  return function(gan, zhi) {
    return {
      rs: shiShen(riGan, gan), wg: wxClass(gan), wz: wxClass(zhi),
      gan: gan, zhi: zhi, ny: NAYIN[gan + zhi] || '',
      nayun: nayunChangSheng(NAYIN[gan + zhi], yueZhi),
      xy: changSheng(riGan, zhi), zz: changSheng(gan, zhi),
      kw: gan + zhi === riGan + riZhi ? kongWang(riGan, riZhi) : kongWang(gan, zhi),
      cg: cangGanText(zhi, riGan, 1, 'dayun'),
      sh: gan + zhi === riGan + riZhi ? shenSha(riGan, riZhi, nianZhi, yueZhi) : ''
    };
  };
}

// 按行类型把 p（大运/流年柱）填进 cell；isDy2=false 表示复用的原大运列（class 保持 col-dy）
function _mdlFillCell(cell, tr, p, isDy, isDy2, refs, sshCg, riGan) {
  var t = tr.getAttribute('data-row-type') || '';
  var sec = tr.getAttribute('data-sec') || '';
  if (t === 'sy-rs') t = 'dy1';
  else if (t === 'sy-cg') t = 'ln2';
  else if (t === 'sy-gan') t = 'ln1';
  else if (t === 'sy-zhi') t = 'dy2';
  else if (!t && /sanyuan/.test(sec)) {
    if (tr.querySelector('td[data-gk="gan"]')) t = 'ln1';
    else if (tr.querySelector('td[data-gk="zhi"]')) t = 'dy2';
  }
  var isSy = /sanyuan/.test(sec);
  var isXy = /\bxy\d\b/.test(t) || t === 'xingyao';
  var colorCls = '';
  if (/\bln1\b/.test(t)) colorCls = ' ' + p.wg;
  else if (/\bdy2\b/.test(t)) colorCls = ' ' + p.wz;
  cell.className = isDy ? (isDy2 ? 'sep col-dy2' : (isSy ? 'sep' : 'sep col-dy')) : 'col-ln';
  cell.className += colorCls;
  var X = window.XINGYAO;
  if (isXy) {
    var gz = p.gan + p.zhi;
    cell.setAttribute('data-xy-gz', gz);
    var sys = X ? X.systemOf(gz) : '';
    if (sys) cell.setAttribute('title', sys); else cell.removeAttribute('title');
    cell.innerHTML = X ? _xyEscText(X.nameOf(gz)) : '—';
    return;
  }
  var m = t.match(/\bnz\d\b/);
  if (m) {
    var zk = null;
    for (var k1 in ZUO_TOKEN) if (ZUO_TOKEN[k1] === m[0]) { zk = k1; break; }
    var rg = zk && refs ? refs[ZUO_REF[zk]] : null;
    cell.innerHTML = rg ? changSheng(rg, p.zhi) : '';
    return;
  }
  m = t.match(/\bsk\d\b/);
  if (m) {
    var sk = null;
    for (var k2 in SIT_TOKEN) if (SIT_TOKEN[k2] === m[0]) { sk = k2; break; }
    var z = sk && refs ? refs[SIT_MAIN_COL[sk] + 'Zhi'] : null;
    cell.innerHTML = (z && p.gan) ? changSheng(p.gan, z) : '';
    return;
  }
  if (/\bdy1\b/.test(t)) cell.innerHTML = p.rs;
  else if (/\bln1\b/.test(t)) cell.innerHTML = sshCg ? sshGanVert(p.gan, p.rs, sshSelectedGroups(), p.gan, ganSelectedGroups()) : p.gan;
  else if (/\bdy2\b/.test(t)) cell.innerHTML = p.zhi;
  else if (/\bln2\b/.test(t)) cell.innerHTML = sshCg ? sshCgVert(p, isDy ? 'dayun' : 'liunian', 0, riGan, sshSelectedGroups(), ganSelectedGroups()) : p.cg;
  else if (/\bnayin\b/.test(t)) cell.innerHTML = p.ny;
  else if (/\bnayun\b/.test(t)) cell.innerHTML = p.nayun;
  else if (/\bzhuzuo\b/.test(t)) cell.innerHTML = p.xy;
  else if (/\bzizuo\b/.test(t)) cell.innerHTML = p.zz;
  else if (/\bkongwang\b/.test(t)) cell.innerHTML = p.kw;
  else if (/\bshensha\b/.test(t)) cell.innerHTML = p.sh;
  else cell.innerHTML = '';
}

// 渲染后 DOM 插列：仅当多选开启且有勾选。原 col-ln 列复用为第一个流年列；v0.63.0 流月/流日列挂主段流年列右侧（col-lm/col-ld），多选模式下清掉单选插列。
function applyMultiDL(root, data) {
  syncMultiDLBtn();
  var table = root.querySelector ? root.querySelector('table.chart') : null;
  if (!table || !data || !data.daYun || !data.daYun.length) return;
  if (!_multiDL.on) return;
  table.querySelectorAll('.col-lm,.col-ld').forEach(function(cell) { cell.remove(); });
  if (!_multiDL.dys.length && !_multiDL.lns.length && !_multiDL.lms.length && !_multiDL.lds.length) return;
  var daYun = data.daYun;
  var nowY = new Date().getFullYear();
  var curIdx = 0;
  for (var i = daYun.length - 1; i >= 0; i--) { if (daYun[i].startYear <= nowY) { curIdx = i; break; } }
  var pill = _mdlPill(data);
  // 早大运=主段时柱右、晚大运=三垣段身宫右：显示序按起始年升序，与勾选点击序解耦
  var dysSorted = _multiDL.dys.slice().sort(function(a, b) { return daYun[a].startYear - daYun[b].startYear; });
  var dy1 = daYun[dysSorted.length ? dysSorted[0] : curIdx];
  var dy2 = dysSorted.length > 1 ? daYun[dysSorted[1]] : null;
  var pDy1 = pill(dy1.gan, dy1.zhi);
  var pDy2 = dy2 ? pill(dy2.gan, dy2.zhi) : null;
  var pLns = _multiDL.lns.map(function(yr) { var gz = liuNianJZ(yr); var p = pill(gz[0], gz[1]); p._yr = yr; return p; });
  var lns1 = [], lns2 = [];
  pLns.forEach(function(p) {
    if (dy2 && p._yr >= dy2.startYear && p._yr <= dy2.startYear + 9) lns2.push(p);
    else lns1.push(p);
  });
  // v0.63.0 流月/流日列：挂主段流年列右侧，显示序升序与勾选序解耦
  var pLms = _multiDL.lms.map(function(x) {
    var mo = (flowMonths(x.y) || [])[x.m];
    if (!mo) return null;
    var p = pill(mo.gan, mo.zhi); p._lm = x;
    // v0.76.0 新历列头用真公历月（旧 x.m+1 是农历序数，立春月会写成 1 月）
    p._lmLabel = flowNewCal && mo.start ? (mo.start.getUTCMonth() + 1) + '月' : cnMonthLabel(x.m);
    return p;
  }).filter(function(p) { return !!p; });
  var pLds = _multiDL.lds.map(function(x) {
    var dt = new Date(x.d);
    var pl = ALGO.dayPillar(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    var p = pill(pl.gan, pl.zhi); p._ld = x; return p;
  });
  function lmHeadLabel(p) { var x = p._lm; return (flowNewCal ? x.y + '年' : gzYearLabel(x.y)) + '·' + p._lmLabel; }
  function ldHeadLabel(x) { var dt = new Date(x.d); return (flowNewCal ? x.y + '年' : gzYearLabel(x.y)) + '·' + (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate(); }
  var refs = _zuoRefs(data);
  var sshCg = sshSelectedGroups().length > 0 || ganSelectedGroups().length > 0;
  var riGan = data.ri.gan;
  var nMain = Math.max(0, lns1.length - 1);
  var nSy = Math.max(0, lns2.length - 1);
  var nLm = pLms.length, nLd = pLds.length;

  var trs = table.querySelectorAll('tr');
  for (var r = 0; r < trs.length; r++) {
    var tr = trs[r];
    if (tr.classList.contains('sanyuan-sep')) {
      var c0 = tr.querySelector('td');
      if (c0) c0.setAttribute('colspan', 7 + nMain + nSy + nLm + nLd);
      continue;
    }
    var isHd = tr.classList.contains('hd');
    // 三垣 hd 行尾两列（运流占位）是 td 不是 th，须混选才能取满 7 列
    var cells = tr.querySelectorAll(isHd ? 'th,td' : 'td');
    if (cells.length < 7) continue;
    var dyCell = cells[5], lnCell = cells[6];
    var isSy = /sanyuan/.test(tr.getAttribute('data-sec') || '');
    var cellTag = isSy ? 'td' : 'th';
    if (isSy) {
      // 身宫右：晚大运 + 其流年（复用段尾占位列）
      if (!pDy2 && !lns2.length) continue;
      if (isHd) {
        if (pDy2) {
          dyCell.className = 'sep col-dy2';
          dyCell.innerHTML = '大运' + dyLnYearHtml(dy2.startYear);
        }
        if (lns2.length) {
          lnCell.className = 'col-ln';
          lnCell.innerHTML = '流年' + dyLnYearHtml(lns2[0]._yr);
          var syRef = lnCell;
          for (var si = 1; si < lns2.length; si++) {
            var syN = document.createElement(cellTag);
            syN.className = 'col-ln';
            syN.innerHTML = '流年' + dyLnYearHtml(lns2[si]._yr);
            syRef.insertAdjacentElement('afterend', syN);
            syRef = syN;
          }
        }
      } else {
        if (pDy2) _mdlFillCell(dyCell, tr, pDy2, true, true, refs, sshCg, riGan);
        if (lns2.length) {
          _mdlFillCell(lnCell, tr, lns2[0], false, false, refs, sshCg, riGan);
          var syRef2 = lnCell;
          for (var sj = 1; sj < lns2.length; sj++) {
            var syTd = document.createElement('td');
            syRef2.insertAdjacentElement('afterend', syTd);
            _mdlFillCell(syTd, tr, lns2[sj], false, false, refs, sshCg, riGan);
            syRef2 = syTd;
          }
        }
      }
    } else {
      if (isHd) {
        dyCell.className = 'sep col-dy';
        dyCell.innerHTML = '大运' + dyLnYearHtml(dy1.startYear);
        if (lns1.length) {
          lnCell.innerHTML = '流年' + dyLnYearHtml(lns1[0]._yr);
          var ref = lnCell;
          for (var li = 1; li < lns1.length; li++) {
            var thn = document.createElement(cellTag);
            thn.className = 'col-ln';
            thn.innerHTML = '流年' + dyLnYearHtml(lns1[li]._yr);
            ref.insertAdjacentElement('afterend', thn);
            ref = thn;
          }
        }
        for (var mi = 0; mi < nLm; mi++) {
          var thm = document.createElement(cellTag);
          thm.className = 'col-lm';
          thm.innerHTML = '流月' + dyLnYearHtml(lmHeadLabel(pLms[mi]));
          ref.insertAdjacentElement('afterend', thm);
          ref = thm;
        }
        for (var di2 = 0; di2 < nLd; di2++) {
          var thd = document.createElement(cellTag);
          thd.className = 'col-ld';
          thd.innerHTML = '流日' + dyLnYearHtml(ldHeadLabel(pLds[di2]._ld));
          ref.insertAdjacentElement('afterend', thd);
          ref = thd;
        }
      } else {
        _mdlFillCell(dyCell, tr, pDy1, true, false, refs, sshCg, riGan);
        if (lns1.length) {
          _mdlFillCell(lnCell, tr, lns1[0], false, false, refs, sshCg, riGan);
          var ref2 = lnCell;
          for (var lj = 1; lj < lns1.length; lj++) {
            var tdn = document.createElement('td');
            ref2.insertAdjacentElement('afterend', tdn);
            _mdlFillCell(tdn, tr, lns1[lj], false, false, refs, sshCg, riGan);
            ref2 = tdn;
          }
        }
        var lmRef = lns1.length ? ref2 : lnCell;
        for (var mj = 0; mj < nLm; mj++) {
          var tdm = document.createElement('td');
          lmRef.insertAdjacentElement('afterend', tdm);
          _mdlFillCell(tdm, tr, pLms[mj], false, false, refs, sshCg, riGan);
          tdm.classList.remove('col-ln');
          tdm.classList.add('col-lm');
          lmRef = tdm;
        }
        for (var dj = 0; dj < nLd; dj++) {
          var tdd = document.createElement('td');
          lmRef.insertAdjacentElement('afterend', tdd);
          _mdlFillCell(tdd, tr, pLds[dj], false, false, refs, sshCg, riGan);
          tdd.classList.remove('col-ln');
          tdd.classList.add('col-ld');
          lmRef = tdd;
        }
      }
    }
  }
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
  var curDyYear = options.curDyYear;
  var curLnYear = options.curLnYear;
  var meta = options.meta || '';

  var riGan = data.ri.gan, riZhi = data.ri.zhi;
  var nian = data.nian, yue = data.yue, ri = data.ri, shi = data.shi;
  var tai = data.tai, taiNian = data.taiNian, ming = data.ming, shen = data.shen;

  function pillar(gan, zhi, type) {
    return {
      gan: gan, zhi: zhi,
      wg: wxClass(gan), wz: wxClass(zhi),
      rs: taijiStemRs(gan, type) || ((gan === riGan && type === 'ri' && !getTaiji().active) ? '日主' : shiShen(riGan, gan, false)),
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
    hdr = '<tr class="hd"><th class="rl">盘式</th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th><th class="sep col-dy">大运'+dyLnYearHtml(curDyYear)+'</th><th class="col-ln">流年'+dyLnYearHtml(curLnYear)+'</th></tr>';
    // v0.10.0 宫位标签行由 updateGongWeiTags() 动态生成
    // 主星(0)
    rows.main[0] = '<tr class="rs" data-row-type="dy1">'+rl('主星')+td(dm('nian.rs'),p.nian.rs)+td(dm('yue.rs'),p.yue.rs)+td(dm('ri.rs'),p.ri.rs)+td(dm('shi.rs'),p.shi.rs)+td('sep col-dy',pDy.rs)+td('col-ln',pLn.rs)+'</tr>';
    // 天干(1)
    rows.main[1] = '<tr class="rg" data-row-type="ln1">'+rl('')+td(dm('nian.gan',p.nian.wg),stemCellHtml(p.nian,'nian'))+td(dm('yue.gan',p.yue.wg),stemCellHtml(p.yue,'yue'))+td(dm('ri.gan',p.ri.wg),stemCellHtml(p.ri,'ri'))+td(dm('shi.gan',p.shi.wg),stemCellHtml(p.shi,'shi'))+td('sep col-dy '+pDy.wg,pDy.gan)+td('col-ln '+pLn.wg,pLn.gan)+'</tr>';
    // 地支(2)
    rows.main[2] = '<tr class="rg" data-row-type="dy2">'+rl('')+td(dm('nian.zhi',p.nian.wz),p.nian.zhi)+td(dm('yue.zhi',p.yue.wz),p.yue.zhi)+td(dm('ri.zhi',p.ri.wz),p.ri.zhi)+td(dm('shi.zhi',p.shi.wz),p.shi.zhi)+td('sep col-dy '+pDy.wz,pDy.zhi)+td('col-ln '+pLn.wz,pLn.zhi)+'</tr>';
    // 本气(3)
    rows.main[3] = '<tr class="rh" data-sec="cangqi" data-row-type="ln2">'+rl('本气')+td(dm('nian.cg.0'),fmtCGLayer((p.nian.ly||[])[0]))+td(dm('yue.cg.0'),fmtCGLayer((p.yue.ly||[])[0]))+td(dm('ri.cg.0'),fmtCGLayer((p.ri.ly||[])[0]))+td(dm('shi.cg.0'),fmtCGLayer((p.shi.ly||[])[0]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[0]))+td('col-ln',fmtCGLayer((pLn.ly||[])[0]))+'</tr>';
    // 中气(4)
    rows.main[4] = '<tr class="rh" data-sec="cangqi" data-row-type="dy3">'+rl('中气')+td(dm('nian.cg.1'),fmtCGLayer((p.nian.ly||[])[1]))+td(dm('yue.cg.1'),fmtCGLayer((p.yue.ly||[])[1]))+td(dm('ri.cg.1'),fmtCGLayer((p.ri.ly||[])[1]))+td(dm('shi.cg.1'),fmtCGLayer((p.shi.ly||[])[1]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[1]))+td('col-ln',fmtCGLayer((pLn.ly||[])[1]))+'</tr>';
    // 余气(5)
    rows.main[5] = '<tr class="rh" data-sec="cangqi" data-row-type="ln3">'+rl('余气')+td(dm('nian.cg.2'),fmtCGLayer((p.nian.ly||[])[2]))+td(dm('yue.cg.2'),fmtCGLayer((p.yue.ly||[])[2]))+td(dm('ri.cg.2'),fmtCGLayer((p.ri.ly||[])[2]))+td(dm('shi.cg.2'),fmtCGLayer((p.shi.ly||[])[2]))+td('sep col-dy',fmtCGLayer((pDy.ly||[])[2]))+td('col-ln',fmtCGLayer((pLn.ly||[])[2]))+'</tr>';
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
  // 运前年数按交运年算（与 daYun[0].startYear 同源；起运不足一年时为 0）
  var preYears = daYun.length > 0 ? Math.max(0, daYun[0].startYear - data.y) : 0;
  var qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + h + ' 小时 ' + mi + ' 分';
  var jyText = '';
  (function() {
    var y = data.y, startYear = y + preYears;
    for (var j = 0; j < 20; j++) {
      var tY = startYear + j;
      if ('己甲'.indexOf(TG[(tY - 4) % 10]) >= 0) { jyText = '逢己、甲年白露后 ' + (jod + jom * 30) + ' 天'; return; }
    }
  })();

  // luck-table 三行：大运头、干支、流年
  var luckRows = [];
  luckRows.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  // 运前列：qyYears > 0 时渲染
  if (preYears > 0) {
    luckRows.push('<div class="cell pre-qy"><span class="year">运前</span><span class="age">'+preYears+'岁前</span></div>');
  }
  for (var l = 0; l < daYun.length; l++) {
    var dy = daYun[l], cls = l === curDyIdx ? ' cell cc' : ' cell';
    luckRows.push('<div class="'+cls+'"><span class="year">'+dy.startYear+'</span><span class="age">'+dy.startAge+'岁</span></div>');
  }
  luckRows.push('</div>');

  luckRows.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  // 运前列：--占位，无 data-dy
  if (preYears > 0) {
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
  if (preYears > 0) {
    var preLis = '';
    for (var py = data.y; py < data.y + preYears; py++) {
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

  // 使用共享 builder 生成卡片（v0.48.0 时柱后加大运/流年列，勾选控制显隐）
  var _curDy = null;
  for (var _cdi = daYun.length - 1; _cdi >= 0; _cdi--) { if (daYun[_cdi].startYear <= nowYear) { _curDy = daYun[_cdi]; break; } }
  var _curLn = liuNianJZ(nowYear);
  var _luckOpts = (_curDy && _curLn) ? { includeLuckCols: true, curDaYun: { gan: _curDy.gan, zhi: _curDy.zhi }, curLiuNian: { gan: _curLn[0], zhi: _curLn[1] }, curDyYear: _curDy.startYear, curLnYear: nowYear } : {};
  var meta1 = (gender==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(data.qiYun.shun, data.gender, data.nian.gan);
  var card1 = buildCardHTML(data, Object.assign({ twin: 1, label: '老大', relation: gender==='男'?'兄':'姐', identClass: 'twin-1', diffMap: diffMap, meta: meta1 }, _luckOpts));
  var card2 = buildCardHTML(data, Object.assign({ twin: 2, label: '老二', relation: gender==='男'?'弟':'妹', identClass: 'twin-2', diffMap: diffMap, meta: meta1 }, _luckOpts));
  var joy = qiYun ? qiYun.years : 0, jom = qiYun ? qiYun.months : 0, jod = qiYun ? qiYun.days : 0;
  // 运前年数按交运年算（与 daYun[0].startYear 同源；起运不足一年时为 0）
  var preYears = daYun.length > 0 ? Math.max(0, daYun[0].startYear - data.y) : 0;
  var qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + h + ' 小时 ' + mi + ' 分';
  function nextJYYear(sY) { for (var i = 0; i < 20; i++) { var tY = sY + i; if ('己甲'.includes(TG[(tY - 4) % 10])) return tY; } return sY; }
  var jyText = '逢己、甲年白露后 ' + (jod + jom * 30) + ' 天';

  var curDyIdx = 0;
  for (var i = daYun.length - 1; i >= 0; i--) { if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; } }

  var luckRows = [];
  // 表头：年份/岁数 + 运前列
  luckRows.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (preYears > 0) { luckRows.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  luckRows.push('</div>');
  // 大运干支 + 运前列
  luckRows.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (preYears > 0) { luckRows.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; var ss = shiShen(riGan, dy.gan), sb = zhiShiShen(riGan, dy.zhi); luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  luckRows.push('</div>');
  // 始于
  luckRows.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (preYears > 0) { luckRows.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+daYun[l].startYear+'</div>'); }
  luckRows.push('</div>');
  // 流年 + 运前列
  luckRows.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (preYears > 0) { var preLis = ''; for (var py = y, liI = 0; py < y + preYears; py++, liI++) { var gz = liuNianJZ(py); preLis += '<span class="li" data-di="-1" data-li="'+liI+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } luckRows.push('<div class="cell pre-qy">'+preLis+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { var dy = daYun[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===curDyIdx&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+lis+'</div>'); }
  luckRows.push('</div>');
  // 止于
  luckRows.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (preYears > 0) { luckRows.push('<div class="cell pre-qy">'+(y + preYears - 1)+'</div>'); }
  for (var l = 0; l < daYun.length; l++) { luckRows.push('<div class="cell'+(l===curDyIdx?' cc':'')+'">'+(daYun[l].startYear + 9)+'</div>'); }
  luckRows.push('</div>');

  var tstTag = '', ryTag = '';
  if (data.trueSolar) { tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 '+pad(data.trueSolar.h)+':'+pad(data.trueSolar.mi)+' ('+(data.trueSolar.offsetMin>=0?'+':'')+Math.round(data.trueSolar.offsetMin)+'分)</span>'; }
  if (renYuan) ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  var nowYearCn = '（当前 ' + nowYear + ' 年）';

  var html = '\n    <div class="top-bar">\n      <div class="person-info"><b>'+(data.displayName || data.name)+'</b><span class="sex-tag">'+(gender==='男'?'乾造':'坤造')+'</span><span class="meta">'+gender+' · '+y+'年'+m+'月'+d+'日 '+pad(h)+':'+pad(mi)+'</span>'+tstTag+ryTag+'</div>\n      <div style="display:flex;align-items:baseline;gap:8px;"><span class="cmp-level-wrap"><button class="btn-simple active" onclick="RENDER.toggleLevel(event)" title="简分级别（点击展开设置）">简分：少</button><div class="cmp-level-pop" onclick="event.stopPropagation()"></div></span><button class="btn-simple xy-trigger" onclick="XINGYAO.openSettings()" title="星曜设置">星曜</button><div class="person-info meta bz-zodiac">'+nian.gan+nian.zhi+'年生 · 属'+shengXiao+' '+nowYearCn+'</div></div>\n    </div>\n'
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="RENDER.switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="RENDER.switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="RENDER.switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + GAN.renderPanel() + SSH.renderPanel() + renderTwinPillarPanel() + flowControlsHTML() + twinSecControlsHTML() + twinRecBtnHtml() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + twinRecPanelHtml()
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
  applyTwinSecs();
  bindEvents(data, container);
  bindRecPanel(container, 'twin|');
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
  // v0.48.0 时柱后加大运/流年列（勾选控制显隐）；出生时间相同，大运取 d1
  var _curDy = null;
  var _lfDy = d1.daYun || [];
  for (var _cdi = _lfDy.length - 1; _cdi >= 0; _cdi--) { if (_lfDy[_cdi].startYear <= nowYear) { _curDy = _lfDy[_cdi]; break; } }
  var _curLn = liuNianJZ(nowYear);
  var _luckOpts = (_curDy && _curLn) ? { includeLuckCols: true, curDaYun: { gan: _curDy.gan, zhi: _curDy.zhi }, curLiuNian: { gan: _curLn[0], zhi: _curLn[1] }, curDyYear: _curDy.startYear, curLnYear: nowYear } : {};
  var card1 = buildCardHTML(d1, Object.assign({ twin: 1, label: '老大', relation: '', identClass: 'twin-1', diffMap: diffMap, meta: meta1 }, _luckOpts));
  var meta2 = (g2==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(d2.qiYun ? d2.qiYun.shun : true, d2.gender, d2.nian.gan);
  var card2 = buildCardHTML(d2, Object.assign({ twin: 2, label: '老二', relation: '', identClass: 'twin-2', diffMap: diffMap, meta: meta2 }, _luckOpts));

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
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="RENDER.switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="RENDER.switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="RENDER.switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + GAN.renderPanel() + SSH.renderPanel() + renderTwinPillarPanel() + flowControlsHTML() + twinSecControlsHTML() + twinRecBtnHtml() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + twinRecPanelHtml()
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
  applyTwinSecs();
  bindEvents(d1, container);
  bindRecPanel(container, 'twin|');
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
      ALGO.clearTaiji();
      output.innerHTML = '';
      renderChart(data);
      setCurrentBaziResult(extractBaziFromPaipan(data));
    }
    // v0.10.0 恢复宫位选中状态并重新渲染标签行
    GONGWEI.selectedGongWei = savedGongWei;
    updateGongWeiTags();
    autoSaveArchive();
    saveLastChart();
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

// 页面加载时优先恢复上次查看的盘（v0.86.8），无记录/解析失败才回落邦顺默认数据
window.addEventListener('DOMContentLoaded', function() {
  migrateFromV1();
  initPresetArchives();
  refreshArchiveModalIfOpen();
  APP.setupTwinTypeChange();
  var restoredLast = false;
  try { restoredLast = restoreLastChart(); } catch (e) { restoredLast = false; }
  doPaipan();
  if (restoredLast) console.log('[bz] 已恢复上次查看的盘');
  if (window.ARCHIVE && window.ARCHIVE.syncResume) window.ARCHIVE.syncResume();
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
      withPanTaiji(cards[k], function() { renderChart(data, 1, body, { luckBelow: true, noTopBar: true }); });
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
    gzHost.innerHTML = GONGWEI.renderGongWeiPanel() + GAN.renderPanel() + SSH.renderPanel();
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

  // ============================================================
  // v0.47.0 一键复制盘面（纯文本导出，粘贴给 AI 用）
  // ============================================================

  // 浮 tip：锚定复制按钮，复用 screenshot-notify 样式（2.5 秒自毁，拒绝 alert）
  function notifyCopyChart(msg) {
    var old = document.getElementById('copyChartNotify');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var btn = document.getElementById('btnCopyChart');
    if (!btn || !btn.parentNode) return;
    var div = document.createElement('div');
    div.id = 'copyChartNotify';
    div.className = 'screenshot-notify';
    div.textContent = msg;
    div.style.left = (btn.offsetLeft + btn.offsetWidth / 2) + 'px';
    div.style.top = (btn.offsetTop + btn.offsetHeight + 6) + 'px';
    div.style.transform = 'translateX(-50%)';
    btn.parentNode.appendChild(div);
    setTimeout(function() {
      if (div.parentNode) div.parentNode.removeChild(div);
    }, 2500);
  }

  // 柱解析：与 renderChart 内 pillar() 同口径（十神/藏干/纳音/星曜/自坐/空亡/神煞）
  function _aiPillar(data, gan, zhi, type) {
    var riGan = data.ri.gan, riZhi = data.ri.zhi;
    return {
      gan: gan, zhi: zhi,
      rs: taijiStemRs(gan, type) || ((type === 'ri' && !getTaiji().active) ? '日主' : shiShen(riGan, gan, false)),
      cg: (CANG_GAN[zhi] || []).map(function(c) { return c + shiShen(riGan, c); }).join('·'),
      ny: NAYIN[gan + zhi] || '',
      xy: changSheng(riGan, zhi),
      zz: changSheng(gan, zhi),
      kw: kongWang(gan, zhi),
      sh: (gan + zhi === riGan + riZhi) ? shenSha(riGan, riZhi, data.nian.zhi, data.yue.zhi) : ''
    };
  }

  function _aiPillarLine(label, p) {
    var parts = [label + ' ' + p.gan + p.zhi, '十神 ' + (p.rs || '—')];
    if (p.cg) parts.push('藏干 ' + p.cg);
    if (p.ny) parts.push('纳音 ' + p.ny);
    if (p.xy) parts.push('星曜 ' + p.xy);
    if (p.zz) parts.push('自坐 ' + p.zz);
    if (p.kw) parts.push('空亡 ' + p.kw);
    if (p.sh) parts.push('神煞 ' + p.sh);
    return '  ' + parts.join(' · ');
  }

  // 生成 AI 友好的盘面纯文本（隐私口径与截图一致：只出 displayName，不读真名）
  function buildAiCopyText(data) {
    if (!data || !data.nian || !data.ri) return '';
    var lines = [];
    lines.push('【八字盘面】');
    var who = data.displayName || data.name || '未命名';
    var birth = '公历 ' + data.y + '-' + pad(data.m) + '-' + pad(data.d) + ' ' + pad(data.h) + ':' + pad(data.mi);
    var notes = [];
    if (data.trueSolar) notes.push('真太阳时' + ((typeof data.lng === 'number' && isFinite(data.lng)) ? '（经度 ' + data.lng + '°）' : ''));
    if (data.julian) notes.push('输入为儒略历 ' + data.julian.fromY + '-' + pad(data.julian.fromM) + '-' + pad(data.julian.fromD) + '（折算格里历 ' + data.y + '-' + pad(data.m) + '-' + pad(data.d) + '）');
    lines.push(who + '　' + (data.gender === '男' ? '乾造' : '坤造') + '　' + birth + (notes.length ? '　（' + notes.join(' · ') + '）' : ''));

    lines.push('');
    lines.push('【四柱】');
    var cols = [['年柱', 'nian'], ['月柱', 'yue'], ['日柱', 'ri'], ['时柱', 'shi']];
    for (var i = 0; i < cols.length; i++) {
      var k = cols[i][1];
      lines.push(_aiPillarLine(cols[i][0], _aiPillar(data, data[k].gan, data[k].zhi, k)));
    }

    lines.push('');
    lines.push('【三垣】');
    var syCols = [['胎年', 'taiNian'], ['胎元', 'tai'], ['命宫', 'ming'], ['身宫', 'shen']];
    for (var j = 0; j < syCols.length; j++) {
      var k2 = syCols[j][1];
      if (data[k2]) lines.push(_aiPillarLine(syCols[j][0], _aiPillar(data, data[k2].gan, data[k2].zhi, k2)));
    }

    var misc = [];
    if (data.shengXiao) misc.push('生肖 ' + data.shengXiao);
    if (data.renYuan) misc.push(data.renYuan);
    if (misc.length) { lines.push(''); lines.push('【其他】' + misc.join(' · ')); }

    if (data.qiYun) {
      var qy = data.qiYun;
      var yangNian = /^[甲丙戊庚壬]$/.test(data.nian.gan);
      var shunNi = qy.shun === undefined ? '' : ' · ' + (qy.shun ? '顺排' : '逆排');
      var qyStart = addYMDH(new Date(data.y, data.m - 1, data.d, data.h || 0, data.mi || 0), qy.years, qy.months, qy.days, qy.hours || 0);
      lines.push('');
      lines.push('【起运】出生后 ' + qy.years + ' 年 ' + qy.months + ' 月 ' + qy.days + ' 天 ' + (qy.hours || 0) + ' 小时（' + (yangNian ? '阳' : '阴') + '年' + (data.gender || '') + shunNi + '）　交运 ' + qyStart.getFullYear() + '-' + pad(qyStart.getMonth() + 1) + '-' + pad(qyStart.getDate()) + ' ' + pad(qyStart.getHours()) + ':' + pad(qyStart.getMinutes()));
    }

    if (data.daYun && data.daYun.length) {
      lines.push('');
      lines.push('【大运】');
      for (var di = 0; di < data.daYun.length; di++) {
        var dy = data.daYun[di];
        lines.push('  第' + (di + 1) + '步 ' + dy.gan + dy.zhi + '　' + dy.startAge + '-' + (dy.startAge + 9) + ' 岁　' + dy.startYear + '-' + (dy.startYear + 9));
      }
      var nowYear = new Date().getFullYear();
      var curIdx = 0;
      for (var x = data.daYun.length - 1; x >= 0; x--) {
        if (data.daYun[x].startYear <= nowYear) { curIdx = x; break; }
      }
      var curDy = data.daYun[curIdx];
      var ln = liuNianJZ(nowYear);
      lines.push('');
      lines.push('【当前】' + nowYear + ' 年　现行大运 ' + curDy.gan + curDy.zhi + '（' + curDy.startYear + ' 年起）　流年 ' + ln[0] + ln[1]);
    } else if (data.daYun) {
      var ln2 = liuNianJZ(new Date().getFullYear());
      lines.push('');
      lines.push('【当前】' + new Date().getFullYear() + ' 年　流年 ' + ln2[0] + ln2[1]);
    }

    // 宫位标注（仅列已勾选组；标签数组按 GW_INDEX 槽位取词）
    if (window.GONGWEI && GONGWEI.selectedGongWei && GONGWEI.selectedGongWei.length && GONGWEI.gongWeiGroups) {
      var POS = [['nian', '年'], ['yue', '月'], ['ri', '日'], ['shi', '时'], ['tai', '胎元'], ['ming', '命宫'], ['shen', '身宫'], ['taiNian', '胎年']];
      var gwLines = [];
      for (var g = 0; g < GONGWEI.selectedGongWei.length; g++) {
        var gname = GONGWEI.selectedGongWei[g];
        var grp = null;
        for (var gg = 0; gg < GONGWEI.gongWeiGroups.length; gg++) {
          if (GONGWEI.gongWeiGroups[gg].name === gname) { grp = GONGWEI.gongWeiGroups[gg]; break; }
        }
        if (!grp || !grp.labels) continue;
        var cells = [];
        for (var pk = 0; pk < POS.length; pk++) {
          var word = grp.labels[CONST.GW_INDEX[POS[pk][0]]];
          if (word) cells.push(POS[pk][1] + '=' + word);
        }
        if (cells.length) gwLines.push('  ' + gname + '：' + cells.join('　'));
      }
      if (gwLines.length) { lines.push(''); lines.push('【宫位标注】'); lines = lines.concat(gwLines); }
    }

    return lines.join('\n');
  }

  // 复制入口：读 window._paipanData（排盘/切卡时已写入），clipboard API 优先、execCommand 兜底
  function copyChartForAi() {
    var data = window._paipanData;
    if (!data || !data.nian || !data.ri) { notifyCopyChart('请先排盘，再复制盘面'); return; }
    var text = buildAiCopyText(data);
    if (!text) { notifyCopyChart('盘面数据为空，无法复制'); return; }
    var ok = function() { notifyCopyChart('盘面已复制，去粘贴给 AI 吧'); };
    var ng = function() { notifyCopyChart('复制失败，请手动全选复制'); };
    var legacy = function() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      document.body.removeChild(ta);
      return done;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function() { legacy() ? ok() : ng(); });
    } else {
      legacy() ? ok() : ng();
    }
  }

  // ===== 挂载到全局命名空间 =====
  window.RENDER = {
    gzYearLabel: gzYearLabel,
    toggleLevel: toggleLevel,
    setLevelPreset: setLevelPreset,
    setRowVisible: setRowVisible,
    setSecVisible: setSecVisible,
    setTwinSecVisible: setTwinSecVisible,
    applyTwinSecs: applyTwinSecs,
    setFlowVisible: setFlowVisible,
    flowMonths: flowMonths,
    flowControlsHTML: flowControlsHTML,
    setFlowNewCal: setFlowNewCal,
    locateFlowDate: locateFlowDate,
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
    bindRecPanel: bindRecPanel,
    recSaveNow: recSaveNow,
    recNotesKey: recNotesKey,
    recNoteCandidates: recNoteCandidates,
    recKeyParts: recKeyParts,
    loadRecAlt: loadRecAlt,
    dimList: dimList,
    dimAdd: dimAdd,
    dimRemove: dimRemove,
    dimVisKey: dimVisKey,
    dimVisGet: dimVisGet,
    dimVisSet: dimVisSet,
    dimVisibleDims: dimVisibleDims,
    renderRecTabs: renderRecTabs,
    switchRecDim: switchRecDim,
    toggleDimPop: toggleDimPop,
    dimVisToggle: dimVisToggle,
    dimHideEmptyToggle: dimHideEmptyToggle,
    dimAddBtn: dimAddBtn,
    dimDeleteBtn: dimDeleteBtn,
    dimRenameBtn: dimRenameBtn,
    dimRenameKey: dimRenameKey,
    dimRenameCommit: dimRenameCommit,
    dimRenameCancel: dimRenameCancel,
    toggleTwinRec: toggleTwinRec,
    isRecOn: isRecOn,
    recAudioToggle: recAudioToggle,
    recMicIsMine: recMicIsMine,
    recMicOpen: recMicOpen,
    recMicGuard: recMicGuard,
    recSilentVerdict: recSilentVerdict,
    recWatchAlert: recWatchAlert,
    recAudioPlay: recAudioPlay,
    recAudioDelete: recAudioDelete,
    recRetf: recRetf,
    bzAsrFix: bzAsrFix,
    bzVoiceClus: bzVoiceClus,
    bzSpkSplit: bzSpkSplit,
    bzF0OfSeg: bzF0OfSeg,
    bzVoiceFeat: bzVoiceFeat,
    recAudioDownload: recAudioDownload,
    recAudioKey: recAudioKey,
    recAudioList: recAudioList,
    renderRecAudioList: renderRecAudioList,
    recAudioPut: recAudioPut,
    recAudioDel: recAudioDel,
    bzAiCfg: bzAiCfg,
    bzAiSave: bzAiSave,
    bzWav16k: bzWav16k,
    bzMono16kNorm: bzMono16kNorm,
    bzEncWav: bzEncWav,
    bzVadSegs: bzVadSegs,
    bzAsrSegs: bzAsrSegs,
    bzFmtTs: bzFmtTs,
    bzSpkPrompt: bzSpkPrompt,
    bzParseSpk: bzParseSpk,
    bzDialogHtml: bzDialogHtml,
    bzAsr: bzAsr,
    bzLlm: bzLlm,
    bzPromptOf: bzPromptOf,
    bzTfName: bzTfName,
    bzTranscriptMd: bzTranscriptMd,
    recZoneBadgeOf: recZoneBadgeOf,
    recZoneRenderInto: recZoneRenderInto,
    transcribeClip: transcribeClip,
    recTfToast: recTfToast,
    bzShowTranscript: bzShowTranscript,
    bzViewTranscript: bzViewTranscript,
    bzAiSettings: bzAiSettings,
    recAudioClearKey: recAudioClearKey,
    recAudioRewriteKey: recAudioRewriteKey,
    recZoneGroupByDay: recZoneGroupByDay,
    recZoneMd: recZoneMd,
    recZoneBadgeOf: recZoneBadgeOf,
    recZoneCardHtml: recZoneCardHtml,
    recZoneRenderInto: recZoneRenderInto,
    recZonePaneOf: recZonePaneOf,
    bzMdSectionOf: bzMdSectionOf,
    recZoneRenderDetail: recZoneRenderDetail,
    renderRecZone: renderRecZone,
    recZoneRecord: recZoneRecord,
    recZoneResetBtn: recZoneResetBtn,
    recAudioResetBtn: recAudioResetBtn,
    _rzDebug: function(op, v) {
      if (op === 'get') return { rec: _rzRec, expect: _rzExpectStop };
      if (op === 'set') _rzRec = v;
      if (op === 'reset') recZoneResetBtn();
      return null;
    },
    recZonePlay: recZonePlay,
    recZoneSeekTs: recZoneSeekTs,
    recZoneOpenDetail: recZoneOpenDetail,
    bzZoneTranscribe: bzZoneTranscribe,
    recZoneCloseDetail: recZoneCloseDetail,
    recZoneTab: recZoneTab,
    recZoneAddNote: recZoneAddNote,
    recZoneSaveNotesMd: recZoneSaveNotesMd,
    recZonePeopleSave: recZonePeopleSave,
    recPeopleDefault: recPeopleDefault,
    recPeopleNorm: recPeopleNorm,
    recPeopleOf: recPeopleOf,
    recPeopleOthers: recPeopleOthers,
    recModelShort: recModelShort,
    recModelsOf: recModelsOf,
    recModelTitleOf: recModelTitleOf,
    recModelLineHtml: recModelLineHtml,
    recModelSrcNote: recModelSrcNote,
    recParseMdModels: recParseMdModels,
    recModelBackfill: recModelBackfill,
    recZoneCardHtml: recZoneCardHtml,
    hiDy: hiDy,
    hiLn: hiLn,
    updateCardDyLnColumns: updateCardDyLnColumns,
    _applyDLUpdates: _applyDLUpdates,
    toggleMultiDL: toggleMultiDL,
    multiDLState: multiDLState,
    setMultiDLState: setMultiDLState,
    multiDLPickDy: multiDLPickDy,
    multiDLPickLn: multiDLPickLn,
    multiDLPickLm: multiDLPickLm,
    multiDLPickLd: multiDLPickLd,
    applyMultiDL: applyMultiDL,
    renderCmpTrack: renderCmpTrack,
    getCmpTaiji: getCmpTaiji,
    clearAllCmpTaiji: clearAllCmpTaiji,
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
    buildAiCopyText: buildAiCopyText,
    copyChartForAi: copyChartForAi,
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

// ============================================================
// v0.88.1 AI 档案搜索：自然语言 → 查询条件 JSON → 本地排盘过滤
// LLM 只负责「翻译」，过滤在本地执行（四柱纯计算，与主排盘同源），
// 「两个同柱」「三戌同支」这类盘面结构特征靠算不靠猜，结果可靠可复现。
// API 走用户自配的 OpenAI 兼容接口（DeepSeek / GLM / OpenAI），key 只存本机 localStorage。
// ============================================================
(function() {
  'use strict';
  var LS_AI = 'bz_ai_cfg';
  var PRESETS = {
    deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
    glm: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }
  };
  var AI_WX_STEM = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
  var AI_WX_ZHI = { '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
  var TG_SET = '甲乙丙丁戊己庚辛壬癸', DZ_SET = '子丑寅卯辰巳午未申酉戌亥';
  var POS_MAP = { '年':'年','月':'月','日':'日','时':'时','year':'年','month':'月','day':'日','hour':'时' };
  // v0.89.0 七柱术语：四柱 + 三垣（胎元/命宫/身宫）。POS_MAP7 只用于解析 pos/柱位参数。
  var POS_MAP7 = { '年':'年','月':'月','日':'日','时':'时','胎元':'胎元','命宫':'命宫','身宫':'身宫',
                   '胎':'胎元','命':'命宫','身':'身宫','tai':'胎元','ming':'命宫','shen':'身宫' };
  function posOf(v) { return v ? (POS_MAP7[v] || POS_MAP[v] || null) : null; }
  var _aiQuery = null, _aiSummary = '', _aiBusy = false, _bar = null;
  var _aiWarn = [], _aiText = '';

  function cfgGet() {
    try { var c = JSON.parse(localStorage.getItem(LS_AI)); return (c && typeof c === 'object') ? c : {}; } catch (e) { return {}; }
  }
  function cfgSet(cfg) { try { localStorage.setItem(LS_AI, JSON.stringify(cfg || {})); return true; } catch (e) { return false; } }
  function cfgReady() { var c = cfgGet(); return !!(c.apiKey && c.baseUrl && c.model); }

  // 每份档案的柱集：four=四柱（默认）；seven=七柱（四柱+三垣）。缺失时本地现算（与主排盘同源 paipan）
  var _ppCache = {}, _ppCacheN = 0;
  function paipanOf(a) {
    if (!a || !a.year) return null;
    var k = (a.id || '') + '#' + (a.name || '') + '|' + a.year + '-' + a.month + '-' + a.day + '-' + a.hour + '-' + (a.min || 0);
    if (Object.prototype.hasOwnProperty.call(_ppCache, k)) return _ppCache[k];
    var p = null;
    try {
      var pp = (typeof ALGO !== 'undefined' && ALGO.paipan) ? ALGO.paipan : (typeof paipan === 'function' ? paipan : null);
      if (pp) p = pp(a.name || '', a.gender || '', a.year, a.month, a.day, a.hour, a.min || 0);
    } catch (e) { p = null; }
    if (_ppCacheN > 600) { _ppCache = {}; _ppCacheN = 0; }
    _ppCache[k] = p; _ppCacheN++;
    return p;
  }
  function pillarsOf(a, sc) {
    if (!a) return null;
    var out = [], p = null;
    if (a.bazi && a.bazi.nian && a.bazi.nian.gan && a.bazi.ri && a.bazi.ri.gan) {
      [['nian','年'],['yue','月'],['ri','日'],['shi','时']].forEach(function(it) {
        var c = a.bazi[it[0]];
        if (c && c.gan) out.push({ pos: it[1], gan: c.gan, zhi: c.zhi });
      });
    } else {
      p = paipanOf(a);
      if (!p) return null;
      [['nian','年'],['yue','月'],['ri','日'],['shi','时']].forEach(function(it2) {
        if (p[it2[0]] && p[it2[0]].gan) out.push({ pos: it2[1], gan: p[it2[0]].gan, zhi: p[it2[0]].zhi });
      });
    }
    if (out.length < 3) return null;
    if (sc === 'seven') {
      var sy = a.sanyuan || null;
      if (!sy || !sy.tai || !sy.tai.gan) { if (!p) p = paipanOf(a); if (p) sy = { tai: p.tai, ming: p.ming, shen: p.shen }; }
      [['tai','胎元'],['ming','命宫'],['shen','身宫']].forEach(function(it3) {
        var c2 = sy && sy[it3[0]];
        if (c2 && c2.gan) out.push({ pos: it3[1], gan: c2.gan, zhi: c2.zhi });
      });
    }
    return out;
  }
  // 大运：优先档案存档，缺失则现算
  function dayunOf(a) {
    if (a && Array.isArray(a.daYun) && a.daYun.length) return a.daYun;
    var p = paipanOf(a);
    return (p && Array.isArray(p.daYun)) ? p.daYun : [];
  }
  function dayunPillars(a) {
    return dayunOf(a).map(function(d, idx) {
      var sY = (d.startYear != null) ? d.startYear : null;
      var sA = (d.startAge != null) ? d.startAge : null;
      return { pos: '大运' + (idx + 1), gan: d.gan || '', zhi: d.zhi || '',
               startAge: sA, endAge: (d.endAge != null ? d.endAge : (sA != null ? sA + 9 : null)),
               startYear: sY, endYear: (sY != null ? sY + 9 : null) };
    });
  }
  // 起运：兼容存档 {year,month,day,hour} 与排盘 {years,months,days,hours}
  function qiyunOf(a) {
    var qy = (a && a.qiYun) || null;
    if (!qy) { var p = paipanOf(a); qy = (p && p.qiYun) || null; }
    if (!qy) return null;
    var n = function(v) { v = Number(v); return isFinite(v) ? v : 0; };
    var yrs = n(qy.years != null ? qy.years : qy.year);
    var mos = n(qy.months != null ? qy.months : qy.month);
    var dys = dayunOf(a);
    var jy = (qy.jyYear != null) ? qy.jyYear
           : (dys[0] && dys[0].startYear != null ? dys[0].startYear
           : (a && a.year ? a.year + Math.round(yrs + mos / 12) : null));
    return { years: yrs, months: mos, days: n(qy.days != null ? qy.days : qy.day), age: yrs + mos / 12, startYear: jy, shun: qy.shun };
  }
  var TG_SET2 = '甲乙丙丁戊己庚辛壬癸', DZ_SET2 = '子丑寅卯辰巳午未申酉戌亥';
  function liunianGZ(yr) {
    yr = Number(yr); if (!isFinite(yr)) return null;
    return { gan: TG_SET2.charAt(((yr - 4) % 10 + 10) % 10), zhi: DZ_SET2.charAt(((yr - 4) % 12 + 12) % 12) };
  }
  var SANHUI_SETS = [['寅','卯','辰','木'],['巳','午','未','火'],['申','酉','戌','金'],['亥','子','丑','水']];
  var SANHE_SETS  = [['申','子','辰','水'],['亥','卯','未','木'],['寅','午','戌','火'],['巳','酉','丑','金']];
  var CHONG_MAP = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' };
  var LIUHE_MAP = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' };
  // 全文索引：identity（姓名|性别|年月日，忽略时辰以容忍改时辰）→ [{src:'note'|'rec', text}]
  var _ftIndex = null, _ftBuilding = null;
  function ftIdOf(a) { return (a && a.name || '') + '|' + (a && a.gender || '') + '|' + (a && a.year) + '|' + (a && a.month) + '|' + (a && a.day); }
  function ftIdFromKey(k) {
    if (!k) return null;
    var parts = String(k).split('|');
    if (parts.length < 7) return null;
    var s = parts.slice(-7);           // name, gender, y, m, d, h, mi
    var first = s[0];
    // 首段可能带库前缀与维度标记：bz_rec_notes_[suffix][§维度]姓名
    if (first.indexOf('bz_rec_notes_') === 0 || first.indexOf('bz_rec_audio_') === 0) {
      var rest = first.replace(/^bz_rec_(notes|audio)_/, '');
      var cut = rest.lastIndexOf('§');
      first = (cut >= 0) ? rest.slice(cut + 1) : rest;
    }
    return first + '|' + s[1] + '|' + s[2] + '|' + s[3] + '|' + s[4];
  }
  function buildFTIndex() {
    var idx = {};
    function push(key, src, text) {
      if (!text) return;
      var id = ftIdFromKey(key);
      if (!id) return;
      (idx[id] = idx[id] || []).push({ src: src, text: String(text) });
    }
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('bz_rec_notes_') !== 0) continue;
        push(k, 'notes', localStorage.getItem(k) || '');
      }
    } catch (e) {}
    // 录音转录：IndexedDB bz_rec_audio / clips（与录音模块同库同名，直连读取，不依赖其私有闭包）
    var p = new Promise(function(res) {
      var out = [];
      try {
        var rq = indexedDB.open('bz_rec_audio', 1);
        rq.onupgradeneeded = function() {
          var db0 = rq.result;
          if (!db0.objectStoreNames.contains('clips')) {
            var st0 = db0.createObjectStore('clips', { keyPath: 'id' });
            st0.createIndex('key', 'key', { unique: false });
          }
        };
        rq.onsuccess = function() {
          var db = rq.result;
          try {
            var rq2 = db.transaction('clips', 'readonly').objectStore('clips').openCursor();
            rq2.onsuccess = function() {
              var cur = rq2.result;
              if (cur) { out.push(cur.value); cur.continue(); }
              else { try { db.close(); } catch (e2) {} res(out); }
            };
            rq2.onerror = function() { try { db.close(); } catch (e3) {} res(out); };
          } catch (e5) { try { db.close(); } catch (e6) {} res(out); }
        };
        rq.onerror = function() { res(out); };
      } catch (e7) { res(out); }
    });
    return p.then(function(clips) {
      (clips || []).forEach(function(cl) {
        var txt = (cl.transcript && (cl.transcript.text || cl.transcript.raw)) || '';
        if (cl.notes && cl.notes.length) {
          var ns = [];
          for (var j = 0; j < cl.notes.length; j++) ns.push((cl.notes[j] && cl.notes[j].text) || '');
          txt += '\n' + ns.join('\n');
        }
        push(cl.key || '', 'rec', txt);
      });
      return idx;
    }).catch(function() { return idx; });
  }
  function ensureFTIndex() {
    if (_ftIndex) return Promise.resolve(_ftIndex);
    if (_ftBuilding) return _ftBuilding;
    _ftBuilding = buildFTIndex().then(function(idx) { _ftIndex = idx; _ftBuilding = null; return idx; },
                                     function() { _ftBuilding = null; return {}; });
    return _ftBuilding;
  }
  function queryNeedsFT(q) {
    if (!q || typeof q !== 'object') return false;
    if (q.type === 'text') return true;
    if (Array.isArray(q.conds)) { for (var i = 0; i < q.conds.length; i++) if (queryNeedsFT(q.conds[i])) return true; }
    if (q.cond && queryNeedsFT(q.cond)) return true;
    return false;
  }
  function collectUnsupported(q, out) {
    out = out || [];
    if (!q || typeof q !== 'object') return out;
    if (q.type === 'unsupported') out.push(String(q.need || q.reason || '未命名的条件'));
    if (Array.isArray(q.conds)) { for (var i = 0; i < q.conds.length; i++) collectUnsupported(q.conds[i], out); }
    if (q.cond) collectUnsupported(q.cond, out);
    return out;
  }
  function plsFor(a, sc) {
    if (sc === 'dayun') return dayunPillars(a);
    if (sc === 'seven') return pillarsOf(a, 'seven');
    return pillarsOf(a);
  }
  function gzName(c) { return (c && c.gan ? c.gan : '') + (c && c.zhi ? c.zhi : ''); }

  function sameGroupCount(pls, key) {
    var m = {}, max = 0;
    for (var i = 0; i < pls.length; i++) {
      var v = key === 'gz' ? gzName(pls[i]) : pls[i][key];
      m[v] = (m[v] || 0) + 1;
      if (m[v] > max) max = m[v];
    }
    return max;
  }

  // v0.88.1 纯十神：不走 ALGO.shiShen，避开太极激活换中心的副作用（档案搜索永远按原生日主）
  function aiShiShen(riGan, gan) {
    var WX = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };
    if (!WX[riGan] || !WX[gan]) return '?';
    if (riGan === gan) return '比肩';
    var dw = WX[riGan], tw = WX[gan];
    var yy = ('甲丙戊庚壬'.indexOf(riGan) >= 0) === ('甲丙戊庚壬'.indexOf(gan) >= 0);
    if (dw === tw) return yy ? '比肩' : '劫财';
    var sheng = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
    var ke = { '木':'土','土':'水','水':'火','火':'金','金':'木' };
    if (sheng[dw] === tw) return yy ? '食神' : '伤官';
    if (sheng[tw] === dw) return yy ? '枭神' : '正印';
    if (ke[dw] === tw) return yy ? '偏财' : '正财';
    if (ke[tw] === dw) return yy ? '七杀' : '正官';
    return '?';
  }
  var SS_ALIAS = { '偏官':'七杀', '七煞':'七杀' };

  // 单条件求值。a=档案，pls=四柱（可为 null），c=条件
  function matchCond(a, pls, c) {
    if (!c || typeof c !== 'object' || !c.type) return false;
    var t = c.type;
    if (t === 'unsupported') return false; // v0.89.0 模型明示「这条我表达不了」，不计命中，由 UI 告警
    // v0.89.0 scope 分层：four=四柱（默认）/ seven=七柱（含三垣）/ dayun=大运
    var scope = c.scope || 'four';
    if (scope === 'seven' || scope === 'dayun') pls = plsFor(a, scope);
    var pls4 = (scope === 'four') ? pls : pillarsOf(a);
    if (t === 'name') {
      var s = ((a.nickname || '') + (a.yiming || '') + (a.name || '')).toLowerCase();
      return s.indexOf(String(c.text == null ? '' : c.text).toLowerCase()) >= 0;
    }
    if (t === 'gender') return a.gender === c.value;
    if (t === 'birthday') {
      if (!a.year || !a.month || !a.day) return false;
      var v = a.year * 10000 + a.month * 100 + a.day;
      var lo = 0, hi = 99999999;
      if (c.from) { var f = String(c.from).replace(/[^0-9]/g, ''); if (f.length === 8) lo = +f; }
      if (c.to) { var g = String(c.to).replace(/[^0-9]/g, ''); if (g.length === 8) hi = +g; }
      return v >= lo && v <= hi;
    }
    // 以下依赖四柱
    if (!pls || !pls.length) return false;
    var i, cnt;
    if (t === 'pillar') {
      var gz = String(c.gz || '').trim();
      var part = c.part || (gz.length === 2 ? 'full' : (TG_SET.indexOf(gz) >= 0 ? 'gan' : (DZ_SET.indexOf(gz) >= 0 ? 'zhi' : 'full')));
      var pos = c.pos ? posOf(c.pos) : null;
      return pls.some(function(p) {
        if (pos && p.pos !== pos) return false;
        if (part === 'gan') return p.gan === gz;
        if (part === 'zhi') return p.zhi === gz;
        return p.gan + p.zhi === gz;
      });
    }
    if (t === 'stem') {
      cnt = 0; for (i = 0; i < pls.length; i++) if (pls[i].gan === c.gz) cnt++;
      return cnt >= (c.min || 1);
    }
    if (t === 'branch') {
      cnt = 0; for (i = 0; i < pls.length; i++) if (pls[i].zhi === c.gz) cnt++;
      return cnt >= (c.min || 1);
    }
    if (t === 'gz') {
      cnt = 0; for (i = 0; i < pls.length; i++) if (gzName(pls[i]) === c.gz) cnt++;
      return cnt >= (c.min || 1);
    }
    if (t === 'same_pillar') return sameGroupCount(pls, 'gz') >= (c.min || 2);
    if (t === 'same_stem') return sameGroupCount(pls, 'gan') >= (c.min || 2);
    if (t === 'same_branch') return sameGroupCount(pls, 'zhi') >= (c.min || 2);
    if (t === 'wuxing') {
      cnt = 0;
      for (i = 0; i < pls.length; i++) {
        if (AI_WX_STEM[pls[i].gan] === c.wx) cnt++;
        if (AI_WX_ZHI[pls[i].zhi] === c.wx) cnt++;
      }
      return cnt >= (c.min || 1);
    }
    if (t === 'daymaster') {
      for (i = 0; i < pls4.length; i++) if (pls4[i].pos === '日') return pls4[i].gan === c.gz;
      return false;
    }
    // v0.88.1 十神条件：{"type":"shishen","text":"七杀","where":"gan|zhi|both","pos":"年|月|日|时","min":1}
    // where 默认 gan（透出天干）；zhi=地支本气十神；both=干支都算
    if (t === 'shishen') {
      var want = SS_ALIAS[c.text] || c.text;
      var riGan = '';
      for (i = 0; i < pls.length; i++) if (pls[i].pos === '日') riGan = pls[i].gan;
      if (!riGan) return false;
      var where = c.where || 'gan';
      var pos4 = c.pos ? posOf(c.pos) : null;
      var ZM = (typeof CONST !== 'undefined' && CONST.ZHI_MAIN) ? CONST.ZHI_MAIN : {};
      cnt = 0;
      for (i = 0; i < pls.length; i++) {
        if (pos4 && pls[i].pos !== pos4) continue;
        if ((where === 'gan' || where === 'both') && aiShiShen(riGan, pls[i].gan) === want) { cnt++; continue; }
        if ((where === 'zhi' || where === 'both') && ZM[pls[i].zhi] && aiShiShen(riGan, ZM[pls[i].zhi]) === want) cnt++;
      }
      return cnt >= (c.min || 1);
    }
    if (t === 'nayin') {
      if (typeof NAYIN === 'undefined') return false;
      var pos2 = c.pos ? posOf(c.pos) : null;
      return pls.some(function(p) {
        if (pos2 && p.pos !== pos2) return false;
        var ny = NAYIN[gzName(p)];
        return !!ny && String(ny).indexOf(c.text || '') >= 0;
      });
    }
    if (t === 'year_gz') {
      for (i = 0; i < pls4.length; i++) if (pls4[i].pos === '年') return gzName(pls4[i]) === c.gz;
      return false;
    }
    // ===== v0.89.0 全局搜索：组合局 / 时间轴 / 关系 / 全文 =====
    // 三会局 / 三合局：{"type":"sanhui","gz":"寅卯辰","scope":"seven"}；gz 可省（任意局）、可写五行
    if (t === 'sanhui' || t === 'sanhe') {
      var setsX = (t === 'sanhui') ? SANHUI_SETS : SANHE_SETS;
      var wantX = String(c.gz || c.text || c.wx || '').trim();
      var zsX = [];
      for (i = 0; i < pls.length; i++) zsX.push(pls[i].zhi);
      for (var sx = 0; sx < setsX.length; sx++) {
        var stX = setsX[sx], nmX = stX[0] + stX[1] + stX[2];
        if (wantX) {
          if (wantX.length >= 2) { if (wantX !== nmX) continue; }
          else if (wantX !== stX[3] && nmX.indexOf(wantX) < 0) continue;
        }
        if (zsX.indexOf(stX[0]) >= 0 && zsX.indexOf(stX[1]) >= 0 && zsX.indexOf(stX[2]) >= 0) return true;
      }
      return false;
    }
    // 起运：{"type":"qiyun","field":"age|year","min":5,"max":9}（age=起运岁数，year=交运年）
    if (t === 'qiyun') {
      var qyX = qiyunOf(a);
      if (!qyX) return false;
      var vX = (c.field === 'year') ? qyX.startYear : qyX.age;
      if (vX == null) return false;
      if (c.min != null && vX < Number(c.min)) return false;
      if (c.max != null && vX > Number(c.max)) return false;
      if (c.exact != null && Math.abs(vX - Number(c.exact)) > 0.51) return false;
      return true;
    }
    // 大运：{"type":"dayun","gz":"甲子","min":30,"max":40}（min/max 可指年龄或年份，用 ageMin/yearMin 更精确）
    if (t === 'dayun') {
      var dysX = dayunOf(a);
      if (!dysX.length) return false;
      var wantD = String(c.gz || '').trim();
      var loA = (c.ageMin != null) ? Number(c.ageMin) : (c.min != null && c.field !== 'year' ? Number(c.min) : null);
      var hiA = (c.ageMax != null) ? Number(c.ageMax) : (c.max != null && c.field !== 'year' ? Number(c.max) : null);
      var loY = (c.yearMin != null) ? Number(c.yearMin) : (c.min != null && c.field === 'year' ? Number(c.min) : null);
      var hiY = (c.yearMax != null) ? Number(c.yearMax) : (c.max != null && c.field === 'year' ? Number(c.max) : null);
      for (var dj = 0; dj < dysX.length; dj++) {
        var dX = dysX[dj], gzX = (dX.gan || '') + (dX.zhi || '');
        if (wantD && gzX !== wantD && dX.gan !== wantD && dX.zhi !== wantD) continue;
        var sAX = dX.startAge, eAX = (dX.endAge != null ? dX.endAge : (sAX != null ? sAX + 9 : null));
        var sYX = dX.startYear, eYX = (sYX != null ? sYX + 9 : null);
        if (loA != null && (eAX == null || eAX < loA)) continue;
        if (hiA != null && (sAX == null || sAX > hiA)) continue;
        if (loY != null && (eYX == null || eYX < loY)) continue;
        if (hiY != null && (sYX == null || sYX > hiY)) continue;
        return true;
      }
      return false;
    }
    // 流年干支：{"type":"liunian","gz":"丙午","year":2026} 或 {"type":"liunian","gz":"午","fromYear":2026,"toYear":2035}
    if (t === 'liunian') {
      var ly0 = (c.year != null) ? Number(c.year) : null;
      var ly1 = (c.toYear != null) ? Number(c.toYear) : (c.fromYear != null ? Number(c.fromYear) + 9 : null);
      if (ly0 == null && c.fromYear != null) ly0 = Number(c.fromYear);
      if (ly0 == null && c.age != null && a.year) ly0 = a.year + Number(c.age);
      if (ly0 == null) return true; // 未限定年份范围：任何流年都会轮到，不构成筛选
      if (ly1 == null) ly1 = ly0;
      var wantL = String(c.gz || '').trim();
      var span = (ly1 >= ly0) ? Math.min(ly1 - ly0, 120) : 0;
      for (var ly = 0; ly <= span; ly++) {
        var lgX = liunianGZ(ly0 + ly);
        if (!lgX) continue;
        if (wantL) { if (lgX.gan + lgX.zhi !== wantL && lgX.gan !== wantL && lgX.zhi !== wantL) continue; }
        if (c.wx && AI_WX_ZHI[lgX.zhi] !== c.wx && AI_WX_STEM[lgX.gan] !== c.wx) continue;
        return true;
      }
      return false;
    }
    // 运与命局的关系：{"type":"interact","a":"流年|大运","year":2026,"b":"日","rel":"chong|he|tong|sanhe|sanhui|sameGz|sameGan"}
    if (t === 'interact') {
      var relX = c.rel || 'chong';
      var bPosX = posOf(c.b || '日');
      var bPlsX = plsFor(a, c.bScope || 'four');
      if (!bPlsX) return false;
      var tgtX = null;
      for (i = 0; i < bPlsX.length; i++) if (bPlsX[i].pos === bPosX) { tgtX = bPlsX[i]; break; }
      if (!tgtX) return false;
      var candsX = [], aSide = c.a || '流年';
      if (aSide === '流年' || aSide === 'liunian') {
        var yrsX = [];
        if (c.year != null) yrsX.push(Number(c.year));
        else if (c.age != null && a.year) yrsX.push(a.year + Number(c.age));
        else if (c.fromYear != null || c.toYear != null) {
          var fyX = (c.fromYear != null) ? Number(c.fromYear) : ((a.year || 1900) + (c.age || 0));
          var tyX = (c.toYear != null) ? Number(c.toYear) : fyX + 9;
          for (var yyX = fyX; yyX <= tyX && yyX - fyX < 120; yyX++) yrsX.push(yyX);
        } else return false;
        for (var yiX = 0; yiX < yrsX.length; yiX++) {
          var g3 = liunianGZ(yrsX[yiX]);
          if (g3) candsX.push({ gan: g3.gan, zhi: g3.zhi });
        }
      } else {
        var dpX = dayunPillars(a);
        for (var piX = 0; piX < dpX.length; piX++) {
          if (c.year != null && (dpX[piX].startYear == null || c.year < dpX[piX].startYear || c.year > dpX[piX].endYear)) continue;
          if (c.age != null && (dpX[piX].startAge == null || c.age < dpX[piX].startAge || c.age > dpX[piX].endAge)) continue;
          candsX.push(dpX[piX]);
        }
      }
      for (var cjX = 0; cjX < candsX.length; cjX++) {
        var xX = candsX[cjX];
        if (relX === 'chong' && CHONG_MAP[tgtX.zhi] === xX.zhi) return true;
        if (relX === 'he' && LIUHE_MAP[tgtX.zhi] === xX.zhi) return true;
        if (relX === 'tong' && tgtX.zhi === xX.zhi) return true;
        if (relX === 'sameGz' && (tgtX.gan + tgtX.zhi) === (xX.gan + xX.zhi)) return true;
        if (relX === 'sameGan' && tgtX.gan === xX.gan) return true;
        if (relX === 'sanhe' && tgtX.zhi !== xX.zhi) {
          for (var sm = 0; sm < SANHE_SETS.length; sm++) { var smx = SANHE_SETS[sm]; if (smx.indexOf(tgtX.zhi) >= 0 && smx.indexOf(xX.zhi) >= 0) return true; }
        }
        if (relX === 'sanhui' && tgtX.zhi !== xX.zhi) {
          for (var sn = 0; sn < SANHUI_SETS.length; sn++) { var snx = SANHUI_SETS[sn]; if (snx.indexOf(tgtX.zhi) >= 0 && snx.indexOf(xX.zhi) >= 0) return true; }
        }
      }
      return false;
    }
    // 全文：{"type":"text","q":"关键词","in":"notes|rec|both"}（notes=分析记录，rec=录音转录）
    if (t === 'text') {
      var qX = String(c.q || c.text || '').trim();
      if (!qX) return false;
      var bagX = _ftIndex ? (_ftIndex[ftIdOf(a)] || null) : null;
      if (!bagX) return false;
      var whX = c.in || 'both';
      if (whX === 'note') whX = 'notes';
      for (var biX = 0; biX < bagX.length; biX++) {
        if (whX !== 'both' && bagX[biX].src !== whX) continue;
        if (bagX[biX].text.indexOf(qX) >= 0) return true;
      }
      return false;
    }
    return false; // 未知类型不放行
  }

  function matchQuery(a, pls, q) {
    if (!q || typeof q !== 'object') return false;
    if (q.type) return matchCond(a, pls, q);
    if (q.op === 'and' && Array.isArray(q.conds)) {
      for (var i = 0; i < q.conds.length; i++) if (!matchQuery(a, pls, q.conds[i])) return false;
      return true;
    }
    if (q.op === 'or' && Array.isArray(q.conds)) {
      for (var j = 0; j < q.conds.length; j++) if (matchQuery(a, pls, q.conds[j])) return true;
      return false;
    }
    if (q.op === 'not' && q.cond) return !matchQuery(a, pls, q.cond);
    return false;
  }

  // ===== AI 模式过滤入口（renderArchiveModal 钩子）=====
  function aiMatch(a) { if (!_aiQuery) return true; return matchQuery(a, pillarsOf(a), _aiQuery); }
  function aiActive() { return !!_aiQuery; }
  function aiClear() {
    _aiQuery = null; _aiSummary = ''; _aiWarn = []; _aiText = '';
    barHide();
    // 退出 AI 时清空输入框：否则自然语言会被当成普通关键词过滤，列表变空
    var inp = document.getElementById('archive-search-modal');
    if (inp) inp.value = '';
    if (window.ARCHIVE && ARCHIVE.filterArchives) ARCHIVE.filterArchives('');
  }
  function aiApply() {
    var txt = _aiText || '';
    _aiText = '';
    if (window.ARCHIVE && ARCHIVE.filterArchives) ARCHIVE.filterArchives(txt);
  }
  function aiStatus(hit) {
    if (!_aiQuery || !_bar) return;
    var hasWarn = !!(_aiWarn && _aiWarn.length);
    var warn = hasWarn ? '<span class="archive-ai-warn">⚠ 有 ' + _aiWarn.length + ' 项超出能力：' + escA(_aiWarn.join('、')) + '</span>' : '';
    barHtml('<span class="archive-ai-sum">🤖 ' + escA(_aiSummary) + '</span>' + warn
      + '<span class="archive-ai-n">命中 ' + hit + ' 份</span>'
      + '<button type="button" class="archive-ai-exit" onclick="RENDER_AI.aiClear()">✕ 退出 AI</button>', hasWarn ? 'warn' : '');
  }

  function escA(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function barHtml(html, cls) {
    if (!_bar) return;
    _bar.style.display = 'flex';
    _bar.className = 'archive-ai-bar' + (cls ? ' ' + cls : '');
    _bar.innerHTML = html;
  }
  function barHide() { if (_bar) { _bar.style.display = 'none'; _bar.innerHTML = ''; } }

  // ===== LLM 调用：自然语言 → {summary, query} =====
  // v0.89.0 全局检索提示词：术语表 + 分层 scope + 时间轴 + 全文 + 边界（含 unsupported 出口）
  var SYSTEM_PROMPT = [
    '你是「八字排盘」应用的档案全局检索解析器。把用户的自然语言请求翻译成一个 JSON 查询对象，交给本地引擎对每份命盘过滤。只输出一个 JSON 对象，禁止输出其他文字、注释或代码块标记。',
    '',
    '【术语表】',
    '四柱 = 年柱、月柱、日柱、时柱。',
    '三垣 = 胎元、命宫、身宫（各一柱）。',
    '七柱 = 四柱 + 三垣，共 7 柱。用户说「七柱」「七个柱」「带三垣」「胎元命宫身宫一起看」时，相关柱类条件的 scope 必须写 "seven"。',
    '大运 = 起运后每十年一步的干支，含起始年龄与起始年份。',
    '起运 = 出生后多久交运（岁数/年月）与交运年份。',
    '流年 = 某一公历年份对应的干支（如 2026 = 丙午）。',
    '三会局 = 寅卯辰、巳午未、申酉戌、亥子丑 三支齐全。三合局 = 申子辰、亥卯未、寅午戌、巳酉丑 三支齐全。',
    '透出 = 天干上出现（where="gan"）。本气十神 = 地支主气所对应的十神（where="zhi"）。',
    '',
    '【scope 分层】所有柱类条件都可带 scope 字段：',
    '  "four"（默认）= 只看四柱；',
    '  "seven" = 看七柱（四柱+三垣）；',
    '  "dayun" = 看大运干支（此时 branch/stem/gz/same_* 在大运序列里统计）。',
    '用户没有明确说七柱/三垣时，一律用默认 four，不要擅自加三垣。',
    '',
    '【能力清单】条件类型（type）：',
    '{"type":"name","text":"关键词"} — 姓名/昵称/艺名包含',
    '{"type":"gender","value":"男"} — 性别（男/女）',
    '{"type":"birthday","from":"1980-01-01","to":"1989-12-31"} — 出生日期区间',
    '{"type":"pillar","pos":"日","gz":"甲辰"} — 指定柱的干支。pos 可选 年/月/日/时/胎元/命宫/身宫，缺省=范围内任意柱；gz 可为完整干支、单天干或单地支',
    '{"type":"stem","gz":"甲","min":2} — 天干出现次数 ≥ min',
    '{"type":"branch","gz":"戌","min":3} — 地支出现次数 ≥ min',
    '{"type":"gz","gz":"甲辰","min":1} — 完整干支出现次数 ≥ min',
    '{"type":"same_pillar","min":2} — 有 ≥ min 柱干支完全相同',
    '{"type":"same_stem","min":2} — 有 ≥ min 柱天干相同',
    '{"type":"same_branch","min":2} — 有 ≥ min 柱地支相同',
    '{"type":"wuxing","wx":"金","min":4} — 某五行（木火土金水）个数 ≥ min（按天干+地支本气计）',
    '{"type":"daymaster","gz":"甲"} — 日主为某天干（固定取日柱）',
    '{"type":"shishen","text":"七杀","where":"gan","min":1} — 十神条件。text 用标准名（比肩/劫财/食神/伤官/枭神/正印/偏财/正财/七杀/正官）；where: gan=透出天干（默认）、zhi=地支本气、both=干支都算；pos 可限定柱位',
    '{"type":"nayin","text":"涧下水"} — 纳音名包含',
    '{"type":"year_gz","gz":"丙午"} — 年柱干支（固定取年柱）',
    '{"type":"sanhui","gz":"寅卯辰","scope":"seven"} — 三会局三支齐全。gz 可省略（任意三会局），也可写五行（如"木"）',
    '{"type":"sanhe","gz":"申子辰","scope":"seven"} — 三合局三支齐全，用法同上',
    '{"type":"qiyun","field":"age","min":5,"max":8} — 起运。field: age=起运岁数、year=交运年份；可用 min/max 区间或 exact 精确值',
    '{"type":"dayun","gz":"甲子","ageMin":30,"ageMax":40} — 大运中有某步满足：干支匹配 + 年龄/年份区间有交集。区间字段也可用 yearMin/yearMax',
    '{"type":"liunian","gz":"丙午","fromYear":2026,"toYear":2035} — 该年份区间内出现指定流年干支。必须给年份范围，否则条件无意义',
    '{"type":"interact","a":"流年","year":2026,"b":"日","rel":"chong"} — 运与命局某柱的关系。a: 流年|大运（大运用 age/year 定位某步）；b: 年/月/日/时/胎元/命宫/身宫（bScope 可设 four/seven）；rel: chong=六冲、he=六合、tong=同支、sameGz=同干支、sameGan=同天干、sanhe=三合、sanhui=三会',
    '{"type":"text","q":"关键词","in":"notes"} — 全文检索。in: notes=分析记录、rec=录音转录（含整理稿与原始识别）、both=两者（默认）',
    '{"type":"unsupported","need":"无法表达的需求"} — 明示这条请求超出能力，界面会提示用户，不要假装能查',
    '组合节点：{"op":"and","conds":[...]}、{"op":"or","conds":[...]}、{"op":"not","cond":{...}}',
    '',
    '【边界】以下请求无法用本引擎表达，必须输出 unsupported，禁止用近似条件冒充：',
    '  1) 吉凶评价：婚姻好不好、有没有钱、事业成不成、命好不好；',
    '  2) 旺衰强弱、用神、格局高低、喜忌；',
    '  3) 未实现的柱间关系：刑、害、破、暗合、伏吟、反吟（只支持 chong/he/tong/sanhe/sanhui/sameGz/sameGan）；',
    '  4) 流月、流日、流时；跨盘对比与合盘；',
    '  5) 录音稿历史版本与附件文件（只索引应用内录音转录文本与分析记录）；',
    '  6) 纯事件回忆且记录里没有对应文字（如「去年离婚的那个」而记录没写离婚）。',
    '遇到部分可查、部分不可查的请求：把可查部分写成正常条件，把不可查部分追加一个 unsupported 条件（用 and 连接），并在 summary 里说明哪部分没查。',
    '',
    '【输出格式】{"summary":"一句话向用户确认理解（含降级说明）","query":{条件或组合}}',
    '模糊阈值：「金旺」→ 金≥4；「金多」→ 金≥3；「两个同柱」→ same_pillar min=2。',
    '',
    '【示例】',
    '「七柱地支成三会局的」→ {"summary":"七柱（四柱+三垣）地支构成三会局的命盘","query":{"type":"sanhui","scope":"seven"}}',
    '「四柱里有寅卯辰的」→ {"summary":"四柱地支构成寅卯辰三会木局的命盘","query":{"type":"sanhui","gz":"寅卯辰"}}',
    '「2026 年流年冲日支的」→ {"summary":"2026 丙午年流年地支冲日支的命盘","query":{"type":"interact","a":"流年","year":2026,"b":"日","rel":"chong"}}',
    '「起运在 5 到 8 岁的」→ {"summary":"起运岁数在 5 到 8 岁之间","query":{"type":"qiyun","field":"age","min":5,"max":8}}',
    '「大运里走过甲子的」→ {"summary":"大运序列中出现甲子这一步","query":{"type":"dayun","gz":"甲子"}}',
    '「分析记录里提到离婚的」→ {"summary":"分析记录全文包含「离婚」的命盘","query":{"type":"text","q":"离婚","in":"notes"}}',
    '「七柱有戌且日主甲木的女性」→ {"summary":"七柱中戌出现且日主为甲木的女性","query":{"op":"and","conds":[{"type":"branch","gz":"戌","scope":"seven"},{"type":"daymaster","gz":"甲"},{"type":"gender","value":"女"}]}}',
    '「找婚姻不好的」→ {"summary":"婚姻吉凶属于评价性判断，当前只能按结构或记录检索，例如「分析记录里提到婚姻」","query":{"type":"unsupported","need":"婚姻吉凶评价"}}'
  ].join('\n');

  function extractJson(text) {
    var s = String(text || '');
    var l = s.indexOf('{'), r = s.lastIndexOf('}');
    if (l < 0 || r <= l) return null;
    try { return JSON.parse(s.slice(l, r + 1)); } catch (e) { return null; }
  }

  function aiSearch() {
    if (_aiBusy) return;
    var inp = document.getElementById('archive-search-modal');
    var text = inp ? String(inp.value || '').trim() : '';
    if (!text) {
      barHtml('<span class=\"archive-ai-sum\">请先输入自然语言描述（如「找出七杀和伤官透出的八字」），再点 AI 搜</span><button type=\"button\" class=\"archive-ai-exit\" onclick=\"RENDER_AI.barHide()\">✕ 关闭</button>', 'err');
      if (inp) inp.focus();
      return;
    }
    if (!cfgReady()) {
      barHtml('<span class="archive-ai-sum">⚙ 使用 AI 搜索前，先配置 AI 接口（填一次 API Key 即可，只存在本机）</span><button type="button" class="archive-ai-exit" onclick="RENDER_AI.barHide()">✕ 关闭</button>', 'err');
      aiOpenSettings('使用 AI 搜索前，先配置 AI 接口（填一次 API Key 即可，只存在本机）');
      return;
    }
    var cfg = cfgGet();
    _aiBusy = true;
    barHtml('<span class="archive-ai-sum">🤖 AI 理解中：「' + escA(text) + '」…</span>', 'busy');
    var ac = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var to = setTimeout(function() { if (ac) ac.abort(); }, 75000);
    fetch(String(cfg.baseUrl).replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      signal: ac ? ac.signal : undefined,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        messages: [ { role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: '用户请求：' + text } ]
      })
    }).then(function(r) {
      clearTimeout(to);
      if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + (t ? ' ' + t.slice(0, 120) : '')); });
      return r.json();
    }).then(function(j) {
      var content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      var obj = extractJson(content);
      if (!obj || !obj.query) throw new Error('AI 返回格式异常，请重试或换个说法');
      _aiQuery = obj.query;
      _aiSummary = String(obj.summary || 'AI 已理解你的条件');
      _aiWarn = collectUnsupported(obj.query);
      _aiText = text;
      if (queryNeedsFT(obj.query)) {
        barHtml('<span class="archive-ai-sum">🔍 正在检索分析记录与录音转录…</span>', 'busy');
        return ensureFTIndex().then(function() { aiApply(); });
      }
      aiApply();
    }).catch(function(err) {
      var m = (err && err.name === 'AbortError') ? '请求超时（75 秒）' : (err && err.message ? err.message : '未知错误');
      barHtml('<span class="archive-ai-sum">⚠ AI 请求失败：' + escA(m) + '</span><button type="button" class="archive-ai-exit" onclick="RENDER_AI.barHide()">✕ 关闭</button>', 'err');
    }).then(function() { _aiBusy = false; });
  }

  // ===== 设置面板 =====
  function aiOpenSettings(msg) {
    var old = document.getElementById('aiCfgOverlay');
    if (old) { old.parentNode.removeChild(old); }
    var cfg = cfgGet();
    var ov = document.createElement('div');
    ov.id = 'aiCfgOverlay';
    ov.className = 'ai-cfg-overlay';
    ov.innerHTML = '<div class="ai-cfg-card">'
      + '<div class="ai-cfg-title">🤖 AI 搜索设置</div>'
      + (msg ? '<div class="ai-cfg-msg">' + escA(msg) + '</div>' : '')
      + '<label class="ai-cfg-row">接口<select id="aiCfgProvider">'
      + '<option value="deepseek">DeepSeek（推荐）</option><option value="glm">智谱 GLM</option><option value="openai">OpenAI</option><option value="custom">自定义</option></select></label>'
      + '<label class="ai-cfg-row">接口地址<input id="aiCfgBase" type="text" placeholder="https://api.deepseek.com"></label>'
      + '<label class="ai-cfg-row">模型<input id="aiCfgModel" type="text" placeholder="deepseek-chat"></label>'
      + '<label class="ai-cfg-row">API Key<input id="aiCfgKey" type="password" placeholder="' + (cfg.apiKey ? '已保存（不回显，留空即沿用）' : 'sk-...') + '"></label>'
      + '<div class="ai-cfg-hint">Key 只保存在本机浏览器（localStorage），请求由浏览器直连你选的接口。没有 Key 可在 platform.deepseek.com 申请。</div>'
      + '<div class="ai-cfg-btns"><button type="button" id="aiCfgSave">保存</button><button type="button" id="aiCfgCancel">取消</button></div>'
      + '</div>';
    document.body.appendChild(ov);
    var sel = ov.querySelector('#aiCfgProvider');
    sel.value = PRESETS[cfg.provider] ? cfg.provider : (cfg.baseUrl ? 'custom' : 'deepseek');
    var base = ov.querySelector('#aiCfgBase'), model = ov.querySelector('#aiCfgModel');
    base.value = cfg.baseUrl || PRESETS[sel.value].baseUrl;
    model.value = cfg.model || PRESETS[sel.value].model;
    sel.onchange = function() { if (PRESETS[sel.value]) { base.value = PRESETS[sel.value].baseUrl; model.value = PRESETS[sel.value].model; } };
    ov.querySelector('#aiCfgCancel').onclick = function() { ov.parentNode.removeChild(ov); };
    ov.querySelector('#aiCfgSave').onclick = function() {
      var p = sel.value;
      var nc = {
        provider: p,
        baseUrl: (base.value || '').trim() || (PRESETS[p] ? PRESETS[p].baseUrl : ''),
        model: (model.value || '').trim() || (PRESETS[p] ? PRESETS[p].model : ''),
        apiKey: (ov.querySelector('#aiCfgKey').value || '').trim() || cfg.apiKey || ''
      };
      cfgSet(nc);
      ov.parentNode.removeChild(ov);
      if (window.ARCHIVE && ARCHIVE.flashBackupHint) { try { ARCHIVE.flashBackupHint('AI 设置已保存'); } catch (e) {} }
    };
    ov.addEventListener('click', function(e) { if (e.target === ov) ov.parentNode.removeChild(ov); });
  }

  // ===== UI 注入：搜索行按钮 + 状态条 =====
  var CSS = ''
    + '.archive-ai-btn{margin-left:6px;white-space:nowrap;}'
    + '.archive-ai-gear{margin-left:4px;padding:8px 10px !important;white-space:nowrap;}'
    + '.archive-ai-bar{display:none;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 14px;font-size:12.5px;background:rgba(138,109,59,.08);border-bottom:1px solid var(--c-line);}'
    + '.archive-ai-bar.err{background:rgba(160,60,50,.08);}'
    + '.archive-ai-bar.busy{color:#6b5a3e;}'
    + '.archive-ai-bar.warn{background:rgba(200,140,20,.12);}'
    + '.archive-ai-warn{color:#a06800;font-size:12px;white-space:nowrap;}'
    + '.archive-ai-sum{flex:1;min-width:0;}'
    + '.archive-ai-n{white-space:nowrap;font-weight:600;}'
    + '.archive-ai-exit{border:none;background:none;cursor:pointer;font-size:12px;color:#8a6d3b;padding:2px 4px;}'
    + '.archive-ai-exit:hover{text-decoration:underline;}'
    + '.ai-cfg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:4000;display:flex;align-items:center;justify-content:center;}'
    + '.ai-cfg-card{background:var(--c-paper,#fff);color:var(--c-ink,#222);border-radius:8px;padding:20px 22px;width:min(420px,92vw);box-shadow:0 8px 40px rgba(0,0,0,.25);font-size:13px;}'
    + '.ai-cfg-title{font-size:15px;font-weight:700;margin-bottom:10px;}'
    + '.ai-cfg-msg{font-size:12.5px;color:#8a6d3b;margin-bottom:10px;}'
    + '.ai-cfg-row{display:flex;align-items:center;gap:8px;margin:8px 0;justify-content:space-between;}'
    + '.ai-cfg-row select,.ai-cfg-row input{flex:1;min-width:0;padding:6px 8px;border:1px solid var(--c-line,#ccc);border-radius:4px;font-size:13px;background:#fff;color:#222;}'
    + '.ai-cfg-hint{font-size:11.5px;color:#888;margin:8px 0 12px;line-height:1.5;}'
    + '.ai-cfg-btns{display:flex;gap:8px;justify-content:flex-end;}'
    + '.ai-cfg-btns button{padding:6px 16px;border:none;border-radius:4px;cursor:pointer;font-size:13px;}'
    + '.ai-cfg-btns #aiCfgSave{background:#8a6d3b;color:#fff;}'
    + '.ai-cfg-btns #aiCfgCancel{background:#eee;color:#444;}';

  function inject() {
    var row = null;
    document.querySelectorAll('.archive-modal-search').forEach(function(r) {
      if (!row && r.querySelector('#archive-search-modal')) row = r; // 合盘面板有同名 class，只认含档案搜索框的行
    });
    if (!row || row._aiInjected) return;
    row._aiInjected = true;
    if (!document.getElementById('aiCfgStyle')) {
      var st = document.createElement('style');
      st.id = 'aiCfgStyle';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'archive-search-btn archive-ai-btn';
    b.textContent = '🤖 AI 搜';
    b.title = '用自然语言搜索档案（如：找出有两个同柱的命盘）';
    b.onclick = function() { aiSearch(); };
    var bg = document.createElement('button');
    bg.type = 'button';
    bg.className = 'archive-search-btn archive-ai-gear';
    bg.textContent = '⚙';
    bg.title = 'AI 搜索设置（接口与 Key，只存本机）';
    bg.onclick = function() { aiOpenSettings(''); };
    row.appendChild(b);
    row.appendChild(bg);
    _bar = document.createElement('div');
    _bar.className = 'archive-ai-bar';
    row.parentNode.insertBefore(_bar, row.nextSibling);
    var inp = row.querySelector('#archive-search-modal');
    if (inp) inp.placeholder = '输入姓名筛选，或点 🤖 AI 用一句话搜（如：找出有两个同柱的命盘）';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();

  // ===== 导出 =====
  window.RENDER_AI = {
    aiSearch: aiSearch,
    aiMatch: aiMatch,
    aiActive: aiActive,
    aiStatus: aiStatus,
    aiClear: aiClear,
    barHide: barHide,
    aiOpenSettings: aiOpenSettings,
    cfgGet: cfgGet,
    cfgSet: cfgSet,
    // 测试钩子：直接对单档案求值查询树（不落盘、无副作用）
    debugEval: function(query, archive) { return matchQuery(archive, pillarsOf(archive), query); },
    debugPillars: function(archive) { var p = pillarsOf(archive); return p ? p.map(gzName) : null; },
    // v0.89.0 全局检索测试钩子
    debugPillars7: function(archive) { var p = pillarsOf(archive, 'seven'); return p ? p.map(function(x) { return x.pos + ':' + gzName(x); }) : null; },
    debugQiyun: function(archive) { return qiyunOf(archive); },
    debugDayun: function(archive) { return dayunPillars(archive); },
    debugFT: function() { return ensureFTIndex(); },
    debugPrompt: function() { return SYSTEM_PROMPT; },
    debugQuery: function() { return _aiQuery; },
    debugWarn: function() { return _aiWarn.slice(); },
    debugLiunian: function(yr) { return liunianGZ(yr); }
  };
})();
