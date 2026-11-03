import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';

const INPUT = {
  senderKey: 'application:application-id',
  threadKey: 'first-call-recording',
  idempotencyKey: 'first-call-recording',
};

describe('buildInboxMessageIds', () => {
  it('preserves the persisted ids for a keyed conversation', () => {
    expect(buildInboxMessageIds(INPUT)).toEqual({
      threadId: 'de421ee2-fe2d-5d16-923d-01d80c0933ab',
      messageId: '4ea93906-8976-5162-9360-c346a1aa500b',
      toolCallId: 'call_4ea93906897651629360c346a1aa500b',
      turnId: '2962f5c7-6eb2-5395-b179-18aac9556bc3',
      openingMessageId: 'a2de0431-5d56-5a22-817d-22b972ee2258',
    });
  });

  it('returns distinct ids for each record of one message', () => {
    const ids = Object.values(buildInboxMessageIds(INPUT));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the thread, turn and opener and changes the message for another idempotency key', () => {
    const first = buildInboxMessageIds(INPUT);
    const second = buildInboxMessageIds({
      ...INPUT,
      idempotencyKey: 'second-message',
    });

    expect(second).toEqual({
      ...first,
      messageId: expect.any(String),
      toolCallId: expect.any(String),
    });
    expect(second.messageId).not.toBe(first.messageId);
    expect(second.toolCallId).not.toBe(first.toolCallId);
  });

  it.each(['opening', 'turn'])(
    'keeps the message apart from the opener and turn for the key %s',
    (idempotencyKey) => {
      const ids = Object.values(
        buildInboxMessageIds({ ...INPUT, idempotencyKey }),
      );

      expect(new Set(ids).size).toBe(ids.length);
    },
  );

  it.each([
    { senderKey: 'application:other-application-id' },
    { threadKey: 'other-thread' },
  ])('returns another thread when %o differs', (override) => {
    expect(buildInboxMessageIds({ ...INPUT, ...override }).threadId).not.toBe(
      buildInboxMessageIds(INPUT).threadId,
    );
  });
});
