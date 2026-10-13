import { isNonEmptyString } from '@sniptt/guards';

import { type MemberCreditsPayer } from 'src/engine/core-modules/usage-limit/types/member-credits-payer.type';

export const findChatTurnMemberCreditsPayer = ({
  userWorkspaceId,
  senderWorkspaceMemberId,
  senderApplicationId,
  isWorkspaceSetupThread,
  isSenderImpersonated,
}: {
  userWorkspaceId: string;
  senderWorkspaceMemberId: string | null;
  senderApplicationId: string | null;
  isWorkspaceSetupThread: boolean;
  isSenderImpersonated: boolean;
}): MemberCreditsPayer | null => {
  const isMemberFunded =
    isNonEmptyString(userWorkspaceId) &&
    isNonEmptyString(senderWorkspaceMemberId) &&
    !isNonEmptyString(senderApplicationId) &&
    !isWorkspaceSetupThread &&
    !isSenderImpersonated;

  return isMemberFunded ? { userWorkspaceId } : null;
};
