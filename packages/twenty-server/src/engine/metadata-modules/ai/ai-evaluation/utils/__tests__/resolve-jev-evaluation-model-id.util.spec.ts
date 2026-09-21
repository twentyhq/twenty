import { JEV_MODEL_ID } from 'twenty-shared/ai';

import { resolveJevEvaluationModelId } from 'src/engine/metadata-modules/ai/ai-evaluation/utils/resolve-jev-evaluation-model-id.util';

describe('resolveJevEvaluationModelId', () => {
  it.each([undefined, '', JEV_MODEL_ID])(
    'uses Jev when the requested model is %s',
    (requestedModelId) => {
      expect(
        resolveJevEvaluationModelId({
          requestedModelId,
          isModelAvailable: true,
        }),
      ).toBe(JEV_MODEL_ID);
    },
  );

  it('rejects a language-model override', () => {
    expect(() =>
      resolveJevEvaluationModelId({
        requestedModelId: 'openai/gpt-4o',
        isModelAvailable: true,
      }),
    ).toThrow('Classify only supports Jev');
  });

  it('rejects unavailable Jev without a fallback', () => {
    expect(() =>
      resolveJevEvaluationModelId({ isModelAvailable: false }),
    ).toThrow('Jev is unavailable');
  });
});
