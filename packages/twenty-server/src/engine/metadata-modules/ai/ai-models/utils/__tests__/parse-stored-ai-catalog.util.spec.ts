import { parseStoredAiCatalog } from 'src/engine/metadata-modules/ai/ai-models/utils/parse-stored-ai-catalog.util';

const openai = {
  npm: '@ai-sdk/openai',
  label: 'OpenAI',
  apiKey: '{{OPENAI_API_KEY}}',
  models: [
    { name: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
    { name: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
  ],
};

describe('parseStoredAiCatalog', () => {
  it('keeps a catalog it can read in full', () => {
    const { providers, skipped } = parseStoredAiCatalog({ openai });

    expect(providers).toEqual({ openai });
    expect(skipped).toEqual([]);
  });

  it('skips a provider whose SDK package this version does not ship and keeps the others', () => {
    const { providers, skipped } = parseStoredAiCatalog({
      openai,
      'future-provider': {
        npm: '@ai-sdk/future-provider',
        models: [{ name: 'future-model', label: 'Future model' }],
      },
    });

    expect(Object.keys(providers)).toEqual(['openai']);
    expect(providers.openai.models?.map((model) => model.name)).toEqual([
      'gpt-5.6-luna',
      'gpt-5.6-sol',
    ]);
    expect(skipped).toEqual([
      { entry: 'future-provider', reason: expect.stringContaining('npm') },
    ]);
  });

  it('skips a model of a kind this version does not know and keeps the rest of its provider', () => {
    const { providers, skipped } = parseStoredAiCatalog({
      openai: {
        ...openai,
        models: [
          ...openai.models,
          { name: 'gpt-future', label: 'GPT future', kind: 'future-kind' },
        ],
      },
    });

    expect(providers.openai.models?.map((model) => model.name)).toEqual([
      'gpt-5.6-luna',
      'gpt-5.6-sol',
    ]);
    expect(providers.openai.apiKey).toBe('{{OPENAI_API_KEY}}');
    expect(skipped).toEqual([
      { entry: 'openai/gpt-future', reason: expect.stringContaining('kind') },
    ]);
  });

  it('names a skipped model by its position when it has no name', () => {
    const { skipped } = parseStoredAiCatalog({
      openai: { ...openai, models: [{ label: 'No name' }] },
    });

    expect(skipped.map(({ entry }) => entry)).toEqual(['openai.models[0]']);
  });

  it('throws when the file is not a map of providers', () => {
    expect(() => parseStoredAiCatalog([openai])).toThrow();
    expect(() => parseStoredAiCatalog(null)).toThrow();
  });
});
