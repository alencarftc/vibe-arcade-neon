const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "../node_modules/stockfish/src");
const dest = path.resolve(__dirname, "../public");

fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(
  path.join(src, "stockfish-nnue-16-single.js"),
  path.join(dest, "stockfish.js")
);
fs.copyFileSync(
  path.join(src, "stockfish-nnue-16-single.wasm"),
  path.join(dest, "stockfish-nnue-16-single.wasm")
);
