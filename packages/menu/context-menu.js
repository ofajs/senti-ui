// context-menu.js —— 命令式右键菜单（基于 st-menu），挂 body 用完即毁
// 用法：
//   import contextMenu from "/packages/menu/context-menu.js";
//   const id = await contextMenu(e, [
//     { id: "cut", label: "剪切", prefix: "✂️" },
//     { separator: true },
//     { id: "export", label: "导出为", children: [
//       { id: "pdf", label: "PDF" },
//       { id: "md", label: "Markdown" },
//     ] },
//   ]);
//   // → 点击的 item id；点空白 / Escape 取消 → null
// 第一个参数也可直接传坐标：contextMenu({ x, y }, items)
//
// items 结构：
//   { id, label, prefix?, suffix?, disabled?, children?: [...] }  菜单项（children 为子菜单，可嵌套）
//   { separator: true }                                            分隔线

// 确保依赖组件已加载（无构建环境：按需注入 <l-m>）
const loaded = new Set();
const ensureComp = async (tag, src) => {
  if (customElements.get(tag)) return;
  if (!loaded.has(src)) {
    loaded.add(src);
    document.body.insertAdjacentHTML("beforeend", `<l-m src="${src}"></l-m>`);
  }
  await customElements.whenDefined(tag);
};

const ensureDeps = () =>
  Promise.all([
    new URL("./menu.html", import.meta.url).href,
    new URL("./menu-item.html", import.meta.url).href,
  ].map((src, i) => ensureComp(i === 0 ? "st-menu" : "st-menu-item", src)));

// items 数组 → st-menu-item / hr 元素（children 递归为 sub-menu 插槽）
const buildItems = (items) =>
  items.map((item) => {
    if (item.separator) {
      return document.createElement("hr");
    }
    const el = document.createElement("st-menu-item");
    if (item.disabled) el.setAttribute("disabled", "");
    // 只有叶子项携带 id：带 children 的项点击是开合子菜单（不冒泡），不是选择
    if (!Array.isArray(item.children) || !item.children.length) {
      el.dataset.cmId = item.id ?? "";
    }
    if (item.prefix != null) {
      const p = document.createElement("span");
      p.slot = "prefix";
      p.textContent = item.prefix;
      el.appendChild(p);
    }
    el.appendChild(document.createTextNode(item.label ?? ""));
    if (item.suffix != null) {
      const s = document.createElement("span");
      s.slot = "suffix";
      s.textContent = item.suffix;
      el.appendChild(s);
    }
    if (Array.isArray(item.children) && item.children.length) {
      const sub = document.createElement("st-menu");
      sub.setAttribute("slot", "sub-menu");
      sub.append(...buildItems(item.children));
      el.appendChild(sub);
    }
    return el;
  });

const contextMenu = async (source, items) => {
  await ensureDeps();
  // 定位来源：事件对象（右键 event）或显式坐标 { x, y }
  let x, y;
  if (typeof source === "number") {
    x = source;
    y = items;
    items = arguments[2] ?? []; // eslint-disable-line
  } else if (source && typeof source.clientX === "number") {
    source.preventDefault?.(); // 阻止浏览器默认右键菜单
    x = source.clientX;
    y = source.clientY;
  } else {
    x = source?.x ?? 0;
    y = source?.y ?? 0;
  }

  return new Promise((resolve) => {
    let settled = false;
    let pendingId = undefined; // 点击先记录，菜单关闭事件统一收尾
    const finish = (val) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const menu = document.createElement("st-menu");
    menu.setAttribute("data-st-util", ""); // 命令式实例标记
    menu.append(...buildItems(items));

    // 点击任意叶子菜单项：捕获阶段先记录 id——面板关闭监听在 shadow 内部，
    // 气泡阶段晚于它派发的 close 事件，气泡监听会来不及记录
    menu.addEventListener(
      "click",
      (e) => {
        const item = e
          .composedPath()
          .find((n) => n.dataset && n.dataset.cmId !== undefined && n.tagName === "ST-MENU-ITEM");
        if (item && item.dataset.cmId !== "") pendingId = item.dataset.cmId;
      },
      true
    );
    // 选中 / 点外部 / Escape 都会触发 close：统一在这里 resolve + 销毁
    menu.addEventListener("close", () => {
      finish(pendingId ?? null);
      setTimeout(() => menu.remove(), 250); // 等退出过渡播完再销毁
    });

    document.body.appendChild(menu);
    requestAnimationFrame(() => {
      // 子菜单（若有）刚挂载时 slotchange/属性同步尚未跑完，再等一帧保证定位正确
      requestAnimationFrame(() => $(menu).openAt(x, y));
    });
  });
};

// 长按呼出（移动端惯例）：在 el 上按住约 500ms 打开菜单（触屏指针专用；
// 移动超 10px / 抬起 / 取消则中止）。返回取消函数。
// onSelect(id|null) 回调接收选择结果；会接管 el 的 contextmenu 默认行为。
contextMenu.longPress = (el, items, onSelect) => {
  let timer = null;
  let startX = 0;
  let startY = 0;
  let firedAt = 0;
  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  const onDown = (e) => {
    if (e.pointerType === "mouse") return; // 桌面走右键 contextmenu
    cancel();
    startX = e.clientX;
    startY = e.clientY;
    timer = setTimeout(async () => {
      firedAt = Date.now();
      const id = await contextMenu({ x: startX, y: startY }, items);
      onSelect?.(id);
    }, 500);
  };
  const onMove = (e) => {
    if (timer && Math.hypot(e.clientX - startX, e.clientY - startY) > 10) cancel();
  };
  const onContext = (e) => {
    // 长按触发后系统也会派发 contextmenu（Android），吞掉避免弹默认菜单
    if (Date.now() - firedAt < 1000) e.preventDefault();
  };
  const onClick = (e) => {
    // 长按已呼出菜单后手指抬起产生的 click 吞掉，避免误触发宿主点击逻辑
    if (Date.now() - firedAt < 500) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", cancel);
  el.addEventListener("pointercancel", cancel);
  el.addEventListener("contextmenu", onContext);
  el.addEventListener("click", onClick, true);
  return () => {
    cancel();
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", cancel);
    el.removeEventListener("pointercancel", cancel);
    el.removeEventListener("contextmenu", onContext);
    el.removeEventListener("click", onClick, true);
  };
};

export default contextMenu;
