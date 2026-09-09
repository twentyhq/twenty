import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';
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
  const customAiProviderAccessService = { getCachedHasAccess: () => true };

  return new AiModelRegistryService(
    providerConfigService as never,
    sdkProviderFactory as never,
    preferencesService as never,
    configGroupHashService as never,
    customAiProviderAccessService as never,
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

  it('should read retention from the model, which is the only level that carries it', () => {
    const registry = buildRegistry({
      anthropic: {
        npm: '@ai-sdk/anthropic',
        apiKey: 'key',
        models: [
          { name: 'claude-sonnet-5', label: 'Sonnet 5' },
          { name: 'claude-opus-5', label: 'Opus 5', zeroDataRetention: true },
        ],
      },
    } as AiProvidersConfig);

    expect(
      registry.getModelConfig('anthropic/claude-sonnet-5')?.zeroDataRetention,
    ).toBeUndefined();
    expect(
      registry.getModelConfig('anthropic/claude-opus-5')?.zeroDataRetention,
    ).toBe(true);
  });

  it('should drop a retention claim written at the provider level', () => {
    // The provider schema carries dataResidency but deliberately not
    // zeroDataRetention, so a claim written one level too high is discarded
    // rather than inherited by every model beneath it. Silent stripping is
    // what makes that safe, and what this pins.
    const parsed = aiProviderConfigSchema.parse({
      npm: '@ai-sdk/anthropic',
      apiKey: 'key',
      dataResidency: 'eu',
      zeroDataRetention: true,
      models: [{ name: 'claude-sonnet-5', label: 'Sonnet 5' }],
    });

    expect(parsed).not.toHaveProperty('zeroDataRetention');
    expect(parsed.dataResidency).toBe('eu');
  });
});
