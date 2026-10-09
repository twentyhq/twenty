import { buildInboxConversationKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-conversation-key.util';

const INPUT = {
  appSecret: 'app-secret',
  workspaceId: 'workspace-id',
  senderKey: 'application:application-id',
  threadKey: 'daily-digest',
};

describe('buildInboxConversationKey', () => {
  it('returns the same key for the same secret, workspace, sender and thread', () => {
    expect(buildInboxConversationKey(INPUT)).toBe(
      buildInboxConversationKey(INPUT),
    );
  });

  it.each([
    { appSecret: 'other-app-secret' },
    { workspaceId: 'other-workspace-id' },
    { senderKey: 'application:other-application-id' },
    { threadKey: 'other-thread' },
  ])('returns another key when %o differs', (override) => {
    expect(buildInboxConversationKey({ ...INPUT, ...override })).not.toBe(
      buildInboxConversationKey(INPUT),
    );
  });
});
