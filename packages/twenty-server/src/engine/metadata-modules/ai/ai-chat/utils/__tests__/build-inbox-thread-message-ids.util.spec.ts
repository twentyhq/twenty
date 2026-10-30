import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxThreadMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-message-ids.util';

const INPUT = {
  threadId: '6f1d7c2a-3b4e-4f5a-8b9c-0d1e2f3a4b5c',
  senderScope: 'application:application-id',
  idempotencyKey: 'transcript-ready',
};

describe('buildInboxThreadMessageIds', () => {
  it('returns the same ids for the same conversation, sender and key', () => {
    expect(buildInboxThreadMessageIds(INPUT)).toEqual(
      buildInboxThreadMessageIds(INPUT),
    );
  });

  it('keeps the conversation, writes no opener and returns distinct ids for each record', () => {
    const { openingMessageId, ...ids } = buildInboxThreadMessageIds(INPUT);

    expect(ids.threadId).toBe(INPUT.threadId);
    expect(openingMessageId).toBeNull();
    expect(new Set(Object.values(ids)).size).toBe(Object.keys(ids).length);
  });

  it('keeps the turn and changes the message for another idempotency key', () => {
    const first = buildInboxThreadMessageIds(INPUT);
    const second = buildInboxThreadMessageIds({
      ...INPUT,
      idempotencyKey: 'second-message',
    });

    expect(second).toEqual({
      ...first,
      messageId: expect.any(String),
      toolCallId: expect.any(String),
    });
    expect(second.messageId).not.toBe(first.messageId);
  });

  it.each([
    { senderScope: 'application:other-application-id' },
    { threadId: '0d1e2f3a-4b5c-4f5a-8b9c-6f1d7c2a3b4e' },
  ])('returns another message and turn when %o differs', (override) => {
    const ids = buildInboxThreadMessageIds({ ...INPUT, ...override });

    expect(ids.messageId).not.toBe(buildInboxThreadMessageIds(INPUT).messageId);
    expect(ids.turnId).not.toBe(buildInboxThreadMessageIds(INPUT).turnId);
  });

  it('keeps the message apart from the one the sender keyed under the same conversation', () => {
    const keyedIds = buildInboxMessageIds({
      senderKey: INPUT.senderScope,
      threadKey: 'calls',
      idempotencyKey: INPUT.idempotencyKey,
    });
    const scopedIds = buildInboxThreadMessageIds({
      ...INPUT,
      threadId: keyedIds.threadId,
    });

    expect(scopedIds.messageId).not.toBe(keyedIds.messageId);
    expect(scopedIds.turnId).not.toBe(keyedIds.turnId);
  });
});
