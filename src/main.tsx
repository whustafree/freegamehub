import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { Haptics } from '@capacitor/haptics';
import App from './App';
import './App.css';

// Capacitor native platform setup
if (Capacitor.isNativePlatform()) {
  // Configurar StatusBar
  StatusBar.setStyle({ style: 'DARK' });
  StatusBar.setBackgroundColor({ color: '#1a1a2e' });
  
  // Haptic feedback on touch
  document.addEventListener('touchstart', () => {
    Haptics.impact({ style: 'light' }).catch(() => {});
  }, { passive: true, once: true });
}

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('[SW] Error registrando Service Worker:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
