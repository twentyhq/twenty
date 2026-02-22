import { Injectable } from '@nestjs/common';

import {
  createAmazonBedrock,
  type AmazonBedrockProvider,
} from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { type LanguageModel } from 'ai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import {
  AI_MODELS,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  InferenceProvider,
  ModelFamily,
  type AIModelConfig,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { ANTHROPIC_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/anthropic-models.const';
import { BEDROCK_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/bedrock-models.const';
import { GOOGLE_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/google-models.const';
import { GROQ_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/groq-models.const';
import { MISTRAL_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/mistral-models.const';
import { OPENAI_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/openai-models.const';
import { XAI_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/xai-models.const';

export interface RegisteredAIModel {
  modelId: string;
  inferenceProvider: InferenceProvider;
  model: LanguageModel;
  doesSupportThinking?: boolean;
}

@Injectable()
export class AiModelRegistryService {
  private modelRegistry: Map<string, RegisteredAIModel> = new Map();
  private bedrockProvider: AmazonBedrockProvider | null = null;

  constructor(private twentyConfigService: TwentyConfigService) {
    this.buildModelRegistry();
  }

  getBedrockProvider(): AmazonBedrockProvider | null {
    return this.bedrockProvider;
  }

  private buildModelRegistry(): void {
    this.modelRegistry.clear();
    this.bedrockProvider = null;

    const openaiApiKey = this.twentyConfigService.get('OPENAI_API_KEY');

    if (openaiApiKey) {
      this.registerOpenAIModels();
    }

    const anthropicApiKey = this.twentyConfigService.get('ANTHROPIC_API_KEY');

    if (anthropicApiKey) {
      this.registerAnthropicModels();
    }

    const xaiApiKey = this.twentyConfigService.get('XAI_API_KEY');

    if (xaiApiKey) {
      this.registerXaiModels();
    }

    const groqApiKey = this.twentyConfigService.get('GROQ_API_KEY');

    if (groqApiKey) {
      this.registerGroqModels();
    }

    const googleApiKey = this.twentyConfigService.get('GOOGLE_API_KEY');

    if (googleApiKey) {
      this.registerGoogleModels();
    }

    const mistralApiKey = this.twentyConfigService.get('MISTRAL_API_KEY');

    if (mistralApiKey) {
      this.registerMistralModels();
    }

    const bedrockRegion = this.twentyConfigService.get('AWS_BEDROCK_REGION');

    if (bedrockRegion) {
      this.registerBedrockModels(bedrockRegion);
    }

    const openaiCompatibleBaseUrl = this.twentyConfigService.get(
      'OPENAI_COMPATIBLE_BASE_URL',
    );
    const openaiCompatibleModelNames = this.twentyConfigService.get(
      'OPENAI_COMPATIBLE_MODEL_NAMES',
    );

    if (openaiCompatibleBaseUrl && openaiCompatibleModelNames) {
      this.registerOpenAICompatibleModels(
        openaiCompatibleBaseUrl,
        openaiCompatibleModelNames,
      );
    }
  }

  private registerOpenAIModels(): void {
    OPENAI_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.OPENAI,
        model: openai(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerAnthropicModels(): void {
    ANTHROPIC_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.ANTHROPIC,
        model: anthropic(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerXaiModels(): void {
    XAI_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.XAI,
        model: xai(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerGroqModels(): void {
    GROQ_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.GROQ,
        model: groq(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerGoogleModels(): void {
    GOOGLE_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.GOOGLE,
        model: google(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerMistralModels(): void {
    MISTRAL_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.MISTRAL,
        model: mistral(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerBedrockModels(region: string): void {
    const accessKeyId = this.twentyConfigService.get(
      'AWS_BEDROCK_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.twentyConfigService.get(
      'AWS_BEDROCK_SECRET_ACCESS_KEY',
    );
    const sessionToken = this.twentyConfigService.get(
      'AWS_BEDROCK_SESSION_TOKEN',
    );

    this.bedrockProvider = createAmazonBedrock({
      region,
      ...(accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey, sessionToken }
        : {}),
    });

    BEDROCK_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        inferenceProvider: InferenceProvider.BEDROCK,
        model: this.bedrockProvider!(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerOpenAICompatibleModels(
    baseUrl: string,
    modelNamesString: string,
  ): void {
    const apiKey = this.twentyConfigService.get('OPENAI_COMPATIBLE_API_KEY');
    const provider = createOpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });

    const modelNames = modelNamesString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    modelNames.forEach((modelId) => {
      this.modelRegistry.set(modelId, {
        modelId,
        inferenceProvider: InferenceProvider.OPENAI_COMPATIBLE,
        model: provider(modelId),
      });
    });
  }

  getModel(modelId: string): RegisteredAIModel | undefined {
    return this.modelRegistry.get(modelId);
  }

  getAvailableModels(): RegisteredAIModel[] {
    return Array.from(this.modelRegistry.values());
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
        'No AI models are available. Please configure at least one AI provider (OPENAI_API_KEY, ANTHROPIC_API_KEY, AWS_BEDROCK_REGION, GOOGLE_API_KEY, XAI_API_KEY, GROQ_API_KEY, or MISTRAL_API_KEY).',
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
        'No AI models are available. Please configure at least one AI provider (OPENAI_API_KEY, ANTHROPIC_API_KEY, AWS_BEDROCK_REGION, GOOGLE_API_KEY, XAI_API_KEY, GROQ_API_KEY, or MISTRAL_API_KEY).',
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

      const modelConfig = AI_MODELS.find(
        (model) => model.modelId === defaultModel.modelId,
      );

      if (modelConfig) {
        return modelConfig;
      }

      return this.createDefaultConfigForCustomModel(defaultModel);
    }

    const predefinedModel = AI_MODELS.find(
      (model) => model.modelId === modelId,
    );

    if (predefinedModel) {
      return predefinedModel;
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
      modelFamily: this.inferModelFamily(registeredModel.inferenceProvider),
      inferenceProvider: registeredModel.inferenceProvider,
      inputCostPerMillionTokens: 0,
      outputCostPerMillionTokens: 0,
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
    };
  }

  private inferModelFamily(inferenceProvider: InferenceProvider): ModelFamily {
    const providerToFamily: Partial<Record<InferenceProvider, ModelFamily>> = {
      [InferenceProvider.OPENAI]: ModelFamily.OPENAI,
      [InferenceProvider.ANTHROPIC]: ModelFamily.ANTHROPIC,
      [InferenceProvider.BEDROCK]: ModelFamily.ANTHROPIC,
      [InferenceProvider.GOOGLE]: ModelFamily.GOOGLE,
      [InferenceProvider.MISTRAL]: ModelFamily.MISTRAL,
      [InferenceProvider.XAI]: ModelFamily.XAI,
      [InferenceProvider.GROQ]: ModelFamily.OPENAI,
    };

    return providerToFamily[inferenceProvider] ?? ModelFamily.OPENAI;
  }

  refreshRegistry(): void {
    this.buildModelRegistry();
  }

  async resolveModelForAgent(agent: { modelId: string } | null) {
    const aiModel = this.getEffectiveModelConfig(
      agent?.modelId ?? DEFAULT_SMART_MODEL,
    );

    await this.validateApiKey(aiModel.inferenceProvider);
    const registeredModel = this.getModel(aiModel.modelId);

    if (!registeredModel) {
      throw new AgentException(
        `Model ${aiModel.modelId} not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return registeredModel;
  }

  async validateApiKey(inferenceProvider: InferenceProvider): Promise<void> {
    let apiKey: string | undefined;

    switch (inferenceProvider) {
      case InferenceProvider.OPENAI:
        apiKey = this.twentyConfigService.get('OPENAI_API_KEY');
        break;
      case InferenceProvider.ANTHROPIC:
        apiKey = this.twentyConfigService.get('ANTHROPIC_API_KEY');
        break;
      case InferenceProvider.XAI:
        apiKey = this.twentyConfigService.get('XAI_API_KEY');
        break;
      case InferenceProvider.GROQ:
        apiKey = this.twentyConfigService.get('GROQ_API_KEY');
        break;
      case InferenceProvider.GOOGLE:
        apiKey = this.twentyConfigService.get('GOOGLE_API_KEY');
        break;
      case InferenceProvider.MISTRAL:
        apiKey = this.twentyConfigService.get('MISTRAL_API_KEY');
        break;
      case InferenceProvider.BEDROCK:
        apiKey = this.twentyConfigService.get('AWS_BEDROCK_REGION');
        break;
      case InferenceProvider.OPENAI_COMPATIBLE:
        apiKey = this.twentyConfigService.get('OPENAI_COMPATIBLE_API_KEY');
        break;
      default:
        return;
    }

    if (!apiKey) {
      throw new AgentException(
        `${inferenceProvider.toUpperCase()} API key not configured. Please set the appropriate environment variable.`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }
}
