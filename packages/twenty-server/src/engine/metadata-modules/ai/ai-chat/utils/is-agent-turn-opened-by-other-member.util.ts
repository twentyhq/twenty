import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// An application reading on its own sees the turns it ran as a member: they ran within its role
export const isAgentTurnOpenedByOtherMember = ({
  createdBy,
  workspaceMemberId,
  applicationId,
}: {
  createdBy: Pick<ActorMetadata, 'workspaceMemberId' | 'context'>;
  workspaceMemberId: string | undefined;
  applicationId?: string;
}): boolean => {
  if (!isDefined(createdBy.workspaceMemberId)) {
    return false;
  }

  const isOpenedByReadingApplication =
    !isDefined(workspaceMemberId) &&
    isDefined(applicationId) &&
    createdBy.context?.applicationId === applicationId;

  return (
    !isOpenedByReadingApplication &&
    createdBy.workspaceMemberId !== workspaceMemberId
  );
};
