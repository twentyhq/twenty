import {
  type FieldPermissionManifest,
  type ObjectPermissionManifest,
  type RoleManifest,
  type RowLevelPermissionRuleManifest,
} from '@/application/roleManifestType';
import { type ObjectRecordsPermissionGrants } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';

type RoleManifestRecordsPermissions = Pick<
  RoleManifest,
  | 'recordsPermissions'
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
  | 'objectPermissions'
  | 'fieldPermissions'
>;

export const getRecordsPermissionsFromRoleManifest = ({
  role,
}: {
  role: RoleManifestRecordsPermissions;
}): Omit<Required<ObjectRecordsPermissionGrants>, 'objectPermissions'> & {
  objectPermissions: ObjectPermissionManifest[];
  fieldPermissions: FieldPermissionManifest[];
  rowLevelPermissionRules: RowLevelPermissionRuleManifest[];
} => {
  const recordsPermissions = role.recordsPermissions ?? {};
  const objects = recordsPermissions.objects ?? [];

  return {
    canReadAllObjectRecords:
      recordsPermissions.canReadAllRecords ??
      role.canReadAllObjectRecords ??
      false,
    canUpdateAllObjectRecords:
      recordsPermissions.canUpdateAllRecords ??
      role.canUpdateAllObjectRecords ??
      false,
    canSoftDeleteAllObjectRecords:
      recordsPermissions.canSoftDeleteAllRecords ??
      role.canSoftDeleteAllObjectRecords ??
      false,
    canDestroyAllObjectRecords:
      recordsPermissions.canDestroyAllRecords ??
      role.canDestroyAllObjectRecords ??
      false,
    objectPermissions: [
      ...(role.objectPermissions ?? []),
      ...objects.map((objectRecordsPermissions) => ({
        universalIdentifier: objectRecordsPermissions.universalIdentifier,
        objectUniversalIdentifier:
          objectRecordsPermissions.objectUniversalIdentifier,
        canReadObjectRecords: objectRecordsPermissions.canReadAllRecords,
        canUpdateObjectRecords: objectRecordsPermissions.canUpdateAllRecords,
        canSoftDeleteObjectRecords:
          objectRecordsPermissions.canSoftDeleteAllRecords,
        canDestroyObjectRecords: objectRecordsPermissions.canDestroyAllRecords,
      })),
    ],
    fieldPermissions: [
      ...(role.fieldPermissions ?? []),
      ...objects.flatMap(
        ({
          objectUniversalIdentifier,
          unreadableFields = [],
          uneditableFields = [],
        }) =>
          [...new Set([...unreadableFields, ...uneditableFields])].map(
            (fieldUniversalIdentifier) => ({
              objectUniversalIdentifier,
              fieldUniversalIdentifier,
              ...(unreadableFields.includes(fieldUniversalIdentifier)
                ? { canReadFieldValue: false }
                : {}),
              ...(uneditableFields.includes(fieldUniversalIdentifier)
                ? { canUpdateFieldValue: false }
                : {}),
            }),
          ),
      ),
    ],
    rowLevelPermissionRules: objects.flatMap(
      ({ objectUniversalIdentifier, rowLevelRecordsPermissions = [] }) =>
        rowLevelRecordsPermissions.map((rowLevelRecordsPermissions) => ({
          ...rowLevelRecordsPermissions,
          objectUniversalIdentifier,
        })),
    ),
  };
};
