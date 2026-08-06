const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

code = code.replace("import { logoBase64 } from '../lib/logoBase64';", "");
code = code.replace(/<img src=\{logoBase64\}/g, '<img src="/logo.svg"');

fs.writeFileSync('src/pages/LandingPage.tsx', code);
