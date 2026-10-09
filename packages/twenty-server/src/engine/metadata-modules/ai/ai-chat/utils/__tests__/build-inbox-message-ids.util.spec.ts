import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';

const INPUT = {
  conversationKey: 'conversation-key',
  idempotencyKey: 'first-call-recording',
};

describe('buildInboxMessageIds', () => {
  it('returns the same ids for the same sender and keys', () => {
    expect(buildInboxMessageIds(INPUT)).toEqual(buildInboxMessageIds(INPUT));
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

  it('returns other ids for another conversation key', () => {
    const first = Object.values(buildInboxMessageIds(INPUT));
    const second = Object.values(
      buildInboxMessageIds({ ...INPUT, conversationKey: 'other-key' }),
    );

    expect(second.filter((id) => first.includes(id))).toEqual([]);
  });
});
