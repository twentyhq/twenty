import { Test, type TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';

const DEFAULT_PROVIDERS: AiProvidersConfig = loadDefaultAiProviders();

const EXPECTED_PROVIDERS = ['openai', 'anthropic', 'google', 'xai', 'mistral'];

describe('Default AI Providers (ai-providers.json)', () => {
  it('should have at least one model per provider', () => {
    EXPECTED_PROVIDERS.forEach((providerName) => {
      const config = DEFAULT_PROVIDERS[providerName];

      expect(config).toBeDefined();
      expect((config?.models?.length ?? 0) > 0).toBe(true);
    });
  });

  it('should have all required fields for each model', () => {
    Object.entries(DEFAULT_PROVIDERS).forEach(([, config]) => {
      (config.models ?? []).forEach((model) => {
        expect(model.name).toBeDefined();
        expect(model.label).toBeDefined();
        expect(model.inputCostPerMillionTokens).toBeDefined();
        expect(model.outputCostPerMillionTokens).toBeDefined();
        expect(model.contextWindowTokens).toBeGreaterThan(0);
        expect(model.maxOutputTokens).toBeGreaterThan(0);
      });
    });
  });

  it('should have unique model IDs across all providers', () => {
    const allCompositeIds: string[] = [];

    Object.entries(DEFAULT_PROVIDERS).forEach(([key, config]) => {
      (config.models ?? []).forEach((model) => {
        allCompositeIds.push(buildCompositeModelId(key, model.name));
      });
    });

    const unique = new Set(allCompositeIds);

    expect(unique.size).toBe(allCompositeIds.length);
  });

  it('should have at least one non-deprecated model per provider', () => {
    EXPECTED_PROVIDERS.forEach((providerName) => {
      const config = DEFAULT_PROVIDERS[providerName];
      const hasActiveModel = (config?.models ?? []).some(
        (model) => !model.isDeprecated,
      );

      expect(hasActiveModel).toBe(true);
    });
  });

  it('should have source set to catalog for all models', () => {
    Object.entries(DEFAULT_PROVIDERS).forEach(([, config]) => {
      (config.models ?? []).forEach((model) => {
        expect(model.source).toBe('catalog');
      });
    });
  });

  it('should have npm field set for all providers', () => {
    Object.entries(DEFAULT_PROVIDERS).forEach(([, config]) => {
      expect(config.npm).toBeDefined();
      expect(config.npm).toMatch(/^@ai-sdk\//);
    });
  });
});

describe('AiModelRegistryService', () => {
  let service: AiModelRegistryService;
  let mockConfigService: jest.Mocked<TwentyConfigService>;
  let mockPreferencesService: {
    getPreferences: jest.Mock;
    getRecommendedModelIds: jest.Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue({}),
    } as any;

    const mockProviderConfigService = {
      getResolvedProviders: jest.fn().mockReturnValue({}),
    };

    mockPreferencesService = {
      getPreferences: jest.fn().mockReturnValue({}),
      getRecommendedModelIds: jest.fn().mockReturnValue(new Set()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        {
          provide: TwentyConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ProviderConfigService,
          useValue: mockProviderConfigService,
        },
        {
          provide: SdkProviderFactoryService,
          useValue: { clearCache: jest.fn() },
        },
        {
          provide: AiModelPreferencesService,
          useValue: mockPreferencesService,
        },
      ],
    }).compile();

    service = module.get<AiModelRegistryService>(AiModelRegistryService);
  });

  it('should throw when no models are available for AUTO_SELECT_SMART_MODEL_ID', () => {
    expect(() =>
      service.getEffectiveModelConfig(AUTO_SELECT_SMART_MODEL_ID),
    ).toThrow(
      'No AI models are available. Configure at least one AI provider.',
    );
  });

  it('should return effective model config for AUTO_SELECT_SMART_MODEL_ID when models are available', () => {
    jest.spyOn(service, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'openai/gpt-5.2',
        sdkPackage: '@ai-sdk/openai',
        model: {} as any,
      },
    ]);

    jest.spyOn(service, 'getModel').mockReturnValue({
      modelId: 'openai/gpt-5.2',
      sdkPackage: '@ai-sdk/openai',
      model: {} as any,
    });

    const result = service.getEffectiveModelConfig(AUTO_SELECT_SMART_MODEL_ID);

    expect(result).toBeDefined();
    expect(result.modelId).toBe('openai/gpt-5.2');
    expect(result.sdkPackage).toBe('@ai-sdk/openai');
  });

  it('should return effective model config for AUTO_SELECT_SMART_MODEL_ID with custom model', () => {
    jest.spyOn(service, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'custom/mistral',
        sdkPackage: '@ai-sdk/openai-compatible',
        model: {} as any,
      },
    ]);

    jest.spyOn(service, 'getModel').mockReturnValue({
      modelId: 'custom/mistral',
      sdkPackage: '@ai-sdk/openai-compatible',
      model: {} as any,
    });

    const result = service.getEffectiveModelConfig(AUTO_SELECT_SMART_MODEL_ID);

    expect(result).toBeDefined();
    expect(result.modelId).toBe('custom/mistral');
    expect(result.sdkPackage).toBe('@ai-sdk/openai-compatible');
    expect(result.label).toBe('custom/mistral');
    expect(result.inputCostPerMillionTokens).toBe(0);
    expect(result.outputCostPerMillionTokens).toBe(0);
  });

  it('should return effective model config for custom model', () => {
    jest.spyOn(service, 'getModel').mockReturnValue({
      modelId: 'custom/mistral',
      sdkPackage: '@ai-sdk/openai-compatible',
      model: {} as any,
    });

    const result = service.getEffectiveModelConfig('custom/mistral');

    expect(result).toBeDefined();
    expect(result.modelId).toBe('custom/mistral');
    expect(result.sdkPackage).toBe('@ai-sdk/openai-compatible');
    expect(result.label).toBe('custom/mistral');
    expect(result.inputCostPerMillionTokens).toBe(0);
    expect(result.outputCostPerMillionTokens).toBe(0);
  });

  it('should throw error for non-existent model', () => {
    jest.spyOn(service, 'getModel').mockReturnValue(undefined);

    expect(() => service.getEffectiveModelConfig('non-existent-model')).toThrow(
      'Model with ID non-existent-model not found',
    );
  });

  it('should find first available model from preferences list', () => {
    mockPreferencesService.getPreferences.mockReturnValue({
      defaultFastModels: [
        'openai/gpt-5-mini',
        'anthropic/claude-haiku-4-5-20251001',
        'google/gemini-3-flash-preview',
      ],
    });

    const getModelSpy = jest
      .spyOn(service, 'getModel')
      .mockImplementation((modelId: string) => {
        if (modelId === 'anthropic/claude-haiku-4-5-20251001') {
          return {
            modelId: 'anthropic/claude-haiku-4-5-20251001',
            sdkPackage: '@ai-sdk/anthropic',
            model: {} as any,
          };
        }

        return undefined;
      });

    const result = service.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('anthropic/claude-haiku-4-5-20251001');
    expect(getModelSpy).toHaveBeenCalledWith('openai/gpt-5-mini');
    expect(getModelSpy).toHaveBeenCalledWith(
      'anthropic/claude-haiku-4-5-20251001',
    );
  });

  it('should fall back to any available model if none in list are available', () => {
    mockPreferencesService.getPreferences.mockReturnValue({
      defaultFastModels: ['model-a', 'model-b', 'model-c'],
    });

    jest.spyOn(service, 'getModel').mockReturnValue(undefined);
    jest.spyOn(service, 'getAvailableModels').mockReturnValue([
      {
        modelId: 'fallback-model',
        sdkPackage: '@ai-sdk/openai-compatible',
        model: {} as any,
      },
    ]);

    const result = service.getDefaultSpeedModel();

    expect(result).toBeDefined();
    expect(result.modelId).toBe('fallback-model');
  });
});
