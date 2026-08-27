/* 八字排盘 v0.23.4 — algorithm.js */
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

function monthDays(info, m, isLeap, leapMonth) {
  if (isLeap) {
    return ((info >> 20) & 1) ? 30 : 29;
  }
  return ((info >> (3 + m)) & 1) ? 30 : 29;
}

// 日期规范化（跨月跨年）
function normalizeDate(y, m, d) {
  var daysInMonth = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) daysInMonth[2] = 29;
  while (d > daysInMonth[m]) {
    d -= daysInMonth[m];
    m++;
    if (m > 12) { m = 1; y++; }
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) daysInMonth[2] = 29;
    else daysInMonth[2] = 28;
  }
  return { y: y, m: m, d: d };
}

// 农历转公历（查表法）
function lunarToSolar(ly, lm, ld, isLeap) {
  var idx = ly - 1000;
  if (idx < 0 || idx >= LUNAR_INFO.length) return null;
  var info = LUNAR_INFO[idx];
  var leapMonth = info & 0xF;
  var ny = LUNAR_NEW_YEAR[idx];
  var solarY = ly, solarM = ny[0], solarD = ny[1];
  if (isLeap && leapMonth !== lm) isLeap = false;
  for (var m = 1; m < lm; m++) {
    solarD += monthDays(info, m, false, leapMonth);
    if (m === leapMonth) { solarD += monthDays(info, m, true, leapMonth); }
  }
  if (isLeap) {
    solarD += monthDays(info, lm, false, leapMonth);
  }
  solarD += ld - 1;
  return normalizeDate(solarY, solarM, solarD);
}

// 新历/农历切换
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
  const m = parseInt(document.getElementById('inMonth').value);
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

// 获取所选位置的经度
function getLng() {
  const prov = document.getElementById('inProv').value;
  const city = document.getElementById('inCity').value;
  if (!prov || !city) return null;
  const cData = LOC_DATA[prov]?.cities[city];
  return cData ? cData.lng : null;
}

// 计算一年中的第几天
function dayOfYear(y, m, d) {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) daysInMonth[2] = 29;
  let doy = d;
  for (let i = 1; i < m; i++) doy += daysInMonth[i];
  return doy;
}

// 均时差（Equation of Time）：返回分钟数，正值=真太阳超前于平太阳
// Spencer, 1971 公式
function equationOfTime(y, m, d) {
  const doy = dayOfYear(y, m, d);
  const B = (doy - 1) * 2 * Math.PI / 365;
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
                      - 0.014615 * Math.cos(2*B) - 0.040849 * Math.sin(2*B));
  return eot;
}

function trueSolarTime(y, m, d, h, mi, lng) {
  // 经度修正：每度差4分钟，北京时间基准东经120°
  const lngOffset = (lng - 120) * 4;
  // 均时差（Equation of Time）：太阳真位置与平太阳的偏差
  const eot = equationOfTime(y, m, d);
  const offsetMin = lngOffset + eot;
  const totalMin = h * 60 + mi + offsetMin;
  // 处理跨日
  let adjMin = totalMin;
  let adjD = d, adjM = m, adjY = y;
  while (adjMin < 0) { adjMin += 1440; adjD -= 1; }
  while (adjMin >= 1440) { adjMin -= 1440; adjD += 1; }
  // 处理月份边界
  const daysInMonth = new Date(adjY, adjM, 0).getDate();
  if (adjD < 1) { adjM -= 1; if (adjM < 1) { adjM = 12; adjY -= 1; } adjD = new Date(adjY, adjM, 0).getDate(); }
  else if (adjD > daysInMonth) { adjD -= daysInMonth; adjM += 1; if (adjM > 12) { adjM = 1; adjY += 1; } }
  let adjH = Math.floor(adjMin / 60);
  let adjMi = Math.round(adjMin % 60);
  // v0.23.1 小数偏移取整进位：59.6 分 → 60 分需进位到小时
  if (adjMi === 60) { adjMi = 0; adjH += 1; }
  return {
    y: adjY, m: adjM, d: adjD, h: adjH, mi: adjMi,
    offsetMin: offsetMin,
    orig: { y, m, d, h, mi }
  };
}
function getSolarTerm(y, n) {
  // n: 0=小寒 ... 23=冬至
  // 查表返回"BJT as UTC"——与qiYunDays的Date.UTC对齐
  const idx = (y - 1000) * 24 + n;
  const packed = SOLAR_TERMS[idx];
  if (packed === undefined) return null; // 表外年份越界（如 999 年大雪 / 2101 年小寒）
  let days = Math.trunc(packed / 86400);
  let secs = packed % 86400;
  if (secs < 0) { secs += 86400; days -= 1; }
  const ms2000 = Date.UTC(2000, 0, 1);
  return new Date(ms2000 + days * 86400000 + secs * 1000 - 288e5);
}

