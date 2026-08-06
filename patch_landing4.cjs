const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

// Replace handlePlanCheckout to redirect to /admin/register with plan type
code = code.replace(
  /const handlePlanCheckout = \(planName: string, price: string\) => {[\s\S]*?};/,
  `const handlePlanCheckout = (planName: string) => {
    navigate(\`/admin/register?plan=\${encodeURIComponent(planName)}\`);
  };`
);

// We need to replace the plan checkout calls in the JSX
code = code.replace(
  /onClick={\(\) => handlePlanCheckout\('Mensal', '19,99'\)}/g,
  "onClick={() => handlePlanCheckout('Mensal (R$ 19,99)')}"
);

code = code.replace(
  /onClick={\(\) => handlePlanCheckout\('Trimestral', '49,99'\)}/g,
  "onClick={() => handlePlanCheckout('Trimestral (R$ 49,99)')}"
);

code = code.replace(
  /onClick={\(\) => handlePlanCheckout\('Anual', '179,89'\)}/g,
  "onClick={() => handlePlanCheckout('Anual (R$ 179,89)')}"
);

// We need to update the features inside the pricing section so they are all the same
const standardFeatures = `
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Loja digital completa</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Produtos e fotos ilimitados</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Pedidos no WhatsApp formatados</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Painel gerencial avançado</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Suporte VIP 24h</li>
`;

// Replace all <ul> inside the grid with the standard features
code = code.replace(
  /<ul className="space-y-4 mb-8 flex-1">[\s\S]*?<\/ul>/g,
  `<ul className="space-y-4 mb-8 flex-1">${standardFeatures}</ul>`
);

// Add the 7 Days Free option below the grid
const freePlanCode = `
            </div>
            
            {/* Free Trial Banner */}
            <div className="max-w-5xl mx-auto mt-12 bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-emerald-500/20 shadow-sm">
                  Sem compromisso
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Ainda na dúvida? Teste grátis.</h3>
                <p className="text-zinc-400 font-medium">Você tem 7 dias de acesso total à plataforma para criar seu cardápio, divulgar e receber pedidos sem pagar nada. Não exigimos cartão de crédito.</p>
              </div>
              <div className="relative z-10 w-full md:w-auto">
                <button 
                  onClick={() => handlePlanCheckout('7 Dias Grátis')}
                  className="w-full md:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Começar Teste <ChevronRight className="w-5 h-5" />
                </button>
              </div>
`;

code = code.replace(
  /<\/div>\s*<\/div>\s*<\/section>/,
  freePlanCode + '\n            </div>\n          </div>\n        </section>'
);

// Now for the logo. The user requested to add the official app logo.
// They probably meant replacing the text "Cardapp." with an image if I have one, or replacing the Vercel favicon.
// Let's replace the Vite favicon with logo.png in index.html as well, if it exists, wait, we checked it's already there!
// "Adicione a logo do aplicativo, para remover aquele "V" de Vercel, coloque a logo oficial."
// Let's replace the text logo in LandingPage with `<img src="/logo.png" alt="Cardapp Logo" className="h-8 md:h-10" />`
// Wait, I should also keep the text, or just use the image?
code = code.replace(
  /<span className="text-2xl md:text-3xl font-black tracking-tighter text-white flex items-center gap-1 cursor-default">\s*Cardapp\s*<span className="text-amber-500">\.<\/span>\s*<\/span>/,
  `<div className="flex items-center gap-3 cursor-default">
            <img src="/logo.png" alt="Cardapp Logo" className="h-8 md:h-10 rounded-xl" />
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-white">
              Cardapp<span className="text-amber-500">.</span>
            </span>
          </div>`
);

// Update Footer logo too
code = code.replace(
  /<span className="text-2xl font-black tracking-tighter text-white mb-4">\s*Cardapp<span className="text-amber-500">\.<\/span>\s*<\/span>/,
  `<div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Cardapp Logo" className="h-8 md:h-10 rounded-xl opacity-80 grayscale hover:grayscale-0 transition-all" />
            <span className="text-2xl font-black tracking-tighter text-white">
              Cardapp<span className="text-amber-500">.</span>
            </span>
          </div>`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
