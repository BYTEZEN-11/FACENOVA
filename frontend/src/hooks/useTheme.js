import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from '../utils/constants';

function getInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === THEMES.LIGHT || stored === THEMES.DARK) return stored;
  } catch {

  }
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return THEMES.LIGHT;
  }
  return DEFAULT_THEME;
}

function applyTheme(name) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = name;
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {

    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next !== THEMES.LIGHT && next !== THEMES.DARK) return;
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  return { theme, setTheme, toggleTheme };
}
