import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModel } from 'ai';
import { type AiSdkPackage } from 'twenty-shared/ai';

import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';

import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AIModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { DEFAULT_CONTEXT_WINDOW_TOKENS } from 'src/engine/metadata-modules/ai/ai-models/types/default-context-window-tokens.const';
import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import { isAutoSelectModelId } from 'twenty-shared/utils';

import { DEFAULT_MAX_OUTPUT_TOKENS } from 'src/engine/metadata-modules/ai/ai-models/types/default-max-output-tokens.const';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import { inferModelFamily } from 'src/engine/metadata-modules/ai/ai-models/utils/infer-model-family.util';
import { isProviderConfigured } from 'src/engine/metadata-modules/ai/ai-models/utils/is-provider-configured.util';
import {
  isModelAllowedByWorkspace,
  type WorkspaceModelAvailabilitySettings,
} from 'src/engine/metadata-modules/ai/ai-models/utils/is-model-allowed.util';

export interface RegisteredAIModel {
  modelId: string;
  sdkPackage: AiSdkPackage;
  model: LanguageModel;
  supportsReasoning?: boolean;
  providerName?: string;
  modelsDevName?: string;
}

@Injectable()
export class AiModelRegistryService {
  private readonly logger = new Logger(AiModelRegistryService.name);
  private modelRegistry: Map<string, RegisteredAIModel> = new Map();
  private modelConfigCache: Map<string, AIModelConfig> = new Map();
  private providerModelDefCache: Map<
    string,
    { providerName: string; modelDef: AiProviderModelConfig }
  > = new Map();
  private currentConfigHash: string | null = null;

  constructor(
    private readonly providerConfigService: ProviderConfigService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
    private readonly preferencesService: AiModelPreferencesService,
    private readonly configGroupHashService: ConfigGroupHashService,
  ) {}

  // The registry is rebuilt lazily whenever the LLM-group config hash changes,
  // so any mutation to an LLM-tagged config variable is picked up automatically
  // on the next read — no explicit refresh from callers needed.
  private ensureFresh(): void {
    const configHash = this.configGroupHashService.computeHash(
      ConfigVariablesGroup.LLM,
    );

    if (configHash === this.currentConfigHash) {
      return;
    }

    this.buildModelRegistry();
    this.currentConfigHash = configHash;
  }

  private buildModelRegistry(): void {
    this.modelRegistry.clear();
    this.sdkProviderFactory.clearCache();
    this.modelConfigCache.clear();
    this.providerModelDefCache.clear();

    const providers = this.providerConfigService.getResolvedProviders();

    this.registerModelsFromProviders(providers);
  }

  private registerModelsFromProviders(providers: AiProvidersConfig): void {
    for (const [providerKey, config] of Object.entries(providers)) {
      if (!config.npm) {
        this.logger.warn(
          `Skipping provider "${providerKey}": missing npm field`,
        );
        continue;
      }

      const models = config.models ?? [];

      if (models.length === 0) {
        continue;
      }

      const sdkInstance = isProviderConfigured(config)
        ? this.sdkProviderFactory.createProvider(providerKey, config)
        : undefined;

      for (const modelDef of models) {
        const compositeId = buildCompositeModelId(providerKey, modelDef.name);

        this.modelConfigCache.set(
          compositeId,
          this.toAIModelConfig(compositeId, config, modelDef),
        );

        this.providerModelDefCache.set(compositeId, {
          providerName: providerKey,
          modelDef,
        });

        if (sdkInstance) {
          this.modelRegistry.set(compositeId, {
            modelId: compositeId,
            sdkPackage: config.npm,
            model: sdkInstance.createModel(modelDef.name),
            supportsReasoning: modelDef.supportsReasoning,
            providerName: providerKey,
            modelsDevName: config.name,
          });
        }
      }
    }
  }

