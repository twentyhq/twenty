import defaultAiEvaluationProviders from 'src/engine/metadata-modules/ai/ai-models/ai-evaluation-providers.json';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiProvidersConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';
import { normalizeAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/normalize-ai-providers.util';

const PROVIDERS = normalizeAiProviders(
  defaultAiEvaluationProviders as AiProvidersConfig,
);

// Hand-maintained, unlike ai-providers.json: models.dev has no notion of an
// evaluation model, so the daily sync can neither add these nor keep them.
describe('ai-evaluation-providers.json integrity', () => {
  it('should pass Zod schema validation', () => {
    expect(() =>
      aiProvidersConfigSchema.parse(defaultAiEvaluationProviders),
    ).not.toThrow();
  });

  it('should carry evaluation models only', () => {
    Object.values(PROVIDERS).forEach((config) => {
      expect(config.models?.length ?? 0).toBeGreaterThan(0);

      (config.models ?? []).forEach((model) => {
        expect(model.kind).toBe('evaluation');
      });
    });
  });

  it('should declare the question types and token costs of every model', () => {
    Object.values(PROVIDERS).forEach((config) => {
      (config.models ?? []).forEach((model) => {
        expect(model.supportedQuestionTypes?.length ?? 0).toBeGreaterThan(0);
        expect(model.inputCostPerMillionTokens).toBeDefined();
        expect(model.outputCostPerMillionTokens).toBeDefined();
      });
    });
  });

  // A model that emits no text has neither, and asserting them would be
  // asserting a number nothing reads.
  it('should size no context window', () => {
    Object.values(PROVIDERS).forEach((config) => {
      (config.models ?? []).forEach((model) => {
        expect(model.contextWindowTokens).toBeUndefined();
        expect(model.maxOutputTokens).toBeUndefined();
      });
    });
  });

  it('should have npm field set for all providers', () => {
    Object.values(PROVIDERS).forEach((config) => {
      expect(config.npm).toMatch(/^@ai-sdk\//);
    });
  });

  // The two files merge into one keyed map, so a repeated name would drop
  // whichever side loses.
  it('should not name a provider the generated catalog already names', () => {
    const generatedProviderNames = new Set(Object.keys(defaultAiProviders));

    Object.keys(PROVIDERS).forEach((providerName) => {
      expect(generatedProviderNames.has(providerName)).toBe(false);
    });
  });

  // Where a self-hosted instance processes and retains data depends on its own
  // provider accounts, so the shipped catalog states neither on its behalf.
  it('should not assert data residency or zero data retention', () => {
    Object.values(PROVIDERS).forEach((config) => {
      expect(config.dataResidency).toBeUndefined();

      (config.models ?? []).forEach((model) => {
        expect(model.dataResidency).toBeUndefined();
        expect(model.zeroDataRetention).toBeUndefined();
      });
    });
  });
});
