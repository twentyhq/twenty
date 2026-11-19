import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { isDefined } from '@/utils/validation/isDefined';

type AgentChatThreadParticipationFields = {
  conversationType?: AgentChatThreadConversationType;
  isAssistantParticipant?: boolean;
  channelId?: string | null;
  workspaceMemberId?: string | null;
  writerWorkspaceMemberIds?: string[] | null;
};

export const isAgentChatThreadDirectAssistantChat = (
  thread: AgentChatThreadParticipationFields,
): boolean =>
  thread.conversationType === AgentChatThreadConversationType.STANDARD &&
  thread.isAssistantParticipant === true &&
  !isDefined(thread.channelId) &&
  (thread.writerWorkspaceMemberIds ?? []).every(
    (writerWorkspaceMemberId) =>
      writerWorkspaceMemberId === thread.workspaceMemberId,
  );
