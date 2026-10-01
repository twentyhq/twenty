import { assertUnreachable } from 'twenty-shared/utils';

import { buildInheritedReadabilityCondition } from 'src/engine/core-modules/record-share/utils/build-inherited-readability-condition.util';
import { buildRecordIdsSharedWithPrincipalsCondition } from 'src/engine/core-modules/record-share/utils/build-record-ids-shared-with-principals-condition.util';
import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { buildRecordShareExceptionCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-exception-condition.util';
import {
  type CompiledRowAccessPolicy,
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessCompilationEnvironment,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/twenty-orm/utils/combine-sql-conditions.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

export const compileRowAccessPolicy = (
  policy: RowAccessPolicy,
  environment: RowAccessCompilationEnvironment,
): CompiledRowAccessPolicy =>
  policy.kind === 'gated'
    ? {
        kind: 'gated',
        condition: compileRowAccessExpression(policy.expression, environment),
      }
    : policy;

export const compileRowAccessExpression = (
  expression: RowAccessExpression,
  environment: RowAccessCompilationEnvironment,
): SqlCondition => {
  switch (expression.kind) {
    case 'and':
      return combineSqlConditions(
        expression.operands.map((operand) =>
          compileRowAccessExpression(operand, environment),
        ),
      );
    case 'or':
      return combineSqlConditions(
        expression.operands.map((operand) =>
          compileRowAccessExpression(operand, environment),
        ),
        'OR',
      );
    case 'roleFilter': {
      const condition = renderRowLevelPermissionFilterToSql({
        recordFilter: expression.recordFilter,
        tableAlias: expression.tableAlias,
        objectMetadata: expression.flatObjectMetadata,
        flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
      });

      // The builder only emits filters that render to a condition
      if (condition === null) {
        throw new Error(
          `Row-level filter of ${expression.flatObjectMetadata.nameSingular} rendered no condition`,
        );
      }

      return condition;
    }
    case 'recordShared':
      return buildRecordShareCondition({
        ...expression,
        recordShareTableExpression: environment.recordShareTableExpression,
      });
    case 'namedGrant':
      return buildRecordIdsSharedWithPrincipalsCondition({
        ...expression,
        recordShareTableExpression: environment.recordShareTableExpression,
      });
    case 'recordNotRestricted':
      return buildRecordShareExceptionCondition({
        ...expression,
        recordShareTableExpression: environment.recordShareTableExpression,
      });
    case 'sharingRule':
      return expression.rule.buildCondition(expression.tableAlias);
    case 'inheritedReadability':
      return buildInheritedReadabilityCondition({
        tableAlias: expression.tableAlias,
        objectMetadataId: expression.objectMetadataId,
        principalIds: expression.principalIds,
        accessLevels: expression.accessLevels,
        isOpenWhenDetached: expression.isOpenWhenDetached,
        recordShareTableExpression: environment.recordShareTableExpression,
        parents: expression.parents.map((parent) =>
          parent.kind === 'column'
            ? {
                kind: 'column',
                joinColumnName: parent.joinColumnName,
                parentTableAlias: parent.parentTableAlias,
                parentTableExpression: environment.resolveTableExpression(
                  parent.parentFlatObjectMetadata.id,
                ),
                policy: compileRowAccessPolicy(parent.policy, environment),
              }
            : {
                kind: 'children',
                childTableAlias: parent.childTableAlias,
                childJoinColumnName: parent.childJoinColumnName,
                childTableExpression: environment.resolveTableExpression(
                  parent.childFlatObjectMetadata.id,
                ),
                policy: compileRowAccessPolicy(parent.policy, environment),
              },
        ),
      });
    default:
      return assertUnreachable(expression);
  }
};
