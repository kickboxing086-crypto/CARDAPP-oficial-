const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

const newFormCode = `
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Store, User, Mail, Smartphone, ArrowRight, Loader2, MessageCircle } from 'lucide-react';

export default function RegisterStore() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    plan: '7 Dias Grátis'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const message = encodeURIComponent(
      \`🚀 *Nova Solicitação de Loja - Cardapp*\\n\\n\` +
      \`*Nome da Loja:* \${formData.storeName}\\n\` +
      \`*Responsável:* \${formData.ownerName}\\n\` +
      \`*E-mail:* \${formData.email}\\n\` +
      \`*WhatsApp:* \${formData.phone}\\n\` +
      \`*Plano Desejado:* \${formData.plan}\\n\\n\` +
      \`Olá, gostaria de solicitar a criação da minha loja digital.\`
    );

    setTimeout(() => {
      setIsLoading(false);
      window.location.href = \`https://wa.me/5584986113980?text=\${message}\`;
    }, 800);
  };

  const isValid = formData.storeName.length > 0 && formData.ownerName.length > 0 && formData.email.length > 0 && formData.phone.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
            Cardapp Brasil • Setup Assistido
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Solicitar Sua Loja</h1>
          <p className="text-zinc-500 font-medium text-sm">Preencha os dados e nossa equipe criará seu acesso em instantes.</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
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
                  <Mail className="w-3 h-3" /> E-mail
                </label>
                <input 
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
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
            
            <div className="space-y-2">
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
            </div>

            <button 
              type="submit"
              disabled={isLoading || !isValid}
              className={\`w-full font-black py-4 rounded-xl shadow-xl transition-all transform flex items-center justify-center gap-2 uppercase tracking-tighter \${isValid && !isLoading ? 'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-1 active:translate-y-0 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70'}\`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Enviar Solicitação via WhatsApp
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
`;

fs.writeFileSync('src/pages/RegisterStore.tsx', newFormCode);
