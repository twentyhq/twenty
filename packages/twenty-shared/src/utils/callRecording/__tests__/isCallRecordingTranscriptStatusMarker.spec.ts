import { isCallRecordingTranscriptStatusMarker } from '@/utils/callRecording/isCallRecordingTranscriptStatusMarker';

describe('isCallRecordingTranscriptStatusMarker', () => {
  it.each(['PENDING', 'FAILED', 'EMPTY'])(
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

  it.each([undefined, null, 'transcript_expired', 'provider_specific_reason'])(
    'accepts an optional transcript reason %s',
    (subCode) => {
      expect(
        isCallRecordingTranscriptStatusMarker({ status: 'EMPTY', subCode }),
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
    { status: 'EMPTY', subCode: 123 },
    { status: 'PENDING', subCode: {} },
    { status: 'FAILED', subCode: false },
  ])('rejects unsupported marker value %#', (transcript) => {
    expect(isCallRecordingTranscriptStatusMarker(transcript)).toBe(false);
  });
});
