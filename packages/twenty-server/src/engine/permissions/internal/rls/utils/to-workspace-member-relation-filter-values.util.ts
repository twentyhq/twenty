/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const toWorkspaceMemberRelationFilterValues = (
  value: RowLevelPermissionPredicate['workspaceMemberRelationFilterValue'],
): string[] =>
  (Array.isArray(value) ? value : [value])
    .filter(isDefined)
    .map((filterValue) => String(filterValue));
