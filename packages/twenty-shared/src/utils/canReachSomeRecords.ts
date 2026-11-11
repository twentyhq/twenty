import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { canReachAllRecords } from '@/utils/canReachAllRecords';
import { isDefined } from '@/utils/validation/isDefined';
import { isRowLevelRecordsPermissionsRuleGrantingOperation } from '@/utils/isRowLevelRecordsPermissionsRuleGrantingOperation';

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

  return rowLevelRecordsPermissions.some((rule) =>
    isRowLevelRecordsPermissionsRuleGrantingOperation({ rule, operationType }),
  );
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
