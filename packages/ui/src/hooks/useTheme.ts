import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Try to get theme from localStorage or system preference
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      // Reading localStorage after mount keeps the first render SSR-safe (hydration two-pass pattern).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return [theme, setTheme];
}
