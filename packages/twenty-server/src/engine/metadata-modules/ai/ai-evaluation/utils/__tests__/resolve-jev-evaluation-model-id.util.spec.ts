import { JEV_MODEL_ID } from 'twenty-shared/ai';

import { resolveJevEvaluationModelId } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-jev-evaluation-model-id.util';

describe('resolveJevEvaluationModelId', () => {
  it('uses Jev when available', () => {
    expect(resolveJevEvaluationModelId({ isModelAvailable: true })).toBe(
      JEV_MODEL_ID,
    );
  });

  it('rejects unavailable Jev without a fallback', () => {
    expect(() =>
      resolveJevEvaluationModelId({ isModelAvailable: false }),
    ).toThrow('Jev is unavailable');
  });
});
