const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `const text = await res.text();
        console.error('Non-JSON response:', text);
        const snippet = text.slice(0, 200).replace(/<[^>]*>/g, ' ').trim();
        throw new Error(\`Erro \${res.status}: \${snippet || 'Resposta inválida'}\`);`,
  `const text = await res.text();
        console.error('Non-JSON response:', text);
        if (text.includes('FUNCTION_INVOCATION_FAILED')) {
            throw new Error('Erro 500: Falha no servidor Vercel (Timeout de Conexão). Tentando usar IPv4...');
        }
        const snippet = text.slice(0, 200).replace(/<[^>]*>/g, ' ').trim();
        throw new Error(\`Erro \${res.status}: \${snippet || 'Resposta inválida'}\`);`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched AdminDashboard.tsx");
