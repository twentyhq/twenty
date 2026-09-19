import { Test } from '@nestjs/testing';

import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

// Covers the catalog-to-cache hop rather than the assertions built on it: a
// capability that the catalog declares but registration drops is silently
// inert, and every check reading it passes for the wrong reason.
describe('AiModelRegistryService evaluation catalog', () => {
  let registry: AiModelRegistryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        {
          provide: ProviderConfigService,
          useValue: {
            getResolvedProviders: () => ({
              'typesafe-ai': {
                npm: '@ai-sdk/typesafe-ai',
                label: 'TypeSafe AI',
                apiKey: 'test-key',
                models: [
                  {
                    name: 'jev-latest',
                    label: 'Jev',
                    kind: 'evaluation',
                    inputCostPerMillionTokens: 0.042,
                    outputCostPerMillionTokens: 0,
                    supportedQuestionTypes: ['choice', 'score', 'boolean'],
                    maxCriteriaPerQuestion: 255,
                    maxScoreLevels: 10,
                    medianLatencyMs: 200,
                  },
                ],
              },
            }),
          },
        },
        {
          provide: SdkProviderFactoryService,
          useValue: {
            clearCache: jest.fn(),
            createProvider: () => ({
              createEvaluationModel: () => ({
                specificationVersion: 'v4',
                provider: 'typesafe-ai',
                modelId: 'jev-latest',
                supportedQuestionTypes: ['choice', 'score', 'boolean'],
                doEvaluate: jest.fn(),
              }),
            }),
          },
        },
        {
          provide: AiModelPreferencesService,
          useValue: {
            getDisabledModelIds: () => [],
            getDefaultModelIdsForTier: () => [],
          },
        },
        {
          provide: ConfigGroupHashService,
          useValue: { computeHash: () => 'test' },
        },
        {
          provide: CustomAiProviderAccessService,
          useValue: { getCachedHasAccess: () => true },
        },
      ],
    }).compile();

    registry = module.get(AiModelRegistryService);
  });

  it('carries every declared capability into the evaluation config', () => {
    const modelConfig = registry.getEvaluationModelConfig(
      'typesafe-ai/jev-latest',
    );

    expect(modelConfig).toMatchObject({
      modelId: 'typesafe-ai/jev-latest',
      supportedQuestionTypes: ['choice', 'score', 'boolean'],
      maxCriteriaPerQuestion: 255,
      maxScoreLevels: 10,
      medianLatencyMs: 200,
    });
  });

  it('keeps an evaluation model out of the language model registry', () => {
    expect(registry.getModel('typesafe-ai/jev-latest')).toBeUndefined();
    expect(registry.getModelConfig('typesafe-ai/jev-latest')).toBeUndefined();
    expect(
      registry
        .getAdminFilteredModels()
        .some(({ modelId }) => modelId.startsWith('typesafe-ai/')),
    ).toBe(false);
  });

  it('registers the model as runnable when the provider is configured', () => {
    expect(registry.getEvaluationModel('typesafe-ai/jev-latest')).toBeDefined();
  });
});
