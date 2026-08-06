import fs from 'fs';
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let index = lines.findIndex((l, i) => i > 1920 && l.includes('[AI Image Gen Error]'));
if (index !== -1) {
  lines.splice(index - 1, 10,
    '  } catch (err: any) {',
    '    console.error(\'Error in setup:\', err);',
    '    res.status(500).json({ error: err.message || \'Erro no setup.\' });',
    '  }',
    '});'
  );
}

fs.writeFileSync('server.ts', lines.join('\n'));
