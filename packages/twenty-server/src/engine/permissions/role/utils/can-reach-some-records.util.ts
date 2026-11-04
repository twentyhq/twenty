import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type ObjectRecordsPermissions } from 'src/engine/permissions/types/object-records-permissions.type';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

export const canReachSomeRecords = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions: ObjectRecordsPermissions | undefined;
  operationType: OperationType;
}): boolean => {
  if (!isDefined(objectRecordsPermissions)) {
    return false;
  }

  const { rowLevelRecordsPermissions } = objectRecordsPermissions;

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
