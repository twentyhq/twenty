import { type AgentChatThreadPresetFilter } from '@/ai/constants/agent-chat-thread-preset-filter.const';
import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

const throughParticipants = (
  participantFilter: RecordGqlOperationFilter,
): RecordGqlOperationFilter => ({ participants: participantFilter });

// Keep in sync with getAgentChatThreadInboxStatus, which places loaded chats on the client
export const computeAgentChatThreadPresetFilterGqlFilter = ({
  presetFilter,
  workspaceMemberId,
}: {
  presetFilter: AgentChatThreadPresetFilter;
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

  switch (presetFilter) {
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
        and: [
          {
            or: [
              { mentionsResolvedAt: { is: 'NULL' } },
              { mentionsResolvedAt: { ltField: 'lastMentionedAt' } },
            ],
          },
        ],
      });
    case 'assigned':
      return {
        assigneeId: { eq: workspaceMemberId },
        ...throughParticipants(openParticipant),
      };
    case 'assignedToAnyone':
      return {
        assigneeId: { is: 'NOT_NULL' },
        ...throughParticipants(openParticipant),
      };
    case 'unassigned':
      return {
        assigneeId: { is: 'NULL' },
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
