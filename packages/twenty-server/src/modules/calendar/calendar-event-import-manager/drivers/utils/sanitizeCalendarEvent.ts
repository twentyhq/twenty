export const sanitizeCalendarEvent = <T extends Record<string, any>>(
  event: T,
  propertiesToSanitize: (keyof T)[],
): T => {
  const sanitizedEvent = { ...event };

  for (const property of propertiesToSanitize) {
    sanitizedEvent[property] = sanitizeString(sanitizedEvent[property]) as any;
  }

  return sanitizedEvent;
};

const sanitizeString = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === null || value === undefined || typeof value !== 'string') {
    return value;
  }

  return value.replace('\u0000', '');
};
