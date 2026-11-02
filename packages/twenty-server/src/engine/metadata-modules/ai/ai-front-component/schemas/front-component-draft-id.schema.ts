import { z } from 'zod';

export const frontComponentDraftIdSchema = z.object({
  draftId: z.string().uuid(),
});
