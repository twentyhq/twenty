import { getTranscriptionModelFactory } from 'src/engine/metadata-modules/ai/ai-models/utils/get-transcription-model-factory.util';

describe('getTranscriptionModelFactory', () => {
  it('returns a factory for a provider exposing transcription', () => {
    const model = { modelId: 'whisper-1' };
    const provider = { transcription: jest.fn().mockReturnValue(model) };

    const factory = getTranscriptionModelFactory(provider);

    expect(factory).toBeDefined();
    expect(factory?.('whisper-1')).toBe(model);
    expect(provider.transcription).toHaveBeenCalledTimes(1);
    expect(provider.transcription).toHaveBeenCalledWith('whisper-1');
  });

  it('keeps the provider as the receiver so provider-bound state survives', () => {
    const provider = {
      baseUrl: 'https://example.invalid',
      transcription(this: { baseUrl: string }, modelId: string) {
        return `${this.baseUrl}/${modelId}`;
      },
    };

    const factory = getTranscriptionModelFactory(provider);

    expect(factory?.('whisper-1')).toBe('https://example.invalid/whisper-1');
  });

  it.each([
    ['a provider without the method', { languageModel: jest.fn() }],
    ['a non-callable transcription property', { transcription: 'nope' }],
    ['null', null],
    ['undefined', undefined],
  ])('returns undefined for %s', (_label, provider) => {
    expect(getTranscriptionModelFactory(provider)).toBeUndefined();
  });
});
