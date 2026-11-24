/**
 * st-markdown 的 Markdown 渲染器
 *
 * 只输出 DOM 节点（不使用 innerHTML），原始 HTML 会被当作普通文本转义。
 * 支持：标题 / 段落 / 有序与无序列表（含嵌套、任务列表）/ 引用 / 围栏代码块 /
 * 表格 / 分割线 / 行内代码 / 粗体 / 斜体 / 删除线 / 链接 / 图片 / 自动链接。
 *
 * 代码块复用 ../code/highlight.js 的高亮逻辑（html/js/ts/css/less/sass）。
 *
 * 流式容错：未闭合的围栏代码块渲染到文末；未闭合的行内标记按字面文本输出；
 * 未完整的表格先按段落显示，补齐分隔行后再变成表格。
 */

const LANG_LABEL = {
  js: "JS",
  javascript: "JS",
  mjs: "JS",
  ts: "TS",
  typescript: "TS",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  htm: "HTML",
  xml: "HTML",
  svg: "HTML",
  css: "CSS",
  scss: "SCSS",
  less: "LESS",
  json: "JSON",
  bash: "BASH",
  sh: "SH",
  shell: "SHELL",
  zsh: "ZSH",
  py: "PY",
  python: "PYTHON",
  java: "JAVA",
  go: "GO",
  rust: "RUST",
  rs: "RUST",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  md: "MD",
  markdown: "MD",
  diff: "DIFF",
  http: "HTTP",
};

import { resolveLang, highlight } from "../code/highlight.js";

const isBlank = (line) => !line || !line.trim();

const leadingSpaces = (line) => (/^ */.exec(line) || [""])[0].length;

function isSafeUrl(url, { image = false } = {}) {
  const value = String(url || "").trim();
  if (!value) return false;
  if (/[\u0000-\u001f]/.test(value)) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (!scheme) return true; // 相对路径 / #hash / //host
  const name = scheme[1].toLowerCase();
  if (name === "http" || name === "https") return true;
  if (!image && (name === "mailto" || name === "tel")) return true;
  if (image && /^data:image\/(?:png|jpe?g|gif|webp);/i.test(value)) return true;
  return false;
}

function el(doc, tag, part, className) {
  const node = doc.createElement(tag);
  if (part) node.setAttribute("part", part);
  if (className) node.className = className;
  return node;
}

function textNode(doc, text) {
  return doc.createTextNode(String(text));
}

/* ------------------------------------------------------------------ */
/* 块级解析                                                            */
/* ------------------------------------------------------------------ */

function matchFence(line) {
  return /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
}

function matchListMarker(line) {
  const m = /^( *)([-*+]|\d{1,9}[.)])\s+(.*)$/.exec(line);
  if (!m) return null;
  const indent = m[1].length;
  const marker = m[2];
  const ordered = /^\d/.test(marker);
  return {
    indent,
    ordered,
    start: ordered ? parseInt(marker, 10) : 1,
    content: m[3],
  };
}

function isTableDelimiter(line) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function isTableStart(lines, index) {
  const line = lines[index];
  if (!line || !line.includes("|")) return false;
  const next = lines[index + 1];
  if (!next || !next.includes("|")) return false;
  const header = splitTableRow(line);
  const delimiter = splitTableRow(next);
  return header.length > 0 && delimiter.length === header.length && isTableDelimiter(next);
}

function startsBlock(lines, index) {
  const line = lines[index];
  if (matchFence(line)) return true;
  if (/^ {0,3}#{1,6}\s+/.test(line)) return true;
  if (/^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line)) return true;
  if (/^ {0,3}>/.test(line)) return true;
  if (matchListMarker(line)) return true;
  if (isTableStart(lines, index)) return true;
  return false;
}

