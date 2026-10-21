import { z } from 'zod';

export const frontComponentQuerySchema = z.object({
  objectName: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  select: z
    .array(z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/))
    .min(1)
    .max(20),
  limit: z.number().int().min(1).max(100),
});
