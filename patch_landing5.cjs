const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

// Ensure import is there
if (!code.includes('logoBase64')) {
  code = code.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\nimport { logoBase64 } from '../lib/logoBase64';");
}

code = code.replace(
  /src="\/logo\.png"/g,
  `src={logoBase64}`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
