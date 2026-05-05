import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Surface, TextInput, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { useTaskStore } from '../../src/store/taskStore';
import { TaskItem } from '../../src/components/TaskItem';
import { EmptyState } from '../../src/components/EmptyState';
import { PRIORITIES } from '../../src/constants/categories';
import { PriorityId, Task } from '../../src/types';

type FilterMode = 'all' | 'pending' | 'done';

export default function TasksScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPriority, setDraftPriority] = useState<PriorityId>('normale');

  const filtered = useMemo(() => {
    let arr = [...tasks];
    if (filter === 'pending') arr = arr.filter((t) => !t.done);
    if (filter === 'done') arr = arr.filter((t) => t.done);
    return arr.sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt.localeCompare(a.createdAt));
  }, [tasks, filter]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.done).length,
      done: tasks.filter((t) => t.done).length,
    }),
    [tasks]
  );

  function openCreate() {
    setEditingTask(null);
    setDraftTitle('');
    setDraftPriority('normale');
    setModalVisible(true);
  }

  function openEdit(t: Task) {
    setEditingTask(t);
    setDraftTitle(t.title);
    setDraftPriority(t.priority);
    setModalVisible(true);
  }

  async function saveTask() {
    const title = draftTitle.trim();
    if (!title) return;
    if (editingTask) {
      await updateTask(editingTask.id, { title, priority: draftPriority });
    } else {
      await addTask({ title, priority: draftPriority, done: false });
    }
    setModalVisible(false);
  }

  function confirmDelete(t: Task) {
    Alert.alert('Supprimer cette tâche ?', t.title, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteTask(t.id) },
    ]);
  }

  const Filters: { id: FilterMode; label: string; icon: string }[] = [
    { id: 'all', label: 'Toutes', icon: 'view-list' },
    { id: 'pending', label: 'À faire', icon: 'circle-outline' },
    { id: 'done', label: 'Terminées', icon: 'check-circle' },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>
            TÂCHES
          </Text>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            Mes tâches
          </Text>
        </View>
        <Pressable
          testID="task-add"
          onPress={openCreate}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.colors.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <MaterialCommunityIcons name="plus" size={22} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {Filters.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id];
          return (
            <Pressable
              key={f.id}
              testID={`filter-${f.id}`}
              onPress={() => setFilter(f.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
                  borderColor: active ? theme.colors.primary : theme.colors.outline,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={f.icon as any}
                size={14}
                color={active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
              />
              <Text
                variant="labelMedium"
                style={{
                  color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                  marginLeft: 6,
                  fontWeight: '700',
                }}
              >
                {f.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View layout={Layout.springify()} entering={FadeIn}>
          {filtered.length === 0 ? (
            <EmptyState
              testID="tasks-empty"
              icon="checkbox-marked-circle-plus-outline"
              title={filter === 'done' ? 'Aucune tâche terminée' : 'Aucune tâche à afficher'}
              subtitle="Ajoutez des tâches pour mieux organiser vos journées."
            />
          ) : (
            filtered.map((t, idx) => (
              <TaskItem
                key={t.id}
                task={t}
                index={idx}
                onToggle={() => toggleTask(t.id)}
                onPress={() => openEdit(t)}
                onLongPress={() => confirmDelete(t)}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <Surface
            elevation={4}
            style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.modalHandle}>
              <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
            </View>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </Text>
            <TextInput
              testID="task-title"
              mode="outlined"
              label="Titre"
              value={draftTitle}
              onChangeText={setDraftTitle}
              left={<TextInput.Icon icon="format-title" />}
              autoFocus
            />
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 16, marginBottom: 8 }}
            >
              Priorité
            </Text>
            <View style={styles.prioRow}>
              {PRIORITIES.map((p) => {
                const active = p.id === draftPriority;
                return (
                  <Pressable
                    key={p.id}
                    testID={`task-priority-${p.id}`}
                    onPress={() => setDraftPriority(p.id)}
                    style={[
                      styles.prioChip,
                      {
                        backgroundColor: active ? p.color : `${p.color}22`,
                        borderColor: p.color,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={p.icon as any} size={14} color={active ? '#FFF' : p.color} />
                    <Text
                      variant="labelMedium"
                      style={{ color: active ? '#FFF' : p.color, marginLeft: 4, fontWeight: '700' }}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <Button mode="text" onPress={() => setModalVisible(false)} testID="task-cancel">
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={saveTask}
                disabled={!draftTitle.trim()}
                testID="task-save"
                icon="check"
              >
                {editingTask ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </View>
          </Surface>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

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
  title: { fontWeight: '800', letterSpacing: -0.5 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHandle: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontWeight: '800',
    marginBottom: 16,
  },
  prioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 8,
  },
});
