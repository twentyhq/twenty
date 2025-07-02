export const mapObjectByKey = <T>(
  obj: Record<string, Record<string, T>>,
  key: string,
): Record<string, T> => {
  return Object.fromEntries(
    Object.entries(obj).map(([k, value]) => [k, value[key]]),
  );
};
