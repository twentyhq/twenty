import { type ProviderOptions } from '@ai-sdk/provider-utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_GOOGLE,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.constant';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

export const buildAiSearchAnswerProviderOptions = (
  model: Pick<RegisteredAiModel, 'sdkPackage' | 'supportsReasoning'>,
): ProviderOptions => {
  if (model.supportsReasoning !== true) {
    return {};
  }

  switch (model.sdkPackage) {
    case AI_SDK_GOOGLE:
      return { google: { thinkingConfig: { thinkingBudget: 0 } } };
    case AI_SDK_OPENAI:
      return { openai: { reasoningEffort: 'minimal' } };
    case AI_SDK_AZURE:
      return { azure: { reasoningEffort: 'minimal' } };
    case AI_SDK_ANTHROPIC:
      return { anthropic: { thinking: { type: 'disabled' } } };
    default:
      return {};
  }
};
