import { readEvaluationConfidence } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/read-evaluation-confidence.util';

describe('readEvaluationConfidence', () => {
  it('should read the confidence reported per question', () => {
    expect(
      readEvaluationConfidence({
        typesafe: { confidence: { department: 0.91, severity: 0.4 } },
      }),
    ).toEqual({ department: 0.91, severity: 0.4 });
  });

  it('should return undefined when the provider reports none', () => {
    expect(readEvaluationConfidence(undefined)).toBeUndefined();
    expect(readEvaluationConfidence({})).toBeUndefined();
    expect(readEvaluationConfidence({ typesafe: {} })).toBeUndefined();
  });

  it('should drop values that are not probabilities', () => {
    expect(
      readEvaluationConfidence({
        typesafe: {
          confidence: {
            ok: 0.5,
            tooHigh: 1.4,
            negative: -0.1,
            text: 'high',
            missing: null,
          },
        },
      }),
    ).toEqual({ ok: 0.5 });
  });

  it('should return undefined when nothing survives validation', () => {
    expect(
      readEvaluationConfidence({ typesafe: { confidence: { bad: 'high' } } }),
    ).toBeUndefined();
  });

  it('should ignore another provider metadata namespace', () => {
    expect(
      readEvaluationConfidence({ openai: { confidence: { a: 0.9 } } }),
    ).toBeUndefined();
  });
});
