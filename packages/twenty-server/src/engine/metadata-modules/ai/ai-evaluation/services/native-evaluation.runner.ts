import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { assertEvaluationQuestionsAreSupported } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-evaluation-questions-are-supported.util';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationRunnerOutput } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

// Runs the questions on a model built for them. The provider decides every
// answer against the declared criteria, so nothing here parses text.
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
  }: Required<Pick<AiEvaluationRequest, 'modelId' | 'state' | 'questions'>> &
    Pick<
      AiEvaluationRequest,
      'abortSignal'
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

    const result = await registeredModel.model.doEvaluate({
      state,
      questions,
      ...(isDefined(abortSignal) && { abortSignal }),
    });

    return {
      answers: result.answers,
      usage: result.usage ?? {},
    };
  }
}
