import fs from 'fs';

let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

// Find and remove GoogleGenAI import
let importIndex = lines.findIndex(l => l.includes("import { GoogleGenAI } from '@google/genai';"));
if (importIndex !== -1) {
    lines.splice(importIndex, 1);
}

// Find and remove ai initialization
let initStartIndex = lines.findIndex(l => l.includes('let ai: GoogleGenAI | null = null;'));
if (initStartIndex !== -1) {
    let initEndIndex = lines.findIndex((l, i) => i > initStartIndex && l.trim() === '});');
    if (initEndIndex !== -1) {
        lines.splice(initStartIndex, initEndIndex - initStartIndex + 1);
    } else {
        // fallback
        lines.splice(initStartIndex, 10);
    }
}

fs.writeFileSync('server.ts', lines.join('\n'));
