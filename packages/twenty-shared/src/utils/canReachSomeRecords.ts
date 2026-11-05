import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { isDefined } from '@/utils/validation/isDefined';

export const canReachSomeRecords = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationType: ObjectRecordsOperationType;
}): boolean => {
  if (!isDefined(objectRecordsPermissions)) {
    return false;
  }

  const rowLevelRecordsPermissions =
    objectRecordsPermissions.rowLevelRecordsPermissions;

  switch (operationType) {
    case 'select':
      return (
        objectRecordsPermissions.canReadAllRecords ||
        (rowLevelRecordsPermissions?.canReadRecords ?? false)
      );
    case 'insert':
    case 'update':
      return (
        objectRecordsPermissions.canUpdateAllRecords ||
        (rowLevelRecordsPermissions?.canUpdateRecords ?? false)
      );
    case 'delete':
      return (
        objectRecordsPermissions.canDestroyAllRecords ||
        (rowLevelRecordsPermissions?.canDestroyRecords ?? false)
      );
    case 'restore':
    case 'soft-delete':
      return (
        objectRecordsPermissions.canSoftDeleteAllRecords ||
        (rowLevelRecordsPermissions?.canSoftDeleteRecords ?? false)
      );
    default:
      return assertUnreachable(operationType);
  }
};
