const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/await globalThis\.fetch\(/g, "await customFetch(");
code = code.replace(/await fetch\(/g, "await customFetch(");

fs.writeFileSync('server.ts', code);
