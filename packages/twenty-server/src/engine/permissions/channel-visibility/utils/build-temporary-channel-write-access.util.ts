import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { CHANNEL_WRITE_ACCESS_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-write-access-object-universal-identifiers.constant';
import { type TemporaryChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/temporary-channel-write-access.type';
import { isAdminChannelWriteAccessRestored } from 'src/engine/permissions/channel-visibility/utils/is-admin-channel-write-access-restored.util';
import { isApiKeyExemptFromChannelVisibility } from 'src/engine/permissions/channel-visibility/utils/is-api-key-exempt-from-channel-visibility.util';
import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export const buildTemporaryChannelWriteAccess = ({
  featureFlagsMap,
  flatRoleMaps,
  flatObjectMetadataMaps,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  flatRoleMaps: Pick<FlatEntityMaps<FlatRole>, 'byUniversalIdentifier'>;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
}): TemporaryChannelWriteAccess | undefined => {
  const adminRoleId = isAdminChannelWriteAccessRestored(featureFlagsMap)
    ? flatRoleMaps.byUniversalIdentifier[
        STANDARD_ROLE.admin.universalIdentifier
      ]?.id
    : undefined;
  const apiKeysIndividualRoleId = isApiKeyExemptFromChannelVisibility(
    featureFlagsMap,
  )
    ? flatRoleMaps.byUniversalIdentifier[
        getWorkspaceMemberIndividualRoleUniversalIdentifier({
          holder: { type: 'apiKeys' },
        })
      ]?.id
    : undefined;

  if (!isDefined(adminRoleId) && !isDefined(apiKeysIndividualRoleId)) {
    return undefined;
  }

  return {
    objectMetadataIds: CHANNEL_WRITE_ACCESS_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier]?.id,
    ).filter(isDefined),
    adminRoleId,
    apiKeysIndividualRoleId,
    writeAccessByRoleId: Object.fromEntries(
      Object.values(flatRoleMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatRole) => [
          flatRole.id,
          {
            canCreateAllRecords: flatRole.canCreateAllObjectRecords,
            canUpdateAllRecords: flatRole.canUpdateAllObjectRecords,
            canSoftDeleteAllRecords: flatRole.canSoftDeleteAllObjectRecords,
            canDestroyAllRecords: flatRole.canDestroyAllObjectRecords,
          },
        ]),
    ),
  };
};
