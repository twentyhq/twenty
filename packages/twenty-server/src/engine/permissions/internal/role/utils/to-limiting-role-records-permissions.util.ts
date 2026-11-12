import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type LimitingObjectRecordsPermissions,
  type LimitingRoleRecordsPermissions,
} from 'src/engine/permissions/types/limiting-role-records-permissions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const toLimitingObjectRecordsPermissions = ({
  rowLevelRecordsPermissions: _rowLevelRecordsPermissions,
  ...objectRecordsPermissions
}: ObjectRecordsPermissions): LimitingObjectRecordsPermissions =>
  objectRecordsPermissions;

export const toLimitingRoleRecordsPermissions = (
  recordsPermissions: RoleRecordsPermissions,
): LimitingRoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: Object.fromEntries(
    Object.entries(recordsPermissions.objects).map(
      ([objectMetadataId, objectRecordsPermissions]) => [
        objectMetadataId,
        isDefined(objectRecordsPermissions)
          ? toLimitingObjectRecordsPermissions(objectRecordsPermissions)
          : undefined,
      ],
    ),
  ),
});
