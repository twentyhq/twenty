import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationResult } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { assertEvaluationQuestionsAreWellFormed } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-well-formed.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { resolveJevEvaluationModelIdOrThrow } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-jev-evaluation-model-id-or-throw.util';
import { JEV_MODEL_ID } from 'twenty-shared/ai';

@Injectable()
export class AiEvaluationService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly nativeEvaluationRunner: NativeEvaluationRunner,
    private readonly aiBillingService: AiBillingService,
  ) {}

  async evaluate({
    workspaceId,
    userWorkspaceId,
    state,
    questions,
    abortSignal,
  }: AiEvaluationRequest): Promise<AiEvaluationResult> {
    assertEvaluationQuestionsAreWellFormed(questions);

    const modelId = resolveJevEvaluationModelIdOrThrow({
      isModelAvailable:
        this.aiModelRegistryService.isModelAdminAllowed(JEV_MODEL_ID) &&
        isDefined(this.aiModelRegistryService.getEvaluationModel(JEV_MODEL_ID)),
    });
    const runnerKind = 'evaluation-model' as const;

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: UsageOperationType.AI_WORKFLOW_TOKEN,
      spenders: { userWorkspaceId },
    });

    const { answers, usage } = await this.nativeEvaluationRunner.run({
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
      null,
      userWorkspaceId,
    );

    return { modelId, runnerKind, answers, usage };
  }
}
