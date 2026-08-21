#!/usr/bin/env node
// 打包 senti-ui 技能为 zip：解压后得到 senti-ui/ 目录（内含 SKILL.md），
// 可直接放入 ~/.agents/skills/ 或项目的 .agents/skills/ 使用。
// 零依赖：仅用 Node 内置模块（zlib deflate 压缩）。
import { mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_PARENT = join(REPO_ROOT, ".agents/skills");
const SKILL_NAME = "senti-ui";
const SKILL_DIR = join(SKILL_PARENT, SKILL_NAME);
const outFile = process.argv[2] ?? join(SKILL_PARENT, "senti-ui-skill.zip");

if (!exists(join(SKILL_DIR, "SKILL.md"))) {
  console.error(`错误：未找到 ${join(SKILL_DIR, "SKILL.md")}`);
  process.exit(1);
}

// 递归收集文件（zip 内路径统一用 / 分隔），排除 macOS 杂物
function collect(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    if (name === ".DS_Store" || name === "__MACOSX") continue;
    const full = join(dir, name);
    const entry = base ? `${base}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...collect(full, entry));
    else out.push({ full, entry });
  }
  return out;
}

// zip 日期时间（DOS 格式）
function dosDateTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
  const day = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
  return { time, day };
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function exists(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

const files = collect(SKILL_DIR, SKILL_NAME);
const chunks = [];
const central = [];
let offset = 0;

for (const { full, entry } of files) {
  const data = readFileSync(full);
  const comp = deflateRawSync(data, { level: 9 });
  const crc = crc32(data);
  const nameBuf = Buffer.from(entry, "utf8");
  const { time, day } = dosDateTime(statSync(full).mtime);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4); // version needed
  local.writeUInt16LE(0, 6); // flags
  local.writeUInt16LE(8, 8); // deflate
  local.writeUInt16LE(time, 10);
  local.writeUInt16LE(day, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(comp.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  chunks.push(local, nameBuf, comp);

  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(20, 4); // version made by
  cd.writeUInt16LE(20, 6); // version needed
  cd.writeUInt16LE(0, 8);
  cd.writeUInt16LE(8, 10);
  cd.writeUInt16LE(time, 12);
  cd.writeUInt16LE(day, 14);
  cd.writeUInt32LE(crc, 16);
  cd.writeUInt32LE(comp.length, 20);
  cd.writeUInt32LE(data.length, 24);
  cd.writeUInt16LE(nameBuf.length, 28);
  cd.writeUInt16LE(0, 30); // extra
  cd.writeUInt16LE(0, 32); // comment
  cd.writeUInt16LE(0, 34); // disk
  cd.writeUInt16LE(0, 36); // internal attrs
  cd.writeUInt32LE(0o644 << 16, 38); // external attrs
  cd.writeUInt32LE(offset, 42);
  central.push(cd, nameBuf);

  offset += local.length + nameBuf.length + comp.length;
}

const cdBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cdBuf.length, 12);
end.writeUInt32LE(offset, 16);

mkdirSync(dirname(outFile), { recursive: true });
rmSync(outFile, { force: true });
writeFileSync(outFile, Buffer.concat([...chunks, cdBuf, end]));

console.log(`已打包：${outFile}`);
for (const { entry } of files) console.log(`  ${entry}`);
console.log(`共 ${files.length} 个文件`);
