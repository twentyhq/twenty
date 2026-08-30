import { MAX_DICTATION_AUDIO_BYTES } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';

export type DecodeDictationAudioResult =
  | { status: 'decoded'; audio: Buffer }
  | { status: 'invalid'; reason: 'malformed' | 'empty' | 'too-large' };

const DATA_URL_PREFIX_PATTERN = /^data:[^;,]*(;[^;,]+)*;base64,/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

// Buffer.from(_, 'base64') silently drops anything outside the alphabet, so a
// corrupted upload would otherwise reach the provider as plausible-looking
// bytes and fail there instead of here.
export const decodeDictationAudio = (
  audioBase64: string,
): DecodeDictationAudioResult => {
  const payload = audioBase64.replace(DATA_URL_PREFIX_PATTERN, '').trim();

  if (payload.length === 0) {
    return { status: 'invalid', reason: 'empty' };
  }

  // Size is checked first so an oversized payload is neither pattern-matched
  // nor decoded — both would walk megabytes of attacker-controlled string.
  const approximateByteLength = (payload.length / 4) * 3;

  if (approximateByteLength > MAX_DICTATION_AUDIO_BYTES) {
    return { status: 'invalid', reason: 'too-large' };
  }

  if (!BASE64_PATTERN.test(payload) || payload.length % 4 !== 0) {
    return { status: 'invalid', reason: 'malformed' };
  }

  const audio = Buffer.from(payload, 'base64');

  if (audio.byteLength === 0) {
    return { status: 'invalid', reason: 'empty' };
  }

  return { status: 'decoded', audio };
};
