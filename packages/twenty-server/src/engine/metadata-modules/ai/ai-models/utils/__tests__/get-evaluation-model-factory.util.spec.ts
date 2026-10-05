import { getEvaluationModelFactory } from 'src/engine/metadata-modules/ai/ai-models/utils/get-evaluation-model-factory.util';

describe('getEvaluationModelFactory', () => {
  it('returns a factory for a provider exposing evaluationModel', () => {
    const model = { modelId: 'jev-latest' };
    const provider = { evaluationModel: jest.fn().mockReturnValue(model) };

    const factory = getEvaluationModelFactory(provider);

    expect(factory).toBeDefined();
    expect(factory?.('jev-latest')).toBe(model);
    expect(provider.evaluationModel).toHaveBeenCalledTimes(1);
    expect(provider.evaluationModel).toHaveBeenCalledWith('jev-latest');
  });

  it('keeps the provider as the receiver so provider-bound state survives', () => {
    const provider = {
      baseUrl: 'https://example.invalid',
      evaluationModel(this: { baseUrl: string }, modelId: string) {
        return `${this.baseUrl}/${modelId}`;
      },
    };

    const factory = getEvaluationModelFactory(provider);

    expect(factory?.('jev-latest')).toBe('https://example.invalid/jev-latest');
  });

  it.each([
    ['a provider without the method', { languageModel: jest.fn() }],
    ['a non-callable evaluationModel property', { evaluationModel: 'nope' }],
    ['null', null],
    ['undefined', undefined],
  ])('returns undefined for %s', (_label, provider) => {
    expect(getEvaluationModelFactory(provider)).toBeUndefined();
  });
});
