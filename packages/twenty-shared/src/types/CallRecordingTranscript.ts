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

export type CallRecordingParsedTranscriptWord = {
  text: string;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
};

export type CallRecordingParsedTranscriptEntry = {
  speakerName: string | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  text: string;
  words: CallRecordingParsedTranscriptWord[];
};
