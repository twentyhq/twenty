import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';
import { normalizeAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/normalize-ai-providers.util';

const PROVIDERS = normalizeAiProviders(defaultAiProviders as AiProvidersConfig);

const EXPECTED_PROVIDER_NAMES = [
  'openai',
  'anthropic',
  'google',
  'xai',
  'mistral',
];

describe('ai-providers.json integrity', () => {
  it('should pass Zod schema validation', () => {
    expect(() =>
      aiProvidersConfigSchema.parse(defaultAiProviders),
    ).not.toThrow();
  });

  it('should have at least one model per expected provider', () => {
    EXPECTED_PROVIDER_NAMES.forEach((providerName) => {
      const config = PROVIDERS[providerName];

      expect(config).toBeDefined();
      expect((config?.models?.length ?? 0) > 0).toBe(true);
    });
  });

  it('should have all required fields for each model', () => {
    Object.values(PROVIDERS).forEach((config) => {
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

  it('should have unique composite model IDs across all providers', () => {
    const allCompositeIds: string[] = [];

    Object.entries(PROVIDERS).forEach(([key, config]) => {
      (config.models ?? []).forEach((model) => {
        allCompositeIds.push(buildCompositeModelId(key, model.name));
      });
    });

    expect(new Set(allCompositeIds).size).toBe(allCompositeIds.length);
  });

  it('should have at least one non-deprecated model per expected provider', () => {
    EXPECTED_PROVIDER_NAMES.forEach((providerName) => {
      const config = PROVIDERS[providerName];
      const hasActiveModel = (config?.models ?? []).some(
        (model) => !model.isDeprecated,
      );

      expect(hasActiveModel).toBe(true);
    });
  });

  it('should set source to catalog for all models after normalization', () => {
    Object.values(PROVIDERS).forEach((config) => {
      (config.models ?? []).forEach((model) => {
        expect(model.source).toBe('catalog');
      });
    });
  });

  it('should have npm field set for all providers', () => {
    Object.values(PROVIDERS).forEach((config) => {
      expect(config.npm).toBeDefined();
      expect(config.npm).toMatch(/^@ai-sdk\//);
    });
  });
});
