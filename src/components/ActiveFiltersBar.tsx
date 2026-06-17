import { Language, Genre, StoreFilter, TypeFilter, LicenseFilter, SortMode } from '../types';
import { t } from '../i18n';

interface ActiveFiltersBarProps {
  searchTerm: string;
  activeGenre: Genre;
  activeStore: StoreFilter;
  activeType: TypeFilter;
  activeLicense: LicenseFilter;
  sortMode: SortMode;
  showFavoritesOnly: boolean;
  language: Language;
  onClearSearch: () => void;
  onResetAll: () => void;
  onRemoveGenre: () => void;
  onRemoveStore: () => void;
  onRemoveType: () => void;
  onRemoveLicense: () => void;
}

const GENRE_ICONS: Record<string, string> = {
  action: '⚔️', rpg: '🗡️', shooter: '🔫', strategy: '🧠',
  puzzle: '🧩', racing: '🏎️', sports: '⚽', indie: '🎨',
};

const STORE_LABELS: Record<string, string> = {
  steam: 'Steam', epic: 'Epic', gog: 'GOG', itch: 'Itch.io',
  battlenet: 'Battle.net', origin: 'Origin', drm: 'DRM-Free',
};

export default function ActiveFiltersBar({
  searchTerm, activeGenre, activeStore, activeType, activeLicense,
  sortMode, showFavoritesOnly, language,
  onClearSearch, onResetAll,
  onRemoveGenre, onRemoveStore, onRemoveType, onRemoveLicense,
}: ActiveFiltersBarProps) {
  const chips: { key: string; label: string; onRemove?: () => void; icon?: string }[] = [];

  if (searchTerm) {
    chips.push({ key: 'search', label: `"${searchTerm}"`, onRemove: onClearSearch, icon: '🔍' });
  }
  if (activeGenre !== 'all') {
    chips.push({ key: 'genre', label: `${GENRE_ICONS[activeGenre] || '🎮'} ${activeGenre}`, onRemove: onRemoveGenre });
  }
  if (activeStore !== 'all' && activeStore !== 'pc') {
    chips.push({ key: 'store', label: STORE_LABELS[activeStore] || activeStore, onRemove: onRemoveStore, icon: '🏪' });
  }
  if (activeType !== 'all') {
    chips.push({ key: 'type', label: activeType === 'game' ? '🎮 ' + t('games', language) : '📱 ' + t('apps', language), onRemove: onRemoveType });
  }
  if (activeLicense !== 'all') {
    chips.push({ key: 'license', label: activeLicense === 'open-source' ? '🔓 ' + t('openSource', language) : '🔒 ' + t('proprietary', language), onRemove: onRemoveLicense });
  }
  if (sortMode !== 'default') {
    const sortLabels: Record<string, string> = {
      'price-desc': '💰 ' + t('sortPrice', language), 'ending-soon': '⏰ ' + t('sortEnding', language),
      'title': '🔤 ' + t('sortAZ', language), 'popular': '🔥 ' + t('sortPopular', language),
    };
    chips.push({ key: 'sort', label: sortLabels[sortMode] || sortMode });
  }
  if (showFavoritesOnly) {
    chips.push({ key: 'fav', label: '❤️ ' + t('favOnly', language) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="active-filters-bar">
      {chips.map(chip => (
        <span key={chip.key} className="active-filter-chip">
          {chip.icon}{chip.label}
          {chip.onRemove && (
            <button className="active-filter-remove" onClick={chip.onRemove}>✕</button>
          )}
        </span>
      ))}
      <button className="active-filters-clear" onClick={onResetAll}>
        🗑️
      </button>
    </div>
  );
}
