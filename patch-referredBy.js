import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

if (!code.includes('const [newReferredBy, setNewReferredBy]')) {
  code = code.replace(
    "const [newStoreName, setNewStoreName] = useState('');",
    "const [newStoreName, setNewStoreName] = useState('');\n  const [newReferredBy, setNewReferredBy] = useState('');"
  );
}

if (!code.includes('referredBy: newReferredBy.trim()')) {
  code = code.replace(
    "planType: newPlanType",
    "planType: newPlanType,\n          referredBy: newReferredBy.trim()"
  );
}

if (!code.includes('placeholder="Código do Embaixador (Opcional)"')) {
  code = code.replace(
    /<input\n\s*type="text"\n\s*placeholder="Nome da Loja \(Ex: Burger King\)"/g,
    `<input
                        type="text"
                        placeholder="Código do Embaixador (Opcional)"
                        value={newReferredBy}
                        onChange={e => setNewReferredBy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Nome da Loja (Ex: Burger King)"`
  );
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
