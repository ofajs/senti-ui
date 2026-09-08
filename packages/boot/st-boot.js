/**
 * st-boot.js — Senti-UI 项目同步引导（可选增强；页面唯一需要引入的标签）
 *
 * 这是一个【经典同步脚本，非 module】，放在 <head> 内尽早引入：
 *   <script src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/boot/st-boot.js"></script>
 *
 * 定位：不是组件运行的前提（组件会自动加载所需初始化模块），只负责"必须赶首帧"的事，
 * 目前为消除颜色闪色 + 主题模式预挂类；以后的首帧需求（字体等）以 BOOT_TASKS 清单项扩展。
 *
 * 每个任务 = 首帧同步注入 + 异步 init 模块：
 *   同步阶段（阻塞解析、先于首帧渲染）：
 *     A. localStorage 有缓存（cacheKey）→ 立即 <style> 注入，零延迟
 *     B. 无缓存（首次访问）→ 同步 <link> 引入静态兜底（fallback）
 *   异步阶段（不阻塞渲染）：动态加载 init 模块，由它生成真实结果、
 *   覆盖 boot 注入的样式（head 中更靠后，同特异性后者生效）并更新缓存。
 *
 * 资源路径相对本脚本目录（packages/boot/）解析，不硬编码绝对路径。
 */
(function () {
  // 首帧任务清单：cacheKey（localStorage 缓存）/ fallback（无缓存时的静态兜底）/ init（异步初始化模块）
  var BOOT_TASKS = [
    { cacheKey: "st-theme-css", fallback: "../color/st-default.css", init: "../color/st-color-init.js" },
  ];

  var me = document.currentScript;
  var parent = (me && me.parentNode) || document.head;
  var base = (me && me.src || "").replace(/[^/]*$/, ""); // .../packages/boot/

  // 主题模式预挂类（首帧同步，消除强制浅/深色时的闪色）：
  // localStorage "st-theme-mode" 为 "light"/"dark" 时给 <html> 挂
  // st-light / st-dark 类；缺失或 "auto" 不挂类（跟随系统）。
  // 持久化与跨窗口同步（storage 事件）见 ../color/st-theme-mode.js。
  try {
    var mode = localStorage.getItem("st-theme-mode");
    if (mode === "light" || mode === "dark") {
      document.documentElement.classList.add(
        mode === "light" ? "st-light" : "st-dark"
      );
    }
  } catch (e) {
    /* localStorage 不可用时跟随系统 */
  }

  for (var i = 0; i < BOOT_TASKS.length; i++) {
    var task = BOOT_TASKS[i];
    var css;
    try {
      css = localStorage.getItem(task.cacheKey);
    } catch (e) {
      /* 隐私模式等 localStorage 不可用，走兜底 */
    }
    if (css) {
      var style = document.createElement("style");
      style.id = "st-boot-" + task.cacheKey;
      style.textContent = css;
      parent.insertBefore(style, me || null);
    } else if (task.fallback) {
      var link = document.createElement("link");
      link.id = "st-boot-fallback-" + task.cacheKey;
      link.rel = "stylesheet";
      link.href = base + task.fallback;
      parent.insertBefore(link, me || null);
    }
    if (task.init) {
      var s = document.createElement("script");
      s.type = "module";
      s.src = base + task.init;
      parent.insertBefore(s, me || null);
    }
  }
})();
