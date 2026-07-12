// 扩展应用启动器 — 统一入口面板
// 挂载 sidebar.nav → 点击展开 workspace 面板，卡片式展示所有扩展应用
(function () {
  // ============================================================
  // 扩展应用清单 — 在此注册你的所有扩展
  // ============================================================
  var APPS = [
    {
      id: "bazi-paipan",
      name: "八字排盘",
      subtitle: "从真版",
      desc: "输入出生时间，排四柱、大运、流年，支持真太阳时修正与 AI 自然语言录入。",
      icon: "甲",
      iconColor: "#2e8b3d",
      url: "https://bangshun2025.github.io/bazi-paipan/"
    },
    {
      id: "bazi-paipan-local",
      name: "八字排盘",
      subtitle: "本地开发版",
      desc: "与公开版相同引擎，走 Clacky 本地 API，方便调试与迭代。",
      icon: "甲",
      iconColor: "#b5343a",
      url: "/api/ext/bazi-paipan/standalone"
    }
    // 后续扩展在此追加：
    // { id: "xxx", name: "应用名", subtitle: "副标题", desc: "描述", icon: "图", iconColor: "#xxx", url: "/api/ext/xxx/standalone" }
  ];

  // ============================================================
  // 注入样式
  // ============================================================
  var STYLE_ID = "app-launcher-css";
  if (!document.getElementById(STYLE_ID)) {
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      ".al-page { max-width:960px; margin:0 auto; padding:24px 20px; font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; }",
      ".al-header { margin-bottom:28px; padding-bottom:16px; border-bottom:1px solid #e8e3d8; }",
      ".al-header h2 { font-family:'Songti SC','SimSun',serif; font-size:26px; color:#2c2416; font-weight:600; letter-spacing:.05em; margin:0 0 4px; }",
      ".al-header .sub { font-size:14px; color:#8b7e6a; }",
      ".al-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px; }",
      ".al-card { background:#faf7f1; border:1px solid #e0d8c8; border-radius:4px; padding:20px 18px; cursor:pointer; transition:box-shadow .15s, border-color .15s; text-decoration:none; display:block; }",
      ".al-card:hover { border-color:#b5343a; box-shadow:0 2px 12px rgba(181,52,58,.08); }",
      ".al-card-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }",
      ".al-card-icon { width:44px; height:44px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-family:'Songti SC','SimSun',serif; font-weight:700; font-size:22px; flex-shrink:0; }",
      ".al-card-name { font-family:'Songti SC','SimSun',serif; font-size:18px; color:#2c2416; font-weight:600; letter-spacing:.03em; }",
      ".al-card-sub { font-size:13px; color:#8b7e6a; margin-top:1px; }",
      ".al-card-desc { font-size:13px; color:#6b6252; line-height:1.6; }",
      ".al-empty { text-align:center; padding:60px 20px; color:#8b7e6a; font-family:'Songti SC',serif; font-size:16px; }",
    ].join("\n");
    document.head.appendChild(s);
  }

  // ============================================================
  // 渲染单个应用卡片
  // ============================================================
  function renderCard(app) {
    return [
      '<a class="al-card" href="', app.url, '" target="_blank">',
        '<div class="al-card-top">',
          '<div class="al-card-icon" style="background:', app.iconColor, '15;color:', app.iconColor, ';">', app.icon, '</div>',
          '<div>',
            '<div class="al-card-name">', app.name, '</div>',
            app.subtitle ? '<div class="al-card-sub">' + app.subtitle + '</div>' : '',
          '</div>',
        '</div>',
        '<div class="al-card-desc">', app.desc, '</div>',
      '</a>'
    ].join("");
  }

  function render() {
    if (APPS.length === 0) {
      return '<div class="al-page"><div class="al-empty">暂无扩展应用，去创建一个吧</div></div>';
    }
    var cards = APPS.map(renderCard).join("\n");
    return [
      '<div class="al-page">',
        '<div class="al-header">',
          '<h2>扩展应用</h2>',
          '<div class="sub">共 ', APPS.length, ' 个应用 · 点击卡片在新标签页打开</div>',
        '</div>',
        '<div class="al-grid">', cards, '</div>',
      '</div>'
    ].join("");
  }

  // ============================================================
  // 注册 workspace（面板内展示）
  // ============================================================
  Clacky.ext.ui.registerWorkspace("app-launcher", {
    title: "扩展应用",
    render: function (container) {
      var root = document.createElement("div");
      root.innerHTML = render();
      container.appendChild(root);
    }
  });

  // ============================================================
  // 侧边栏导航按钮 — 对齐系统 task-row 风格
  // ============================================================
  Clacky.ext.ui.mount("sidebar.nav", function (container) {
    // 外层 wrapper（对齐 pixel-office 的 My AI Team 结构）
    var wrapper = document.createElement("div");
    wrapper.setAttribute("data-ext-workspace", "app-launcher");

    // task-item（提供 padding / border-radius / hover 效果）
    var item = document.createElement("div");
    item.className = "task-item task-item-summary";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", "扩展应用");
    item.style.cssText = "cursor:pointer;";
    item.onclick = function (e) {
      e.preventDefault();
      Clacky.ext.ui.openWorkspace("app-launcher");
    };

    // task-row（flex 行：图标 + 文字）
    var row = document.createElement("div");
    row.className = "task-row";

    // SVG 图标：九宫格（扩展/应用）
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "task-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = [
      '<rect x="3" y="3" width="7" height="7"></rect>',
      '<rect x="14" y="3" width="7" height="7"></rect>',
      '<rect x="3" y="14" width="7" height="7"></rect>',
      '<rect x="14" y="14" width="7" height="7"></rect>'
    ].join("");

    var info = document.createElement("div");
    info.className = "task-info";

    var name = document.createElement("span");
    name.className = "task-name";
    name.textContent = "扩展应用";

    info.appendChild(name);
    row.appendChild(svg);
    row.appendChild(info);
    item.appendChild(row);
    wrapper.appendChild(item);
    container.appendChild(wrapper);
  }, { order: 50 });
})();
