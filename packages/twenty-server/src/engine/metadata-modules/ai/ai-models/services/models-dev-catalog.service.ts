import { Injectable, Logger } from '@nestjs/common';

type ModelsDevModel = {
  id: string;
  name: string;
  reasoning?: boolean;
  tool_call?: boolean;
  cost?: { input?: number; output?: number };
  limit?: { context?: number; output?: number };
};

type ModelsDevProvider = {
  id: string;
  models: Record<string, ModelsDevModel>;
};

type ModelsDevData = Record<string, ModelsDevProvider>;

export type ModelsDevModelSuggestion = {
  modelId: string;
  name: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  doesSupportThinking: boolean;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MODELS_DEV_API_URL = 'https://models.dev/api.json';

const NON_LANGUAGE_PATTERNS = [
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

@Injectable()
export class ModelsDevCatalogService {
  private readonly logger = new Logger(ModelsDevCatalogService.name);
  private cache: ModelsDevData | null = null;
  private cacheTimestamp = 0;

  async getModelSuggestions(
    providerType: string,
  ): Promise<ModelsDevModelSuggestion[]> {
    const data = await this.getCachedData();

    if (!data) {
      return [];
    }

    const providerData = data[providerType];

    if (!providerData?.models) {
      return [];
    }

    return Object.entries(providerData.models)
      .filter(([modelId]) => this.isLanguageModel(modelId))
      .map(([modelId, model]) => ({
        modelId,
        name: model.name ?? modelId,
        inputCostPerMillionTokens: model.cost?.input ?? 0,
        outputCostPerMillionTokens: model.cost?.output ?? 0,
        contextWindowTokens: model.limit?.context ?? 0,
        maxOutputTokens: model.limit?.output ?? 0,
        doesSupportThinking: model.reasoning ?? false,
      }));
  }

  private async getCachedData(): Promise<ModelsDevData | null> {
    const now = Date.now();

    if (this.cache && now - this.cacheTimestamp < CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const response = await fetch(MODELS_DEV_API_URL, {
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        this.logger.warn(
          `models.dev API returned ${response.status}, using cached data`,
        );

        return this.cache;
      }

      this.cache = await response.json();
      this.cacheTimestamp = now;

      return this.cache;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch models.dev: ${error instanceof Error ? error.message : String(error)}`,
      );

      return this.cache;
    }
  }

  private isLanguageModel(modelId: string): boolean {
    const id = modelId.toLowerCase();

    return !NON_LANGUAGE_PATTERNS.some((pattern) => id.includes(pattern));
  }
}
