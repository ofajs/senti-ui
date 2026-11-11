import { test, expect } from "@playwright/test";

const waitReady = async (page) => {
  await page.waitForFunction(
    () => {
      const basic = document.querySelector("#chat-basic");
      const data = document.querySelector("#chat-data");
      return (
        basic?.shadowRoot?.querySelector(".viewport") &&
        data?.shadowRoot?.querySelector(".viewport") &&
        document.querySelector("#msg-assistant")?.shadowRoot?.querySelector(".bubble")
      );
    },
    { timeout: 20_000 }
  );
  await page.waitForTimeout(350);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/chat.html");
  await waitReady(page);
});

test("chat：容器插槽 / 三种 from / 左右对齐 / 头部与 actions / streaming 空内容", async ({ page }) => {
  const state = await page.evaluate(() => {
    const basic = document.querySelector("#chat-basic");
    const sr = basic.shadowRoot;
    const viewport = sr.querySelector(".viewport");
    const viewportRect = viewport.getBoundingClientRect();
    const rect = (id) => document.querySelector(`#${id}`).getBoundingClientRect();
    const assistant = rect("msg-assistant");
    const user = rect("msg-user");
    const stream = document.querySelector("#msg-streaming");
    const streamSr = stream.shadowRoot;
    const errorBubble = document
      .querySelector("#msg-error")
      .shadowRoot.querySelector(".bubble");
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      role: viewport.getAttribute("role"),
      ariaLabel: viewport.getAttribute("aria-label"),
      headerHidden: sr.querySelector(".header").hidden,
      footerHidden: sr.querySelector(".footer").hidden,
      emptyHidden: sr.querySelector(".empty").hidden,
      assistantLeft: assistant.left - viewportRect.left,
      userRight: viewportRect.right - user.right,
      userLeft: user.left,
      assistantRight: assistant.right,
      meta: document.querySelector("#msg-assistant").shadowRoot.querySelector(".meta").innerText,
      actionsHidden: document.querySelector("#msg-assistant").shadowRoot.querySelector(".actions").hidden,
      noMetaHidden: document.querySelector("#msg-plain").shadowRoot.querySelector(".meta").hidden,
      systemDisplay: getComputedStyle(document.querySelector("#msg-system")).display,
      streamingEmpty: streamSr.querySelector(".bubble").classList.contains("is-empty"),
      streamingTyping: getComputedStyle(streamSr.querySelector(".typing")).display,
      streamingCursor: getComputedStyle(streamSr.querySelector(".cursor")).display,
      streamingBusy: streamSr.querySelector(".bubble").getAttribute("aria-busy"),
      errorBorder: getComputedStyle(errorBubble).borderColor,
      errorColor: rootStyle.getPropertyValue("--md-sys-color-error").trim(),
      errorStatus: document.querySelector("#msg-error").shadowRoot.querySelector(".status").textContent,
      emptyChatEmptyHidden: document.querySelector("#chat-data").shadowRoot.querySelector(".empty").hidden,
    };
  });

  expect(state.role).toBe("log");
  expect(state.ariaLabel).toBe("基础对话");
  expect(state.headerHidden).toBe(false);
  expect(state.footerHidden).toBe(false);
  expect(state.emptyHidden).toBe(true);
  // assistant 靠左、user 靠右
  expect(state.userLeft).toBeGreaterThan(state.assistantRight);
  expect(state.userRight).toBeLessThan(20);
  expect(state.assistantLeft).toBeLessThan(20);
  expect(state.meta).toContain("Senti");
  expect(state.meta).toContain("14:20");
  expect(state.actionsHidden).toBe(false);
  expect(state.noMetaHidden).toBe(true);
  expect(state.systemDisplay).toBe("block");
  expect(state.streamingEmpty).toBe(true);
  expect(state.streamingTyping).toBe("inline-flex");
  expect(state.streamingCursor).toBe("none");
  expect(state.streamingBusy).toBe("");
  expect(state.errorStatus).toBe("发送失败");
  expect(state.errorBorder).not.toBe("rgba(0, 0, 0, 0)");
  expect(state.emptyChatEmptyHidden).toBe(false);
});

