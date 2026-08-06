const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerView.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  "import { db } from '../lib/firebase';",
  "import { db, auth, googleProvider } from '../lib/firebase';\nimport { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';"
);

code = code.replace(
  "Share } from 'lucide-react';",
  "Share, User as UserIcon, LogOut } from 'lucide-react';"
);

// 2. Add State
code = code.replace(
  "const [showPwaAssistant, setShowPwaAssistant] = useState(false);",
  "const [showPwaAssistant, setShowPwaAssistant] = useState(false);\n  const [currentUser, setCurrentUser] = useState<User | null>(null);\n  const [showLoginModal, setShowLoginModal] = useState(false);\n  const [loginEmail, setLoginEmail] = useState('');\n  const [loginPassword, setLoginPassword] = useState('');\n  const [isRegistering, setIsRegistering] = useState(false);\n  const [authError, setAuthError] = useState('');"
);

// 3. Add useEffect for Auth
code = code.replace(
  "// PWA Install Prompt",
  "// Auth Listener\n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged(auth, (user) => {\n      setCurrentUser(user);\n      if (user) {\n        if (user.displayName && !customerName) setCustomerName(user.displayName);\n        if (user.phoneNumber && !customerPhone) setCustomerPhone(user.phoneNumber);\n      }\n    });\n    return () => unsubscribe();\n  }, []);\n\n  const handleGoogleLogin = async () => {\n    try {\n      setAuthError('');\n      await signInWithPopup(auth, googleProvider);\n      setShowLoginModal(false);\n    } catch (err: any) {\n      setAuthError(err.message || 'Erro ao fazer login com Google.');\n    }\n  };\n\n  const handleEmailAuth = async (e: React.FormEvent) => {\n    e.preventDefault();\n    try {\n      setAuthError('');\n      if (isRegistering) {\n        await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);\n      } else {\n        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);\n      }\n      setShowLoginModal(false);\n    } catch (err: any) {\n      setAuthError(err.message || 'Erro na autenticação. Verifique os dados.');\n    }\n  };\n\n  // PWA Install Prompt"
);

// 4. Add User Button
code = code.replace(
  "<ShoppingCart className=\"w-6 h-6\" />",
  "<ShoppingCart className=\"w-6 h-6\" />"
); // Just finding it

const userButton = `
        <button 
          onClick={() => currentUser ? setIsOrdersHistoryOpen(true) : setShowLoginModal(true)} 
          className="relative w-14 h-14 bg-white/95 backdrop-blur-md rounded-full shadow-2xl hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center text-gray-800 border-2 border-white hover:scale-110 active:scale-95"
          style={{ boxShadow: \`0 10px 30px -5px \${settings.primaryColor}20\` }}
          title={currentUser ? "Minha Conta" : "Login"}
        >
          {currentUser ? (
            <img src={currentUser.photoURL || \`https://ui-avatars.com/api/?name=\${currentUser.email}&background=random\`} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <UserIcon className="w-6 h-6" />
          )}
        </button>
`;

code = code.replace(
  "        {/* Cart button always visible at top per user preference */}",
  userButton + "\n        {/* Cart button always visible at top per user preference */}"
);

// 5. Add Auth Modal UI inside the return, before <AnimatePresence> for Modals
const authModalUI = `
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {currentUser ? 'Minha Conta' : (isRegistering ? 'Criar Conta' : 'Fazer Login')}
                </h3>
                <button onClick={() => setShowLoginModal(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-full transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {currentUser ? (
                  <div className="text-center space-y-4">
                    <img src={currentUser.photoURL || \`https://ui-avatars.com/api/?name=\${currentUser.email}&background=random\`} alt="Avatar" className="w-20 h-20 mx-auto rounded-full shadow-md" />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{currentUser.displayName || currentUser.email}</h4>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                    <button 
                      onClick={() => { signOut(auth); setShowLoginModal(false); }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                    >
                      <LogOut className="w-5 h-5" /> Sair
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                      Continuar com Google
                    </button>
                    
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">ou use email</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      {authError && <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg">{authError}</div>}
                      <div>
                        <input 
                          type="email" required placeholder="E-mail"
                          value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[--theme-color] outline-none font-medium"
                          style={{ '--theme-color': settings.primaryColor } as any}
                        />
                      </div>
                      <div>
                        <input 
                          type="password" required placeholder="Senha"
                          value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[--theme-color] outline-none font-medium"
                          style={{ '--theme-color': settings.primaryColor } as any}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-3.5 px-4 text-white rounded-xl font-black tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        {isRegistering ? 'Criar Conta' : 'Entrar'}
                      </button>
                      <div className="text-center mt-4">
                        <button 
                          type="button" onClick={() => setIsRegistering(!isRegistering)}
                          className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(
  "{/* Full Screen Modals Layer */}",
  authModalUI + "\n      {/* Full Screen Modals Layer */}"
);

fs.writeFileSync('src/pages/CustomerView.tsx', code);
