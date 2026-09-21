import { JEV_MODEL_ID } from 'twenty-shared/ai';

import { resolveJevEvaluationModelIdOrThrow } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-jev-evaluation-model-id-or-throw.util';

describe('resolveJevEvaluationModelIdOrThrow', () => {
  it('uses Jev when available', () => {
    expect(resolveJevEvaluationModelIdOrThrow({ isModelAvailable: true })).toBe(
      JEV_MODEL_ID,
    );
  });

  it('rejects unavailable Jev without a fallback', () => {
    expect(() =>
      resolveJevEvaluationModelIdOrThrow({ isModelAvailable: false }),
    ).toThrow('Jev is unavailable');
  });
});
