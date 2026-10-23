import { z } from 'zod';

export const frontComponentDiagnosticSchema = z.object({
  status: z.enum(['ready', 'error']),
  message: z.string().max(2000).optional(),
});
