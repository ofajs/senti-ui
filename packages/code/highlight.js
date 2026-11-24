/**
 * st-code / st-markdown 共用的轻量语法高亮器
 *
 * 输出经过 HTML 转义的字符串（只含 <span class="tk-*"> 结构），
 * 组件可以安全地把它写入 <code> 的 innerHTML。
 *
 * 支持 html / js / ts / css / less / sass；其他语言返回 null，由调用方按纯文本处理。
 */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ESC[ch]);
const span = (type, text) => `<span class="tk-${type}">${esc(text)}</span>`;

const LANG_ALIASES = {
  html: "html",
  htm: "html",
  xml: "html",
  svg: "html",
  js: "js",
  javascript: "js",
  mjs: "js",
  ts: "ts",
  typescript: "ts",
  css: "css",
  less: "less",
  sass: "sass",
  scss: "sass",
};

/** 返回受支持的高亮语言 id，不支持时返回 null。 */
export function resolveLang(lang) {
  return LANG_ALIASES[String(lang || "").toLowerCase()] || null;
}

/** st-code 的默认行为：未知语言按 HTML 处理。 */
export function normalizeLang(lang) {
  return resolveLang(lang) || "html";
}

export function langLabel(lang) {
  return { html: "HTML", js: "JS", ts: "TS", css: "CSS", less: "LESS", sass: "SASS" }[lang] || lang;
}

// 通用粘性正则扫描器：按规则顺序匹配当前位置，未命中的字符原样转义。
function scan(code, rules) {
  let out = "";
  let i = 0;
  while (i < code.length) {
    let hit = null;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m.index === i && m[0].length) {
        hit = { type: rule.type, text: m[0] };
        break;
      }
    }
    if (hit) {
      out += span(hit.type, hit.text);
      i += hit.text.length;
    } else {
      out += esc(code[i]);
      i += 1;
    }
  }
  return out;
}

const JS_WORDS =
  "break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield async await of from as static get set constructor";
const TS_WORDS =
  "interface type enum implements public private protected readonly abstract declare namespace module satisfies keyof infer asserts is";
const JS_LITERALS = "true false null undefined NaN Infinity";
const wordRule = (words, type) => ({
  type,
  re: new RegExp(`\\b(?:${words.replace(/ /g, "|")})\\b`, "y"),
});

