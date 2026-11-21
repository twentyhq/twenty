/* @license Enterprise */

import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group.type';

export const ACCESS_GROUP_TYPES: readonly AccessGroupType[] = [
  'ALL_RECORDS',
  'RULE',
  'MEMBER_VALUE',
  'LITERAL_VALUE',
];