function yearPillar(y) {
  const base = 4; // 1984 = 甲子年
  let idx = (y - base) % 60;
  if (idx < 0) idx += 60;
  return { gan: TG[idx % 10], zhi: DZ[idx % 12], idx };
}

// ============ 月柱 ============
function monthPillar(y, m, d, h, mi, yearGan) {
  // 根据出生日期确定在哪个月（基于节气）
  // v0.23.4 节气当天出生修复：节气边界改用完整时刻（保留时分），统一按
  // "BJT-as-UTC" 基准比较（出生 Date.UTC 字段 = 北京钟表时间；节气 getTime()+8h 转回北京钟表）。
  // 修复：节气当天出生被"节气日零点"截断误判下月（如 1987-05-06 立夏 17:05，06:30 错判巳月→起运越界崩溃）
  const birthMs = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  const BJT_OFFSET = 288e5; // 8 小时（节气表存真实 UTC，需转回北京时间基准）
  // 判断出生是否在立春前（用于正确选择大雪/小寒的年份）
  const lc = getSolarTerm(y, 2);
  const lcMs = lc ? lc.getTime() + BJT_OFFSET : null;
  const beforeLC = lcMs !== null && birthMs < lcMs;
  for (let i = 0; i < 12; i++) {
    const termIdx = MONTH_TERM[i];
    let stY = y;
    // 子月(大雪): 立春前出生→大雪在前一年, 否则在当年
    if (i === 10) stY = beforeLC ? y - 1 : y;
    // 丑月(小寒): 立春前出生→小寒在当年1月, 否则在次年1月
    else if (i === 11) stY = beforeLC ? y : y + 1;
    const st = getSolarTerm(stY, termIdx); // 本月起始节气（表外年份可能为 null）
    // null 仅发生在"子月大雪在 999 年"（1000 年年初出生）：大雪已过，视为已进入本月
    const stMs = st ? st.getTime() + BJT_OFFSET : -8640000000000000;

    // 下月起始节气
    const nextI = (i + 1) % 12;
    const nextTerm = MONTH_TERM[nextI];
    let nextY = stY;
    if (nextTerm <= termIdx) nextY = stY + 1;
    const nextSt = getSolarTerm(nextY, nextTerm);
    // null 仅发生在"下月节气在 2101 年"（2100 年末出生）：节气未到，视为未进下月
    const nextMs = nextSt ? nextSt.getTime() + BJT_OFFSET : 8640000000000000;

    if (birthMs >= stMs && birthMs < nextMs) {
      const zhi = DZ[(i + 2) % 12]; // 寅月=寅, 卯月=卯...
      const ganStart = WU_HU_DUN[yearGan];
      const gan = TG[(TG.indexOf(ganStart) + i) % 10];
      return { gan, zhi, monthIdx: i };
    }
  }
  // fallback: 丑月
  const zhi = '丑', ganStart = WU_HU_DUN[yearGan];
  return { gan: TG[(TG.indexOf(ganStart) + 11) % 10], zhi, monthIdx: 11 };
}

// ============ 日柱 ============
function dayPillar(y, m, d) {
  const birth = Date.UTC(y, m - 1, d);
  const ref = Date.UTC(1900, 0, 1);
  const diffDays = Math.round((birth - ref) / 86400000);
  const idx = ((diffDays % 60) + 10) % 60; // 1900-01-01 = 甲戌 (index 10)
  const pos = idx < 0 ? idx + 60 : idx;
  return { gan: TG[pos % 10], zhi: DZ[pos % 12], idx: pos };
}

