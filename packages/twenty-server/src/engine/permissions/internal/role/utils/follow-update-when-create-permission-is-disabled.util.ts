import {
  FeatureFlagKey,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const followUpdateForCreate = (
  objectRecordsPermissions: ObjectRecordsPermissions,
): ObjectRecordsPermissions => {
  const { rowLevelRecordsPermissions } = objectRecordsPermissions;

  return {
    ...objectRecordsPermissions,
    canCreateAllRecords: objectRecordsPermissions.canUpdateAllRecords,
    ...(isDefined(rowLevelRecordsPermissions) && {
      rowLevelRecordsPermissions: {
        ...rowLevelRecordsPermissions,
        canCreateRecords: rowLevelRecordsPermissions.canUpdateRecords,
      },
    }),
  };
};

export const followUpdateWhenCreatePermissionIsDisabled = ({
  recordsPermissions,
  featureFlagsMap,
}: {
  recordsPermissions: RoleRecordsPermissions;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): RoleRecordsPermissions =>
  featureFlagsMap[FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED] === true
    ? recordsPermissions
    : {
        ...recordsPermissions,
        objects: Object.fromEntries(
          Object.entries(recordsPermissions.objects).map(
            ([objectMetadataId, objectRecordsPermissions]) => [
              objectMetadataId,
              isDefined(objectRecordsPermissions)
                ? followUpdateForCreate(objectRecordsPermissions)
                : objectRecordsPermissions,
            ],
          ),
        ),
      };
