import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text, useTheme, Surface, Button, Menu, Divider } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '../../src/store/eventStore';
import {
  CATEGORY_BY_ID,
  PRIORITY_BY_ID,
  STATUSES,
  STATUS_BY_ID,
} from '../../src/constants/categories';
import { fmtDateLong, fmtTime } from '../../src/utils/dateUtils';
import { StatusId } from '../../src/types';
import { EventCard } from '../../src/components/EventCard';

export default function EventDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const events = useEventStore((s) => s.events);
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const changeStatus = useEventStore((s) => s.changeStatus);
  const detectConflicts = useEventStore((s) => s.detectConflicts);

  const event = useMemo(() => events.find((e) => e.id === id), [events, id]);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (!event) {
    return (
      <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable
            testID="detail-back"
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.onSurface} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <MaterialCommunityIcons
            name="calendar-remove"
            size={56}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="titleMedium" style={{ marginTop: 12, color: theme.colors.onSurface }}>
            Événement introuvable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cat = CATEGORY_BY_ID[event.category];
  const pri = PRIORITY_BY_ID[event.priority];
  const stat = STATUS_BY_ID[event.status];
  const conflicts = detectConflicts(event);

  function confirmDelete() {
    Alert.alert('Supprimer cet événement ?', event!.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(event!.id);
          router.back();
        },
      },
    ]);
  }

  async function handleChangeStatus(s: StatusId) {
    setStatusMenuOpen(false);
    await changeStatus(event!.id, s);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          testID="detail-back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            testID="detail-edit"
            onPress={() => router.push(`/event/new?id=${event.id}`)}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.onSurface} />
          </Pressable>
          <Pressable
            testID="detail-delete"
            onPress={confirmDelete}
            style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeIn}>
          <Surface
            elevation={1}
            style={[styles.hero, { backgroundColor: cat.color + '15', borderColor: cat.color }]}
          >
            <View style={styles.heroTop}>
              <Text style={styles.heroEmoji}>{cat.emoji}</Text>
              <View style={[styles.priorityDot, { backgroundColor: pri.color }]} />
              <Text variant="labelMedium" style={{ color: cat.color, fontWeight: '700', marginLeft: 4 }}>
                {cat.label.toUpperCase()}
              </Text>
            </View>
            <Text
              variant="headlineSmall"
              style={[
                styles.heroTitle,
                { color: theme.colors.onSurface },
                event.status === 'annule' && styles.strikethrough,
              ]}
            >
              {event.title}
            </Text>
            {event.description ? (
              <Text variant="bodyMedium" style={[styles.heroDesc, { color: theme.colors.onSurfaceVariant }]}>
                {event.description}
              </Text>
            ) : null}
          </Surface>
        </Animated.View>

        {/* Status menu */}
        <Animated.View entering={FadeInDown.delay(60)}>
          <Menu
            visible={statusMenuOpen}
            onDismiss={() => setStatusMenuOpen(false)}
            anchor={
              <Pressable
                testID="detail-status"
                onPress={() => setStatusMenuOpen(true)}
                style={[styles.statusBig, { backgroundColor: stat.bg }]}
              >
                <MaterialCommunityIcons name="radiobox-marked" size={16} color={stat.color} />
                <Text variant="titleSmall" style={{ color: stat.color, marginLeft: 6, fontWeight: '700' }}>
                  Statut : {stat.label}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={18}
                  color={stat.color}
                  style={{ marginLeft: 'auto' }}
                />
              </Pressable>
            }
          >
            {STATUSES.map((s) => (
              <Menu.Item
                key={s.id}
                onPress={() => handleChangeStatus(s.id)}
                title={s.label}
                leadingIcon={() => (
                  <View style={[styles.statusDot, { backgroundColor: s.bg }]} />
                )}
              />
            ))}
          </Menu>
        </Animated.View>

        {conflicts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100)}>
            <Surface
              elevation={1}
              style={[styles.conflictBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            >
              <MaterialCommunityIcons name="alert-octagon" size={20} color="#B91C1C" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text variant="titleSmall" style={{ color: '#991B1B', fontWeight: '800' }}>
                  Conflit horaire détecté
                </Text>
                <Text variant="bodySmall" style={{ color: '#991B1B' }}>
                  {conflicts.length} autre(s) événement(s) au même créneau.
                </Text>
              </View>
            </Surface>
          </Animated.View>
        )}

        {/* Info rows */}
        <Animated.View entering={FadeInDown.delay(140)}>
          <DetailRow
            icon="calendar-start"
            label="Début"
            value={`${fmtDateLong(event.startDate)}${event.allDay ? '' : ` · ${fmtTime(event.startDate)}`}`}
          />
          <DetailRow
            icon="calendar-end"
            label="Fin"
            value={`${fmtDateLong(event.endDate)}${event.allDay ? '' : ` · ${fmtTime(event.endDate)}`}`}
          />
          {event.allDay && <DetailRow icon="weather-sunny" label="Durée" value="Toute la journée" />}
          {event.location ? <DetailRow icon="map-marker-outline" label="Lieu" value={event.location} /> : null}
          <DetailRow icon={pri.icon as any} label="Priorité" value={pri.label} valueColor={pri.color} />
          {event.recurrence !== 'aucune' && (
            <DetailRow icon="repeat" label="Récurrence" value={event.recurrence} />
          )}
          {event.classGroup ? (
            <DetailRow icon="school" label="Classe" value={event.classGroup} />
          ) : null}
          {event.participants ? (
            <DetailRow icon="account-multiple" label="Participants" value={event.participants} />
          ) : null}
        </Animated.View>

        {/* Reminders + Alarm */}
        {(event.reminders.length > 0 || event.alarmEnabled) && (
          <Animated.View entering={FadeInDown.delay(180)} style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="bell-outline" size={16} color={theme.colors.primary} />
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '700' }}
              >
                RAPPELS & ALARME
              </Text>
            </View>
            {event.alarmEnabled && (
              <View style={[styles.reminderItem, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="alarm" size={18} color="#92400E" />
                <Text variant="bodyMedium" style={{ color: '#92400E', marginLeft: 8, fontWeight: '700' }}>
                  Alarme sonore à l&apos;heure exacte
                </Text>
              </View>
            )}
            {event.reminders.map((r) => (
              <View
                key={r.id}
                style={[styles.reminderItem, { backgroundColor: theme.colors.primaryContainer }]}
              >
                <MaterialCommunityIcons name="bell" size={18} color={theme.colors.onPrimaryContainer} />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onPrimaryContainer, marginLeft: 8, fontWeight: '600' }}
                >
                  {r.minutesBefore === 0
                    ? "À l'heure exacte"
                    : `${humanizeMinutes(r.minutesBefore)} avant`}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Notes */}
        {event.notes ? (
          <Animated.View entering={FadeInDown.delay(220)} style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.primary} />
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '700' }}
              >
                NOTES
              </Text>
            </View>
            <Surface
              elevation={1}
              style={[styles.notesBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
            >
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 20 }}>
                {event.notes}
              </Text>
            </Surface>
          </Animated.View>
        ) : null}

        {/* Conflicts list */}
        {conflicts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(260)} style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="alert" size={16} color="#DC2626" />
              <Text variant="labelLarge" style={{ color: '#DC2626', marginLeft: 6, fontWeight: '700' }}>
                ÉVÉNEMENTS EN CONFLIT
              </Text>
            </View>
            {conflicts.map((c, i) => (
              <EventCard
                key={c.id}
                event={c}
                index={i}
                onPress={() => router.push(`/event/${c.id}`)}
              />
            ))}
          </Animated.View>
        )}

        <Divider style={{ marginVertical: 24 }} />

        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => router.push(`/event/new?id=${event.id}`)}
          testID="detail-modify"
          style={{ borderRadius: 12 }}
          contentStyle={{ height: 48 }}
        >
          Modifier l&apos;événement
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}> = ({ icon, label, value, valueColor }) => {
  const theme = useTheme();
  return (
    <View style={[styles.detailRow, { borderColor: theme.colors.outline }]}>
      <View style={[styles.detailIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.4 }}>
          {label.toUpperCase()}
        </Text>
        <Text variant="bodyMedium" style={{ color: valueColor ?? theme.colors.onSurface, fontWeight: '600' }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

function humanizeMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  if (m < 1440) return `${Math.floor(m / 60)} h`;
  return `${Math.floor(m / 1440)} j`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 4,
    borderWidth: 0,
    marginTop: 8,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroEmoji: { fontSize: 22 },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  heroTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  strikethrough: { textDecorationLine: 'line-through' },
  heroDesc: { marginTop: 6, lineHeight: 20 },
  statusBig: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  section: {
    marginTop: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  notesBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
});
