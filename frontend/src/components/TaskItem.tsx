import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Task } from '../types';
import { PRIORITY_BY_ID } from '../constants/categories';
import { fmtDateShort } from '../utils/dateUtils';

interface Props {
  task: Task;
  index?: number;
  onToggle: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TaskItem: React.FC<Props> = ({ task, index = 0, onToggle, onPress, onLongPress }) => {
  const theme = useTheme();
  const pri = PRIORITY_BY_ID[task.priority];

  return (
    <Animated.View entering={FadeInUp.delay(index * 40).springify().damping(15)}>
      <Surface
        elevation={1}
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        ]}
      >
        <Pressable
          testID={`task-toggle-${task.id}`}
          onPress={onToggle}
          hitSlop={8}
          style={styles.checkbox}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
        >
          <MaterialCommunityIcons
            name={task.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
            size={26}
            color={task.done ? '#22C55E' : theme.colors.onSurfaceVariant}
          />
        </Pressable>
        <Pressable style={styles.body} onPress={onPress} onLongPress={onLongPress}>
          <View style={styles.titleRow}>
            <View style={[styles.priorityDot, { backgroundColor: pri.color }]} />
            <Text
              variant="titleSmall"
              numberOfLines={2}
              style={[
                styles.title,
                {
                  color: theme.colors.onSurface,
                  textDecorationLine: task.done ? 'line-through' : 'none',
                  opacity: task.done ? 0.55 : 1,
                },
              ]}
            >
              {task.title}
            </Text>
          </View>
          {task.dueDate ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="calendar" size={12} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                {fmtDateShort(task.dueDate)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  checkbox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginLeft: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 14,
  },
});
