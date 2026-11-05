import { type ObjectRecordsOperationType } from '@/types/ObjectRecordsOperationType';
import { type ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { isDefined } from '@/utils/validation/isDefined';

export const canReachAllRecords = ({
  objectRecordsPermissions,
  operationType,
}: {
  objectRecordsPermissions:
    | Pick<
        ObjectRecordsPermissions,
        | 'canReadAllRecords'
        | 'canUpdateAllRecords'
        | 'canSoftDeleteAllRecords'
        | 'canDestroyAllRecords'
      >
    | undefined;
  operationType: ObjectRecordsOperationType;
}): boolean => {
  if (!isDefined(objectRecordsPermissions)) {
    return false;
  }

  switch (operationType) {
    case 'select':
      return objectRecordsPermissions.canReadAllRecords;
    case 'insert':
    case 'update':
      return objectRecordsPermissions.canUpdateAllRecords;
    case 'delete':
      return objectRecordsPermissions.canDestroyAllRecords;
    case 'restore':
    case 'soft-delete':
      return objectRecordsPermissions.canSoftDeleteAllRecords;
    default:
      return assertUnreachable(operationType);
  }
};
