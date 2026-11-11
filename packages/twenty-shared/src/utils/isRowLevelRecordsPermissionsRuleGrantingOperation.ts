import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type RowLevelRecordsPermissions } from '@/types/RowLevelRecordsPermissions';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const isRowLevelRecordsPermissionsRuleGrantingOperation = ({
  rule,
  operationType,
}: {
  rule: Pick<
    RowLevelRecordsPermissions,
    | 'canCreateRecords'
    | 'canReadRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >;
  operationType: ObjectRecordsOperationType;
}): boolean => {
  switch (operationType) {
    case 'read':
      return rule.canReadRecords;
    case 'create':
      return rule.canCreateRecords;
    case 'update':
      return rule.canUpdateRecords;
    case 'destroy':
      return rule.canDestroyRecords;
    case 'softDelete':
      return rule.canSoftDeleteRecords;
    default:
      return assertUnreachable(operationType);
  }
};
