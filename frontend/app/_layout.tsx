import 'react-native-gesture-handler';
import React, { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import { Appearance, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme } from '../src/theme/paperTheme';
import { useThemeStore } from '../src/store/themeStore';
import { useEventStore } from '../src/store/eventStore';
import { useTaskStore } from '../src/store/taskStore';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((s) => s.mode);
  const themeLoaded = useThemeStore((s) => s.isLoaded);
  const loadTheme = useThemeStore((s) => s.load);
  const loadEvents = useEventStore((s) => s.load);
  const loadTasks = useTaskStore((s) => s.load);

  useEffect(() => {
    loadTheme();
    loadEvents();
    loadTasks();
  }, [loadTheme, loadEvents, loadTasks]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const paperTheme = isDark ? darkTheme : lightTheme;

  // Always force show something even if theme not loaded
  if (!themeLoaded) {
    // proceed with light
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: paperTheme.colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="event/new"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="event/[id]"
              options={{ animation: 'slide_from_right' }}
            />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
