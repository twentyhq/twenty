import { isDefined } from 'twenty-shared/utils';

export const sanitizeCalendarEvent = <T extends Record<string, any>>(
  event: T,
  propertiesToSanitize: (keyof T)[],
): T => {
  const sanitizedEvent = { ...event };

  for (const property of propertiesToSanitize) {
    if (!isDefined(sanitizedEvent[property])) {
      continue;
    }
    if (typeof sanitizedEvent[property] !== 'string') {
      continue;
    }
    sanitizedEvent[property] = sanitizeString(sanitizedEvent[property]) as any;
  }

  return sanitizedEvent;
};

const sanitizeString = (value: string): string => {
  return value.replace('\u0000', '');
};
