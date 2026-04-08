import { Injectable } from '@nestjs/common';

import {
  createAmazonBedrock,
  type AmazonBedrockProvider,
} from '@ai-sdk/amazon-bedrock';
import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createXai } from '@ai-sdk/xai';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { type LanguageModel } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_OPENAI_COMPATIBLE,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
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
      AI_SDK_BEDROCK,
    );
  }

  getRawAnthropicProvider(providerName: string): AnthropicProvider | undefined {
    return this.getRawProvider<AnthropicProvider>(
      providerName,
      AI_SDK_ANTHROPIC,
    );
  }

  getRawOpenAIProvider(providerName: string): OpenAIProvider | undefined {
    return this.getRawProvider<OpenAIProvider>(providerName, AI_SDK_OPENAI);
  }

  clearCache(): void {
    this.providerInstances.clear();
  }

  private buildProviderInstance(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    switch (config.npm) {
      case AI_SDK_OPENAI:
        return this.buildStandardProvider(config, createOpenAI);
      case AI_SDK_ANTHROPIC:
        return this.buildStandardProvider(config, createAnthropic);
      case AI_SDK_GOOGLE:
        return this.buildStandardProvider(config, createGoogleGenerativeAI);
      case AI_SDK_MISTRAL:
        return this.buildStandardProvider(config, createMistral);
      case AI_SDK_XAI:
        return this.buildStandardProvider(config, createXai);
      case AI_SDK_BEDROCK:
        return this.buildBedrockProvider(config);
      case AI_SDK_OPENAI_COMPATIBLE:
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
    const region = config.region ?? 'us-east-1';
    const useRoleCredentials = config.authType === 'role';
    const awsCredentialProvider = useRoleCredentials
      ? fromNodeProviderChain({ clientConfig: { region } })
      : undefined;

    const provider = createAmazonBedrock({
      region,
      ...(awsCredentialProvider && {
        credentialProvider: async () => {
          const credentials = await awsCredentialProvider();

          return {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken,
          };
        },
      }),
      ...(!useRoleCredentials &&
        config.accessKeyId &&
        config.secretAccessKey && {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
          sessionToken: config.sessionToken,
        }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      sdkPackage: AI_SDK_BEDROCK,
    };
  }

  private buildOpenAICompatibleProvider(
    config: AiProviderConfig,
  ): AiSdkProviderInstance {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required for openai-compatible providers');
    }

    const provider = createOpenAICompatible({
      name: config.name ?? 'openai-compatible',
      baseURL: config.baseUrl,
      ...(config.apiKey && { apiKey: config.apiKey }),
    });

    return {
      createModel: (modelId: string) => provider(modelId),
      rawProvider: provider,
      sdkPackage: AI_SDK_OPENAI_COMPATIBLE,
    };
  }
}
