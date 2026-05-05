import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchoolEvent, Reminder } from '../types';
import {
  scheduleReminder,
  scheduleAlarm,
  cancelEventNotifications,
  ensurePermissions,
  ensureChannels,
} from '../utils/notifications';
import { areIntervalsOverlapping } from 'date-fns';

const STORAGE_KEY = '@maitragenda/events/v1';

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface EventState {
  events: SchoolEvent[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addEvent: (
    payload: Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<SchoolEvent>;
  updateEvent: (
    id: string,
    payload: Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<SchoolEvent | undefined>;
  deleteEvent: (id: string) => Promise<void>;
  changeStatus: (id: string, status: SchoolEvent['status']) => Promise<void>;
  detectConflicts: (event: SchoolEvent) => SchoolEvent[];
}

async function persist(events: SchoolEvent[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* ignore */
  }
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const events: SchoolEvent[] = raw ? JSON.parse(raw) : [];
      set({ events, isLoaded: true });
    } catch {
      set({ events: [], isLoaded: true });
    }
  },

  addEvent: async (payload) => {
    await ensurePermissions();
    await ensureChannels();
    const now = new Date().toISOString();
    const id = uid();

    // Schedule reminders
    const remindersWithIds: Reminder[] = [];
    for (const r of payload.reminders) {
      const tmpEvent = { ...payload, id, createdAt: now, updatedAt: now } as SchoolEvent;
      const notifId = await scheduleReminder(tmpEvent, r);
      remindersWithIds.push({ ...r, notificationId: notifId });
    }

    // Schedule alarm
    let alarmNotificationId: string | undefined;
    if (payload.alarmEnabled) {
      const tmpEvent = { ...payload, id, createdAt: now, updatedAt: now } as SchoolEvent;
      alarmNotificationId = await scheduleAlarm(tmpEvent);
    }

    const event: SchoolEvent = {
      ...payload,
      id,
      createdAt: now,
      updatedAt: now,
      reminders: remindersWithIds,
      alarmNotificationId,
    };
    const next = [...get().events, event];
    set({ events: next });
    await persist(next);
    return event;
  },

  updateEvent: async (id, payload) => {
    const existing = get().events.find((e) => e.id === id);
    if (!existing) return undefined;
    await cancelEventNotifications(existing);
    await ensurePermissions();
    await ensureChannels();

    const now = new Date().toISOString();
    const remindersWithIds: Reminder[] = [];
    for (const r of payload.reminders) {
      const tmp = { ...payload, id, createdAt: existing.createdAt, updatedAt: now } as SchoolEvent;
      const notifId = await scheduleReminder(tmp, r);
      remindersWithIds.push({ ...r, notificationId: notifId });
    }
    let alarmNotificationId: string | undefined;
    if (payload.alarmEnabled) {
      const tmp = { ...payload, id, createdAt: existing.createdAt, updatedAt: now } as SchoolEvent;
      alarmNotificationId = await scheduleAlarm(tmp);
    }

    const updated: SchoolEvent = {
      ...payload,
      id,
      createdAt: existing.createdAt,
      updatedAt: now,
      reminders: remindersWithIds,
      alarmNotificationId,
    };
    const next = get().events.map((e) => (e.id === id ? updated : e));
    set({ events: next });
    await persist(next);
    return updated;
  },

  deleteEvent: async (id) => {
    const existing = get().events.find((e) => e.id === id);
    if (existing) await cancelEventNotifications(existing);
    const next = get().events.filter((e) => e.id !== id);
    set({ events: next });
    await persist(next);
  },

  changeStatus: async (id, status) => {
    const next = get().events.map((e) =>
      e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e
    );
    set({ events: next });
    await persist(next);
  },

  detectConflicts: (event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return get().events.filter((e) => {
      if (e.id === event.id) return false;
      if (e.status === 'annule') return false;
      const s = new Date(e.startDate);
      const en = new Date(e.endDate);
      try {
        return areIntervalsOverlapping(
          { start, end: end > start ? end : new Date(start.getTime() + 1) },
          { start: s, end: en > s ? en : new Date(s.getTime() + 1) }
        );
      } catch {
        return false;
      }
    });
  },
}));
