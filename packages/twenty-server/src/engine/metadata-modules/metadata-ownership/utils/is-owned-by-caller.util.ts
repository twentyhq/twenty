import { isDefined } from 'twenty-shared/utils';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';

export const isOwnedByCaller = ({
  ownerUserWorkspaceId,
  caller,
}: {
  ownerUserWorkspaceId: string | null;
  caller: MetadataCaller;
}): boolean =>
  isDefined(ownerUserWorkspaceId) &&
  isDefined(caller.userWorkspaceId) &&
  ownerUserWorkspaceId === caller.userWorkspaceId;
