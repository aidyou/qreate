# Qreate

*A minimal, beautiful QR code generator for Chrome.*

[简体中文](README.zh-CN.md)

Qreate turns any page — or any text — into a QR code in one click. It runs entirely
in your browser: no server, no network requests, no tracking.

## Features

- **Instant popup** — click the toolbar icon and the current page URL is already
  encoded. Edit the input to turn any text into a QR code (auto-updates as you type).
- **Right-click overlay** — enable *“Generate page QR”* in the context menu to show a
  floating glass card with the page's QR code, right on top of the page. Dismiss it
  with Esc, a backdrop click, or the close button.
- **Restricted-page fallback** — on pages that disallow script injection
  (`chrome://`, the Web Store, …) Qreate opens a small standalone QR window instead.
- **Crisp vector output** — QR codes are rendered as SVG, so they stay sharp at any
  zoom level.
- **Private by design** — the manifest requests no host permissions and makes zero
  network requests. Everything is generated locally with a bundled QR library.
- **Bilingual UI** — English and Simplified Chinese, following your browser language.
- **Synced preference** — the context-menu toggle is stored via
  `chrome.storage.sync`, so it follows your Chrome profile.

## Install (unpacked)

1. Clone or download this repository.
2. Open `chrome://extensions` and enable **Developer mode** (top right).
3. Click **Load unpacked** and select this folder.
4. Pin the Qreate icon to your toolbar.

Requires **Chrome 102+** (Manifest V3).

## Usage

| Action | How |
| --- | --- |
| Encode the current page / any text | Click the toolbar icon, edit the input if needed |
| Show a QR overlay on the page | Right-click anywhere → **Generate page QR** |
| Enable/disable the context menu | Toggle **Right-click menu** in the popup |

## Project layout

```
qreate/
├── manifest.json          # MV3 manifest
├── background.js          # service worker: context menu + overlay injection
├── lib/qrcode.js          # bundled QR generator (Kazuhiko Arase, MIT)
├── content/overlay.js     # floating QR card, rendered in a Shadow DOM
├── popup/                 # toolbar popup (HTML / CSS / JS)
├── _locales/              # i18n strings (en, zh_CN)
├── icons/                 # icon.svg (design source) + generated PNGs
└── scripts/               # build-time icon tooling (Node)
```

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `contextMenus` | Adds the “Generate page QR” item to the right-click menu |
| `storage` | Persists the context-menu toggle across devices |
| `activeTab` | Reads the current tab URL and injects the overlay on user gesture |
| `scripting` | Injects `lib/qrcode.js` + `content/overlay.js` into the page |

No `host_permissions` are requested; the extension cannot touch any site beyond the
tab you explicitly act on.

## Development

The only build-time tooling is icon generation. `icons/icon.svg` is the single
design source: hand-edit it, then regenerate the PNGs.

```sh
npm install
npm run generate-icons        # icons/icon.svg -> icon{16,32,48,128}.png
node scripts/verify-icons.mjs # ASCII pixel preview of the outputs
```

Rasterization uses [`@resvg/resvg-wasm`](https://github.com/yisibl/resvg-js); the
`Q` glyph is set in DejaVu Sans Bold (bundled in `scripts/fonts/`).

> Note: at 16px (toolbar scale) thin strokes and sub-pixel details blur. If the
> small icon looks soft, use solid shapes at that size rather than a scaled-down
> version of the large design.

## Privacy

Qreate collects no personal data and makes zero network requests — everything
runs locally. The full privacy policy (English + 简体中文) lives in
[`PRIVACY.md`](PRIVACY.md). For the Chrome Web Store listing, use the GitHub
rendered page: <https://github.com/aidyou/qreate/blob/main/PRIVACY.md> — no
separate deployment needed.

## Third-party components

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by
  Kazuhiko Arase — MIT License (bundled as `lib/qrcode.js`).
- **DejaVu fonts** (Bitstream Vera / Arev license) — used only to render the
  extension icon at build time.
- [@resvg/resvg-wasm](https://github.com/yisibl/resvg-js) — MIT License,
  dev-only dependency.
