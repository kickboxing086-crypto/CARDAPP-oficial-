import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ChevronRight, ArrowLeft, ShieldCheck, Globe, WifiOff, Eye, EyeOff } from 'lucide-react';
import { getApiUrl } from '../lib/api';
import CardappLogo from '../components/CardappLogo';

export default function AdminLogin() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [multipleStores, setMultipleStores] = useState<{ id: string; name: string; slug: string; logo: string }[] | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputIdentity = identity.toLowerCase().trim();
    const inputPassword = password;

    // MASTER CEO BYPASS: Always allow the CEO to enter immediately, even if the backend is offline or on a static static host
    const isSuperIdentity = inputIdentity === 'samuellsilvva02@gmail.com' || inputIdentity === 'kickboxing086@gmail.com' || inputIdentity === 'admin@cardapp.com' || inputIdentity === 'samuelsilva';
    const isMasterCEO = isSuperIdentity && (inputPassword === '86113980' || inputPassword === 'admin123' || inputPassword === '861139');

    if (isMasterCEO) {
      console.log('Master CEO bypass activated on client-side');
      localStorage.setItem('admin_token', 'super-admin-token');
      localStorage.setItem('store_id', 'master-ceo');
      localStorage.setItem('is_super_admin', 'true');
      localStorage.setItem('ceo_profile', JSON.stringify({
        name: 'SAMUEL SILVA',
        role: 'CEO MASTER',
        accessLevel: 'GLOBAL_OVERRIDE'
      }));
      setIsLoading(false);
      navigate('/admin');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      let res;
      let data;

      try {
        const url = getApiUrl('/api/login');
        console.log('Iniciando login via API:', url);
        
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identity, password })
          });
        } catch (networkErr) {
          throw new Error('Erro de conexão ao servidor. Tente novamente em alguns segundos.');
        }
        
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        }

        if (!res.ok) {
          throw new Error(data?.error || `Erro do Servidor (${res.status})`);
        }
      } catch (fetchErr: any) {
        throw fetchErr;
      }

      if (data && data.success) {
        if (data.multiple) {
          setMultipleStores(data.stores);
        } else {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('store_id', data.storeId);
          if (data.isSuperAdmin) {
            localStorage.setItem('is_super_admin', 'true');
            if (data.ceoProfile) {
              localStorage.setItem('ceo_profile', JSON.stringify(data.ceoProfile));
            }
          } else {
            localStorage.removeItem('is_super_admin');
            localStorage.removeItem('ceo_profile');
          }
          navigate('/admin');
        }
      } else {
        setError(data?.error || 'Credenciais inválidas ou sem autorização');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Erro de rede: Não foi possível conectar ao servidor. Verifique sua internet ou se o backend está online.' 
        : (err.message || 'Erro ao conectar ao servidor de autenticação'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStore = async (storeId: string) => {
    setError('');
    setIsLoading(true);

    const url = getApiUrl('/api/login');
    console.log('Selecionando loja via API:', url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identity, password, storeId })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('store_id', data.storeId);
        localStorage.removeItem('is_super_admin');
        navigate('/admin');
      } else {
        setError(data.error || 'Erro ao selecionar a loja');
      }
    } catch (err: any) {
      console.error('Error selecting store:', err);
      setError('Erro de rede ao conectar ao servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-white/5 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4">
            <CardappLogo size="lg" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            {multipleStores ? 'Selecione Sua Loja' : 'Painel de Acesso'}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {multipleStores ? 'Encontramos mais de uma loja em seu cadastro:' : 'Insira suas credenciais de acesso'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/30 text-rose-400 p-4 rounded-xl mb-6 text-xs text-center font-bold border border-rose-900/50">
            {error}
          </div>
        )}

        {multipleStores ? (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {multipleStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleSelectStore(store.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 bg-zinc-950 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 rounded-2xl transition-all group disabled:opacity-50 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {store.logo ? (
                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      ) : (
                        <Store className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{store.name}</h4>
                      <p className="text-zinc-400 text-xs font-semibold font-mono">/{store.slug}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setMultipleStores(null)}
              disabled={isLoading}
              className="w-full py-3 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 tracking-wide uppercase mb-1">E-mail ou Usuário</label>
              <input 
                type="text" 
                required
                disabled={isLoading}
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm font-semibold placeholder:text-zinc-600"
                placeholder="Digite seu e-mail ou usuário"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 tracking-wide uppercase mb-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-zinc-950 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm font-semibold placeholder:text-zinc-600"
                  placeholder="Sua senha secreta"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? 'Autenticando...' : 'Acessar Canal Seguro'}
            </button>
            
            <div className="pt-4 border-t border-white/5 mt-6">
              <Link 
                to="/admin/register"
                className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
              >
                <span className="text-xs font-bold text-zinc-400 mb-1 group-hover:text-zinc-300 transition-colors">Ainda não tem uma loja?</span>
                <span className="text-sm font-black text-amber-500 flex items-center gap-2">
                  Comece seu teste de 7 dias grátis
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/termos-e-privacidade')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-400 transition-colors">Políticas</button>
            <button onClick={() => navigate('/termos-e-privacidade')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-400 transition-colors">Privacidade</button>
          </div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Cardapp Brasil
          </p>
        </div>
      </div>
    </div>
  );
}
