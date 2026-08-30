import { Injectable } from '@nestjs/common';

import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic, type AnthropicProvider } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createXai, type XaiProvider } from '@ai-sdk/xai';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import {
  wrapLanguageModel,
  type LanguageModel,
  type LanguageModelMiddleware,
  type TranscriptionModel,
} from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_OPENAI_COMPATIBLE,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { sanitizeGeminiToolResultRefsMiddleware } from 'src/engine/metadata-modules/ai/ai-models/middleware/sanitize-gemini-tool-result-refs.middleware';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { getTranscriptionModelFactory } from 'src/engine/metadata-modules/ai/ai-models/utils/get-transcription-model-factory.util';

export type AiSdkProviderInstance = {
  createModel: (modelId: string) => LanguageModel;
  // Absent on providers with no speech-to-text API.
  createTranscriptionModel?: (modelId: string) => TranscriptionModel;
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

  getRawAnthropicProvider(providerName: string): AnthropicProvider | undefined {
    return this.getRawProvider<AnthropicProvider>(
      providerName,
      AI_SDK_ANTHROPIC,
    );
  }

  getRawOpenAIProvider(providerName: string): OpenAIProvider | undefined {
    return this.getRawProvider<OpenAIProvider>(providerName, AI_SDK_OPENAI);
  }

  getRawXaiProvider(providerName: string): XaiProvider | undefined {
    return this.getRawProvider<XaiProvider>(providerName, AI_SDK_XAI);
  }

  clearCache(): void {
    this.providerInstances.clear();
  }

  private toProviderInstance(
    provider: unknown,
    sdkPackage: AiSdkPackage,
    createModel: (modelId: string) => LanguageModel,
  ): AiSdkProviderInstance {
    const createTranscriptionModel = getTranscriptionModelFactory(provider);

    return {
      createModel,
      ...(isDefined(createTranscriptionModel) && { createTranscriptionModel }),
      rawProvider: provider,
      sdkPackage,
    };
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
        return this.buildStandardProvider(config, createGoogleGenerativeAI, {
          middleware: sanitizeGeminiToolResultRefsMiddleware,
        });
      case AI_SDK_MISTRAL:
        return this.buildStandardProvider(config, createMistral);
      case AI_SDK_XAI:
        return this.buildXaiProvider(config);
      case AI_SDK_BEDROCK:
        return this.buildBedrockProvider(config);
      case AI_SDK_OPENAI_COMPATIBLE:
        return this.buildOpenAiCompatibleProvider(config);
      case AI_SDK_AZURE:
        return this.buildAzureProvider(config);
      default:
        throw new Error(`Unsupported SDK package: ${config.npm}`);
    }
  }

  private buildStandardProvider(
    config: AiProviderConfig,
    factory: (opts: { apiKey?: string; baseURL?: string }) => CallableFunction,
    options?: { middleware?: LanguageModelMiddleware },
  ): AiSdkProviderInstance {
    const provider = factory({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return this.toProviderInstance(provider, config.npm, (modelId: string) => {
      const model = (provider as CallableFunction)(modelId);

      return options?.middleware
        ? wrapLanguageModel({ model, middleware: options.middleware })
        : model;
    });
  }

  private buildXaiProvider(config: AiProviderConfig): AiSdkProviderInstance {
    const provider = createXai({
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseURL: config.baseUrl }),
    });

    return this.toProviderInstance(provider, AI_SDK_XAI, (modelId: string) =>
      provider.responses(modelId),
    );
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

    return this.toProviderInstance(
      provider,
      AI_SDK_BEDROCK,
      (modelId: string) => provider(modelId),
    );
  }

  private buildOpenAiCompatibleProvider(
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

    return this.toProviderInstance(
      provider,
      AI_SDK_OPENAI_COMPATIBLE,
      (modelId: string) => provider(modelId),
    );
  }

  private buildAzureProvider(config: AiProviderConfig): AiSdkProviderInstance {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required for Azure OpenAI providers');
    }

    const provider = createAzure({
      baseURL: config.baseUrl,
      ...(config.apiKey && { apiKey: config.apiKey }),
    });

    return this.toProviderInstance(provider, AI_SDK_AZURE, (modelId: string) =>
      provider(modelId),
    );
  }
}
