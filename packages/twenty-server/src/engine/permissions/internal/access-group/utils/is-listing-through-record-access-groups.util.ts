/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';

export const isListingThroughRecordAccessGroups = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  operationType,
}: PermissionsObjectAccessRequest): boolean =>
  operationType === 'read' &&
  metadataMaps.featureFlagsMap[FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED] ===
    true &&
  isDefined(
    metadataMaps.rolesPermissions[principals.mainPrincipal.roleId]?.objects[
      flatObjectMetadata.id
    ]?.rowLevelRecordsPermissions,
  );
