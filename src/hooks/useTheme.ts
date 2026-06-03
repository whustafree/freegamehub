import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    // Apple App Store dark theme — single fixed theme
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-accent', 'red');
  }, []);
}

import { loadTheme, saveTheme, loadAccentColor, saveAccentColor } from '../utils/storage';
export function getSavedTheme() {
  return loadTheme();
}
export function getSavedAccent() {
  return loadAccentColor();
}
