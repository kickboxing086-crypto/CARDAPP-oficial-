const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes("dns.setDefaultResultOrder")) {
  code = "import dns from 'node:dns';\ndns.setDefaultResultOrder('ipv4first');\n" + code;
  fs.writeFileSync('server.ts', code);
}
