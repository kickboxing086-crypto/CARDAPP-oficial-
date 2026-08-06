import fs from 'fs';

let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let startIndex = lines.findIndex(l => l.includes('app.post(\'/api/admin/ai/generate-image\''));
if (startIndex !== -1) {
    let endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('app.post(\'/api/admin/products\''));
    if (endIndex !== -1) {
        lines.splice(startIndex, endIndex - startIndex);
    }
}
fs.writeFileSync('server.ts', lines.join('\n'));
