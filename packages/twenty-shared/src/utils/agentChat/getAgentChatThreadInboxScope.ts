import {
  type AgentChatThreadInboxScope,
  type AgentChatThreadInboxState,
} from '@/types/AgentChatThreadInboxState';
import { isDefined } from '@/utils/validation/isDefined';

// Activity and archiving have different writers and are compared rather than
// folded into a status, so a message landing right after an archive brings the
// thread back whichever write committed last
export const getAgentChatThreadInboxScope = (
  { lastActivityAt, participant }: AgentChatThreadInboxState,
  now: Date,
): AgentChatThreadInboxScope => {
  if (!isDefined(participant) || !isDefined(participant.archivedAt)) {
    return 'INBOX';
  }

  const isArchiveSupersededByActivity =
    isDefined(lastActivityAt) &&
    new Date(lastActivityAt).getTime() >
      new Date(participant.archivedAt).getTime();

  if (isArchiveSupersededByActivity) {
    return 'INBOX';
  }

  if (!isDefined(participant.snoozedUntil)) {
    return 'ARCHIVED';
  }

  return new Date(participant.snoozedUntil).getTime() > now.getTime()
    ? 'SNOOZED'
    : 'INBOX';
};
