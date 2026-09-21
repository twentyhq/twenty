import { isCallRecordingTranscriptStatusMarker } from '@/utils/callRecording/isCallRecordingTranscriptStatusMarker';

describe('isCallRecordingTranscriptStatusMarker', () => {
  it.each(['PENDING', 'FAILED'] as const)(
    'accepts a %s marker with provider-specific data',
    (status) => {
      expect(
        isCallRecordingTranscriptStatusMarker({
          status,
          providerTranscriptId: 'provider-transcript-id',
        }),
      ).toBe(true);
    },
  );

  it.each([
    null,
    undefined,
    [],
    'PENDING',
    { status: 'READY' },
    { status: null },
  ])('rejects unsupported marker value %#', (transcript) => {
    expect(isCallRecordingTranscriptStatusMarker(transcript)).toBe(false);
  });
});
