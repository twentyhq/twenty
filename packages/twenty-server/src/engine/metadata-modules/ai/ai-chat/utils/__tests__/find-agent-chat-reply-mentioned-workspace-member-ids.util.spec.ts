import { findAgentChatReplyMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-reply-mentioned-workspace-member-ids.util';

const SENDER_ID = '11111111-1111-4111-8111-111111111111';
const MEMBER_ID = '22222222-2222-4222-8222-222222222222';
const OUTSIDER_ID = '33333333-3333-4333-8333-333333333333';

const members = [
  { workspaceMemberId: SENDER_ID, isCurrentSender: true },
  { workspaceMemberId: MEMBER_ID, isCurrentSender: false },
];

describe('findAgentChatReplyMentionedWorkspaceMemberIds', () => {
  it('keeps the members of the conversation the reply mentions', () => {
    expect(
      findAgentChatReplyMentionedWorkspaceMemberIds({
        replyText: `Yes, [[record:workspaceMember:${MEMBER_ID}:Etienne Jouan]] can confirm.`,
        members,
      }),
    ).toEqual([MEMBER_ID]);
  });

  it('drops the current sender and anyone outside the conversation', () => {
    expect(
      findAgentChatReplyMentionedWorkspaceMemberIds({
        replyText: `[[record:workspaceMember:${SENDER_ID}:Félix]] and [[record:workspaceMember:${OUTSIDER_ID}:Someone]]`,
        members,
      }),
    ).toEqual([]);
  });

  it('ignores references to other objects and references inside code', () => {
    expect(
      findAgentChatReplyMentionedWorkspaceMemberIds({
        replyText: `[[record:person:${MEMBER_ID}:Etienne]] \`[[record:workspaceMember:${MEMBER_ID}:Etienne]]\``,
        members,
      }),
    ).toEqual([]);
  });
});
