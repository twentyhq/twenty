import { z } from 'zod';

export const aiSearchAnswerModelOutputSchema = z.object({
  status: z.enum(['answer', 'handoff']),
  answer: z.string(),
  sourceReferences: z.array(z.string()),
});

export type AiSearchAnswerModelOutput = z.infer<
  typeof aiSearchAnswerModelOutputSchema
>;
