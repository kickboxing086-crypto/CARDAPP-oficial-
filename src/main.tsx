import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Registrar Service Worker para PWA Installable
if ('serviceWorker' in navigator) {
  // Escuta por mudança no controller (quando um novo SW toma o controle) e recarrega a página automaticamente
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[SW] Novo service worker assumiu controle, recarregando...');
      window.location.reload();
    }
  });

  const registerSW = () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registrado com sucesso:', registration.scope);
        // Força uma verificação de atualização do SW sempre que a página for carregada
        registration.update().catch(err => console.warn('[SW] Erro ao buscar atualização do SW:', err));
      })
      .catch(error => {
        console.error('SW falhou ao registrar:', error);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