test("chat-message：name/time/avatar/status/streaming/error 运行时属性同步", async ({ page }) => {
  await page.evaluate(() => {
    const msg = document.querySelector("#msg-streaming");
    msg.textContent = "已经有内容了";
    msg.setAttribute("status", "写作中");
    msg.setAttribute("avatar", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E");
    msg.setAttribute("name", "Senti");
    msg.setAttribute("time", "9:41");
  });
  await page.waitForTimeout(250);

  const streaming = await page.evaluate(() => {
    const msg = document.querySelector("#msg-streaming");
    const sr = msg.shadowRoot;
    return {
      typing: getComputedStyle(sr.querySelector(".typing")).display,
      cursor: getComputedStyle(sr.querySelector(".cursor")).display,
      status: sr.querySelector(".status").textContent,
      statusHidden: sr.querySelector(".status").hidden,
      avatarHidden: sr.querySelector(".avatar").hidden,
      imgHidden: sr.querySelector(".avatar-img").hidden,
      imgAlt: sr.querySelector(".avatar-img").alt,
      meta: sr.querySelector(".meta").innerText,
    };
  });
  expect(streaming.typing).toBe("none");
  expect(streaming.cursor).toBe("inline-block");
  expect(streaming.status).toBe("写作中");
  expect(streaming.statusHidden).toBe(false);
  expect(streaming.avatarHidden).toBe(false);
  expect(streaming.imgHidden).toBe(false);
  expect(streaming.imgAlt).toBe("Senti");
  expect(streaming.meta).toContain("9:41");

  await page.evaluate(() => {
    const msg = document.querySelector("#msg-streaming");
    msg.removeAttribute("streaming");
    msg.removeAttribute("status");
    msg.removeAttribute("avatar");
    msg.removeAttribute("name");
    msg.removeAttribute("time");
  });
  await page.waitForTimeout(250);

  const cleared = await page.evaluate(() => {
    const msg = document.querySelector("#msg-streaming");
    const sr = msg.shadowRoot;
    return {
      busy: sr.querySelector(".bubble").hasAttribute("aria-busy"),
      cursor: getComputedStyle(sr.querySelector(".cursor")).display,
      statusHidden: sr.querySelector(".status").hidden,
      avatarHidden: sr.querySelector(".avatar").hidden,
      metaHidden: sr.querySelector(".meta").hidden,
    };
  });
  expect(cleared.busy).toBe(false);
  expect(cleared.cursor).toBe("none");
  expect(cleared.statusHidden).toBe(true);
  expect(cleared.avatarHidden).toBe(true);
  expect(cleared.metaHidden).toBe(true);
});

test("chat-message：模板缩进的首尾空行不会撑高气泡", async ({ page }) => {
  const state = await page.evaluate(() => {
    const msg = document.querySelector("#msg-plain");
    const sr = msg.shadowRoot;
    const bubble = sr.querySelector(".bubble");
    const content = sr.querySelector(".content");
    return {
      text: msg.textContent,
      contentHeight: content.getBoundingClientRect().height,
      bubbleHeight: bubble.getBoundingClientRect().height,
      lineHeight: parseFloat(getComputedStyle(content).lineHeight),
    };
  });
  // 正文首尾空白被裁掉，气泡高度接近一行正文 + padding，而不是多出多个空行
  expect(state.text).toBe("无头部的消息");
  expect(state.contentHeight).toBeLessThan(state.lineHeight * 1.5);
  expect(state.bubbleHeight).toBeLessThan(state.lineHeight + 30);
});

test("chat：messages 数组 API（role 别名 / 空状态 / id 复用不重建节点）", async ({ page }) => {
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-data");
    chat.messages = [
      { id: "a", role: "assistant", name: "Senti", content: "第一条" },
      { id: "b", role: "user", content: "第二条" },
    ];
  });
  await page.waitForTimeout(300);

  const first = await page.evaluate(() => {
    const chat = document.querySelector("#chat-data");
    const msgs = [...chat.shadowRoot.querySelectorAll("st-chat-message")];
    window.__msgB = msgs[1];
    return {
      count: msgs.length,
      froms: msgs.map((m) => m.getAttribute("from")),
      texts: msgs.map((m) => m.textContent.trim()),
      names: msgs.map((m) => m.getAttribute("name")),
      emptyHidden: chat.shadowRoot.querySelector(".empty").hidden,
      propLength: chat.messages.length,
    };
  });
  expect(first).toEqual({
    count: 2,
    froms: ["assistant", "user"],
    texts: ["第一条", "第二条"],
    names: ["Senti", null],
    emptyHidden: true,
    propLength: 2,
  });

  await page.evaluate(() => {
    const chat = document.querySelector("#chat-data");
    const next = chat.messages.slice();
    next[1] = { ...next[1], content: "第二条已更新", streaming: true };
    chat.messages = next;
  });
  await page.waitForTimeout(250);

  const second = await page.evaluate(() => {
    const chat = document.querySelector("#chat-data");
    const msgs = [...chat.shadowRoot.querySelectorAll("st-chat-message")];
    return {
      same: window.__msgB === msgs[1],
      content: msgs[1].textContent.trim(),
      streaming: msgs[1].hasAttribute("streaming"),
      cursor: getComputedStyle(msgs[1].shadowRoot.querySelector(".cursor")).display,
    };
  });
  expect(second.same).toBe(true);
  expect(second.content).toBe("第二条已更新");
  expect(second.streaming).toBe(true);
  expect(second.cursor).toBe("inline-block");

  await page.evaluate(() => {
    document.querySelector("#chat-data").messages = [];
  });
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => {
      const chat = document.querySelector("#chat-data");
      return {
        count: chat.shadowRoot.querySelectorAll("st-chat-message").length,
        emptyHidden: chat.shadowRoot.querySelector(".empty").hidden,
      };
    })
  ).toEqual({ count: 0, emptyHidden: false });
});

