export const stringifySafely = (value: unknown): string => {
  try {
    if (value === undefined) {
      return 'undefined';
    } else if (value === null) {
      return 'null';
    } else if (value === Infinity) {
      return 'Infinity';
    } else if (value === -Infinity) {
      return '-Infinity';
    } else if (typeof value === 'number' && isNaN(value)) {
      return 'NaN';
    }

    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
