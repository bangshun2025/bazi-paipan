#!/usr/bin/env node
/**
 * v0.31.0 节气边界真值门禁：不依赖浏览器，直接加载 constants.js + algorithm.js，
 * 用独立真值源核对「显示层」与「月柱边界行为」。
 *
 * 独立真值源：
 *   · 香港天文台 24 节气（香港时间 = 北京时间）：2026 立春 02-04 04:02、2026 立夏 05-05 19:49
 *   · JPL DE421 + IAU2006 真黄道链：2026 立春 04:02:07、1987 立夏 05-06 09:05:34、2026 立夏 19:48:43
 *
 * 核心不变式（v0.23.4 曾被破坏、v0.31.0 修正）：
 *   节气表 getTime() 已是「BJT-as-UTC」（UTC 字段 = 北京钟表时间），与
 *   birthMs = Date.UTC(...) 同基准 → 月柱必须在节气**显示时刻那一分钟**换月。
 *   若有人再加/减 8 小时，通用边界扫描会立刻失败（8 小时窗口内月柱错月）。
 *
 * 用法：node scripts/check-term-truth.js [仓库根]
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const repo = process.argv[2] || '.';
const load = f => fs.readFileSync(path.join(repo, f), 'utf8');

const sandbox = { console };
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(load('constants.js'), sandbox);
vm.runInContext(load('algorithm.js'), sandbox);
const A = sandbox.ALGO;

let fails = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) { fails++; console.log(`  ❌ ${label}  实际 ${JSON.stringify(actual)} / 期望 ${JSON.stringify(expected)}`); }
  else console.log(`  ✅ ${label}`);
};

const bjt = st => `${st.getUTCFullYear()}-${String(st.getUTCMonth() + 1).padStart(2, '0')}-${String(st.getUTCDate()).padStart(2, '0')} ` +
  `${String(st.getUTCHours()).padStart(2, '0')}:${String(st.getUTCMinutes()).padStart(2, '0')}:${String(st.getUTCSeconds()).padStart(2, '0')}`;

const DZ = '子丑寅卯辰巳午未申酉戌亥';

console.log('【1/3】显示层 vs 独立真值（容差 60 秒）');
const DISPLAY_TRUTH = [
  [2026, 2, '2026-02-04 04:02:00', 'HKO 24节气 04:02 / DE421 04:02:07'],
  [2026, 8, '2026-05-05 19:49:00', 'HKO 24节气 19:49 / DE421 19:48:43'],
  [1987, 8, '1987-05-06 09:05:34', 'DE421 09:05:34'],
  [1988, 8, '1988-05-05 15:01:43', 'DE421 15:01:43'],
];
for (const [y, idx, truth, src] of DISPLAY_TRUTH) {
  const st = A.getSolarTerm(y, idx);
  const shown = Date.parse(bjt(st).replace(' ', 'T') + 'Z');
  const want = Date.parse(truth.replace(' ', 'T') + 'Z');
  const diff = Math.round((shown - want) / 1000);
  const label = `${y} ${bjt(st)}（真值 ${truth} · ${src}，差 ${diff}s）`;
  if (Math.abs(diff) > 60) { fails++; console.log(`  ❌ ${label}`); } else console.log(`  ✅ ${label}`);
}

// 换月发生在「覆盖节气时刻的那一分钟」：
// 节气 04:01:51 → 04:01 仍在旧月、04:02 起入新月（UI 输入粒度为分钟）
const termMs = st => Date.UTC(st.getUTCFullYear(), st.getUTCMonth(), st.getUTCDate(), st.getUTCHours(), st.getUTCMinutes(), st.getUTCSeconds());
const switchMs = st => {
  const s = st.getUTCSeconds();
  const ms = termMs(st);
  return s > 0 ? ms + (60 - s) * 1000 : ms;
};
const fmtMs = ms => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ` +
    `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};
const zhiAtMs = ms => {
  const d = new Date(ms);
  return A.monthPillar(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), '甲').zhi;
};

console.log('【2/3】通用边界扫描：12 节气 × 2 年 × 3 点（换月分钟前 1 分 / 换月分钟 / 其后 7h59m）');
// 与 algorithm.js 的 MONTH_TERM 同源（12 个「节」在 SOLAR_TERMS 中的序号）
const MONTH_TERM = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0];
for (const y of [1987, 2026]) {
  for (let i = 0; i < 12; i++) {
    const st = A.getSolarTerm(y, MONTH_TERM[i]);
    if (!st) { fails++; console.log(`  ❌ ${y} term#${MONTH_TERM[i]} 表外 null`); continue; }
    const wantZhi = DZ[(i + 2) % 12];
    const prevZhi = DZ[(i + 1) % 12];
    const sw = switchMs(st);
    const zPrev = zhiAtMs(sw - 60e3);
    const zNow = zhiAtMs(sw);
    const zAfter = zhiAtMs(sw + (7 * 3600 + 59 * 60) * 1000);
    if (!(zPrev === prevZhi && zNow === wantZhi && zAfter === wantZhi)) {
      fails++;
      console.log(`  ❌ ${y} ${bjt(st)}（换月分钟 ${fmtMs(sw)}）应入 ${wantZhi} 月：` +
        `前1分 ${zPrev}(期望${prevZhi}) / 换月分钟 ${zNow}(期望${wantZhi}) / 后7h59m ${zAfter}(期望${wantZhi})`);
    }
  }
  console.log(`  ${fails === 0 ? '✅' : '⚠️'} ${y} 年 12 个节气边界扫描完成`);
}

console.log('【3/3】锚点行为（含 v0.23.4 回归实例）');
check('2026立春04:01→丑月', A.monthPillar(2026, 2, 4, 4, 1, '乙').zhi, '丑');
check('2026立春04:02→庚寅', (m => m.gan + m.zhi)(A.monthPillar(2026, 2, 4, 4, 2, '丙')), '庚寅');
check('2026立春前年柱乙巳', (p => p.nian.gan + p.nian.zhi)(A.paipan('t', '男', 2026, 2, 4, 4, 1)), '乙巳');
check('2026立春后年柱丙午', (p => p.nian.gan + p.nian.zhi)(A.paipan('t', '男', 2026, 2, 4, 4, 2)), '丙午');
check('1987立夏09:05→甲辰', (m => m.gan + m.zhi)(A.monthPillar(1987, 5, 6, 9, 5, '丁')), '甲辰');
check('1987立夏09:06→乙巳', (m => m.gan + m.zhi)(A.monthPillar(1987, 5, 6, 9, 6, '丁')), '乙巳');
check('1987-05-06 06:30 人元司令含清明', A.renYuanSiLing(1987, 5, 6, 6, 30).indexOf('清明') >= 0, true);
check('1987-05-06 09:06 人元司令含立夏', A.renYuanSiLing(1987, 5, 6, 9, 6).indexOf('立夏') >= 0, true);
check('1988-05-05 23:00 男 起运∈[5,20]年', (p => p.qiYun.years >= 5 && p.qiYun.years <= 20)(A.paipan('t', '男', 1988, 5, 5, 23, 0)), true);
check('1988-03-05 17:00 男 月柱乙卯', (m => m.gan + m.zhi)(A.monthPillar(1988, 3, 5, 17, 0, '戊')), '乙卯');

console.log('-' .repeat(60));
if (fails === 0) { console.log('🎉 节气真值门禁全部通过'); process.exit(0); }
console.log(`⚠️  ${fails} 项失败：节气数据/边界存在偏差，禁止发布。`);
process.exit(1);
