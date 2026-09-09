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

  it('should pass Zod schema validation for every entry', () => {
    Object.values(OVERLAY_MODELS).forEach((entry) => {
      expect(() => aiModelBenchmarksSchema.parse(entry)).not.toThrow();
    });
  });

  it('should agree with the benchmarks merged into the catalog', () => {
    // The overlay is empty until the sync runs with an API key configured, so
    // this checks the two artifacts cannot drift rather than pinning a count.
    const scored = CATALOG_MODELS.filter(
      (model) => model.benchmarks !== undefined,
    );

    expect(scored.length).toBe(Object.keys(OVERLAY_MODELS).length);

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
