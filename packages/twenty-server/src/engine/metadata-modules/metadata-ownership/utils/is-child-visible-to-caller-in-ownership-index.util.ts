import { isUndefined } from '@sniptt/guards';

import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type MetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-ownership-index.type';
import { type OwnableChildMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-child-metadata-name.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { isPrivateRowVisibleToCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-private-row-visible-to-caller.util';

export const isChildVisibleToCallerInOwnershipIndex = <
  TRootMetadataName extends OwnableRootMetadataName,
>({
  metadataOwnershipIndex,
  childMetadataName,
  childId,
  caller,
}: {
  metadataOwnershipIndex: Pick<
    MetadataOwnershipIndex,
    'ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName'
  >;
  childMetadataName: OwnableChildMetadataName<TRootMetadataName>;
  childId: string;
  caller: MetadataCaller;
}): boolean => {
  const ownerUserWorkspaceId =
    metadataOwnershipIndex
      .ownerUserWorkspaceIdByPrivateChildIdByChildMetadataName[
      childMetadataName
    ]?.[childId];

  return (
    isUndefined(ownerUserWorkspaceId) ||
    isPrivateRowVisibleToCaller({ ownerUserWorkspaceId, caller })
  );
};
