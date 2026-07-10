/**
 * Returns a timezone-safe YYYY-MM-DD string in the user's local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a timezone-safe ISO-like string of the local date and time.
 */
export function getLocalISOString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString();
}

/**
 * Generates an array of YYYY-MM-DD date strings between start and end date (inclusive)
 * that match the recurrence rule.
 */
export function generateRecurringDates(
  startDateStr: string,
  endDateStr: string,
  recurringType: 'daily' | 'weekly' | 'custom',
  recurringDays: number[]
): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (end < current) {
    return [startDateStr];
  }

  const maxIterations = 366;
  let iterations = 0;

  while (current <= end && iterations < maxIterations) {
    const dateStr = getLocalDateString(current);

    if (recurringType === 'daily') {
      dates.push(dateStr);
    } else if (recurringType === 'weekly' || recurringType === 'custom') {
      const dayOfWeek = current.getDay();
      if (recurringDays && recurringDays.includes(dayOfWeek)) {
        dates.push(dateStr);
      }
    }

    current.setDate(current.getDate() + 1);
    iterations++;
  }

  if (dates.length === 0) {
    dates.push(startDateStr);
  }

  return dates;
}
