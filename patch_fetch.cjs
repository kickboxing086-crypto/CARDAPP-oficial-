const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => {
  return nodeFetch(url, { ...options, agent: ipv4Agent });
};
const customFetch = fetch;`;

const replacement = `// Use native Node 18 fetch
const customFetch = globalThis.fetch;`;

code = code.replace(target, replacement);

const target2 = `import nodeFetch from 'node-fetch';
import { Agent } from 'https';`;
code = code.replace(target2, "");

fs.writeFileSync('server.ts', code);
console.log("Patched fetch");
