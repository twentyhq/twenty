/* @license Enterprise */

import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const buildRecordReadRestrictions = ({
  recordsPermissions,
}: {
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
}): RecordReadRestrictions => {
  const unreadableObjectMetadataIds = new Set<string>();
  const unreadableFieldMetadataIds = new Set<string>();

  for (const [objectMetadataId, objectRecordsPermissions] of Object.entries(
    recordsPermissions.objects,
  )) {
    if (!isDefined(objectRecordsPermissions)) {
      continue;
    }

    if (
      !canReachSomeRecords({
        objectRecordsPermissions,
        operationType: 'read',
      })
    ) {
      unreadableObjectMetadataIds.add(objectMetadataId);
    }

    for (const [fieldMetadataId, fieldPermissions] of Object.entries(
      objectRecordsPermissions.restrictedFields,
    )) {
      if (fieldPermissions.canRead === false) {
        unreadableFieldMetadataIds.add(fieldMetadataId);
      }
    }
  }

  return { unreadableObjectMetadataIds, unreadableFieldMetadataIds };
};
