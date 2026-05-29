import { Mode, ViewMode, Language } from '../types';
import { t } from '../i18n';

interface BottomNavProps {
  currentMode: Mode;
  viewMode: ViewMode;
  favoritesCount: number;
  isFilterOpen: boolean;
  showFavoritesOnly: boolean;
  language: Language;
  onModeChange: (mode: Mode) => void;
  onToggleFilters: () => void;
  onToggleFavorites: () => void;
  onResetFilters: () => void;
  onToggleViewMode: () => void;
  onOpenStats: () => void;
}

export default function BottomNav({
  currentMode, viewMode, favoritesCount, isFilterOpen, showFavoritesOnly, language,
  onModeChange, onToggleFilters, onToggleFavorites, onResetFilters, onToggleViewMode, onOpenStats
}: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn ${currentMode === 'pc' ? 'active' : ''}`}
        onClick={() => onModeChange('pc')}
        title={t('navPC', language)}
      >
        <span className="nav-btn-icon">🖥️</span>
        <span className="nav-btn-label">{t('navPC', language)}</span>
      </button>

      <button
        className={`nav-btn ${currentMode === 'android' ? 'active' : ''}`}
        onClick={() => onModeChange('android')}
        title={t('navAndroid', language)}
      >
        <span className="nav-btn-icon">📱</span>
        <span className="nav-btn-label">{t('navAndroid', language)}</span>
      </button>

      <button
        className={`nav-btn ${isFilterOpen ? 'active' : ''}`}
        onClick={onToggleFilters}
        title={t('navFilters', language)}
      >
        <span className="nav-btn-icon">⚙️</span>
        <span className="nav-btn-label">{t('navFilters', language)}</span>
      </button>

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

      <button className="nav-btn" onClick={onOpenStats} title={t('myStats', language)}>
        <span className="nav-btn-icon">📊</span>
        <span className="nav-btn-label">{t('navStats', language)}</span>
      </button>

      <button className="nav-btn" onClick={onResetFilters} title={t('navReset', language)}>
        <span className="nav-btn-icon">🔄</span>
        <span className="nav-btn-label">{t('navReset', language)}</span>
      </button>
    </nav>
  );
}
