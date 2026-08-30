import { MAX_DICTATION_AUDIO_BYTES } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';
import { decodeDictationAudio } from 'src/engine/metadata-modules/ai/ai-transcription/utils/decode-dictation-audio.util';

describe('decodeDictationAudio', () => {
  it('decodes a plain base64 payload', () => {
    const audio = Buffer.from('opus frames');

    const result = decodeDictationAudio(audio.toString('base64'));

    expect(result).toEqual({ status: 'decoded', audio });
  });

  it('accepts the data URL a MediaRecorder blob reads back as', () => {
    const audio = Buffer.from('opus frames');
    const dataUrl = `data:audio/webm;codecs=opus;base64,${audio.toString('base64')}`;

    const result = decodeDictationAudio(dataUrl);

    expect(result).toEqual({ status: 'decoded', audio });
  });

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   '],
    ['a data URL with no payload', 'data:audio/webm;base64,'],
  ])('rejects %s as empty', (_label, payload) => {
    expect(decodeDictationAudio(payload)).toEqual({
      status: 'invalid',
      reason: 'empty',
    });
  });

  // Buffer.from silently drops characters outside the base64 alphabet, so a
  // corrupted upload would otherwise reach the provider as plausible bytes.
  it.each([
    ['characters outside the alphabet', 'not base64!!'],
    ['a length that is not a multiple of four', 'YWJjZGU='.slice(0, 7)],
  ])('rejects %s as malformed', (_label, payload) => {
    expect(decodeDictationAudio(payload)).toEqual({
      status: 'invalid',
      reason: 'malformed',
    });
  });

  it('rejects a payload above the byte cap before pattern-matching it', () => {
    const oversizedLength =
      Math.ceil(((MAX_DICTATION_AUDIO_BYTES / 3) * 4) / 4) * 4 + 4;
    const oversizedBase64 = 'A'.repeat(oversizedLength);

    expect(decodeDictationAudio(oversizedBase64)).toEqual({
      status: 'invalid',
      reason: 'too-large',
    });
  });

  // Size is the cheap check, so it must win over the pattern walk even when
  // the payload is also malformed.
  it('reports an oversized malformed payload as too-large', () => {
    const oversizedGarbage = '!'.repeat(MAX_DICTATION_AUDIO_BYTES * 2);

    expect(decodeDictationAudio(oversizedGarbage)).toEqual({
      status: 'invalid',
      reason: 'too-large',
    });
  });

  it('accepts a payload just under the byte cap', () => {
    const audio = Buffer.alloc(MAX_DICTATION_AUDIO_BYTES - 1024, 1);

    const result = decodeDictationAudio(audio.toString('base64'));

    expect(result.status).toBe('decoded');
  });
});
