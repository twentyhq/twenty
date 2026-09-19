import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { LanguageModelEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/language-model-evaluation.runner';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import {
  type AiEvaluationResult,
  type AiEvaluationRunnerKind,
} from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { assertEvaluationQuestionsAreWellFormed } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-well-formed.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

type ResolvedEvaluationModel = {
  modelId: string;
  runnerKind: AiEvaluationRunnerKind;
};

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

    const { modelId, runnerKind } = this.resolveModel(requestedModelId);

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

  // An explicit id decides the runner on its own: whichever registry holds it
  // is the kind of model the operator picked.
  private resolveModel(requestedModelId?: string): ResolvedEvaluationModel {
    if (
      isNonEmptyString(requestedModelId) &&
      requestedModelId !== AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
    ) {
      if (
        isDefined(
          this.aiModelRegistryService.getEvaluationModelConfig(
            requestedModelId,
          ),
        )
      ) {
        return { modelId: requestedModelId, runnerKind: 'evaluation-model' };
      }

      if (isDefined(this.aiModelRegistryService.getModel(requestedModelId))) {
        return { modelId: requestedModelId, runnerKind: 'language-model' };
      }

      throw new AiException(
        `Model ${requestedModelId} is not available for classification.`,
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    const defaultEvaluationModel =
      this.aiModelRegistryService.getDefaultEvaluationModel();

    if (isDefined(defaultEvaluationModel)) {
      return {
        modelId: defaultEvaluationModel.modelId,
        runnerKind: 'evaluation-model',
      };
    }

    // No evaluation provider configured: the step still runs, on the model the
    // instance already uses for everything else.
    const fallbackModel = this.aiModelRegistryService.getEffectiveModelConfig(
      AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
    );

    this.logger.log(
      `No evaluation model configured; classifying on ${fallbackModel.modelId}.`,
    );

    return { modelId: fallbackModel.modelId, runnerKind: 'language-model' };
  }
}
