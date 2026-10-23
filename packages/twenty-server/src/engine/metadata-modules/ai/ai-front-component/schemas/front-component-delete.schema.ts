import { z } from 'zod';

export const frontComponentDeleteSchema = z.object({
  frontComponentId: z.uuid(),
  name: z.string().min(1).max(100),
});
