import { isArray, isObject, isString } from '@sniptt/guards';

import { type CallRecordingTranscriptStatusMarker } from '@/types/CallRecordingTranscript';
import { isDefined } from '@/utils/validation/isDefined';

export const isCallRecordingTranscriptStatusMarker = (
  transcript: unknown,
): transcript is CallRecordingTranscriptStatusMarker => {
  if (
    !isObject(transcript) ||
    isArray(transcript) ||
    !('status' in transcript)
  ) {
    return false;
  }

  if (
    'subCode' in transcript &&
    isDefined(transcript.subCode) &&
    !isString(transcript.subCode)
  ) {
    return false;
  }

  const { status } = transcript;

  return status === 'PENDING' || status === 'FAILED' || status === 'EMPTY';
};
