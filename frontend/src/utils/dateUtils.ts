import {
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  subMonths,
  subWeeks,
  subDays,
  eachDayOfInterval,
  differenceInMinutes,
  isWithinInterval,
  areIntervalsOverlapping,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export const DOW_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const DOW_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function fmtDate(d: Date | string, pattern = 'PPP'): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, pattern, { locale: fr });
}

export function fmtTime(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'HH:mm', { locale: fr });
}

export function fmtDateLong(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, "EEEE d MMMM yyyy", { locale: fr });
}

export function fmtDateShort(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, "d MMM", { locale: fr });
}

export function fmtMonth(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'MMMM yyyy', { locale: fr });
}

export function getMonthGrid(anchor: Date): Date[] {
  // 6-week grid starting Monday
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export {
  isSameDay,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
  subMonths,
  subWeeks,
  subDays,
  differenceInMinutes,
  isWithinInterval,
  areIntervalsOverlapping,
  parseISO,
  format,
  startOfMonth,
  endOfMonth,
};
