import { useState, useRef, useEffect } from 'react';
import { Mode, ViewMode, Language } from '../types';
import { t } from '../i18n';

interface BottomNavProps {
  currentMode: Mode;
  viewMode: ViewMode;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  language: Language;
  multiSelectActive?: boolean;
  visible?: boolean;
  onModeChange: (mode: Mode) => void;
  onToggleFavorites: () => void;
  onResetFilters: () => void;
  onToggleViewMode: () => void;
  onOpenStats: () => void;
  onOpenSettings?: () => void;
  onToggleMultiSelect?: () => void;
}

const MODES: { mode: Mode; icon: string; labelKey: 'navPC' | 'navAndroid' }[] = [
  { mode: 'pc', icon: '🖥️', labelKey: 'navPC' },
  { mode: 'android', icon: '📱', labelKey: 'navAndroid' },
];

export default function BottomNav({
  currentMode, viewMode, favoritesCount, showFavoritesOnly, language,
  multiSelectActive, visible = true,
  onModeChange, onToggleFavorites, onResetFilters, onToggleViewMode, onOpenStats,
  onOpenSettings, onToggleMultiSelect
}: BottomNavProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close overflow on outside click
  useEffect(() => {
    if (!showOverflow) return;
    const handleClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOverflow]);

  const handleOverflowAction = (action: () => void) => {
    setShowOverflow(false);
    action();
  };

  return (
    <nav className={`bottom-nav ${!visible ? 'hidden' : ''}`}>
      {MODES.map(({ mode, icon, labelKey }) => (
        <button
          key={mode}
          className={`nav-btn ${currentMode === mode ? 'active' : ''}`}
          onClick={() => onModeChange(mode)}
          title={t(labelKey, language)}
        >
          <span className="nav-btn-icon">{icon}</span>
          <span className="nav-btn-label">{t(labelKey, language)}</span>
        </button>
      ))}

      <button
        className={`nav-btn ${showFavoritesOnly ? 'active' : ''}`}
        onClick={onToggleFavorites}
        title={t('navFav', language)}
      >
        <span className="nav-btn-icon">❤️</span>
        <span className="nav-btn-label">{t('navFav', language)}</span>
        {favoritesCount > 0 && (
          <span className="nav-badge">{favoritesCount > 99 ? '99+' : favoritesCount}</span>
        )}
      </button>

      <button
        className="nav-btn"
        onClick={onToggleViewMode}
        title={viewMode === 'grid' ? t('navList', language) : t('navGrid', language)}
      >
        <span className="nav-btn-icon">{viewMode === 'grid' ? '📋' : '🔲'}</span>
        <span className="nav-btn-label">{viewMode === 'grid' ? t('navList', language) : t('navGrid', language)}</span>
      </button>

      {/* Overflow Menu (•••) */}
      <div className="nav-overflow-wrapper" ref={overflowRef}>
        <button
          className={`nav-btn ${showOverflow ? 'active' : ''}`}
          onClick={() => setShowOverflow(p => !p)}
          title={language === 'es' ? 'Más opciones' : 'More options'}
        >
          <span className="nav-btn-icon">•••</span>
          <span className="nav-btn-label">{language === 'es' ? 'Más' : 'More'}</span>
        </button>

        {showOverflow && (
          <div className="nav-overflow-menu">
            <button
              className={`nav-overflow-item ${multiSelectActive ? 'active' : ''}`}
              onClick={() => handleOverflowAction(() => { if (onToggleMultiSelect) onToggleMultiSelect(); })}
            >
              <span>{multiSelectActive ? '✅' : '☑️'}</span>
              {t('multiSelect', language)}
            </button>

            <button
              className="nav-overflow-item"
              onClick={() => handleOverflowAction(onOpenStats)}
            >
              <span>📊</span>
              {t('navStats', language)}
            </button>

            <button
              className="nav-overflow-item"
              onClick={() => handleOverflowAction(() => { if (onOpenSettings) onOpenSettings(); })}
            >
              <span>⚙️</span>
              {t('theme', language)}
            </button>

            <div className="nav-overflow-divider" />

            <button
              className="nav-overflow-item danger"
              onClick={() => handleOverflowAction(onResetFilters)}
            >
              <span>🔄</span>
              {t('navReset', language)}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
