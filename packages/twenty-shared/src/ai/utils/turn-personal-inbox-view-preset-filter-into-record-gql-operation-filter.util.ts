import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { type PersonalInboxViewPresetFilter } from '@/ai/types/PersonalInboxViewPresetFilter';
import { computeRecordGqlOperationFiltersForThreadsArchivedByWorkspaceMember } from '@/ai/utils/compute-record-gql-operation-filters-for-threads-archived-by-workspace-member.util';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

// Keep in sync with getAgentChatThreadInboxStatus, which places loaded chats on the client
export const turnPersonalInboxViewPresetFilterIntoRecordGqlOperationFilter = ({
  presetFilter,
  workspaceMemberId,
}: {
  presetFilter: PersonalInboxViewPresetFilter;
  workspaceMemberId: string;
}): RecordGqlOperationFilter => {
  const notDirectMessage: RecordGqlOperationFilter = {
    conversationType: { neq: AgentChatThreadConversationType.DIRECT_MESSAGE },
  };
  const openParticipant: RecordGqlOperationFilter = {
    workspaceMemberId: { eq: workspaceMemberId },
    isSubscribed: { eq: true },
    or: [
      { archivedAt: { is: 'NULL' } },
      { archivedAt: { ltField: 'thread.lastActivityAt' } },
    ],
  };

  switch (presetFilter) {
    case 'INBOX_OPEN':
      return { ...notDirectMessage, participants: openParticipant };
    case 'INBOX_MENTIONS':
      return {
        ...notDirectMessage,
        participants: {
          ...openParticipant,
          lastMentionedAt: { is: 'NOT_NULL' },
          and: [
            {
              or: [
                { mentionsResolvedAt: { is: 'NULL' } },
                { mentionsResolvedAt: { ltField: 'lastMentionedAt' } },
              ],
            },
          ],
        },
      };
    case 'INBOX_SNOOZED':
      return {
        ...notDirectMessage,
        or: computeRecordGqlOperationFiltersForThreadsArchivedByWorkspaceMember(
          {
            workspaceMemberId,
            isSnoozed: true,
          },
        ),
      };
    case 'INBOX_DONE':
      return {
        ...notDirectMessage,
        or: [
          {
            participants: {
              workspaceMemberId: { eq: workspaceMemberId },
              isSubscribed: { eq: false },
              archivedAt: { is: 'NOT_NULL' },
            },
          },
          ...computeRecordGqlOperationFiltersForThreadsArchivedByWorkspaceMember(
            {
              workspaceMemberId,
              isSnoozed: false,
            },
          ),
        ],
      };
  }
};
