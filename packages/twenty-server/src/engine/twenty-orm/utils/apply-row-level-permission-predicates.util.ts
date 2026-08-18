/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import { Brackets, type ObjectLiteral } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { GraphqlQueryFilterFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { applyFilterEntriesToWhereExpression } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/apply-filter-entries-to-where-expression.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-record-filter.util';

type ApplyRowLevelPermissionPredicatesArgs<T extends ObjectLiteral> = {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  featureFlagMap: FeatureFlagMap;
};

export const applyRowLevelPermissionPredicates = <T extends ObjectLiteral>({
  queryBuilder,
  objectMetadata,
  internalContext,
  authContext,
  featureFlagMap: _featureFlagMap,
}: ApplyRowLevelPermissionPredicatesArgs<T>): void => {
  const recordFilter = resolveRowLevelPermissionRecordFilter({
    internalContext,
    authContext,
    objectMetadata,
  });

  if (!isDefined(recordFilter)) {
    return;
  }

  const isUpdateOrDeleteQuery =
    queryBuilder.expressionMap.queryType === 'update' ||
    queryBuilder.expressionMap.queryType === 'soft-delete' ||
    queryBuilder.expressionMap.queryType === 'delete';

  applyObjectRecordFilterToQueryBuilder({
    queryBuilder,
    objectNameSingular: objectMetadata.nameSingular,
    recordFilter,
    fieldParser: new GraphqlQueryFilterFieldParser(
      objectMetadata,
      internalContext.flatFieldMetadataMaps,
    ),
    useDirectTableReference: isUpdateOrDeleteQuery,
  });
};

const applyObjectRecordFilterToQueryBuilder = <T extends ObjectLiteral>({
  queryBuilder,
  objectNameSingular,
  recordFilter,
  fieldParser,
  useDirectTableReference = false,
}: {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectNameSingular: string;
  recordFilter: Record<string, unknown>;
  fieldParser: GraphqlQueryFilterFieldParser;
  useDirectTableReference?: boolean;
}): void => {
  // The walker only uses the join surface, so widen back to ObjectLiteral here
  // rather than threading the concrete T through every recursive call.
  const outerQueryBuilderAsObjectLiteral =
    queryBuilder as WorkspaceSelectQueryBuilder<ObjectLiteral>;

  const whereCondition = new Brackets((qb) => {
    applyFilterEntriesToWhereExpression({
      whereExpression: qb,
      outerQueryBuilder: outerQueryBuilderAsObjectLiteral,
      objectNameSingular,
      filter: recordFilter,
      fieldParser,
      useDirectTableReference,
    });
  });

  if (queryBuilder.expressionMap.wheres.length === 0) {
    queryBuilder.where(whereCondition);
  } else {
    queryBuilder.andWhere(whereCondition);
  }
};
