import {
  AI_EVALUATION_QUESTION_TYPES,
  type AiEvaluationQuestionType,
} from '@/ai/constants/ai-evaluation-question-type.const';

export const isAiEvaluationQuestionType = (
  value: unknown,
): value is AiEvaluationQuestionType =>
  AI_EVALUATION_QUESTION_TYPES.some((questionType) => questionType === value);
