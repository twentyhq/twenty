import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { canRlsRuleAccessOperation } from '@/utils/canRlsRuleAccessOperation';
import { isDefined } from '@/utils/validation/isDefined';

export const canAccessThroughRlsPermission = ({
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
    canRlsRuleAccessOperation({ rule, operationType }),
  );
};
