import { type ObjectPermissionAction } from 'twenty-shared/application';
import { assertUnreachable } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

const getObjectPermissionAction = (
  operationType: OperationType,
): ObjectPermissionAction => {
  switch (operationType) {
    case 'select':
      return 'canReadObjectRecords';
    case 'insert':
    case 'update':
      return 'canUpdateObjectRecords';
    case 'delete':
      return 'canDestroyObjectRecords';
    case 'restore':
    case 'soft-delete':
      return 'canSoftDeleteObjectRecords';
    default:
      return assertUnreachable(operationType);
  }
};

export const isObjectOperationDisabled = ({
  objectMetadata,
  operationType,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'disabledObjectPermissionActions'>;
  operationType: OperationType;
}): boolean =>
  objectMetadata.disabledObjectPermissionActions?.includes(
    getObjectPermissionAction(operationType),
  ) ?? false;
