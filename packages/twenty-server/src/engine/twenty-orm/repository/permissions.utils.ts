import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { validateWritabilityOrThrow } from 'src/engine/twenty-orm/repository/validate-writability-or-throw.util';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

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
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
  selectedColumns: string[] | '*';
  allFieldsSelected: boolean;
  updatedColumns: string[];
  authContext?: WorkspaceAuthContext;
};

export const validateOperationIsPermittedOrThrow = ({
  entityName,
  operationType,
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
  selectedColumns,
  allFieldsSelected,
  updatedColumns,
  authContext,
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

  const objectMetadataIsSystem = objectMetadata.isSystem === true;
  const isWorkspaceMemberObject =
    objectMetadata.universalIdentifier ===
    WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER;

  // TODO: this should be improved, we may have more complex permission configuration for is system objects
  if (objectMetadataIsSystem && !isWorkspaceMemberObject) {
    return;
  }

  const permissionsForEntity = objectsPermissions[objectMetadataIdForEntity];

  switch (operationType) {
    case 'select':
      if (!permissionsForEntity?.canReadObjectRecords) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      validateReadFieldPermissionOrThrow({
        restrictedFields: permissionsForEntity.restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        allFieldsSelected,
        entityName,
        flatFieldMetadataMaps,
      });
      break;
    case 'insert':
      if (!permissionsForEntity?.canUpdateObjectRecords) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      validateReadFieldPermissionOrThrow({
        restrictedFields: permissionsForEntity.restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        const rlsFieldMetadataIds = new Set(
          permissionsForEntity.rowLevelPermissionPredicates.map(
            (predicate) => predicate.fieldMetadataId,
          ),
        );

        const updatedColumnsWithoutRlsFields = updatedColumns.filter(
          (column) =>
            !rlsFieldMetadataIds.has(columnNameToFieldMetadataIdMap[column]),
        );

        if (updatedColumnsWithoutRlsFields.length > 0) {
          validateUpdateFieldPermissionOrThrow({
            restrictedFields: permissionsForEntity.restrictedFields,
            updatedColumns: updatedColumnsWithoutRlsFields,
            columnNameToFieldMetadataIdMap,
            entityName,
            flatFieldMetadataMaps,
          });
        }
      }
      break;
    case 'update':
      if (!permissionsForEntity?.canUpdateObjectRecords) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      validateReadFieldPermissionOrThrow({
        restrictedFields: permissionsForEntity.restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });

      if (updatedColumns.length > 0) {
        validateUpdateFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          updatedColumns,
          columnNameToFieldMetadataIdMap,
          entityName,
          flatFieldMetadataMaps,
        });
      }
      break;
    case 'delete':
      if (!permissionsForEntity?.canDestroyObjectRecords) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      validateReadFieldPermissionOrThrow({
        restrictedFields: permissionsForEntity.restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });
      break;
    case 'restore':
    case 'soft-delete':
      if (!permissionsForEntity?.canSoftDeleteObjectRecords) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      validateReadFieldPermissionOrThrow({
        restrictedFields: permissionsForEntity.restrictedFields,
        selectedColumns,
        columnNameToFieldMetadataIdMap,
        entityName,
        flatFieldMetadataMaps,
      });
      break;
    default:
      throw new PermissionsException(
        PermissionsExceptionMessage.UNKNOWN_OPERATION_NAME,
        PermissionsExceptionCode.UNKNOWN_OPERATION_NAME,
      );
  }

  if (isEmpty(permissionsForEntity.restrictedFields)) {
    return;
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
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const fieldName = fieldMetadata?.name ?? column;

  return `${PermissionsExceptionMessage.PERMISSION_DENIED}: no permission to ${action} field "${fieldName}" on "${entityName}"`;
};

const validateReadFieldPermissionOrThrow = ({
  restrictedFields,
  selectedColumns,
  columnNameToFieldMetadataIdMap,
  allFieldsSelected,
  entityName,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  selectedColumns: string[] | '*';
  columnNameToFieldMetadataIdMap: Record<string, string>;
  entityName: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  allFieldsSelected?: boolean;
}) => {
  const noReadRestrictions =
    isEmpty(restrictedFields) ||
    Object.values(restrictedFields).every((field) => field.canRead !== false);

  if (noReadRestrictions) {
    return;
  }

  if (allFieldsSelected || selectedColumns === '*') {
    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
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
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
