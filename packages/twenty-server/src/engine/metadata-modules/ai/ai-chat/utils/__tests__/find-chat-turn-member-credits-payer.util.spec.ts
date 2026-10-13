import { findChatTurnMemberCreditsPayer } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-chat-turn-member-credits-payer.util';

const SENDER_USER_WORKSPACE_ID = 'sender-user-workspace-id';
const SENDER_WORKSPACE_MEMBER_ID = 'sender-workspace-member-id';

const memberSentTurn = {
  userWorkspaceId: SENDER_USER_WORKSPACE_ID,
  senderWorkspaceMemberId: SENDER_WORKSPACE_MEMBER_ID,
  senderApplicationId: null,
  isWorkspaceSetupThread: false,
  isSenderImpersonated: false,
};

const memberPayer = { userWorkspaceId: SENDER_USER_WORKSPACE_ID };

describe('findChatTurnMemberCreditsPayer', () => {
  it.each([
    ['a chat send that starts a turn', memberSentTurn, memberPayer],
    [
      'an agent-opened turn',
      { ...memberSentTurn, senderWorkspaceMemberId: null },
      null,
    ],
    [
      'a setup thread turn sent by the workspace creator before setup completed',
      { ...memberSentTurn, isWorkspaceSetupThread: true },
      null,
    ],
    [
      'a send while impersonating',
      { ...memberSentTurn, isSenderImpersonated: true },
      null,
    ],
    [
      'a message sent with an application token that carries a user',
      { ...memberSentTurn, senderApplicationId: 'application-id' },
      null,
    ],
    [
      'a turn without a known sender membership',
      { ...memberSentTurn, userWorkspaceId: '' },
      null,
    ],
  ])('decides the payer of %s', (_label, turn, expectedPayer) => {
    expect(findChatTurnMemberCreditsPayer(turn)).toEqual(expectedPayer);
  });
});
