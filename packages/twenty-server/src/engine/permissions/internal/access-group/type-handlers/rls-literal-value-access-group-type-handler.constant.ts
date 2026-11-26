/* @license Enterprise */

import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';
import { findAccessGroupColumnOrThrow } from 'src/engine/permissions/internal/access-group/utils/find-access-group-column-or-throw.util';

export const RLS_LITERAL_VALUE_ACCESS_GROUP_TYPE_HANDLER: AccessGroupTypeHandler<'RLS_LITERAL_VALUE'> =
  {
    findSplitValue: ({ value }) => value,
    toRowColumns: ({ value }) => ({ memberFieldValues: null, value }),
    fromRow: ({ compactId, value }) => ({
      type: 'RLS_LITERAL_VALUE',
      value: findAccessGroupColumnOrThrow({ compactId, value }),
    }),
    buildRecordRule: ({ accessGroup, ruleShape }) => ({
      rowLevelPermissionRule: {
        ...ruleShape.rowLevelPermissionRule,
        predicates: ruleShape.rowLevelPermissionRule.predicates.map(
          (predicate) =>
            predicate.id === ruleShape.splitPredicate?.id
              ? { ...predicate, value: [accessGroup.value] }
              : predicate,
        ),
      },
      memberFieldValues: {},
    }),
    buildValueLookupCondition: ({ accessGroupAlias, valueExpressions }) =>
      `${accessGroupAlias}."value" = CAST(${valueExpressions[0]} AS varchar)`,
  };
