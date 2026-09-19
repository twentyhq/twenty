import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model-config.type';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

const countCriteria = (question: AiEvaluationModelQuestion): number => {
  switch (question.type) {
    case 'choice':
      return Object.keys(question.criteria).length;
    case 'score':
      return question.criteria.length;
    case 'boolean':
      return 0;
  }
};

// Capabilities are declared in the catalog rather than inferred, so a request a
// model cannot serve is refused before any network call is made.
export const assertEvaluationQuestionsAreSupported = ({
  questions,
  modelConfig,
}: {
  questions: Record<string, AiEvaluationModelQuestion>;
  modelConfig: AiEvaluationModelConfig;
}): void => {
  for (const [questionId, question] of Object.entries(questions)) {
    if (!modelConfig.supportedQuestionTypes.includes(question.type)) {
      throw new AiException(
        `Model ${modelConfig.modelId} cannot answer "${question.type}" questions (asked by "${questionId}")`,
        AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      );
    }

    const { maxCriteriaPerQuestion } = modelConfig;

    if (
      isDefined(maxCriteriaPerQuestion) &&
      countCriteria(question) > maxCriteriaPerQuestion
    ) {
      throw new AiException(
        `Question "${questionId}" carries more than the ${maxCriteriaPerQuestion} criteria ${modelConfig.modelId} accepts`,
        AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      );
    }
  }
};
