import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

export const computeChannelAssociationAccountOwner = ({
  accountOwnerFieldUniversalIdentifier,
  flatFieldMetadataMaps,
  flatWorkspaceMemberMaps,
  userWorkspaceId,
}: {
  accountOwnerFieldUniversalIdentifier: string;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, unknown>>;
  };
  flatWorkspaceMemberMaps: Pick<FlatWorkspaceMemberMaps, 'idByUserWorkspaceId'>;
  userWorkspaceId: string;
}): { accountOwnerId?: string | null } => {
  // accountOwnerId only exists once the 2.61 upgrade has added it to the workspace;
  // drop this check, and make accountOwnerId required, once 2.61 leaves the upgrade window
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
