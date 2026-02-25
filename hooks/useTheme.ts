import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { getStoredTheme, setStoredTheme, ThemeMode } from '@/lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    (async () => {
      const stored = await getStoredTheme();
      if (stored) {
        setTheme(stored);
        return;
      }
      const systemTheme = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
      setTheme(systemTheme);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await setStoredTheme(next);
  };

  return { theme, toggleTheme };
}
