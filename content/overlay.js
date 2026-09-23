// Qreate page overlay
// Injected into the page (isolated world) by background.js together with lib/qrcode.js.
// Exposes window.__qreate.show(url, title, closeLabel) which renders a small floating
// glass card with the QR code of the given URL. Dismissed by backdrop click, ESC or the
// close button. All DOM is hosted in a Shadow Root so page CSS cannot leak in.

(() => {
  "use strict";

  const STYLE = `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
    }
    * { box-sizing: border-box; }
    .qrz-backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 12, 8, 0.5);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: qrz-fade 0.18s ease both;
    }
    .qrz-card {
      width: min(320px, calc(100vw - 48px));
      background: linear-gradient(165deg, rgba(30, 26, 19, 0.96), rgba(18, 15, 11, 0.97));
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 22px;
      padding: 16px 16px 14px;
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.03);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      color: #f0ead9;
      animation: qrz-pop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
      text-align: left;
    }
    .qrz-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .qrz-title {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.2px;
      margin: 0;
    }
    .qrz-close {
      flex: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.06);
      color: #b3a891;
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
    }
    .qrz-close:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      transform: rotate(90deg);
    }
    .qrz-tile {
      background: #ffffff;
      border-radius: 16px;
      padding: 12px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
      line-height: 0;
    }
    .qrz-tile svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .qrz-tile svg path {
      fill: #211d18;
    }
    .qrz-url {
      margin-top: 10px;
      font-size: 11px;
      color: #a39a88;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      direction: ltr;
      text-align: left;
    }
    @keyframes qrz-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes qrz-pop {
      from { opacity: 0; transform: translateY(14px) scale(0.94); }
      to { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .qrz-backdrop, .qrz-card { animation: none !important; }
    }
    @media (prefers-color-scheme: light) {
      .qrz-backdrop {
        background: rgba(112, 88, 48, 0.16);
      }
      .qrz-card {
        background: linear-gradient(165deg, rgba(255, 253, 247, 0.95), rgba(250, 245, 232, 0.96));
        border-color: rgba(128, 100, 55, 0.2);
        box-shadow: 0 30px 70px rgba(122, 88, 34, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.5);
        color: #2b2620;
      }
      .qrz-close {
        border-color: rgba(128, 100, 55, 0.18);
        background: rgba(120, 95, 50, 0.06);
        color: #8a8172;
      }
      .qrz-close:hover {
        background: rgba(120, 95, 50, 0.14);
        color: #2b2620;
      }
      .qrz-tile {
        box-shadow: 0 12px 30px rgba(122, 88, 34, 0.2);
      }
      .qrz-url {
        color: #8a8172;
      }
    }
  `;

  let host = null;
  let keyDownHandler = null;

  function buildCard(url, title, closeLabel) {
    const root = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLE;
    root.appendChild(style);

    const backdrop = document.createElement("div");
    backdrop.className = "qrz-backdrop";

    const card = document.createElement("div");
    card.className = "qrz-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");

    const head = document.createElement("div");
    head.className = "qrz-head";

    const titleEl = document.createElement("div");
    titleEl.className = "qrz-title";
    titleEl.textContent = title;

    const close = document.createElement("button");
    close.className = "qrz-close";
    close.type = "button";
    close.setAttribute("aria-label", closeLabel);
    close.textContent = "\u00d7";

    head.appendChild(titleEl);
    head.appendChild(close);

    const tile = document.createElement("div");
    tile.className = "qrz-tile";
    if (typeof qrcode === "function") {
      try {
        const qr = qrcode(0, "L");
        qr.addData(url);
        qr.make();
        tile.innerHTML = qr.createSvgTag(2, 8);
        const svg = tile.querySelector("svg");
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", title);
      } catch {
        tile.textContent = "";
      }
    }

    const urlEl = document.createElement("div");
    urlEl.className = "qrz-url";
    urlEl.textContent = url;

    card.appendChild(head);
    card.appendChild(tile);
    card.appendChild(urlEl);
    backdrop.appendChild(card);
    root.appendChild(backdrop);

    // Dismissal
    keyDownHandler = (event) => {
      if (event.key === "Escape") hide();
    };

    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) hide();
    });
    close.addEventListener("click", hide);
    window.addEventListener("keydown", keyDownHandler, true);

    close.focus();
  }

  function destroy() {
    if (keyDownHandler) {
      window.removeEventListener("keydown", keyDownHandler, true);
      keyDownHandler = null;
    }
    if (host) {
      host.remove();
      host = null;
    }
  }

  function hide() {
    if (!host) return;
    const backdrop = host.shadowRoot && host.shadowRoot.querySelector(".qrz-backdrop");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!backdrop || reduced) {
      destroy();
      return;
    }
    backdrop.style.animation = "none";
    backdrop.style.opacity = "0";
    const el = host;
    host = null; // release immediately so a new overlay can be shown
    setTimeout(() => el.remove(), 160);
  }

  window.__qreate = {
    show(url, title, closeLabel) {
      destroy();
      host = document.createElement("div");
      buildCard(url, title, closeLabel);
      document.documentElement.appendChild(host);
    },
    hide,
  };
})();
