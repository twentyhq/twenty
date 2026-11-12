/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/record-filter/utils/resolve-filter-key-field-metadata.util';
import { assertArrayOperatorValueIsNonEmptyArrayOrThrow } from 'src/engine/record-filter/utils/assert-array-operator-value-is-non-empty-array-or-throw.util';
import { computeWhereConditionParts } from 'src/engine/record-filter/utils/compute-where-condition-parts';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';

const ALWAYS_TRUE_CONDITION = '1=1';

type SqlRenderingContext = {
  workspaceId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  tableAlias: string;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  collectedParameters: ObjectLiteral;
};

export const renderRowLevelPermissionFilterToSql = ({
  recordFilter,
  tableAlias,
  objectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  recordFilter: RecordGqlOperationFilter;
  tableAlias: string;
  objectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): SQLCondition | null => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(flatFieldMetadataMaps, objectMetadata);

  const collectedParameters: ObjectLiteral = {};

  const sql = renderFilterAsConjunction(recordFilter, {
    workspaceId: objectMetadata.workspaceId,
    flatObjectMetadataMaps,
    tableAlias,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
    collectedParameters,
  });

  if (!isNonEmptyString(sql)) {
    return null;
  }

  return { sql, parameters: collectedParameters };
};

const renderFilterAsConjunction = (
  filter: RecordGqlOperationFilter,
  context: SqlRenderingContext,
): string => {
  const sqlConditions = Object.entries(filter)
    .map(([filterKey, filterValue]) =>
      renderFilterEntry(filterKey, filterValue, context),
    )
    .filter(isNonEmptyString);

  return joinSQLConditions(sqlConditions, 'AND');
};

const renderFilterEntry = (
  filterKey: string,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  switch (filterKey) {
    case 'and':
      return renderLogicalGroup(
        filterValue as RecordGqlOperationFilter[] | RecordGqlOperationFilter,
        'AND',
        context,
      );
    case 'or':
      return renderLogicalGroup(
        filterValue as RecordGqlOperationFilter[] | RecordGqlOperationFilter,
        'OR',
        context,
      );
    case 'not': {
      const negatedSQLCondition = renderFilterAsConjunction(
        filterValue as RecordGqlOperationFilter,
        context,
      );

      const sqlConditionToNegate = isNonEmptyString(negatedSQLCondition)
        ? negatedSQLCondition
        : ALWAYS_TRUE_CONDITION;

      return `NOT (${sqlConditionToNegate})`;
    }
    default:
      return renderFieldSQLCondition(filterKey, filterValue, context);
  }
};

const renderLogicalGroup = (
  filters: RecordGqlOperationFilter[] | RecordGqlOperationFilter,
  logicalOperator: 'AND' | 'OR',
  context: SqlRenderingContext,
): string => {
  const filterList = Array.isArray(filters) ? filters : [filters];

  const sqlConditions = filterList.map((filter) => {
    const renderedSQLCondition = renderFilterAsConjunction(filter, context);

    return isNonEmptyString(renderedSQLCondition)
      ? renderedSQLCondition
      : ALWAYS_TRUE_CONDITION;
  });

  if (sqlConditions.length === 0) {
    return ALWAYS_TRUE_CONDITION;
  }

  return `(${sqlConditions.join(` ${logicalOperator} `)})`;
};

const joinSQLConditions = (
  sqlConditions: string[],
  logicalOperator: 'AND' | 'OR',
): string => {
  if (sqlConditions.length === 0) {
    return '';
  }

  if (sqlConditions.length === 1) {
    return sqlConditions[0];
  }

  return `(${sqlConditions.join(` ${logicalOperator} `)})`;
};

