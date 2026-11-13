import { isUndefined } from '@sniptt/guards';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { isPrivateRowVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-private-row-visible-to-caller.util';

export const isRootVisibleToCallerInOwnershipIndex = ({
  metadataOwnershipIndex,
  rootId,
  caller,
}: {
  metadataOwnershipIndex: Pick<
    MetadataOwnershipIndex,
    'ownerUserWorkspaceIdByPrivateRootId'
  >;
  rootId: string;
  caller: MetadataCaller;
}): boolean => {
  const ownerUserWorkspaceId =
    metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateRootId[rootId];

  return (
    isUndefined(ownerUserWorkspaceId) ||
    isPrivateRowVisibleToCaller({ ownerUserWorkspaceId, caller })
  );
};
