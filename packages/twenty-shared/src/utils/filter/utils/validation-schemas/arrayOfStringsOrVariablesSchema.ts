import { isValidVariable } from '@/utils';
import { z } from 'zod';

export const arrayOfStringsOrVariablesSchema = z
  .string()
  .transform((val) => {
    if (val === '') return [];
    if (isValidVariable(val) as boolean) {
      return [val];
    }
    return JSON.parse(val);
  })
  .refine(
    (parsed) =>
      Array.isArray(parsed) && parsed.every((item) => typeof item === 'string'),
    {
      error: 'Expected an array of strings',
    },
  );
