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
        | 'canCreateAllRecords'
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
    case 'read':
      return objectRecordsPermissions.canReadAllRecords;
    case 'create':
      return objectRecordsPermissions.canCreateAllRecords;
    case 'update':
      return objectRecordsPermissions.canUpdateAllRecords;
    case 'destroy':
      return objectRecordsPermissions.canDestroyAllRecords;
    case 'softDelete':
      return objectRecordsPermissions.canSoftDeleteAllRecords;
    default:
      return assertUnreachable(operationType);
  }
};
