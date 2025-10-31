import { Event, EventForm } from '../types';
import { formatDate, getWeekDates } from './dateUtils';
import { expandEventsWithinWindow } from './recurrence';

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

export function searchOriginalEvents(events: Event[], searchTerm: string): Event[] {
  if (!searchTerm) {
    return events;
  }
  return searchEvents(events, searchTerm);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  // 먼저 날짜 범위를 결정
  let windowStart: Date;
  let windowEnd: Date;

  if (view === 'week') {
    const weekDates = getWeekDates(currentDate);
    windowStart = weekDates[0];
    windowEnd = weekDates[6];
  } else if (view === 'month') {
    windowStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    windowEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    // view가 지정되지 않은 경우 (검색 전용)
    const searchedEvents = searchEvents(events, searchTerm);
    return searchedEvents;
  }

  // 반복 일정 확장
  const expandedEvents = expandEventsWithinWindow(events, windowStart, windowEnd);

  // 검색 필터링
  const searchedEvents = searchEvents(expandedEvents, searchTerm);

  return searchedEvents;
}

/**
 * 다음 반복 날짜를 계산합니다.
 * @param currentDate 현재 날짜
 * @param repeatType 반복 유형
 * @param interval 반복 간격
 * @returns 계산된 다음 날짜 (원본 객체 수정)
 */
function calculateNextRecurrenceDate(
  currentDate: Date,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number
): void {
  switch (repeatType) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * interval);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + interval);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      break;
  }
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
    events.push({
      ...eventForm,
      date: formatDate(currentDate),
    });

    calculateNextRecurrenceDate(currentDate, repeat.type, repeat.interval);
  }

  return events;
}