// ============ 时柱 ============
function hourPillar(dayGan, hour) {
  const zhiIdx = Math.floor((hour + 1) / 2) % 12;
  const zhi = DZ[zhiIdx];
  const ganStart = WU_SHU_DUN[dayGan];
  const gan = TG[(TG.indexOf(ganStart) + zhiIdx) % 10];
  return { gan, zhi };
}
function shiShen(riGan, gan, short) {
  let r;
  if (riGan === gan) r = '比肩';
  else {
    const dw = WU_XING[riGan], tw = WU_XING[gan];
    if (!dw || !tw) return '?';
    if (dw === tw) {
      const yy = '甲丙戊庚壬'.includes(riGan) === '甲丙戊庚壬'.includes(gan);
      r = yy ? '比肩' : '劫财';
    } else {
      const yy = '甲丙戊庚壬'.includes(riGan) === '甲丙戊庚壬'.includes(gan);
      const sheng = {木:'火',火:'土',土:'金',金:'水',水:'木'};
      const ke = {木:'土',土:'水',水:'火',火:'金',金:'木'};
      if (sheng[dw] === tw) r = yy ? '食神' : '伤官';
      else if (sheng[tw] === dw) r = yy ? '枭神' : '正印';
      else if (ke[dw] === tw) r = yy ? '偏财' : '正财';
      else if (ke[tw] === dw) r = yy ? '七杀' : '正官';
      else return '?';
    }
  }
  return short !== false ? (SHI_SHEN_SHORT[r] || r) : r;
}

function zhiShiShen(riGan, zhi, twin, pillarType) {
  let mainGan;
  if (twin === 2 && twinPillars.includes(pillarType)) {
    mainGan = ZHI_TWIN_MAIN[zhi] || (ZHI_TWIN_CANG[zhi] ? ZHI_TWIN_CANG[zhi][0] : '');
  } else {
    mainGan = ZHI_MAIN[zhi];
  }
  if (!mainGan) return '?';
  return shiShen(riGan, mainGan);
}

// 五行色 class
function wxClass(gan) { return WX_CSS[WU_XING[gan]] || ''; }

// ============ 十二长生 ============
function changSheng(gan, zhi) {
  const mapGan = CS12_MAP[gan] || CS12_MAP[{'金':'庚','水':'壬','木':'甲','火':'丙','土':'戊'}[WU_XING[gan]]];
  if (!mapGan) return '?';
  const i = mapGan.indexOf(zhi);
  return i >= 0 ? CS12_N[i] : '?';
}

// 纳音五行十二长生（纳音末字→五行→阳干→查月令位置）
function nayunChangSheng(nayinName, yueZhi) {
  if (!nayinName || !yueZhi) return '';
  const wx = nayinName[nayinName.length - 1];
  const yangGan = NAYIN_WX_YANG[wx];
  if (!yangGan) return '';
  return changSheng(yangGan, yueZhi);
}

// ============ 藏干文本 ============
function cangGanAt(zhi, riGan, twin, pillarType, level) {
  let cg;
  if (twin === 2 && twinPillars.includes(pillarType)) {
    cg = ZHI_TWIN_CANG[zhi] || CANG_GAN[zhi] || [];
  } else {
    cg = CANG_GAN[zhi] || [];
  }
  const c = cg[level];
  return c ? '<span class="'+wxClass(c)+'">'+c+'</span> ' + shiShen(riGan, c) : '';
}

function cangGanText(zhi, riGan, twin, pillarType) {
  let cg;
  if (twin === 2 && twinPillars.includes(pillarType)) {
    cg = ZHI_TWIN_CANG[zhi] || CANG_GAN[zhi] || [];
  } else {
    cg = CANG_GAN[zhi] || [];
  }
  return cg.map(c => '<span class="'+wxClass(c)+'">'+c+'</span> ' + shiShen(riGan, c)).join('<br>');
}

