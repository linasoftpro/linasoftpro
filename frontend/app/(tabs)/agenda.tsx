import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useEventStore } from '../../src/store/eventStore';
import { EventCard } from '../../src/components/EventCard';
import { EmptyState } from '../../src/components/EmptyState';
import { CATEGORY_BY_ID } from '../../src/constants/categories';
import {
  getMonthGrid,
  getWeekDays,
  fmtMonth,
  fmtDateLong,
  fmtTime,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameDay,
  startOfDay,
  endOfDay,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  DOW_SHORT,
} from '../../src/utils/dateUtils';
import { CalendarViewMode, SchoolEvent } from '../../src/types';

const { width: SCREEN_W } = Dimensions.get('window');

export default function AgendaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = useEventStore((s) => s.events);
  const detectConflicts = useEventStore((s) => s.detectConflicts);

  const [mode, setMode] = useState<CalendarViewMode>('mois');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const eventsByDay = useMemo(() => {
    const map: Record<string, SchoolEvent[]> = {};
    for (const e of events) {
      try {
        const k = startOfDay(parseISO(e.startDate)).toISOString();
        if (!map[k]) map[k] = [];
        map[k].push(e);
      } catch {
        /* skip */
      }
    }
    return map;
  }, [events]);

  function eventsForDay(d: Date): SchoolEvent[] {
    return eventsByDay[startOfDay(d).toISOString()] ?? [];
  }

  function handlePrev() {
    if (mode === 'mois') setAnchor(subMonths(anchor, 1));
    else if (mode === 'semaine') setAnchor(subWeeks(anchor, 1));
    else setSelectedDay(subDays(selectedDay, 1));
  }
  function handleNext() {
    if (mode === 'mois') setAnchor(addMonths(anchor, 1));
    else if (mode === 'semaine') setAnchor(addWeeks(anchor, 1));
    else setSelectedDay(addDays(selectedDay, 1));
  }
  function handleToday() {
    const now = new Date();
    setAnchor(now);
    setSelectedDay(now);
  }

  const headerLabel =
    mode === 'mois'
      ? fmtMonth(anchor)
      : mode === 'semaine'
        ? `Semaine du ${getWeekDays(anchor)[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        : fmtDateLong(selectedDay);

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>
            AGENDA
          </Text>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {headerLabel}
          </Text>
        </View>
        <Pressable
          testID="agenda-today"
          onPress={handleToday}
          style={({ pressed }) => [
            styles.todayBtn,
            { borderColor: theme.colors.primary, transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
        >
          <MaterialCommunityIcons name="calendar-today" size={14} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontWeight: '700', marginLeft: 4 }}>Aujourd&apos;hui</Text>
        </Pressable>
      </View>

      {/* View switcher */}
      <View style={styles.switcherRow}>
        <Surface
          elevation={1}
          style={[styles.switcher, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
        >
          {(['mois', 'semaine', 'jour'] as CalendarViewMode[]).map((m) => {
            const isActive = mode === m;
            return (
              <Pressable
                key={m}
                testID={`view-${m}`}
                onPress={() => setMode(m)}
                style={[
                  styles.switcherBtn,
                  isActive && { backgroundColor: theme.colors.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    m === 'mois' ? 'calendar-month' : m === 'semaine' ? 'calendar-week' : 'calendar-today'
                  }
                  size={16}
                  color={isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="labelMedium"
                  style={{
                    color: isActive ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                    marginLeft: 6,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                  }}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </Surface>
        <View style={styles.navBtns}>
          <Pressable
            testID="agenda-prev"
            onPress={handlePrev}
            style={[styles.navBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.onSurface} />
          </Pressable>
          <Pressable
            testID="agenda-next"
            onPress={handleNext}
            style={[styles.navBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'mois' && (
          <MonthView
            anchor={anchor}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            eventsForDay={eventsForDay}
          />
        )}
        {mode === 'semaine' && (
          <WeekView
            anchor={anchor}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            eventsForDay={eventsForDay}
          />
        )}

        {/* Selected day events list */}
        <Animated.View entering={FadeIn.duration(300)} layout={Layout.springify()}>
          <View style={styles.dayHeader}>
            <MaterialCommunityIcons name="calendar-text" size={18} color={theme.colors.primary} />
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface, marginLeft: 8, fontWeight: '700', flex: 1 }}
            >
              {mode === 'jour'
                ? fmtDateLong(selectedDay)
                : `${fmtDateLong(selectedDay)} (${eventsForDay(selectedDay).length})`}
            </Text>
          </View>

          {mode === 'jour' ? (
            <DayTimeline
              day={selectedDay}
              events={eventsForDay(selectedDay)}
              detectConflicts={detectConflicts}
              onPressEvent={(id) => router.push(`/event/${id}`)}
            />
          ) : eventsForDay(selectedDay).length === 0 ? (
            <EmptyState
              icon="calendar-remove-outline"
              title="Aucun événement ce jour"
              subtitle="Touchez le bouton + pour en créer un."
            />
          ) : (
            eventsForDay(selectedDay)
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((e, idx) => {
                const conflicts = detectConflicts(e);
                return (
                  <EventCard
                    key={e.id}
                    event={e}
                    index={idx}
                    hasConflict={conflicts.length > 0}
                    onPress={() => router.push(`/event/${e.id}`)}
                  />
                );
              })
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ───────────────────────────── Month View ─────────────────────────────

interface MonthViewProps {
  anchor: Date;
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  eventsForDay: (d: Date) => SchoolEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({ anchor, selectedDay, onSelectDay, eventsForDay }) => {
  const theme = useTheme();
  const days = getMonthGrid(anchor);
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const today = new Date();
  const cellSize = (SCREEN_W - 32) / 7;

  return (
    <Animated.View entering={FadeInDown.duration(250)} style={styles.monthGrid}>
      <View style={styles.dowRow}>
        {DOW_SHORT.map((d, i) => (
          <View key={i} style={[styles.dowCell, { width: cellSize }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>
              {d}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.monthCells}>
        {days.map((d) => {
          const inMonth = isWithinInterval(d, { start: monthStart, end: monthEnd });
          const isSelected = isSameDay(d, selectedDay);
          const isToday = isSameDay(d, today);
          const dayEvents = eventsForDay(d);
          const dotCats = Array.from(new Set(dayEvents.slice(0, 3).map((e) => CATEGORY_BY_ID[e.category].color)));
          return (
            <Pressable
              testID={`day-${d.toISOString().split('T')[0]}`}
              key={d.toISOString()}
              onPress={() => onSelectDay(d)}
              style={[styles.monthCell, { width: cellSize, height: cellSize }]}
            >
              <View
                style={[
                  styles.monthDayCircle,
                  isSelected && { backgroundColor: theme.colors.primary },
                  !isSelected && isToday && { borderColor: theme.colors.primary, borderWidth: 1.5 },
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={{
                    color: isSelected
                      ? theme.colors.onPrimary
                      : !inMonth
                        ? theme.colors.outline
                        : isToday
                          ? theme.colors.primary
                          : theme.colors.onSurface,
                    fontWeight: isToday || isSelected ? '700' : '500',
                  }}
                >
                  {d.getDate()}
                </Text>
              </View>
              <View style={styles.dotRow}>
                {dotCats.map((c, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

// ───────────────────────────── Week View ─────────────────────────────

const WeekView: React.FC<MonthViewProps> = ({ anchor, selectedDay, onSelectDay, eventsForDay }) => {
  const theme = useTheme();
  const days = getWeekDays(anchor);
  const today = new Date();
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={styles.weekRow}>
      {days.map((d) => {
        const isSelected = isSameDay(d, selectedDay);
        const isToday = isSameDay(d, today);
        const list = eventsForDay(d);
        return (
          <Pressable
            key={d.toISOString()}
            testID={`week-day-${d.toISOString().split('T')[0]}`}
            onPress={() => onSelectDay(d)}
            style={[
              styles.weekCell,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                borderColor: isToday && !isSelected ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                textTransform: 'uppercase',
                fontWeight: '700',
              }}
            >
              {d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)}
            </Text>
            <Text
              variant="titleLarge"
              style={{
                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              {d.getDate()}
            </Text>
            <View style={[styles.weekBadge, { backgroundColor: isSelected ? '#FFFFFF33' : theme.colors.primaryContainer }]}>
              <Text
                variant="labelSmall"
                style={{
                  color: isSelected ? theme.colors.onPrimary : theme.colors.onPrimaryContainer,
                  fontWeight: '700',
                }}
              >
                {list.length}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

// ───────────────────────────── Day Timeline ─────────────────────────────

interface DayTimelineProps {
  day: Date;
  events: SchoolEvent[];
  detectConflicts: (e: SchoolEvent) => SchoolEvent[];
  onPressEvent: (id: string) => void;
}

const DayTimeline: React.FC<DayTimelineProps> = ({ day, events, detectConflicts, onPressEvent }) => {
  const theme = useTheme();
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon="clock-outline"
        title="Journée libre"
        subtitle="Aucun événement programmé. Profitez-en pour préparer la suite."
      />
    );
  }

  const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h - 19h

  return (
    <View style={[styles.timeline, { borderColor: theme.colors.outline }]}>
      {HOURS.map((h) => {
        const slotStart = new Date(dayStart);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(dayStart);
        slotEnd.setHours(h + 1, 0, 0, 0);
        const inSlot = sorted.filter((e) => {
          try {
            const s = parseISO(e.startDate);
            return isWithinInterval(s, { start: slotStart, end: slotEnd });
          } catch {
            return false;
          }
        });
        return (
          <View key={h} style={[styles.timelineRow, { borderColor: theme.colors.outline }]}>
            <View style={styles.timelineHourCol}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {h.toString().padStart(2, '0')}:00
              </Text>
            </View>
            <View style={styles.timelineContent}>
              {inSlot.map((e, idx) => {
                const cat = CATEGORY_BY_ID[e.category];
                const conflicts = detectConflicts(e);
                return (
                  <Pressable
                    key={e.id}
                    testID={`timeline-event-${e.id}`}
                    onPress={() => onPressEvent(e.id)}
                    style={[
                      styles.timelineEvent,
                      { backgroundColor: cat.color + '22', borderLeftColor: cat.color },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: cat.color }} numberOfLines={1}>
                      {cat.emoji} {e.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                      {fmtTime(e.startDate)} – {fmtTime(e.endDate)}
                      {conflicts.length > 0 ? '  ⚠️ Conflit' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontWeight: '800', letterSpacing: -0.5, textTransform: 'capitalize' },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  switcher: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  switcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  navBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGrid: {
    marginBottom: 16,
  },
  dowRow: {
    flexDirection: 'row',
    paddingBottom: 6,
  },
  dowCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  monthCells: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  monthDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    height: 6,
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  weekBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 22,
    alignItems: 'center',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  timeline: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
    borderBottomWidth: 1,
  },
  timelineHourCol: {
    width: 60,
    paddingTop: 8,
    paddingLeft: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB22',
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  timelineEvent: {
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
