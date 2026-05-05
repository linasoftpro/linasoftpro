import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SchoolEvent, Task } from '../types';

const EVENTS_KEY = '@maitragenda/events/v1';
const TASKS_KEY = '@maitragenda/tasks/v1';

export interface BackupPayload {
  app: 'MaitrAgenda';
  version: 1;
  exportedAt: string;
  events: SchoolEvent[];
  tasks: Task[];
}

function buildFileName(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `maitragenda_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}.json`;
}

async function readAll(): Promise<BackupPayload> {
  const [rawE, rawT] = await Promise.all([
    AsyncStorage.getItem(EVENTS_KEY),
    AsyncStorage.getItem(TASKS_KEY),
  ]);
  const events: SchoolEvent[] = rawE ? JSON.parse(rawE) : [];
  const tasks: Task[] = rawT ? JSON.parse(rawT) : [];
  return {
    app: 'MaitrAgenda',
    version: 1,
    exportedAt: new Date().toISOString(),
    events,
    tasks,
  };
}

export async function exportBackup(): Promise<{
  ok: boolean;
  message: string;
  fileName?: string;
}> {
  try {
    const payload = await readAll();
    const json = JSON.stringify(payload, null, 2);
    const fileName = buildFileName();

    if (Platform.OS === 'web') {
      // Trigger browser download
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w: any = globalThis;
      const blob = new w.Blob([json], { type: 'application/json' });
      const url = w.URL.createObjectURL(blob);
      const a = w.document.createElement('a');
      a.href = url;
      a.download = fileName;
      w.document.body.appendChild(a);
      a.click();
      w.document.body.removeChild(a);
      w.URL.revokeObjectURL(url);
      return { ok: true, message: 'Sauvegarde téléchargée.', fileName };
    }

    // Native: write file then share
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory;
    const uri = `${dir}${fileName}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (FileSystem as any).writeAsStringAsync(uri, json, { encoding: 'utf8' });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter la sauvegarde MaîtrAgenda',
        UTI: 'public.json',
      });
    }
    return { ok: true, message: 'Sauvegarde exportée.', fileName };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    return { ok: false, message: `Échec de l’export : ${msg}` };
  }
}

function isValidPayload(obj: unknown): obj is BackupPayload {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return o.app === 'MaitrAgenda' && Array.isArray(o.events) && Array.isArray(o.tasks);
}

async function readJsonFromUri(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return res.text();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (FileSystem as any).readAsStringAsync(uri, { encoding: 'utf8' });
}

export type ImportMode = 'replace' | 'merge';

export interface ImportResult {
  ok: boolean;
  message: string;
  importedEvents?: number;
  importedTasks?: number;
  cancelled?: boolean;
}

export async function importBackup(mode: ImportMode): Promise<ImportResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/json', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) {
      return { ok: false, cancelled: true, message: 'Import annulé.' };
    }
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return { ok: false, message: 'Fichier introuvable.' };
    }
    const text = await readJsonFromUri(asset.uri);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, message: 'Fichier JSON invalide.' };
    }
    if (!isValidPayload(parsed)) {
      return { ok: false, message: 'Format de sauvegarde non reconnu.' };
    }

    const payload = parsed;
    let events = payload.events;
    let tasks = payload.tasks;

    if (mode === 'merge') {
      const [rawE, rawT] = await Promise.all([
        AsyncStorage.getItem(EVENTS_KEY),
        AsyncStorage.getItem(TASKS_KEY),
      ]);
      const currE: SchoolEvent[] = rawE ? JSON.parse(rawE) : [];
      const currT: Task[] = rawT ? JSON.parse(rawT) : [];
      const eIds = new Set(currE.map((e) => e.id));
      const tIds = new Set(currT.map((t) => t.id));
      events = [...currE, ...payload.events.filter((e) => !eIds.has(e.id))];
      tasks = [...currT, ...payload.tasks.filter((t) => !tIds.has(t.id))];
    }

    await Promise.all([
      AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events)),
      AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)),
    ]);

    return {
      ok: true,
      message:
        mode === 'replace'
          ? 'Données remplacées avec succès.'
          : 'Données fusionnées avec succès.',
      importedEvents: payload.events.length,
      importedTasks: payload.tasks.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    return { ok: false, message: `Échec de l’import : ${msg}` };
  }
}
