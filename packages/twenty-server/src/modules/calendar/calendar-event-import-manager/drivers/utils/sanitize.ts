export const sanitizeCalendarEvent = <T extends Record<string, any>>(
  object: T,
  propertiesToSanitize: (keyof T)[],
): T => {
  const sanitizedObject = { ...object };

  for (const property of propertiesToSanitize) {
    sanitizedObject[property] = sanitizeString(
      sanitizedObject[property],
    ) as any;
  }

  return sanitizedObject;
};

export const sanitizeString = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === null || value === undefined || typeof value !== 'string') {
    return value;
  }

  return value.replace(/[^\x20-\x7E]/g, '');
};
