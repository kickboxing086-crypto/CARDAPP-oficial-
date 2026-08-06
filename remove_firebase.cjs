const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The block to replace:
const startStr = "let firestoreConfig: any = null;";
const endStr = "if (!firestoreConfig) {\n  console.warn('[Firebase REST] Config file not found and no environment variables present. Running with local fallback.');\n}";

let startIndex = code.indexOf(startStr);
let endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + "let firestoreConfig: any = null;\n" + code.substring(endIndex + endStr.length);
  fs.writeFileSync('server.ts', code);
  console.log('Firebase config removed');
} else {
  console.log('Could not find boundaries.');
  console.log('Start index:', startIndex);
  console.log('End index:', endIndex);
}
