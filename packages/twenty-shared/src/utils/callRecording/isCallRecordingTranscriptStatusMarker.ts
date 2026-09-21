import { isArray, isObject } from '@sniptt/guards';

import { type CallRecordingTranscriptStatusMarker } from '@/types/CallRecordingTranscript';

export const isCallRecordingTranscriptStatusMarker = (
  transcript: unknown,
): transcript is CallRecordingTranscriptStatusMarker => {
  if (!isObject(transcript) || isArray(transcript)) {
    return false;
  }

  const status = (transcript as Record<string, unknown>).status;

  return status === 'PENDING' || status === 'FAILED';
};
