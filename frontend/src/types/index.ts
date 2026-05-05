// Domain models for MaîtrAgenda

export type CategoryId =
  | 'conseil_maitres'
  | 'conseil_ecole'
  | 'reunion_parents'
  | 'formation'
  | 'animation_pedagogique'
  | 'sortie_scolaire'
  | 'sport_eps'
  | 'apc'
  | 'evaluation'
  | 'tache_admin'
  | 'projet_classe'
  | 'rdv_institutionnel'
  | 'personnel'
  | 'autre';

export type PriorityId = 'faible' | 'normale' | 'haute' | 'urgente';

export type StatusId = 'prevu' | 'confirme' | 'annule' | 'termine' | 'reporte';

export type RecurrenceId = 'aucune' | 'quotidienne' | 'hebdomadaire' | 'mensuelle';

export interface Reminder {
  id: string;
  minutesBefore: number;
  notificationId?: string; // Expo notification identifier
}

export interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  category: CategoryId;
  startDate: string; // ISO string
  endDate: string; // ISO string
  allDay: boolean;
  location?: string;
  priority: PriorityId;
  status: StatusId;
  recurrence: RecurrenceId;
  reminders: Reminder[];
  alarmEnabled: boolean;
  alarmNotificationId?: string;
  notes?: string;
  participants?: string;
  classGroup?: string; // CE2/CM1...
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  dueDate?: string; // ISO string
  priority: PriorityId;
  category?: CategoryId;
  createdAt: string;
  updatedAt: string;
}

export type CalendarViewMode = 'mois' | 'semaine' | 'jour';

export type ThemeMode = 'light' | 'dark' | 'system';
