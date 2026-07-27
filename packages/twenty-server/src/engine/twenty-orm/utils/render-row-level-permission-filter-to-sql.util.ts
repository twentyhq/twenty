/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const ARRAY_OPERATORS = ['in', 'contains', 'notContains'];

// Mirrors how TypeORM renders empty Brackets, so nested empty logical groups
// behave the same on joined relations as on the main alias
const ALWAYS_TRUE_CONDITION = '1=1';

type SqlRenderingContext = {
  tableAlias: string;
  fieldMetadataIdByFieldName: Record<string, string>;
  fieldMetadataIdByJoinColumnName: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  collectedParameters: ObjectLiteral;
};

type RenderedSqlCondition = {
  sql: string;
  parameters: ObjectLiteral;
};

export const renderRowLevelPermissionFilterToSql = ({
  recordFilter,
  tableAlias,
  objectMetadata,
  flatFieldMetadataMaps,
}: {
  recordFilter: RecordGqlOperationFilter;
  tableAlias: string;
  objectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): RenderedSqlCondition | null => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(flatFieldMetadataMaps, objectMetadata);

  const collectedParameters: ObjectLiteral = {};

  const sql = renderFilterAsConjunction(recordFilter, {
    tableAlias,
    fieldMetadataIdByFieldName: fieldIdByName,
    fieldMetadataIdByJoinColumnName: fieldIdByJoinColumnName,
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
  const conditions = Object.entries(filter)
    .map(([filterKey, filterValue]) =>
      renderFilterEntry(filterKey, filterValue, context),
    )
    .filter(isNonEmptyString);

  return joinConditions(conditions, 'AND');
};

const renderFilterEntry = (
  filterKey: string,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  switch (filterKey) {
    case 'and':
      return renderLogicalGroup(
        filterValue as RecordGqlOperationFilter[],
        'AND',
        context,
      );
    case 'or':
      return renderLogicalGroup(
        filterValue as RecordGqlOperationFilter[],
        'OR',
        context,
      );
    case 'not': {
      const negatedCondition = renderFilterAsConjunction(
        filterValue as RecordGqlOperationFilter,
        context,
      );

      const conditionToNegate = isNonEmptyString(negatedCondition)
        ? negatedCondition
        : ALWAYS_TRUE_CONDITION;

      return `NOT (${conditionToNegate})`;
    }
    default:
      return renderFieldCondition(filterKey, filterValue, context);
  }
};

const renderLogicalGroup = (
  filters: RecordGqlOperationFilter[],
  logicalOperator: 'AND' | 'OR',
  context: SqlRenderingContext,
): string => {
  const conditions = filters.map((filter) => {
    const renderedCondition = renderFilterAsConjunction(filter, context);

    return isNonEmptyString(renderedCondition)
      ? renderedCondition
      : ALWAYS_TRUE_CONDITION;
  });

  if (conditions.length === 0) {
    return ALWAYS_TRUE_CONDITION;
  }

  return `(${conditions.join(` ${logicalOperator} `)})`;
};

const joinConditions = (
  conditions: string[],
  logicalOperator: 'AND' | 'OR',
): string => {
  if (conditions.length === 0) {
    return '';
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return `(${conditions.join(` ${logicalOperator} `)})`;
};

const renderFieldCondition = (
  fieldNameOrJoinColumnName: string,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  const {
    tableAlias,
    fieldMetadataIdByFieldName,
    fieldMetadataIdByJoinColumnName,
    flatFieldMetadataMaps,
  } = context;

  const isReferencedByFieldName = isDefined(
    fieldMetadataIdByFieldName[fieldNameOrJoinColumnName],
  );

  const fieldMetadataId =
    fieldMetadataIdByFieldName[fieldNameOrJoinColumnName] ??
    fieldMetadataIdByJoinColumnName[fieldNameOrJoinColumnName];

  const fieldMetadata = isDefined(fieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(fieldMetadata)) {
    throw new Error(
      `Cannot render row level permission predicate: field "${fieldNameOrJoinColumnName}" does not exist on object "${tableAlias}"`,
    );
  }

  if (
    isReferencedByFieldName &&
    isMorphOrRelationFlatFieldMetadata(fieldMetadata)
  ) {
    throw new Error(
      `Cannot render row level permission predicate on relation "${fieldNameOrJoinColumnName}": traversing a relation requires an additional join, which a join condition cannot express`,
    );
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    return renderCompositeFieldCondition(fieldMetadata, filterValue, context);
  }

  const operatorConditions = Object.entries(
    filterValue as Record<string, unknown>,
  ).map(([operator, operatorValue]) => {
    assertArrayOperatorValueIsNonEmptyArray({
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

  return joinConditions(operatorConditions, 'AND');
};

const assertArrayOperatorValueIsNonEmptyArray = ({
  operator,
  value,
  key,
}: {
  operator: string;
  value: unknown;
  key: string;
}): void => {
  if (
    ARRAY_OPERATORS.includes(operator) &&
    (!Array.isArray(value) || value.length === 0)
  ) {
    throw new GraphqlQueryRunnerException(
      `Invalid filter value for field ${key}. Expected non-empty array`,
      GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: msg`Invalid filter value: "${String(value)}"` },
    );
  }
};

const renderCompositeFieldCondition = (
  fieldMetadata: FlatFieldMetadata,
  filterValue: unknown,
  context: SqlRenderingContext,
): string => {
  const compositeType = compositeTypeDefinitions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!isDefined(compositeType)) {
    throw new Error(
      `Cannot render row level permission predicate: composite type definition not found for type "${fieldMetadata.type}"`,
    );
  }

  const conditions = Object.entries(
    filterValue as Record<string, Record<string, unknown>>,
  ).flatMap(([subFieldName, subFieldFilter]) => {
    const isKnownSubField = compositeType.properties.some(
      (property) => property.name === subFieldName,
    );

    if (!isKnownSubField) {
      throw new Error(
        `Cannot render row level permission predicate: "${subFieldName}" is not a sub field of composite type "${fieldMetadata.type}"`,
      );
    }

    return Object.entries(subFieldFilter).map(([operator, operatorValue]) => {
      assertArrayOperatorValueIsNonEmptyArray({
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

  return joinConditions(conditions, 'AND');
};
