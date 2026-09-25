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
import { isDefined } from '@/utils/validation';

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

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
    .filter(isDefined)
    .map(readTranscriptWord)
    .filter(isDefined);

  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  if (!isDefined(firstWord) || !isDefined(lastWord)) {
    return undefined;
  }

  return {
    speakerName: readSpeakerName(asRecord(candidate.participant)),
    startSeconds: firstWord.startSeconds,
    endSeconds: lastWord.endSeconds,
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
    .filter(isDefined)
    .map(readTranscriptEntry)
    .filter(isDefined);
};
