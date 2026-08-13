export type CallRecordingTranscriptStatusMarker = {
  status: 'PENDING' | 'FAILED';
} & Record<string, unknown>;

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
