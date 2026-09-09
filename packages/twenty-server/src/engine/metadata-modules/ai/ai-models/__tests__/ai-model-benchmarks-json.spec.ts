import benchmarkOverlay from 'src/engine/metadata-modules/ai/ai-models/ai-model-benchmarks.json';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiModelBenchmarksSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const OVERLAY_MODELS = benchmarkOverlay.models as Record<string, unknown>;

const CATALOG_MODELS = Object.values(
  defaultAiProviders as AiProvidersConfig,
).flatMap((provider) => provider.models ?? []);

describe('ai-model-benchmarks.json integrity', () => {
  it('should pass Zod schema validation for every entry', () => {
    Object.values(OVERLAY_MODELS).forEach((entry) => {
      expect(() => aiModelBenchmarksSchema.parse(entry)).not.toThrow();
    });
  });

  it('should carry benchmarks for a meaningful share of the catalog', () => {
    const scored = CATALOG_MODELS.filter(
      (model) => model.benchmarks?.intelligenceIndex !== undefined,
    );

    // Public benchmark coverage is partial by nature, so this guards against a
    // matcher regression silently emptying the overlay rather than pinning an
    // exact number.
    expect(scored.length).toBeGreaterThan(CATALOG_MODELS.length / 2);
  });

  it('should agree with the benchmarks merged into the catalog', () => {
    CATALOG_MODELS.filter((model) => model.benchmarks !== undefined).forEach(
      (model) => {
        const { aliases, ...overlayEntry } = OVERLAY_MODELS[model.name] as {
          aliases: string[];
        };

        expect(overlayEntry).toEqual(model.benchmarks);
        expect(aliases).toContain(model.name);
      },
    );
  });
});
