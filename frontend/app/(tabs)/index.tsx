import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useEventStore } from '../../src/store/eventStore';
import { useTaskStore } from '../../src/store/taskStore';
import { EventCard } from '../../src/components/EventCard';
import { EmptyState } from '../../src/components/EmptyState';
import {
  fmtDateLong,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from '../../src/utils/dateUtils';

interface KpiProps {
  label: string;
  value: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bg: string;
  testID: string;
  onPress?: () => void;
}

const Kpi: React.FC<KpiProps> = ({ label, value, icon, color, bg, testID, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [{ flex: 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      <Surface elevation={1} style={[styles.kpi, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text variant="headlineSmall" style={[styles.kpiValue, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
        <Text variant="bodySmall" style={[styles.kpiLabel, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>
      </Surface>
    </Pressable>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = useEventStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);

  const today = new Date();
  const startToday = startOfDay(today);
  const endToday = endOfDay(today);
  const startWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endWeek = endOfWeek(today, { weekStartsOn: 1 });

  const stats = useMemo(() => {
    const active = events.filter((e) => e.status !== 'annule' && e.status !== 'termine');
    const todayEvents = events.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.startDate), { start: startToday, end: endToday });
      } catch {
        return false;
      }
    });
    const weekEvents = events.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.startDate), { start: startWeek, end: endWeek });
      } catch {
        return false;
      }
    });
    const urgent = events.filter(
      (e) => (e.priority === 'urgente' || e.priority === 'haute') && e.status !== 'termine' && e.status !== 'annule'
    );
    const pendingTasks = tasks.filter((t) => !t.done);
    return {
      active: active.length,
      todayCount: todayEvents.length,
      weekCount: weekEvents.length,
      urgent: urgent.length,
      pendingTasks: pendingTasks.length,
    };
  }, [events, tasks, startToday, endToday, startWeek, endWeek]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.startDate).getTime() >= now - 24 * 3600 * 1000 && e.status !== 'annule')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [events]);

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="labelMedium" style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>
              {fmtDateLong(today).toUpperCase()}
            </Text>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              MaîtrAgenda
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Bonjour 👋 Voici votre journée.
            </Text>
          </View>
          <View style={[styles.logoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="school" size={26} color={theme.colors.onPrimaryContainer} />
          </View>
        </Animated.View>

        {/* KPI Cards */}
        <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.kpiRow}>
          <Kpi
            testID="kpi-active"
            label="Actifs"
            value={stats.active}
            icon="calendar-blank-outline"
            color={theme.colors.primary}
            bg={theme.colors.primaryContainer}
            onPress={() => router.push('/(tabs)/agenda')}
          />
          <Kpi
            testID="kpi-tasks"
            label="Tâches"
            value={stats.pendingTasks}
            icon="checkbox-marked-circle-outline"
            color="#22C55E"
            bg="#DCFCE7"
            onPress={() => router.push('/(tabs)/tasks')}
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(140).springify()} style={styles.kpiRow}>
          <Kpi
            testID="kpi-urgent"
            label="Urgences"
            value={stats.urgent}
            icon="alert-octagon"
            color="#EF4444"
            bg="#FEE2E2"
          />
          <Kpi
            testID="kpi-week"
            label="Cette semaine"
            value={stats.weekCount}
            icon="calendar-week"
            color="#6366F1"
            bg="#E0E7FF"
            onPress={() => router.push('/(tabs)/agenda')}
          />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Surface
            elevation={1}
            style={[styles.quickCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          >
            <View style={styles.quickRow}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.primary} />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, marginLeft: 8, fontWeight: '700' }}
              >
                Actions rapides
              </Text>
            </View>
            <View style={styles.quickActions}>
              <Pressable
                testID="quick-new-event"
                onPress={() => router.push('/event/new')}
                style={({ pressed }) => [
                  styles.quickBtn,
                  { backgroundColor: theme.colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <MaterialCommunityIcons name="plus-circle" size={18} color={theme.colors.onPrimary} />
                <Text style={[styles.quickBtnText, { color: theme.colors.onPrimary }]}>Événement</Text>
              </Pressable>
              <Pressable
                testID="quick-agenda"
                onPress={() => router.push('/(tabs)/agenda')}
                style={({ pressed }) => [
                  styles.quickBtnOutline,
                  { borderColor: theme.colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <MaterialCommunityIcons name="calendar-month" size={18} color={theme.colors.primary} />
                <Text style={[styles.quickBtnText, { color: theme.colors.primary }]}>Agenda</Text>
              </Pressable>
            </View>
          </Surface>
        </Animated.View>

        {/* Upcoming events */}
        <Animated.View entering={FadeInUp.delay(280).springify()} style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              À venir
            </Text>
          </View>
          {upcoming.length > 0 ? (
            <Pressable testID="see-all-events" onPress={() => router.push('/(tabs)/agenda')}>
              <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Voir tout
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>

        {upcoming.length === 0 ? (
          <EmptyState
            testID="dashboard-empty"
            icon="calendar-blank-outline"
            title="Aucun événement à venir"
            subtitle="Touchez le bouton + au centre pour créer votre premier événement scolaire."
          />
        ) : (
          upcoming.map((e, idx) => (
            <EventCard
              key={e.id}
              event={e}
              index={idx}
              showDate
              onPress={() => router.push(`/event/${e.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpi: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  kpiLabel: {
    marginTop: 2,
  },
  quickCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  quickBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  quickBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
  },
});
