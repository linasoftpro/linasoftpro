import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

function CenterFab() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      testID="fab-new-event"
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        router.push('/event/new');
      }}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.colors.primary,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Nouveau"
    >
      <MaterialCommunityIcons name="plus" size={28} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                testID="tab-home"
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                style={[props.style as any, { flex: 1 }]}
                android_ripple={{ borderless: true, color: theme.colors.primary + '33' }}
              >
                {props.children as any}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                testID="tab-agenda"
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                style={[props.style as any, { flex: 1 }]}
                android_ripple={{ borderless: true, color: theme.colors.primary + '33' }}
              >
                {props.children as any}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="new-placeholder"
          options={{
            title: '',
            tabBarIcon: () => <View style={{ width: 56, height: 56 }} />,
            tabBarButton: () => (
              <View style={styles.fabSlot}>
                <CenterFab />
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tâches',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                testID="tab-tasks"
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                style={[props.style as any, { flex: 1 }]}
                android_ripple={{ borderless: true, color: theme.colors.primary + '33' }}
              >
                {props.children as any}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Réglages',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                testID="tab-settings"
                onPress={props.onPress}
                onLongPress={props.onLongPress}
                style={[props.style as any, { flex: 1 }]}
                android_ripple={{ borderless: true, color: theme.colors.primary + '33' }}
              >
                {props.children as any}
              </Pressable>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});
