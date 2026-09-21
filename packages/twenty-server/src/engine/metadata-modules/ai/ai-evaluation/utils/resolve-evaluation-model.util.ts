import { isNonEmptyString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationRunnerKind } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';

export type EvaluationModelCandidates = {
  requestedModelId?: string;
  allowLanguageModelFallback?: boolean;
  // Whether the requested id names a model that can actually run, as opposed to
  // one the catalog merely declares.
  isRequestedRunnableEvaluationModel: boolean;
  isRequestedRunnableLanguageModel: boolean;
  isRequestedKnownEvaluationModel: boolean;
  // Administrators can withdraw a model instance-wide; a step must not be a way
  // around that.
  isRequestedAdminAllowed: boolean;
  defaultEvaluationModelId?: string;
  // Lazy: resolving the workspace default throws when no language model is
  // registered at all, and a run that lands on an evaluation model never needs
  // to ask.
  getDefaultLanguageModelId: () => string;
};

export type ResolvedEvaluationModel = {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
};

// Which model answers, and therefore which runner. Kept apart from the service
// so the decision is exercised on plain data rather than through the registry.
//
// A step either names a model or it does not, and the two mean different
// things. Naming one is a decision about cost, where the data goes and whether
// answers come back calibrated, so it is honoured exactly or the run fails.
// Naming none opts into whatever the workspace has, which is what lets a
// workflow written before any evaluation provider existed start using one.
export const resolveEvaluationModel = ({
  requestedModelId,
  allowLanguageModelFallback = true,
  isRequestedRunnableEvaluationModel,
  isRequestedRunnableLanguageModel,
  isRequestedKnownEvaluationModel,
  isRequestedAdminAllowed,
  defaultEvaluationModelId,
  getDefaultLanguageModelId,
}: EvaluationModelCandidates): ResolvedEvaluationModel => {
  if (
    !isNonEmptyString(requestedModelId) ||
    requestedModelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
  ) {
    if (
      !isNonEmptyString(defaultEvaluationModelId) &&
      !allowLanguageModelFallback
    ) {
      throw new AiException(
        'Choose a language model explicitly or configure an evaluation model for this Classify step.',
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    return isNonEmptyString(defaultEvaluationModelId)
      ? { modelId: defaultEvaluationModelId, runnerKind: 'evaluation-model' }
      : { modelId: getDefaultLanguageModelId(), runnerKind: 'language-model' };
  }

  if (!isRequestedAdminAllowed) {
    throw new AiException(
      `Model ${requestedModelId} has been disabled for this instance. Pick another model for this step.`,
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  // Asked of the registries, not the catalog: an entry whose provider is
  // unconfigured has a config and no runnable model, and routing on the config
  // would hand the native runner an id it cannot resolve.
  if (isRequestedRunnableEvaluationModel) {
    return { modelId: requestedModelId, runnerKind: 'evaluation-model' };
  }

  if (isRequestedRunnableLanguageModel) {
    return { modelId: requestedModelId, runnerKind: 'language-model' };
  }

  if (isRequestedKnownEvaluationModel) {
    throw new AiException(
      `Model ${requestedModelId} is in the catalog but its provider is not configured, so this step cannot run on it. Configure the provider, or clear the model to use the workspace default.`,
      AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
    );
  }

  throw new AiException(
    `Model ${requestedModelId} is not available for classification.`,
    AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
  );
};
