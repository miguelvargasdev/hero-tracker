import { writeFileSync, mkdirSync } from "fs";
import zlib from "zlib";

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++)
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function generatePNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB

  // Draw a simple "H" on a colored background
  const rows = [];
  const letterStart = Math.floor(size * 0.25);
  const letterEnd = Math.floor(size * 0.75);
  const barTop = Math.floor(size * 0.45);
  const barBottom = Math.floor(size * 0.55);
  const strokeWidth = Math.floor(size * 0.12);

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // None filter
    for (let x = 0; x < size; x++) {
      const inVerticalRange = y >= letterStart && y <= letterEnd;
      const inLeftStroke =
        inVerticalRange && x >= letterStart && x < letterStart + strokeWidth;
      const inRightStroke =
        inVerticalRange &&
        x > letterEnd - strokeWidth &&
        x <= letterEnd;
      const inHorizontalBar =
        y >= barTop &&
        y <= barBottom &&
        x >= letterStart &&
        x <= letterEnd;

      const isForeground = inLeftStroke || inRightStroke || inHorizontalBar;

      const offset = 1 + x * 3;
      row[offset] = isForeground ? fgR : bgR;
      row[offset + 1] = isForeground ? fgG : bgG;
      row[offset + 2] = isForeground ? fgB : bgB;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData);

  return Buffer.concat([
    sig,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });

// Dark navy bg (#1a1a2e = 26,26,46), gold fg (#e0a050 = 224,160,80)
writeFileSync(
  "public/icons/icon-192x192.png",
  generatePNG(192, 26, 26, 46, 224, 160, 80)
);
writeFileSync(
  "public/icons/icon-512x512.png",
  generatePNG(512, 26, 26, 46, 224, 160, 80)
);
console.log("Icons generated!");
