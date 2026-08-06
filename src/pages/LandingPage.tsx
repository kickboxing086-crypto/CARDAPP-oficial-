import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Store, Smartphone, ShieldCheck, Zap, BarChart, Instagram, MessageCircle, Download, Share, X, Crown, Sparkles, Users, TrendingUp, DollarSign, Gift, ArrowRight, Share2, BadgePercent, Check, HelpCircle, Send, Briefcase, Menu } from 'lucide-react';
import CardappLogo from '../components/CardappLogo';

export default function LandingPage() {
  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Ambassador Drawer & Modal State
  const [showAmbassadorDrawer, setShowAmbassadorDrawer] = useState(false);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorName, setAmbassadorName] = useState('');
  const [ambassadorPhone, setAmbassadorPhone] = useState('');
  const [ambassadorCity, setAmbassadorCity] = useState('');
  const [ambassadorMessageSent, setAmbassadorMessageSent] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleStart = () => {
    navigate('/admin/register');
  };

  const handleMonthlyPlan = () => {
    navigate('/admin/register');
  };

  const handleWhatsappRequest = () => {
    navigate('/admin/register');
  };

  const handlePlanCheckout = (planName: string) => {
    navigate(`/admin/register?plan=${encodeURIComponent(planName)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-100">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 bg-zinc-950/80 backdrop-blur-md z-50 border-b border-white/5 h-20 px-4 md:px-8 grid grid-cols-3 items-center">
        {/* Left Side: 3-Bar Menu Button */}
        <div className="flex items-center gap-2.5 md:gap-4 justify-start">
          <button 
            onClick={() => setShowAmbassadorDrawer(true)}
            className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center group cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
            title="Menu"
          >
            <Menu className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        {/* Centered Logo */}
        <div className="flex justify-center items-center px-4 overflow-visible relative">
          <CardappLogo size="md" />
        </div>
        
        {/* Right Side: Login & Register Store */}
        <div className="flex justify-end items-center gap-2.5">
          <button 
            onClick={handleStart}
            className="text-xs md:text-sm font-bold text-zinc-300 hover:text-white transition-all hover:scale-105 px-4 md:px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 whitespace-nowrap cursor-pointer"
          >
            Acessar Painel
          </button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden flex flex-col items-center text-center min-h-[90vh] justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950 -z-10" />
          
          <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-amber-500/20 shadow-sm animate-fade-in-up backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Pronto para Escalar seu Negócio
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white max-w-5xl leading-[0.9] mb-8 drop-shadow-sm">
              Venda muito mais com o <span className="text-white">Card</span><span className="text-amber-500">app.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-300 max-w-3xl font-medium mb-12 leading-relaxed drop-shadow-md">
              A plataforma definitiva para automatizar seu delivery. Segurança, velocidade e <span className="text-white font-bold">zero burocracia</span> para você focar no que importa: seu produto.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
              <button 
                onClick={handleWhatsappRequest}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-zinc-950 rounded-full font-black text-lg overflow-hidden shadow-xl shadow-amber-500/20 hover:scale-105 transition-all hover:bg-amber-400 active:scale-95"
              >
                <span>Abrir loja grátis</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a 
                href="https://wa.me/5584986113980?text=Olá!%20Gostaria%20de%20adquirir%20o%20Cardapp."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-full font-black text-lg overflow-hidden shadow-xl hover:scale-105 transition-all hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/10"
              >
                <span>Contato Comercial</span>
              </a>
            </div>
            
            <p className="mt-8 text-sm font-bold text-zinc-400">Sem compromisso • Teste gratuito liberado</p>
          </div>
        </section>

        {/* Features / Trust Section */}
        <section className="px-6 py-24 bg-zinc-900/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Tudo o que sua loja precisa.
              </h2>
              <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
                Desenhado especificamente para as necessidades do comércio rápido. Performance de luxo, design minimalista e extremamente seguro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80", // Real Burger with Fries
                  title: "Feito para Qualquer Negócio",
                  desc: "Ideal para o dinamismo do seu comércio. Atualize preços e disponibilidade de produtos em segundos."
                },
                {
                  image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80", // Real Neapolitan Pizza
                  title: "Total Confiança e Segurança",
                  desc: "Seus clientes terão um ambiente seguro e profissional para comprar. Pedidos chegam organizados."
                },
                {
                  image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80", // Real Sushi Plate
                  title: "Performance Premium",
                  desc: "Sistema ultrarrápido, sem travamentos. Funciona perfeitamente em áreas com sinal de internet fraco."
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-zinc-950 p-8 rounded-3xl border border-white/5 shadow-sm hover:border-white/10 transition-colors flex flex-col">
                  <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden bg-zinc-900 relative">
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            
            </div>
            
            {/* Free Trial Banner */}
            <div className="max-w-5xl mx-auto mt-12 bg-zinc-900 border border-amber-500/30 rounded-3xl p-8 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-500/20 shadow-sm">
                  Sem compromisso
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Ainda na dúvida? Teste grátis.</h3>
                <p className="text-zinc-400 font-medium">Você tem 7 dias de acesso total à plataforma para criar seu cardápio, divulgar e receber pedidos sem pagar nada. Não exigimos cartão de crédito.</p>
              </div>
              <div className="relative z-10 w-full md:w-auto">
                <button 
                  onClick={() => handlePlanCheckout('7 Dias Grátis')}
                  className="w-full md:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
                >
                  Começar Teste <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </section>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Mensal */}
              <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col relative group">
                <h3 className="text-xl font-black text-white mb-2">Mensal</h3>
                <p className="text-zinc-400 text-sm mb-6">Ideal para quem está começando e quer testar a plataforma.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">34,90</span>
                  <span className="text-sm font-bold text-zinc-500">/mês</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Loja digital completa</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Produtos e fotos ilimitados</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Painel gerencial avançado</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Mensal (R$ 34,90)')}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-amber-500 text-white hover:text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/20 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trimestral */}
              <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col relative group">
                <h3 className="text-xl font-black text-white mb-2">Trimestral</h3>
                <p className="text-zinc-400 text-sm mb-6">Economia inteligente para negócios em crescimento constante.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">89,90</span>
                  <span className="text-sm font-bold text-zinc-500">/trimestre</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Loja digital completa</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Produtos e fotos ilimitados</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Painel gerencial avançado</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Trimestral (R$ 89,90)')}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-amber-500 text-white hover:text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/20 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Semestral */}
              <div className="bg-zinc-900 p-6 rounded-3xl border-2 border-amber-500/50 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-amber-500/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Mais Popular
                </div>
                <h3 className="text-xl font-black text-white mb-2">Semestral</h3>
                <p className="text-zinc-400 text-sm mb-6">O plano favorito dos lojistas de sucesso.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">159,90</span>
                  <span className="text-sm font-bold text-zinc-500">/semestre</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Tudo do Trimestral +</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Pedidos no WhatsApp</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Suporte VIP 24h</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Semestral (R$ 159,90)')}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Anual */}
              <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col relative group">
                <h3 className="text-xl font-black text-white mb-2">Anual</h3>
                <p className="text-zinc-400 text-sm mb-6">A escolha dos líderes. Máxima economia para o seu faturamento.</p>
                <div className="mb-8">
                  <span className="text-sm font-bold text-zinc-500 align-top">R$</span>
                  <span className="text-5xl font-black text-white tracking-tighter">299,90</span>
                  <span className="text-sm font-bold text-zinc-500">/ano</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Tudo do Semestral +</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Maior desconto no ano</li>
                  <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Recursos exclusivos</li>
                </ul>
                <button 
                  onClick={() => handlePlanCheckout('Anual (R$ 299,90)')}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-amber-500 text-white hover:text-zinc-950 font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-500/20 cursor-pointer"
                >
                  Assinar Agora <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ambassador Program Section */}
        <section id="embaixadores" className="px-6 py-24 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-t border-amber-500/20 relative overflow-hidden">
          {/* Subtle Golden Ambient Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-[0.25em] border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Crown className="w-4 h-4 text-amber-400" />
                PROGRAMA DE EMBAIXADORES CARDAPP • MENSALIDADE RECORRENTE
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
                Torne-se um <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">Embaixador Oficial</span> e fature comissões mensais
              </h2>

              <p className="text-zinc-300 font-medium max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                Indique a plataforma de cardápios e delivery do Cardapp para estabelecimentos locais da sua cidade. Ganhe dinheiro todos os meses por cada loja mantida ativa!
              </p>
            </div>

            {/* 3 Step Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-8 rounded-3xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl relative group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> Inscreva-se Grátis
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Solicite sua adesão para se tornar um divulgador parceiro. Você receberá um código e link exclusivo de indicação.
                </p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-8 rounded-3xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl relative group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-400" /> Indique aos Comércios
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Apresente o Cardapp para restaurantes, lanchonetes, pizzarias, pastelarias e lojas da sua cidade usando nossos materiais visuais prontos.
                </p>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-8 rounded-3xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-xl relative group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Receba em Dinheiro
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Receba comissões financeiras recorrentes diretamente no seu PIX todos os meses enquanto as lojas indicadas permanecerem ativas.
                </p>
              </div>
            </div>

            {/* Income Simulation Grid */}
            <div className="bg-zinc-950/80 rounded-3xl border border-amber-500/30 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center lg:text-left flex-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <TrendingUp className="w-4 h-4" /> Potencial de Ganhos Recorrentes
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Quanto você pode faturar como Embaixador?</h3>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
                    Sem teto limite! Quanto mais comércios você cadastrar na sua carteira de indicação, maior será o seu pagamento mensal via PIX.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 text-center space-y-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase">10 Lojas</span>
                    <p className="text-xl font-black text-amber-400">R$ 150<span className="text-xs font-normal text-zinc-500">/mês</span></p>
                  </div>
                  <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 text-center space-y-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase">30 Lojas</span>
                    <p className="text-xl font-black text-amber-400">R$ 450<span className="text-xs font-normal text-zinc-500">/mês</span></p>
                  </div>
                  <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 text-center space-y-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase">50 Lojas</span>
                    <p className="text-xl font-black text-amber-400">R$ 750<span className="text-xs font-normal text-zinc-500">/mês</span></p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 p-4 rounded-2xl border border-amber-500/40 text-center space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <span className="text-xs font-black text-amber-300 uppercase">100 Lojas</span>
                    <p className="text-2xl font-black text-amber-300">R$ 1.500+<span className="text-xs font-normal text-amber-400/80">/mês</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Pagamento mensal via PIX</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Artes & Vídeos prontos pra divulgar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Canal VIP com suporte direto</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sem burocracia ou taxas de adesão</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAmbassadorModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer"
              >
                <Crown className="w-5 h-5 text-zinc-950" />
                <span>Quero ser um Embaixador Oficial</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowAmbassadorModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm tracking-wider uppercase transition-all border border-zinc-700 hover:border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Ver Detalhes do Programa</span>
              </button>
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

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <CardappLogo size="sm" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <a href="https://www.instagram.com/cardapp.app?igsh=MTgyZnhxZXNrNnU1OQ==" target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <button onClick={() => setShowAmbassadorDrawer(true)} className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer">
              <Crown className="w-4 h-4" /> Divulgadores
            </button>
            <button onClick={() => navigate('/termos-e-privacidade')} className="text-sm font-bold text-zinc-500 hover:text-amber-400 transition-colors">Termos de Uso</button>
            <button onClick={() => navigate('/termos-e-privacidade')} className="text-sm font-bold text-zinc-500 hover:text-amber-400 transition-colors">Privacidade</button>
            <button onClick={() => navigate('/admin/login')} className="text-sm font-bold text-zinc-500 hover:text-amber-400 transition-colors">Admin</button>
            <button onClick={() => window.location.href = 'mailto:suporte@cardapp.app'} className="text-sm font-bold text-zinc-500 hover:text-amber-400 transition-colors">Suporte</button>
          </div>

          <div className="w-full h-px bg-white/5 mb-8" />

          <p className="text-zinc-600 text-xs font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} Cardapp Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Floating PWA Installation Prompt */}
      {showInstallBanner && (isInstallable || isIOS) && (
        <div className="fixed bottom-6 inset-x-6 z-50 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl shadow-2xl p-5 max-w-lg w-full flex gap-4 pointer-events-auto backdrop-blur-md">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <h4 className="text-sm font-bold text-white mb-0.5">Instalar o Cardapp</h4>
              {isInstallable ? (
                <p className="text-xs text-zinc-400">Instale nosso aplicativo oficial para acesso instantâneo e recebimento de pedidos em tempo real!</p>
              ) : (
                <p className="text-xs text-zinc-400">Toque no ícone de <strong className="text-white">Compartilhar <Share className="inline-block w-3.5 h-3.5 mx-1" /></strong> na barra do Safari e selecione <strong className="text-white">Adicionar à Tela de Início</strong>.</p>
              )}
            </div>
            <div className="flex flex-col justify-between items-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
              {isInstallable && (
                <button 
                  onClick={handleInstallApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-lg transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ambassador / Divulgador Program Full Explanation & Application Modal */}
      {showAmbassadorModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-gradient-to-br from-zinc-950 via-[#120f03] to-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-[0_0_60px_rgba(245,158,11,0.25)] relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setShowAmbassadorModal(false)}
              className="absolute top-6 right-6 p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-3 mb-6 pr-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                PROGRAMA DE DIVULGADORES OFICIAL
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Como Funciona o Programa de Divulgadores?
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                Transforme sua rede de contatos e os comércios da sua região em uma fonte constante de renda extra recorrente todos os meses.
              </p>
            </div>

            {/* How it Works Details Cards */}
            <div className="space-y-3 mb-8">
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-amber-500/20 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 font-black text-sm border border-amber-500/30">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">Link e Código Exclusivo</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-medium">
                    Ao se cadastrar, você recebe um código único de indicação. Todo lojista que criar a loja utilizando o seu link fica permanentemente vinculado à sua conta.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-amber-500/20 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 font-black text-sm border border-amber-500/30">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">50% de Comissão em Cada Mensalidade</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-medium">
                    Sempre que a loja indicada pagar ou renovar a assinatura do Cardapp (mensal, trimestral, semestral ou anual), você ganha 50% de comissão direto na sua conta PIX.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-amber-500/20 flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 font-black text-sm border border-amber-500/30">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">Material de Marketing & Mensagens Prontas</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-medium">
                    Você recebe textos persuasivos de alta conversão prontos para enviar no WhatsApp dos lojistas, banners e suporte completo do time!
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Copy Preview Box */}
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Exemplo de Mensagem Pronta para WhatsApp
                </h4>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Pronta p/ Copiar
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 italic bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 leading-relaxed font-sans">
                "Ei, sua chance de impulsionar suas vendas agora ficou muito mais fácil! 🚀 Já pensou em ter um cardápio digital completo recebendo pedidos direto no seu WhatsApp? Fale conosco pelo meu link de indicação: <span className="text-amber-400 font-mono not-italic select-all">https://wa.me/5584986113980?text=🍽️Olá!+venho+através+de+[SEU_NOME].+COMO+FUNCIONA+O+CARDÁPIO?+</span>"
              </p>
            </div>

            {/* Quick Candidacy Form */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> Cadastre-se como Divulgador (50%)
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Adesão Gratuita
                </span>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = encodeURIComponent(
                    `*CANDIDATURA A DIVULGADOR CARDAPP*\n\n` +
                    `*Nome:* ${ambassadorName || 'Não informado'}\n` +
                    `*WhatsApp:* ${ambassadorPhone || 'Não informado'}\n` +
                    `*Cidade/UF:* ${ambassadorCity || 'Não informado'}\n\n` +
                    `Olá! Gostaria de me cadastrar como Divulgador Oficial do Cardapp para indicar lojas e receber 50% de comissão recorrente!`
                  );
                  window.open(`https://wa.me/5584986113980?text=${text}`, '_blank');
                  setAmbassadorMessageSent(true);
                }} 
                className="space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Seu Nome</label>
                    <input 
                      type="text"
                      placeholder="Ex: Carlos Silva"
                      value={ambassadorName}
                      onChange={e => setAmbassadorName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">WhatsApp / Telefone</label>
                    <input 
                      type="tel"
                      placeholder="(00) 90000-0000"
                      value={ambassadorPhone}
                      onChange={e => setAmbassadorPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Cidade / Estado</label>
                    <input 
                      type="text"
                      placeholder="Ex: Natal - RN"
                      value={ambassadorCity}
                      onChange={e => setAmbassadorCity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Candidatura via WhatsApp</span>
                </button>
              </form>

              {ambassadorMessageSent && (
                <p className="text-[11px] text-emerald-400 font-bold text-center bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Solicitação enviada! Abrindo WhatsApp para confirmação do seu cadastro.</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3-Bar Left Drawer (Menu Principal, Redes Sociais & Painel do Divulgador) */}
      {showAmbassadorDrawer && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowAmbassadorDrawer(false)}
          />

          {/* Drawer Content Panel */}
          <div className="relative w-full max-w-md sm:max-w-lg bg-zinc-950 border-r border-amber-500/30 h-full overflow-y-auto shadow-2xl z-10 flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Menu className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Menu Cardapp
                    </h3>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      Redes Sociais & Divulgadores
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAmbassadorDrawer(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Redes Sociais & Links Principais */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  Redes Sociais & Contato
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="https://wa.me/5584986113980"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">WhatsApp</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Atendimento Direto</span>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/cardapp.app?igsh=MTgyZnhxZXNrNnU1OQ=="
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 hover:border-amber-500/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">Instagram</span>
                      <span className="text-[10px] text-zinc-400 font-medium">@cardapp.app</span>
                    </div>
                  </a>
                </div>

                <button
                  onClick={() => {
                    setShowAmbassadorDrawer(false);
                    handleStart();
                  }}
                  className="w-full p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">Área do Divulgador</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Separador */}
              <div className="h-px bg-white/10 my-2" />

              {/* Header do Programa de Divulgadores */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-widest">
                    Programa de Divulgadores
                  </h4>
                </div>

                {/* Divulgador Info Section */}
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                      Participe do nosso programa de parceiros e ajude lojistas a automatizarem seus delivery com o Cardapp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Como Funciona?
                  </h4>
                </div>
                <div className="bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 hover:border-amber-500/30 transition-all">
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    Como parceiro Cardapp, você receberá um código único. Toda loja que se cadastrar usando seu código ou link será vinculada a você permanentemente.
                  </p>
                </div>
              </div>

              {/* Informações Principais & Regras */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-amber-400" />
                  Informações Importantes para o Divulgador
                </h4>
                <ul className="space-y-2 text-xs font-medium text-zinc-300">
                  <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Link com seu Código:</strong> Cada divulgador recebe um link exclusivo de indicação. O sistema vincula a loja a você automaticamente.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Pagamentos no PIX:</strong> Suas comissões de 50% são transferidas diretamente para a sua conta via PIX sem burocracia.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Suporte e Materiais:</strong> Receba artes profissionais, modelos de textos para WhatsApp e auxílio do CEO para fechar negócios.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons inside Drawer */}
            <div className="pt-6 border-t border-white/10 space-y-2.5 mt-6">
              <button
                onClick={() => {
                  setShowAmbassadorDrawer(false);
                  setShowAmbassadorModal(true);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 text-zinc-950" />
                <span>Quero me Cadastrar como Divulgador (50%)</span>
              </button>

              <a
                href="https://wa.me/5584986113980?text=Olá!%20Gostaria%20de%20saber%20mais%20detalhes%20sobre%20o%20Programa%20de%20Divulgador%20Cardapp%20com%2050%%20de%20comissão!"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Falar com o CEO no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
