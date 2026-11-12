import {
  type ObjectPermissionManifest,
  type RoleManifest,
  type RowLevelPermissionRuleManifest,
} from '@/application/roleManifestType';

// Reads both forms: objectRecordsPermissions, and the older objectPermissions
export const getRecordsPermissionsFromRoleManifest = ({
  role,
}: {
  role: Pick<RoleManifest, 'objectPermissions' | 'objectRecordsPermissions'>;
}): {
  objectPermissions: ObjectPermissionManifest[];
  rowLevelPermissionRules: RowLevelPermissionRuleManifest[];
} => {
  const objectRecordsPermissions = role.objectRecordsPermissions ?? [];

  return {
    objectPermissions: [
      ...(role.objectPermissions ?? []),
      ...objectRecordsPermissions.map(
        ({
          universalIdentifier,
          objectUniversalIdentifier,
          canReadAllRecords,
          canUpdateAllRecords,
          canSoftDeleteAllRecords,
          canDestroyAllRecords,
        }) => ({
          universalIdentifier,
          objectUniversalIdentifier,
          canReadObjectRecords: canReadAllRecords,
          canUpdateObjectRecords: canUpdateAllRecords,
          canSoftDeleteObjectRecords: canSoftDeleteAllRecords,
          canDestroyObjectRecords: canDestroyAllRecords,
        }),
      ),
    ],
    rowLevelPermissionRules: objectRecordsPermissions.flatMap(
      ({ objectUniversalIdentifier, rowLevelRecordsPermissions = [] }) =>
        rowLevelRecordsPermissions.map((rowLevelRecordsPermissions) => ({
          ...rowLevelRecordsPermissions,
          objectUniversalIdentifier,
        })),
    ),
  };
};
