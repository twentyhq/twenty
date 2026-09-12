import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { isDefined } from 'twenty-shared/utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { isAdaptiveThinkingClaudeModel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-adaptive-thinking-claude-model.util';

export const buildReasoningProviderOptions = (
  model: Pick<
    RegisteredAiModel,
    'modelId' | 'sdkPackage' | 'supportsReasoning' | 'effort'
  >,
): ProviderOptions => {
  const { effort } = model;
  const thinksAdaptively =
    model.supportsReasoning && isAdaptiveThinkingClaudeModel(model.modelId);

  switch (model.sdkPackage) {
    case AI_SDK_ANTHROPIC:
      if (!thinksAdaptively && !isDefined(effort)) {
        return {};
      }

      return {
        anthropic: {
          ...(thinksAdaptively ? { thinking: { type: 'adaptive' } } : {}),
          ...(isDefined(effort) ? { effort } : {}),
        },
      };
    case AI_SDK_BEDROCK:
      if (!thinksAdaptively) {
        return {};
      }

      return {
        bedrock: {
          reasoningConfig: {
            type: 'adaptive',
            ...(isDefined(effort) ? { maxReasoningEffort: effort } : {}),
          },
        },
      };
    case AI_SDK_OPENAI:
      return isDefined(effort) ? { openai: { reasoningEffort: effort } } : {};
    case AI_SDK_AZURE:
      return isDefined(effort) ? { azure: { reasoningEffort: effort } } : {};
    case AI_SDK_GOOGLE:
      return isDefined(effort)
        ? { google: { thinkingConfig: { thinkingLevel: effort } } }
        : {};
    case AI_SDK_MISTRAL:
      return isDefined(effort) ? { mistral: { reasoningEffort: effort } } : {};
    case AI_SDK_XAI:
      return isDefined(effort) ? { xai: { reasoningEffort: effort } } : {};
    default:
      return {};
  }
};
