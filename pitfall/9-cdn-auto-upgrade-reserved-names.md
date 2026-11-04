# ofa CDN 不锁版本会自动升级

> **ID** `9` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（曾从 4.5 漂移到 4.7.3），新版可能把更多方法名变为保留（如 `refresh` 已被 `$.fn` 占用）——proto 方法名避开 `$.fn` 上的通用名（get/set/text/html/data/watch/on/emit/class/style/remove/refresh 等）

---

[← 返回踩坑索引](../README.md)
