// ============================================================
// 起始页配置 —— 改完保存、刷新新标签页即可生效
// 注意：本页面通过 file:// 打开，无法 fetch 本地 JSON，
//       所以配置写成 .js 文件（这是有意为之，别改成 .json）
//
// 本文件是「基准配置」：你在页面里做的修改（编辑磁贴、设置面板）
// 保存在浏览器 localStorage 中并优先生效；
// 在设置面板点「导出 config.js」可把当前完整配置下载下来覆盖本文件，
// 迁移浏览器时：导出 → 覆盖本文件 → 拷贝整个项目文件夹。
// ============================================================

const CONFIG = {

  // 主题：auto = 按时间自动（19:00~7:00 深色），light / dark = 固定
  theme: "auto",

  // 界面语言：auto = 跟随浏览器 / zh = 中文 / en = English
  // 底部一言的来源随语言联动（中文 = 一言 hitokoto，英文 = 英文名言）
  lang: "auto",

  // ---------- 壁纸 ----------
  // mode：random-bing = 必应随机（默认；随机选取，当天内保持不变，凌晨 3 点自动更换）
  //       random-photo = 随机图片（同样每天 3 点更换）
  //       daily = 必应今日 / custom = 自定义地址（填 custom 字段）
  // sources 是「必应今日」模式的直链，按顺序降级；全部失败显示渐变色。
  // 右下角「换一张」按钮随时重抽，抽到的这张同样保持到当天凌晨 3 点。
  wallpaper: {
    mode: "random-bing",
    custom: "",       // mode 为 custom 时的图片地址（https:// 或 file:///E:/…）
    sources: [
      "https://bing.img.run/uhd.php",           // 4K UHD 原图
      "https://bing.img.run/1920x1080.php",     // UHD 失败时降级
      "https://api.dujin.org/bing/1920.php",
    ],
    dim: 0.9,   // 遮罩强度 0~1（上下渐晕式压暗，1 为完整强度）
  },

  // ---------- 搜索引擎 ----------
  // {q} 会被替换为编码后的关键词。
  // 图标使用 Iconify 图标库：icon 填图标名，颜色自动跟随环境、大小统一。
  // 推荐用同一套 Remix Icon（ri:）保持风格一致；到 https://icon-sets.iconify.design
  // 搜索图标名即可。留空则显示名称首字。
  engines: [
    { key: "google", name: "Google", url: "https://www.google.com/search?q={q}",
      icon: "ri:google-fill" },
    { key: "bing",   name: "必应",   url: "https://www.bing.com/search?q={q}",
      icon: "ri:microsoft-fill" },   // Remix Icon 无 Bing，用微软标
    { key: "baidu",  name: "百度",   url: "https://www.baidu.com/s?wd={q}",
      icon: "ri:baidu-fill" },
    { key: "bili",   name: "B站",    url: "https://search.bilibili.com/all?keyword={q}",
      icon: "ri:bilibili-fill" },
    { key: "ghub",   name: "GitHub", url: "https://github.com/search?q={q}",
      icon: "ri:github-fill" },
  ],

  // 搜索结果是否开新标签页（false = 当前页跳转）
  searchInNewTab: false,

  // 搜索联想词（百度接口）
  suggestions: true,

  // 一言（页面底部随机诗词格言，点击可换一句）
  hitokoto: true,

  // 搜索历史（点击搜索框时显示，最多保留 20 条）
  history: true,

  // ---------- 快捷方式 ----------
  // icon 字段：
  //   不填          → 网站自动取 favicon，本地页面显示首字渐变徽标（推荐）
  //   emoji         → 直接显示，如 "🔧"
  //   图片 URL/路径 → 显示该图片
  // url 支持三种写法：
  //   1. 普通网址            https://example.com
  //   2. 本地绝对路径        file:///E:/Docs/notes/index.html
  //   3. 本项目内相对路径    demo/hello.html
  shortcuts: [
    { name: "本地页示例", url: "demo/hello.html" },
    { name: "localhost:5180", icon: "⚡", url: "http://localhost:5180/" },
    { name: "哔哩哔哩",   url: "https://www.bilibili.com/" },
    { name: "GitHub",     url: "https://github.com/" },
    { name: "必应翻译",   url: "https://www.bing.com/translator" },
    // 在下面继续添加你的本地 HTML 页：
    // { name: "我的工具", url: "file:///E:/Tools/mytool.html" },
  ],

  // 快捷方式是否开新标签页
  shortcutInNewTab: false,

  // 快捷方式默认最多显示个数，超出的折叠进「展开」按钮；0 = 全部显示
  gridMaxVisible: 12,
};
