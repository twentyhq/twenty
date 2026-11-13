import { isDefined } from 'twenty-shared/utils';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';

export const isPrivateRowVisibleToCaller = ({
  ownerUserWorkspaceId,
  caller,
}: {
  ownerUserWorkspaceId: string | null;
  caller: MetadataCaller;
}): boolean =>
  caller.type === 'bypassesPrivacy' ||
  (caller.type === 'workspaceMember' &&
    isDefined(ownerUserWorkspaceId) &&
    ownerUserWorkspaceId === caller.userWorkspaceId);
