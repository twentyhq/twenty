import { isNonEmptyString } from '@sniptt/guards';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

// Spec-level shape only; what a given model can answer is asserted separately.
export const assertEvaluationQuestionsAreWellFormed = (
  questions: Record<string, AiEvaluationModelQuestion>,
): void => {
  const questionIds = Object.keys(questions);

  if (questionIds.length === 0) {
    throw new AiException(
      'An evaluation needs at least one question',
      AiExceptionCode.INVALID_EVALUATION_REQUEST,
    );
  }

  for (const questionId of questionIds) {
    const question = questions[questionId];

    if (!isNonEmptyString(questionId)) {
      throw new AiException(
        'Every question needs a non-empty id',
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }

    if (
      typeof question.instructions === 'string' &&
      !isNonEmptyString(question.instructions)
    ) {
      throw new AiException(
        `Question "${questionId}" has no instructions`,
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }

    if (
      question.type === 'choice' &&
      Object.keys(question.criteria).length === 0
    ) {
      throw new AiException(
        `Choice question "${questionId}" has no options`,
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }

    // A one-level rubric has nothing to grade between, and the spec floors it
    // at two because a score is a position on that ladder.
    if (question.type === 'score' && question.criteria.length < 2) {
      throw new AiException(
        `Score question "${questionId}" needs at least two levels`,
        AiExceptionCode.INVALID_EVALUATION_REQUEST,
      );
    }
  }
};
