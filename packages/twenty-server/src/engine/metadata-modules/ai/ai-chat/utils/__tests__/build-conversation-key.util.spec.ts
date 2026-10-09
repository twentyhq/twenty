import { buildConversationKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-conversation-key.util';

const INPUT = {
  appSecret: 'app-secret',
  workspaceId: 'workspace-id',
  senderKey: 'application:application-id',
  threadKey: 'daily-digest',
};

describe('buildConversationKey', () => {
  it('returns the same key for the same secret, workspace, sender and thread', () => {
    expect(buildConversationKey(INPUT)).toBe(buildConversationKey(INPUT));
  });

  it.each([
    { appSecret: 'other-app-secret' },
    { workspaceId: 'other-workspace-id' },
    { senderKey: 'application:other-application-id' },
    { threadKey: 'other-thread' },
  ])('returns another key when %o differs', (override) => {
    expect(buildConversationKey({ ...INPUT, ...override })).not.toBe(
      buildConversationKey(INPUT),
    );
  });
});
