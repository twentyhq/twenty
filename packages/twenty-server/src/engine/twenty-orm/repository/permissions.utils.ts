import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import {
  type FeatureFlagKey,
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { validateWritabilityOrThrow } from 'src/engine/twenty-orm/repository/validate-writability-or-throw.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

export type OperationType =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'restore'
  | 'soft-delete';

type ValidateOperationIsPermittedOrThrowArgs = {
  entityName: string;
  operationType: OperationType;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
  selectedColumns: string[];
  updatedColumns: string[];
  authContext?: WorkspaceAuthContext;
  featureFlagsMap?: Partial<Record<FeatureFlagKey, boolean>>;
};

export const validateOperationIsPermittedOrThrow = ({
  entityName,
  operationType,
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
  selectedColumns,
  updatedColumns,
  authContext,
  featureFlagsMap = {},
}: ValidateOperationIsPermittedOrThrowArgs) => {
  const objectMetadataIdForEntity = objectIdByNameSingular[entityName];

  if (!isNonEmptyString(objectMetadataIdForEntity)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectMetadataIdForEntity,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(objectMetadata)) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  const columnNameToFieldMetadataIdMap = getColumnNameToFieldMetadataIdMap(
    objectMetadata,
    flatFieldMetadataMaps,
  );

  validateWritabilityOrThrow({
    operationType,
    objectMetadata,
    updatedColumns,
    columnNameToFieldMetadataIdMap,
    flatFieldMetadataMaps,
    authContext,
  });

  const permissionsForEntity = objectsPermissions[objectMetadataIdForEntity];

  // Records shared by name stay reachable without the object permission; the
  // row access policy then narrows the query to those records
  if (
    (!isDefined(permissionsForEntity) ||
      !isObjectOperationPermitted({
        objectMetadata,
        operationType,
        objectsPermissions,
      })) &&
    !resolveObjectSharing({
      flatObjectMetadata: objectMetadata,
      featureFlagsMap,
    }).operationTypesGrantedBeyondRole.includes(operationType)
  ) {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  const restrictedFields = permissionsForEntity?.restrictedFields ?? {};

  switch (operationType) {
    case 'select':
    case 'delete':
    case 'restore':
    case 'soft-delete':
      validateReadFieldPermissionOrThrow({
        restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });
      break;
    case 'insert':
      validateReadFieldPermissionOrThrow({
        restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        const rlsFieldMetadataIds = new Set(
          (permissionsForEntity?.rowLevelPermissionPredicates ?? []).map(
            (predicate) => predicate.fieldMetadataId,
          ),
        );

        const updatedColumnsWithoutRlsFields = updatedColumns.filter(
          (column) => {
            const columnFieldMetadataId =
              columnNameToFieldMetadataIdMap[column];

            assertIsDefinedOrThrow(columnFieldMetadataId);

            return !rlsFieldMetadataIds.has(columnFieldMetadataId);
          },
        );

        if (updatedColumnsWithoutRlsFields.length > 0) {
          validateUpdateFieldPermissionOrThrow({
            restrictedFields,
            updatedColumns: updatedColumnsWithoutRlsFields,
            columnNameToFieldMetadataIdMap,
            entityName,
            flatFieldMetadataMaps,
          });
        }
      }
      break;
    case 'update':
      validateReadFieldPermissionOrThrow({
        restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        validateUpdateFieldPermissionOrThrow({
          restrictedFields,
          updatedColumns,
          columnNameToFieldMetadataIdMap,
          entityName,
          flatFieldMetadataMaps,
        });
      }
      break;
    default:
      throw new PermissionsException(
        PermissionsExceptionMessage.UNKNOWN_OPERATION_NAME,
        PermissionsExceptionCode.UNKNOWN_OPERATION_NAME,
      );
  }
};

const buildFieldPermissionDeniedMessage = ({
  action,
  column,
  fieldMetadataId,
  entityName,
  flatFieldMetadataMaps,
}: {
  action: 'read' | 'write';
  column: string;
  fieldMetadataId: string;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string => {
  const fieldMetadata = isDefined(fieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;
  const fieldName = fieldMetadata?.name ?? column;

  return `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to ${action} field "${fieldName}" on "${entityName}"`;
};

const validateReadFieldPermissionOrThrow = ({
  restrictedFields,
  selectedColumns,
  columnNameToFieldMetadataIdMap,
  entityName,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  selectedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}) => {
  const noReadRestrictions =
    isEmpty(restrictedFields) ||
    Object.values(restrictedFields).every((field) => field.canRead !== false);

  if (noReadRestrictions) {
    return;
  }

  for (const column of selectedColumns) {
    const fieldMetadataId = columnNameToFieldMetadataIdMap[column];

    if (!fieldMetadataId) {
      throw new InternalServerError(
        `Field metadata id not found for column name ${column}`,
      );
    }

    if (restrictedFields[fieldMetadataId]?.canRead === false) {
      throw new PermissionsException(
        buildFieldPermissionDeniedMessage({
          action: 'read',
          column,
          fieldMetadataId,
          entityName,
          flatFieldMetadataMaps,
        }),
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};

const validateUpdateFieldPermissionOrThrow = ({
  restrictedFields,
  updatedColumns,
  columnNameToFieldMetadataIdMap,
  entityName,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  updatedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}) => {
  if (isEmpty(restrictedFields)) {
    return;
  }

  for (const column of updatedColumns) {
    const fieldMetadataId = columnNameToFieldMetadataIdMap[column];

    if (!fieldMetadataId) {
      throw new InternalServerError(
        `Field metadata id not found for column name ${column}`,
      );
    }

    if (restrictedFields[fieldMetadataId]?.canUpdate === false) {
      throw new PermissionsException(
        buildFieldPermissionDeniedMessage({
          action: 'write',
          column,
          fieldMetadataId,
          entityName,
          flatFieldMetadataMaps,
        }),
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};
