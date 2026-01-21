export const parseArrayEnvVar = <T>(
  envVar: string | undefined,
  expectedValues: T[],
  defaultValues: T[],
): T[] => {
  if (!envVar || typeof envVar !== 'string') {
    return defaultValues;
  }

  if (!Array.isArray(expectedValues) || expectedValues.length === 0) {
    return defaultValues;
  }

  const values = envVar
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .filter((item) => expectedValues.includes(item as T)) as T[];

  return values.length > 0 ? values : defaultValues;
};
