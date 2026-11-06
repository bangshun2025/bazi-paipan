/* 八字排盘 v0.36.0 — algorithm.js */
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

// 公历转农历（查表法）
function solarToLunar(gy, gm, gd) {
  var idx = gy - 1000;
  if (idx < 0 || idx >= LUNAR_INFO.length) return null;
  var ny = LUNAR_NEW_YEAR[idx];
  var ord = Math.floor(Date.UTC(gy, gm - 1, gd) / 86400000);
  if (ord < Math.floor(Date.UTC(gy, ny[0] - 1, ny[1]) / 86400000)) {
    idx -= 1;
    if (idx < 0) return null;
    ny = LUNAR_NEW_YEAR[idx];
  }
  var ly = 1000 + idx;
  var info = LUNAR_INFO[idx];
  var leapMonth = info & 0xF;
  var rest = ord - Math.floor(Date.UTC(ly, ny[0] - 1, ny[1]) / 86400000);
  for (var m = 1; m <= 12; m++) {
    var md = monthDays(info, m, false, leapMonth);
    if (rest < md) return { y: ly, m: m, d: rest + 1, isLeap: false };
    rest -= md;
    if (m === leapMonth) {
      var ld = monthDays(info, m, true, leapMonth);
      if (rest < ld) return { y: ly, m: m, d: rest + 1, isLeap: true };
      rest -= ld;
    }
  }
  return null;
}

