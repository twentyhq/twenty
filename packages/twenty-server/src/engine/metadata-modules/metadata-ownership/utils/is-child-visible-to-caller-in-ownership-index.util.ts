import { isUndefined } from '@sniptt/guards';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isOwnedByCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-owned-by-caller.util';

export const isChildVisibleToCallerInOwnershipIndex = ({
  metadataOwnershipIndex,
  childId,
  caller,
}: {
  metadataOwnershipIndex: MetadataOwnershipIndex;
  childId: string;
  caller: MetadataCaller;
}): boolean => {
  const ownerUserWorkspaceId =
    metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId[childId];

  return (
    isUndefined(ownerUserWorkspaceId) ||
    isOwnedByCaller({ ownerUserWorkspaceId, caller })
  );
};
