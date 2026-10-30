import { AGENT_CHAT_HAS_UNRESOLVED_MENTION_PREDICATE } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-has-unresolved-mention-predicate.constant';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';

const IS_IN_INBOX = `(participant."isSubscribed" AND (participant."archivedAt" IS NULL OR thread."lastActivityAt" > participant."archivedAt"))`;

export const buildAgentChatOpenThreadsSummaryQuery = ({
  workspaceId,
  readableThreadsQuery,
}: {
  workspaceId: string;
  readableThreadsQuery: string;
}): string =>
  `WITH open_thread AS (
     SELECT thread."assigneeId", thread."pendingQuestionMessageId", ${AGENT_CHAT_HAS_UNRESOLVED_MENTION_PREDICATE} AS "hasUnresolvedMention",
       thread."lastActivityAt" IS NOT NULL
         AND (participant."lastReadAt" IS NULL OR thread."lastActivityAt" > participant."lastReadAt") AS "isUnread"
     FROM (${readableThreadsQuery}) thread
     JOIN ${getAgentChatThreadParticipantTable(workspaceId)} participant
       ON participant."threadId" = thread.id AND participant."workspaceMemberId" = :summaryWorkspaceMemberId
     WHERE ${IS_IN_INBOX}
   )
   SELECT
     COUNT(*)::int AS "openThreadCount",
     COUNT(*) FILTER (WHERE "isUnread")::int AS "unreadOpenThreadCount",
     COUNT("pendingQuestionMessageId")::int AS "needsInputThreadCount",
     COUNT(*) FILTER (WHERE "hasUnresolvedMention")::int AS "mentionThreadCount",
     COUNT(*) FILTER (WHERE "assigneeId" = :summaryWorkspaceMemberId)::int AS "assignedToMeThreadCount",
     COUNT("assigneeId")::int AS "assignedThreadCount",
     COUNT(*) FILTER (WHERE "assigneeId" IS NULL)::int AS "unassignedThreadCount",
     COALESCE(BOOL_OR("isUnread"), false) AS "hasUnreadOpenThread",
     COALESCE(BOOL_OR("isUnread" AND "hasUnresolvedMention"), false) AS "hasUnreadMentionThread",
     COALESCE(BOOL_OR("isUnread" AND "assigneeId" = :summaryWorkspaceMemberId), false) AS "hasUnreadAssignedThread"
   FROM open_thread`;
