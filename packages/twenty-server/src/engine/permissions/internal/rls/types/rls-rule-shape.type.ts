/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';

import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

export type RlsRuleShape = {
  rowLevelPermissionRule: RlsRule;
  splitPredicate: RowLevelPermissionPredicate | null;
};
