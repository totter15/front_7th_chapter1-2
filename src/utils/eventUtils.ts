import { Event, EventForm } from '../types';
import { formatDate } from './dateUtils';
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

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

/**
 * 반복 일정을 생성하여 EventForm 배열을 반환합니다.
 * @param eventForm 기본 이벤트 정보 (반복 설정 포함)
 * @returns 생성된 반복 일정 배열
 */
export function generateRecurringEvents(eventForm: EventForm): EventForm[] {
  const { repeat, date } = eventForm;

  // 반복이 아니면 빈 배열 반환
  if (repeat.type === 'none' || !repeat.endDate) {
    return [];
  }

  const startDate = new Date(date);
  const endDate = new Date(repeat.endDate);
  const events: EventForm[] = [];

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const eventDateStr = formatDate(currentDate);

    events.push({
      ...eventForm,
      date: eventDateStr,
    });

    // 다음 반복 날짜 계산
    switch (repeat.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + repeat.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + repeat.interval);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + repeat.interval);
        break;
    }
  }

  return events;
}
