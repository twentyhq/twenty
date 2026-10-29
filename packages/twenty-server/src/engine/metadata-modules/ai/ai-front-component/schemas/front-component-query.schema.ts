import { z } from 'zod';

const queryIdentifierSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/);

export const frontComponentQuerySchema = z.object({
  objectName: queryIdentifierSchema,
  select: z.array(queryIdentifierSchema).min(1).max(20),
  limit: z.number().int().min(1).max(100),
});
