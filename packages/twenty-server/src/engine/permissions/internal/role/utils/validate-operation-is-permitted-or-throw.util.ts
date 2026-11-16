import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';

type ValidateOperationIsPermittedOrThrowArgs = {
  entityName: string;
  operationType: ObjectRecordsOperationType;
  recordsPermissions: RoleRecordsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
  selectedColumns: string[];
  updatedColumns: string[];
};

export const validateOperationIsPermittedOrThrow = ({
  entityName,
  operationType,
  recordsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
  selectedColumns,
  updatedColumns,
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

  const permissionsForEntity =
    recordsPermissions.objects[objectMetadataIdForEntity];

  const unreadableFields = permissionsForEntity?.unreadableFields ?? [];
  const uneditableFields = permissionsForEntity?.uneditableFields ?? [];

  switch (operationType) {
    case 'read':
    case 'destroy':
    case 'softDelete':
      validateReadFieldPermissionOrThrow({
        unreadableFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });
      break;
    case 'create':
      validateReadFieldPermissionOrThrow({
        unreadableFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        const rlsFieldMetadataIds = new Set(
          (permissionsForEntity?.rowLevelRecordsPermissions ?? []).flatMap(
            ({ predicates }) =>
              predicates.map((predicate) => predicate.fieldMetadataId),
          ),
        );

        const updatedColumnsWithoutRlsFields = updatedColumns.filter(
          (column) =>
            !rlsFieldMetadataIds.has(columnNameToFieldMetadataIdMap[column]),
        );

        if (updatedColumnsWithoutRlsFields.length > 0) {
          validateUpdateFieldPermissionOrThrow({
            uneditableFields,
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
        unreadableFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        validateUpdateFieldPermissionOrThrow({
          uneditableFields,
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
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const fieldName = fieldMetadata?.name ?? column;

  return `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to ${action} field "${fieldName}" on "${entityName}"`;
};

const validateReadFieldPermissionOrThrow = ({
  unreadableFields,
  selectedColumns,
  columnNameToFieldMetadataIdMap,
  entityName,
  flatFieldMetadataMaps,
}: {
  unreadableFields: string[];
  selectedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}) => {
  if (unreadableFields.length === 0) {
    return;
  }

  for (const column of selectedColumns) {
    const fieldMetadataId = columnNameToFieldMetadataIdMap[column];

    if (!fieldMetadataId) {
      throw new InternalServerError(
        `Field metadata id not found for column name ${column}`,
      );
    }

    if (unreadableFields.includes(fieldMetadataId)) {
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
  uneditableFields,
  updatedColumns,
  columnNameToFieldMetadataIdMap,
  entityName,
  flatFieldMetadataMaps,
}: {
  uneditableFields: string[];
  updatedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}) => {
  if (uneditableFields.length === 0) {
    return;
  }

  for (const column of updatedColumns) {
    const fieldMetadataId = columnNameToFieldMetadataIdMap[column];

    if (!fieldMetadataId) {
      throw new InternalServerError(
        `Field metadata id not found for column name ${column}`,
      );
    }

    if (uneditableFields.includes(fieldMetadataId)) {
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
