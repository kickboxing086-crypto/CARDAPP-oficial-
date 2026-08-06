const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const handlers = `
process.on('unhandledRejection', (reason, promise) => {
  console.error('[System] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[System] Uncaught Exception:', err);
});
`;

if (!code.includes("unhandledRejection")) {
  code = code.replace("import express from 'express';", "import express from 'express';\n" + handlers);
  fs.writeFileSync('server.ts', code);
}
