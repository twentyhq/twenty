import { Injectable } from '@nestjs/common';

import {
  createAmazonBedrock,
  type AmazonBedrockProvider,
} from '@ai-sdk/amazon-bedrock';
import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { type LanguageModel } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';

export type AiSdkProviderInstance = {
  createModel: (modelId: string) => LanguageModel;
  rawProvider: unknown;
  sdkPackage: AiSdkPackage;
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

  getRawProvider<T>(
    providerName: string,
    ...allowedPackages: string[]
  ): T | undefined {
    const instance = this.providerInstances.get(providerName);

    if (!instance || !allowedPackages.includes(instance.sdkPackage)) {
      return undefined;
    }

    return instance.rawProvider as T;
  }

  getRawBedrockProvider(
    providerName: string,
  ): AmazonBedrockProvider | undefined {
    return this.getRawProvider<AmazonBedrockProvider>(
      providerName,
      '@ai-sdk/amazon-bedrock',
    );
  }

  getRawAnthropicProvider(providerName: string): AnthropicProvider | undefined {
    return this.getRawProvider<AnthropicProvider>(
      providerName,
      '@ai-sdk/anthropic',
    );
  }

  getRawOpenAIProvider(providerName: string): OpenAIProvider | undefined {
    return this.getRawProvider<OpenAIProvider>(
      providerName,
      '@ai-sdk/openai',
      '@ai-sdk/openai-compatible',
    );
  }

  clearCache(): void {
    this.providerInstances.clear();
  }

  private buildProviderInstance(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    switch (config.npm) {
      case '@ai-sdk/openai':
        return this.buildStandardProvider(config, createOpenAI);
      case '@ai-sdk/anthropic':
        return this.buildStandardProvider(config, createAnthropic);
      case '@ai-sdk/google':
        return this.buildStandardProvider(config, createGoogleGenerativeAI);
      case '@ai-sdk/mistral':
        return this.buildStandardProvider(config, createMistral);
      case '@ai-sdk/xai':
        return this.buildStandardProvider(config, createXai);
      case '@ai-sdk/amazon-bedrock':
        return this.buildBedrockProvider(config);
      case '@ai-sdk/openai-compatible':
        return this.buildOpenAICompatibleProvider(config);
      default:
        throw new Error(`Unsupported SDK package: ${config.npm}`);
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
      sdkPackage: config.npm,
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
      sdkPackage: '@ai-sdk/amazon-bedrock',
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
      sdkPackage: '@ai-sdk/openai-compatible',
    };
  }
}
