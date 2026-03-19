import { Injectable, Logger } from '@nestjs/common';

import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';

const OPENAI_COMPATIBLE_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com',
  groq: 'https://api.groq.com/openai',
  xai: 'https://api.x.ai',
  mistral: 'https://api.mistral.ai',
};

export type DiscoveredModel = {
  modelId: string;
  name: string;
};

type DiscoveryStrategy = (
  config: AiProviderConfig,
) => Promise<DiscoveredModel[]>;

@Injectable()
export class ProviderDiscoveryService {
  private readonly logger = new Logger(ProviderDiscoveryService.name);

  private readonly strategies: Record<string, DiscoveryStrategy> = {
    openai: (config) => this.discoverOpenAICompatible(config),
    'openai-compatible': (config) => this.discoverOpenAICompatible(config),
    groq: (config) => this.discoverOpenAICompatible(config),
    xai: (config) => this.discoverOpenAICompatible(config),
    mistral: (config) => this.discoverOpenAICompatible(config),
    google: (config) => this.discoverGoogleModels(config),
    anthropic: () => this.discoverAnthropicModels(),
    bedrock: (config) => this.discoverBedrockModels(config),
  };

  async discoverModels(config: AiProviderConfig): Promise<DiscoveredModel[]> {
    const strategy = this.strategies[config.type];

    if (!strategy) {
      this.logger.warn(
        `No discovery strategy for provider type: ${config.type}`,
      );

      return [];
    }

    try {
      const models = await strategy(config);

      this.logger.log(
        `Discovery for ${config.type}: found ${models.length} models`,
      );

      return models;
    } catch (error) {
      this.logger.error(
        `Model discovery failed for ${config.type}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return [];
    }
  }

  // OpenAI-compatible: GET /v1/models
  // Works for OpenAI, Groq, xAI, Mistral, and any OpenAI-compatible gateway
  private async discoverOpenAICompatible(
    config: AiProviderConfig,
  ): Promise<DiscoveredModel[]> {
    const baseUrl =
      config.baseUrl ??
      OPENAI_COMPATIBLE_BASE_URLS[config.type] ??
      'https://api.openai.com';

    const url = `${baseUrl.replace(/\/$/, '')}/v1/models`;

    this.logger.log(`Discovering models from ${config.type} at ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');

      throw new Error(
        `${response.status} ${response.statusText}: ${body.slice(0, 200)}`,
      );
    }

    const data = (await response.json()) as {
      data?: Array<{ id: string; name?: string }>;
    };

    if (!data.data || !Array.isArray(data.data)) {
      this.logger.warn(
        `Unexpected response format from ${config.type}: missing data array`,
      );

      return [];
    }

    const allModels = data.data.filter((model) => model.id);
    const languageModels = allModels.filter((model) =>
      this.isLanguageModel(model.id),
    );

    this.logger.log(
      `${config.type}: ${allModels.length} total models, ${languageModels.length} language models`,
    );

    return languageModels.map((model) => ({
      modelId: model.id,
      name: model.name ?? model.id,
    }));
  }

  // Google: GET /v1beta/models (Gemini API)
  private async discoverGoogleModels(
    config: AiProviderConfig,
  ): Promise<DiscoveredModel[]> {
    const baseUrl =
      config.baseUrl ?? 'https://generativelanguage.googleapis.com';
    const url = `${baseUrl}/v1beta/models?key=${config.apiKey}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      models?: Array<{ name: string; displayName?: string }>;
    };

    if (!data.models || !Array.isArray(data.models)) {
      return [];
    }

    return data.models
      .filter(
        (model) =>
          model.name.startsWith('models/') &&
          this.isLanguageModel(model.name.replace('models/', '')),
      )
      .map((model) => ({
        modelId: model.name.replace('models/', ''),
        name: model.displayName ?? model.name.replace('models/', ''),
      }));
  }

  // Anthropic: No public list endpoint, return known models
  private async discoverAnthropicModels(): Promise<DiscoveredModel[]> {
    return [
      { modelId: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
      { modelId: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { modelId: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
      { modelId: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ];
  }

  // Bedrock: use AWS SDK ListFoundationModels (simplified HTTP call)
  private async discoverBedrockModels(
    config: AiProviderConfig,
  ): Promise<DiscoveredModel[]> {
    // Bedrock discovery requires AWS SDK; for now, return known Anthropic models on Bedrock
    // Full AWS SDK integration can be added when needed
    const region = config.region ?? 'us-east-1';

    this.logger.log(
      `Bedrock discovery for region ${region}: returning known models`,
    );

    return [
      {
        modelId: 'anthropic.claude-opus-4-6-v1',
        name: 'Claude Opus 4.6 (Bedrock)',
      },
      {
        modelId: 'anthropic.claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6 (Bedrock)',
      },
    ];
  }

  // Filters out embedding, speech, image, and moderation models
  // based on well-known provider naming conventions
  private isLanguageModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    const nonLanguagePatterns = [
      'embed',
      'tts',
      'whisper',
      'dall-e',
      'moderation',
      'text-to-speech',
      'speech-to-text',
      'imagen',
      'aqa',
    ];

    return !nonLanguagePatterns.some((pattern) => id.includes(pattern));
  }
}
