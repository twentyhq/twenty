import { isNonEmptyString } from '@sniptt/guards';
import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

const toEvaluationQuestion = (
  question: WorkflowClassifyQuestion,
): AiEvaluationModelQuestion => {
  switch (question.type) {
    case 'choice':
      return {
        type: 'choice',
        instructions: question.instructions,
        criteria: Object.fromEntries(
          question.criteria.map((criterion) => [
            criterion.name,
            criterion.description ?? null,
          ]),
        ),
      };
    case 'score':
      // A level's position is its score, so the editor's order is the rubric.
      // The label stands in when no description was written, since an unnamed
      // level tells the model nothing.
      return {
        type: 'score',
        instructions: question.instructions,
        criteria: question.criteria.map(
          (criterion) => criterion.description ?? criterion.name,
        ),
      };
    case 'boolean':
      return {
        type: 'boolean',
        instructions: question.instructions,
      };
  }
};

// Keyed by the question's name rather than its id: the key is what downstream
// steps reference, and a uuid would make every variable unreadable.
export const buildEvaluationQuestions = (
  questions: WorkflowClassifyQuestion[],
): Record<string, AiEvaluationModelQuestion> => {
  const evaluationQuestions: Record<string, AiEvaluationModelQuestion> = {};

  for (const question of questions) {
    if (!isNonEmptyString(question.name)) {
      throw new AiException(
        'Every classification question needs a name',
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }

    if (question.name in evaluationQuestions) {
      throw new AiException(
        `Two classification questions are named "${question.name}"; answers would overwrite each other`,
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }

    evaluationQuestions[question.name] = toEvaluationQuestion(question);
  }

  return evaluationQuestions;
};
