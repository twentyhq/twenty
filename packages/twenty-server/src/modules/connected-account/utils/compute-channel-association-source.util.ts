import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

export const computeChannelAssociationSource = ({
  accountOwnerFieldUniversalIdentifier,
  channelHandle,
  flatFieldMetadataMaps,
  flatWorkspaceMemberMaps,
  userWorkspaceId,
}: {
  accountOwnerFieldUniversalIdentifier: string;
  channelHandle: string;
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Partial<Record<string, unknown>>;
  };
  flatWorkspaceMemberMaps: Pick<FlatWorkspaceMemberMaps, 'idByUserWorkspaceId'>;
  userWorkspaceId: string;
}): { accountOwnerId?: string | null; handle?: string } => {
  // TODO(@FelixMalfait): drop this check once 2.63 leaves the upgrade window; both fields arrive with its upgrade
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
    handle: channelHandle,
  };
};
