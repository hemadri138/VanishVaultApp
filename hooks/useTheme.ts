import { ThemeMode } from '@/lib/theme';

export function useTheme() {
  const theme: ThemeMode = 'dark';
  return { theme };
}
