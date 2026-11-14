/* @license Enterprise */

import { isPlainObject } from 'twenty-shared/utils';

import { type RlsRuleSharedPredicate } from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-shared-predicate.util';

export type SharedPredicateWithValue = Omit<
  RlsRuleSharedPredicate,
  'values'
> & {
  value: string;
};

export const isSharedPredicateWithValue = (
  value: unknown,
): value is SharedPredicateWithValue =>
  isPlainObject(value) && 'fieldMetadataId' in value && 'value' in value;
