const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

export const maskUuids = (text: string): string =>
  text.replace(UUID_PATTERN, '<id>');
