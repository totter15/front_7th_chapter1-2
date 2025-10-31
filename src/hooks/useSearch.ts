import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getFilteredEvents, searchOriginalEvents } from '../utils/eventUtils';

export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, searchTerm, currentDate, view);
  }, [events, searchTerm, currentDate, view]);

  const searchedOriginalEvents = useMemo(() => {
    return searchOriginalEvents(events, searchTerm);
  }, [events, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
    searchedOriginalEvents,
  };
};
