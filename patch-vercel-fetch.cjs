const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch DNS
if (code.includes("dns.setDefaultResultOrder('ipv4first');")) {
  code = code.replace(
    "dns.setDefaultResultOrder('ipv4first');",
    "if (!process.env.VERCEL) { dns.setDefaultResultOrder('ipv4first'); }"
  );
}

// Patch Fetch Agent
const fetchTarget = `const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => nodeFetch(url, { ...options, agent: ipv4Agent });
const customFetch = fetch;`;

const fetchReplacement = `const ipv4Agent = new Agent({ family: 4 }); // Force IPv4
// Override fetch for the whole file
const fetch = (url, options = {}) => {
  if (process.env.VERCEL) {
    return globalThis.fetch(url, options);
  }
  return nodeFetch(url, { ...options, agent: ipv4Agent });
};
const customFetch = fetch;`;

if (code.includes(fetchTarget)) {
  code = code.replace(fetchTarget, fetchReplacement);
  console.log("Patched fetchTarget");
}

fs.writeFileSync('server.ts', code);
console.log("Done patching Vercel fixes");
