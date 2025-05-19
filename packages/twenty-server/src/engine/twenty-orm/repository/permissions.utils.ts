import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

const getTargetEntityAndOperationType = (expressionMap: QueryExpressionMap) => {
  const mainEntity = expressionMap.aliases[0].metadata.name;
  const operationType = expressionMap.queryType;

  return {
    mainEntity,
    operationType,
  };
};

export type OperationType =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'restore'
  | 'soft-delete';

export const validateOperationIsPermittedOrThrow = ({
  entityName,
  operationType,
  objectRecordsPermissions,
  objectMetadataMaps,
}: {
  entityName: string;
  operationType: OperationType;
  objectRecordsPermissions: ObjectRecordsPermissions;
  objectMetadataMaps: ObjectMetadataMaps;
}) => {
  const objectMetadataIdForEntity =
    objectMetadataMaps.idByNameSingular[entityName];

  const objectMetadataIsSystem =
    objectMetadataMaps.byId[objectMetadataIdForEntity]?.isSystem === true;

  if (objectMetadataIsSystem) {
    return;
  }

  const permissionsForEntity = objectRecordsPermissions[entityName];

  switch (operationType) {
    case 'select':
      if (!permissionsForEntity?.canRead) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'insert':
    case 'update':
      if (!permissionsForEntity?.canUpdate) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'delete':
      if (!permissionsForEntity?.canDestroy) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
      break;
    case 'restore':
    case 'soft-delete':
      if (!permissionsForEntity?.canSoftDelete) {
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

export const validateQueryIsPermittedOrThrow = (
  expressionMap: QueryExpressionMap,
  objectRecordsPermissions: ObjectRecordsPermissions,
  objectMetadataMaps: ObjectMetadataMaps,
  shouldBypassPermissionChecks: boolean,
) => {
  if (shouldBypassPermissionChecks) {
    return;
  }

  const { mainEntity, operationType } =
    getTargetEntityAndOperationType(expressionMap);

  validateOperationIsPermittedOrThrow({
    entityName: mainEntity,
    operationType: operationType as OperationType,
    objectRecordsPermissions,
    objectMetadataMaps,
  });
};
