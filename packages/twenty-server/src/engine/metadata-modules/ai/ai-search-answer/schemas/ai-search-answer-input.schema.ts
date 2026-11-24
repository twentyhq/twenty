import { z } from 'zod';

import { AI_SEARCH_ANSWER_MAX_CANDIDATES } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-candidates.constant';
import { AI_SEARCH_ANSWER_MAX_QUESTION_LENGTH } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-question-length.constant';

export const aiSearchAnswerInputSchema = z.object({
  question: z.string().trim().min(1).max(AI_SEARCH_ANSWER_MAX_QUESTION_LENGTH),
  candidates: z
    .array(
      z.object({
        objectNameSingular: z.string().min(1).max(255),
        recordId: z.guid(),
      }),
    )
    .max(AI_SEARCH_ANSWER_MAX_CANDIDATES),
  trigger: z.enum(['automatic', 'manual']),
  searchScope: z.string().min(1).max(255).nullable(),
  searchSessionId: z.guid(),
});

export type AiSearchAnswerInput = z.infer<typeof aiSearchAnswerInputSchema>;
