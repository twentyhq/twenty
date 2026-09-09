import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { getClaudeReasoningConfig } from 'src/engine/metadata-modules/ai/ai-models/utils/get-claude-reasoning-config.util';

export const buildReasoningProviderOptions = (model: {
  modelId: string;
  sdkPackage: AiSdkPackage;
  supportsReasoning?: boolean;
}): ProviderOptions => {
  if (!model.supportsReasoning) {
    return {};
  }

  switch (model.sdkPackage) {
    case AI_SDK_ANTHROPIC:
      return {
        anthropic: { thinking: getClaudeReasoningConfig(model.modelId) },
      };
    case AI_SDK_BEDROCK:
      // Bedrock also serves Llama, Nova and DeepSeek, which take no Claude
      // reasoning config.
      return model.modelId.includes('anthropic.claude-')
        ? {
            bedrock: {
              reasoningConfig: getClaudeReasoningConfig(model.modelId),
            },
          }
        : {};
    default:
      return {};
  }
};
