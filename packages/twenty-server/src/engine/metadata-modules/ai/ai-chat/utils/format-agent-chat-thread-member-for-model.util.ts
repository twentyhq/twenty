import { formatRecordReference } from 'twenty-shared/ai';

import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';

export const formatAgentChatThreadMemberForModel = (
  member: AgentChatThreadMember,
) => ({
  ...member,
  reference: formatRecordReference({
    objectNameSingular: 'workspaceMember',
    recordId: member.workspaceMemberId,
    // brackets and line breaks would end the reference early
    displayName: member.name.replace(/[\s[\]]+/g, ' ').trim(),
  }),
});
