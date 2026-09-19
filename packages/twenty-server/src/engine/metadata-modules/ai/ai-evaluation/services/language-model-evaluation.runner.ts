import { Injectable } from '@nestjs/common';

import { generateObject } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';
import { type AiEvaluationRunnerOutput } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-result.type';
import {
  buildEvaluationPrompt,
  EVALUATION_SYSTEM_PROMPT,
} from 'src/engine/metadata-modules/ai/ai-evaluation/utils/build-evaluation-prompt.util';
import { assertQuestionsSuitALanguageModel } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/assert-questions-suit-a-language-model.util';
import { buildEvaluationResponseSchema } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/build-evaluation-response-schema.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

// Answers the same questions on an ordinary language model, so a workspace with
// no evaluation provider still runs classification steps. The structured output
// keeps answers on-menu; it does not make them calibrated, which is why this
// runner reports no probabilities.
@Injectable()
export class LanguageModelEvaluationRunner {
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
    assertQuestionsSuitALanguageModel(questions);

    const registeredModel = this.aiModelRegistryService.getModel(modelId);

    if (!isDefined(registeredModel)) {
      throw new AiException(
        `Model ${modelId} is not available.`,
        AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
      );
    }

    const { object, usage } = await generateObject({
      model: registeredModel.model,
      schema: buildEvaluationResponseSchema(questions),
      system: EVALUATION_SYSTEM_PROMPT,
      prompt: buildEvaluationPrompt({ state, questions }),
      ...(isDefined(abortSignal) && { abortSignal }),
    });

    return {
      answers: object.answers,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      },
    };
  }
}
