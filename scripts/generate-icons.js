/**
 * Generate fallback PNG icons for older Android versions
 * Run: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const COLOR_BG = [0x1a, 0x1a, 0x2e]; // #1a1a2e dark blue
const COLOR_FG = [0xff, 0x6b, 0x35]; // #FF6B35 orange

function createPNG(width, height, r, g, b) {
  // Minimal PNG generator
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT - raw pixel data with filter byte per row
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main');

// Generate launcher icons (colored squares with orange foreground)
Object.entries(SIZES).forEach(([dir, size]) => {
  const fgSize = Math.round(size * 0.6); // foreground is 60% of icon size
  const offset = Math.round((size - fgSize) / 2);

  // Create a simple composite: orange square on dark background
  const rawData = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    rawData[y * (1 + size * 3)] = 0;
    for (let x = 0; x < size; x++) {
      const offset2 = y * (1 + size * 3) + 1 + x * 3;
      // Check if pixel is in foreground area
      if (x >= offset && x < offset + fgSize && y >= offset && y < offset + fgSize) {
        rawData[offset2] = COLOR_FG[0];
        rawData[offset2 + 1] = COLOR_FG[1];
        rawData[offset2 + 2] = COLOR_FG[2];
      } else {
        rawData[offset2] = COLOR_BG[0];
        rawData[offset2 + 1] = COLOR_BG[1];
        rawData[offset2 + 2] = COLOR_BG[2];
      }
    }
  }
  const compressed = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeB, data, crc]);
  }

  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);

  const outDir = path.join(androidResDir, dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'ic_launcher.png'), png);
  fs.writeFileSync(path.join(outDir, 'ic_launcher_round.png'), png);
  // Also create foreground for older devices
  fs.writeFileSync(path.join(outDir, 'ic_launcher_foreground.png'), png);
  console.log(`  ✓ ${dir} (${size}x${size})`);
});

console.log('✅ Iconos generados correctamente');
