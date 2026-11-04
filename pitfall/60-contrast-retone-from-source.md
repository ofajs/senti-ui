# “提高对比度”必须从色盘/源色按目标 tone 重新取色，不能平移已生成 token 的 tone

> **ID** `60` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

深色角色色在 tone 80 时受 sRGB 色域限制，实际 chroma 已被裁到约 35（种子 #FF2E97 的 chroma 有 95）；直接对这个 hex 的 HCT tone 做减法只会得到同色相的发灰颜色，霓虹感恢复不了。正确做法：核心角色从 `theme.palettes[role].tone(targetTone)` 取，自定义色/覆盖色从源 hex 的 hue+chroma 重新按 tone 生成（`deriveRoleTokensAtTones`）。默认路径也不要用“平移后的 hex”，否则 contrast=0 的输出会和旧版漂移；本次实现保留 tone 表并验证了默认输出逐字节一致。

---

[← 返回踩坑索引](../README.md)
