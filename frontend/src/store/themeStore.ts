import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../types';

const STORAGE_KEY = '@maitragenda/theme/v1';

interface ThemeState {
  mode: ThemeMode;
  isLoaded: boolean;
  load: () => Promise<void>;
  setMode: (m: ThemeMode) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isLoaded: false,
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const mode: ThemeMode = raw ? (JSON.parse(raw) as ThemeMode) : 'system';
      set({ mode, isLoaded: true });
    } catch {
      set({ mode: 'system', isLoaded: true });
    }
  },
  setMode: async (m) => {
    set({ mode: m });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    } catch {
      /* ignore */
    }
  },
}));
