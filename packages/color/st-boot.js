/**
 * st-boot.js — 颜色体系同步引导（唯一需要引入的标签，消除刷新闪色）
 *
 * 这是一个【经典同步脚本，非 module】，必须放在 <head> 内尽早引入：
 *   <script src="/packages/color/st-boot.js"></script>
 *
 * 同步阶段（阻塞解析、先于首帧渲染，页面第一帧就有颜色）：
 *   A. localStorage 有上次生成的主题 CSS 缓存（st-theme-css）→ 立即 <style> 注入，零延迟
 *   B. 无缓存（首次访问/清缓存）→ 同步 <link> 引入静态兜底主题 st-default.css（默认种子色）
 *
 * 异步阶段（不阻塞渲染）：
 *   动态创建 <script type="module"> 加载同目录的 st-init.js——
 *   它按 localStorage 配置（st-color-config）生成完整体系，经 <style id="st-dynamic-theme">
 *   覆盖 boot 注入的样式（head 中更靠后，同特异性后者生效），并把 CSS 写入缓存供下次刷新走 A 分支。
 *
 * 组件内部 import 的 st-init.js 不受影响；本脚本从自身 src 推导同目录路径，跨路径可用。
 */
(function () {
  var css;
  try {
    css = localStorage.getItem("st-theme-css");
  } catch (e) {
    /* 隐私模式等 localStorage 不可用，走兜底 */
  }
  var me = document.currentScript;
  var parent = (me && me.parentNode) || document.head;
  var base = (me && me.src || "").replace(/st-boot\.js.*$/, "");

  if (css) {
    var style = document.createElement("style");
    style.id = "st-boot-theme";
    style.textContent = css;
    parent.insertBefore(style, me || null);
  } else if (base) {
    var link = document.createElement("link");
    link.id = "st-boot-default";
    link.rel = "stylesheet";
    link.href = base + "st-default.css";
    parent.insertBefore(link, me || null);
  }

  // 动态加载 st-init.js（异步 module，负责真实主题生成与缓存）
  var init = document.createElement("script");
  init.type = "module";
  init.src = base + "st-init.js";
  parent.insertBefore(init, me || null);
})();
