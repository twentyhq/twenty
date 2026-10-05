import { Injectable } from '@nestjs/common';

import { experimental_evaluate as evaluate } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { assertEvaluationQuestionsAreSupported } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-supported.util';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationRunnerOutput } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

// evaluate() rather than doEvaluate validates answers, so invalid ones are rejected before a workflow branches on them
@Injectable()
export class NativeEvaluationRunner {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async run({
    modelId,
    state,
    questions,
    abortSignal,
  }: { modelId: string } & Pick<
    AiEvaluationRequest,
    'state' | 'questions' | 'abortSignal'
  >): Promise<AiEvaluationRunnerOutput> {
    const registeredModel =
      this.aiModelRegistryService.getEvaluationModel(modelId);
    const modelConfig =
      this.aiModelRegistryService.getEvaluationModelConfig(modelId);

    if (!isDefined(registeredModel) || !isDefined(modelConfig)) {
      throw new AiException(
        `Evaluation model ${modelId} is not available. Check that its provider is configured and its SDK package installed.`,
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    assertEvaluationQuestionsAreSupported({ questions, modelConfig });

    const result = await evaluate({
      model: registeredModel.model,
      state,
      questions,
      // the workflow step owns retries
      maxRetries: 0,
      ...(isDefined(abortSignal) && { abortSignal }),
    });

    return {
      answers: result.answers,
      usage: {
        ...(isDefined(result.usage.inputTokens) && {
          inputTokens: result.usage.inputTokens,
        }),
        ...(isDefined(result.usage.outputTokens) && {
          outputTokens: result.usage.outputTokens,
        }),
      },
    };
  }
}
