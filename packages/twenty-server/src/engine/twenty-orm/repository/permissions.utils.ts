import { isNonEmptyString } from '@sniptt/guards';
import isEmpty from 'lodash.isempty';
import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

const getTargetEntityAndOperationType = (
  expressionMap: QueryExpressionMap,
):
  | {
      isSubQuery: true;
      mainEntity?: undefined;
      operationType?: undefined;
    }
  | {
      isSubQuery?: undefined;
      mainEntity: string;
      operationType:
        | 'select'
        | 'insert'
        | 'update'
        | 'delete'
        | 'restore'
        | 'soft-delete'
        | 'relation';
    } => {
  const isSubQuery = expressionMap.aliases[0].subQuery;

  if (isSubQuery) {
    return {
      isSubQuery: true, // will bypass permission checks because subQuery permissions will be evaluated when it is executed. This is valid for groupBy with records usecase. If your usecase is different, make sure permission checks are run.
    };
  }

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

type ValidateOperationIsPermittedOrThrowArgs = {
  entityName: string;
  operationType: OperationType;
  objectsPermissions: ObjectsPermissions;
  objectMetadataMaps: ObjectMetadataMaps;
  selectedColumns: string[] | '*';
  allFieldsSelected: boolean;
  updatedColumns: string[];
};

export const validateOperationIsPermittedOrThrow = ({
  entityName,
  operationType,
  objectsPermissions,
  objectMetadataMaps,
  selectedColumns,
  allFieldsSelected,
  updatedColumns,
}: ValidateOperationIsPermittedOrThrowArgs) => {
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

  const columnNameToFieldMetadataIdMap =
    getColumnNameToFieldMetadataIdMap(objectMetadata);

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
      });
      break;
    case 'insert':
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
      });

      if (updatedColumns.length > 0) {
        validateUpdateFieldPermissionOrThrow({
          restrictedFields: permissionsForEntity.restrictedFields,
          updatedColumns,
          columnNameToFieldMetadataIdMap,
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

type ValidateQueryIsPermittedOrThrowArgs = {
  expressionMap: QueryExpressionMap;
  objectsPermissions: ObjectsPermissions;
  objectMetadataMaps: ObjectMetadataMaps;
  shouldBypassPermissionChecks: boolean;
};

export const validateQueryIsPermittedOrThrow = ({
  expressionMap,
  objectsPermissions,
  objectMetadataMaps,
  shouldBypassPermissionChecks,
}: ValidateQueryIsPermittedOrThrowArgs) => {
  if (shouldBypassPermissionChecks) {
    return;
  }

  const { mainEntity, operationType, isSubQuery } =
    getTargetEntityAndOperationType(expressionMap);

  if (isSubQuery) {
    return;
  }

  const allFieldsSelected = expressionMap.selects.some(
    (select) => select.selection === mainEntity,
  );

  let selectedColumns: string[] | '*' = [];
  let updatedColumns: string[] = [];

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

  validateOperationIsPermittedOrThrow({
    entityName: mainEntity,
    operationType: operationType as OperationType,
    objectsPermissions,
    objectMetadataMaps,
    selectedColumns,
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
  restrictedFields: RestrictedFieldsPermissions;
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
  restrictedFields: RestrictedFieldsPermissions;
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
    if (!isDefined(expressionMap.returning)) {
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