const seedAuto = async (page, count = 12) => {
  await page.evaluate((n) => {
    const chat = document.querySelector("#chat-auto");
    chat.messages = Array.from({ length: n }, (_, i) => ({
      id: `m${i}`,
      from: i % 2 ? "user" : "assistant",
      name: i % 2 ? "你" : "Senti",
      content: `第 ${i} 条自动滚动测试消息，内容需要足够长以撑出内部滚动区域。`.repeat(2),
    }));
  }, count);
  await page.waitForTimeout(400);
};

const autoState = (page) =>
  page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    const vp = chat.shadowRoot.querySelector(".viewport");
    return {
      top: vp.scrollTop,
      bottom: vp.scrollHeight - vp.clientHeight,
      height: vp.scrollHeight,
      client: vp.clientHeight,
      jumpHidden: chat.shadowRoot.querySelector(".jump").hidden,
      count: chat.shadowRoot.querySelectorAll("st-chat-message").length,
    };
  });

test("chat：auto-scroll 三态（auto 只在贴底时跟随 / always / off）与回到底部按钮", async ({ page }) => {
  await seedAuto(page);
  const initial = await autoState(page);
  expect(initial.height).toBeGreaterThan(initial.client);
  expect(initial.bottom - initial.top).toBeLessThan(4);
  expect(initial.jumpHidden).toBe(true);

  // auto：滚上去阅读时，新消息不抢滚动，并显示回到底部按钮
  await page.evaluate(() => {
    const vp = document.querySelector("#chat-auto").shadowRoot.querySelector(".viewport");
    vp.scrollTop = 0;
    vp.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    chat.messages = [
      ...chat.messages,
      { id: "auto-new", role: "assistant", content: "在顶部时新增的一条消息。" },
    ];
  });
  await page.waitForTimeout(350);
  const autoMode = await autoState(page);
  expect(autoMode.top).toBeLessThan(8);
  expect(autoMode.jumpHidden).toBe(false);

  // always：即使滚上去也强制跟随
  await page.evaluate(() => {
    document.querySelector("#chat-auto").setAttribute("auto-scroll", "always");
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    chat.messages = [
      ...chat.messages,
      { id: "always-new", role: "assistant", content: "always 模式新增的消息。" },
    ];
  });
  await page.waitForTimeout(350);
  const alwaysMode = await autoState(page);
  expect(alwaysMode.bottom - alwaysMode.top).toBeLessThan(4);
  expect(alwaysMode.jumpHidden).toBe(true);

  // off：不再自动跟随
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    chat.setAttribute("auto-scroll", "off");
    const vp = chat.shadowRoot.querySelector(".viewport");
    vp.scrollTop = 0;
    vp.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    chat.messages = [
      ...chat.messages,
      { id: "off-new", role: "assistant", content: "off 模式新增的消息。" },
    ];
  });
  await page.waitForTimeout(350);
  const offMode = await autoState(page);
  expect(offMode.top).toBeLessThan(8);

  // 回到底部按钮恢复跟随
  await page.locator("#chat-auto").evaluate((chat) => chat.shadowRoot.querySelector(".jump").click());
  await page.waitForTimeout(700);
  const jumped = await autoState(page);
  expect(jumped.bottom - jumped.top).toBeLessThan(4);
  expect(jumped.jumpHidden).toBe(true);

  // 外部 scrollToEnd()
  await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    const vp = chat.shadowRoot.querySelector(".viewport");
    vp.scrollTop = 0;
    vp.dispatchEvent(new Event("scroll"));
    chat.scrollToEnd({ smooth: false });
  });
  await page.waitForTimeout(150);
  const scrolled = await autoState(page);
  expect(scrolled.bottom - scrolled.top).toBeLessThan(4);
});

