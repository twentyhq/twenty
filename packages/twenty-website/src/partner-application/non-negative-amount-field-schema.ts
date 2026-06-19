import { z } from 'zod';

export const nonNegativeAmountFieldSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    },
    { error: 'Enter a valid non-negative amount.' },
  );
