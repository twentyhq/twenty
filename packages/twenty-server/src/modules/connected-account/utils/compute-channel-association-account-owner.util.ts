import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const computeChannelAssociationAccountOwner = ({
  accountOwnerFieldUniversalIdentifier,
  flatFieldMetadataMaps,
  flatWorkspaceMemberMaps,
  userWorkspaceId,
}: {
  accountOwnerFieldUniversalIdentifier: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  userWorkspaceId: string;
}): { accountOwnerId?: string | null } => {
  // accountOwnerId only exists once the 2.61 upgrade has added it to the workspace
  if (
    !isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        accountOwnerFieldUniversalIdentifier
      ],
    )
  ) {
    return {};
  }

  return {
    accountOwnerId:
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId] ?? null,
  };
};
