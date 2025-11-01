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
 * @param startDay 원본 시작일 (매월 반복 시 사용)
 * @returns 계산된 다음 날짜 (원본 객체 수정)
 */
function calculateNextRecurrenceDate(
  currentDate: Date,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number,
  startDay?: number
): void {
  switch (repeatType) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * interval);
      break;
    case 'monthly':
      if (startDay !== undefined) {
        // 원본 날짜(startDay)를 유지하며 다음 유효한 달로 이동
        currentDate.setMonth(currentDate.getMonth() + interval);
        // 날짜가 변경되었으면 (31일 → 28일 등) 원래 날짜로 복원 시도
        if (currentDate.getDate() !== startDay) {
          currentDate.setDate(startDay);
        }
      } else {
        currentDate.setMonth(currentDate.getMonth() + interval);
      }
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      break;
  }
}

/**
 * 반복 일정을 생성하여 EventForm 배열을 반환합니다.
 * @param eventForm 기본 이벤트 정보 (반복 설정 포함)
 * @returns 생성된 반복 일정 배열 (각 인스턴스는 baseId로 연결됨)
 */
export function generateRecurringEvents(
  eventForm: EventForm
): Array<EventForm & { baseId?: string }> {
  const { repeat, date } = eventForm;

  // 반복이 아니면 빈 배열 반환
  if (repeat.type === 'none' || !repeat.endDate) {
    return [];
  }

  const startDate = new Date(date);
  const endDate = new Date(repeat.endDate);
  const events: Array<EventForm & { baseId?: string }> = [];
  let currentDate = new Date(startDate);
  const startDay = startDate.getDate(); // 매월 반복 시 원본 날짜 유지용

  // 시리즈 식별자 생성 (제목-시작일-종료일-타입)
  const baseId = `${eventForm.title}-${date}-${repeat.endDate}-${repeat.type}`;

  while (currentDate <= endDate) {
    const currentDateStr = formatDate(currentDate);

    // 매월 반복: 원본 날짜(startDay)와 현재 날짜가 일치할 때만 추가
    if (repeat.type === 'monthly' && currentDate.getDate() !== startDay) {
      calculateNextRecurrenceDate(currentDate, repeat.type, repeat.interval, startDay);
      continue;
    }

    events.push({
      ...eventForm,
      date: currentDateStr,
      repeat: {
        ...eventForm.repeat,
        id: baseId, // 서버가 사용할 repeat.id로 전달
      } as typeof eventForm.repeat & { id: string },
      baseId, // 클라이언트 편의용
    });

    calculateNextRecurrenceDate(currentDate, repeat.type, repeat.interval, startDay);
  }

  return events;
}
