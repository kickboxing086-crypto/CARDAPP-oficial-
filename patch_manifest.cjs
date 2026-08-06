const fs = require('fs');
let code = fs.readFileSync('public/manifest.json', 'utf-8');

code = code.replace(/"src": "\/logo\.jpg"/g, '"src": "/logo.jpg"'); // Just ensuring it's right.
fs.writeFileSync('public/manifest.json', code);
