import { aiProviderModelConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.schema';

const MEASURED_AT = '2026-09-10';

const modelWith = (overrides: Record<string, unknown>) => ({
  name: 'gpt-x',
  label: 'GPT X',
  efforts: ['low', 'high'],
  benchmark: { intelligenceIndex: 41, effort: 'high', measuredAt: MEASURED_AT },
  ...overrides,
});

const issuePaths = (model: Record<string, unknown>): string[] => {
  const result = aiProviderModelConfigSchema.safeParse(model);

  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('aiProviderModelConfigSchema', () => {
  it('accepts per-effort readings filed under the effort they were measured at', () => {
    expect(
      issuePaths(
        modelWith({
          benchmarkByEffort: {
            low: {
              intelligenceIndex: 30,
              effort: 'low',
              measuredAt: MEASURED_AT,
            },
            high: { intelligenceIndex: 41, measuredAt: MEASURED_AT },
          },
        }),
      ),
    ).toEqual([]);
  });

  it('rejects a reading filed under another effort than it was measured at', () => {
    // The registry hands a variant the reading under its own key, so this
    // would give the low-effort variant a high-effort figure.
    expect(
      issuePaths(
        modelWith({
          benchmarkByEffort: {
            low: {
              intelligenceIndex: 41,
              effort: 'high',
              measuredAt: MEASURED_AT,
            },
          },
        }),
      ),
    ).toEqual(['benchmarkByEffort.low.effort']);
  });

  it('rejects a reading for an effort the model does not declare', () => {
    expect(
      issuePaths(
        modelWith({
          benchmarkByEffort: {
            max: {
              intelligenceIndex: 45,
              effort: 'max',
              measuredAt: MEASURED_AT,
            },
          },
        }),
      ),
    ).toEqual(['benchmarkByEffort.max']);
  });

  it('rejects per-effort readings on a model that declares no efforts', () => {
    expect(
      issuePaths(
        modelWith({
          efforts: undefined,
          benchmarkByEffort: {
            low: {
              intelligenceIndex: 30,
              effort: 'low',
              measuredAt: MEASURED_AT,
            },
          },
        }),
      ),
    ).toEqual(['benchmarkByEffort.low']);
  });

  it('rejects an effort outside the supported vocabulary', () => {
    expect(
      issuePaths(
        modelWith({
          benchmarkByEffort: {
            turbo: { intelligenceIndex: 30, measuredAt: MEASURED_AT },
          },
        }),
      ),
    ).toContain('benchmarkByEffort.turbo');
  });
});
