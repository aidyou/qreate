// Qreate background service worker
// 1) Creates / removes the right-click context menu based on the stored toggle state.
// 2) On "Generate page QR" click, injects the QR library + floating overlay into the
//    current page, then passes the page URL and localized strings to it.

const MENU_ID = "qreate-generate-page-qr";

function createMenu(attempt = 0) {
  chrome.contextMenus.create(
    {
      id: MENU_ID,
      title: chrome.i18n.getMessage("contextMenuTitle"),
      // "all" so the item also shows when right-clicking links, images,
      // selected text, editable fields, frames etc. (plain "page" is
      // unreliable on macOS for non-empty page zones).
      contexts: ["all"],
      // Note: no "icons" property — Chrome's CreateProperties does not
      // support it and it can make create() fail with "Unknown error
      // happened." (the manifest 16px icon is shown next to items anyway).
    },
    () => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error("[Qreate] contextMenus.create failed:", err.message);
        // The menu system may not be ready right after the worker wakes up.
        if (attempt < 1) setTimeout(() => createMenu(attempt + 1), 500);
      }
    },
  );
}

async function syncMenu() {
  const { contextMenuEnabled } = await chrome.storage.sync.get("contextMenuEnabled");
  if (contextMenuEnabled) {
    await chrome.contextMenus.removeAll().catch((err) => {
      console.error("[Qreate] contextMenus.removeAll failed:", String(err));
    });
    createMenu();
  } else {
    await chrome.contextMenus.remove(MENU_ID).catch((err) => {
      console.error("[Qreate] contextMenus.remove failed:", String(err));
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  syncMenu().catch((err) => console.error("[Qreate] syncMenu (onInstalled):", err));
});
chrome.runtime.onStartup.addListener(() => {
  syncMenu().catch((err) => console.error("[Qreate] syncMenu (onStartup):", err));
});

// Re-sync after a service worker restart so the menu matches the stored preference.
syncMenu().catch((err) => console.error("[Qreate] syncMenu (top-level):", err));

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "qreate:setContextMenu") {
    chrome.storage.sync
      .set({ contextMenuEnabled: !!message.enabled })
      .then(syncMenu)
      .then(() => sendResponse({ ok: true, enabled: !!message.enabled }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true; // async response
  }
  return false;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;

  // Generate from the current tab address (what the user sees in the address
  // bar); fall back to the clicked page URL (e.g. when clicked inside a frame).
  const url = (tab && tab.url) || info.pageUrl;
  if (!url || !/^(https?|file):/i.test(url)) return;

  const payload = {
    url,
    title: chrome.i18n.getMessage("overlayTitle"),
    closeLabel: chrome.i18n.getMessage("overlayClose"),
  };

  // Step 1: inject the QR library and the overlay script (isolated world).
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["lib/qrcode.js", "content/overlay.js"],
    })
    .then(() => {
      // Step 2: ask the (now loaded) overlay to render this page's QR.
      // Same isolated world => can reach the global exposed by overlay.js.
      return chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (args) => window.__qreate?.show(args.url, args.title, args.closeLabel),
        args: [payload],
      });
    })
    .catch((err) => {
      console.error("[Qreate] overlay injection failed:", String(err));
      // Restricted pages (chrome://, Web Store, …) cannot be script-injected.
      // Fall back to a small standalone QR window instead.
      chrome.windows
        .create({
          url: chrome.runtime.getURL(`popup/popup.html?url=${encodeURIComponent(url)}`),
          type: "popup",
          width: 396,
          height: 548,
        })
        .catch((err2) => console.error("[Qreate] fallback window failed:", String(err2)));
    });
});
