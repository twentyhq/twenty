import { isValidVariable } from '@/utils';
import { z } from 'zod';

export const arrayOfStringsOrVariablesSchema = z
  .string()
  .transform((val) => {
    if (val === '') return [];
    if (isValidVariable(val) as boolean) {
      return [val];
    }

    try {
      const parsedValue = JSON.parse(val);

      if (typeof parsedValue === 'string') {
        return [parsedValue];
      }

      return parsedValue;
    } catch {
      const trimmedValue = val.trim();

      if (
        trimmedValue.startsWith('[') ||
        trimmedValue.startsWith('{') ||
        trimmedValue.startsWith('"')
      ) {
        throw new Error('Expected an array of strings');
      }

      return [val];
    }
  })
  .refine(
    (parsed) =>
      Array.isArray(parsed) && parsed.every((item) => typeof item === 'string'),
    {
      error: 'Expected an array of strings',
    },
  );
