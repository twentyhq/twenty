import { isNonEmptyString } from '@sniptt/guards';
import { ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  if (!isNonEmptyString(objectMetadataIdForEntity)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  const objectMetadata = objectMetadataMaps.byId[objectMetadataIdForEntity];

  if (!isDefined(objectMetadata)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  const objectMetadataIsSystem = objectMetadata.isSystem === true;

  if (objectMetadataIsSystem) {
    return;
  }

  const permissionsForEntity =
    objectRecordsPermissions[objectMetadataIdForEntity];

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
