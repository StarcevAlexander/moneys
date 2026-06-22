// Генерация иконок PWA «монета с буквой M» из SVG в PNG всех размеров.
// Запуск: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'public', 'icons');
const publicDir = join(root, 'public');

// Монета на «денежном» фоне — для maskable (Android) и apple-touch (iOS): фон до краёв.
const coinDefs = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="32%" r="85%">
      <stop offset="0%" stop-color="#11633d"/>
      <stop offset="100%" stop-color="#03150e"/>
    </radialGradient>
    <radialGradient id="coin" cx="38%" cy="30%" r="78%">
      <stop offset="0%" stop-color="#fff6cf"/>
      <stop offset="34%" stop-color="#ffd24d"/>
      <stop offset="70%" stop-color="#e8a83a"/>
      <stop offset="100%" stop-color="#b6781e"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffeaa0"/>
      <stop offset="100%" stop-color="#a86a18"/>
    </linearGradient>
    <linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a4a0e"/>
      <stop offset="100%" stop-color="#5a3408"/>
    </linearGradient>
  </defs>`;

const coinShape = (cx, cy, r, mSize) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#rim)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.905}" fill="url(#coin)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.905}" fill="none" stroke="#fff6d6" stroke-opacity="0.5" stroke-width="${r * 0.016}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.79}" fill="none" stroke="#a86a18" stroke-opacity="0.45" stroke-width="${r * 0.032}" stroke-dasharray="${r * 0.05} ${r * 0.063}"/>
  <text x="${cx}" y="${cy + r * 0.02}" font-family="Georgia, 'Times New Roman', serif" font-size="${mSize}" font-weight="700" fill="url(#m)" text-anchor="middle" dominant-baseline="central">M</text>
  <ellipse cx="${cx - r * 0.29}" cy="${cy - r * 0.4}" rx="${r * 0.47}" ry="${r * 0.26}" fill="#ffffff" opacity="0.18"/>`;

// Полноэкранная плитка (фон + монета), безопасная зона maskable ~80%.
const tileSvg = (size) => {
  const cx = size / 2;
  const r = size * 0.37;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${coinDefs}
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    ${coinShape(cx, cx, r, r * 1.05)}
  </svg>`;
};

// Прозрачная монета (favicon / лого внутри приложения).
const coinOnlySvg = (size) => {
  const cx = size / 2;
  const r = size * 0.47;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${coinDefs}
    ${coinShape(cx, cx, r, r * 1.05)}
  </svg>`;
};

const maskableSizes = [72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];

await mkdir(iconsDir, { recursive: true });

for (const size of maskableSizes) {
  const buf = Buffer.from(tileSvg(512));
  await sharp(buf)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}x${size}.png`));
}

// Apple touch icon (iOS) — 180x180, непрозрачный.
await sharp(Buffer.from(tileSvg(512)))
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'));

// Favicon 32 + svg.
await sharp(Buffer.from(coinOnlySvg(512)))
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, 'favicon-32x32.png'));
await writeFile(join(publicDir, 'favicon.svg'), coinOnlySvg(64), 'utf8');
await writeFile(join(publicDir, 'logo.svg'), coinOnlySvg(128), 'utf8');

console.log('Иконки сгенерированы:', maskableSizes.length, 'размеров + apple-touch + favicon');
