import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import {
  inheritCatalogReadings,
  mergeCustomProvidersIntoCatalog,
} from 'src/engine/metadata-modules/ai/ai-models/utils/merge-custom-providers-into-catalog.util';

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

  it('completes a custom reading with the catalog readings it does not set', () => {
    const catalogWithReadings = {
      openai: {
        ...catalog.openai,
        models: [
          {
            name: 'gpt-5.6-luna',
            label: 'GPT-5.6 Luna',
            efforts: ['low', 'high'],
            benchmark: { intelligenceIndex: 37.5, outputTokensPerSecond: 120 },
            benchmarkByEffort: {
              low: { intelligenceIndex: 21.8 },
              high: { intelligenceIndex: 32.9 },
            },
          },
        ],
      },
    } as unknown as AiProvidersConfig;

    const merged = mergeCustomProvidersIntoCatalog({
      catalog: catalogWithReadings,
      custom: {
        openai: {
          ...catalog.openai,
          models: [
            {
              name: 'gpt-5.6-luna',
              label: 'GPT-5.6 Luna',
              benchmark: { costPerTask: 0.1 },
              benchmarkByEffort: { high: { intelligenceIndex: 33 } },
            },
          ],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(merged.openai.models?.[0]).toMatchObject({
      efforts: ['low', 'high'],
      benchmark: {
        intelligenceIndex: 37.5,
        outputTokensPerSecond: 120,
        costPerTask: 0.1,
      },
      benchmarkByEffort: {
        low: { intelligenceIndex: 21.8 },
        high: { intelligenceIndex: 33 },
      },
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

  it('gives a route outside the catalog the readings of the model it serves, never its prices', () => {
    const merged = mergeCustomProvidersIntoCatalog({
      catalog,
      custom: {
        'amazon-bedrock': {
          npm: '@ai-sdk/amazon-bedrock',
          label: 'Bedrock',
          models: [
            {
              name: 'eu.openai.gpt-5.6-luna-v1:0',
              label: 'Luna on Bedrock',
              inputCostPerMillionTokens: 0.25,
              outputCostPerMillionTokens: 1.5,
            },
            { name: 'eu.mistral.pixtral-large', label: 'Pixtral' },
          ],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(merged['amazon-bedrock'].models?.[0]).toEqual({
      name: 'eu.openai.gpt-5.6-luna-v1:0',
      label: 'Luna on Bedrock',
      inputCostPerMillionTokens: 0.25,
      outputCostPerMillionTokens: 1.5,
      efforts: ['low', 'medium', 'high'],
      benchmark: { intelligenceIndex: 37.5 },
      benchmarkByEffort: undefined,
    });
    expect(merged['amazon-bedrock'].models?.[1]).toEqual({
      name: 'eu.mistral.pixtral-large',
      label: 'Pixtral',
      efforts: undefined,
      benchmark: undefined,
      benchmarkByEffort: undefined,
    });
    expect(merged.openai).toBe(catalog.openai);
  });

  it('matches a dotted model name to itself before stripping route segments', () => {
    const catalogWithDottedName = {
      openai: {
        ...catalog.openai,
        models: [
          {
            name: 'gpt-4.1',
            label: 'GPT-4.1',
            benchmark: { intelligenceIndex: 12.7 },
          },
          { name: '1', label: 'One', benchmark: { intelligenceIndex: 1 } },
        ],
      },
    } as unknown as AiProvidersConfig;

    const merged = mergeCustomProvidersIntoCatalog({
      catalog: catalogWithDottedName,
      custom: {
        'azure-foundry': {
          npm: '@ai-sdk/azure',
          label: 'Azure',
          models: [{ name: 'gpt-4.1', label: 'GPT-4.1 on Azure' }],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(merged['azure-foundry'].models?.[0]?.benchmark).toEqual({
      intelligenceIndex: 12.7,
    });
  });
});

describe('inheritCatalogReadings', () => {
  it('keeps only the providers it is given, with the catalog readings', () => {
    const providers = inheritCatalogReadings({
      catalog,
      providers: {
        'azure-foundry': {
          npm: '@ai-sdk/azure',
          label: 'Azure',
          apiKey: 'azure-key',
          models: [
            {
              name: 'gpt-5.6-luna',
              label: 'Luna on Azure',
              inputCostPerMillionTokens: 0.25,
              outputCostPerMillionTokens: 1.4,
            },
          ],
        },
      } as unknown as AiProvidersConfig,
    });

    expect(Object.keys(providers)).toEqual(['azure-foundry']);
    expect(providers['azure-foundry'].models?.[0]).toMatchObject({
      label: 'Luna on Azure',
      efforts: ['low', 'medium', 'high'],
      benchmark: { intelligenceIndex: 37.5 },
      inputCostPerMillionTokens: 0.25,
    });
  });
});
