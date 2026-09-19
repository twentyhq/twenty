import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { LanguageModelEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/language-model-evaluation.runner';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationResult } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { assertEvaluationQuestionsAreWellFormed } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-well-formed.util';
import {
  resolveEvaluationModel,
  type ResolvedEvaluationModel,
} from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-evaluation-model.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

// The one entry point for asking a model to decide something. Callers name a
// model or nothing at all; which kind of model answers is resolved here, so a
// feature written against this service keeps working whether or not the
// workspace has an evaluation provider configured.
@Injectable()
export class AiEvaluationService {
  private readonly logger = new Logger(AiEvaluationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly nativeEvaluationRunner: NativeEvaluationRunner,
    private readonly languageModelEvaluationRunner: LanguageModelEvaluationRunner,
    private readonly aiBillingService: AiBillingService,
  ) {}

  async evaluate({
    workspaceId,
    modelId: requestedModelId,
    state,
    questions,
    abortSignal,
  }: AiEvaluationRequest): Promise<AiEvaluationResult> {
    assertEvaluationQuestionsAreWellFormed(questions);

    const { modelId, runnerKind, skippedModelId } =
      this.resolveModel(requestedModelId);

    if (isNonEmptyString(skippedModelId)) {
      this.logger.warn(
        `Evaluation model ${skippedModelId} is in the catalog but not runnable; check its provider credentials and that its SDK package is installed. Classifying on ${modelId}.`,
      );
    }

    const runner =
      runnerKind === 'evaluation-model'
        ? this.nativeEvaluationRunner
        : this.languageModelEvaluationRunner;

    const { answers, usage } = await runner.run({
      modelId,
      state,
      questions,
      abortSignal,
    });

    await this.aiBillingService.calculateAndBillUsage(
      modelId,
      { usage },
      workspaceId,
      UsageOperationType.AI_WORKFLOW_TOKEN,
    );

    return { modelId, runnerKind, answers, usage };
  }

  // Gathers what the registries know, then hands the decision to the util.
  private resolveModel(requestedModelId?: string): ResolvedEvaluationModel {
    const pinnedModelId = isNonEmptyString(requestedModelId)
      ? requestedModelId
      : undefined;

    return resolveEvaluationModel({
      requestedModelId: pinnedModelId,
      isRequestedRunnableEvaluationModel:
        isDefined(pinnedModelId) &&
        isDefined(
          this.aiModelRegistryService.getEvaluationModel(pinnedModelId),
        ),
      isRequestedRunnableLanguageModel:
        isDefined(pinnedModelId) &&
        isDefined(this.aiModelRegistryService.getModel(pinnedModelId)),
      isRequestedKnownEvaluationModel:
        isDefined(pinnedModelId) &&
        isDefined(
          this.aiModelRegistryService.getEvaluationModelConfig(pinnedModelId),
        ),
      defaultEvaluationModelId:
        this.aiModelRegistryService.getDefaultEvaluationModel()?.modelId,
      getDefaultLanguageModelId: () =>
        this.aiModelRegistryService.getEffectiveModelConfig(
          AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
        ).modelId,
    });
  }
}
