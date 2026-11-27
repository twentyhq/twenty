import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { canAccessThroughAllRecordsPermission } from '@/utils/canAccessThroughAllRecordsPermission';
import { canAccessThroughRlsPermission } from '@/utils/canAccessThroughRlsPermission';
import { isDefined } from '@/utils/validation/isDefined';

export const canAccessThroughAllRecordsOrRlsPermission = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationType: ObjectRecordsOperationType;
}): boolean => {
  if (!isDefined(objectRecordsPermissions)) {
    return false;
  }

  if (
    operationType === 'read' &&
    isDefined(objectRecordsPermissions.canReadSomeRecords)
  ) {
    return objectRecordsPermissions.canReadSomeRecords;
  }

  return (
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType,
    }) ||
    canAccessThroughRlsPermission({
      rowLevelRecordsPermissions:
        objectRecordsPermissions.rowLevelRecordsPermissions,
      operationType,
    })
  );
};
