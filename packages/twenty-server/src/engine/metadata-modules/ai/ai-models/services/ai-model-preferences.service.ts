import { Injectable } from '@nestjs/common';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';

@Injectable()
export class AiModelPreferencesService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getPreferences(): AiModelPreferences {
    return this.twentyConfigService.get('AI_MODEL_PREFERENCES');
  }

  getRecommendedModelIds(): Set<string> {
    const prefs = this.getPreferences();

    return new Set(prefs.recommendedModels ?? []);
  }

  async setModelAdminEnabled(
    modelId: string,
    enabled: boolean,
    modelDefCache: Map<
      string,
      { providerName: string; modelDef: AiProviderModelConfig }
    >,
  ): Promise<void> {
    this.validateModelExists(modelId, modelDefCache);
    await this.togglePreferenceList(modelId, 'disabledModels', !enabled);
  }

  async setModelRecommended(
    modelId: string,
    recommended: boolean,
    modelDefCache: Map<
      string,
      { providerName: string; modelDef: AiProviderModelConfig }
    >,
  ): Promise<void> {
    this.validateModelExists(modelId, modelDefCache);
    await this.togglePreferenceList(modelId, 'recommendedModels', recommended);
  }

  async setDefaultModel(
    role: AiModelRole,
    modelId: string,
    modelDefCache: Map<
      string,
      { providerName: string; modelDef: AiProviderModelConfig }
    >,
  ): Promise<void> {
    this.validateModelExists(modelId, modelDefCache);

    const prefs = { ...this.getPreferences() };
    const key =
      role === AiModelRole.FAST ? 'defaultFastModels' : 'defaultSmartModels';

    const current = prefs[key] ?? [];
    const filtered = current.filter((id) => id !== modelId);

    prefs[key] = [modelId, ...filtered];

    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
  }

  private validateModelExists(
    modelId: string,
    modelDefCache: Map<
      string,
      { providerName: string; modelDef: AiProviderModelConfig }
    >,
  ): void {
    if (!modelDefCache.has(modelId)) {
      throw new AgentException(
        `Cannot update model "${modelId}": not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }

  private async togglePreferenceList(
    modelId: string,
    key: 'disabledModels' | 'recommendedModels',
    add: boolean,
  ): Promise<void> {
    const prefs = { ...this.getPreferences() };
    const current = prefs[key] ?? [];

    if (add) {
      if (!current.includes(modelId)) {
        prefs[key] = [...current, modelId];
      }
    } else {
      prefs[key] = current.filter((id) => id !== modelId);
    }

    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
  }
}
