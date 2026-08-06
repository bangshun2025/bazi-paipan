/* 八字排盘 v0.16.0 — render.js */
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

function toggleSimple() {
  const tables = document.querySelectorAll('.chart');
  const btn = document.querySelector('.btn-simple');
  const active = btn.classList.toggle('active');
  tables.forEach(t => t.classList.toggle('simple', active));
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
  // 星运
  main.push('<tr class="rm" data-row-type="xingyun">' + rl('星运') +
    cols.map(function(k){return td(dm(k+'.xy'), p[k].xy);}).join('') + '</tr>');
  // 自坐
  main.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') +
    cols.map(function(k){return td(dm(k+'.zz'), p[k].zz);}).join('') + '</tr>');
  // 纳运
  main.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') +
    cols.map(function(k){return td(dm(k+'.nayun'), p[k].nayun);}).join('') + '</tr>');
  // 空亡
  main.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') +
    cols.map(function(k){return td(dm(k+'.kw'), p[k].kw);}).join('') + '</tr>');
  // 神煞
  main.push('<tr class="rm" data-row-type="shensha">' + rl('神煞') +
    cols.map(function(k){return td(dm(k+'.sh'), p[k].sh);}).join('') + '</tr>');

  // === 三垣区 ===
  if (options.includeSanyuan !== false) {
    var syCols = ['tai','ming','shen'];
    sanyuan.push('<tr class="hd">' + th('rl','三垣') + emp('') +
      syCols.map(function(k){return th('', {tai:'胎元',ming:'命宫',shen:'身宫'}[k]);}).join('') + '</tr>');
    sanyuan.push('<tr class="rs">' + rl('主星') + emp('') +
      syCols.map(function(k){return td(dm(k+'.rs'), p[k].rs);}).join('') + '</tr>');
    sanyuan.push('<tr class="rg" data-row-type="ln1">' + rl('') + emp('') +
      syCols.map(function(k){return td(dm(k+'.gan', p[k].wg), p[k].gan);}).join('') + '</tr>');
    sanyuan.push('<tr class="rg" data-row-type="dy2">' + rl('') + emp('') +
      syCols.map(function(k){return td(dm(k+'.zhi', p[k].wz), p[k].zhi);}).join('') + '</tr>');
    ['本气','中气','余气'].forEach(function(lv, li) {
      sanyuan.push('<tr class="rh">' + rl(lv) + emp('') +
        syCols.map(function(k){return td(dm(k+'.cg.'+li), fmtCGLayer((p[k].ly||[])[li]));}).join('') + '</tr>');
    });
    sanyuan.push('<tr class="rn" data-row-type="nayin">' + rl('纳音') + emp('') +
      syCols.map(function(k){return td(dm(k+'.ny'), p[k].ny);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="xingyun">' + rl('星运') + emp('') +
      syCols.map(function(k){return td(dm(k+'.xy'), p[k].xy);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="zizuo">' + rl('自坐') + emp('') +
      syCols.map(function(k){return td(dm(k+'.zz'), p[k].zz);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="nayun">' + rl('纳运') + emp('') +
      syCols.map(function(k){return td(dm(k+'.nayun'), p[k].nayun);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="kongwang">' + rl('空亡') + emp('') +
      syCols.map(function(k){return td(dm(k+'.kw'), p[k].kw);}).join('') + '</tr>');
    sanyuan.push('<tr class="rm" data-row-type="shensha">' + rl('神煞') + emp('') +
      syCols.map(function(k){return td(dm(k+'.sh'), p[k].sh);}).join('') + '</tr>');
  }

  return { main: main, sanyuan: sanyuan };
}

function renderChart(data, twin, targetId) {
  twin = twin || 1;
  targetId = targetId || 'output';
  const { name, gender, y, m, d, h, mi, nian, yue, ri, shi, tai, ming, shen, shengXiao, daYun, qiYun, renYuan } = data;
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
  const pMing = pillar(ming.gan, ming.zhi, 'ming');
  const pShen = pillar(shen.gan, shen.zhi, 'shen');

  // 当前大运索引（找覆盖当前年份的大运）
  const nowYear = new Date().getFullYear();
  let curDyIdx = 0;
  for (let i = daYun.length - 1; i >= 0; i--) {
    if (daYun[i].startYear <= nowYear) { curDyIdx = i; break; }
  }
  const curDy = daYun[curDyIdx];
  const pDy = pillar(curDy.gan, curDy.zhi);

  // 当前流年
  const curLnGz = liuNianJZ(nowYear);
  const pLn = pillar(curLnGz[0], curLnGz[1]);

  // 时间段信息
  const lunarInfo = ''; // 可选：农历日期

  // ---- 起运交运文本 ----
  const joy = qiYun.years, jom = qiYun.months, jod = qiYun.days, joh = qiYun.hours || 0;
  const qiyunText = '出生后 ' + joy + ' 年 ' + jom + ' 月 ' + jod + ' 天 ' + joh + ' 小时';
  const preQyYears = Math.ceil((qiYun.totalMonths || (qiYun.years * 12 + qiYun.months + qiYun.days / 30)) / 12);
  const WUHE = {甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
  // 起运准确日期
  const qyStartDate = new Date(y, m-1, d, h || 0, mi || 0);
  qyStartDate.setFullYear(qyStartDate.getFullYear() + joy);
  qyStartDate.setMonth(qyStartDate.getMonth() + jom);
  qyStartDate.setDate(qyStartDate.getDate() + jod);
  qyStartDate.setHours(qyStartDate.getHours() + joh);
  // 交运年天干对：起运年天干 → 找五合配对
  const jyYearGanIdx = (qyStartDate.getFullYear() - 4) % 10;
  const jyNextGan = TG[jyYearGanIdx];
  const jyHePair = jyNextGan + WUHE[jyNextGan];
  // 交运节气：按起运日期直接查找所在节气月
  let jyTermName = '', daysAfterJY = 0;
  const qyY = qyStartDate.getFullYear();
  for (let mi = 0; mi < 12; mi++) {
    const tIdx = MONTH_TERM[mi];
    let stY = qyY;
    if (tIdx === 0 && mi === 11) stY = (qyStartDate.getMonth() === 0) ? qyY : qyY + 1;
    const st = getSolarTerm(stY, tIdx);
    const stDate = new Date(st.getUTCFullYear(), st.getUTCMonth(), st.getUTCDate());
    const nextMi = (mi + 1) % 12;
    const nextTerm = MONTH_TERM[nextMi];
    let nextY = qyY;
    if (nextTerm <= tIdx) nextY = qyY + 1;
    const nextSt = getSolarTerm(nextY, nextTerm);
    const nextDate = new Date(nextSt.getUTCFullYear(), nextSt.getUTCMonth(), nextSt.getUTCDate());
    if (qyStartDate >= stDate && qyStartDate < nextDate) {
      jyTermName = S_TERM_NAME[tIdx];
      const qyDay2 = new Date(qyStartDate.getFullYear(), qyStartDate.getMonth(), qyStartDate.getDate());
      daysAfterJY = Math.round((qyDay2 - stDate) / 86400000);
      break;
    }
  }
  const jyText = '逢' + jyHePair[0] + '、' + jyHePair[1] + '年' + jyTermName + '后 ' + daysAfterJY + ' 天';

  // ---- 上盘 HTML ----
  function td(cls, txt, ext='') { return '<td class="'+cls+'"'+ext+'>'+txt+'</td>'; }
  function th(cls, txt) { return '<th class="'+cls+'">'+txt+'</th>'; }
  function rl(lbl) { return '<td class="rl">'+lbl+'</td>'; }
  function emp(cls) { return '<td class="'+cls+'"></td>'; }

  const chartRows = [];
  // v0.10.0 宫位标签行由 updateGongWeiTags() 动态生成
  // 柱名头
  chartRows.push('<tr class="hd">'+th('rl','盘式')+th('','年柱')+th('','月柱')+th('','日柱')+th('','时柱')+th('sep','大运')+th('col-ln','流年')+'</tr>');

  // 生成四柱行（5列），再拼接大运/流年列
  var bp = buildPillarRows({ nian:pNian, yue:pYue, ri:pRi, shi:pShi, tai:pTai, ming:pMing, shen:pShen });
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
  mainRows[1] = '<tr class="rg" data-row-type="ln1">'+rl('')+td(pNian.wg,pNian.gan)+td(pYue.wg,pYue.gan)+td(pRi.wg,pRi.gan)+td(pShi.wg,pShi.gan)+td('sep col-dy '+pDy.wg,pDy.gan)+td('col-ln '+pLn.wg,pLn.gan)+'</tr>';
  // 地支行(2)
  mainRows[2] = '<tr class="rg" data-row-type="dy2">'+rl('')+td(pNian.wz,pNian.zhi)+td(pYue.wz,pYue.zhi)+td(pRi.wz,pRi.zhi)+td(pShi.wz,pShi.zhi)+td('sep col-dy '+pDy.wz,pDy.zhi)+td('col-ln '+pLn.wz,pLn.zhi)+'</tr>';
  // 藏气: 单行合并（用 cg 而非 ly），删中气余气
  mainRows[3] = '<tr class="rh" data-row-type="ln2">'+rl('藏气')+td('',pNian.cg)+td('',pYue.cg)+td('',pRi.cg)+td('',pShi.cg)+td('sep col-dy',pDy.cg)+td('col-ln',pLn.cg)+'</tr>';
  mainRows.splice(4, 2); // 删中气、余气 — 单人排盘只保留合并藏气行
  // 纳音 — splice 后索引从 6 偏移至 4
  mainRows[4] = '<tr class="rn" data-row-type="nayin dy3">'+rl('纳音')+td('',pNian.ny)+td('',pYue.ny)+td('',pRi.ny)+td('',pShi.ny)+td('sep col-dy',pDy.ny)+td('col-ln',pLn.ny)+'</tr>';
  // 星运
  mainRows[5] = '<tr class="rm" data-row-type="xingyun ln3">'+rl('星运')+td('',pNian.xy)+td('',pYue.xy)+td('',pRi.xy)+td('',pShi.xy)+td('sep col-dy',pDy.xy)+td('col-ln',pLn.xy)+'</tr>';
  // 自坐
  mainRows[6] = '<tr class="rm" data-row-type="zizuo dy4">'+rl('自坐')+td('',pNian.zz)+td('',pYue.zz)+td('',pRi.zz)+td('',pShi.zz)+td('sep col-dy',pDy.zz)+td('col-ln',pLn.zz)+'</tr>';
  // 纳运
  mainRows[7] = '<tr class="rm" data-row-type="nayun dy5">'+rl('纳运')+td('',pNian.nayun)+td('',pYue.nayun)+td('',pRi.nayun)+td('',pShi.nayun)+td('sep col-dy',pDy.nayun)+td('col-ln',pLn.nayun)+'</tr>';
  // 空亡
  mainRows[8] = '<tr class="rm" data-row-type="kongwang ln4">'+rl('空亡')+td('',pNian.kw)+td('',pYue.kw)+td('',pRi.kw)+td('',pShi.kw)+td('sep col-dy',pDy.kw)+td('col-ln',pLn.kw)+'</tr>';
  // 神煞
  mainRows[9] = '<tr class="rm" data-row-type="shensha dy6">'+rl('神煞')+td('',pNian.sh)+td('',pYue.sh)+td('',pRi.sh)+td('',pShi.sh)+td('sep col-dy',pDy.sh)+td('col-ln',pLn.sh)+'</tr>';
  // 其他行（藏干4,5 等）使用 buildPillarRows 的 + suffix
  for (var fixI = 0; fixI < mainRows.length; fixI++) {
    if (mainRows[fixI] && mainRows[fixI].indexOf('sep col-dy') === -1) {
      mainRows[fixI] = insSuffix(mainRows[fixI], suffixMain);
    }
  }
  chartRows.push.apply(chartRows, mainRows);

  // 三垣行
  var syRows = [];
  // v0.10.0 三垣宫位标签行由 updateGongWeiTags() 动态生成
  syRows.push('<tr class="hd">'+th('rl','三垣')+emp('')+th('','胎元')+th('','命宫')+th('','身宫')+emp('sep')+emp('col-ln')+'</tr>');
  // 用原始 data 生成三垣（不依赖 buildPillarRows 的 level-based 结构）
  syRows.push('<tr class="rs">'+rl('主星')+emp('')+td('',pTai.rs)+td('',pMing.rs)+td('',pShen.rs)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg">'+rl('')+emp('')+td(pTai.wg,pTai.gan)+td(pMing.wg,pMing.gan)+td(pShen.wg,pShen.gan)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rg">'+rl('')+emp('')+td(pTai.wz,pTai.zhi)+td(pMing.wz,pMing.zhi)+td(pShen.wz,pShen.zhi)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rh">'+rl('藏气')+emp('')+td('',pTai.cg)+td('',pMing.cg)+td('',pShen.cg)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rn" data-row-type="nayin">'+rl('纳音')+emp('')+td('',pTai.ny)+td('',pMing.ny)+td('',pShen.ny)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-row-type="xingyun">'+rl('星运')+emp('')+td('',pTai.xy)+td('',pMing.xy)+td('',pShen.xy)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-row-type="zizuo">'+rl('自坐')+emp('')+td('',pTai.zz)+td('',pMing.zz)+td('',pShen.zz)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-row-type="nayun">'+rl('纳运')+emp('')+td('',pTai.nayun)+td('',pMing.nayun)+td('',pShen.nayun)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-row-type="kongwang">'+rl('空亡')+emp('')+td('',pTai.kw)+td('',pMing.kw)+td('',pShen.kw)+emp('sep')+emp('col-ln')+'</tr>');
  syRows.push('<tr class="rm" data-row-type="shensha">'+rl('神煞')+emp('')+td('',pTai.sh)+td('',pMing.sh)+td('',pShen.sh)+emp('sep')+emp('col-ln')+'</tr>');
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
  // 运前列：出生年至起运前一年的流年干支（无 data-di/data-li）
  if (preQyYears > 0) {
    let preLis = '';
    for (let py = y; py < y + preQyYears; py++) {
      const gz = liuNianJZ(py);
      const gzCol = '<span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span>';
      preLis += '<span class="li">'+gzCol+'</span>';
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
  let tstTag = '', ryTag = '';
  if (data.trueSolar) {
    tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 ' + pad(data.trueSolar.h)+':'+pad(data.trueSolar.mi)+' ('+(data.trueSolar.offsetMin>=0?'+':'')+Math.round(data.trueSolar.offsetMin)+'分)</span>';
  }
  if (renYuan) {
    ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  }

  // ---- 组装完整 HTML ----
  const nowYearCn = '（当前 ' + nowYear + ' 年）';
  const shunLabel = data.qiYun ? buildShunLabel(data.qiYun.shun, data.gender, data.nian.gan) : '';
  const html = `
    <div class="top-bar">
      <div class="person-info"><b>${name}</b><span class="sex-tag">${gender === '男' ? '乾造' : '坤造'}</span><span class="meta">${gender} · ${y}年${m}月${d}日 ${pad(h)}:${pad(mi)}</span>${tstTag}${ryTag}${shunLabel}</div>
      <div style="display:flex;align-items:baseline;gap:8px;"><button class="btn-simple" onclick="toggleSimple()" title="精简显示（隐藏纳音/空亡/神煞）">简</button>${renderGongWeiPanel()}<div class="person-info meta">${nian.gan}${nian.zhi}年生 · 属${shengXiao} ${nowYearCn}</div></div>
    </div>

    <div class="body-cols">
      <div class="main-col">
        <div class="chart-wrap">
        <table class="chart simple">${chartRows.join('\n')}</table>
        </div>
      </div>

      <div class="luck-col">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">
            <div><span class="label">起运</span>${qiyunText} &nbsp; <span class="label">交运</span>${jyText}</div>
          </div>
          <button class="btn-back" onclick="scrollToNow()" title="定位今年">📍 今年</button>
        </div>
        <div class="luck-section">
          <div class="luck-table">${luckRows.join('\n')}</div>
        </div>
      </div>
    </div>`;

  // 存储数据用于交互
  const container = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
  container.innerHTML = html;
  container._paipanData = data;
  if (targetId === 'output' || (typeof targetId === 'object' && targetId.id === 'output')) {
    window._paipanData = data;
  }
  window._getSolarTerm = getSolarTerm;

  // 绑定交互
  container._paipanData = data;
  bindEvents(data, container);
}

function bindEvents(data, container) {
  const { daYun, ri, y } = data;
  const riGan = ri.gan;
  container = container || document;

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
      hiDy(di, scope2); hiLn(di, liIdx, scope2);
      // 龙凤胎: 传递卡片元素确保只更新对应卡片的图表列
      updateCardDyLnColumns(container, cardEl2 || li, di, liIdx);
      setTimeout(function(){ redrawZuHeSVG(cardEl2 || container); }, 80);
    });
  });
}

function hiDy(i, scope) {
  scope.querySelectorAll('[data-dy]').forEach(c => c.classList.remove('cc'));
  const t = scope.querySelector('[data-dy="'+i+'"]');
  if (t) t.classList.add('cc');
  // 检测运前列是否存在（qyYears=0时不渲染），动态决定偏移量
  const hasPreQy = scope.querySelector('.luck-row.hd .cell.pre-qy') !== null;
  const off = hasPreQy ? 2 : 1;
  // 高亮年龄头行
  const hd = scope.querySelectorAll('.luck-row.hd .cell');
  hd.forEach(c => c.classList.remove('cc'));
  if (hd[i + off]) hd[i + off].classList.add('cc');
  // 高亮流年列
  const lc = scope.querySelectorAll('.liu-row .cell');
  lc.forEach(c => c.classList.remove('cc'));
  if (lc[i + off]) lc[i + off].classList.add('cc');
  // 高亮始于行
  const sr = scope.querySelectorAll('.start-row .cell');
  sr.forEach(c => c.classList.remove('cc'));
  if (sr[i + off]) sr[i + off].classList.add('cc');
  // 高亮止于行
  const er = scope.querySelectorAll('.end-row .cell');
  er.forEach(c => c.classList.remove('cc'));
  if (er[i + off]) er[i + off].classList.add('cc');
}

function hiLn(di, li, scope) {
  scope.querySelectorAll('.liu-row .li').forEach(c => c.classList.remove('cur'));
  // 检测运前列是否存在（qyYears=0时不渲染），动态决定偏移量
  const hasPreQy = scope.querySelector('.liu-row .cell.pre-qy') !== null;
  const off = hasPreQy ? 2 : 1;
  const cells = scope.querySelectorAll('.liu-row .cell');
  const col = cells[di + off];
  if (col) {
    const lis = col.querySelectorAll('.li');
    if (lis[li]) lis[li].classList.add('cur');
  }
}

// ============ v0.6.7 卡片大运流年列互动更新 ============
// 点击流年时同步更新卡片图表中的大运/流年列
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
  var dy = daYun[dyIdx];
  if (!dy) return;
  var lnYear = dy.startYear + lnIdx;
  var lnGz = liuNianJZ(lnYear);
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

  var pDy = pill(dy.gan, dy.zhi);
  var pLn = pill(lnGz[0], lnGz[1]);

  // 更新目标卡片：如果点击来自具体卡片，只更新该卡片；否则更新所有卡片
  var cards = card ? [card] : Array.from(container.querySelectorAll('.bz-twin-card'));

  // v0.6.6: 单人模式回退 —— 无 .bz-twin-card 时直接更新主 chart 表格
  if (cards.length === 0) {
    var mainChart = container.querySelector('table.chart');
    if (mainChart) _applyDLUpdates(mainChart, pDy, pLn, true);
    return;
  }

  cards.forEach(function(c) {
    var ct = c.querySelector('.chart-wrap table.chart');
    if (ct) _applyDLUpdates(ct, pDy, pLn, false);
  });
}



// ============ v0.6.6 通用大运/流年列更新函数 ============
// 双模式行映射：isSingle=true → 9行（藏气合并），isSingle=false → 11行（藏干分层）
function _applyDLUpdates(tableEl, pDy, pLn, isSingle) {
  // v0.10.4: 语义选择器替代硬编码行索引，宫位标签行不再影响数据定位
  var getRow = function(type) { return tableEl.querySelector('[data-row-type~="' + type + '"]'); };
  var updates;

  if (isSingle) {
    // 单人模式：藏气合并
    updates = [
      ['dy1', pDy.rs, pLn.rs],
      ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
      ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
      ['ln2', pDy.cg, pLn.cg],
      ['dy3', pDy.ny, pLn.ny],
      ['ln3', pDy.xy, pLn.xy],
      ['dy4', pDy.zz, pLn.zz],
      ['dy5', pDy.nayun, pLn.nayun],
      ['ln4', pDy.kw, pLn.kw],
      ['dy6', pDy.sh, pLn.sh]
    ];
  } else {
    // 双胞胎模式：藏干分层
    updates = [
      ['dy1', pDy.rs, pLn.rs],
      ['ln1', pDy.gan, pLn.gan, pDy.wg, pLn.wg],
      ['dy2', pDy.zhi, pLn.zhi, pDy.wz, pLn.wz],
      ['ln2', fmtCGLayer((pDy.ly||[])[0]), fmtCGLayer((pLn.ly||[])[0])],
      ['dy3', fmtCGLayer((pDy.ly||[])[1]), fmtCGLayer((pLn.ly||[])[1])],
      ['ln3', fmtCGLayer((pDy.ly||[])[2]), fmtCGLayer((pLn.ly||[])[2])],
      ['dy4', pDy.ny, pLn.ny],
      ['ln4', pDy.xy, pLn.xy],
      ['dy5', pDy.zz, pLn.zz],
      ['dy6', pDy.nayun, pLn.nayun],
      ['ln5', pDy.kw, pLn.kw],
      ['dy7', pDy.sh, pLn.sh]
    ];
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
  var tai = data.tai, ming = data.ming, shen = data.shen;

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
    // 星运(7)
    rows.main[7] = '<tr class="rm" data-row-type="xingyun ln4">'+rl('星运')+td(dm('nian.xy'),p.nian.xy)+td(dm('yue.xy'),p.yue.xy)+td(dm('ri.xy'),p.ri.xy)+td(dm('shi.xy'),p.shi.xy)+td('sep col-dy',pDy.xy)+td('col-ln',pLn.xy)+'</tr>';
    // 自坐(8)
    rows.main[8] = '<tr class="rm" data-row-type="zizuo dy5">'+rl('自坐')+td(dm('nian.zz'),p.nian.zz)+td(dm('yue.zz'),p.yue.zz)+td(dm('ri.zz'),p.ri.zz)+td(dm('shi.zz'),p.shi.zz)+td('sep col-dy',pDy.zz)+td('col-ln',pLn.zz)+'</tr>';
    // 纳运(9)
    rows.main[9] = '<tr class="rm" data-row-type="nayun dy6">'+rl('纳运')+td(dm('nian.nayun'),p.nian.nayun)+td(dm('yue.nayun'),p.yue.nayun)+td(dm('ri.nayun'),p.ri.nayun)+td(dm('shi.nayun'),p.shi.nayun)+td('sep col-dy',pDy.nayun)+td('col-ln',pLn.nayun)+'</tr>';
    // 空亡(10)
    rows.main[10] = '<tr class="rm" data-row-type="kongwang ln5">'+rl('空亡')+td(dm('nian.kw'),p.nian.kw)+td(dm('yue.kw'),p.yue.kw)+td(dm('ri.kw'),p.ri.kw)+td(dm('shi.kw'),p.shi.kw)+td('sep col-dy',pDy.kw)+td('col-ln',pLn.kw)+'</tr>';
    // 神煞(11)
    rows.main[11] = '<tr class="rm" data-row-type="shensha dy7">'+rl('神煞')+td(dm('nian.sh'),p.nian.sh)+td(dm('yue.sh'),p.yue.sh)+td(dm('ri.sh'),p.ri.sh)+td(dm('shi.sh'),p.shi.sh)+td('sep col-dy',pDy.sh)+td('col-ln',pLn.sh)+'</tr>';
    // v0.10.0 三垣扩展列：表头[0]和后续行(从1起)加空列
    rows.sanyuan[0] = '<tr class="hd">'+rl('三垣')+emp('')+td('','胎元')+td('','命宫')+td('','身宫')+emp('sep')+emp('col-ln')+'</tr>';
    for (var si = 1; si < rows.sanyuan.length; si++) {
      rows.sanyuan[si] = rows.sanyuan[si].replace('</tr>', emp('sep')+emp('col-ln')+'</tr>');
    }
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
    + '<div class="chart-wrap"><table class="chart">'+hdr+'\n'+rows.main.join('\n')+'</table></div>'
    + '<div class="bz-sanyuan-area"><table class="chart" style="margin-top:0;border-top:1px solid var(--bz-card-border);">'+rows.sanyuan.join('\n')+'</table></div>'
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

  var joy = qiYun.years, jom = qiYun.months, jod = qiYun.days;
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
    + '<button class="btn-back" onclick="scrollToNow()" title="定位今年">📍 今年</button>'
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
  var joy = qiYun.years, jom = qiYun.months, jod = qiYun.days;
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
  if (joy > 0) { var preLis = ''; for (var py = y; py < y + joy; py++) { var gz = liuNianJZ(py); preLis += '<span class="li"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } luckRows.push('<div class="cell pre-qy">'+preLis+'</div>'); }
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

  var html = '\n    <div class="top-bar">\n      <div class="person-info"><b>'+name+'</b><span class="sex-tag">'+(gender==='男'?'乾造':'坤造')+'</span><span class="meta">'+gender+' · '+y+'年'+m+'月'+d+'日 '+pad(h)+':'+pad(mi)+'</span>'+tstTag+ryTag+'</div>\n      <div style="display:flex;align-items:baseline;gap:8px;"><button class="btn-simple" onclick="toggleSimple()" title="精简显示（隐藏纳音/空亡/神煞）">简</button><div class="person-info meta">'+nian.gan+nian.zhi+'年生 · 属'+shengXiao+' '+nowYearCn+'</div></div>\n    </div>\n'
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + renderTwinPillarPanel() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + '\n    <div class="bz-twin-shared">\n      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\n        <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">\n          <div><span class="label">大运·流年（共享）</span> &nbsp; <span class="label">起运</span>'+qiyunText+' &nbsp; <span class="label">交运</span>'+jyText+'</div>\n        </div>\n        <button class="btn-back" onclick="scrollToNow(this.closest(\'.bz-twin-shared\'))" title="定位今年">📍 今年</button>\n      </div>\n      <div class="luck-section" style="border:none;">\n        <div class="luck-table">'+luckRows.join('\n')+'</div>\n      </div>\n    </div>';

  var container = document.getElementById(targetId);
  container.innerHTML = html;
  container._paipanData = data;
  window._paipanData = data;
  window._twinType = 'same';

  if (window._simpleMode) {
    container.querySelectorAll('[data-row-type~="nayin"],[data-row-type~="kongwang"],[data-row-type~="shensha"]').forEach(function(r){r.style.display='none';});
  }
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
  var meta1 = (g1==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(d1.qiYun.shun, d1.gender, d1.nian.gan);
  var card1 = buildCardHTML(d1, { twin: 1, label: '老大', relation: '', identClass: 'twin-1', diffMap: diffMap, meta: meta1 });
  var meta2 = (g2==='男'?'乾造':'坤造')+' · '+nian.gan+nian.zhi+'年'+buildShunLabel(d2.qiYun.shun, d2.gender, d2.nian.gan);
  var card2 = buildCardHTML(d2, { twin: 2, label: '老二', relation: '', identClass: 'twin-2', diffMap: diffMap, meta: meta2 });

  var tstTag = '', ryTag = '';
  if (d1.trueSolar) { tstTag = '<span class="meta-tag true-solar">☀ 真太阳时 '+pad(d1.trueSolar.h)+':'+pad(d1.trueSolar.mi)+' ('+(d1.trueSolar.offsetMin>=0?'+':'')+Math.round(d1.trueSolar.offsetMin)+'分)</span>'; }
  if (renYuan) ryTag = '<span class="meta-tag">'+renYuan+'</span>';
  var yMc = d1.qiYun.shun ? '顺排' : '逆排';
  var yMc2 = d2.qiYun.shun ? '顺排' : '逆排';
  var sexTag = (g1==='男'?'乾造':'坤造')+' · '+yMc+' | '+(g2==='男'?'乾造':'坤造')+' · '+yMc2;
  var nowYearCn = '（当前 ' + nowYear + ' 年）';

  // === 老大 luckRows（六行 + 运前列）===
  var dy1 = d1.daYun, qy1 = d1.qiYun, rg1 = d1.ri.gan;
  var cd1 = 0; for (var i = dy1.length - 1; i >= 0; i--) { if (dy1[i].startYear <= nowYear) { cd1 = i; break; } }
  var lr1 = [];
  lr1.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (qy1.years > 0) { lr1.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; lr1.push('<div class="cell'+(l===cd1?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (qy1.years > 0) { lr1.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; var ss = shiShen(rg1, dy.gan), sb = zhiShiShen(rg1, dy.zhi); lr1.push('<div class="cell'+(l===cd1?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (qy1.years > 0) { lr1.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+dy1[l].startYear+'</div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (qy1.years > 0) { var pl1 = ''; for (var py = y; py < y + qy1.years; py++) { var gz = liuNianJZ(py); pl1 += '<span class="li"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr1.push('<div class="cell pre-qy">'+pl1+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { var dy = dy1[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===cd1&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+lis+'</div>'); }
  lr1.push('</div>');
  lr1.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (qy1.years > 0) { lr1.push('<div class="cell pre-qy">'+(y + qy1.years - 1)+'</div>'); }
  for (var l = 0; l < dy1.length; l++) { lr1.push('<div class="cell'+(l===cd1?' cc':'')+'">'+(dy1[l].startYear + 9)+'</div>'); }
  lr1.push('</div>');

  // === 老二 luckRows（六行 + 运前列）===
  var dy2 = d2.daYun, qy2 = d2.qiYun, rg2 = d2.ri.gan;
  var cd2 = 0; for (var i = dy2.length - 1; i >= 0; i--) { if (dy2[i].startYear <= nowYear) { cd2 = i; break; } }
  var lr2 = [];
  lr2.push('<div class="luck-row hd"><div class="cell rtag">大运</div>');
  if (qy2.years > 0) { lr2.push('<div class="cell pre-qy"><span class="year">'+y+'</span><span class="age">1岁</span></div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; lr2.push('<div class="cell'+(l===cd2?' cc':'')+'"><span class="year">'+dy.startYear+'</span><span class="age">'+(dy.startAge+1)+'岁</span></div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row"><div class="cell rtag">大运</div>');
  if (qy2.years > 0) { lr2.push('<div class="cell pre-qy"><div class="dy-stem" style="color:var(--c-gray)">运</div><div class="dy-branch" style="color:var(--c-gray)">前</div></div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; var ss = shiShen(rg2, dy.gan), sb = zhiShiShen(rg2, dy.zhi); lr2.push('<div class="cell'+(l===cd2?' cc':'')+'" data-dy="'+l+'"><div class="dy-stem '+wxClass(dy.gan)+'">'+dy.gan+'<span>'+ss.substr(0,1)+'</span></div><div class="dy-branch '+wxClass(dy.zhi)+'">'+dy.zhi+'<span>'+sb.substr(0,1)+'</span></div></div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row start-row"><div class="cell rtag">始于</div>');
  if (qy2.years > 0) { lr2.push('<div class="cell pre-qy">'+y+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+dy2[l].startYear+'</div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row liu-row"><div class="cell rtag">流年</div>');
  if (qy2.years > 0) { var pl2 = ''; for (var py = y; py < y + qy2.years; py++) { var gz = liuNianJZ(py); pl2 += '<span class="li"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr2.push('<div class="cell pre-qy">'+pl2+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { var dy = dy2[l]; var lis = ''; for (var j = 0; j < 10; j++) { var lnY = dy.startYear + j; var gz = liuNianJZ(lnY); lis += '<span class="li'+(l===cd2&&lnY===nowYear?' cur':'')+'" data-di="'+l+'" data-li="'+j+'"><span class="'+wxClass(gz[0])+'">'+gz[0]+'</span><span class="'+wxClass(gz[1])+'">'+gz[1]+'</span></span>'; } lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+lis+'</div>'); }
  lr2.push('</div>');
  lr2.push('<div class="luck-row end-row"><div class="cell rtag">止于</div>');
  if (qy2.years > 0) { lr2.push('<div class="cell pre-qy">'+(y + qy2.years - 1)+'</div>'); }
  for (var l = 0; l < dy2.length; l++) { lr2.push('<div class="cell'+(l===cd2?' cc':'')+'">'+(dy2[l].startYear + 9)+'</div>'); }
  lr2.push('</div>');

  // 标签 + 起运文案
  var joy1 = qy1.years, jom1 = qy1.months, jod1 = qy1.days;
  var qiyunText1 = '起运（老大）出生后 ' + joy1 + ' 年 ' + jom1 + ' 月 ' + jod1 + ' 天';
  var joy2 = qy2.years, jom2 = qy2.months, jod2 = qy2.days;
  var qiyunText2 = '起运（老二）出生后 ' + joy2 + ' 年 ' + jom2 + ' 月 ' + jod2 + ' 天';
  var lbl1 = (g1==='男'?'👦':'👧')+' 老大';
  var lbl2 = (g2==='男'?'👦':'👧')+' 老二';

  var html = '\n    <div class="top-bar">\n      <div class="person-info"><b>'+name+'</b><span class="sex-tag">龙凤胎</span><span class="meta">'+sexTag+' · '+y+'年'+m+'月'+d+'日 '+pad(h)+':'+pad(mi)+'</span>'+tstTag+ryTag+'</div>\n      <div style="display:flex;align-items:baseline;gap:8px;"><button class="btn-simple" onclick="toggleSimple()" title="精简显示（隐藏纳音/空亡/神煞）">简</button><div class="person-info meta">'+nian.gan+nian.zhi+'年生 · 属'+shengXiao+' '+nowYearCn+'</div></div>\n    </div>\n'
    + '\n    <div class="bz-twin-tabs">\n      <button class="bz-twin-tab active" data-mode="both" onclick="switchTwinMode(this,\'both\')">并排对比</button>\n      <button class="bz-twin-tab" data-mode="twin1" onclick="switchTwinMode(this,\'twin1\')">仅看老大</button>\n      <button class="bz-twin-tab" data-mode="twin2" onclick="switchTwinMode(this,\'twin2\')">仅看老二</button>\n      ' + renderGongWeiPanel() + renderTwinPillarPanel() + '\n    </div>\n'
    + '\n    <div class="bz-twin-cards">\n' + card1 + '\n' + card2 + '\n    </div>\n'
    + '\n    <div class="bz-twin-shared">\n      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">\n        <div class="info-row" style="margin-bottom:0;padding-bottom:0;border-bottom:none;flex:1">\n          <div><span class="label">大运·流年</span> &nbsp; '+qiyunText1+' &nbsp; '+qiyunText2+'</div>\n        </div>\n        <button class="btn-back" onclick="scrollToNow(this.closest(\'.bz-twin-shared\'))" title="定位今年">📍 今年</button>\n      </div>\n      <div class="luck-section" style="border:none;">\n        <div style="display:flex; gap:24px; align-items:flex-start;">\n          <div class="bz-card-luck" data-card-index="0" style="flex:1; min-width:0;">\n            <div class="luck-table-label">'+lbl1+'</div>\n            <div class="luck-table" style="min-width:520px;">'+lr1.join('\n')+'</div>\n          </div>\n          <div class="bz-card-luck" data-card-index="1" style="flex:1; min-width:0; overflow-x:auto;">\n            <div class="luck-table-label">'+lbl2+'</div>\n            <div class="luck-table" style="min-width:520px;">'+lr2.join('\n')+'</div>\n          </div>\n        </div>\n      </div>\n    </div>';

  var container = document.getElementById(targetId);
  container.innerHTML = html;
  window._paipanData = d1;
  window._paipanData2 = d2;
  window._twinType = 'longfeng';

  if (window._simpleMode) {
    container.querySelectorAll('[data-row-type~="nayin"],[data-row-type~="kongwang"],[data-row-type~="shensha"]').forEach(function(r){r.style.display='none';});
  }
  // 给每张卡片绑定各自数据（大运因性别不同而异）
  var cards = container.querySelectorAll('.bz-twin-card');
  if (cards[0]) cards[0]._cardData = d1;
  if (cards[1]) cards[1]._cardData = d2;
  container._paipanData = d1;
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
      document.getElementById('output').innerHTML = '<div class="loading" style="color:var(--c-red)">日期超出支持范围（1900-2100）</div>';
      return;
    }
    solarY = solar.y; solarM = solar.m; solarD = solar.d;
  }

  // 真太阳时修正：仅当用户勾选了真太阳时且地址已选（基于转换后的公历日期）
  let tst = null;
  const useSolar = document.getElementById('useSolar').checked;
  if (useSolar) {
    const lng = getLng();
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
      d1.trueSolar = tst;
      d1.renYuan = renYuanSiLing(solarY, solarM, solarD);
      injectCurDaYunLiuNian(d1);
      const d2 = paipan(name, g2, ey, em, ed, eh, emi);
      d2.trueSolar = tst;
      d2.renYuan = renYuanSiLing(solarY, solarM, solarD);
      injectCurDaYunLiuNian(d2);
      output.innerHTML = '';
      renderLongFengCardsHtml(d1, d2, 'output');
      setCurrentBaziResult(extractBaziFromPaipan(d1));
    } else if (twin === '1') {
      const data = paipan(name, gender, ey, em, ed, eh, emi);
      data.trueSolar = tst;
      data.renYuan = renYuanSiLing(solarY, solarM, solarD);
      output.innerHTML = '';
      renderTwinCardsHtml(data, 'output');
      setCurrentBaziResult(extractBaziFromPaipan(data));
    } else {
      const data = paipan(name, gender, ey, em, ed, eh, emi);
      data.trueSolar = tst;
      data.renYuan = renYuanSiLing(solarY, solarM, solarD);
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
      qiYun: { year: p.qiYun.years, month: p.qiYun.months, day: p.qiYun.days, hour: p.qiYun.hours, shun: p.qiYun.shun },
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
      qiYun: { year: p.qiYun.years, month: p.qiYun.months, day: p.qiYun.days, hour: p.qiYun.hours, shun: p.qiYun.shun },
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
  // 星运
  rows.push('<tr class="rm">' + rl('星运') + td('',pNian.xy) + td('',pYue.xy) + td('',pRi.xy) + td('',pShi.xy) + emp() + td('',pTai.xy) + td('',pMing.xy) + td('',pShen.xy) + '</tr>');
  // 自坐
  rows.push('<tr class="rm">' + rl('自坐') + td('',pNian.zz) + td('',pYue.zz) + td('',pRi.zz) + td('',pShi.zz) + emp() + td('',pTai.zz) + td('',pMing.zz) + td('',pShen.zz) + '</tr>');
  // 空亡
  rows.push('<tr class="rm">' + rl('空亡') + td('',pNian.kw) + td('',pYue.kw) + td('',pRi.kw) + td('',pShi.kw) + emp() + td('',pTai.kw) + td('',pMing.kw) + td('',pShen.kw) + '</tr>');

  // Info line
  var nowYear = new Date().getFullYear();
  var sx = data.shengXiao;
  var info = '<div style="font-family:var(--font-display);font-size:14px;color:var(--c-ink);margin-bottom:6px;">'
    + '<b>' + arch.name + '</b> '
    + '<span class="sex-tag" style="font-family:var(--font-display);font-size:14px;color:var(--c-red);margin-left:4px;">' + (arch.gender === '男' ? '乾造' : '坤造') + '</span>'
    + ' <span style="color:var(--c-gray);font-size:13px;">' + arch.gender + ' · ' + arch.year + '年' + arch.month + '月' + arch.day + '日 ' + pad(arch.hour) + ':' + pad(arch.min||0) + '</span>'
    + ' <span style="color:var(--c-gray);font-size:13px;">' + data.nian.gan + data.nian.zhi + '年生 · 属' + sx + '</span>'
    + '</div>';

  return info + '<div class="chart-wrap" style="overflow-x:auto;"><table class="chart" style="min-width:640px;width:100%;">' + rows.join('\n') + '</table></div>';
}

// ============================================================

  // ===== 挂载到全局命名空间 =====
  window.RENDER = {
    toggleSimple: toggleSimple,
    buildPillarRows: buildPillarRows,
    renderChart: renderChart,
    bindEvents: bindEvents,
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
})();
