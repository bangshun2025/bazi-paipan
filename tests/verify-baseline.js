/* 真实档案生日↔排盘基准校验（防生日挂错人、防排盘算法漂移）
 *
 * 用法：
 *   node tests/verify-baseline.js --gen <备份.json>   从备份生成/刷新基准文件
 *   node tests/verify-baseline.js                     按基准逐盘校验，任一差异退出码 1
 *
 * 基准条目 confirmed=true 表示用户人工确认过生日本人与盘正确；
 * confirmed=false 仅用于防止算法/数据迁移导致的静默漂移。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'baseline-archives.json');

function loadAlgo() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'constants.js'), 'utf8'), sandbox, {filename: 'constants.js'});
  sandbox.CONST = sandbox.window.CONST;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'algorithm.js'), 'utf8'), sandbox, {filename: 'algorithm.js'});
  return sandbox.window.ALGO;
}

const P = (o) => (o ? o.gan + o.zhi : '');

function snapshotOf(ALGO, a) {
  const r = ALGO.paipan(a.name, a.gender, a.year, a.month, a.day, a.hour, a.min);
  return {
    bazi: [r.nian, r.yue, r.ri, r.shi].map(P).join(' '),
    sanyuan: [r.tai, r.ming, r.shen].map(P).join(' ')
  };
}

function entryOf(ALGO, a) {
  const snap = snapshotOf(ALGO, a);
  return {
    id: a.id,
    name: a.name,
    gender: a.gender,
    birth: {y: a.year, m: a.month, d: a.day, h: a.hour, mi: a.min, cal: a.calendarType || 'solar'},
    expect: snap,
    confirmed: false
  };
}

function gen(backupPath) {
  const ALGO = loadAlgo();
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const entries = backup.archives.map((a) => entryOf(ALGO, a));
  const known = {苓菲: true, 罗惠: true};
  for (const e of entries) if (known[e.name]) e.confirmed = true;
  fs.writeFileSync(BASELINE, JSON.stringify({generatedAt: new Date().toISOString(), source: path.basename(backupPath), entries}, null, 1));
  console.log('baseline written: ' + BASELINE + ' (' + entries.length + ' archives)');
}

function verify() {
  const ALGO = loadAlgo();
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  let fail = 0;
  for (const e of baseline.entries) {
    const got = snapshotOf(ALGO, {name: e.name, gender: e.gender, year: e.birth.y, month: e.birth.m, day: e.birth.d, hour: e.birth.h, min: e.birth.mi});
    const ok = got.bazi === e.expect.bazi && got.sanyuan === e.expect.sanyuan;
    if (!ok) {
      fail++;
      console.log('FAIL [' + (e.confirmed ? '已确认' : '未确认') + '] ' + e.name + ' ' + e.gender + ' ' + e.birth.y + '-' + e.birth.m + '-' + e.birth.d + ' ' + e.birth.h + ':' + e.birth.mi);
      console.log('  期望 ' + e.expect.bazi + ' | ' + e.expect.sanyuan);
      console.log('  实得 ' + got.bazi + ' | ' + got.sanyuan);
    }
  }
  const total = baseline.entries.length;
  console.log((total - fail) + '/' + total + ' 基准盘一致');
  if (fail > 0) process.exit(1);
}

if (process.argv[2] === '--gen') gen(process.argv[3]);
else verify();
