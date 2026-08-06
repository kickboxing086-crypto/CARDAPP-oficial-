const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `import fetch from 'node-fetch';
import { Agent } from 'https';

const agent = new Agent({ family: 4 }); // Force IPv4
const customFetch = (url, options) => fetch(url, { ...options, agent });`;

const newStr = `import nodeFetch from 'node-fetch';
import { Agent } from 'https';

const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => nodeFetch(url, { ...options, agent: ipv4Agent });
const customFetch = fetch;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('server.ts', code);
  console.log("Patched global fetch to use IPv4");
} else {
  console.log("Could not find target string");
}
