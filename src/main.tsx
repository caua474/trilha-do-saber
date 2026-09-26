import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe cleanup of stale service workers and caches outside sandboxed iframes
if (typeof window !== 'undefined') {
  try {
    const isSandboxedIframe = window.self !== window.top;
    if (!isSandboxedIframe && 'serviceWorker' in navigator && navigator.serviceWorker?.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
    }

    if (!isSandboxedIframe && 'caches' in window && caches?.keys) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key).catch(() => {}));
      }).catch(() => {});
    }
  } catch {
    // Gracefully ignore restrictions in sandboxed preview iframe
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

