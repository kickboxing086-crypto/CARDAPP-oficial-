import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded Background -->
  <rect width="512" height="512" rx="112" fill="#09090b"/>
  <!-- Inner gradient circle -->
  <circle cx="256" cy="256" r="180" fill="url(#paint0_linear)" stroke="#f59e0b" stroke-width="8" stroke-opacity="0.3"/>
  
  <!-- FoodTrayIcon translated and scaled in the center -->
  <g transform="translate(160, 160) scale(8)" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Cloche Top Knob -->
    <circle cx="12" cy="5" r="1.2" fill="#f59e0b" stroke="none" />
    <!-- Cloche Dome -->
    <path d="M4 14a8 8 0 0 1 16 0" />
    <!-- Shine on Dome -->
    <path d="M9 10a4 4 0 0 1 4-2" stroke-width="1.5" opacity="0.7" />
    <!-- Tray Base Plate -->
    <path d="M2 17h20" stroke-width="2.5" />
    <!-- Tray Bottom Lip -->
    <path d="M1 19.5h22" stroke-width="1.2" opacity="0.6" />
  </g>

  <defs>
    <linearGradient id="paint0_linear" x1="256" y1="76" x2="256" y2="436" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1e1b4b"/>
      <stop offset="1" stop-color="#09090b"/>
    </linearGradient>
  </defs>
</svg>
`;

async function main() {
  const publicDir = './public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svg);

  // Generate 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'app-icon-512.png'));
  console.log('✓ Created app-icon-512.png');

  // Generate 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'app-icon-192.png'));
  console.log('✓ Created app-icon-192.png');

  // Generate apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'app-apple-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // Generate favicon.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Created favicon.png');

  // Generate favicon.ico (can use sharp to resize to 32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  // Also create a logo.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created logo.png');
}

main().catch(console.error);
