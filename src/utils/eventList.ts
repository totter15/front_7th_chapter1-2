import { Event } from '../types';

export function getListEvents(filteredEvents: Event[], allEvents: Event[]): Event[] {
  const seenBaseIds = new Set<string>();
  const results: Event[] = [];

  for (const item of filteredEvents) {
    const idStr = typeof item?.id === 'string' ? (item.id as string) : '';
    if (!idStr) {
      results.push(item);
      continue;
    }
    const baseId = idStr.split('-')[0];
    if (seenBaseIds.has(baseId)) continue;
    seenBaseIds.add(baseId);
    const original = allEvents.find((ev) => ev.id === baseId);
    results.push(original ?? item);
  }
  return results;
}