const renderRelationSQLCondition = ({
  relationFieldMetadata,
  targetFilter,
  context,
}: {
  relationFieldMetadata: OrmFlatFieldMetadata;
  targetFilter: RecordGqlOperationFilter;
  context: SqlRenderingContext;
}): string => {
  const { workspaceId, tableAlias, flatFieldMetadataMaps } = context;
  const targetFlatObjectMetadata = isDefined(
    relationFieldMetadata.relationTargetObjectMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: context.flatObjectMetadataMaps,
      })
    : undefined;

  if (!isDefined(targetFlatObjectMetadata)) {
    throw new PermissionsException(
      `Cannot render row level permission predicate through relation "${relationFieldMetadata.name}"`,
      PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    );
  }

  const { sourceColumnName, targetColumnName } = findRelationJoinColumnsOrThrow(
    { relationFieldMetadata, flatFieldMetadataMaps },
  );
  const targetTableAlias = `${tableAlias}_${relationFieldMetadata.name}`;
  const targetSQLCondition = renderFilterAsConjunction(targetFilter, {
    ...context,
    tableAlias: targetTableAlias,
    ...buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      targetFlatObjectMetadata,
    ),
  });
  const quotedTargetTableAlias = escapeIdentifier(targetTableAlias);

  return `EXISTS (SELECT 1 FROM ${buildWorkspaceTableExpression({
    workspaceId,
    tableName: computeObjectTargetTable(targetFlatObjectMetadata),
  })} AS ${quotedTargetTableAlias} WHERE ${quotedTargetTableAlias}.${escapeIdentifier(targetColumnName)} = ${escapeIdentifier(tableAlias)}.${escapeIdentifier(sourceColumnName)} AND ${quotedTargetTableAlias}."deletedAt" IS NULL AND (${targetSQLCondition || ALWAYS_TRUE_CONDITION}))`;
};

const renderFieldSQLCondition = (
  fieldNameOrJoinColumnName: string,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  const {
    tableAlias,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  } = context;

  const { fieldMetadata, isReferencedByFieldName } =
    resolveFilterKeyFieldMetadata({
      filterKey: fieldNameOrJoinColumnName,
      fieldIdByName,
      fieldIdByJoinColumnName,
      flatFieldMetadataMaps,
    });

  if (!isDefined(fieldMetadata)) {
    throw new PermissionsException(
      `Cannot render row level permission predicate: field "${fieldNameOrJoinColumnName}" does not exist on object "${tableAlias}"`,
      PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    );
  }

  if (
    isReferencedByFieldName &&
    isMorphOrRelationFlatFieldMetadata(fieldMetadata)
  ) {
    return renderRelationSQLCondition({
      relationFieldMetadata: fieldMetadata,
      targetFilter: filterValue as RecordGqlOperationFilter,
      context,
    });
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return renderCompositeFieldSQLCondition(
      fieldMetadata,
      filterValue,
      context,
    );
  }

  const operatorSQLConditions = Object.entries(
    filterValue as Record<string, unknown>,
  ).map(([operator, operatorValue]) => {
    assertArrayOperatorValueIsNonEmptyArrayOrThrow({
      operator,
      value: operatorValue,
      key: fieldNameOrJoinColumnName,
    });

    const { sql, params } = computeWhereConditionParts({
      operator,
      objectNameSingular: tableAlias,
      key: fieldNameOrJoinColumnName,
      value: operatorValue,
      fieldMetadataType: fieldMetadata.type,
    });

    Object.assign(context.collectedParameters, params);

    return `(${sql})`;
  });

  return joinSQLConditions(operatorSQLConditions, 'AND');
};

const renderCompositeFieldSQLCondition = (
  fieldMetadata: OrmFlatFieldMetadata,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  const compositeType = compositeTypeDefinitions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!isDefined(compositeType)) {
    throw new PermissionsException(
      `Cannot render row level permission predicate: composite type definition not found for type "${fieldMetadata.type}"`,
      PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
    );
  }

  const sqlConditions = Object.entries(
    filterValue as Record<string, Record<string, unknown>>,
  ).flatMap(([subFieldName, subFieldFilter]) => {
    // An absent sub-field filter is no constraint, as for the in-memory matcher
    if (!isDefined(subFieldFilter)) {
      return [];
    }

    const isKnownSubField = compositeType.properties.some(
      (property) => property.name === subFieldName,
    );

    if (!isKnownSubField) {
      throw new PermissionsException(
        `Cannot render row level permission predicate: "${subFieldName}" is not a sub field of composite type "${fieldMetadata.type}"`,
        PermissionsExceptionCode.RLS_PREDICATE_FIELD_NOT_FOUND,
      );
    }

    return Object.entries(subFieldFilter).map(([operator, operatorValue]) => {
      assertArrayOperatorValueIsNonEmptyArrayOrThrow({
        operator,
        value: operatorValue,
        key: subFieldName,
      });

      const { sql, params } = computeWhereConditionParts({
        operator,
        objectNameSingular: context.tableAlias,
        key: `${fieldMetadata.name}${capitalize(subFieldName)}`,
        subFieldKey: subFieldName,
        value: operatorValue,
        fieldMetadataType: fieldMetadata.type,
      });

      Object.assign(context.collectedParameters, params);

      return `(${sql})`;
    });
  });

  return joinSQLConditions(sqlConditions, 'AND');
};
