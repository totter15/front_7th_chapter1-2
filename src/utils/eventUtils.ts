import { Event } from '../types';
import { getWeekDates } from './dateUtils';
import { expandEventsWithinWindow } from './recurrence';

// legacy helper retained for reference

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

// kept for potential future use. Currently expansion uses window-based approach

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
