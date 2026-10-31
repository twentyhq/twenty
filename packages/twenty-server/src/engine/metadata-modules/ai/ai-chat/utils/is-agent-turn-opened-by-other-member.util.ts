import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isAgentTurnOpenedByOtherMember = ({
  createdBy,
  workspaceMemberId,
}: {
  createdBy: Pick<ActorMetadata, 'workspaceMemberId'>;
  workspaceMemberId: string | undefined;
}): boolean =>
  isDefined(createdBy.workspaceMemberId) &&
  createdBy.workspaceMemberId !== workspaceMemberId;
