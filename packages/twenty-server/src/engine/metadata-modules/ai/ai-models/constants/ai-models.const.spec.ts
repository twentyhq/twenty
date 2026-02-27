import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

import {
  AI_MODELS,
  DEFAULT_SMART_MODEL,
  InferenceProvider,
} from './ai-models.const';

describe('AI_MODELS', () => {
  it('should have at least one model per inference provider', () => {
    const inferenceProviders = [
      InferenceProvider.OPENAI,
      InferenceProvider.ANTHROPIC,
      InferenceProvider.BEDROCK,
      InferenceProvider.GOOGLE,
      InferenceProvider.XAI,
      InferenceProvider.GROQ,
      InferenceProvider.MISTRAL,
    ];

    inferenceProviders.forEach((inferenceProvider) => {
      const modelsForProvider = AI_MODELS.filter(
        (model) => model.inferenceProvider === inferenceProvider,
      );

      expect(modelsForProvider.length).toBeGreaterThan(0);
    });
  });

  it('should have all required fields for each model', () => {
    AI_MODELS.forEach((model) => {
      expect(model.modelId).toBeDefined();
      expect(model.label).toBeDefined();
      expect(model.description).toBeDefined();
      expect(model.modelFamily).toBeDefined();
      expect(model.inferenceProvider).toBeDefined();
      expect(model.inputCostPerMillionTokens).toBeDefined();
      expect(model.outputCostPerMillionTokens).toBeDefined();
      expect(model.contextWindowTokens).toBeGreaterThan(0);
      expect(model.maxOutputTokens).toBeGreaterThan(0);
    });
  });

  it('should have unique model IDs', () => {
    const modelIds = AI_MODELS.map((model) => model.modelId);
    const uniqueModelIds = new Set(modelIds);

    expect(uniqueModelIds.size).toBe(modelIds.length);
  });

  it('should have at least one non-deprecated model per inference provider', () => {
    const inferenceProviders = [
      InferenceProvider.OPENAI,
      InferenceProvider.ANTHROPIC,
      InferenceProvider.BEDROCK,
      InferenceProvider.GOOGLE,
      InferenceProvider.XAI,
      InferenceProvider.GROQ,
      InferenceProvider.MISTRAL,
    ];

    inferenceProviders.forEach((inferenceProvider) => {
      const activeModelsForProvider = AI_MODELS.filter(
        (model) =>
          model.inferenceProvider === inferenceProvider && !model.deprecated,
      );

      expect(activeModelsForProvider.length).toBeGreaterThan(0);
    });
  });
});

describe('AiModelRegistryService', () => {
  let SERVICE: AiModelRegistryService;
  let MOCK_CONFIG_SERVICE: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    MOCK_CONFIG_SERVICE = {
      get: jest.fn(),
    } as any;

    const MODULE: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        {
          provide: TwentyConfigService,
          useValue: MOCK_CONFIG_SERVICE,
        },
      ],
    }).compile();

    SERVICE = MODULE.get<AiModelRegistryService>(AiModelRegistryService);
  });

  it('should return effective model config for DEFAULT_SMART_MODEL', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-5.2');

    expect(() => SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL)).toThrow(
      'No AI models are available. Please configure at least one AI provider (OPENAI_API_KEY, ANTHROPIC_API_KEY, AWS_BEDROCK_REGION, GOOGLE_API_KEY, XAI_API_KEY, GROQ_API_KEY, or MISTRAL_API_KEY).',
    );
  });

  it('should return effective model config for DEFAULT_SMART_MODEL when models are available', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-5.2');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'gpt-5.2',
        inferenceProvider: InferenceProvider.OPENAI,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'gpt-5.2',
      inferenceProvider: InferenceProvider.OPENAI,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL);

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-5.2');
    expect(RESULT.inferenceProvider).toBe(InferenceProvider.OPENAI);
  });

  it('should return effective model config for DEFAULT_SMART_MODEL with custom model', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('mistral');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'mistral',
        inferenceProvider: InferenceProvider.OPENAI_COMPATIBLE,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      inferenceProvider: InferenceProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL);

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.inferenceProvider).toBe(InferenceProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPerMillionTokens).toBe(0);
    expect(RESULT.outputCostPerMillionTokens).toBe(0);
  });

  it('should return effective model config for specific model', () => {
    const RESULT = SERVICE.getEffectiveModelConfig('gpt-5.2');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-5.2');
    expect(RESULT.inferenceProvider).toBe(InferenceProvider.OPENAI);
  });

  it('should return effective model config for custom model', () => {
    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      inferenceProvider: InferenceProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig('mistral');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.inferenceProvider).toBe(InferenceProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPerMillionTokens).toBe(0);
    expect(RESULT.outputCostPerMillionTokens).toBe(0);
  });

  it('should throw error for non-existent model', () => {
    jest.spyOn(SERVICE, 'getModel').mockReturnValue(undefined);

    expect(() => SERVICE.getEffectiveModelConfig('non-existent-model')).toThrow(
      'Model with ID non-existent-model not found',
    );
  });

  it('should find first available model from comma-separated list', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue(
      'gpt-5-mini,claude-haiku-4-5-20251001,gemini-3-flash-preview',
    );

    const getModelSpy = jest
      .spyOn(SERVICE, 'getModel')
      .mockImplementation((modelId: string) => {
        if (modelId === 'claude-haiku-4-5-20251001') {
          return {
            modelId: 'claude-haiku-4-5-20251001',
            inferenceProvider: InferenceProvider.ANTHROPIC,
            model: {} as any,
          };
        }

        return undefined;
      });

    const result = SERVICE.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('claude-haiku-4-5-20251001');
    expect(getModelSpy).toHaveBeenCalledWith('gpt-5-mini');
    expect(getModelSpy).toHaveBeenCalledWith('claude-haiku-4-5-20251001');
  });

  it('should fall back to any available model if none in list are available', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('model-a,model-b,model-c');

    jest.spyOn(SERVICE, 'getModel').mockReturnValue(undefined);
    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'fallback-model',
        inferenceProvider: InferenceProvider.OPENAI_COMPATIBLE,
        model: {} as any,
      },
    ]);

    const result = SERVICE.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('fallback-model');
  });
});