test("chat：新消息入场动画与 prefers-reduced-motion 降级", async ({ page }) => {
  const anim = await page.evaluate(() => {
    const msg = document.querySelector("#msg-assistant");
    const cs = getComputedStyle(msg);
    return { name: cs.animationName, duration: parseFloat(cs.animationDuration) };
  });
  expect(anim.name).toContain("st-chat-message-in");
  expect(anim.duration).toBeGreaterThan(0.2);

  // 新增的数组消息同样带入场动画
  await page.evaluate(() => {
    document.querySelector("#chat-data").messages = [
      { id: "anim", from: "assistant", content: "新消息" },
    ];
  });
  await page.waitForTimeout(50);
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.querySelector("#chat-data").shadowRoot.querySelector("st-chat-message")).animationName
    )
  ).toContain("st-chat-message-in");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await waitReady(page);
  const reduced = await page.evaluate(() => {
    const msg = document.querySelector("#msg-assistant");
    return {
      duration: parseFloat(getComputedStyle(msg).animationDuration),
      cursor: parseFloat(getComputedStyle(document.querySelector("#msg-streaming").shadowRoot.querySelector(".cursor")).animationDuration),
    };
  });
  expect(reduced.duration).toBeLessThan(0.001);
  expect(reduced.cursor).toBeLessThan(0.001);
});

test("chat：局部 data-skin 材质继承进组件 shadow（只改材质不改结构）", async ({ page }) => {
  const state = await page.evaluate(() => {
    const msg = document.querySelector("#msg-skin");
    const bubble = msg.shadowRoot.querySelector(".bubble");
    const cs = getComputedStyle(bubble);
    return {
      backdrop: cs.backdropFilter,
      radius: cs.borderBottomLeftRadius,
      chatRadius: getComputedStyle(document.querySelector("#chat-skin")).borderRadius,
      display: getComputedStyle(msg).display,
    };
  });
  expect(state.backdrop).toContain("blur");
  expect(state.chatRadius).not.toBe("0px");
  expect(state.display).toBe("flex");
});

test("chat：header/footer/empty 空插槽自动隐藏", async ({ page }) => {
  const state = await page.evaluate(() => {
    const chat = document.querySelector("#chat-auto");
    const sr = chat.shadowRoot;
    return {
      header: sr.querySelector(".header").hidden,
      footer: sr.querySelector(".footer").hidden,
      empty: sr.querySelector(".empty").hidden,
      jump: sr.querySelector(".jump").hidden,
    };
  });
  expect(state.header).toBe(true);
  expect(state.footer).toBe(true);
  expect(state.empty).toBe(true);
  expect(state.jump).toBe(true);
});
