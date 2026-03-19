import { Injectable } from '@nestjs/common';

import {
  createAmazonBedrock,
  type AmazonBedrockProvider,
} from '@ai-sdk/amazon-bedrock';
import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { type LanguageModel } from 'ai';

import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

export type AiSdkProviderInstance = {
  createModel: (modelId: string) => LanguageModel;
  // Raw SDK provider for accessing native tools (webSearch, etc.)
  rawProvider: unknown;
  providerType: AiProvider;
};

@Injectable()
export class SdkProviderFactoryService {
  private readonly providerInstances = new Map<string, AiSdkProviderInstance>();

  createProvider(
    providerName: string,
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    const cached = this.providerInstances.get(providerName);

    if (cached) {
      return cached;
    }

    const instance = this.buildProviderInstance(config);

    this.providerInstances.set(providerName, instance);

    return instance;
  }

  getProviderInstance(providerName: string): AiSdkProviderInstance | undefined {
    return this.providerInstances.get(providerName);
  }

  getRawProvider<T>(
    providerName: string,
    ...allowedTypes: AiProvider[]
  ): T | undefined {
    const instance = this.providerInstances.get(providerName);

    if (!instance || !allowedTypes.includes(instance.providerType)) {
      return undefined;
    }

    return instance.rawProvider as T;
  }

  getRawBedrockProvider(
    providerName: string,
  ): AmazonBedrockProvider | undefined {
    return this.getRawProvider<AmazonBedrockProvider>(
      providerName,
      AiProvider.BEDROCK,
    );
  }

  getRawAnthropicProvider(providerName: string): AnthropicProvider | undefined {
    return this.getRawProvider<AnthropicProvider>(
      providerName,
      AiProvider.ANTHROPIC,
    );
  }

  getRawOpenAIProvider(providerName: string): OpenAIProvider | undefined {
    return this.getRawProvider<OpenAIProvider>(
      providerName,
      AiProvider.OPENAI,
      AiProvider.OPENAI_COMPATIBLE,
    );
  }

  clearCache(): void {
    this.providerInstances.clear();
  }

  private buildProviderInstance(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    switch (config.type) {
      case AiProvider.OPENAI:
        return this.buildStandardProvider(config, createOpenAI);
      case AiProvider.ANTHROPIC:
        return this.buildStandardProvider(config, createAnthropic);
      case AiProvider.GOOGLE:
        return this.buildStandardProvider(config, createGoogleGenerativeAI);
      case AiProvider.MISTRAL:
        return this.buildStandardProvider(config, createMistral);
      case AiProvider.XAI:
        return this.buildStandardProvider(config, createXai);
      case AiProvider.GROQ:
        return this.buildStandardProvider(config, createGroq);
      case AiProvider.BEDROCK:
        return this.buildBedrockProvider(config);
      case AiProvider.OPENAI_COMPATIBLE:
        return this.buildOpenAICompatibleProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }
  }

  private buildStandardProvider(
    config: AiProviderConfig,
    factory: (opts: { apiKey?: string; baseURL?: string }) => CallableFunction,
  ): AiSdkProviderInstance {
    const provider = factory({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) =>
        (provider as CallableFunction)(modelId) as LanguageModel,
      rawProvider: provider,
      providerType: config.type,
    };
  }

  private buildBedrockProvider(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    const provider = createAmazonBedrock({
      region: config.region ?? 'us-east-1',
      ...(config.accessKeyId &&
        config.secretAccessKey && {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
          sessionToken: config.sessionToken,
        }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.BEDROCK,
    };
  }

  private buildOpenAICompatibleProvider(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required for openai-compatible providers');
    }

    const provider = createOpenAI({
      baseURL: config.baseUrl,
      apiKey: config.apiKey ?? '',
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.OPENAI_COMPATIBLE,
    };
  }
}
