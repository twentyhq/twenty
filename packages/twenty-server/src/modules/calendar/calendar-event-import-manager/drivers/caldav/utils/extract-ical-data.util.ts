import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// Some CalDAV servers return calendar-data as a string, others nest it under
// _cdata or other shapes. Recurse until a VCALENDAR block is found.
export const extractICalData = (
  calendarData: string | Record<string, unknown> | null | undefined,
): string | null => {
  if (!isDefined(calendarData)) return null;

  if (isString(calendarData) && calendarData.includes('VCALENDAR')) {
    return calendarData;
  }

  if (typeof calendarData === 'object') {
    for (const value of Object.values(calendarData)) {
      const result = extractICalData(value as string | Record<string, unknown>);

      if (isDefined(result)) return result;
    }
  }

  return null;
};