function parseBlocks(lines) {
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (isBlank(line)) {
      index += 1;
      continue;
    }

    // 围栏代码块：未闭合时一直渲染到输入末尾，天然适配流式输出
    const fence = matchFence(line);
    if (fence) {
      const markerChar = fence[1][0];
      const markerLength = fence[1].length;
      const indent = leadingSpaces(line);
      const info = fence[2].trim();
      const lang = info.split(/\s+/)[0].replace(/^\{\.?|\}$/g, "");
      const code = [];
      index += 1;
      while (index < lines.length) {
        const close = matchFence(lines[index]);
        if (
          close &&
          close[1][0] === markerChar &&
          close[1].length >= markerLength &&
          !close[2].trim()
        ) {
          index += 1;
          break;
        }
        code.push(lines[index].slice(Math.min(indent, leadingSpaces(lines[index]))));
        index += 1;
      }
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    const heading = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (/^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (/^ {0,3}>/.test(line)) {
      const inner = [];
      while (index < lines.length) {
        const quote = /^ {0,3}> ?(.*)$/.exec(lines[index]);
        if (!quote) break;
        inner.push(quote[1]);
        index += 1;
      }
      blocks.push({ type: "blockquote", children: parseBlocks(inner) });
      continue;
    }

    if (isTableStart(lines, index)) {
      const header = splitTableRow(lines[index]);
      const delimiter = splitTableRow(lines[index + 1]);
      const align = delimiter.map((cell) => {
        const value = cell.trim();
        if (/^:.*:$/.test(value)) return "center";
        if (/^:/.test(value)) return "left";
        if (/:$/.test(value)) return "right";
        return "";
      });
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|") && !isBlank(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    if (matchListMarker(line)) {
      const parsed = parseList(lines, index);
      blocks.push(parsed.block);
      index = parsed.index;
      continue;
    }

    const paragraph = [];
    while (index < lines.length && !isBlank(lines[index]) && !startsBlock(lines, index)) {
      paragraph.push(lines[index].replace(/^ {0,3}/, ""));
      index += 1;
    }
    // 理论上前面的分支已经处理了所有块起点；这里只防御异常输入导致死循环
    if (!paragraph.length) {
      paragraph.push(line.replace(/^ {0,3}/, ""));
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
}

function parseList(lines, startIndex) {
  const first = matchListMarker(lines[startIndex]);
  const ordered = first.ordered;
  const baseIndent = first.indent;
  const items = [];
  let index = startIndex;

  while (index < lines.length) {
    const marker = matchListMarker(lines[index]);
    if (!marker || marker.ordered !== ordered || marker.indent !== baseIndent) break;

    const itemLines = [marker.content];
    index += 1;

    while (index < lines.length) {
      const line = lines[index];
      if (isBlank(line)) {
        // 空行后若不是更深缩进 / 新列表项，就结束当前项
        let next = index + 1;
        while (next < lines.length && isBlank(lines[next])) next += 1;
        if (next >= lines.length) {
          index = next;
          break;
        }
        const nextMarker = matchListMarker(lines[next]);
        if ((nextMarker && nextMarker.indent <= baseIndent) || leadingSpaces(lines[next]) <= baseIndent) {
          break;
        }
        itemLines.push("");
        index += 1;
        continue;
      }

      const nextMarker = matchListMarker(line);
      if (nextMarker && nextMarker.indent <= baseIndent) break;
      if (leadingSpaces(line) > baseIndent) {
        itemLines.push(line.slice(Math.min(leadingSpaces(line), baseIndent + 2)));
        index += 1;
        continue;
      }
      // 懒续行：同一缩进但不是新列表项的文本归入当前项
      itemLines.push(line.slice(baseIndent));
      index += 1;
    }

    let task = null;
    const taskMatch = /^\[([ xX])\]\s+([\s\S]*)$/.exec(itemLines[0] || "");
    if (taskMatch) {
      task = { checked: taskMatch[1].toLowerCase() === "x" };
      itemLines[0] = taskMatch[2];
    }

    items.push({ task, children: parseBlocks(itemLines) });
  }

  return {
    block: { type: "list", ordered, start: first.start, items },
    index,
  };
}

function splitTableRow(line) {
  let source = line.trim();
  if (source.startsWith("|")) source = source.slice(1);
  if (source.endsWith("|") && !source.endsWith("\\|")) source = source.slice(0, -1);
  const cells = [];
  let current = "";
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "\\" && source[i + 1] === "|") {
      current += "|";
      i += 1;
    } else if (ch === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

/* ------------------------------------------------------------------ */
/* 行内解析                                                            */
/* ------------------------------------------------------------------ */

function findClosingBracket(text, start) {
  let depth = 0;
  for (let i = start + 1; i < text.length; i += 1) {
    if (text[i] === "\\") {
      i += 1;
      continue;
    }
    if (text[i] === "[") depth += 1;
    if (text[i] === "]") {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

function findClosingParen(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "\\") {
      i += 1;
      continue;
    }
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseLink(text, start) {
  if (text[start] !== "[") return null;
  const close = findClosingBracket(text, start);
  if (close < 0 || text[close + 1] !== "(") return null;
  const end = findClosingParen(text, close + 1);
  if (end < 0) return null;
  const label = text.slice(start + 1, close);
  let inside = text.slice(close + 2, end).trim();
  let destination = "";
  let title = "";

  if (inside.startsWith("<") && inside.includes(">")) {
    const gt = inside.indexOf(">");
    destination = inside.slice(1, gt);
    inside = inside.slice(gt + 1).trim();
  } else {
    const match = /^((?:\\.|[^\s])*)(?:\s+.*)?$/.exec(inside);
    destination = match ? match[1] : inside;
    inside = inside.slice(destination.length).trim();
  }
  destination = destination.replace(/\\([\\()])/g, "$1");
  const titleMatch = /^(?:"([\s\S]*)"|'([\s\S]*)'|\(([\s\S]*)\))$/.exec(inside);
  if (titleMatch) title = titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? "";

  return { label, destination, title, end: end + 1 };
}

function appendInline(parent, text, ctx) {
  const doc = ctx.doc;
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (buffer) {
      parent.appendChild(textNode(doc, buffer));
      buffer = "";
    }
  };

  const trimTrailingSpaces = () => {
    if (buffer.endsWith("  ")) {
      buffer = buffer.replace(/ +$/, "");
      return;
    }
    if (buffer.endsWith("\\")) {
      buffer = buffer.slice(0, -1);
      return;
    }
    // 最后一个节点是文本时也尝试去掉硬换行空格
    const last = parent.lastChild;
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/ +$/, "");
  };

  while (index < text.length) {
    const ch = text[index];

    if (ch === "\\" && index + 1 < text.length && /[\\`*_{}\[\]()#+\-.!~>|]/.test(text[index + 1])) {
      buffer += text[index + 1];
      index += 2;
      continue;
    }

    // 行内代码优先于其他标记
    if (ch === "`") {
      const match = /^(`+)([\s\S]*?)\1/.exec(text.slice(index));
      if (match) {
        flush();
        let value = match[2];
        if (value.startsWith(" ") && value.endsWith(" ") && value.trim()) value = value.slice(1, -1);
        const code = el(doc, "code", "inline-code");
        code.textContent = value;
        parent.appendChild(code);
        index += match[0].length;
        continue;
      }
    }

    if (ch === "!" && text[index + 1] === "[") {
      const parsed = parseLink(text, index + 1);
      if (parsed) {
        flush();
        if (isSafeUrl(parsed.destination, { image: true })) {
          const image = el(doc, "img", "image");
          image.alt = parsed.label;
          image.loading = "lazy";
          image.decoding = "async";
          image.src = parsed.destination;
          if (parsed.title) image.title = parsed.title;
          parent.appendChild(image);
        } else {
          parent.appendChild(textNode(doc, parsed.label || parsed.destination));
        }
        index = parsed.end;
        continue;
      }
    }

    if (ch === "[" && !ctx.inLink) {
      const parsed = parseLink(text, index);
      if (parsed) {
        flush();
        const label = el(doc, "span", "link-label");
        appendInline(label, parsed.label, { ...ctx, inLink: true });
        if (isSafeUrl(parsed.destination)) {
          const link = el(doc, "a", "link");
          link.href = parsed.destination;
          if (parsed.title) link.title = parsed.title;
          if (/^https?:/i.test(parsed.destination)) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }
          link.appendChild(label);
          parent.appendChild(link);
        } else {
          parent.appendChild(label);
        }
        index = parsed.end;
        continue;
      }
    }

    // 裸 URL（GFM autolink 扩展）：AI 输出里很常见
    if (!ctx.inLink && (ch === "h" || ch === "H") && /^https?:\/\//i.test(text.slice(index))) {
      const match = /^https?:\/\/[^\s<>"'，。；：！？、）】》」』…]+/i.exec(text.slice(index));
      if (match) {
        const trailing = /[.,;:!?，。；：！？、）】》」』…]+$/.exec(match[0])?.[0] || "";
        const url = trailing ? match[0].slice(0, -trailing.length) : match[0];
        if (url.length > 7) {
          flush();
          const link = el(doc, "a", "link");
          link.href = url;
          link.textContent = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          parent.appendChild(link);
          if (trailing) buffer += trailing;
          index += match[0].length;
          continue;
        }
      }
    }

    if (ch === "<" && !ctx.inLink) {
      const auto = /^<((?:https?:\/\/|mailto:)[^>\s]+)>/i.exec(text.slice(index));
      if (auto && isSafeUrl(auto[1])) {
        flush();
        const link = el(doc, "a", "link");
        link.href = auto[1];
        link.textContent = auto[1];
        if (/^https?:/i.test(auto[1])) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        parent.appendChild(link);
        index += auto[0].length;
        continue;
      }
    }

    if (ch === "*" || ch === "_") {
      // 避免把 snake_case 识别成斜体
      if (ch === "_" && /[\w]/.test(text[index - 1] || "")) {
        buffer += ch;
        index += 1;
        continue;
      }
      const double = text[index + 1] === ch;
      const marker = double ? ch + ch : ch;
      const close = text.indexOf(marker, index + marker.length);
      if (close > index + marker.length) {
        flush();
        const node = el(doc, double ? "strong" : "em", double ? "strong" : "em");
        appendInline(node, text.slice(index + marker.length, close), ctx);
        parent.appendChild(node);
        index = close + marker.length;
        continue;
      }
    }

    if (ch === "~" && text[index + 1] === "~") {
      const close = text.indexOf("~~", index + 2);
      if (close > index + 2) {
        flush();
        const node = el(doc, "del", "del");
        appendInline(node, text.slice(index + 2, close), ctx);
        parent.appendChild(node);
        index = close + 2;
        continue;
      }
    }

    if (ch === "\n") {
      const hard = text[index - 1] === "\\" || (text[index - 1] === " " && text[index - 2] === " ");
      if (hard) {
        trimTrailingSpaces();
        flush();
        parent.appendChild(el(doc, "br", "br"));
      } else if (ctx.breaks) {
        flush();
        parent.appendChild(el(doc, "br", "br"));
      } else {
        buffer += " ";
      }
      index += 1;
      continue;
    }

    buffer += ch;
    index += 1;
  }

  flush();
}

/* ------------------------------------------------------------------ */
/* DOM 渲染                                                            */
/* ------------------------------------------------------------------ */

function renderInline(parent, text, ctx) {
  appendInline(parent, text || "", ctx);
}

function renderBlocks(parent, blocks, ctx) {
  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const level = Math.min(6, Math.max(1, block.level));
        const node = el(ctx.doc, `h${level}`, `h${level}`);
        renderInline(node, block.text, ctx);
        parent.appendChild(node);
        break;
      }
      case "paragraph": {
        const node = el(ctx.doc, "p", "p");
        renderInline(node, block.text, ctx);
        parent.appendChild(node);
        break;
      }
      case "code":
        parent.appendChild(renderCodeBlock(block, ctx));
        break;
      case "blockquote": {
        const node = el(ctx.doc, "blockquote", "blockquote");
        renderBlocks(node, block.children, ctx);
        parent.appendChild(node);
        break;
      }
      case "hr":
        parent.appendChild(el(ctx.doc, "hr", "hr"));
        break;
      case "table":
        parent.appendChild(renderTable(block, ctx));
        break;
      case "list":
        parent.appendChild(renderList(block, ctx));
        break;
      default:
        break;
    }
  }
}

function renderList(block, ctx) {
  const list = el(ctx.doc, block.ordered ? "ol" : "ul", block.ordered ? "ol" : "ul");
  if (block.ordered && block.start !== 1) list.start = block.start;

  for (const item of block.items) {
    const li = el(ctx.doc, "li", "li");
    if (item.task) {
      li.classList.add("task-item");
      const box = el(ctx.doc, "input", "task-box", "task-box");
      box.type = "checkbox";
      box.checked = item.task.checked;
      box.disabled = true;
      box.tabIndex = -1;
      const body = el(ctx.doc, "div", "task-body", "task-body");
      renderBlocks(body, item.children, ctx);
      li.appendChild(box);
      li.appendChild(body);
    } else {
      renderBlocks(li, item.children, ctx);
    }
    list.appendChild(li);
  }
  return list;
}

function renderTable(block, ctx) {
  const wrap = el(ctx.doc, "div", "table-wrap", "table-wrap");
  const table = el(ctx.doc, "table", "table");
  const thead = el(ctx.doc, "thead", "thead");
  const headRow = el(ctx.doc, "tr", "tr");
  block.header.forEach((cell, index) => {
    const th = el(ctx.doc, "th", "th");
    if (block.align[index]) th.style.textAlign = block.align[index];
    renderInline(th, cell, ctx);
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  if (block.rows.length) {
    const tbody = el(ctx.doc, "tbody", "tbody");
    block.rows.forEach((row) => {
      const tr = el(ctx.doc, "tr", "tr");
      for (let i = 0; i < block.header.length; i += 1) {
        const td = el(ctx.doc, "td", "td");
        if (block.align[i]) td.style.textAlign = block.align[i];
        renderInline(td, row[i] || "", ctx);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  wrap.appendChild(table);
  return wrap;
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 继续尝试 execCommand 兜底
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function renderCodeBlock(block, ctx) {
  const wrapper = el(ctx.doc, "div", "code-block", "code-block");
  const head = el(ctx.doc, "div", "code-head", "code-head");
  const lang = el(ctx.doc, "span", "code-lang", "code-lang");
  lang.textContent = LANG_LABEL[String(block.lang).toLowerCase()] || (block.lang ? String(block.lang).toUpperCase() : "CODE");
  const copy = el(ctx.doc, "button", "copy", "copy");
  copy.type = "button";
  copy.textContent = "复制";
  copy.setAttribute("aria-label", "复制代码");
  copy.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const ok = await copyText(block.code);
    if (!ok) return;
    copy.textContent = "已复制";
    clearTimeout(copy._resetTimer);
    copy._resetTimer = setTimeout(() => {
      copy.textContent = "复制";
    }, 1200);
    ctx.onCopy?.(block.code, block.lang);
  });
  head.appendChild(lang);
  head.appendChild(copy);

  const pre = el(ctx.doc, "pre", "pre");
  const code = el(ctx.doc, "code", "code");
  const highlightLang = resolveLang(block.lang);
  const highlighted = highlightLang ? highlight(block.code, highlightLang) : null;
  if (highlighted !== null) code.innerHTML = highlighted;
  else code.textContent = block.code;
  pre.appendChild(code);
  wrapper.appendChild(head);
  wrapper.appendChild(pre);
  return wrapper;
}

export function renderMarkdown(source, options = {}) {
  const doc = options.doc || document;
  const fragment = doc.createDocumentFragment();
  const ctx = {
    doc,
    breaks: !!options.breaks,
    onCopy: options.onCopy,
  };
  const blocks = parseBlocks(String(source ?? "").replace(/\r\n?/g, "\n").split("\n"));
  renderBlocks(fragment, blocks, ctx);
  return fragment;
}
