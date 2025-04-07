import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

const getTargetEntityAndOperationType = (expressionMap: QueryExpressionMap) => {
  const mainEntity = expressionMap.aliases[0].metadata.name;
  const operationType = expressionMap.queryType;

  return {
    mainEntity,
    operationType,
  };
};

export const validateQueryIsPermittedOrThrow = (
  expressionMap: QueryExpressionMap,
  objectRecordsPermissions: Record<PermissionsOnAllObjectRecords, boolean>,
) => {
  const { mainEntity: _mainEntity, operationType } =
    getTargetEntityAndOperationType(expressionMap);

  switch (operationType) {
    case 'select':
      if (
        !objectRecordsPermissions[
          PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS
        ]
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'insert':
    case 'update':
      if (
        !objectRecordsPermissions[
          PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS
        ]
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'delete':
      if (
        !objectRecordsPermissions[
          PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS
        ]
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'soft-delete':
      if (
        !objectRecordsPermissions[
          PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS
        ]
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    default:
      throw new PermissionsException(
        PermissionsExceptionMessage.UNKNOWN_OPERATION_NAME,
        PermissionsExceptionCode.UNKNOWN_OPERATION_NAME,
      );
  }
};
