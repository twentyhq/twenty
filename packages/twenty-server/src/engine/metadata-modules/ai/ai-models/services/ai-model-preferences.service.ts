import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { aiModelPreferencesSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.schema';
import { type AiModelPreferences } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-preferences.type';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class AiModelPreferencesService implements OnModuleInit {
  private readonly logger = new Logger(AiModelPreferencesService.name);
  private filePreferences: AiModelPreferences | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    const storagePath = this.twentyConfigService.get(
      'AI_MODEL_PREFERENCES_STORAGE_PATH',
    );

    if (!storagePath) {
      return;
    }

    try {
      this.filePreferences = await this.fetchPreferences(storagePath);
      this.logger.log(
        `Loaded AI model preferences from storage: ${storagePath}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Failed to load AI model preferences from storage: ${message}`,
      );
    }
  }

  getPreferences(): AiModelPreferences {
    const { source } =
      this.twentyConfigService.getVariableWithMetadata(
        'AI_MODEL_PREFERENCES',
      ) ?? {};

    if (source !== ConfigSource.DEFAULT) {
      return this.twentyConfigService.get('AI_MODEL_PREFERENCES');
    }

    return (
      this.filePreferences ??
      this.twentyConfigService.get('AI_MODEL_PREFERENCES')
    );
  }

  getRecommendedModelIds(): Set<string> {
    return new Set(this.getPreferences().recommendedModels ?? []);
  }

  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    await this.togglePreferenceList(modelId, 'disabledModels', !enabled);
  }

  async setModelRecommended(
    modelId: string,
    recommended: boolean,
  ): Promise<void> {
    await this.togglePreferenceList(modelId, 'recommendedModels', recommended);
  }

  async setModelsAdminEnabled(
    modelIds: string[],
    enabled: boolean,
  ): Promise<void> {
    await this.togglePreferenceListBulk(modelIds, 'disabledModels', !enabled);
  }

  async setModelsRecommended(
    modelIds: string[],
    recommended: boolean,
  ): Promise<void> {
    await this.togglePreferenceListBulk(
      modelIds,
      'recommendedModels',
      recommended,
    );
  }

  async setDefaultModel(role: AiModelRole, modelId: string): Promise<void> {
    const prefs = { ...this.getPreferences() };
    const key =
      role === AiModelRole.FAST ? 'defaultFastModels' : 'defaultSmartModels';

    const current = prefs[key] ?? [];

    prefs[key] = [modelId, ...current.filter((id) => id !== modelId)];

    await this.persistPreferences(prefs);
  }

  private async togglePreferenceList(
    modelId: string,
    key: 'disabledModels' | 'recommendedModels',
    add: boolean,
  ): Promise<void> {
    await this.togglePreferenceListBulk([modelId], key, add);
  }

  private async togglePreferenceListBulk(
    modelIds: string[],
    key: 'disabledModels' | 'recommendedModels',
    add: boolean,
  ): Promise<void> {
    const prefs = { ...this.getPreferences() };
    const current = prefs[key] ?? [];
    const idSet = new Set(modelIds);

    if (add) {
      const existing = new Set(current);

      prefs[key] = [...current, ...modelIds.filter((id) => !existing.has(id))];
    } else {
      prefs[key] = current.filter((id) => !idSet.has(id));
    }

    await this.persistPreferences(prefs);
  }

  private async persistPreferences(prefs: AiModelPreferences): Promise<void> {
    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
    this.filePreferences = null;
  }

  private async fetchPreferences(
    filePath: string,
  ): Promise<AiModelPreferences> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();
    const stream = await driver.readFile({ filePath });
    const body = (await streamToBuffer(stream)).toString('utf-8');

    return aiModelPreferencesSchema.parse(JSON.parse(body));
  }
}
