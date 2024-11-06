export const isUuid = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.length !== 36) {
    return false;
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
};
