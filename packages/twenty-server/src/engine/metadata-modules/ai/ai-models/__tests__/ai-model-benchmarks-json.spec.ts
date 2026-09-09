import benchmarkOverlay from 'src/engine/metadata-modules/ai/ai-models/ai-model-benchmarks.json';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiModelBenchmarkSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const OVERLAY_MODELS = benchmarkOverlay.models as Record<
  string,
  { aliases: string[] } & Record<string, unknown>
>;

const CATALOG_MODELS = Object.values(
  defaultAiProviders as AiProvidersConfig,
).flatMap((provider) => provider.models ?? []);

describe('ai-model-benchmarks.json integrity', () => {
  it('should name the publisher every figure came from', () => {
    expect(benchmarkOverlay.source).toBe('artificialanalysis.ai');
  });

  it('should pass Zod schema validation for every entry', () => {
    Object.values(OVERLAY_MODELS).forEach(({ aliases: _aliases, ...entry }) => {
      expect(() => aiModelBenchmarkSchema.parse(entry)).not.toThrow();
    });
  });

  it('should agree with the benchmark merged into the catalog', () => {
    // The overlay is empty until the sync runs with an API key configured, so
    // this checks the two artifacts cannot drift rather than pinning a count.
    const scored = CATALOG_MODELS.filter(
      (model) => model.benchmark !== undefined,
    );

    scored.forEach((model) => {
      const { aliases, ...overlayEntry } = OVERLAY_MODELS[model.name];

      expect(overlayEntry).toEqual(model.benchmark);
      expect(aliases).toContain(model.name);
    });
  });

  it('should hold no entry for a model the catalog does not score', () => {
    const scoredNames = new Set(
      CATALOG_MODELS.filter((model) => model.benchmark !== undefined).map(
        (model) => model.name,
      ),
    );

    Object.keys(OVERLAY_MODELS).forEach((name) => {
      expect(scoredNames.has(name)).toBe(true);
    });
  });
});
