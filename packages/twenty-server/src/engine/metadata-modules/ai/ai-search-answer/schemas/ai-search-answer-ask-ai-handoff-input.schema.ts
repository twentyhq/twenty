import { z } from 'zod';

export const aiSearchAnswerAskAiHandoffInputSchema = z.object({
  searchSessionId: z.guid(),
  answerStatus: z.enum([
    'quickAnswerAvailable',
    'loading',
    'answer',
    'handoff',
    'failed',
  ]),
});

export type AiSearchAnswerAskAiHandoffInput = z.infer<
  typeof aiSearchAnswerAskAiHandoffInputSchema
>;
