import { Injectable, Logger } from '@nestjs/common';

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
import { getNativeModelToolsForSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-tools-for-sdk-package.util';
import {
  AiModelRegistryService,
  RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeModelBinding } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-binding.type';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

@Injectable()
export class AiModelConfigService {
  private readonly logger = new Logger(AiModelConfigService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
  ) {}

  getNativeModelBinding(
    model: RegisteredAiModel,
    options: NativeModelToolOptions = {},
  ): NativeModelBinding {
    return {
      tools: this.getNativeModelTools(model, options),
      providerOptions: this.getNativeSearchProviderOptions(model, options),
    };
  }

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

  private getNativeModelTools(
    model: RegisteredAiModel,
    options: NativeModelToolOptions,
  ): ToolSet {
    const tools: Record<string, unknown> = {};

    if (options.webSearch !== true) {
      return tools as ToolSet;
    }

    const webSearchTool = getNativeModelToolsForSdkPackage(
      model.sdkPackage,
    )?.webSearch;

    if (!isDefined(webSearchTool)) {
      this.logger.warn(
        `webSearch requested for sdkPackage="${model.sdkPackage}" but no native binding is registered. Skipping.`,
      );

      return tools as ToolSet;
    }

    // provider-option bindings (e.g. xAI) are handled in getNativeSearchProviderOptions
    if (webSearchTool.kind !== 'sdk-tool') {
      return tools as ToolSet;
    }

    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC: {
        const anthropicProvider = model.providerName
          ? this.sdkProviderFactory.getRawAnthropicProvider(model.providerName)
          : undefined;

        if (anthropicProvider) {
          tools[webSearchTool.directToolName] =
            anthropicProvider.tools.webSearch_20250305();
        }

        break;
      }
      case AI_SDK_OPENAI: {
        const openaiProvider = model.providerName
          ? this.sdkProviderFactory.getRawOpenAIProvider(model.providerName)
          : undefined;

        if (openaiProvider) {
          tools[webSearchTool.directToolName] =
            openaiProvider.tools.webSearch();
        }

        break;
      }
    }

    return tools as ToolSet;
  }

  private getNativeSearchProviderOptions(
    model: RegisteredAiModel,
    options: NativeModelToolOptions,
  ): ProviderOptions {
    switch (model.sdkPackage) {
      case AI_SDK_XAI:
        return this.getXaiSearchProviderOptions(options);
      default:
        return {};
    }
  }

  private getXaiSearchProviderOptions(
    options: NativeModelToolOptions,
  ): ProviderOptions {
    const webSearchEnabled = options.webSearch === true;
    const twitterSearchEnabled = options.twitterSearch === true;

    if (!webSearchEnabled && !twitterSearchEnabled) {
      return {};
    }

    const sources: Array<{ type: string }> = [];
    const xaiTools = getNativeModelToolsForSdkPackage(AI_SDK_XAI);
    const webSearchTool = xaiTools?.webSearch;
    const twitterSearchTool = xaiTools?.twitterSearch;

    if (webSearchEnabled) {
      if (webSearchTool?.kind === 'provider-option') {
        sources.push({ type: webSearchTool.providerOptionKey });
      } else {
        this.logger.warn(
          `webSearch requested for xAI but no provider-option binding is registered. Skipping.`,
        );
      }
    }

    if (twitterSearchEnabled) {
      if (twitterSearchTool?.kind === 'provider-option') {
        sources.push({ type: twitterSearchTool.providerOptionKey });
      } else {
        this.logger.warn(
          `twitterSearch requested for xAI but no provider-option binding is registered. Skipping.`,
        );
      }
    }

    return {
      xai: {
        searchParameters: {
          mode: 'auto',
          ...(sources.length > 0 && { sources }),
        },
      },
    };
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
