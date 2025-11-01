import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/eventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const createSingleEvent = async (eventData: EventForm) => {
    return fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
  };

  const createRecurringEvents = async (eventData: EventForm) => {
    const recurringEvents = generateRecurringEvents(eventData);
    if (recurringEvents.length > 0) {
      return fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: recurringEvents }),
      });
    }
    // 반복 일정이 생성되지 않으면 일반 일정으로 저장
    return createSingleEvent(eventData);
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        const isRepeatingEvent = eventData.repeat.type !== 'none' && eventData.repeat.endDate;
        response = isRepeatingEvent
          ? await createRecurringEvents(eventData as EventForm)
          : await createSingleEvent(eventData as EventForm);
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  const deleteRecurringSeries = async (baseId: string) => {
    try {
      const response = await fetch(`/api/recurring-events/${baseId}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete recurring series');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting recurring series:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  const updateRecurringSeries = async (repeatId: string, eventData: Partial<Event>) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update recurring series');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating recurring series:', error);
      enqueueSnackbar('일정 수정 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    deleteRecurringSeries,
    updateRecurringSeries,
  };
};
