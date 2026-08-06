const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("if (!process.env.VERCEL) { dns.setDefaultResultOrder('ipv4first'); }", "dns.setDefaultResultOrder('ipv4first');");

const fetchTarget = `const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => {
  if (process.env.VERCEL) {
    return globalThis.fetch(url, options);
  }
  return nodeFetch(url, { ...options, agent: ipv4Agent });
};
const customFetch = fetch;`;

const fetchReplacement = `const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => {
  return nodeFetch(url, { ...options, agent: ipv4Agent });
};
const customFetch = fetch;`;

if (code.includes(fetchTarget)) {
  code = code.replace(fetchTarget, fetchReplacement);
  console.log("Reverted fetch to always use node-fetch with IPv4Agent");
}

fs.writeFileSync('server.ts', code);
console.log("Done");
