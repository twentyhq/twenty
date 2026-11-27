import { formatRecordReference } from 'twenty-shared/ai';

import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';

// Brackets and line breaks in a name would end the reference early
export const formatAgentChatThreadMemberReference = ({
  workspaceMemberId,
  name,
}: Pick<AgentChatThreadMember, 'workspaceMemberId' | 'name'>): string =>
  formatRecordReference({
    objectNameSingular: 'workspaceMember',
    recordId: workspaceMemberId,
    displayName: name.replace(/[\s[\]]+/g, ' ').trim(),
  });
