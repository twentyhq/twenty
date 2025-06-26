import { isDefined } from 'twenty-shared/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    sanitizedEvent[property] = sanitizeString(
      sanitizedEvent[property],
    ) as T[typeof property];
  }

  return sanitizedEvent;
};

const sanitizeString = (value: string): string => {
  return value.replace('\u0000', '').replace('\x00', '').replace('\x7f', '');
};
