import { Event, RepeatType } from '../types';
import { isDateInRange } from './dateUtils';

const CAP_END_DATE = new Date(2025, 11, 31); // 2025-12-31

function getCappedEndDate(raw: Date | null): Date | null {
  if (!raw) return null;
  return raw > CAP_END_DATE ? CAP_END_DATE : raw;
}

function parseYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map((v) => Number(v));
  return new Date(y, m - 1, d);
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateOccurrencesForEvent(
  event: Event,
  windowStart: Date,
  windowEnd: Date
): Event[] {
  const occurrences: Event[] = [];
  const startDate = parseYMD(event.date);
  const repeatType: RepeatType = event.repeat.type as RepeatType;
  const interval = Math.max(1, event.repeat.interval || 1);
  const hasEnd = Boolean(event.repeat.endDate);
  const repeatEndDateRaw = hasEnd ? parseYMD(event.repeat.endDate as string) : null;
  const repeatEndDate = getCappedEndDate(repeatEndDateRaw);

  const maybeInclude = (occurrenceDate: Date) => {
    if (repeatEndDate && occurrenceDate > repeatEndDate) return;
    if (!isDateInRange(occurrenceDate, windowStart, windowEnd)) return;
    const cloned: Event = {
      ...event,
      id: `${event.id ?? event.title}-${toYMD(occurrenceDate)}`,
      date: toYMD(occurrenceDate),
    };
    occurrences.push(cloned);
  };

  if (repeatType === 'daily') {
    for (
      let d = new Date(startDate);
      d <= windowEnd;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + interval)
    ) {
      if (d < windowStart) continue;
      if (repeatEndDate && d > repeatEndDate) break;
      maybeInclude(d);
    }
    return occurrences;
  }

  if (repeatType === 'weekly') {
    for (
      let d = new Date(startDate);
      d <= windowEnd;
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7 * interval)
    ) {
      if (d < windowStart) continue;
      if (repeatEndDate && d > repeatEndDate) break;
      maybeInclude(d);
    }
    return occurrences;
  }

  if (repeatType === 'monthly') {
    const startDay = startDate.getDate();
    for (let y = startDate.getFullYear(), m = startDate.getMonth(); ; ) {
      const candidate = new Date(y, m, startDay);
      if (candidate > windowEnd) break;
      if (repeatEndDate && candidate > repeatEndDate) break;

      if (candidate.getDate() === startDay && candidate.getMonth() === m) {
        if (candidate >= windowStart) maybeInclude(candidate);
      }

      m += interval;
      while (m > 11) {
        m -= 12;
        y += 1;
      }
    }
    return occurrences;
  }

  if (repeatType === 'yearly') {
    const month = startDate.getMonth();
    const day = startDate.getDate();
    for (let y = startDate.getFullYear(); ; y += interval) {
      const candidate = new Date(y, month, day);
      if (candidate > windowEnd) break;
      if (repeatEndDate && candidate > repeatEndDate) break;

      if (candidate.getMonth() === month && candidate.getDate() === day) {
        if (candidate >= windowStart) maybeInclude(candidate);
      }
    }
    return occurrences;
  }

  return occurrences;
}

export function expandEventsWithinWindow(
  events: Event[],
  windowStart: Date,
  windowEnd: Date
): Event[] {
  const expanded: Event[] = [];
  for (const event of events) {
    if (event.repeat.type === 'none') {
      const eventDate = new Date(event.date);
      if (isDateInRange(eventDate, windowStart, windowEnd)) {
        expanded.push(event);
      }
      continue;
    }
    const occurrences = generateOccurrencesForEvent(event, windowStart, windowEnd);
    expanded.push(...occurrences);
  }
  return expanded;
}
