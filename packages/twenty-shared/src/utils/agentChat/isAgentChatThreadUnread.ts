import { type AgentChatThreadInboxState } from '@/types/AgentChatThreadInboxState';
import { isDefined } from '@/utils/validation/isDefined';

export const isAgentChatThreadUnread = ({
  lastActivityAt,
  participant,
}: AgentChatThreadInboxState): boolean => {
  if (!isDefined(lastActivityAt)) {
    return false;
  }

  if (!isDefined(participant) || !isDefined(participant.lastReadAt)) {
    return true;
  }

  return (
    new Date(lastActivityAt).getTime() >
    new Date(participant.lastReadAt).getTime()
  );
};
