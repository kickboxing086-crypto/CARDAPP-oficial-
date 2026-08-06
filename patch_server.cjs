const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /app\.post\('\/api\/register', async \(req, res\) => {[\s\S]*?}\);/g,
  `app.post('/api/register', async (req, res) => {
  res.status(403).json({ error: 'Cadastro público desativado. Contate o administrador.' });
});`
);

fs.writeFileSync('server.ts', code);
