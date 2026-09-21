import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

// A boolean answer is a probability and nothing else — the spec has no field
// for a bare verdict. An evaluation model computes that number; a language
// model can only write one down, and a written-down number in a field called
// `probability` reads exactly like a measured one to everything downstream.
// Rather than publish a figure a workflow might threshold on, this path
// refuses the question and says what would answer it.
export const assertQuestionsSuitALanguageModel = (
  questions: Record<string, AiEvaluationModelQuestion>,
): void => {
  const booleanQuestionIds = Object.entries(questions)
    .filter(([, question]) => question.type === 'boolean')
    .map(([questionId]) => questionId);

  if (booleanQuestionIds.length === 0) {
    return;
  }

  throw new AiException(
    `${booleanQuestionIds.join(', ')} ${
      booleanQuestionIds.length === 1 ? 'asks' : 'ask'
    } for a probability, which only an evaluation model can measure. Configure an evaluation provider, or change the question to pick between named options.`,
    AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
  );
};
