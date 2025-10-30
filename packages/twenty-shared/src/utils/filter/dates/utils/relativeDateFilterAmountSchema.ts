import z from 'zod';

export const relativeDateFilterAmountSchema = z
  .union([z.coerce.number().int().positive(), z.literal('undefined')])
  .transform((val) => (val === 'undefined' ? undefined : val));
