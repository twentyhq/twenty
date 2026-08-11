import { parseCallRecordingTranscriptEntries } from '@/utils/callRecording/parseCallRecordingTranscriptEntries';

describe('parseCallRecordingTranscriptEntries', () => {
  it('parses a normal multi-speaker transcript', () => {
    expect(
      parseCallRecordingTranscriptEntries([
        {
          participant: { name: 'Ada' },
          words: [{ text: 'Hello' }],
        },
        {
          participant: { name: 'Grace' },
          words: [{ text: 'Hi Ada' }],
        },
      ]),
    ).toMatchObject([
      { speakerName: 'Ada', text: 'Hello' },
      { speakerName: 'Grace', text: 'Hi Ada' },
    ]);
  });

  it('parses diarized entries into speaker, start time, and joined text', () => {
    expect(
      parseCallRecordingTranscriptEntries([
        {
          participant: { name: 'Ada Lovelace' },
          words: [
            {
              text: 'Hello from',
              start_timestamp: { relative: 1.2 },
              end_timestamp: { relative: 1.6 },
            },
            {
              text: 'there',
              start_timestamp: { relative: 1.7 },
              end_timestamp: { relative: 2.1 },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        speakerName: 'Ada Lovelace',
        startSeconds: 1.2,
        endSeconds: 2.1,
        text: 'Hello from there',
        words: [
          { text: 'Hello from', startSeconds: 1.2, endSeconds: 1.6 },
          { text: 'there', startSeconds: 1.7, endSeconds: 2.1 },
        ],
      },
    ]);
  });

  it('returns an undefined speaker name when the participant has no name', () => {
    expect(
      parseCallRecordingTranscriptEntries([
        { participant: { name: null }, words: [{ text: 'Hello' }] },
        { words: [{ text: 'Hi' }] },
        { participant: { name: '   ' }, words: [{ text: 'Welcome' }] },
      ]),
    ).toEqual([
      {
        speakerName: undefined,
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Hello',
        words: [
          { text: 'Hello', startSeconds: undefined, endSeconds: undefined },
        ],
      },
      {
        speakerName: undefined,
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Hi',
        words: [{ text: 'Hi', startSeconds: undefined, endSeconds: undefined }],
      },
      {
        speakerName: undefined,
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Welcome',
        words: [
          {
            text: 'Welcome',
            startSeconds: undefined,
            endSeconds: undefined,
          },
        ],
      },
    ]);
  });

  it('keeps zero timestamps and discards non-finite timestamps', () => {
    expect(
      parseCallRecordingTranscriptEntries([
        {
          participant: { name: 'Ada' },
          words: [
            {
              text: 'First',
              start_timestamp: { relative: 0 },
              end_timestamp: { relative: Number.NaN },
            },
            {
              text: 'second',
              start_timestamp: { relative: Number.NEGATIVE_INFINITY },
              end_timestamp: { relative: Number.POSITIVE_INFINITY },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        speakerName: 'Ada',
        startSeconds: 0,
        endSeconds: undefined,
        text: 'First second',
        words: [
          { text: 'First', startSeconds: 0, endSeconds: undefined },
          { text: 'second', startSeconds: undefined, endSeconds: undefined },
        ],
      },
    ]);
  });

  it('skips malformed entries and unusable words', () => {
    expect(
      parseCallRecordingTranscriptEntries([
        { participant: { name: 'No words' }, words: [] },
        { participant: { name: 'Missing words' } },
        {
          participant: { name: 'Invalid words' },
          words: [{ text: '   ' }, 42, null],
        },
        {
          participant: { name: '  Kept speaker  ' },
          words: [{ text: '  Kept text  ' }],
        },
        'not an entry',
      ]),
    ).toEqual([
      {
        speakerName: 'Kept speaker',
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Kept text',
        words: [
          {
            text: 'Kept text',
            startSeconds: undefined,
            endSeconds: undefined,
          },
        ],
      },
    ]);
  });

  it('distinguishes an empty transcript from an unsupported payload', () => {
    expect(parseCallRecordingTranscriptEntries([])).toEqual([]);
    expect(
      parseCallRecordingTranscriptEntries([{ words: [{ text: '   ' }] }]),
    ).toEqual([]);
    expect(parseCallRecordingTranscriptEntries(null)).toBeUndefined();
    expect(parseCallRecordingTranscriptEntries('transcript')).toBeUndefined();
    expect(
      parseCallRecordingTranscriptEntries({ status: 'PENDING' }),
    ).toBeUndefined();
  });

  it.each([undefined, 42, true, { entries: [] }])(
    'rejects the invalid top-level input %#',
    (transcript) => {
      expect(parseCallRecordingTranscriptEntries(transcript)).toBeUndefined();
    },
  );
});
