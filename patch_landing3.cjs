const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

const pricingSection = `
        {/* Pricing Section */}
        <section className="px-6 py-24 bg-zinc-950 border-t border-white/5 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950 -z-10" />
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Planos simples e transparentes.
              </h2>
              <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
                Escolha o plano ideal para o seu momento. Sem taxas escondidas, sem surpresas. Escale suas vendas com o Cardapp.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Mensal */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col relative group">
                <h3 className="text-xl font-black text-white mb-2">Mensal</h3>
                <p className="text-zinc-400 text-sm mb-6">Ideal para quem está começando e quer testar a plataforma.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">19,99</span>
                  <span className="text-sm font-bold text-zinc-500">/mês</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Loja digital completa</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Produtos ilimitados</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recebimento de pedidos no WhatsApp</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Painel administrativo</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Mensal', '19,99')}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-amber-500 text-white hover:text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/20 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trimestral */}
              <div className="bg-zinc-900 p-8 rounded-3xl border-2 border-amber-500/50 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-amber-500/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Mais Popular
                </div>
                <h3 className="text-xl font-black text-white mb-2">Trimestral</h3>
                <p className="text-zinc-400 text-sm mb-6">Economia inteligente para negócios em crescimento constante.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">49,99</span>
                  <span className="text-sm font-bold text-zinc-500">/trimestre</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Tudo do plano Mensal</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Economia de 16%</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Suporte prioritário</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Atualizações garantidas</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Trimestral', '49,99')}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Anual */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col relative group">
                <h3 className="text-xl font-black text-white mb-2">Anual</h3>
                <p className="text-zinc-400 text-sm mb-6">A escolha dos líderes. Máxima economia para o seu faturamento.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">179,89</span>
                  <span className="text-sm font-bold text-zinc-500">/ano</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tudo do plano Trimestral</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Economia de 25% (2 meses grátis)</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Destaque e estabilidade</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Acesso a novos recursos VIP</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Anual', '179,89')}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-amber-500 text-white hover:text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/20 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works / More Details */}
        <section className="px-6 py-24 bg-zinc-900 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Como funciona o Cardapp?
              </h2>
              <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
                Implemente o seu cardápio digital em minutos. Um processo simples, direto e desenhado para você começar a vender imediatamente.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center hover:border-amber-500/30 transition-all">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-amber-500 shadow-inner">1</div>
                <h3 className="text-lg font-black text-white mb-2">Crie sua Loja</h3>
                <p className="text-sm text-zinc-400 font-medium">Cadastre-se rapidamente com o nome da sua loja e receba seu link exclusivo na hora.</p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center hover:border-amber-500/30 transition-all">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-amber-500 shadow-inner">2</div>
                <h3 className="text-lg font-black text-white mb-2">Monte o Cardápio</h3>
                <p className="text-sm text-zinc-400 font-medium">Adicione seus produtos, fotos atraentes, descrições e preços usando nosso painel super intuitivo.</p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center hover:border-amber-500/30 transition-all">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-amber-500 shadow-inner">3</div>
                <h3 className="text-lg font-black text-white mb-2">Compartilhe</h3>
                <p className="text-sm text-zinc-400 font-medium">Envie seu link no WhatsApp, coloque na bio do Instagram e veja os clientes acessarem facilmente.</p>
              </div>
              <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center hover:border-amber-500/30 transition-all">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-2xl font-black text-amber-500 shadow-inner">4</div>
                <h3 className="text-lg font-black text-white mb-2">Receba Pedidos</h3>
                <p className="text-sm text-zinc-400 font-medium">Os pedidos chegam prontos e formatados diretamente no seu WhatsApp. Só aceitar e preparar!</p>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center">
              <button 
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-zinc-950 rounded-full font-black text-lg overflow-hidden shadow-xl hover:scale-105 transition-all hover:bg-zinc-200 active:scale-95 cursor-pointer"
              >
                <span>Criar minha loja agora</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
`;

code = code.replace(
  /<\/section>\s*<\/main>/,
  '</section>\n' + pricingSection + '\n      </main>'
);

code = code.replace(
  /const handlePlanCheckout = \(planName: string, price: string\) => {[^}]+};/g,
  `const handlePlanCheckout = (planName: string, price: string) => {
    const message = encodeURIComponent(\`🚀 *Olá, equipe do Cardapp!*\\n\\nGostaria de impulsionar minhas vendas assinando o *Plano \${planName}* (R$ \${price}).\\n\\nPodem me orientar nos próximos passos para ativar minha conta premium e escalar meu delivery?\`);
    window.location.href = \`https://wa.me/5584986113980?text=\${message}\`;
  };`
);

fs.writeFileSync('src/pages/LandingPage.tsx', code);
