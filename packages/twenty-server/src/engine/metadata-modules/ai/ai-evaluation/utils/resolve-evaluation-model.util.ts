import { isNonEmptyString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationRunnerKind } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';

export type EvaluationModelCandidates = {
  requestedModelId?: string;
  // Whether the requested id names a model that can actually run, as opposed to
  // one the catalog merely declares.
  isRequestedRunnableEvaluationModel: boolean;
  isRequestedRunnableLanguageModel: boolean;
  isRequestedKnownEvaluationModel: boolean;
  defaultEvaluationModelId?: string;
  // Lazy: resolving the workspace default throws when no language model is
  // registered at all, and a run that lands on an evaluation model never needs
  // to ask.
  getDefaultLanguageModelId: () => string;
};

export type ResolvedEvaluationModel = {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
  // The pinned model that was passed over, so the caller can say why.
  skippedModelId?: string;
};

const resolveDefault = ({
  defaultEvaluationModelId,
  getDefaultLanguageModelId,
}: Pick<
  EvaluationModelCandidates,
  'defaultEvaluationModelId' | 'getDefaultLanguageModelId'
>): ResolvedEvaluationModel =>
  isNonEmptyString(defaultEvaluationModelId)
    ? { modelId: defaultEvaluationModelId, runnerKind: 'evaluation-model' }
    : { modelId: getDefaultLanguageModelId(), runnerKind: 'language-model' };

// Which model answers, and therefore which runner. Kept apart from the service
// so the decision is exercised on plain data rather than through the registry.
export const resolveEvaluationModel = ({
  requestedModelId,
  isRequestedRunnableEvaluationModel,
  isRequestedRunnableLanguageModel,
  isRequestedKnownEvaluationModel,
  defaultEvaluationModelId,
  getDefaultLanguageModelId,
}: EvaluationModelCandidates): ResolvedEvaluationModel => {
  if (
    !isNonEmptyString(requestedModelId) ||
    requestedModelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
  ) {
    return resolveDefault({
      defaultEvaluationModelId,
      getDefaultLanguageModelId,
    });
  }

  // Asked of the registries, not the catalog: an entry whose provider is
  // unconfigured or whose SDK package is absent has a config and no runnable
  // model, and routing on the config would hand the native runner an id it
  // cannot resolve.
  if (isRequestedRunnableEvaluationModel) {
    return { modelId: requestedModelId, runnerKind: 'evaluation-model' };
  }

  if (isRequestedRunnableLanguageModel) {
    return { modelId: requestedModelId, runnerKind: 'language-model' };
  }

  // A typo names nothing at all and stays an error. A model the catalog knows
  // but cannot run degrades like an unpinned step instead of failing the run.
  if (!isRequestedKnownEvaluationModel) {
    throw new AiException(
      `Model ${requestedModelId} is not available for classification.`,
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  return {
    ...resolveDefault({ defaultEvaluationModelId, getDefaultLanguageModelId }),
    skippedModelId: requestedModelId,
  };
};
