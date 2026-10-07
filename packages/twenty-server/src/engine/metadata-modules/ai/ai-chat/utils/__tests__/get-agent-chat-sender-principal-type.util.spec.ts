import { getAgentChatSenderPrincipalType } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-sender-principal-type.util';

describe('getAgentChatSenderPrincipalType', () => {
  it('treats a message a member sent as a user session', () => {
    expect(
      getAgentChatSenderPrincipalType({
        userWorkspaceId: 'user-workspace-id',
        applicationId: null,
      }),
    ).toBe('userSession');
  });

  it('treats a message an application sent on behalf of a member as an application', () => {
    expect(
      getAgentChatSenderPrincipalType({
        userWorkspaceId: 'user-workspace-id',
        applicationId: 'application-id',
      }),
    ).toBe('application');
  });
});
