// 八字排盘面板 — bazi-paipan · 从真版
// 通过 registerWorkspace + sidebar.nav 挂载，沿用原版纸质书卷风格
(function () {
  var TG = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var DZ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var WX = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
             '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水' };
  var WX_COLOR = { 木:'#2e8b3d', 火:'#c83a3a', 土:'#c8961f', 金:'#d97817', 水:'#2a6ec0' };

  var LOC = {
    '北京市':{cities:{'北京市':{lng:116.4,dist:['东城区','西城区','朝阳区','海淀区']}}},
    '上海市':{cities:{'上海市':{lng:121.47,dist:['黄浦区','徐汇区','浦东新区']}}},
    '天津市':{cities:{'天津市':{lng:117.2,dist:['和平区','河西区','南开区']}}},
    '重庆市':{cities:{'重庆市':{lng:106.55,dist:['渝中区','江北区','渝北区']}}},
    '广东省':{cities:{'广州市':{lng:113.26,dist:['天河区','越秀区']},'深圳市':{lng:114.06,dist:['福田区','南山区','罗湖区','宝安区']},'东莞市':{lng:113.75,dist:['东莞市']},'佛山市':{lng:113.12,dist:['禅城区','南海区']},'珠海市':{lng:113.58,dist:['香洲区']},'惠州市':{lng:114.42,dist:['惠城区']},'汕头市':{lng:116.68,dist:['龙湖区']}}},
    '广西':{cities:{'南宁市':{lng:108.37,dist:['青秀区','兴宁区','江南区','西乡塘区']},'柳州市':{lng:109.42,dist:['城中区','鱼峰区']},'桂林市':{lng:110.29,dist:['秀峰区','象山区','七星区']},'北海市':{lng:109.12,dist:['海城区']}}},
    '浙江省':{cities:{'杭州市':{lng:120.21,dist:['西湖区','上城区','拱墅区','滨江区']},'宁波市':{lng:121.54,dist:['海曙区','鄞州区']},'温州市':{lng:120.7,dist:['鹿城区']}}},
    '江苏省':{cities:{'南京市':{lng:118.8,dist:['玄武区','鼓楼区']},'苏州市':{lng:120.59,dist:['姑苏区','工业园区']},'无锡市':{lng:120.31,dist:['梁溪区']}}},
    '福建省':{cities:{'福州市':{lng:119.3,dist:['鼓楼区','台江区']},'厦门市':{lng:118.09,dist:['思明区','湖里区']}}},
    '山东省':{cities:{'济南市':{lng:117.0,dist:['历下区','市中区']},'青岛市':{lng:120.38,dist:['市南区','市北区']}}},
    '四川省':{cities:{'成都市':{lng:104.07,dist:['锦江区','青羊区','武侯区']}}},
    '湖北省':{cities:{'武汉市':{lng:114.3,dist:['江岸区','武昌区','洪山区']}}},
    '湖南省':{cities:{'长沙市':{lng:112.97,dist:['芙蓉区','天心区','岳麓区']}}},
    '河南省':{cities:{'郑州市':{lng:113.65,dist:['中原区','金水区']}}},
    '陕西省':{cities:{'西安市':{lng:108.94,dist:['雁塔区','碑林区','未央区']}}},
    '河北省':{cities:{'石家庄市':{lng:114.51,dist:['长安区']}}},
    '辽宁省':{cities:{'沈阳市':{lng:123.43,dist:['和平区']},'大连市':{lng:121.62,dist:['中山区']}}},
    '黑龙江省':{cities:{'哈尔滨市':{lng:126.64,dist:['道里区']}}},
    '吉林省':{cities:{'长春市':{lng:125.32,dist:['南关区']}}},
    '云南省':{cities:{'昆明市':{lng:102.71,dist:['五华区']}}},
    '贵州省':{cities:{'贵阳市':{lng:106.63,dist:['南明区']}}},
    '海南省':{cities:{'海口市':{lng:110.32,dist:['秀英区']},'三亚市':{lng:109.51,dist:['海棠区']}}},
    '安徽省':{cities:{'合肥市':{lng:117.23,dist:['蜀山区']}}},
    '江西省':{cities:{'南昌市':{lng:115.86,dist:['东湖区']}}},
    '山西省':{cities:{'太原市':{lng:112.55,dist:['小店区']}}},
    '甘肃省':{cities:{'兰州市':{lng:103.83,dist:['城关区']}}},
    '内蒙古':{cities:{'呼和浩特市':{lng:111.75,dist:['新城区']}}},
    '新疆':{cities:{'乌鲁木齐市':{lng:87.62,dist:['天山区']}}},
    '西藏':{cities:{'拉萨市':{lng:91.11,dist:['城关区']}}},
    '宁夏':{cities:{'银川市':{lng:106.23,dist:['兴庆区']}}},
    '青海省':{cities:{'西宁市':{lng:101.78,dist:['城中区']}}},
    '香港':{cities:{'香港':{lng:114.17,dist:[]}}},
    '澳门':{cities:{'澳门':{lng:113.55,dist:[]}}},
    '台湾':{cities:{'台北市':{lng:121.53,dist:[]}}}
  };

  function pad(n) { return n<10?'0'+n:''+n; }

  // === 样式（注入一次） ===
  var STYLE_ID = 'bazi-paipan-css';
  if (!document.getElementById(STYLE_ID)) {
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
.bz-page { max-width:1340px; margin:0 auto; background:#f5f0e8; border:1.5px solid #e0d8c8; border-radius:2px; padding:16px 18px 20px; box-shadow:0 1px 3px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.08); font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif; }
.bz-input-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #e0d8c8; }
.bz-input-row label { font-size:13px; color:#8b7e6a; white-space:nowrap; }
.bz-input-row input, .bz-input-row select { font-family:"Songti SC","SimSun",serif; font-size:14px; padding:4px 8px; border:1px solid #e0d8c8; border-radius:2px; background:#f5f0e8; color:#2c2416; }
.bz-input-row input[type=number] { width:52px; text-align:center; }
.bz-btn { padding:5px 16px; background:#2c2416; color:#f5f0e8; border:none; border-radius:2px; cursor:pointer; font-size:13px; letter-spacing:.1em; font-family:"Songti SC","SimSun",serif; }
.bz-btn:hover { background:#b5343a; }
.bz-chart { width:100%; min-width:680px; border-collapse:collapse; }
.bz-chart th, .bz-chart td { border:0.5px solid #e0d8c8; text-align:center; vertical-align:middle; font-family:"Songti SC","SimSun",serif; padding:3px 5px; }
.bz-chart td.rl, .bz-chart th.rl { width:48px; background:rgba(201,169,110,.06); font-size:14px; color:#8b7e6a; letter-spacing:.1em; }
.bz-chart tr.hd th { font-size:18px; color:#8b7e6a; font-weight:500; background:rgba(201,169,110,.04); padding:6px 3px; }
.bz-chart .sep { border-left:1.5px solid rgba(181,52,58,.4) !important; }
.bz-chart .rs td { font-size:18px; color:#2c2416; font-weight:500; }
.bz-chart .rg td { font-size:28px; font-weight:700; padding:1px 4px; line-height:1.1; }
.bz-chart .rh td { font-size:17px; color:#2c2416; line-height:1.6; padding:3px 4px; }
.bz-chart .rn td { font-size:17px; color:#8b7e6a; letter-spacing:.05em; }
.bz-chart .rm td { font-size:17px; color:#2c2416; padding:3px 3px; }
.bz-top-bar { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; border-bottom:1px solid #e0d8c8; padding-bottom:10px; }
.bz-person { font-family:"Songti SC","SimSun",serif; font-size:22px; color:#2c2416; letter-spacing:.08em; }
.bz-person b { font-size:26px; margin-right:6px; }
.bz-person .meta { color:#8b7e6a; font-size:17px; }
.bz-person .sex { font-family:"Songti SC","SimSun",serif; font-size:17px; color:#b5343a; margin-left:8px; }
.bz-body-cols { display:flex; gap:16px; align-items:flex-start; }
.bz-main-col { flex:0 0 auto; min-width:0; }
.bz-luck-col { flex:1 1 auto; min-width:380px; position:sticky; top:12px; }
.bz-luck-section { border:0.5px solid #e0d8c8; overflow-x:auto; }
.bz-luck-table { display:table; width:100%; min-width:620px; border-collapse:collapse; }
.bz-luck-row { display:table-row; }
.bz-luck-row .cell { display:table-cell; padding:3px 5px; text-align:center; vertical-align:middle; font-family:"Songti SC","SimSun",serif; font-size:18px; border-right:0.5px solid #e0d8c8; border-bottom:0.5px solid #e0d8c8; white-space:nowrap; min-width:52px; }
.bz-luck-row .cell:last-child { border-right:none; }
.bz-luck-row .rtag { background:rgba(201,169,110,.06); font-size:14px; color:#8b7e6a; min-width:48px; width:48px; }
.bz-luck-row .year { font-size:19px; color:#2c2416; font-weight:600; }
.bz-luck-row .age { font-size:17px; color:#8b7e6a; display:block; }
.bz-luck-row .sm { font-size:20px; font-weight:700; line-height:1.15; }
.bz-luck-row .bm { font-size:20px; font-weight:700; line-height:1.15; }
.bz-luck-row.hd .cell { background:rgba(201,169,110,.04); font-size:17px; color:#8b7e6a; }
.bz-luck-row .cell.cc { background:rgba(200,58,58,.04); box-shadow:inset 0 0 0 1.5px rgba(200,58,58,.3); }
.bz-liu-row .cell { font-size:17px; vertical-align:top; white-space:normal; min-width:68px; }
.bz-liu-row .li { display:block; padding:1px 0; cursor:pointer; }
.bz-liu-row .li:hover { color:#b5343a; }
.bz-liu-row .li.cur { color:#b5343a; font-weight:700; }
.bz-meta-tag { display:inline-block; font-size:13px; padding:1px 6px; margin-left:6px; border-radius:2px; background:rgba(201,169,110,.1); color:#8b7e6a; white-space:nowrap; }
.bz-meta-tag.tst { color:#b5343a; }
@media (max-width:900px) {
  .bz-body-cols { flex-direction:column; }
  .bz-luck-col { min-width:0; position:static; }
  .bz-chart { min-width:500px; }
  .bz-chart .rg td { font-size:24px; }
}
.bz-twin-wrap { display:flex; gap:16px; overflow-x:auto; }
.bz-twin-col { flex:1; min-width:380px; }
.bz-twin-col .bz-body { flex-direction:column; }
.bz-twin-col .bz-luck { width:100%; }
.bz-twin-col h3 { font-family:"Songti SC","SimSun",serif; font-size:18px; color:#2c2416; text-align:center; margin-bottom:10px; padding-bottom:8px; border-bottom:2px solid #e0d8c8; letter-spacing:.08em; }
.bz-twin-col:last-child h3 { color:#b5343a; border-bottom-color:#b5343a; }
/* 双胞胎对比：单表三栏 */
.bz-chart .bz-twin-sep { width:4px; min-width:4px; padding:0; background:#e0d8c8; opacity:0.35; }
.bz-chart .bz-twin-sub-hd td { padding:6px 4px !important; }
.bz-chart .bz-twin-sub-hd h3 { font-family:"Songti SC","SimSun",serif; font-size:16px; text-align:center; margin:0; padding:2px 0; border-bottom:2px solid #e0d8c8; letter-spacing:.08em; }
.bz-chart .bz-twin-red { color:#b5343a; border-bottom-color:#b5343a; }
`;
    document.head.appendChild(s);
  }

  // ============================================================
  // 1. 注册 workspace（全屏工作区）
  // ============================================================
  Clacky.ext.ui.registerWorkspace("bazi-paipan", {
    title: "八字排盘",
    render: function(container) {
      var root = document.createElement("div");
      root.className = "bazi-paipan";
      root.innerHTML = buildForm() + '<div id="bzResult"><div style="color:#8b7e6a;padding:60px;text-align:center;font-family:\'Songti SC\',serif;font-size:18px;">输入出生时间，点击「排盘」</div></div>';
      container.appendChild(root);
      // 容器被 host 清空后重新 render，需要重新绑定事件
      setTimeout(function () { window._bzDoPaipan(); }, 100);
    }
  });

  // ============================================================

  // ============================================================
  // 2. 排盘逻辑（与原版完全一致）
  // ============================================================

  function buildForm() {
    var provs = Object.keys(LOC).sort(function(a,b){return a.localeCompare(b,'zh');});
    var provOpts = provs.map(function(p){return '<option value="'+p+'">'+p+'</option>';}).join('');
    return '<div class="bz-page"><div class="bz-input-row">' +
      '<label>姓名</label><input type="text" id="bzName" value="邦顺" style="width:72px;">' +
      '<label>性别</label><select id="bzGender"><option value="男" selected>男</option><option value="女">女</option></select>' +
      '<label>年</label><input type="number" id="bzYear" value="1982" min="1900" max="2100" style="width:60px;">' +
      '<label>月</label><input type="number" id="bzMonth" value="10" min="1" max="12" style="width:44px;">' +
      '<label>日</label><input type="number" id="bzDay" value="18" min="1" max="31" style="width:44px;">' +
      '<label>时</label><input type="number" id="bzHour" value="5" min="0" max="23" style="width:44px;">' +
      '<label>分</label><input type="number" id="bzMin" value="1" min="0" max="59" style="width:44px;">' +
      '<label>双胞</label><select id="bzTwin"><option value="0">无</option><option value="1">对比</option></select>' +
      '<label style="cursor:pointer;font-size:13px;"><input type="checkbox" id="bzSolar" onchange="document.getElementById(\'bzSolarGroup\').style.display=this.checked?\'\':\'none\';">真太阳时</label>' +
      '<span id="bzSolarGroup" style="display:none;">' +
      '<label>省</label><select id="bzProv" onchange="onBzProvChange()" style="width:72px;"><option value="">—</option>'+provOpts+'</select>' +
      '<label>市</label><select id="bzCity" onchange="onBzCityChange()" style="width:88px;"><option value="">—</option></select>' +
      '<label>区县</label><select id="bzDist" style="width:80px;"><option value="">—</option></select>' +
      '</span>' +
      '<button class="bz-btn" onclick="window._bzDoPaipan()">排 盘</button>' +
      '</div></div>';
  }

  function wxColor(gan) { var w=WX[gan]; return w?WX_COLOR[w]:'#2c2416'; }

  window._bzDoPaipan = function () {
    var params = new URLSearchParams();
    params.set('name',   document.getElementById('bzName').value   || '未命名');
    params.set('gender', document.getElementById('bzGender').value || '男');
    params.set('year',   document.getElementById('bzYear').value   || '1982');
    params.set('month',  document.getElementById('bzMonth').value  || '10');
    params.set('day',    document.getElementById('bzDay').value    || '18');
    params.set('hour',   document.getElementById('bzHour').value   || '5');
    params.set('min',    document.getElementById('bzMin').value    || '0');
    if (document.getElementById('bzSolar').checked) {
      var prov = document.getElementById('bzProv').value;
      var city = document.getElementById('bzCity').value;
      if (prov && city && LOC[prov] && LOC[prov].cities[city]) {
        params.set('lng', LOC[prov].cities[city].lng);
      }
    }

    var resultEl = document.getElementById('bzResult');
    if (!resultEl) return;
    resultEl.innerHTML = '<div style="color:#8b7e6a;padding:60px;text-align:center;font-family:\'Songti SC\',serif;">排盘中…</div>';

    var twin = document.getElementById('bzTwin').value;
    var baseUrl = '/api/ext/bazi-paipan/paipan?' + params.toString();

    if (twin === '1') {
      // 双胞胎对比：单表合并 + 共享大运流年
      var p1 = fetch(baseUrl + '&twin=1').then(function(r){return r.json();});
      var p2 = fetch(baseUrl + '&twin=2').then(function(r){return r.json();});
      Promise.all([p1, p2]).then(function(arr){
        var d1 = arr[0], d2 = arr[1];
        if (d1.error || d2.error) { resultEl.innerHTML = '<div style="color:#b5343a;">'+(d1.error||d2.error)+'</div>'; return; }
        resultEl.innerHTML = renderTwinHtml(d1, d2);
      }).catch(function(e){ resultEl.innerHTML = '<div style="color:#b5343a;">出错：'+e.message+'</div>'; });
    } else {
      fetch(baseUrl)
        .then(function(res){ return res.json(); })
        .then(function(d){
          if (d.error) { resultEl.innerHTML = '<div style="color:#b5343a;padding:30px;">'+d.error+'</div>'; return; }
          resultEl.innerHTML = renderHtml(d, '');
        })
        .catch(function(e){
          resultEl.innerHTML = '<div style="color:#b5343a;padding:30px;">出错：'+e.message+'</div>';
        });
    }
  };

  window.onBzProvChange = function () {
    var prov = document.getElementById('bzProv').value;
    var cSel = document.getElementById('bzCity');
    var dSel = document.getElementById('bzDist');
    cSel.innerHTML = '<option value="">—</option>';
    dSel.innerHTML = '<option value="">—</option>';
    if (!prov || !LOC[prov]) return;
    var cities = Object.keys(LOC[prov].cities).sort(function(a,b){return a.localeCompare(b,'zh');});
    cities.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;cSel.appendChild(o);});
    var caps = {'四川省':'成都市','广东省':'广州市','广西':'南宁市','浙江省':'杭州市','江苏省':'南京市','福建省':'福州市','山东省':'济南市','河南省':'郑州市','湖北省':'武汉市','湖南省':'长沙市','辽宁省':'沈阳市','吉林省':'长春市','黑龙江省':'哈尔滨市','陕西省':'西安市','云南省':'昆明市','贵州省':'贵阳市','安徽省':'合肥市','江西省':'南昌市','河北省':'石家庄市','山西省':'太原市','甘肃省':'兰州市'};
    var def = caps[prov] || cities[0];
    if (def && cities.indexOf(def)>=0) { cSel.value = def; onBzCityChange(); }
  };
  window.onBzCityChange = function () {
    var prov = document.getElementById('bzProv').value;
    var city = document.getElementById('bzCity').value;
    var dSel = document.getElementById('bzDist');
    dSel.innerHTML = '<option value="">—</option>';
    if (!prov || !city || !LOC[prov] || !LOC[prov].cities[city]) return;
    (LOC[prov].cities[city].dist||[]).forEach(function(d){var o=document.createElement('option');o.value=d;o.textContent=d;dSel.appendChild(o);});
  };

  function renderHtml(d, label) {
    var p = d.pillars;
    var tstHtml = '';
    if (d.true_solar) {
      var ts = d.true_solar;
      tstHtml = '<span class="bz-meta-tag tst">☀ 真太阳时 '+pad(ts.h)+':'+pad(ts.mi)+' ('+(ts.offset_min>=0?'+':'')+ts.offset_min+'分)</span>';
    }
    var ryHtml = '';
    if (d.ren_yuan) {
      ryHtml = '<span class="bz-meta-tag">'+d.ren_yuan.gan+'（'+d.ren_yuan.month_zhi+'月·节后'+d.ren_yuan.days_after+'日）</span>';
    }
    var qy = d.qi_yun;

    function tc(txt, wx) { var c=wx?WX_COLOR[wx]:'#2c2416'; return '<td style="color:'+c+'">'+txt+'</td>'; }
    function tc2(txt, wx, extra) { var c=wx?WX_COLOR[wx]:'#2c2416'; return '<td style="color:'+c+';'+extra+'">'+txt+'</td>'; }
    function tds(txt, cls) { return '<td class="'+(cls||'')+'">'+txt+'</td>'; }

    var cd = d.cur_da_yun, cl = d.cur_liu_nian;
    var rows = [
      '<tr class="hd"><th class="rl">盘式</th><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th><th class="sep">大运</th><th>流年</th></tr>',
      '<tr class="rs">'+tds('主星','rl')+tds(p.nian.shi_shen)+tds(p.yue.shi_shen)+tds(p.ri.shi_shen)+tds(p.shi.shi_shen)+tds(cd.shi_shen,'sep')+tds(cl.shi_shen)+'</tr>',
      '<tr class="rg"><td class="rl"></td>'+tc2(p.nian.gan,WX[p.nian.gan])+tc2(p.yue.gan,WX[p.yue.gan])+tc2(p.ri.gan,WX[p.ri.gan])+tc2(p.shi.gan,WX[p.shi.gan])+tc2(cd.gan,WX[cd.gan],'border-left:1.5px solid rgba(181,52,58,.4)')+tc2(cl.gan,WX[cl.gan])+'</tr>',
      '<tr class="rg"><td class="rl"></td>'+tc2(p.nian.zhi,WX[p.nian.zhi])+tc2(p.yue.zhi,WX[p.yue.zhi])+tc2(p.ri.zhi,WX[p.ri.zhi])+tc2(p.shi.zhi,WX[p.shi.zhi])+tc2(cd.zhi,WX[cd.zhi],'border-left:1.5px solid rgba(181,52,58,.4)')+tc2(cl.zhi,WX[cl.zhi])+'</tr>',
      '<tr class="rh">'+tds('藏气','rl')+tds(p.nian.cang_gan)+tds(p.yue.cang_gan)+tds(p.ri.cang_gan)+tds(p.shi.cang_gan)+tds(cd.cang_gan,'sep')+tds(cl.cang_gan)+'</tr>',
      '<tr class="rn">'+tds('纳音','rl')+tds(p.nian.nayin)+tds(p.yue.nayin)+tds(p.ri.nayin)+tds(p.shi.nayin)+tds(cd.nayin,'sep')+tds(cl.nayin)+'</tr>',
      '<tr class="rm">'+tds('星运','rl')+tds(p.nian.xing_yun)+tds(p.yue.xing_yun)+tds(p.ri.xing_yun)+tds(p.shi.xing_yun)+tds(cd.xing_yun,'sep')+tds(cl.xing_yun)+'</tr>',
      '<tr class="rm">'+tds('自坐','rl')+tds(p.nian.zi_zuo)+tds(p.yue.zi_zuo)+tds(p.ri.zi_zuo)+tds(p.shi.zi_zuo)+tds(cd.zi_zuo,'sep')+tds(cl.zi_zuo)+'</tr>',
      '<tr class="rm">'+tds('空亡','rl')+tds(p.nian.kong_wang)+tds(p.yue.kong_wang)+tds(p.ri.kong_wang)+tds(p.shi.kong_wang)+tds(cd.kong_wang,'sep')+tds(cl.kong_wang)+'</tr>',
      '<tr class="rm">'+tds('神煞','rl')+tds(p.nian.shen_sha)+tds(p.yue.shen_sha)+tds(p.ri.shen_sha)+tds(p.shi.shen_sha)+tds(cd.shen_sha,'sep')+tds(cl.shen_sha)+'</tr>',
      // 三垣
      '<tr class="hd"><th class="rl">三垣</th><th></th><th>胎元</th><th>命宫</th><th>身宫</th><th class="sep"></th><th></th></tr>',
      '<tr class="rs">'+tds('主星','rl')+'<td></td>'+tds(p.tai.shi_shen)+tds(p.ming.shi_shen)+tds(p.shen.shi_shen)+'<td class="sep"></td><td></td></tr>',
      '<tr class="rg"><td class="rl"></td><td></td>'+tc2(p.tai.gan,WX[p.tai.gan])+tc2(p.ming.gan,WX[p.ming.gan])+tc2(p.shen.gan,WX[p.shen.gan])+'<td class="sep"></td><td></td></tr>',
      '<tr class="rg"><td class="rl"></td><td></td>'+tc2(p.tai.zhi,WX[p.tai.zhi])+tc2(p.ming.zhi,WX[p.ming.zhi])+tc2(p.shen.zhi,WX[p.shen.zhi])+'<td class="sep"></td><td></td></tr>',
      '<tr class="rh">'+tds('藏气','rl')+'<td></td>'+tds(p.tai.cang_gan)+tds(p.ming.cang_gan)+tds(p.shen.cang_gan)+'<td class="sep"></td><td></td></tr>'
    ];

    // 大运流年表
    var luckHd = '<div class="bz-luck-row hd"><div class="cell rtag">大运</div>';
    var luckGz = '<div class="bz-luck-row"><div class="cell rtag">干支</div>';
    var luckLn = '<div class="bz-luck-row bz-liu-row"><div class="cell rtag">流年</div>';
    for (var i=0; i<d.da_yun.length; i++) {
      var dy = d.da_yun[i];
      var cc = i===d.cur_da_yun.idx ? ' cc' : '';
      luckHd += '<div class="cell'+cc+'"><span class="year">'+dy.start_year+'</span><span class="age">'+(dy.start_age+1)+'岁</span></div>';
      luckGz += '<div class="cell'+cc+'"><div class="sm" style="color:'+wxColor(dy.gan)+'">'+dy.gan+'</div><div class="bm" style="color:'+wxColor(dy.zhi)+'">'+dy.zhi+'</div></div>';
      var lis = '';
      for (var j=0; j<10; j++) {
        var lnY = dy.start_year + j;
        var idx = (lnY-4)%60; if(idx<0)idx+=60;
        var g=TG[idx%10], z=DZ[idx%12];
        lis += '<span class="li'+(i===d.cur_da_yun.idx&&lnY===d.now_year?' cur':'')+'" style="cursor:pointer" onclick="window._bzDoLiunian('+lnY+')"><span style="color:'+wxColor(g)+'">'+g+'</span><span style="color:'+wxColor(z)+'">'+z+'</span></span>';
      }
      luckLn += '<div class="cell'+cc+'">'+lis+'</div>';
    }
    luckHd += '</div>'; luckGz += '</div>'; luckLn += '</div>';

    var html = '<div class="bz-page">' +
      '<div class="bz-top-bar"><div class="bz-person"><b>'+d.name+'</b><span class="sex">'+(d.gender==='男'?'乾造':'坤造')+'</span><span class="meta">'+d.gender+' · '+d.year+'年'+d.month+'月'+d.day+'日 '+pad(d.hour)+':'+pad(d.min)+'</span>'+tstHtml+ryHtml+'</div><div class="bz-person meta">'+d.pillars.nian.gan+d.pillars.nian.zhi+'年 · 属'+d.sheng_xiao+' （当前'+d.now_year+'年）</div></div>' +
      '<div class="bz-body-cols"><div class="bz-main-col"><div style="overflow-x:auto;"><table class="bz-chart">'+rows.join('\n')+'</table></div></div>' +
      '<div class="bz-luck-col"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><div style="font-size:14px;color:#8b7e6a;"><span>起运</span> 出生后 '+qy.years+'年'+qy.months+'月'+qy.days+'天 &nbsp; <span>交运</span> 逢己、甲年</div></div>' +
      '<div class="bz-luck-section"><div class="bz-luck-table">'+luckHd+luckGz+luckLn+'</div></div></div></div></div>';

    return html;
  }

  function renderTwinHtml(d1, d2) {
    var p1 = d1.pillars, p2 = d2.pillars;
    var cd = d1.cur_da_yun, cl = d1.cur_liu_nian;
    var qy = d1.qi_yun;
    var tstHtml = '', ryHtml = '';
    if (d1.true_solar) {
      var ts = d1.true_solar;
      tstHtml = '<span class="bz-meta-tag tst">☀ 真太阳时 '+pad(ts.h)+':'+pad(ts.mi)+' ('+(ts.offset_min>=0?'+':'')+ts.offset_min+'分)</span>';
    }
    if (d1.ren_yuan) {
      ryHtml = '<span class="bz-meta-tag">'+d1.ren_yuan.gan+'（'+d1.ren_yuan.month_zhi+'月·节后'+d1.ren_yuan.days_after+'日）</span>';
    }

    function tc(txt, wx, cls) { var c=wx?WX_COLOR[wx]:'#2c2416'; var ca=cls?' class="'+cls+'"':''; return '<td'+ca+' style="color:'+c+'">'+txt+'</td>'; }
    function tds(txt, cls) { return '<td class="'+(cls||'')+'">'+txt+'</td>'; }

    var rows = [
      '<tr class="hd">'+tds('盘式','rl')+'<th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th><td class="bz-twin-sep"></td><th>年柱</th><th>月柱</th><th>日柱</th><th>时柱</th><th class="sep">大运</th><th>流年</th></tr>',
      '<tr class="bz-twin-sub-hd">'+tds('','rl')+'<td colspan="4"><h3>大宝（兄）</h3></td><td class="bz-twin-sep"></td><td colspan="4"><h3 class="bz-twin-red">小宝（弟）</h3></td><td colspan="2" class="sep"><h3 style="color:#8b7e6a;">共享</h3></td></tr>',
      // 主星
      '<tr class="rs">'+tds('主星','rl')+
        tds(p1.nian.shi_shen)+tds(p1.yue.shi_shen)+tds(p1.ri.shi_shen)+tds(p1.shi.shi_shen)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.shi_shen)+tds(p2.yue.shi_shen)+tds(p2.ri.shi_shen)+tds(p2.shi.shi_shen)+
        tds(cd.shi_shen,'sep')+tds(cl.shi_shen)+'</tr>',
      // 天干
      '<tr class="rg"><td class="rl"></td>'+
        tc(p1.nian.gan,WX[p1.nian.gan])+tc(p1.yue.gan,WX[p1.yue.gan])+tc(p1.ri.gan,WX[p1.ri.gan])+tc(p1.shi.gan,WX[p1.shi.gan])+'<td class="bz-twin-sep"></td>'+
        tc(p2.nian.gan,WX[p2.nian.gan])+tc(p2.yue.gan,WX[p2.yue.gan])+tc(p2.ri.gan,WX[p2.ri.gan])+tc(p2.shi.gan,WX[p2.shi.gan])+
        tc(cd.gan,WX[cd.gan],'sep')+tc(cl.gan,WX[cl.gan])+'</tr>',
      // 地支
      '<tr class="rg"><td class="rl"></td>'+
        tc(p1.nian.zhi,WX[p1.nian.zhi])+tc(p1.yue.zhi,WX[p1.yue.zhi])+tc(p1.ri.zhi,WX[p1.ri.zhi])+tc(p1.shi.zhi,WX[p1.shi.zhi])+'<td class="bz-twin-sep"></td>'+
        tc(p2.nian.zhi,WX[p2.nian.zhi])+tc(p2.yue.zhi,WX[p2.yue.zhi])+tc(p2.ri.zhi,WX[p2.ri.zhi])+tc(p2.shi.zhi,WX[p2.shi.zhi])+
        tc(cd.zhi,WX[cd.zhi],'sep')+tc(cl.zhi,WX[cl.zhi])+'</tr>',
      // 藏气
      '<tr class="rh">'+tds('藏气','rl')+
        tds(p1.nian.cang_gan)+tds(p1.yue.cang_gan)+tds(p1.ri.cang_gan)+tds(p1.shi.cang_gan)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.cang_gan)+tds(p2.yue.cang_gan)+tds(p2.ri.cang_gan)+tds(p2.shi.cang_gan)+
        tds(cd.cang_gan,'sep')+tds(cl.cang_gan)+'</tr>',
      // 纳音
      '<tr class="rn">'+tds('纳音','rl')+
        tds(p1.nian.nayin)+tds(p1.yue.nayin)+tds(p1.ri.nayin)+tds(p1.shi.nayin)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.nayin)+tds(p2.yue.nayin)+tds(p2.ri.nayin)+tds(p2.shi.nayin)+
        tds(cd.nayin,'sep')+tds(cl.nayin)+'</tr>',
      // 星运
      '<tr class="rm">'+tds('星运','rl')+
        tds(p1.nian.xing_yun)+tds(p1.yue.xing_yun)+tds(p1.ri.xing_yun)+tds(p1.shi.xing_yun)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.xing_yun)+tds(p2.yue.xing_yun)+tds(p2.ri.xing_yun)+tds(p2.shi.xing_yun)+
        tds(cd.xing_yun,'sep')+tds(cl.xing_yun)+'</tr>',
      // 自坐
      '<tr class="rm">'+tds('自坐','rl')+
        tds(p1.nian.zi_zuo)+tds(p1.yue.zi_zuo)+tds(p1.ri.zi_zuo)+tds(p1.shi.zi_zuo)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.zi_zuo)+tds(p2.yue.zi_zuo)+tds(p2.ri.zi_zuo)+tds(p2.shi.zi_zuo)+
        tds(cd.zi_zuo,'sep')+tds(cl.zi_zuo)+'</tr>',
      // 空亡
      '<tr class="rm">'+tds('空亡','rl')+
        tds(p1.nian.kong_wang)+tds(p1.yue.kong_wang)+tds(p1.ri.kong_wang)+tds(p1.shi.kong_wang)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.kong_wang)+tds(p2.yue.kong_wang)+tds(p2.ri.kong_wang)+tds(p2.shi.kong_wang)+
        tds(cd.kong_wang,'sep')+tds(cl.kong_wang)+'</tr>',
      // 神煞
      '<tr class="rm">'+tds('神煞','rl')+
        tds(p1.nian.shen_sha)+tds(p1.yue.shen_sha)+tds(p1.ri.shen_sha)+tds(p1.shi.shen_sha)+'<td class="bz-twin-sep"></td>'+
        tds(p2.nian.shen_sha)+tds(p2.yue.shen_sha)+tds(p2.ri.shen_sha)+tds(p2.shi.shen_sha)+
        tds(cd.shen_sha,'sep')+tds(cl.shen_sha)+'</tr>',
      // 三垣 header
      '<tr class="hd">'+tds('三垣','rl')+'<td></td><th>胎元</th><th>命宫</th><th>身宫</th><td class="bz-twin-sep"></td><th>胎元</th><th>命宫</th><th>身宫</th><td class="sep"></td><td></td></tr>',
      // 三垣 主星
      '<tr class="rs">'+tds('主星','rl')+'<td></td>'+
        tds(p1.tai.shi_shen)+tds(p1.ming.shi_shen)+tds(p1.shen.shi_shen)+'<td class="bz-twin-sep"></td>'+
        tds(p2.tai.shi_shen)+tds(p2.ming.shi_shen)+tds(p2.shen.shi_shen)+
        '<td class="sep"></td><td></td></tr>',
      // 三垣 天干
      '<tr class="rg"><td class="rl"></td><td></td>'+
        tc(p1.tai.gan,WX[p1.tai.gan])+tc(p1.ming.gan,WX[p1.ming.gan])+tc(p1.shen.gan,WX[p1.shen.gan])+'<td class="bz-twin-sep"></td>'+
        tc(p2.tai.gan,WX[p2.tai.gan])+tc(p2.ming.gan,WX[p2.ming.gan])+tc(p2.shen.gan,WX[p2.shen.gan])+
        '<td class="sep"></td><td></td></tr>',
      // 三垣 地支
      '<tr class="rg"><td class="rl"></td><td></td>'+
        tc(p1.tai.zhi,WX[p1.tai.zhi])+tc(p1.ming.zhi,WX[p1.ming.zhi])+tc(p1.shen.zhi,WX[p1.shen.zhi])+'<td class="bz-twin-sep"></td>'+
        tc(p2.tai.zhi,WX[p2.tai.zhi])+tc(p2.ming.zhi,WX[p2.ming.zhi])+tc(p2.shen.zhi,WX[p2.shen.zhi])+
        '<td class="sep"></td><td></td></tr>',
      // 三垣 藏气
      '<tr class="rh">'+tds('藏气','rl')+'<td></td>'+
        tds(p1.tai.cang_gan)+tds(p1.ming.cang_gan)+tds(p1.shen.cang_gan)+'<td class="bz-twin-sep"></td>'+
        tds(p2.tai.cang_gan)+tds(p2.ming.cang_gan)+tds(p2.shen.cang_gan)+
        '<td class="sep"></td><td></td></tr>'
    ];

    // 大运流年表（共享，用 d1 的数据）
    var luckHd = '<div class="bz-luck-row hd"><div class="cell rtag">大运</div>';
    var luckGz = '<div class="bz-luck-row"><div class="cell rtag">干支</div>';
    var luckLn = '<div class="bz-luck-row bz-liu-row"><div class="cell rtag">流年</div>';
    for (var i=0; i<d1.da_yun.length; i++) {
      var dy = d1.da_yun[i];
      var cc = i===d1.cur_da_yun.idx ? ' cc' : '';
      luckHd += '<div class="cell'+cc+'"><span class="year">'+dy.start_year+'</span><span class="age">'+(dy.start_age+1)+'岁</span></div>';
      luckGz += '<div class="cell'+cc+'"><div class="sm" style="color:'+wxColor(dy.gan)+'">'+dy.gan+'</div><div class="bm" style="color:'+wxColor(dy.zhi)+'">'+dy.zhi+'</div></div>';
      var lis = '';
      for (var j=0; j<10; j++) {
        var lnY = dy.start_year + j;
        var idx = (lnY-4)%60; if(idx<0)idx+=60;
        var g=TG[idx%10], z=DZ[idx%12];
        lis += '<span class="li'+(i===d1.cur_da_yun.idx&&lnY===d1.now_year?' cur':'')+'" style="cursor:pointer" onclick="window._bzDoLiunian('+lnY+')"><span style="color:'+wxColor(g)+'">'+g+'</span><span style="color:'+wxColor(z)+'">'+z+'</span></span>';
      }
      luckLn += '<div class="cell'+cc+'">'+lis+'</div>';
    }
    luckHd += '</div>'; luckGz += '</div>'; luckLn += '</div>';

    var html = '<div class="bz-page">' +
      '<div class="bz-top-bar"><div class="bz-person"><b>'+d1.name+'</b><span class="sex">'+(d1.gender==='男'?'乾造':'坤造')+'</span><span class="meta">'+d1.gender+' · '+d1.year+'年'+d1.month+'月'+d1.day+'日 '+pad(d1.hour)+':'+pad(d1.min)+'</span>'+tstHtml+ryHtml+'</div><div class="bz-person meta">'+d1.pillars.nian.gan+d1.pillars.nian.zhi+'年 · 属'+d1.sheng_xiao+' （当前'+d1.now_year+'年）</div></div>' +
      '<div style="overflow-x:auto;"><table class="bz-chart" style="min-width:auto;table-layout:fixed;">'+rows.join('\n')+'</table></div>' +
      '<div style="margin-top:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><div style="font-size:14px;color:#8b7e6a;"><span>起运</span> 出生后 '+qy.years+'年'+qy.months+'月'+qy.days+'天 &nbsp; <span>交运</span> 逢己、甲年</div></div>' +
      '<div class="bz-luck-section"><div class="bz-luck-table">'+luckHd+luckGz+luckLn+'</div></div></div></div>';

    return html;
  }
})();
