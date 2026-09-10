import { Injectable } from '@nestjs/common';

import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AI_MODELS_DEFAULT_CONFIG_KEY_BY_TIER } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-default-config-key-by-tier.const';
import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';

@Injectable()
export class AiModelPreferencesService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getPreferences(): AiModelPreferences {
    return {
      disabledModels: this.twentyConfigService.get(
        'AI_MODELS_DEFAULT_DISABLED',
      ),
      defaultModelsByTier: Object.fromEntries(
        AI_MODEL_TIERS.map((tier) => [
          tier,
          this.getDefaultModelIdsForTier(tier),
        ]),
      ) as Record<AiModelTier, string[]>,
    };
  }

  getDefaultModelIdsForTier(tier: AiModelTier): string[] {
    return this.twentyConfigService.get(
      AI_MODELS_DEFAULT_CONFIG_KEY_BY_TIER[tier],
    );
  }

  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    await this.setModelsAdminEnabled([modelId], enabled);
  }

  async setModelsAdminEnabled(
    modelIds: string[],
    enabled: boolean,
  ): Promise<void> {
    const current = this.getPreferences().disabledModels;
    const idSet = new Set(modelIds);

    const disabledModels = enabled
      ? current.filter((id) => !idSet.has(id))
      : [...current, ...modelIds.filter((id) => !current.includes(id))];

    await this.twentyConfigService.set(
      'AI_MODELS_DEFAULT_DISABLED',
      disabledModels,
    );
  }

  // The chosen model moves to the front of the chain; the rest of the chain is
  // kept so an instance losing that provider's key still resolves the tier.
  async setDefaultModel(tier: AiModelTier, modelId: string): Promise<void> {
    const current = this.getDefaultModelIdsForTier(tier);

    await this.twentyConfigService.set(
      AI_MODELS_DEFAULT_CONFIG_KEY_BY_TIER[tier],
      [modelId, ...current.filter((id) => id !== modelId)],
    );
  }
}
