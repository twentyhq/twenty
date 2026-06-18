import { z } from 'zod';

// Commercials fields live in state as digit-and-decimal strings (NumberField
// strips everything else), so a lone "." can still reach the reducer. Reject any
// non-empty value that is not a finite, non-negative number so the commercials
// step fails fast instead of building Number(".") === NaN into the request body.
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
