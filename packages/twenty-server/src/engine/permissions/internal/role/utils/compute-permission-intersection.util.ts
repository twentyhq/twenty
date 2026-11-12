import {
  type ObjectRecordsPermissions,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';
import { canReachAllRecords, isDefined } from 'twenty-shared/utils';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const unionFields = ({
  objectRecordsPermissionsPerRole,
  fieldList,
}: {
  objectRecordsPermissionsPerRole: (ObjectRecordsPermissions | undefined)[];
  fieldList: 'unreadableFields' | 'uneditableFields';
}): string[] => [
  ...new Set(
    objectRecordsPermissionsPerRole.flatMap(
      (objectRecordsPermissions) => objectRecordsPermissions?.[fieldList] ?? [],
    ),
  ),
];

const intersectObjectRecordsPermissions = (
  objectRecordsPermissionsPerRole: (ObjectRecordsPermissions | undefined)[],
): ObjectRecordsPermissions => {
  const isGrantedToAllRecordsByEveryRole = (
    isGranted: (objectRecordsPermissions: ObjectRecordsPermissions) => boolean,
  ) =>
    objectRecordsPermissionsPerRole.every(
      (objectRecordsPermissions) =>
        isDefined(objectRecordsPermissions) &&
        isGranted(objectRecordsPermissions),
    );
  const intersectedObjectRecordsPermissions: ObjectRecordsPermissions = {
    canCreateAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canCreateAllRecords }) => canCreateAllRecords,
    ),
    canReadAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: isGrantedToAllRecordsByEveryRole(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    unreadableFields: unionFields({
      objectRecordsPermissionsPerRole,
      fieldList: 'unreadableFields',
    }),
    uneditableFields: unionFields({
      objectRecordsPermissionsPerRole,
      fieldList: 'uneditableFields',
    }),
  };

  const rowLevelRecordsPermissions = objectRecordsPermissionsPerRole.flatMap(
    (objectRecordsPermissions, roleIndex) => {
      const otherRolesObjectRecordsPermissions =
        objectRecordsPermissionsPerRole.filter(
          (_, otherRoleIndex) => otherRoleIndex !== roleIndex,
        );
      const isReachingAllRecordsForOtherRoles = (
        operationType: ObjectRecordsOperationType,
      ) =>
        otherRolesObjectRecordsPermissions.every(
          (otherRoleObjectRecordsPermissions) =>
            canReachAllRecords({
              objectRecordsPermissions: otherRoleObjectRecordsPermissions,
              operationType,
            }),
        );

      return (objectRecordsPermissions?.rowLevelRecordsPermissions ?? []).map(
        (rule) => ({
          ...rule,
          canCreateRecords:
            rule.canCreateRecords &&
            isReachingAllRecordsForOtherRoles('create'),
          canReadRecords:
            rule.canReadRecords && isReachingAllRecordsForOtherRoles('read'),
          canUpdateRecords:
            rule.canUpdateRecords &&
            isReachingAllRecordsForOtherRoles('update'),
          canSoftDeleteRecords:
            rule.canSoftDeleteRecords &&
            isReachingAllRecordsForOtherRoles('softDelete'),
          canDestroyRecords:
            rule.canDestroyRecords &&
            isReachingAllRecordsForOtherRoles('destroy'),
        }),
      );
    },
  );

  return rowLevelRecordsPermissions.length > 0
    ? { ...intersectedObjectRecordsPermissions, rowLevelRecordsPermissions }
    : intersectedObjectRecordsPermissions;
};

export const computePermissionIntersection = (
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
    objects[objectMetadataId] = intersectObjectRecordsPermissions(
      recordsPermissionsPerRole.map(
        (recordsPermissions) => recordsPermissions.objects[objectMetadataId],
      ),
    );
  }

  return {
    canReadAllRecords: recordsPermissionsPerRole.every(
      ({ canReadAllRecords }) => canReadAllRecords,
    ),
    canUpdateAllRecords: recordsPermissionsPerRole.every(
      ({ canUpdateAllRecords }) => canUpdateAllRecords,
    ),
    canSoftDeleteAllRecords: recordsPermissionsPerRole.every(
      ({ canSoftDeleteAllRecords }) => canSoftDeleteAllRecords,
    ),
    canDestroyAllRecords: recordsPermissionsPerRole.every(
      ({ canDestroyAllRecords }) => canDestroyAllRecords,
    ),
    objects,
  };
};
