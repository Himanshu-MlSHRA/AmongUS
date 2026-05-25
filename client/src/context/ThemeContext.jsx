import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

const KEY_THEME = 'auc:theme';
const KEY_PREFS = 'auc:prefs';

const defaultPrefs = {
  sound: true,
  music: false,
  animations: true,
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY_THEME) || 'dark');
  const [prefs, setPrefs] = useState(() => ({ ...defaultPrefs, ...readJSON(KEY_PREFS, {}) }));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(KEY_THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
  }, [prefs]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  );

  const updatePrefs = useCallback(
    (patch) => setPrefs((p) => ({ ...p, ...patch })),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, prefs, updatePrefs }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
