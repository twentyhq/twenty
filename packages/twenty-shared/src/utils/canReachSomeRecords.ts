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
    case 'read':
      return rowLevelRecordsPermissions.canReadRecords;
    case 'create':
      return rowLevelRecordsPermissions.canCreateRecords;
    case 'update':
      return rowLevelRecordsPermissions.canUpdateRecords;
    case 'destroy':
      return rowLevelRecordsPermissions.canDestroyRecords;
    case 'softDelete':
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
