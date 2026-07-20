import { z } from 'zod';

export const emailSchema = z
  .email({ pattern: z.regexes.unicodeEmail })
  .max(255);
