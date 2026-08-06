const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Ensure that we don't crash when there are undefined values sent to Firebase
code = code.replace(/res\.status\(500\)\.json\(\{ error: 'Erro no setup\.' \}\);/g, "res.status(500).json({ error: 'Erro interno no setup da loja.' });");

// Improve the error handling in handleCreateStore in the frontend to handle Vercel HTML error pages gracefully
let frontend = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
frontend = frontend.replace(
  /const text = await res\.text\(\);\n\s*console\.error\('Non-JSON response:', text\);\n\s*data = text;/g,
  `const text = await res.text();
        console.error('Non-JSON response:', text);
        if (text.includes('FUNCTION_INVOCATION_FAILED')) {
          data = { error: 'Erro no servidor da Vercel (Timeout ou Falha Interna). Tente novamente.' };
        } else {
          data = { error: 'Erro inesperado no servidor.' };
        }`
);

fs.writeFileSync('server.ts', code);
fs.writeFileSync('src/pages/AdminDashboard.tsx', frontend);
