import { Injectable, Logger } from '@nestjs/common';

import { type DiscoveredModel } from 'src/engine/metadata-modules/ai/ai-models/services/provider-discovery.service';

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

export type EnrichedModel = DiscoveredModel & {
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  doesSupportThinking: boolean;
  supportsToolCall: boolean;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MODELS_DEV_API_URL = 'https://models.dev/api.json';

@Injectable()
export class ModelsDevEnrichmentService {
  private readonly logger = new Logger(ModelsDevEnrichmentService.name);
  private cache: ModelsDevData | null = null;
  private cacheTimestamp = 0;

  async enrichModels(
    providerType: string,
    discoveredModels: DiscoveredModel[],
  ): Promise<EnrichedModel[]> {
    const data = await this.getCachedData();

    if (!data) {
      return discoveredModels.map((model) => this.defaultEnrichment(model));
    }

    const providerData = data[providerType];

    return discoveredModels.map((model) => {
      const modelsDevModel = providerData?.models?.[model.modelId];

      if (!modelsDevModel) {
        return this.defaultEnrichment(model);
      }

      return {
        ...model,
        name: modelsDevModel.name ?? model.name,
        inputCostPerMillionTokens: modelsDevModel.cost?.input ?? 0,
        outputCostPerMillionTokens: modelsDevModel.cost?.output ?? 0,
        contextWindowTokens: modelsDevModel.limit?.context ?? 128000,
        maxOutputTokens: modelsDevModel.limit?.output ?? 4096,
        doesSupportThinking: modelsDevModel.reasoning ?? false,
        supportsToolCall: modelsDevModel.tool_call ?? false,
      };
    });
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

  private defaultEnrichment(model: DiscoveredModel): EnrichedModel {
    return {
      ...model,
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
      doesSupportThinking: false,
      supportsToolCall: false,
    };
  }
}
