const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace standard fetch with fetch with AbortSignal.timeout
code = code.replace(/const res = await fetch\(url, \{/g, 'const res = await globalThis.fetch(url, {\n      signal: AbortSignal.timeout(4000),');

fs.writeFileSync('server.ts', code);
console.log("Added 4s timeout to Firestore fetches");
