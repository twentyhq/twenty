import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';
import { formatAgentChatThreadMemberForModel } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-agent-chat-thread-member-for-model.util';

export const listThreadMembersInputSchema = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(50),
});

type ListThreadMembersInput = z.infer<typeof listThreadMembersInputSchema>;

export const createListThreadMembersTool = (
  members: AgentChatThreadMember[],
) => ({
  description:
    'List the members of this conversation one page at a time, with the reference to write to mention each of them.',
  inputSchema: listThreadMembersInputSchema,
  execute: async ({
    offset,
    limit,
  }: ListThreadMembersInput): Promise<ToolOutput> => ({
    success: true,
    message: `Listed members ${offset + 1} to ${Math.min(offset + limit, members.length)} of ${members.length}`,
    result: {
      members: members
        .slice(offset, offset + limit)
        .map(formatAgentChatThreadMemberForModel),
      totalCount: members.length,
    },
  }),
});
