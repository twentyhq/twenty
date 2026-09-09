import benchmarkOverlay from 'src/engine/metadata-modules/ai/ai-models/ai-model-benchmarks.json';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiModelBenchmarksSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmarks.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

const OVERLAY_MODELS = benchmarkOverlay.models as Record<string, unknown>;

const CATALOG_MODELS = Object.values(
  defaultAiProviders as AiProvidersConfig,
).flatMap((provider) => provider.models ?? []);

describe('ai-model-benchmarks.json integrity', () => {
  it('should name the publisher every figure came from', () => {
    expect(benchmarkOverlay.source).toBe('artificialanalysis.ai');
  });

  it('should pass Zod schema validation for every measured entry', () => {
    Object.values(OVERLAY_MODELS)
      .filter((entry) => 'measuredAt' in (entry as object))
      .forEach((entry) => {
        expect(() => aiModelBenchmarksSchema.parse(entry)).not.toThrow();
      });
  });

  it('should never hold an entry that says nothing at all', () => {
    // An undated entry is a price observation, which is the only other reason
    // a model earns a row here.
    Object.values(OVERLAY_MODELS)
      .filter((entry) => !('measuredAt' in (entry as object)))
      .forEach((entry) => {
        expect(
          (entry as { artificialAnalysisPrices?: unknown })
            .artificialAnalysisPrices,
        ).toBeDefined();
      });
  });

  it('should agree with the benchmarks merged into the catalog', () => {
    // The overlay is empty until the sync runs with an API key configured, so
    // this checks the two artifacts cannot drift rather than pinning a count.
    // The overlay may hold more entries than the catalog: a model with only a
    // price observation earns an overlay row but no `benchmarks` block.
    const scored = CATALOG_MODELS.filter(
      (model) => model.benchmarks !== undefined,
    );

    expect(scored.length).toBeLessThanOrEqual(
      Object.keys(OVERLAY_MODELS).length,
    );

    scored.forEach((model) => {
      const {
        aliases,
        artificialAnalysisPrices: _prices,
        ...overlayEntry
      } = OVERLAY_MODELS[model.name] as {
        aliases: string[];
        artificialAnalysisPrices?: unknown;
      };

      expect(overlayEntry).toEqual(model.benchmarks);
      expect(aliases).toContain(model.name);
    });
  });
});
