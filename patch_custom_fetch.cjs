const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const customFetch = globalThis.fetch;`;
const replacement = `const customFetch = (url, options = {}) => {
  return globalThis.fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(4500)
  });
};`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched customFetch timeout");
