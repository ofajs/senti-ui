// form-proxy.js — 组件内部使用的原生表单代理
//
// ofa.js 生成的自定义元素没有 formAssociated 钩子，无法直接注册成
// form-associated custom element。这里在宿主 light DOM 放一个不参与排版的
// 原生控件（slot 指向不存在的内容，因此不会被渲染），由它承担 name/value/
// required/pattern 等原生表单语义；组件内部真正的输入控件继续负责交互。
//
// 注意：代理控件是真实表单元素，会进入 form.elements / FormData；
// 因为不可见，浏览器原生校验气泡不会锚定到组件上，应用可通过 `invalid` 事件
// 自行展示错误（组件同时会给内部控件加 aria-invalid）。

const PROXY_SLOT = "form-proxy";

export function createFormProxy(host, kind = "input") {
  if (!host) return null;
  const el = document.createElement(kind === "textarea" ? "textarea" : "input");
  if (kind !== "textarea") el.type = kind;
  el.setAttribute("slot", PROXY_SLOT);
  el.tabIndex = -1;
  el.setAttribute("aria-hidden", "true");
  // 不设置 display:none/hidden：否则会被浏览器排除在约束校验之外
  el.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  host.appendChild(el);
  return el;
}

export function syncFormProxy(proxy, options = {}) {
  if (!proxy) return;
  const {
    type,
    name,
    value,
    checked,
    disabled,
    required,
    readOnly,
    minlength,
    maxlength,
    pattern,
    min,
    max,
    step,
    autocomplete,
    form,
  } = options;

  if (type && proxy.tagName === "INPUT") proxy.type = type;
  if (name !== undefined) {
    if (name === null || name === "") proxy.removeAttribute("name");
    else proxy.name = name;
  }
  if (form !== undefined) {
    if (form) proxy.setAttribute("form", form);
    else proxy.removeAttribute("form");
  }
  if (value !== undefined) proxy.value = value == null ? "" : String(value);
  if (checked !== undefined && "checked" in proxy) proxy.checked = !!checked;
  if (disabled !== undefined) proxy.disabled = !!disabled;
  if (required !== undefined) proxy.required = !!required;
  if (readOnly !== undefined && "readOnly" in proxy) proxy.readOnly = !!readOnly;

  const numberAttrs = { minlength, maxlength, min, max, step };
  for (const [key, val] of Object.entries(numberAttrs)) {
    if (val === undefined) continue;
    if (val === null || val === "") proxy.removeAttribute(key);
    else proxy.setAttribute(key, String(val));
  }
  for (const [key, val] of Object.entries({ pattern, autocomplete })) {
    if (val === undefined) continue;
    if (val === null || val === "") proxy.removeAttribute(key);
    else proxy.setAttribute(key, String(val));
  }
}

export function formFor(host) {
  if (!host) return null;
  const local = host.closest("form");
  if (local) return local;
  const id = host.getAttribute("form");
  return id ? document.getElementById(id) : null;
}

/** 监听所在 form 的 reset 事件；返回解绑函数 */
export function bindFormReset(host, handler) {
  const form = formFor(host);
  if (!form) return () => {};
  form.addEventListener("reset", handler);
  return () => form.removeEventListener("reset", handler);
}
