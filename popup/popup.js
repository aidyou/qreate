// Qreate popup logic
// - i18n strings are applied from chrome.i18n (auto language switch, English fallback)
// - the QR code auto-updates (debounced) as the input changes
// - the toggle persists via chrome.storage.sync and drives the context menu in background.js

const $ = (sel) => document.querySelector(sel);

const input = $("#urlInput");
const toggle = $("#menuToggle");
const qrFrame = $("#qrFrame");
const qrEmpty = $("#qrEmpty");
const qrError = $("#qrError");

const msg = (key) => chrome.i18n.getMessage(key) || key;

// ---- i18n -----------------------------------------------------------
function applyI18n() {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.title = msg("popupTitle");
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = msg(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
    el.placeholder = msg(el.dataset.i18nPlaceholder);
  }
}

// ---- QR rendering ----------------------------------------------------
let debounceTimer = 0;

function scheduleQR(text) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => renderQR(text), 140);
}

function renderQR(text) {
  const value = text.trim();

  if (!value) {
    qrError.hidden = true;
    qrFrame.innerHTML = "";
    qrFrame.appendChild(qrEmpty);
    return;
  }

  let qr;
  try {
    qr = qrcode(0, "L"); // auto version, low EC -> largest capacity
    qr.addData(value);
    qr.make();
  } catch {
    // Content too long to encode: keep the previous QR and show a hint.
    qrError.hidden = false;
    return;
  }

  qrError.hidden = true;
  qrFrame.innerHTML = qr.createSvgTag(2, 8);
  const svg = qrFrame.querySelector("svg");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", msg("qrAlt"));
}

// ---- context-menu toggle ---------------------------------------------
let menuEnabled = false;

function syncToggleUI() {
  toggle.classList.toggle("on", menuEnabled);
  toggle.setAttribute("aria-checked", String(menuEnabled));
}

const switchDesc = document.querySelector(".switch-desc");
let descErrorTimer = 0;

function showToggleError() {
  clearTimeout(descErrorTimer);
  switchDesc.textContent = msg("menuToggleError");
  switchDesc.classList.add("error");
  descErrorTimer = setTimeout(() => {
    switchDesc.textContent = msg("menuToggleDesc");
    switchDesc.classList.remove("error");
  }, 3000);
}

toggle.addEventListener("click", async () => {
  menuEnabled = !menuEnabled;
  syncToggleUI();

  // Double insurance: the popup persists the preference itself first. Even if
  // the message to the background fails, syncMenu() will create the context
  // menu the next time the service worker starts.
  const saved = await chrome.storage.sync
    .set({ contextMenuEnabled: menuEnabled })
    .then(() => true)
    .catch(() => false);

  try {
    const res = await chrome.runtime.sendMessage({
      type: "qreate:setContextMenu",
      enabled: menuEnabled,
    });
    if (!res || res.ok !== true) throw new Error((res && res.error) || "unknown error");
  } catch (err) {
    console.error("[Qreate] setContextMenu failed:", err);
    if (!saved) {
      // Persisting failed too: roll the UI back so it matches reality.
      menuEnabled = !menuEnabled;
      syncToggleUI();
    }
    showToggleError();
  }
});

// ---- init -------------------------------------------------------------
async function init() {
  applyI18n();

  try {
    const { contextMenuEnabled } = await chrome.storage.sync.get("contextMenuEnabled");
    menuEnabled = !!contextMenuEnabled;
  } catch {
    // Storage unavailable: keep the default (off).
  }
  syncToggleUI();

  input.addEventListener("input", () => scheduleQR(input.value));

  try {
    // Standalone-window mode (right-click on a restricted page): the URL is
    // passed in the query string — use it directly.
    const param = new URLSearchParams(location.search).get("url");
    if (param) {
      input.value = param;
      renderQR(param);
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = (tab && tab.url) || "";
    input.value = url;
    renderQR(url);
  } catch {
    renderQR("");
  }
}

init();
