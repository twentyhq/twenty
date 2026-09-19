import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

const buildChoiceAnswerSchema = (optionNames: string[]) => {
  const [firstOptionName, ...otherOptionNames] = optionNames;

  if (!isNonEmptyString(firstOptionName)) {
    throw new AiException(
      'A choice question needs at least one named option',
      AiExceptionCode.INVALID_EVALUATION_REQUEST,
    );
  }

  return z.object({
    type: z.literal('choice'),
    choice: z.enum([firstOptionName, ...otherOptionNames]),
  });
};

const buildQuestionAnswerSchema = (question: AiEvaluationModelQuestion) => {
  switch (question.type) {
    case 'choice':
      return buildChoiceAnswerSchema(Object.keys(question.criteria));
    case 'score':
      return z.object({
        type: z.literal('score'),
        score: z
          .number()
          .min(0)
          .max(question.criteria.length - 1),
      });
    case 'boolean':
      return z.object({
        type: z.literal('boolean'),
        probability: z.number().min(0).max(1),
      });
  }
};

// The schema is the whole guarantee on this path: an evaluation model cannot
// emit an off-menu value by construction, a language model only cannot because
// structured output constrains it. Probabilities are deliberately absent — a
// number a language model writes for itself is not a calibrated one, and
// reporting it as such would be worse than reporting none.
export const buildEvaluationResponseSchema = (
  questions: Record<string, AiEvaluationModelQuestion>,
) =>
  z.object({
    answers: z.object(
      Object.fromEntries(
        Object.entries(questions).map(([questionId, question]) => [
          questionId,
          buildQuestionAnswerSchema(question),
        ]),
      ),
    ),
  });
