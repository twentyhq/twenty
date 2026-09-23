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

// Runs the questions on a model built for them, through the SDK's evaluate()
// rather than the provider's doEvaluate directly: it validates the answers
// against the questions asked, so an off-menu option or a distribution that
// does not sum to one is rejected before a workflow can branch on it.
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
      // The workflow step owns retries, so a failure surfaces to it instead of
      // being spent silently here.
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
