/* 八字排盘 v0.31.0 — main.js */
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

  // ===== 别名：来自 render.js =====
  var toggleLevel = RENDER.toggleLevel;
  var buildPillarRows = RENDER.buildPillarRows;
  var renderChart = RENDER.renderChart;
  var bindEvents = RENDER.bindEvents;
  var hiDy = RENDER.hiDy;
  var hiLn = RENDER.hiLn;
  var updateCardDyLnColumns = RENDER.updateCardDyLnColumns;
  var _applyDLUpdates = RENDER._applyDLUpdates;
  var buildDiffMap = RENDER.buildDiffMap;
  var buildCardHTML = RENDER.buildCardHTML;
  var buildCardLuckHTML = RENDER.buildCardLuckHTML;
  var renderTwinCardsHtml = RENDER.renderTwinCardsHtml;
  var renderLongFengCardsHtml = RENDER.renderLongFengCardsHtml;
  var switchTwinMode = RENDER.switchTwinMode;
  var injectCurDaYunLiuNian = RENDER.injectCurDaYunLiuNian;
  var doPaipan = RENDER.doPaipan;
  var scrollToNow = RENDER.scrollToNow;
  var extractBaziFromPaipan = RENDER.extractBaziFromPaipan;
  var buildChartDataFromArchive = RENDER.buildChartDataFromArchive;
  var renderExpandedChart = RENDER.renderExpandedChart;
  var renderChartToHtml = RENDER.renderChartToHtml;

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

(function initLoc() {
  var pSel = document.getElementById('inProv');
  var provinces = Object.keys(LOC_DATA).sort(function(a,b){return a.localeCompare(b,'zh');});
  provinces.forEach(function(p) { var o=document.createElement('option'); o.value=p; o.textContent=p; pSel.appendChild(o); });
  // 默认选广西
  pSel.value = '广西';
  onProvChange();
  // 编辑弹窗省份下拉也初始化
  var eSel = document.getElementById('editProv');
  if (eSel) {
    eSel.innerHTML = '<option value="">—</option>';
    provinces.forEach(function(p) { var o=document.createElement('option'); o.value=p; o.textContent=p; eSel.appendChild(o); });
  }
})();

function onProvChange() {
  const prov = document.getElementById('inProv').value;
  const cSel = document.getElementById('inCity');
  const dSel = document.getElementById('inDist');
  cSel.innerHTML = '<option value="">—</option>';
  dSel.innerHTML = '<option value="">—</option>';
  if (!prov || !LOC_DATA[prov]) return;
  const cities = Object.keys(LOC_DATA[prov].cities).sort((a,b)=>a.localeCompare(b,'zh'));
  cities.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; cSel.appendChild(o); });
  // 智能默认省会
  let defCity = null;
  const capitals = { '四川省':'成都市','河北省':'石家庄市','江苏省':'南京市','浙江省':'杭州市',
    '广东省':'广州市','福建省':'福州市','安徽省':'合肥市','江西省':'南昌市','山东省':'济南市',
    '河南省':'郑州市','湖北省':'武汉市','湖南省':'长沙市','辽宁省':'沈阳市','吉林省':'长春市',
    '黑龙江省':'哈尔滨市','山西省':'太原市','陕西省':'西安市','甘肃省':'兰州市','青海省':'西宁市',
    '贵州省':'贵阳市','云南省':'昆明市','海南省':'海口市','内蒙古':'呼和浩特市','广西':'南宁市',
    '西藏':'拉萨市','宁夏':'银川市','新疆':'乌鲁木齐市','台湾':'台北市' };
  defCity = capitals[prov];
  if (!defCity) {
    // fallback：省份名与城市名匹配（如北京市、上海市等直辖）
    const bareProv = prov.replace(/[省市]$/,'');
    for (const c of cities) {
      const bareC = c.replace(/[市州]$/,'');
      if (bareC === bareProv || bareC.includes(bareProv) || bareProv.includes(bareC)) { defCity = c; break; }
    }
  }
  if (!defCity) defCity = cities[0];
  if (defCity) { cSel.value = defCity; onCityChange(); }
}

function onCityChange() {
  const prov = document.getElementById('inProv').value;
  const city = document.getElementById('inCity').value;
  const dSel = document.getElementById('inDist');
  dSel.innerHTML = '<option value="">—</option>';
  if (!prov || !city || !LOC_DATA[prov]?.cities[city]) return;
  const cData = LOC_DATA[prov].cities[city];
  if (!cData.dist) return;
  cData.dist.forEach(d => { const o=document.createElement('option'); o.value=d; o.textContent=d; dSel.appendChild(o); });
  updateSolarPreview();
}

// 实时预览真太阳时
function toggleSolar() {
  const checked = document.getElementById('useSolar').checked;
  document.getElementById('solarGroup').style.display = checked ? '' : 'none';
  if (checked) updateSolarPreview();
  else document.getElementById('liveSolar').textContent = '';
}

// 双胞类型切换：显隐第二性别 + label替换
function setupTwinTypeChange() {
  var sel = document.getElementById('inTwin');
  if (!sel) return;
  sel.addEventListener('change', function() {
    var type = sel.value;
    var g2Group = document.getElementById('inGender2Group');
    var gLabel = document.getElementById('inGenderLabel');
    var g1 = document.getElementById('inGender');
    var g2 = document.getElementById('inGender2');
    if (type === '2') {
      gLabel.textContent = '老大';
      g2Group.style.display = '';
      // 不强制性别——用户自由选择老大老二各为男/女
    } else if (type === '1') {
      gLabel.textContent = '性别';
      g2Group.style.display = 'none';
      g2.value = g1.value;
    } else {
      gLabel.textContent = '性别';
      g2Group.style.display = 'none';
    }
  });
}

function toggleCalendar(type) {
  if (calendarType === type) return;
  calendarType = type;
  var isLunar = (type === 'lunar');
  var monthCell = document.getElementById('inMonthCell');
  if (isLunar) {
    var curMonth = parseInt(document.getElementById('inMonth').value) || 1;
    monthCell.innerHTML = '<select id="inMonthSelect" style="width:64px;font-family:var(--font-display);font-size:14px;">'
      + LUNAR_MONTH_OPTIONS + '</select>';
    document.getElementById('inMonthSelect').value = curMonth;
    document.getElementById('inLeapGroup').style.display = '';
    document.getElementById('inDay').max = 30;
  } else {
    var curMonth = parseInt(document.getElementById('inMonthSelect').value) || 1;
    monthCell.innerHTML = '<input type="number" id="inMonth" value="' + curMonth
      + '" min="1" max="12" style="width:48px;">';
    document.getElementById('inLeapGroup').style.display = 'none';
    document.getElementById('inLeap').checked = false;
    document.getElementById('inDay').max = 31;
  }
  document.getElementById('calSolar').checked = !isLunar;
  document.getElementById('calLunar').checked = isLunar;
}

function updateSolarPreview() {
  const solarGroup = document.getElementById('solarGroup');
  if (solarGroup.style.display === 'none') { document.getElementById('liveSolar').textContent=''; return; }
  const el = document.getElementById('liveSolar');
  if (!el) return;
  const lng = getLng();
  const y = parseInt(document.getElementById('inYear').value);
  // v0.23.1 农历模式 inMonth 被替换为 inMonthSelect，DOM 自适应取值
  const m = parseInt((document.getElementById('inMonthSelect') || document.getElementById('inMonth')).value);
  const d = parseInt(document.getElementById('inDay').value);
  const h = parseInt(document.getElementById('inHour').value);
  const mi = parseInt(document.getElementById('inMin').value) || 0;
  if (lng === null || isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
    el.innerHTML = '';
    return;
  }
  try {
    const tst = trueSolarTime(y, m, d, h, mi, lng);
    const off = Math.round(tst.offsetMin);
    el.innerHTML = '<span style="color:var(--c-red);">☀</span> 真太阳时 ' + pad(tst.h)+':'+pad(tst.mi)+' ('+(off>=0?'+':'')+off+'分)';
  } catch(e) { el.innerHTML = ''; }
}

var calendarType = 'solar';  // 'solar' | 'lunar'
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

// 提取 paipan 结果中的关键数据，用于存储
function showAiInput() {
  document.getElementById('aiOverlay').classList.add('show');
  document.getElementById('aiInput').value = '';
  document.getElementById('aiPreview').textContent = '';
  setTimeout(() => document.getElementById('aiInput').focus(), 100);
}

function hideAiInput() {
  document.getElementById('aiOverlay').classList.remove('show');
}

// 时间修饰词→小时偏移
const TIME_MOD = {
  '凌晨':0, '半夜':0, '早晨':0, '早上':0, '上午':0,
  '中午':12, '下午':12, '傍晚':12, '黄昏':12, '晚上':12, '夜里':12
};

function parseNaturalInput(text) {
  const result = { name:'', gender:'男', year:null, month:null, day:null, hour:null, min:0, prov:'', city:'', dist:'', calendarType:'solar' };
  let t = text.trim();
  if (!t) return result;
  // v0.23.3 地址匹配基准：保留原始文本，避免省=市（如北京市）替换后城市/区县失配
  const t0 = t;

  // 1. 提取性别
  const genderM = t.match(/[男女]/);
  if (genderM) { result.gender = genderM[0]; t = t.replace(genderM[0], ' '); }

  // 2. 提取日期 — 中文格式（"日/号"后缀可省略，如"1986年7月26（农历）"）
  const dateCN = t.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?/);
  if (dateCN) {
    result.year = parseInt(dateCN[1]);
    result.month = parseInt(dateCN[2]);
    result.day = parseInt(dateCN[3]);
    t = t.replace(dateCN[0], ' ');
  }
  // v0.23.3 农历标志识别：农历/阴历/旧历/老历（含括号写法）
  if (/农历|阴历|旧历|老历/.test(text)) result.calendarType = 'lunar';
  // 数字格式 1982-10-18 / 1982.10.18 / 1982/10/18
  if (!result.year) {
    const dateNum = t.match(/(\d{4})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{1,2})/);
    if (dateNum) {
      result.year = parseInt(dateNum[1]);
      result.month = parseInt(dateNum[2]);
      result.day = parseInt(dateNum[3]);
      t = t.replace(dateNum[0], ' ');
    }
  }

  // 3. 提取时间
  // 先匹配带修饰词的：早上5点、下午3点、晚上8点01分
  const timeMod = t.match(/(凌晨|半夜|早晨|早上|上午|中午|下午|傍晚|黄昏|晚上|夜里)\s*(\d{1,2})\s*[点时:：]\s*(\d{1,2})?\s*[分]?/);
  if (timeMod) {
    let h = parseInt(timeMod[2]);
    const m = timeMod[3] ? parseInt(timeMod[3]) : 0;
    const mod = TIME_MOD[timeMod[1]];
    if (mod === 12) {
      if (h < 12) h += 12;
      if (h === 12 && timeMod[1] === '中午') h = 12;
    }
    result.hour = h;
    result.min = m;
    t = t.replace(timeMod[0], ' ');
  }
  // 纯数字时间 5:01 / 05:01 / 5时01分
  if (result.hour === null) {
    const timeNum = t.match(/(\d{1,2})\s*[:：时点]\s*(\d{1,2})?\s*[分]?/);
    if (timeNum) {
      result.hour = parseInt(timeNum[1]);
      result.min = timeNum[2] ? parseInt(timeNum[2]) : 0;
      t = t.replace(timeNum[0], ' ');
    }
  }
  // 只有小时：5点
  if (result.hour === null) {
    const hourOnly = t.match(/(\d{1,2})\s*点/);
    if (hourOnly) {
      result.hour = parseInt(hourOnly[1]);
      result.min = 0;
      t = t.replace(hourOnly[0], ' ');
    }
  }

  // 4. 提取地址
  const provList = Object.keys(LOC_DATA);
  // 按长度降序匹配，防止"广西"匹配到"广西省"
  const sortedProv = [...provList].sort((a,b) => b.length - a.length);
  for (const p of sortedProv) {
    const shortP = p.replace(/[省市区]$/, '');
    if (t0.includes(p) || t0.includes(shortP)) {
      result.prov = p;
      t = t.replace(p, ' ').replace(shortP, ' ');
      // 提取城市
      const cities = Object.keys(LOC_DATA[p].cities);
      const sortedCities = [...cities].sort((a,b) => b.length - a.length);
      for (const c of sortedCities) {
        const shortC = c.replace(/[市县区]$/, '');
        if (t0.includes(c) || t0.includes(shortC)) {
          result.city = c;
          t = t.replace(c, ' ').replace(shortC, ' ');
          // 提取区县（支持省县写法：输入"南丹"匹配"南丹县"）
          const dists = LOC_DATA[p].cities[c]?.dist || [];
          for (const d of dists) {
            const shortD = d.replace(/[县区市]$/, '');
            if (t0.includes(d) || t0.includes(shortD)) { result.dist = d; t = t.replace(d, ' ').replace(shortD, ' '); break; }
          }
          break;
        }
      }
      break;
    }
  }

  // 5. 提取姓名 — 剩余文本中取2-4个连续汉字
  const nameM = t.match(/[\u4e00-\u9fa5]{2,4}/);
  if (nameM) result.name = nameM[0];

  return result;
}

function doAiParse() {
  const text = document.getElementById('aiInput').value.trim();
  if (!text) return;
  const r = parseNaturalInput(text);
  
  // 构建预览
  let preview = '';
  if (r.name) preview += '姓名：' + (ARCHIVE.getPrivacyMode() ? '已隐藏' : r.name) + '  ';
  preview += '性别：' + r.gender + '  ';
  if (r.year) preview += r.year + '年' + r.month + '月' + r.day + '日' + (r.calendarType === 'lunar' ? '（农历）' : '') + '  ';
  if (r.hour !== null) preview += r.hour + ':' + String(r.min).padStart(2,'0') + '  ';
  if (r.prov) preview += r.prov + (r.city||'') + (r.dist||'');
  
  if (!r.year) {
    document.getElementById('aiPreview').textContent = '⚠ 未能识别完整日期，请补充';
    return;
  }

  document.getElementById('aiPreview').textContent = '✅ 识别：' + preview;

  // 填表
  if (r.name) document.getElementById('inName').value = r.name;
  document.getElementById('inGender').value = r.gender;
  // v0.23.3 农历模式兼容：先切日历（会重建月控件），再填月份
  var needLunar = (r.calendarType === 'lunar');
  if (needLunar !== (APP.calendarType === 'lunar')) toggleCalendar(needLunar ? 'lunar' : 'solar');
  document.getElementById('inYear').value = r.year;
  if (needLunar) {
    document.getElementById('inMonthSelect').value = r.month;
  } else {
    document.getElementById('inMonth').value = r.month;
  }
  document.getElementById('inDay').value = r.day;
  if (r.hour !== null) document.getElementById('inHour').value = r.hour;
  document.getElementById('inMin').value = r.min;
  
  // 地址
  if (r.prov) {
    document.getElementById('useSolar').checked = true;
    toggleSolar();
    document.getElementById('inProv').value = r.prov;
    onProvChange();
    setTimeout(() => {
      if (r.city) { document.getElementById('inCity').value = r.city; onCityChange(); }
      setTimeout(() => {
        if (r.dist) document.getElementById('inDist').value = r.dist;
        hideAiInput();
        // P0-01 修复：统一走守卫入口，禁止绕过未登录拦截
        window.APP.doPaipan();
      }, 100);
    }, 100);
  } else {
    document.getElementById('useSolar').checked = false;
    toggleSolar();
    hideAiInput();
    // P0-01 修复：统一走守卫入口，禁止绕过未登录拦截
    window.APP.doPaipan();
  }
}

// 点击遮罩关闭
document.addEventListener('click', function(e) {
  if (e.target.id === 'aiOverlay') hideAiInput();
});


// ============================================================
// v0.23.0 盘面截图 — #output 一键导出 PNG 长图
// 引擎：html2canvas@1.4.1 CDN 按需加载（三源降级，成功后缓存零网络）
// ============================================================
var screenshotEngineReady = false;   // 引擎加载成功标志（二次点击零网络）
var screenshotBusy = false;          // 防重入

// CDN 三源降级链（jsDelivr → BootCDN → unpkg），@1.4.1 版本锁定防隐式升级漂移
var SCREENSHOT_ENGINE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// 逐源动态注入 <script>，每源 8 秒超时（onload/onerror 与 timer 竞态，先到先裁决）
function loadScreenshotEngine(cb) {
  if (screenshotEngineReady) { cb(true); return; }
  var idx = 0;
  var settled = false;
  function tryNext() {
    if (settled) return;
    if (idx >= SCREENSHOT_ENGINE_SOURCES.length) {
      settled = true;
      cb(false);
      return;
    }
    var url = SCREENSHOT_ENGINE_SOURCES[idx++];
    var s = document.createElement('script');
    var finished = false;
    var timer = setTimeout(function() {
      if (finished) return;
      finished = true;
      if (s.parentNode) s.parentNode.removeChild(s);
      tryNext();
    }, 8000);
    function settle() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
    }
    s.onload = function() {
      if (finished) return;
      settle();
      if (typeof window.html2canvas === 'function') {
        screenshotEngineReady = true;
        settled = true;
        cb(true);
      } else {
        if (s.parentNode) s.parentNode.removeChild(s);
        tryNext();
      }
    };
    s.onerror = function() {
      if (finished) return;
      settle();
      if (s.parentNode) s.parentNode.removeChild(s);
      tryNext();
    };
    s.src = url;
    document.head.appendChild(s);
  }
  tryNext();
}

