import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ChevronRight, ArrowLeft, Shield, Eye, EyeOff, LayoutDashboard, Sparkles } from 'lucide-react';
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

    // MASTER CEO BYPASS: Always allow the CEO to enter immediately, even if the backend is offline or on a static host
    const isSuperIdentity = inputIdentity === 'samuellsilvva02@gmail.com' || inputIdentity === 'samuelsilva';
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
      const url = getApiUrl('/api/login');
      console.log('Iniciando login via API:', url);
      
      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identity, password })
        });
      } catch (networkErr) {
        throw new Error('Erro de conexão ao servidor. Verifique se o servidor de desenvolvimento está rodando.');
      }

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.error || `Credenciais inválidas ou erro no servidor (${res.status})`);
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
        ? 'Erro de rede: Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está online.' 
        : (err.message || 'Erro ao conectar ao servidor de autenticação'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStore = async (storeId: string) => {
    setError('');
    setIsLoading(true);

    const url = getApiUrl('/api/login');
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
    <div className="min-h-screen flex bg-stone-50 text-neutral-900 font-sans">
      
      {/* LEFT COLUMN: Visual & Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="z-10 flex items-center gap-3">
          <CardappLogo size="md" />
          <div className="h-6 w-[1px] bg-neutral-700" />
          <span className="text-stone-400 text-xs tracking-widest font-bold uppercase">Painel de Controle</span>
        </div>

        <div className="z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Ecossistema de Vendas
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Gerencie seu cardápio, pedidos e clientes em um único lugar.
          </h2>
          <p className="text-stone-400 text-base leading-relaxed">
            Plataforma robusta para hortifrútis, restaurantes e comércios locais venderem online de forma integrada e sem taxas abusivas.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div>
              <h4 className="text-white font-bold text-sm">Painel Rápido</h4>
              <p className="text-stone-400 text-xs mt-1">Atualizações de estoque em tempo real e alteração de preços facilitada.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Integração WhatsApp</h4>
              <p className="text-stone-400 text-xs mt-1">Envie notificações automáticas dos pedidos diretamente para o cliente.</p>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center justify-between pt-8 border-t border-white/5 text-stone-500 text-xs font-semibold">
          <span>Cardapp Brasil</span>
          <span>Suporte e Segurança Ativados</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl border border-stone-200/60 shadow-lg relative">
          
          {/* Logo on Mobile only */}
          <div className="flex justify-center mb-8 lg:hidden">
            <CardappLogo size="md" />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Ambiente de Acesso Protegido
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {multipleStores ? 'Selecione sua Loja' : 'Acesse sua Conta'}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {multipleStores 
                ? 'Identificamos múltiplos estabelecimentos vinculados.' 
                : 'Insira suas credenciais para entrar no painel de administração.'
              }
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-xs font-bold border border-rose-100 flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {multipleStores ? (
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {multipleStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleSelectStore(store.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-amber-50/60 hover:border-amber-500/40 border border-stone-200/60 rounded-xl transition-all group disabled:opacity-50 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                        {store.logo ? (
                          <img src={store.logo} alt={store.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <Store className="w-5 h-5 text-stone-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{store.name}</h4>
                        <p className="text-stone-500 text-xs font-semibold font-mono">/{store.slug}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setMultipleStores(null)}
                disabled={isLoading}
                className="w-full py-3.5 text-stone-500 hover:text-neutral-900 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao formulário
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-extrabold text-stone-500 tracking-wider uppercase mb-1.5">E-mail ou Usuário</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    disabled={isLoading}
                    value={identity}
                    onChange={e => setIdentity(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 text-neutral-900 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-semibold placeholder:text-stone-400"
                    placeholder="exemplo@email.com ou usuario"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold text-stone-500 tracking-wider uppercase">Senha</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-stone-50 text-neutral-900 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-semibold placeholder:text-stone-400"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-3.5 rounded-xl shadow-md hover:shadow-amber-500/10 transition-all duration-150 text-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verificando...' : 'Entrar no Painel'}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="pt-6 border-t border-stone-200 mt-6">
                <Link 
                  to="/admin/register"
                  className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-stone-300 hover:border-amber-500/50 hover:bg-amber-50/30 transition-all group"
                >
                  <span className="text-xs font-extrabold text-stone-500 mb-1">Deseja criar uma nova loja?</span>
                  <span className="text-sm font-bold text-amber-600 flex items-center gap-1 group-hover:text-amber-700">
                    Registre-se gratuitamente
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>

            </form>
          )}

          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col items-center gap-3 text-stone-400 text-xs font-semibold">
            <div className="flex items-center gap-5">
              <Link to="/termos-e-privacidade" className="hover:text-amber-600 transition-colors">Termos de Uso</Link>
              <div className="w-1 h-1 rounded-full bg-stone-300" />
              <Link to="/termos-e-privacidade" className="hover:text-amber-600 transition-colors">Privacidade</Link>
            </div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">
              © {new Date().getFullYear()} Cardapp Brasil • Todos os direitos reservados
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
