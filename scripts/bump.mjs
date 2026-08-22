#!/usr/bin/env node
// 版本 bump 脚本：同步更新 package.json 与 .agents/skills/senti-ui/SKILL.md 的版本号，
// 然后自动执行技能打包（scripts/pack-skill.mjs）。
// 用法：npm run bump [patch|minor|major|x.y.z]（缺省 patch）
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG_PATH = join(REPO_ROOT, "package.json");
const SKILL_PATH = join(REPO_ROOT, ".agents/skills/senti-ui/SKILL.md");

const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8"));
const current = pkg.version;
const arg = process.argv[2] ?? "patch";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
let next;
if (SEMVER_RE.test(arg)) {
  next = arg;
} else if (["patch", "minor", "major"].includes(arg)) {
  const [major, minor, patch] = current.split(".").map(Number);
  next =
    arg === "major"
      ? `${major + 1}.0.0`
      : arg === "minor"
        ? `${major}.${minor + 1}.0`
        : `${major}.${minor}.${patch + 1}`;
} else {
  console.error(`错误：无法识别的版本参数「${arg}」（应为 patch / minor / major / x.y.z）`);
  process.exit(1);
}

if (next === current) {
  console.error(`错误：新版本与当前版本相同（${current}）`);
  process.exit(1);
}

// 1. package.json
pkg.version = next;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + "\n");

// 2. SKILL.md frontmatter 的 version 行（与 release 版本保持一致，见 AGENTS.md）
const skill = readFileSync(SKILL_PATH, "utf8");
const skillNext = skill.replace(/^(version:\s*")[^"]+(")$/m, `$1${next}$2`);
if (skillNext === skill) {
  console.error(`错误：${SKILL_PATH} 中未找到 version 字段（frontmatter 需有 version: "x.y.z" 行）`);
  process.exit(1);
}
writeFileSync(SKILL_PATH, skillNext);

console.log(`版本：${current} → ${next}`);
console.log(`已更新 package.json 与 SKILL.md`);

// 3. 自动打包技能
const pack = spawnSync("node", [join(REPO_ROOT, "scripts/pack-skill.mjs")], {
  stdio: "inherit",
});
if (pack.status !== 0) {
  console.error("错误：技能打包失败");
  process.exit(pack.status ?? 1);
}
