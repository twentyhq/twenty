import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { canReachSomeRecords } from 'src/engine/permissions/role/utils/can-reach-some-records.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const fromRoleRecordsPermissionsToObjectsPermissions = ({
  roleRecordsPermissions,
}: {
  roleRecordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
}): ObjectsPermissions => {
  const objectsPermissions: ObjectsPermissions = {};

  for (const [objectMetadataId, objectRecordsPermissions] of Object.entries(
    roleRecordsPermissions.objects,
  )) {
    if (!isDefined(objectRecordsPermissions)) {
      continue;
    }

    objectsPermissions[objectMetadataId] = {
      canReadObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'select',
      }),
      canUpdateObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'update',
      }),
      canSoftDeleteObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'soft-delete',
      }),
      canDestroyObjectRecords: canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'delete',
      }),
      restrictedFields: objectRecordsPermissions.restrictedFields,
      rowLevelPermissionPredicates:
        objectRecordsPermissions.rowLevelRecordsPermissions?.predicates ?? [],
      rowLevelPermissionPredicateGroups:
        objectRecordsPermissions.rowLevelRecordsPermissions?.predicateGroups ??
        [],
    };
  }

  return objectsPermissions;
};
