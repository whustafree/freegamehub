import { Language } from '../types';
import { t } from '../i18n';

interface HeaderProps {
  searchTerm: string;
  language: Language;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onOpenQR: () => void;
  onToggleLang: () => void;
}

export default function Header({
  searchTerm, language, onSearchChange, onClearSearch, onOpenQR, onToggleLang
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-brand-icon">🎮</div>
          <span className="header-brand-text">FreeGameHub</span>
        </div>

        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            placeholder={t('searchPlaceholder', language)}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchTerm && (
            <button className="header-search-clear" onClick={onClearSearch}>✕</button>
          )}
        </div>

        <div className="header-actions">
          <button className="header-action lang-btn" onClick={onToggleLang} title={language === 'es' ? 'English' : 'Español'}>
            {language === 'es' ? 'EN' : 'ES'}
          </button>
          <button className="header-action" onClick={onOpenQR} title={t('shareTitle', language)}>
            📱
          </button>
        </div>
      </div>
    </header>
  );
}
