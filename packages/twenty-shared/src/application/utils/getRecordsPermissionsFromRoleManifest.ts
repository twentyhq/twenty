import {
  type NormalizedRoleManifest,
  type RowLevelPermissionRuleManifest,
} from '@/application/roleManifestType';
import {
  type FieldPermissionGrant,
  type ObjectPermissionGrant,
} from '@/application/rolePermissionGrantsSchema';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type ObjectRecordsPermissionGrants } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';

export const getRecordsPermissionsFromRoleManifest = ({
  role,
}: {
  role: Pick<NormalizedRoleManifest, 'recordsPermissions'>;
}): Omit<Required<ObjectRecordsPermissionGrants>, 'objectPermissions'> & {
  objectPermissions: (Partial<SyncableEntityOptions> & ObjectPermissionGrant)[];
  fieldPermissions: (Partial<SyncableEntityOptions> & FieldPermissionGrant)[];
  rowLevelPermissionRules: RowLevelPermissionRuleManifest[];
} => {
  const { objects, ...allRecordsPermissions } = role.recordsPermissions;

  return {
    canReadAllObjectRecords: allRecordsPermissions.canReadAllRecords ?? false,
    canUpdateAllObjectRecords:
      allRecordsPermissions.canUpdateAllRecords ?? false,
    canSoftDeleteAllObjectRecords:
      allRecordsPermissions.canSoftDeleteAllRecords ?? false,
    canDestroyAllObjectRecords:
      allRecordsPermissions.canDestroyAllRecords ?? false,
    objectPermissions: objects.map((objectRecordsPermissions) => ({
      universalIdentifier: objectRecordsPermissions.universalIdentifier,
      objectUniversalIdentifier:
        objectRecordsPermissions.objectUniversalIdentifier,
      canReadObjectRecords: objectRecordsPermissions.canReadAllRecords,
      canUpdateObjectRecords: objectRecordsPermissions.canUpdateAllRecords,
      canSoftDeleteObjectRecords:
        objectRecordsPermissions.canSoftDeleteAllRecords,
      canDestroyObjectRecords: objectRecordsPermissions.canDestroyAllRecords,
    })),
    fieldPermissions: objects.flatMap(
      ({
        objectUniversalIdentifier,
        unreadableFields = [],
        uneditableFields = [],
        fieldPermissionIdentifiers = [],
      }) =>
        [...new Set([...unreadableFields, ...uneditableFields])].map(
          (fieldUniversalIdentifier) => ({
            universalIdentifier: fieldPermissionIdentifiers.find(
              (fieldPermissionIdentifier) =>
                fieldPermissionIdentifier.fieldUniversalIdentifier ===
                fieldUniversalIdentifier,
            )?.universalIdentifier,
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
    rowLevelPermissionRules: objects.flatMap(
      ({ objectUniversalIdentifier, rowLevelRecordsPermissions = [] }) =>
        rowLevelRecordsPermissions.map((rowLevelRecordsPermissions) => ({
          ...rowLevelRecordsPermissions,
          objectUniversalIdentifier,
        })),
    ),
  };
};
