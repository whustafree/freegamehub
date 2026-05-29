import { Theme, ViewMode, Language, Vote, WishlistStatus, UserStats } from '../types';

const KEYS = {
  HIDDEN: 'fgh_hiddenGames_v3',
  FAVORITES: 'fgh_favorites_v3',
  VIEWED: 'fgh_viewedGames_v3',
  WISHLIST: 'fgh_wishlist_v1',
  VOTES: 'fgh_votes_v1',
  THEME: 'fgh_theme_v1',
  VIEW_MODE: 'fgh_viewMode_v1',
  LANGUAGE: 'fgh_language_v1',
  LAST_VISIT: 'fgh_lastVisit_v1',
  NEW_IDS: 'fgh_newGameIds_v1',
  STATS: 'fgh_userStats_v1',
};

// --- Generic ---
export function loadArray(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function saveArray(key: string, arr: string[]): void {
  localStorage.setItem(key, JSON.stringify(arr));
}

export function loadObject<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

export function saveObject<T>(key: string, obj: Record<string, T>): void {
  localStorage.setItem(key, JSON.stringify(obj));
}

// --- Hidden Games ---
export function loadHiddenGames(): string[] {
  return loadArray(KEYS.HIDDEN);
}

export function saveHiddenGames(games: string[]): void {
  saveArray(KEYS.HIDDEN, games);
}

// --- Favorites ---
export function loadFavorites(): string[] {
  return loadArray(KEYS.FAVORITES);
}

export function saveFavorites(games: string[]): void {
  saveArray(KEYS.FAVORITES, games);
}

// --- Viewed Games ---
export function loadViewedGames(): string[] {
  return loadArray(KEYS.VIEWED);
}

export function saveViewedGames(games: string[]): void {
  saveArray(KEYS.VIEWED, games);
}

// --- Wishlist (claimed status per game) ---
export function loadWishlist(): Record<string, WishlistStatus> {
  return loadObject<WishlistStatus>(KEYS.WISHLIST);
}

export function saveWishlist(wl: Record<string, WishlistStatus>): void {
  saveObject(KEYS.WISHLIST, wl);
}

// --- Votes ---
export function loadVotes(): Record<string, Vote> {
  return loadObject<Vote>(KEYS.VOTES);
}

export function saveVotes(votes: Record<string, Vote>): void {
  saveObject(KEYS.VOTES, votes);
}

// --- Theme ---
export function loadTheme(): Theme {
  return (localStorage.getItem(KEYS.THEME) as Theme) || 'dark';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme);
}

// --- View Mode ---
export function loadViewMode(): ViewMode {
  return (localStorage.getItem(KEYS.VIEW_MODE) as ViewMode) || 'grid';
}

export function saveViewMode(mode: ViewMode): void {
  localStorage.setItem(KEYS.VIEW_MODE, mode);
}

// --- Language ---
export function loadLanguage(): Language {
  // Detect browser lang on first visit
  const stored = localStorage.getItem(KEYS.LANGUAGE) as Language | null;
  if (stored) return stored;
  const browserLang = navigator.language?.startsWith('es') ? 'es' : 'en';
  localStorage.setItem(KEYS.LANGUAGE, browserLang);
  return browserLang;
}

export function saveLanguage(lang: Language): void {
  localStorage.setItem(KEYS.LANGUAGE, lang);
}

// --- Last Visit Timestamp (for new game detection) ---
export function loadLastVisit(): string | null {
  return localStorage.getItem(KEYS.LAST_VISIT);
}

export function saveLastVisit(ts: string): void {
  localStorage.setItem(KEYS.LAST_VISIT, ts);
}

// --- New Game IDs (set by API comparison) ---
export function loadNewGameIds(): string[] {
  return loadArray(KEYS.NEW_IDS);
}

export function saveNewGameIds(ids: string[]): void {
  saveArray(KEYS.NEW_IDS, ids);
}

// --- User Stats ---
export function loadUserStats(): UserStats {
  const defaults: UserStats = {
    totalClaimed: 0,
    totalSavings: 0,
    totalGamesSeen: 0,
    favoriteCount: 0,
    votesMade: 0,
    sessionStart: new Date().toISOString(),
  };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEYS.STATS) || '{}') };
  } catch {
    return defaults;
  }
}

export function saveUserStats(stats: UserStats): void {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
}
