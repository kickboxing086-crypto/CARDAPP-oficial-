
import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Store, User, Mail, Smartphone, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import CardappLogo from '../components/CardappLogo';
import { getApiUrl } from '../lib/api';

export default function RegisterStore() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    plan: searchParams.get('plan') || '7 Dias Grátis'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegistrationError('');

    try {
      const response = await fetch(getApiUrl('/api/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          storeName: formData.storeName,
          phone: formData.phone,
          plan: formData.plan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar loja.');
      }

      // Success! Auto login
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('store_id', data.storeId);

      // Trigger the WhatsApp notification in a separate window/tab
      const message = encodeURIComponent(
        `🚀 *Nova Loja Criada Automaticamente - Cardapp*\n\n` +
        `*Nome da Loja:* ${formData.storeName}\n` +
        `*Responsável:* ${formData.ownerName}\n` +
        `*Nome de Usuário:* ${formData.username}\n` +
        `*WhatsApp:* ${formData.phone}\n` +
        `*Plano:* ${formData.plan}\n` +
        (refCode ? `*Indicador:* ${refCode}\n` : '') +
        `Olá! Acabei de criar a minha loja digital e já estou acessando o painel administrativo.`
      );
      
      // Try to open WhatsApp in a new tab without blocking
      try {
        window.open(`https://wa.me/5584986113980?text=${message}`, '_blank');
      } catch (err) {
        console.warn('Could not open WhatsApp tab directly:', err);
      }

      // Redirect immediately to admin dashboard
      navigate('/admin');

    } catch (err: any) {
      console.error('Registration failed:', err);
      setRegistrationError(err.message || 'Erro ao realizar o cadastro de sua loja.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = 
    formData.storeName.trim().length > 0 && 
    formData.ownerName.trim().length > 0 && 
    formData.username.trim().length > 0 && 
    formData.email.trim().length > 0 && 
    formData.password.trim().length >= 6 && 
    formData.phone.trim().length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <CardappLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
            Setup Assistido
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Solicitar Sua Loja</h1>
          <p className="text-zinc-500 font-medium text-sm">Preencha os dados e nossa equipe criará seu acesso em instantes.</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {registrationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl flex items-center gap-2">
                <span className="shrink-0 font-bold">⚠️</span>
                <span>{registrationError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Store className="w-3 h-3" /> Nome da Loja
              </label>
              <input 
                name="storeName"
                type="text"
                required
                placeholder="Ex: Pizzaria do Zé"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Seu Nome
              </label>
              <input 
                name="ownerName"
                type="text"
                required
                placeholder="Ex: João Silva"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <User className="w-3 h-3 text-amber-500" /> Nome de Usuário
                </label>
                <input 
                  name="username"
                  type="text"
                  required
                  placeholder="Ex: joaosilva"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Smartphone className="w-3 h-3" /> WhatsApp
                </label>
                <input 
                  name="phone"
                  type="text"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-amber-500" /> E-mail de Contato
                </label>
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="Ex: contato@sualoja.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <User className="w-3 h-3 text-amber-500" /> Senha (mín. 6 dgt)
                </label>
                <input 
                  name="password"
                  type="password"
                  required
                  placeholder="Defina uma senha"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-700 font-semibold"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                Plano Desejado
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Mensal (R$ 34,90)', label: 'Plano Mensal', price: 'R$ 34,90' },
                  { id: 'Trimestral (R$ 89,90)', label: 'Plano Trimestral', price: 'R$ 89,90' },
                  { id: 'Semestral (R$ 159,90)', label: 'Plano Semestral', price: 'R$ 159,90' },
                  { id: 'Anual (R$ 299,90)', label: 'Plano Anual', price: 'R$ 299,90' },
                  { id: '7 Dias Grátis', label: 'Teste Grátis', price: '7 Dias' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: p.id })}
                    className={`relative p-4 rounded-xl border flex items-center justify-between text-left transition-all overflow-hidden ${
                      formData.plan === p.id 
                        ? 'border-amber-500 bg-amber-500/10' 
                        : 'border-white/10 bg-zinc-950 hover:bg-zinc-900 hover:border-white/20'
                    }`}
                  >
                    {formData.plan === p.id && (
                      <motion.div
                        layoutId="plan-active-bg"
                        className="absolute inset-0 bg-amber-500/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.plan === p.id ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'}`}>
                        {formData.plan === p.id && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                      </div>
                      <span className={`font-bold ${formData.plan === p.id ? 'text-white' : 'text-zinc-400'}`}>
                        {p.label}
                      </span>
                    </div>
                    <div className={`relative z-10 font-black tracking-tight ${formData.plan === p.id ? 'text-amber-500' : 'text-zinc-500'}`}>
                      {p.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !isValid}
              className={`w-full font-black py-4 rounded-xl shadow-xl transition-all transform flex items-center justify-center gap-2 uppercase tracking-tighter ${isValid && !isLoading ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 hover:-translate-y-1 active:translate-y-0 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70'}`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Store className="w-5 h-5" />
                  Criar Minha Loja Agora
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              Já tem uma loja? {' '}
              <Link to="/admin/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-10">
          Nossa equipe criará seu ambiente seguro e enviará suas credenciais de acesso oficiais.
        </p>
      </motion.div>
    </div>
  );
}
