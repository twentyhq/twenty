/* @license Enterprise */

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroupSplitValue =
  | { type: 'ALL_RECORDS' }
  | { type: 'RLS_RULE' }
  | { type: 'RLS_MEMBER_VALUE'; memberFieldValues: RlsMemberFieldValues }
  | { type: 'RLS_LITERAL_VALUE'; value: string };
