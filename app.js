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
      iconPh: "留空自动；可填 emoji 或图片地址",
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
      iconPh: "Leave empty for auto; emoji or image URL",
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
  function faviconOf(url) {
    try {
      var u = new URL(url);
      if (u.protocol === "http:" || u.protocol === "https:") return u.origin + "/favicon.ico";
    } catch (e) { /* 相对路径或 file:// */ }
    return null;
  }
  function isImgIcon(icon) {
    return /^(https?:|file:)/i.test(icon) || icon.indexOf("/") >= 0 ||
      /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(icon);
  }
  // 任意条目 → 图标节点（小尺寸用于收纳夹预览 / 引擎菜单）
  function iconNodeOf(item, letterCls) {
    if (item.icon && isImgIcon(item.icon)) return imgOrLetter(item.icon, item.name, letterCls);
    if (item.icon) { var sp = document.createElement("span"); sp.textContent = item.icon; return sp; }
    var fav = item.url && faviconOf(item.url);
    if (fav) return imgOrLetter(fav, item.name, letterCls);
    return makeLetter(item.name, letterCls);
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
  // 统一形态的引擎图标：品牌色圆底 + 白色品牌标（无品牌标时为白色首字）
  function engineIconNode(e) {
    var badge = document.createElement("span");
    badge.className = "eng-ico";
    var h = hueOf(e.name);
    badge.style.background = e.color ||
      "linear-gradient(135deg, hsl(" + h + ",65%,55%), hsl(" + ((h + 45) % 360) + ",65%,42%))";
    if (e.icon) {
      var img = document.createElement("img");
      img.alt = "";
      img.onerror = function () {   // 图标库不可达 → 退回首字，形态不变
        img.remove();
        badge.textContent = (e.name || "?").charAt(0).toUpperCase();
      };
      img.src = e.icon;
      badge.appendChild(img);
    } else {
      badge.textContent = (e.name || "?").charAt(0).toUpperCase();
    }
    return badge;
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
    if (engineMenu.hidden) { renderEngineMenu(); engineMenu.hidden = false; }
    else engineMenu.hidden = true;
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
  var pageLoadedAt = Date.now();

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

  input.addEventListener("focus", function () {
    if (skipHistoryOnce) { skipHistoryOnce = false; return; }  // 视图切换带来的聚焦不弹历史
    if (Date.now() - pageLoadedAt < 800) return;  // 忽略打开页面时的自动聚焦
    showHistory();
  });
  input.addEventListener("click", function () {
    if (suggEl.hidden) showHistory();
  });

  // ================= 联想词（百度 JSONP，UTF-8） =================
  var suggEl = $("sugg");
  var suggItems = [];
  var suggIndex = -1;
  var suggSeq = 0;
  var suggTimer = null;

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
          ev.preventDefault(); ev.stopPropagation();
          saveHistory(getHistory().filter(function (x) { return x !== text; }));
          showHistory();
        };
        li.appendChild(del);
      }
      // mousedown 早于 input 失焦，保证点击可靠触发
      li.onmousedown = function (ev) { ev.preventDefault(); doSearch(text); };
      li.onmouseenter = function () { setSuggIndex(i, false); };
      suggEl.appendChild(li);
    });
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
    var req = lang === "en"
      ? fetch("https://dummyjson.com/quotes/random")
          .then(function (r) { return r.json(); })
          .then(function (d) { hk.textContent = "“" + d.quote + "” — " + d.author; })
      : fetch("https://v1.hitokoto.cn/?max_length=30")
          .then(function (r) { return r.json(); })
          .then(function (d) { hk.textContent = d.hitokoto + (d.from ? "  —— " + d.from : ""); });
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
        mini.appendChild(iconNodeOf(child, "letter-badge"));
        box.appendChild(mini);
      });
      if (!item.items.length) {
        var empty = document.createElement("div");
        empty.className = "mini";
        box.appendChild(empty);
      }
    } else {
      box.className = "tile-icon";
      var node = iconNodeOf(item, "letter-badge");
      if (node.tagName === "SPAN" && !node.className) box.textContent = node.textContent;  // emoji
      else box.appendChild(node);
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

    // 拖拽排序（同一列表内）
    el.draggable = true;
    el.ondragstart = function (ev) {
      ev.dataTransfer.setData("text/plain", "");
      ev.dataTransfer.effectAllowed = "move";
      dragFrom = { index: i, folderIdx: folderIdx };
      el.classList.add("dragging");
    };
    el.ondragend = function () { el.classList.remove("dragging"); dragFrom = null; };
    // 顶层把普通磁贴拖到收纳夹上 = 放进收纳夹；其余情况 = 同列表内排序
    function isDropIntoFolder() {
      return folderIdx < 0 && isFolder(item) &&
        dragFrom && dragFrom.folderIdx < 0 &&
        dragFrom.index !== i && !isFolder(conf.shortcuts[dragFrom.index]);
    }
    el.ondragover = function (ev) {
      if (!dragFrom) return;
      if (isDropIntoFolder()) {
        ev.preventDefault();
        el.classList.add("drop-into");
      } else if (dragFrom.folderIdx === folderIdx && dragFrom.index !== i) {
        ev.preventDefault();
      }
    };
    el.ondragleave = function () { el.classList.remove("drop-into"); };
    el.ondrop = function (ev) {
      ev.preventDefault();
      el.classList.remove("drop-into");
      if (!dragFrom) return;
      if (isDropIntoFolder()) {
        var movedIn = conf.shortcuts.splice(dragFrom.index, 1)[0];
        item.items.push(movedIn);          // item 即目标收纳夹，splice 后引用依然有效
        saveShortcuts();
        renderGrid();
        return;
      }
      if (dragFrom.folderIdx !== folderIdx || dragFrom.index === i) return;
      var list = folderIdx < 0 ? conf.shortcuts : conf.shortcuts[folderIdx].items;
      var moved = list.splice(dragFrom.index, 1)[0];
      list.splice(i, 0, moved);
      saveShortcuts();
      folderIdx < 0 ? renderGrid() : renderFolder();
    };
    return el;
  }
  var dragFrom = null;
  // 防止拖拽落在磁贴以外时浏览器把页面替换成被拖的文件/链接
  document.addEventListener("dragover", function (ev) { ev.preventDefault(); });
  document.addEventListener("drop", function (ev) { ev.preventDefault(); });

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
  var skipHistoryOnce = false;

  function showView(name) {
    var apps = name === "apps";
    if (viewApps.hidden !== apps) return;   // 已在目标视图
    viewApps.hidden = !apps;
    viewSearch.hidden = apps;
    if (apps) { closeMenus(); input.blur(); }
    else { skipHistoryOnce = true; input.focus(); }
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
