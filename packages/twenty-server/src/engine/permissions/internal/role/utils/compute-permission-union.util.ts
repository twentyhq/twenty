import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const unionObjectRecordsPermissions = (
  objectRecordsPermissionsPerRole: ObjectRecordsPermissions[],
): ObjectRecordsPermissions => {
  const isGrantedToAllRecordsBySomeRole = (
    isGranted: (objectRecordsPermissions: ObjectRecordsPermissions) => boolean,
  ) => objectRecordsPermissionsPerRole.some(isGranted);
  // A field denied by any role stays denied, so adding a role never reveals a field
  const unionFields = (
    inaccessibleFieldsKey: 'unreadableFields' | 'uneditableFields',
  ): string[] => [
    ...new Set(
      objectRecordsPermissionsPerRole.flatMap(
        (objectRecordsPermissions) =>
          objectRecordsPermissions[inaccessibleFieldsKey],
      ),
    ),
  ];
  const rowLevelRecordsPermissions = objectRecordsPermissionsPerRole.flatMap(
    (objectRecordsPermissions) =>
      objectRecordsPermissions.rowLevelRecordsPermissions ?? [],
  );

  return {
    canCreateAllRecords: isGrantedToAllRecordsBySomeRole(
      ({ canCreateAllRecords }) => canCreateAllRecords,
    ),
    canReadAllRecords: isGrantedToAllRecordsBySomeRole(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: isGrantedToAllRecordsBySomeRole(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: isGrantedToAllRecordsBySomeRole(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: isGrantedToAllRecordsBySomeRole(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    unreadableFields: unionFields('unreadableFields'),
    uneditableFields: unionFields('uneditableFields'),
    ...(rowLevelRecordsPermissions.length > 0
      ? { rowLevelRecordsPermissions }
      : {}),
  };
};

export const computePermissionUnion = (
  recordsPermissionsPerRole: RoleRecordsPermissions[],
): RoleRecordsPermissions => {
  if (recordsPermissionsPerRole.length === 0) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  if (recordsPermissionsPerRole.length === 1) {
    return recordsPermissionsPerRole[0];
  }

  const objectMetadataIds = new Set(
    recordsPermissionsPerRole.flatMap((recordsPermissions) =>
      Object.keys(recordsPermissions.objects),
    ),
  );
  const objects: RoleRecordsPermissions['objects'] = {};

  for (const objectMetadataId of objectMetadataIds) {
    objects[objectMetadataId] = unionObjectRecordsPermissions(
      recordsPermissionsPerRole
        .map(
          (recordsPermissions) => recordsPermissions.objects[objectMetadataId],
        )
        .filter(isDefined),
    );
  }

  return {
    canReadAllRecords: recordsPermissionsPerRole.some(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: recordsPermissionsPerRole.some(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: recordsPermissionsPerRole.some(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: recordsPermissionsPerRole.some(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    objects,
  };
};
