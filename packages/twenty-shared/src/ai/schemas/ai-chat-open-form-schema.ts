import { z } from 'zod';

export const aiChatOpenFormSchema = z.object({
  formId: z.string().min(1),
  description: z.string(),
  fields: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string(),
      }),
    )
    .min(1)
    .max(30),
});
