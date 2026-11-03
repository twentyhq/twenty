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

  const { rls } = objectRecordsPermissions;

  switch (operationType) {
    case 'select':
      return (
        objectRecordsPermissions.canReadAllRecords ||
        (rls?.canReadRecords ?? false)
      );
    case 'insert':
    case 'update':
      return (
        objectRecordsPermissions.canUpdateAllRecords ||
        (rls?.canUpdateRecords ?? false)
      );
    case 'delete':
      return (
        objectRecordsPermissions.canDestroyAllRecords ||
        (rls?.canDestroyRecords ?? false)
      );
    case 'restore':
    case 'soft-delete':
      return (
        objectRecordsPermissions.canSoftDeleteAllRecords ||
        (rls?.canSoftDeleteRecords ?? false)
      );
    default:
      return assertUnreachable(operationType);
  }
};