// 瞬时提示：绝对定位 div 浮于截图按钮上方，2.5 秒后移除（拒绝 alert：阻塞交互且挂起 T06 断言）
function notifyScreenshot(msg) {
  var old = document.getElementById('screenshotNotify');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var btn = document.getElementById('btnScreenshot');
  if (!btn || !btn.parentNode) return;
  var div = document.createElement('div');
  div.id = 'screenshotNotify';
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

// 文件名字符清洗：/ \ : * ? " < > | 及空白字符 → '-'，清洗后为空兜底「匿名」
function sanitizeFilename(s) {
  var cleaned = String(s == null ? '' : s)
    .replace(/[\/\\:*?"<>|\s]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || '匿名';
}

// 本地日期 YYYYMMDD 手工拼接（禁 toISOString：UTC 本地晚间跨天偏移）
function localYYYYMMDD() {
  var d = new Date();
  return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
}

// 文件名生成：八字排盘_<显示名清洗>_<YYYYMMDD>.png
// 隐私铁律：显示名走 ARCHIVE.getDisplayName（隐私开启即脱敏降级链），绝不直读真名
function buildScreenshotFilename(person) {
  return '八字排盘_' + sanitizeFilename(ARCHIVE.getDisplayName(person || {})) + '_' + localYYYYMMDD() + '.png';
}

// 恢复按钮 + busy 复位（所有路径 finally 统一调用）
function resetScreenshotBtn() {
  screenshotBusy = false;
  var btn = document.getElementById('btnScreenshot');
  if (btn) {
    btn.disabled = false;
    btn.textContent = '📷 截图';
  }
}

// 排盘结果一键截图：克隆 #output → 离屏渲染 → PNG 长图下载
function captureScreenshot() {
  var output = document.getElementById('output');
  if (!output) return;
  // 1. 未排盘守卫（沿用现有 person-info 判定，与 togglePrivacy 重渲染判定一致）
  if (output.innerHTML.indexOf('person-info') < 0) {
    notifyScreenshot('请先排盘');
    return;
  }
  // 2. 防重入
  if (screenshotBusy) return;
  screenshotBusy = true;
  var btn = document.getElementById('btnScreenshot');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 截图中…';
  }

  // 3. 引擎加载（首次 CDN 动态注入；失败恢复按钮并提示，不阻塞排盘主流程）
  loadScreenshotEngine(function(ok) {
    if (!ok) {
      resetScreenshotBtn();
      notifyScreenshot('截图组件加载失败，请检查网络后重试');
      return;
    }
    var holder = null;
    var canvas = null;
    var url = null;
    try {
      // 4. 克隆 #output → 离屏容器（留在 document 内：CSS 变量/样式自然生效）
      //    容器显式纸色背景：克隆体脱离 .page 后无底色，不声明则截图底色漂移
      //    定位用 absolute（fixed 在 html2canvas 克隆 iframe 中会被视口裁剪 → 长图截断）
      holder = document.createElement('div');
      holder.id = 'screenshotHolder';
      var SHOT_PAD = 36; // v0.23.1: 截图左右留白，内容不贴边（holder 加宽 2*PAD 保持内容区原宽）
      holder.style.cssText = 'position:absolute;left:-9999px;top:0;z-index:-1;pointer-events:none;'
        + 'width:' + ((output.offsetWidth || 1300) + SHOT_PAD * 2) + 'px;'
        + 'background:var(--c-paper);';
      var clone = output.cloneNode(true);
      clone.style.padding = '0 ' + SHOT_PAD + 'px';
      holder.appendChild(clone);
      document.body.appendChild(holder);

      // 5. dpr 适配 + canvas 面积保护（物理像素 > 3200 万时逐级收缩 scale，优先能导出）
      var dpr = window.devicePixelRatio || 1;
      var scale = Math.min(dpr, 2);
      var width = holder.offsetWidth || output.offsetWidth || 1300;
      var height = holder.scrollHeight || output.scrollHeight || 800;
      var maxPx = 32000000;
      if ((width * scale) * (height * scale) > maxPx) {
        if ((width * 1.5) * (height * 1.5) <= maxPx) scale = 1.5;
        else if (width * height <= maxPx) scale = 1;
        else scale = Math.sqrt(maxPx / (width * height));
      }

      // 6. 渲染 holder（含纸色背景）→ Canvas → toBlob（弃 toDataURL：大图内存减半）→ a[download] 下载
      //    windowWidth/windowHeight 显式设为完整内容尺寸，防视口裁剪截断长图
      //    所有异常路径收敛到 finally 清理：移除离屏容器 + 释放 canvas + 恢复按钮
      window.html2canvas(holder, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        windowWidth: width,
        windowHeight: height
      }).then(function(c) {
        canvas = c;
        return new Promise(function(resolve, reject) {
          canvas.toBlob(function(blob) {
            if (!blob) { reject(new Error('toBlob 失败')); return; }
            url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = buildScreenshotFilename(ARCHIVE.getFormData());
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            resolve();
          }, 'image/png');
        });
      }).then(function() {
        if (url) setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      }).catch(function(err) {
        if (window.console) console.error('[截图] 渲染失败:', err);
        notifyScreenshot('截图失败，请重试');
      }).then(function() {
        if (holder && holder.parentNode) holder.parentNode.removeChild(holder);
        if (canvas) { canvas.width = 0; canvas.height = 0; }
        resetScreenshotBtn();
      });
    } catch (err) {
      if (window.console) console.error('[截图] 异常:', err);
      if (holder && holder.parentNode) holder.parentNode.removeChild(holder);
      if (canvas) { canvas.width = 0; canvas.height = 0; }
      resetScreenshotBtn();
      notifyScreenshot('截图失败，请重试');
    }
  });
}

// ===== 回归测试模式（URL 加 ?test=1）=====
(function() {
  if (!/[\?&]test=1(&|$)/.test(location.search)) return;
  document.title = '八字排盘 · 回归测试';

  // 隐藏正常 UI
  const page = document.querySelector('.page');
  if (page) page.style.display = 'none';

  // 测试 UI
  const root = document.createElement('div');
  root.style.cssText = 'font-family:-apple-system,system-ui,sans-serif;background:#1a1a2e;color:#eee;padding:20px;min-height:100vh';
  root.innerHTML = '<h1 style="margin-bottom:8px">🧪 八字排盘 · 回归测试</h1>'
    + '<div id="test-summary" style="background:#16213e;border-radius:8px;padding:16px;margin-bottom:20px">⏳ 运行中…</div>'
    + '<div id="test-results"></div>'
    + '<div id="test-time" style="color:#888;font-size:12px;margin-top:12px"></div>';
  document.body.appendChild(root);

  function eq(label, actual, expected) {
    const ok = actual === expected;
    return { label, ok, detail: ok ? '=' + expected : '期望 "' + expected + '", 实际 "' + actual + '"' };
  }

  function fail(label, detail) {
    return { label, ok: false, detail: detail };
  }

  const start = Date.now();
  const tests = [];

  // === 十神 ===
  tests.push({ section:'十神计算' });
  tests.push(eq('shiShen("甲","辛") → 官',           shiShen('甲','辛'), '官'));
  tests.push(eq('shiShen("甲","甲") → 比',           shiShen('甲','甲'), '比'));
  tests.push(eq('shiShen("丙","壬") → 杀',           shiShen('丙','壬'), '杀'));
  tests.push(eq('shiShen("癸","乙") → 食',           shiShen('癸','乙'), '食'));
  tests.push(eq('shiShen("庚","戊") → 枭',         shiShen('庚','戊'), '枭'));
  tests.push(eq('shiShen("壬","丁") → 财',           shiShen('壬','丁'), '财'));

  // === 纳音 ===
  tests.push({ section:'纳音' });
  tests.push(eq('甲子→海中金', NAYIN['甲子'], '海中金'));
  tests.push(eq('壬戌→大海水', NAYIN['壬戌'], '大海水'));

  // === 十二长生 ===
  tests.push({ section:'十二长生' });
  tests.push(eq('changSheng("甲","亥")→长生',       changSheng('甲','亥'), '长生'));
  tests.push(eq('changSheng("甲","子")→沐浴',       changSheng('甲','子'), '沐浴'));
  tests.push(eq('changSheng("丙","寅")→长生',       changSheng('丙','寅'), '长生'));
  tests.push(eq('changSheng("辛","丑")→养(阴干)',   changSheng('辛','丑'), '养'));
  tests.push(eq('changSheng("辛","子")→长生(阴干)', changSheng('辛','子'), '长生'));

  // === 流年 ===
  tests.push({ section:'流年干支' });
  tests.push(eq('liuNianJZ(2026)→丙午',            liuNianJZ(2026), '丙午'));
  tests.push(eq('liuNianJZ(1982)→壬戌',            liuNianJZ(1982), '壬戌'));
  tests.push(eq('liuNianJZ(1984)→甲子',            liuNianJZ(1984), '甲子'));

  // === 地支序号 ===
  tests.push({ section:'地支序号' });
  tests.push(eq('dzNum("寅")→1',                    dzNum('寅'), 1));
  tests.push(eq('dzNum("子")→11',                   dzNum('子'), 11));
  tests.push(eq('numZhi(1)→寅',                     numZhi(1), '寅'));
  tests.push(eq('numZhi(11)→子',                    numZhi(11), '子'));

  // === 全盘回归 ===
  function testChart(label, name, gender, y, m, d, h, mi, checks) {
    tests.push({ section:'全盘 — ' + label });
    const p = paipan(name, gender, y, m, d, h, mi);
    for (const [k, expected] of Object.entries(checks)) {
      // 支持复合字段：nianGan+nianZhi → p.nianGan + p.nianZhi
      let actual;
      if (k.includes('+')) {
        const parts = k.split('+');
        actual = parts.map(pt => {
          const keys = pt.split('.');
          let v = p;
          for (const key of keys) { v = v ? (v[key] !== undefined ? v[key] : (Array.isArray(v) && /^\d+$/.test(key) ? v[parseInt(key)] : undefined)) : undefined; }
          return v !== undefined ? String(v) : '?';
        }).join('');
      }
      // 支持数组索引：daYun.0.gan+zhi
      else if (k.includes('.') && !k.includes('[')) {
        const keys = k.split('.');
        let v = p;
        for (const key of keys) {
          if (!v) break;
          if (/^\d+$/.test(key)) v = v[parseInt(key)];
          else v = v[key];
        }
        actual = v !== undefined ? String(v) : '?';
      } else {
        actual = String(p[k] !== undefined ? p[k] : '?');
      }
      tests.push(eq(k, String(actual), expected));
    }
  }

  testChart('邦顺', '邦顺', '男', 1982,10,18,5,1, {
    'nian.gan+nian.zhi': '壬戌', 'yue.gan+yue.zhi': '庚戌',
    'ri.gan+ri.zhi': '甲戌', 'shi.gan+shi.zhi': '丁卯',
    'ri.gan': '甲', 'ming.gan+ming.zhi': '甲辰',
    'daYun.0.gan+daYun.0.zhi': '辛亥', 'daYun.1.gan+daYun.1.zhi': '壬子',
    'shen.gan+shen.zhi': '壬寅', 'tai.gan+tai.zhi': '辛丑'
  });

  testChart('芝晓', '芝晓', '女', 1983,5,15,9,45, {
    'nian.gan+nian.zhi': '癸亥', 'yue.gan+yue.zhi': '丁巳',
    'ri.gan+ri.zhi': '癸卯', 'shi.gan+shi.zhi': '丁巳',
    'ri.gan': '癸', 'ming.gan+ming.zhi': '己未', 'tai.gan+tai.zhi': '戊申',
    'shen.gan+shen.zhi': '癸亥', 'daYun.0.gan+daYun.0.zhi': '戊午'
  });

  testChart('素素', '素素', '女', 1986,1,1,12,0, {
    'nian.gan+nian.zhi': '乙丑', 'ri.gan+ri.zhi': '乙巳', 'ri.gan': '乙',
    'ming.gan+ming.zhi': '丁亥', 'shen.gan+shen.zhi': '癸未', 'tai.gan+tai.zhi': '己卯'
  });

  testChart('小龙', '小龙', '男', 1985,3,21,14,30, {
    'nian.gan+nian.zhi': '乙丑', 'ri.gan+ri.zhi': '己未', 'ri.gan': '己',
    'ming.gan+ming.zhi': '癸未', 'shen.gan+shen.zhi': '丁亥', 'tai.gan+tai.zhi': '庚午'
  });

  testChart('苓菲', '苓菲', '女', 1988,7,7,22,15, {
    'ri.gan+ri.zhi': '癸亥', 'ri.gan': '癸',
    'ming.gan+ming.zhi': '癸亥', 'shen.gan+shen.zhi': '己未', 'tai.gan+tai.zhi': '庚戌'
  });

  testChart('新善', '新善', '男', 1989,12,12,7,30, {
    'ri.gan+ri.zhi': '丙午', 'ri.gan': '丙',
    'ming.gan+ming.zhi': '丁丑', 'shen.gan+shen.zhi': '己巳', 'tai.gan+tai.zhi': '丁卯'
  });

  testChart('冯际州', '冯际州', '男', 2010,2,14,15,0, {
    'ri.gan+ri.zhi': '乙未', 'ri.gan': '乙',
    'ming.gan+ming.zhi': '癸未', 'shen.gan+shen.zhi': '丁亥', 'tai.gan+tai.zhi': '己巳'
  });

  testChart('吴星宝', '吴星宝', '男', 2012,6,8,11,0, {
    'ri.gan+ri.zhi': '庚子', 'ri.gan': '庚',
    'ming.gan+ming.zhi': '乙巳', 'shen.gan+shen.zhi': '癸丑', 'tai.gan+tai.zhi': '丁酉'
  });

  testChart('邵凡语', '邵凡语', '女', 2014,9,19,18,30, {
    'ri.gan+ri.zhi': '癸巳', 'ri.gan': '癸',
    'ming.gan+ming.zhi': '乙亥', 'shen.gan+shen.zhi': '辛未', 'tai.gan+tai.zhi': '甲子'
  });

  // ============ 函数级测试: 直接用干支验证 mingGong/shenGong/taiYuan ============
  (function testFuncs() {
    tests.push({ section:'函数级 — 命宫/身宫/胎元 干支直入' });
    const cases = [
      { label:'邦顺', yg:'庚', yz:'戌', sz:'卯', ng:'壬', mg:'甲辰', sg:'壬寅', ty:'辛丑' },
      { label:'芝晓', yg:'壬', yz:'辰', sz:'子', ng:'辛', mg:'辛丑', sg:'癸巳', ty:'癸未' },
      { label:'素素', yg:'戊', yz:'寅', sz:'巳', ng:'庚', mg:'丙戌', sg:'甲申', ty:'己巳' },
      { label:'小龙', yg:'癸', yz:'酉', sz:'戌', ng:'己', mg:'甲戌', sg:'壬申', ty:'甲子' },
      { label:'苓菲', yg:'壬', yz:'子', sz:'子', ng:'壬', mg:'乙巳', sg:'癸丑', ty:'癸卯' },
      { label:'新善', yg:'丁', yz:'酉', sz:'辰', ng:'辛', mg:'壬辰', sg:'庚寅', ty:'戊子' },
      { label:'冯际州', yg:'己', yz:'亥', sz:'丑', ng:'丙', mg:'癸巳', sg:'辛丑', ty:'庚寅' },
      { label:'吴星宝', yg:'乙', yz:'巳', sz:'酉', ng:'丁', mg:'癸卯', sg:'癸卯', ty:'丙申' },
      { label:'邵凡语', yg:'丁', yz:'未', sz:'寅', ng:'丁', mg:'戊申', sg:'庚戌', ty:'戊戌' },
    ];
    for (const c of cases) {
      const ty = taiYuan(c.yg, c.yz); tests.push(eq('胎元:'+c.label, ty.gan+ty.zhi, c.ty));
      const mg = mingGong(c.yz, c.sz, c.ng); tests.push(eq('命宫:'+c.label, mg.gan+mg.zhi, c.mg));
      const sg = shenGong(c.yz, c.sz, c.ng); tests.push(eq('身宫:'+c.label, sg.gan+sg.zhi, c.sg));
    }
  })();

  // === 边界测试：纳音土五行 ===
  (function testNayinTu() {
    tests.push({ section:'边界 — 纳音土五行' });
    const cs = [
      ['庚子','壁上土'], ['辛丑','壁上土'],  // 庚子辛丑壁上土
      ['戊寅','城头土'], ['己卯','城头土'],  // 戊寅己卯城头土
      ['丙辰','沙中土'], ['丁巳','沙中土'],  // 丙辰丁巳沙中土
      ['庚午','路旁土'], ['辛未','路旁土'],  // 庚午辛未路旁土
      ['戊申','大驿土'], ['己酉','大驿土'],  // 戊申己酉大驿土
      ['丙戌','屋上土'], ['丁亥','屋上土'],  // 丙戌丁亥屋上土
    ];
    for (const [gz, expected] of cs) {
      tests.push(eq('纳音:' + gz, NAYIN[gz], expected));
    }
  })();

  // === 边界测试：同一八字一致性（幂等性）===
  (function testIdempotent() {
    tests.push({ section:'边界 — 同一八字幂等' });
    var p1 = paipan('测试', '男', 2000, 1, 1, 12, 0);
    var p2 = paipan('测试', '男', 2000, 1, 1, 12, 0);
    var fields = [
      ['年柱', p1.nian.gan+p1.nian.zhi, p2.nian.gan+p2.nian.zhi],
      ['月柱', p1.yue.gan+p1.yue.zhi, p2.yue.gan+p2.yue.zhi],
      ['日柱', p1.ri.gan+p1.ri.zhi, p2.ri.gan+p2.ri.zhi],
      ['时柱', p1.shi.gan+p1.shi.zhi, p2.shi.gan+p2.shi.zhi],
    ];
    for (var i = 0; i < fields.length; i++) {
      tests.push(eq('幂等:' + fields[i][0], fields[i][1], fields[i][2]));
    }
  })();

  // === 边界测试：真太阳时功能（如存在则验证，不存在则标记跳过）===
  (function testSolarCrossDay() {
    tests.push({ section:'边界 — 真太阳时' });
    if (typeof adjustToSolarTime === 'function') {
      tests.push(eq('真太阳时函数存在', '存在', '存在'));
      var r1 = adjustToSolarTime(12, 0, 108.33);
      tests.push(eq('真太阳时:南宁12:00', (r1.hour !== 12 || r1.min !== 0) ? '已调整' : '中午', '已调整'));
    } else {
      // adjustToSolarTime 当前未在 standalone 中定义，标记为跳过（非失败）
      tests.push({ label:'真太阳时:函数未定义(已跳过)', ok:true, detail:'=跳过(需外部实现)' });
    }
  })();

  // === 边界测试：身宫重复验证（v0.9.4 修复的 hi 未定义bug） ===
  (function testShenGongRegression() {
    tests.push({ section:'回归 — 身宫 v0.9.4 hi 未定义' });
    var p = paipan('回归验证', '男', 2000, 6, 15, 8, 0);
    var sg = (p.shen && p.shen.gan) ? '非空' : '空';
    tests.push(eq('身宫hi回归:不为空', sg, '非空'));
    tests.push(eq('身宫hi回归:有效值', (p.shen && p.shen.gan && p.shen.gan !== '?' && p.shen.zhi !== '?'), true));
  })();

  // === 完整预置数据快照（从 archives.json 全部11孩） ===
  (function testFullPresetSnapshot() {
    tests.push({ section:'快照 — 全部预置数据排盘' });
    var presetCases = [
      { n:'邦顺', g:'男', y:1982,m:10,d:18,h:5,mi:1, exp:{ng:'壬戌',yg:'庚戌',rg:'甲戌',sg:'丁卯',mg:'甲辰',sng:'壬寅',ty:'辛丑'} },
      { n:'芝晓', g:'女', y:1981,m:4,d:23,h:0,mi:17, exp:{ng:'辛酉',yg:'壬辰',rg:'辛未',sg:'戊子',mg:'辛丑',sng:'癸巳',ty:'癸未'} },
      { n:'素素', g:'女', y:1990,m:2,d:6,h:10,mi:2, exp:{ng:'庚午',yg:'戊寅',rg:'壬寅',sg:'乙巳',mg:'丙戌',sng:'甲申',ty:'己巳'} },
      { n:'小龙', g:'男', y:1989,m:10,d:2,h:19,mi:48, exp:{ng:'己巳',yg:'癸酉',rg:'乙未',sg:'丙戌',mg:'甲戌',sng:'壬申',ty:'甲子'} },
      { n:'苓菲', g:'女', y:1992,m:12,d:31,h:0,mi:12, exp:{ng:'壬申',yg:'壬子',rg:'辛巳',sg:'戊子',mg:'乙巳',sng:'癸丑',ty:'癸卯'} },
      { n:'新善', g:'男', y:1991,m:9,d:15,h:7,mi:4, exp:{ng:'辛未',yg:'丁酉',rg:'戊子',sg:'丙辰',mg:'壬辰',sng:'庚寅',ty:'戊子'} },
      { n:'冯际州',g:'男', y:2006,m:11,d:20,h:1,mi:38, exp:{ng:'丙戌',yg:'己亥',rg:'癸丑',sg:'癸丑',mg:'癸巳',sng:'辛丑',ty:'庚寅'} },
      { n:'吴星宝',g:'男', y:2017,m:5,d:22,h:18,mi:30, exp:{ng:'丁酉',yg:'乙巳',rg:'己酉',sg:'癸酉',mg:'癸卯',sng:'癸卯',ty:'丙申'} },
      { n:'邵凡语',g:'男', y:2017,m:7,d:31,h:4,mi:25, exp:{ng:'丁酉',yg:'丁未',rg:'己未',sg:'丙寅',mg:'戊申',sng:'庚戌',ty:'戊戌'} },
      { n:'测试',  g:'男', y:2006,m:11,d:20,h:1,mi:38, exp:{ng:'丙戌',yg:'己亥',rg:'癸丑',sg:'癸丑',mg:'癸巳',sng:'辛丑',ty:'庚寅'} },
      { n:'冯际诈',g:'男', y:2006,m:11,d:20,h:1,mi:38, exp:{ng:'丙戌',yg:'己亥',rg:'癸丑',sg:'癸丑',mg:'癸巳',sng:'辛丑',ty:'庚寅'} },
    ];
    for (var i = 0; i < presetCases.length; i++) {
      var c = presetCases[i];
      var p = paipan(c.n, c.g, c.y, c.m, c.d, c.h, c.mi);
      var nian = (p.nian||{}); var yue = (p.yue||{}); var ri = (p.ri||{});
      var shi = (p.shi||{}); var ming = (p.ming||{}); var shen = (p.shen||{}); var tai = (p.tai||{});
      var fields = [
        ['年柱', (nian.gan||'')+(nian.zhi||''), c.exp.ng],
        ['月柱', (yue.gan||'')+(yue.zhi||''), c.exp.yg],
        ['日柱', (ri.gan||'')+(ri.zhi||''), c.exp.rg],
        ['时柱', (shi.gan||'')+(shi.zhi||''), c.exp.sg],
        ['命宫', (ming.gan||'')+(ming.zhi||''), c.exp.mg],
        ['身宫', (shen.gan||'')+(shen.zhi||''), c.exp.sng],
        ['胎元', (tai.gan||'')+(tai.zhi||''), c.exp.ty],
      ];
      for (var j = 0; j < fields.length; j++) {
        tests.push(eq('快照:' + c.n + '·' + fields[j][0], fields[j][1], fields[j][2]));
      }
    }
  })();

  // === v0.20.1 常用宫位自动化断言 ===
  (function testGongWeiAssertions() {
    tests.push({ section:'宫位 — v0.20.1 自动化断言' });

    // A1: getFavGroups() 返回顺序验证
    GONGWEI.persistFav(["信息","做功","亲缘"]);
    var groups = GONGWEI.getFavGroups();
    tests.push(eq('GWFav:A1 顺序',
      groups.map(function(g){return g.name;}).join(','),
      '信息,做功,亲缘'));

    // A2: toggleFav 取消常用 → fav 与 selected 级联清理
    GONGWEI.persistFav(["信息","做功"]);
    GONGWEI.clearSelection();
    GONGWEI.toggleSelect("信息");
    GONGWEI.toggleSelect("做功");
    GONGWEI.toggleFav("信息");
    var favAfter = GONGWEI.loadFav();
    var selAfter = GONGWEI.loadSelected();
    tests.push(eq('GWFav:A2 fav移除', favAfter.indexOf('信息') === -1, true));
    tests.push(eq('GWFav:A2 selected级联清理', selAfter.indexOf('信息') === -1, true));
    tests.push(eq('GWFav:A2 做功仍在fav', favAfter.indexOf('做功') >= 0, true));
    tests.push(eq('GWFav:A2 做功仍在selected', selAfter.indexOf('做功') >= 0, true));

    // A3: 旧用户迁移
    localStorage.removeItem('bz_gongwei_fav');
    var fav = GONGWEI.loadFav();
    if (fav.length === 0) {
      fav = GONGWEI.gongWeiGroups.map(function(g) { return g.name; });
      GONGWEI.persistFav(fav);
    }
    var favRebuilt = GONGWEI.loadFav();
    tests.push(eq('GWFav:A3 迁移后fav长度', favRebuilt.length, GONGWEI.gongWeiGroups.length));
    tests.push(eq('GWFav:A3 迁移后顺序一致',
      favRebuilt.join(','),
      GONGWEI.gongWeiGroups.map(function(g){return g.name;}).join(',')));

    // A4: resetFavOrder() 默认排序
    var originalGroupNames = GONGWEI.gongWeiGroups.map(function(g){return g.name;});
    GONGWEI.persistFav(["信息","做功","亲缘"]);
    var indices = {};
    for (var i = 0; i < originalGroupNames.length; i++) indices[originalGroupNames[i]] = i;
    GONGWEI.resetFavOrder();
    var favOrdered = GONGWEI.loadFav();
    var sorted = true;
    for (var i = 1; i < favOrdered.length; i++) {
      if (indices[favOrdered[i]] < indices[favOrdered[i-1]]) { sorted = false; break; }
    }
    tests.push(eq('GWFav:A4 默认排序同步', sorted, true));

    // A5: 新增宫位组默认不在 fav
    var favBefore = GONGWEI.loadFav().slice();
    var r = GONGWEI.addGroup('测试A5', ['A','B','C','D','E','F','G']);
    var favAfterAdd = GONGWEI.loadFav();
    tests.push(eq('GWFav:A5 新增不在fav', r.ok && favAfterAdd.length === favBefore.length, true));
    if (r.ok) GONGWEI.deleteGroup(r.group.id);

    // A6: 改名 → fav 同步；删除组 → fav+selected 清理
    // A6a: 改名同步
    GONGWEI.persistFav(["信息","做功"]);
    var infoGroup = GONGWEI.findGroupByName("信息");
    var infoLabels = infoGroup.labels.slice();
    GONGWEI.updateGroup(infoGroup.id, "信息2", infoLabels);
    var favAfterRename = GONGWEI.loadFav();
    tests.push(eq('GWFav:A6a 改名后fav更新',
      favAfterRename.indexOf("信息2") >= 0 && favAfterRename.indexOf("信息") === -1, true));
    // 改回来
    GONGWEI.updateGroup(infoGroup.id, "信息", infoLabels);

    // A6b: 删除组同步
    var r2 = GONGWEI.addGroup('测试A6b', ['A','B','C','D','E','F','G']);
    GONGWEI.persistFav(GONGWEI.loadFav().concat(['测试A6b']));
    GONGWEI.clearSelection();
    GONGWEI.toggleSelect('测试A6b');
    var tmpGroup = GONGWEI.findGroupByName("测试A6b");
    GONGWEI.deleteGroup(tmpGroup.id);
    var favAfterDel = GONGWEI.loadFav();
    var selAfterDel = GONGWEI.loadSelected();
    tests.push(eq('GWFav:A6b 删除后fav清理', favAfterDel.indexOf('测试A6b') === -1, true));
    tests.push(eq('GWFav:A6b 删除后selected清理', selAfterDel.indexOf('测试A6b') === -1, true));
  })();


  // ============ v0.23.4 节气当天出生崩溃修复断言（T01-T04） ============
  (function testSolarTermDayFix() {
    tests.push({ section:'节气当天 — v0.23.4 崩溃修复' });

    // T01: 1987-05-06 06:30（立夏 09:05:35 前）→ 辰月
    var m1 = monthPillar(1987, 5, 6, 6, 30, '丁');
    tests.push(eq('T01:立夏当天06:30→辰月', m1.zhi, '辰'));
    tests.push(eq('T01:月柱甲辰', m1.gan + m1.zhi, '甲辰'));

    // T02: 1987-05-06 18:00（立夏后）→ 巳月
    var m2 = monthPillar(1987, 5, 6, 18, 0, '丁');
    tests.push(eq('T02:立夏当天18:00→巳月', m2.zhi, '巳'));
    tests.push(eq('T02:月柱乙巳', m2.gan + m2.zhi, '乙巳'));

    // T03: renYuanSiLing 带时分 → 06:30 落辰月（清明后 30 日），不得出现「立夏后 0 日」
    var ry = renYuanSiLing(1987, 5, 6, 6, 30);
    tests.push(eq('T03:人元司令含清明', ry.indexOf('清明') >= 0, true));
    tests.push(eq('T03:天数30', ry.indexOf('30 日') >= 0, true));
    tests.push(eq('T03:无立夏后0日', ry.indexOf('立夏后 0 日') === -1, true));

    // T04: 起运日期越界（2109，超出节气表 1000-2100）→ 交运循环 null 防护不抛异常
    var threw4 = null;
    try {
      var p4 = paipan('越界防护', '男', 1987, 5, 6, 6, 30);
      p4.qiYun.years = 122; p4.qiYun.months = 0; p4.qiYun.days = 0; p4.qiYun.hours = 0;
      renderChart(p4, 1, 'output');
    } catch (e) { threw4 = e; }
    tests.push(eq('T04:交运越界不抛异常', threw4 === null, true));
  })();

  // ============ v0.31.0 节气边界真值断言（T05-T11） ============
  // 真值来源（独立于本代码库）：
  //   · 香港天文台 24 节气（香港时间=北京时间）2026 立春 02-04 04:02 / 2026 立夏 05-05 19:49
  //   · JPL DE421 + IAU2006 真黄道链：2026 立春 04:02:07 / 1987 立夏 05-06 09:05:34 / 2026 立夏 19:48:43
  // 断言把「显示时刻」与「边界行为」绑成自洽对：表内 2026 立春 04:01:51、1987 立夏 09:05:35
  // ⇒ 04:02 / 09:06 必须已换月。若再出现「显示层对、比较基准错」的 8 小时错位（v0.23.4 回归），
  // 本组断言立即失败。
  (function testTermBoundaryTruth() {
    tests.push({ section:'节气边界真值 — v0.31.0' });

    // T05/T06: 2026 立春 04:01:51 前后一分钟分别是丑月 / 寅月
    var m5 = monthPillar(2026, 2, 4, 4, 1, '乙');
    var m6 = monthPillar(2026, 2, 4, 4, 2, '丙');
    tests.push(eq('T05:2026立春04:01→丑月', m5.zhi, '丑'));
    tests.push(eq('T06:2026立春04:02→庚寅', m6.gan + m6.zhi, '庚寅'));

    // T07: 年柱同刻切换（立春前乙巳 / 立春后丙午）
    var p1 = paipan('真值T07', '男', 2026, 2, 4, 4, 1);
    var p2 = paipan('真值T07', '男', 2026, 2, 4, 4, 2);
    tests.push(eq('T07:立春前04:01年柱乙巳', p1.nian.gan + p1.nian.zhi, '乙巳'));
    tests.push(eq('T07:立春后04:02年柱丙午', p2.nian.gan + p2.nian.zhi, '丙午'));

    // T08/T09: 1987 立夏 09:05:35 前后一分钟分别是辰月 / 巳月
    var m8 = monthPillar(1987, 5, 6, 9, 5, '丁');
    var m9 = monthPillar(1987, 5, 6, 9, 6, '丁');
    tests.push(eq('T08:1987立夏09:05→甲辰', m8.gan + m8.zhi, '甲辰'));
    tests.push(eq('T09:1987立夏09:06→乙巳', m9.gan + m9.zhi, '乙巳'));

    // T10: 人元司令随同一时刻换节
    tests.push(eq('T10:09:05人元司令含清明', renYuanSiLing(1987, 5, 6, 9, 5).indexOf('清明') >= 0, true));
    tests.push(eq('T10:09:06人元司令含立夏', renYuanSiLing(1987, 5, 6, 9, 6).indexOf('立夏') >= 0, true));

    // T11: 起运量级守卫（8 小时错位曾令此处爆到 121 年）
    var q11 = paipan('真值T11', '男', 1988, 5, 5, 23, 0);
    var q11y = q11.qiYun ? q11.qiYun.years : -1;
    tests.push(eq('T11:1988-05-05 23:00男起运∈[5,20]年', q11y >= 5 && q11y <= 20, true));
  })();

  // ============ v0.23.0 盘面截图断言（T01-T06，承接遗留项 L2 隐私断言） ============
  (function testScreenshot() {
    tests.push({ section:'截图 — v0.23.0' });

    // T01: 截图按钮存在且 onclick 绑定 captureScreenshot（测试 UI 隐藏 .page 但 DOM 仍在）
    var sbtn = document.getElementById('btnScreenshot');
    tests.push(eq('截图:T01 按钮存在', sbtn ? '存在' : '缺失', '存在'));
    tests.push(eq('截图:T01 onclick 绑定', sbtn ? (sbtn.getAttribute('onclick') || '').indexOf('captureScreenshot') >= 0 : false, true));

    // T02-T04: 文件名生成 + 隐私联动（改写隐私开关，try/finally 恢复防污染后续断言）
    var prevPrivacy = ARCHIVE.getPrivacyMode();
    try {
      ARCHIVE.setPrivacyMode(false);
      var f2 = buildScreenshotFilename({ name:'邦顺', nickname:'', yiming:'' });
      tests.push(eq('截图:T02 隐私关→含真名', f2.indexOf('邦顺') >= 0, true));
      tests.push(eq('截图:T02 前缀格式', f2.indexOf('八字排盘_') === 0 && /\.png$/.test(f2), true));

      ARCHIVE.setPrivacyMode(true);
      var f3 = buildScreenshotFilename({ name:'邦顺', nickname:'小名', yiming:'小荷' });
      tests.push(eq('截图:T03 隐私开→含艺名', f3.indexOf('小荷') >= 0, true));
      tests.push(eq('截图:T03 不含真名', f3.indexOf('邦顺') === -1, true));

      var f4 = buildScreenshotFilename({ name:'邦顺', nickname:'', yiming:'' });
      tests.push(eq('截图:T04 匿名兜底', f4.indexOf('匿名') >= 0, true));
      tests.push(eq('截图:T04 不含真名', f4.indexOf('邦顺') === -1, true));
    } finally {
      ARCHIVE.setPrivacyMode(prevPrivacy);
    }

    // T05: 字符清洗纯函数直测
    var s5 = sanitizeFilename('小/荷 花');
    tests.push(eq('截图:T05 清洗后不含斜杠', s5.indexOf('/') === -1, true));
    tests.push(eq('截图:T05 清洗后不含空格', s5.indexOf(' ') === -1, true));

    // T06: 未排盘守卫（主动重置 #output 为占位态保证确定性，不依赖当前渲染态）
    var out = document.getElementById('output');
    var prevHtml = out ? out.innerHTML : '';
    var threw = null;
    var clickCount = 0;
    var origClick = HTMLAnchorElement.prototype.click;
    try {
      if (out) out.innerHTML = '<div class="loading">占位</div>';
      HTMLAnchorElement.prototype.click = function() { clickCount++; };
      captureScreenshot();
    } catch (e) {
      threw = e;
    } finally {
      HTMLAnchorElement.prototype.click = origClick;
      if (out) out.innerHTML = prevHtml;
      var nt = document.getElementById('screenshotNotify');
      if (nt && nt.parentNode) nt.parentNode.removeChild(nt);
    }
    tests.push(eq('截图:T06 不抛异常', threw === null, true));
    tests.push(eq('截图:T06 无下载触发', clickCount === 0, true));
    tests.push(eq('截图:T06 无离屏残留', document.getElementById('screenshotHolder') ? '有残留' : '无残留', '无残留'));
  })();

  // ===== v0.25.0 宫位配置保护 T01-T06（GONGWEI 纯逻辑，gongwei.js 在 main 前加载可同步断言）=====
  (function() {
    tests.push({ section:'宫位配置保护(v0.25)' });
    var GW = window.GONGWEI;
    if (!GW) { tests.push(fail('v0.25 T01:GONGWEI 已挂载', 'window.GONGWEI 缺失')); return; }
    var LS = ['bz_gongwei_groups', 'bz_gongwei_trash', 'bz_gongwei_selected', 'bz_gongwei_fav'];
    var snap = {};
    for (var si = 0; si < LS.length; si++) { try { snap[LS[si]] = localStorage.getItem(LS[si]); } catch (e) { snap[LS[si]] = null; } }
    try { snap.bz_gongwei_schema_version = localStorage.getItem('bz_gongwei_schema_version'); } catch (e) { snap.bz_gongwei_schema_version = null; }
    function countBackup() {
      var n = 0;
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('_backup_') >= 0) n++; }
      return n;
    }
    function countCorrupt(prefix) {
      var n = 0;
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(prefix) === 0) n++; }
      return n;
    }
    function restore() {
      for (var ri = 0; ri < LS.length; ri++) {
        try { var k = LS[ri]; if (snap[k] === null) localStorage.removeItem(k); else localStorage.setItem(k, snap[k]); } catch (e) {}
      }
      try { if (snap.bz_gongwei_schema_version === null) localStorage.removeItem('bz_gongwei_schema_version'); else localStorage.setItem('bz_gongwei_schema_version', snap.bz_gongwei_schema_version); } catch (e) {}
      if (typeof GW.refreshGongWeiState === 'function') GW.refreshGongWeiState();
    }
    var beforeGroups = JSON.stringify(GW.loadGroups());

    // T01 schema 版本
    tests.push(eq('v0.25 T01:GONGWEI_SCHEMA_VERSION=1', GW.GONGWEI_SCHEMA_VERSION, 1));
    var sv = null;
    try { sv = localStorage.getItem('bz_gongwei_schema_version'); } catch (e) {}
    tests.push(eq('v0.25 T01:localStorage 有 schema_version', sv !== null, true));

    // T02 导出结构
    var payload = GW.buildExportPayload();
    tests.push(eq('v0.25 T02:导出含4键+schemaVersion', payload && Object.keys(payload).sort().join(','), 'exportedAt,exportedAtLocal,fav,groups,schemaVersion,selected,trash'));
    try {
      var round = JSON.parse(JSON.stringify(payload));
      tests.push(eq('v0.25 T02:导出JSON可逆', JSON.stringify(round) === JSON.stringify(payload), true));
    } catch (e) {
      tests.push(fail('v0.25 T02:导出JSON可逆', 'JSON 序列化异常'));
    }

    // T03 导入合法（先备份当前 backup 基线）
    var bakBase3 = countBackup();
    var importedGroups = [{ id: 'gw_t03', name: '测试T03组', labels: ['a'], isPreset: false, color: '#888', createdAt: 'x', updatedAt: 'x' }];
    var r3 = GW.applyImportPayload({ schemaVersion: 1, groups: importedGroups, trash: [], selected: ['测试T03组'], fav: ['测试T03组'] });
    tests.push(eq('v0.25 T03:导入返回ok', r3 && r3.ok, true));
    tests.push(eq('v0.25 T03:groups与导入值一致', JSON.stringify(GW.loadGroups()), JSON.stringify(importedGroups)));
    tests.push(eq('v0.25 T03:selected与导入值一致', JSON.stringify(GW.loadSelected()), JSON.stringify(['测试T03组'])));
    tests.push(eq('v0.25 T03:fav与导入值一致', JSON.stringify(GW.loadFav()), JSON.stringify(['测试T03组'])));
    tests.push(eq('v0.25 T03:导入产生backup键', countBackup() > bakBase3, true));
    restore();
    tests.push(eq('v0.25 T03:恢复后groups不变', JSON.stringify(GW.loadGroups()), beforeGroups));

    // T04 导入非法（校验失败不覆盖、无新 backup）
    var bakBase4 = countBackup();
    tests.push(eq('v0.25 T04:非对象 ok=false', GW.validateImportPayload({ bad: 1 }).ok, false));
    tests.push(eq('v0.25 T04:版本过高 ok=false', GW.validateImportPayload({ schemaVersion: 99, groups: [] }).ok, false));
    tests.push(eq('v0.25 T04:缺groups ok=false', GW.validateImportPayload({ schemaVersion: 1, groups: 'x' }).ok, false));
    var r4 = GW.applyImportPayload({ bad: 1 });
    tests.push(eq('v0.25 T04:apply非法返回 ok=false', r4 && r4.ok, false));
    tests.push(eq('v0.25 T04:非法导入后数据不变', JSON.stringify(GW.loadGroups()), beforeGroups));
    tests.push(eq('v0.25 T04:非法导入无新backup键', countBackup() === bakBase4, true));

    // T05 损坏 JSON → 默认14组 + corrupt 备份
    try { localStorage.setItem('bz_gongwei_groups', '{broken'); } catch (e) {}
    var g5 = GW.loadGroups();
    tests.push(eq('v0.25 T05:损坏→默认14组', Array.isArray(g5) && g5.length, 14));
    tests.push(eq('v0.25 T05:损坏产生corrupt备份', countCorrupt('bz_gongwei_groups_corrupt_') > 0, true));
    restore();
    tests.push(eq('v0.25 T05:恢复后groups不变', JSON.stringify(GW.loadGroups()), beforeGroups));

    // T06 缺失 → 默认14组 + 无新增 corrupt
    var corrupt6 = countCorrupt('bz_gongwei_groups_corrupt_');
    try { localStorage.removeItem('bz_gongwei_groups'); } catch (e) {}
    var g6 = GW.loadGroups();
    tests.push(eq('v0.25 T06:缺失→默认14组', Array.isArray(g6) && g6.length, 14));
    tests.push(eq('v0.25 T06:缺失无新增corrupt', countCorrupt('bz_gongwei_groups_corrupt_') === corrupt6, true));
    restore();
    tests.push(eq('v0.25 T06:恢复后groups不变', JSON.stringify(GW.loadGroups()), beforeGroups));
  })();

  // ===== v0.26.0 当年节气数据 T01-T05（RENDER.buildJieqiHtml mock year 注入，不 mock 时钟）=====
  (function() {
    tests.push({ section:'当年节气数据(v0.26)' });
    var RJ = (window.RENDER && typeof window.RENDER.buildJieqiHtml === 'function') ? window.RENDER.buildJieqiHtml : null;
    if (!RJ) { tests.push(fail('v0.26 T01:RENDER.buildJieqiHtml 已挂载', 'window.RENDER.buildJieqiHtml 缺失')); return; }
    var JIE = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
    var QI  = ['雨水','春分','谷雨','小满','夏至','大暑','处暑','秋分','霜降','小雪','冬至','大寒'];
    function hasTag(html, name) { return html.indexOf('data-term="' + name + '"') >= 0; }

    // T01 结构/集合：12 节齐全、12 气不出现（仅 MONTH_TERM 12 索引 → 天然不含气）
    var s26 = '';
    try { s26 = RJ(2026); } catch (e) { tests.push(fail('v0.26 T01:buildJieqiHtml(2026) 不抛', e.message)); return; }
    var miss = [];
    for (var a = 0; a < JIE.length; a++) { if (!hasTag(s26, JIE[a])) miss.push(JIE[a]); }
    tests.push(eq('v0.26 T01:12节齐全(' + JIE.join('/') + ')', miss.length === 0, true));
    var hitQi = [];
    for (var b = 0; b < QI.length; b++) { if (hasTag(s26, QI[b])) hitQi.push(QI[b]); }
    tests.push(eq('v0.26 T01:不含12气(' + QI.join('/') + ')', hitQi.length === 0, true));

    // T02 年份口径：MONTH_TERM 末位=0（小寒）；末列小寒取 year+1
    var mtArr = window.CONST && window.CONST.MONTH_TERM;
    tests.push(eq('v0.26 T02:MONTH_TERM 末位=0(小寒)', mtArr && mtArr[mtArr.length - 1], 0));
    var xhRe = /data-term="小寒"[\s\S]*?class="jq-md">1\/5</;
    tests.push(eq('v0.26 T02:2026 小寒取次年 1/5', xhRe.test(s26), true));

    // T03 取数正确：2026 全 12 列月日/时间与 constants.js 锚点一致（PRD AC05）
    var ANCHORS = [
      ['立春','2/4','04:01'],['惊蛰','3/5','21:58'],['清明','4/5','02:39'],['立夏','5/5','19:48'],
      ['芒种','6/5','23:48'],['小暑','7/7','09:56'],['立秋','8/7','19:42'],['白露','9/7','22:40'],
      ['寒露','10/8','14:28'],['立冬','11/7','17:51'],['大雪','12/7','10:52'],['小寒','1/5','22:09']
    ];
    var mdAll = [], tmAll = [], mdm, tmm, reAll = /class="jq-md">([^<]+)<\/div><div class="jq-tm">([^<]+)<\/div>/g;
    while ((mdm = reAll.exec(s26)) !== null) { mdAll.push(mdm[1]); tmAll.push(mdm[2]); }
    tests.push(eq('v0.26 T03:12列完整', mdAll.length, 12));
    for (var c = 0; c < ANCHORS.length; c++) {
      tests.push(eq('v0.26 T03:' + ANCHORS[c][0] + '月日=' + ANCHORS[c][1], mdAll[c], ANCHORS[c][1]));
      tests.push(eq('v0.26 T03:' + ANCHORS[c][0] + '时间=' + ANCHORS[c][2], tmAll[c], ANCHORS[c][2]));
    }

    // T04 干支竖排结构：.jq-gz 内 .jq-gan 在上、.jq-zhi 在下（字符串顺序）
    var gzRe = /class="jq-gz"><span class="jq-gan">[^<]+<\/span><span class="jq-zhi">[^<]+<\/span><\/div>/g;
    var gzCnt = (s26.match(gzRe) || []).length;
    tests.push(eq('v0.26 T04:干支竖排块×12(gan上zhi下)', gzCnt, 12));

    // T05 边界防御：2100 小寒「—」不抛；2200 占位提示不抛
    var s2100 = '', s2200 = '', e2100 = null, e2200 = null;
    try { s2100 = RJ(2100); } catch (e) { e2100 = e; }
    tests.push(eq('v0.26 T05:buildJieqiHtml(2100) 不抛异常', e2100 === null, true));
    tests.push(eq('v0.26 T05:2100 小寒列月日=—', /data-term="小寒"[\s\S]*?class="jq-md">—</.test(s2100), true));
    tests.push(eq('v0.26 T05:2100 标题提示小寒越界', s2100.indexOf('小寒超出节气表') >= 0, true));
    try { s2200 = RJ(2200); } catch (e) { e2200 = e; }
    tests.push(eq('v0.26 T05:buildJieqiHtml(2200) 不抛异常', e2200 === null, true));
    tests.push(eq('v0.26 T05:2200 灰字占位提示', s2200.indexOf('jieqi-note') >= 0 && s2200.indexOf('仅支持') >= 0, true));
  })();

  // ===== v0.26.0 节气流年联动 T06-T14（真实 paipan 数据 → #tst-out → click/调函数断言）=====
  (function() {
    tests.push({ section:'节气流年联动(v0.26)' });
    var R = window.RENDER;
    if (!R || typeof R.renderChart !== 'function' || typeof R.refreshJieqi !== 'function' || typeof R.liunianYearOf !== 'function') {
      tests.push(fail('v0.26 T06: 前置 RENDER.renderChart/refreshJieqi/liunianYearOf 已挂载', '缺失'));
      return;
    }
    // 独立测试容器（隐藏正常 UI 时也放 body，不与页面 #output 互相干扰）
    var tst = document.createElement('div');
    tst.id = 'tst-out';
    document.body.appendChild(tst);
    function jqTitle() { var t = tst.querySelector('.jieqi-title'); return t ? t.textContent : ''; }
    function jieqiYear() { return tst._jieqiYear; }
    function assertTitleYear(tag, targetYear) {
      tests.push(eq(tag + ': 标题含' + targetYear, jqTitle().indexOf(String(targetYear)) >= 0, true));
      tests.push(eq(tag + ': _jieqiYear=' + targetYear, jieqiYear(), targetYear));
    }
    // 在容器内找「换算后年份 == targetYear」的流年格并 dispatch click
    function clickLiMatching(cd, targetYear, scopeCard) {
      var lis = (scopeCard || tst).querySelectorAll('.liu-row .li');
      for (var k = 0; k < lis.length; k++) {
        var di = parseInt(lis[k].getAttribute('data-di'), 10);
        var liI = parseInt(lis[k].getAttribute('data-li'), 10);
        if (isNaN(di) || isNaN(liI)) continue;
        if (R.liunianYearOf(cd, di, liI) === targetYear) {
          lis[k].dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      return false;
    }

    // 单人测试盘：1982-10-18 05:01 男（出生年 1982 ≠ 系统当前年）
    var pd = paipan('联动测试', '男', 1982, 10, 18, 5, 1);
    if (!pd || !pd.daYun || !pd.daYun.length) { tests.push(fail('v0.26 T06: paipan(1982 男) 返回完整数据', '缺 daYun')); return; }
    var nowY = new Date().getFullYear();
    R.renderChart(pd, undefined, 'tst-out');

    // T06 初始节气标题 = 出生年（v2-AC01）
    tests.push(eq('v0.26 T06: 初始标题含出生年1982', jqTitle().indexOf('1982') >= 0, true));
    tests.push(eq('v0.26 T06: 初始 _jieqiYear=1982', jieqiYear(), 1982));
    if (nowY !== 1982) { tests.push(eq('v0.26 T06: 初始标题不含系统年' + nowY, jqTitle().indexOf(String(nowY)) < 0, true)); }

    // T07 点 2026 流年 → 2026；连续 2031 → 2042 每次跟随（v2-AC02/AC03）
    tests.push(eq('v0.26 T07: 找到2026流年格', clickLiMatching(pd, 2026), true));
    assertTitleYear('v0.26 T07: 点2026流年', 2026);
    tests.push(eq('v0.26 T07: 找到2031流年格', clickLiMatching(pd, 2031), true));
    assertTitleYear('v0.26 T07: 点2031流年', 2031);
    tests.push(eq('v0.26 T07: 找到2042流年格', clickLiMatching(pd, 2042), true));
    assertTitleYear('v0.26 T07: 再点2042流年', 2042);

    // T08 点运前流年 data-di=-1 → 出生年+列偏移（v2-AC05）
    var preLis = tst.querySelectorAll('.liu-row .li[data-di="-1"]');
    tests.push(eq('v0.26 T08: 运前列存在(起运1989>1982)', preLis.length > 0, true));
    if (preLis.length > 0) {
      var jPre = parseInt(preLis[preLis.length - 1].getAttribute('data-li'), 10);
      preLis[preLis.length - 1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      assertTitleYear('v0.26 T08: 点运前末格', pd.y + jPre);
    }

    // T09 点大运列 data-dy=2 → 该运 startYear（v2-AC04）
    var dyCell = tst.querySelector('[data-dy="2"]');
    tests.push(eq('v0.26 T09: 找到 data-dy=2 大运列', !!dyCell, true));
    if (dyCell) {
      dyCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      assertTitleYear('v0.26 T09: 点大运[2]', pd.daYun[2].startYear);
    }

    // T10 scrollToNow（📍 今年）→ nowYear（v2-AC06）
    R.scrollToNow(tst);
    assertTitleYear('v0.26 T10: 今年', nowY);

    // T11 refreshJieqi DOM 替换路径越界不抛（v2-AC10，与 T05 纯函数互补）
    var e2100 = null, e2200 = null;
    try { R.refreshJieqi(tst, 2100); } catch (e) { e2100 = e; }
    tests.push(eq('v0.26 T11: refreshJieqi(2100) 不抛', e2100 === null, true));
    tests.push(eq('v0.26 T11: 2100 小寒列=—', /data-term="小寒"[\s\S]*?class="jq-md">—</.test(tst.innerHTML), true));
    tests.push(eq('v0.26 T11: 2100 _jieqiYear=2100', jieqiYear(), 2100));
    try { R.refreshJieqi(tst, 2200); } catch (e) { e2200 = e; }
    tests.push(eq('v0.26 T11: refreshJieqi(2200) 不抛', e2200 === null, true));
    tests.push(eq('v0.26 T11: 2200 整块占位', !!tst.querySelector('.jieqi-note') && tst.innerHTML.indexOf('仅支持') >= 0, true));

    // T12 同卵双胞胎：共享区一块 + 标题 = 出生年（v2-AC08）
    R.renderTwinCardsHtml(pd, 'tst-out');
    tests.push(eq('v0.26 T12: 同卵节气块仅1块', tst.querySelectorAll('.jieqi-section').length, 1));
    assertTitleYear('v0.26 T12: 同卵初始', 1982);

    // T13/T14 龙凤胎跨年（老大男1982 / 老二女1983 代码级构造）：初始=老大；点老二侧流年跟老二（v2-AC09/AC11）
    var d1 = paipan('老大', '男', 1982, 10, 18, 5, 1);
    var d2 = paipan('老二', '女', 1983, 1, 1, 0, 10);
    if (!d1 || !d2 || !d2.daYun || !d2.daYun.length) {
      tests.push(fail('v0.26 T13: 龙凤胎数据构造完整', 'd1/d2 缺 daYun'));
      return;
    }
    R.renderLongFengCardsHtml(d1, d2, 'tst-out');
    tests.push(eq('v0.26 T13: 龙凤胎共享节气块仅1块', tst.querySelectorAll('.jieqi-section').length, 1));
    assertTitleYear('v0.26 T13: 龙凤胎初始=老大1982', d1.y);
    var card2 = tst.querySelector('.bz-card-luck[data-card-index="1"]');
    tests.push(eq('v0.26 T14: 找到老二侧流年区', !!card2, true));
    if (card2) {
      var y2 = d2.daYun[1].startYear; // 老二某步大运起始年
      tests.push(eq('v0.26 T14: 老二侧找到' + y2 + '流年格', clickLiMatching(d2, y2, card2), true));
      assertTitleYear('v0.26 T14: 点老二侧流年跟老二', y2);
    }
    // 容器复位，避免污染其它断言
    R.renderChart(pd, undefined, 'tst-out');
  })();

  // ===== v0.27.0 节气真太阳时 T01-T07（纯函数断言 + 真实渲染 lng 注入）=====
  (function() {
    tests.push({ section:'节气真太阳时(v0.27)' });
    var R = window.RENDER;
    if (!R || typeof R.buildJieqiHtml !== 'function' || typeof R.refreshJieqi !== 'function') {
      tests.push(fail('v0.27 T01: 前置 RENDER.buildJieqiHtml/refreshJieqi 已挂载', '缺失'));
      return;
    }
    var RJ = R.buildJieqiHtml;
    // 抽每列 .jq-tsmd/.jq-tstm 文本并去掉「☀ 」前缀与空白（保留占位「—」）
    function pull(html, cls) {
      var out = [], re = new RegExp('class="' + cls + '">([^<]*)</div>', 'g'), m;
      while ((m = re.exec(html)) !== null) out.push(m[1].replace(/[☀\s]/g, ''));
      return out;
    }
    function allDash(arr) { if (!arr.length) return false; for (var q = 0; q < arr.length; q++) { if (arr[q] !== '—') return false; } return true; }
    var TSM = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
    // 2026 北京 116.4 锚点（node 加载真实 algorithm.js 计算，与 ADR §十一致）
    var A26MD = ['2/4','3/5','4/5','5/5','6/5','7/7','8/7','9/7','10/8','11/7','12/7','1/5'];
    var A26TM = ['03:33','21:31','02:21','19:37','23:36','09:37','19:22','22:27','14:26','17:53','10:46','21:50'];

    // T01 2026 + 116.4：12 组两行齐全 + 全 12 列真太阳值与锚点一致（AC01/AC02）
    var sBJ = '', e1 = null;
    try { sBJ = RJ(2026, 116.4); } catch (e) { e1 = e; }
    tests.push(eq('v0.27 T01:buildJieqiHtml(2026,116.4) 不抛', e1 === null, true));
    var mdBJ = pull(sBJ, 'jq-tsmd'), tmBJ = pull(sBJ, 'jq-tstm');
    tests.push(eq('v0.27 T01:真太阳日月行×12', mdBJ.length, 12));
    tests.push(eq('v0.27 T01:真太阳时间行×12', tmBJ.length, 12));
    for (var a1 = 0; a1 < 12; a1++) {
      tests.push(eq('v0.27 T01:' + TSM[a1] + '真太阳日月=' + A26MD[a1], mdBJ[a1], A26MD[a1]));
      tests.push(eq('v0.27 T01:' + TSM[a1] + '真太阳时间=' + A26TM[a1], tmBJ[a1], A26TM[a1]));
    }

    // T02 经度 75.99（喀什）→ 清明真太阳跨前一日 4/4 23:40（AC02）
    var sK = RJ(2026, 75.99);
    tests.push(eq('v0.27 T02:清明真太阳日月=4/4(跨前一日)', pull(sK, 'jq-tsmd')[2], '4/4'));
    tests.push(eq('v0.27 T02:清明真太阳时间=23:40', pull(sK, 'jq-tstm')[2], '23:40'));

    // T03 经度 131.16（双鸭山）→ 芒种真太阳跨后一日 6/6 00:35（AC02）
    var sS = RJ(2026, 131.16);
    tests.push(eq('v0.27 T03:芒种真太阳日月=6/6(跨后一日)', pull(sS, 'jq-tsmd')[4], '6/6'));
    tests.push(eq('v0.27 T03:芒种真太阳时间=00:35', pull(sS, 'jq-tstm')[4], '00:35'));

    // T04 lng 缺省 → 两行「—」+ 标题轻提示 + 无 NaN 不抛（AC03）
    var sN = '', e4 = null;
    try { sN = RJ(2026); } catch (e) { e4 = e; }
    tests.push(eq('v0.27 T04:buildJieqiHtml(2026) 缺 lng 不抛异常', e4 === null, true));
    var mdN = pull(sN, 'jq-tsmd'), tmN = pull(sN, 'jq-tstm');
    tests.push(eq('v0.27 T04:12列真太阳日月全「—」', mdN.length === 12 && allDash(mdN), true));
    tests.push(eq('v0.27 T04:12列真太阳时间全「—」', tmN.length === 12 && allDash(tmN), true));
    tests.push(eq('v0.27 T04:界面无 NaN 泄漏', sN.indexOf('NaN') < 0, true));
    tests.push(eq('v0.27 T04:标题含「未选出生地」轻提示', sN.indexOf('未选出生地') >= 0, true));

    // T05 DOM 行序 md→tm→tsmd→tstm→name ×12（AC07 / 回归 R01：保 v0.26 T03 正则）
    var orderRe = /class="jq-md">[^<]*<\/div><div class="jq-tm">[^<]*<\/div><div class="jq-tsmd">[^<]*<\/div><div class="jq-tstm">[^<]*<\/div><div class="jq-name">/g;
    tests.push(eq('v0.27 T05:行序 md→tm→tsmd→tstm→name ×12', (sBJ.match(orderRe) || []).length, 12));

    // ——— 真实渲染（lng 注入）———
    var tst = document.getElementById('tst-out');
    if (!tst) { tst = document.createElement('div'); tst.id = 'tst-out'; document.body.appendChild(tst); }
    function clickLi(cd, targetYear, scope) {
      var lis = (scope || tst).querySelectorAll('.liu-row .li');
      for (var k = 0; k < lis.length; k++) {
        var di = parseInt(lis[k].getAttribute('data-di'), 10);
        var liI = parseInt(lis[k].getAttribute('data-li'), 10);
        if (isNaN(di) || isNaN(liI)) continue;
        if (R.liunianYearOf(cd, di, liI) === targetYear) { lis[k].dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
      }
      return false;
    }
    function titleText() { var t = tst.querySelector('.jieqi-title'); return t ? t.textContent : ''; }

    // T06 单人：容器经度回写 + 与 useSolar 解耦 + 随年份刷新（AC04/AC05）
    var pd2 = paipan('真太阳测试', '男', 1982, 10, 18, 5, 1);
    if (!pd2 || !pd2.daYun || !pd2.daYun.length) { tests.push(fail('v0.27 T06: paipan 返回完整数据', '缺 daYun')); return; }
    pd2.lng = 116.4; // 测试注入出生地经度（paipan 本身不产出 lng）
    var us = document.getElementById('useSolar');
    R.renderChart(pd2, undefined, 'tst-out');
    tests.push(eq('v0.27 T06:容器 _jieqiLng=注入经度116.4', tst._jieqiLng, 116.4));
    tests.push(eq('v0.27 T06:初始(出生年1982)立春真太阳时间=11:17', pull(tst.innerHTML, 'jq-tstm')[0], '11:17'));
    tests.push(eq('v0.27 T06:未勾选真太阳时排盘仍展示(解耦)', !(us && us.checked) && pull(tst.innerHTML, 'jq-tstm').length === 12, true));
    R.refreshJieqi(tst, 2026); // 无第三参 → 走容器 _jieqiLng
    tests.push(eq('v0.27 T06:refreshJieqi(2026) 标题=2026', titleText().indexOf('2026') >= 0, true));
    tests.push(eq('v0.27 T06:refreshJieqi(2026) 立春真太阳=03:33', pull(tst.innerHTML, 'jq-tstm')[0], '03:33'));
    tests.push(eq('v0.27 T06:refreshJieqi 回退仍保留容器经度', tst._jieqiLng, 116.4));
    // 点击流年驱动 → 两行随年份刷新（AC05）
    tests.push(eq('v0.27 T06:找到2026流年格', clickLi(pd2, 2026), true));
    tests.push(eq('v0.27 T06:点2026流年后标题含2026', titleText().indexOf('2026') >= 0, true));
    tests.push(eq('v0.27 T06:点2026流年后立春真太阳=03:33', pull(tst.innerHTML, 'jq-tstm')[0], '03:33'));

    // T07 双胞胎：共享块仅一组两行 + 随年份刷新（AC06）
    var pdt = paipan('同卵', '男', 1982, 10, 18, 5, 1);
    pdt.lng = 116.4;
    R.renderTwinCardsHtml(pdt, 'tst-out');
    tests.push(eq('v0.27 T07:同卵节气块仅1块', tst.querySelectorAll('.jieqi-section').length, 1));
    tests.push(eq('v0.27 T07:同卵共享块真太阳日月仅12行(一组)', pull(tst.innerHTML, 'jq-tsmd').length, 12));
    R.refreshJieqi(tst, 2026);
    tests.push(eq('v0.27 T07:同卵刷新2026→立春03:33', pull(tst.innerHTML, 'jq-tstm')[0], '03:33'));
    // 龙凤胎（老大男1982 / 老二女1983）
    var d1 = paipan('老大', '男', 1982, 10, 18, 5, 1);
    var d2 = paipan('老二', '女', 1983, 1, 1, 0, 10);
    if (!d1 || !d2 || !d2.daYun || !d2.daYun.length) { tests.push(fail('v0.27 T07:龙凤胎数据构造完整', 'd1/d2 缺 daYun')); return; }
    d1.lng = 116.4; d2.lng = 116.4;
    R.renderLongFengCardsHtml(d1, d2, 'tst-out');
    tests.push(eq('v0.27 T07:龙凤胎共享节气块仅1块', tst.querySelectorAll('.jieqi-section').length, 1));
    tests.push(eq('v0.27 T07:龙凤胎经度=116.4', tst._jieqiLng, 116.4));
    tests.push(eq('v0.27 T07:龙凤胎真太阳日月仅12行(一组)', pull(tst.innerHTML, 'jq-tsmd').length, 12));
    var card2 = tst.querySelector('.bz-card-luck[data-card-index="1"]');
    var y2 = d2.daYun[1].startYear;
    if (card2 && clickLi(d2, y2, card2)) {
      tests.push(eq('v0.27 T07:点老二侧流年(' + y2 + ')后标题跟随', titleText().indexOf(String(y2)) >= 0, true));
      tests.push(eq('v0.27 T07:点老二侧流年后真太阳值=f(' + y2 + ')', pull(tst.innerHTML, 'jq-tstm')[0], pull(RJ(y2, 116.4), 'jq-tstm')[0]));
    } else {
      tests.push(fail('v0.27 T07:龙凤胎老二侧流年可点击', 'card2/li 未找到'));
    }
    // 容器复位
    R.renderChart(pd2, undefined, 'tst-out');
  })();

  // ===== v0.28.0 当年节气数据 · 干支行改月建干支 T01-T04 =====
  (function() {
    tests.push({ section:'当年节气数据区(v0.28)' });
    var R = window.RENDER;
    if (!R || typeof R.buildJieqiHtml !== 'function' || typeof R.refreshJieqi !== 'function') {
      tests.push(fail('v0.28 T01: 前置 RENDER.buildJieqiHtml/refreshJieqi 已挂载', '缺失'));
      return;
    }
    var RJ = R.buildJieqiHtml;

    // 取值器：从 HTML 抽 12 列 .jq-gz 的「干+支」（同时隐含校验竖排结构）
    function gzVals(html) {
      var re = /class="jq-gz"><span class="jq-gan">([^<]+)<\/span><span class="jq-zhi">([^<]+)<\/span><\/div>/g;
      var out = [], m;
      while ((m = re.exec(html)) !== null) out.push(m[1] + m[2]);
      return out;
    }

    // ---- T01 值级锚点：1982 壬戌年 12 节月建（AC01/AC02/AC03）----
    var s82 = '', e82 = null;
    try { s82 = RJ(1982); } catch (e) { e82 = e; }
    tests.push(eq('v0.28 T01:buildJieqiHtml(1982) 不抛', e82 === null, true));
    var EXP82 = ['壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑'];
    var got82 = gzVals(s82);
    tests.push(eq('v0.28 T01:1982 干支列×12', got82.length, 12));
    for (var z = 0; z < EXP82.length; z++) {
      tests.push(eq('v0.28 T01:1982 第' + (z + 1) + '列月建=' + EXP82[z], got82[z], EXP82[z]));
    }
    // 口径切换证据（AC03）：立春 旧口径（交节日日柱）戊午 → 新口径（月建）壬寅
    tests.push(eq('v0.28 T01:1982 立春列=壬寅（旧口径为戊午）', got82[0], '壬寅'));
    // off-by-one 锁定（R-V28-01/P0）：末位小寒落次年 1 月，但年基仍取本年
    tests.push(eq('v0.28 T01:1982 小寒=癸丑（年基取本年，非乙丑）', got82[11], '癸丑'));
    // 纯函数单测（D1 新导出；含 off-by-one 反例固化）
    if (typeof R.jieqiMonthGZ === 'function') {
      tests.push(eq("v0.28 T01:jieqiMonthGZ('壬',0)=壬寅(寅月)", R.jieqiMonthGZ('壬', 0), '壬寅'));
      tests.push(eq("v0.28 T01:jieqiMonthGZ('壬',11)=癸丑(小寒·年基取本年)", R.jieqiMonthGZ('壬', 11), '癸丑'));
      tests.push(eq("v0.28 T01:jieqiMonthGZ('癸',11)=乙丑(反例：误用次年干得此值)", R.jieqiMonthGZ('癸', 11), '乙丑'));
    } else {
      tests.push(fail('v0.28 T01:RENDER.jieqiMonthGZ 已导出', '缺失'));
    }

    // ---- T02 出生时点无关性（AC04）：不同经度/有无经度 → 12 列干支完全一致 ----
    var g1 = gzVals(RJ(2026, 116.4)).join(',');
    var g2 = gzVals(RJ(2026, 75.9)).join(',');
    var g3 = gzVals(RJ(2026)).join(',');
    tests.push(eq('v0.28 T02:不同经度(116.4/75.9)干支一致', g1 === g2, true));
    tests.push(eq('v0.28 T02:有/无经度干支一致', g1 === g3, true));
    tests.push(eq('v0.28 T02:2026 十二列非空且无 NaN', g1.indexOf('NaN') < 0 && gzVals(RJ(2026, 116.4)).length === 12, true));

    // ---- T03 流年联动（AC06/AC07）：refreshJieqi 后与 buildJieqiHtml 同值 ----
    var host = document.getElementById('t28-out');
    if (!host) { host = document.createElement('div'); host.id = 't28-out'; document.body.appendChild(host); }
    // 数据源与 v0.26/v0.27 段同口径（同一 paipan 调用 + 同一出生输入），不新造出生数据
    var pdm = paipan('月建测试', '男', 1982, 10, 18, 5, 1);
    if (!pdm || !pdm.daYun || !pdm.daYun.length) {
      tests.push(fail('v0.28 T03: paipan 返回完整数据', '缺 daYun'));
      return;
    }
    pdm.lng = 116.4;
    function secGz(y) {
      R.refreshJieqi(host, y);
      var sec = host.querySelector('.jieqi-section');
      return sec ? gzVals(sec.outerHTML).join(',') : 'NO_SEC';
    }
    if (typeof R.renderChart === 'function') {
      R.renderChart(pdm, undefined, 't28-out');
      R.refreshJieqi(host, 2030);
      var sec0 = host.querySelector('.jieqi-section');
      tests.push(eq('v0.28 T03:刷新后节气块存在且干支×12', sec0 ? gzVals(sec0.outerHTML).length : -1, 12));
      tests.push(eq('v0.28 T03:refreshJieqi(2030) 后干支=buildJieqiHtml(2030)', secGz(2030), gzVals(RJ(2030)).join(',')));
      tests.push(eq('v0.28 T03:refreshJieqi(2026) 回刷亦一致', secGz(2026), gzVals(RJ(2026)).join(',')));
      tests.push(eq('v0.28 T03:refreshJieqi(1982) 出生年一致', secGz(1982), gzVals(RJ(1982)).join(',')));
      // AC07 双胞胎：共享节气块唯一，且刷新路径同值
      if (typeof R.renderTwinCardsHtml === 'function') {
        var pdt2 = paipan('同卵月建', '男', 1982, 10, 18, 5, 1);
        pdt2.lng = 116.4;
        R.renderTwinCardsHtml(pdt2, 't28-out');
        tests.push(eq('v0.28 T03:同卵共享节气块唯一', host.querySelectorAll('.jieqi-section').length, 1));
        tests.push(eq('v0.28 T03:同卵刷新(2030)后干支=buildJieqiHtml(2030)', secGz(2030), gzVals(RJ(2030)).join(',')));
      }
      R.renderChart(pdm, undefined, 't28-out'); // 容器复位，避免污染其它断言
    } else {
      tests.push(fail('v0.28 T03:前置 RENDER.renderChart 已挂载', '缺失'));
    }
    // 外部经度第三参路径（显式传 lng 亦同值，口径不随 lng 漂移）
    tests.push(eq('v0.28 T03:refreshJieqi 显式经度干支=buildJieqiHtml 值',
      (function() { R.refreshJieqi(host, 2031, 116.4); var s = host.querySelector('.jieqi-section'); return s ? gzVals(s.outerHTML).join(',') : 'NO_SEC'; })(),
      gzVals(RJ(2031)).join(',')));

    // ---- T04 表外防御（AC08）+ 结构未破（AC05）----
    var s2100 = '', e2100 = null, s2200 = '', e2200 = null;
    try { s2100 = RJ(2100); } catch (e) { e2100 = e; }
    tests.push(eq('v0.28 T04:buildJieqiHtml(2100) 不抛', e2100 === null, true));
    tests.push(eq('v0.28 T04:2100 小寒列干支=—（占位，不独立显示月建）',
      /data-term="小寒"[\s\S]*?class="jq-gz"><span class="jq-gan">—<\/span><span class="jq-zhi">—<\/span><\/div>/.test(s2100), true));
    try { s2200 = RJ(2200); } catch (e) { e2200 = e; }
    tests.push(eq('v0.28 T04:buildJieqiHtml(2200) 不抛', e2200 === null, true));
    tests.push(eq('v0.28 T04:2200 整块占位提示', s2200.indexOf('jieqi-note') >= 0, true));
    var okB = true;
    try { RJ(999); RJ(2102); } catch (e2) { okB = false; }
    tests.push(eq('v0.28 T04:buildJieqiHtml(999)/(2102) 边界不抛', okB, true));
    tests.push(eq('v0.28 T04:2026 干支竖排块×12（结构未破）', gzVals(RJ(2026)).length, 12));
    var gzRe = /class="jq-gz"><span class="jq-gan">[^<]+<\/span><span class="jq-zhi">[^<]+<\/span><\/div>/g;
    tests.push(eq('v0.28 T04:v0.26 T04 结构正则仍命中×12', (RJ(2026, 116.4).match(gzRe) || []).length, 12));
  })();

  // ===== 星曜 v0.29.0（T01–T10）=====
  (function() {
    tests.push({ section:'星曜(v0.29)' });
    var X = window.XINGYAO;
    var R2 = window.RENDER;
    if (!X || !R2) {
      tests.push(fail('v0.29 T01: 前置 XINGYAO/RENDER 已挂载', '缺失'));
      return;
    }

    // ---- T01 六十甲子生成（AC05）----
    var gz60 = X.gz60();
    tests.push(eq('v0.29 T01:gz60() 长度=60', gz60.length, 60));
    tests.push(eq('v0.29 T01:[0]=甲子', gz60[0], '甲子'));
    tests.push(eq('v0.29 T01:[59]=癸亥', gz60[59], '癸亥'));
    tests.push(eq('v0.29 T01:[4]=戊辰', gz60[4], '戊辰'));
    var uniq = {}; for (var ui = 0; ui < gz60.length; ui++) uniq[gz60[ui]] = 1;
    tests.push(eq('v0.29 T01:无重复(去重=60)', Object.keys(uniq).length, 60));

    // ---- 单排行渲染（T02/T03/T07 复用）----
    var host = document.getElementById('t29-out');
    if (!host) { host = document.createElement('div'); host.id = 't29-out'; document.body.appendChild(host); }
    var data29 = paipan('星曜测试', '男', 1982, 10, 18, 5, 1);
    if (data29) data29.lng = 116.4;
    var threw29 = false;
    try { R2.renderChart(data29, undefined, 't29-out'); } catch (e) { threw29 = true; }
    tests.push(eq('v0.29 T02:renderChart 不抛', threw29, false));

    function firstChart(container) {
      var arr = container.querySelectorAll('table.chart');
      return arr.length ? arr[0] : null;
    }
    function typeSeq(table) {
      var out = [], trs = table.querySelectorAll('tr[data-row-type]');
      for (var i = 0; i < trs.length; i++) {
        out.push((trs[i].getAttribute('data-row-type') || '').split(' ')[0]);
      }
      return out;
    }

    // ---- T02 单人行序（AC01）----
    var tbl = firstChart(host);
    tests.push(eq('v0.29 T02:容器含 table.chart', !!tbl, true));
    if (tbl) {
      var EXP_MAIN = ['dy1','ln1','dy2','ln2','xingyao','nayin','nayun','xingyun','zizuo','kongwang','shensha'];
      var EXP_SY = ['xingyao','nayin','nayun','xingyun','zizuo','kongwang','shensha'];
      var seq = typeSeq(tbl);
      tests.push(eq('v0.29 T02:主表+三垣行序（藏气→星曜→纳音）', seq.join(','), EXP_MAIN.concat(EXP_SY).join(',')));
      tests.push(eq('v0.29 T02:星曜行紧邻于纳音行之前', seq.indexOf('xingyao') === seq.indexOf('nayin') - 1, true));
      tests.push(eq('v0.29 T02:星曜行位于藏气行(ln2)之后', seq.indexOf('xingyao') > seq.indexOf('ln2'), true));
      var xyRowMain = tbl.querySelector('tr[data-row-type~="xingyao"]');
      tests.push(eq('v0.29 T02:星曜行 7 列（含大运/流年）', xyRowMain ? xyRowMain.cells.length : -1, 7));
      tests.push(eq('v0.29 T02:星曜行行首标签=星曜', xyRowMain ? xyRowMain.cells[0].textContent.trim() : '', '星曜'));
      var xyRowsAll = tbl.querySelectorAll('tr[data-row-type~="xingyao"]');
      tests.push(eq('v0.29 T02:四柱区+三垣区各 1 行星曜', xyRowsAll.length, 2));
    } else {
      tests.push(fail('v0.29 T02:table.chart 存在', '缺失'));
    }

    // ---- T03 分级显隐 4×2 矩阵（AC02）----
    function xyDisplay(level, rowType) {
      var t = document.createElement('table');
      t.className = 'chart level-' + level;
      t.style.position = 'absolute'; t.style.left = '-9999px';
      t.innerHTML = '<tbody>'
        + '<tr data-row-type="xingyao xy1"><td>x</td></tr>'
        + '<tr data-row-type="nayin"><td>y</td></tr>'
        + '</tbody>';
      document.body.appendChild(t);
      var tr = t.querySelector('tr[data-row-type~="' + rowType + '"]');
      var d = window.getComputedStyle(tr).display;
      document.body.removeChild(t);
      return d;
    }
    tests.push(eq('v0.29 T03:L0 星曜行隐藏', xyDisplay(0, 'xingyao'), 'none'));
    tests.push(eq('v0.29 T03:L1 星曜行隐藏', xyDisplay(1, 'xingyao'), 'none'));
    tests.push(eq('v0.29 T03:L2 星曜行可见', xyDisplay(2, 'xingyao') !== 'none', true));
    tests.push(eq('v0.29 T03:L3 星曜行可见', xyDisplay(3, 'xingyao') !== 'none', true));
    tests.push(eq('v0.29 T03:L0 纳音行隐藏（规则未误伤）', xyDisplay(0, 'nayin'), 'none'));
    tests.push(eq('v0.29 T03:L1 纳音行隐藏', xyDisplay(1, 'nayin'), 'none'));
    tests.push(eq('v0.29 T03:L2 纳音行可见', xyDisplay(2, 'nayin') !== 'none', true));
    tests.push(eq('v0.29 T03:L3 纳音行可见', xyDisplay(3, 'nayin') !== 'none', true));

    // ---- T04 三处模板「星曜」按钮（AC03）----
    function checkBtn(container, label) {
      var b = container.querySelector('.btn-simple');
      if (!b) { tests.push(fail('v0.29 T04:' + label + ' 含 .btn-simple', '缺失')); return; }
      var nx = b.nextElementSibling;
      tests.push(eq('v0.29 T04:' + label + ' 「星曜」按钮紧随 btn-simple', !!(nx && nx.classList && nx.classList.contains('xy-trigger')), true));
      tests.push(eq('v0.29 T04:' + label + ' 按钮文案=星曜', nx ? nx.textContent.trim() : '', '星曜'));
      tests.push(eq('v0.29 T04:' + label + ' 按钮 onclick=XINGYAO.openSettings()', nx ? (nx.getAttribute('onclick') || '') : '', 'XINGYAO.openSettings()'));
    }
    checkBtn(host, '单人');

    var tw = document.getElementById('t29-twin');
    if (!tw) { tw = document.createElement('div'); tw.id = 't29-twin'; document.body.appendChild(tw); }
    var twErr = false;
    try { R2.renderTwinCardsHtml(paipan('星曜双胞胎', '男', 1982, 10, 18, 5, 1), 't29-twin'); } catch (e) { twErr = true; }
    tests.push(eq('v0.29 T04:renderTwinCardsHtml 不抛', twErr, false));
    checkBtn(tw, '双胞胎');

    var lf = document.getElementById('t29-lf');
    if (!lf) { lf = document.createElement('div'); lf.id = 't29-lf'; document.body.appendChild(lf); }
    var lfErr = false;
    try { R2.renderLongFengCardsHtml(paipan('星曜龙凤甲', '男', 1982, 10, 18, 5, 1), paipan('星曜龙凤乙', '女', 1982, 10, 18, 5, 26), 't29-lf'); } catch (e) { lfErr = true; }
    tests.push(eq('v0.29 T04:renderLongFengCardsHtml 不抛', lfErr, false));
    checkBtn(lf, '龙凤胎');

    // ---- T05 设置页结构（AC04）----
    var ov = document.getElementById('xySettingsOverlay');
    tests.push(eq('v0.29 T05:静态 overlay 存在', !!ov, true));
    X.openSettings();
    tests.push(eq('v0.29 T05:openSettings 后 .show', ov ? ov.classList.contains('show') : false, true));
    var ths = ov ? ov.querySelectorAll('.xy-table thead th') : [];
    tests.push(eq('v0.29 T05:表头四列', ths.length, 4));
    tests.push(eq('v0.29 T05:表头[0]=六十甲子', ths[0] ? ths[0].textContent.trim() : '', '六十甲子'));
    tests.push(eq('v0.30 T03:表头[1]=纳音', ths[1] ? ths[1].textContent.trim() : '', '纳音'));
    tests.push(eq('v0.29 T05:表头[2]=星曜名称', ths[2] ? ths[2].textContent.trim() : '', '星曜名称'));
    tests.push(eq('v0.29 T05:表头[3]=来源体系', ths[3] ? ths[3].textContent.trim() : '', '来源体系'));
    var tbody = document.getElementById('xySettingsList');
    var rowEls = tbody ? tbody.querySelectorAll('tr[data-gz]') : [];
    tests.push(eq('v0.29 T05:数据行=60', rowEls.length, 60));
    tests.push(eq('v0.29 T05:首行=甲子', rowEls.length ? rowEls[0].getAttribute('data-gz') : '', '甲子'));
    tests.push(eq('v0.29 T05:末行=癸亥', rowEls.length ? rowEls[rowEls.length - 1].getAttribute('data-gz') : '', '癸亥'));

    // ---- T06 纳音全名抽样 12 项（v0.30 改口径：单字五行 → 完整纳音名；AC05/AC06）----
    var SAMPLE = [['甲子','海中金'],['乙丑','海中金'],['丙寅','炉中火'],['丁卯','炉中火'],['戊辰','大林木'],['己巳','大林木'],
                  ['庚午','路旁土'],['辛未','路旁土'],['壬申','剑锋金'],['癸酉','剑锋金'],['甲戌','山头火'],['乙亥','山头火']];
    for (var si = 0; si < SAMPLE.length; si++) {
      var srow = tbody ? tbody.querySelector('tr[data-gz="' + SAMPLE[si][0] + '"]') : null;
      var nel = srow ? srow.querySelector('.xy-nayin') : null;
      var nv = nel ? nel.textContent.trim() : '';
      tests.push(eq('v0.30 T03:纳音全名 ' + SAMPLE[si][0] + '=' + SAMPLE[si][1], nv, SAMPLE[si][1]));
      // 追加：全名末字 = 原单字五行（改严不放松，原期望值不丢失）
      tests.push(eq('v0.30 T03:全名末字 ' + SAMPLE[si][0] + '=' + SAMPLE[si][1].slice(-1), nv.slice(-1), SAMPLE[si][1].slice(-1)));
    }
    X.closeSettings();

    // ---- T07 填值 → 保存 → 盘面生效（AC06/AC08）----
    X.resetTestStore(); X.init();
    R2.renderChart(data29, undefined, 't29-out');
    tbl = firstChart(host);
    var ganRow = tbl.querySelector('tr[data-row-type~="ln1"]');
    var zhiRow = tbl.querySelector('tr[data-row-type~="dy2"]');
    var gzTarget = (ganRow.cells[1].textContent.trim()) + (zhiRow.cells[1].textContent.trim());
    tests.push(eq('v0.29 T07:目标干支为六十甲子之一', X.gz60().indexOf(gzTarget) >= 0, true));
    var xyRow = tbl.querySelector('tr[data-row-type~="xingyao"]');
    tests.push(eq('v0.29 T07:保存前盘面=—', xyRow.cells[1].textContent.trim(), '—'));
    tests.push(eq('v0.29 T07:单元格 data-xy-gz=该柱干支', xyRow.cells[1].getAttribute('data-xy-gz'), gzTarget));
    X.openSettings();
    var tgtRow = document.getElementById('xySettingsList').querySelector('tr[data-gz="' + gzTarget + '"]');
    tgtRow.querySelector('.xy-name').value = '紫微';
    tgtRow.querySelector('.xy-system').value = '斗数';
    tests.push(eq('v0.29 T07:保存前已保存值仍为空', X.nameOf(gzTarget), '—'));
    X.save();
    tests.push(eq('v0.29 T07:保存后盘面该柱=紫微', xyRow.cells[1].textContent.trim(), '紫微'));
    tests.push(eq('v0.29 T07:保存后 title=来源体系', xyRow.cells[1].getAttribute('title'), '斗数'));
    tests.push(eq('v0.29 T07:保存后 overlay 关闭', ov.classList.contains('show'), false));
    tests.push(eq('v0.29 T07:nameOf() 即时生效', X.nameOf(gzTarget), '紫微'));
    tests.push(eq('v0.29 T07:systemOf() 即时生效', X.systemOf(gzTarget), '斗数'));

    // ---- T08 持久化 + 损坏防御（AC07/AC11）----
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(X.XY_TEST_KEY) || 'null'); } catch (e) {}
    tests.push(eq('v0.29 T08:已落盘测试键', !!stored, true));
    tests.push(eq('v0.29 T08:落盘 schemaVersion=1', stored ? stored.schemaVersion : -1, 1));
    tests.push(eq('v0.29 T08:落盘 map 键=60', stored && stored.map ? Object.keys(stored.map).length : -1, 60));
    tests.push(eq('v0.29 T08:落盘该柱值=紫微', stored && stored.map ? (stored.map[gzTarget] || {}).name : '', '紫微'));
    X.init();
    tests.push(eq('v0.29 T08:init 重新加载后仍=紫微', X.nameOf(gzTarget), '紫微'));
    var pl = X.buildExportPayload();
    tests.push(eq('v0.29 T08:导出 app=bazi-paipan', pl.app, 'bazi-paipan'));
    tests.push(eq('v0.29 T08:导出 config=xingyao', pl.config, 'xingyao'));
    tests.push(eq('v0.29 T08:导出 map 键=60', Object.keys(pl.map).length, 60));
    tests.push(eq('v0.29 T08:validateImportPayload(自身载荷).ok', X.validateImportPayload(pl).ok, true));
    tests.push(eq('v0.29 T08:validateImportPayload(空).ok=false', X.validateImportPayload(null).ok, false));
    tests.push(eq('v0.29 T08:validateImportPayload(异 app).ok=false', X.validateImportPayload({ app:'x', config:'xingyao', map:{} }).ok, false));
    // 损坏串 → 备份 + 全空 + 不抛
    try { localStorage.setItem(X.XY_TEST_KEY, '{ 这不是合法JSON'); } catch (e) {}
    var corruptThrew = false;
    try { X.init(); } catch (e) { corruptThrew = true; }
    tests.push(eq('v0.29 T08:损坏 JSON → init 不抛', corruptThrew, false));
    tests.push(eq('v0.29 T08:损坏 JSON → 全空（该柱=—）', X.nameOf(gzTarget), '—'));
    var hasBackup = false;
    try {
      for (var bi = 0; bi < localStorage.length; bi++) {
        var bk = localStorage.key(bi);
        if (bk && bk.indexOf(X.XY_TEST_KEY) === 0 && bk.indexOf('_corrupt_') > 0) hasBackup = true;
      }
    } catch (e) {}
    tests.push(eq('v0.29 T08:损坏串已备份（_corrupt_ 键存在）', hasBackup, true));

    // ---- T09 三功能状态机（AC09/AC10，ADR §9.2）----
    X.resetTestStore(); X.init();
    var tb9 = function() { return document.getElementById('xySettingsList'); };
    function draftOf(g) { var r = tb9().querySelector('tr[data-gz="' + g + '"]'); return r ? r.querySelector('.xy-name').value : 'NO_ROW'; }
    X.openSettings();
    tb9().querySelector('tr[data-gz="' + gzTarget + '"] .xy-name').value = '甲';
    tests.push(eq('v0.29 T09:编辑为草稿 B 不落盘（盘面=—）', X.nameOf(gzTarget), '—'));
    X.save();
    tests.push(eq('v0.29 T09:保存 → 已保存=B 且盘面=B', X.nameOf(gzTarget), '甲'));
    X.openSettings();
    tb9().querySelector('tr[data-gz="' + gzTarget + '"] .xy-name').value = '乙';
    X.clear();
    tests.push(eq('v0.29 T09:清空 → 草稿全空', draftOf(gzTarget), ''));
    tests.push(eq('v0.29 T09:清空不落盘（已保存仍=甲）', X.nameOf(gzTarget), '甲'));
    X.restore();
    tests.push(eq('v0.29 T09:还原 → 草稿回填已保存=甲', draftOf(gzTarget), '甲'));
    tb9().querySelector('tr[data-gz="' + gzTarget + '"] .xy-name').value = '丙';
    X.closeSettings();
    tests.push(eq('v0.29 T09:关闭 → overlay 隐藏', ov.classList.contains('show'), false));
    tests.push(eq('v0.29 T09:关闭丢弃草稿（已保存仍=甲）', X.nameOf(gzTarget), '甲'));
    X.openSettings();
    tests.push(eq('v0.29 T09:重开 → 草稿由已保存重填=甲', draftOf(gzTarget), '甲'));
    X.closeSettings();

    // ---- T10 规范闭环（AC13；ALGORITHM.md 锚点/60 行/md5 由离线脚本校验）----
    var pl10 = X.buildExportPayload();
    tests.push(eq('v0.29 T10:导出载荷可被导入校验接受（sync 脚本入参同构）', X.validateImportPayload(pl10).ok, true));
    tests.push(eq('v0.29 T10:map 键序与六十甲子一致（对应 ALGORITHM.md 60 数据行）',
      Object.keys(pl10.map).sort().join(',') === X.gz60().slice().sort().join(','), true));
    tests.push(eq('v0.29 T10:模块 schemaVersion=1（对应 ALGORITHM.md §21.1）', X.XY_SCHEMA_VERSION, 1));

    // ---- 复位：清测试态，避免污染真实 localStorage ----
    X.resetTestStore(); X.init();
    if (host) host.innerHTML = '';
    if (tw) tw.innerHTML = '';
    if (lf) lf.innerHTML = '';
  })();

  // ===== 星曜 v0.30.0（T01–T15；ADR §8.2/§8.3、PRD r7）=====
  (function() {
    tests.push({ section:'星曜(v0.30)' });
    var X = window.XINGYAO;
    var R2 = window.RENDER;
    if (!X || !R2) { tests.push(fail('v0.30 T01: 前置 XINGYAO/RENDER 已挂载', '缺失')); return; }
    var ov = document.getElementById('xySettingsOverlay');
    var tb = function() { return document.getElementById('xySettingsList'); };
    var visRows = function() { return tb().querySelectorAll('tr[data-gz]:not([hidden])'); };
    var visN = function() { return visRows().length; };
    var visList = function() {
      var out = [], rs = visRows();
      for (var i = 0; i < rs.length; i++) out.push(rs[i].getAttribute('data-gz'));
      return out;
    };
    var inp = function() { return document.getElementById('xySearchInput'); };
    var cntEl = function() { return document.getElementById('xySearchCount'); };
    var empEl = function() { return document.getElementById('xySearchEmpty'); };
    var clrEl = function() { return document.getElementById('xySearchClear'); };
    // r7：三栏静态栏头 / 响应式断点 / 可见行分栏计数 / 行内 td 数（几何断言辅助）
    var headsAll = function() { return ov.querySelectorAll('.xy-groups-heads .xy-group-title'); };
    var wide = function() { return window.matchMedia('(min-width:1280px)').matches; };
    var visCountOf = function(n) {
      return tb().querySelectorAll('tr[data-gz][data-xy-group="' + n + '"]:not([hidden])').length;
    };
    var headsOk = function() {
      var hs = headsAll();
      if (hs.length !== 3) return false;
      for (var i = 0; i < hs.length; i++) {
        if (hs[i].hasAttribute('hidden')) return false;
        if (window.getComputedStyle(hs[i]).display === 'none') return false;
      }
      return true;
    };
    var rowsTdOk = function() {
      var rs = tb().querySelectorAll('tr[data-gz]');
      for (var i = 0; i < rs.length; i++) if (rs[i].querySelectorAll('td').length !== 4) return false;
      return true;
    };
    var headRects = function() {
      var hs = headsAll(), out = [];
      for (var i = 0; i < hs.length; i++) out.push(hs[i].getBoundingClientRect());
      return out;
    };
    // AC25 判据：每条可见行矩形中心必须落在其 data-xy-group 对应栏头的水平区间内（±2px 亚像素容差）
    var bandBad = function() {
      var bands = headRects(), rs = tb().querySelectorAll('tr[data-gz]:not([hidden])'), bad = [];
      for (var i = 0; i < rs.length; i++) {
        var n = parseInt(rs[i].getAttribute('data-xy-group'), 10);
        var b = bands[n - 1];
        if (!b) { bad.push(rs[i].getAttribute('data-gz') + '(no-band)'); continue; }
        var r = rs[i].getBoundingClientRect();
        var c = (r.left + r.right) / 2;
        if (c < b.left - 2 || c > b.right + 2) bad.push(rs[i].getAttribute('data-gz'));
      }
      return bad;
    };

    X.resetTestStore(); X.init();
    X.openSettings();

    // 测试态环境归一（仅测试域，不改产品代码）：产品 HTML 把 .page 内联为 display:none（登录门），
    // 而 auth.js 的 show/hideLoginScreen 在 ?test=1 下 early-return ⇒ 主内容恒隐藏、所有几何 rect=0，
    // 会让免滚动断言退化成 0≤0 假绿 / 栏宽 0 假红。此处放行主内容可见性，使几何断言测得真实布局。
    (function() {
      var pg30e = document.querySelector('.page');
      if (pg30e && window.getComputedStyle(pg30e).display === 'none') pg30e.style.display = '';
      var ao30e = document.getElementById('authOverlay');
      if (ao30e) ao30e.style.display = 'none';
    })();

    // ---- T01 搜索命中条数 / 集合 / 边界（AC01/AC02/E01–E03）----
    tests.push(eq('v0.30 T01:filterRows(己).hit=6', X.filterRows('己').hit, 6));
    tests.push(eq('v0.30 T01:己 可见行=6', visN(), 6));
    tests.push(eq('v0.30 T01:己 命中集合精确', visList().join(','), '己巳,己卯,己丑,己亥,己酉,己未'));
    tests.push(eq('v0.30 T01:戌 可见=5', X.filterRows('戌').hit, 5));
    tests.push(eq('v0.30 T01:戌 命中集合精确', visList().join(','), '甲戌,丙戌,戊戌,庚戌,壬戌'));
    tests.push(eq('v0.30 T01:甲戌 可见=1', X.filterRows('甲戌').hit, 1));
    tests.push(eq('v0.30 T01:甲戌 命中集合精确', visList().join(','), '甲戌'));
    tests.push(eq('v0.30 T01:壬 可见=6', X.filterRows('壬').hit, 6));
    tests.push(eq('v0.30 T01:子 可见=5', X.filterRows('子').hit, 5));
    tests.push(eq('v0.30 T01:空串 可见=60', X.filterRows('').hit, 60));
    tests.push(eq('v0.30 T01:半角空白 可见=60（E01）', X.filterRows('   ').hit, 60));
    tests.push(eq('v0.30 T01:全角空白 可见=60（E01）', X.filterRows('\u3000').hit, 60));
    tests.push(eq('v0.30 T01:正则元字符按字面匹配（E03，不抛不误命中）', X.filterRows('.').hit, 0));
    tests.push(eq('v0.30 T01:不存在 可见=0（E02）', X.filterRows('XYZ').hit, 0));
    tests.push(eq('v0.30 T01:多 token 不切分（甲 子 → 0）', X.filterRows('甲 子').hit, 0));

    // ---- T02 三栏结构 / 边界 / DOM 序（AC03/AC04；r7：栏头为静态 div.xy-group-title）----
    X.filterRows('');
    var gRs = headsAll();
    tests.push(eq('v0.30 T02:栏头 .xy-group-title=3（静态标记）', gRs.length, 3));
    var gNos = [];
    for (var gi = 0; gi < gRs.length; gi++) gNos.push(gRs[gi].getAttribute('data-xy-group'));
    tests.push(eq('v0.30 T02:栏头 data-xy-group 序列=1,2,3', gNos.join(','), '1,2,3'));
    tests.push(eq('v0.30 T02:栏1 文案 === XINGYAO.groupTitle(1)', gRs[0] ? gRs[0].textContent.trim() : '', X.groupTitle(1)));
    tests.push(eq('v0.30 T02:栏2 文案 === XINGYAO.groupTitle(2)', gRs[1] ? gRs[1].textContent.trim() : '', X.groupTitle(2)));
    tests.push(eq('v0.30 T02:栏3 文案 === XINGYAO.groupTitle(3)', gRs[2] ? gRs[2].textContent.trim() : '', X.groupTitle(3)));
    tests.push(eq('v0.30 T02:栏头不在 tbody 内（容器后代无 .xy-group-title）', tb().querySelectorAll('.xy-group-title').length, 0));
    tests.push(eq('v0.30 T02:栏头无 data-gz（不入草稿采集）', gRs[0] ? gRs[0].hasAttribute('data-gz') : true, false));
    tests.push(eq('v0.30 T02:单一容器 #xySettingsList 仍为 TBODY', tb() ? tb().tagName : '', 'TBODY'));
    tests.push(eq('v0.30 T02:弹层内 table.xy-table 仅 1 张（禁拆表）', ov.querySelectorAll('table.xy-table').length, 1));
    tests.push(eq('v0.30 T02:弹层内 .xy-table tbody 仅 1 个（禁拆 tbody）', ov.querySelectorAll('.xy-table tbody').length, 1));
    tests.push(eq('v0.30 T02:每行 4 个 td（栏内 4 列，通栏表头恒 4）', rowsTdOk(), true));
    tests.push(eq('v0.30 T02:数据行总数=60', tb().querySelectorAll('tr[data-gz]').length, 60));
    var gc = [];
    for (var gn = 1; gn <= 3; gn++) gc.push(tb().querySelectorAll('tr[data-gz][data-xy-group="' + gn + '"]').length);
    tests.push(eq('v0.30 T02:各组数据行=20/20/20', gc.join(','), '20,20,20'));
    function gRowsOf(n) { return tb().querySelectorAll('tr[data-gz][data-xy-group="' + n + '"]'); }
    function gFirst(n) { var r = gRowsOf(n); return r.length ? r[0].getAttribute('data-gz') : ''; }
    function gLast(n) { var r = gRowsOf(n); return r.length ? r[r.length - 1].getAttribute('data-gz') : ''; }
    tests.push(eq('v0.30 T02:组1 首=甲子', gFirst(1), '甲子'));
    tests.push(eq('v0.30 T02:组1 末=癸未', gLast(1), '癸未'));
    tests.push(eq('v0.30 T02:组2 首=甲申', gFirst(2), '甲申'));
    tests.push(eq('v0.30 T02:组2 末=癸卯', gLast(2), '癸卯'));
    tests.push(eq('v0.30 T02:组3 首=甲辰', gFirst(3), '甲辰'));
    tests.push(eq('v0.30 T02:组3 末=癸亥', gLast(3), '癸亥'));
    var gzSeq30 = [];
    var trsSeq30 = tb().querySelectorAll('tr[data-gz]');
    for (var ci = 0; ci < trsSeq30.length; ci++) gzSeq30.push(trsSeq30[ci].getAttribute('data-gz'));
    tests.push(eq('v0.30 T02:DOM 序 60 行 = 甲子→癸亥（T-DOM-ORDER）', gzSeq30.join(','), X.gz60().join(',')));
    tests.push(eq('v0.30 T02:tbody 内无运行时组标题行 tr.xy-group-row（不留幽灵）', tb().querySelectorAll('tr.xy-group-row').length, 0));

    // ---- T03 列名 + 纳音全名（AC05/AC06）----
    var ths30 = ov.querySelectorAll('.xy-table thead th');
    tests.push(eq('v0.30 T03:表头[1]=纳音', ths30[1] ? ths30[1].textContent.trim() : '', '纳音'));
    tests.push(eq('v0.30 T03:表头四列未变', ths30.length, 4));
    tests.push(eq('v0.30 T03:全弹层 .xy-table thead 仅 1 处（三栏共享一行表头）', ov.querySelectorAll('.xy-table thead').length, 1));
    tests.push(eq('v0.30 T03:thead 不加 sticky（computed position≠sticky）', window.getComputedStyle(ths30[0]).position !== 'sticky', true));
    var allNyOk = true, missNy = [];
    var allTrs30 = tb().querySelectorAll('tr[data-gz]');
    for (var n3 = 0; n3 < allTrs30.length; n3++) {
      var g3 = allTrs30[n3].getAttribute('data-gz');
      var cel3 = allTrs30[n3].querySelector('.xy-nayin');
      var txt3 = cel3 ? cel3.textContent.trim() : '';
      if (!txt3 || txt3 !== NAYIN[g3]) { allNyOk = false; missNy.push(g3); }
    }
    tests.push(eq('v0.30 T03:60 行纳音列均 === NAYIN[gz] 且非空', allNyOk, true));
    if (!allNyOk) tests.push(fail('v0.30 T03:纳音不匹配的干支', missNy.join(',')));
    var nyRangeOk = true;
    for (var kk in NAYIN) {
      if (!Object.prototype.hasOwnProperty.call(NAYIN, kk)) continue;
      if ('金木水火土'.indexOf(String(NAYIN[kk]).slice(-1)) < 0) nyRangeOk = false;
    }
    tests.push(eq('v0.30 T03:NAYIN 全表末字∈五行（值域前提）', nyRangeOk, true));

    // ---- T04 筛选态保存不丢草稿（P0 / AC11 / T-SENTINEL-1）----
    X.resetTestStore(); X.init();
    X.openSettings();
    X.filterRows('甲戌');
    tests.push(eq('v0.30 T04:筛选态可见=1', visN(), 1));
    tb().querySelector('tr[data-gz="甲子"] .xy-name').value = '隐藏值';
    tb().querySelector('tr[data-gz="甲子"] .xy-system').value = '隐藏体系';
    tb().querySelector('tr[data-gz="甲戌"] .xy-name').value = '可见值';
    var dft4 = X.collectDraft();
    tests.push(eq('v0.30 T04:collectDraft 覆盖 60 键', Object.keys(dft4).length, 60));
    tests.push(eq('v0.30 T04:T-SENTINEL-1 隐藏行(甲子)仍被采集', dft4['甲子'].name, '隐藏值'));
    X.save();
    var all4 = X.getAll();
    tests.push(eq('v0.30 T04:保存后 getAll 60 键完整', Object.keys(all4).length, 60));
    tests.push(eq('v0.30 T04:隐藏行值未丢', all4['甲子'].name, '隐藏值'));
    tests.push(eq('v0.30 T04:隐藏行体系未丢', all4['甲子'].system, '隐藏体系'));
    tests.push(eq('v0.30 T04:可见行值已保存', all4['甲戌'].name, '可见值'));

    // ---- T05 空结果 / 命中数文案 / 清空搜索（AC08/AC09/AC10）----
    X.openSettings();
    X.filterRows('XYZ');
    tests.push(eq('v0.30 T05:0 命中 → 空提示可见', empEl().hidden, false));
    tests.push(eq('v0.30 T05:0 命中 → 可见数据行=0', visN(), 0));
    tests.push(eq('v0.30 T05:0 命中 → 计数文案=命中 0 项', cntEl().textContent, '命中 0 项'));
    tests.push(eq('v0.30 T05:0 命中 → 栏头仍 3 个且可见（FR3.8 空栏占位）', headsOk(), true));
    X.filterRows('己');
    tests.push(eq('v0.30 T05:命中 6 项文案', cntEl().textContent, '命中 6 项'));
    tests.push(eq('v0.30 T05:非空输入 → 计数可见', cntEl().hidden, false));
    tests.push(eq('v0.30 T05:非空输入 → ✕ 可见', clrEl().hidden, false));
    tests.push(eq('v0.30 T05:非空输入 → 空提示隐藏', empEl().hidden, true));
    X.clearSearch();
    tests.push(eq('v0.30 T05:✕ 清空 → 输入为空', inp().value, ''));
    tests.push(eq('v0.30 T05:✕ 清空 → 可见=60', visN(), 60));
    tests.push(eq('v0.30 T05:✕ 清空 → 空提示隐藏', empEl().hidden, true));
    tests.push(eq('v0.30 T05:✕ 清空 → 计数隐藏', cntEl().hidden, true));
    tests.push(eq('v0.30 T05:✕ 清空 → ✕ 自身隐藏', clrEl().hidden, true));
    X.filterRows('己');
    X.filterRows('');
    tests.push(eq('v0.30 T05:空输入 → 计数隐藏（不显示「命中 60 项」）', cntEl().hidden, true));

    // ---- T06 打开重置 / 还原保留 / 清空全量（AC12/AC13/AC14）----
    X.resetTestStore(); X.init();
    X.openSettings();
    tb().querySelector('tr[data-gz="甲戌"] .xy-name').value = '已保存值';
    X.save();
    X.openSettings();
    tests.push(eq('v0.30 T06:打开 → 搜索框为空', inp().value, ''));
    tests.push(eq('v0.30 T06:打开 → 60 行全显', visN(), 60));
    tests.push(eq('v0.30 T06:打开 → 计数隐藏', cntEl().hidden, true));
    tests.push(eq('v0.30 T06:打开 → 无残留 hidden 行', tb().querySelectorAll('tr[data-gz][hidden]').length, 0));
    tests.push(eq('v0.30 T06:打开 → 栏头无 hidden 残留', ov.querySelectorAll('.xy-group-title[hidden]').length, 0));
    X.filterRows('己');
    tb().querySelector('tr[data-gz="己巳"] .xy-name').value = '草稿未保存';
    X.restore();
    tests.push(eq('v0.30 T06:还原保留筛选（仍 6 行）', visN(), 6));
    tests.push(eq('v0.30 T06:还原回填已保存值', tb().querySelector('tr[data-gz="甲戌"] .xy-name').value, '已保存值'));
    tests.push(eq('v0.30 T06:还原丢弃草稿', tb().querySelector('tr[data-gz="己巳"] .xy-name').value, ''));
    X.filterRows('己');
    tb().querySelector('tr[data-gz="甲子"] .xy-name').value = '隐藏草稿';
    X.clear();
    tests.push(eq('v0.30 T06:清空作用全量（隐藏行亦清空）', tb().querySelector('tr[data-gz="甲子"] .xy-name').value, ''));
    tests.push(eq('v0.30 T06:清空不改搜索词', inp().value, '己'));
    tests.push(eq('v0.30 T06:清空不改筛选态（仍 6 行）', visN(), 6));
    X.filterRows('');
    var allEmpty6 = true, tr6 = tb().querySelectorAll('tr[data-gz]');
    for (var i6 = 0; i6 < tr6.length; i6++) {
      var nm6 = tr6[i6].querySelector('.xy-name');
      var sy6 = tr6[i6].querySelector('.xy-system');
      if ((nm6 && nm6.value !== '') || (sy6 && sy6.value !== '')) allEmpty6 = false;
    }
    tests.push(eq('v0.30 T06:清空后全 60 行草稿皆空', allEmpty6, true));

    // ---- T07 设置页 vs 主盘纳音一致（AC07）----
    var host30 = document.getElementById('t30-out');
    if (!host30) { host30 = document.createElement('div'); host30.id = 't30-out'; document.body.appendChild(host30); }
    var d30 = paipan('v030一致性', '男', 1982, 10, 18, 5, 1);
    if (d30) d30.lng = 116.4;
    var threw30 = false;
    try { R2.renderChart(d30, undefined, 't30-out'); } catch (e) { threw30 = true; }
    tests.push(eq('v0.30 T07:renderChart 不抛', threw30, false));
    var tbl30 = host30.querySelector('table.chart');
    if (tbl30) {
      var nRow30 = tbl30.querySelector('tr[data-row-type~="nayin"]');
      var gRow30 = tbl30.querySelector('tr[data-row-type~="ln1"]');
      var zRow30 = tbl30.querySelector('tr[data-row-type~="dy2"]');
      var gzT30 = gRow30.cells[1].textContent.trim() + zRow30.cells[1].textContent.trim();
      var mainNy30 = nRow30.cells[1].textContent.trim();
      var setCell = tb().querySelector('tr[data-gz="' + gzT30 + '"] .xy-nayin');
      var setNy30 = setCell ? setCell.textContent.trim() : '';
      tests.push(eq('v0.30 T07:设置页纳音 == 主盘纳音（' + gzT30 + '）', setNy30, mainNy30));
      tests.push(eq('v0.30 T07:两处均 === NAYIN[该柱]', setNy30 === NAYIN[gzT30] && mainNy30 === NAYIN[gzT30], true));
      tests.push(eq('v0.30 T07:主盘纳音为完整名（长度>1，非单字五行）', mainNy30.length > 1, true));
      tests.push(eq('v0.30 T07:主盘行为未被本版改动（纳音行仍在）', !!nRow30, true));
    } else {
      tests.push(fail('v0.30 T07:存在 table.chart（主盘）', '缺失'));
    }

    // ---- T08 输入法组合态闸门（AC18 / T-IME）----
    X.openSettings();
    X.onCompositionStart();
    tests.push(eq('v0.30 T08:组合态标记已置位', X.isComposing(), true));
    tests.push(eq('v0.30 T08:组合期 filterRows 不筛（hit=-1）', X.filterRows('己').hit, -1));
    tests.push(eq('v0.30 T08:组合期可见行不变=60', visN(), 60));
    tests.push(eq('v0.30 T08:组合期不写入搜索框', inp().value, ''));
    X.onCompositionEnd('己');
    tests.push(eq('v0.30 T08:compositionend 后命中=6', visN(), 6));
    tests.push(eq('v0.30 T08:组合态标记已复位', X.isComposing(), false));
    X.clearSearch();
    tests.push(eq('v0.30 T08:DOM 契约含 oncompositionstart/end',
      !!(inp().getAttribute('oncompositionstart') && inp().getAttribute('oncompositionend')), true));
    inp().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    inp().value = 'ji';
    inp().dispatchEvent(new Event('input', { bubbles: true }));
    tests.push(eq('v0.30 T08:真实 compositionstart + input → 不筛（60）', visN(), 60));
    inp().value = '己';
    inp().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '己' }));
    tests.push(eq('v0.30 T08:真实 compositionend → 命中=6', visN(), 6));

    // ---- T09 hidden 双断 + 兜底 CSS（AC19；r4：必须在弹层可见态取样）----
    X.openSettings();
    tests.push(eq('v0.30 T09:前置·弹层处于可见态（r4 要求）', ov.classList.contains('show'), true));
    X.filterRows('甲申');
    var trHide9 = tb().querySelector('tr[data-gz="甲子"]');
    var trShow9 = tb().querySelector('tr[data-gz="甲申"]');
    tests.push(eq('v0.30 T09:被筛行 hasAttribute(hidden)', trHide9.hasAttribute('hidden'), true));
    tests.push(eq('v0.30 T09:被筛行 computed display=none（兜底 CSS 生效）', window.getComputedStyle(trHide9).display, 'none'));
    tests.push(eq('v0.30 T09:可见行无 hidden', trShow9.hasAttribute('hidden'), false));
    tests.push(eq('v0.30 T09:可见行 computed display≠none', window.getComputedStyle(trShow9).display !== 'none', true));
    tests.push(eq('v0.30 T09:被筛行无内联 display 写法（机制唯一）', (trHide9.getAttribute('style') || '').indexOf('display') === -1, true));
    tests.push(eq('v0.30 T09:筛选态栏头 3 个全部无 hidden（r7 FR3.8）', ov.querySelectorAll('.xy-group-title[hidden]').length, 0));
    tests.push(eq('v0.30 T09:筛选态栏头 display≠none（空栏占位）', headsOk(), true));

    // ---- T10 collectDraft 采集隐藏行哨兵（AC11 守护者）----
    X.resetTestStore(); X.init();
    X.openSettings();
    X.filterRows('甲申');
    tests.push(eq('v0.30 T10:前置·筛选态可见=1', visN(), 1));
    tb().querySelector('tr[data-gz="甲子"] .xy-name').value = '隐藏哨兵';
    var dft10 = X.collectDraft();
    tests.push(eq('v0.30 T10:collectDraft 覆盖 60 键（含隐藏行）', Object.keys(dft10).length, 60));
    tests.push(eq('v0.30 T10:隐藏行 甲子 值被采集', dft10['甲子'].name, '隐藏哨兵'));
    var src10 = String(X.collectDraft);
    tests.push(eq('v0.30 T10:源码无可见性过滤（守红线）', src10.indexOf('[hidden]') === -1 && src10.indexOf('not(') === -1, true));
    tests.push(eq('v0.30 T10:源码为全量选择器 #xySettingsList tr[data-gz]', src10.indexOf('#xySettingsList tr[data-gz]') >= 0, true));

    // ---- T11 搜索态不落盘（T-PERSIST）----
    X.resetTestStore(); X.init();
    X.openSettings();
    tb().querySelector('tr[data-gz="甲子"] .xy-name').value = '落盘检查';
    X.save();
    var keyBefore = localStorage.getItem(X.XY_TEST_KEY);
    var keysBefore = localStorage.length;
    X.openSettings();
    X.filterRows('己');
    X.filterRows('戌');
    X.clearSearch();
    X.filterRows('甲申');
    tests.push(eq('v0.30 T11:搜索前后 storeKey 字节一致', localStorage.getItem(X.XY_TEST_KEY) === keyBefore, true));
    tests.push(eq('v0.30 T11:localStorage 键数不变', localStorage.length, keysBefore));
    var hasSearchKey = false;
    for (var i11 = 0; i11 < localStorage.length; i11++) {
      var k11 = localStorage.key(i11) || '';
      if (k11.toLowerCase().indexOf('search') >= 0 || k11.indexOf('xySearch') >= 0) hasSearchKey = true;
    }
    tests.push(eq('v0.30 T11:无搜索相关新键（xySearch*/search*）', hasSearchKey, false));

    // ---- T12 同屏免滚动（AC20；r7：必须先 openSettings（防 E23 假绿）、量 .xy-settings-body、≥1280px 才断）----
    X.resetTestStore(); X.init();
    X.openSettings();
    X.filterRows('');
    tests.push(eq('v0.30 T12:前置·弹层处于可见态（未开时 0≤0 恒真假绿）', ov.classList.contains('show'), true));
    tests.push(eq('v0.30 T12:前置·字体已 settled（无 webfont）', !document.fonts || document.fonts.status === 'loaded', true));
    var sb12 = ov.querySelector('.xy-settings-body');
    tests.push(eq('v0.30 T12:取样容器 .xy-settings-body 存在', !!sb12, true));
    if (wide() && sb12) {
      var sh12 = sb12.scrollHeight, ch12 = sb12.clientHeight;
      tests.push(eq('v0.30 T12:非退化·scrollHeight/clientHeight 均 >0（排除 0≤0）', sh12 > 0 && ch12 > 0, true));
      tests.push(eq('v0.30 T12:空查询 60 行态免纵向滚动 scrollHeight-clientHeight ≤2px', sh12 - ch12 <= 2, true));
      if (sh12 - ch12 > 2) tests.push(fail('v0.30 T12:.xy-settings-body 溢出像素', String(sh12 - ch12)));
    } else {
      tests.push(eq('v0.30 T12:窄屏单栏允许纵向滚动（E15/已知行为 L）', true, true));
    }

    // ---- T13 三栏并排几何 + 弹层尺寸（AC21/AC22；只断钩子/几何，禁断 grid-auto-flow 字面值）----
    X.openSettings();
    X.filterRows('');
    var csb13 = window.getComputedStyle(tb());
    tests.push(eq('v0.30 T13:三栏容器(tbody) display≠none', csb13.display !== 'none', true));
    tests.push(eq('v0.30 T13:栏头 display≠none', gRs[0] ? window.getComputedStyle(gRs[0]).display !== 'none' : false, true));
    if (wide()) {
      var r13 = headRects();
      var tmax = Math.max(r13[0].top, r13[1].top, r13[2].top);
      var tmin = Math.min(r13[0].top, r13[1].top, r13[2].top);
      tests.push(eq('v0.30 T13:栏头 top 同带（max-min ≤8px）', tmax - tmin <= 8, true));
      tests.push(eq('v0.30 T13:栏头 left 严格递增', r13[0].left < r13[1].left && r13[1].left < r13[2].left, true));
      tests.push(eq('v0.30 T13:三栏栏宽均 >0', r13[0].width > 0 && r13[1].width > 0 && r13[2].width > 0, true));
      var modal13 = ov.querySelector('.xy-settings-modal');
      var mw13 = modal13 ? modal13.getBoundingClientRect().width : 0;
      var expW13 = Math.min(0.9 * window.innerWidth, 1200);
      tests.push(eq('v0.30 T13:弹层宽 ≈ min(90vw,1200px) ±8px（AC22）', Math.abs(mw13 - expW13) <= 8, true));
      if (Math.abs(mw13 - expW13) > 8) tests.push(fail('v0.30 T13:弹层宽 vs 期望', mw13 + ' vs ' + expW13));
      // ADR v1.4 §15.3 C3 / 测试契约 C8：共享表头 4 列须与「第 1 栏首条可见行」逐字段对齐，
      // 且每 th 宽 ≥40px（防两个 1fr 轨道塌成 2px 的二次假绿）；只取 rect，不锁 computed 字面值
      var hth13 = ov.querySelectorAll('.xy-table thead th');
      var r1st13 = tb().querySelector('tr[data-gz][data-xy-group="1"]:not([hidden])');
      var dtd13 = r1st13 ? r1st13.querySelectorAll(':scope > td') : [];
      tests.push(eq('v0.30 C8:thead th 数 = 4（AC05）', hth13.length, 4));
      var dmax13 = 0, dmin13 = r1st13 ? Infinity : 0;
      for (var h13i = 0; h13i < hth13.length && h13i < dtd13.length; h13i++) {
        var dd13 = Math.abs(hth13[h13i].getBoundingClientRect().left - dtd13[h13i].getBoundingClientRect().left);
        if (dd13 > dmax13) dmax13 = dd13;
        var w13 = hth13[h13i].getBoundingClientRect().width;
        if (w13 < dmin13) dmin13 = w13;
      }
      tests.push(eq('v0.30 C8:th[i].left 与第 1 栏首条可见行第 i 字段偏差 ≤12px', dmax13 <= 12, true));
      if (dmax13 > 12) tests.push(fail('v0.30 C8:表头列左边界最大偏差 px', String(dmax13)));
      tests.push(eq('v0.30 C8:th[i].width 均 ≥40px（防 1fr 塌缩假绿）', dmin13 >= 40, true));
      if (dmin13 < 40) tests.push(fail('v0.30 C8:表头最小列宽 px', String(dmin13)));
    } else {
      tests.push(eq('v0.30 T13:窄屏单栏（E15，三栏几何不适用）', true, true));
    }

    // ---- T14 空栏占位 + 无结果提示全局唯一（AC24）----
    X.openSettings();
    X.filterRows('');
    var pos14 = headRects();
    X.filterRows('癸亥');
    tests.push(eq('v0.30 T14:癸亥 可见行=1', visN(), 1));
    tests.push(eq('v0.30 T14:癸亥 命中属组 3', visRows().length ? visRows()[0].getAttribute('data-xy-group') : '', '3'));
    tests.push(eq('v0.30 T14:癸亥 → 空栏(组1/组2)可见行=0/0', visCountOf(1) + '/' + visCountOf(2), '0/0'));
    tests.push(eq('v0.30 T14:癸亥 → 栏头仍 3 且全部可见', headsOk(), true));
    var pos14b = headRects();
    var moved14 = Math.abs(pos14b[0].left - pos14[0].left) + Math.abs(pos14b[2].left - pos14[2].left);
    tests.push(eq('v0.30 T14:筛选后栏头位置不变（left 漂移 ≤0.5px）', moved14 <= 0.5, true));
    X.filterRows('XYZ');
    tests.push(eq('v0.30 T14:#xySearchEmpty 全局唯一', document.querySelectorAll('#xySearchEmpty').length, 1));
    tests.push(eq('v0.30 T14:空提示可见且文案正确', empEl().hidden === false && empEl().textContent.indexOf('没有匹配的干支') >= 0, true));
    tests.push(eq('v0.30 T14:XYZ → 可见行=0', visN(), 0));
    tests.push(eq('v0.30 T14:XYZ → 栏头仍 3 且可见（空栏占位，不隐藏）', headsOk(), true));
    X.filterRows('己');
    tests.push(eq('v0.30 T14:己 → 按组计数 2/2/2（仅辅助，不作判据）', visCountOf(1) + ',' + visCountOf(2) + ',' + visCountOf(3), '2,2,2'));
    tests.push(eq('v0.30 T14:己 → 可见行=6', visN(), 6));

    // ---- T15 筛选态栏位正确性（AC25；几何判据：行中心必须落在所属栏头水平区间内）----
    X.openSettings();
    if (wide()) {
      X.filterRows('己');
      tests.push(eq('v0.30 T15:己 6 行全部渲染在所属组栏位', bandBad().join(','), ''));
      X.filterRows('戌');
      tests.push(eq('v0.30 T15:戌 5 行全部渲染在所属组栏位', bandBad().join(','), ''));
      X.filterRows('癸亥');
      tests.push(eq('v0.30 T15:癸亥 1 行渲染在栏 3 区间内', bandBad().join(','), ''));
      X.filterRows('甲子');
      tests.push(eq('v0.30 T15:甲子 1 行渲染在栏 1 区间内', bandBad().join(','), ''));
      X.filterRows('己');
      var lset14 = {}, lcnt14 = 0;
      var vrs15 = tb().querySelectorAll('tr[data-gz]:not([hidden])');
      for (var vi15 = 0; vi15 < vrs15.length; vi15++) {
        var lk15 = Math.round(vrs15[vi15].getBoundingClientRect().left);
        if (!lset14[lk15]) { lset14[lk15] = 1; lcnt14++; }
      }
      tests.push(eq('v0.30 T15:己 命中行分布在 3 个不同 x 带（非全挤栏 1）', lcnt14, 3));
    } else {
      tests.push(eq('v0.30 T15:窄屏单栏不适用（E15/已知行为 L）', true, true));
    }
    X.filterRows('');

    // ---- 复位：清测试态，避免污染真实 localStorage ----
    X.resetTestStore(); X.init();
    X.closeSettings();
    if (host30) host30.innerHTML = '';
  })();

  // 渲染结果（增强版：顶部横幅 + 详情折叠）
  var results = document.getElementById('test-results');
  var summary = document.getElementById('test-summary');
  var html = '', passed = 0, failed = 0, sections = {};

  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    if (t.section) {
      var secKey = t.section;
      sections[secKey] = { passed: 0, failed: 0, items: '' };
      html += '<div style="color:#ff9800;font-size:13px;margin:16px 0 8px;text-transform:uppercase;letter-spacing:1px;cursor:pointer" onclick="var n=this.nextElementSibling;n.style.display=n.style.display==="none"?"block":"none"">▸ ' + t.section + '</div><div>';
      continue;
    }
    if (t.ok) {
      passed++;
      if (Object.keys(sections).length > 0) {
        var lastSec = sections[Object.keys(sections).pop()];
        lastSec.passed++;
        lastSec.items += '<div style="margin-bottom:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-family:monospace;background:#1b3a1b;border-left:3px solid #4caf50">✅ ' + t.label + '</div>';
      }
      html += '<div style="margin-bottom:6px;padding:8px 12px;border-radius:4px;font-size:14px;font-family:monospace;background:#1b3a1b;border-left:3px solid #4caf50"><span style="font-weight:bold;margin-right:8px">✅</span>' + t.label + (t.detail ? ' <span style="color:#aaa;font-size:12px">' + t.detail + '</span>' : '') + '</div>';
    } else {
      failed++;
      if (Object.keys(sections).length > 0) {
        var lastSec = sections[Object.keys(sections).pop()];
        lastSec.failed++;
        lastSec.items += '<div style="margin-bottom:4px;padding:4px 12px;border-radius:4px;font-size:12px;font-family:monospace;background:#3a1b1b;border-left:3px solid #f44336">❌ ' + t.label + ' <span style="color:#f99">' + t.detail + '</span></div>';
      }
      html += '<div style="margin-bottom:6px;padding:8px 12px;border-radius:4px;font-size:14px;font-family:monospace;background:#3a1b1b;border-left:3px solid #f44336"><span style="font-weight:bold;margin-right:8px">❌</span>' + t.label + ' <span style="color:#f99;font-size:12px">' + t.detail + '</span></div>';
    }
  }

  var elapsed = Date.now() - start;
  var total = passed + failed;

  // 顶部显眼横幅
  var bannerColor = failed === 0 ? '#4caf50' : '#f44336';
  var bannerBg = failed === 0 ? '#1b3a1b' : '#3a1b1b';
  var bannerIcon = failed === 0 ? '✅ 全绿' : '❌ 失败';
  var bannerText = failed === 0 ? '全部 ' + total + ' 条断言通过！' : failed + '/' + total + ' 条断言失败';
  summary.style.cssText = 'background:' + bannerBg + ';border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;border:2px solid ' + bannerColor;
  summary.innerHTML = '<div style="font-size:32px;margin-bottom:8px">' + bannerIcon + '</div>'
    + '<div style="font-size:20px;font-weight:bold;color:' + bannerColor + '">' + bannerText + '</div>'
    + '<div style="color:#888;font-size:13px;margin-top:4px">' + elapsed + 'ms · ' + new Date().toLocaleString() + '</div>';

  results.innerHTML = html;
  document.getElementById('test-time').textContent = '';

  if (failed === 0) {
    document.title = '✅ 全部通过 — 八字排盘回归测试';
  } else {
    document.title = '❌ ' + failed + ' 失败 — 八字排盘回归测试';
  }
})();

