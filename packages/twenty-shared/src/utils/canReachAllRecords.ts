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
      // Only set when create is enforced on its own: otherwise it follows update
      return (
        objectRecordsPermissions.canCreateAllRecords ??
        objectRecordsPermissions.canUpdateAllRecords
      );
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