// 儒略历→格里历（JD 桥接）：1582-10-04 及更早的西历日期按史学界惯例是儒略历，
// 排盘需先换算成格里历（如王阳明生：儒 1472-10-31 = 格 1472-11-09）
function julianToGregorian(y, m, d) {
  var Y = y, M = m;
  if (M <= 2) { Y -= 1; M += 12; }
  var jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d - 1524.5;
  var Z = Math.floor(jd + 0.5);
  var a = Math.floor((Z - 1867216.25) / 36524.25);
  var A = Z + 1 + a - Math.floor(a / 4);
  var B = A + 1524;
  var C = Math.floor((B - 122.1) / 365.25);
  var D = Math.floor(365.25 * C);
  var E = Math.floor((B - D) / 30.6001);
  var gd = B - D - Math.floor(30.6001 * E);
  var gm = E < 14 ? E - 1 : E - 13;
  var gy = gm > 2 ? C - 4716 : C - 4715;
  return { y: gy, m: gm, d: gd };
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
  // 基准契约（v0.31.0 修正）：getSolarTerm() 返回时刻的 UTC 字段即北京钟表时间
  // （"BJT-as-UTC"），与下方 birthMs = Date.UTC(...) 同基准 → 两端直接比较，
  // 切勿再加 8 小时。v0.23.4 曾在此多加 8 小时，令节气后 8 小时窗口内出生
  // 被误判上月（如 1987-05-06 立夏 09:05:35，09:06~17:05 错给辰月）。
  const birthMs = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  // 判断出生是否在立春前（用于正确选择大雪/小寒的年份）
  const lc = getSolarTerm(y, 2);
  const lcMs = lc ? lc.getTime() : null;
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
    const stMs = st ? st.getTime() : -8640000000000000;

    // 下月起始节气
    const nextI = (i + 1) % 12;
    const nextTerm = MONTH_TERM[nextI];
    let nextY = stY;
    if (nextTerm <= termIdx) nextY = stY + 1;
    const nextSt = getSolarTerm(nextY, nextTerm);
    // null 仅发生在"下月节气在 2101 年"（2100 年末出生）：节气未到，视为未进下月
    const nextMs = nextSt ? nextSt.getTime() : 8640000000000000;

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
// ============ 转换太极点 ============
// active 时所有十神关系以 TAIJI.gan 为中心重算（原局/藏干/大运/流年统一换参照系）
var TAIJI = { active: false, gan: '', col: '', kind: '' };
function setTaiji(gan, col, kind) { TAIJI = { active: true, gan: gan, col: col || '', kind: kind || 'gan' }; }
function clearTaiji() { TAIJI = { active: false, gan: '', col: '', kind: '' }; }
function getTaiji() { return TAIJI; }
function taijiStemLabel(col) { return { nian:'年主', yue:'月主', ri:'日主', shi:'时主' }[col] || ''; }

function shiShen(riGan, gan, short) {
  if (TAIJI.active && TAIJI.gan) riGan = TAIJI.gan;
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
  return cg.map(c => {
    if (TAIJI.active && TAIJI.kind === 'cang' && pillarType === TAIJI.col && c === TAIJI.gan)
      return '<span class="'+wxClass(c)+' taiji-ring">'+c+'</span> 主';
    return '<span class="'+wxClass(c)+'">'+c+'</span> ' + shiShen(riGan, c);
  }).join('<br>');
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

// ============ 胎年（v0.36.0） ============
// 口径A：胎元所在年的干支。胎元=出生月往前第 9 个节气月（60 月环，即月干进一、月支进三），
// 胎年=该月所属 eff 年的年柱。k=月支序（寅=0..丑=11），回退 9 个月跨年界次数=floor((k-9)/12)：
// 亥/子/丑月生人胎年=生年干支（亥月由邦顺 2026-09-20 裁决），其余生月=前一年干支。
function taiNianGZ(effYear, yueZhi) {
  const k = (DZ.indexOf(yueZhi) - 2 + 12) % 12;
  return yearPillar(effYear + Math.floor((k - 9) / 12));
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

// 自然月加法：用于交运时刻（出生 + 起运 年/月/天/小时）。
// 月进位按日历走；目标月天数不足时对齐到该月末（3/31 + 1月 → 4/30），避免溢出漂到次月。
function addYMDH(date, y, mo, d, h) {
  const r = new Date(date.getTime());
  const day = r.getDate();
  r.setDate(1);
  r.setFullYear(r.getFullYear() + y);
  r.setMonth(r.getMonth() + mo);
  const dim = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(day, dim));
  r.setDate(r.getDate() + d);
  r.setHours(r.getHours() + h);
  return r;
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

  // 起运后每步十年；起始年取真实交运时刻的日历年。
  // 旧式 birth.getFullYear() + Math.round(totalMonths/12) 丢掉起运月日：
  // 余月 ≥6 而不跨年时整体晚一年，余月 <6 而跨年时整体早一年。
  const jyDate = addYMDH(birth, qyYears, qyMonths, qyDaysFinal, qyHours);
  const jyYear = jyDate.getFullYear();
  const ageBase = jyYear - birth.getFullYear() + 1;

  const daYun = [];
  for (let i = 0; i < 10; i++) {
    const off = shun ? i + 1 : -(i + 1);
    let gIdx = (yGIdx + off) % 10;
    let zIdx = (yZIdx + off) % 12;
    if (gIdx < 0) gIdx += 10;
    if (zIdx < 0) zIdx += 12;
    const startAge = ageBase + i * 10;
    const startYear = jyYear + i * 10;
    daYun.push({ gan: TG[gIdx], zhi: DZ[zIdx], startAge, startYear });
  }

  return { daYun, qiYun: { years: qyYears, months: qyMonths, days: qyDaysFinal, hours: qyHours, totalMonths, jyYear }, shun };
}

// ============ 流年干支 ============
function liuNianJZ(y) {
  const idx = (y - 4) % 60;
  return TG[idx % 10] + DZ[idx % 12];
}

// ============ 人元司令 ============
// 每月节后第几天开始，由哪个天干司令
// 格式：[天数累计, 天干] — 例如 [[9,'辛'],[12,'丁'],[30,'戊']] 表示节后第1-9日辛司令、第10-12日丁、第13-30日戊
// daysAfter 为 0 起算的完整天数（节后第 N 日 ⇔ daysAfter = N-1），边界用 < 判断（<= 会让每段多占 1 日）
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
  // 与 monthPillar 同基准（BJT-as-UTC 完整时刻；基准契约见 monthPillar 内注释），
  // v0.23.4 修复节气当天零点截断导致错月（如 1987-05-06 立夏 06:30 显示"立夏后 0 日"）
  const birthMs = Date.UTC(y, m - 1, d, h || 0, minute || 0);
  for (let mi = 0; mi < 12; mi++) {
    const termIdx = MONTH_TERM[mi];
    const nextMi = (mi + 1) % 12;
    const nextTerm = MONTH_TERM[nextMi];
    // 起始节气可能在上一年（如 1 月初小寒前属上年子月，大雪在 y-1），需跨年搜索窗口
    for (let stY = y - 1; stY <= y + 1; stY++) {
      const st = getSolarTerm(stY, termIdx);
      const stMs = st ? st.getTime() : -8640000000000000;
      const nextY = (nextTerm <= termIdx) ? stY + 1 : stY;
      const nextSt = getSolarTerm(nextY, nextTerm);
      const nextMs = nextSt ? nextSt.getTime() : 8640000000000000;
      if (birthMs >= stMs && birthMs < nextMs) {
        const daysAfter = Math.floor((birthMs - stMs) / 86400000);
        const monthZhi = DZ[(mi + 2) % 12]; // 寅月=寅...
        const termName = S_TERM_NAME[termIdx];
        const ry = REN_YUAN[monthZhi];
        if (!ry) return '';
        for (const [maxDay, gan] of ry) {
          if (daysAfter < maxDay) return '人元司令：' + gan + '（' + termName + '后 ' + daysAfter + ' 日）';
        }
        return '人元司令：' + ry[ry.length-1][1] + '（' + termName + '后 ' + daysAfter + ' 日）';
      }
    }
  }
  return '';
}

// ============ 主计算函数 ============
function paipan(name, gender, y, m, d, h, mi) {
  // 1. 年柱（考虑立春）
  const lc2 = getSolarTerm(y, 2); // 立春（表外年份可能为 null）
  const birth = new Date(y, m - 1, d, h, mi);
  // v0.23.4 节气当天出生修复：立春边界改用完整时刻（BJT-as-UTC 基准），修复立春当天零点截断导致年柱错判
  const birthMs = Date.UTC(y, m - 1, d, h || 0, mi || 0);
  const lc2Ms = lc2 ? lc2.getTime() : null;
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

  // 5b. 胎年（v0.36.0 口径A：胎元所在年的干支）
  const taiNian = taiNianGZ(effYear, yue.zhi);

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
    nian, yue, ri, shi, tai, taiNian, ming, shen,
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


  // ============================================================
  // v0.97.0 特征造盘 — 描述一个干支结构特征，扫真实出生时刻找个命盘示例
  // 判据只读四柱干支，十神自算（不走 shiShen，避免被当前太极点改写）
  // ============================================================
  var GEN = (function() {
    var YANG = '甲丙戊庚壬';
    var SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
    var KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };
    var POS = ['年','月','日','时'];
    // 七柱 = 四柱 + 三垣（胎元/命宫/身宫），索引与 pos 参数一致
    var POS7 = ['年','月','日','时','胎元','命宫','身宫'];
    var CN_NUM = { 1:'一', 2:'两', 3:'三', 4:'四' };

    var HE5 = [
      { a:'甲', b:'己', wx:'土' }, { a:'乙', b:'庚', wx:'金' }, { a:'丙', b:'辛', wx:'水' },
      { a:'丁', b:'壬', wx:'木' }, { a:'戊', b:'癸', wx:'火' }
    ];
    var SANHE = [
      { zhi:['申','子','辰'], wx:'水' }, { zhi:['亥','卯','未'], wx:'木' },
      { zhi:['寅','午','戌'], wx:'火' }, { zhi:['巳','酉','丑'], wx:'金' }
    ];
    var SANHUI = [
      { zhi:['寅','卯','辰'], wx:'木' }, { zhi:['巳','午','未'], wx:'火' },
      { zhi:['申','酉','戌'], wx:'金' }, { zhi:['亥','子','丑'], wx:'水' }
    ];
    var CHONG = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
    var TG_ALIAS = [
      ['七杀','七杀'],['偏官','七杀'],['正官','正官'],['官星','正官'],
      ['伤官','伤官'],['食神','食神'],['偏印','枭神'],['枭神','枭神'],['枭印','枭神'],
      ['正印','正印'],['印星','正印'],['偏财','偏财'],['正财','正财'],
      ['比肩','比肩'],['劫财','劫财'],['杀','七杀'],['官','正官']
    ];

    function ss(riGan, gan) {
      if (riGan === gan) return '比肩';
      var dw = WU_XING[riGan], tw = WU_XING[gan];
      if (!dw || !tw) return '?';
      var same = (YANG.indexOf(riGan) >= 0) === (YANG.indexOf(gan) >= 0);
      if (dw === tw) return same ? '比肩' : '劫财';
      if (SHENG[dw] === tw) return same ? '食神' : '伤官';
      if (SHENG[tw] === dw) return same ? '枭神' : '正印';
      if (KE[dw] === tw) return same ? '偏财' : '正财';
      if (KE[tw] === dw) return same ? '七杀' : '正官';
      return '?';
    }

    function ctxOf(data) {
      var four = [data.nian, data.yue, data.ri, data.shi];
      var yuan = [data.tai, data.ming, data.shen];
      if (!yuan[0] || !yuan[0].gan) {
        yuan = [taiYuan(data.yue.gan, data.yue.zhi),
                mingGong(data.yue.zhi, data.shi.zhi, data.nian.gan),
                shenGong(data.yue.zhi, data.shi.zhi, data.nian.gan)];
      }
      return ctxOf7(four, yuan);
    }

    // four/yuan 都是 {gan,zhi}；st/br/ss 保持四柱（老判据只看四柱），
    // st7/br7/ss7 含三垣，供「七柱」「全盘」口径使用
    function ctxOf7(four, yuan) {
      var all = four.concat(yuan);
      var st = [], br = [];
      for (var i = 0; i < all.length; i++) { st.push(all[i].gan); br.push(all[i].zhi); }
      var riGan = four[2].gan;
      var ssAll = [];
      for (var j = 0; j < st.length; j++) ssAll.push(ss(riGan, st[j]));
      return { st: st.slice(0, 4), br: br.slice(0, 4), ss: ssAll.slice(0, 4),
               st7: st, br7: br, ss7: ssAll, riGan: riGan };
    }

    // ---------- 判据：返回 { evidence, score } 或 null ----------
    function touTest(min, pos, exact) {
      return function(ctx) {
        var best = null;
        for (var i = 0; i < 4; i++) {
          if (pos != null && i !== pos) continue;
          var cg = CANG_GAN[ctx.br[i]] || [];
          var hit = [];
          for (var j = 0; j < cg.length; j++) {
            if (ctx.st.indexOf(cg[j]) >= 0 && hit.indexOf(cg[j]) < 0) hit.push(cg[j]);
          }
          if (hit.length >= min && (!best || hit.length > best.hit.length)) {
            best = { i: i, cg: cg, hit: hit };
          }
        }
        if (!best) return null;
        if (exact && best.hit.length !== min) return null;
        return {
          evidence: POS[best.i] + '支' + ctx.br[best.i] + '藏' + best.cg.join('') +
                    '，天干见' + best.hit.join('、') + ' → ' + (CN_NUM[best.hit.length] || best.hit.length) + '透',
          score: best.hit.length
        };
      };
    }

    function quanTest(pos) {
      return function(ctx) {
        var best = null;
        for (var i = 0; i < 4; i++) {
          if (pos != null && i !== pos) continue;
          var cg = CANG_GAN[ctx.br[i]] || [];
          if (cg.length < 2) continue;
          var all = true;
          for (var j = 0; j < cg.length; j++) {
            if (ctx.st.indexOf(cg[j]) < 0) { all = false; break; }
          }
          if (all && (!best || cg.length > best.cg.length)) best = { i: i, cg: cg };
        }
        if (!best) return null;
        return {
          evidence: POS[best.i] + '支' + ctx.br[best.i] + '藏' + best.cg.join('') +
                    '，' + best.cg.length + ' 颗藏干全部透干',
          score: best.cg.length
        };
      };
    }

    function shishenTest(targets, min, pos, exact) {
      return function(ctx) {
        var hit = [];
        for (var i = 0; i < 4; i++) {
          if (pos != null && i !== pos) continue;
          if (targets.indexOf(ctx.ss[i]) >= 0) hit.push(POS[i] + '干' + ctx.st[i]);
        }
        if (exact ? hit.length !== min : hit.length < min) return null;
        var nm = targets.length > 1 ? targets.join('/') : targets[0];
        return { evidence: '天干' + nm + '×' + hit.length + '（' + hit.join('、') + '）', score: hit.length };
      };
    }

    var FANGWEI = { '木':'东方', '火':'南方', '金':'西方', '水':'北方' };

    function tripleTest(groups, kind) {
      return function(ctx) {
        var g = pickGroup(groups, ctx);
        if (!g) return null;
        var posTxt = [];
        for (var i = 0; i < g.zhi.length; i++) {
          posTxt.push(POS[ctx.br.indexOf(g.zhi[i])] + '支' + g.zhi[i]);
        }
        var tail = kind === 'hui' ? ('会' + FANGWEI[g.wx] + g.wx) : ('合' + g.wx + '局');
        return {
          evidence: '地支' + g.zhi.join('') + '三' + tail + '（' + posTxt.join('、') + '）',
          score: g.zhi.length
        };
      };
    }

    function pickGroup(groups, ctx) {
      for (var i = 0; i < groups.length; i++) {
        var ok = true;
        for (var j = 0; j < groups[i].zhi.length; j++) {
          if (ctx.br.indexOf(groups[i].zhi[j]) < 0) { ok = false; break; }
        }
        if (ok) return groups[i];
      }
      return null;
    }

    function wuheTest() {
      return function(ctx) {
        for (var p = 0; p < HE5.length; p++) {
          var ia = ctx.st.indexOf(HE5[p].a), ib = ctx.st.indexOf(HE5[p].b);
          if (ia >= 0 && ib >= 0) {
            return {
              evidence: '天干' + HE5[p].a + HE5[p].b + '合' + HE5[p].wx +
                        '（' + POS[ia] + '干' + HE5[p].a + '、' + POS[ib] + '干' + HE5[p].b + '）',
              score: 1
            };
          }
        }
        return null;
      };
    }

    function duoTest(setA, setB, label) {
      return function(ctx) {
        var hitA = [], hitB = [];
        for (var i = 0; i < 4; i++) {
          if (setA.indexOf(ctx.ss[i]) >= 0) hitA.push(POS[i] + '干' + ctx.st[i]);
          if (setB.indexOf(ctx.ss[i]) >= 0) hitB.push(POS[i] + '干' + ctx.st[i]);
        }
        if (!hitA.length || !hitB.length) return null;
        return {
          evidence: label + '：' + hitA.join('、') + ' ＋ ' + hitB.join('、'),
          score: hitA.length + hitB.length
        };
      };
    }

    function chongTest() {
      return function(ctx) {
        for (var p = 0; p < CHONG.length; p++) {
          var ia = ctx.br.indexOf(CHONG[p][0]), ib = ctx.br.indexOf(CHONG[p][1]);
          if (ia >= 0 && ib >= 0) {
            return {
              evidence: '地支' + CHONG[p][0] + CHONG[p][1] + '相冲（' +
                        POS[ia] + '支' + CHONG[p][0] + '、' + POS[ib] + '支' + CHONG[p][1] + '）',
              score: 1
            };
          }
        }
        return null;
      };
    }

    // 通根口径：天干五行在地支藏干中出现即算有根（本气/中气/余气同五行都算，一个地支算一处）
    function rootPlaces(ctx, i, n) {
      var wx = WU_XING[ctx.st7[i]];
      var out = [];
      for (var j = 0; j < n; j++) {
        var cg = CANG_GAN[ctx.br7[j]] || [];
        for (var k = 0; k < cg.length; k++) {
          if (WU_XING[cg[k]] === wx) { out.push({ j: j, gan: cg[k] }); break; }
        }
      }
      return out;
    }

    function rootTest(spec) {
      var mode = spec.mode || 'none';
      var n = spec.scope === 'seven' ? 7 : 4;
      var scopeTxt = n === 7 ? '七柱' : '四柱';
      return function(ctx) {
        var idx = [];
        if (spec.pos != null) idx.push(spec.pos);
        else for (var i = 0; i < n; i++) idx.push(i);
        var rooted = [], bare = [];
        for (var q = 0; q < idx.length; q++) {
          var rp = rootPlaces(ctx, idx[q], n);
          if (rp.length) rooted.push({ i: idx[q], rp: rp }); else bare.push(idx[q]);
        }
        var fmt = function(x) {
          return POS7[x.i] + '干' + ctx.st7[x.i] + '得' +
            x.rp.map(function(p) { return POS7[p.j] + '支' + ctx.br7[p.j] + '藏' + p.gan; }).join('、') + '为根';
        };
        var stemsTxt = idx.map(function(i2) { return ctx.st7[i2]; }).join('');
        if (mode === 'none') {
          if (rooted.length) return null;
          return { evidence: scopeTxt + '天干' + stemsTxt + ' 全无根（' + scopeTxt +
                   '地支藏干里没有同五行）', score: idx.length };
        }
        if (mode === 'all') {
          if (bare.length) return null;
          return { evidence: scopeTxt + '天干全部有根（' + rooted.map(fmt).join('；') + '）',
                   score: rooted.length };
        }
        var min = parseInt(spec.min, 10) || 1;
        if (mode === 'count' && rooted.length < min) return null;
        if (!rooted.length) return null;
        return { evidence: '天干有根 ' + rooted.length + ' 个（' + rooted.map(fmt).join('；') + '）',
                 score: rooted.length };
      };
    }

    function wxCountTest(spec) {
      var scopeN = spec.scope === 'seven' ? 7 : 4;
      var where = spec.where || 'any';
      var wxs = (spec.wxs && spec.wxs.length) ? spec.wxs : ['木','火','土','金','水'];
      var scopeTxt = scopeN === 7 ? '七柱' : '四柱';
      return function(ctx) {
        var hits = [];
        for (var w = 0; w < wxs.length; w++) {
          var wx = wxs[w], num = 0;
          if (where === 'gan' || where === 'any') {
            for (var i = 0; i < scopeN; i++) if (WU_XING[ctx.st7[i]] === wx) num++;
          }
          if (where === 'zhi' || where === 'any') {
            for (var j = 0; j < scopeN; j++) if (WU_XING[ctx.br7[j]] === wx) num++;
          }
          if (where === 'cang') {
            for (var k = 0; k < scopeN; k++) {
              var cg = CANG_GAN[ctx.br7[k]] || [];
              for (var m = 0; m < cg.length; m++) if (WU_XING[cg[m]] === wx) num++;
            }
          }
          hits.push({ wx: wx, n: num });
        }
        var whereTxt = where === 'gan' ? '天干' : where === 'zhi' ? '地支' : where === 'cang' ? '地支藏干' : '天干地支';
        var listTxt = hits.map(function(h) { return h.wx + '×' + h.n; }).join('、');
        if (spec.mode === 'none') {
          for (var q = 0; q < hits.length; q++) if (hits[q].n) return null;
          return { evidence: scopeTxt + whereTxt + '里没有' + wxs.join('、') + '（' + listTxt + '）',
                   score: wxs.length };
        }
        var min = parseInt(spec.min, 10) || 1;
        for (var p = 0; p < hits.length; p++) if (hits[p].n < min) return null;
        return { evidence: scopeTxt + whereTxt + '（' + listTxt + '）', score: min };
      };
    }

    function stemsTest(set) {
      return function(ctx) {
        var posTxt = [];
        for (var i = 0; i < set.length; i++) {
          var k = ctx.st.indexOf(set[i]);
          if (k < 0) return null;
          posTxt.push(POS[k] + '干' + set[i]);
        }
        return { evidence: '天干见' + set.join('、') + '（' + posTxt.join('、') + '）', score: set.length };
      };
    }

    function branchesTest(set) {
      return function(ctx) {
        var posTxt = [];
        for (var i = 0; i < set.length; i++) {
          var k = ctx.br.indexOf(set[i]);
          if (k < 0) return null;
          posTxt.push(POS[k] + '支' + set[i]);
        }
        return { evidence: '地支见' + set.join('、') + '（' + posTxt.join('、') + '）', score: set.length };
      };
    }

    function brtouTest(br, gans, pos) {
      return function(ctx) {
        var bi = ctx.br.indexOf(br);
        if (bi < 0) return null;
        if (pos != null && bi !== pos) return null;
        var cg = CANG_GAN[br] || [];
        var posTxt = [];
        for (var i = 0; i < gans.length; i++) {
          if (cg.indexOf(gans[i]) < 0) return null;
          var k = ctx.st.indexOf(gans[i]);
          if (k < 0) return null;
          posTxt.push(POS[k] + '干' + gans[i]);
        }
        return { evidence: '地支' + br + '藏' + cg.join('') + '，透' + gans.join('、') +
                          '（' + posTxt.join('、') + '）', score: gans.length };
      };
    }

    function andTest(subs) {
      return function(ctx) {
        var ev = [], score = 0;
        for (var i = 0; i < subs.length; i++) {
          var r = subs[i].test(ctx);
          if (!r) return null;
          ev.push(r.evidence);
          score += r.score;
        }
        return { evidence: ev.join(' ＋ '), score: score };
      };
    }

    // ---------- 描述 → 规格 ----------
    // 归一化：全角转半角、常见繁体转简体、去空白，让「兩」「時」「傷官」照样听懂
    var FAN_JIAN = { '兩':'两','個':'个','幹':'干','殺':'杀','梟':'枭','傷':'伤','財':'财',
      '沖':'冲','會':'会','時':'时','見':'见','雜':'杂','這':'这','裡':'里','雙':'双',
      '單':'单','條':'条','祿':'禄','絕':'绝','歲':'岁','運':'运','與':'与','還':'还',
      '號':'号','樣':'样','種':'种','發':'发','點':'点','開':'开','關':'关','後':'后',
      '數':'数','顆':'颗','幹':'干','支':'支','無':'无','盤':'盘','氣':'气','麼':'么','嗎':'吗' };
    var POS_CHAR = { '年':0, '月':1, '日':2, '时':3 };

    function norm(s) {
      var t = String(s == null ? '' : s);
      t = t.replace(/[\uFF01-\uFF5E]/g, function(ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
      });
      t = t.replace(/[\u4e00-\u9fa5]/g, function(ch) { return FAN_JIAN[ch] || ch; });
      return t.replace(/[\s\u3000]+/g, '');
    }

    function cnt(t) {
      var m = t.match(/([2-9])/);
      if (m) return parseInt(m[1], 10);
      if (t.indexOf('四') >= 0) return 4;
      if (t.indexOf('三') >= 0) return 3;
      if (/[两二双]/.test(t)) return 2;
      if (t.indexOf('多') >= 0) return 2;
      return null;
    }

    // 柱位限定：时支 / 月干 / 月柱
    function posOf(t) {
      var m = t.match(/([年月日时])(柱|干|支)/);
      return m ? { i: POS_CHAR[m[1]], part: m[2] } : null;
    }

    function isExact(t) { return /正好|恰好|刚好|仅仅|仅有|只有|不多不少|正好有/.test(t); }

    var TG_ALIAS = [
      ['七杀','七杀'],['偏官','七杀'],['正官','正官'],['官星','正官'],
      ['伤官','伤官'],['食神','食神'],['偏印','枭神'],['枭神','枭神'],['枭印','枭神'],
      ['正印','正印'],['印星','正印'],['印绶','正印'],['偏财','偏财'],['正财','正财'],
      ['财星','正财'],['比肩','比肩'],['劫财','劫财'],['杀','七杀'],['官','正官'],
      ['印','正印'],['财','正财'],['食','食神'],['比','比肩'],['劫','劫财'],['枭','枭神']
    ];

    // 十神组：食伤 / 财星 / 印星 / 官杀 / 比劫
    var TG_SETS = [
      ['比肩劫财', ['比肩','劫财']], ['劫财比肩', ['比肩','劫财']], ['比劫', ['比肩','劫财']],
      ['食神伤官', ['食神','伤官']], ['伤官食神', ['食神','伤官']], ['食伤', ['食神','伤官']],
      ['正财偏财', ['正财','偏财']], ['偏财正财', ['正财','偏财']], ['财星', ['正财','偏财']],
      ['正印枭神', ['正印','枭神']], ['枭神正印', ['正印','枭神']], ['印星', ['正印','枭神']],
      ['印绶', ['正印','枭神']],
      ['正官七杀', ['正官','七杀']], ['七杀正官', ['正官','七杀']],
      ['官杀', ['正官','七杀']], ['官煞', ['正官','七杀']]
    ];

    var SET_NAME = { '比肩劫财':'比劫','劫财比肩':'比劫','比劫':'比劫',
      '食神伤官':'食伤','伤官食神':'食伤','食伤':'食伤',
      '正财偏财':'财星','偏财正财':'财星','财星':'财星',
      '正印枭神':'印星','枭神正印':'印星','印星':'印星','印绶':'印星',
      '正官七杀':'官杀','七杀正官':'官杀','官杀':'官杀','官煞':'官杀' };

    function tgOf(t) {
      for (var i = 0; i < TG_ALIAS.length; i++) {
        if (t.indexOf(TG_ALIAS[i][0]) >= 0) return TG_ALIAS[i][1];
      }
      return null;
    }

    function targetsOf(t) {
      for (var i = 0; i < TG_SETS.length; i++) {
        if (t.indexOf(TG_SETS[i][0]) >= 0) {
          return { list: TG_SETS[i][1], name: SET_NAME[TG_SETS[i][0]] || TG_SETS[i][0] };
        }
      }
      var tg = tgOf(t);
      return tg ? { list: [tg], name: tg } : null;
    }

    // 「三合水局」「三会木局」按五行认局
    function groupByWx(groups, t) {
      var m = t.match(/([水木火金])/);
      if (!m) return [];
      for (var i = 0; i < groups.length; i++) if (groups[i].wx === m[1]) return [groups[i]];
      return [];
    }

    function wantedSets(t, groups) {
      var out = [];
      for (var i = 0; i < groups.length; i++) {
        var all = true;
        for (var j = 0; j < groups[i].zhi.length; j++) {
          if (t.indexOf(groups[i].zhi[j]) < 0) { all = false; break; }
        }
        if (all) out.push(groups[i]);
      }
      return out;
    }

    function labelTou(n) { return n >= 3 ? '一根透' + CN_NUM[n] + '干' : '一根透多干'; }

    // 单句解析：认不出返回 null，绝不硬猜
    function parseClause(t) {
      var n = cnt(t);
      var pos = posOf(t);
      var exact = isExact(t);

      // 通根 / 无根（整盘 或 指定柱位）
      var negRoot = /无根|没根|没有根|不带根|全无根|根都没有|根都无|无根气|根气全无/.test(t);
      var posRoot = !negRoot && /有根|通根|扎根|得根|根气/.test(t);
      if (negRoot || posRoot) {
        var rScope = /七柱|三垣|胎元|命宫|身宫/.test(t) ? 'seven' : 'four';
        var rPos = pos && pos.part !== '支' ? pos.i : null;
        if (rPos == null && /日主|日元/.test(t)) rPos = 2;
        var rn = cnt(t);
        var rMode = negRoot ? 'none' : (rn ? 'count' : (/全部|都|全|皆|个个|每|各/.test(t) ? 'all' : 'any'));
        var rScopeTxt = rScope === 'seven' ? '七柱' : '四柱';
        var rTgt = rPos != null ? POS7[rPos] + '干' : rScopeTxt + '天干';
        var rLabel = negRoot ? (rTgt + '全无根')
          : rMode === 'all' ? (rTgt + '全部有根')
          : rMode === 'count' ? (rTgt + '有根 ' + rn + ' 个')
          : (rTgt + '有根');
        var rDetail = negRoot
          ? (rTgt + '的五行，在' + rScopeTxt + '地支藏干里一处都找不到同五行')
          : rMode === 'all' ? (rTgt + '每一干都能在地支藏干里找到同五行（逐个通根）')
          : rMode === 'count' ? (rTgt + '中至少 ' + rn + ' 个天干在地支藏干里有同五行')
          : (rTgt + '中至少一个天干在地支藏干里有同五行');
        if (rScope === 'seven') rDetail += '（七柱＝四柱＋胎元/命宫/身宫）';
        return { ok: true, id: 'root', mode: rMode, scope: rScope, pos: rPos,
                 min: rn || 1, label: rLabel, raw: t, detail: rDetail };
      }

      // 五行分布（缺木 / 一个金都没有 / 地支无水）
      var wxMiss = t.match(/(?:缺|无|沒|没|没有|不带|不见|一个都?没有|全无)(金|木|水|火|土)/)
                || t.match(/(金|木|水|火|土)(?:都没有|都无|全无|缺|一个都没有)/);
      if (wxMiss && !/根|透|合|冲|刑|害|局|神|星|财|官|印|食|伤|比|劫|杀|枭|刃/.test(t.replace(wxMiss[0], ''))) {
        var wxChar = wxMiss[1];
        var wWhere = /藏干/.test(t) ? 'cang' : /天干/.test(t) ? 'gan' : /地支/.test(t) ? 'zhi' : 'any';
        var wScope = /七柱|三垣|胎元|命宫|身宫/.test(t) ? 'seven' : 'four';
        var wScopeTxt = wScope === 'seven' ? '七柱' : '四柱';
        var wWhereTxt = wWhere === 'gan' ? '天干' : wWhere === 'zhi' ? '地支'
                      : wWhere === 'cang' ? '地支藏干' : '天干地支';
        return { ok: true, id: 'wx', wxs: [wxChar], where: wWhere, mode: 'none',
                 scope: wScope, label: wScopeTxt + wWhereTxt + '缺' + wxChar, raw: t,
                 detail: wScopeTxt + wWhereTxt + '里找不到' + wxChar
                        + (wScope === 'seven' ? '（七柱＝四柱＋胎元/命宫/身宫）' : '') };
      }

      if (/全透|一柱全透|藏干全现/.test(t)) {
        return { ok: true, id: 'quan', n: 'all', label: '一柱全透', raw: t,
                 pos: pos ? pos.i : null,
                 detail: '某个地支的藏干（≥2 颗）全部出现在四柱天干' };
      }
      if (/透.{0,4}最多|最多.{0,4}透|极值|最强|最猛/.test(t)) {
        return { ok: true, id: 'toumax', n: 1, label: '一根透最多干', raw: t,
                 detail: '在范围内找「一支藏干透出最多」的命盘（极值）' };
      }
      if (/官杀混杂|官煞混杂|官杀混|官杀两见|官杀同透/.test(t)) {
        return { ok: true, id: 'guansha', label: '官杀混杂', raw: t,
                 detail: '正官与七杀同时出现在四柱天干' };
      }
      if (/食伤生财|伤官生财|食神生财/.test(t)) {
        return { ok: true, id: 'shishang', label: '食伤生财', raw: t,
                 detail: '食神/伤官与财星同时透干' };
      }
      if (/官印相生|杀印相生|煞印相生|印绶相生/.test(t)) {
        return { ok: true, id: 'guanyin', label: '官印相生', raw: t,
                 detail: '官杀与印星同时透干' };
      }
      if (t.indexOf('三合') >= 0) {
        var hs = wantedSets(t, SANHE);
        if (!hs.length) hs = groupByWx(SANHE, t);
        return { ok: true, id: 'sanhe', sets: hs, raw: t,
                 label: hs.length ? hs[0].zhi.join('') + '三合' + hs[0].wx + '局' : '三合局',
                 detail: '四柱地支凑齐 ' + (hs.length ? hs[0].zhi.join('') : '申子辰/亥卯未/寅午戌/巳酉丑') };
      }
      if (t.indexOf('三会') >= 0) {
        var hu = wantedSets(t, SANHUI);
        if (!hu.length) hu = groupByWx(SANHUI, t);
        return { ok: true, id: 'sanhui', sets: hu, raw: t,
                 label: hu.length ? hu[0].zhi.join('') + '三会' + hu[0].wx + '方' : '三会方',
                 detail: '四柱地支凑齐 ' + (hu.length ? hu[0].zhi.join('') : '寅卯辰/巳午未/申酉戌/亥子丑') };
      }
      if (/五合|天干.{0,2}合/.test(t)) {
        return { ok: true, id: 'wuhe', label: '天干五合', raw: t,
                 detail: '天干出现甲己/乙庚/丙辛/丁壬/戊癸之一' };
      }
      if (/相冲|六冲|对冲/.test(t) || (t.indexOf('冲') >= 0 && t.indexOf('透') < 0)) {
        return { ok: true, id: 'liuchong', label: '地支相冲', raw: t,
                 detail: '四柱地支中出现一组六冲' };
      }

      // 点名干支：天干见甲丙 / 地支见子辰 / 寅透甲丙戊
      var mStem = t.match(/天干(?:中|上|里|内)?(?:见|有|含|出现|是|透出)([甲乙丙丁戊己庚辛壬癸]{2,4})/);
      if (mStem) {
        return { ok: true, id: 'stems', set: mStem[1].split(''), label: '天干见' + mStem[1], raw: t,
                 detail: '四柱天干中同时出现 ' + mStem[1].split('').join('、') };
      }
      var mBr = t.match(/地支(?:中|上|里|内)?(?:见|有|含|出现|是)([子丑寅卯辰巳午未申酉戌亥]{2,4})/);
      if (mBr) {
        return { ok: true, id: 'branches', set: mBr[1].split(''), label: '地支见' + mBr[1], raw: t,
                 detail: '四柱地支中同时出现 ' + mBr[1].split('').join('、') };
      }
      var mBT = t.match(/([子丑寅卯辰巳午未申酉戌亥])(?:支|中|里|的藏干|藏干)?(?:藏)?透(?:出)?([甲乙丙丁戊己庚辛壬癸]{1,4})/);
      if (mBT) {
        return { ok: true, id: 'brtou', br: mBT[1], gans: mBT[2].split(''),
                 pos: pos ? pos.i : null,
                 label: mBT[1] + '透' + mBT[2], raw: t,
                 detail: '地支' + mBT[1] + '的藏干 ' + mBT[2].split('').join('、') + ' 全部透到四柱天干' };
      }

      var targets = targetsOf(t);
      if (targets && (/透|双|两|见|干|多|出现|有/.test(t) || (pos && pos.part !== '支'))) {
        var sn = n == null ? 1 : Math.min(4, n);
        var nm = targets.name;
        var at = (pos && pos.part !== '支')
          ? (POS[pos.i] + (pos.part === '柱' ? '柱' : '干'))
          : '';
        var lab = at ? (at + nm + (n != null && sn > 1 ? '×' + sn : ''))
                     : (nm + '透' + (sn > 1 ? CN_NUM[sn] + '干' : '干'));
        return { ok: true, id: 'shishen', targets: targets.list, target: targets.list[0], n: sn,
                 exact: exact, pos: pos ? pos.i : null, raw: t, label: lab,
                 detail: at ? (at + '天干' + nm + '×' + sn)
                           : ('四柱天干中' + nm + (exact ? '正好' : '') + '出现 ' +
                              (exact ? '=' : '≥') + sn + ' 次') };
      }
      if (t.indexOf('透') >= 0 || t.indexOf('藏干') >= 0) {
        var tn = n == null ? 2 : Math.min(3, Math.max(1, n === 'all' ? 3 : n));
        return { ok: true, id: 'tou', n: tn, pos: pos ? pos.i : null, exact: exact, raw: t,
                 label: labelTou(tn),
                 detail: '某个地支的藏干中 ' + (exact ? '正好' : '≥') + tn + ' 颗同时透到四柱天干' };
      }
      return null;
    }

    // 多特征用 + 、 ， 且 和 同时 连接；「不冲」作排除条件
    function splitClauses(t) {
      var out = t.split(/[+、,;，；]|并且|而且|同时|以及|还有|且|又|和|跟/);
      var res = [];
      for (var i = 0; i < out.length; i++) if (out[i]) res.push(out[i]);
      return res;
    }

    function suggest(t) {
      var table = [
        [/全透/, '一柱全透'], [/冲/, '地支相冲'], [/合/, '申子辰三合'], [/会/, '三会方'],
        [/混杂/, '官杀混杂'], [/生财/, '食伤生财'], [/官印|杀印/, '官印相生'],
        [/官/, '正官透两头'], [/杀|煞/, '七杀透两头'], [/印/, '印星透两头'],
        [/财/, '财星透两头'], [/食|伤/, '食神透两头'], [/比|劫/, '比肩透两头'],
        [/透|藏干/, '一根透多干'], [/多/, '一根透最多']
      ];
      var out = [];
      for (var i = 0; i < table.length; i++) {
        if (table[i][0].test(t) && out.indexOf(table[i][1]) < 0) out.push(table[i][1]);
      }
      if (!out.length) {
        out = ['一根透多干', '七杀透两头', '申子辰三合'];
      } else if (out.length === 1) {
        out.push('一根透多干');
      }
      return out.slice(0, 3);
    }

    function parse(text) {
      var raw = String(text == null ? '' : text);
      var t = norm(raw);
      if (!t) return { ok: false, id: '', detail: '请输入要生成的特征', raw: raw, suggest: [] };
      var nots = [];
      var g = null;
      if (/坤造|女命|女性/.test(t)) g = '女';
      else if (/乾造|男命|男性/.test(t)) g = '男';
      if (g) t = t.replace(/坤造|乾造|女命|男命|女性|男性/g, '');
      if (/不冲|无冲|没有冲|不喜冲|不见冲/.test(t)) {
        nots.push('liuchong');
        t = t.replace(/不冲|无冲|没有冲|不喜冲|不见冲/g, '');
      }
      var clauses = splitClauses(t);
      var parts = [];
      for (var i = 0; i < clauses.length; i++) {
        var p = parseClause(clauses[i]);
        if (p) parts.push(p);
      }
      if (!parts.length) {
        var sg = suggest(clauses[0] || t);
        return { ok: false, id: '', raw: raw, suggest: sg,
                 detail: '没认出这个说法' + (sg.length ? '，是不是想说「' + sg[0] + '」' : '') };
      }
      if (parts.length === 1) {
        var one = parts[0];
        one.raw = raw;
        if (nots.length) one.not = nots;
        if (g) one.gender = g;
        return one;
      }
      var multi = { ok: true, id: 'and', parts: parts, not: nots, raw: raw,
               label: parts.map(function(x) { return x.label; }).join(' + '),
               detail: parts.map(function(x) { return x.detail; }).join('；') };
      if (g) multi.gender = g;
      return multi;
    }

    var HELP = [
      '一根透多干 / 一根透三干',
      '一柱全透 · 一根透最多',
      '七杀透两头 / 官杀透两干 / 七杀正好两个',
      '月柱七杀 / 时干正官（限定柱位）',
      '寅透甲丙戊 / 天干见甲丙 / 地支见子辰（点名干支）',
      '三合局 / 申子辰三合 / 三会方 / 巳午未三会',
      '天干五合 / 官杀混杂 / 食伤生财 / 官印相生 / 地支相冲',
      '七柱天干全无根 / 日干无根 / 天干全部有根（通根口径）',
      '缺木 / 一个金都没有 / 地支无水（五行分布）',
      '多特征用 + 连：申子辰三合 + 官杀混杂',
      '加「不冲」排除相冲'
    ];

    // ---------- 规格 → 可执行判据 ----------
    function compileCore(spec) {
      var n = spec.n;
      switch (spec.id) {
        case 'tou':
          return { label: labelTou(n), mode: 'first', test: touTest(n, spec.pos, spec.exact) };
        case 'toumax':
          return { label: '一根透最多干', mode: 'max', test: touTest(1) };
        case 'quan':
          return { label: '一柱全透', mode: 'max', test: quanTest(spec.pos) };
        case 'shishen':
          return { label: spec.label, mode: 'first',
                   test: shishenTest(spec.targets || [spec.target], n, spec.pos, spec.exact) };
        case 'root':
          return { label: spec.label || (spec.mode === 'none' ? '天干无根' : '天干有根'),
                   mode: spec.mode === 'count' ? 'max' : 'first',
                   test: rootTest(spec) };
        case 'wx':
          return { label: spec.label || '五行分布', mode: 'first', test: wxCountTest(spec) };
        case 'stems':
          return { label: spec.label, mode: 'first', test: stemsTest(spec.set) };
        case 'branches':
          return { label: spec.label, mode: 'first', test: branchesTest(spec.set) };
        case 'brtou':
          return { label: spec.label, mode: 'first', test: brtouTest(spec.br, spec.gans, spec.pos) };
        case 'sanhe':
          return { label: spec.label || '三合局', mode: 'first',
                   test: tripleTest(spec.sets && spec.sets.length ? spec.sets : SANHE, 'he') };
        case 'sanhui':
          return { label: spec.label || '三会方', mode: 'first',
                   test: tripleTest(spec.sets && spec.sets.length ? spec.sets : SANHUI, 'hui') };
        case 'wuhe':
          return { label: '天干五合', mode: 'first', test: wuheTest() };
        case 'guansha':
          return { label: '官杀混杂', mode: 'first', test: duoTest(['正官'], ['七杀'], '官杀混杂') };
        case 'shishang':
          return { label: '食伤生财', mode: 'first', test: duoTest(['食神','伤官'], ['正财','偏财'], '食伤生财') };
        case 'guanyin':
          return { label: '官印相生', mode: 'first', test: duoTest(['正官','七杀'], ['正印','枭神'], '官印相生') };
        case 'liuchong':
          return { label: '地支相冲', mode: 'first', test: chongTest() };
        case 'and':
          var subs = [];
          for (var si = 0; si < spec.parts.length; si++) {
            var c = compile(spec.parts[si]);
            if (!c) return null;
            subs.push(c);
          }
          var hasMax = false;
          for (var mi = 0; mi < subs.length; mi++) if (subs[mi].mode === 'max') hasMax = true;
          return { label: spec.label, mode: hasMax ? 'max' : 'first', test: andTest(subs) };
        default:
          return null;
      }
    }

    function applyNot(P, nots) {
      for (var i = 0; i < nots.length; i++) {
        if (nots[i] === 'liuchong') {
          P.test = (function(base, ct) {
            return function(ctx) { return ct(ctx) ? null : base(ctx); };
          })(P.test, chongTest());
          P.label += '（不冲）';
        }
      }
      return P;
    }

    function compile(spec) {
      var P = compileCore(spec);
      if (P && spec && spec.not && spec.not.length) P = applyNot(P, spec.not);
      return P;
    }

    function verify(y, m, d, h, gender, P) {
      var full;
      try { full = paipan('', gender, y, m, d, h, 0); } catch (e) { return null; }
      if (!full || !full.ri || !full.nian) return null;
      var r = P.test(ctxOf(full));
      return r ? { score: r.score, evidence: r.evidence, data: full } : null;
    }

    function pack(y, m, d, h, gender, v, P, tried) {
      return {
        ok: true, y: y, m: m, d: d, h: h, mi: 0, gender: gender,
        data: v.data, evidence: v.evidence, score: v.score,
        label: P.label, tried: tried
      };
    }

    // opt: { gender, startYear, endYear, name }
    function scan(spec, opt) {
      opt = opt || {};
      var P = compile(spec);
      if (!P) return { ok: false, tried: 0, label: '', reason: '特征无法编译' };
      var gender = opt.gender === '女' ? '女' : '男';
      var sY = parseInt(opt.startYear, 10), eY = parseInt(opt.endYear, 10);
      if (!(sY >= 1000)) sY = 1960;
      if (!(eY >= 1000)) eY = 2026;
      sY = Math.max(1000, sY); eY = Math.min(2100, eY);
      if (eY < sY) { var sw = sY; sY = eY; eY = sw; }

      // 起点由描述文本散列决定（同一句话结果稳定，不同特征散落在整个年代范围里，
      // 避免每次都给同一天）；从起点年向后扫，越过年尾再回到起点年前。
      var today = new Date();
      var todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      var span = eY - sY + 1;
      var hk = 0, key = String(spec.raw || spec.id || '');
      for (var ki = 0; ki < key.length; ki++) hk = (hk * 131 + key.charCodeAt(ki)) % 99991;
      var variant = parseInt(opt.variant, 10) || 0;
      if (variant) hk = (hk + variant * 7919) % 99991;
      var startOff = hk % span;
      var tried = 0, best = null;
      var mOff = (hk >> 3) % 12, dOff = (hk >> 5) % 28, hOff = (hk >> 7) % 12;
      for (var yi = 0; yi < span; yi++) {
        var y = sY + ((startOff + yi) % span);
        for (var mi = 0; mi < 12; mi++) {
          var mo = ((mOff + mi) % 12) + 1;
          var last = new Date(y, mo, 0).getDate();
          for (var di = 0; di < last; di++) {
            var d = ((dOff + di) % last) + 1;
            if (y * 10000 + mo * 100 + d > todayKey) continue; // 不造未出生日期的盘
            // 一日一次完整排盘拿到年/月/日三柱（立春、节气换月由 paipan 内部处理），
            // 时柱按时辰用五鼠遁补，命中后再用完整 paipan 复核边界日
            var base = paipan('', gender, y, mo, d, 0, 0);
            var riGan = base.ri.gan;
            for (var hi0 = 0; hi0 < 12; hi0++) {
              var hi = (hOff + hi0) % 12;
              var h = hi * 2;
              var hp = hourPillar(riGan, h);
              var ctx = ctxOf7([base.nian, base.yue, base.ri, hp],
                [taiYuan(base.yue.gan, base.yue.zhi),
                 mingGong(base.yue.zhi, hp.zhi, base.nian.gan),
                 shenGong(base.yue.zhi, hp.zhi, base.nian.gan)]);
              tried++;
              var r = P.test(ctx);
              if (!r) continue;
              if (P.mode !== 'max') {
                var v = verify(y, mo, d, h, gender, P);
                if (v) return pack(y, mo, d, h, gender, v, P, tried);
                continue;
              }
              if (best && r.score <= best.score) continue;
              var v2 = verify(y, mo, d, h, gender, P);
              if (v2 && v2.score >= r.score) {
                best = { y: y, m: mo, d: d, h: h, score: v2.score, evidence: v2.evidence, data: v2.data };
              }
            }
          }
        }
      }
      if (best) return pack(best.y, best.m, best.d, best.h, gender, best, P, tried);
      return { ok: false, tried: tried, label: P.label, reason: '该范围内没有找到符合条件的命盘' };
    }

    function matchAt(spec, y, m, d, h, gender) {
      var s = typeof spec === 'string' ? parse(spec) : spec;
      if (!s || !s.ok) return { ok: false };
      var P = compile(s);
      if (!P) return { ok: false };
      var v = verify(y, m, d, h, gender === '女' ? '女' : '男', P);
      return v ? { ok: true, evidence: v.evidence, score: v.score, label: P.label } : { ok: false };
    }

    var PATTERNS = [
      { text: '一根透多干', label: '一根透多干' },
      { text: '一根透三干', label: '一根透三干' },
      { text: '一柱全透', label: '一柱全透' },
      { text: '一根透最多', label: '一根透最多（极值）' },
      { text: '七杀透两头', label: '七杀透两头' },
      { text: '正官透两头', label: '正官透两头' },
      { text: '七杀正好两个', label: '七杀正好两个' },
      { text: '月柱七杀', label: '月柱七杀' },
      { text: '寅透甲丙戊', label: '寅透甲丙戊' },
      { text: '申子辰三合', label: '申子辰三合' },
      { text: '三会方', label: '三会方' },
      { text: '天干五合', label: '天干五合' },
      { text: '官杀混杂', label: '官杀混杂' },
      { text: '食伤生财', label: '食伤生财' },
      { text: '官印相生', label: '官印相生' },
      { text: '地支相冲', label: '地支相冲' },
      { text: '七柱天干全无根', label: '七柱天干全无根' },
      { text: '日干无根', label: '日干无根' },
      { text: '天干全部有根', label: '天干全部有根' },
      { text: '七柱缺金', label: '七柱缺金' },
      { text: '一个木都没有', label: '四柱缺木' },
      { text: '申子辰三合 + 官杀混杂', label: '三合 + 官杀混杂' }
    ];

    return {
      ss: ss, parse: parse, compile: compile, scan: scan, matchAt: matchAt,
      ctxOf: ctxOf, ctxOf7: ctxOf7, PATTERNS: PATTERNS, HELP: HELP,
      norm: norm, suggest: suggest, splitClauses: splitClauses,
      describe: function(spec) { var P = compile(spec); return P ? P.label : ''; }
    };
  })();

  // ===== 挂载到全局命名空间 =====
  window.ALGO = {
    monthDays: monthDays,
    normalizeDate: normalizeDate,
    lunarToSolar: lunarToSolar,
    solarToLunar: solarToLunar,
    julianToGregorian: julianToGregorian,
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
    setTaiji: setTaiji,
    clearTaiji: clearTaiji,
    getTaiji: getTaiji,
    taijiStemLabel: taijiStemLabel,
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
    taiNianGZ: taiNianGZ,
    dzNum: dzNum,
    numZhi: numZhi,
    mingGong: mingGong,
    shenGong: shenGong,
    qiYunDays: qiYunDays,
    addYMDH: addYMDH,
    computeDaYun: computeDaYun,
    liuNianJZ: liuNianJZ,
    REN_YUAN: REN_YUAN,
    renYuanSiLing: renYuanSiLing,
    paipan: paipan,
    GEN: GEN,
    fmtDate: fmtDate,
    pad: pad,
    buildShunLabel: buildShunLabel,
  };
})();
