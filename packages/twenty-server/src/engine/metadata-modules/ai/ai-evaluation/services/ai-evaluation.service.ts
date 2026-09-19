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
      !isNonEmptyString(requestedModelId) ||
      requestedModelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
    ) {
      return this.resolveDefaultModel();
    }

    // Asked of the registry, not the config cache: a catalog entry whose
    // provider is unconfigured or whose SDK package is absent has a config and
    // no runnable model, and routing on the config would hand the native runner
    // an id it cannot resolve.
    if (
      isDefined(
        this.aiModelRegistryService.getEvaluationModel(requestedModelId),
      )
    ) {
      return { modelId: requestedModelId, runnerKind: 'evaluation-model' };
    }

    if (isDefined(this.aiModelRegistryService.getModel(requestedModelId))) {
      return { modelId: requestedModelId, runnerKind: 'language-model' };
    }

    // A typo names nothing at all and stays an error. A model the catalog knows
    // but cannot run degrades like an unpinned step instead of failing the run,
    // and runnerKind reports whatever ends up answering.
    if (
      !isDefined(
        this.aiModelRegistryService.getEvaluationModelConfig(requestedModelId),
      )
    ) {
      throw new AiException(
        `Model ${requestedModelId} is not available for classification.`,
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    this.logger.warn(
      `Evaluation model ${requestedModelId} is in the catalog but not runnable; check its provider credentials and that its SDK package is installed.`,
    );

    return this.resolveDefaultModel();
  }

  private resolveDefaultModel(): ResolvedEvaluationModel {
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
