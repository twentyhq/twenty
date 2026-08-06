/**
 * A transcript text chunk. Relative timestamps are measured in seconds from
 * the start of the recording, and a chunk can contain more than one word.
 */
export type CallRecordingTranscriptWord = {
  text: string;
  start_timestamp?: { relative: number } | null;
  end_timestamp?: { relative: number } | null;
};

export type CallRecordingTranscriptEntry = {
  participant: { name: string | null } | null;
  words: CallRecordingTranscriptWord[];
};

export type CallRecordingTranscriptStatusMarker = {
  status: 'PENDING' | 'FAILED';
} & Record<string, unknown>;

export type CallRecordingTranscript =
  | CallRecordingTranscriptEntry[]
  | CallRecordingTranscriptStatusMarker;
