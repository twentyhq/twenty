import { Injectable } from '@nestjs/common';

import { ProviderOptions } from '@ai-sdk/provider-utils';
import { ToolSet } from 'ai';

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
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

@Injectable()
export class AiModelConfigService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
  ) {}

  getProviderOptions(
    model: RegisteredAiModel,
    agent: FlatAgentWithRoleId,
  ): ProviderOptions {
    switch (model.sdkPackage) {
      case AI_SDK_XAI:
        return this.getXaiProviderOptions(agent);
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
    options: NativeModelToolOptions,
  ): ToolSet {
    const tools: Record<string, unknown> = {};

    if (!options.webSearchEnabled) {
      return tools as ToolSet;
    }

    switch (model.sdkPackage) {
      case AI_SDK_ANTHROPIC: {
        const anthropicProvider = model.providerName
          ? this.sdkProviderFactory.getRawAnthropicProvider(model.providerName)
          : undefined;

        if (anthropicProvider) {
          tools.web_search = anthropicProvider.tools.webSearch_20250305();
        }

        break;
      }
      case AI_SDK_OPENAI: {
        const openaiProvider = model.providerName
          ? this.sdkProviderFactory.getRawOpenAIProvider(model.providerName)
          : undefined;

        if (openaiProvider) {
          tools.web_search = openaiProvider.tools.webSearch();
        }

        break;
      }
    }

    return tools as ToolSet;
  }

  private getXaiProviderOptions(agent: FlatAgentWithRoleId): ProviderOptions {
    if (
      !agent.modelConfiguration ||
      (!agent.modelConfiguration.webSearch?.enabled &&
        !agent.modelConfiguration.twitterSearch?.enabled)
    ) {
      return {};
    }

    const sources: Array<{ type: string }> = [];

    if (agent.modelConfiguration.webSearch?.enabled) {
      sources.push({ type: 'web' });
    }

    if (agent.modelConfiguration.twitterSearch?.enabled) {
      sources.push({ type: 'x' });
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
