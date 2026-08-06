const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
code = code.replace("throw new Error('Erro 500: Falha no servidor Vercel (Timeout de Conexão). Tentando usar IPv4...');", "throw new Error('Erro 500: Falha de conexão. Por favor, tente novamente.');");
fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log("Patched error message in AdminDashboard.tsx");
