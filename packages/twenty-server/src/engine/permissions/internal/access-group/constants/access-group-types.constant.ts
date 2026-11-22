/* @license Enterprise */

import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';

export const ACCESS_GROUP_TYPES: readonly AccessGroupType[] = [
  'ALL_RECORDS',
  'RLS_RULE',
  'RLS_MEMBER_VALUE',
  'RLS_LITERAL_VALUE',
];
