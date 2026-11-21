/* @license Enterprise */

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroupSplitValue =
  | { type: 'ALL_RECORDS' }
  | { type: 'RULE' }
  | { type: 'MEMBER_VALUE'; memberFieldValues: RlsMemberFieldValues }
  | { type: 'LITERAL_VALUE'; value: string };