// v0.4.1 藏干分层（日/时/命/身 vs 年/月/大运/流年）
// v0.4.1 patch: 不再使用 ZHI_TWIN_CANG，统一用 CANG_GAN
// 老大(twin=1)：只显示本气，中气/余气留空；老二(twin=2)：只显示中气+余气，本气留空
// 独气支（子卯酉 cg.length===1）：老二中气用劫财（同五行反阴阳）填充
function jieCai(gan) {
  const i = TG.indexOf(gan);
  return i >= 0 ? TG[i ^ 1] : null; // 异或翻转阴阳位：甲↔乙 丙↔丁 戊↔己 庚↔辛 壬↔癸
}
function cangGanLayers(zhi, riGan, twin, pillarType) {
  const cg = CANG_GAN[zhi] || [];
  const layers = [];

  if (twinPillars.includes(pillarType)) {
    // 双胞胎柱：老大/老二拆分本气与中余气
    if (twin === 1) {
      // 老大：只显示标准 CANG_GAN 的本气 (cg[0])
      layers[0] = cg[0] ? { gan: cg[0], shiShen: shiShen(riGan, cg[0]), level: '本气' } : null;
      layers[1] = null;
      layers[2] = null;
    } else if (twin === 2) {
      // 老二：只显示标准 CANG_GAN 的中气 (cg[1]) 和余气 (cg[2])
      // 独气支（子卯酉 cg.length===1）：中气用劫财填充
      layers[0] = null;
      if (cg.length === 1) {
        const jc = jieCai(cg[0]);
        layers[1] = jc ? { gan: jc, shiShen: shiShen(riGan, jc), level: '中气' } : null;
      } else {
        layers[1] = cg[1] ? { gan: cg[1], shiShen: shiShen(riGan, cg[1]), level: '中气' } : null;
      }
      layers[2] = cg[2] ? { gan: cg[2], shiShen: shiShen(riGan, cg[2]), level: '余气' } : null;
    } else {
      // fallback：三层正常填充
      for (let i = 0; i < 3; i++) {
        layers[i] = cg[i] ? { gan: cg[i], shiShen: shiShen(riGan, cg[i]), level: ['本气','中气','余气'][i] } : null;
      }
    }
  } else {
    // 年月大运流年：三层正常填充
    for (let i = 0; i < 3; i++) {
      layers[i] = cg[i] ? { gan: cg[i], shiShen: shiShen(riGan, cg[i]), level: ['本气','中气','余气'][i] } : null;
    }
  }

  return layers;
}
function fmtCGLayer(l) { return l ? '<span class="'+wxClass(l.gan)+'">'+l.gan+'</span> ' + l.shiShen : ''; }

// ============ 空亡 ============
function kongWang(riGan, riZhi) {
  return KONG_WANG[riGan + riZhi] || '';
}

// ============ 神煞 ============
function shenSha(riGan, riZhi, nianZhi, yueZhi) {
  const a = [];

  // 天乙贵人
  const tyMap = { '甲':'丑未','戊':'丑未','庚':'丑未','乙':'子申','己':'子申','丙':'亥酉','丁':'亥酉','辛':'午寅','壬':'巳卯','癸':'巳卯' };
  const ty = tyMap[riGan] || '';
  if (ty.includes(riZhi)) a.push('天乙贵');
  if (ty.includes(nianZhi)) a.push('天乙贵');
  if (ty.includes(yueZhi)) a.push('天乙贵');

  // 文昌
  const wcMap = { '甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯' };
  if (wcMap[riGan] === riZhi) a.push('文昌');

  // 禄神
  const luMap = { '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子' };
  if (luMap[riGan] === riZhi) a.push('禄神');

  // 驿马
  const ymMap = { '寅午戌':'申','巳酉丑':'亥','申子辰':'寅','亥卯未':'巳' };
  for (const [k, v] of Object.entries(ymMap)) {
    if (k.includes(nianZhi) && v === riZhi) a.push('驿马');
  }

  // 桃花
  const thMap = { '寅午戌':'卯','巳酉丑':'午','申子辰':'酉','亥卯未':'子' };
  for (const [k, v] of Object.entries(thMap)) {
    if (k.includes(riZhi) && v === riZhi) a.push('桃花');
  }

  // 华盖
  const hgMap = { '寅午戌':'戌','巳酉丑':'丑','申子辰':'辰','亥卯未':'未' };
  for (const [k, v] of Object.entries(hgMap)) {
    if (k.includes(riZhi) && v === riZhi) a.push('华盖');
  }

  // 国印贵人
  const gyMap = { '甲':'未','乙':'申','丙':'酉','丁':'戌','戊':'亥','己':'子','庚':'丑','辛':'寅','壬':'卯','癸':'辰' };
  if (gyMap[riGan] === riZhi) a.push('国印贵');

  return a.length > 0 ? a.slice(0, 3).join('<br>') : '';
}

