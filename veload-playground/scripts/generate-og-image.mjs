/**
 * Generates the Open Graph preview image.
 *
 * The image is written by hand with the Node standard library only, so the
 * repository does not need an image dependency. Run it with:
 *
 *   node scripts/generate-og-image.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deflateSync, crc32 } from "node:zlib";

const WIDTH = 1200;
const HEIGHT = 630;

const palette = {
  top: [0x12, 0x0d, 0x21],
  bottom: [0x1d, 0x15, 0x33],
  glow: [0x8b, 0x5c, 0xf6],
  ring: [0xa7, 0x8b, 0xfa],
  accent: [0x38, 0xbd, 0xf8],
  text: [0xf1, 0xee, 0xfb],
  muted: [0xa7, 0x9f, 0xc2],
};

const glyphs = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "3": ["#####", "....#", "....#", ".###.", "....#", "....#", "#####"],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

const pixels = new Uint8Array(WIDTH * HEIGHT * 3);

function setPixel(x, y, [r, g, b], alpha = 1) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
    return;
  }

  const index = (y * WIDTH + x) * 3;

  if (alpha >= 1) {
    pixels[index] = r;
    pixels[index + 1] = g;
    pixels[index + 2] = b;
    return;
  }

  pixels[index] = Math.round(pixels[index] * (1 - alpha) + r * alpha);
  pixels[index + 1] = Math.round(pixels[index + 1] * (1 - alpha) + g * alpha);
  pixels[index + 2] = Math.round(pixels[index + 2] * (1 - alpha) + b * alpha);
}

function blend(x, y, colour, alpha) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT || alpha <= 0) {
    return;
  }

  const index = (y * WIDTH + x) * 3;
  const amount = Math.min(1, alpha);

  pixels[index] = Math.round(pixels[index] * (1 - amount) + colour[0] * amount);
  pixels[index + 1] = Math.round(pixels[index + 1] * (1 - amount) + colour[1] * amount);
  pixels[index + 2] = Math.round(pixels[index + 2] * (1 - amount) + colour[2] * amount);
}

// Background: vertical gradient plus a soft radial glow.
for (let y = 0; y < HEIGHT; y += 1) {
  const t = y / (HEIGHT - 1);

  for (let x = 0; x < WIDTH; x += 1) {
    const base = [
      Math.round(palette.top[0] + (palette.bottom[0] - palette.top[0]) * t),
      Math.round(palette.top[1] + (palette.bottom[1] - palette.top[1]) * t),
      Math.round(palette.top[2] + (palette.bottom[2] - palette.top[2]) * t),
    ];

    setPixel(x, y, base);
  }
}

const glowX = 0.68 * WIDTH;
const glowY = 0.34 * HEIGHT;
const glowRadius = 420;

for (let y = 0; y < HEIGHT; y += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    const distance = Math.hypot(x - glowX, y - glowY);

    if (distance < glowRadius) {
      const strength = (1 - distance / glowRadius) ** 2 * 0.55;
      blend(x, y, palette.glow, strength);
    }
  }
}

// Loader motif: an open ring with a satellite dot.
const centerX = WIDTH / 2;
const centerY = 235;
const ringRadius = 118;
const ringWidth = 16;

for (let y = 0; y < HEIGHT; y += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    const distance = Math.hypot(x - centerX, y - centerY);
    const thickness = Math.abs(distance - ringRadius);

    if (thickness > ringWidth / 2) {
      continue;
    }

    const angle = Math.atan2(y - centerY, x - centerX);
    const normalised = (angle + Math.PI) / (Math.PI * 2);

    // Leave a gap so the ring reads as an animation frame.
    if (normalised > 0.08 && normalised < 0.32) {
      continue;
    }

    const edge = 1 - thickness / (ringWidth / 2);
    blend(x, y, palette.ring, 0.55 + edge * 0.45);
  }
}

const satelliteAngle = Math.PI * 1.55;
const satelliteX = centerX + Math.cos(satelliteAngle) * ringRadius;
const satelliteY = centerY + Math.sin(satelliteAngle) * ringRadius;

for (let y = 0; y < HEIGHT; y += 1) {
  for (let x = 0; x < WIDTH; x += 1) {
    const distance = Math.hypot(x - satelliteX, y - satelliteY);

    if (distance < 22) {
      const strength = distance < 16 ? 1 : 1 - (distance - 16) / 6;
      blend(x, y, palette.accent, strength);
    }
  }
}

function drawText(text, scale, originX, originY, colour, letterSpacing = 0) {
  let cursor = originX;

  for (const character of text.toUpperCase()) {
    const glyph = glyphs[character];

    if (glyph) {
      for (let row = 0; row < glyph.length; row += 1) {
        for (let column = 0; column < glyph[row].length; column += 1) {
          if (glyph[row][column] !== "#") {
            continue;
          }

          for (let dy = 0; dy < scale; dy += 1) {
            for (let dx = 0; dx < scale; dx += 1) {
              blend(
                cursor + column * scale + dx,
                originY + row * scale + dy,
                colour,
                1,
              );
            }
          }
        }
      }
    }

    cursor += 5 * scale + letterSpacing;
  }

  return cursor - letterSpacing;
}

function textWidth(text, scale, letterSpacing = 0) {
  return text.length * (5 * scale) + Math.max(0, text.length - 1) * letterSpacing;
}

const title = "VELOAD";
const titleScale = 13;
const titleWidth = textWidth(title, titleScale, 10);

drawText(title, titleScale, Math.round((WIDTH - titleWidth) / 2), 400, palette.text, 10);

const subtitle = "VUE 3 LOADING UI";
const subtitleScale = 4;
const subtitleWidth = textWidth(subtitle, subtitleScale, 6);

drawText(
  subtitle,
  subtitleScale,
  Math.round((WIDTH - subtitleWidth) / 2),
  520,
  palette.muted,
  6,
);

// Encode the image as a PNG.
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([length, typeAndData, crc]);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(WIDTH, 0);
header.writeUInt32BE(HEIGHT, 4);
header.writeUInt8(8, 8);
header.writeUInt8(2, 9);
header.writeUInt8(0, 10);
header.writeUInt8(0, 11);
header.writeUInt8(0, 12);

const raw = Buffer.alloc(HEIGHT * (WIDTH * 3 + 1));
let offset = 0;

for (let y = 0; y < HEIGHT; y += 1) {
  raw[offset] = 0;
  offset += 1;
  raw.set(pixels.subarray(y * WIDTH * 3, (y + 1) * WIDTH * 3), offset);
  offset += WIDTH * 3;
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", header),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const target = fileURLToPath(new URL("../public/og-image.png", import.meta.url));
writeFileSync(target, png);

console.log(`Wrote ${target} (${png.length} bytes)`);
