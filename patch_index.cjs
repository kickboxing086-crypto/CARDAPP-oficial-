const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

code = code.replace(/<link rel="icon" type="image\/jpeg" href="\/logo\.jpg" \/>/, '<link rel="icon" type="image/svg+xml" href="/logo.svg" />');
code = code.replace(/<link rel="apple-touch-icon" href="\/logo\.jpg" \/>/, '<link rel="apple-touch-icon" href="/logo.svg" />');

fs.writeFileSync('index.html', code);