// ============ 胎元 ============
function taiYuan(yueGan, yueZhi) {
  const gIdx = (TG.indexOf(yueGan) + 1) % 10;
  const zIdx = (DZ.indexOf(yueZhi) + 3) % 12;
  return { gan: TG[gIdx], zhi: DZ[zIdx] };
}

// 地支序号：寅=1, 卯=2, ..., 子=11, 丑=12
function dzNum(zhi) { return ((DZ.indexOf(zhi) + 10) % 12) + 1; }
// 序号→地支
function numZhi(n) { return DZ[(n + 1) % 12]; }

// ============ 命宫 ============
// 命宫地支: (14 - 月支数 - 时支数)，寅=1...丑=12
function mingGong(yueZhi, shiZhi, nianGan) {
  let n = 14 - dzNum(yueZhi) - dzNum(shiZhi);
  if (n <= 0) n += 12;
  if (n > 12) n -= 12;
  const zhi = numZhi(n);
  const ms = WU_HU_DUN[nianGan];
  const gan = TG[(TG.indexOf(ms) + (n - 1)) % 10];
  return { gan, zhi };
}

// ============ 身宫 ============
// 身宫地支: 时支对冲（时支 + 6），天干按五虎遁
function shenGong(yueZhi, shiZhi, nianGan) {
  // 身宫 = (月序数 + 时辰序数) % 12  (0→12)
  // 月序数: dzNum (寅=1..丑=12), 时辰序数: DZ.indexOf+1 (子=1..亥=12)
  let n = (dzNum(yueZhi) + DZ.indexOf(shiZhi) + 1) % 12;
  if (n === 0) n = 12;
  const zhi = numZhi(n);
  const ms = WU_HU_DUN[nianGan];
  const gan = TG[(TG.indexOf(ms) + (n - 1)) % 10];
  return { gan, zhi };
}

// ============ 大运 & 起运 ============
function qiYunDays(birth, monthZhi, shun) {
  // 精确到小时的出生到上/下一个节气的天数
  // 使用 Date.UTC 对齐 getSolarTerm 的 "BJT as UTC" 约定
  const y = birth.getFullYear(), mo = birth.getMonth() + 1, d = birth.getDate();
  const birthMs = Date.UTC(y, mo - 1, d, birth.getHours(), birth.getMinutes());

  // 找到出生月对应的节气索引
  const monthIdx = (DZ.indexOf(monthZhi) + 10) % 12; // 寅月=0
  const termIdx = MONTH_TERM[monthIdx];

  if (shun) {
    const nextI = (monthIdx + 1) % 12;
    const nextTerm = MONTH_TERM[nextI];
    let st = getSolarTerm(y, nextTerm);
    if (st && st.getTime() < birthMs) st = getSolarTerm(y + 1, nextTerm); // 2101 越界时可能为 null
    return st ? (st.getTime() - birthMs) / 86400000 : null;
  } else {
    let st = getSolarTerm(y, termIdx);
    if (st && st.getTime() > birthMs) st = getSolarTerm(y - 1, termIdx);
    return st ? (birthMs - st.getTime()) / 86400000 : null;
  }
}

