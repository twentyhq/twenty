import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model-config.type';
import { type AiEvaluationModelQuestion } from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

// A choice menu and a score rubric are capped differently, so each question
// type is measured against the limit that applies to it.
const getCriteriaLimit = ({
  question,
  modelConfig,
}: {
  question: AiEvaluationModelQuestion;
  modelConfig: AiEvaluationModelConfig;
}): { count: number; limit: number | undefined; noun: string } => {
  switch (question.type) {
    case 'choice':
      return {
        count: Object.keys(question.criteria).length,
        limit: modelConfig.maxCriteriaPerQuestion,
        noun: 'options',
      };
    case 'score':
      return {
        count: question.criteria.length,
        limit: modelConfig.maxScoreLevels,
        noun: 'levels',
      };
    case 'boolean':
      return { count: 0, limit: undefined, noun: 'criteria' };
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

    const { count, limit, noun } = getCriteriaLimit({ question, modelConfig });

    if (isDefined(limit) && count > limit) {
      throw new AiException(
        `Question "${questionId}" carries ${count} ${noun}, more than the ${limit} ${modelConfig.modelId} accepts`,
        AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
      );
    }
  }
};
