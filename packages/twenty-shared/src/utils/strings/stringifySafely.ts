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

    const stringifiedValue = JSON.stringify(value);

    if (stringifiedValue === undefined) {
      return String(value);
    }

    return stringifiedValue;
  } catch {
    return String(value);
  }
};
