const fs = require('fs');
let code = fs.readFileSync('public/manifest.json', 'utf-8');

code = code.replace(/"src": "\/logo\.jpg"/g, '"src": "/logo.svg"');
code = code.replace(/"type": "image\/jpeg"/g, '"type": "image/svg+xml"');

// Add "purpose": "any maskable" to the icons
code = code.replace(/"type": "image\/svg\+xml"/g, '"type": "image/svg+xml",\n      "purpose": "any maskable"');

fs.writeFileSync('public/manifest.json', code);
