import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add states for selectedStores and ambassadors
if (!code.includes('const [selectedStores, setSelectedStores]')) {
  code = code.replace(
    "const [superTab, setSuperTab] = useState<'stores' | 'billing' | 'platform_settings'>('stores');",
    "const [superTab, setSuperTab] = useState<'stores' | 'billing' | 'platform_settings' | 'ambassadors'>('stores');\n  const [selectedStores, setSelectedStores] = useState<string[]>([]);\n  const [newAmbassadorName, setNewAmbassadorName] = useState('');\n  const [newAmbassadorEmail, setNewAmbassadorEmail] = useState('');"
  );
}

// 2. Add bulk delete function
if (!code.includes('const handleBulkDeleteStores')) {
  const bulkDeleteCode = `
  const handleBulkDeleteStores = async () => {
    if (selectedStores.length === 0) return;
    if (!window.confirm(\`Você tem certeza que deseja excluir \${selectedStores.length} loja(s)?\nIsso apagará o catálogo, faturamento e acesso permanentemente.\`)) return;
    
    setSuperLoading(true);
    let deleted = 0;
    for (const storeId of selectedStores) {
      try {
        const res = await fetch(getApiUrl(\`/api/admin/super/stores/\${storeId}\`), {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) deleted++;
      } catch (err) {}
    }
    setSuperLoading(false);
    setSelectedStores([]);
    showNotification(\`\${deleted} loja(s) excluída(s) com sucesso.\`, 'success');
    fetchSuperStores();
  };
`;
  code = code.replace("const handleRefresh = async () => {", bulkDeleteCode + "\n  const handleRefresh = async () => {");
}

// 3. Add handleCreateAmbassador and handleDeleteAmbassador
if (!code.includes('const handleCreateAmbassador')) {
  const ambassadorCode = `
  const handleCreateAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbassadorName || !newAmbassadorEmail) return;
    const store = superStores.find(s => s.id === 'master-ceo');
    if (!store) return;
    
    const settings = store.settings || {};
    const ambassadors = settings.ambassadors || [];
    const code = newAmbassadorName.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000);
    const newAmbassador = {
      id: crypto.randomUUID(),
      name: newAmbassadorName,
      email: newAmbassadorEmail,
      code,
      createdAt: new Date().toISOString()
    };
    
    const updatedSettings = { ...settings, ambassadors: [...ambassadors, newAmbassador] };
    
    try {
      const res = await fetch(getApiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        showNotification('Embaixador criado!', 'success');
        setNewAmbassadorName('');
        setNewAmbassadorEmail('');
        fetchSuperStores();
      }
    } catch (e) {}
  };

  const handleDeleteAmbassador = async (id: string) => {
    if (!window.confirm('Tem certeza?')) return;
    const store = superStores.find(s => s.id === 'master-ceo');
    if (!store) return;
    
    const settings = store.settings || {};
    const ambassadors = (settings.ambassadors || []).filter((a: any) => a.id !== id);
    
    const updatedSettings = { ...settings, ambassadors };
    
    try {
      await fetch(getApiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSettings)
      });
      showNotification('Embaixador removido', 'success');
      fetchSuperStores();
    } catch (e) {}
  };
`;
  code = code.replace("const handleBulkDeleteStores", ambassadorCode + "\n  const handleBulkDeleteStores");
}

// 4. Update the CEO card to look luxurious
code = code.replace(
  /<div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-amber-500\/20 p-6 relative overflow-hidden group">/g,
  `<div className="bg-gradient-to-br from-[#1a1500] via-slate-950 to-black rounded-3xl border border-amber-500/30 p-6 relative overflow-hidden group shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">`
);

code = code.replace(
  /<h3 className="text-lg font-black text-white leading-tight">Samuel Silva<\/h3>/g,
  `<h3 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-200 bg-clip-text text-transparent leading-tight">Olá, CEO</h3>`
);

code = code.replace(
  /<p className="text-\[10px\] font-black text-amber-500 uppercase tracking-widest">CEO MASTER FOUNDER<\/p>/g,
  `<p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1 drop-shadow-sm">Painel Master de Gestão Global</p>`
);

code = code.replace(
  /<span className="text-2xl font-black">SS<\/span>/g,
  `<span className="text-2xl font-black text-slate-950">CEO</span>`
);

