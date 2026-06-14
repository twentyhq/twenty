export const tryParseJsonArray = (value: string): unknown[] | null => {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
