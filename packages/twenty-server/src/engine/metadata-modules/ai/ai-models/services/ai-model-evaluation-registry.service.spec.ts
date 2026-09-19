import { Test } from '@nestjs/testing';
import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { computeCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';

const modelId = 'typesafe/jev-1.13.0';
const providers = {
  typesafe: {
    evaluationAdapter: 'typesafe',
    apiKey: 'test-key',
    models: [
      {
        name: 'jev-1.13.0',
        label: 'Jev',
        kind: 'evaluation',
        inputCostPerMillionTokens: 0.042,
        outputCostPerMillionTokens: 0,
      },
    ],
  },
};

describe('AI evaluation model registry', () => {
  let registry: AiModelRegistryService;
  const createProvider = jest.fn();
  const getDisabledModelIds = jest.fn();
  const getResolvedProviders = jest.fn();
  const computeHash = jest.fn();

  beforeEach(async () => {
    getDisabledModelIds.mockReturnValue([]);
    getResolvedProviders.mockReturnValue(providers);
    computeHash.mockReturnValue('initial');
    const module = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        { provide: ProviderConfigService, useValue: { getResolvedProviders } },
        {
          provide: SdkProviderFactoryService,
          useValue: { clearCache: jest.fn(), createProvider },
        },
        {
          provide: AiModelPreferencesService,
          useValue: {
            getDisabledModelIds,
            getDefaultModelIdsForTier: () => [modelId],
          },
        },
        { provide: ConfigGroupHashService, useValue: { computeHash } },
        {
          provide: CustomAiProviderAccessService,
          useValue: { getCachedHasAccess: () => true },
        },
      ],
    }).compile();
    registry = module.get(AiModelRegistryService);
  });

  it('registers an evaluation model without constructing a language provider', () => {
    expect(registry.getEvaluationModel(modelId)).toBeDefined();
    expect(registry.getModel(modelId)).toBeUndefined();
    expect(registry.getAvailableModels()).toEqual([]);
    expect(registry.getAvailableTranscriptionModels()).toEqual([]);
    expect(createProvider).not.toHaveBeenCalled();
    expect(registry.getAllModelsWithStatus()).toEqual([
      expect.objectContaining({
        isAvailable: true,
        modelConfig: expect.objectContaining({
          kind: 'evaluation',
          maxOutputTokens: 0,
        }),
      }),
    ]);
  });

  it('never resolves evaluation models as chat defaults or agent models', async () => {
    expect(registry.findDefaultModelForTier('fast')).toBeUndefined();
    expect(() => registry.validateModelAvailability(modelId)).toThrow(
      'does not support',
    );
    expect(() =>
      registry.validateModelAvailability(modelId, 'evaluation'),
    ).not.toThrow();
    await expect(registry.setDefaultModel('fast', modelId)).rejects.toThrow(
      'cannot be chat defaults',
    );
    expect(() => registry.resolveModelForAgent({ modelId })).toThrow();
  });

  it('applies admin disablement to the evaluation catalog and execution validation', () => {
    getDisabledModelIds.mockReturnValue([modelId]);
    expect(registry.getConfiguredEvaluationModels()).toEqual([]);
    expect(() => registry.validateModelAvailability(modelId)).toThrow(
      'disabled',
    );
  });

  it('removes a configured evaluator after credentials are removed', () => {
    expect(registry.getEvaluationModel(modelId)).toBeDefined();
    getResolvedProviders.mockReturnValue({
      typesafe: { ...providers.typesafe, apiKey: undefined },
    });
    computeHash.mockReturnValue('credentials-removed');
    expect(registry.getEvaluationModel(modelId)).toBeUndefined();
    expect(registry.getAllModelsWithStatus()[0].isAvailable).toBe(false);
  });

  it('bills input tokens and leaves output free', () => {
    const config = registry.getEffectiveModelConfig(modelId);
    expect(
      computeCostBreakdown(config, {
        inputTokens: 1_000_000,
        outputTokens: 100_000,
      }).totalCostInDollars,
    ).toBeCloseTo(0.042);
  });

  it('rejects ambiguous transports and mismatched model kinds', () => {
    expect(aiProvidersConfigSchema.safeParse(providers).success).toBe(true);
    expect(
      aiProvidersConfigSchema.safeParse({
        typesafe: { ...providers.typesafe, npm: '@ai-sdk/openai' },
      }).success,
    ).toBe(false);
    expect(
      aiProvidersConfigSchema.safeParse({
        typesafe: {
          ...providers.typesafe,
          models: [{ name: 'jev', label: 'Jev' }],
        },
      }).success,
    ).toBe(false);
  });
});
