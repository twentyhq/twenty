import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { mergeAiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/utils/merge-ai-providers-config.util';

const buildModel = (name: string, label = name): AiProviderModelConfig =>
  ({ name, label, modelFamily: 'MISTRAL' }) as AiProviderModelConfig;

const buildMistralProvider = (
  overrides: Partial<AiProviderConfig>,
): AiProviderConfig =>
  ({
    npm: '@ai-sdk/mistral',
    label: 'Mistral',
    ...overrides,
  }) as AiProviderConfig;

const CATALOG: AiProvidersConfig = {
  mistral: buildMistralProvider({
    apiKey: 'catalog-key',
    models: [buildModel('mistral-medium'), buildModel('mistral-small')],
  }),
  openai: {
    npm: '@ai-sdk/openai',
    label: 'OpenAI',
    models: [buildModel('gpt-5')],
  } as AiProviderConfig,
};

const modelNamesOf = (providers: AiProvidersConfig, providerName: string) =>
  providers[providerName].models?.map((model) => model.name);

describe('mergeAiProvidersConfig', () => {
  it('should keep the catalog models when a custom entry only overrides credentials', () => {
    const merged = mergeAiProvidersConfig(CATALOG, {
      mistral: buildMistralProvider({ apiKey: 'custom-key' }),
    });

    expect(merged.mistral.apiKey).toBe('custom-key');
    expect(modelNamesOf(merged, 'mistral')).toEqual([
      'mistral-medium',
      'mistral-small',
    ]);
  });

  it('should add custom models on top of the catalog ones', () => {
    const merged = mergeAiProvidersConfig(CATALOG, {
      mistral: buildMistralProvider({
        models: [buildModel('mistral-private')],
      }),
    });

    expect(modelNamesOf(merged, 'mistral')).toEqual([
      'mistral-medium',
      'mistral-small',
      'mistral-private',
    ]);
  });

  it('should let a custom model replace the catalog model of the same name', () => {
    const merged = mergeAiProvidersConfig(CATALOG, {
      mistral: buildMistralProvider({
        models: [buildModel('mistral-small', 'Renamed')],
      }),
    });

    expect(modelNamesOf(merged, 'mistral')).toEqual([
      'mistral-medium',
      'mistral-small',
    ]);
    expect(
      merged.mistral.models?.find((model) => model.name === 'mistral-small')
        ?.label,
    ).toBe('Renamed');
  });

  it('should keep providers that the custom config does not mention', () => {
    const merged = mergeAiProvidersConfig(CATALOG, {
      mistral: buildMistralProvider({ apiKey: 'custom-key' }),
    });

    expect(modelNamesOf(merged, 'openai')).toEqual(['gpt-5']);
  });

  it('should add a provider that only exists in the custom config', () => {
    const merged = mergeAiProvidersConfig(CATALOG, {
      selfHosted: {
        npm: '@ai-sdk/openai-compatible',
        label: 'Self hosted',
        baseUrl: 'https://llm.internal',
        models: [buildModel('local-model')],
      } as AiProviderConfig,
    });

    expect(merged.selfHosted.baseUrl).toBe('https://llm.internal');
    expect(Object.keys(merged).sort()).toEqual([
      'mistral',
      'openai',
      'selfHosted',
    ]);
  });

  it('should leave the catalog untouched when there is no custom config', () => {
    expect(mergeAiProvidersConfig(CATALOG, {})).toEqual(CATALOG);
  });
});
