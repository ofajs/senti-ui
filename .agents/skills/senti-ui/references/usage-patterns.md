# 使用模式与常见坑（消费方必读）

Senti-UI 基于 ofa.js。在 ofa 页面（`<o-page>` / `<o-app>`）内用模板语法最顺；在普通 HTML/JS 里用 attribute API 也可。以下是两种场景的正确写法和已踩实的坑。

## 1. 运行时状态 vs 标签属性

组件属性分两类，**读写方式完全不同**：

- **标签属性**（disabled / variant / placeholder / duration 等）：HTML 里写裸属性，JS 用 `setAttribute` / `removeAttribute`
- **运行时状态**（value / open 等 ofa data）：JS 用 `el.value`、`el.open` 这样的 DOM property 读写；`setAttribute("value", ...)` 无效。初始值用对应的 `default-value` 标签属性（input/textarea/select/slider 都有）

已被内部交互修改的状态（dialog 被 auto-close 关掉、input 被用户输入）必须走运行时状态通道，声明成标签属性的话内部无法回写上层绑定。

## 2. ofa 页面内的绑定语法

优先级：模板渲染语法 > ofa API > 原生 DOM API。

- 数据绑定：`{{xxx}}` 只能用于**文本节点**；属性值一律用指令 `attr:xxx="expr"` / `:prop="expr"`
- **布尔属性必须用 `attr:`**，不能 `:prop`——`:disabled="false"` 会把 false 序列化成字符串属性，属性存在即生效，变成永远禁用
- 事件：`on:click="method"`（根级直接写方法名）
- 双向绑定：`sync:open="dlgOpen"`、`sync:value="form.name"` —— dialog/tooltip 的 open、输入类的 value 都推荐 `sync:`
- 列表渲染：`o-fill`
- 计算属性放 proto 上的 `get`（放模块顶层会导致页面模块加载失败且报错被吞）

```html
<st-dialog sync:open="dlgOpen" auto-close>
  <template slot="headline">标题</template>
  <p>内容</p>
</st-dialog>
<st-button on:click="dlgOpen = true">打开</st-button>
```

## 3. 事件监听

- `click` / `input` / `change` / `close` 等在 senti-ui 组件上均已 composed，直接在宿主标签上 `addEventListener` 即可（st-input/st-textarea 内部已把非 composed 的原生 change 转发出来）
- 事件处理器里读值用 `e.target.value`（value 已反射到宿主 DOM property）

## 4. 消费方常见坑

- **JS 改布尔属性用 setAttribute/removeAttribute**，改 property 不触发更新
- **`setAttribute` 后 watch 异步生效**——同步读计算样式/状态会得到旧值，验证时 `await` 约 100ms 再断言
- **st-dialog / st-select / st-menu 等弹层组件不要放在有 `transform`/`filter` 的祖先内**——fixed 定位会被劫持成相对该祖先，遮罩铺不满视口。挂在 body 或无 transform 的顶层容器（命令式工具 stAlert/stToast 自动 append 到 body，天然规避）
- **st-select 弹层在 shadow 内**，被 `overflow: hidden` 祖先裁剪时会截断，注意放置位置
- **`<st-icon-button>` 无文字，必须配 `title` / `aria-label`**
- **st-card 内放按钮等交互元素时不要加 `interactive`**——点内部按钮会同时冒泡出卡片 click
- **radio 互斥依赖同一父容器**——同组 `<st-radio name="x">` 必须放在同一个直接父容器下（name 分组不跨 shadow root，由组件查同父兄弟实现）
- **st-tab-item / st-nav-item 的 active 切换由外部逻辑处理**（组件只把 click 冒泡出来并做指示条动画）
- 合成事件测试：`dispatchEvent(new PointerEvent(...))` 跨 shadow 边界要带 `{ composed: true }`，否则宿主监听收不到（真实用户操作无此问题）
- `document.createElement` 动态创建的 senti-ui 组件可能不升级（无 shadowRoot），动态实例优先页面预置元素或轮询就绪

## 5. 部署说明

- 无构建：任意静态服务器直接部署即可；`l-m src` 与 ES import 必须写**完整 URL**（或与你的部署路径一致的绝对路径 `/packages/...`）
- 颜色在 JS 执行后生效，有极短未上色闪烁；主题体系依赖 CDN 上的 material-color-utilities
- 本地开发/预览 senti-ui 生态页面时用 `npm run dev`（http-server 禁缓存，端口 8642），不要用不禁缓存的服务，否则改完文件浏览器继续用旧模块
