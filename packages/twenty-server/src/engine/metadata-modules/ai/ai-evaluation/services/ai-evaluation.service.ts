import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { JEV_MODEL_ID } from 'twenty-shared/ai';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationResult } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { assertEvaluationQuestionsAreWellFormed } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-well-formed.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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

    const isJevAvailable =
      this.aiModelRegistryService.isModelAdminAllowed(JEV_MODEL_ID) &&
      isDefined(this.aiModelRegistryService.getEvaluationModel(JEV_MODEL_ID));

    if (!isJevAvailable) {
      throw new AiException(
        'Jev is unavailable. Configure the TypeSafe AI API key and enable Jev before running Classify.',
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    const modelId = JEV_MODEL_ID;

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

    return { modelId, answers, usage };
  }
}
