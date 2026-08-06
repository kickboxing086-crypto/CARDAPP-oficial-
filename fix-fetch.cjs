const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("dns.setDefaultResultOrder")) {
  code = `import dns from 'dns';\ndns.setDefaultResultOrder('ipv4first');\n` + code;
  fs.writeFileSync('server.ts', code);
  console.log("Added dns ipv4first to server.ts");
}
