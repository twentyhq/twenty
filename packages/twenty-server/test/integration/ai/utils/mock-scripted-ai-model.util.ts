import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { type ScriptedModelResponse } from 'test/utils/scripted-model-response.type';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export const SCRIPTED_MODEL_USAGE = {
  inputTokens: {
    total: 12,
    noCache: 12,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 3, text: 3, reasoning: undefined },
};

export const answerWith = (text: string): ScriptedModelResponse => ({
  content: [{ type: 'text', text }],
  finishReason: { unified: 'stop', raw: undefined },
  usage: SCRIPTED_MODEL_USAGE,
});

export const mockScriptedAiModel = (
  respond: (callIndex: number) => ScriptedModelResponse,
) => {
  const offeredToolNamesByCall: string[][] = [];
  const model = createScriptedLanguageModel((options, callIndex) => {
    offeredToolNamesByCall.push((options.tools ?? []).map((tool) => tool.name));

    return respond(callIndex);
  });

  jest
    .spyOn(
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      ),
      'resolveModelForAgent',
    )
    .mockReturnValue({
      modelId: TEST_AI_MODEL_ID,
      sdkPackage: '@ai-sdk/openai',
      model,
    } as unknown as RegisteredAiModel);

  return offeredToolNamesByCall;
};
