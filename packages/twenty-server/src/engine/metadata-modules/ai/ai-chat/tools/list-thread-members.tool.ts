import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AGENT_CHAT_THREAD_MEMBERS_MAX_PAGE_SIZE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-members-page-size.constant';
import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';
import { formatAgentChatThreadMemberReference } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-agent-chat-thread-member-reference.util';

export const listThreadMembersInputSchema = z.object({
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe('How many members to skip, from the start of the list.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(AGENT_CHAT_THREAD_MEMBERS_MAX_PAGE_SIZE)
    .default(AGENT_CHAT_THREAD_MEMBERS_MAX_PAGE_SIZE)
    .describe('How many members to return.'),
});

type ListThreadMembersInput = z.infer<typeof listThreadMembersInputSchema>;

export const createListThreadMembersTool = ({
  findMembers,
  canMentionMembers,
}: {
  findMembers: () => Promise<AgentChatThreadMember[]>;
  canMentionMembers: boolean;
}) => ({
  description:
    'List the workspace members in this conversation, one page at a time, with their name ' +
    'and workspaceMemberId' +
    (canMentionMembers ? ' and the reference to write to mention them' : '') +
    '. Use it when the system prompt says some members are not listed and you need one of them.',
  inputSchema: listThreadMembersInputSchema,
  execute: async ({
    offset,
    limit,
  }: ListThreadMembersInput): Promise<ToolOutput> => {
    try {
      const members = await findMembers();
      const page = members.slice(offset, offset + limit);

      return {
        success: true,
        message: `Listed ${page.length} of ${members.length} members`,
        result: {
          members: page.map((member) => ({
            name: member.name,
            workspaceMemberId: member.workspaceMemberId,
            ...(canMentionMembers && {
              reference: formatAgentChatThreadMemberReference(member),
            }),
            isCurrentSender: member.isCurrentSender,
          })),
          totalCount: members.length,
          hasMore: offset + page.length < members.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to list the conversation members',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
