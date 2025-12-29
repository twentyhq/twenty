import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

import {
  AI_MODELS,
  DEFAULT_SMART_MODEL,
  ModelProvider,
} from './ai-models.const';

describe('AI_MODELS', () => {
  it('should have at least one model per provider', () => {
    const providers = [
      ModelProvider.OPENAI,
      ModelProvider.ANTHROPIC,
      ModelProvider.XAI,
    ];

    providers.forEach((provider) => {
      const modelsForProvider = AI_MODELS.filter(
        (model) => model.provider === provider,
      );

      expect(modelsForProvider.length).toBeGreaterThan(0);
    });
  });

  it('should have all required fields for each model', () => {
    AI_MODELS.forEach((model) => {
      expect(model.modelId).toBeDefined();
      expect(model.label).toBeDefined();
      expect(model.description).toBeDefined();
      expect(model.provider).toBeDefined();
      expect(model.inputCostPer1kTokensInCents).toBeDefined();
      expect(model.outputCostPer1kTokensInCents).toBeDefined();
      expect(model.contextWindowTokens).toBeGreaterThan(0);
      expect(model.maxOutputTokens).toBeGreaterThan(0);
    });
  });

  it('should have unique model IDs', () => {
    const modelIds = AI_MODELS.map((model) => model.modelId);
    const uniqueModelIds = new Set(modelIds);

    expect(uniqueModelIds.size).toBe(modelIds.length);
  });

  it('should have at least one non-deprecated model per provider', () => {
    const providers = [
      ModelProvider.OPENAI,
      ModelProvider.ANTHROPIC,
      ModelProvider.XAI,
    ];

    providers.forEach((provider) => {
      const activeModelsForProvider = AI_MODELS.filter(
        (model) => model.provider === provider && !model.deprecated,
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
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-4o');

    expect(() => SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL)).toThrow(
      'No AI models are available. Please configure at least one AI provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY).',
    );
  });

  it('should return effective model config for DEFAULT_SMART_MODEL when models are available', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('gpt-4o');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'gpt-4o',
      provider: ModelProvider.OPENAI,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL);

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-4o');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI);
  });

  it('should return effective model config for DEFAULT_SMART_MODEL with custom model', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('mistral');

    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'mistral',
        provider: ModelProvider.OPENAI_COMPATIBLE,
        model: {} as any,
      },
    ]);

    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      provider: ModelProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig(DEFAULT_SMART_MODEL);

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPer1kTokensInCents).toBe(0);
    expect(RESULT.outputCostPer1kTokensInCents).toBe(0);
  });

  it('should return effective model config for specific model', () => {
    const RESULT = SERVICE.getEffectiveModelConfig('gpt-4o-mini');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('gpt-4o-mini');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI);
  });

  it('should return effective model config for custom model', () => {
    // Mock that the custom model exists in registry
    jest.spyOn(SERVICE, 'getModel').mockReturnValue({
      modelId: 'mistral',
      provider: ModelProvider.OPENAI_COMPATIBLE,
      model: {} as any,
    });

    const RESULT = SERVICE.getEffectiveModelConfig('mistral');

    expect(RESULT).toBeDefined();
    expect(RESULT.modelId).toBe('mistral');
    expect(RESULT.provider).toBe(ModelProvider.OPENAI_COMPATIBLE);
    expect(RESULT.label).toBe('mistral');
    expect(RESULT.inputCostPer1kTokensInCents).toBe(0);
    expect(RESULT.outputCostPer1kTokensInCents).toBe(0);
  });

  it('should throw error for non-existent model', () => {
    jest.spyOn(SERVICE, 'getModel').mockReturnValue(undefined);

    expect(() => SERVICE.getEffectiveModelConfig('non-existent-model')).toThrow(
      'Model with ID non-existent-model not found',
    );
  });

  it('should find first available model from comma-separated list', () => {
    // First model not available, second model available
    MOCK_CONFIG_SERVICE.get.mockReturnValue(
      'gpt-4.1-mini,claude-haiku-4-5-20251001,grok-3-mini',
    );

    const getModelSpy = jest
      .spyOn(SERVICE, 'getModel')
      .mockImplementation((modelId: string) => {
        if (modelId === 'claude-haiku-4-5-20251001') {
          return {
            modelId: 'claude-haiku-4-5-20251001',
            provider: ModelProvider.ANTHROPIC,
            model: {} as any,
          };
        }

        return undefined;
      });

    const result = SERVICE.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('claude-haiku-4-5-20251001');
    expect(getModelSpy).toHaveBeenCalledWith('gpt-4.1-mini');
    expect(getModelSpy).toHaveBeenCalledWith('claude-haiku-4-5-20251001');
  });

  it('should fall back to any available model if none in list are available', () => {
    MOCK_CONFIG_SERVICE.get.mockReturnValue('model-a,model-b,model-c');

    jest.spyOn(SERVICE, 'getModel').mockReturnValue(undefined);
    jest.spyOn(SERVICE, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'fallback-model',
        provider: ModelProvider.OPENAI_COMPATIBLE,
        model: {} as any,
      },
    ]);

    const result = SERVICE.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('fallback-model');
  });
});
