import { z } from 'zod';
import { isValidUuid } from '../../utils/validation/isValidUuid';

export const workflowFileSchema = z.object({
  id: z.string().refine((val) => isValidUuid(val)),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  createdAt: z.string(),
});
