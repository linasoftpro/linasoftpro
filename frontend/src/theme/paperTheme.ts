import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

const PRIMARY = '#6366F1';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: PRIMARY,
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0E7FF',
    onPrimaryContainer: '#1E1B4B',
    secondary: '#8B5CF6',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EDE9FE',
    onSecondaryContainer: '#3B0764',
    background: '#F9FAFB',
    onBackground: '#111827',
    surface: '#FFFFFF',
    onSurface: '#111827',
    surfaceVariant: '#F3F4F6',
    onSurfaceVariant: '#4B5563',
    outline: '#E5E7EB',
    outlineVariant: '#E5E7EB',
    error: '#EF4444',
    onError: '#FFFFFF',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A5B4FC',
    onPrimary: '#1E1B4B',
    primaryContainer: '#3730A3',
    onPrimaryContainer: '#E0E7FF',
    secondary: '#C4B5FD',
    onSecondary: '#3B0764',
    secondaryContainer: '#5B21B6',
    onSecondaryContainer: '#EDE9FE',
    background: '#0A0A0A',
    onBackground: '#F9FAFB',
    surface: '#171717',
    onSurface: '#F9FAFB',
    surfaceVariant: '#262626',
    onSurfaceVariant: '#A1A1AA',
    outline: '#27272A',
    outlineVariant: '#27272A',
    error: '#F87171',
    onError: '#7F1D1D',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: '#171717',
      level2: '#1F1F1F',
      level3: '#262626',
    },
  },
};
