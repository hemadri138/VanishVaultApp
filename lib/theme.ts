import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

const KEY = 'vv-theme';

export async function getStoredTheme() {
  const value = await AsyncStorage.getItem(KEY);
  return (value as ThemeMode | null) ?? null;
}

export async function setStoredTheme(mode: ThemeMode) {
  await AsyncStorage.setItem(KEY, mode);
}
