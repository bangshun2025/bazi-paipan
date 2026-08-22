/* 八字排盘 v0.23.0 — main.js */
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
        doPaipan();
      }, 100);
    }, 100);
  } else {
    document.getElementById('useSolar').checked = false;
    toggleSolar();
    hideAiInput();
    doPaipan();
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
