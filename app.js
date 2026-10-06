// 起始页逻辑 —— 全部使用经典脚本，兼容 file:// 环境
// （file:// 下不可用：ES Module、fetch 本地文件、写本地文件、Service Worker；
//   在线接口仅使用：图片直链、JSONP、带 Access-Control-Allow-Origin:* 的 fetch）
//
// 数据模型：config.js 为基准配置；页面内修改存 localStorage["overrides"]，
// 加载时合并（overrides 优先）；设置面板可导出合并后的完整 config.js。
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  // ================= 配置合并 =================
  var OVR_KEY = "overrides";
  var ovr = (function () {
    try { return JSON.parse(localStorage.getItem(OVR_KEY)) || {}; }
    catch (e) { return {}; }
  })();
  function saveOvr() { localStorage.setItem(OVR_KEY, JSON.stringify(ovr)); }

  var conf = (function () {
    var s = ovr.settings || {};
    function pick(key, dflt) { return key in s ? s[key] : (key in CONFIG ? CONFIG[key] : dflt); }
    return {
      engines: CONFIG.engines,
      wallpaperSources: (CONFIG.wallpaper || {}).sources || [],
      dim: "dim" in s ? s.dim : ((CONFIG.wallpaper || {}).dim != null ? CONFIG.wallpaper.dim : .9),
      wallMode: s.wallMode || (CONFIG.wallpaper || {}).mode || "daily",
      wallCustom: "wallCustom" in s ? s.wallCustom : ((CONFIG.wallpaper || {}).custom || ""),
      theme: pick("theme", "auto"),
      searchInNewTab: !!pick("searchInNewTab", false),
      shortcutInNewTab: !!pick("shortcutInNewTab", false),
      suggestions: pick("suggestions", true) !== false,
      history: pick("history", true) !== false,
      hitokoto: pick("hitokoto", true) !== false,
      gridMaxVisible: pick("gridMaxVisible", 0) || 0,
      lang: pick("lang", "auto"),
      // 深拷贝，页面内编辑直接改这份，再整体写回 overrides
      shortcuts: JSON.parse(JSON.stringify(ovr.shortcuts || CONFIG.shortcuts || [])),
    };
  })();

  function saveSetting(key, val) {
    conf[key] = val;
    ovr.settings = ovr.settings || {};
    ovr.settings[key] = val;
    saveOvr();
  }
  function saveShortcuts() {
    ovr.shortcuts = conf.shortcuts;
    saveOvr();
  }

  // ================= 多语言 =================
  var I18N = {
    zh: {
      searchPh: "搜索",
      engineTitle: "切换搜索引擎（Alt+数字）",
      wallBtnTitle: "换一张壁纸",
      settingsTitle: "设置",
      histTitle: "搜索历史", clear: "清空", delHist: "删除这条记录",
      quoteTitle: "点击换一句",
      add: "添加", edit: "编辑", rename: "重命名", del: "删除", moveOut: "移出收纳夹",
      dlgAdd: "添加", dlgEditLink: "编辑快捷方式", dlgRenameFolder: "重命名收纳夹",
      type: "类型", typeLink: "快捷方式", typeFolder: "收纳夹",
      name: "名称", url: "地址", icon: "图标",
      urlPh: "https://… 或 file:///E:/…",
      iconPh: "留空自动匹配官方图标；也可填图标名（如 ri:github-fill）、emoji、图片地址",
      cancel: "取消", save: "保存",
      errName: "名称不能为空", errUrl: "地址不能为空",
      settings: "设置", lang: "语言", langAuto: "跟随浏览器",
      theme: "主题", themeAuto: "跟随时间（19:00~7:00 深色）", themeLight: "浅色", themeDark: "深色",
      wall: "壁纸", wallRandBing: "必应随机（每天 3 点更换）", wallRandPhoto: "随机图片（每天 3 点更换）",
      wallDaily: "必应今日", wallCustom: "自定义地址",
      wallUrlPh: "图片地址：https://… 或 file:///E:/…",
      dim: "壁纸压暗", sugg: "搜索联想词", hist: "搜索历史", quote: "一言",
      searchNT: "搜索在新标签页打开", shortcutNT: "快捷方式在新标签页打开",
      export: "导出 config.js", reset: "恢复 config.js 默认",
      note: "页面内的修改保存在浏览器本地。迁移浏览器时：点「导出」，用下载的文件覆盖项目里的 config.js。",
      confirmReset: "清除页面内的全部修改（磁贴编辑、设置），恢复为 config.js 的内容？",
      expand: "展开全部", collapse: "收起",
      hotkey: "快捷键",
      confirmDel: function (n) { return "删除「" + n + "」？"; },
      confirmDelFolder: function (n, c) { return "删除收纳夹「" + n + "」及其中 " + c + " 个快捷方式？"; },
    },
    en: {
      searchPh: "Search",
      engineTitle: "Switch search engine (Alt+number)",
      wallBtnTitle: "Next wallpaper",
      settingsTitle: "Settings",
      histTitle: "History", clear: "Clear", delHist: "Remove this entry",
      quoteTitle: "Click for another",
      add: "Add", edit: "Edit", rename: "Rename", del: "Delete", moveOut: "Move out of folder",
      dlgAdd: "Add", dlgEditLink: "Edit shortcut", dlgRenameFolder: "Rename folder",
      type: "Type", typeLink: "Shortcut", typeFolder: "Folder",
      name: "Name", url: "URL", icon: "Icon",
      urlPh: "https://… or file:///E:/…",
      iconPh: "Empty = auto brand icon; or an icon name (e.g. ri:github-fill), emoji, image URL",
      cancel: "Cancel", save: "Save",
      errName: "Name is required", errUrl: "URL is required",
      settings: "Settings", lang: "Language", langAuto: "Follow browser",
      theme: "Theme", themeAuto: "Auto (dark 19:00–7:00)", themeLight: "Light", themeDark: "Dark",
      wall: "Wallpaper", wallRandBing: "Bing random (rotates at 3 AM)", wallRandPhoto: "Random photo (rotates at 3 AM)",
      wallDaily: "Bing today", wallCustom: "Custom URL",
      wallUrlPh: "Image URL: https://… or file:///E:/…",
      dim: "Wallpaper dimming", sugg: "Search suggestions", hist: "Search history", quote: "Daily quote",
      searchNT: "Open searches in a new tab", shortcutNT: "Open shortcuts in a new tab",
      export: "Export config.js", reset: "Reset to config.js",
      note: "In-page changes are stored in this browser. To migrate: click Export and replace config.js in the project folder.",
      confirmReset: "Clear all in-page changes (shortcuts, settings) and restore config.js defaults?",
      expand: "Show all", collapse: "Collapse",
      hotkey: "hotkey",
      confirmDel: function (n) { return 'Delete "' + n + '"?'; },
      confirmDelFolder: function (n, c) { return 'Delete folder "' + n + '" and its ' + c + " shortcut(s)?"; },
    },
  };

  function resolveLang(v) {
    if (v !== "zh" && v !== "en") {
      return (navigator.language || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
    }
    return v;
  }
  var lang = resolveLang(conf.lang);

  function t(key) {
    var d = I18N[lang] || I18N.zh;
    return key in d ? d[key] : I18N.zh[key];
  }
  function applyI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
  }
  applyI18n();

  // ================= 主题 =================
  function isDarkNow() {
    if (conf.theme === "dark") return true;
    if (conf.theme === "light") return false;
    var h = new Date().getHours();
    return h >= 19 || h < 7;
  }
  function applyTheme() { document.body.classList.toggle("dark", isDarkNow()); }
  applyTheme();

  // ================= 时钟 =================
  var WEEKS = ["日", "一", "二", "三", "四", "五", "六"];
  var dateFmtEn = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" });
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = new Date();
    $("time").textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
    $("date").textContent = lang === "zh"
      ? (d.getMonth() + 1) + "月" + d.getDate() + "日 星期" + WEEKS[d.getDay()]
      : dateFmtEn.format(d);
    if (d.getSeconds() === 0) {
      applyTheme();   // 跟随时间的主题每分钟校验一次
      // 长期开着的标签页跨过凌晨 3 点时自动换壁纸
      var wd = wallDayKey();
      if (lastWallDay && wd !== lastWallDay) applyWallpaper(true);
    }
  }
  tick();
  setInterval(tick, 1000);

  // ================= 壁纸 =================
  var bg = $("bg");
  var wallBtn = $("wallBtn");
  function applyDim() { $("dim").style.opacity = conf.dim; }
  applyDim();

  var wallLoading = false;
  // fade=false：首次加载，走 CSS 的模糊入场；fade=true：切换时快速淡入淡出
  function showWall(src, fade) {
    if (!fade) {
      bg.style.backgroundImage = "url('" + src + "')";
      bg.classList.add("bg-loaded");
      return;
    }
    bg.style.transition = "opacity .35s ease";
    bg.style.opacity = "0";
    setTimeout(function () {
      bg.style.backgroundImage = "url('" + src + "')";
      bg.classList.add("bg-loaded");
      bg.style.opacity = "1";
      setTimeout(function () { bg.style.transition = ""; bg.style.opacity = ""; }, 500);
    }, 360);
  }
  function loadWall(src, fade, onFail) {
    wallLoading = true;
    wallBtn.classList.add("busy");
    var probe = new Image();
    probe.onload = function () {
      wallLoading = false;
      wallBtn.classList.remove("busy");
      showWall(src, fade);
    };
    probe.onerror = function () {
      wallLoading = false;
      wallBtn.classList.remove("busy");
      if (onFail) onFail();
    };
    probe.src = src;
  }
  // ---------- 壁纸时效：随机选取，当天内保持稳定，凌晨 3 点自动更换 ----------
  var WALL_KEY = "wallDaily";
  var lastWallDay;

  function wallDayKey() {
    var d = new Date(Date.now() - 3 * 3600 * 1000);   // 3 点前算前一天
    return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  }
  function wallState() {
    var st = null;
    try { st = JSON.parse(localStorage.getItem(WALL_KEY)); } catch (e) { }
    if (!st || st.day !== wallDayKey()) st = rerollWall();
    return st;
  }
  function rerollWall() {
    var st = { day: wallDayKey(), seed: Math.floor(Math.random() * 1e9) };
    localStorage.setItem(WALL_KEY, JSON.stringify(st));
    return st;
  }
  // 同一天内生成完全相同的 URL → 稳定复现同一张图；跨天种子更新 → 自动换新
  function seededSrc(mode, st) {
    return mode === "random-photo"
      ? "https://picsum.photos/seed/" + st.day + "-" + st.seed + "/3840/2160"
      : "https://bing.biturl.top/?resolution=UHD&format=image&mkt=zh-CN&index=" + (st.seed % 8) + "&d=" + st.day;
  }
  function loadDailyChain(fade) {
    // 带日期参数，避免浏览器缓存旧重定向导致"刷新老是同一张"
    var day = wallDayKey();
    var rest = conf.wallpaperSources.map(function (u) {
      return u + (u.indexOf("?") > -1 ? "&" : "?") + "d=" + day;
    });
    (function next() {
      if (!rest.length) { bg.classList.add("bg-fallback"); return; }
      loadWall(rest.shift(), fade, next);
    })();
  }
  function applyWallpaper(fade) {
    lastWallDay = wallDayKey();
    if (conf.wallMode === "custom" && conf.wallCustom) {
      loadWall(conf.wallCustom, fade, function () { loadDailyChain(fade); });
    } else if (conf.wallMode === "random-bing" || conf.wallMode === "random-photo") {
      loadWall(seededSrc(conf.wallMode, wallState()), fade, function () {
        // 种子源失败 → 真随机兜底 → 再失败走必应今日链
        loadWall("https://bing.img.run/rand_uhd.php?r=" + Date.now(), fade, function () { loadDailyChain(fade); });
      });
    } else {
      loadDailyChain(fade);
    }
  }
  applyWallpaper(false);

  // 换一张：重抽随机并写入当天状态（新抽到的同样保持到凌晨 3 点）
  wallBtn.onclick = function () {
    if (wallLoading) return;
    var st = rerollWall();
    var mode = conf.wallMode === "random-photo" ? "random-photo" : "random-bing";
    loadWall(seededSrc(mode, st), true, function () {
      loadWall("https://bing.img.run/rand_uhd.php?r=" + Date.now(), true, null);
    });
  };

  // ================= 图标（带加载结果缓存，避免失败图标反复闪烁） =================
  var ICON_KEY = "iconCache";
  var iconCache = (function () {
    try { return JSON.parse(localStorage.getItem(ICON_KEY)) || {}; }
    catch (e) { return {}; }
  })();
  function markIcon(src, ok) {
    // localhost 服务时开时关，失败不做负缓存，下次照常重试
    if (!ok && /^https?:\/\/(localhost|127\.0\.0\.1)[:\/]/i.test(src)) return;
    var v = ok ? "ok" : "bad";
    if (iconCache[src] === v) return;
    if (Object.keys(iconCache).length > 300) iconCache = {};
    iconCache[src] = v;
    localStorage.setItem(ICON_KEY, JSON.stringify(iconCache));
  }

  function hueOf(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }
  function makeLetter(name, cls) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = (name || "?").charAt(0).toUpperCase();
    var h = hueOf(name || "?");
    el.style.background = "linear-gradient(135deg, hsl(" + h + ",65%,55%), hsl(" + ((h + 45) % 360) + ",65%,42%))";
    return el;
  }
  function imgOrLetter(src, name, letterCls) {
    if (iconCache[src] === "bad") return makeLetter(name, letterCls);
    var img = document.createElement("img");
    img.alt = "";
    img.onload = function () { markIcon(src, true); };
    img.onerror = function () {
      markIcon(src, false);
      if (img.parentNode) img.parentNode.replaceChild(makeLetter(name, letterCls), img);
    };
    img.src = src;
    return img;
  }
  function isImgIcon(icon) {
    return /^(https?:|file:)/i.test(icon) || icon.indexOf("/") >= 0 ||
      /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(icon);
  }
  function isIconifyName(icon) { return /^[a-z0-9-]+:[a-z0-9-]+$/i.test(icon); }

  // 常见网站 → 官方品牌标（Iconify）+ 品牌色。按「域名+路径」匹配，更具体的规则放前面。
  var BRAND_ICONS = [
    [/(^|\.)bing\.com\/translator/,        "mdi:microsoft-bing",           "#0C8484"],
    [/(^|\.)bing\.com\//,                  "mdi:microsoft-bing",           "#0C8484"],
    [/^translate\.google\./,               "simple-icons:googletranslate", "#4285F4"],
    [/^mail\.google\./,                    "simple-icons:gmail",           "#EA4335"],
    [/^gemini\.google\./,                  "simple-icons:googlegemini",    "#8E75B2"],
    [/^maps\.google\.|google\.[a-z.]+\/maps/, "simple-icons:googlemaps",   "#34A853"],
    [/(^|\.)google\.[a-z.]+\//,            "ri:google-fill",               "#4285F4"],
    [/(^|\.)youtube\.com\//,               "ri:youtube-fill",              "#FF0000"],
    [/(^|\.)bilibili\.com\//,              "ri:bilibili-fill",             "#F25D8E"],
    [/(^|\.)github\.com\//,                "ri:github-fill",               "#24292F"],
    [/(^|\.)amazon\.[a-z.]+\//,            "ri:amazon-fill",               "#FF9900"],
    [/(^|\.)claude\.ai\//,                 "simple-icons:claude",          "#D97757"],
    [/(^|\.)anthropic\.com\//,             "simple-icons:anthropic",       "#D97757"],
    [/(^|\.)(chatgpt|openai)\.com\//,      "ri:openai-fill",               "#10A37F"],
    [/(^|\.)deepseek\.com\//,              "simple-icons:deepseek",        "#4D6BFE"],
    [/(^|\.)(aliyun|alibabacloud)\.com\//, "simple-icons:alibabacloud",    "#FF6A00"],
    [/(^|\.)(taobao|tmall)\.com\//,        "ri:taobao-fill",               "#FF5000"],
    [/(^|\.)alipay\.com\//,                "ri:alipay-fill",               "#1677FF"],
    [/(^|\.)ilovepdf\.com\//,              "simple-icons:ilovepdf",        "#E5322D"],
    [/(^|\.)azure\.com\/|microsoft\.com\/[^?#]*azure/, "mdi:microsoft-azure", "#0078D4"],
    [/^outlook\.(live|office)\.com\//,     "mdi:microsoft-outlook",        "#0078D4"],
    [/^teams\.microsoft\.com\//,           "mdi:microsoft-teams",          "#6264A7"],
    [/(^|\.)(office|microsoft365)\.com\//, "mdi:microsoft-office",         "#D83B01"],
    [/(^|\.)microsoft\.com\//,             "ri:microsoft-fill",            "#0078D4"],
    [/(^|\.)(wx|weixin)\.qq\.com\//,       "ri:wechat-fill",               "#07C160"],
    [/(^|\.)qq\.com\//,                    "ri:qq-fill",                   "#12B7F5"],
    [/(^|\.)baidu\.com\//,                 "ri:baidu-fill",                "#2932E1"],
    [/(^|\.)zhihu\.com\//,                 "ri:zhihu-fill",                "#0066FF"],
    [/(^|\.)weibo\.com\//,                 "ri:weibo-fill",                "#E6162D"],
    [/(^|\.)douban\.com\//,                "ri:douban-fill",               "#2E963D"],
    [/^music\.163\.com\//,                 "ri:netease-cloud-music-fill",  "#E60026"],
    [/(^|\.)xiaohongshu\.com\//,           "simple-icons:xiaohongshu",     "#FF2442"],
    [/(^|\.)(douyin|tiktok)\.com\//,       "ri:tiktok-fill",               "#111111"],
    [/(^|\.)(x|twitter)\.com\//,           "ri:twitter-x-fill",            "#111111"],
    [/(^|\.)reddit\.com\//,                "ri:reddit-fill",               "#FF4500"],
    [/(^|\.)notion\.(so|com)\//,           "ri:notion-fill",               "#191919"],
    [/(^|\.)figma\.com\//,                 "ri:figma-fill",                "#F24E1E"],
    [/(^|\.)spotify\.com\//,               "ri:spotify-fill",              "#1DB954"],
    [/(^|\.)netflix\.com\//,               "ri:netflix-fill",              "#E50914"],
    [/(^|\.)gitee\.com\//,                 "simple-icons:gitee",           "#C71D23"],
    [/(^|\.)juejin\.cn\//,                 "simple-icons:juejin",          "#1E80FF"],
    [/(^|\.)csdn\.net\//,                  "simple-icons:csdn",            "#FC5531"],
    [/(^|\.)stackoverflow\.com\//,         "simple-icons:stackoverflow",   "#F58025"],
    [/(^|\.)cloudflare\.com\//,            "simple-icons:cloudflare",      "#F38020"],
    [/(^|\.)vercel\.com\//,                "simple-icons:vercel",          "#111111"],
  ];
  function brandOf(url) {
    var u;
    try { u = new URL(url); } catch (e) { return null; }   // 相对路径
    if (!/^https?:$/.test(u.protocol)) return null;        // file:// 本地页面不匹配
    var key = u.hostname.toLowerCase() + u.pathname.toLowerCase();
    for (var i = 0; i < BRAND_ICONS.length; i++) {
      if (BRAND_ICONS[i][0].test(key)) return { icon: BRAND_ICONS[i][1], color: BRAND_ICONS[i][2] };
    }
    return null;
  }

  // 磁贴图标优先级：手填 icon（图标名 / 图片 / emoji）> 网址匹配的官方品牌标 > 首字渐变方块
  function renderTileVisual(box, item) {
    var icon = item.icon;
    var iconifyReady = !!(window.customElements && customElements.get("iconify-icon"));
    var brand = brandOf(item.url);
    var glyph = icon && isIconifyName(icon) ? icon : (!icon && brand ? brand.icon : null);
    if (glyph && iconifyReady) {
      var color = item.color || (brand && brand.color);
      if (!color) { var h = hueOf(item.name || "?"); color = "hsl(" + h + ",58%,48%)"; }
      box.classList.add("glyph");
      box.style.setProperty("--brand", color);
      var ic = document.createElement("iconify-icon");
      ic.setAttribute("icon", glyph);
      box.appendChild(ic);
    } else if (icon && isImgIcon(icon)) {
      box.appendChild(imgOrLetter(icon, item.name, "letter-badge"));
    } else if (icon && !isIconifyName(icon)) {
      box.textContent = icon;                                  // emoji
    } else {
      box.appendChild(makeLetter(item.name, "letter-badge"));  // 图标库不可用 / 无匹配
    }
  }

  // ================= 搜索引擎 =================
  var engines = conf.engines;
  var currentKey = localStorage.getItem("engineKey") || engines[0].key;
  var engineBtn = $("engineBtn");
  var engineMenu = $("engineMenu");
  var input = $("q");

  function currentEngine() {
    for (var i = 0; i < engines.length; i++) if (engines[i].key === currentKey) return engines[i];
    return engines[0];
  }
  function setEngine(key) {
    currentKey = key;
    localStorage.setItem("engineKey", key);
    renderEngineBtn();
  }
  // 引擎图标交给 Iconify 图标库（<iconify-icon> Web Component）：
  // 按需从 CDN 加载、自动缓存、尺寸统一，颜色继承 currentColor。
  // icon 字段填 Iconify 图标名（如 "ri:google-fill"）；留空显示名称首字。
  function engineIconNode(e) {
    var box = document.createElement("span");
    box.className = "eng-ico";
    if (e.color) {
      box.classList.add("brand");
      box.style.setProperty("--brand", e.color);
      if (e.colorDark) box.style.setProperty("--brand-dark", e.colorDark);
    }
    if (e.icon && e.icon.indexOf(":") > -1 && window.customElements) {
      var ic = document.createElement("iconify-icon");
      ic.setAttribute("icon", e.icon);
      box.appendChild(ic);
    } else {
      box.textContent = (e.name || "?").charAt(0).toUpperCase();   // 无图标 / 库不可用 → 首字
    }
    return box;
  }
  function renderEngineBtn() {
    engineBtn.innerHTML = "";
    engineBtn.appendChild(engineIconNode(currentEngine()));
  }
  renderEngineBtn();

  function renderEngineMenu() {
    engineMenu.innerHTML = "";
    engines.forEach(function (e, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "eng-item" + (e.key === currentKey ? " on" : "");
      b.appendChild(engineIconNode(e));
      var sp = document.createElement("span");
      sp.className = "eng-name";
      sp.textContent = e.name;
      b.appendChild(sp);
      if (i < 9) {
        var hint = document.createElement("i");
        hint.className = "hint";
        hint.textContent = "Alt+" + (i + 1);
        b.appendChild(hint);
      }
      var choose = function () { setEngine(e.key); closeMenus(); input.focus(); };
      // mousedown 抢在输入框失焦（及搜索框缩放）之前触发，避免点击落空；
      // click 兜底键盘与程序化触发，时间戳防止同一次按压执行两遍
      var downAt = 0;
      b.onmousedown = function (ev) { ev.preventDefault(); ev.stopPropagation(); downAt = Date.now(); choose(); };
      b.onclick = function (ev) { ev.stopPropagation(); if (Date.now() - downAt > 500) choose(); };
      engineMenu.appendChild(b);
    });
  }

  function toggleEngineMenu() {
    hideSugg();
    if (engineMenu.hidden) {
      renderEngineMenu();
      engineMenu.hidden = false;
      input.focus();   // 菜单展开时保持 focus-within，搜索框凝实、菜单不被失焦模糊波及
    } else {
      engineMenu.hidden = true;
    }
  }
  var engineDownAt = 0;
  engineBtn.onmousedown = function (ev) { ev.preventDefault(); ev.stopPropagation(); engineDownAt = Date.now(); toggleEngineMenu(); };
  engineBtn.onclick = function (ev) { ev.stopPropagation(); if (Date.now() - engineDownAt > 500) toggleEngineMenu(); };

  document.addEventListener("click", function (ev) {
    var hadOpen = !engineMenu.hidden || !suggEl.hidden;
    if (!$("search").contains(ev.target)) closeMenus();
    // 空白处左键 → 回到搜索视图（用于关闭菜单/右键菜单的那次点击不算）
    if (isBlank(ev.target) && !hadOpen && overlay.hidden && Date.now() - ctxClosedAt > 300) {
      showView("search");
    }
  });
  function closeMenus() {
    engineMenu.hidden = true;
    hideSugg();
  }

  // ================= 搜索 =================
  function doSearch(q) {
    q = (q || "").trim();
    if (!q) return;
    addHistory(q);
    var url = currentEngine().url.replace("{q}", encodeURIComponent(q));
    if (conf.searchInNewTab) window.open(url);
    else location.href = url;
  }
  $("searchForm").onsubmit = function (ev) {
    ev.preventDefault();
    doSearch(input.value);
  };

  // ================= 搜索历史 =================
  var HIST_KEY = "searchHistory";

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(list) { localStorage.setItem(HIST_KEY, JSON.stringify(list)); }
  function addHistory(q) {
    if (!conf.history) return;
    var l = getHistory().filter(function (x) { return x !== q; });
    l.unshift(q);
    if (l.length > 20) l.length = 20;
    saveHistory(l);
  }
  function showHistory() {
    if (!conf.history) return;
    if (input.value.trim()) return;
    var h = getHistory();
    if (h.length) renderPanel(h, true);
    else hideSugg();
  }

  // 历史只在【主动点击】搜索框时弹出，绝不挂在 focus 上——
  // Chrome 新标签页焦点在地址栏，用户第一次点击页面任意处时，窗口激活会先给
  // autofocus 的输入框补发 focus 事件；若此时弹历史，面板会在同一次按压中
  // 出现在指针正下方，mousedown 直接命中历史项，造成"隐形误点"直接跳转。
  input.addEventListener("click", function () {
    if (suggEl.hidden) showHistory();
  });

  // ================= 联想词（百度 JSONP，UTF-8） =================
  var suggEl = $("sugg");
  var suggItems = [];
  var suggIndex = -1;
  var suggSeq = 0;
  var suggTimer = null;
  var panelShownAt = 0;
  // 面板刚出现 200ms 内忽略 mousedown：防止面板恰好展开在按压中的指针下方被"隐形误点"
  function panelTooFresh() { return Date.now() - panelShownAt < 200; }

  input.addEventListener("input", function () {
    clearTimeout(suggTimer);
    var q = input.value.trim();
    if (!q) { showHistory(); return; }               // 清空内容 → 回到历史
    if (!conf.suggestions) { hideSugg(); return; }
    suggTimer = setTimeout(function () { fetchSugg(q); }, 150);
  });

  function fetchSugg(q) {
    var seq = ++suggSeq;
    var cb = "__sugg" + seq;
    window[cb] = function (data) {
      window[cb] = undefined;
      if (seq !== suggSeq) return;
      renderPanel((data && data.s) || [], false);
    };
    var s = document.createElement("script");
    s.src = "https://suggestion.baidu.com/su?wd=" + encodeURIComponent(q) + "&ie=utf-8&oe=utf-8&cb=" + cb;
    s.onload = s.onerror = function () { s.remove(); };
    document.head.appendChild(s);
  }

  // 联想词与搜索历史共用同一个下拉面板
  function renderPanel(list, isHistory) {
    engineMenu.hidden = true;
    suggItems = list.slice(0, isHistory ? 10 : 8);
    suggIndex = -1;
    if (!suggItems.length || document.activeElement !== input) { hideSugg(); return; }
    suggEl.innerHTML = "";

    if (isHistory) {
      var head = document.createElement("li");
      head.className = "pop-head";
      var label = document.createElement("span");
      label.textContent = t("histTitle");
      var clear = document.createElement("button");
      clear.type = "button";
      clear.textContent = t("clear");
      clear.onmousedown = function (ev) {
        if (panelTooFresh()) return;
        ev.preventDefault(); ev.stopPropagation();
        saveHistory([]);
        hideSugg();
      };
      head.appendChild(label);
      head.appendChild(clear);
      suggEl.appendChild(head);
    }

    suggItems.forEach(function (text, i) {
      var li = document.createElement("li");
      li.className = "sugg-item";
      var txt = document.createElement("span");
      txt.className = "txt";
      txt.textContent = text;
      li.appendChild(txt);
      if (isHistory) {
        var del = document.createElement("button");
        del.type = "button";
        del.className = "del";
        del.textContent = "×";
        del.title = t("delHist");
        del.onmousedown = function (ev) {
          if (panelTooFresh()) return;
          ev.preventDefault(); ev.stopPropagation();
          saveHistory(getHistory().filter(function (x) { return x !== text; }));
          showHistory();
        };
        li.appendChild(del);
      }
      // mousedown 早于 input 失焦，保证点击可靠触发
      li.onmousedown = function (ev) {
        if (panelTooFresh()) return;
        ev.preventDefault();
        doSearch(text);
      };
      li.onmouseenter = function () { setSuggIndex(i, false); };
      suggEl.appendChild(li);
    });
    if (suggEl.hidden) panelShownAt = Date.now();   // 仅记录"从隐藏到出现"的时刻
    suggEl.hidden = false;
  }

  function setSuggIndex(i, fill) {
    suggIndex = i;
    var nodes = suggEl.querySelectorAll(".sugg-item");
    for (var k = 0; k < nodes.length; k++) nodes[k].classList.toggle("on", k === i);
    if (fill && i >= 0) input.value = suggItems[i];
  }
  function hideSugg() {
    suggEl.hidden = true;
    suggEl.innerHTML = "";
    suggItems = [];
    suggIndex = -1;
  }

  input.addEventListener("keydown", function (ev) {
    if (ev.isComposing) return;   // 中文输入法组词期间不劫持按键
    if (suggEl.hidden || !suggItems.length) return;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      var n = suggItems.length;
      setSuggIndex(ev.key === "ArrowDown" ? (suggIndex + 1) % n : (suggIndex - 1 + n) % n, true);
    } else if (ev.key === "Escape") {
      hideSugg();
    }
  });
  input.addEventListener("blur", function () {
    setTimeout(function () { if (document.activeElement !== input) hideSugg(); }, 120);
  });

  // ================= 一言 / Daily quote（来源随语言切换） =================
  var hk = $("hitokoto");
  function loadQuote() {
    var req;
    if (lang === "en") {
      req = fetch("https://dummyjson.com/quotes/random")
        .then(function (r) { return r.json(); })
        .then(function (d) { hk.textContent = "“" + d.quote + "” — " + d.author; });
    } else {
      // 今日诗词：纯唐诗宋词单句，带作者与出处；失败退回 hitokoto 诗词分类
      req = fetch("https://v1.jinrishici.com/all.json")
        .then(function (r) { return r.json(); })
        .then(function (d) { hk.textContent = d.content + "  —— " + d.author + "《" + d.origin + "》"; })
        .catch(function () {
          return fetch("https://v1.hitokoto.cn/?c=i&max_length=30")
            .then(function (r) { return r.json(); })
            .then(function (d) { hk.textContent = d.hitokoto + (d.from ? "  —— " + d.from : ""); });
        });
    }
    req.then(function () { hk.classList.add("show"); })
      .catch(function () { /* 接口不可用则保持隐藏 */ });
  }
  function applyHitokoto() {
    hk.style.display = conf.hitokoto ? "" : "none";
    if (conf.hitokoto && !hk.textContent) loadQuote();
  }
  hk.title = t("quoteTitle");
  hk.onclick = loadQuote;
  applyHitokoto();

  // ================= 快捷方式（渲染 / 收纳夹 / 编辑 / 拖拽） =================
  var grid = $("grid");
  var gridToggle = $("gridToggle");
  var gridExpanded = localStorage.getItem("gridExpanded") === "1";
  var openFolderIdx = -1;   // 当前打开的收纳夹在 conf.shortcuts 里的下标

  function isFolder(item) { return !!item && Object.prototype.toString.call(item.items) === "[object Array]"; }

  function buildTileIcon(item) {
    var box = document.createElement("div");
    if (isFolder(item)) {
      box.className = "tile-icon folder";
      item.items.slice(0, 4).forEach(function (child) {
        var mini = document.createElement("div");
        mini.className = "mini";
        renderTileVisual(mini, child);
        box.appendChild(mini);
      });
      if (!item.items.length) {
        var empty = document.createElement("div");
        empty.className = "mini";
        box.appendChild(empty);
      }
    } else {
      box.className = "tile-icon";
      renderTileVisual(box, item);
    }
    return box;
  }

  function openLink(item) {
    if (conf.shortcutInNewTab) window.open(item.url);
    else location.href = item.url;
  }

  // list: 所属数组；folderIdx: -1 表示顶层
  function makeTile(item, i, folderIdx) {
    var el;
    if (isFolder(item)) {
      el = document.createElement("div");
      el.onclick = function () { openFolder(i); };
    } else {
      el = document.createElement("a");
      el.href = item.url;
      if (conf.shortcutInNewTab) el.target = "_blank";
    }
    el.className = "tile";
    el.style.setProperty("--i", i);
    if (folderIdx < 0 && i < 9) el.title = item.name + " — " + t("hotkey") + " " + (i + 1);
    el.appendChild(buildTileIcon(item));
    var nm = document.createElement("div");
    nm.className = "tile-name";
    nm.textContent = item.name;
    el.appendChild(nm);

    // 右键菜单
    el.oncontextmenu = function (ev) {
      ev.preventDefault();
      showCtxMenu(ev.clientX, ev.clientY, item, i, folderIdx);
    };

    // 手机 app 式拖拽排序（pointer 驱动 + FLIP 让位，引擎见下方 beginDragCandidate）
    el.draggable = false;   // 关掉 <a>/img 原生拖拽，避免与自定义拖拽冲突
    el.addEventListener("pointerdown", function (ev) {
      if (ev.button === 0) beginDragCandidate(ev, el, i, folderIdx);
    });
    return el;
  }

  // ---------- 拖拽排序引擎 ----------
  function tileList(folderIdx) {
    return folderIdx < 0 ? conf.shortcuts : conf.shortcuts[folderIdx].items;
  }

  // FLIP：记录旧位 → 改 DOM → 反算位移，从旧位平滑滑到新位。
  // 占位件不参与（它被浮起副本遮住，动它会穿帮）。
  function flip(container, mutate) {
    var kids = [].slice.call(container.children).filter(function (k) {
      return !k.classList.contains("drag-placeholder");
    });
    var first = kids.map(function (k) { return k.getBoundingClientRect(); });
    mutate();
    kids.forEach(function (k, idx) {
      var last = k.getBoundingClientRect();
      var dx = first[idx].left - last.left, dy = first[idx].top - last.top;
      if (!dx && !dy) return;
      k.style.transition = "none";
      k.style.transform = "translate(" + dx + "px," + dy + "px)";
      k.getBoundingClientRect();   // 强制回流，固定动画起点
      requestAnimationFrame(function () {
        k.style.transition = "transform .28s var(--ease-out)";
        k.style.transform = "";
      });
    });
  }

  // 拖拽后紧跟的那次 click（会打开链接/收纳夹）需要拦掉
  var justDragged = false;
  document.addEventListener("click", function (ev) {
    if (justDragged) { ev.preventDefault(); ev.stopPropagation(); justDragged = false; }
  }, true);

  function beginDragCandidate(ev, el, index, folderIdx) {
    var startX = ev.clientX, startY = ev.clientY;
    var container = folderIdx < 0 ? grid : $("folderGrid");
    var started = false, ghost = null, initRect = null;
    var curIndex = index, dropFolderEl = null, dropFolderIdx = -1;

    function onMove(e) {
      if (!started) {
        if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) return;
        start();
      }
      ghost.style.transform = "translate(" + (e.clientX - startX) + "px," + (e.clientY - startY) + "px)";
      hover(e.clientX, e.clientY);
    }
    function onUp() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      if (started) finish();
    }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);

    function start() {
      started = true;
      justDragged = true;
      initRect = el.getBoundingClientRect();
      ghost = el.cloneNode(true);
      ghost.classList.add("drag-ghost");
      ghost.style.left = initRect.left + "px";
      ghost.style.top = initRect.top + "px";
      ghost.style.width = initRect.width + "px";
      ghost.style.height = initRect.height + "px";
      ghost.style.transform = "translate(0,0)";
      document.body.appendChild(ghost);
      el.classList.add("drag-placeholder");
    }

    function clearFolder() {
      if (dropFolderEl) { dropFolderEl.classList.remove("drop-into"); dropFolderEl = null; dropFolderIdx = -1; }
    }

    function hover(x, y) {
      var kids = [].slice.call(container.querySelectorAll(".tile:not(.add)"));
      var overIdx = -1, overEl = null;
      for (var k = 0; k < kids.length; k++) {
        var r = kids[k].getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { overIdx = k; overEl = kids[k]; break; }
      }
      if (overEl !== dropFolderEl) clearFolder();
      if (overIdx < 0 || overEl === el) return;
      var list = tileList(folderIdx);
      // 顶层：普通磁贴悬停在收纳夹上 → 放入模式（高亮，不排序）
      if (folderIdx < 0 && isFolder(list[overIdx]) && !isFolder(list[curIndex])) {
        overEl.classList.add("drop-into");
        dropFolderEl = overEl; dropFolderIdx = overIdx;
        return;
      }
      if (overIdx === curIndex) return;
      // 实时排序 + FLIP 让位
      flip(container, function () {
        var moved = list.splice(curIndex, 1)[0];
        list.splice(overIdx, 0, moved);
        if (overIdx > curIndex) overEl.after(el); else overEl.before(el);
        curIndex = overIdx;
      });
    }

    function finish() {
      var list = tileList(folderIdx);
      if (dropFolderEl) {                        // 放入收纳夹
        dropFolderEl.classList.remove("drop-into");
        var fIdx = dropFolderIdx > curIndex ? dropFolderIdx - 1 : dropFolderIdx;
        var moved = list.splice(curIndex, 1)[0];
        list[fIdx].items.push(moved);
        ghost.remove();
        el.classList.remove("drag-placeholder");
        saveShortcuts();
        renderGrid();
        return;
      }
      // 排序落位：浮起副本平滑归位到占位处，再收尾重绘
      var finalRect = el.getBoundingClientRect();
      ghost.style.transition = "transform .2s var(--ease-out)";
      ghost.style.transform = "translate(" + (finalRect.left - initRect.left) + "px," + (finalRect.top - initRect.top) + "px)";
      var g = ghost; ghost = null;
      setTimeout(function () {
        g.remove();
        el.classList.remove("drag-placeholder");
        saveShortcuts();
        folderIdx < 0 ? renderGrid() : renderFolder();
      }, 300);
    }
  }

  function makeAddTile(folderIdx) {
    var el = document.createElement("div");
    el.className = "tile add";
    var box = document.createElement("div");
    box.className = "tile-icon";
    box.textContent = "+";
    el.appendChild(box);
    var nm = document.createElement("div");
    nm.className = "tile-name";
    nm.textContent = t("add");
    el.appendChild(nm);
    el.onclick = function () { openEditDlg(folderIdx < 0 ? { mode: "add-top" } : { mode: "add-in-folder", folderIdx: folderIdx }); };
    return el;
  }

  function renderGrid() {
    grid.innerHTML = "";
    var maxV = conf.gridMaxVisible;
    conf.shortcuts.forEach(function (item, i) {
      var t = makeTile(item, i, -1);
      if (maxV && i >= maxV) t.classList.add("extra");
      grid.appendChild(t);
    });
    grid.appendChild(makeAddTile(-1));

    var needToggle = maxV && conf.shortcuts.length > maxV;
    gridToggle.hidden = !needToggle;
    grid.classList.toggle("expanded", gridExpanded);
    gridToggle.classList.toggle("open", gridExpanded);
    gridToggle.title = gridExpanded ? t("collapse") : t("expand");
  }
  gridToggle.onclick = function () {
    gridExpanded = !gridExpanded;
    localStorage.setItem("gridExpanded", gridExpanded ? "1" : "0");
    grid.classList.toggle("expanded", gridExpanded);
    gridToggle.classList.toggle("open", gridExpanded);
    gridToggle.title = gridExpanded ? t("collapse") : t("expand");
  };
  renderGrid();
  // 首次入场动画播完后，后续增删/排序不再重播
  setTimeout(function () { grid.classList.add("loaded"); }, 1200);

  // ---------- 收纳夹弹层 ----------
  function openFolder(idx) {
    openFolderIdx = idx;
    renderFolder();
    openModal($("folderPop"));
  }
  function renderFolder() {
    var folder = conf.shortcuts[openFolderIdx];
    if (!folder) return;
    $("folderTitle").textContent = folder.name;
    var fg = $("folderGrid");
    fg.innerHTML = "";
    folder.items.forEach(function (item, i) { fg.appendChild(makeTile(item, i, openFolderIdx)); });
    fg.appendChild(makeAddTile(openFolderIdx));
  }

  // ---------- 右键菜单 ----------
  var ctxMenu = $("ctxMenu");
  function showCtxMenu(x, y, item, i, folderIdx) {
    ctxMenu.innerHTML = "";
    function addItem(text, danger, fn) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      if (danger) b.className = "danger";
      b.onclick = function () { hideCtxMenu(); fn(); };
      ctxMenu.appendChild(b);
    }
    addItem(isFolder(item) ? t("rename") : t("edit"), false, function () {
      openEditDlg({ mode: "edit", index: i, folderIdx: folderIdx });
    });
    if (folderIdx >= 0) {
      addItem(t("moveOut"), false, function () {
        conf.shortcuts[folderIdx].items.splice(i, 1);
        conf.shortcuts.push(item);
        saveShortcuts();
        renderGrid();
        renderFolder();
      });
    }
    addItem(t("del"), true, function () {
      var list = folderIdx < 0 ? conf.shortcuts : conf.shortcuts[folderIdx].items;
      var tip = isFolder(item) && item.items.length
        ? t("confirmDelFolder")(item.name, item.items.length)
        : t("confirmDel")(item.name);
      if (!confirm(tip)) return;
      list.splice(i, 1);
      saveShortcuts();
      folderIdx < 0 ? renderGrid() : renderFolder();
    });
    ctxMenu.hidden = false;
    // 防止菜单超出视口
    var r = ctxMenu.getBoundingClientRect();
    ctxMenu.style.left = Math.min(x, innerWidth - r.width - 8) + "px";
    ctxMenu.style.top = Math.min(y, innerHeight - r.height - 8) + "px";
  }
  var ctxClosedAt = 0;
  function hideCtxMenu() {
    if (!ctxMenu.hidden) ctxClosedAt = Date.now();
    ctxMenu.hidden = true;
  }
  document.addEventListener("mousedown", function (ev) {
    if (!ctxMenu.hidden && !ctxMenu.contains(ev.target)) hideCtxMenu();
  });

  // ---------- 编辑对话框 ----------
  var dlgCtx = null;   // { mode, index?, folderIdx? }
  function dlgType() {
    var r = document.querySelector('input[name="dlgType"]:checked');
    return r ? r.value : "link";
  }
  function setDlgType(v) {
    document.querySelectorAll('input[name="dlgType"]').forEach(function (r) { r.checked = r.value === v; });
    applyDlgTypeUI();
  }
  function applyDlgTypeUI() {
    var folderMode = dlgType() === "folder";
    $("dlgUrlRow").style.display = folderMode ? "none" : "";
    $("dlgIconRow").style.display = folderMode ? "none" : "";
  }
  document.querySelectorAll('input[name="dlgType"]').forEach(function (r) { r.onchange = applyDlgTypeUI; });

  function openEditDlg(ctx) {
    dlgCtx = ctx;
    $("dlgErr").textContent = "";
    var editing = null;
    if (ctx.mode === "edit") {
      var list = ctx.folderIdx < 0 ? conf.shortcuts : conf.shortcuts[ctx.folderIdx].items;
      editing = list[ctx.index];
    }
    $("dlgTitle").textContent = ctx.mode === "edit"
      ? (isFolder(editing) ? t("dlgRenameFolder") : t("dlgEditLink"))
      : t("dlgAdd");
    // 类型选择仅在顶层新增时出现；收纳夹内只能加快捷方式
    $("dlgTypeRow").style.display = ctx.mode === "add-top" ? "" : "none";
    setDlgType(editing && isFolder(editing) ? "folder" : "link");
    if (ctx.mode !== "add-top" && editing && isFolder(editing)) {
      $("dlgUrlRow").style.display = "none";
      $("dlgIconRow").style.display = "none";
    }
    $("dlgName").value = editing ? editing.name : "";
    $("dlgUrl").value = (editing && editing.url) || "";
    $("dlgIcon").value = (editing && editing.icon) || "";
    openModal($("editDlg"));
    $("dlgName").focus();
  }

  $("dlgCancel").onclick = function () {
    if (openFolderIdx >= 0) { renderFolder(); openModal($("folderPop")); }
    else closeModal();
  };
  $("dlgOk").onclick = function () {
    var name = $("dlgName").value.trim();
    var url = $("dlgUrl").value.trim();
    var icon = $("dlgIcon").value.trim();
    var folderMode = dlgType() === "folder";
    if (!name) { $("dlgErr").textContent = t("errName"); return; }
    if (!folderMode && !url && !(dlgCtx.mode === "edit" && isFolderTarget())) {
      $("dlgErr").textContent = t("errUrl"); return;
    }

    function isFolderTarget() {
      if (dlgCtx.mode !== "edit") return false;
      var list = dlgCtx.folderIdx < 0 ? conf.shortcuts : conf.shortcuts[dlgCtx.folderIdx].items;
      return isFolder(list[dlgCtx.index]);
    }

    if (dlgCtx.mode === "add-top") {
      conf.shortcuts.push(folderMode ? { name: name, items: [] } : itemOf());
      // 新磁贴落在折叠区时自动展开，避免"添加了却看不见"
      if (conf.gridMaxVisible && conf.shortcuts.length > conf.gridMaxVisible && !gridExpanded) {
        gridExpanded = true;
        localStorage.setItem("gridExpanded", "1");
      }
    } else if (dlgCtx.mode === "add-in-folder") {
      conf.shortcuts[dlgCtx.folderIdx].items.push(itemOf());
    } else {
      var list = dlgCtx.folderIdx < 0 ? conf.shortcuts : conf.shortcuts[dlgCtx.folderIdx].items;
      var it = list[dlgCtx.index];
      it.name = name;
      if (!isFolder(it)) {
        it.url = url;
        if (icon) it.icon = icon; else delete it.icon;
      }
    }

    function itemOf() {
      var o = { name: name, url: url };
      if (icon) o.icon = icon;
      return o;
    }

    saveShortcuts();
    renderGrid();
    // 在收纳夹内新增/编辑后回到收纳夹弹层，其余情况全部关闭
    if (dlgCtx.folderIdx != null && dlgCtx.folderIdx >= 0) {
      renderFolder();
      openModal($("folderPop"));
    } else {
      closeModal();
    }
  };
  // 对话框内回车 = 保存
  $("editDlg").addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") { ev.preventDefault(); $("dlgOk").click(); }
  });

  // ---------- 设置面板 ----------
  var settingsDlg = $("settingsDlg");
  function syncWallUrlRow() {
    $("setWallUrlRow").style.display = conf.wallMode === "custom" ? "" : "none";
  }
  $("settingsBtn").onclick = function () {
    $("setLang").value = conf.lang;
    $("setTheme").value = conf.theme;
    $("setWall").value = conf.wallMode;
    $("setWallUrl").value = conf.wallCustom;
    syncWallUrlRow();
    $("setDim").value = Math.round(conf.dim * 100);
    $("setSugg").checked = conf.suggestions;
    $("setHist").checked = conf.history;
    $("setHito").checked = conf.hitokoto;
    $("setSearchNT").checked = conf.searchInNewTab;
    $("setShortNT").checked = conf.shortcutInNewTab;
    openModal(settingsDlg);
  };
  $("setLang").onchange = function () {
    saveSetting("lang", this.value);
    lang = resolveLang(this.value);
    applyI18n();
    tick();                                   // 日期格式立即切换
    hk.title = t("quoteTitle");
    if (conf.hitokoto) { hk.classList.remove("show"); loadQuote(); }   // 一言换语言来源
    renderGrid();                             // "添加"磁贴、快捷键提示等重绘
  };
  $("setTheme").onchange = function () { saveSetting("theme", this.value); applyTheme(); };
  $("setWall").onchange = function () {
    saveSetting("wallMode", this.value);
    syncWallUrlRow();
    if (this.value !== "custom" || conf.wallCustom) applyWallpaper(true);
  };
  $("setWallUrl").onchange = function () {
    saveSetting("wallCustom", this.value.trim());
    if (conf.wallMode === "custom" && conf.wallCustom) applyWallpaper(true);
  };
  // 拖动中只更新视觉，松手才写入存储，避免高频写 localStorage
  $("setDim").oninput = function () { conf.dim = this.value / 100; applyDim(); };
  $("setDim").onchange = function () { saveSetting("dim", this.value / 100); };
  $("setSugg").onchange = function () { saveSetting("suggestions", this.checked); };
  $("setHist").onchange = function () { saveSetting("history", this.checked); };
  $("setHito").onchange = function () { saveSetting("hitokoto", this.checked); applyHitokoto(); };
  $("setSearchNT").onchange = function () { saveSetting("searchInNewTab", this.checked); };
  $("setShortNT").onchange = function () { saveSetting("shortcutInNewTab", this.checked); renderGrid(); };

  // 导出 config.js：把「基准 + 页面内修改」合并成完整配置文件下载
  $("btnExport").onclick = function () {
    var out = {
      theme: conf.theme,
      wallpaper: { mode: conf.wallMode, custom: conf.wallCustom, sources: conf.wallpaperSources, dim: conf.dim },
      engines: conf.engines,
      searchInNewTab: conf.searchInNewTab,
      suggestions: conf.suggestions,
      hitokoto: conf.hitokoto,
      history: conf.history,
      shortcuts: conf.shortcuts,
      shortcutInNewTab: conf.shortcutInNewTab,
      gridMaxVisible: conf.gridMaxVisible,
    };
    var text = "// 起始页配置（由设置面板导出）\n" +
      "// 迁移方法：用本文件覆盖项目里的 config.js，然后在设置面板点「恢复 config.js 默认」\n" +
      "// 清除浏览器内的本地修改，避免新旧数据混淆。\n" +
      "const CONFIG = " + JSON.stringify(out, null, 2) + ";\n";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = "config.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  $("btnReset").onclick = function () {
    if (!confirm(t("confirmReset"))) return;
    localStorage.removeItem(OVR_KEY);
    location.reload();
  };

  // ---------- 弹层管理 ----------
  var overlay = $("overlay");
  function openModal(el) {
    [$("folderPop"), $("editDlg"), settingsDlg].forEach(function (m) { m.hidden = m !== el; });
    overlay.hidden = false;
  }
  function closeModal() {
    overlay.hidden = true;
    [$("folderPop"), $("editDlg"), settingsDlg].forEach(function (m) { m.hidden = true; });
    openFolderIdx = -1;
  }
  overlay.addEventListener("mousedown", function (ev) {
    if (ev.target === overlay) closeModal();
  });

  // ================= 视图切换（搜索 ↔ 应用，参考青柠交互） =================
  var viewSearch = $("viewSearch");
  var viewApps = $("viewApps");

  function showView(name) {
    var apps = name === "apps";
    if (viewApps.hidden !== apps) return;   // 已在目标视图
    viewApps.hidden = !apps;
    viewSearch.hidden = apps;
    if (apps) { closeMenus(); input.blur(); }
    else input.focus();   // 历史不再挂在 focus 上，聚焦不会弹面板
  }

  // "空白处"：页面背景、时钟日期、视图容器本身（不含磁贴/搜索框/弹层等交互元素）
  function isBlank(t) {
    return t === document.documentElement || t === document.body ||
      t === $("time") || t === $("date") || t === grid ||
      !!(t.classList && (t.classList.contains("wrap") || t.classList.contains("view") ||
        t.classList.contains("search-area")));
  }

  // 空白处右键 → 切到应用视图
  document.addEventListener("contextmenu", function (ev) {
    if (isBlank(ev.target)) {
      ev.preventDefault();
      showView("apps");
    }
  });

  // ================= 全局快捷键 =================
  document.addEventListener("keydown", function (ev) {
    // Alt+1~9：精确切换搜索引擎（输入框聚焦时也可用）
    if (ev.altKey && !ev.ctrlKey && !ev.shiftKey && ev.key >= "1" && ev.key <= "9") {
      var ei = +ev.key - 1;
      if (ei < engines.length) {
        ev.preventDefault();
        setEngine(engines[ei].key);
        if (!engineMenu.hidden) renderEngineMenu();
      }
      return;
    }

    // Esc：右键菜单 → 弹层 → 应用视图 → 联想词(input 内处理) → 清空 → 失焦
    if (ev.key === "Escape") {
      if (!ctxMenu.hidden) { hideCtxMenu(); return; }
      if (!overlay.hidden) { closeModal(); return; }
      if (!viewApps.hidden) { showView("search"); return; }
      if (document.activeElement === input && suggEl.hidden) {
        if (input.value) input.value = "";
        else input.blur();
      }
      return;
    }

    // 以下快捷键仅在没有输入焦点、没有弹层时生效
    if (document.activeElement === input || !overlay.hidden) return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

    if (ev.key === "/") {
      ev.preventDefault();
      showView("search");   // 在应用视图按 / 也能直达搜索
      input.focus();
    } else if (ev.key >= "1" && ev.key <= "9") {
      var item = conf.shortcuts[+ev.key - 1];
      if (!item) return;
      ev.preventDefault();
      if (isFolder(item)) openFolder(+ev.key - 1);
      else openLink(item);
    }
  });
})();
