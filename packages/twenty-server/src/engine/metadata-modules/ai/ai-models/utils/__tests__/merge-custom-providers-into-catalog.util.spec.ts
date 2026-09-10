import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { mergeCustomProvidersIntoCatalog } from 'src/engine/metadata-modules/ai/ai-models/utils/merge-custom-providers-into-catalog.util';

const catalog: AiProvidersConfig = {
  openai: {
    npm: '@ai-sdk/openai',
    label: 'OpenAI',
    apiKey: '{{OPENAI_API_KEY}}',
    models: [
      {
        name: 'gpt-5.6-luna',
        label: 'GPT-5.6 Luna',
        efforts: ['low', 'medium', 'high'],
        benchmark: { intelligenceIndex: 37.5 },
        inputCostPerMillionTokens: 0.2,
        outputCostPerMillionTokens: 1.2,
      },
      {
        name: 'gpt-5.6-sol',
        label: 'GPT-5.6 Sol',
        inputCostPerMillionTokens: 4,
        outputCostPerMillionTokens: 20,
      },
    ],
  },
} as unknown as AiProvidersConfig;

describe('mergeCustomProvidersIntoCatalog', () => {
  it('keeps catalog efforts and benchmarks on a custom model the catalog knows', () => {
    const merged = mergeCustomProvidersIntoCatalog({
      catalog,
      custom: {
        openai: {
          npm: '@ai-sdk/openai',
          label: 'OpenAI (gateway)',
          apiKey: 'sk-custom',
          models: [
            {
              name: 'gpt-5.6-luna',
              label: 'Luna via gateway',
              inputCostPerMillionTokens: 0.3,
              outputCostPerMillionTokens: 1.5,
            },
          ],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(merged.openai.label).toBe('OpenAI (gateway)');
    expect(merged.openai.apiKey).toBe('sk-custom');
    expect(merged.openai.models).toHaveLength(1);
    expect(merged.openai.models?.[0]).toMatchObject({
      name: 'gpt-5.6-luna',
      label: 'Luna via gateway',
      efforts: ['low', 'medium', 'high'],
      benchmark: { intelligenceIndex: 37.5 },
      inputCostPerMillionTokens: 0.3,
      outputCostPerMillionTokens: 1.5,
    });
  });

  it('leaves a model the catalog does not know untouched', () => {
    const merged = mergeCustomProvidersIntoCatalog({
      catalog,
      custom: {
        openai: {
          npm: '@ai-sdk/openai',
          label: 'OpenAI',
          apiKey: 'sk-custom',
          models: [{ name: 'gpt-7', label: 'GPT-7' }],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(merged.openai.models).toEqual([{ name: 'gpt-7', label: 'GPT-7' }]);
  });

  it('adds a provider the catalog does not have as is', () => {
    const azure = {
      npm: '@ai-sdk/azure',
      label: 'Azure',
      apiKey: 'key',
      models: [{ name: 'gpt-5.4', label: 'GPT-5.4' }],
    };

    const merged = mergeCustomProvidersIntoCatalog({
      catalog,
      custom: { 'azure-foundry': azure } as unknown as AiProvidersConfig,
    });

    expect(merged['azure-foundry']).toBe(azure);
    expect(merged.openai).toBe(catalog.openai);
  });
});
