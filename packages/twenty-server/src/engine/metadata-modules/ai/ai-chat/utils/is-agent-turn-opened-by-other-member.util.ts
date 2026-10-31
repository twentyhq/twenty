import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// a viewer without a member, as an application, sees every member's turn as another member's
export const isAgentTurnOpenedByOtherMember = ({
  createdBy,
  workspaceMemberId,
}: {
  createdBy: Pick<ActorMetadata, 'workspaceMemberId'>;
  workspaceMemberId: string | undefined;
}): boolean =>
  isDefined(createdBy.workspaceMemberId) &&
  createdBy.workspaceMemberId !== workspaceMemberId;
