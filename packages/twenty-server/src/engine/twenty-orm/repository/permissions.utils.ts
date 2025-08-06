import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import {
  ObjectRecordsPermissions,
  RestrictedFields,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

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
  selectedColumns,
  isFieldPermissionsEnabled,
  allFieldsSelected,
  updatedColumns,
}: {
  entityName: string;
  operationType: OperationType;
  objectRecordsPermissions: ObjectRecordsPermissions;
  objectMetadataMaps: ObjectMetadataMaps;
  selectedColumns: string[] | '*';
  isFieldPermissionsEnabled?: boolean;
  allFieldsSelected: boolean;
  updatedColumns: string[];
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

  const columnNameToFieldMetadataIdMap = isFieldPermissionsEnabled
    ? getColumnNameToFieldMetadataIdMap(objectMetadata)
    : {};

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

      if (isFieldPermissionsEnabled) {
        validateReadFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          selectedColumns,
          columnNameToFieldMetadataIdMap,
          allFieldsSelected,
        });
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

      if (isFieldPermissionsEnabled) {
        validateReadFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          selectedColumns,
          columnNameToFieldMetadataIdMap,
        });
      }

      if (isFieldPermissionsEnabled && updatedColumns.length > 0) {
        validateUpdateFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          updatedColumns,
          columnNameToFieldMetadataIdMap,
        });
      }
      break;
    case 'delete':
      if (!permissionsForEntity?.canDestroy) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      if (isFieldPermissionsEnabled) {
        validateReadFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          selectedColumns,
          columnNameToFieldMetadataIdMap,
        });
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

      if (isFieldPermissionsEnabled) {
        validateReadFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          selectedColumns,
          columnNameToFieldMetadataIdMap,
        });
      }
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

export const validateQueryIsPermittedOrThrow = ({
  expressionMap,
  objectRecordsPermissions,
  objectMetadataMaps,
  shouldBypassPermissionChecks,
  isFieldPermissionsEnabled,
}: {
  expressionMap: QueryExpressionMap;
  objectRecordsPermissions: ObjectRecordsPermissions;
  objectMetadataMaps: ObjectMetadataMaps;
  shouldBypassPermissionChecks: boolean;
  isFieldPermissionsEnabled?: boolean;
}) => {
  if (shouldBypassPermissionChecks) {
    return;
  }

  const { mainEntity, operationType } =
    getTargetEntityAndOperationType(expressionMap);

  const allFieldsSelected = expressionMap.selects.some(
    (select) => select.selection === mainEntity,
  );

  let selectedColumns: string[] | '*' = [];
  let updatedColumns: string[] = [];

  if (isFieldPermissionsEnabled) {
    selectedColumns = getSelectedColumnsFromExpressionMap({
      operationType,
      expressionMap,
      allFieldsSelected,
    });

    if (operationType !== 'select') {
      const valuesSet = expressionMap.valuesSet;

      if (Array.isArray(valuesSet)) {
        updatedColumns = valuesSet.reduce((acc, value) => {
          const keys = Object.keys(value);

          keys.forEach((key) => {
            if (!acc.includes(key)) {
              acc.push(key);
            }
          });

          return acc;
        }, []);
      } else {
        updatedColumns = Object.keys(valuesSet ?? {});
      }
    }
  }

  validateOperationIsPermittedOrThrow({
    entityName: mainEntity,
    operationType: operationType as OperationType,
    objectRecordsPermissions,
    objectMetadataMaps,
    selectedColumns,
    isFieldPermissionsEnabled,
    allFieldsSelected,
    updatedColumns,
  });
};

const validateReadFieldPermissionOrThrow = ({
  restrictedFields,
  selectedColumns,
  columnNameToFieldMetadataIdMap,
  allFieldsSelected,
}: {
  restrictedFields: RestrictedFields;
  selectedColumns: string[] | '*';
  columnNameToFieldMetadataIdMap: Record<string, string>;
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
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};

const validateUpdateFieldPermissionOrThrow = ({
  restrictedFields,
  updatedColumns,
  columnNameToFieldMetadataIdMap,
}: {
  restrictedFields: RestrictedFields;
  updatedColumns: string[];
  columnNameToFieldMetadataIdMap: Record<string, string>;
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
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }
};

const getSelectedColumnsFromExpressionMap = ({
  operationType,
  expressionMap,
  allFieldsSelected,
}: {
  operationType: string;
  expressionMap: QueryExpressionMap;
  allFieldsSelected: boolean;
}) => {
  let selectedColumns: string[] | '*' = [];

  if (
    ['update', 'insert', 'delete', 'soft-delete', 'restore'].includes(
      operationType,
    )
  ) {
    if (isEmpty(expressionMap.returning)) {
      throw new InternalServerError(
        'Returning columns are not set for update query',
      );
    }
    selectedColumns =
      expressionMap.returning === '*' ? '*' : [expressionMap.returning].flat();
  } else if (!allFieldsSelected) {
    selectedColumns = getSelectedColumnsFromExpressionMapSelects(
      expressionMap.selects,
    );
  }

  return selectedColumns;
};

const getSelectedColumnsFromExpressionMapSelects = (
  selects: { selection: string }[],
) => {
  return selects
    ?.map((select) => {
      const columnsFromAggregateExpression =
        ProcessAggregateHelper.extractColumnNamesFromAggregateExpression(
          select.selection,
        );

      if (columnsFromAggregateExpression) {
        return columnsFromAggregateExpression;
      }

      const parts = select.selection.split('.');

      return parts[parts.length - 1];
    })
    .flat();
};
