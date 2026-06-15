import { isValidVariable } from '@/utils';
import { z } from 'zod';

export const arrayOfStringsOrVariablesSchema = z.string().transform((val) => {
  if (val === '') {
    return [];
  }

  if (isValidVariable(val) as boolean) {
    return [val];
  }

  try {
    const parsedValue = JSON.parse(val);

    if (
      Array.isArray(parsedValue) &&
      parsedValue.every((item) => typeof item === 'string')
    ) {
      return parsedValue;
    }
  } catch {
    return [val];
  }

  return [val];
});
