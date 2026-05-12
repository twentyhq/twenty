export const toIsoStringOrNull = (
  value: string | Date | null | undefined,
): string | null => {
  if (value == null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
};
