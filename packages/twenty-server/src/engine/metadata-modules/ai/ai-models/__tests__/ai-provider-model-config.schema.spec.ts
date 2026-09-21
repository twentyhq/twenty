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

  it('accepts an evaluation model declaring its question types and both token costs', () => {
    expect(
      issuePaths({
        name: 'jev-latest',
        label: 'Jev',
        kind: 'evaluation',
        inputCostPerMillionTokens: 0.042,
        outputCostPerMillionTokens: 0,
        supportedQuestionTypes: ['choice', 'score', 'boolean'],
        maxCriteriaPerQuestion: 255,
      }),
    ).toEqual([]);
  });

  it('rejects an evaluation model that declares no question types', () => {
    expect(
      issuePaths({
        name: 'jev-latest',
        label: 'Jev',
        kind: 'evaluation',
        inputCostPerMillionTokens: 0.042,
        outputCostPerMillionTokens: 0,
      }),
    ).toEqual(['supportedQuestionTypes']);
  });

  // Free output has to say so with an explicit 0, or the model bills nothing
  // while the provider still charges.
  it('rejects an evaluation model that omits a token cost', () => {
    expect(
      issuePaths({
        name: 'jev-latest',
        label: 'Jev',
        kind: 'evaluation',
        inputCostPerMillionTokens: 0.042,
        supportedQuestionTypes: ['choice'],
      }),
    ).toEqual(['inputCostPerMillionTokens']);
  });

  it('rejects question types declared on a model that is not an evaluation model', () => {
    expect(
      issuePaths(modelWith({ supportedQuestionTypes: ['choice'] })),
    ).toEqual(['supportedQuestionTypes']);
  });
});