const JS_RULES = [
  { type: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
  { type: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y },
  { type: "number", re: /\b(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y },
  wordRule(JS_WORDS, "keyword"),
  wordRule(TS_WORDS, "keyword"),
  wordRule(JS_LITERALS, "keyword"),
  { type: "function", re: /\b[A-Za-z_$][\w$]*(?=\s*\()/y },
  { type: "type", re: /\b[A-Z][A-Za-z0-9_$]*\b/y },
  { type: "variable", re: /@[A-Za-z_$][\w$]*/y },
  { type: "punct", re: /[{}()[\];,.:?=+\-*/%<>!&|^~]+/y },
];

const CSS_RULES = [
  { type: "comment", re: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/y },
  { type: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
  { type: "keyword", re: /@[-\w]+/y },
  { type: "variable", re: /(?:--|\$)[-\w]+/y },
  { type: "color", re: /#[0-9a-fA-F]{3,8}\b/y },
  { type: "number", re: /\b\d*\.?\d+(?:[a-zA-Z%]+)?\b/y },
  { type: "property", re: /[-\w]+(?=\s*:)/y },
  { type: "function", re: /[-\w]+(?=\()/y },
  { type: "selector", re: /::?[-\w]+|[.#][-\w]+|\[[^\]]*\]/y },
  { type: "punct", re: /[{}();:,>+~*[\]]/y },
];

function findTagEnd(code, start) {
  let quote = "";
  for (let i = start + 1; i < code.length; i += 1) {
    const ch = code[i];
    if (quote) {
      if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return -1;
}

function highlightTag(tag) {
  const open = /^<(\/?)([^\s/>]+)/.exec(tag);
  if (!open) return esc(tag);
  let out = span("punct", "<") + (open[1] ? span("punct", "/") : "") + span("tag", open[2]);
  const rest = tag.slice(open[0].length);
  let i = 0;
  while (i < rest.length) {
    const ws = /^\s+/.exec(rest.slice(i));
    if (ws) {
      out += ws[0];
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("/>", i)) {
      out += span("punct", "/>");
      i += 2;
      continue;
    }
    if (rest[i] === ">") {
      out += span("punct", ">");
      i += 1;
      continue;
    }
    const attr = /^[^\s=/>]+/.exec(rest.slice(i));
    if (!attr) {
      out += esc(rest[i]);
      i += 1;
      continue;
    }
    out += span("attr", attr[0]);
    i += attr[0].length;
    const eqWs = /^\s*/.exec(rest.slice(i))[0];
    let j = i + eqWs.length;
    if (rest[j] !== "=") {
      out += eqWs;
      i = j;
      continue;
    }
    out += eqWs + span("punct", "=");
    j += 1;
    const valWs = /^\s*/.exec(rest.slice(j))[0];
    out += valWs;
    j += valWs.length;
    const quote = rest[j];
    if (quote === '"' || quote === "'") {
      let k = j + 1;
      while (k < rest.length && rest[k] !== quote) k += 1;
      out += span("string", rest.slice(j, Math.min(k + 1, rest.length)));
      i = Math.min(k + 1, rest.length);
    } else {
      const val = /^[^\s/>]+/.exec(rest.slice(j));
      if (val) {
        out += span("attr", val[0]);
        i = j + val[0].length;
      } else {
        i = j;
      }
    }
  }
  return out;
}

function highlightText(text) {
  let out = "";
  let i = 0;
  const re = /&[#\w]+;/g;
  let m;
  while ((m = re.exec(text))) {
    out += esc(text.slice(i, m.index)) + span("entity", m[0]);
    i = m.index + m[0].length;
  }
  return out + esc(text.slice(i));
}

function highlightHtml(code) {
  let out = "";
  let i = 0;
  while (i < code.length) {
    if (code.startsWith("<!--", i)) {
      const end = code.indexOf("-->", i + 4);
      const stop = end === -1 ? code.length : end + 3;
      out += span("comment", code.slice(i, stop));
      i = stop;
      continue;
    }
    if (code[i] === "<") {
      const end = findTagEnd(code, i);
      if (end === -1) {
        out += esc(code.slice(i));
        break;
      }
      const tag = code.slice(i, end + 1);
      out += highlightTag(tag);
      const open = /^<([A-Za-z][\w:-]*)/.exec(tag);
      const selfClosing = /\/>$/.test(tag);
      if (open && !selfClosing && /^(script|style)$/i.test(open[1])) {
        const close = new RegExp(`</${open[1]}\\s*>`, "i");
        const rest = code.slice(end + 1);
        const match = close.exec(rest);
        if (match) {
          const content = rest.slice(0, match.index);
          out += open[1].toLowerCase() === "script" ? scan(content, JS_RULES) : scan(content, CSS_RULES);
          i = end + 1 + match.index;
          continue;
        }
      }
      i = end + 1;
      continue;
    }
    const next = code.indexOf("<", i);
    const stop = next === -1 ? code.length : next;
    out += highlightText(code.slice(i, stop));
    i = stop;
  }
  return out;
}

/**
 * @param {string} code
 * @param {string} lang 已解析的语言 id（html/js/ts/css/less/sass）
 * @returns {string|null} 高亮 HTML；语言不支持时返回 null
 */
export function highlight(code, lang) {
  const resolved = resolveLang(lang);
  if (!resolved) return null;
  if (resolved === "html") return highlightHtml(code);
  if (resolved === "js" || resolved === "ts") return scan(code, JS_RULES);
  return scan(code, CSS_RULES);
}
