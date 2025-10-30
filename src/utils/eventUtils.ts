import { Event } from '../types';
import { RepeatType } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  // Determine window based on view
  let windowStart: Date;
  let windowEnd: Date;
  if (view === 'week') {
    const weekDates = getWeekDates(currentDate);
    windowStart = weekDates[0];
    windowEnd = new Date(
      weekDates[6].getFullYear(),
      weekDates[6].getMonth(),
      weekDates[6].getDate(),
      23,
      59,
      59,
      999
    );
  } else {
    windowStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    windowEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return expandEventsWithinWindow(searchedEvents, windowStart, windowEnd);
}

function expandEventsWithinWindow(events: Event[], windowStart: Date, windowEnd: Date): Event[] {
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

function generateOccurrencesForEvent(event: Event, windowStart: Date, windowEnd: Date): Event[] {
  const occurrences: Event[] = [];
  const startDate = parseYMD(event.date);
  const repeatType: RepeatType = event.repeat.type as RepeatType;
  const interval = Math.max(1, event.repeat.interval || 1);
  const hasEnd = Boolean(event.repeat.endDate);
  const repeatEndDate = hasEnd ? parseYMD(event.repeat.endDate as string) : null;

  // Helper to include an occurrence if inside both window and repeat end
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

      // Only include if exact same day exists in the month (no end-of-month fallback)
      if (candidate.getDate() === startDay && candidate.getMonth() === m) {
        if (candidate >= windowStart) maybeInclude(candidate);
      }

      // advance by interval months
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

      // Only include if exact same month/day exists (e.g., 2/29 only on leap years)
      if (candidate.getMonth() === month && candidate.getDate() === day) {
        if (candidate >= windowStart) maybeInclude(candidate);
      }
    }
    return occurrences;
  }

  return occurrences;
}
