const fs = require('fs');

// Read the generated JPG
const img = fs.readFileSync('src/assets/images/cardapp_logo_1784594062125.jpg');
const base64 = img.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64}`;

// Save as a TS module
fs.writeFileSync('src/lib/logoBase64.ts', `export const logoBase64 = "${dataUri}";\n`);

// Overwrite public/logo.png with the same binary data just so it's a valid image
// We'll rename it in index.html to .jpg to be correct, or just leave it since browsers don't care
fs.writeFileSync('public/logo.jpg', img);

