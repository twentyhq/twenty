export const isSpecialKey = (key: string): boolean => {
  return key.startsWith('___');
};

export const handleSpecialKey = (
  result: any,
  key: string,
  value: any,
): void => {
  const parts = key.split('_').filter((part) => part);

  // If parts don't contain enough information, return without altering result
  if (parts.length < 2) {
    return;
  }

  const newKey = parts.slice(0, -1).join('');
  const subKey = parts[parts.length - 1];

  if (!result[newKey]) {
    result[newKey] = {};
  }

  result[newKey][subKey] = value;
};

export const parseResult = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || typeof obj === 'function') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => parseResult(item));
  }

  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = parseResult(obj[key]);
      } else if (isSpecialKey(key)) {
        handleSpecialKey(result, key, obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
};
