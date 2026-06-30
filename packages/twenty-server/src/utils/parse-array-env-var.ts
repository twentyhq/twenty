export const parseArrayEnvVar = <T>(
  envVar: string | undefined,
  expectedValues: T[],
  defaultValues: T[],
): T[] => {
  if (!envVar) return defaultValues;

  const values = envVar
    .split(',')
    .filter((item) => expectedValues.includes(item as T)) as T[];

  return values.length > 0 ? values : defaultValues;
};
