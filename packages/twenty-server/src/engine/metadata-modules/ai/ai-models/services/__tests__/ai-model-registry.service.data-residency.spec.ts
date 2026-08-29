import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const buildRegistry = (providers: AiProvidersConfig) => {
  const providerConfigService = {
    getResolvedProviders: () => providers,
  };
  const sdkProviderFactory = {
    clearCache: jest.fn(),
    createProvider: () => ({ createModel: (name: string) => name }),
  };
  const preferencesService = {
    getPreferences: () => ({}),
    getRecommendedModelIds: () => new Set<string>(),
  };
  const configGroupHashService = { computeHash: () => 'hash' };

  return new AiModelRegistryService(
    providerConfigService as never,
    sdkProviderFactory as never,
    preferencesService as never,
    configGroupHashService as never,
  );
};

describe('AiModelRegistryService data residency resolution', () => {
  it('should fall back to the provider residency when the model does not declare one', () => {
    const registry = buildRegistry({
      openai: {
        npm: '@ai-sdk/openai',
        apiKey: 'key',
        dataResidency: 'us',
        models: [{ name: 'gpt-5.6-luna', label: 'Luna' }],
      },
    } as AiProvidersConfig);

    expect(registry.getModelConfig('openai/gpt-5.6-luna')?.dataResidency).toBe(
      'us',
    );
  });

  it('should let a model override the residency of the credential it shares', () => {
    const registry = buildRegistry({
      'amazon-bedrock': {
        npm: '@ai-sdk/amazon-bedrock',
        accessKeyId: 'id',
        secretAccessKey: 'secret',
        region: 'eu-west-3',
        dataResidency: 'eu',
        models: [
          { name: 'eu.anthropic.claude-sonnet-4-6', label: 'Sonnet 4.6 (EU)' },
          {
            name: 'global.anthropic.claude-sonnet-4-6',
            label: 'Sonnet 4.6 (global)',
            dataResidency: 'global',
          },
        ],
      },
    } as AiProvidersConfig);

    expect(
      registry.getModelConfig('amazon-bedrock/eu.anthropic.claude-sonnet-4-6')
        ?.dataResidency,
    ).toBe('eu');
    expect(
      registry.getModelConfig(
        'amazon-bedrock/global.anthropic.claude-sonnet-4-6',
      )?.dataResidency,
    ).toBe('global');
  });

  it('should leave residency undefined when neither the model nor the provider declares one', () => {
    const registry = buildRegistry({
      anthropic: {
        npm: '@ai-sdk/anthropic',
        apiKey: 'key',
        models: [{ name: 'claude-sonnet-5', label: 'Sonnet 5' }],
      },
    } as AiProvidersConfig);

    expect(
      registry.getModelConfig('anthropic/claude-sonnet-5')?.dataResidency,
    ).toBeUndefined();
  });
});
