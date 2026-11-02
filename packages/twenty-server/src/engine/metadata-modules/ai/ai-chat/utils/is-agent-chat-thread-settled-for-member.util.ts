import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

const toTime = (value: Date | string | null | undefined): number | null =>
  isDefined(value) ? new Date(value).getTime() : null;

export const isAgentChatThreadSettledForMember = ({
  thread,
  participant,
}: {
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'workspaceMemberId'
    | 'deletedAt'
    | 'pendingQuestionMessageId'
    | 'lastActivityAt'
    | 'lastMessageSenderWorkspaceMemberId'
    | 'assigneeId'
  >;
  participant: Pick<
    AgentChatThreadParticipantRow,
    | 'workspaceMemberId'
    | 'isSubscribed'
    | 'archivedAt'
    | 'lastReadAt'
    | 'lastMentionedAt'
    | 'mentionsResolvedAt'
  >;
}): boolean => {
  const lastActivityTime = toTime(thread.lastActivityAt);
  const lastReadTime = toTime(participant.lastReadAt);
  const archivedTime = toTime(participant.archivedAt);
  const lastMentionedTime = toTime(participant.lastMentionedAt);
  const mentionsResolvedTime = toTime(participant.mentionsResolvedAt);

  if (
    !isDefined(lastActivityTime) ||
    !isDefined(lastReadTime) ||
    isDefined(thread.deletedAt) ||
    isDefined(thread.pendingQuestionMessageId) ||
    isDefined(thread.lastMessageSenderWorkspaceMemberId) ||
    thread.workspaceMemberId !== participant.workspaceMemberId ||
    thread.assigneeId === participant.workspaceMemberId ||
    !participant.isSubscribed
  ) {
    return false;
  }

  const isInInbox = !isDefined(archivedTime) || lastActivityTime > archivedTime;
  const hasUnresolvedMention =
    isDefined(lastMentionedTime) &&
    (!isDefined(mentionsResolvedTime) ||
      lastMentionedTime > mentionsResolvedTime);

  return isInInbox && !hasUnresolvedMention && lastActivityTime <= lastReadTime;
};
