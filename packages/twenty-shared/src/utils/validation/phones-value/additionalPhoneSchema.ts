import { z } from 'zod';

export const additionalPhoneSchema = z.object({
  number: z.string(),
  callingCode: z.string().optional(),
  countryCode: z.string().optional(),
});
