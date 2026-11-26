import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

export const computeRecordGqlOperationFiltersForThreadsArchivedByWorkspaceMember =
  ({
    workspaceMemberId,
    isSnoozed,
  }: {
    workspaceMemberId: string;
    isSnoozed: boolean;
  }): RecordGqlOperationFilter[] => {
    const subscribedParticipant = {
      workspaceMemberId: { eq: workspaceMemberId },
      isSubscribed: { eq: true },
      snoozedUntil: { is: isSnoozed ? 'NOT_NULL' : 'NULL' },
    };

    return [
      {
        lastActivityAt: { is: 'NULL' },
        participants: {
          ...subscribedParticipant,
          archivedAt: { is: 'NOT_NULL' },
        },
      },
      {
        participants: {
          ...subscribedParticipant,
          archivedAt: { gteField: 'thread.lastActivityAt' },
        },
      },
    ];
  };
