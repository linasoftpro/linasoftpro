import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { Text, useTheme, Surface, TextInput, Button, Divider } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '../../src/store/eventStore';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  PRIORITIES,
  RECURRENCES,
  STATUSES,
  REMINDER_PRESETS,
  CLASS_PRESETS,
} from '../../src/constants/categories';
import {
  CategoryId,
  PriorityId,
  StatusId,
  RecurrenceId,
  Reminder,
} from '../../src/types';
import { fmtDateLong, fmtTime } from '../../src/utils/dateUtils';

interface PickerState {
  visible: boolean;
  field: 'startDate' | 'endDate' | null;
}

export default function EventFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const editId = params.id;

  const events = useEventStore((s) => s.events);
  const addEvent = useEventStore((s) => s.addEvent);
  const updateEvent = useEventStore((s) => s.updateEvent);

  const existing = useMemo(() => events.find((e) => e.id === editId), [events, editId]);

  // Default times: today 14:00 - 15:00 (or based on params.date if provided)
  const baseDate = params.date ? new Date(params.date as string) : new Date();
  const defaultStart = new Date(baseDate);
  defaultStart.setHours(14, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(15, 0, 0, 0);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<CategoryId>(existing?.category ?? 'autre');
  const [startDate, setStartDate] = useState<Date>(
    existing ? new Date(existing.startDate) : defaultStart
  );
  const [endDate, setEndDate] = useState<Date>(
    existing ? new Date(existing.endDate) : defaultEnd
  );
  const [allDay, setAllDay] = useState(existing?.allDay ?? false);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [priority, setPriority] = useState<PriorityId>(existing?.priority ?? 'normale');
  const [status, setStatus] = useState<StatusId>(existing?.status ?? 'prevu');
  const [recurrence, setRecurrence] = useState<RecurrenceId>(existing?.recurrence ?? 'aucune');
  const [reminders, setReminders] = useState<Reminder[]>(existing?.reminders ?? []);
  const [alarmEnabled, setAlarmEnabled] = useState(existing?.alarmEnabled ?? false);
  const [classGroup, setClassGroup] = useState(existing?.classGroup ?? '');
  const [participants, setParticipants] = useState(existing?.participants ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const [picker, setPicker] = useState<PickerState>({ visible: false, field: null });
  const [showRemindersPicker, setShowRemindersPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Ensure end >= start
    if (endDate.getTime() <= startDate.getTime()) {
      const newEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
      setEndDate(newEnd);
    }
  }, [startDate, endDate]);

  const cat = CATEGORY_BY_ID[category];

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Veuillez saisir un titre pour cet événement.');
      return;
    }
    if (endDate.getTime() < startDate.getTime()) {
      Alert.alert(
        'Dates incohérentes',
        "La date de fin doit être postérieure ou égale à la date de début."
      );
      return;
    }
    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      allDay,
      location: location.trim(),
      priority,
      status,
      recurrence,
      reminders,
      alarmEnabled,
      notes: notes.trim(),
      participants: participants.trim(),
      classGroup: classGroup.trim(),
    };
    try {
      if (editId && existing) {
        await updateEvent(editId, payload);
      } else {
        await addEvent(payload);
      }
      router.back();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer l'événement.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleReminder(minutes: number) {
    const exists = reminders.find((r) => r.minutesBefore === minutes);
    if (exists) {
      setReminders((rs) => rs.filter((r) => r.minutesBefore !== minutes));
    } else {
      setReminders((rs) => [
        ...rs,
        { id: `${Date.now()}_${minutes}`, minutesBefore: minutes },
      ]);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          testID="event-form-close"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {editId ? 'Modifier' : 'Nouvel événement'}
        </Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <TextInput
            testID="form-title"
            mode="outlined"
            label="Titre *"
            value={title}
            onChangeText={setTitle}
            left={<TextInput.Icon icon="format-title" />}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          {/* Description */}
          <TextInput
            testID="form-description"
            mode="outlined"
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
            left={<TextInput.Icon icon="text-box-outline" />}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          {/* Category */}
          <SectionHeader icon="shape-outline" label="Catégorie" />
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <Pressable
                  key={c.id}
                  testID={`form-cat-${c.id}`}
                  onPress={() => setCategory(c.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? c.color : `${c.color}15`,
                      borderColor: c.color,
                    },
                  ]}
                >
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: active ? '#FFFFFF' : c.color,
                      marginLeft: 4,
                      fontWeight: '700',
                    }}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dates */}
          <SectionHeader icon="calendar-clock" label="Date & heure" />
          <View style={styles.dateRow}>
            <Pressable
              testID="form-start"
              onPress={() => setPicker({ visible: true, field: 'startDate' })}
              style={[styles.dateBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
            >
              <MaterialCommunityIcons name="calendar-start" size={18} color={theme.colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  DÉBUT
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  {fmtDateLong(startDate)}
                </Text>
                {!allDay && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {fmtTime(startDate)}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
          <View style={styles.dateRow}>
            <Pressable
              testID="form-end"
              onPress={() => setPicker({ visible: true, field: 'endDate' })}
              style={[styles.dateBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
            >
              <MaterialCommunityIcons name="calendar-end" size={18} color={theme.colors.primary} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  FIN
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                  {fmtDateLong(endDate)}
                </Text>
                {!allDay && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {fmtTime(endDate)}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <MaterialCommunityIcons name="weather-sunny" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 10, flex: 1 }}>
              Toute la journée
            </Text>
            <Switch testID="form-allday" value={allDay} onValueChange={setAllDay} />
          </View>

          {/* Location */}
          <TextInput
            testID="form-location"
            mode="outlined"
            label="Lieu"
            value={location}
            onChangeText={setLocation}
            left={<TextInput.Icon icon="map-marker-outline" />}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          {/* Priority */}
          <SectionHeader icon="flag-outline" label="Priorité" />
          <View style={styles.row}>
            {PRIORITIES.map((p) => {
              const active = p.id === priority;
              return (
                <Pressable
                  key={p.id}
                  testID={`form-prio-${p.id}`}
                  onPress={() => setPriority(p.id)}
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

          {/* Status */}
          <SectionHeader icon="radiobox-marked" label="Statut" />
          <View style={styles.row}>
            {STATUSES.map((s) => {
              const active = s.id === status;
              return (
                <Pressable
                  key={s.id}
                  testID={`form-status-${s.id}`}
                  onPress={() => setStatus(s.id)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: active ? s.bg : 'transparent',
                      borderColor: s.bg,
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: active ? s.color : theme.colors.onSurface,
                      fontWeight: '700',
                    }}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Recurrence */}
          <SectionHeader icon="repeat" label="Récurrence" />
          <View style={styles.row}>
            {RECURRENCES.map((r) => {
              const active = r.id === recurrence;
              return (
                <Pressable
                  key={r.id}
                  testID={`form-rec-${r.id}`}
                  onPress={() => setRecurrence(r.id)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: active ? theme.colors.primary : 'transparent',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: active ? theme.colors.onPrimary : theme.colors.primary,
                      fontWeight: '700',
                    }}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Reminders */}
          <SectionHeader icon="bell-plus-outline" label="Rappels" />
          <Pressable
            testID="form-add-reminder"
            onPress={() => setShowRemindersPicker(true)}
            style={[styles.dateBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={18} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 10, flex: 1, fontWeight: '600' }}>
              {reminders.length === 0 ? 'Aucun rappel' : `${reminders.length} rappel(s)`}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
          {reminders.length > 0 && (
            <View style={styles.remindersList}>
              {reminders.map((r) => (
                <View
                  key={r.id}
                  style={[styles.reminderPill, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <MaterialCommunityIcons name="bell" size={12} color={theme.colors.onPrimaryContainer} />
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onPrimaryContainer, marginLeft: 4, fontWeight: '700' }}
                  >
                    {humanizeMinutes(r.minutesBefore)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Alarm */}
          <View style={styles.switchRow}>
            <MaterialCommunityIcons name="alarm" size={18} color="#F59E0B" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                Alarme sonore
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Notification audible à l&apos;heure exacte
              </Text>
            </View>
            <Switch
              testID="form-alarm"
              value={alarmEnabled}
              onValueChange={setAlarmEnabled}
            />
          </View>

          {/* Class group */}
          <SectionHeader icon="school" label="Classe concernée" />
          <View style={styles.row}>
            <Pressable
              testID="form-class-none"
              onPress={() => setClassGroup('')}
              style={[
                styles.statusChip,
                {
                  backgroundColor: classGroup === '' ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: classGroup === '' ? theme.colors.onPrimary : theme.colors.primary,
                  fontWeight: '700',
                }}
              >
                Aucune
              </Text>
            </Pressable>
            {CLASS_PRESETS.map((c) => {
              const active = c === classGroup;
              return (
                <Pressable
                  key={c}
                  testID={`form-class-${c}`}
                  onPress={() => setClassGroup(c)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: active ? theme.colors.primary : 'transparent',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: active ? theme.colors.onPrimary : theme.colors.primary,
                      fontWeight: '700',
                    }}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Participants */}
          <TextInput
            testID="form-participants"
            mode="outlined"
            label="Participants"
            value={participants}
            onChangeText={setParticipants}
            left={<TextInput.Icon icon="account-multiple-plus-outline" />}
            placeholder="Ex: Mme Dupont, M. Martin..."
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          {/* Notes */}
          <TextInput
            testID="form-notes"
            mode="outlined"
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            left={<TextInput.Icon icon="pencil-outline" />}
            style={[styles.input, { minHeight: 96 }]}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          {/* Save */}
          <Button
            testID="form-save"
            mode="contained"
            onPress={handleSave}
            disabled={submitting || !title.trim()}
            loading={submitting}
            style={[styles.saveBtn, { backgroundColor: cat.color }]}
            contentStyle={{ height: 52 }}
            labelStyle={{ fontWeight: '800', fontSize: 16 }}
            icon="check-bold"
          >
            {editId ? 'Enregistrer les modifications' : "Créer l'événement"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date/Time Picker Modal */}
      <DateTimePickerModal
        visible={picker.visible}
        date={picker.field === 'endDate' ? endDate : startDate}
        onClose={() => setPicker({ visible: false, field: null })}
        onConfirm={(d) => {
          if (picker.field === 'startDate') setStartDate(d);
          else if (picker.field === 'endDate') setEndDate(d);
          setPicker({ visible: false, field: null });
        }}
        title={picker.field === 'startDate' ? 'Début' : 'Fin'}
        showTime={!allDay}
      />

      {/* Reminders modal */}
      <Modal
        visible={showRemindersPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRemindersPicker(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowRemindersPicker(false)} />
        <Surface
          elevation={4}
          style={[styles.modalSheet, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}
        >
          <View style={styles.modalHandle}>
            <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
          </View>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Choisir des rappels
          </Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {REMINDER_PRESETS.map((preset) => {
              const active = reminders.some((r) => r.minutesBefore === preset.minutes);
              return (
                <Pressable
                  key={preset.minutes}
                  testID={`reminder-${preset.minutes}`}
                  onPress={() => toggleReminder(preset.minutes)}
                  style={[styles.reminderRow, { borderColor: theme.colors.outline }]}
                >
                  <MaterialCommunityIcons
                    name={active ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={active ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 12 }}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Button
            mode="contained"
            onPress={() => setShowRemindersPicker(false)}
            style={{ marginTop: 12 }}
          >
            OK
          </Button>
        </Surface>
      </Modal>
    </SafeAreaView>
  );
}

// ───────────────────── Picker Modal (custom date+time) ─────────────────────

interface DTProps {
  visible: boolean;
  date: Date;
  onConfirm: (d: Date) => void;
  onClose: () => void;
  title: string;
  showTime: boolean;
}

const DateTimePickerModal: React.FC<DTProps> = ({ visible, date, onConfirm, onClose, title, showTime }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Date>(date);

  useEffect(() => {
    if (visible) setDraft(new Date(date));
  }, [visible, date]);

  function shiftDay(delta: number) {
    setDraft((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + delta);
      return nd;
    });
  }
  function setHour(h: number) {
    setDraft((d) => {
      const nd = new Date(d);
      nd.setHours(h);
      return nd;
    });
  }
  function setMinute(m: number) {
    setDraft((d) => {
      const nd = new Date(d);
      nd.setMinutes(m);
      return nd;
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <Surface
        elevation={4}
        style={[styles.modalSheet, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.modalHandle}>
          <View style={[styles.handle, { backgroundColor: theme.colors.outline }]} />
        </View>
        <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text variant="bodyLarge" style={[styles.previewDate, { color: theme.colors.primary }]}>
          {fmtDateLong(draft)} {showTime ? `· ${fmtTime(draft)}` : ''}
        </Text>

        {/* Date controls */}
        <View style={styles.dtControls}>
          <Pressable onPress={() => shiftDay(-7)} style={[styles.shiftBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>-7j</Text>
          </Pressable>
          <Pressable onPress={() => shiftDay(-1)} style={[styles.shiftBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>-1j</Text>
          </Pressable>
          <Pressable onPress={() => shiftDay(1)} style={[styles.shiftBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>+1j</Text>
          </Pressable>
          <Pressable onPress={() => shiftDay(7)} style={[styles.shiftBtn, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>+7j</Text>
          </Pressable>
        </View>

        {showTime && (
          <>
            <Divider style={{ marginVertical: 12 }} />
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>
              Heure
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {Array.from({ length: 24 }, (_, h) => h).map((h) => {
                const active = h === draft.getHours();
                return (
                  <Pressable
                    key={h}
                    onPress={() => setHour(h)}
                    style={[
                      styles.hourBtn,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                        fontWeight: '700',
                      }}
                    >
                      {h.toString().padStart(2, '0')}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12, marginBottom: 6 }}>
              Minute
            </Text>
            <View style={styles.minuteRow}>
              {[0, 15, 30, 45].map((m) => {
                const active = m === draft.getMinutes();
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMinute(m)}
                    style={[
                      styles.minuteBtn,
                      {
                        backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                        fontWeight: '700',
                      }}
                    >
                      :{m.toString().padStart(2, '0')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.modalActions}>
          <Button mode="text" onPress={onClose}>Annuler</Button>
          <Button mode="contained" onPress={() => onConfirm(draft)} icon="check">
            Valider
          </Button>
        </View>
      </Surface>
    </Modal>
  );
};

const SectionHeader: React.FC<{ icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }> = ({
  icon,
  label,
}) => {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primary} />
      <Text
        variant="labelLarge"
        style={{ color: theme.colors.primary, marginLeft: 6, fontWeight: '700', letterSpacing: 0.4 }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

function humanizeMinutes(m: number): string {
  if (m === 0) return "À l'heure";
  if (m < 60) return `${m} min avant`;
  if (m < 1440) {
    const h = Math.floor(m / 60);
    return `${h}h avant`;
  }
  const d = Math.floor(m / 1440);
  return `${d}j avant`;
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
  iconBtnPlaceholder: { width: 40, height: 40 },
  headerTitle: { fontWeight: '800' },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  catEmoji: { fontSize: 13 },
  dateRow: {
    marginBottom: 8,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  remindersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  reminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  saveBtn: {
    marginTop: 24,
    borderRadius: 14,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: { alignItems: 'center', marginBottom: 8 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalTitle: { fontWeight: '800', marginBottom: 12 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  previewDate: {
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: '700',
  },
  dtControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  shiftBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  hourBtn: {
    width: 50,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minuteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
});