  private toAIModelConfig(
    compositeId: string,
    providerConfig: AiProviderConfig,
    modelDef: AiProviderModelConfig,
  ): AIModelConfig {
    return {
      modelId: compositeId,
      label: modelDef.label,
      sdkPackage: providerConfig.npm,
      description: modelDef.description ?? compositeId,
      modelFamily:
        modelDef.modelFamily ??
        inferModelFamily(providerConfig.name ?? '', modelDef.name),
      dataResidency: providerConfig.dataResidency,
      inputCostPerMillionTokens: modelDef.inputCostPerMillionTokens ?? 0,
      outputCostPerMillionTokens: modelDef.outputCostPerMillionTokens ?? 0,
      cachedInputCostPerMillionTokens: modelDef.cachedInputCostPerMillionTokens,
      cacheCreationCostPerMillionTokens:
        modelDef.cacheCreationCostPerMillionTokens,
      longContextCost: modelDef.longContextCost,
      contextWindowTokens:
        modelDef.contextWindowTokens ?? DEFAULT_CONTEXT_WINDOW_TOKENS,
      maxOutputTokens: modelDef.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      modalities: modelDef.modalities,
      supportsReasoning: modelDef.supportsReasoning,
      isDeprecated: modelDef.isDeprecated,
    };
  }

  getModel(modelId: string): RegisteredAIModel | undefined {
    this.ensureFresh();

    return this.modelRegistry.get(modelId);
  }

  getAvailableModels(): RegisteredAIModel[] {
    this.ensureFresh();

    return Array.from(this.modelRegistry.values());
  }

  getModelConfig(modelId: string): AIModelConfig | undefined {
    this.ensureFresh();

    return this.modelConfigCache.get(modelId);
  }

  getRecommendedModelIds(): Set<string> {
    return this.preferencesService.getRecommendedModelIds();
  }

  private getFirstAvailableModelFromList(
    modelIds: string[],
  ): RegisteredAIModel | undefined {
    for (const modelId of modelIds) {
      const model = this.getModel(modelId);

      if (model) {
        return model;
      }
    }

    return undefined;
  }

  getDefaultSpeedModel(): RegisteredAIModel {
    return this.getDefaultModelForRole(AiModelRole.FAST);
  }

  getDefaultPerformanceModel(): RegisteredAIModel {
    return this.getDefaultModelForRole(AiModelRole.SMART);
  }

