import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SchoolEvent } from '../types';
import { CATEGORY_BY_ID, PRIORITY_BY_ID, STATUS_BY_ID } from '../constants/categories';
import { fmtTime, fmtDateShort } from '../utils/dateUtils';

interface Props {
  event: SchoolEvent;
  hasConflict?: boolean;
  onPress?: () => void;
  index?: number;
  showDate?: boolean;
}

export const EventCard: React.FC<Props> = ({
  event,
  hasConflict,
  onPress,
  index = 0,
  showDate = false,
}) => {
  const theme = useTheme();
  const cat = CATEGORY_BY_ID[event.category];
  const pri = PRIORITY_BY_ID[event.priority];
  const status = STATUS_BY_ID[event.status];

  const isCancelled = event.status === 'annule';
  const isDone = event.status === 'termine';
  const opacity = isDone ? 0.55 : 1;

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify().damping(15)}>
      <Pressable
        testID={`event-card-${event.id}`}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Événement ${event.title}`}
      >
        <Surface
          elevation={1}
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, opacity },
          ]}
        >
          <View style={[styles.colorBar, { backgroundColor: cat.color }]} />
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <View style={[styles.priorityDot, { backgroundColor: pri.color }]} />
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={[
                  styles.title,
                  { color: theme.colors.onSurface },
                  isCancelled && styles.strikethrough,
                ]}
              >
                {event.title}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodySmall" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                {showDate ? `${fmtDateShort(event.startDate)} · ` : ''}
                {fmtTime(event.startDate)} – {fmtTime(event.endDate)}
              </Text>
              {event.location ? (
                <>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.metaIcon}
                  />
                  <Text
                    variant="bodySmall"
                    numberOfLines={1}
                    style={[styles.meta, { color: theme.colors.onSurfaceVariant, flexShrink: 1 }]}
                  >
                    {event.location}
                  </Text>
                </>
              ) : null}
            </View>

            <View style={styles.badgeRow}>
              {event.classGroup ? (
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="school"
                    size={12}
                    color={theme.colors.onPrimaryContainer}
                  />
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onPrimaryContainer, marginLeft: 4 }}
                  >
                    {event.classGroup}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
                <Text variant="labelSmall" style={{ color: status.color, fontWeight: '600' }}>
                  {status.label}
                </Text>
              </View>

              {hasConflict ? (
                <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="alert" size={12} color="#B91C1C" />
                  <Text variant="labelSmall" style={{ color: '#B91C1C', marginLeft: 4 }}>
                    Conflit
                  </Text>
                </View>
              ) : null}

              {event.alarmEnabled ? (
                <View style={styles.iconBadge}>
                  <MaterialCommunityIcons name="bell-ring" size={14} color="#F59E0B" />
                </View>
              ) : null}

              {event.recurrence !== 'aucune' ? (
                <View style={styles.iconBadge}>
                  <MaterialCommunityIcons name="repeat" size={14} color={theme.colors.primary} />
                </View>
              ) : null}

              {event.reminders.length > 0 ? (
                <View style={styles.iconBadge}>
                  <MaterialCommunityIcons name="bell-outline" size={14} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 2 }}>
                    {event.reminders.length}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Surface>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meta: {
    marginLeft: 4,
  },
  metaIcon: {
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  iconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});
