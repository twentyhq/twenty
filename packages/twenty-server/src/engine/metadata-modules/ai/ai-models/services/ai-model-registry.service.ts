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
  type AiModelPreferences,
  AiProvider,
  type AiProviderConfig,
  type AiProviderModelConfig,
  type AiProvidersConfig,
  type DataResidency,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  inferModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers.types';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
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

  private hasCredentials(config: AiProviderConfig): boolean {
    return !!(config.apiKey || config.accessKeyId);
  }

  private registerModelsFromProviders(providers: AiProvidersConfig): void {
    for (const [providerName, config] of Object.entries(providers)) {
      const provider = config.type;
      const models = this.resolveModelsForProvider(config);

      if (models.length === 0) {
        continue;
      }

      const isConfigured = this.hasCredentials(config);

      // Only create SDK instances for providers with credentials
      const sdkInstance = isConfigured
        ? this.sdkProviderFactory.createProvider(providerName, config)
        : undefined;

      for (const modelDef of models) {
        const compositeId = buildCompositeModelId(
          provider,
          modelDef.rawModelId,
        );

        // Always populate config caches so admin can see all models
        this.modelConfigCache.set(
          compositeId,
          this.toAIModelConfig(
            compositeId,
            provider,
            modelDef,
            config.dataResidency,
          ),
        );

        this.providerModelDefCache.set(compositeId, {
          providerName,
          modelDef,
        });

        // Only register in the live registry if provider has credentials
        if (sdkInstance) {
          this.modelRegistry.set(compositeId, {
            modelId: compositeId,
            provider,
            model: sdkInstance.createModel(modelDef.rawModelId),
            doesSupportThinking: modelDef.doesSupportThinking,
            providerName,
          });
        }
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
    providerDataResidency?: DataResidency,
  ): AIModelConfig {
    return {
      modelId: compositeId,
      label: modelDef.label,
      provider,
      description: modelDef.description ?? compositeId,
      modelFamily:
        modelDef.modelFamily ?? inferModelFamily(provider, modelDef.rawModelId),
      dataResidency: providerDataResidency,
      inputCostPerMillionTokens: modelDef.inputCostPerMillionTokens ?? 0,
      outputCostPerMillionTokens: modelDef.outputCostPerMillionTokens ?? 0,
      cachedInputCostPerMillionTokens: modelDef.cachedInputCostPerMillionTokens,
      cacheCreationCostPerMillionTokens:
        modelDef.cacheCreationCostPerMillionTokens,
      longContextCost: modelDef.longContextCost,
      contextWindowTokens: modelDef.contextWindowTokens ?? 128000,
      maxOutputTokens: modelDef.maxOutputTokens ?? 4096,
      supportedFileTypes: modelDef.supportedFileTypes,
      doesSupportThinking: modelDef.doesSupportThinking,
      nativeCapabilities: modelDef.nativeCapabilities,
      deprecated: modelDef.deprecated,
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
          modelFamily: inferModelFamily(provider, enrichedModel.modelId),
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

    this.buildModelRegistry();

    this.logger.log(
      `Discovery complete. ${totalNewModels} new models added. Registry now has ${this.modelConfigCache.size} models total.`,
    );

    return totalNewModels;
  }

  // Discovered models are persisted into AI_CUSTOM_PROVIDERS
  private async persistDiscoveredModels(
    providerName: string,
    newModelDefs: AiProviderModelConfig[],
  ): Promise<void> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_CUSTOM_PROVIDERS'),
    };
    const existing = customProviders[providerName];

    // Get the resolved provider config to use its type
    const resolvedProviders = this.providerConfigService.getResolvedProviders();
    const resolvedConfig = resolvedProviders[providerName];

    if (!resolvedConfig) {
      return;
    }

    customProviders[providerName] = {
      ...(existing ?? { type: resolvedConfig.type }),
      models: [
        ...(existing?.models ?? resolvedConfig.models ?? []),
        ...newModelDefs,
      ],
    };

    await this.twentyConfigService.set('AI_CUSTOM_PROVIDERS', customProviders);
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

  private getPreferences(): AiModelPreferences {
    return this.twentyConfigService.get('AI_MODEL_PREFERENCES');
  }

  getRecommendedModelIds(): Set<string> {
    const prefs = this.getPreferences();

    return new Set(prefs.recommendedModels ?? []);
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
    return this.getDefaultModelForRole('fast');
  }

  getDefaultPerformanceModel(): RegisteredAIModel {
    return this.getDefaultModelForRole('smart');
  }

  private getDefaultModelForRole(role: 'fast' | 'smart'): RegisteredAIModel {
    const prefs = this.getPreferences();
    const preferenceKey =
      role === 'fast' ? 'defaultFastModels' : 'defaultSmartModels';

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
      modelFamily: inferModelFamily(
        registeredModel.provider,
        registeredModel.modelId,
      ),
      provider: registeredModel.provider,
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
    };
  }

  // All models are allowed unless explicitly disabled in AI_MODEL_PREFERENCES
  isModelAdminAllowed(modelId: string): boolean {
    if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
      return true;
    }

    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      return false;
    }

    const prefs = this.getPreferences();
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
  }> {
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
      };
    });
  }

  // Writes to AI_MODEL_PREFERENCES.disabledModels
  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      throw new AgentException(
        `Cannot toggle model "${modelId}": not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const prefs = { ...this.getPreferences() };
    const currentDisabled = prefs.disabledModels ?? [];

    if (enabled) {
      prefs.disabledModels = currentDisabled.filter((id) => id !== modelId);
    } else {
      if (!currentDisabled.includes(modelId)) {
        prefs.disabledModels = [...currentDisabled, modelId];
      }
    }

    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
  }

  // Writes to AI_MODEL_PREFERENCES.recommendedModels
  async setModelRecommended(
    modelId: string,
    recommended: boolean,
  ): Promise<void> {
    const cached = this.providerModelDefCache.get(modelId);

    if (!cached) {
      throw new AgentException(
        `Cannot update model "${modelId}": not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const prefs = { ...this.getPreferences() };
    const currentRecommended = prefs.recommendedModels ?? [];

    if (recommended) {
      if (!currentRecommended.includes(modelId)) {
        prefs.recommendedModels = [...currentRecommended, modelId];
      }
    } else {
      prefs.recommendedModels = currentRecommended.filter(
        (id) => id !== modelId,
      );
    }

    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
  }

  // Writes to AI_MODEL_PREFERENCES.defaultFastModels or defaultSmartModels
  async setDefaultModel(
    role: 'smart' | 'fast',
    modelId: string,
  ): Promise<void> {
    const prefs = { ...this.getPreferences() };
    const key = role === 'fast' ? 'defaultFastModels' : 'defaultSmartModels';

    // Put the selected model first, keep the rest as fallbacks
    const current = prefs[key] ?? [];
    const filtered = current.filter((id) => id !== modelId);

    prefs[key] = [modelId, ...filtered];

    await this.twentyConfigService.set('AI_MODEL_PREFERENCES', prefs);
  }

  getResolvedProvidersForAdmin(): AiProvidersConfig {
    return this.providerConfigService.getResolvedProviders();
  }

  getCatalogProviderNames(): Set<string> {
    return this.providerConfigService.getCatalogProviderNames();
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
