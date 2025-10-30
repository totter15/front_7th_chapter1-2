export function getBaseId(occurrenceId: string): string {
  if (typeof occurrenceId !== 'string') return '';
  const idx = occurrenceId.indexOf('-');
  return idx === -1 ? occurrenceId : occurrenceId.slice(0, idx);
}

export function getOccurrenceKeyFromParts(baseId: string, date: string): string {
  return `${baseId}-${date}`;
}
