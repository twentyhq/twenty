import { type AgentChatThreadFilterStatus } from '@/ai/constants/agent-chat-thread-filter-status.const';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

const throughParticipants = (
  participantFilter: RecordGqlOperationFilter,
): RecordGqlOperationFilter =>
  ({ participants: participantFilter }) as RecordGqlOperationFilter;

// The server counterpart of how the inbox places a chat: a done or snoozed
// chat comes back to the inbox once it has activity after it was filed
export const computeAgentChatThreadFilterStatusGqlFilter = ({
  filterStatus,
  workspaceMemberId,
}: {
  filterStatus: AgentChatThreadFilterStatus;
  workspaceMemberId: string;
}): RecordGqlOperationFilter => {
  const memberParticipant = { workspaceMemberId: { eq: workspaceMemberId } };
  const subscribedParticipant = {
    ...memberParticipant,
    isSubscribed: { eq: true },
  };
  const openParticipant: RecordGqlOperationFilter = {
    ...subscribedParticipant,
    or: [
      { archivedAt: { is: 'NULL' } },
      { archivedAt: { ltField: 'thread.lastActivityAt' } },
    ],
  };
  const filedWithoutActivitySince = (
    snoozedUntil: 'NULL' | 'NOT_NULL',
  ): RecordGqlOperationFilter[] => [
    {
      lastActivityAt: { is: 'NULL' },
      ...throughParticipants({
        ...subscribedParticipant,
        archivedAt: { is: 'NOT_NULL' },
        snoozedUntil: { is: snoozedUntil },
      }),
    },
    throughParticipants({
      ...subscribedParticipant,
      snoozedUntil: { is: snoozedUntil },
      archivedAt: { gteField: 'thread.lastActivityAt' },
    }),
  ];

  switch (filterStatus) {
    case 'active':
      return throughParticipants(openParticipant);
    case 'needsInput':
      return {
        pendingQuestionMessageId: { is: 'NOT_NULL' },
        ...throughParticipants(openParticipant),
      };
    case 'mentions':
      return throughParticipants({
        ...openParticipant,
        lastMentionedAt: { is: 'NOT_NULL' },
      });
    case 'assigned':
      return {
        assigneeId: { eq: workspaceMemberId },
        ...throughParticipants(openParticipant),
      };
    case 'snoozed':
      return { or: filedWithoutActivitySince('NOT_NULL') };
    case 'done':
      return {
        or: [
          throughParticipants({
            ...memberParticipant,
            isSubscribed: { eq: false },
            archivedAt: { is: 'NOT_NULL' },
          }),
          ...filedWithoutActivitySince('NULL'),
        ],
      };
  }
};
