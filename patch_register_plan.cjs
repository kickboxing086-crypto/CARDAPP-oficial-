const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

const oldSelect = `<div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                Plano Desejado
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-semibold appearance-none cursor-pointer"
              >
                <option value="7 Dias Grátis">Teste Grátis (7 Dias)</option>
                <option value="Mensal (R$ 19,99)">Plano Mensal (R$ 19,99)</option>
                <option value="Trimestral (R$ 49,99)">Plano Trimestral (R$ 49,99)</option>
                <option value="Anual (R$ 179,89)">Plano Anual (R$ 179,89)</option>
              </select>
            </div>`;

const newSelect = `<div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                Plano Desejado
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Mensal (R$ 19,99)', label: 'Plano Mensal', price: 'R$ 19,99' },
                  { id: 'Trimestral (R$ 49,99)', label: 'Plano Trimestral', price: 'R$ 49,99' },
                  { id: 'Anual (R$ 179,89)', label: 'Plano Anual', price: 'R$ 179,89' },
                  { id: '7 Dias Grátis', label: 'Teste Grátis', price: '7 Dias' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: p.id })}
                    className={\`relative p-4 rounded-xl border flex items-center justify-between text-left transition-all overflow-hidden \${
                      formData.plan === p.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-white/10 bg-zinc-950 hover:bg-zinc-900 hover:border-white/20'
                    }\`}
                  >
                    {formData.plan === p.id && (
                      <motion.div
                        layoutId="plan-active-bg"
                        className="absolute inset-0 bg-amber-500/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${formData.plan === p.id ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}\`}>
                        {formData.plan === p.id && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                      <span className={\`font-bold \${formData.plan === p.id ? 'text-white' : 'text-zinc-400'}\`}>
                        {p.label}
                      </span>
                    </div>
                    <div className={\`relative z-10 font-black tracking-tight \${formData.plan === p.id ? 'text-amber-500' : 'text-zinc-500'}\`}>
                      {p.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
