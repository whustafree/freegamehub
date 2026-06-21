import { useCallback } from 'react';
import { Language } from '../types';
import { t } from '../i18n';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  const handleReset = useCallback(() => {
    const confirmed = window.confirm(
      language === 'es'
        ? '¿Restablecer todos los datos? Se perderán wishlist, colecciones y actividad.'
        : 'Reset all data? Wishlist, collections and activity will be lost.'
    );
    if (confirmed) {
      const keysToKeep = ['fgh_viewMode_v1', 'fgh_language_v1'];
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fgh_') && !keysToKeep.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  }, [language]);

  return (
    <footer className="app-footer">
      <div className="footer-actions">
        <button className="footer-action footer-reset-btn" onClick={handleReset}>
          🗑️ {language === 'es' ? 'Restablecer datos' : 'Reset data'}
        </button>
      </div>
      <p className="footer-text">
        {t('footerText', language)}
      </p>
    </footer>
  );
}
