import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

export const workflowFileSchema = z.object({
  id: z.string().refine((val) => isValidUuid(val)),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  createdAt: z.string(),
});