function computeDaYun(gender, nianGan, yueGan, yueZhi, birth) {
  // v0.22.0: 1000-1399 年不排大运（节气时刻精度不足以保证起运准确性）
  if (birth.getFullYear() < 1400) {
    return { daYun: [], qiYun: null, shun: null };
  }

  const yang = '甲丙戊庚壬'.includes(nianGan);
  const male = gender === '男';
  const shun = (male && yang) || (!male && !yang);

  const days = qiYunDays(birth, yueZhi, shun);
  const totalMonths = days === null ? NaN : days / 3 * 12; // 3天=1年=12个月
  const qyYears = Math.floor(totalMonths / 12);
  const qyMonths = Math.floor(totalMonths % 12);
  const fractionalMonth = totalMonths - Math.floor(totalMonths);
  const fractionalDays = fractionalMonth * 30;
  const qyDays = Math.floor(fractionalDays);
  let qyHours = Math.round((fractionalDays - qyDays) * 24);
  const qyDaysFinal = qyDays;

  const yGIdx = TG.indexOf(yueGan);
  const yZIdx = DZ.indexOf(yueZhi);

  const daYun = [];
  for (let i = 0; i < 10; i++) {
    const off = shun ? i + 1 : -(i + 1);
    let gIdx = (yGIdx + off) % 10;
    let zIdx = (yZIdx + off) % 12;
    if (gIdx < 0) gIdx += 10;
    if (zIdx < 0) zIdx += 12;
    const startAge = Math.round(totalMonths / 12) + 1 + i * 10;
    const startYear = birth.getFullYear() + startAge - 1;
    daYun.push({ gan: TG[gIdx], zhi: DZ[zIdx], startAge, startYear });
  }

  return { daYun, qiYun: { years: qyYears, months: qyMonths, days: qyDaysFinal, hours: qyHours, totalMonths }, shun };
}

// ============ 流年干支 ============
function liuNianJZ(y) {
  const idx = (y - 4) % 60;
  return TG[idx % 10] + DZ[idx % 12];
}

// ============ 人元司令 ============
// 每月节后第几天开始，由哪个天干司令
// 格式：[天数累计, 天干] — 例如 [[9,'辛'],[12,'丁'],[30,'戊']] 表示辛司令1-9日，丁10-12日，戊13-30日
const REN_YUAN = {
  '寅':[[7,'戊'],[14,'丙'],[30,'甲']],
  '卯':[[10,'甲'],[30,'乙']],
  '辰':[[9,'乙'],[12,'癸'],[30,'戊']],
  '巳':[[5,'戊'],[14,'庚'],[30,'丙']],
  '午':[[10,'丙'],[19,'己'],[30,'丁']],
  '未':[[9,'丁'],[12,'乙'],[30,'己']],
  '申':[[7,'戊'],[14,'壬'],[30,'庚']],
  '酉':[[10,'庚'],[30,'辛']],
  '戌':[[9,'辛'],[12,'丁'],[30,'戊']],
  '亥':[[7,'戊'],[12,'甲'],[30,'壬']],
  '子':[[10,'壬'],[30,'癸']],
  '丑':[[9,'癸'],[12,'辛'],[30,'己']]
};

function renYuanSiLing(y, m, d, h, minute) {
  // 遍历月节气找到当前月份，算节后第几天
  // v0.23.4 节气当天出生修复：与 monthPillar 同基准（BJT-as-UTC 完整时刻），
  // 修复节气当天零点截断导致错月（如 1987-05-06 立夏 06:30 显示"立夏后 0 日"）
  const birthMs = Date.UTC(y, m - 1, d, h || 0, minute || 0);
  const BJT_OFFSET = 288e5;
  for (let mi = 0; mi < 12; mi++) {
    const termIdx = MONTH_TERM[mi];
    let stY = y;
    if (termIdx === 0 && mi === 11) {
      // 丑月（小寒=termIdx 0）：1月出生→小寒在同一年 y；其他月份→小寒在 y+1
      stY = (m === 1) ? y : y + 1;
    }
    const st = getSolarTerm(stY, termIdx);
    const stMs = st ? st.getTime() + BJT_OFFSET : -8640000000000000;
    const nextMi = (mi + 1) % 12;
    const nextTerm = MONTH_TERM[nextMi];
    let nextY = y;
    if (nextTerm <= termIdx) nextY = y + 1;
    const nextSt = getSolarTerm(nextY, nextTerm);
    const nextMs = nextSt ? nextSt.getTime() + BJT_OFFSET : 8640000000000000;
    if (birthMs >= stMs && birthMs < nextMs) {
      const daysAfter = Math.floor((birthMs - stMs) / 86400000);
      const monthZhi = DZ[(mi + 2) % 12]; // 寅月=寅...
      const termName = S_TERM_NAME[termIdx];
      const ry = REN_YUAN[monthZhi];
      if (!ry) return '';
      for (const [maxDay, gan] of ry) {
        if (daysAfter <= maxDay) return '人元司令：' + gan + '（' + termName + '后 ' + daysAfter + ' 日）';
      }
      return '人元司令：' + ry[ry.length-1][1] + '（' + termName + '后 ' + daysAfter + ' 日）';
    }
  }
  return '';
}

