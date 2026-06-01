import { Injectable } from '@nestjs/common';

import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import {
  AiModelRegistryService,
  RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { getNativeModelToolsForSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-tools-for-sdk-package.util';

@Injectable()
export class AiModelConfigService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
  ) {}

  getReasoningProviderOptions(model: RegisteredAiModel): ProviderOptions {
    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC:
        return this.getAnthropicProviderOptions(model);
      case AI_SDK_BEDROCK:
        return this.getBedrockProviderOptions(model);
      default:
        return {};
    }
  }

  getNativeModelTools(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): ToolSet {
    const tools: Record<string, unknown> = {};

    const nativeTools = getNativeModelToolsForSdkPackage(model.sdkPackage);
    const providerName = model.providerName;

    if (!isDefined(nativeTools) || !isDefined(providerName)) {
      return tools as ToolSet;
    }

    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC: {
        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          const anthropicProvider =
            this.sdkProviderFactory.getRawAnthropicProvider(providerName);

          if (isDefined(anthropicProvider)) {
            tools[nativeTools.webSearch.directToolName] =
              anthropicProvider.tools.webSearch_20250305();
          }
        }

        break;
      }
      case AI_SDK_OPENAI: {
        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          const openaiProvider =
            this.sdkProviderFactory.getRawOpenAIProvider(providerName);

          if (isDefined(openaiProvider)) {
            tools[nativeTools.webSearch.directToolName] =
              openaiProvider.tools.webSearch();
          }
        }

        break;
      }
      case AI_SDK_XAI: {
        const xaiProvider =
          this.sdkProviderFactory.getRawXaiProvider(providerName);

        if (!isDefined(xaiProvider)) {
          break;
        }

        if (options.webSearch === true && isDefined(nativeTools.webSearch)) {
          tools[nativeTools.webSearch.directToolName] =
            xaiProvider.tools.webSearch();
        }

        if (
          options.twitterSearch === true &&
          isDefined(nativeTools.twitterSearch)
        ) {
          tools[nativeTools.twitterSearch.directToolName] =
            xaiProvider.tools.xSearch();
        }

        break;
      }
    }

    return tools as ToolSet;
  }

  private getAnthropicProviderOptions(
    model: RegisteredAiModel,
  ): ProviderOptions {
    if (!model.supportsReasoning) {
      return {};
    }

    return {
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
        },
      },
    };
  }

  private getBedrockProviderOptions(model: RegisteredAiModel): ProviderOptions {
    if (!model.supportsReasoning) {
      return {};
    }

    return {
      bedrock: {
        thinking: {
          type: 'enabled',
          budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
        },
      },
    };
  }
}
