/* @license Enterprise */

import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';

export const RLS_RULE_ACCESS_GROUP_TYPE_HANDLER: AccessGroupTypeHandler<'RLS_RULE'> =
  {
    findSplitValue: () => null,
    toRowColumns: () => ({ memberFieldValues: null, value: null }),
    fromRow: () => ({ type: 'RLS_RULE' }),
    buildRecordRule: ({ ruleShape }) => ({
      rowLevelPermissionRule: ruleShape.rowLevelPermissionRule,
      memberFieldValues: {},
    }),
    buildValueLookupCondition: null,
  };
