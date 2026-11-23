import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

export const computeChannelAssociationSource = ({
  accountOwnerFieldUniversalIdentifier,
  channel,
  flatFieldMetadataMaps,
  flatWorkspaceMemberMaps,
  userWorkspaceId,
}: {
  accountOwnerFieldUniversalIdentifier: string;
  channel: { handle: string; type?: MessageChannelType };
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

  if (channel.type === MessageChannelType.EMAIL_GROUP) {
    return { accountOwnerId: null, handle: channel.handle };
  }

  return {
    accountOwnerId:
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId] ?? null,
    handle: channel.handle,
  };
};
