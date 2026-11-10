# 等待子组件升级不要只靠固定定时器，用 `customElements.whenDefined`

> **ID** `62` · **分类** ofa.js / 组件 · **来源** tooltip 的 `aria-description` CI flake

`st-tooltip` 在 `ready()` 里把提示文本写到触发元素的 `aria-description`：触发元素是 `st-button` 时要穿透到它 shadow 里的原生 `<button>`。原实现用 50/150/300/600ms 四个定时器重试，本地一直通过；CI 并行 + 慢网络下 `st-button` 晚于这 600ms 才升级，`slotchange` 又不会因兄弟组件升级而触发，内部 `<button>` 上始终没有 `aria-description`，测试读到 `null`。

正确写法：对插槽里的自定义元素，用 `customElements.whenDefined(el.localName)` 等待定义生效后再同步一次，并用 `WeakSet` 防止 promise 已 resolve 时反复调度；固定定时器只作为快速路径，不能当作"升级一定会在 N 毫秒内完成"的保证。测试侧也应 poll 最终派生属性（这里等 `aria-description` 出现），不要在气泡定位完成后立刻读。

```js
if (text && !el.shadowRoot && el.localName.includes("-") && !this._descWaits.has(el)) {
  this._descWaits.add(el);
  customElements.whenDefined(el.localName).then(() => {
    requestAnimationFrame(() => this.applyContent?.());
  });
}
```

同一根因（父组件 ready 时子组件 shadowRoot 仍为 null）见 [#49](./49-v5-child-upgrade-late.md)；#49 的短定时器适用于同模板内已知会很快升级的子项，跨组件 / 插槽触发器的同步应优先用 `whenDefined`。