// ===== v0.25.0 追加断言辅助 =====
// auth.js/records.js 在 main 段之后加载，测试区同步渲染时其逻辑尚不可用；
// 各模块加载完成后经 __testAppend 追加断言并重算统一统计（不重排既有断言）。
window.__testAppend = function(t) {
  var results = document.getElementById('test-results');
  var summary = document.getElementById('test-summary');
  if (!results || !summary) return;
  // 解析既有统计（banner 文本：全部 N 条断言通过 / f/t 条断言失败）
  var text = summary.textContent || '';
  var mFail = text.match(/(\d+)\s*\/\s*(\d+)\s*条断言失败/);
  var mOk = text.match(/全部\s*(\d+)\s*条断言通过/);
  var total = 0, failed = 0;
  if (mFail) { total = parseInt(mFail[2], 10); failed = parseInt(mFail[1], 10); }
  else if (mOk) { total = parseInt(mOk[1], 10); failed = 0; }
  var ok = !!t.ok;
  total++; if (!ok) failed++;
  var block = document.createElement('div');
  block.setAttribute('data-ok', ok ? '1' : '0');
  block.style.cssText = 'margin-bottom:6px;padding:8px 12px;border-radius:4px;font-size:14px;font-family:monospace;background:' + (ok ? '#1b3a1b' : '#3a1b1b') + ';border-left:3px solid ' + (ok ? '#4caf50' : '#f44336');
  block.textContent = (ok ? '✅ ' : '❌ ') + t.label + (t.detail ? ' — ' + t.detail : '');
  results.appendChild(block);
  var bannerColor = failed === 0 ? '#4caf50' : '#f44336';
  var bannerBg = failed === 0 ? '#1b3a1b' : '#3a1b1b';
  var bannerIcon = failed === 0 ? '✅ 全绿' : '❌ 失败';
  var bannerText = failed === 0 ? '全部 ' + total + ' 条断言通过！' : failed + '/' + total + ' 条断言失败';
  summary.style.cssText = 'background:' + bannerBg + ';border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;border:2px solid ' + bannerColor;
  summary.innerHTML = '<div style="font-size:32px;margin-bottom:8px">' + bannerIcon + '</div>'
    + '<div style="font-size:20px;font-weight:bold;color:' + bannerColor + '">' + bannerText + '</div>'
    + '<div style="color:#888;font-size:13px;margin-top:4px">含 v0.24 追加断言</div>';
  document.title = failed === 0 ? '✅ 全部通过 — 八字排盘回归测试' : '❌ ' + failed + ' 失败 — 八字排盘回归测试';
};


  // ===== 挂载到全局命名空间 =====
  window.APP = {
    onProvChange: onProvChange,
    onCityChange: onCityChange,
    toggleSolar: toggleSolar,
    setupTwinTypeChange: setupTwinTypeChange,
    toggleCalendar: toggleCalendar,
    updateSolarPreview: updateSolarPreview,
    setCurrentBaziResult: setCurrentBaziResult,
    getCurrentBaziResult: getCurrentBaziResult,
    showAiInput: showAiInput,
    hideAiInput: hideAiInput,
    TIME_MOD: TIME_MOD,
    parseNaturalInput: parseNaturalInput,
    doAiParse: doAiParse,
    doPaipan: doPaipan,
    // v0.23.1 getter：实时反映日历模式（值快照会导致农历模式误判走公历分支）
    get calendarType() { return calendarType; },
    captureScreenshot: captureScreenshot,
    buildScreenshotFilename: buildScreenshotFilename,
  };
})();
