import { isAiModelEffort } from 'twenty-shared/ai';

import benchmarkOverlay from 'src/engine/metadata-modules/ai/ai-models/ai-model-benchmarks.json';
import defaultAiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { aiModelBenchmarkSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.schema';
import { type AiProvidersConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-providers-config.type';

type OverlayReading = { aliases: string[] } & Record<string, unknown>;

type OverlayEntry = OverlayReading & {
  benchmarkByEffort?: Record<string, OverlayReading>;
};

const OVERLAY_MODELS = benchmarkOverlay.models as Record<string, OverlayEntry>;

const CATALOG_MODELS = Object.values(
  defaultAiProviders as AiProvidersConfig,
).flatMap((provider) => provider.models ?? []);

const SCORED_CATALOG_MODELS = CATALOG_MODELS.filter(
  (model) => model.benchmark !== undefined,
);

const withoutAliases = ({ aliases: _aliases, ...reading }: OverlayReading) =>
  reading;

const toBenchmark = ({
  benchmarkByEffort: _benchmarkByEffort,
  ...reading
}: OverlayEntry) => withoutAliases(reading);

describe('ai-model-benchmarks.json integrity', () => {
  it('should name the publisher every figure came from', () => {
    expect(benchmarkOverlay.source).toBe('artificialanalysis.ai');
  });

  it('should pass Zod schema validation for every entry and per-effort reading', () => {
    Object.values(OVERLAY_MODELS).forEach((entry) => {
      expect(() =>
        aiModelBenchmarkSchema.parse(toBenchmark(entry)),
      ).not.toThrow();

      Object.entries(entry.benchmarkByEffort ?? {}).forEach(
        ([effort, reading]) => {
          expect(isAiModelEffort(effort)).toBe(true);
          expect(() =>
            aiModelBenchmarkSchema.parse(withoutAliases(reading)),
          ).not.toThrow();
        },
      );
    });
  });

  it('should agree with the benchmark merged into the catalog', () => {
    // The overlay is empty until the sync runs with an API key configured, so
    // this checks the two artifacts cannot drift rather than pinning a count.
    SCORED_CATALOG_MODELS.forEach((model) => {
      const entry = OVERLAY_MODELS[model.name];

      expect(toBenchmark(entry)).toEqual(model.benchmark);
      expect(entry.aliases).toContain(model.name);

      const overlayReadings = Object.fromEntries(
        Object.entries(entry.benchmarkByEffort ?? {}).map(
          ([effort, reading]) => [effort, withoutAliases(reading)],
        ),
      );

      expect(overlayReadings).toEqual(model.benchmarkByEffort ?? {});
    });
  });

  it('should score an effort only where the model declares it', () => {
    CATALOG_MODELS.forEach((model) => {
      Object.keys(model.benchmarkByEffort ?? {}).forEach((effort) => {
        expect(model.efforts ?? []).toContain(effort);
      });
    });
  });

  it('should hold no entry for a model the catalog does not score', () => {
    const scoredNames = new Set(
      SCORED_CATALOG_MODELS.map((model) => model.name),
    );

    Object.keys(OVERLAY_MODELS).forEach((name) => {
      expect(scoredNames.has(name)).toBe(true);
    });
  });
});