// ============ 主计算函数 ============
function paipan(name, gender, y, m, d, h, mi) {
  // 1. 年柱（考虑立春）
  const lc2 = getSolarTerm(y, 2); // 立春（表外年份可能为 null）
  const birth = new Date(y, m - 1, d, h, mi);
  // v0.23.4 节气当天出生修复：立春边界改用完整时刻（BJT-as-UTC 基准），修复立春当天零点截断导致年柱错
  const birthMs = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  const lc2Ms = lc2 ? lc2.getTime() + 288e5 : null;
  const effYear = (lc2Ms !== null && birthMs < lc2Ms) ? y - 1 : y;
  const nian = yearPillar(effYear);

  // 2. 月柱
  const yue = monthPillar(y, m, d, h, mi, nian.gan);

  // 3. 日柱（v0.23.2 子时换日：真太阳时 h≥23 时日柱取次日；无早子时/晚子时之说）
  const ri = dayPillar(y, m, h >= 23 ? d + 1 : d);

  // 4. 时柱
  const shi = hourPillar(ri.gan, h);

  // 5. 胎元
  const tai = taiYuan(yue.gan, yue.zhi);

  // 6. 命宫
  const ming = mingGong(yue.zhi, shi.zhi, nian.gan);

  // 7. 身宫
  const shen = shenGong(yue.zhi, shi.zhi, nian.gan);

  // 8. 大运
  const { daYun, qiYun, shun } = computeDaYun(gender, nian.gan, yue.gan, yue.zhi, birth);
  if (qiYun) qiYun.shun = shun;  // 附加顺/逆排标记（<1400 年 qiYun 为 null，跳过）

  // 9. 生肖
  const shengXiao = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const sx = shengXiao[DZ.indexOf(nian.zhi)];

  return { name, gender, y, m, d, h, mi,
    nian, yue, ri, shi, tai, ming, shen,
    shengXiao: sx, daYun, qiYun, sanyuanBar: null };
}

// ============================================================
//  渲染
// ============================================================

function fmtDate(y,m,d) {
  return y + '年' + m + '月' + d + '日';
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

// 顺逆排标签（v0.6.2）
function buildShunLabel(shun, gender, nianGan) {
  if (shun === undefined) return '';
  var yangGan = /^[甲丙戊庚壬]$/.test(nianGan);
  var yinYang = yangGan ? '阳' : '阴';
  var shunNi = shun ? '顺排' : '逆排';
  return '<span class="meta-tag">' + yinYang + '年' + gender + ' · ' + shunNi + '</span>';
}


  // ===== 挂载到全局命名空间 =====
  window.ALGO = {
    monthDays: monthDays,
    normalizeDate: normalizeDate,
    lunarToSolar: lunarToSolar,
    toggleCalendar: toggleCalendar,
    updateSolarPreview: updateSolarPreview,
    getLng: getLng,
    dayOfYear: dayOfYear,
    equationOfTime: equationOfTime,
    trueSolarTime: trueSolarTime,
    getSolarTerm: getSolarTerm,
    yearPillar: yearPillar,
    monthPillar: monthPillar,
    dayPillar: dayPillar,
    hourPillar: hourPillar,
    shiShen: shiShen,
    zhiShiShen: zhiShiShen,
    wxClass: wxClass,
    changSheng: changSheng,
    nayunChangSheng: nayunChangSheng,
    cangGanAt: cangGanAt,
    cangGanText: cangGanText,
    jieCai: jieCai,
    cangGanLayers: cangGanLayers,
    fmtCGLayer: fmtCGLayer,
    kongWang: kongWang,
    shenSha: shenSha,
    taiYuan: taiYuan,
    dzNum: dzNum,
    numZhi: numZhi,
    mingGong: mingGong,
    shenGong: shenGong,
    qiYunDays: qiYunDays,
    computeDaYun: computeDaYun,
    liuNianJZ: liuNianJZ,
    REN_YUAN: REN_YUAN,
    renYuanSiLing: renYuanSiLing,
    paipan: paipan,
    fmtDate: fmtDate,
    pad: pad,
    buildShunLabel: buildShunLabel,
  };
})();
