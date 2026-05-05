import { CategoryId, PriorityId, StatusId, RecurrenceId } from '../types';

export interface CategoryDef {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'conseil_maitres', label: 'Conseil des maîtres', emoji: '👩‍🏫', color: '#6366F1' },
  { id: 'conseil_ecole', label: "Conseil d'école", emoji: '🏫', color: '#8B5CF6' },
  { id: 'reunion_parents', label: 'Réunion parents', emoji: '👨‍👩‍👧', color: '#EC4899' },
  { id: 'formation', label: 'Formation / Stage', emoji: '📚', color: '#F59E0B' },
  { id: 'animation_pedagogique', label: 'Animation pédagogique', emoji: '🎨', color: '#10B981' },
  { id: 'sortie_scolaire', label: 'Sortie scolaire', emoji: '🚌', color: '#3B82F6' },
  { id: 'sport_eps', label: 'Activité sportive / EPS', emoji: '⚽', color: '#22C55E' },
  { id: 'apc', label: 'APC', emoji: '🔬', color: '#14B8A6' },
  { id: 'evaluation', label: 'Évaluation / Bilan', emoji: '📊', color: '#F97316' },
  { id: 'tache_admin', label: 'Tâche administrative', emoji: '📋', color: '#6B7280' },
  { id: 'projet_classe', label: 'Projet de classe', emoji: '🌟', color: '#EAB308' },
  { id: 'rdv_institutionnel', label: 'Rendez-vous institutionnel', emoji: '🏛️', color: '#DC2626' },
  { id: 'personnel', label: 'Événement personnel', emoji: '🏠', color: '#0EA5E9' },
  { id: 'autre', label: 'Autre', emoji: '📌', color: '#A78BFA' },
];

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, CategoryDef>
);

export interface PriorityDef {
  id: PriorityId;
  label: string;
  color: string;
  icon: string; // MaterialCommunityIcons
}

export const PRIORITIES: PriorityDef[] = [
  { id: 'faible', label: 'Faible', color: '#22C55E', icon: 'chevron-down' },
  { id: 'normale', label: 'Normale', color: '#F59E0B', icon: 'minus' },
  { id: 'haute', label: 'Haute', color: '#F97316', icon: 'chevron-up' },
  { id: 'urgente', label: 'Urgente', color: '#EF4444', icon: 'alert-octagon' },
];

export const PRIORITY_BY_ID: Record<PriorityId, PriorityDef> = PRIORITIES.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PriorityId, PriorityDef>
);

export interface StatusDef {
  id: StatusId;
  label: string;
  color: string;
  bg: string;
  strikethrough?: boolean;
  opacity?: number;
}

export const STATUSES: StatusDef[] = [
  { id: 'prevu', label: 'Prévu', color: '#374151', bg: '#E5E7EB' },
  { id: 'confirme', label: 'Confirmé', color: '#FFFFFF', bg: '#22C55E' },
  { id: 'annule', label: 'Annulé', color: '#FFFFFF', bg: '#EF4444', strikethrough: true },
  { id: 'termine', label: 'Terminé', color: '#374151', bg: '#D1D5DB', opacity: 0.6 },
  { id: 'reporte', label: 'Reporté', color: '#FFFFFF', bg: '#F59E0B' },
];

export const STATUS_BY_ID: Record<StatusId, StatusDef> = STATUSES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<StatusId, StatusDef>
);

export interface RecurrenceDef {
  id: RecurrenceId;
  label: string;
}

export const RECURRENCES: RecurrenceDef[] = [
  { id: 'aucune', label: 'Aucune' },
  { id: 'quotidienne', label: 'Quotidienne' },
  { id: 'hebdomadaire', label: 'Hebdomadaire' },
  { id: 'mensuelle', label: 'Mensuelle' },
];

export const REMINDER_PRESETS: { label: string; minutes: number }[] = [
  { label: 'À l’heure', minutes: 0 },
  { label: '5 minutes avant', minutes: 5 },
  { label: '15 minutes avant', minutes: 15 },
  { label: '30 minutes avant', minutes: 30 },
  { label: '1 heure avant', minutes: 60 },
  { label: '2 heures avant', minutes: 120 },
  { label: '1 jour avant', minutes: 1440 },
  { label: '2 jours avant', minutes: 2880 },
];

export const CLASS_PRESETS: string[] = [
  'PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  'PS/MS', 'MS/GS', 'GS/CP', 'CP/CE1', 'CE1/CE2', 'CE2/CM1', 'CM1/CM2',
];
