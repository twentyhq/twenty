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

import {
  AiProvider,
  type AiProviderConfig,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

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

  getRawBedrockProvider(
    providerName: string,
  ): AmazonBedrockProvider | undefined {
    const instance = this.providerInstances.get(providerName);

    if (instance?.providerType !== AiProvider.BEDROCK) {
      return undefined;
    }

    return instance.rawProvider as AmazonBedrockProvider;
  }

  getRawAnthropicProvider(providerName: string): AnthropicProvider | undefined {
    const instance = this.providerInstances.get(providerName);

    if (instance?.providerType !== AiProvider.ANTHROPIC) {
      return undefined;
    }

    return instance.rawProvider as AnthropicProvider;
  }

  getRawOpenAIProvider(providerName: string): OpenAIProvider | undefined {
    const instance = this.providerInstances.get(providerName);

    if (
      instance?.providerType !== AiProvider.OPENAI &&
      instance?.providerType !== AiProvider.OPENAI_COMPATIBLE
    ) {
      return undefined;
    }

    return instance.rawProvider as OpenAIProvider;
  }

  clearCache(): void {
    this.providerInstances.clear();
  }

  private buildProviderInstance(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    switch (config.type) {
      case AiProvider.OPENAI:
        return this.buildOpenAIProvider(config);
      case AiProvider.ANTHROPIC:
        return this.buildAnthropicProvider(config);
      case AiProvider.BEDROCK:
        return this.buildBedrockProvider(config);
      case AiProvider.GOOGLE:
        return this.buildGoogleProvider(config);
      case AiProvider.MISTRAL:
        return this.buildMistralProvider(config);
      case AiProvider.XAI:
        return this.buildXaiProvider(config);
      case AiProvider.GROQ:
        return this.buildGroqProvider(config);
      case AiProvider.OPENAI_COMPATIBLE:
        return this.buildOpenAICompatibleProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }
  }

  private buildOpenAIProvider(config: AiProviderConfig): AiSdkProviderInstance {
    const provider = createOpenAI({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.OPENAI,
    };
  }

  private buildAnthropicProvider(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    const provider = createAnthropic({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.ANTHROPIC,
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

  private buildGoogleProvider(config: AiProviderConfig): AiSdkProviderInstance {
    const provider = createGoogleGenerativeAI({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.GOOGLE,
    };
  }

  private buildMistralProvider(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    const provider = createMistral({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.MISTRAL,
    };
  }

  private buildXaiProvider(config: AiProviderConfig): AiSdkProviderInstance {
    const provider = createXai({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.XAI,
    };
  }

  private buildGroqProvider(config: AiProviderConfig): AiSdkProviderInstance {
    const provider = createGroq({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      providerType: AiProvider.GROQ,
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
