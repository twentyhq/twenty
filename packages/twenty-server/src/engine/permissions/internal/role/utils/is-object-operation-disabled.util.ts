import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { type DisableableObjectPermissionAction } from 'twenty-shared/application';
import { assertUnreachable } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getObjectPermissionAction = ({
  operationType,
  isCreatePermissionEnabled,
}: {
  operationType: ObjectRecordsOperationType;
  isCreatePermissionEnabled: boolean;
}): DisableableObjectPermissionAction => {
  switch (operationType) {
    case 'read':
      return 'canReadObjectRecords';
    case 'create':
      return isCreatePermissionEnabled
        ? 'canCreateObjectRecords'
        : 'canUpdateObjectRecords';
    case 'update':
      return 'canUpdateObjectRecords';
    case 'destroy':
      return 'canDestroyObjectRecords';
    case 'softDelete':
      return 'canSoftDeleteObjectRecords';
    default:
      return assertUnreachable(operationType);
  }
};

export const isObjectOperationDisabled = ({
  objectMetadata,
  operationType,
  isCreatePermissionEnabled,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'disabledObjectPermissionActions'>;
  operationType: ObjectRecordsOperationType;
  isCreatePermissionEnabled: boolean;
}): boolean =>
  objectMetadata.disabledObjectPermissionActions?.includes(
    getObjectPermissionAction({ operationType, isCreatePermissionEnabled }),
  ) ?? false;
