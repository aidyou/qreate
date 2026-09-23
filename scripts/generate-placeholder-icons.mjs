// Qreate placeholder icon generator
// Design source: icons/icon.svg (hand-editable in any tool).
// Renders it to icon{16,32,48,128}.png with @resvg/resvg-wasm, embedding
// scripts/fonts/DejaVuSans-Bold.ttf for the "Q" glyph.
// Usage:
//   npm run generate-icons
//   node scripts/verify-icons.mjs   (ASCII pixel preview of the outputs)

import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "icons");
const FONT = join(__dirname, "fonts", "DejaVuSans-Bold.ttf");
const WASM = join(__dirname, "..", "node_modules", "@resvg", "resvg-wasm", "index_bg.wasm");

await initWasm(readFileSync(WASM));

const svg = readFileSync(join(OUT, "icon.svg"), "utf8");

for (const size of [16, 32, 48, 128]) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: {
      loadSystemFonts: false,
      fontBuffers: [readFileSync(FONT)],
      defaultFontFamily: "DejaVu Sans",
    },
  });
  const file = join(OUT, `icon${size}.png`);
  writeFileSync(file, resvg.render().asPng());
  console.log(`written: ${file}`);
}