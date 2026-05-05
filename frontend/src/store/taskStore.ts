import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const STORAGE_KEY = '@maitragenda/tasks/v1';

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface TaskState {
  tasks: Task[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addTask: (payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, payload: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

async function persist(tasks: Task[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const tasks: Task[] = raw ? JSON.parse(raw) : [];
      set({ tasks, isLoaded: true });
    } catch {
      set({ tasks: [], isLoaded: true });
    }
  },

  addTask: async (payload) => {
    const now = new Date().toISOString();
    const t: Task = { ...payload, id: uid(), createdAt: now, updatedAt: now };
    const next = [...get().tasks, t];
    set({ tasks: next });
    await persist(next);
    return t;
  },

  toggleTask: async (id) => {
    const next = get().tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: next });
    await persist(next);
  },

  updateTask: async (id, payload) => {
    const next = get().tasks.map((t) =>
      t.id === id ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: next });
    await persist(next);
  },

  deleteTask: async (id) => {
    const next = get().tasks.filter((t) => t.id !== id);
    set({ tasks: next });
    await persist(next);
  },
}));
