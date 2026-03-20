import { Injectable } from '@nestjs/common';

import { type AmazonBedrockProvider } from '@ai-sdk/amazon-bedrock';
import { type AnthropicProvider } from '@ai-sdk/anthropic';
import { type OpenAIProvider } from '@ai-sdk/openai';
import { ProviderOptions } from '@ai-sdk/provider-utils';
import { ToolSet } from 'ai';

import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import {
  AiModelRegistryService,
  RegisteredAIModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

@Injectable()
export class AgentModelConfigService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
  ) {}

  getProviderOptions(
    model: RegisteredAIModel,
    agent: FlatAgentWithRoleId,
  ): ProviderOptions {
    switch (model.sdkPackage) {
      case '@ai-sdk/xai':
        return this.getXaiProviderOptions(agent);
      case '@ai-sdk/anthropic':
        return this.getAnthropicProviderOptions(model);
      case '@ai-sdk/amazon-bedrock':
        return this.getBedrockProviderOptions(model);
      default:
        return {};
    }
  }

  getNativeModelTools(
    model: RegisteredAIModel,
    agent: FlatAgentWithRoleId,
  ): ToolSet {
    const tools: ToolSet = {};

    if (!agent.modelConfiguration) {
      return tools;
    }

    switch (model.sdkPackage) {
      case '@ai-sdk/anthropic':
        if (agent.modelConfiguration.webSearch?.enabled) {
          const anthropicProvider = this.getAnthropicProviderForModel(model);

          if (anthropicProvider) {
            tools.web_search = anthropicProvider.tools.webSearch_20250305();
          }
        }
        break;
      case '@ai-sdk/amazon-bedrock': {
        if (agent.modelConfiguration.webSearch?.enabled) {
          const bedrockProvider = this.getBedrockProviderForModel(model);

          if (bedrockProvider) {
            tools.web_search =
              bedrockProvider.tools.webSearch_20250305() as ToolSet[string];
          }
        }
        break;
      }
      case '@ai-sdk/openai':
        if (agent.modelConfiguration.webSearch?.enabled) {
          const openaiProvider = this.getOpenAIProviderForModel(model);

          if (openaiProvider) {
            tools.web_search = openaiProvider.tools.webSearch();
          }
        }
        break;
    }

    return tools;
  }

  private getAnthropicProviderForModel(
    model: RegisteredAIModel,
  ): AnthropicProvider | undefined {
    if (!model.providerName) {
      return undefined;
    }

    return this.sdkProviderFactory.getRawAnthropicProvider(model.providerName);
  }

  private getBedrockProviderForModel(
    model: RegisteredAIModel,
  ): AmazonBedrockProvider | undefined {
    if (!model.providerName) {
      return undefined;
    }

    return this.sdkProviderFactory.getRawBedrockProvider(model.providerName);
  }

  private getOpenAIProviderForModel(
    model: RegisteredAIModel,
  ): OpenAIProvider | undefined {
    if (!model.providerName) {
      return undefined;
    }

    return this.sdkProviderFactory.getRawOpenAIProvider(model.providerName);
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
    model: RegisteredAIModel,
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

  private getBedrockProviderOptions(model: RegisteredAIModel): ProviderOptions {
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