  private getDefaultModelForRole(role: AiModelRole): RegisteredAIModel {
    const prefs = this.preferencesService.getPreferences();
    const preferenceKey =
      role === AiModelRole.FAST ? 'defaultFastModels' : 'defaultSmartModels';

    let model = this.getFirstAvailableModelFromList(prefs[preferenceKey] ?? []);

    if (!model) {
      model = this.getAvailableModels()[0];
    }

    if (!model) {
      throw new AgentException(
        'No AI models are available. Configure at least one AI provider.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return model;
  }

  getEffectiveModelConfig(modelId: string): AIModelConfig {
    this.ensureFresh();

    if (isAutoSelectModelId(modelId)) {
      const defaultModel =
        modelId === AUTO_SELECT_FAST_MODEL_ID
          ? this.getDefaultSpeedModel()
          : this.getDefaultPerformanceModel();

      return (
        this.modelConfigCache.get(defaultModel.modelId) ??
        this.createDefaultConfigForCustomModel(defaultModel)
      );
    }

    const config = this.modelConfigCache.get(modelId);

    if (config) {
      return config;
    }

    const registeredModel = this.getModel(modelId);

    if (registeredModel) {
      return this.createDefaultConfigForCustomModel(registeredModel);
    }

    throw new AgentException(
      `Model with ID ${modelId} not found`,
      AgentExceptionCode.AGENT_EXECUTION_FAILED,
    );
  }

  private createDefaultConfigForCustomModel(
    registeredModel: RegisteredAIModel,
  ): AIModelConfig {
    return {
      modelId: registeredModel.modelId,
      label: registeredModel.modelId,
      description: `Custom model: ${registeredModel.modelId}`,
      modelFamily: inferModelFamily(
        registeredModel.modelsDevName ?? '',
        registeredModel.modelId,
      ),
      sdkPackage: registeredModel.sdkPackage,
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      contextWindowTokens: DEFAULT_CONTEXT_WINDOW_TOKENS,
      maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
    };
  }

  isModelAdminAllowed(modelId: string): boolean {
    if (isAutoSelectModelId(modelId)) {
      return true;
    }

    const prefs = this.preferencesService.getPreferences();
    const disabledModels = prefs.disabledModels ?? [];

    return !disabledModels.includes(modelId);
  }

  validateModelAvailability(
    modelId: string,
    workspace: WorkspaceModelAvailabilitySettings,
  ): void {
    if (!this.isModelAdminAllowed(modelId)) {
      throw new AgentException(
        'The selected model has been disabled by the administrator.',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    if (
      !isModelAllowedByWorkspace(
        modelId,
        workspace,
        this.getRecommendedModelIds(),
      )
    ) {
      throw new AgentException(
        'The selected model is not available in this workspace.',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }

  getAdminFilteredModels(): RegisteredAIModel[] {
    return this.getAvailableModels().filter((model) =>
      this.isModelAdminAllowed(model.modelId),
    );
  }

  getAllModelsWithStatus(): Array<{
    modelConfig: AIModelConfig;
    isAvailable: boolean;
    isAdminEnabled: boolean;
    isRecommended: boolean;
    providerName?: string;
    name?: string;
  }> {
    this.ensureFresh();
    const recommended = this.getRecommendedModelIds();

    return Array.from(this.modelConfigCache.values()).map((modelConfig) => {
      const registered = this.modelRegistry.get(modelConfig.modelId);
      const cached = this.providerModelDefCache.get(modelConfig.modelId);

      return {
        modelConfig,
        isAvailable: !!registered,
        isAdminEnabled: this.isModelAdminAllowed(modelConfig.modelId),
        isRecommended: recommended.has(modelConfig.modelId),
        providerName: registered?.providerName ?? cached?.providerName,
        name: cached?.modelDef.name,
      };
    });
  }

  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    this.validateModelInRegistry(modelId);
    await this.preferencesService.setModelAdminEnabled(modelId, enabled);
  }

  async setModelRecommended(
    modelId: string,
    recommended: boolean,
  ): Promise<void> {
    this.validateModelInRegistry(modelId);
    await this.preferencesService.setModelRecommended(modelId, recommended);
  }

  async setModelsAdminEnabled(
    modelIds: string[],
    enabled: boolean,
  ): Promise<void> {
    modelIds.forEach((id) => this.validateModelInRegistry(id));
    await this.preferencesService.setModelsAdminEnabled(modelIds, enabled);
  }

  async setModelsRecommended(
    modelIds: string[],
    recommended: boolean,
  ): Promise<void> {
    modelIds.forEach((id) => this.validateModelInRegistry(id));
    await this.preferencesService.setModelsRecommended(modelIds, recommended);
  }

  async setDefaultModel(role: AiModelRole, modelId: string): Promise<void> {
    this.validateModelInRegistry(modelId);
    await this.preferencesService.setDefaultModel(role, modelId);
  }

  private validateModelInRegistry(modelId: string): void {
    this.ensureFresh();

    if (!this.providerModelDefCache.has(modelId)) {
      throw new AgentException(
        `Cannot update model "${modelId}": not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }

  getResolvedProvidersForAdmin(): AiProvidersConfig {
    return this.providerConfigService.getResolvedProviders();
  }

  getCatalogProviderNames(): Set<string> {
    return this.providerConfigService.getCatalogProviderNames();
  }

  resolveModelForAgent(agent: { modelId: string } | null): RegisteredAIModel {
    const aiModel = this.getEffectiveModelConfig(
      agent?.modelId ?? AUTO_SELECT_SMART_MODEL_ID,
    );

    const registeredModel = this.getModel(aiModel.modelId);

    if (!registeredModel) {
      throw new AgentException(
        `Model ${aiModel.modelId} not found in registry. Check that the corresponding AI provider is configured.`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return registeredModel;
  }
}
