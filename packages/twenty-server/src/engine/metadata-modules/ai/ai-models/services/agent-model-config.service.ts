import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { ProviderOptions } from '@ai-sdk/provider-utils';
import { ToolSet } from 'ai';

import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { ModelProvider } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { RegisteredAIModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

@Injectable()
export class AgentModelConfigService {
  constructor() {}

  getProviderOptions(
    model: RegisteredAIModel,
    agent: FlatAgentWithRoleId,
  ): ProviderOptions {
    switch (model.provider) {
      case ModelProvider.XAI:
        return this.getXaiProviderOptions(agent);
      case ModelProvider.ANTHROPIC:
        return this.getAnthropicProviderOptions(model);
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

    switch (model.provider) {
      case ModelProvider.ANTHROPIC:
        if (agent.modelConfiguration.webSearch?.enabled) {
          tools.web_search = anthropic.tools.webSearch_20250305();
        }
        break;
      case ModelProvider.OPENAI:
        if (agent.modelConfiguration.webSearch?.enabled) {
          tools.web_search = openai.tools.webSearch();
        }
        break;
    }

    return tools;
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
    if (!model.doesSupportThinking) {
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
}
