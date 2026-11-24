import { type RecordGqlOperationFilter } from '@/types/RecordGqlOperationFilter';

export const computeMemberArchivedWithoutActivitySinceGqlFilters = ({
  workspaceMemberId,
  snoozedUntil,
}: {
  workspaceMemberId: string;
  snoozedUntil: 'NULL' | 'NOT_NULL';
}): RecordGqlOperationFilter[] => {
  const subscribedParticipant = {
    workspaceMemberId: { eq: workspaceMemberId },
    isSubscribed: { eq: true },
    snoozedUntil: { is: snoozedUntil },
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
