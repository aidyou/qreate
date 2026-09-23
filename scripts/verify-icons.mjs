// Qreate icon verification tool
// Renders icons/icon.svg at every output size and prints an ASCII preview
// plus the white-pixel bounding box, so you can check how it reads when
// scaled down (especially at 16px).
// Usage: node scripts/verify-icons.mjs

import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wasm = readFileSync(join(__dirname, "..", "node_modules", "@resvg", "resvg-wasm", "index_bg.wasm"));
await initWasm(wasm);
const FONT = join(__dirname, "fonts", "DejaVuSans-Bold.ttf");
const svg = readFileSync(join(__dirname, "..", "icons", "icon.svg"), "utf8");

for (const size of [16, 32, 48, 128]) {
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: false, fontBuffers: [readFileSync(FONT)], defaultFontFamily: "DejaVu Sans" },
  });
  const img = r.render();
  const buf = new Uint8Array(img.pixels);
  const isWhite = (x, y) => {
    const i = (y * size + x) * 4;
    return buf[i] > 200 && buf[i + 1] > 200 && buf[i + 2] > 200 && buf[i + 3] > 200;
  };
  let minX = size, minY = size, maxX = -1, maxY = -1, count = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (isWhite(x, y)) {
      count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  console.log(`--- ${size}px --- white bbox: x[${minX}..${maxX}] y[${minY}..${maxY}] count=${count}`);
  if (size <= 32) {
    for (let y = 0; y < size; y++) {
      let line = "";
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        line += buf[i + 3] < 100 ? " " : isWhite(x, y) ? "#" : ".";
      }
      console.log(line);
    }
  }
}