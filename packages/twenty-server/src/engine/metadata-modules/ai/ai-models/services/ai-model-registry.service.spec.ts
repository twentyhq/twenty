import { Test } from '@nestjs/testing';

import { CustomAiProviderAccessService } from 'src/engine/core-modules/enterprise/services/custom-ai-provider-access.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ProviderConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/provider-config.service';
import { SdkProviderFactoryService } from 'src/engine/metadata-modules/ai/ai-models/services/sdk-provider-factory.service';

describe('AiModelRegistryService effort catalog', () => {
  let registry: AiModelRegistryService;
  const getDisabledModelIds = jest.fn((): string[] => []);

  beforeEach(async () => {
    getDisabledModelIds.mockReturnValue([]);
    const module = await Test.createTestingModule({
      providers: [
        AiModelRegistryService,
        {
          provide: ProviderConfigService,
          useValue: {
            getResolvedProviders: () => ({
              openai: {
                npm: '@ai-sdk/openai',
                apiKey: 'test-key',
                models: ['sol', 'astra'].map((name) => ({
                  name,
                  label: name,
                  efforts: ['medium', 'high'],
                  benchmarkByEffort: {
                    medium: { intelligenceIndex: 42 },
                  },
                })),
              },
            }),
          },
        },
        {
          provide: SdkProviderFactoryService,
          useValue: {
            clearCache: jest.fn(),
            createProvider: () => ({ createModel: () => ({}) }),
          },
        },
        {
          provide: AiModelPreferencesService,
          useValue: {
            getDisabledModelIds,
            getDefaultModelIdsForTier: () => ['openai/sol@high'],
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

  it('lists every selectable effort before any variant is requested', () => {
    expect(
      registry.getAdminFilteredModels().map(({ modelId }) => modelId),
    ).toEqual(
      expect.arrayContaining([
        'openai/sol@medium',
        'openai/sol@high',
        'openai/astra@medium',
        'openai/astra@high',
      ]),
    );
    expect(registry.getModelConfig('openai/astra@medium')?.benchmark).toEqual({
      intelligenceIndex: 42,
    });
    expect(registry.getModel('openai/astra@low')).toBeUndefined();
  });

  it('excludes all efforts of an admin-disabled model', () => {
    getDisabledModelIds.mockReturnValue(['openai/astra']);

    expect(
      registry
        .getAdminFilteredModels()
        .some(({ modelId }) => modelId.startsWith('openai/astra')),
    ).toBe(false);
  });

  it('exposes only base models in provider management after resolving variants', () => {
    registry.getModelConfig('openai/astra@medium');

    expect(
      registry.getAllModelsWithStatus().map(({ modelConfig, name }) => ({
        modelId: modelConfig.modelId,
        name,
      })),
    ).toEqual([
      { modelId: 'openai/sol', name: 'sol' },
      { modelId: 'openai/astra', name: 'astra' },
    ]);
  });
});
