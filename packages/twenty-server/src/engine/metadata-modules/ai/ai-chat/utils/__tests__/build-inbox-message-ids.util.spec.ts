import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';

const INPUT = {
  applicationId: 'application-id',
  workspaceMemberId: 'workspace-member-id',
  idempotencyKey: 'first-call-recording',
};

describe('buildInboxMessageIds', () => {
  it('returns the same ids for the same application, member and key', () => {
    expect(buildInboxMessageIds(INPUT)).toEqual(buildInboxMessageIds(INPUT));
  });

  it('returns distinct ids for each record of one conversation', () => {
    const ids = Object.values(buildInboxMessageIds(INPUT));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each([
    { applicationId: 'other-application-id' },
    { workspaceMemberId: 'other-workspace-member-id' },
    { idempotencyKey: 'other-key' },
  ])('returns another conversation when %o differs', (override) => {
    expect(buildInboxMessageIds({ ...INPUT, ...override }).threadId).not.toBe(
      buildInboxMessageIds(INPUT).threadId,
    );
  });
});
