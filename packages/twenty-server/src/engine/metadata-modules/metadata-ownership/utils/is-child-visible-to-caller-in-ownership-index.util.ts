import { isUndefined } from '@sniptt/guards';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isPrivateRowVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-private-row-visible-to-caller.util';

export const isChildVisibleToCallerInOwnershipIndex = ({
  metadataOwnershipIndex,
  childId,
  caller,
}: {
  metadataOwnershipIndex: Pick<
    MetadataOwnershipIndex,
    'ownerUserWorkspaceIdByPrivateChildId'
  >;
  childId: string;
  caller: MetadataCaller;
}): boolean => {
  const ownerUserWorkspaceId =
    metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId[childId];

  return (
    isUndefined(ownerUserWorkspaceId) ||
    isPrivateRowVisibleToCaller({ ownerUserWorkspaceId, caller })
  );
};
