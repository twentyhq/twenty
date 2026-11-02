import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export const configureChatParticipationModels = () => {
  const registry = getAppProviderByClassName<AiModelRegistryService>(
    'AiModelRegistryService',
  );
  const languageModel = createScriptedLanguageModel(() => ({
    content: [{ type: 'text', text: 'Ada answered the message.' }],
    finishReason: { unified: 'stop', raw: undefined },
    usage: {
      inputTokens: {
        total: 1,
        noCache: 1,
        cacheRead: undefined,
        cacheWrite: undefined,
      },
      outputTokens: { total: 1, text: 1, reasoning: undefined },
    },
  }));
  const registeredModel: RegisteredAiModel = {
    modelId: TEST_AI_MODEL_ID,
    sdkPackage: '@ai-sdk/openai',
    model: languageModel,
  };
  const spies = [
    jest
      .spyOn(registry, 'getAvailableModels')
      .mockReturnValue([registeredModel]),
    jest.spyOn(registry, 'getModel').mockReturnValue(registeredModel),
    jest
      .spyOn(registry, 'resolveModelForAgent')
      .mockReturnValue(registeredModel),
  ];

  return {
    restore: () => {
      for (const spy of spies) {
        spy.mockRestore();
      }
    },
  };
};
