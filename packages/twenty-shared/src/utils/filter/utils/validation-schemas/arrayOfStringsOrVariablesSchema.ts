import { isValidVariable } from '@/utils/validation/isValidVariable';
import { z } from 'zod';

export const arrayOfStringsOrVariablesSchema = z
  .string()
  .transform((val, ctx) => {
    if (val === '') return [];
    if (isValidVariable(val) as boolean) {
      return [val];
    }
    try {
      return JSON.parse(val);
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message: (error as Error).message,
      });
      return z.NEVER;
    }
  })
  .refine(
    (parsed) =>
      Array.isArray(parsed) && parsed.every((item) => typeof item === 'string'),
    {
      error: 'Expected an array of strings',
    },
  );
