import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { findAgentChatReplyMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-reply-mentioned-workspace-member-ids.util';

const SENDER_ID = '11111111-1111-4111-8111-111111111111';
const MEMBER_ID = '22222222-2222-4222-8222-222222222222';
const OUTSIDER_ID = '33333333-3333-4333-8333-333333333333';

const thread = {
  conversationType: AgentChatThreadConversationType.STANDARD,
  workspaceMemberId: SENDER_ID,
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
  writerWorkspaceMemberIds: [MEMBER_ID],
};

const mention = (id: string) => `[[record:workspaceMember:${id}:Someone]]`;

describe('findAgentChatReplyMentionedWorkspaceMemberIds', () => {
  it('keeps only the members of the conversation other than the sender', () => {
    expect(
      findAgentChatReplyMentionedWorkspaceMemberIds({
        replyParts: [
          { type: 'text', text: `${mention(MEMBER_ID)} can you confirm?` },
          {
            type: 'text',
            text: `${mention(SENDER_ID)} ${mention(OUTSIDER_ID)}`,
          },
        ],
        thread,
        senderWorkspaceMemberId: SENDER_ID,
      }),
    ).toEqual([MEMBER_ID]);
  });

  it('mentions no one in a direct message', () => {
    expect(
      findAgentChatReplyMentionedWorkspaceMemberIds({
        replyParts: [{ type: 'text', text: mention(MEMBER_ID) }],
        thread: {
          ...thread,
          conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        },
        senderWorkspaceMemberId: SENDER_ID,
      }),
    ).toEqual([]);
  });
});
