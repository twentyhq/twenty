import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModel } from 'ai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { ModelsDevEnrichmentService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-enrichment.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { ProviderDiscoveryService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-discovery.service';
import {
  SdkProviderFactoryService,
  type AiSdkProviderInstance,
} from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import {
  type AIModelConfig,
  AiProvider,
  type AiProviderModelConfig,
  type AiProvidersConfig,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  inferModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';
import {
  buildCompositeModelId,
  parseCompositeModelId,
} from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import {
  isModelAllowedByWorkspace,
  type WorkspaceModelAvailabilitySettings,
} from 'src/engine/metadata-modules/ai/ai-models/utils/is-model-allowed.util';

export interface RegisteredAIModel {
  modelId: string;
  provider: AiProvider;
  model: LanguageModel;
  doesSupportThinking?: boolean;
  providerName?: string;
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

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly providerConfigService: ProviderConfigService,
    private readonly sdkProviderFactory: SdkProviderFactoryService,
    private readonly providerDiscoveryService: ProviderDiscoveryService,
    private readonly modelsDevEnrichmentService: ModelsDevEnrichmentService,
  ) {
    this.buildModelRegistry();
  }

  getProviderInstance(providerName: string): AiSdkProviderInstance | undefined {
    return this.sdkProviderFactory.getProviderInstance(providerName);
  }

  getProviderInstanceForModel(
    modelId: string,
  ): AiSdkProviderInstance | undefined {
    const registeredModel = this.modelRegistry.get(modelId);

    if (!registeredModel?.providerName) {
      return undefined;
    }

    return this.sdkProviderFactory.getProviderInstance(
      registeredModel.providerName,
    );
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
    for (const [providerName, config] of Object.entries(providers)) {
      const provider = config.type;

      const models = this.resolveModelsForProvider(config);

      if (models.length === 0) {
        continue;
      }

      const sdkInstance = this.sdkProviderFactory.createProvider(
        providerName,
        config,
      );

      for (const modelDef of models) {
        const compositeId = buildCompositeModelId(
          provider,
          modelDef.rawModelId,
        );

        this.modelRegistry.set(compositeId, {
          modelId: compositeId,
          provider,
          model: sdkInstance.createModel(modelDef.rawModelId),
          doesSupportThinking: modelDef.doesSupportThinking,
          providerName,
        });

        this.modelConfigCache.set(
          compositeId,
          this.toAIModelConfig(compositeId, provider, modelDef),
        );

        this.providerModelDefCache.set(compositeId, {
          providerName,
          modelDef,
        });
      }
    }
  }

  // Merges models[] with legacy modelNames[] (openai-compatible backward compat)
  private resolveModelsForProvider(
    config: AiProvidersConfig[string],
  ): AiProviderModelConfig[] {
    const models = [...(config.models ?? [])];
    const existingRawIds = new Set(models.map((m) => m.rawModelId));

    for (const modelName of config.modelNames ?? []) {
      if (!existingRawIds.has(modelName)) {
        models.push({
          rawModelId: modelName,
          label: modelName,
          source: 'manual',
        });
      }
    }

    return models;
  }

  private toAIModelConfig(
    compositeId: string,
    provider: AiProvider,
    modelDef: AiProviderModelConfig,
  ): AIModelConfig {
    const { rawModelId: _, source: __, ...sharedFields } = modelDef;

    return {
      ...sharedFields,
      modelId: compositeId,
      provider,
      description: modelDef.description ?? compositeId,
      modelFamily: modelDef.modelFamily ?? inferModelFamily(provider),
      inputCostPerMillionTokens: modelDef.inputCostPerMillionTokens ?? 0,
      outputCostPerMillionTokens: modelDef.outputCostPerMillionTokens ?? 0,
      contextWindowTokens: modelDef.contextWindowTokens ?? 128000,
      maxOutputTokens: modelDef.maxOutputTokens ?? 4096,
    };
  }

  async discoverAndRegisterModels(): Promise<number> {
    const providers = this.providerConfigService.getResolvedProviders();
    const providerNames = Object.keys(providers);

    this.logger.log(
      `Starting model discovery for ${providerNames.length} providers: ${providerNames.join(', ') || '(none)'}`,
    );

    let totalNewModels = 0;

    for (const [providerName, config] of Object.entries(providers)) {
      if (config.type === AiProvider.OPENAI_COMPATIBLE) {
        this.logger.log(
          `Skipping "${providerName}": openai-compatible providers don't support discovery`,
        );
        continue;
      }

      this.logger.log(
        `Discovering models for provider "${providerName}" (type: ${config.type})`,
      );

      const discoveredModels =
        await this.providerDiscoveryService.discoverModels(config);

      this.logger.log(
        `Provider "${providerName}": discovery returned ${discoveredModels.length} models`,
      );

      if (discoveredModels.length === 0) {
        continue;
      }

      const enrichedModels = await this.modelsDevEnrichmentService.enrichModels(
        config.type,
        discoveredModels,
      );

      const provider = config.type;

      const existingModelIds = new Set(
        (config.models ?? []).map((m) => m.rawModelId),
      );

      const newModelDefs: AiProviderModelConfig[] = [];

      for (const enrichedModel of enrichedModels) {
        if (existingModelIds.has(enrichedModel.modelId)) {
          continue;
        }

        const compositeId = buildCompositeModelId(
          provider,
          enrichedModel.modelId,
        );

        if (this.modelRegistry.has(compositeId)) {
          continue;
        }

        newModelDefs.push({
          rawModelId: enrichedModel.modelId,
          label: enrichedModel.name,
          description: `Discovered model from ${providerName}`,
          modelFamily: inferModelFamily(provider),
          inputCostPerMillionTokens: enrichedModel.inputCostPerMillionTokens,
          outputCostPerMillionTokens: enrichedModel.outputCostPerMillionTokens,
          contextWindowTokens: enrichedModel.contextWindowTokens,
          maxOutputTokens: enrichedModel.maxOutputTokens,
          doesSupportThinking: enrichedModel.doesSupportThinking,
          source: 'discovered',
        });
      }

      if (newModelDefs.length > 0) {
        await this.persistDiscoveredModels(providerName, newModelDefs);
        totalNewModels += newModelDefs.length;
      }

      this.logger.log(
        `Provider "${providerName}": ${enrichedModels.length} discovered, ${existingModelIds.size} existing, ${newModelDefs.length} new`,
      );
    }

    // Rebuild registry from persisted config to ensure consistency.
    // This is needed because twentyConfigService.set() may trigger
    // a config reload that clears the in-memory caches.
    this.buildModelRegistry();

    this.logger.log(
      `Discovery complete. ${totalNewModels} new models added. Registry now has ${this.modelConfigCache.size} models total.`,
    );

    return totalNewModels;
  }

  private async persistDiscoveredModels(
    providerName: string,
    newModelDefs: AiProviderModelConfig[],
  ): Promise<void> {
    const providers = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };
    const providerConfig = providers[providerName];

    if (!providerConfig) {
      return;
    }

    providers[providerName] = {
      ...providerConfig,
      models: [...(providerConfig.models ?? []), ...newModelDefs],
    };

    await this.twentyConfigService.set('AI_PROVIDERS', providers);
  }

  getModel(modelId: string): RegisteredAIModel | undefined {
    return this.modelRegistry.get(modelId);
  }

  getAvailableModels(): RegisteredAIModel[] {
    return Array.from(this.modelRegistry.values());
  }

  getModelConfig(modelId: string): AIModelConfig | undefined {
    return this.modelConfigCache.get(modelId);
  }

  getRecommendedModelIds(): Set<string> {
    const recommended = new Set<string>();

    for (const [modelId, config] of this.modelConfigCache) {
      if (config.isRecommended) {
        recommended.add(modelId);
      }
    }

    return recommended;
  }

  private getFirstAvailableModelFromList(
    modelIdList: string,
  ): RegisteredAIModel | undefined {
    const modelIds = modelIdList
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    for (const modelId of modelIds) {
      const model = this.getModel(modelId);

      if (model) {
        return model;
      }
    }

    return undefined;
  }

  getDefaultSpeedModel(): RegisteredAIModel {
    const defaultModelIds = this.twentyConfigService.get(
      'DEFAULT_AI_SPEED_MODEL_ID',
    );
    let model = this.getFirstAvailableModelFromList(defaultModelIds);

    if (!model) {
      const availableModels = this.getAvailableModels();

      model = availableModels[0];
    }

    if (!model) {
      throw new AgentException(
        'No AI models are available. Configure AI_PROVIDERS with at least one provider.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return model;
  }

  getDefaultPerformanceModel(): RegisteredAIModel {
    const defaultModelIds = this.twentyConfigService.get(
      'DEFAULT_AI_PERFORMANCE_MODEL_ID',
    );
    let model = this.getFirstAvailableModelFromList(defaultModelIds);

    if (!model) {
      const availableModels = this.getAvailableModels();

      model = availableModels[0];
    }

    if (!model) {
      throw new AgentException(
        'No AI models are available. Configure AI_PROVIDERS with at least one provider.',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return model;
  }

  getEffectiveModelConfig(modelId: string): AIModelConfig {
    if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
      const defaultModel =
        modelId === DEFAULT_FAST_MODEL
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
      modelFamily: inferModelFamily(registeredModel.provider),
      provider: registeredModel.provider,
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
    };
  }

  isModelAdminAllowed(modelId: string): boolean {
    if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
      return true;
    }

    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      return false;
    }

    const { providerName, modelDef } = cached;
    const { rawModelId } = parseCompositeModelId(modelId);
    const providers = this.providerConfigService.getResolvedProviders();
    const providerConfig = providers[providerName];

    if (providerConfig?.disabledModels?.includes(rawModelId)) {
      return false;
    }

    if (modelDef.source === 'catalog') {
      return true;
    }

    return providerConfig?.enabledModels?.includes(rawModelId) ?? false;
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
    providerName?: string;
  }> {
    return Array.from(this.modelConfigCache.values()).map((modelConfig) => {
      const registered = this.modelRegistry.get(modelConfig.modelId);

      return {
        modelConfig,
        isAvailable: !!registered,
        isAdminEnabled: this.isModelAdminAllowed(modelConfig.modelId),
        providerName: registered?.providerName,
      };
    });
  }

  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      throw new AgentException(
        `Cannot toggle model "${modelId}": no associated provider found`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const { providerName, modelDef } = cached;
    const { rawModelId } = parseCompositeModelId(modelId);

    const providers = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };
    const providerConfig = providers[providerName];

    if (!providerConfig) {
      throw new AgentException(
        `Provider "${providerName}" not found in AI_PROVIDERS`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const currentDisabled = providerConfig.disabledModels ?? [];
    const currentEnabled = providerConfig.enabledModels ?? [];

    if (modelDef.source === 'catalog') {
      const newDisabled = enabled
        ? currentDisabled.filter((id) => id !== rawModelId)
        : currentDisabled.includes(rawModelId)
          ? currentDisabled
          : [...currentDisabled, rawModelId];

      providers[providerName] = {
        ...providerConfig,
        disabledModels: newDisabled,
      };
    } else {
      const newEnabled = enabled
        ? currentEnabled.includes(rawModelId)
          ? currentEnabled
          : [...currentEnabled, rawModelId]
        : currentEnabled.filter((id) => id !== rawModelId);

      providers[providerName] = {
        ...providerConfig,
        enabledModels: newEnabled,
      };
    }

    await this.twentyConfigService.set('AI_PROVIDERS', providers);
  }

  async setModelRecommended(
    modelId: string,
    recommended: boolean,
  ): Promise<void> {
    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      throw new AgentException(
        `Cannot update model "${modelId}": no associated provider found`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const { providerName } = cached;
    const { rawModelId } = parseCompositeModelId(modelId);

    const providers = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };
    const providerConfig = providers[providerName];

    if (!providerConfig) {
      throw new AgentException(
        `Provider "${providerName}" not found in AI_PROVIDERS`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const updatedModels = (providerConfig.models ?? []).map((model) =>
      model.rawModelId === rawModelId
        ? { ...model, isRecommended: recommended }
        : model,
    );

    providers[providerName] = {
      ...providerConfig,
      models: updatedModels,
    };

    await this.twentyConfigService.set('AI_PROVIDERS', providers);

    // Update caches in-place
    const existingConfig = this.modelConfigCache.get(modelId);

    if (existingConfig) {
      this.modelConfigCache.set(modelId, {
        ...existingConfig,
        isRecommended: recommended,
      });
    }

    const existingDef = this.providerModelDefCache.get(modelId);

    if (existingDef) {
      this.providerModelDefCache.set(modelId, {
        ...existingDef,
        modelDef: { ...existingDef.modelDef, isRecommended: recommended },
      });
    }
  }

  refreshRegistry(): void {
    this.buildModelRegistry();
  }

  async resolveModelForAgent(agent: { modelId: string } | null) {
    const aiModel = this.getEffectiveModelConfig(
      agent?.modelId ?? DEFAULT_SMART_MODEL,
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
