import { maskStreamChunkOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/mask-stream-chunk-of-turn-acted-by-others.util';

const EMPTY_CHUNK = { type: 'message-metadata', messageMetadata: {} };

describe('maskStreamChunkOfTurnActedByOthers', () => {
  it('keeps the text of the reply', () => {
    const chunks = [
      { type: 'start', messageId: 'message-id' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Acme renews in May' },
      { type: 'text-end', id: 'text-1' },
      { type: 'finish' },
    ];

    expect(chunks.map(maskStreamChunkOfTurnActedByOthers)).toEqual(chunks);
  });

  it('empties every other chunk', () => {
    expect(
      [
        { type: 'start-step' },
        { type: 'reasoning-delta', id: 'reasoning-1', delta: 'Their notes' },
        {
          type: 'tool-input-available',
          toolCallId: 'call-1',
          toolName: 'find_people',
          input: { email: 'ceo@acme.com' },
        },
        { type: 'tool-output-available', toolCallId: 'call-1', output: [] },
        { type: 'source-url', sourceId: 'source-1', url: 'https://acme.com' },
        { type: 'data-record', data: { id: 'record-id' } },
      ].map(maskStreamChunkOfTurnActedByOthers),
    ).toEqual([
      EMPTY_CHUNK,
      EMPTY_CHUNK,
      EMPTY_CHUNK,
      EMPTY_CHUNK,
      EMPTY_CHUNK,
      EMPTY_CHUNK,
    ]);
  });

  it('drops the usage the reply carries as metadata', () => {
    expect(
      [
        {
          type: 'start',
          messageId: 'message-id',
          messageMetadata: { startedAt: '2026-11-01T00:00:00.000Z' },
        },
        {
          type: 'message-metadata',
          messageMetadata: { usage: { inputCredits: 12 } },
        },
        {
          type: 'finish',
          finishReason: 'stop',
          messageMetadata: {
            usage: {
              inputTokens: 120,
              inputCredits: 12,
              conversationSize: 120,
            },
          },
        },
      ].map(maskStreamChunkOfTurnActedByOthers),
    ).toEqual([
      { type: 'start', messageId: 'message-id' },
      EMPTY_CHUNK,
      { type: 'finish', finishReason: 'stop' },
    ]);
  });
});