// 5. Add Ambassadors tab
code = code.replace(
  /className=\{`pb-4 px-2 text-xs uppercase tracking-widest font-black transition-all border-b-2 text-center cursor-pointer select-none \$\{[\s\S]*?superTab === 'billing'[\s\S]*?\}\`\}\n\s*>\n\s*Financeiro e Faturamento\n\s*<\/button>/,
  `className={\`pb-4 px-2 text-xs uppercase tracking-widest font-black transition-all border-b-2 text-center cursor-pointer select-none \${superTab === 'billing' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}\`}
            >
              Financeiro e Faturamento
            </button>
            <button
              onClick={() => setSuperTab('ambassadors')}
              className={\`pb-4 px-2 text-xs uppercase tracking-widest font-black transition-all border-b-2 text-center cursor-pointer select-none \${superTab === 'ambassadors' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}\`}
            >
              Divulgadores / Embaixadores
            </button>`
);

// 6. Update search bar area for bulk delete
code = code.replace(
  /<div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">/g,
  `<div className="flex flex-col sm:flex-row gap-3 items-center">
                {selectedStores.length > 0 && (
                  <button
                    onClick={handleBulkDeleteStores}
                    className="w-full sm:w-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                  >
                    Excluir Selecionadas ({selectedStores.length})
                  </button>
                )}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 flex-1 w-full">`
);

// Close the new wrapper div around the search bar
code = code.replace(
  /                  <RotateCw className="w-4 h-4" \/>\n                <\/button>\n              <\/div>\n              \{\/\* Stores feed \*\/\}/g,
  `                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
              </div>
              {/* Stores feed */}`
);

// 7. Add Checkbox to Store Feed list
const storeRenderBlock = `
                    <div
                      key={store.id}
                      className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                    >
`;
const newStoreRenderBlock = `
                    <div
                      key={store.id}
                      className={\`bg-slate-900 rounded-3xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden \${selectedStores.includes(store.id) ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800 hover:border-emerald-500/30'}\`}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStores(prev => [...prev, store.id]);
                            else setSelectedStores(prev => prev.filter(id => id !== store.id));
                          }}
                          className="w-5 h-5 rounded-md border-slate-700 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900 bg-slate-800 cursor-pointer"
                        />
                      </div>
                      <div className="pl-8 flex-1">
`;

code = code.replace(storeRenderBlock, newStoreRenderBlock);

// Close the pl-8 flex-1 div
code = code.replace(
  /                        <\/div>\n                      <\/div>\n                      <div className="flex items-center gap-2 w-full sm:w-auto">/g,
  `                        </div>
                      </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">`
);


// 8. Add Ambassadors tab rendering
const ambassadorsView = `
          {superTab === 'ambassadors' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#1a1500] via-slate-900 to-black rounded-3xl border border-amber-500/30 p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-amber-400 uppercase tracking-widest drop-shadow-sm">Programa de Embaixadores</h2>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Gere links exclusivos para divulgadores e acompanhe os cadastros.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAmbassador} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Nome do Divulgador"
                    value={newAmbassadorName}
                    onChange={e => setNewAmbassadorName(e.target.value)}
                    className="bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-amber-500 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    value={newAmbassadorEmail}
                    onChange={e => setNewAmbassadorEmail(e.target.value)}
                    className="bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:border-amber-500 outline-none"
                  />
                  <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl px-4 py-3 transition-colors cursor-pointer shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]">
                    Gerar Embaixador
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(superStores.find(s => s.id === 'master-ceo')?.settings?.ambassadors || []).map((amb: any) => {
                  const referrals = superStores.filter(s => s.settings?.referredBy === amb.code).length;
                  const refLink = \`\${window.location.origin}/register?ref=\${amb.code}\`;
                  
                  return (
                    <div key={amb.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-amber-500/30 transition-all space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white">{amb.name}</h3>
                          <p className="text-xs text-slate-400">{amb.email}</p>
                        </div>
                        <button onClick={() => handleDeleteAmbassador(amb.id)} className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 rounded-xl transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Código de Indicação</p>
                        <p className="text-sm font-mono text-amber-400 select-all">{amb.code}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Lojas Indicadas</p>
                          <p className="text-xl font-black text-emerald-400">{referrals}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(refLink);
                            showNotification('Link copiado!', 'success');
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> Copiar Link
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
`;
code = code.replace(
  /          \{\/\* Right Column - Client list \*\/\}/,
  ambassadorsView + "\n          {/* Right Column - Client list */}"
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
