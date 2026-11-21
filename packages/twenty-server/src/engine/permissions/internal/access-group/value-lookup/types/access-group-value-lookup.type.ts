/* @license Enterprise */

import { type AccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup-key.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

export type AccessGroupValueLookup = {
  type: 'RLS_MEMBER_VALUE' | 'RLS_LITERAL_VALUE';
  ruleShapeHash: string;
  keys: AccessGroupValueLookupKey[];
  residualRule: RlsRule;
};
