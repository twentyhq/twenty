import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { canReachAllRecords } from '@/utils/canReachAllRecords';
import { isDefined } from '@/utils/validation/isDefined';

const canReachRowLevelRecords = ({
  rowLevelRecordsPermissions,
  operationType,
}: {
  rowLevelRecordsPermissions: ObjectRecordsPermissions['rowLevelRecordsPermissions'];
  operationType: ObjectRecordsOperationType;
}): boolean => {
  if (!isDefined(rowLevelRecordsPermissions)) {
    return false;
  }

  switch (operationType) {
    case 'select':
      return rowLevelRecordsPermissions.canReadRecords;
    case 'insert':
    case 'update':
      return rowLevelRecordsPermissions.canUpdateRecords;
    case 'delete':
      return rowLevelRecordsPermissions.canDestroyRecords;
    case 'restore':
    case 'soft-delete':
      return rowLevelRecordsPermissions.canSoftDeleteRecords;
    default:
      return assertUnreachable(operationType);
  }
};

export const canReachSomeRecords = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationType: ObjectRecordsOperationType;
}): boolean =>
  isDefined(objectRecordsPermissions) &&
  (canReachAllRecords({ objectRecordsPermissions, operationType }) ||
    canReachRowLevelRecords({
      rowLevelRecordsPermissions:
        objectRecordsPermissions.rowLevelRecordsPermissions,
      operationType,
    }));
