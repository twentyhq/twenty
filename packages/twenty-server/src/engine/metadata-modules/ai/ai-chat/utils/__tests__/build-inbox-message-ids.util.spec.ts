import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';

const INPUT = {
  senderKey: 'application-id',
  workspaceMemberId: 'workspace-member-id',
  threadKey: 'first-call-recording',
  idempotencyKey: 'first-call-recording',
};

describe('buildInboxMessageIds', () => {
  it('returns the same ids for the same sender, member and keys', () => {
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

    expect(second).toEqual({ ...first, messageId: expect.any(String) });
    expect(second.messageId).not.toBe(first.messageId);
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
    { senderKey: 'other-application-id' },
    { workspaceMemberId: 'other-workspace-member-id' },
    { threadKey: 'other-thread' },
  ])('returns another thread when %o differs', (override) => {
    expect(buildInboxMessageIds({ ...INPUT, ...override }).threadId).not.toBe(
      buildInboxMessageIds(INPUT).threadId,
    );
  });
});
