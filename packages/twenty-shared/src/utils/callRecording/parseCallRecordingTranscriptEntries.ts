import {
  isArray,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from '@sniptt/guards';

import {
  type CallRecordingParsedTranscriptEntry,
  type CallRecordingParsedTranscriptWord,
} from '@/types/CallRecordingTranscript';

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const isTranscriptRecord = (
  candidate: Record<string, unknown> | undefined,
): candidate is Record<string, unknown> => !isUndefined(candidate);

const readRelativeTimestamp = (
  timestamp: Record<string, unknown> | undefined,
): number | undefined => {
  const relativeTimestamp = timestamp?.relative;

  return isNumber(relativeTimestamp) && Number.isFinite(relativeTimestamp)
    ? relativeTimestamp
    : undefined;
};

const readTrimmedString = (value: unknown): string | undefined => {
  const trimmedValue = isString(value) ? value.trim() : '';

  return trimmedValue === '' ? undefined : trimmedValue;
};

const readTranscriptWord = (
  candidate: Record<string, unknown>,
): CallRecordingParsedTranscriptWord | undefined => {
  const text = readTrimmedString(candidate.text);

  if (isUndefined(text)) {
    return undefined;
  }

  return {
    text,
    startSeconds: readRelativeTimestamp(asRecord(candidate.start_timestamp)),
    endSeconds: readRelativeTimestamp(asRecord(candidate.end_timestamp)),
  };
};

const readSpeakerName = (
  participant: Record<string, unknown> | undefined,
): string | undefined => readTrimmedString(participant?.name);

const readTranscriptEntry = (
  candidate: Record<string, unknown>,
): CallRecordingParsedTranscriptEntry | undefined => {
  if (!isArray(candidate.words)) {
    return undefined;
  }

  const words = candidate.words
    .map(asRecord)
    .filter(isTranscriptRecord)
    .map(readTranscriptWord)
    .filter(
      (word): word is CallRecordingParsedTranscriptWord => !isUndefined(word),
    );

  if (words.length === 0) {
    return undefined;
  }

  return {
    speakerName: readSpeakerName(asRecord(candidate.participant)),
    startSeconds: words[0].startSeconds,
    endSeconds: words[words.length - 1].endSeconds,
    text: words.map((word) => word.text).join(' '),
    words,
  };
};

export const parseCallRecordingTranscriptEntries = (
  transcript: unknown,
): CallRecordingParsedTranscriptEntry[] | undefined => {
  if (!isArray(transcript)) {
    return undefined;
  }

  return transcript
    .map(asRecord)
    .filter(isTranscriptRecord)
    .map(readTranscriptEntry)
    .filter(
      (entry): entry is CallRecordingParsedTranscriptEntry =>
        !isUndefined(entry),
    );
};
