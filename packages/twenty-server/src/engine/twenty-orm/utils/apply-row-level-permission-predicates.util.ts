/* @license Enterprise */

import {
  Brackets,
  NotBrackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { GraphqlQueryFilterFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

type ApplyRowLevelPermissionPredicatesArgs<T extends ObjectLiteral> = {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: AuthContext;
  featureFlagMap: FeatureFlagMap;
};

export const applyRowLevelPermissionPredicates = <T extends ObjectLiteral>({
  queryBuilder,
  objectMetadata,
  internalContext,
  authContext,
  featureFlagMap,
}: ApplyRowLevelPermissionPredicatesArgs<T>): void => {
  if (
    featureFlagMap[
      FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED
    ] !== true
  ) {
    return;
  }

  const roleId = authContext.userWorkspaceId
    ? internalContext.userWorkspaceRoleMap[authContext.userWorkspaceId]
    : undefined;

  const recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      internalContext.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      internalContext.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    objectMetadata,
    roleId,
    authContext,
  });

  if (!recordFilter || Object.keys(recordFilter).length === 0) {
    return;
  }

  applyObjectRecordFilterToQueryBuilder({
    queryBuilder,
    objectNameSingular: objectMetadata.nameSingular,
    recordFilter,
    fieldParser: new GraphqlQueryFilterFieldParser(
      objectMetadata,
      internalContext.flatFieldMetadataMaps,
    ),
  });
};

const applyObjectRecordFilterToQueryBuilder = <T extends ObjectLiteral>({
  queryBuilder,
  objectNameSingular,
  recordFilter,
  fieldParser,
}: {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectNameSingular: string;
  recordFilter: Record<string, unknown>;
  fieldParser: GraphqlQueryFilterFieldParser;
}): void => {
  if (!recordFilter || Object.keys(recordFilter).length === 0) {
    return;
  }

  const whereCondition = new Brackets((qb) => {
    Object.entries(recordFilter).forEach(([key, value], index) => {
      parseKeyFilter({
        queryBuilder: qb,
        objectNameSingular,
        key,
        value,
        isFirst: index === 0,
        fieldParser,
      });
    });
  });

  if (queryBuilder.expressionMap.wheres.length === 0) {
    queryBuilder.where(whereCondition);
  } else {
    queryBuilder.andWhere(whereCondition);
  }
};

const parseKeyFilter = ({
  queryBuilder,
  objectNameSingular,
  key,
  value,
  isFirst,
  fieldParser,
}: {
  queryBuilder: WhereExpressionBuilder;
  objectNameSingular: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  isFirst: boolean;
  fieldParser: GraphqlQueryFilterFieldParser;
}): void => {
  switch (key) {
    case 'and': {
      const andWhereCondition = new Brackets((qb) => {
        value.forEach((filter: Record<string, unknown>, index: number) => {
          const whereCondition = new Brackets((qb2) => {
            Object.entries(filter).forEach(
              ([subFilterKey, subFilterValue], subIndex) => {
                parseKeyFilter({
                  queryBuilder: qb2,
                  objectNameSingular,
                  key: subFilterKey,
                  value: subFilterValue,
                  isFirst: subIndex === 0,
                  fieldParser,
                });
              },
            );
          });

          if (index === 0) {
            qb.where(whereCondition);
          } else {
            qb.andWhere(whereCondition);
          }
        });
      });

      if (isFirst) {
        queryBuilder.where(andWhereCondition);
      } else {
        queryBuilder.andWhere(andWhereCondition);
      }
      break;
    }
    case 'or': {
      const orWhereCondition = new Brackets((qb) => {
        value.forEach((filter: Record<string, unknown>, index: number) => {
          const whereCondition = new Brackets((qb2) => {
            Object.entries(filter).forEach(
              ([subFilterKey, subFilterValue], subIndex) => {
                parseKeyFilter({
                  queryBuilder: qb2,
                  objectNameSingular,
                  key: subFilterKey,
                  value: subFilterValue,
                  isFirst: subIndex === 0,
                  fieldParser,
                });
              },
            );
          });

          if (index === 0) {
            qb.where(whereCondition);
          } else {
            qb.orWhere(whereCondition);
          }
        });
      });

      if (isFirst) {
        queryBuilder.where(orWhereCondition);
      } else {
        queryBuilder.andWhere(orWhereCondition);
      }

      break;
    }
    case 'not': {
      const notWhereCondition = new NotBrackets((qb) => {
        Object.entries(value).forEach(
          ([subFilterKey, subFilterValue], subIndex) => {
            parseKeyFilter({
              queryBuilder: qb,
              objectNameSingular,
              key: subFilterKey,
              value: subFilterValue,
              isFirst: subIndex === 0,
              fieldParser,
            });
          },
        );
      });

      if (isFirst) {
        queryBuilder.where(notWhereCondition);
      } else {
        queryBuilder.andWhere(notWhereCondition);
      }

      break;
    }
    default:
      fieldParser.parse(queryBuilder, objectNameSingular, key, value, isFirst);
      break;
  }
};
