import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModel } from 'ai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { ModelsDevEnrichmentService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-enrichment.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { ProviderDiscoveryService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-discovery.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { type AIModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { AiProvider } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider.enum';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { DEFAULT_CONTEXT_WINDOW_TOKENS } from 'src/engine/metadata-modules/ai/ai-models/types/default-context-window-tokens.const';
import { DEFAULT_FAST_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-fast-model.const';
import { DEFAULT_MAX_OUTPUT_TOKENS } from 'src/engine/metadata-modules/ai/ai-models/types/default-max-output-tokens.const';
import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai/ai-models/types/default-smart-model.const';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import { inferModelFamily } from 'src/engine/metadata-modules/ai/ai-models/utils/infer-model-family.util';
import { isDefaultModelSentinel } from 'src/engine/metadata-modules/ai/ai-models/utils/is-default-model-sentinel.util';
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
    private readonly preferencesService: AiModelPreferencesService,
  ) {
    this.buildModelRegistry();
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
          this.toAIModelConfig(compositeId, config, modelDef),
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
    const existingRawIds = new Set(models.map((model) => model.rawModelId));

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
    providerConfig: AiProviderConfig,
    modelDef: AiProviderModelConfig,
  ): AIModelConfig {
    return {
      modelId: compositeId,
      label: modelDef.label,
      provider: providerConfig.type,
      description: modelDef.description ?? compositeId,
      modelFamily:
        modelDef.modelFamily ??
        inferModelFamily(providerConfig.type, modelDef.rawModelId),
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
        (config.models ?? []).map((model) => model.rawModelId),
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
    return this.getDefaultModelForRole('fast');
  }

  getDefaultPerformanceModel(): RegisteredAIModel {
    return this.getDefaultModelForRole('smart');
  }

  private getDefaultModelForRole(role: 'fast' | 'smart'): RegisteredAIModel {
    const prefs = this.preferencesService.getPreferences();
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
    if (isDefaultModelSentinel(modelId)) {
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
      contextWindowTokens: DEFAULT_CONTEXT_WINDOW_TOKENS,
      maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
    };
  }

  isModelAdminAllowed(modelId: string): boolean {
    if (isDefaultModelSentinel(modelId)) {
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
    // No credentialed providers → nothing to enforce; agent is just metadata
    if (this.modelRegistry.size === 0) {
      return;
    }

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

  async setModelAdminEnabled(modelId: string, enabled: boolean): Promise<void> {
    await this.preferencesService.setModelAdminEnabled(
      modelId,
      enabled,
      this.providerModelDefCache,
    );
  }

  async setModelRecommended(
    modelId: string,
    recommended: boolean,
  ): Promise<void> {
    await this.preferencesService.setModelRecommended(
      modelId,
      recommended,
      this.providerModelDefCache,
    );
  }

  async setDefaultModel(
    role: 'smart' | 'fast',
    modelId: string,
  ): Promise<void> {
    await this.preferencesService.setDefaultModel(role, modelId);
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

  async resolveModelForAgent(
    agent: { modelId: string } | null,
  ): Promise<RegisteredAIModel> {
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
