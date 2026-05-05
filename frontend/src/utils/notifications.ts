import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SchoolEvent, Reminder } from '../types';
import { CATEGORY_BY_ID } from '../constants/categories';

// Configure default behavior - alerts shown while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelsConfigured = false;

export async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android' || channelsConfigured) return;
  try {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Rappels',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarmes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
      sound: 'default',
      bypassDnd: true,
    });
    channelsConfigured = true;
  } catch (e) {
    // Web/Expo Go limitations
  }
}

export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) {
    return false;
  }
}

export async function cancelNotification(id?: string): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // ignore
  }
}

export async function cancelEventNotifications(event: SchoolEvent): Promise<void> {
  if (event.alarmNotificationId) {
    await cancelNotification(event.alarmNotificationId);
  }
  for (const r of event.reminders) {
    await cancelNotification(r.notificationId);
  }
}

export async function scheduleReminder(
  event: SchoolEvent,
  reminder: Reminder
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  const startMs = new Date(event.startDate).getTime();
  const triggerMs = startMs - reminder.minutesBefore * 60_000;
  if (triggerMs <= Date.now()) return undefined;
  try {
    const cat = CATEGORY_BY_ID[event.category];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${cat.emoji} ${event.title}`,
        body:
          reminder.minutesBefore === 0
            ? "C'est l'heure !"
            : `Dans ${humanizeMinutes(reminder.minutesBefore)}`,
        data: { eventId: event.id, type: 'reminder' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerMs),
        channelId: 'reminders',
      },
    });
    return id;
  } catch (e) {
    return undefined;
  }
}

export async function scheduleAlarm(event: SchoolEvent): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  const triggerMs = new Date(event.startDate).getTime();
  if (triggerMs <= Date.now()) return undefined;
  try {
    const cat = CATEGORY_BY_ID[event.category];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${cat.emoji} ${event.title}`,
        body: event.description ?? "C'est l'heure de votre événement !",
        data: { eventId: event.id, type: 'alarm' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerMs),
        channelId: 'alarms',
      },
    });
    return id;
  } catch (e) {
    return undefined;
  }
}

function humanizeMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  if (m < 1440) {
    const h = Math.floor(m / 60);
    return h === 1 ? '1 heure' : `${h} heures`;
  }
  const d = Math.floor(m / 1440);
  return d === 1 ? '1 jour' : `${d} jours`;
}
