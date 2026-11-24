# ofa.js CDN 用主版本号 `@5`，不锁补丁版本

> **ID** `0` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

统一使用 `https://cdn.jsdelivr.net/gh/ofajs/ofa.js@5/dist/ofa.min.mjs`（v5 的 scsr 用 `https://cdn.jsdelivr.net/gh/ofajs/ofa.js@5/packages/scsr/dist/scsr.min.mjs`）：

- **不要锁死补丁版本**——锁 `4.5.0` 时 `o-fill` 直接渲染（内嵌 `$data` 模板）不可用；`@5` 跟随最新 5.x 补丁
- **也不要省掉版本号走默认分支**——jsdelivr 对默认分支最长缓存 7 天，v5 合并进 `main` 后仍可能拿到旧的 v4 构建；仓库 README / 验收页 / 技能统一写 `@5`

---

[← 返回踩坑索引](../README.md)
