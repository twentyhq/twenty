import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { isAdaptiveThinkingClaudeModel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-adaptive-thinking-claude-model.util';

export const buildReasoningProviderOptions = (model: {
  modelId: string;
  sdkPackage: AiSdkPackage;
  supportsReasoning?: boolean;
}): ProviderOptions => {
  if (
    !model.supportsReasoning ||
    !isAdaptiveThinkingClaudeModel(model.modelId)
  ) {
    return {};
  }

  switch (model.sdkPackage) {
    case AI_SDK_ANTHROPIC:
      return { anthropic: { thinking: { type: 'adaptive' } } };
    case AI_SDK_BEDROCK:
      return { bedrock: { reasoningConfig: { type: 'adaptive' } } };
    default:
      return {};
  }
};
